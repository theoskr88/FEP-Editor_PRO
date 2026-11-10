"""Verify acceptance evidence and the tested runtime, then write a local phase gate.
Does not deploy, commit, push, or approve production.
"""
from pathlib import Path
import argparse,json,hashlib,re
from zipfile import ZipFile
p=argparse.ArgumentParser();p.add_argument('phase');p.add_argument('--base',required=True);p.add_argument('--report',action='append',default=[]);args=p.parse_args()
phase=args.phase.lower();root=Path('docs/evidence')/phase;reports={}
unit=(root/'unit-final.txt').read_text();tests=int(re.search(r'(?:ℹ |# )?tests\s+(\d+)',unit)[1]);assert re.search(r'(?:ℹ |# )?fail\s+0(?:\s|$)',unit),'Unit tests failed or incomplete'
for spec in args.report:
 file,n=spec.rsplit('=',1);data=json.loads((root/file).read_text())
 rows=data if isinstance(data,list) else data.get('results',[])
 assert all(row.get('passed',row.get('reproduced',True)) is True for row in rows),(file,'Failed evidence row')
 count=len(data) if isinstance(data,list) else data.get('passed',sum(row.get('passed') is True for row in rows))
 assert count==int(n),(file,count,n);reports[file]=count
package=json.loads((root/'package.json').read_text());assert package['passed'];runtime=Path('/workspace/deliverables')/package['archive'];assert hashlib.sha256(runtime.read_bytes()).hexdigest()==package['sha256']
with ZipFile(runtime) as archive:
 assert archive.testzip() is None
 for name in archive.namelist():assert archive.read(name)==Path(name).read_bytes(),name
(root/'gate.json').write_text(json.dumps({'phase':phase,'base':args.base,'gate':'passed locally','reports':reports,'unitTests':tests,'staticPackageChecks':len(package['checks']),'testedRuntimeSha256':package['sha256'],'deployed':False,'physicalDevicesTested':False,'physicalPrintingTested':False,'hardwarePlotterTested':False},indent=2)+'\n')
print('PASS phase gate:',phase)
