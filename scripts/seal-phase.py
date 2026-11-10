"""Verify acceptance evidence and the tested runtime, then write a local phase gate.
Does not deploy, commit, push, or approve production.
"""
from pathlib import Path
import argparse,json,hashlib
from zipfile import ZipFile
p=argparse.ArgumentParser();p.add_argument('phase');p.add_argument('--base',required=True);p.add_argument('--report',action='append',default=[]);args=p.parse_args()
phase=args.phase.lower();root=Path('docs/evidence')/phase;reports={}
for spec in args.report:
 file,n=spec.rsplit('=',1);data=json.loads((root/file).read_text());count=len(data) if isinstance(data,list) else data['passed'];assert count==int(n),(file,count,n);reports[file]=count
package=json.loads((root/'package.json').read_text());assert package['passed'];runtime=Path('/workspace/deliverables')/package['archive'];assert hashlib.sha256(runtime.read_bytes()).hexdigest()==package['sha256']
with ZipFile(runtime) as archive:
 assert archive.testzip() is None
 for name in archive.namelist():assert archive.read(name)==Path(name).read_bytes(),name
(root/'gate.json').write_text(json.dumps({'phase':phase,'base':args.base,'gate':'passed locally','reports':reports,'staticPackageChecks':len(package['checks']),'testedRuntimeSha256':package['sha256'],'deployed':False,'physicalDevicesTested':False,'physicalPrintingTested':False,'hardwarePlotterTested':False},indent=2)+'\n')
print('PASS phase gate:',phase)
