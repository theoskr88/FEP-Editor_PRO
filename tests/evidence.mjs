import {mkdirSync} from 'node:fs';
import {dirname} from 'node:path';
import {fileURLToPath} from 'node:url';
// Keep approved Phase 1 / 2A evidence intact while rerunning compatibility suites.
export function evidencePath(name){const path=fileURLToPath(new URL('../docs/evidence/fase2c/compat/'+name,import.meta.url));mkdirSync(dirname(path),{recursive:true});return path}
