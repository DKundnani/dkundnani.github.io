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
 */

var TO               = "dkundnani@salud.unm.edu";
var SUBJECT_FALLBACK = "Message from dkundnani.bio";
var HOURLY_LIMIT     = 30;   // well under the 100/day Gmail quota

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return reply({ ok: false, error: "Empty request" });
    }

    var data = JSON.parse(e.postData.contents);

    // Honeypot: real people leave this empty. Answer ok so bots learn nothing.
    if (data._gotcha) return reply({ ok: true });

    if (overLimit()) {
      return reply({ ok: false, error: "Too many messages in the last hour. Please email " + TO + " directly." });
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

    lines.push("", "---", "Sent from " + String(data._page || "dkundnani.bio"));

    var options = { name: "dkundnani.bio" };
    var from = String(data.email || "").trim();
    if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(from)) options.replyTo = from;   // reply goes to them

    MailApp.sendEmail(
      TO,
      String(data._subject || SUBJECT_FALLBACK).substring(0, 160),
      lines.join("\n"),
      options
    );
    return reply({ ok: true });

  } catch (err) {
    return reply({ ok: false, error: "Could not send: " + err });
  }
}

/* Visiting the URL in a browser confirms the deployment is live. */
function doGet() {
  return reply({ ok: true, service: "dkundnani.bio mail relay" });
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
