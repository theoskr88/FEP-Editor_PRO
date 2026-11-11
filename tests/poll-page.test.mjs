import test from 'node:test';import assert from 'node:assert/strict';import {pollPage} from './poll-page.mjs';
test('async browser polling retries resolved false values instead of accepting the Promise',async()=>{let n=0;const page={evaluate:async()=>++n===3};assert.equal(await pollPage(page,()=>{},null,3000),true);assert.equal(n,3)});
test('async browser polling rejects a condition that never became true',async()=>{await assert.rejects(pollPage({evaluate:async()=>false},()=>{},null,20),/did not become true/)});
