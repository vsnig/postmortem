#!/usr/bin/env bash
# Build the Chrome Web Store zip: dist/postmortem-<version>.zip (only the files the extension needs).
set -euo pipefail
cd "$(dirname "$0")/.."
v=$(node -p "require('./manifest.json').version")
mkdir -p dist
out="dist/postmortem-$v.zip"
rm -f "$out"
zip -q -r "$out" manifest.json background.js blocker.js settings.js options.html options.js sites icons
echo "$out"; unzip -l "$out" | tail -1
