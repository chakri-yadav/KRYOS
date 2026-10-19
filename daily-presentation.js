/* Pure display policy: no records, clocks, rewards or storage are changed. */
(function(root){
  function journeyState(day,review){
    if(day.state!=='awaiting-review'||!review)return day.state;
    if(review.pending)return 'revised';
    if(!review.day.revision&&!review.day.planSet&&!review.day.tasks.length&&!Object.keys(review.day.items).length&&!review.day.breaches.length)return 'unrecorded';
    return 'awaiting-review';
  }
  function focus(actions,selectedId){
    const eligible=actions.filter(a=>a.status==='active'||a.status==='open');
    return eligible.find(a=>a.id===selectedId)||eligible.find(a=>a.status==='active')||eligible[0]||null;
  }
  function counterFeedback(title,before,after,target,unit,date){
    if(before>=target&&after===0)return `${title}: reset to zero for ${date}. Undo last tap restores ${before} ${unit}.`;
    return `${title}: ${after} of ${target} ${unit} for ${date}.${after>=target?' Target reached. Next tap resets to zero.':''}`;
  }
  const api={journeyState,focus,counterFeedback};root.KryosDailyPresentation=api;
  if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(globalThis);
