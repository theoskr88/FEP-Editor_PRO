#!/usr/bin/env bash
set -euo pipefail
mkdir -p emulator-evidence
APK="android/app/build/outputs/apk/debug/app-debug.apk"
PKG="com.fep.editorpro"
test -s "$APK"
adb wait-for-device
adb shell input keyevent 82 || true
adb logcat -c || true
adb install -r "$APK" | tee emulator-evidence/install.txt
adb shell am start -W -n "$PKG/.MainActivity" | tee emulator-evidence/launch.txt
sleep 35
adb shell dumpsys activity activities > emulator-evidence/activities.txt || true
adb shell dumpsys package "$PKG" > emulator-evidence/package.txt || true
adb shell screencap -p /sdcard/fep-editor-start.png
adb pull /sdcard/fep-editor-start.png emulator-evidence/screenshot-start.png
adb shell uiautomator dump /sdcard/fep-editor-ui.xml >/dev/null 2>&1 || true
adb pull /sdcard/fep-editor-ui.xml emulator-evidence/ui.xml >/dev/null 2>&1 || true
adb logcat -d -v time > emulator-evidence/logcat.txt
adb shell pidof "$PKG" > emulator-evidence/process-id.txt || true
if ! grep -q '[0-9]' emulator-evidence/process-id.txt; then
  echo "ERROR: el proceso de FEP Editor PRO no sigue ejecutándose" >&2
  exit 1
fi
# Detect exception only when clearly attributable to our package.
if grep -E -A 8 'FATAL EXCEPTION' emulator-evidence/logcat.txt | grep -q 'com\.fep\.editorpro'; then
  echo "ERROR: Android reportó una excepción fatal de FEP Editor PRO" >&2
  exit 1
fi
test -s emulator-evidence/screenshot-start.png
# Validate actual decoded RGBA pixels, not PNG predictor-filtered bytes.
# The previous raw-byte check falsely flagged a correctly rendered splash screen.
python3 - <<'PY'
from pathlib import Path
import struct, zlib
raw=Path('emulator-evidence/screenshot-start.png').read_bytes()
if not raw.startswith(bytes([137,80,78,71,13,10,26,10])):
    raise SystemExit('FAIL: Captura inválida')
width,height,bit_depth,color_type,*_=struct.unpack('>IIBBBBB',raw[16:29])
if bit_depth!=8 or color_type not in (2,6):
    raise SystemExit('FAIL: formato PNG inesperado')
bpp=4 if color_type==6 else 3
stride=width*bpp
pos=8;parts=[]
while pos+12<=len(raw):
    length=struct.unpack('>I',raw[pos:pos+4])[0]
    kind=raw[pos+4:pos+8]
    if kind==b'IDAT': parts.append(raw[pos+8:pos+8+length])
    pos+=length+12
    if kind==b'IEND': break
data=zlib.decompress(b''.join(parts))
previous=bytearray(stride);offset=0;colors=set()
for row in range(height):
    filtering=data[offset];offset+=1
    scan=bytearray(data[offset:offset+stride]);offset+=stride
    if filtering>4: raise SystemExit('FAIL: filtro PNG desconocido')
    for x in range(stride):
        a=scan[x-bpp] if x>=bpp else 0
        b=previous[x]
        c=previous[x-bpp] if x>=bpp else 0
        if filtering==1: p=a
        elif filtering==2: p=b
        elif filtering==3: p=(a+b)//2
        elif filtering==4:
            p0=a+b-c
            da,db,dc=abs(p0-a),abs(p0-b),abs(p0-c)
            p=a if da<=db and da<=dc else b if db<=dc else c
        else: p=0
        scan[x]=(scan[x]+p)&255
    if row%max(1,height//20)==0:
        for column in range(0,width,max(1,width//20)):
            colors.add(tuple(scan[column*bpp:column*bpp+3]))
    previous=scan
print('Screenshot:',width,'x',height,'distinct decoded sample colors:',len(colors))
if len(colors)<8:
    raise SystemExit('FAIL: captura visual vacía o uniforme')
PY
echo "PASS: APK instalada, actividad abierta, proceso activo y pantalla inicial visible"
# Select 'Personalizar producto 3D' on the fixed resolution Pixel emulator.
adb shell input tap 360 750
sleep 20
adb shell screencap -p /sdcard/fep-editor-workspace.png
adb pull /sdcard/fep-editor-workspace.png emulator-evidence/screenshot-editor.png
adb logcat -d -v time > emulator-evidence/logcat-after-editor.txt
test -s emulator-evidence/screenshot-editor.png
echo "PASS: se capturó el editor después de seleccionar producto; inspección visual pendiente"

echo "PENDIENTE: cámara, importación, exportación y MP4 requieren pruebas de interacción específicas"
