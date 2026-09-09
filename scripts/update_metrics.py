#!/usr/bin/env python3
"""Refresh data/metrics.json.

Google Scholar has the highest (and most quoted) citation counts, but it has no
API and blocks datacenter traffic, so it only works from a personal machine.
OpenAlex is always reachable but counts fewer citations.

Strategy: try Scholar first, fall back to OpenAlex — and never overwrite a
Scholar-sourced file with lower OpenAlex numbers, so the figures cannot silently
regress when this runs from CI.

Usage:
    python3 scripts/update_metrics.py          # refresh
    python3 scripts/update_metrics.py --print  # show what each source reports
"""

import datetime
import json
import os
import re
import sys
import urllib.request

SCHOLAR_ID = "RdAQkxwAAAAJ"
OPENALEX_ID = "A5013149326"
CONTACT = "dkundnani@salud.unm.edu"
OUT = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
                   "data", "metrics.json")

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


def from_openalex():
    base = "https://api.openalex.org"
    hdr = {"User-Agent": "dkundnani.bio (%s)" % CONTACT}
    a = json.loads(_get("%s/authors/%s?mailto=%s" % (base, OPENALEX_ID, CONTACT), hdr))
    return {"citations": a["cited_by_count"],
            "hIndex": a["summary_stats"]["h_index"],
            "source": "OpenAlex"}


def article_count():
    """Peer-reviewed articles only — matches the list rendered on the page."""
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

    # Never downgrade Scholar citation figures to a lesser source — but do let
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
            print("Scholar unreachable and stored data is from Scholar — keeping it.")
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
