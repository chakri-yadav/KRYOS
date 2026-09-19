const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
function setup() {
  let count=0;
  const context = vm.createContext({taskState:{},document:{addEventListener(){}},toDateKey:()=> '2026-09-17',createId:()=>String(++count),saveTasks(){},getBehavior:()=>({sessions:[],dailyPlans:{}})});
  vm.runInContext(fs.readFileSync('life.js','utf8'),context);
  return context;
}
function pkg() {return {version:1,id:'page-1',date:'2026-09-17',text:'Walked 20 minutes.',records:[{title:'Walk',domain:'Movement',kind:'activity',completed:true,minutes:20,effort:3,evidence:'Walked 20 minutes.'}],actions:[{id:'renew-id',title:'Renew document',domain:'Personal tasks',priority:'important',nextAction:'Find requirements'}]};}
test('import preserves evidence and rejects duplicate package ids',()=>{const c=setup();const p=c.validateLifeImport(pkg());c.lifeCommit(p);assert.equal(c.taskState.life.records.length,1);assert.throws(()=>c.lifeCommit(p),/already/);assert.equal(c.taskState.life.entries.length,1);});
test('rejects invented evidence, impossible dates and negative durations',()=>{const c=setup();let p=pkg();p.records[0].evidence='Worked 80 minutes';assert.throws(()=>c.validateLifeImport(p),/excerpt/);p=pkg();p.date='2026-02-30';assert.throws(()=>c.validateLifeImport(p),/date/);p=pkg();p.records[0].minutes=-1;assert.throws(()=>c.validateLifeImport(p),/Minutes/);});
test('observations cannot become completed actions',()=>{const c=setup();const p=pkg();p.records[0].kind='observation';const r=c.validateLifeImport(p);assert.equal(r.records[0].completed,false);});
test('journal duration is not merged with timer duration',()=>{const c=setup();c.lifeCommit(c.validateLifeImport(pkg()));const d=c.lifeDay('2026-09-17');assert.equal(d.reported,20);assert.equal(d.minutes,0);assert.equal(d.completed,1);});
test('import adds persistent actions and preserves effort scoring',()=>{const c=setup();const p=c.validateLifeImport(pkg());c.lifeCommit(p);assert.equal(c.lifeStore().actions.length,1);assert.equal(c.lifeStore().actions[0].priority,'important');assert.equal(c.lifeStore().records[0].effort,3);});
