#!/usr/bin/env bash
# Build the installable .xpi from the extension files.
set -euo pipefail
cd "$(dirname "$0")"
version=$(python3 -c "import json; print(json.load(open('manifest.json'))['version'])")
out="mail-ai-assistant-$version.xpi"
rm -f "$out"
zip -q "$out" manifest.json ./*.html ./*.js ./*.css LICENSE
echo "$out"
