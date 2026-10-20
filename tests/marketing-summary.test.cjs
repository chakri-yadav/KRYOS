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

test('date ranges retain unknown dates separately from confirmed zero and use recorded-day averages',()=>{
 const model=context.marketingSummaryModel([{date:'2026-10-12',revision:1,submittedCount:4},{date:'2026-10-14',revision:1,submittedCount:0}], '2026-10-17',{from:'2026-10-12',to:'2026-10-14'});
 assert.equal(model.total,4);assert.equal(model.average,2);assert.equal(model.span,3);assert.equal(model.chart[1].count,null);assert.equal(model.chart[2].count,0);assert.equal(model.best.date,'2026-10-12');
});
test('invalid dates, future snapshots and unsupported workspaces never appear',()=>{
 const model=context.marketingSummaryModel([{date:'2026-02-30',revision:1,submittedCount:8},{date:'2026-10-18',revision:1,submittedCount:9},{date:'2026-10-14',revision:1,submittedCount:4,workspaceId:'unrelated'}],'2026-10-17','all');
 assert.equal(model.rows.length,0);assert.throws(()=>context.marketingSummaryModel([],'2026-10-17',{from:'2026-10-18',to:'2026-10-19'}));assert.throws(()=>context.marketingSummaryModel([],'2026-10-17',{from:'2025-01-01',to:'2026-10-17'}));
});
test('long periods stay compact without changing their aggregate total',()=>{
 const model=context.marketingSummaryModel([{date:'2025-01-01',revision:1,submittedCount:6},{date:'2026-10-17',revision:1,submittedCount:3}],'2026-10-17','all');
 assert.ok(model.chart.length<=31);assert.equal(model.total,9);assert.equal(model.chart.reduce((sum,d)=>sum+(d.count||0),0),9);assert.equal(model.selected.length,2);
});
test('hosted analytics is counts-only and does not mutate data or import jobs',()=>{
 const source=fs.readFileSync('marketing-summary.js','utf8');assert.doesNotMatch(source,/\.upsert\(|\.rpc\(|saveTasks\(|marketingWrite\(|type="file"/);assert.match(source,/marketingSummaries/);
 const foundation=fs.readFileSync('visual-foundation.js','utf8');assert.match(foundation,/!laptop&&page==='marketing'.*actionSyncState/);
});
test('renderer returns HTML for the main navigation render contract',()=>{
 context.document.getElementById=()=>({});context.toDateKey=()=> '2026-10-17';context.lifeStore=()=>({marketingSummaries:[]});context.marketingEscape=String;
 const html=context.renderMarketingView();assert.equal(typeof html,'string');assert.match(html,/Application progress/);assert.match(html,/No handoff recorded yet/);
});
test('grouped bars, dated snapshot drilldown and safe export agree including corrected zero',()=>{
 const rows=[{date:'2026-09-01',submittedCount:4,revision:1,company:'must not export'},{date:'2026-10-12',submittedCount:9,revision:1},{date:'2026-10-12',submittedCount:0,revision:2},{date:'2026-10-14',submittedCount:3,revision:2}];
 const m=context.marketingSummaryModel(rows,'2026-10-19',{from:'2026-09-01',to:'2026-10-19'});
 for(const bar of m.chart){vm.runInContext('marketingSummarySelection='+JSON.stringify({from:bar.date,to:bar.to}),context);assert.equal(context.marketingSummaryContributors(m).reduce((n,r)=>n+r.submittedCount,0),bar.count||0);}
 const out=context.marketingSummaryExport(m);assert.equal(out.rows.length,3);assert.equal(out.rows.reduce((n,r)=>n+r.submittedCount,0),7);assert.equal(out.rows.find(r=>r.date==='2026-10-12').submittedCount,0);assert.doesNotMatch(JSON.stringify(out),/company|must not export/);assert.deepEqual(Object.keys(out.rows[0]),['date','workspaceId','revision','submittedCount']);
 vm.runInContext('marketingSummarySelection=null',context);
});
