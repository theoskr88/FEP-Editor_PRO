"""Create local, non-destructive ZONAS1-compatible backups of a Cierre A project.
Keeps the original byte-for-byte; unsupported bag/book faces become individual V2 files.
"""
from pathlib import Path
import argparse,json,copy,hashlib
p=argparse.ArgumentParser();p.add_argument('project',type=Path);p.add_argument('--out',required=True,type=Path);args=p.parse_args()
if args.project.stat().st_size>100_000_000:raise ValueError('Máximo 100 MB por proyecto')
raw=args.project.read_bytes();data=json.loads(raw)
if not isinstance(data,dict) or not isinstance(data.get('elements'),list):raise ValueError('Se requiere un proyecto JSON completo del editor')
known={'original','studio','table','workshop','commercial'}
def compatible(doc):
 d=copy.deepcopy(doc);m=d.get('mockup',{})
 if m.get('preset','original') not in known:m['preset']='studio'
 if m.get('camera','original')=='print':m['camera']='original'
 for key in ['lightStyle','shadowStrength','shadowSoftness']:m.pop(key,None)
 d['mockup']=m;bank={k:v for k,v in d.get('productZones',{}).items() if k in ['shirt','cushion']}
 if bank:d['productZones']=bank;d['zoneSchema']=1
 else:d.pop('productZones',None);d.pop('zoneSchema',None)
 d['version']=2;return d
outputs={'proyecto-activo.json':compatible(data)}
for product in ['tote','notebook']:
 group=data.get('productZones',{}).get(product)
 if not group:continue
 for face in ['front','back']:
  zone=group['zones'][face]
  if not isinstance(zone.get('elements'),list):raise ValueError('Cara inválida')
  doc=copy.deepcopy(data);doc.update(product=product,mode='product',width=zone['width'],height=zone['height'],elements=zone['elements']);outputs[f'{product}-{face}.json']=compatible(doc)
if data.get('freeDocument'):
 d=copy.deepcopy(data);d.update(mode='free',**data['freeDocument']);outputs['diseno-libre.json']=compatible(d)
# Nothing is overwritten; all conversion work finishes before creating the target folder.
encoded={name:json.dumps(doc,ensure_ascii=False,indent=2).encode() for name,doc in outputs.items()};encoded['ORIGINAL_CIERRE_A.json']=raw
args.out.mkdir(parents=True,exist_ok=False)
for name,content in encoded.items():(args.out/name).write_bytes(content)
(args.out/'SHA256SUMS.txt').write_text(''.join(hashlib.sha256(b).hexdigest()+'  '+name+'\n' for name,b in encoded.items()))
print(f'{len(outputs)} proyectos compatibles y original intacto en {args.out}')
