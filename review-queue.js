/* Catch-up navigation reads existing dated records; it never scores absence. */
(function(){
  function build(life,today){
    return KryosCommitment.dates().filter(date=>date<today).flatMap(date=>{
      const m=KryosDayReview.model(life,date);
      if(m.previous&&!m.pending)return [];
      return [{date,number:KryosCommitment.number(date),pending:m.pending,unanswered:m.missing.length,planSet:m.day.planSet,tasks:m.day.tasks.length}];
    });
  }
  window.KryosReviewQueue={build};
  function row(day){return `<button type="button" class="review-queue-day" data-review-queue-day="${day.date}"><span><strong>${escapeHtml(commandDateLabel(day.date))}</strong><small>Day ${day.number} · ${day.pending?'Changes need confirmation':day.unanswered+' daily requirements unanswered'}${!day.planSet?' · Plan not confirmed':''}</small></span><span aria-hidden="true">→</span></button>`;}
  function markup(){
    const days=build(lifeStore(),toDateKey());
    if(!days.length)return '<section class="review-queue review-queue-clear" aria-label="Days to review"><strong>No past days awaiting review</strong><p>You can still open any date to review or correct its records.</p></section>';
    const selected=kryosSelectedDate(),resume=days.find(d=>d.date===selected)||days.at(-1),recent=[...days].reverse();
    return `<section class="review-queue" aria-label="Days to review"><header><div><p class="section-kicker">CATCH UP WHEN YOU ARE READY</p><h2>${days.length} ${days.length===1?'day needs':'days need'} review</h2><p>Choose any day. Unrecorded does not mean lost.</p></div><button type="button" class="primary-button" data-review-queue-day="${resume.date}">${resume.date===selected?'Continue this day':'Review a past day'}</button></header><div class="review-queue-list">${recent.slice(0,3).map(row).join('')}</div>${recent.length>3?`<details><summary>Show all ${days.length} days</summary>${recent.slice(3).map(row).join('')}</details>`:''}</section>`;
  }
  KryosUI.renders.register('command','command.review-queue',{order:30,after(_view,html){return html+markup();}});
  KryosUI.renders.register('progress','progress.review-queue',{order:30,after(){progressView.querySelector('.review-queue')?.remove();progressView.querySelector('.shared-day-summary')?.insertAdjacentHTML('afterend',markup());}});
  document.addEventListener('click',event=>{
    const button=event.target.closest('[data-review-queue-day]');if(!button)return;
    const date=button.dataset.reviewQueueDay;
    KryosDayContext.set(date);setPage('journal');
    document.querySelector('[data-guided-review]')?.click();
  });
})();
