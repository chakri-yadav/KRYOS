import test from 'node:test';
import assert from 'node:assert/strict';
import '../supabase/functions/kryos-ingest/sadhana-core.js';
const C=globalThis.KryosSadhana;
test('restart preserves recorded days and archives old cycle only once',()=>{
 const record={date:'2026-10-11',items:{instagram:'kept'},tasks:[{actionId:'existing'}]};
 const life={actions:[{id:'existing'}],sadhana:{cycle:{id:'devi-2026-10-10',startDate:'2026-10-10',endDate:'2026-11-26'},days:{'2026-10-10':{date:'2026-10-10'},'2026-10-11':record},history:[],receipts:{}}};
 C.ensure(life);C.ensure(life);
 assert.equal(life.sadhana.previousCycles.length,1);
 assert.equal(life.sadhana.previousCycles[0].records.length,2);
 assert.equal(life.sadhana.days['2026-10-11'],record);
 assert.equal(life.sadhana.cycle.startDate,'2026-10-11');
 assert.equal(C.number('2026-10-11'),1);
 assert.equal(C.number('2026-11-27'),48);
 assert.equal(C.dates().length,48);
 assert.equal(life.actions[0].id,'existing');
});
