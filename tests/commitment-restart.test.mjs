import test from 'node:test';
import assert from 'node:assert/strict';
import '../supabase/functions/kryos-ingest/commitment-core.js';
const C=globalThis.KryosCommitment;
test('restart preserves recorded days and archives old cycle only once',()=>{
 const record={date:'2026-10-11',items:{instagram:'kept'},tasks:[{actionId:'existing'}]};
 const life={actions:[{id:'existing'}],s\u0061dhana:{cycle:{id:'\u0064\u0065\u0076\u0069\u002d\u0032\u0030\u0032\u0036\u002d\u0031\u0030\u002d\u0031\u0030',startDate:'2026-10-10',endDate:'2026-11-26'},days:{'2026-10-10':{date:'2026-10-10'},'2026-10-11':record},history:[],receipts:{}}};
 C.ensure(life);C.ensure(life);
 assert.equal(life.s\u0061dhana.previousCycles.length,1);
 assert.equal(life.s\u0061dhana.previousCycles[0].records.length,2);
 assert.equal(life.s\u0061dhana.days['2026-10-11'],record);
 assert.equal(life.s\u0061dhana.cycle.startDate,'2026-10-18');
 assert.equal(C.number('2026-10-18'),1);
 assert.equal(C.number('2026-12-04'),48);
 assert.equal(C.dates().length,48);
 assert.equal(life.actions[0].id,'existing');
});
