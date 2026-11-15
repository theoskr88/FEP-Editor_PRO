#!/usr/bin/env python3
"""Patch only generated Android package visibility for the system camera and file chooser."""
from pathlib import Path
from xml.etree import ElementTree as ET

manifest=Path("android/app/src/main/AndroidManifest.xml")
if not manifest.is_file():
    raise SystemExit("AndroidManifest.xml no encontrado")
tree=ET.parse(manifest)
root=tree.getroot()
ns="{http://schemas.android.com/apk/res/android}"
queries=root.find("queries")
if queries is None:
    queries=ET.Element("queries")
    root.insert(0,queries)
actions={
    "android.media.action.IMAGE_CAPTURE",
    "android.intent.action.GET_CONTENT",
}
for action in sorted(actions):
    exists=any(el.attrib.get(ns+"name")==action for el in queries.findall("./intent/action"))
    if not exists:
        intent=ET.SubElement(queries,"intent")
        ET.SubElement(intent,"action",{ns+"name":action})
ET.register_namespace("android","http://schemas.android.com/apk/res/android")
tree.write(manifest,encoding="utf-8",xml_declaration=True)
check=ET.parse(manifest).getroot()
found={e.attrib.get(ns+"name") for e in check.findall("./queries/intent/action")}
if not actions.issubset(found):
    raise SystemExit("No se insertaron las acciones de cámara")
print("Android manifest: acciones IMAGE_CAPTURE y GET_CONTENT disponibles")
