const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm');
test('historical career completion records occurrence separately and avoids repeat evidence',()=>{
 const check={id:'check',text:'Fixture',done:false},topic={id:'topic',title:'Topic',targetDate:'2026-10-15',checklist:[check]},module={id:'module',title:'Module',targetDate:'2026-10-15',topics:[topic]},roadmap={id:'roadmap',title:'Roadmap',modules:[module]},careerState={activityLog:[]};let id=0;
 const c={careerState,kryosSelectedDate:()=> '2026-10-14',toDateKey:()=> '2026-10-17',getCareerEditorRoadmap:()=>({roadmap,isDraft:false}),findModule:()=>module,findTopic:()=>topic,getTopicStats:()=>({total:1,done:Number(check.done)}),getModuleStats:()=>({total:1,done:Number(check.done)}),saveCareer(){},render(){},createId:()=>String(++id),alert(){}};
 vm.createContext(c);const source=fs.readFileSync('app.js','utf8');vm.runInContext(source.slice(source.indexOf('function toggleCareerCheck('),source.indexOf('function deleteCareerItem(')),c);
 const data={roadmapId:'roadmap',moduleId:'module',topicId:'topic',careerCheck:'check'};c.toggleCareerCheck(data,true);assert.equal(careerState.activityLog.length,3);assert.ok(careerState.activityLog.every(e=>e.date==='2026-10-14'&&e.recordedAt));assert.equal(topic.completedDate,'2026-10-14');assert.match(careerState.activityLog[1].checkText,/on time/);
 c.toggleCareerCheck(data,false);c.kryosSelectedDate=()=> '2026-10-16';c.toggleCareerCheck(data,true);assert.equal(careerState.activityLog.length,3);
 c.toggleCareerCheck(data,false);c.kryosSelectedDate=()=> '2026-10-18';c.toggleCareerCheck(data,true);assert.equal(check.done,false);
});
test('Launch dates and displayed week follow selection while future completion is rejected',()=>{
 const c={document:{addEventListener(){}},taskState:{},kryosSelectedDate:()=> '2026-10-14',toDateKey:d=>d?new Date(d).toISOString().slice(0,10):'2026-10-17',getDateFromKey:d=>new Date(d+'T12:00:00Z'),addDays:(d,n)=>new Date(new Date(d).getTime()+n*86400000)};
 vm.createContext(c);vm.runInContext(fs.readFileSync('launch.js','utf8'),c);assert.equal(c.launchActivityDate(),'2026-10-14');assert.equal(c.launchWeekStart(),'2026-10-12');assert.ok(c.launchWeekDates().includes('2026-10-14'));assert.equal(c.launchCanRecord('2026-10-14'),true);assert.equal(c.launchCanRecord('2026-10-18'),false);assert.equal(c.launchCanRecord('2026-02-30'),false);
});
