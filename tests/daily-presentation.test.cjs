const test=require('node:test'),assert=require('node:assert/strict');
const P=require('../daily-presentation.js');
test('journey distinguishes unrecorded and revised without reinterpreting confirmed or future states',()=>{
 const blank={day:{revision:0,planSet:false,tasks:[],items:{},breaches:[]},pending:false};
 assert.equal(P.journeyState({state:'awaiting-review'},blank),'unrecorded');
 assert.equal(P.journeyState({state:'awaiting-review'},{...blank,pending:true}),'revised');
 assert.equal(P.journeyState({state:'awaiting-review'},{...blank,day:{...blank.day,planSet:true}}),'awaiting-review');
 for(const state of ['won','not-won','in-progress','upcoming'])assert.equal(P.journeyState({state},blank),state);
 assert.equal(P.journeyState({state:'awaiting-review'},null),'awaiting-review');
});
test('focus is a projection of existing open/active records, never a second task or write',()=>{
 const actions=[{id:'wait',status:'waiting'},{id:'open',status:'open'},{id:'active',status:'active'},{id:'done',status:'done'}],before=JSON.stringify(actions);
 assert.equal(P.focus(actions,'open'),actions[1]);assert.equal(P.focus(actions,'done'),actions[2]);
 assert.equal(P.focus(actions,'deleted'),actions[2]);assert.equal(P.focus([actions[0],actions[3]],'wait'),null);
 assert.equal(JSON.stringify(actions),before);
});
test('counter feedback explains completion and reset with the recorded date and exact undo amount',()=>{
 assert.match(P.counterFeedback('Water',2.5,3,3,'litres','2026-10-24'),/Target reached. Next tap resets/);
 assert.match(P.counterFeedback('Water',3,0,3,'litres','2026-10-24'),/reset to zero for 2026-10-24. Undo last tap restores 3 litres/);
 assert.match(P.counterFeedback('Repetitions',0,1,3,'repetitions','2026-10-23'),/1 of 3 repetitions for 2026-10-23/);
});
