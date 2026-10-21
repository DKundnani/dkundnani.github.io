# dkundnani.bio

Personal website of **Deepali L. Kundnani** , computational biologist.
Live at <https://dkundnani.bio> (GitHub Pages, served from `master`).

## Structure

```
index.html            Home: hero, about, highlights, awards, journey,
                      publications, featured projects, blog teaser, skills, contact
cv.html               Printable CV, generated from the same data as index.html
portfolio.html        Project showcase , carousel + full write-ups
blog.html             Blog index
blog/*.html           Individual posts
css/style.css         All styling (design tokens at the top, light + dark themes)
js/site.js            Nav, scroll-spy, counters, reveals, filters, carousel, lightbox
images/web/           Web-optimised figures used by the pages
_originals/images/    Full-resolution masters. The leading underscore keeps
                      Jekyll from publishing them, so they stay in the repo
                      without being downloadable from the site.
pdf/, ppt/            CV, publication list, posters, slide decks
```

Pages are standalone HTML , no build step, no framework, no CDN dependencies
beyond the Inter webfont. Edit a file, commit, and GitHub Pages publishes it.

## Common edits

**Change the colours** , every colour is a custom property at the top of
`css/style.css`, in `:root` (light) and `html[data-theme="dark"]` (dark).

**Add a publication** , copy an `<article class="pub">` block in `index.html`.
The `data-tags` attribute drives the filter buttons; use existing tags
(`firstauthor`, `epigenetics`, `cancer`, `software`) or add a new filter button
with a matching `data-filter`.

**Add a project** , add a slide to the `.carousel__track`, a matching
`.carousel__dot` and `.carousel__thumb`, and an `<article class="entry">` in the
detail section of `portfolio.html`. Update the `x / N` count in `.carousel__count`.

**Add a blog post** , copy any file in `blog/`, then add a card to the grid in
`blog.html` and to the Blog section of `index.html`. Remove the `post--draft`
class and the draft callout once the post is final.

**Update publication metrics** , run `python3 scripts/update_metrics.py`.
It prefers Google Scholar (higher counts, but blocks datacenter IPs) and falls
back to OpenAlex, writing `data/metrics.json` (totals) and `data/citations.json`
(per paper). A launchd agent runs it monthly; `.github/workflows/update-metrics.yml`
is the CI backstop. The CV page and the site both rebuild from the generator, so
nothing needs editing twice.

**Add an image** , put the original in `images/`, then generate a web version so
the page stays fast:

```sh
sips -Z 1800 --setProperty format jpeg --setProperty formatOptions 78 \
     images/YOUR_FIGURE.png --out images/web/your-figure.jpg
sips -Z 900  --setProperty format jpeg --setProperty formatOptions 72 \
     images/YOUR_FIGURE.png --out images/web/your-figure-thumb.jpg
```

## Contact form

The site is static, so it cannot send mail on its own. `scripts/mail-relay.gs`
is a Google Apps Script web app that does it: the form posts there, the script
sends the message through the Gmail account that owns it, and the visitor stays
on the page.

Until a relay URL is configured the forms fall back to composing a `mailto:`
draft, so they always do something useful.

To deploy or redeploy the relay:

1. Go to <https://script.google.com>, **New project**, and paste in
   `scripts/mail-relay.gs`. Name it something like `dkundnani.bio mail relay`.
2. **Deploy -> New deployment -> Web app**.
   Set *Execute as* to **Me** and *Who has access* to **Anyone**.
   "Anyone" means anyone may POST to it; it does not expose the Gmail account.
3. Approve the permission prompt. Google calls the script unverified because it
   is unpublished; **Advanced -> Go to (project name)** gets past it.
4. Copy the web app URL. It ends in `/exec`.
5. Put that URL in `data-endpoint` on both forms, in `index.html` and
   `consulting.html`. The handler switches from `mailto:` to a background POST
   automatically.

Changing the script afterwards needs **Deploy -> Manage deployments -> edit ->
Version: New version**, otherwise the old code stays live on the same URL.

Notes on how it is wired:

- The payload goes as JSON inside `text/plain`. That keeps it a simple
  cross-origin request, so the browser skips the preflight `OPTIONS` call that
  Apps Script web apps cannot answer.
- `_fields` carries each answer already labelled the way the visitor saw it, so
  the mail reads `Work email:` rather than `email:`.
- The submitter's address becomes `Reply-To`, so replying from the inbox works.
- `_gotcha` is a honeypot. A filled one is dropped silently.
- Spam gate, in two layers. `js/site.js` stamps every submission with
  `_check`, a fingerprint of the values being sent, salted with `RELAY_SALT`;
  the relay recomputes it and drops anything that does not match. A bot
  posting straight at `/exec` has not run the page's JavaScript, so it has no
  stamp, and a captured request cannot be replayed with new wording because
  the stamp is bound to the wording. Stamps over 36 hours old are refused too.
  `RELAY_SALT` must be the same string in both files, so change it in both.
  Anything the gate rejects is answered `ok`, so a bot learns nothing.
- Captcha, off until configured. Both forms carry
  `data-captcha="turnstile"` and an empty `data-sitekey`. While the key is
  empty no widget renders, no provider script is fetched and nothing changes.
  To turn it on:

  1. Get a free key pair. Turnstile: <https://dash.cloudflare.com> ->
     **Turnstile** -> **Add widget**, hostname `dkundnani.bio`. For reCAPTCHA
     v2 ("I'm not a robot") use <https://www.google.com/recaptcha/admin>
     instead and set `data-captcha="recaptcha"` on both forms.
  2. Put the **site** key in `data-sitekey` on both forms. It is public, so it
     belongs in the HTML.
  3. Put the **secret** key in the script, not the repo: Apps Script ->
     **Project Settings** -> **Script properties** -> `CAPTCHA_SECRET`. Add
     `CAPTCHA_PROVIDER` as `recaptcha` if not using Turnstile. The provider is
     read from the properties, never from the request, so a bot cannot choose
     a verifier it controls.
  4. Redeploy with **New version**.

  Until `CAPTCHA_SECRET` exists the relay skips the check, so the two halves
  can be set up in either order without the forms breaking. If the provider
  script is blocked in a visitor's browser the widget hides itself and the
  message still sends, falling back to the stamp gate rather than trapping a
  real person.
- Behind that, `spamScore()` marks keyboard-mash names and messages, Gmail
  dot-trick addresses and link-only notes. Two points rejects; one never does,
  so a real message cannot be lost to a single unlucky word. Set
  `QUARANTINE = true` to have suspected spam delivered with a `[spam?]`
  subject tag instead of dropped, which is the way to audit the gate.
- `HOURLY_LIMIT` in the script caps sends per hour, well under Gmail's 100/day.
- `data-format` on the form forces `json` or `form` encoding; without it the
  format is chosen from the endpoint hostname. A Formspree-shaped service needs
  `form`.

## Notes

- Search for `TODO` in `index.html` for the details that still need your input.
- Analytics: Google Analytics `G-ZKYQ2F24J1`, inlined in each page's `<head>`.
- Contact forms post to the Apps Script relay above. Formspree is gone: the
  endpoint in the original template belonged to its author, not to this site.
- `sitemap.xml` and `robots.txt` are checked in; update the sitemap when a
  page is added or removed.
- `_og-card.html` is the source for the link-preview image. To regenerate it:

  ```sh
  python3 -m http.server 8799 &
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    --headless=new --virtual-time-budget=8000 --window-size=1200,630 \
    --screenshot=/tmp/og.png http://127.0.0.1:8799/_og-card.html
  sips -s format jpeg --setProperty formatOptions 86 /tmp/og.png \
    --out images/web/og-card.jpg
  ```

- `pdf/Deepali_Kundnani_CV.pdf` is rendered from `cv.html`, so regenerate it
  whenever the CV changes rather than editing it by hand:

  ```sh
  python3 -m http.server 8799 &
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" \
    --headless=new --virtual-time-budget=8000 --no-pdf-header-footer \
    --print-to-pdf=pdf/Deepali_Kundnani_CV.pdf http://127.0.0.1:8799/cv.html
  ```

- The pages are hand-maintained HTML. Earlier they were produced by a
  generator that lived outside the repository and has since been lost, so
  `index.html` and `cv.html` now need matching edits when shared facts change
  (role, affiliation, publications, awards).
