#!/usr/bin/env python3
"""Refresh data/metrics.json.

Google Scholar has the highest (and most quoted) citation counts, but it has no
API and blocks datacenter traffic, so it only works from a personal machine.
OpenAlex is always reachable but counts fewer citations.

Strategy: try Scholar first, fall back to OpenAlex, and never overwrite a
Scholar-sourced file with lower OpenAlex numbers, so the figures cannot silently
regress when this runs from CI.

Usage:
    python3 scripts/update_metrics.py          # refresh
    python3 scripts/update_metrics.py --print  # show what each source reports
"""

import datetime
import difflib
import json
import os
import re
import sys
import unicodedata
import urllib.request

SCHOLAR_ID = "RdAQkxwAAAAJ"
OPENALEX_ID = "A5013149326"
CONTACT = "dkundnani@salud.unm.edu"
ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
OUT = os.path.join(ROOT, "data", "metrics.json")
PUBS_IN = os.path.join(ROOT, "data", "publications.json")
CITES_OUT = os.path.join(ROOT, "data", "citations.json")

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
      "(KHTML, like Gecko) Chrome/125.0 Safari/537.36")


def _get(url, headers=None, timeout=45):
    req = urllib.request.Request(url, headers=headers or {"User-Agent": UA})
    with urllib.request.urlopen(req, timeout=timeout) as r:
        return r.read().decode("utf-8", "replace")


def from_scholar():
    """Scrape the public profile. Returns None if Scholar blocks the request."""
    html = _get("https://scholar.google.com/citations?user=%s&hl=en" % SCHOLAR_ID)
    low = html.lower()
    if any(f in low for f in ("captcha", "unusual traffic", "not a robot")):
        return None
    cells = re.findall(r'gsc_rsb_std">(\d+)</td>', html)
    if len(cells) < 4:
        return None
    # Order: citations (all, since), h-index (all, since), i10 (all, since)
    return {"citations": int(cells[0]), "hIndex": int(cells[2]),
            "source": "Google Scholar"}


def _norm(t):
    """Lowercase, strip accents and punctuation, for title matching."""
    t = unicodedata.normalize("NFKD", t)
    t = "".join(c for c in t if not unicodedata.combining(c))
    return re.sub(r"[^a-z0-9]+", "", t.lower())


def scholar_papers():
    """Per-paper citation counts from the public profile listing."""
    html = _get("https://scholar.google.com/citations?user=%s&hl=en"
                "&cstart=0&pagesize=100&sortby=pubdate" % SCHOLAR_ID)
    low = html.lower()
    if any(f in low for f in ("captcha", "unusual traffic", "not a robot")):
        return None
    out = []
    for row in re.findall(r'<tr class="gsc_a_tr">(.*?)</tr>', html, re.S):
        t = re.search(r'class="gsc_a_at"[^>]*>(.*?)</a>', row, re.S)
        c = re.search(r'class="gsc_a_ac[^"]*"[^>]*>(\d*)</a>', row, re.S)
        if not t:
            continue
        title = re.sub(r"<[^>]+>", "", t.group(1)).strip()
        out.append((title, int(c.group(1)) if c and c.group(1) else 0))
    return out or None


def match_citations(papers):
    """Map Scholar rows onto the publications rendered on the page."""
    try:
        manifest = json.load(open(PUBS_IN))
    except Exception as e:
        print("no publications manifest (%s); skipping per-paper counts" % e)
        return None

    rows = [(_norm(t), t, n) for t, n in papers]
    counts, missed = {}, []
    for entry in manifest:
        want = _norm(entry["title"])
        hit = None
        for norm, title, n in rows:                       # exact, then prefix
            if norm == want:
                hit = (title, n); break
        if not hit:
            for norm, title, n in rows:
                if len(want) >= 40 and (norm.startswith(want[:40]) or want.startswith(norm[:40])):
                    hit = (title, n); break
        if not hit:                                       # last resort: closest
            best, score = None, 0.0
            for norm, title, n in rows:
                r = difflib.SequenceMatcher(None, want, norm).ratio()
                if r > score:
                    best, score = (title, n), r
            if score >= 0.80:
                hit = best
        if hit:
            counts[entry["key"]] = hit[1]
        else:
            missed.append(entry["title"][:60])

    if missed:
        print("unmatched on Scholar: %s" % "; ".join(missed))
    return counts


def from_openalex():
    base = "https://api.openalex.org"
    hdr = {"User-Agent": "dkundnani.bio (%s)" % CONTACT}
    a = json.loads(_get("%s/authors/%s?mailto=%s" % (base, OPENALEX_ID, CONTACT), hdr))
    return {"citations": a["cited_by_count"],
            "hIndex": a["summary_stats"]["h_index"],
            "source": "OpenAlex"}


def article_count():
    """Peer-reviewed articles only, matching the list rendered on the page."""
    url = ("https://api.openalex.org/works?filter=author.id:%s,type:article"
           "&per-page=1&mailto=%s" % (OPENALEX_ID, CONTACT))
    d = json.loads(_get(url, {"User-Agent": "dkundnani.bio (%s)" % CONTACT}))
    return d["meta"]["count"]


def main():
    show_only = "--print" in sys.argv

    results = {}
    for name, fn in (("scholar", from_scholar), ("openalex", from_openalex)):
        try:
            results[name] = fn()
        except Exception as e:                      # network, block, layout change
            print("%s unavailable: %s" % (name, e))
            results[name] = None

    if show_only:
        for k, v in results.items():
            print("%-9s %s" % (k, v))
        return 0

    # Per-paper counts: Scholar only; left untouched if Scholar is blocked.
    if results.get("scholar") is not None:
        papers = None
        try:
            papers = scholar_papers()
        except Exception as e:
            print("per-paper scrape failed: %s" % e)
        if papers:
            counts = match_citations(papers)
            if counts:
                try:
                    old_counts = json.load(open(CITES_OUT))
                except Exception:
                    old_counts = None
                if old_counts != counts:
                    with open(CITES_OUT, "w") as f:
                        json.dump(counts, f, indent=2, sort_keys=True)
                        f.write("\n")
                    print("per-paper citations written: %d papers" % len(counts))
                else:
                    print("per-paper citations unchanged")

    best = results.get("scholar") or results.get("openalex")
    if not best:
        print("no source reachable; leaving metrics.json untouched")
        return 0

    try:
        pubs = article_count()
    except Exception:
        pubs = None

    try:
        old = json.load(open(OUT))
    except Exception:
        old = {}

    # Never downgrade Scholar citation figures to a lesser source, but do let
    # the publication count refresh, since OpenAlex is authoritative for that.
    if old.get("source") == "Google Scholar" and best["source"] != "Google Scholar":
        if pubs and pubs != old.get("publications"):
            old["publications"] = pubs
            old["updated"] = datetime.date.today().isoformat()
            with open(OUT, "w") as f:
                json.dump(old, f, indent=2)
                f.write("\n")
            print("Scholar unreachable; refreshed publication count only ->", pubs)
        else:
            print("Scholar unreachable and stored data is from Scholar; keeping it.")
        return 0

    if best["citations"] < 1 or best["hIndex"] < 1:
        print("implausible values, refusing to write: %r" % best)
        return 1

    new = {
        "publications": pubs or old.get("publications") or 0,
        "citations": best["citations"],
        "hIndex": best["hIndex"],
        "updated": datetime.date.today().isoformat(),
        "source": best["source"],
    }

    if all(old.get(k) == new[k] for k in ("publications", "citations", "hIndex")):
        print("no change:", new)
        return 0

    with open(OUT, "w") as f:
        json.dump(new, f, indent=2)
        f.write("\n")
    print("updated:", old, "->", new)
    return 0


if __name__ == "__main__":
    sys.exit(main())
