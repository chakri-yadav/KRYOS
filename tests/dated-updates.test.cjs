const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('routine late entry uses selected day, preserves identity and ignores duplicate totals',()=>{
 let saves=0;
 const context={document:{addEventListener(){}},taskState:{},createId:()=> 'fixture-routine',saveTasks:()=>saves++,toDateKey:()=> '2026-10-17',kryosSelectedDate:()=> '2026-10-14'};
 vm.createContext(context);vm.runInContext(fs.readFileSync('rhythm.js','utf8'),context);
 context.rhythmSetValue('water',1);const first=context.rhythmEvent('water','2026-10-14');
 context.rhythmSetValue('water',1);assert.equal(saves,1);
 context.rhythmSetValue('water',2);const next=context.rhythmEvent('water','2026-10-14');
 assert.equal(next.id,first.id);assert.equal(next.recordedAt,first.recordedAt);assert.equal(next.occurredDate,'2026-10-14');assert.equal(next.revision,2);
 assert.throws(()=>context.rhythmSetValue('water',1,'2026-10-18'));
});
test('action completion passes selected occurrence day to linked commitments once',()=>{
 const source=fs.readFileSync('commitment.js','utf8'),start=source.indexOf('const commitmentOriginalActionStatus='),end=source.indexOf("KryosUI.renders.register('action.sync'",start);
 assert.ok(end>start);
 const dates=[],life={},context={updateActionStatus:(action,status)=>{action.status=status;return true;},KryosCommitment:{today:()=> '2026-10-17',actionChanged:(_,action,date)=>{dates.push(date);action.completedDate=date;}},commitmentLife:()=>life,saveTasks(){},kryosSelectedDate:()=> '2026-10-14',alert(){}};
 vm.createContext(context);vm.runInContext(source.slice(start,end),context);
 const action={id:'fixture',status:'open'};context.updateActionStatus(action,'done');context.updateActionStatus(action,'done');
 assert.deepEqual(dates,['2026-10-14']);assert.equal(action.completedDate,'2026-10-14');assert.equal(action.revision,1);assert.ok(action.recordedAt);
 context.kryosSelectedDate=()=> '2026-10-18';assert.equal(context.updateActionStatus({status:'open'},'done'),false);
});
