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
python3 - <<'PY'
from pathlib import Path
import struct
import zlib
image=Path('emulator-evidence/screenshot-start.png').read_bytes()
if not image.startswith(b'\\x89PNG\\r\\n\\x1a\\n'):
    raise SystemExit('FAIL: captura no es PNG')
position=8
parts=[]
while position+12<=len(image):
    length=struct.unpack('>I',image[position:position+4])[0]
    kind=image[position+4:position+8]
    if kind==b'IDAT':
        parts.append(image[position+8:position+8+length])
    position+=12+length
    if kind==b'IEND':
        break
pixels=zlib.decompress(b''.join(parts))
fraction=sum(x!=0 for x in pixels)/max(1,len(pixels))
print('Screenshot nonzero byte fraction:',round(fraction,4))
if fraction<0.02:
    raise SystemExit('FAIL: pantalla en negro; WebView abierto pero la interfaz no se renderiza')
PY
echo "PASS: APK instalada, actividad abierta, proceso activo y pantalla con contenido visual"
echo "PENDIENTE: cámara, importación, exportación y MP4 requieren pruebas de interacción específicas"
