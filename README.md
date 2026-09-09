# dkundnani.bio

Personal website of **Deepali L. Kundnani** — computational biologist.
Live at <https://dkundnani.bio> (GitHub Pages, served from `master`).

## Structure

```
index.html            Home: hero, about, highlights, awards, journey,
                      publications, featured projects, blog teaser, skills, contact
portfolio.html        Project showcase — carousel + full write-ups
blog.html             Blog index
blog/*.html           Individual posts
css/style.css         All styling (design tokens at the top, light + dark themes)
js/site.js            Nav, scroll-spy, counters, reveals, filters, carousel, lightbox
images/               Original full-resolution figures
images/web/           Web-optimised versions actually used by the pages
pdf/, ppt/            CV, publication list, posters, slide decks
```

Pages are standalone HTML — no build step, no framework, no CDN dependencies
beyond the Inter webfont. Edit a file, commit, and GitHub Pages publishes it.

## Common edits

**Change the colours** — every colour is a custom property at the top of
`css/style.css`, in `:root` (light) and `html[data-theme="dark"]` (dark).

**Add a publication** — copy an `<article class="pub">` block in `index.html`.
The `data-tags` attribute drives the filter buttons; use existing tags
(`firstauthor`, `epigenetics`, `cancer`, `software`) or add a new filter button
with a matching `data-filter`.

**Add a project** — add a slide to the `.carousel__track`, a matching
`.carousel__dot` and `.carousel__thumb`, and an `<article class="entry">` in the
detail section of `portfolio.html`. Update the `x / N` count in `.carousel__count`.

**Add a blog post** — copy any file in `blog/`, then add a card to the grid in
`blog.html` and to the Blog section of `index.html`. Remove the `post--draft`
class and the draft callout once the post is final.

**Add an image** — put the original in `images/`, then generate a web version so
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
- `_layouts/`, `_includes/`, `previous_config.yml`, `previousindex.md`,
  `portfolio.md`, and `sample_page.md` are leftovers from the original Jekyll
  template and are no longer used by any page.
