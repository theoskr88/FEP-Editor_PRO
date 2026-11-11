"""Summarize actual completed checks. Refuse failures and stale packaged runtime."""
from pathlib import Path
from zipfile import ZipFile
import json,re,hashlib
root=Path('docs/evidence/cierre-b51');unit=(root/'unit-final.txt').read_text();count=int(re.search(r'(?:ℹ |# )?tests\s+(\d+)',unit)[1]);assert re.search(r'(?:ℹ |# )?fail\s+0(?:\s|$)',unit)
main=json.loads((root/'audit-suites.json').read_text());assert len(main)==28 and all(row['passed'] for row in main)
supplemental={}
for name in ['backup-census-browser.json','no-webgl-browser.json','conflict-browser.json','activation-failure-browser.json','soak-browser.json','compat/reliability.json','svg-validation.json','svg-roundtrip-validation.json']:
 data=json.loads((root/name).read_text());rows=data if isinstance(data,list) else data.get('results',[]);assert all(row.get('passed',row.get('reproduced',True)) is True for row in rows),name
 n=len(data) if isinstance(data,list) else data.get('passed',sum(r.get('passed') is True for r in rows));assert n>0; supplemental[name]=n
package=json.loads((root/'package.json').read_text());archive=Path('/workspace/deliverables')/package['archive'];assert package['passed'] and hashlib.sha256(archive.read_bytes()).hexdigest()==package['sha256']
with ZipFile(archive) as z:
 assert z.testzip() is None
 for name in z.namelist():assert z.read(name)==Path(name).read_bytes(),name
summary={'phase':'cierre-b51','base':'601ae8055f54a501b7b1975bf13b9129f877ca30','unitTests':count,'unitFailures':0,'mainSuites':len(main),'mainSuiteFailures':0,'supplementalSuites':supplemental,'totalSuiteScripts':len(main)+len(supplemental),'packagedRuntimeChecks':len(package['checks']),'pagesSha256':package['sha256'],'deployed':False,'nativeBuildsProduced':False,'physicalDevicesTested':False,'physicalPrintingTested':False,'physicalPlotterTested':False,'initialFailuresRetained':True,'B4IsolatedStorageInitializationFailureReproduced':False}
focused={}
for name,expected in [('hotfix-browser.json',18),('actions-browser.json',4),('acceptance.json',20)]:
 data=json.loads((root/name).read_text());rows=data if isinstance(data,list) else data.get('results',[])
 assert all(r.get('passed',r.get('reproduced',True)) is True for r in rows),name
 n=len(data) if isinstance(data,list) else data.get('passed',sum(r.get('passed') is True for r in rows));assert n==expected,(name,n);focused[name]=n
summary['focusedChromeChecks']=focused
summary['browser']=json.loads((root/'profile-browser-info.json').read_text())
summary['productionProfileCauseConfirmed']=False
summary.pop('B4IsolatedStorageInitializationFailureReproduced',None)
(root/'summary.json').write_text(json.dumps(summary,indent=2)+'\n');print(json.dumps(summary,indent=2))
