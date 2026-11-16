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
sleep 18
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
echo "PASS: APK instalada, Activity abierta, proceso activo y captura disponible"
echo "PENDIENTE: cámara, importación, exportación y MP4 requieren pruebas de interacción específicas"
