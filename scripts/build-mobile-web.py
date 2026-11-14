#!/usr/bin/env python3
"""Prepare offline-ready static assets for Capacitor without changing web production."""
from pathlib import Path
import shutil
root = Path(__file__).resolve().parents[1]
target = root / "mobile-www"
if target.exists():
    shutil.rmtree(target)
target.mkdir()
for name in ("index.html", "app.js", "plancha.js"):
    shutil.copy2(root / name, target / name)
for folder in ("src", "vendor"):
    shutil.copytree(root / folder, target / folder)
# Native Android embeds assets and uses its WebView. Do not install the browser SW.
index = target / "index.html"
text = index.read_text(encoding="utf-8")
needle = '<script type="module" src="./src/offline.js?v=fep-6a4c2734f7b31778"></script>'
if text.count(needle) != 1:
    raise SystemExit("Unexpected index.html; native SW suppression must be reviewed")
index.write_text(text.replace(needle, ""), encoding="utf-8")
assert (target / "src/bootstrap.js").is_file()
assert (target / "vendor/three.module.js").is_file()
print("Capacitor web assets copied:", len(list(target.rglob("*"))), "entries")
