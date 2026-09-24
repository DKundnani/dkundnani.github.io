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

## Notes

- Search for `TODO` in `index.html` for the details that still need your input.
- Analytics: Google Analytics `G-ZKYQ2F24J1`, inlined in each page's `<head>`.
- Contact form posts to Formspree (`xjvdwbqk`).
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
