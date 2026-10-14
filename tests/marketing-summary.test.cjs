const test=require('node:test'),assert=require('node:assert/strict'),vm=require('node:vm'),fs=require('node:fs');
const context={document:{addEventListener(){}},Map,Date,Number};vm.createContext(context);vm.runInContext(fs.readFileSync('marketing-summary.js','utf8'),context);
test('aggregate dashboard replaces older revisions and preserves unknown versus recorded zero',()=>{
 const model=context.marketingSummaryModel([{date:'2026-10-12',revision:1,submittedCount:9},{date:'2026-10-12',revision:2,submittedCount:0},{date:'2026-10-01',revision:1,submittedCount:40}], '2026-10-13','week');
 assert.equal(model.total,0);assert.equal(model.today,undefined);assert.equal(model.selected.length,1);assert.equal(model.selected[0].revision,2);
});
test('period filtering and input validation exclude invalid counts',()=>{
 const model=context.marketingSummaryModel([{date:'2026-10-13',revision:3,submittedCount:5},{date:'2026-10-01',revision:1,submittedCount:10},{date:'2026-10-12',revision:1,submittedCount:-2}], '2026-10-13','all');
 assert.equal(model.total,15);assert.equal(model.rows.length,2);assert.equal(model.today.submittedCount,5);
});
