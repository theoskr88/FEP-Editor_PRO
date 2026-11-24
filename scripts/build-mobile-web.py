#!/usr/bin/env python3
"""Prepare offline-ready static assets for Capacitor without changing web production."""
from pathlib import Path
import re
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

# Native Android bundles local assets and must NOT register the browser service worker.
index = target / "index.html"
html = index.read_text(encoding="utf-8")
html, sw_count = re.subn(
    r'<script type="module" src="\./src/offline\.js\?v=fep-[a-f0-9]{16}"></script>',
    "",
    html,
)
if sw_count != 1:
    raise SystemExit("Unexpected index.html; native SW suppression must be reviewed")

bootstrap = r'(<script defer src="\./src/bootstrap\.js\?v=fep-[a-f0-9]{16}"></script>)'
html, boot_count = re.subn(bootstrap, r'<script src="./fep-native.js"></script>\1', html)
if boot_count != 1:
    raise SystemExit("Missing bootstrap insertion point")
index.write_text(html, encoding="utf-8")
assert (target / "src/bootstrap.js").is_file()
assert (target / "vendor/three.module.js").is_file()
print("Capacitor web assets copied:", len(list(target.rglob("*"))), "entries")
