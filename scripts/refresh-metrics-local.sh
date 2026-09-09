#!/bin/bash
# Monthly local refresh of publication metrics, run by launchd.
#
# Runs from your Mac (not CI) so Google Scholar answers rather than blocking.
# Commits and pushes only when a figure actually changed.
#
# Install/uninstall:
#   launchctl bootstrap  gui/$(id -u) ~/Library/LaunchAgents/bio.dkundnani.metrics.plist
#   launchctl bootout    gui/$(id -u)/bio.dkundnani.metrics
# Run it right now:
#   launchctl kickstart -k gui/$(id -u)/bio.dkundnani.metrics

set -uo pipefail

REPO="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
GIT=/usr/bin/git
PY=/usr/bin/python3

cd "$REPO" || exit 1
echo "=== $(date '+%Y-%m-%d %H:%M:%S') refreshing metrics in $REPO ==="

# Bring in anything the GitHub Action committed, so the push cannot conflict.
if ! "$GIT" pull --rebase --autostash --quiet; then
  echo "git pull failed; aborting so nothing is left half-done"
  exit 1
fi

"$PY" scripts/update_metrics.py || { echo "update_metrics.py failed"; exit 1; }

if [ -z "$("$GIT" status --porcelain data/metrics.json)" ]; then
  echo "no change; nothing to push"
  exit 0
fi

"$GIT" add data/metrics.json
"$GIT" commit -q -m "Update publication metrics from Google Scholar"
if "$GIT" push --quiet origin master; then
  echo "pushed: $(cat data/metrics.json | tr -d '\n ')"
else
  echo "push failed; commit is local, will go out with your next push"
  exit 1
fi
