const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createDayContext}=require('../day-context.js');
test('historical selection remains pinned when the operating clock advances',()=>{
 let today='2026-10-17',saved;
 const context=createDayContext({today:()=>today,save:value=>saved=value});
 context.set('2026-10-14');today='2026-10-18';
 assert.equal(context.get().selectedDate,'2026-10-14');
 assert.equal(context.get().currentDate,'2026-10-18');
 assert.equal(context.get().isHistory,true);
 const restored=createDayContext({today:()=>today,load:()=>saved});
 assert.equal(restored.get().selectedDate,'2026-10-14');
 restored.today();today='2026-10-19';
 assert.equal(restored.get().selectedDate,'2026-10-19');
});
test('bad dates never mutate the shared selection; persistence failure keeps session usable',()=>{
 const context=createDayContext({today:()=> '2026-10-17',load:()=>{throw Error('unavailable');},save:()=>{throw Error('unavailable');}});
 assert.throws(()=>context.set('2026-02-30'));
 context.set('2026-10-16');assert.equal(context.get().selectedDate,'2026-10-16');
});
