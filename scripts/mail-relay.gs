/**
 * Mail relay for the contact and consulting forms on dkundnani.bio.
 *
 * The site is static, so it cannot send mail itself. This runs as a Google
 * Apps Script web app: the form posts here, this sends the message through
 * the Gmail account that owns the script, and the visitor never leaves the
 * page or opens a mail client.
 *
 * Deploying it is documented in README.md under "Contact form".
 *
 * The request arrives as text/plain holding JSON. That is deliberate: it
 * counts as a simple cross-origin request, so the browser skips the preflight
 * OPTIONS call that Apps Script web apps cannot answer.
 *
 * Anything the spam gate rejects is answered with ok so a bot learns nothing
 * about why it failed, and no mail is sent.
 */

var TO               = "deepali.kundnani@gmail.com";
var SUBJECT_FALLBACK = "Message from dkundnani.bio";
var HOURLY_LIMIT     = 30;    // well under the 100/day Gmail quota
var RELAY_SALT       = "dkundnani.bio/relay/1";   // must match js/site.js
var QUARANTINE       = false;  // true delivers suspected spam, subject-tagged

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return reply({ ok: false, error: "Empty request" });
    }

    var data = JSON.parse(e.postData.contents);

    // Honeypot: real people leave this empty.
    if (data._gotcha) return reply({ ok: true });

    // The page stamps each submission. No stamp means no browser ran the form.
    if (!signed(data)) return reply({ ok: true });

    // Captcha, once CAPTCHA_SECRET is set. This answer is visible on purpose:
    // a bot never reaches it, so only a real person can be looking at it.
    if (!captchaOk(data)) {
      return reply({ ok: false, error: "The spam check did not pass. Please try again, or email " + TO + " directly." });
    }

    if (overLimit()) {
      return reply({ ok: false, error: "Too many messages in the last hour. Please email " + TO + " directly." });
    }

    // Newsletter sign-ups share the gate above, then leave here. subscribe() and
    // newsletterLink() live in github.com/DKundnani/biomedi-ai-watch/apps_script/newsletter.gs.
    if (data._action === "subscribe") {
      if (typeof subscribe !== "function") return reply({ ok: false, error: "Sign-ups are not open yet." });
      return reply(subscribe(data));
    }

    // The page sends _fields already labelled the way the visitor saw them.
    // Fall back to the raw field names if an older page posts here.
    var lines = [];
    if (data._fields && data._fields.length) {
      data._fields.forEach(function (f) {
        lines.push(String(f.label) + ": " + String(f.value));
      });
    } else {
      Object.keys(data).forEach(function (key) {
        if (key.charAt(0) === "_") return;            // _subject, _gotcha, _page
        var value = String(data[key] == null ? "" : data[key]).trim();
        if (value) lines.push(key + ": " + value);
      });
    }
    if (!lines.length) return reply({ ok: false, error: "Nothing was filled in" });

    var junk = spamScore(data) >= 2;
    if (junk && !QUARANTINE) return reply({ ok: true });

    lines.push("", "---", "Sent from " + String(data._page || "dkundnani.bio"));

    var options = { name: "dkundnani.bio" };
    var from = String(data.email || "").trim();
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(from)) options.replyTo = from;   // reply goes to them

    MailApp.sendEmail(
      TO,
      (junk ? "[spam?] " : "") +
        String(data._subject || SUBJECT_FALLBACK).substring(0, 160),
      lines.join("\n"),
      options
    );
    return reply({ ok: true });

  } catch (err) {
    return reply({ ok: false, error: "Could not send: " + err });
  }
}

/* Visiting the URL in a browser confirms the deployment is live. Newsletter
   confirm and unsubscribe links also land here (see the note in doPost). */
function doGet(e) {
  if (e && e.parameter && e.parameter.action) {
    if (typeof newsletterLink !== "function") return reply({ ok: false, error: "Newsletter is not set up yet" });
    return newsletterLink(e.parameter);
  }
  return reply({ ok: true, service: "dkundnani.bio mail relay" });
}

/* ------------------------------------------------------------- spam gate */

/* Ask the captcha provider whether the visitor's token is good. Returns true
   when no secret is stored, so the forms keep working until one is: set
   CAPTCHA_SECRET, and optionally CAPTCHA_PROVIDER, under
   Project Settings -> Script properties. The provider is read from the
   properties rather than from the request, so a bot cannot pick its own. */
function captchaOk(data) {
  var props  = PropertiesService.getScriptProperties();
  var secret = String(props.getProperty("CAPTCHA_SECRET") || "").trim();
  if (!secret) return true;

  var token = String(data._captcha || "").trim();
  if (!token) return false;

  var provider = String(props.getProperty("CAPTCHA_PROVIDER") || "turnstile").trim();
  var url = provider === "recaptcha"
    ? "https://www.google.com/recaptcha/api/siteverify"
    : "https://challenges.cloudflare.com/turnstile/v0/siteverify";

  try {
    var res = UrlFetchApp.fetch(url, {
      method: "post",
      payload: { secret: secret, response: token },
      muteHttpExceptions: true
    });
    return JSON.parse(res.getContentText()).success === true;
  } catch (err) {
    return false;        // cannot verify, so do not deliver
  }
}

/* Recompute the page's fingerprint over the values that arrived. A stamp that
   does not match means the payload was rewritten or replayed; a stamp older
   than a day and a half means it was captured and kept. */
function signed(data) {
  var nonce = String(data._nonce || "");
  var check = String(data._check || "");
  if (!nonce || !check) return false;

  var sent = parseInt(nonce, 36);
  if (!sent || Math.abs(Date.now() - sent) > 36 * 3600 * 1000) return false;

  var basis = (data._fields || []).map(function (f) { return String(f.value); }).join("\u0001");
  return fingerprint(RELAY_SALT + "|" + nonce + "|" + basis) === check;
}

function fingerprint(text) {
  var h = 2166136261;                                  // FNV-1a, 32 bit
  for (var i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24);
    h >>>= 0;
  }
  return h.toString(36);
}

/* Two points is enough to reject. One signal on its own never is, so a real
   message cannot be lost to a single unlucky word. */
function spamScore(data) {
  var name    = String(data.name || "").trim();
  var message = String(data.message || data.brief || "").trim();
  var email   = String(data.email || "").trim();
  var local   = email.split("@")[0] || "";
  var score   = 0;

  if (looksRandom(name))    score += 2;
  if (looksRandom(message)) score += 2;
  if (message.length >= 15 && !/\s/.test(message))        score += 1;
  if ((local.match(/\./g) || []).length >= 4)             score += 1;
  if (/https?:\/\//i.test(message) && message.length < 120) score += 1;
  if (name && !/\s/.test(name) && message.length < 25)    score += 1;

  return score;
}

/* Keyboard-mash words: letters flipping case over and over, or a long run
   with no vowel at all. Ordinary names and sentences do neither. */
function looksRandom(text) {
  var words = String(text).split(/[^A-Za-z]+/);
  for (var i = 0; i < words.length; i++) {
    var w = words[i];
    if (w.length < 8) continue;
    if (!/[aeiouAEIOU]/.test(w) && w.length >= 12) return true;

    var flips = 0;
    for (var j = 1; j < w.length; j++) {
      var up   = w.charAt(j) === w.charAt(j).toUpperCase();
      var prev = w.charAt(j - 1) === w.charAt(j - 1).toUpperCase();
      if (up !== prev) flips++;
    }
    if (flips >= 4) return true;
  }
  return false;
}

/* Crude hourly cap so a bot cannot burn the daily Gmail quota. */
function overLimit() {
  var cache = CacheService.getScriptCache();
  var count = Number(cache.get("sent") || 0);
  if (count >= HOURLY_LIMIT) return true;
  cache.put("sent", String(count + 1), 3600);
  return false;
}

function reply(object) {
  return ContentService
    .createTextOutput(JSON.stringify(object))
    .setMimeType(ContentService.MimeType.JSON);
}
