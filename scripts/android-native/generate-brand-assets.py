#!/usr/bin/env python3
"""FEP Editor PRO official-only Android launcher and native splash resources.

Run after 'npx cap add android' with Pillow available. Fail closed when the
approved logo is missing; never silently ship the obsolete geometric artwork.
"""
from pathlib import Path
from PIL import Image

root = Path("android/app/src/main/res")
official = Path("src/brand/Logotipo FEP Editor Pro con Cubo Dorado.png")
if not official.is_file():
    raise SystemExit("Falta el logotipo oficial FEP Editor PRO; no se genera una APK con imagen provisional")

original = Image.open(official).convert("RGBA")
if original.width < 500 or original.height < 300:
    raise SystemExit("Resolución insuficiente del logotipo oficial")

symbol = original.crop((
    round(original.width * 930 / 1448),
    round(original.height * 250 / 1086),
    round(original.width * 1380 / 1448),
    round(original.height * 715 / 1086),
))

def icon_image(size):
    base = Image.new("RGBA", (size, size), (12, 32, 62, 255))
    art = symbol.copy()
    art.thumbnail((round(size * .84), round(size * .84)), Image.Resampling.LANCZOS)
    base.alpha_composite(art, ((size - art.width) // 2, (size - art.height) // 2))
    return base

for density, size in (("mdpi",48),("hdpi",72),("xhdpi",96),("xxhdpi",144),("xxxhdpi",192)):
    folder = root / ("mipmap-" + density)
    folder.mkdir(parents=True, exist_ok=True)
    for name in ("ic_launcher.png", "ic_launcher_round.png"):
        icon_image(size).save(folder/name, optimize=True)

drawable = root / "drawable"
drawable.mkdir(parents=True, exist_ok=True)
(drawable / "fep_launcher_background.xml").write_text('''<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
  <solid android:color="#0C203E"/>
</shape>
''')

adaptive = root / "mipmap-anydpi-v26"
adaptive.mkdir(parents=True, exist_ok=True)
foreground = Image.new("RGBA", (432,432), (0,0,0,0))
art = symbol.copy()
art.thumbnail((265,265), Image.Resampling.LANCZOS)
foreground.alpha_composite(art, ((432-art.width)//2,(432-art.height)//2))
target = root / "drawable-nodpi" / "fep_official_foreground.png"
target.parent.mkdir(parents=True,exist_ok=True)
foreground.save(target,optimize=True)
for name in ("ic_launcher.xml", "ic_launcher_round.xml"):
    (adaptive/name).write_text('''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
 <background android:drawable="@drawable/fep_launcher_background"/>
 <foreground android:drawable="@drawable/fep_official_foreground"/>
</adaptive-icon>
''')

def splash_image(size):
    bg = Image.new("RGB", size, "white")
    artwork = original.convert("RGB")
    artwork.thumbnail((round(size[0] * .86), round(size[1] * .5)), Image.Resampling.LANCZOS)
    bg.paste(artwork, ((size[0] - artwork.width)//2,(size[1] - artwork.height)//2))
    return bg

# Crucial: Android resolves density/port/land qualifiers before plain drawable.
# Replace EVERY existing splash.png, not only drawable/splash.png.
splashes = list(root.rglob("splash.png"))
if not splashes:
    raise SystemExit("No se encontraron recursos splash de Capacitor")
for splash in splashes:
    folder = splash.parent.name
    horizontal = "land" in folder
    with Image.open(splash) as old:
        w,h = old.size
    if w < 100 or h < 100:
        w,h = ((1920,1080) if horizontal else (1080,1920))
    splash_image((w,h)).save(splash,optimize=True)
# Provide generic fallbacks, but never override a qualified file with old art.
for folder,size in (("drawable",(1080,1920)),("drawable-land",(1920,1080))):
    path = root / folder / "splash.png"
    path.parent.mkdir(parents=True,exist_ok=True)
    splash_image(size).save(path,optimize=True)

# Android 12 launch icon uses the same approved symbol as the installed launcher.
print(f"FEP official assets: {len(splashes)} Android splash resources replaced; no provisional logo")
