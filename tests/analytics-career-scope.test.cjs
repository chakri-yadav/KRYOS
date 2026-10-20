const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('progress coverage describes the selected roadmap core rather than optional or other roadmap work',()=>{
 const a={id:'one',title:'First',modules:[{topics:[{checklist:[{done:true},{done:false}]},{optional:true,checklist:[{done:true}]},{lane:'extra',checklist:[{done:true}]}]}]},b={id:'two',title:'Second',modules:[{topics:[{checklist:[{done:true}]}]}]};
 const c=vm.createContext({careerState:{roadmaps:[a,b]},selectedRoadmapId:'one',getCareerStats:()=>({progress:99,weekActions:9,currentStreak:2}),getNextCareerItem:()=>null,escapeHtml:String});
 const app=fs.readFileSync('app.js','utf8');vm.runInContext(app.slice(app.indexOf('function getChecklistStats('),app.indexOf('function getTopicStats(')),c);
 const source=fs.readFileSync('progress.js','utf8');vm.runInContext(source.slice(source.indexOf('function compactCareerProgress()'),source.indexOf('function progressDeadlineTracker()')),c);
 const before=JSON.stringify([a,b]),html=c.compactCareerProgress();assert.match(html,/50%/);assert.match(html,/1 \/ 2 core checks · this roadmap/);assert.match(html,/all roadmaps/);assert.doesNotMatch(html,/99%/);assert.equal(JSON.stringify([a,b]),before);
 c.selectedRoadmapId='two';assert.match(c.compactCareerProgress(),/100%/);
});
