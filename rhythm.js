const RHYTHM_HABITS = [
  { id: 'breakfast', title: 'Breakfast', group: 'body', cadence: 'daily', essential: true, icon: 'sunrise' },
  { id: 'lunch', title: 'Lunch', group: 'body', cadence: 'daily', essential: true, icon: 'utensils' },
  { id: 'dinner', title: 'Dinner', group: 'body', cadence: 'daily', essential: true, icon: 'moon' },
  { id: 'protein', title: 'Protein shake', group: 'body', cadence: 'daily', essential: true, icon: 'cup-soda' },
  { id: 'supplements', title: 'Supplements', group: 'body', cadence: 'daily', essential: true, icon: 'pill' },
  { id: 'water', title: 'Water', group: 'body', cadence: 'daily', essential: true, unit: 'L', target: 3.5, step: .5, icon: 'droplets' },
  { id: 'moisturizer', title: 'Moisturizer', group: 'care', cadence: 'daily', essential: true, icon: 'sparkles' },
  { id: 'serum', title: 'Face serum', group: 'care', cadence: 'daily', essential: true, icon: 'flask-conical' },
  { id: 'eye-cream', title: 'Eye cream', group: 'care', cadence: 'daily', essential: true, icon: 'eye' },
  { id: 'sunscreen', title: 'Sunscreen', group: 'care', cadence: 'daily', essential: true, icon: 'sun' },
  { id: 'exercise', title: 'Exercise', group: 'body', cadence: 'weekly', target: 3, unit: 'sessions', icon: 'dumbbell' },
  { id: 'hair-care', title: 'Shampoo and conditioner', group: 'care', cadence: 'weekly', target: 2, unit: 'times', icon: 'shower-head' },
  { id: 'groceries', title: 'Buy groceries', group: 'body', cadence: 'weekly', target: 1, unit: 'trip', icon: 'shopping-basket' },
  { id: 'nama-japa', title: 'Nama japa', group: 'spirit', cadence: 'opportunity', icon: 'circle-dot' },
  { id: 'gita', title: 'Bhagavad Gita', group: 'spirit', cadence: 'opportunity', icon: 'book-open' },
  { id: 'chalisa', title: 'Hanuman Chalisa', group: 'spirit', cadence: 'opportunity', target: 3, unit: 'recitations', icon: 'book-heart' },
  { id: 'aditya', title: 'Aditya Hridayam', group: 'spirit', cadence: 'opportunity', target: 3, unit: 'repetitions', icon: 'sun-medium' },
  { id: 'meditation', title: 'Meditation', group: 'spirit', cadence: 'opportunity', icon: 'brain' },
  { id: 'pranayama', title: 'Pranayama', group: 'spirit', cadence: 'opportunity', icon: 'wind' },
];

let rhythmSelectedDate = '';
let rhythmSettingsOpen = false;

function rhythmStore() {
  taskState.rhythm ||= { version: 1, events: [], settings: { foundationThreshold: 70, waterTarget: 3.5, exerciseTarget: 3, hairTarget: 2 } };
  taskState.rhythm.events ||= [];
  taskState.rhythm.settings ||= { foundationThreshold: 70, waterTarget: 3.5, exerciseTarget: 3, hairTarget: 2 };
  return taskState.rhythm;
}

function rhythmHabit(id) { return RHYTHM_HABITS.find(habit => habit.id === id); }
function rhythmEvents(date = null) { return rhythmStore().events.filter(event => !date || event.date === date); }
function rhythmEvent(id, date = toDateKey()) { return rhythmEvents(date).find(event => event.habitId === id); }
function rhythmValue(id, date = toDateKey()) { return Number(rhythmEvent(id, date)?.value || 0); }
function rhythmTarget(habit) {
  const settings = rhythmStore().settings;
  if (habit.id === 'water') return Number(settings.waterTarget || habit.target);
  if (habit.id === 'exercise') return Number(settings.exerciseTarget || habit.target);
  if (habit.id === 'hair-care') return Number(settings.hairTarget || habit.target);
  return Number(habit.target || 1);
}

function rhythmSetValue(habitId, value, date = toDateKey(), source = 'manual') {
  const store = rhythmStore();
  const index = store.events.findIndex(event => event.habitId === habitId && event.date === date);
  const habit = rhythmHabit(habitId);
  const next = { id: index >= 0 ? store.events[index].id : createId(), habitId, date, value: Math.max(0, Number(value) || 0), unit: habit?.unit || 'completion', source, updatedAt: new Date().toISOString() };
  if (index >= 0) store.events[index] = next;
  else store.events.push(next);
  saveTasks();
}

function rhythmDay(date) {
  const essentials = RHYTHM_HABITS.filter(habit => habit.cadence === 'daily' && habit.essential);
  const completed = essentials.filter(habit => rhythmValue(habit.id, date) >= rhythmTarget(habit)).length;
  const body = RHYTHM_HABITS.filter(habit => habit.cadence === 'daily' && habit.group === 'body');
  const care = RHYTHM_HABITS.filter(habit => habit.cadence === 'daily' && habit.group === 'care');
  const spirit = RHYTHM_HABITS.filter(habit => habit.group === 'spirit');
  const score = habits => habits.length ? Math.round(habits.reduce((sum, habit) => sum + Math.min(1, rhythmValue(habit.id, date) / rhythmTarget(habit)), 0) / habits.length * 100) : 0;
  const spiritualPractices = spirit.filter(habit => rhythmValue(habit.id, date) > 0).length;
  return { date, completed, total: essentials.length, percent: Math.round(completed / essentials.length * 100), qualified: Math.round(completed / essentials.length * 100) >= rhythmStore().settings.foundationThreshold, body: score(body), care: score(care), spirit: Math.min(100, spiritualPractices * 25), spiritualPractices };
}

function rhythmWeek(date = new Date()) {
  const anchor = normalizeDateInput(date);
  const monday = addDays(anchor, -(anchor.getDay() === 0 ? 6 : anchor.getDay() - 1));
  const days = Array.from({ length: 7 }, (_, index) => rhythmDay(toDateKey(addDays(monday, index))));
  const weekly = RHYTHM_HABITS.filter(habit => habit.cadence === 'weekly').map(habit => {
    const value = days.reduce((sum, day) => sum + rhythmValue(habit.id, day.date), 0);
    const target = rhythmTarget(habit);
    return { habit, value, target, percent: Math.min(100, Math.round(value / target * 100)) };
  });
  return { monday, days, weekly, foundationAverage: Math.round(days.reduce((sum, day) => sum + day.percent, 0) / 7) };
}

function rhythmStreakStats() {
  const today = getDateFromKey(toDateKey());
  const days = Array.from({ length: 365 }, (_, index) => rhythmDay(toDateKey(addDays(today, index - 364))));
  let best = 0, run = 0;
  days.forEach(day => { run = day.qualified ? run + 1 : 0; best = Math.max(best, run); });
  let current = 0;
  for (let index = days.length - 1; index >= 0 && days[index].qualified; index -= 1) current += 1;
  const qualifiedIndexes = days.map((day, index) => day.qualified ? index : -1).filter(index => index >= 0);
  const gaps = [];
  for (let index = 1; index < qualifiedIndexes.length; index += 1) gaps.push(Math.max(0, qualifiedIndexes[index] - qualifiedIndexes[index - 1] - 1));
  const recovery = gaps.length ? Math.round(gaps.reduce((sum, gap) => sum + gap, 0) / gaps.length * 10) / 10 : 0;
  return { current, best, recovery };
}

function rhythmIcon(name) {
  const fallback = { sunrise: 'B', utensils: 'L', moon: 'D', 'cup-soda': 'P', pill: 'S', droplets: 'W', sparkles: 'M', 'flask-conical': 'F', eye: 'E', sun: 'S', dumbbell: 'X', 'shower-head': 'H', 'shopping-basket': 'G', 'circle-dot': 'J', 'book-open': 'G', 'book-heart': 'C', 'sun-medium': 'A', brain: 'M', wind: 'P', check: '✓', 'check-circle-2': '✓', 'settings-2': 'S' };
  return `<i data-lucide="${name}" aria-hidden="true">${fallback[name] || '·'}</i>`;
}

function renderRhythmHabit(habit, date) {
  const value = rhythmValue(habit.id, date);
  const target = rhythmTarget(habit);
  const done = value >= target;
  if (habit.id === 'water') {
    const segments = Math.max(1, Math.round(target / habit.step));
    return `<button class="rhythm-item rhythm-water ${done ? 'is-done' : ''}" data-rhythm-step="${habit.id}" data-date="${date}"><span class="rhythm-item-icon">${rhythmIcon(habit.icon)}</span><span><strong>${habit.title}</strong><small>Personal target ${target} L</small></span><span class="rhythm-water-track">${Array.from({ length: segments }, (_, index) => `<i class="${index < Math.round(value / habit.step) ? 'is-filled' : ''}"></i>`).join('')}</span><b>${value.toFixed(1)} L</b></button>`;
  }
  if (habit.target) {
    return `<button class="rhythm-item ${done ? 'is-done' : ''}" data-rhythm-step="${habit.id}" data-date="${date}"><span class="rhythm-item-icon">${rhythmIcon(habit.icon)}</span><span><strong>${habit.title}</strong><small>${habit.cadence === 'opportunity' ? 'Available practice' : 'Scheduled'}</small></span><b>${value}/${target}</b></button>`;
  }
  return `<button class="rhythm-item ${done ? 'is-done' : ''}" data-rhythm-toggle="${habit.id}" data-date="${date}"><span class="rhythm-item-icon">${done ? rhythmIcon('check') : rhythmIcon(habit.icon)}</span><span><strong>${habit.title}</strong><small>${habit.cadence === 'opportunity' ? 'Available practice' : 'Scheduled today'}</small></span><b>${done ? 'Done' : 'Open'}</b></button>`;
}

function renderRhythmGroup(title, subtitle, habits, date, optional = false) {
  const completed = habits.filter(habit => rhythmValue(habit.id, date) >= rhythmTarget(habit));
  const remaining = habits.filter(habit => rhythmValue(habit.id, date) < rhythmTarget(habit));
  return `<section class="rhythm-routine-group ${optional ? 'is-optional' : ''}"><div class="rhythm-group-head"><div><span>${title}</span><p>${subtitle}</p></div><strong>${optional ? `${completed.length} practised` : `${completed.length}/${habits.length}`}</strong></div><div class="rhythm-item-grid">${remaining.map(habit => renderRhythmHabit(habit, date)).join('') || `<div class="rhythm-group-complete">${rhythmIcon('check-circle-2')}<span><strong>${optional ? 'Practices recorded.' : 'Foundation complete.'}</strong><small>${optional ? 'Nothing else is required.' : 'The scheduled actions are finished.'}</small></span></div>`}</div>${completed.length ? `<details class="rhythm-completed"><summary>${rhythmIcon('check')} ${completed.length} completed</summary><div class="rhythm-item-grid">${completed.map(habit => renderRhythmHabit(habit, date)).join('')}</div></details>` : ''}</section>`;
}

function renderRhythmConstellation() {
  const today = getDateFromKey(toDateKey());
  const days = Array.from({ length: 28 }, (_, index) => rhythmDay(toDateKey(addDays(today, index - 27))));
  return `<div class="rhythm-constellation" role="img" aria-label="Twenty-eight day Body, Care, and Spirit rhythm"><div class="rhythm-constellation-labels"><span>Body</span><span>Care</span><span>Spirit</span></div><div class="rhythm-constellation-grid">${days.map(day => `<button data-rhythm-date="${day.date}" aria-label="${day.date}: Body ${day.body}%, Care ${day.care}%, Spirit ${day.spirit}%"><i style="--depth:${day.body}%"></i><i style="--depth:${day.care}%"></i><i style="--depth:${day.spirit}%"></i><small>${getDateFromKey(day.date).getDate()}</small></button>`).join('')}</div></div>`;
}

function renderRhythmView() {
  if (!rhythmView) return;
  const today = toDateKey();
  const selectedDate = rhythmSelectedDate || today;
  const selected = rhythmDay(selectedDate);
  const week = rhythmWeek(getDateFromKey(selectedDate));
  const streak = rhythmStreakStats();
  const body = RHYTHM_HABITS.filter(habit => habit.cadence === 'daily' && habit.group === 'body');
  const care = RHYTHM_HABITS.filter(habit => habit.cadence === 'daily' && habit.group === 'care');
  const spirit = RHYTHM_HABITS.filter(habit => habit.group === 'spirit');
  const remaining = selected.total - selected.completed;
  rhythmView.innerHTML = `<header class="rhythm-command"><div class="rhythm-command-copy"><p class="section-kicker">KRYOS / RHYTHM</p><h1>${remaining ? `${remaining} foundations remain.` : 'Foundation held.'}</h1><p>Protect the body. Steady the mind. Record spiritual practice without turning devotion into pressure.</p><span class="rhythm-sync"><i></i>Changes save locally and sync through your KRYOS cloud profile</span></div><div class="rhythm-command-stat"><span>Foundation</span><strong>${selected.completed}<small>/${selected.total}</small></strong><em>${selected.percent}% essential completion</em></div><div class="rhythm-command-stat"><span>Sustainable streak</span><strong>${streak.current}<small> days</small></strong><em>Personal best ${streak.best}</em></div><div class="rhythm-command-stat"><span>Average return</span><strong>${streak.recovery}<small> days</small></strong><em>Recovery matters more than perfection</em></div></header>
    <section class="rhythm-overview"><div><span>Selected KRYOS day</span><strong>${formatDateKey(selectedDate)}</strong></div><div class="rhythm-overview-score"><i style="--value:${selected.body * 3.6}deg"><b>${selected.body}%</b></i><span>Body</span></div><div class="rhythm-overview-score"><i style="--value:${selected.care * 3.6}deg"><b>${selected.care}%</b></i><span>Care</span></div><div class="rhythm-overview-score"><i style="--value:${selected.spirit * 3.6}deg"><b>${selected.spiritualPractices}</b></i><span>Spirit practices</span></div><button class="icon-button" data-rhythm-settings aria-label="Rhythm settings" title="Rhythm settings">${rhythmIcon('settings-2')}</button></section>
    ${rhythmSettingsOpen ? renderRhythmSettings() : ''}
    <div class="rhythm-layout"><main class="rhythm-main"><section class="rhythm-surface"><div class="rhythm-section-head"><div><p class="section-kicker">TODAY</p><h2>Only what remains stays forward.</h2></div><span>${selected.percent >= rhythmStore().settings.foundationThreshold ? 'Sustainable day reached' : `${rhythmStore().settings.foundationThreshold - selected.percent}% to sustainable day`}</span></div><div class="rhythm-groups">${renderRhythmGroup('Nourish', 'Meals, protein, supplements, and hydration', body, selectedDate)}${renderRhythmGroup('Care', 'Daily skincare kept as one coherent routine', care, selectedDate)}${renderRhythmGroup('Spirit', 'Opportunity and presence, never punishment', spirit, selectedDate, true)}</div></section>
      <section class="rhythm-surface"><div class="rhythm-section-head"><div><p class="section-kicker">28-DAY CONSTELLATION</p><h2>Balance across Body, Care, and Spirit.</h2></div><span>Select any day</span></div>${renderRhythmConstellation()}</section></main>
      <aside class="rhythm-side"><section class="rhythm-surface"><div class="rhythm-section-head"><div><p class="section-kicker">THIS WEEK</p><h2>Flexible goals</h2></div><strong>${week.foundationAverage}%</strong></div><div class="rhythm-weekly-list">${week.weekly.map(item => `<div class="rhythm-weekly-row"><div><strong>${item.habit.title}</strong><span>${item.value}/${item.target} ${item.habit.unit}</span></div><div class="rhythm-goal-track"><i style="width:${item.percent}%"></i><b style="left:calc(100% - 2px)"></b></div><small>${item.percent >= 100 ? 'Target reached' : `${item.target - item.value} remaining`}</small><button data-rhythm-weekly="${item.habit.id}" aria-label="Add ${item.habit.title}">+</button></div>`).join('')}</div></section>
      <section class="rhythm-surface"><div class="rhythm-section-head"><div><p class="section-kicker">SEVEN-DAY PULSE</p><h2>Consistency without perfection</h2></div></div><div class="rhythm-week-pulse">${week.days.map(day => `<button data-rhythm-date="${day.date}" class="${day.date === selectedDate ? 'is-selected' : ''}"><i style="height:${day.percent}%"></i><span>${getDateFromKey(day.date).toLocaleDateString(undefined,{weekday:'short'}).slice(0,1)}</span><b>${day.percent}</b></button>`).join('')}</div></section>
      <section class="rhythm-surface rhythm-insight"><p class="section-kicker">RECOVERY SIGNAL</p><h2>${streak.recovery <= 1 ? 'You are returning quickly.' : 'Protect the next return.'}</h2><p>Foundation days require ${rhythmStore().settings.foundationThreshold}% of essential actions. Optional spiritual practices never reduce this score.</p></section></aside></div>`;
  if (window.lucide) lucide.createIcons({ attrs: { width: 16, height: 16, 'stroke-width': 2 } });
}

function renderRhythmSettings() {
  const settings = rhythmStore().settings;
  return `<section class="rhythm-settings"><div><p class="section-kicker">RHYTHM SETTINGS</p><h2>One place for targets.</h2></div><label>Foundation threshold<input type="number" min="50" max="100" step="5" value="${settings.foundationThreshold}" data-rhythm-setting="foundationThreshold"><span>%</span></label><label>Water target<input type="number" min="1" max="6" step=".5" value="${settings.waterTarget}" data-rhythm-setting="waterTarget"><span>L</span></label><label>Exercise<input type="number" min="1" max="7" value="${settings.exerciseTarget}" data-rhythm-setting="exerciseTarget"><span>/week</span></label><label>Hair care<input type="number" min="1" max="7" value="${settings.hairTarget}" data-rhythm-setting="hairTarget"><span>/week</span></label><button class="secondary-button" data-rhythm-settings>Close</button></section>`;
}

document.addEventListener('click', event => {
  const target = event.target.closest('[data-rhythm-toggle],[data-rhythm-step],[data-rhythm-weekly],[data-rhythm-date],[data-rhythm-settings]');
  if (!target) return;
  if (target.dataset.rhythmToggle) {
    const id = target.dataset.rhythmToggle, date = target.dataset.date;
    rhythmSetValue(id, rhythmValue(id, date) ? 0 : 1, date);
  }
  if (target.dataset.rhythmStep) {
    const habit = rhythmHabit(target.dataset.rhythmStep), date = target.dataset.date;
    const step = habit.step || 1, next = rhythmValue(habit.id, date) + step;
    rhythmSetValue(habit.id, next > rhythmTarget(habit) ? 0 : next, date);
  }
  if (target.dataset.rhythmWeekly) rhythmSetValue(target.dataset.rhythmWeekly, rhythmValue(target.dataset.rhythmWeekly) + 1);
  if (target.dataset.rhythmDate) rhythmSelectedDate = target.dataset.rhythmDate;
  if (target.hasAttribute('data-rhythm-settings')) rhythmSettingsOpen = !rhythmSettingsOpen;
  renderRhythmView();
});

document.addEventListener('change', event => {
  if (!event.target.dataset.rhythmSetting) return;
  rhythmStore().settings[event.target.dataset.rhythmSetting] = Number(event.target.value);
  saveTasks();
  renderRhythmView();
});
