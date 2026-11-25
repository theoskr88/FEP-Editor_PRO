#!/usr/bin/env python3
"""Generate original FEP branding for Android launcher icons, without network or extra packages."""
from pathlib import Path
import struct
import zlib

root=Path("android/app/src/main/res")
NAVY=(19,39,57,255)
GOLD=(224,185,94,255)
WHITE=(249,249,246,255)

def png_bytes(size,round_icon=False):
    pixels=bytearray(size*size*4)
    def rect(x0,y0,x1,y1,color):
        for y in range(max(0,round(y0*size)),min(size,round(y1*size))):
            for x in range(max(0,round(x0*size)),min(size,round(x1*size))):
                idx=(y*size+x)*4;pixels[idx:idx+4]=bytes(color)
    # Background remains transparent outside optional circular icon.
    for y in range(size):
        for x in range(size):
            inside=not round_icon or ((x+.5-size/2)**2+(y+.5-size/2)**2)<=(size*.49)**2
            idx=(y*size+x)*4
            pixels[idx:idx+4]=bytes(NAVY if inside else (0,0,0,0))
    # Three stylized original letters made of geometric bars: F E P.
    for x0,x1 in [(.22,.255),(.43,.465),(.65,.685)]:
        rect(x0,.35,x1,.67,GOLD)
    # F
    rect(.22,.35,.39,.39,GOLD);rect(.22,.48,.36,.52,GOLD)
    # E
    rect(.43,.35,.60,.39,GOLD);rect(.43,.49,.57,.53,GOLD);rect(.43,.63,.60,.67,GOLD)
    # P
    rect(.65,.35,.79,.39,GOLD);rect(.65,.49,.79,.53,GOLD);rect(.77,.38,.80,.50,GOLD)
    def chunk(name,data):
        return struct.pack('!I',len(data))+name+data+struct.pack('!I',zlib.crc32(name+data)&0xffffffff)
    raw=b''.join(b'\x00'+pixels[y*size*4:(y+1)*size*4] for y in range(size))
    return b'\x89PNG\r\n\x1a\n'+chunk(b'IHDR',struct.pack('!2I5B',size,size,8,6,0,0,0))+chunk(b'IDAT',zlib.compress(raw,9))+chunk(b'IEND',b'')

for density,size in (('mdpi',48),('hdpi',72),('xhdpi',96),('xxhdpi',144),('xxxhdpi',192)):
    folder=root/('mipmap-'+density)
    folder.mkdir(parents=True,exist_ok=True)
    for name,rounded in (('ic_launcher.png',False),('ic_launcher_round.png',True)):
        (folder/name).write_bytes(png_bytes(size,rounded))

drawable=root/'drawable'
drawable.mkdir(parents=True,exist_ok=True)
(drawable/'fep_launcher_foreground.xml').write_text('''<?xml version="1.0" encoding="utf-8"?>
<vector xmlns:android="http://schemas.android.com/apk/res/android"
 android:width="108dp" android:height="108dp" android:viewportWidth="108" android:viewportHeight="108">
 <path android:fillColor="#E0B95E" android:pathData="M27,37h4v34h-4z M27,37h18v4h-18z M27,51h15v4h-15z M49,37h4v34h-4z M49,37h18v4h-18z M49,52h16v4h-16z M49,67h18v4h-18z M71,37h4v34h-4z M71,37h12v4h-12z M71,52h12v4h-12z M81,41h4v11h-4z"/>
</vector>
''')
(drawable/'fep_launcher_background.xml').write_text('''<?xml version="1.0" encoding="utf-8"?>
<shape xmlns:android="http://schemas.android.com/apk/res/android">
  <solid android:color="#132739"/>
</shape>
''')
adaptive=root/'mipmap-anydpi-v26'
adaptive.mkdir(parents=True,exist_ok=True)
for name in ('ic_launcher.xml','ic_launcher_round.xml'):
    (adaptive/name).write_text('''<?xml version="1.0" encoding="utf-8"?>
<adaptive-icon xmlns:android="http://schemas.android.com/apk/res/android">
 <background android:drawable="@drawable/fep_launcher_background"/>
 <foreground android:drawable="@drawable/fep_launcher_foreground"/>
</adaptive-icon>
''')
print("FEP original Android launcher resources generated (5 densities + adaptive)")
