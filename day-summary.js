/* One read-only summary joins day review and existing earned-evidence rules. */
(function(){
  function summarize({date,today,review,journey,evidence,wallet,cycle}){
    const states=journey.reduce((out,d)=>{out[d.state]=(out[d.state]||0)+1;return out;},{});
    const result=cycle&&date===cycle.dayZero?'Preparation':cycle&&(date<cycle.dayZero||date>cycle.endDate)?'Outside current cycle':date>today?'Planned day':date===today?'In progress':review?.pending?'Changes need confirmation':review?.previous==='won'?'Battle won':review?.previous==='not-won'?'Battle not won':review?'Needs review':'Outside current cycle';
    return {date,result,earned:Number(evidence?.credits)||0,score:Number(evidence?.total)||0,qualified:!!evidence?.qualified,currentBalance:Number(wallet?.balance)||0,won:states.won||0,notWon:states['not-won']||0,awaiting:states['awaiting-review']||0};
  }
  window.KryosDaySummary={summarize,markup};
  function markup(){
    const date=kryosSelectedDate(),today=toDateKey(),life=lifeStore(),inCycle=date>=KryosCommitment.cycle.startDate&&date<=KryosCommitment.cycle.endDate;
    const evidence=rewardEvidence(date),wallet=journalRewardStats(),review=inCycle?KryosDayReview.model(life,date):null;
    const s=summarize({date,today,review,journey:commandJourneyModel(life,today),evidence,wallet,cycle:KryosCommitment.cycle});
    return `<section class="shared-day-summary" aria-label="Connected day summary"><header><div><p class="section-kicker">${escapeHtml(commandDateLabel(date))}</p><h2>${s.result}</h2></div><button type="button" class="secondary-button" data-summary-review="${date}">Open this day</button></header><div class="shared-day-summary-grid"><div><strong>${s.score}</strong><span>Activity score on this day</span></div><div><strong data-day-earned>+${s.earned}</strong><span>${life.rewardV5?.reset&&date<life.rewardV5.reset.earnFromDate?'Points earned then · archived':'Points earned on this day'}</span></div><div><strong>${s.currentBalance}</strong><span>Current wallet balance</span></div></div><p>Battle results and reward qualification use separate rules. Recorded effort keeps its eligible points.</p><footer><span>${s.won} days won</span><span>${s.notWon} days not won</span><span>${s.awaiting} days awaiting review or confirmation</span></footer></section>`;
  }
  KryosUI.renders.register('progress','progress.day-summary',{order:20,after(){progressView.querySelector('.shared-day-summary')?.remove();progressView.querySelector('.progress-title')?.insertAdjacentHTML('afterend',markup());const signal=progressView.querySelector('.evidence-today-copy .section-kicker');if(signal)signal.textContent=kryosSelectedDate()===toDateKey()?"TODAY'S SIGNAL":"SELECTED DAY'S SIGNAL";}});
  KryosUI.renders.register('rewards','rewards.day-summary',{order:20,after(){rewardsView.querySelector('.shared-day-summary')?.remove();const combined=rewardsView.querySelector('.reward-day-summary');if(combined){combined.querySelector('[data-reward-day-summary]')?.remove();combined.insertAdjacentHTML('afterbegin',markup());}else rewardsView.querySelector('.reward-hero')?.insertAdjacentHTML('afterend',markup());const week=rewardsView.querySelector('.reward-week-card .section-kicker');if(week)week.textContent='SEVEN DAYS ENDING '+kryosSelectedDate();const label=rewardsView.querySelector('.reward-hero small');if(label)label.textContent='CURRENT REWARD WALLET';}});
  document.addEventListener('click',event=>{const button=event.target.closest('[data-summary-review]');if(!button)return;KryosDayContext.set(button.dataset.summaryReview);setPage('journal');});
})();
