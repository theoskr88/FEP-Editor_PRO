"""Sequential browser regression audit; retains exact failures and never deploys."""
from pathlib import Path
import subprocess,json,time,argparse,re
root=Path(__file__).resolve().parents[1];out=root/'docs/evidence'/re.search(r"release:'([^']+)'",(root/'src/bootstrap.js').read_text())[1];out.mkdir(parents=True,exist_ok=True)
suites=['startup-repeats','boot','projects-browser','project-safety-browser','import-cancel-browser','free-browser','free-recovery-browser','free-limits-browser','free-zone-recovery','zones-browser','zones-migration','zones-race','accessories-browser','scenes-browser','stickers-browser','glitter-browser','print-files','vector-browser','profiles-browser','creative-browser','mockup-browser','print-browser','regressions','consolidation-browser','interface-browser','performance-browser','acceptance-browser','offline-browser']
parser=argparse.ArgumentParser();parser.add_argument('--start');args=parser.parse_args();existing=json.loads((out/'audit-suites.json').read_text()) if (out/'audit-suites.json').exists() else [];position=suites.index(args.start) if args.start else 0;results=[r for r in existing if r['name'] in suites[:position]];suites=suites[position:]
try:
 for name in suites:
  began=time.time();log=out/(name+'.log');print('RUN',name,flush=True)
  with log.open('w') as stream:r=subprocess.run(['node','tests/'+name+'.mjs'],cwd=root,stdout=stream,stderr=subprocess.STDOUT,timeout=1500)
  results.append({'name':name,'passed':r.returncode==0,'exitCode':r.returncode,'seconds':round(time.time()-began,2),'log':str(log.relative_to(root))});(out/'audit-suites.json').write_text(json.dumps(results,indent=2)+'\n');print('PASS' if r.returncode==0 else 'FAIL',name,flush=True)
  if r.returncode:raise SystemExit(r.returncode)
finally:(out/'audit-suites.json').write_text(json.dumps(results,indent=2)+'\n')
