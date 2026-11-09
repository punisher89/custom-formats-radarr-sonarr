import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateUpdates } from '../scripts/sync-scores.mjs';

test('only matching custom-format scores of selected profile are altered', () => {
 const source = { id: 4, name: 'Test', formatItems: [
   { format: 9, score: 1 }, { format: 10, score: 200 }, { format: 11, score: -10 }
 ] };
 const remote = [{ id: 9, name: 'RU - Translation - Dubbing' },
                 { id: 10, name: 'Not Ours' }, { id: 11, name: 'UHD - DV without HDR fallback (WEB)' }];
 const wanted = new Map([['RU - Translation - Dubbing', 1000],
                        ['UHD - DV without HDR fallback (WEB)', -20000]]);
 const plan = calculateUpdates(source, remote, wanted);
 assert.equal(plan.changes.length, 2);
 assert.deepEqual(plan.missing, []);
 assert.equal(plan.updated.formatItems[0].score, 1000);
 assert.equal(plan.updated.formatItems[1].score, 200);
 assert.equal(plan.updated.formatItems[2].score, -20000);
 assert.equal(source.formatItems[0].score, 1);
});
test('missing formats are listed rather than silently created', () => {
 const plan = calculateUpdates({ id: 2, formatItems: [] }, [], new Map([['Missing', 1000]]));
 assert.deepEqual(plan.missing, ['Missing']);
});
