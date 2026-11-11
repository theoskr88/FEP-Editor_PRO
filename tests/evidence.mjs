import {readFileSync,mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
// Keep approved Phase 1 / 2A evidence intact while rerunning compatibility suites.
export const evidenceDir='docs/evidence/'+readFileSync(new URL('../src/bootstrap.js',import.meta.url),'utf8').match(/release:'([^']+)'/)[1];
export function evidencePath(name){const path=fileURLToPath(new URL('../'+evidenceDir+'/compat/'+name,import.meta.url));mkdirSync(dirname(path),{recursive:true});return path}
