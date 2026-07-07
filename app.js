const FOUNDATION_STORAGE_KEY = "kryos-foundation-v1";
const CAREER_STORAGE_KEY = "kryos-career-v1";
const TASKS_STORAGE_KEY = "kryos-tasks-v1";
const JOURNAL_STORAGE_KEY = "kryos-journal-v1";
const SECURITY_STORAGE_KEY = "kryos-security-v1";
const SECURITY_SESSION_KEY = "kryos-security-session-v1";
const UI_STATE_STORAGE_KEY = "kryos-ui-state-v1";
const SYNC_STATE_STORAGE_KEY = "kryos-sync-state-v1";
const ACCOUNT_MODE_STORAGE_KEY = "kryos-account-mode-v1";
const ACCOUNT_MODES = ["personal", "demo"];
const DEMO_STORAGE_PREFIX = "kryos-demo";
const DEMO_PROFILE_PIN = "9619";
const SUPABASE_URL = "https://ogpkaxprhjhrewoxsyla.supabase.co";
const SUPABASE_ANON_KEY = "sb_publishable_vOdwQ361h33NsqnVZWRJXg_AJyNUhUk";
const KRYOS_SYNC_SCHEMA_VERSION = 1;
const KRYOS_BACKUP_VERSION = 3;
const APP_VERSION = "0.003.001";
const APP_STAGE = "Manual Supabase Sync";
const APP_RELEASE_DATE = "2026-07-06";
const APP_STATUS = "Manual Supabase sync is wired for laptop and phone continuity";
const APP_NEXT_MILESTONE = "0.003.002 Sync QA";
const SECURITY_ACTIVITY_WRITE_INTERVAL = 15000;
const APP_RELEASE_NOTES = [
  "Supabase project configuration is now wired into KRYOS.",
  "Settings can sign in with email and password, push this device to cloud, and pull cloud data back.",
  "Personal and Demo are stored as separate cloud profiles.",
  "Manual push/pull keeps the first sync version simple.",
  "Use export backup before the first Personal cloud push.",
];
const DATA_STORAGE_KEYS = [
  FOUNDATION_STORAGE_KEY,
  CAREER_STORAGE_KEY,
  TASKS_STORAGE_KEY,
  JOURNAL_STORAGE_KEY,
  SECURITY_STORAGE_KEY,
  SYNC_STATE_STORAGE_KEY,
];
const SYNC_SAFE_BLOCKS = [
  FOUNDATION_STORAGE_KEY,
  CAREER_STORAGE_KEY,
  TASKS_STORAGE_KEY,
  JOURNAL_STORAGE_KEY,
  SECURITY_STORAGE_KEY,
  UI_STATE_STORAGE_KEY,
];
const SYNC_EXCLUDED_BLOCKS = [
  SECURITY_SESSION_KEY,
  SYNC_STATE_STORAGE_KEY,
];
const SYNC_BLOCKS = [
  { key: "foundation", storageKey: FOUNDATION_STORAGE_KEY },
  { key: "career", storageKey: CAREER_STORAGE_KEY },
  { key: "tasks", storageKey: TASKS_STORAGE_KEY },
  { key: "journal", storageKey: JOURNAL_STORAGE_KEY },
  { key: "security", storageKey: SECURITY_STORAGE_KEY },
  { key: "ui_state", payloadKey: "uiState", storageKey: UI_STATE_STORAGE_KEY },
];

const TASK_DOMAINS = [
  "Body",
  "Food/Supplements",
  "Mind",
  "Spirit",
  "Environment",
  "Discipline",
  "Career",
  "General",
];
const TASK_TYPES = ["Task", "Checklist", "Goal", "Routine", "Habit"];
const TASK_PRIORITIES = ["Low", "Medium", "High", "Critical"];
const TASK_REPEATS = ["none", "daily", "weekdays", "weekly", "selected"];
const TASK_VIEWS = ["today", "inbox", "upcoming"];
const APP_PAGES = ["foundation", "career", "today", "habits", "journal", "progress", "settings"];
const FIELD_TABS = ["today", "add", "habits", "pulse"];
const HABIT_RANGES = [14, 30, 60, 90];
const HABIT_PERIODS = ["day", "week", "month"];
const HABIT_DIRECTIONS = ["at-least", "at-most"];
const HABIT_DRIFT_REASONS = [
  "Low energy",
  "Sleep debt",
  "Food issue",
  "Distraction",
  "Fear/avoidance",
  "Mood drop",
  "Time block failed",
  "External block",
  "Forgot",
  "Wrong target",
];
const MIND_CATEGORIES = ["Fear", "Desire", "Guilt", "Anger", "Distraction", "Idea", "Prayer", "Work Thought"];
const MIND_DECISIONS = ["Unsorted", "Release", "Pray", "Schedule", "Convert to Task", "Save for Later", "Ignore"];
const DISTORTIONS = [
  "None",
  "All-or-nothing",
  "Catastrophizing",
  "Mind reading",
  "Overgeneralizing",
  "Should statement",
  "Emotional reasoning",
  "Avoidance story",
];
const STATE_METRICS = [
  ["mood", "Mood"],
  ["energy", "Energy"],
  ["focus", "Focus"],
  ["agitation", "Agitation"],
  ["clarity", "Clarity"],
  ["bodyTension", "Body tension"],
  ["spiritualSteadiness", "Spiritual steadiness"],
];
const AUTO_LOCK_OPTIONS = [1, 5, 10, 15, 30, 60];

const defaultSecurity = {
  configured: false,
  passHash: "",
  recovery: [
    { question: "", answerHash: "" },
    { question: "", answerHash: "" },
  ],
  settings: {
    autoLockMinutes: 10,
    privacyMode: false,
    requireOnStartup: true,
  },
  updatedAt: new Date().toISOString(),
};

const createId = () =>
  `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

const defaultFoundation = {
  declaration: {
    reason:
      "I started this because I am done living below my own standard.",
    season: "Building inner order, discipline, and spiritual steadiness.",
    becoming: "A man who keeps his word when the mind changes weather.",
    refusing: "A person who starts with intensity and disappears after drift.",
  },
  why: {
    pain:
      "I have seen what happens when emotion, distraction, and delay decide the day before I do.",
    vision:
      "I am building a life where my inner state, actions, and spiritual standards move in the same direction.",
    cost:
      "If I stay the same, my talent remains scattered and my days keep leaking into regret.",
    reward:
      "If I stay consistent, I become stable, capable, clean in conscience, and ready for the work life gives me.",
  },
  vows: [
    {
      id: createId(),
      title: "I return after failure.",
      meaning: "One mistake does not get permission to own the whole day.",
      pinned: true,
      active: true,
    },
    {
      id: createId(),
      title: "I keep the first promise small enough to obey.",
      meaning: "Minimum action protects momentum when the mind resists.",
      pinned: true,
      active: true,
    },
    {
      id: createId(),
      title: "I choose truth before comfort.",
      meaning: "Honest tracking is more valuable than a pretty self-image.",
      pinned: false,
      active: true,
    },
  ],
  doPrinciples: [
    {
      id: createId(),
      title: "Protect the morning.",
      reason: "The first attention of the day decides the direction of the mind.",
      category: "Mind",
      minimum: "Read the Foundation and sit quietly for 3 minutes.",
      full: "Read, meditate, clean the body, and begin the first task.",
      frequency: "Daily",
      pinned: true,
      active: true,
    },
    {
      id: createId(),
      title: "Create visible evidence.",
      reason: "Inner alignment must become action, output, or practice.",
      category: "Work",
      minimum: "Finish one small useful action.",
      full: "Complete one deep work block.",
      frequency: "Daily",
      pinned: true,
      active: true,
    },
    {
      id: createId(),
      title: "Close the day with truth.",
      reason: "Reflection turns scattered days into learning.",
      category: "Spirit",
      minimum: "Write three honest lines.",
      full: "Review do, don't, drift, return, and tomorrow's correction.",
      frequency: "Daily",
      pinned: false,
      active: true,
    },
  ],
  dontPrinciples: [
    {
      id: createId(),
      title: "Do not give the morning to the phone.",
      harm: "It lets outside noise choose the first shape of the mind.",
      replacement: "Wash face, read Foundation, sit, then start the first action.",
      severity: "Critical",
      pinned: true,
      active: true,
    },
    {
      id: createId(),
      title: "Do not make one failure into a ruined day.",
      harm: "Drama creates more damage than the original mistake.",
      replacement: "Start the Return Protocol immediately.",
      severity: "Critical",
      pinned: true,
      active: true,
    },
    {
      id: createId(),
      title: "Do not hide inside planning.",
      harm: "Planning without action becomes avoidance with better language.",
      replacement: "Do the smallest concrete task now.",
      severity: "Serious",
      pinned: false,
      active: true,
    },
  ],
  strengths: [
    {
      id: createId(),
      name: "Deep reflection",
      use: "Turn emotional data into written clarity.",
      environment: "Quiet room, low noise, no phone in the first hour.",
      proof: "You can understand patterns when you stop running from them.",
    },
    {
      id: createId(),
      name: "Analytical mind",
      use: "Break vague goals into rules, checklists, and daily evidence.",
      environment: "Clear dashboard, few decisions, exact next action.",
      proof: "Tracking and structured thinking make discipline visible.",
    },
    {
      id: createId(),
      name: "Devotion when meaning is clear",
      use: "Connect every rule to a real why.",
      environment: "A system that starts from purpose, not pressure.",
      proof: "You stay stronger when the action has spiritual weight.",
    },
  ],
  weaknesses: [
    {
      id: createId(),
      name: "Emotional drift",
      showsAs: "The day loses direction when mood changes.",
      warning: "Delaying the first meaningful action.",
      countermeasure: "Read Foundation, name the feeling, do the minimum version.",
    },
    {
      id: createId(),
      name: "Overthinking",
      showsAs: "Research and planning replace execution.",
      warning: "Opening more tabs before completing one action.",
      countermeasure: "Set a 25-minute block and produce visible evidence.",
    },
    {
      id: createId(),
      name: "Digital distraction",
      showsAs: "Attention gets pulled before intention is chosen.",
      warning: "Phone before Foundation.",
      countermeasure: "Phone away until the first protocol is complete.",
    },
  ],
  returnProtocol: [
    { id: createId(), text: "Stop dramatizing." },
    { id: createId(), text: "Tell the truth about what happened." },
    { id: createId(), text: "Write the trigger in one sentence." },
    { id: createId(), text: "Do one cleansing action." },
    { id: createId(), text: "Do one minimum useful action." },
    { id: createId(), text: "Continue the day from here." },
  ],
  meta: {
    lastReviewedAt: null,
    updatedAt: new Date().toISOString(),
  },
};

const defaultCareer = {
  roadmaps: [
    {
      id: createId(),
      title: "DSA Roadmap",
      purpose: "Build problem-solving strength through structured patterns.",
      targetDate: "",
      modules: [
        {
          id: createId(),
          title: "Arrays and patterns",
          topics: [
            {
              id: createId(),
              title: "Sliding window",
              confidence: "Low",
              checklist: [
                { id: createId(), text: "Understand fixed vs variable window", done: false },
                { id: createId(), text: "Solve 5 easy problems", done: false },
                { id: createId(), text: "Solve 5 medium problems", done: false },
                { id: createId(), text: "Write mistake notes", done: false },
              ],
            },
            {
              id: createId(),
              title: "Two pointers",
              confidence: "Low",
              checklist: [
                { id: createId(), text: "Understand opposite-direction pointers", done: false },
                { id: createId(), text: "Understand same-direction pointers", done: false },
                { id: createId(), text: "Solve 10 practice problems", done: false },
              ],
            },
          ],
        },
        {
          id: createId(),
          title: "Core data structures",
          topics: [
            {
              id: createId(),
              title: "Stacks and queues",
              confidence: "Low",
              checklist: [
                { id: createId(), text: "Implement stack and queue from scratch", done: false },
                { id: createId(), text: "Study monotonic stack", done: false },
                { id: createId(), text: "Solve 5 stack problems", done: false },
              ],
            },
          ],
        },
      ],
    },
    {
      id: createId(),
      title: "System Design Roadmap",
      purpose: "Build clear architecture thinking for interviews and real systems.",
      targetDate: "",
      modules: [
        {
          id: createId(),
          title: "Fundamentals",
          topics: [
            {
              id: createId(),
              title: "Scalability basics",
              confidence: "Low",
              checklist: [
                { id: createId(), text: "Define vertical vs horizontal scaling", done: false },
                { id: createId(), text: "Write one-page notes", done: false },
                { id: createId(), text: "Explain it without notes", done: false },
              ],
            },
            {
              id: createId(),
              title: "Load balancing",
              confidence: "Low",
              checklist: [
                { id: createId(), text: "Compare L4 and L7 load balancing", done: false },
                { id: createId(), text: "Draw request flow", done: false },
                { id: createId(), text: "Write interview answer", done: false },
              ],
            },
          ],
        },
      ],
    },
  ],
  activityLog: [],
  meta: {
    updatedAt: new Date().toISOString(),
  },
};

const defaultTasks = {
  tasks: [
    {
      id: createId(),
      title: "Protect the morning routine",
      domain: "Mind",
      type: "Routine",
      priority: "High",
      status: "active",
      scheduledDate: "",
      repeat: "daily",
      repeatDays: [],
      carryForward: true,
      carriedTo: "",
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      notes: "Foundation, quiet mind, first useful action.",
      checklist: [
        { id: createId(), text: "Read Foundation", done: false },
        { id: createId(), text: "Sit quietly for 3 minutes", done: false },
        { id: createId(), text: "Start one meaningful action", done: false },
      ],
      records: {},
    },
    {
      id: createId(),
      title: "Career deep work block",
      domain: "Career",
      type: "Task",
      priority: "Critical",
      status: "active",
      scheduledDate: "",
      repeat: "weekdays",
      repeatDays: [],
      carryForward: true,
      carriedTo: "",
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      notes: "One focused block that produces visible evidence.",
      checklist: [],
      records: {},
    },
    {
      id: createId(),
      title: "Workout or body maintenance",
      domain: "Body",
      type: "Routine",
      priority: "Medium",
      status: "active",
      scheduledDate: "",
      repeat: "selected",
      repeatDays: [1, 3, 5],
      carryForward: true,
      carriedTo: "",
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      notes: "Keep the body from becoming the reason the mind drifts.",
      checklist: [],
      records: {},
    },
    {
      id: createId(),
      title: "Food and supplements check",
      domain: "Food/Supplements",
      type: "Checklist",
      priority: "Medium",
      status: "active",
      scheduledDate: "",
      repeat: "daily",
      repeatDays: [],
      carryForward: false,
      carriedTo: "",
      createdAt: new Date().toISOString(),
      startedAt: null,
      completedAt: null,
      notes: "Simple nutrition compliance, not perfection.",
      checklist: [
        { id: createId(), text: "Protein target", done: false },
        { id: createId(), text: "Hydration", done: false },
      ],
      records: {},
    },
  ],
  meta: {
    updatedAt: new Date().toISOString(),
  },
};

const defaultJournal = {
  entries: {},
  meta: {
    updatedAt: new Date().toISOString(),
  },
};

let accountMode = loadAccountMode();
ensureDemoData();
let state = loadFoundation();
let careerState = loadCareer();
let taskState = loadTasks();
let journalState = loadJournal();
let securityState = loadSecurity();
let syncState = loadSyncState();
const savedUiState = loadUiState();
let mode = savedUiState.mode === "edit" ? "edit" : "read";
let currentPage = APP_PAGES.includes(savedUiState.currentPage) ? savedUiState.currentPage : "foundation";
let activeEditSection = savedUiState.activeEditSection || "declaration";
let returnProtocolOpen = false;
let returnChecks = {};
let selectedRoadmapId = careerState.roadmaps.some((roadmap) => roadmap.id === savedUiState.selectedRoadmapId)
  ? savedUiState.selectedRoadmapId
  : careerState.roadmaps[0]?.id ?? null;
let editingCareerRoadmapId = null;
let selectedTaskDate = isDateKey(savedUiState.selectedTaskDate) ? savedUiState.selectedTaskDate : toDateKey();
let activeTaskView = TASK_VIEWS.includes(savedUiState.activeTaskView) ? savedUiState.activeTaskView : "today";
let activeFieldTab = FIELD_TABS.includes(savedUiState.activeFieldTab) ? savedUiState.activeFieldTab : "today";
let selectedHabitId = savedUiState.selectedHabitId || null;
let activeHabitRange = HABIT_RANGES.includes(Number(savedUiState.activeHabitRange)) ? Number(savedUiState.activeHabitRange) : 30;
let selectedJournalDate = isDateKey(savedUiState.selectedJournalDate) ? savedUiState.selectedJournalDate : toDateKey();
let isSecurityUnlocked = !securityState.configured || hasActiveSecuritySession();
let lockTimer = null;
let lastSecurityActivityWrite = 0;
let securityNotice = "";
let syncNotice = "";
let recoveryMode = false;

const readView = document.querySelector("#read-view");
const editView = document.querySelector("#edit-view");
const careerView = document.querySelector("#career-view");
const todayView = document.querySelector("#today-view");
const habitsView = document.querySelector("#habits-view");
const journalView = document.querySelector("#journal-view");
const progressView = document.querySelector("#progress-view");
const settingsView = document.querySelector("#settings-view");
const fieldView = document.querySelector("#field-view");
const securityOverlay = document.querySelector("#security-overlay");
const modeButtons = document.querySelectorAll(".mode-button");
const pageButtons = document.querySelectorAll("[data-page]");
const fieldButtons = document.querySelectorAll("[data-field-tab]");
const modeSwitch = document.querySelector(".mode-switch");
const topbarEyebrow = document.querySelector(".topbar .eyebrow");
const topbarTitle = document.querySelector(".topbar h1");
const activeProfileBadge = document.querySelector("[data-profile-badge]");
const appShell = document.querySelector(".app-shell");
const mobileNav = document.querySelector(".mobile-nav");

function loadAccountMode() {
  try {
    const saved = localStorage.getItem(ACCOUNT_MODE_STORAGE_KEY);
    return ACCOUNT_MODES.includes(saved) ? saved : "personal";
  } catch {
    return "personal";
  }
}

function getModeStorageKey(key, modeName = accountMode) {
  if (modeName === "personal") return key;
  return `${DEMO_STORAGE_PREFIX}-${key.replace(/^kryos-/, "")}`;
}

function getModeLabel(modeName = accountMode) {
  return modeName === "demo" ? "Demo" : "Personal";
}

function isDemoMode() {
  return accountMode === "demo";
}

function getModeStorageValue(key, modeName = accountMode) {
  return localStorage.getItem(getModeStorageKey(key, modeName));
}

function setModeStorageValue(key, value, modeName = accountMode) {
  localStorage.setItem(getModeStorageKey(key, modeName), value);
}

function removeModeStorageValue(key, modeName = accountMode) {
  localStorage.removeItem(getModeStorageKey(key, modeName));
}

function clearModeData(modeName = accountMode) {
  [...DATA_STORAGE_KEYS, UI_STATE_STORAGE_KEY, SECURITY_SESSION_KEY].forEach((key) => {
    removeModeStorageValue(key, modeName);
  });
}

function saveAccountMode(nextMode) {
  if (!ACCOUNT_MODES.includes(nextMode)) return;
  accountMode = nextMode;
  localStorage.setItem(ACCOUNT_MODE_STORAGE_KEY, accountMode);
}

function ensureDemoData(force = false) {
  const seeds = {
    [FOUNDATION_STORAGE_KEY]: createDemoFoundation(),
    [CAREER_STORAGE_KEY]: createDemoCareer(),
    [TASKS_STORAGE_KEY]: createDemoTasks(),
    [JOURNAL_STORAGE_KEY]: createDemoJournal(),
    [SECURITY_STORAGE_KEY]: createDemoSecurity(),
    [UI_STATE_STORAGE_KEY]: createDemoUiState(),
  };

  if (force) {
    clearModeData("demo");
  }

  Object.entries(seeds).forEach(([key, value]) => {
    if (!force && getModeStorageValue(key, "demo")) return;
    setModeStorageValue(key, JSON.stringify(value), "demo");
  });
  ensureDemoSecurity();
}

function ensureDemoSecurity() {
  const current = readStoredSecurityForMode("demo");
  if (current?.profile === "demo" && current.configured) return;
  const demoSecurity = createDemoSecurity();
  if (current && typeof current === "object") {
    demoSecurity.settings = { ...demoSecurity.settings, ...current.settings, requireOnStartup: true };
  }
  setModeStorageValue(SECURITY_STORAGE_KEY, JSON.stringify(demoSecurity), "demo");
}

function readStoredSecurityForMode(modeName) {
  try {
    const saved = getModeStorageValue(SECURITY_STORAGE_KEY, modeName);
    return saved ? JSON.parse(saved) : null;
  } catch {
    return null;
  }
}

function demoIso(dayOffset = 0, hour = 9, minute = 0) {
  const date = addDays(new Date(), dayOffset);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

function createDemoFoundation() {
  const foundation = structuredClone(defaultFoundation);
  foundation.declaration = {
    reason: "Demo KRYOS exists to show a private operating system without exposing personal data.",
    season: "Building disciplined input, honest review, and visible progress.",
    becoming: "A focused builder who converts intention into daily proof.",
    refusing: "A scattered loop where tasks, habits, and reflection live in separate places.",
  };
  foundation.why = {
    pain: "Important work gets delayed when the mind has no clean capture and review system.",
    vision: "One private system that keeps body, mind, career, and reflection aligned without noise.",
    cost: "Without structure, progress becomes hard to trust and motivation becomes emotional.",
    reward: "With structure, the user can see consistency, correct drift, and keep building.",
  };
  foundation.vows = [
    {
      id: "demo-vow-return",
      title: "I return before the day escapes.",
      meaning: "A missed block becomes a correction, not a collapse.",
      pinned: true,
      active: true,
    },
    {
      id: "demo-vow-evidence",
      title: "I make progress visible.",
      meaning: "The system should show proof, not just store intentions.",
      pinned: true,
      active: true,
    },
    {
      id: "demo-vow-truth",
      title: "I prefer truthful records over beautiful excuses.",
      meaning: "Accurate data makes the next day easier to design.",
      pinned: false,
      active: true,
    },
  ];
  foundation.doPrinciples = [
    {
      id: "demo-do-capture",
      title: "Capture quickly.",
      reason: "The mind should not carry open loops while moving through the day.",
      category: "Mind",
      minimum: "Add the next task to Today or Inbox.",
      full: "Add task, domain, date, and first checklist step.",
      frequency: "Daily",
      pinned: true,
      active: true,
    },
    {
      id: "demo-do-career",
      title: "Ship one career proof.",
      reason: "Career confidence grows from visible work completed repeatedly.",
      category: "Career",
      minimum: "Finish one roadmap check.",
      full: "Complete a deep work block and log the roadmap result.",
      frequency: "Weekdays",
      pinned: true,
      active: true,
    },
    {
      id: "demo-do-close",
      title: "Close with signal.",
      reason: "A short shutdown turns the day into learning.",
      category: "Journal",
      minimum: "Log mood, focus, and one correction.",
      full: "Seal the day with truth filter and tomorrow top three.",
      frequency: "Daily",
      pinned: false,
      active: true,
    },
  ];
  foundation.dontPrinciples = [
    {
      id: "demo-dont-random",
      title: "Do not let quick add become random dumping.",
      harm: "Unsorted tasks destroy trust in the system.",
      replacement: "Choose Today, Pick date, or Inbox immediately.",
      severity: "Critical",
      pinned: true,
      active: true,
    },
    {
      id: "demo-dont-chart",
      title: "Do not chase charts without behavior change.",
      harm: "Analytics should guide correction, not become decoration.",
      replacement: "Use one insight to adjust tomorrow.",
      severity: "Serious",
      pinned: false,
      active: true,
    },
  ];
  foundation.meta.updatedAt = new Date().toISOString();
  return foundation;
}

function createDemoCareer() {
  const today = toDateKey();
  const yesterday = toDateKey(addDays(new Date(), -1));
  const twoDaysAgo = toDateKey(addDays(new Date(), -2));
  const dsaBasics = "demo-dsa-basics";
  const dsaPatterns = "demo-dsa-patterns";
  const sysFundamentals = "demo-sys-fundamentals";
  const productSystem = "demo-product-system";
  const checks = {
    arrays: "demo-check-arrays",
    sliding: "demo-check-sliding",
    pointers: "demo-check-pointers",
    caching: "demo-check-caching",
    load: "demo-check-load",
    backup: "demo-check-backup",
  };

  return {
    roadmaps: [
      {
        id: "demo-roadmap-dsa",
        title: "DSA Interview Roadmap",
        purpose: "Turn practice into trackable pattern confidence.",
        targetDate: "",
        modules: [
          {
            id: dsaBasics,
            title: "Foundation patterns",
            topics: [
              {
                id: "demo-topic-arrays",
                title: "Arrays and hash maps",
                confidence: "Medium",
                checklist: [
                  { id: checks.arrays, text: "Summarize core patterns", done: true },
                  { id: "demo-check-hashmap", text: "Solve 10 hashmap problems", done: true },
                  { id: "demo-check-mistakes", text: "Write mistake notes", done: false },
                ],
              },
              {
                id: "demo-topic-sliding",
                title: "Sliding window",
                confidence: "Medium",
                checklist: [
                  { id: checks.sliding, text: "Explain fixed vs variable window", done: true },
                  { id: "demo-check-window-medium", text: "Solve 5 medium problems", done: false },
                  { id: "demo-check-window-review", text: "Review wrong attempts", done: false },
                ],
              },
            ],
          },
          {
            id: dsaPatterns,
            title: "Movement patterns",
            topics: [
              {
                id: "demo-topic-pointers",
                title: "Two pointers",
                confidence: "Low",
                checklist: [
                  { id: checks.pointers, text: "Draw same-direction pointer flow", done: false },
                  { id: "demo-check-two-pointer", text: "Solve 8 practice problems", done: false },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "demo-roadmap-system",
        title: "System Design Roadmap",
        purpose: "Build architecture explanations that are clear enough for interviews.",
        targetDate: "",
        modules: [
          {
            id: sysFundamentals,
            title: "Core architecture",
            topics: [
              {
                id: "demo-topic-caching",
                title: "Caching strategy",
                confidence: "Medium",
                checklist: [
                  { id: checks.caching, text: "Compare cache-aside and write-through", done: true },
                  { id: "demo-check-cache-diagram", text: "Draw cache invalidation flow", done: false },
                ],
              },
              {
                id: "demo-topic-load",
                title: "Load balancing",
                confidence: "Low",
                checklist: [
                  { id: checks.load, text: "Explain L4 vs L7 tradeoffs", done: false },
                  { id: "demo-check-load-answer", text: "Write interview answer", done: false },
                ],
              },
            ],
          },
        ],
      },
      {
        id: "demo-roadmap-kryos",
        title: "KRYOS Product Roadmap",
        purpose: "Show how the product is being stabilized like a real private operating system.",
        targetDate: "",
        modules: [
          {
            id: productSystem,
            title: "Trust foundation",
            topics: [
              {
                id: "demo-topic-backup",
                title: "Backup and demo safety",
                confidence: "High",
                checklist: [
                  { id: checks.backup, text: "Separate personal and demo data", done: true },
                  { id: "demo-check-docs", text: "Update release documentation", done: true },
                  { id: "demo-check-sync-plan", text: "Prepare free sync plan", done: false },
                ],
              },
            ],
          },
        ],
      },
    ],
    activityLog: [
      {
        id: "demo-career-log-1",
        date: twoDaysAgo,
        roadmapId: "demo-roadmap-dsa",
        moduleId: dsaBasics,
        topicId: "demo-topic-arrays",
        topicTitle: "Arrays and hash maps",
        checkId: checks.arrays,
        checkText: "Summarize core patterns",
      },
      {
        id: "demo-career-log-2",
        date: yesterday,
        roadmapId: "demo-roadmap-system",
        moduleId: sysFundamentals,
        topicId: "demo-topic-caching",
        topicTitle: "Caching strategy",
        checkId: checks.caching,
        checkText: "Compare cache-aside and write-through",
      },
      {
        id: "demo-career-log-3",
        date: today,
        roadmapId: "demo-roadmap-kryos",
        moduleId: productSystem,
        topicId: "demo-topic-backup",
        topicTitle: "Backup and demo safety",
        checkId: checks.backup,
        checkText: "Separate personal and demo data",
      },
    ],
    meta: {
      updatedAt: new Date().toISOString(),
    },
  };
}

function createDemoTasks() {
  const today = toDateKey();
  const yesterday = toDateKey(addDays(new Date(), -1));
  const twoDaysAgo = toDateKey(addDays(new Date(), -2));
  const tomorrow = toDateKey(addDays(new Date(), 1));

  const doneRecord = (dayOffset, minutes = 45, checklist = {}) => ({
    status: "done",
    startedAt: demoIso(dayOffset, 9, 0),
    completedAt: demoIso(dayOffset, 9, minutes),
    checklist,
    value: null,
    driftReason: "",
  });

  const activeRecord = () => ({
    status: "active",
    startedAt: null,
    completedAt: null,
    checklist: {},
    value: null,
    driftReason: "",
  });

  const tasks = [
    {
      id: "demo-task-career-block",
      title: "Career deep work block",
      domain: "Career",
      type: "Task",
      priority: "Critical",
      status: "active",
      scheduledDate: "",
      repeat: "weekdays",
      repeatDays: [],
      carryForward: true,
      notes: "One visible proof from DSA, system design, or KRYOS architecture.",
      checklist: [
        { id: "demo-career-check-1", text: "Pick one roadmap item", done: false },
        { id: "demo-career-check-2", text: "Work for one focused block", done: false },
        { id: "demo-career-check-3", text: "Write result note", done: false },
      ],
      records: {
        [twoDaysAgo]: doneRecord(-2, 55, {
          "demo-career-check-1": true,
          "demo-career-check-2": true,
          "demo-career-check-3": true,
        }),
        [yesterday]: doneRecord(-1, 50, {
          "demo-career-check-1": true,
          "demo-career-check-2": true,
          "demo-career-check-3": true,
        }),
        [today]: activeRecord(),
      },
    },
    {
      id: "demo-task-morning",
      title: "Morning alignment",
      domain: "Mind",
      type: "Routine",
      priority: "High",
      status: "active",
      scheduledDate: "",
      repeat: "daily",
      repeatDays: [],
      carryForward: true,
      notes: "Read Foundation, settle attention, choose first action.",
      checklist: [
        { id: "demo-morning-check-1", text: "Read Foundation", done: false },
        { id: "demo-morning-check-2", text: "Three-minute stillness", done: false },
        { id: "demo-morning-check-3", text: "Write first action", done: false },
      ],
      records: {
        [twoDaysAgo]: doneRecord(-2, 12),
        [yesterday]: doneRecord(-1, 10),
      },
    },
    {
      id: "demo-task-body",
      title: "Workout or body maintenance",
      domain: "Body",
      type: "Routine",
      priority: "Medium",
      status: "active",
      scheduledDate: "",
      repeat: "selected",
      repeatDays: [1, 3, 5],
      carryForward: true,
      notes: "Simple body signal: move, recover, keep energy stable.",
      checklist: [],
      records: {
        [yesterday]: {
          ...doneRecord(-1, 35),
          value: 35,
        },
      },
      habitMetric: {
        target: 30,
        unit: "minutes",
        period: "day",
        direction: "at-least",
      },
    },
    {
      id: "demo-task-food",
      title: "Food and supplements check",
      domain: "Food/Supplements",
      type: "Checklist",
      priority: "Medium",
      status: "active",
      scheduledDate: "",
      repeat: "daily",
      repeatDays: [],
      carryForward: false,
      notes: "Compliance, not perfection.",
      checklist: [
        { id: "demo-food-check-1", text: "Protein target", done: false },
        { id: "demo-food-check-2", text: "Hydration", done: false },
        { id: "demo-food-check-3", text: "Supplements", done: false },
      ],
      records: {
        [twoDaysAgo]: doneRecord(-2, 5),
        [yesterday]: {
          status: "partial",
          startedAt: demoIso(-1, 20, 0),
          completedAt: null,
          checklist: {
            "demo-food-check-1": true,
            "demo-food-check-2": true,
            "demo-food-check-3": false,
          },
          value: null,
          driftReason: "External block",
        },
      },
    },
    {
      id: "demo-task-tomorrow",
      title: "Prepare demo walkthrough notes",
      domain: "Career",
      type: "Task",
      priority: "High",
      status: "active",
      scheduledDate: tomorrow,
      repeat: "none",
      repeatDays: [],
      carryForward: true,
      notes: "Show KRYOS without personal data.",
      checklist: [
        { id: "demo-walk-check-1", text: "Open Demo Mode", done: false },
        { id: "demo-walk-check-2", text: "Show release version", done: false },
        { id: "demo-walk-check-3", text: "Export demo backup", done: false },
      ],
      records: {},
    },
  ];

  return {
    tasks: tasks.map(normalizeTask),
    meta: {
      updatedAt: new Date().toISOString(),
    },
  };
}

function createDemoJournal() {
  const today = toDateKey();
  const yesterday = toDateKey(addDays(new Date(), -1));
  const twoDaysAgo = toDateKey(addDays(new Date(), -2));

  const makeEntry = (dateKey, overrides) => {
    const entry = createJournalEntry(dateKey);
    return {
      ...entry,
      ...overrides,
      date: dateKey,
      state: { ...entry.state, ...overrides.state },
      truthFilter: { ...entry.truthFilter, ...overrides.truthFilter },
      shutdown: { ...entry.shutdown, ...overrides.shutdown },
      updatedAt: new Date().toISOString(),
    };
  };

  return {
    entries: {
      [twoDaysAgo]: makeEntry(twoDaysAgo, {
        arriveDone: true,
        state: { mood: 6, energy: 6, focus: 7, agitation: 3, clarity: 7, bodyTension: 4, spiritualSteadiness: 6 },
        mindDump: [
          {
            id: "demo-mind-1",
            category: "Work Thought",
            text: "Need a cleaner separation between personal use and demo showcase.",
            decision: "Convert to Task",
            intensity: 6,
            createdAt: demoIso(-2, 21, 0),
          },
        ],
        truthFilter: {
          trigger: "Too many feature ideas at once.",
          thought: "The product is getting too complex.",
          distortion: "All-or-nothing",
          truth: "Complexity is controlled by sequencing and ownership rules.",
          nextAction: "Stabilize storage before adding sync.",
        },
        shutdown: {
          bestAction: "Finished roadmap checks and captured demo risk.",
          driftReason: "None",
          lesson: "Product clarity improves when each page owns one job.",
          correction: "Keep demo and personal data separate.",
          tomorrowProtect: "Open Settings first and verify active space.",
          prayer: "Let the work stay useful and honest.",
        },
        tomorrowTop3: ["Career block", "Food check", "Demo storage plan"],
        patternTags: ["Product", "Discipline"],
        sealedAt: demoIso(-2, 22, 0),
      }),
      [yesterday]: makeEntry(yesterday, {
        arriveDone: true,
        state: { mood: 7, energy: 6, focus: 8, agitation: 2, clarity: 8, bodyTension: 3, spiritualSteadiness: 7 },
        mindDump: [],
        truthFilter: {
          trigger: "Wanted to add cloud sync immediately.",
          thought: "Without sync the app is not real.",
          distortion: "Should statement",
          truth: "A real app first preserves data correctly locally.",
          nextAction: "Finish mode separation, then plan free sync.",
        },
        shutdown: {
          bestAction: "Completed caching notes and product documentation.",
          driftReason: "Distraction",
          lesson: "The roadmap works when it is reviewed before deep work.",
          correction: "Start from Career page tomorrow.",
          tomorrowProtect: "Do one roadmap item before adding new ideas.",
          prayer: "Protect attention from noise.",
        },
        tomorrowTop3: ["Personal/Demo switch", "Backup test", "Mobile quick add"],
        patternTags: ["Career", "Focus"],
        sealedAt: demoIso(-1, 22, 10),
      }),
      [today]: makeEntry(today, {
        arriveDone: false,
        state: { mood: 6, energy: 5, focus: 6, agitation: 4, clarity: 6, bodyTension: 4, spiritualSteadiness: 6 },
        mindDump: [
          {
            id: "demo-mind-2",
            category: "Idea",
            text: "Use Demo Mode as a safe interview walkthrough account.",
            decision: "Save for Later",
            intensity: 5,
            createdAt: demoIso(0, 8, 30),
          },
        ],
        tomorrowTop3: ["Verify Demo Mode", "Export active backup", "Write sync blueprint"],
        patternTags: ["Demo", "Product"],
      }),
    },
    meta: {
      updatedAt: new Date().toISOString(),
    },
  };
}

function createDemoSecurity() {
  return {
    ...structuredClone(defaultSecurity),
    configured: true,
    profile: "demo",
    passHash: "fixed-demo-profile-pin",
    recovery: [
      { question: "Demo profile", answerHash: "" },
      { question: "Demo profile", answerHash: "" },
    ],
    settings: {
      ...defaultSecurity.settings,
      autoLockMinutes: 10,
      privacyMode: false,
      requireOnStartup: true,
    },
    updatedAt: new Date().toISOString(),
  };
}

function createDemoUiState() {
  return {
    currentPage: "career",
    mode: "read",
    activeEditSection: "declaration",
    selectedRoadmapId: "demo-roadmap-kryos",
    selectedTaskDate: toDateKey(),
    activeTaskView: "today",
    activeFieldTab: "today",
    selectedHabitId: "demo-task-body",
    activeHabitRange: 30,
    selectedJournalDate: toDateKey(),
    updatedAt: new Date().toISOString(),
  };
}

function createDefaultSyncState(overrides = {}) {
  const now = new Date().toISOString();
  return {
    provider: "supabase",
    enabled: false,
    status: "not-configured",
    lastSyncAt: null,
    lastAttemptAt: null,
    lastReadinessAt: null,
    conflictCount: 0,
    remoteProfileId: "",
    endpointConfigured: false,
    userEmail: "",
    userId: "",
    authCheckedAt: null,
    demoFirstRequired: true,
    updatedAt: now,
    ...overrides,
  };
}

function normalizeSyncState(saved = {}) {
  const base = createDefaultSyncState();
  const status = ["not-configured", "demo-ready", "personal-blocked", "blocked"].includes(saved.status)
    ? saved.status
    : base.status;
  return {
    ...base,
    ...saved,
    provider: saved.provider || base.provider,
    enabled: Boolean(saved.enabled),
    status,
    lastSyncAt: saved.lastSyncAt || null,
    lastAttemptAt: saved.lastAttemptAt || null,
    lastReadinessAt: saved.lastReadinessAt || null,
    conflictCount: Number.isFinite(Number(saved.conflictCount)) ? Number(saved.conflictCount) : 0,
    remoteProfileId: saved.remoteProfileId || "",
    endpointConfigured: Boolean(saved.endpointConfigured),
    userEmail: saved.userEmail || "",
    userId: saved.userId || "",
    authCheckedAt: saved.authCheckedAt || null,
    demoFirstRequired: saved.demoFirstRequired !== false,
    updatedAt: saved.updatedAt || base.updatedAt,
  };
}

function loadFoundation() {
  try {
    const saved = getModeStorageValue(FOUNDATION_STORAGE_KEY);
    if (!saved) return structuredClone(defaultFoundation);
    return mergeDefaults(JSON.parse(saved), defaultFoundation);
  } catch {
    return structuredClone(defaultFoundation);
  }
}

function loadCareer() {
  try {
    const saved = getModeStorageValue(CAREER_STORAGE_KEY);
    if (!saved) return structuredClone(defaultCareer);
    const parsed = JSON.parse(saved);
    return {
      ...structuredClone(defaultCareer),
      ...parsed,
      roadmaps: Array.isArray(parsed.roadmaps) ? parsed.roadmaps : defaultCareer.roadmaps,
      activityLog: Array.isArray(parsed.activityLog) ? parsed.activityLog : [],
      meta: { ...defaultCareer.meta, ...parsed.meta },
    };
  } catch {
    return structuredClone(defaultCareer);
  }
}

function loadTasks() {
  try {
    const saved = getModeStorageValue(TASKS_STORAGE_KEY);
    if (!saved) {
      return {
        ...structuredClone(defaultTasks),
        tasks: defaultTasks.tasks.map(normalizeTask),
      };
    }
    const parsed = JSON.parse(saved);
    return {
      ...structuredClone(defaultTasks),
      ...parsed,
      tasks: Array.isArray(parsed.tasks) ? parsed.tasks.map(normalizeTask) : [],
      meta: { ...defaultTasks.meta, ...parsed.meta },
    };
  } catch {
    return {
      ...structuredClone(defaultTasks),
      tasks: defaultTasks.tasks.map(normalizeTask),
    };
  }
}

function loadJournal() {
  try {
    const saved = getModeStorageValue(JOURNAL_STORAGE_KEY);
    if (!saved) return structuredClone(defaultJournal);
    const parsed = JSON.parse(saved);
    const entries = parsed.entries && typeof parsed.entries === "object" ? parsed.entries : {};
    return {
      ...structuredClone(defaultJournal),
      ...parsed,
      entries: Object.fromEntries(
        Object.entries(entries).map(([dateKey, entry]) => [dateKey, normalizeJournalEntry(entry, dateKey)]),
      ),
      meta: { ...defaultJournal.meta, ...parsed.meta },
    };
  } catch {
    return structuredClone(defaultJournal);
  }
}

function loadSecurity(modeName = accountMode) {
  try {
    const saved = getModeStorageValue(SECURITY_STORAGE_KEY, modeName);
    if (!saved) return structuredClone(defaultSecurity);
    const parsed = JSON.parse(saved);
    return {
      ...structuredClone(defaultSecurity),
      ...parsed,
      recovery: Array.isArray(parsed.recovery) && parsed.recovery.length >= 2
        ? parsed.recovery.slice(0, 2).map((item) => ({
            question: item.question || "",
            answerHash: item.answerHash || "",
          }))
        : structuredClone(defaultSecurity.recovery),
      settings: { ...defaultSecurity.settings, ...parsed.settings },
    };
  } catch {
    return structuredClone(defaultSecurity);
  }
}

function loadSyncState() {
  try {
    const saved = getModeStorageValue(SYNC_STATE_STORAGE_KEY);
    if (!saved) return createDefaultSyncState();
    return normalizeSyncState(JSON.parse(saved));
  } catch {
    return createDefaultSyncState();
  }
}

function loadUiState() {
  try {
    const saved = getModeStorageValue(UI_STATE_STORAGE_KEY);
    if (!saved) return {};
    const parsed = JSON.parse(saved);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function isDateKey(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function getCurrentUiState() {
  return {
    currentPage,
    mode,
    activeEditSection,
    selectedRoadmapId,
    selectedTaskDate,
    activeTaskView,
    activeFieldTab,
    selectedHabitId,
    activeHabitRange,
    selectedJournalDate,
    updatedAt: new Date().toISOString(),
  };
}

function saveUiState() {
  setModeStorageValue(UI_STATE_STORAGE_KEY, JSON.stringify(getCurrentUiState()));
}

function createJournalEntry(dateKey = toDateKey()) {
  return {
    id: createId(),
    date: dateKey,
    arriveDone: false,
    state: {
      mood: 5,
      energy: 5,
      focus: 5,
      agitation: 5,
      clarity: 5,
      bodyTension: 5,
      spiritualSteadiness: 5,
    },
    mindDump: [],
    truthFilter: {
      trigger: "",
      thought: "",
      distortion: "None",
      truth: "",
      nextAction: "",
    },
    shutdown: {
      bestAction: "",
      driftReason: "",
      lesson: "",
      correction: "",
      tomorrowProtect: "",
      prayer: "",
    },
    tomorrowTop3: ["", "", ""],
    patternTags: [],
    sealedAt: null,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

function normalizeJournalEntry(entry, dateKey = toDateKey()) {
  const base = createJournalEntry(dateKey);
  const next = {
    ...base,
    ...entry,
    date: entry?.date || dateKey,
    state: { ...base.state, ...entry?.state },
    truthFilter: { ...base.truthFilter, ...entry?.truthFilter },
    shutdown: { ...base.shutdown, ...entry?.shutdown },
    tomorrowTop3: Array.isArray(entry?.tomorrowTop3)
      ? [entry.tomorrowTop3[0] || "", entry.tomorrowTop3[1] || "", entry.tomorrowTop3[2] || ""]
      : base.tomorrowTop3,
    mindDump: Array.isArray(entry?.mindDump)
      ? entry.mindDump.map(normalizeMindDumpItem)
      : [],
    patternTags: Array.isArray(entry?.patternTags) ? entry.patternTags : [],
  };
  next.arriveDone = Boolean(next.arriveDone);
  return next;
}

function normalizeMindDumpItem(item) {
  return {
    id: item?.id || createId(),
    category: MIND_CATEGORIES.includes(item?.category) ? item.category : "Fear",
    text: item?.text || "",
    decision: MIND_DECISIONS.includes(item?.decision) ? item.decision : "Unsorted",
    intensity: Number(item?.intensity || 5),
    createdAt: item?.createdAt || new Date().toISOString(),
  };
}

function normalizeHabitMetric(metric = {}) {
  const target = Number(metric?.target);
  const unit = String(metric?.unit || "checks").trim() || "checks";
  const period = HABIT_PERIODS.includes(metric?.period) ? metric.period : "day";
  const direction = HABIT_DIRECTIONS.includes(metric?.direction) ? metric.direction : "at-least";
  return {
    target: Number.isFinite(target) && target > 0 ? target : 1,
    unit: unit.slice(0, 24),
    period,
    direction,
  };
}

function normalizeTaskRecord(record = {}) {
  const value = Number(record?.value);
  return {
    status: ["active", "done", "partial", "missed", "carried"].includes(record?.status)
      ? record.status
      : "active",
    startedAt: record?.startedAt || null,
    completedAt: record?.completedAt || null,
    checklist: record?.checklist && typeof record.checklist === "object" ? record.checklist : {},
    value: record?.value === "" || record?.value === null || record?.value === undefined || !Number.isFinite(value)
      ? null
      : value,
    driftReason: String(record?.driftReason || ""),
  };
}

function createTask(overrides = {}) {
  return {
    id: createId(),
    title: "",
    domain: "General",
    type: "Task",
    priority: "Medium",
    status: "active",
    scheduledDate: "",
    repeat: "none",
    repeatDays: [],
    carryForward: true,
    carriedTo: "",
    createdAt: new Date().toISOString(),
    startedAt: null,
    completedAt: null,
    notes: "",
    checklist: [],
    records: {},
    ...overrides,
    habitMetric: normalizeHabitMetric(overrides.habitMetric),
  };
}

function normalizeTask(task) {
  const next = createTask(task);
  next.title = next.title || "Untitled task";
  if (next.domain === "Food") next.domain = "Food/Supplements";
  next.domain = TASK_DOMAINS.includes(next.domain) ? next.domain : "General";
  next.type = TASK_TYPES.includes(next.type) ? next.type : "Task";
  next.priority = TASK_PRIORITIES.includes(next.priority) ? next.priority : "Medium";
  next.repeat = TASK_REPEATS.includes(next.repeat) ? next.repeat : "none";
  next.status = ["active", "done", "partial", "missed", "carried"].includes(next.status)
    ? next.status
    : "active";
  next.repeatDays = Array.isArray(next.repeatDays)
    ? next.repeatDays.map(Number).filter((day) => day >= 0 && day <= 6)
    : [];
  next.checklist = Array.isArray(next.checklist)
    ? next.checklist.map((item) => ({
        id: item.id || createId(),
        text: item.text || "Checklist item",
        done: Boolean(item.done),
      }))
    : [];
  next.habitMetric = normalizeHabitMetric(next.habitMetric);
  next.records = next.records && typeof next.records === "object"
    ? Object.fromEntries(Object.entries(next.records).map(([dateKey, record]) => [dateKey, normalizeTaskRecord(record)]))
    : {};
  next.carryForward = Boolean(next.carryForward);
  return next;
}

function mergeDefaults(saved, defaults) {
  return {
    ...structuredClone(defaults),
    ...saved,
    declaration: { ...defaults.declaration, ...saved.declaration },
    why: { ...defaults.why, ...saved.why },
    meta: { ...defaults.meta, ...saved.meta },
  };
}

function saveFoundation() {
  state.meta.updatedAt = new Date().toISOString();
  setModeStorageValue(FOUNDATION_STORAGE_KEY, JSON.stringify(state));
}

function saveCareer() {
  careerState.meta.updatedAt = new Date().toISOString();
  setModeStorageValue(CAREER_STORAGE_KEY, JSON.stringify(careerState));
}

function saveTasks() {
  taskState.meta.updatedAt = new Date().toISOString();
  setModeStorageValue(TASKS_STORAGE_KEY, JSON.stringify(taskState));
}

function saveJournal() {
  journalState.meta.updatedAt = new Date().toISOString();
  setModeStorageValue(JOURNAL_STORAGE_KEY, JSON.stringify(journalState));
}

function saveSecurity() {
  securityState.updatedAt = new Date().toISOString();
  setModeStorageValue(SECURITY_STORAGE_KEY, JSON.stringify(securityState));
}

function saveSyncState() {
  syncState.updatedAt = new Date().toISOString();
  setModeStorageValue(SYNC_STATE_STORAGE_KEY, JSON.stringify(syncState));
}

function readSecuritySessionForMode(modeName = accountMode) {
  try {
    const saved = getModeStorageValue(SECURITY_SESSION_KEY, modeName);
    if (!saved) return {};
    const parsed = JSON.parse(saved);
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeSecuritySessionForMode(modeName = accountMode, next = {}) {
  const current = readSecuritySessionForMode(modeName);
  setModeStorageValue(
    SECURITY_SESSION_KEY,
    JSON.stringify({
      ...current,
      ...next,
      updatedAt: Date.now(),
    }),
    modeName,
  );
}

function readSecuritySession() {
  return readSecuritySessionForMode(accountMode);
}

function writeSecuritySession(next = {}) {
  writeSecuritySessionForMode(accountMode, next);
}

function hasActiveSecuritySession() {
  if (!securityState.configured) return true;
  const session = readSecuritySession();
  if (session.locked) return false;
  if (!securityState.settings.requireOnStartup) return true;
  const lastActivityAt = Number(session.lastActivityAt || session.unlockedAt || 0);
  if (!Number.isFinite(lastActivityAt) || lastActivityAt <= 0) return false;
  const minutes = Number(securityState.settings.autoLockMinutes || 10);
  return Date.now() - lastActivityAt < minutes * 60 * 1000;
}

function markSecuritySessionUnlocked() {
  const now = Date.now();
  lastSecurityActivityWrite = now;
  writeSecuritySession({
    locked: false,
    unlockedAt: now,
    lastActivityAt: now,
  });
}

function markSecuritySessionLocked() {
  writeSecuritySession({
    locked: true,
    lockedAt: Date.now(),
  });
}

function touchSecuritySession(force = false) {
  if (!securityState.configured || !isSecurityUnlocked) return;
  const now = Date.now();
  if (!force && now - lastSecurityActivityWrite < SECURITY_ACTIVITY_WRITE_INTERVAL) return;
  lastSecurityActivityWrite = now;
  writeSecuritySession({
    locked: false,
    lastActivityAt: now,
  });
}

function normalizeSecret(value = "") {
  return String(value).trim();
}

function normalizeAnswer(value = "") {
  return String(value).trim().toLowerCase().replace(/\s+/g, " ");
}

async function hashSecret(value, scope = "pass") {
  const normalized = scope === "answer" ? normalizeAnswer(value) : normalizeSecret(value);
  const text = `kryos-phase1-${scope}:${normalized}`;
  if (window.crypto?.subtle && window.TextEncoder) {
    const bytes = new TextEncoder().encode(text);
    const digest = await window.crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
  }

  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `fallback-${(hash >>> 0).toString(16)}`;
}

function escapeHtml(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatDate(value) {
  if (!value) return "Not reviewed yet";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(normalizeDateInput(value));
}

function normalizeDateInput(date = new Date()) {
  if (date instanceof Date) return new Date(date.getTime());
  if (isDateKey(date)) return getDateFromKey(date);
  const value = new Date(date);
  return Number.isNaN(value.getTime()) ? new Date() : value;
}

function toDateKey(date = new Date()) {
  const value = normalizeDateInput(date);
  const year = value.getFullYear();
  const month = String(value.getMonth() + 1).padStart(2, "0");
  const day = String(value.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function addDays(date, amount) {
  const next = normalizeDateInput(date);
  next.setDate(next.getDate() + amount);
  return next;
}

function getChecklistStats(items = []) {
  const total = items.length;
  const done = items.filter((item) => item.done).length;
  return {
    total,
    done,
    percent: total ? Math.round((done / total) * 100) : 0,
  };
}

function getTopicStats(topic) {
  return getChecklistStats(topic.checklist);
}

function getModuleStats(module) {
  const stats = module.topics.reduce(
    (acc, topic) => {
      const topicStats = getTopicStats(topic);
      acc.total += topicStats.total;
      acc.done += topicStats.done;
      return acc;
    },
    { total: 0, done: 0 },
  );
  return {
    ...stats,
    percent: stats.total ? Math.round((stats.done / stats.total) * 100) : 0,
  };
}

function getRoadmapStats(roadmap) {
  const stats = roadmap.modules.reduce(
    (acc, module) => {
      const moduleStats = getModuleStats(module);
      acc.total += moduleStats.total;
      acc.done += moduleStats.done;
      return acc;
    },
    { total: 0, done: 0 },
  );
  return {
    ...stats,
    percent: stats.total ? Math.round((stats.done / stats.total) * 100) : 0,
  };
}

function getCareerStats() {
  const roadmaps = careerState.roadmaps;
  const totals = roadmaps.reduce(
    (acc, roadmap) => {
      const stats = getRoadmapStats(roadmap);
      acc.total += stats.total;
      acc.done += stats.done;
      return acc;
    },
    { total: 0, done: 0 },
  );

  const activityDates = new Set(careerState.activityLog.map((item) => item.date));
  const today = new Date();
  const todayKey = toDateKey(today);
  const yesterdayKey = toDateKey(addDays(today, -1));
  const streakAnchor = activityDates.has(todayKey) ? today : activityDates.has(yesterdayKey) ? addDays(today, -1) : today;

  return {
    roadmaps: roadmaps.length,
    totalItems: totals.total,
    doneItems: totals.done,
    progress: totals.total ? Math.round((totals.done / totals.total) * 100) : 0,
    currentStreak: countStreakFrom(streakAnchor, activityDates),
    bestStreak: countBestStreak(activityDates),
    hasTodayAction: activityDates.has(todayKey),
    weekActions: countActionsThisWeek(),
  };
}

function countStreakFrom(anchorDate, activityDates) {
  let count = 0;
  let cursor = normalizeDateInput(anchorDate);
  while (activityDates.has(toDateKey(cursor))) {
    count += 1;
    cursor = addDays(cursor, -1);
  }
  return count;
}

function countBestStreak(activityDates) {
  const sorted = [...activityDates].sort();
  let best = 0;
  let current = 0;
  let previous = null;

  sorted.forEach((dateKey) => {
    if (!previous) {
      current = 1;
    } else {
      const expected = toDateKey(addDays(getDateFromKey(previous), 1));
      current = expected === dateKey ? current + 1 : 1;
    }
    best = Math.max(best, current);
    previous = dateKey;
  });

  return best;
}

function countActionsThisWeek() {
  const today = new Date();
  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());
  start.setHours(0, 0, 0, 0);
  return careerState.activityLog.filter((item) => getDateFromKey(item.date) >= start).length;
}

function getDateFromKey(dateKey) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatDateKey(dateKey) {
  if (!dateKey) return "No date";
  return new Intl.DateTimeFormat(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(getDateFromKey(dateKey));
}

function formatTime(value) {
  if (!value) return "Not saved";
  return new Intl.DateTimeFormat(undefined, {
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function formatDateTime(value, fallback = "Never") {
  if (!value) return fallback;
  return `${formatDate(value)}, ${formatTime(value)}`;
}

function getTaskById(id) {
  return taskState.tasks.find((task) => task.id === id);
}

function getTaskRecord(task, dateKey) {
  return task.records?.[dateKey] ?? {};
}

function ensureTaskRecord(task, dateKey) {
  if (!task.records || typeof task.records !== "object") {
    task.records = {};
  }
  if (!task.records[dateKey]) {
    task.records[dateKey] = {
      status: "active",
      startedAt: null,
      completedAt: null,
      checklist: {},
      value: null,
      driftReason: "",
    };
  }
  if (!task.records[dateKey].checklist) {
    task.records[dateKey].checklist = {};
  }
  if (task.records[dateKey].value === undefined) {
    task.records[dateKey].value = null;
  }
  if (task.records[dateKey].driftReason === undefined) {
    task.records[dateKey].driftReason = "";
  }
  return task.records[dateKey];
}

function isRepeatingTask(task) {
  return task.repeat !== "none";
}

function getCreatedDateKey(task) {
  return toDateKey(task.createdAt || new Date());
}

function taskRepeatsOnDate(task, dateKey) {
  if (!isRepeatingTask(task)) return false;
  if (getCreatedDateKey(task) > dateKey) return false;

  const day = getDateFromKey(dateKey).getDay();
  if (task.repeat === "daily") return true;
  if (task.repeat === "weekdays") return day >= 1 && day <= 5;
  if (task.repeat === "selected") return task.repeatDays.includes(day);
  if (task.repeat === "weekly") {
    const anchor = task.scheduledDate || getCreatedDateKey(task);
    return dateKey >= anchor && getDateFromKey(anchor).getDay() === day;
  }
  return false;
}

function getTaskStatusForDate(task, dateKey) {
  const recordStatus = getTaskRecord(task, dateKey).status;
  if (recordStatus) return recordStatus;
  return isRepeatingTask(task) ? "active" : task.status;
}

function isTaskDoneOnDate(task, dateKey) {
  if (getTaskStatusForDate(task, dateKey) === "done") return true;
  return !isRepeatingTask(task) && task.status === "done";
}

function isTaskScheduledForDate(task, dateKey) {
  if (isRepeatingTask(task)) return taskRepeatsOnDate(task, dateKey);
  return task.scheduledDate === dateKey;
}

function isTaskCarryoverForDate(task, dateKey) {
  if (!task.carryForward || isTaskDoneOnDate(task, dateKey)) return false;
  if (task.carriedTo && task.carriedTo <= dateKey) return true;
  if (!isRepeatingTask(task) && task.scheduledDate && task.scheduledDate < dateKey) {
    return task.status !== "done";
  }
  return false;
}

function isAnytimeTask(task) {
  return !isRepeatingTask(task) && !task.scheduledDate && !task.carriedTo && task.status !== "done";
}

function getTaskBuckets(dateKey) {
  const buckets = {
    mustDo: [],
    scheduled: [],
    carryover: [],
    anytime: [],
    done: [],
  };

  taskState.tasks.forEach((task) => {
    const status = getTaskStatusForDate(task, dateKey);
    const scheduled = isTaskScheduledForDate(task, dateKey);
    const carryover = isTaskCarryoverForDate(task, dateKey);
    const doneToday = status === "done" || (!isRepeatingTask(task) && task.completedAt && toDateKey(task.completedAt) === dateKey);

    if (status === "carried" && task.carriedTo && task.carriedTo > dateKey) {
      return;
    }

    if (doneToday && (scheduled || carryover || (task.completedAt && toDateKey(task.completedAt) === dateKey))) {
      buckets.done.push(task);
      return;
    }

    if (carryover) {
      buckets.carryover.push(task);
      return;
    }

    if (scheduled) {
      if (["High", "Critical"].includes(task.priority)) {
        buckets.mustDo.push(task);
      } else {
        buckets.scheduled.push(task);
      }
      return;
    }

    if (isAnytimeTask(task)) {
      buckets.anytime.push(task);
    }
  });

  return buckets;
}

function getDueTasksForDate(dateKey) {
  const buckets = getTaskBuckets(dateKey);
  return [...buckets.mustDo, ...buckets.scheduled, ...buckets.carryover];
}

function getTaskActivityDates() {
  const dates = new Set();
  taskState.tasks.forEach((task) => {
    Object.entries(task.records ?? {}).forEach(([dateKey, record]) => {
      if (record?.status === "done") dates.add(dateKey);
    });
    if (!isRepeatingTask(task) && task.completedAt) dates.add(toDateKey(task.completedAt));
  });
  return dates;
}

function getPerfectDayDates() {
  const checkedDates = new Set();
  taskState.tasks.forEach((task) => {
    Object.keys(task.records ?? {}).forEach((dateKey) => checkedDates.add(dateKey));
    if (task.scheduledDate) checkedDates.add(task.scheduledDate);
    if (!isRepeatingTask(task) && task.completedAt) checkedDates.add(toDateKey(task.completedAt));
  });

  return [...checkedDates].filter((dateKey) => {
    const due = getDueTasksForDate(dateKey);
    return due.length > 0 && due.every((task) => isTaskDoneOnDate(task, dateKey));
  });
}

function getTaskCompletionDurations() {
  const durations = [];
  taskState.tasks.forEach((task) => {
    Object.values(task.records ?? {}).forEach((record) => {
      if (!record?.startedAt || !record.completedAt) return;
      const minutes = Math.round((new Date(record.completedAt) - new Date(record.startedAt)) / 60000);
      if (minutes >= 0) durations.push(minutes);
    });
    if (!isRepeatingTask(task) && task.startedAt && task.completedAt) {
      const minutes = Math.round((new Date(task.completedAt) - new Date(task.startedAt)) / 60000);
      if (minutes >= 0) durations.push(minutes);
    }
  });
  return durations;
}

function formatMinutes(minutes) {
  if (!Number.isFinite(minutes)) return "No timer";
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

function getTaskStats(dateKey) {
  const due = getDueTasksForDate(dateKey);
  const done = due.filter((task) => isTaskDoneOnDate(task, dateKey));
  const activityDates = getTaskActivityDates();
  const today = new Date();
  const todayKey = toDateKey(today);
  const yesterdayKey = toDateKey(addDays(today, -1));
  const streakAnchor = activityDates.has(todayKey) ? today : activityDates.has(yesterdayKey) ? addDays(today, -1) : today;
  const perfectDates = new Set(getPerfectDayDates());
  const perfectAnchor = perfectDates.has(todayKey) ? today : perfectDates.has(yesterdayKey) ? addDays(today, -1) : today;
  const durations = getTaskCompletionDurations();
  const fastest = durations.length ? Math.min(...durations) : NaN;

  return {
    completion: due.length ? Math.round((done.length / due.length) * 100) : 0,
    dueCount: due.length,
    doneCount: done.length,
    currentStreak: countStreakFrom(streakAnchor, activityDates),
    bestStreak: countBestStreak(activityDates),
    perfectStreak: countStreakFrom(perfectAnchor, perfectDates),
    carryDebt: taskState.tasks.filter((task) => isTaskCarryoverForDate(task, dateKey)).length,
    fastest,
  };
}

function getTaskDaySummary(dateKey) {
  const due = getDueTasksForDate(dateKey);
  const done = due.filter((task) => isTaskDoneOnDate(task, dateKey));
  return {
    completion: due.length ? Math.round((done.length / due.length) * 100) : 0,
    dueCount: due.length,
    doneCount: done.length,
    carryDebt: taskState.tasks.filter((task) => isTaskCarryoverForDate(task, dateKey)).length,
  };
}

function getDomainStats(dateKey) {
  const due = getDueTasksForDate(dateKey);
  return TASK_DOMAINS.map((domain) => {
    const tasks = due.filter((task) => task.domain === domain);
    const done = tasks.filter((task) => isTaskDoneOnDate(task, dateKey)).length;
    return {
      domain,
      total: tasks.length,
      done,
      percent: tasks.length ? Math.round((done / tasks.length) * 100) : 0,
    };
  });
}

function getUpcomingTasks() {
  const today = getDateFromKey(toDateKey());
  return taskState.tasks
    .map((task) => {
      for (let index = 0; index < 31; index += 1) {
        const dateKey = toDateKey(addDays(today, index));
        if ((isTaskScheduledForDate(task, dateKey) || isTaskCarryoverForDate(task, dateKey)) && !isTaskDoneOnDate(task, dateKey)) {
          return { task, dateKey };
        }
      }
      return null;
    })
    .filter(Boolean)
    .sort((a, b) => a.dateKey.localeCompare(b.dateKey));
}

function getChecklistDone(task, item, dateKey) {
  const record = getTaskRecord(task, dateKey);
  if (record.checklist && Object.hasOwn(record.checklist, item.id)) {
    return Boolean(record.checklist[item.id]);
  }
  return isRepeatingTask(task) ? false : Boolean(item.done);
}

function getTaskChecklistStats(task, dateKey) {
  const total = task.checklist.length;
  const done = task.checklist.filter((item) => getChecklistDone(task, item, dateKey)).length;
  return {
    total,
    done,
    percent: total ? Math.round((done / total) * 100) : 0,
  };
}

function findRoadmap(id) {
  return careerState.roadmaps.find((roadmap) => roadmap.id === id);
}

function findModule(roadmap, id) {
  return roadmap?.modules.find((module) => module.id === id);
}

function findTopic(module, id) {
  return module?.topics.find((topic) => topic.id === id);
}

function resetLockTimer() {
  if (lockTimer) window.clearTimeout(lockTimer);
  if (!securityState.configured || !isSecurityUnlocked || !securityState.settings.requireOnStartup) return;
  const minutes = Number(securityState.settings.autoLockMinutes || 10);
  lockTimer = window.setTimeout(() => lockApp("Auto-locked after inactivity."), minutes * 60 * 1000);
}

function lockApp(message = "KRYOS is locked.") {
  if (!securityState.configured) return;
  isSecurityUnlocked = false;
  recoveryMode = false;
  securityNotice = message;
  markSecuritySessionLocked();
  renderSecurityOverlay();
}

function unlockApp(message = "") {
  isSecurityUnlocked = true;
  recoveryMode = false;
  securityNotice = message;
  markSecuritySessionUnlocked();
  renderSecurityOverlay();
  resetLockTimer();
  render();
}

function applyPrivacyMode() {
  document.body.classList.toggle("privacy-mode", Boolean(securityState.settings.privacyMode));
}

function renderSecurityOverlay() {
  applyPrivacyMode();
  if (!securityOverlay) return;

  const shouldShow = !securityState.configured || !isSecurityUnlocked;
  securityOverlay.classList.toggle("is-hidden", !shouldShow);
  appShell?.classList.toggle("is-locked", shouldShow);
  mobileNav?.classList.toggle("is-locked", shouldShow);

  if (!shouldShow) {
    securityOverlay.innerHTML = "";
    return;
  }

  if (!securityState.configured) {
    securityOverlay.innerHTML = renderSecuritySetup();
    return;
  }

  securityOverlay.innerHTML = recoveryMode ? renderRecoveryScreen() : renderUnlockScreen();
}

function renderSecurityRitual(activeStep = "unlock") {
  const steps = [
    ["setup", "Set lock", "Local screen guard"],
    ["unlock", "Verify", "Private access"],
    ["align", "Continue", "Active session"],
  ];
  return `
    <div class="security-ritual" aria-label="KRYOS startup flow">
      ${steps
        .map(([id, title, note], index) => `
          <div class="security-step ${id === activeStep ? "is-active" : ""}">
            <span>${index + 1}</span>
            <div>
              <strong>${title}</strong>
              <em>${note}</em>
            </div>
          </div>
        `)
        .join("")}
    </div>
  `;
}

function renderSecuritySetup() {
  return `
    <div class="security-card">
      <div class="brand security-brand">
        <div class="brand-mark">K</div>
        <div>
          <p class="brand-title">KRYOS</p>
          <p class="brand-subtitle">Privacy lock setup</p>
        </div>
      </div>
      <p class="section-kicker">Phase 1 lock</p>
      <h2>Create local access</h2>
      <p class="principle-body">This blocks casual access on this device. It does not encrypt browser storage.</p>
      ${renderSecurityRitual("setup")}
      ${securityNotice ? `<p class="security-notice">${escapeHtml(securityNotice)}</p>` : ""}
      <div class="security-form">
        <div class="field">
          <label class="field-label" for="setup-pass">PIN or passphrase</label>
          <input id="setup-pass" type="password" autocomplete="new-password" placeholder="Minimum 4 characters" autofocus />
        </div>
        <div class="field">
          <label class="field-label" for="setup-pass-confirm">Confirm PIN or passphrase</label>
          <input id="setup-pass-confirm" type="password" autocomplete="new-password" />
        </div>
        <div class="field">
          <label class="field-label" for="setup-question-1">Recovery question 1</label>
          <input id="setup-question-1" type="text" placeholder="Question only you can answer" />
        </div>
        <div class="field">
          <label class="field-label" for="setup-answer-1">Recovery answer 1</label>
          <input id="setup-answer-1" type="password" autocomplete="off" />
        </div>
        <div class="field">
          <label class="field-label" for="setup-question-2">Recovery question 2</label>
          <input id="setup-question-2" type="text" placeholder="Second question" />
        </div>
        <div class="field">
          <label class="field-label" for="setup-answer-2">Recovery answer 2</label>
          <input id="setup-answer-2" type="password" autocomplete="off" />
        </div>
        <button class="primary-button" type="button" data-security-action="create-lock">Create lock</button>
      </div>
    </div>
  `;
}

function renderUnlockScreen() {
  return `
    <div class="security-card compact">
      <div class="brand security-brand">
        <div class="brand-mark">K</div>
        <div>
          <p class="brand-title">KRYOS</p>
          <p class="brand-subtitle">Alignment system</p>
        </div>
      </div>
      <p class="section-kicker">Profile entry</p>
      <h2>Enter KRYOS</h2>
      <p class="profile-login-note">Personal credentials open your private workspace. Demo credentials open the showcase profile.</p>
      ${securityNotice ? `<p class="security-notice">${escapeHtml(securityNotice)}</p>` : ""}
      <div class="security-form">
        <div class="field">
          <label class="field-label" for="unlock-pass">PIN or passphrase</label>
          <input id="unlock-pass" type="password" autocomplete="current-password" autofocus />
        </div>
        <button class="primary-button" type="button" data-security-action="unlock">Enter KRYOS</button>
        <button class="secondary-button" type="button" data-security-action="show-recovery">Recovery</button>
      </div>
    </div>
  `;
}

function renderRecoveryScreen() {
  return `
    <div class="security-card">
      <div class="brand security-brand">
        <div class="brand-mark">K</div>
        <div>
          <p class="brand-title">KRYOS</p>
          <p class="brand-subtitle">Recovery</p>
        </div>
      </div>
      <p class="section-kicker">Reset Phase 1 lock</p>
      <h2>Answer recovery questions</h2>
      <p class="principle-body">Recovery resets the screen lock only. This is not strong encryption recovery.</p>
      ${renderSecurityRitual("setup")}
      ${securityNotice ? `<p class="security-notice">${escapeHtml(securityNotice)}</p>` : ""}
      <div class="security-form">
        <div class="field">
          <label class="field-label" for="recovery-answer-1">${escapeHtml(securityState.recovery[0]?.question || "Recovery question 1")}</label>
          <input id="recovery-answer-1" type="password" autocomplete="off" />
        </div>
        <div class="field">
          <label class="field-label" for="recovery-answer-2">${escapeHtml(securityState.recovery[1]?.question || "Recovery question 2")}</label>
          <input id="recovery-answer-2" type="password" autocomplete="off" />
        </div>
        <div class="field">
          <label class="field-label" for="recovery-new-pass">New PIN or passphrase</label>
          <input id="recovery-new-pass" type="password" autocomplete="new-password" />
        </div>
        <div class="field">
          <label class="field-label" for="recovery-new-pass-confirm">Confirm new PIN or passphrase</label>
          <input id="recovery-new-pass-confirm" type="password" autocomplete="new-password" />
        </div>
        <button class="primary-button" type="button" data-security-action="recover-lock">Reset and unlock</button>
        <button class="secondary-button" type="button" data-security-action="back-to-unlock">Back</button>
      </div>
    </div>
  `;
}

function setMode(nextMode) {
  mode = nextMode;
  modeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.mode === mode);
  });
  if (currentPage === "foundation") {
    readView.classList.toggle("is-hidden", mode !== "read");
    editView.classList.toggle("is-hidden", mode !== "edit");
  }
  render();
}

function setPage(nextPage) {
  currentPage = nextPage;
  pageButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.page === currentPage);
  });
  render();
}

function setFieldTab(nextTab) {
  activeFieldTab = FIELD_TABS.includes(nextTab) ? nextTab : "today";
  fieldButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.fieldTab === activeFieldTab);
  });
  saveUiState();
  renderFieldView();
}

function render() {
  saveUiState();
  document.body.classList.toggle("demo-mode", isDemoMode());
  appShell?.classList.toggle("is-demo-mode", isDemoMode());
  if (activeProfileBadge) {
    activeProfileBadge.textContent = getModeLabel();
    activeProfileBadge.classList.toggle("demo", isDemoMode());
    activeProfileBadge.classList.toggle("personal", !isDemoMode());
  }
  const pageCopy = {
    foundation: ["Foundation", "Why I Started"],
    career: ["Execution", "Career Roadmaps"],
    today: ["Command Center", "Today"],
    habits: ["Consistency", "Habit Tracker"],
    journal: ["Mind Containment", "Daily Shutdown"],
    progress: ["Analytics", "Progress"],
    settings: ["Privacy", "Settings"],
  };
  const [eyebrow, title] = pageCopy[currentPage] ?? pageCopy.foundation;
  topbarEyebrow.textContent = eyebrow;
  topbarTitle.textContent = title;
  modeSwitch.classList.toggle("is-hidden", currentPage !== "foundation");
  pageButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.page === currentPage);
  });
  modeButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.mode === mode);
  });

  readView.classList.toggle("is-hidden", currentPage !== "foundation" || mode !== "read");
  editView.classList.toggle("is-hidden", currentPage !== "foundation" || mode !== "edit");
  careerView.classList.toggle("is-hidden", currentPage !== "career");
  todayView.classList.toggle("is-hidden", currentPage !== "today");
  habitsView.classList.toggle("is-hidden", currentPage !== "habits");
  journalView.classList.toggle("is-hidden", currentPage !== "journal");
  progressView.classList.toggle("is-hidden", currentPage !== "progress");
  settingsView.classList.toggle("is-hidden", currentPage !== "settings");

  if (currentPage === "foundation") {
    renderReadView();
    renderEditView();
  }
  if (currentPage === "career") {
    renderCareerView();
  }
  if (currentPage === "today") {
    renderTodayView();
  }
  if (currentPage === "habits") {
    renderHabitView();
  }
  if (currentPage === "journal") {
    renderJournalView();
  }
  if (currentPage === "progress") {
    renderProgressView();
  }
  if (currentPage === "settings") {
    renderSettingsView();
  }

  renderFieldView();
}

function renderFieldView() {
  if (!fieldView) return;
  fieldButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.fieldTab === activeFieldTab);
  });

  const todayKey = toDateKey();
  const stats = getTaskStats(todayKey);
  const dueTasks = getDueTasksForDate(todayKey);
  const habits = getHabitTasks().filter((task) => isHabitDueOnDate(task, todayKey));
  const habitDone = habits.filter((task) => isTaskDoneOnDate(task, todayKey)).length;
  const carryCount = taskState.tasks.filter((task) => isTaskCarryoverForDate(task, todayKey)).length;
  const entry = journalState.entries[todayKey] || createJournalEntry(todayKey);

  fieldView.innerHTML = `
    <article class="field-mode">
      <header class="field-mode-hero">
        <div class="field-mode-top">
          <div>
            <p class="section-kicker">Field Mode</p>
            <h2>KRYOS on the move.</h2>
            <p class="principle-body">Open, add or check, then close. No heavy dashboard here.</p>
          </div>
          <button class="secondary-button field-lock-button" type="button" data-security-action="manual-lock">Lock</button>
        </div>
        <div class="field-metrics">
          ${fieldMetric("Today", `${stats.doneCount}/${stats.dueCount}`, "tasks")}
          ${fieldMetric("Habits", `${habitDone}/${habits.length}`, "checks")}
          ${fieldMetric("Carry", `${carryCount}`, "open")}
        </div>
      </header>

      ${renderFieldPanel(activeFieldTab, { todayKey, stats, dueTasks, habits, entry })}
    </article>
  `;
}

function fieldMetric(label, value, note) {
  return `
    <div class="field-metric">
      <span>${escapeHtml(label)}</span>
      <strong>${escapeHtml(value)}</strong>
      <em>${escapeHtml(note)}</em>
    </div>
  `;
}

function renderFieldPanel(tab, context) {
  if (tab === "add") return renderFieldAdd(context.todayKey);
  if (tab === "habits") return renderFieldHabits(context.todayKey, context.habits);
  if (tab === "pulse") return renderFieldPulse(context.todayKey, context.entry);
  return renderFieldToday(context.todayKey, context.dueTasks, context.habits, context.stats);
}

function renderFieldToday(todayKey, dueTasks, habits, stats) {
  const taskItems = dueTasks.filter((task) => !isHabitTask(task));
  const carryItems = taskState.tasks.filter((task) => isTaskCarryoverForDate(task, todayKey) && !isHabitTask(task));
  const firstHabits = habits.slice(0, 4);

  return `
    <section class="field-panel">
      <div class="field-section-head">
        <div>
          <p class="section-kicker">Today</p>
          <h3>${formatDateKey(todayKey)}</h3>
        </div>
        <span class="chip ${stats.completion >= 80 ? "signal" : "blue"}">${stats.completion}%</span>
      </div>

      ${renderFieldTaskGroup("Necessary tasks", taskItems, todayKey, "No non-habit tasks due.")}
      ${carryItems.length ? renderFieldTaskGroup("Carry-forward", carryItems, todayKey, "No carried tasks.") : ""}
      ${renderFieldHabitPreview(firstHabits, todayKey, habits.length)}
    </section>
  `;
}

function renderFieldTaskGroup(title, tasks, dateKey, emptyMessage) {
  return `
    <div class="field-group">
      <div class="field-group-title">
        <strong>${escapeHtml(title)}</strong>
        <span>${tasks.length}</span>
      </div>
      <div class="field-list">
        ${tasks.length ? tasks.map((task) => renderFieldTaskCard(task, dateKey)).join("") : `<p class="field-empty">${escapeHtml(emptyMessage)}</p>`}
      </div>
    </div>
  `;
}

function renderFieldTaskCard(task, dateKey) {
  const done = isTaskDoneOnDate(task, dateKey);
  const status = getTaskStatusForDate(task, dateKey);
  return `
    <article class="field-task-card ${done ? "is-done" : ""}">
      <label class="field-check-line">
        <input type="checkbox" ${done ? "checked" : ""} data-task-toggle="${task.id}" data-task-date="${dateKey}" />
        <span>
          <strong>${escapeHtml(task.title)}</strong>
          <em>${escapeHtml(task.domain)} - ${escapeHtml(status)}</em>
        </span>
      </label>
      <div class="field-mini-actions">
        <button class="secondary-button" type="button" data-task-status="partial" data-task-id="${task.id}" data-task-date="${dateKey}">Partial</button>
        <button class="secondary-button" type="button" data-task-status="missed" data-task-id="${task.id}" data-task-date="${dateKey}">Missed</button>
        <button class="secondary-button" type="button" data-task-status="carried" data-task-id="${task.id}" data-task-date="${dateKey}">Carry</button>
      </div>
    </article>
  `;
}

function renderFieldHabitPreview(habits, dateKey, total) {
  return `
    <div class="field-group">
      <div class="field-group-title">
        <strong>Due habits</strong>
        <span>${total}</span>
      </div>
      <div class="field-list">
        ${habits.length ? habits.map((task) => renderFieldHabitCard(task, dateKey)).join("") : `<p class="field-empty">No habits due right now.</p>`}
      </div>
      ${total > habits.length ? `<p class="meta">Open Habits for all ${total} checks.</p>` : ""}
    </div>
  `;
}

function renderFieldAdd(todayKey) {
  return `
    <section class="field-panel">
      <div class="field-section-head">
        <div>
          <p class="section-kicker">Quick add</p>
          <h3>Capture without clutter.</h3>
        </div>
      </div>
      <div class="field-mode-form">
        <div class="field">
          <label class="field-label" for="field-task-title">Task</label>
          <input id="field-task-title" type="text" placeholder="What needs to be done?" />
        </div>
        <div class="field-mode-row">
          <div class="field">
            <label class="field-label" for="field-task-destination">Where</label>
            <select id="field-task-destination">
              <option value="today">Today</option>
              <option value="date">Pick date</option>
              <option value="inbox">Inbox</option>
            </select>
          </div>
          <div class="field">
            <label class="field-label" for="field-task-date">Date</label>
            <input id="field-task-date" type="date" value="${escapeHtml(todayKey)}" />
          </div>
        </div>
        <div class="field">
          <label class="field-label" for="field-task-domain">Domain</label>
          <select id="field-task-domain">
            ${TASK_DOMAINS.map((domain) => `<option value="${domain}">${domain}</option>`).join("")}
          </select>
        </div>
        <label class="toggle-line">
          <input id="field-task-carry" type="checkbox" checked />
          <span>Carry forward if missed</span>
        </label>
        <button class="primary-button field-submit-button" type="button" data-field-action="add-task">Add task</button>
      </div>
    </section>
  `;
}

function renderFieldHabits(dateKey, habits) {
  return `
    <section class="field-panel">
      <div class="field-section-head">
        <div>
          <p class="section-kicker">Habits</p>
          <h3>One tap. Keep the chain alive.</h3>
        </div>
      </div>
      <div class="field-list">
        ${habits.length ? habits.map((task) => renderFieldHabitCard(task, dateKey, true)).join("") : `<p class="field-empty">No habits due today.</p>`}
      </div>
    </section>
  `;
}

function renderFieldHabitCard(task, dateKey, showProof = false) {
  const stateName = getHabitCellState(task, dateKey);
  const stats = getHabitStats(task, 30);
  const done = isTaskDoneOnDate(task, dateKey);
  return `
    <article class="field-habit-card ${stateName}">
      <div>
        <strong>${escapeHtml(task.title)}</strong>
        <em>${escapeHtml(task.domain)} - ${stats.currentStreak} day streak</em>
        ${showProof ? `<span class="field-proof">${stats.successRate}% success - ${stats.strength}% strength</span>` : ""}
      </div>
      <div class="field-habit-actions">
        <button class="primary-button" type="button" data-habit-status="${done ? "active" : "done"}" data-task-id="${task.id}" data-task-date="${dateKey}">
          ${done ? "Undo" : "Done"}
        </button>
        <button class="secondary-button" type="button" data-habit-status="partial" data-task-id="${task.id}" data-task-date="${dateKey}">Partial</button>
        <button class="secondary-button" type="button" data-habit-status="missed" data-task-id="${task.id}" data-task-date="${dateKey}">Missed</button>
      </div>
    </article>
  `;
}

function renderFieldPulse(dateKey, entry) {
  return `
    <section class="field-panel">
      <div class="field-section-head">
        <div>
          <p class="section-kicker">Pulse</p>
          <h3>Two-minute state capture.</h3>
        </div>
        <span class="chip ${entry.arriveDone ? "green" : "blue"}">${entry.arriveDone ? "Arrived" : "Open"}</span>
      </div>
      <label class="toggle-line field-arrive-line">
        <input type="checkbox" ${entry.arriveDone ? "checked" : ""} data-field-pulse-arrive />
        <span>I have arrived before reacting.</span>
      </label>
      <div class="field-pulse-grid">
        ${renderFieldPulseMetric(entry, "mood", "Mood")}
        ${renderFieldPulseMetric(entry, "energy", "Energy")}
        ${renderFieldPulseMetric(entry, "focus", "Focus")}
      </div>
      <div class="field-mode-form">
        <div class="field">
          <label class="field-label" for="field-pulse-category">Thought type</label>
          <select id="field-pulse-category">
            ${MIND_CATEGORIES.map((category) => `<option value="${category}" ${category === "Idea" ? "selected" : ""}>${category}</option>`).join("")}
          </select>
        </div>
        <div class="field">
          <label class="field-label" for="field-pulse-thought">One thought</label>
          <textarea id="field-pulse-thought" placeholder="What is repeating in the mind?"></textarea>
        </div>
        <button class="primary-button field-submit-button" type="button" data-field-action="add-pulse-thought">Save pulse thought</button>
      </div>
      <p class="meta">Saved to ${formatDateKey(dateKey)} journal.</p>
    </section>
  `;
}

function renderFieldPulseMetric(entry, field, label) {
  const value = Number(entry.state[field] || 5);
  return `
    <label class="field-pulse-metric">
      <span><strong>${escapeHtml(label)}</strong><em>${value}/10</em></span>
      <input type="range" min="1" max="10" value="${value}" data-field-pulse-state="${field}" />
    </label>
  `;
}

function renderReadView() {
  const pinnedVows = state.vows.filter((item) => item.active && item.pinned);
  const activeDo = state.doPrinciples.filter((item) => item.active);
  const activeDont = state.dontPrinciples.filter((item) => item.active);

  readView.innerHTML = `
    <article class="hero">
      <div class="hero-main">
        <p class="section-kicker">Opening declaration</p>
        <p class="hero-reason">${escapeHtml(state.declaration.reason)}</p>
      </div>
      <div class="hero-grid">
        ${infoTile("Current season", state.declaration.season)}
        ${infoTile("I am becoming", state.declaration.becoming)}
        ${infoTile("I refuse to remain", state.declaration.refusing)}
      </div>
      <div class="actions">
        <button class="primary-button" type="button" data-action="mark-reviewed">Mark reviewed</button>
        <button class="secondary-button" type="button" data-action="open-return">Return Protocol</button>
        <span class="chip">Last reviewed: ${formatDate(state.meta.lastReviewedAt)}</span>
      </div>
    </article>

    <div class="content-grid">
      <div class="section-stack">
        <section class="section-card">
          <div class="section-header">
            <div>
              <p class="section-kicker">Why</p>
              <h2>Reason and consequence</h2>
            </div>
          </div>
          <div class="why-grid">
            ${whyCard("The pain", state.why.pain)}
            ${whyCard("The vision", state.why.vision)}
            ${whyCard("The cost", state.why.cost)}
            ${whyCard("The reward", state.why.reward)}
          </div>
        </section>

        <section class="section-card">
          <div class="section-header">
            <div>
              <p class="section-kicker">Identity vows</p>
              <h2>Pinned standards</h2>
            </div>
          </div>
          <div class="card-list">
            ${pinnedVows.length ? pinnedVows.map(renderVowCard).join("") : emptyState("No pinned vows yet.")}
          </div>
        </section>

        <section class="section-card">
          <div class="section-header">
            <div>
              <p class="section-kicker">Do principles</p>
              <h2>Actions that protect alignment</h2>
            </div>
          </div>
          <div class="card-list">
            ${activeDo.map(renderDoCard).join("")}
          </div>
        </section>

        <section class="section-card warning">
          <div class="section-header">
            <div>
              <p class="section-kicker">Don't principles</p>
              <h2>Patterns that break alignment</h2>
            </div>
          </div>
          <div class="card-list">
            ${activeDont.map(renderDontCard).join("")}
          </div>
        </section>
      </div>

      <aside class="section-stack">
        <section class="section-card return">
          <div class="section-header">
            <div>
              <p class="section-kicker">Return</p>
              <h2>Failure protocol</h2>
            </div>
          </div>
          <div class="card-list">
            ${state.returnProtocol.map(renderProtocolStep).join("")}
          </div>
          ${returnProtocolOpen ? renderReturnPanel() : ""}
        </section>

        <section class="section-card">
          <div class="section-header">
            <div>
              <p class="section-kicker">Strengths</p>
              <h2>Use these</h2>
            </div>
          </div>
          <div class="map-list">
            ${state.strengths.map((item) => renderMapRow(item, "strength")).join("")}
          </div>
        </section>

        <section class="section-card">
          <div class="section-header">
            <div>
              <p class="section-kicker">Weaknesses</p>
              <h2>Watch these</h2>
            </div>
          </div>
          <div class="map-list">
            ${state.weaknesses.map((item) => renderMapRow(item, "weakness")).join("")}
          </div>
        </section>
      </aside>
    </div>
  `;
}

function infoTile(title, value) {
  return `
    <div class="info-tile">
      <p class="meta">${escapeHtml(title)}</p>
      <h3>${escapeHtml(value)}</h3>
    </div>
  `;
}

function whyCard(title, value) {
  return `
    <div class="why-card">
      <h3>${escapeHtml(title)}</h3>
      <p class="principle-body">${escapeHtml(value)}</p>
    </div>
  `;
}

function emptyState(text) {
  return `<p class="empty-state">${escapeHtml(text)}</p>`;
}

function renderVowCard(item) {
  return `
    <article class="principle-card">
      <div class="principle-top">
        <div>
          <p class="principle-title">${escapeHtml(item.title)}</p>
          <p class="principle-body">${escapeHtml(item.meaning)}</p>
        </div>
        <span class="chip green">Pinned</span>
      </div>
    </article>
  `;
}

function renderDoCard(item) {
  return `
    <article class="principle-card">
      <div class="principle-top">
        <div>
          <p class="principle-title">${escapeHtml(item.title)}</p>
          <p class="principle-body">${escapeHtml(item.reason)}</p>
        </div>
        ${item.pinned ? '<span class="chip green">Pinned</span>' : ""}
      </div>
      <div class="tag-row">
        <span class="tag">${escapeHtml(item.category)}</span>
        <span class="tag">${escapeHtml(item.frequency)}</span>
      </div>
      <div class="chip-row">
        <span class="chip blue">Minimum: ${escapeHtml(item.minimum)}</span>
        <span class="chip green">Full: ${escapeHtml(item.full)}</span>
      </div>
    </article>
  `;
}

function renderDontCard(item) {
  const severityClass = item.severity === "Critical" ? "red" : "amber";
  return `
    <article class="principle-card">
      <div class="principle-top">
        <div>
          <p class="principle-title">${escapeHtml(item.title)}</p>
          <p class="principle-body">${escapeHtml(item.harm)}</p>
        </div>
        <span class="chip ${severityClass}">${escapeHtml(item.severity)}</span>
      </div>
      <p class="principle-body"><strong>Replacement:</strong> ${escapeHtml(item.replacement)}</p>
    </article>
  `;
}

function renderProtocolStep(item, index) {
  return `
    <article class="protocol-card">
      <div class="protocol-step">
        <span class="step-number">${index + 1}</span>
        <p>${escapeHtml(item.text)}</p>
      </div>
    </article>
  `;
}

function renderReturnPanel() {
  return `
    <div class="return-panel" aria-label="Return protocol checklist">
      ${state.returnProtocol
        .map(
          (step) => `
          <label>
            <input type="checkbox" data-return-check="${step.id}" ${
              returnChecks[step.id] ? "checked" : ""
            } />
            <span>${escapeHtml(step.text)}</span>
          </label>
        `,
        )
        .join("")}
      <div class="protocol-actions">
        <button class="secondary-button" type="button" data-action="reset-return-checks">Clear</button>
        <button class="primary-button" type="button" data-action="close-return">Done</button>
      </div>
    </div>
  `;
}

function renderMapRow(item, type) {
  if (type === "strength") {
    return `
      <article class="map-row strength">
        <h3>${escapeHtml(item.name)}</h3>
        <p class="principle-body"><strong>Use:</strong> ${escapeHtml(item.use)}</p>
        <p class="principle-body"><strong>Environment:</strong> ${escapeHtml(item.environment)}</p>
        <p class="principle-body"><strong>Proof:</strong> ${escapeHtml(item.proof)}</p>
      </article>
    `;
  }

  return `
    <article class="map-row weakness">
      <h3>${escapeHtml(item.name)}</h3>
      <p class="principle-body"><strong>Shows as:</strong> ${escapeHtml(item.showsAs)}</p>
      <p class="principle-body"><strong>Warning:</strong> ${escapeHtml(item.warning)}</p>
      <p class="principle-body"><strong>Countermeasure:</strong> ${escapeHtml(item.countermeasure)}</p>
    </article>
  `;
}

function renderCareerView() {
  if (!selectedRoadmapId && careerState.roadmaps.length) {
    selectedRoadmapId = careerState.roadmaps[0].id;
  }
  const stats = getCareerStats();
  const selectedRoadmap = findRoadmap(selectedRoadmapId) ?? careerState.roadmaps[0];

  careerView.innerHTML = `
    <article class="career-hero">
      <div>
        <p class="section-kicker">Career block</p>
        <h2>One streak for meaningful career work.</h2>
        <p class="principle-body">Roadmaps show progress. The career block shows consistency. A day counts when you complete any roadmap checklist item.</p>
      </div>
      <div class="career-metrics">
        ${metricTile("Career streak", `${stats.currentStreak} days`, stats.hasTodayAction ? "Logged today" : "Waiting for today's action", "signal")}
        ${metricTile("Roadmap progress", `${stats.progress}%`, `${stats.doneItems}/${stats.totalItems} checklist items`, "blue")}
      </div>
    </article>

    <div class="career-layout">
      <section class="section-card">
        <div class="section-header">
          <div>
            <p class="section-kicker">Roadmaps</p>
            <h2>Career paths</h2>
          </div>
          <div class="quick-add">
            <input type="text" id="new-roadmap-title" placeholder="New roadmap name" />
            <button class="primary-button" type="button" data-career-add="roadmap">Add</button>
          </div>
        </div>
        <div class="roadmap-grid">
          ${careerState.roadmaps.map(renderRoadmapCard).join("")}
        </div>
      </section>

      <aside class="section-stack">
        <section class="section-card">
          <div class="section-header">
            <div>
              <p class="section-kicker">Rule</p>
              <h2>What counts?</h2>
            </div>
          </div>
          <p class="principle-body">A career day is logged only when a checklist item inside any career roadmap is completed. Reading this page does not count. Planning alone does not count.</p>
        </section>
      </aside>
    </div>

    ${selectedRoadmap ? renderRoadmapDetail(selectedRoadmap) : emptyState("Create your first roadmap to begin.")}
  `;
}

function metricTile(label, value, note, tone) {
  return `
    <div class="metric-tile ${tone}">
      <p class="meta">${escapeHtml(label)}</p>
      <strong>${escapeHtml(value)}</strong>
      <span>${escapeHtml(note)}</span>
    </div>
  `;
}

function renderRoadmapCard(roadmap) {
  const stats = getRoadmapStats(roadmap);
  const isSelected = roadmap.id === selectedRoadmapId;
  const target = roadmap.targetDate ? `Target: ${escapeHtml(roadmap.targetDate)}` : "No target date";

  return `
    <button class="roadmap-card ${isSelected ? "is-selected" : ""}" type="button" data-career-select-roadmap="${roadmap.id}">
      <span class="roadmap-card-top">
        <strong>${escapeHtml(roadmap.title)}</strong>
        <span>${stats.percent}%</span>
      </span>
      <span class="progress-track"><span style="width: ${stats.percent}%"></span></span>
      <span class="meta">${stats.done}/${stats.total} checklist items - ${target}</span>
    </button>
  `;
}

function renderCareerHeatmap() {
  const counts = careerState.activityLog.reduce((acc, item) => {
    acc[item.date] = (acc[item.date] ?? 0) + 1;
    return acc;
  }, {});
  const today = new Date();
  const days = Array.from({ length: 91 }, (_, index) => addDays(today, index - 90));

  return `
    <div class="heatmap" aria-label="Career activity heatmap">
      ${days
        .map((day) => {
          const key = toDateKey(day);
          const count = counts[key] ?? 0;
          const level = Math.min(count, 4);
          return `<span class="heat-cell level-${level}" title="${key}: ${count} action${count === 1 ? "" : "s"}"></span>`;
        })
        .join("")}
    </div>
    <div class="heatmap-legend">
      <span class="meta">Less</span>
      <span class="heat-cell level-0"></span>
      <span class="heat-cell level-1"></span>
      <span class="heat-cell level-2"></span>
      <span class="heat-cell level-3"></span>
      <span class="heat-cell level-4"></span>
      <span class="meta">More</span>
    </div>
  `;
}

function renderTodayView() {
  const stats = getTaskStats(selectedTaskDate);

  todayView.innerHTML = `
    <article class="today-hero">
      <div>
        <p class="section-kicker">Daily execution</p>
        <h2>Turn alignment into visible evidence.</h2>
        <p class="principle-body">Capture the task, assign the domain, choose the day, then finish with truth.</p>
      </div>
      <div class="career-metrics today-metrics">
        ${metricTile("Today completion", `${stats.completion}%`, `${stats.doneCount}/${stats.dueCount} due tasks complete`, "signal")}
        ${metricTile("Open work", `${Math.max(0, stats.dueCount - stats.doneCount)}`, `${stats.carryDebt} carried from earlier`, stats.carryDebt ? "amber" : "blue")}
      </div>
    </article>

    <section class="section-card task-control-panel">
      <div class="section-header">
        <div>
          <p class="section-kicker">Quick capture</p>
          <h2>Add the next visible action</h2>
        </div>
        <div class="task-date-control">
          <label class="field-label" for="task-selected-date">Viewing</label>
          <input id="task-selected-date" type="date" value="${escapeHtml(selectedTaskDate)}" data-task-selected-date />
        </div>
      </div>
      ${renderQuickTaskForm()}
    </section>

    <div class="task-toolbar">
      <div class="task-tabs" aria-label="Task views">
        ${TASK_VIEWS.map(renderTaskTab).join("")}
      </div>
      <span class="chip blue">${formatDateKey(selectedTaskDate)}</span>
    </div>

    <div class="today-layout is-execution-only">
      <div class="task-board">
        ${renderTaskBoard()}
      </div>
    </div>
  `;
}

function renderQuickTaskForm() {
  const selectedDay = getDateFromKey(selectedTaskDate).getDay();
  return `
    <div class="quick-task-grid">
      <div class="field task-title-field">
        <label class="field-label" for="quick-task-title">Task</label>
        <input id="quick-task-title" type="text" placeholder="Write the exact action" />
      </div>
      <div class="field">
        <label class="field-label" for="quick-task-domain">Domain</label>
        <select id="quick-task-domain">
          ${TASK_DOMAINS.map((domain) => `<option value="${domain}">${domain}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label class="field-label" for="quick-task-date">Date</label>
        <input id="quick-task-date" type="date" value="${escapeHtml(selectedTaskDate)}" />
      </div>
      <div class="field">
        <label class="field-label" for="quick-task-priority">Priority</label>
        <select id="quick-task-priority">
          ${TASK_PRIORITIES.map((priority) => `<option value="${priority}" ${priority === "Medium" ? "selected" : ""}>${priority}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label class="field-label" for="quick-task-repeat">Repeat</label>
        <select id="quick-task-repeat">
          <option value="none">No repeat</option>
          <option value="daily">Daily</option>
          <option value="weekdays">Weekdays</option>
          <option value="weekly">Weekly</option>
          <option value="selected">Selected days</option>
        </select>
      </div>
      <label class="toggle-line task-carry-toggle">
        <input id="quick-task-carry" type="checkbox" checked />
        <span>Carry forward if missed</span>
      </label>
      <div class="weekday-picker" aria-label="Repeat days">
        ${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
          .map(
            (label, day) => `
              <label class="weekday-option">
                <input id="quick-day-${day}" type="checkbox" ${day === selectedDay ? "checked" : ""} />
                <span>${label}</span>
              </label>
            `,
          )
          .join("")}
      </div>
      <button class="primary-button quick-task-submit" type="button" data-task-action="add">Add task</button>
    </div>
  `;
}

function renderTaskTab(view) {
  const labels = {
    today: "Today",
    inbox: "Inbox",
    upcoming: "Upcoming",
  };
  return `
    <button class="task-tab ${activeTaskView === view ? "is-active" : ""}" type="button" data-task-view="${view}">
      ${labels[view]}
    </button>
  `;
}

function renderTaskBoard() {
  if (activeTaskView === "inbox") {
    const inbox = taskState.tasks.filter(isAnytimeTask);
    return renderTaskSection("Inbox", "Unscheduled tasks waiting for a day.", inbox, selectedTaskDate);
  }

  if (activeTaskView === "upcoming") {
    const upcoming = getUpcomingTasks();
    return `
      <section class="section-card task-section">
        <div class="section-header">
          <div>
            <p class="section-kicker">Next 31 days</p>
            <h2>Upcoming</h2>
          </div>
        </div>
        <div class="task-list">
          ${upcoming.length ? upcoming.map((entry) => renderTaskCard(entry.task, entry.dateKey, "upcoming")).join("") : emptyState("Nothing scheduled in the next month.")}
        </div>
      </section>
    `;
  }

  const buckets = getTaskBuckets(selectedTaskDate);
  return `
    ${renderTaskSection("Must do", "High and critical items for this day.", buckets.mustDo, selectedTaskDate, "must")}
    ${renderTaskSection("Scheduled", "Dated and recurring work.", buckets.scheduled, selectedTaskDate)}
    ${renderTaskSection("Carryover", "Missed work that moved forward.", buckets.carryover, selectedTaskDate, "carry")}
    ${renderTaskSection("Done", "Closed evidence for this day.", buckets.done, selectedTaskDate, "done")}
  `;
}

function renderTaskSection(title, note, tasks, dateKey, tone = "") {
  return `
    <section class="section-card task-section ${tone}">
      <div class="section-header">
        <div>
          <p class="section-kicker">${escapeHtml(note)}</p>
          <h2>${escapeHtml(title)}</h2>
        </div>
        <span class="chip">${tasks.length} item${tasks.length === 1 ? "" : "s"}</span>
      </div>
      <div class="task-list">
        ${tasks.length ? tasks.map((task) => renderTaskCard(task, dateKey)).join("") : emptyState("Nothing here right now.")}
      </div>
    </section>
  `;
}

function renderTaskCard(task, dateKey, context = "today") {
  const status = getTaskStatusForDate(task, dateKey);
  const checklistStats = getTaskChecklistStats(task, dateKey);
  const done = isTaskDoneOnDate(task, dateKey);
  const statusTone = {
    active: "blue",
    done: "green",
    partial: "amber",
    missed: "red",
    carried: "amber",
  }[status] ?? "blue";

  return `
    <article class="task-card status-${status}">
      <div class="task-card-top">
        <label class="task-check-control">
          <input type="checkbox" ${done ? "checked" : ""} data-task-toggle="${task.id}" data-task-date="${dateKey}" />
          <span></span>
        </label>
        <div class="task-title-wrap">
          <input class="task-title-input" type="text" value="${escapeHtml(task.title)}" data-task-field="title" data-task-id="${task.id}" />
          <div class="chip-row">
            <span class="chip ${statusTone}">${escapeHtml(status)}</span>
            <span class="chip">${escapeHtml(task.domain)}</span>
            <span class="chip">${escapeHtml(task.priority)}</span>
            ${context === "upcoming" ? `<span class="chip blue">${formatDateKey(dateKey)}</span>` : ""}
            ${task.repeat !== "none" ? `<span class="chip signal">${escapeHtml(task.repeat)}</span>` : ""}
          </div>
        </div>
        <div class="task-actions">
          <button class="secondary-button" type="button" data-task-action="start" data-task-id="${task.id}" data-task-date="${dateKey}">Start</button>
          <button class="secondary-button" type="button" data-task-status="partial" data-task-id="${task.id}" data-task-date="${dateKey}">Partial</button>
          <button class="secondary-button" type="button" data-task-status="missed" data-task-id="${task.id}" data-task-date="${dateKey}">Missed</button>
          <button class="secondary-button" type="button" data-task-status="carried" data-task-id="${task.id}" data-task-date="${dateKey}">Carry</button>
          <button class="danger-button" type="button" data-task-action="delete" data-task-id="${task.id}">Delete</button>
        </div>
      </div>

      <div class="task-edit-grid">
        ${taskSelect("domain", "Domain", task.domain, TASK_DOMAINS, task.id)}
        ${taskSelect("priority", "Priority", task.priority, TASK_PRIORITIES, task.id)}
        ${taskSelect("type", "Type", task.type, TASK_TYPES, task.id)}
        <div class="field">
          <label class="field-label" for="task-date-${task.id}">Date</label>
          <input id="task-date-${task.id}" type="date" value="${escapeHtml(task.scheduledDate)}" data-task-field="scheduledDate" data-task-id="${task.id}" />
        </div>
        <div class="field">
          <label class="field-label" for="task-repeat-${task.id}">Repeat</label>
          <select id="task-repeat-${task.id}" data-task-field="repeat" data-task-id="${task.id}">
            <option value="none" ${task.repeat === "none" ? "selected" : ""}>No repeat</option>
            <option value="daily" ${task.repeat === "daily" ? "selected" : ""}>Daily</option>
            <option value="weekdays" ${task.repeat === "weekdays" ? "selected" : ""}>Weekdays</option>
            <option value="weekly" ${task.repeat === "weekly" ? "selected" : ""}>Weekly</option>
            <option value="selected" ${task.repeat === "selected" ? "selected" : ""}>Selected days</option>
          </select>
        </div>
        <label class="toggle-line">
          <input type="checkbox" ${task.carryForward ? "checked" : ""} data-task-carry-forward="${task.id}" />
          <span>Carry if missed</span>
        </label>
      </div>

      ${renderTaskRepeatDays(task)}

      <textarea class="task-notes" placeholder="Notes / why this matters" data-task-field="notes" data-task-id="${task.id}">${escapeHtml(task.notes)}</textarea>

      ${task.checklist.length ? `<span class="progress-track slim"><span style="width: ${checklistStats.percent}%"></span></span>` : ""}
      <div class="task-checklist">
        ${task.checklist.map((item) => renderTaskChecklistItem(task, item, dateKey)).join("")}
      </div>
      <div class="quick-add compact">
        <input type="text" id="new-task-check-${task.id}" placeholder="New checklist step" />
        <button class="secondary-button" type="button" data-task-action="add-check" data-task-id="${task.id}" data-task-date="${dateKey}">Add step</button>
      </div>
    </article>
  `;
}

function taskSelect(field, label, value, options, taskId) {
  return `
    <div class="field">
      <label class="field-label" for="task-${field}-${taskId}">${escapeHtml(label)}</label>
      <select id="task-${field}-${taskId}" data-task-field="${field}" data-task-id="${taskId}">
        ${options.map((option) => `<option value="${option}" ${value === option ? "selected" : ""}>${option}</option>`).join("")}
      </select>
    </div>
  `;
}

function renderTaskRepeatDays(task) {
  if (task.repeat !== "selected") return "";
  return `
    <div class="weekday-picker task-weekdays" aria-label="Selected repeat days">
      ${["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
        .map(
          (label, day) => `
            <button class="weekday-button ${task.repeatDays.includes(day) ? "is-active" : ""}" type="button" data-task-repeat-day="${day}" data-task-id="${task.id}">
              ${label}
            </button>
          `,
        )
        .join("")}
    </div>
  `;
}

function renderTaskChecklistItem(task, item, dateKey) {
  return `
    <div class="task-check-item">
      <input type="checkbox" ${getChecklistDone(task, item, dateKey) ? "checked" : ""} data-task-check="${item.id}" data-task-id="${task.id}" data-task-date="${dateKey}" />
      <input type="text" value="${escapeHtml(item.text)}" data-task-check-field="text" data-task-id="${task.id}" data-task-check-id="${item.id}" />
      <button class="icon-button" type="button" title="Delete checklist step" data-task-action="delete-check" data-task-id="${task.id}" data-task-check-id="${item.id}">X</button>
    </div>
  `;
}

function isHabitTask(task) {
  return task.type === "Habit" || task.type === "Routine" || task.repeat !== "none";
}

function getHabitTasks() {
  return taskState.tasks
    .filter(isHabitTask)
    .sort((a, b) => a.domain.localeCompare(b.domain) || a.title.localeCompare(b.title));
}

function isHabitDueOnDate(task, dateKey) {
  return isTaskScheduledForDate(task, dateKey);
}

function getHabitCellState(task, dateKey) {
  if (!isHabitDueOnDate(task, dateKey)) return "off";
  const status = getTaskStatusForDate(task, dateKey);
  if (isTaskDoneOnDate(task, dateKey)) return "done";
  if (status === "partial") return "partial";
  if (status === "missed") return "missed";
  if (status === "carried") return "carried";
  return dateKey < toDateKey() ? "open-past" : "open";
}

function clampPercent(value) {
  return Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
}

function getHabitMetric(task) {
  return normalizeHabitMetric(task.habitMetric);
}

function getHabitRecordValue(task, dateKey) {
  const raw = getTaskRecord(task, dateKey).value;
  if (raw === "" || raw === null || raw === undefined) return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

function formatHabitNumber(value) {
  const safeValue = Number(value) || 0;
  return Number.isInteger(safeValue) ? String(safeValue) : safeValue.toFixed(1).replace(/\.0$/, "");
}

function formatHabitQuantity(value, unit) {
  return `${formatHabitNumber(value)} ${escapeHtml(unit)}`;
}

function getHabitPeriodDateKeys(period, includeFuture = false) {
  const today = new Date();
  const todayKey = toDateKey(today);
  let start = today;
  let end = today;

  if (period === "week") {
    start = addDays(today, -today.getDay());
    end = includeFuture ? addDays(start, 6) : today;
  }

  if (period === "month") {
    start = new Date(today.getFullYear(), today.getMonth(), 1);
    end = includeFuture ? new Date(today.getFullYear(), today.getMonth() + 1, 0) : today;
  }

  const days = [];
  for (let cursor = new Date(start); toDateKey(cursor) <= toDateKey(end); cursor = addDays(cursor, 1)) {
    const dateKey = toDateKey(cursor);
    if (includeFuture || dateKey <= todayKey) days.push(dateKey);
  }
  return days;
}

function getHabitPeriodPace(task) {
  const metric = getHabitMetric(task);
  const todayKey = toDateKey();
  const periodKeys = getHabitPeriodDateKeys(metric.period, true);
  const elapsedKeys = periodKeys.filter((dateKey) => dateKey <= todayKey);
  const duePeriodKeys = periodKeys.filter((dateKey) => isHabitDueOnDate(task, dateKey));
  const dueElapsedKeys = duePeriodKeys.filter((dateKey) => dateKey <= todayKey);
  const target = metric.target;
  const progress = metric.unit === "checks"
    ? dueElapsedKeys.filter((dateKey) => isTaskDoneOnDate(task, dateKey)).length
    : dueElapsedKeys.reduce((sum, dateKey) => sum + (getHabitRecordValue(task, dateKey) || 0), 0);
  const elapsedRatio = duePeriodKeys.length ? dueElapsedKeys.length / duePeriodKeys.length : 1;
  const expected = metric.period === "day" ? target : target * elapsedRatio;
  const progressPercent = metric.direction === "at-most"
    ? (progress <= target ? 100 : (target / Math.max(progress, 1)) * 100)
    : (progress / target) * 100;
  const expectedPercent = metric.direction === "at-most"
    ? 100
    : (expected / target) * 100;
  const remaining = metric.direction === "at-most"
    ? Math.max(0, target - progress)
    : Math.max(0, target - progress);
  const status = metric.direction === "at-most"
    ? (progress <= target ? "Within limit" : "Over limit")
    : (progress >= expected ? "Ahead" : "Behind");

  return {
    metric,
    target,
    progress,
    expected,
    remaining,
    status,
    progressPercent: clampPercent(progressPercent),
    expectedPercent: clampPercent(expectedPercent),
    dueElapsed: dueElapsedKeys.length,
    dueTotal: duePeriodKeys.length,
  };
}

function getHabitStrengthSeries(task, days = 56, seedDays = 120) {
  const todayKey = toDateKey();
  const allDates = getDateKeysBack(days + seedDays);
  const visibleStart = allDates.length - days;
  const series = [];
  let score = 0;

  allDates.forEach((dateKey, index) => {
    if (dateKey <= todayKey && isHabitDueOnDate(task, dateKey)) {
      const state = getHabitCellState(task, dateKey);
      if (state === "done") {
        score += (100 - score) * 0.13;
      } else if (state === "partial") {
        score += (58 - score) * 0.1;
      } else if (state === "missed" || state === "open-past" || state === "carried") {
        score *= 0.93;
      }
      score = Math.max(0, Math.min(100, score));
    }

    if (index >= visibleStart) {
      series.push({ dateKey, score: Math.round(score) });
    }
  });

  return series;
}

function getHabitStrengthScore(task) {
  const series = getHabitStrengthSeries(task, 1, 365);
  return series[0]?.score || 0;
}

function getHabitSparklinePoints(values, width = 220, height = 86) {
  if (!values.length) return "";
  const step = values.length > 1 ? width / (values.length - 1) : width;
  return values
    .map((value, index) => {
      const x = Math.round(index * step);
      const y = Math.round(height - (clampPercent(value) / 100) * height);
      return `${x},${y}`;
    })
    .join(" ");
}

function getHabitDriftStats(task, days = 60) {
  const counts = {};
  getDateKeysBack(days).forEach((dateKey) => {
    if (!isHabitDueOnDate(task, dateKey) || dateKey > toDateKey()) return;
    const state = getHabitCellState(task, dateKey);
    if (!["missed", "open-past", "carried"].includes(state)) return;
    const reason = getTaskRecord(task, dateKey).driftReason || "Unlabeled drift";
    counts[reason] = (counts[reason] || 0) + 1;
  });
  return Object.entries(counts)
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count || a.reason.localeCompare(b.reason));
}

function getHabitStats(task, days = activeHabitRange) {
  const todayKey = toDateKey();
  const dates = getDateKeysBack(days);
  const dueDates = dates.filter((dateKey) => isHabitDueOnDate(task, dateKey) && dateKey <= todayKey);
  const doneDates = dueDates.filter((dateKey) => isTaskDoneOnDate(task, dateKey));
  const partialDates = dueDates.filter((dateKey) => getTaskStatusForDate(task, dateKey) === "partial");
  const missedDates = dueDates.filter((dateKey) => getTaskStatusForDate(task, dateKey) === "missed");
  const openDates = dueDates.filter((dateKey) => {
    const state = getHabitCellState(task, dateKey);
    return state === "open" || state === "open-past" || state === "carried";
  });
  const streaks = getHabitStreaks(task);
  const successRate = dueDates.length ? Math.round((doneDates.length / dueDates.length) * 100) : 0;
  const strength = getHabitStrengthScore(task);

  return {
    due: dueDates.length,
    done: doneDates.length,
    partial: partialDates.length,
    missed: missedDates.length,
    open: openDates.length,
    successRate,
    strength,
    currentStreak: streaks.current,
    bestStreak: streaks.best,
    todayDue: isHabitDueOnDate(task, todayKey),
    todayDone: isTaskDoneOnDate(task, todayKey),
    todayState: getHabitCellState(task, todayKey),
  };
}

function getHabitStreaks(task) {
  const todayKey = toDateKey();
  const dueDates = getDateKeysBack(365).filter((dateKey) => isHabitDueOnDate(task, dateKey) && dateKey <= todayKey);
  let current = 0;
  let best = 0;
  let run = 0;

  dueDates.forEach((dateKey) => {
    if (isTaskDoneOnDate(task, dateKey)) {
      run += 1;
      best = Math.max(best, run);
    } else {
      run = 0;
    }
  });

  for (let index = dueDates.length - 1; index >= 0; index -= 1) {
    if (!isTaskDoneOnDate(task, dueDates[index])) break;
    current += 1;
  }

  return { current, best };
}

function getHabitOverviewStats(habits, days = activeHabitRange) {
  const todayKey = toDateKey();
  const dueToday = habits.filter((task) => isHabitDueOnDate(task, todayKey));
  const doneToday = dueToday.filter((task) => isTaskDoneOnDate(task, todayKey));
  const rangeStats = habits.map((task) => getHabitStats(task, days));
  const totalDue = rangeStats.reduce((sum, item) => sum + item.due, 0);
  const totalDone = rangeStats.reduce((sum, item) => sum + item.done, 0);
  const openToday = dueToday.filter((task) => !isTaskDoneOnDate(task, todayKey)).length;
  const currentStreak = Math.max(0, ...rangeStats.map((item) => item.currentStreak));
  const bestStreak = Math.max(0, ...rangeStats.map((item) => item.bestStreak));
  const strengthAverage = averageNumbers(rangeStats.map((item) => item.strength));

  return {
    totalHabits: habits.length,
    dueToday: dueToday.length,
    doneToday: doneToday.length,
    openToday,
    rangeSuccess: totalDue ? Math.round((totalDone / totalDue) * 100) : 0,
    strengthAverage,
    currentStreak,
    bestStreak,
  };
}

function getHabitDomainStats(habits, days = activeHabitRange) {
  return TASK_DOMAINS.map((domain) => {
    const stats = habits
      .filter((task) => task.domain === domain)
      .map((task) => getHabitStats(task, days));
    const due = stats.reduce((sum, item) => sum + item.due, 0);
    const done = stats.reduce((sum, item) => sum + item.done, 0);
    return {
      domain,
      habits: stats.length,
      due,
      done,
      percent: due ? Math.round((done / due) * 100) : 0,
    };
  }).filter((item) => item.habits > 0);
}

function getHabitWeekdayStats(task, days = 90) {
  const rows = Array.from({ length: 7 }, (_, day) => ({
    day,
    label: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][day],
    due: 0,
    done: 0,
  }));

  getDateKeysBack(days).forEach((dateKey) => {
    if (!isHabitDueOnDate(task, dateKey) || dateKey > toDateKey()) return;
    const day = getDateFromKey(dateKey).getDay();
    rows[day].due += 1;
    if (isTaskDoneOnDate(task, dateKey)) rows[day].done += 1;
  });

  return rows.map((row) => ({
    ...row,
    percent: row.due ? Math.round((row.done / row.due) * 100) : 0,
  }));
}

function getHabitMindCorrelation(task, days = 60) {
  const rows = getDateKeysBack(days)
    .filter((dateKey) => isHabitDueOnDate(task, dateKey) && journalState.entries[dateKey])
    .map((dateKey) => {
      const entry = journalState.entries[dateKey];
      return {
        done: isTaskDoneOnDate(task, dateKey),
        focus: Number(entry.state.focus || 0) * 10,
        energy: Number(entry.state.energy || 0) * 10,
        containment: getContainmentScore(entry, dateKey),
      };
    });
  const doneRows = rows.filter((row) => row.done);
  const missedRows = rows.filter((row) => !row.done);
  return {
    doneFocus: averageNumbers(doneRows.map((row) => row.focus)),
    missedFocus: averageNumbers(missedRows.map((row) => row.focus)),
    doneEnergy: averageNumbers(doneRows.map((row) => row.energy)),
    missedEnergy: averageNumbers(missedRows.map((row) => row.energy)),
    doneContainment: averageNumbers(doneRows.map((row) => row.containment)),
    missedContainment: averageNumbers(missedRows.map((row) => row.containment)),
  };
}

function ensureSelectedHabit(habits) {
  if (!habits.length) {
    selectedHabitId = null;
    return null;
  }
  if (!selectedHabitId || !habits.some((task) => task.id === selectedHabitId)) {
    selectedHabitId = habits[0].id;
  }
  return habits.find((task) => task.id === selectedHabitId) || habits[0];
}

function renderHabitView() {
  const habits = getHabitTasks();
  const selectedHabit = ensureSelectedHabit(habits);
  const overview = getHabitOverviewStats(habits, activeHabitRange);
  const dates = getDateKeysBack(activeHabitRange);

  habitsView.innerHTML = `
    <article class="habit-hero">
      <div>
        <p class="section-kicker">Habit tracker</p>
        <h2>Build proof one visible repetition at a time.</h2>
        <p class="principle-body">Habits are powered by the same records as Today. One check updates the whole system.</p>
      </div>
      <div class="career-metrics habit-metrics">
        ${metricTile("Today habits", `${overview.doneToday}/${overview.dueToday}`, `${overview.openToday} open checks`, "signal")}
        ${metricTile("Strength avg", `${overview.strengthAverage}%`, "Forgiving rolling discipline score", "blue")}
      </div>
    </article>

    <section class="section-card habit-control-panel">
      <div class="section-header">
        <div>
          <p class="section-kicker">Create and inspect</p>
          <h2>Habit command strip</h2>
        </div>
        <div class="habit-range-switch" aria-label="Habit range">
          ${HABIT_RANGES.map((range) => `
            <button class="habit-range-button ${activeHabitRange === range ? "is-active" : ""}" type="button" data-habit-range="${range}">
              ${range}d
            </button>
          `).join("")}
        </div>
      </div>
      ${renderHabitQuickAdd()}
    </section>

    <div class="habit-layout">
      <div class="habit-main">
        ${renderHabitMatrix(habits, dates)}
        ${renderHabitCards(habits)}
      </div>
      <aside class="section-stack habit-side">
        ${renderHabitDetail(selectedHabit)}
      </aside>
    </div>
  `;
}

function renderHabitQuickAdd() {
  return `
    <div class="habit-add-grid">
      <div class="field habit-title-field">
        <label class="field-label" for="habit-title">Habit</label>
        <input id="habit-title" type="text" placeholder="Example: Walk after lunch" />
      </div>
      <div class="field">
        <label class="field-label" for="habit-domain">Domain</label>
        <select id="habit-domain">
          ${TASK_DOMAINS.map((domain) => `<option value="${domain}">${domain}</option>`).join("")}
        </select>
      </div>
      <div class="field">
        <label class="field-label" for="habit-repeat">Repeat</label>
        <select id="habit-repeat">
          <option value="daily">Daily</option>
          <option value="weekdays">Weekdays</option>
          <option value="weekly">Weekly</option>
          <option value="selected">Selected days</option>
        </select>
      </div>
      <button class="primary-button habit-add-button" type="button" data-habit-action="add">Add habit</button>
    </div>
  `;
}

function renderHabitMatrix(habits, dates) {
  if (!habits.length) {
    return `
      <section class="section-card">
        <div class="section-header">
          <div>
            <p class="section-kicker">Visual tracker</p>
            <h2>Habit matrix</h2>
          </div>
        </div>
        ${emptyState("No habits yet. Add one above, or turn any recurring task into type Habit.")}
      </section>
    `;
  }

  return `
    <section class="section-card">
      <div class="section-header">
        <div>
          <p class="section-kicker">${activeHabitRange} days</p>
          <h2>Habit matrix</h2>
        </div>
        <span class="chip signal">Shared task records</span>
      </div>
      <div class="habit-matrix-scroll">
        <div class="habit-matrix" style="--habit-days: ${dates.length}">
          <div class="habit-matrix-row habit-matrix-head">
            <span>Habit</span>
            ${dates.map(renderHabitDateHead).join("")}
          </div>
          ${habits.map((task) => renderHabitMatrixRow(task, dates)).join("")}
        </div>
      </div>
      <div class="habit-legend">
        <span><i class="done"></i>Done</span>
        <span><i class="partial"></i>Partial</span>
        <span><i class="missed"></i>Missed</span>
        <span><i class="open"></i>Due</span>
        <span><i class="off"></i>Off</span>
      </div>
    </section>
  `;
}

function renderHabitDateHead(dateKey) {
  const date = getDateFromKey(dateKey);
  return `
    <span class="habit-date-head" title="${dateKey}">
      <em>${new Intl.DateTimeFormat(undefined, { weekday: "narrow" }).format(date)}</em>
      <b>${new Intl.DateTimeFormat(undefined, { day: "numeric" }).format(date)}</b>
    </span>
  `;
}

function renderHabitMatrixRow(task, dates) {
  const stats = getHabitStats(task, activeHabitRange);
  const isSelected = task.id === selectedHabitId;
  return `
    <div class="habit-matrix-row">
      <button class="habit-row-label ${isSelected ? "is-selected" : ""}" type="button" data-habit-select="${task.id}">
        <strong>${escapeHtml(task.title)}</strong>
        <span>${escapeHtml(task.domain)} - ${stats.successRate}% - ${stats.currentStreak}d</span>
      </button>
      ${dates.map((dateKey) => renderHabitCell(task, dateKey)).join("")}
    </div>
  `;
}

function renderHabitCell(task, dateKey) {
  const state = getHabitCellState(task, dateKey);
  const disabled = state === "off";
  const status = disabled ? "not scheduled" : state.replace("-", " ");
  return `
    <button
      class="habit-cell ${state}"
      type="button"
      ${disabled ? "disabled" : ""}
      data-habit-cell="${task.id}"
      data-habit-date="${dateKey}"
      title="${escapeHtml(`${task.title} - ${dateKey} - ${status}`)}"
      aria-label="${escapeHtml(`${task.title} ${dateKey} ${status}`)}"
    ></button>
  `;
}

function renderHabitCards(habits) {
  return `
    <section class="section-card">
      <div class="section-header">
        <div>
          <p class="section-kicker">Active protocols</p>
          <h2>Habit cards</h2>
        </div>
      </div>
      <div class="habit-card-grid">
        ${habits.length ? habits.map(renderHabitCard).join("") : emptyState("No active habits yet.")}
      </div>
    </section>
  `;
}

function renderHabitCard(task) {
  const stats = getHabitStats(task, 30);
  const dates = getDateKeysBack(14);
  const todayDisabled = stats.todayDue ? "" : "disabled";
  const pace = getHabitPeriodPace(task);
  return `
    <article class="habit-card ${task.id === selectedHabitId ? "is-selected" : ""}">
      <button class="habit-card-main" type="button" data-habit-select="${task.id}">
        <span class="habit-card-top">
          <strong>${escapeHtml(task.title)}</strong>
          <em>${stats.strength}%</em>
        </span>
        <span class="meta">${escapeHtml(task.domain)} - ${escapeHtml(task.repeat)} - ${stats.successRate}% rate - ${stats.currentStreak} day streak</span>
      </button>
      <div class="habit-card-proof">
        <span>Strength</span>
        <b>${stats.strength}%</b>
        <span class="progress-track slim"><span style="width: ${stats.strength}%"></span></span>
      </div>
      <div class="habit-card-proof">
        <span>${escapeHtml(pace.metric.period)} pace</span>
        <b>${formatHabitQuantity(pace.progress, pace.metric.unit)}</b>
        <span class="progress-track slim"><span style="width: ${pace.progressPercent}%"></span></span>
      </div>
      <div class="habit-mini-strip" aria-label="Last 14 days">
        ${dates.map((dateKey) => `<span class="${getHabitCellState(task, dateKey)}" title="${dateKey}"></span>`).join("")}
      </div>
      <div class="habit-card-actions">
        <button class="secondary-button" type="button" ${todayDisabled} data-habit-status="done" data-task-id="${task.id}" data-task-date="${toDateKey()}">Done</button>
        <button class="secondary-button" type="button" ${todayDisabled} data-habit-status="partial" data-task-id="${task.id}" data-task-date="${toDateKey()}">Partial</button>
        <button class="secondary-button" type="button" ${todayDisabled} data-habit-status="missed" data-task-id="${task.id}" data-task-date="${toDateKey()}">Missed</button>
      </div>
    </article>
  `;
}

function renderHabitDetail(task) {
  if (!task) {
    return `
      <section class="section-card">
        <div class="section-header">
          <div>
            <p class="section-kicker">Selected habit</p>
            <h2>No habit selected</h2>
          </div>
        </div>
        ${emptyState("Create a habit to see its detail panel.")}
      </section>
    `;
  }

  const stats = getHabitStats(task, 90);
  const correlation = getHabitMindCorrelation(task);
  const todayDisabled = stats.todayDue ? "" : "disabled";
  return `
    <section class="section-card habit-detail-card">
      <div class="section-header">
        <div>
          <p class="section-kicker">Selected habit</p>
          <h2>${escapeHtml(task.title)}</h2>
        </div>
        <span class="chip ${stats.todayDone ? "green" : stats.todayDue ? "amber" : "blue"}">${stats.todayDue ? stats.todayState.replace("-", " ") : "off today"}</span>
      </div>

      <div class="habit-detail-stats">
        <div><strong>${stats.currentStreak}</strong><span>current</span></div>
        <div><strong>${stats.bestStreak}</strong><span>best</span></div>
        <div><strong>${stats.successRate}%</strong><span>90d rate</span></div>
        <div><strong>${stats.done}/${stats.due}</strong><span>closed</span></div>
      </div>

      <div class="habit-status-actions">
        <button class="primary-button" type="button" ${todayDisabled} data-habit-status="done" data-task-id="${task.id}" data-task-date="${toDateKey()}">Mark done today</button>
        <button class="secondary-button" type="button" ${todayDisabled} data-habit-status="partial" data-task-id="${task.id}" data-task-date="${toDateKey()}">Partial</button>
        <button class="secondary-button" type="button" ${todayDisabled} data-habit-status="missed" data-task-id="${task.id}" data-task-date="${toDateKey()}">Missed</button>
        <button class="secondary-button" type="button" ${todayDisabled} data-habit-status="active" data-task-id="${task.id}" data-task-date="${toDateKey()}">Clear</button>
      </div>

      ${renderHabitTodayValuePanel(task)}
      ${renderHabitPacePanel(task)}
      ${renderHabitStrengthCurve(task)}

      <div class="task-edit-grid habit-edit-grid">
        ${taskSelect("domain", "Domain", task.domain, TASK_DOMAINS, task.id)}
        ${taskSelect("priority", "Weight", task.priority, TASK_PRIORITIES, task.id)}
        ${taskSelect("type", "Type", task.type, TASK_TYPES, task.id)}
        <div class="field">
          <label class="field-label" for="habit-repeat-${task.id}">Repeat</label>
          <select id="habit-repeat-${task.id}" data-task-field="repeat" data-task-id="${task.id}">
            <option value="none" ${task.repeat === "none" ? "selected" : ""}>No repeat</option>
            <option value="daily" ${task.repeat === "daily" ? "selected" : ""}>Daily</option>
            <option value="weekdays" ${task.repeat === "weekdays" ? "selected" : ""}>Weekdays</option>
            <option value="weekly" ${task.repeat === "weekly" ? "selected" : ""}>Weekly</option>
            <option value="selected" ${task.repeat === "selected" ? "selected" : ""}>Selected days</option>
          </select>
        </div>
      </div>
      ${renderTaskRepeatDays(task)}
      ${renderHabitMetricEditor(task)}
      <textarea class="task-notes" placeholder="Why this habit matters" data-task-field="notes" data-task-id="${task.id}">${escapeHtml(task.notes)}</textarea>

      <div>
        <h3>42-day calendar</h3>
        ${renderHabitCalendar(task, 42)}
      </div>

      <div>
        <h3>Weekday pattern</h3>
        ${renderHabitWeekdayPattern(task)}
      </div>

      ${renderHabitDriftPanel(task)}

      <div class="habit-correlation-card">
        <strong>Mind correlation</strong>
        <p class="meta">Done days: focus ${correlation.doneFocus}%, energy ${correlation.doneEnergy}%, containment ${correlation.doneContainment}%.</p>
        <p class="meta">Missed/open days: focus ${correlation.missedFocus}%, energy ${correlation.missedEnergy}%, containment ${correlation.missedContainment}%.</p>
      </div>
    </section>
  `;
}

function renderHabitTodayValuePanel(task) {
  const todayKey = toDateKey();
  const metric = getHabitMetric(task);
  const value = getHabitRecordValue(task, todayKey);
  const disabled = isHabitDueOnDate(task, todayKey) ? "" : "disabled";
  const targetLabel = `${metric.direction === "at-most" ? "Limit" : "Target"} ${formatHabitQuantity(metric.target, metric.unit)} / ${metric.period}`;
  return `
    <div class="habit-log-panel">
      <div>
        <strong>Today measurement</strong>
        <p class="meta">${targetLabel}</p>
      </div>
      <div class="habit-log-controls">
        <input id="habit-value-${task.id}" type="number" step="0.1" min="0" ${disabled} value="${value ?? ""}" placeholder="${escapeHtml(metric.unit)}" />
        <button class="secondary-button" type="button" ${disabled} data-habit-action="save-value" data-task-id="${task.id}" data-task-date="${todayKey}">Save value</button>
      </div>
    </div>
  `;
}

function renderHabitPacePanel(task) {
  const pace = getHabitPeriodPace(task);
  const label = pace.metric.direction === "at-most" ? "Pace vs limit" : "Pace vs promise";
  const secondary = pace.metric.direction === "at-most"
    ? `${formatHabitQuantity(pace.remaining, pace.metric.unit)} left`
    : `${formatHabitQuantity(pace.expected, pace.metric.unit)} expected now`;
  return `
    <div class="habit-pace-panel ${pace.status === "Behind" || pace.status === "Over limit" ? "needs-attention" : ""}">
      <div class="habit-panel-head">
        <div>
          <strong>${label}</strong>
          <p class="meta">${escapeHtml(pace.metric.period)} target - ${secondary}</p>
        </div>
        <span class="chip ${pace.status === "Behind" || pace.status === "Over limit" ? "amber" : "green"}">${escapeHtml(pace.status)}</span>
      </div>
      <div class="habit-pace-bar" style="--pace: ${pace.progressPercent}%; --expected: ${pace.expectedPercent}%">
        <span></span>
        <i title="Expected progress"></i>
      </div>
      <div class="habit-pace-stats">
        <div><strong>${formatHabitQuantity(pace.progress, pace.metric.unit)}</strong><span>actual</span></div>
        <div><strong>${formatHabitQuantity(pace.target, pace.metric.unit)}</strong><span>${pace.metric.direction === "at-most" ? "limit" : "promise"}</span></div>
        <div><strong>${pace.dueElapsed}/${pace.dueTotal || pace.dueElapsed}</strong><span>due days</span></div>
      </div>
    </div>
  `;
}

function renderHabitStrengthCurve(task) {
  const series = getHabitStrengthSeries(task, 56);
  const values = series.map((item) => item.score);
  const points = getHabitSparklinePoints(values);
  const areaPoints = points ? `0,86 ${points} 220,86` : "";
  const score = values.at(-1) || 0;
  const latest = series.at(-1)?.dateKey || toDateKey();
  return `
    <div class="habit-strength-panel">
      <div class="habit-panel-head">
        <div>
          <strong>Discipline strength curve</strong>
          <p class="meta">Forgives small misses, punishes repeated drift.</p>
        </div>
        <span class="chip ${score >= 70 ? "green" : score >= 40 ? "amber" : "blue"}">${score}%</span>
      </div>
      <svg class="habit-strength-svg" viewBox="0 0 220 86" preserveAspectRatio="none" role="img" aria-label="Habit strength through ${latest}">
        <line x1="0" y1="22" x2="220" y2="22"></line>
        <line x1="0" y1="56" x2="220" y2="56"></line>
        ${areaPoints ? `<polygon points="${areaPoints}"></polygon>` : ""}
        ${points ? `<polyline points="${points}"></polyline>` : ""}
      </svg>
      <div class="habit-strength-scale">
        <span>fragile</span>
        <span>forming</span>
        <span>stable</span>
      </div>
    </div>
  `;
}

function renderHabitMetricEditor(task) {
  const metric = getHabitMetric(task);
  return `
    <div class="habit-measure-grid">
      <div class="field">
        <label class="field-label" for="habit-metric-target-${task.id}">Measure target</label>
        <input id="habit-metric-target-${task.id}" type="number" min="0.1" step="0.1" value="${metric.target}" data-habit-metric-field="target" data-task-id="${task.id}" />
      </div>
      <div class="field">
        <label class="field-label" for="habit-metric-unit-${task.id}">Unit</label>
        <input id="habit-metric-unit-${task.id}" type="text" value="${escapeHtml(metric.unit)}" data-habit-metric-field="unit" data-task-id="${task.id}" />
      </div>
      <div class="field">
        <label class="field-label" for="habit-metric-period-${task.id}">Period</label>
        <select id="habit-metric-period-${task.id}" data-habit-metric-field="period" data-task-id="${task.id}">
          <option value="day" ${metric.period === "day" ? "selected" : ""}>Per day</option>
          <option value="week" ${metric.period === "week" ? "selected" : ""}>Per week</option>
          <option value="month" ${metric.period === "month" ? "selected" : ""}>Per month</option>
        </select>
      </div>
      <div class="field">
        <label class="field-label" for="habit-metric-direction-${task.id}">Rule</label>
        <select id="habit-metric-direction-${task.id}" data-habit-metric-field="direction" data-task-id="${task.id}">
          <option value="at-least" ${metric.direction === "at-least" ? "selected" : ""}>At least</option>
          <option value="at-most" ${metric.direction === "at-most" ? "selected" : ""}>At most</option>
        </select>
      </div>
    </div>
  `;
}

function renderHabitDriftPanel(task) {
  const todayKey = toDateKey();
  const todayReason = getTaskRecord(task, todayKey).driftReason || "";
  const drift = getHabitDriftStats(task);
  const max = Math.max(1, ...drift.map((item) => item.count));
  const disabled = isHabitDueOnDate(task, todayKey) ? "" : "disabled";
  return `
    <div class="habit-drift-panel">
      <div class="habit-panel-head">
        <div>
          <strong>Drift cause log</strong>
          <p class="meta">Mark why a habit broke so the pattern becomes visible.</p>
        </div>
      </div>
      <div class="field">
        <label class="field-label" for="habit-drift-${task.id}">Today reason</label>
        <select id="habit-drift-${task.id}" ${disabled} data-habit-record-field="driftReason" data-task-id="${task.id}" data-task-date="${todayKey}">
          <option value="" ${todayReason ? "" : "selected"}>No reason set</option>
          ${HABIT_DRIFT_REASONS.map((reason) => `<option value="${reason}" ${todayReason === reason ? "selected" : ""}>${reason}</option>`).join("")}
        </select>
      </div>
      <div class="habit-drift-list">
        ${drift.length ? drift.slice(0, 5).map((item) => `
          <div class="habit-drift-row">
            <strong>${escapeHtml(item.reason)}</strong>
            <span class="progress-track slim"><span style="width: ${Math.round((item.count / max) * 100)}%"></span></span>
            <em>${item.count}</em>
          </div>
        `).join("") : `<p class="meta">No drift reasons logged yet.</p>`}
      </div>
    </div>
  `;
}

function renderHabitCalendar(task, days) {
  return `
    <div class="habit-calendar">
      ${getDateKeysBack(days).map((dateKey) => `
        <button
          class="habit-calendar-day ${getHabitCellState(task, dateKey)}"
          type="button"
          ${isHabitDueOnDate(task, dateKey) ? "" : "disabled"}
          data-habit-cell="${task.id}"
          data-habit-date="${dateKey}"
          title="${dateKey}"
        >
          ${new Intl.DateTimeFormat(undefined, { day: "numeric" }).format(getDateFromKey(dateKey))}
        </button>
      `).join("")}
    </div>
  `;
}

function renderHabitWeekdayPattern(task) {
  return `
    <div class="habit-weekday-list">
      ${getHabitWeekdayStats(task).map((row) => `
        <div class="habit-weekday-row">
          <strong>${row.label}</strong>
          <span class="progress-track slim"><span style="width: ${row.percent}%"></span></span>
          <em>${row.due ? `${row.percent}%` : "off"}</em>
        </div>
      `).join("")}
    </div>
  `;
}

function renderHabitDomainRow(item) {
  return `
    <div class="progress-domain-row">
      <div>
        <strong>${escapeHtml(item.domain)}</strong>
        <p class="meta">${item.done}/${item.due} habit checks - ${item.habits} habit${item.habits === 1 ? "" : "s"}</p>
      </div>
      <div class="domain-progress">
        <span>${item.percent}%</span>
        <span class="progress-track slim"><span style="width: ${item.percent}%"></span></span>
      </div>
    </div>
  `;
}

function getJournalEntry(dateKey = selectedJournalDate) {
  if (!journalState.entries[dateKey]) {
    journalState.entries[dateKey] = createJournalEntry(dateKey);
    saveJournal();
  }
  return journalState.entries[dateKey];
}

function getJournalTaskSummary(dateKey) {
  const buckets = getTaskBuckets(dateKey);
  const due = getDueTasksForDate(dateKey);
  return {
    stats: getTaskStats(dateKey),
    completed: buckets.done,
    missed: due.filter((task) => getTaskStatusForDate(task, dateKey) === "missed"),
    partial: due.filter((task) => getTaskStatusForDate(task, dateKey) === "partial"),
    carried: buckets.carryover,
  };
}

function getContainmentScore(entry, dateKey) {
  const taskSummary = getJournalTaskSummary(dateKey);
  const resolvedThoughts = entry.mindDump.filter((item) => item.decision !== "Unsorted").length;
  const thoughtScore = entry.mindDump.length ? Math.round((resolvedThoughts / entry.mindDump.length) * 20) : 14;
  const stateScore = Math.round(
    ((entry.state.clarity + entry.state.focus + entry.state.spiritualSteadiness + (11 - entry.state.agitation)) / 40) * 22,
  );
  const truthScore = ["trigger", "thought", "truth", "nextAction"].filter((field) => entry.truthFilter[field]?.trim()).length * 5;
  const shutdownScore = ["bestAction", "driftReason", "correction", "tomorrowProtect"].filter((field) => entry.shutdown[field]?.trim()).length * 4;
  const top3Score = entry.tomorrowTop3.filter((item) => item.trim()).length * 4;
  const arriveScore = entry.arriveDone ? 6 : 0;
  const taskScore = Math.round((taskSummary.stats.completion / 100) * 14);
  const sealedScore = entry.sealedAt ? 10 : 0;
  return Math.min(100, thoughtScore + stateScore + truthScore + shutdownScore + top3Score + arriveScore + taskScore + sealedScore);
}

function renderJournalView() {
  const entry = getJournalEntry(selectedJournalDate);
  const taskSummary = getJournalTaskSummary(selectedJournalDate);
  const score = getContainmentScore(entry, selectedJournalDate);
  const unresolved = entry.mindDump.filter((item) => item.decision === "Unsorted").length;

  journalView.innerHTML = `
    <article class="journal-hero">
      <div>
        <p class="section-kicker">Mind containment</p>
        <h2>Close the open loops before they become tomorrow's noise.</h2>
        <p class="principle-body">Arrive, name the state, sort the mind, tell the truth, close the day.</p>
      </div>
      <div class="career-metrics journal-metrics">
        ${metricTile("Containment", `${score}%`, entry.sealedAt ? "Day sealed" : "Still open", "signal")}
        ${metricTile("Open thoughts", `${unresolved}`, "Unsorted mind-dump items", unresolved ? "amber" : "blue")}
      </div>
    </article>

    <section class="section-card journal-date-card">
      <div class="section-header">
        <div>
          <p class="section-kicker">Daily record</p>
          <h2>${formatDateKey(selectedJournalDate)}</h2>
        </div>
        <div class="task-date-control">
          <label class="field-label" for="journal-selected-date">Viewing</label>
          <input id="journal-selected-date" type="date" value="${escapeHtml(selectedJournalDate)}" data-journal-selected-date />
        </div>
      </div>
    </section>

    <div class="journal-layout">
      <div class="journal-main">
        ${renderArrivePanel(entry)}
        ${renderStatePanel(entry)}
        ${renderMindDumpPanel(entry)}
        ${renderTruthFilterPanel(entry)}
        ${renderShutdownPanel(entry, taskSummary)}
      </div>
      <aside class="section-stack journal-side">
        ${renderTaskTruthPanel(taskSummary)}
        ${renderPatternPanel(entry)}
        ${renderJournalHistoryPanel()}
      </aside>
    </div>
  `;
}

function renderArrivePanel(entry) {
  return `
    <section class="section-card containment-card">
      <div class="section-header">
        <div>
          <p class="section-kicker">Arrive</p>
          <h2>60-second nervous-system reset</h2>
        </div>
        <span class="chip ${entry.arriveDone ? "green" : "blue"}">${entry.arriveDone ? "Done" : "Open"}</span>
      </div>
      <div class="breath-grid">
        ${["Exhale fully", "Breathe slow", "Name the strongest feeling", "Choose the next honest line"]
          .map((item, index) => `<div class="breath-step"><span>${index + 1}</span><p>${item}</p></div>`)
          .join("")}
      </div>
      <label class="toggle-line">
        <input type="checkbox" ${entry.arriveDone ? "checked" : ""} data-journal-arrive />
        <span>I have arrived before analyzing.</span>
      </label>
    </section>
  `;
}

function renderStatePanel(entry) {
  return `
    <section class="section-card">
      <div class="section-header">
        <div>
          <p class="section-kicker">State check</p>
          <h2>What is the mind carrying?</h2>
        </div>
      </div>
      <div class="state-grid">
        ${STATE_METRICS.map(([field, label]) => renderStateMetric(entry, field, label)).join("")}
      </div>
    </section>
  `;
}

function renderStateMetric(entry, field, label) {
  const value = Number(entry.state[field] || 5);
  return `
    <label class="state-metric">
      <span><strong>${escapeHtml(label)}</strong><em>${value}/10</em></span>
      <input type="range" min="1" max="10" value="${value}" data-journal-state="${field}" />
    </label>
  `;
}

function renderMindDumpPanel(entry) {
  return `
    <section class="section-card">
      <div class="section-header">
        <div>
          <p class="section-kicker">Mind dump</p>
          <h2>Sort every open loop</h2>
        </div>
      </div>
      <div class="mind-add-grid">
        <select id="mind-category">
          ${MIND_CATEGORIES.map((category) => `<option value="${category}">${category}</option>`).join("")}
        </select>
        <input id="mind-text" type="text" placeholder="What is repeating in the mind?" />
        <button class="primary-button" type="button" data-journal-action="add-mind">Add thought</button>
      </div>
      <div class="mind-list">
        ${entry.mindDump.length ? entry.mindDump.map(renderMindDumpItem).join("") : emptyState("No open loops captured yet.")}
      </div>
    </section>
  `;
}

function renderMindDumpItem(item) {
  const decisionTone = item.decision === "Unsorted" ? "amber" : "green";
  return `
    <article class="mind-item">
      <div class="mind-item-main">
        <span class="chip blue">${escapeHtml(item.category)}</span>
        <input type="text" value="${escapeHtml(item.text)}" data-journal-mind-field="text" data-mind-id="${item.id}" />
      </div>
      <div class="mind-item-controls">
        <label>
          <span class="field-label">Intensity</span>
          <input type="range" min="1" max="10" value="${Number(item.intensity || 5)}" data-journal-mind-field="intensity" data-mind-id="${item.id}" />
        </label>
        <select class="chip-select ${decisionTone}" data-journal-mind-field="decision" data-mind-id="${item.id}">
          ${MIND_DECISIONS.map((decision) => `<option value="${decision}" ${item.decision === decision ? "selected" : ""}>${decision}</option>`).join("")}
        </select>
        <button class="secondary-button" type="button" data-journal-action="convert-mind" data-mind-id="${item.id}">Task</button>
        <button class="danger-button" type="button" data-journal-action="delete-mind" data-mind-id="${item.id}">Delete</button>
      </div>
    </article>
  `;
}

function renderTruthFilterPanel(entry) {
  const completedFields = ["trigger", "thought", "truth", "nextAction"].filter((field) =>
    entry.truthFilter[field]?.trim(),
  ).length;
  return `
    <section class="section-card truth-card">
      <div class="section-header">
        <div>
          <p class="section-kicker">Truth filter</p>
          <h2>Trigger, thought, truth, action</h2>
        </div>
        <div class="section-header-actions">
          <span class="chip ${completedFields >= 3 ? "green" : "blue"}">${completedFields}/4 fields</span>
          <span class="chip">Saved ${formatTime(entry.updatedAt)}</span>
          <button class="primary-button" type="button" data-journal-action="save-truth">Save truth</button>
        </div>
      </div>
      <div class="form-grid two">
        ${journalTextArea("trigger", "Trigger", entry.truthFilter.trigger, "truth")}
        ${journalTextArea("thought", "Automatic thought", entry.truthFilter.thought, "truth")}
        <div class="field">
          <label class="field-label" for="truth-distortion">Distortion</label>
          <select id="truth-distortion" data-journal-truth="distortion">
            ${DISTORTIONS.map((option) => `<option value="${option}" ${entry.truthFilter.distortion === option ? "selected" : ""}>${option}</option>`).join("")}
          </select>
        </div>
        ${journalTextArea("truth", "Stricter truth", entry.truthFilter.truth, "truth")}
        ${journalTextArea("nextAction", "Next small action", entry.truthFilter.nextAction, "truth wide")}
      </div>
    </section>
  `;
}

function renderShutdownPanel(entry, taskSummary) {
  return `
    <section class="section-card shutdown-card">
      <div class="section-header">
        <div>
          <p class="section-kicker">Shutdown</p>
          <h2>Close the day with truth</h2>
        </div>
        <button class="primary-button" type="button" data-journal-action="seal">${entry.sealedAt ? "Reseal day" : "Seal day"}</button>
      </div>
      <div class="shutdown-summary">
        <span class="chip green">${taskSummary.completed.length} completed</span>
        <span class="chip amber">${taskSummary.partial.length} partial</span>
        <span class="chip red">${taskSummary.missed.length} missed</span>
        <span class="chip blue">${taskSummary.carried.length} carried</span>
      </div>
      <div class="form-grid two">
        ${journalTextArea("bestAction", "Best action", entry.shutdown.bestAction, "shutdown")}
        ${journalTextArea("driftReason", "Why drift happened", entry.shutdown.driftReason, "shutdown")}
        ${journalTextArea("lesson", "What repeated", entry.shutdown.lesson, "shutdown")}
        ${journalTextArea("correction", "Correction for tomorrow", entry.shutdown.correction, "shutdown")}
        ${journalTextArea("tomorrowProtect", "Tomorrow I only need to protect", entry.shutdown.tomorrowProtect, "shutdown")}
        ${journalTextArea("prayer", "Prayer / release line", entry.shutdown.prayer, "shutdown")}
      </div>
      <div class="tomorrow-top3">
        <p class="section-kicker">Tomorrow top 3</p>
        ${entry.tomorrowTop3
          .map(
            (item, index) => `
              <input type="text" value="${escapeHtml(item)}" placeholder="Top ${index + 1}" data-journal-top3="${index}" />
            `,
          )
          .join("")}
      </div>
      ${entry.sealedAt ? `<p class="meta">Sealed: ${formatDate(entry.sealedAt)}</p>` : ""}
    </section>
  `;
}

function journalTextArea(field, label, value, scope) {
  const wide = scope.includes("wide") ? "wide-field" : "";
  const source = scope.startsWith("truth") ? "truth" : "shutdown";
  return `
    <div class="field ${wide}">
      <label class="field-label" for="journal-${source}-${field}">${escapeHtml(label)}</label>
      <textarea id="journal-${source}-${field}" data-journal-${source}="${field}">${escapeHtml(value)}</textarea>
    </div>
  `;
}

function renderTaskTruthPanel(taskSummary) {
  return `
    <section class="section-card">
      <div class="section-header">
        <div>
          <p class="section-kicker">Today truth</p>
          <h2>Task evidence</h2>
        </div>
      </div>
      <div class="journal-task-list">
        ${renderTaskTruthGroup("Completed", taskSummary.completed, selectedJournalDate, "green")}
        ${renderTaskTruthGroup("Partial", taskSummary.partial, selectedJournalDate, "amber")}
        ${renderTaskTruthGroup("Missed", taskSummary.missed, selectedJournalDate, "red")}
        ${renderTaskTruthGroup("Carried", taskSummary.carried, selectedJournalDate, "blue")}
      </div>
    </section>
  `;
}

function renderTaskTruthGroup(label, tasks, dateKey, tone) {
  return `
    <div class="task-truth-group">
      <span class="chip ${tone}">${escapeHtml(label)} ${tasks.length}</span>
      ${tasks.length
        ? tasks.slice(0, 4).map((task) => `<p class="meta">${escapeHtml(task.title)} - ${escapeHtml(task.domain)}</p>`).join("")
        : `<p class="meta">None</p>`}
    </div>
  `;
}

function renderPatternPanel(entry) {
  const commonTags = ["Phone", "Overthinking", "Delay", "Food", "Sleep", "Fear", "Anger", "Career doubt", "Low energy"];
  return `
    <section class="section-card">
      <div class="section-header">
        <div>
          <p class="section-kicker">Patterns</p>
          <h2>Drift tags</h2>
        </div>
      </div>
      <div class="pattern-tags">
        ${commonTags
          .map(
            (tag) => `
              <button class="tag-button ${entry.patternTags.includes(tag) ? "is-active" : ""}" type="button" data-journal-tag="${tag}">
                ${escapeHtml(tag)}
              </button>
            `,
          )
          .join("")}
      </div>
    </section>
  `;
}

function renderJournalHistoryPanel() {
  const entries = Object.values(journalState.entries)
    .filter((entry) => entry.sealedAt)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  return `
    <section class="section-card">
      <div class="section-header">
        <div>
          <p class="section-kicker">Rediscover</p>
          <h2>Recent seals</h2>
        </div>
      </div>
      <div class="journal-history">
        ${entries.length
          ? entries
              .map(
                (entry) => `
                  <button class="history-row" type="button" data-journal-open-date="${entry.date}">
                    <strong>${formatDateKey(entry.date)}</strong>
                    <span>${escapeHtml(entry.shutdown.tomorrowProtect || "No seal line")}</span>
                  </button>
                `,
              )
              .join("")
          : emptyState("No sealed days yet.")}
      </div>
    </section>
  `;
}

function getDateKeysBack(days, anchorDate = new Date()) {
  return Array.from({ length: days }, (_, index) => toDateKey(addDays(anchorDate, index - days + 1)));
}

function getProgressDaySnapshot(dateKey) {
  const entry = journalState.entries[dateKey];
  const taskStats = getTaskDaySummary(dateKey);
  const careerActions = careerState.activityLog.filter((item) => item.date === dateKey).length;
  return {
    dateKey,
    taskCompletion: taskStats.completion,
    dueCount: taskStats.dueCount,
    doneCount: taskStats.doneCount,
    carryDebt: taskStats.carryDebt,
    containment: entry ? getContainmentScore(entry, dateKey) : 0,
    sealed: Boolean(entry?.sealedAt),
    mood: Number(entry?.state?.mood || 0),
    energy: Number(entry?.state?.energy || 0),
    focus: Number(entry?.state?.focus || 0),
    clarity: Number(entry?.state?.clarity || 0),
    tags: entry?.patternTags || [],
    careerActions,
  };
}

function averageNumbers(values) {
  const filtered = values.filter((value) => Number.isFinite(value) && value > 0);
  if (!filtered.length) return 0;
  return Math.round(filtered.reduce((sum, value) => sum + value, 0) / filtered.length);
}

function getProgressStats() {
  const weekRows = getDateKeysBack(7).map(getProgressDaySnapshot);
  const monthRows = getDateKeysBack(30).map(getProgressDaySnapshot);
  const taskStats = getTaskStats(toDateKey());
  const careerStats = getCareerStats();
  const taskAverage = averageNumbers(weekRows.filter((row) => row.dueCount > 0).map((row) => row.taskCompletion));
  const containmentAverage = averageNumbers(weekRows.map((row) => row.containment));
  const activeDays = weekRows.filter((row) => row.doneCount > 0 || row.sealed || row.careerActions > 0).length;
  const consistency = Math.round(taskAverage * 0.45 + containmentAverage * 0.35 + (activeDays / 7) * 20);
  const perfectDates = new Set(getPerfectDayDates());

  return {
    weekRows,
    monthRows,
    taskStats,
    careerStats,
    consistency,
    activeDays,
    taskAverage,
    containmentAverage,
    moodAverage: averageNumbers(weekRows.map((row) => row.mood * 10)),
    focusAverage: averageNumbers(weekRows.map((row) => row.focus * 10)),
    energyAverage: averageNumbers(weekRows.map((row) => row.energy * 10)),
    perfectStreak: countStreakFrom(
      perfectDates.has(toDateKey()) ? new Date() : addDays(new Date(), -1),
      perfectDates,
    ),
    comebackDays: countComebackDays(monthRows),
    bestContainment: Math.max(0, ...Object.values(journalState.entries).map((entry) => getContainmentScore(entry, entry.date))),
  };
}

function countComebackDays(rows) {
  let count = 0;
  rows.forEach((row, index) => {
    if (index === 0) return;
    const previous = rows[index - 1];
    const previousLow = previous.dueCount > 0 && previous.taskCompletion < 50;
    const currentStrong = row.dueCount > 0 && row.taskCompletion >= 80;
    if (previousLow && currentStrong) count += 1;
  });
  return count;
}

function getWeeklyDomainProgress() {
  const dates = getDateKeysBack(7);
  return TASK_DOMAINS.map((domain) => {
    const totals = dates.reduce(
      (acc, dateKey) => {
        const domainStats = getDomainStats(dateKey).find((item) => item.domain === domain);
        acc.total += domainStats?.total || 0;
        acc.done += domainStats?.done || 0;
        return acc;
      },
      { total: 0, done: 0 },
    );
    return {
      domain,
      ...totals,
      percent: totals.total ? Math.round((totals.done / totals.total) * 100) : 0,
    };
  });
}

function getDriftTagStats() {
  const recentDates = new Set(getDateKeysBack(30));
  const tags = {};
  Object.values(journalState.entries).forEach((entry) => {
    if (!recentDates.has(entry.date)) return;
    const containment = getContainmentScore(entry, entry.date);
    entry.patternTags.forEach((tag) => {
      if (!tags[tag]) {
        tags[tag] = { tag, count: 0, focusTotal: 0, containmentTotal: 0 };
      }
      tags[tag].count += 1;
      tags[tag].focusTotal += Number(entry.state.focus || 0);
      tags[tag].containmentTotal += containment;
    });
  });
  return Object.values(tags)
    .map((item) => ({
      ...item,
      focusAverage: item.count ? Math.round((item.focusTotal / item.count) * 10) : 0,
      containmentAverage: item.count ? Math.round(item.containmentTotal / item.count) : 0,
    }))
    .sort((a, b) => b.count - a.count || a.focusAverage - b.focusAverage);
}

function getCompositeActivityCount(row) {
  return row.doneCount + row.careerActions + (row.sealed ? 2 : 0);
}

function getWeeklyReview(stats, domains, driftTags) {
  const activeDomains = domains.filter((domain) => domain.total > 0);
  const strongest = [...activeDomains].sort((a, b) => b.percent - a.percent || b.done - a.done)[0];
  const weakest = [...activeDomains].sort((a, b) => a.percent - b.percent || b.total - a.total)[0];
  const latestSeal = Object.values(journalState.entries)
    .filter((entry) => entry.sealedAt)
    .sort((a, b) => b.date.localeCompare(a.date))[0];
  return {
    strongest,
    weakest,
    drift: driftTags[0],
    protect: latestSeal?.shutdown?.tomorrowProtect || "No protection line sealed yet.",
    score: stats.consistency,
  };
}

function renderProgressView() {
  const stats = getProgressStats();
  const domains = getWeeklyDomainProgress();
  const driftTags = getDriftTagStats();
  const review = getWeeklyReview(stats, domains, driftTags);
  const yearRows = getYearPixelData();

  progressView.innerHTML = `
    <article class="progress-hero">
      <div>
        <p class="section-kicker">Read-only truth</p>
        <h2>See what your system is actually doing to you.</h2>
        <p class="principle-body">Progress reads from Today, Habits, Journal, and Career. No extra input. Just evidence.</p>
      </div>
      <div class="career-metrics progress-metrics">
        ${metricTile("Weekly consistency", `${stats.consistency}%`, `${stats.activeDays}/7 active days`, "signal")}
        ${metricTile("Task streak", `${stats.taskStats.currentStreak} days`, `Best ${stats.taskStats.bestStreak} days`, "green")}
        ${metricTile("Containment avg", `${stats.containmentAverage}%`, `Best ${stats.bestContainment}%`, "blue")}
        ${metricTile("Career progress", `${stats.careerStats.progress}%`, `${stats.careerStats.doneItems}/${stats.careerStats.totalItems} checks`, "amber")}
      </div>
    </article>

    <div class="progress-layout">
      <div class="progress-main">
        ${renderWeeklyPulse(stats.weekRows)}
        ${renderProgressHeatmap()}
        ${renderCareerActivityPanel()}
        ${renderProgressTrends(stats.weekRows)}
        ${renderMonthlyProgressCalendar(stats.monthRows)}
        ${renderYearPixels(yearRows)}
        ${renderDomainBalance(domains)}
      </div>
      <aside class="section-stack progress-side">
        ${renderWeeklyReview(review)}
        ${renderPersonalBests(stats)}
        ${renderProgressHabitPanel()}
        ${renderDriftPatterns(driftTags)}
        ${renderCorrelationPanel(driftTags)}
        ${renderRecoveryInsights(stats, domains, driftTags)}
        ${renderCareerProgressPanel()}
      </aside>
    </div>
  `;
}

function renderWeeklyPulse(rows) {
  return `
    <section class="section-card">
      <div class="section-header">
        <div>
          <p class="section-kicker">This week</p>
          <h2>Daily pulse</h2>
        </div>
      </div>
      <div class="weekly-pulse">
        ${rows.map(renderPulseDay).join("")}
      </div>
    </section>
  `;
}

function renderPulseDay(row) {
  const label = new Intl.DateTimeFormat(undefined, { weekday: "short" }).format(getDateFromKey(row.dateKey));
  const shortDate = new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(getDateFromKey(row.dateKey));
  const composite = Math.min(getCompositeActivityCount(row), 4);
  return `
    <article class="pulse-day level-${composite}">
      <strong>${label}</strong>
      <span>${shortDate}</span>
      <div class="pulse-bars">
        ${progressMiniBar("Tasks", row.taskCompletion)}
        ${progressMiniBar("Contain", row.containment)}
        ${progressMiniBar("Focus", row.focus * 10)}
      </div>
    </article>
  `;
}

function progressMiniBar(label, percent) {
  const safePercent = Math.max(0, Math.min(100, Number(percent) || 0));
  return `
    <div class="mini-bar">
      <span>${escapeHtml(label)}</span>
      <b>${safePercent}%</b>
      <i><em style="width: ${safePercent}%"></em></i>
    </div>
  `;
}

function renderProgressHeatmap() {
  const rows = getDateKeysBack(90).map(getProgressDaySnapshot);
  return `
    <section class="section-card">
      <div class="section-header">
        <div>
          <p class="section-kicker">90 days</p>
          <h2>Momentum heatmap</h2>
        </div>
      </div>
      <div class="heatmap progress-heatmap" aria-label="Composite progress heatmap">
        ${rows
          .map((row) => {
            const count = getCompositeActivityCount(row);
            const level = Math.min(count, 4);
            return `<span class="heat-cell level-${level}" title="${row.dateKey}: ${count} evidence points"></span>`;
          })
          .join("")}
      </div>
      <div class="heatmap-legend">
        <span class="meta">Less</span>
        <span class="heat-cell level-0"></span>
        <span class="heat-cell level-1"></span>
        <span class="heat-cell level-2"></span>
        <span class="heat-cell level-3"></span>
        <span class="heat-cell level-4"></span>
        <span class="meta">More</span>
      </div>
    </section>
  `;
}

function renderCareerActivityPanel() {
  return `
    <section class="section-card">
      <div class="section-header">
        <div>
          <p class="section-kicker">Career</p>
          <h2>Career activity heatmap</h2>
        </div>
      </div>
      ${renderCareerHeatmap()}
    </section>
  `;
}

function renderMonthlyProgressCalendar(rows) {
  const activeDays = rows.filter((row) => getCompositeActivityCount(row) > 0).length;
  const strongDays = rows.filter((row) => row.taskCompletion >= 80 || row.containment >= 80).length;
  return `
    <section class="section-card">
      <div class="section-header">
        <div>
          <p class="section-kicker">30 days</p>
          <h2>Month rhythm</h2>
        </div>
        <span class="chip green">${activeDays}/30 active</span>
      </div>
      <div class="month-summary">
        <div><strong>${strongDays}</strong><span>strong days</span></div>
        <div><strong>${averageNumbers(rows.filter((row) => row.dueCount > 0).map((row) => row.taskCompletion))}%</strong><span>task avg</span></div>
        <div><strong>${averageNumbers(rows.map((row) => row.containment))}%</strong><span>containment avg</span></div>
      </div>
      <div class="monthly-calendar" aria-label="Last 30 days progress calendar">
        ${rows
          .map((row) => {
            const count = getCompositeActivityCount(row);
            const level = Math.min(count, 4);
            const label = new Intl.DateTimeFormat(undefined, { day: "numeric" }).format(getDateFromKey(row.dateKey));
            return `
              <span class="month-day level-${level}" title="${row.dateKey}: ${count} evidence points">
                <em>${label}</em>
                <b>${row.taskCompletion || row.containment || 0}%</b>
              </span>
            `;
          })
          .join("")}
      </div>
    </section>
  `;
}

function getYearPixelData() {
  const today = new Date();
  const year = today.getFullYear();
  return Array.from({ length: 12 }, (_, month) => {
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const days = Array.from({ length: daysInMonth }, (_, index) => {
      const date = new Date(year, month, index + 1);
      const dateKey = toDateKey(date);
      const future = date > today;
      const row = future ? null : getProgressDaySnapshot(dateKey);
      const level = future ? -1 : Math.min(getCompositeActivityCount(row), 4);
      return {
        dateKey,
        future,
        level,
        completion: row?.taskCompletion || 0,
        containment: row?.containment || 0,
      };
    });
    const elapsed = days.filter((day) => !day.future).length;
    const active = days.filter((day) => day.level > 0).length;
    return {
      month: new Intl.DateTimeFormat(undefined, { month: "short" }).format(new Date(year, month, 1)),
      days,
      active,
      elapsed,
      percent: elapsed ? Math.round((active / elapsed) * 100) : 0,
    };
  });
}

function renderYearPixels(rows) {
  const elapsedRows = rows.filter((row) => row.elapsed > 0);
  const active = elapsedRows.reduce((sum, row) => sum + row.active, 0);
  const elapsed = elapsedRows.reduce((sum, row) => sum + row.elapsed, 0);
  const yearPercent = elapsed ? Math.round((active / elapsed) * 100) : 0;
  return `
    <section class="section-card">
      <div class="section-header">
        <div>
          <p class="section-kicker">Year pixels</p>
          <h2>Consistency by month</h2>
        </div>
        <span class="chip signal">${yearPercent}% active</span>
      </div>
      <div class="year-pixels">
        ${rows
          .map((row) => `
            <div class="year-row">
              <strong>${row.month}</strong>
              <div class="year-day-grid">
                ${row.days
                  .map((day) => `<span class="year-day ${day.future ? "is-future" : `level-${day.level}`}" title="${day.dateKey}"></span>`)
                  .join("")}
              </div>
              <em>${row.elapsed ? `${row.percent}%` : ""}</em>
            </div>
          `)
          .join("")}
      </div>
    </section>
  `;
}

function renderProgressTrends(rows) {
  return `
    <section class="section-card">
      <div class="section-header">
        <div>
          <p class="section-kicker">Trend</p>
          <h2>Tasks, containment, mind state</h2>
        </div>
      </div>
      <div class="trend-grid">
        ${renderTrendColumn("Tasks", rows.map((row) => row.taskCompletion), "green")}
        ${renderTrendColumn("Contain", rows.map((row) => row.containment), "blue")}
        ${renderTrendColumn("Mood", rows.map((row) => row.mood * 10), "signal")}
        ${renderTrendColumn("Energy", rows.map((row) => row.energy * 10), "amber")}
      </div>
    </section>
  `;
}

function renderTrendColumn(label, values, tone) {
  return `
    <div class="trend-column ${tone}">
      <strong>${escapeHtml(label)}</strong>
      <div class="trend-bars">
        ${values
          .map((value) => {
            const height = Math.max(6, Math.min(100, Number(value) || 0));
            return `<span style="height: ${height}%"></span>`;
          })
          .join("")}
      </div>
      <p class="meta">Avg ${averageNumbers(values)}%</p>
    </div>
  `;
}

function renderDomainBalance(domains) {
  return `
    <section class="section-card">
      <div class="section-header">
        <div>
          <p class="section-kicker">Domains</p>
          <h2>Weekly balance</h2>
        </div>
      </div>
      <div class="progress-domain-list">
        ${domains.map(renderProgressDomainRow).join("")}
      </div>
    </section>
  `;
}

function renderProgressDomainRow(item) {
  return `
    <div class="progress-domain-row">
      <div>
        <strong>${escapeHtml(item.domain)}</strong>
        <p class="meta">${item.done}/${item.total} closed this week</p>
      </div>
      <div class="domain-progress">
        <span>${item.percent}%</span>
        <span class="progress-track slim"><span style="width: ${item.percent}%"></span></span>
      </div>
    </div>
  `;
}

function renderWeeklyReview(review) {
  return `
    <section class="section-card progress-review-card">
      <div class="section-header">
        <div>
          <p class="section-kicker">Review</p>
          <h2>This week's truth</h2>
        </div>
      </div>
      <div class="review-list">
        <p><strong>Score:</strong> ${review.score}% consistency.</p>
        <p><strong>Strongest:</strong> ${escapeHtml(review.strongest?.domain || "No active domain yet")} ${review.strongest ? `${review.strongest.percent}%` : ""}</p>
        <p><strong>Weakest:</strong> ${escapeHtml(review.weakest?.domain || "No weak domain yet")} ${review.weakest ? `${review.weakest.percent}%` : ""}</p>
        <p><strong>Repeated drift:</strong> ${escapeHtml(review.drift?.tag || "No drift tag data yet")} ${review.drift ? `${review.drift.count}x` : ""}</p>
        <p><strong>Protect next:</strong> ${escapeHtml(review.protect)}</p>
      </div>
    </section>
  `;
}

function renderPersonalBests(stats) {
  return `
    <section class="section-card">
      <div class="section-header">
        <div>
          <p class="section-kicker">Personal bests</p>
          <h2>Keep these alive</h2>
        </div>
      </div>
      <div class="personal-best-grid">
        <div><strong>${stats.taskStats.bestStreak}</strong><span>Best task streak</span></div>
        <div><strong>${stats.perfectStreak}</strong><span>Perfect day streak</span></div>
        <div><strong>${stats.careerStats.bestStreak}</strong><span>Career best</span></div>
        <div><strong>${stats.comebackDays}</strong><span>Comeback days</span></div>
      </div>
    </section>
  `;
}

function renderProgressHabitPanel() {
  const habits = getHabitTasks();
  const overview = getHabitOverviewStats(habits, 30);
  const domains = getHabitDomainStats(habits, 30)
    .filter((domain) => domain.due > 0)
    .sort((a, b) => b.percent - a.percent || b.done - a.done)
    .slice(0, 3);
  const attention = habits
    .map((task) => ({ task, stats: getHabitStats(task, 30) }))
    .filter((item) => item.stats.due > 0)
    .sort((a, b) => a.stats.successRate - b.stats.successRate || b.stats.open - a.stats.open)[0];

  return `
    <section class="section-card">
      <div class="section-header">
        <div>
          <p class="section-kicker">Habits</p>
          <h2>Consistency engine</h2>
        </div>
        <span class="chip ${overview.openToday ? "amber" : "green"}">${overview.doneToday}/${overview.dueToday} today</span>
      </div>
      <div class="month-summary">
        <div><strong>${overview.rangeSuccess}%</strong><span>30d habit rate</span></div>
        <div><strong>${overview.strengthAverage}%</strong><span>avg strength</span></div>
        <div><strong>${overview.bestStreak}</strong><span>best streak</span></div>
      </div>
      <div class="progress-domain-list">
        ${domains.length ? domains.map(renderHabitDomainRow).join("") : emptyState("No habit domain data yet.")}
      </div>
      <div class="insight-list">
        <p><strong>Protect:</strong> ${escapeHtml(attention?.task.title || "No habit needs attention yet")} ${attention ? `${attention.stats.successRate}%` : ""}</p>
      </div>
    </section>
  `;
}

function renderDriftPatterns(tags) {
  return `
    <section class="section-card">
      <div class="section-header">
        <div>
          <p class="section-kicker">Patterns</p>
          <h2>Drift frequency</h2>
        </div>
      </div>
      <div class="drift-list">
        ${tags.length ? tags.slice(0, 6).map(renderDriftRow).join("") : emptyState("No drift tags logged yet.")}
      </div>
    </section>
  `;
}

function renderDriftRow(item) {
  const width = Math.min(100, item.count * 20);
  return `
    <div class="drift-row">
      <div>
        <strong>${escapeHtml(item.tag)}</strong>
        <p class="meta">${item.count}x - focus avg ${item.focusAverage}%</p>
      </div>
      <span class="progress-track slim"><span style="width: ${width}%"></span></span>
    </div>
  `;
}

function renderCorrelationPanel(tags) {
  const meaningful = tags
    .filter((item) => item.count > 0)
    .sort((a, b) => a.focusAverage - b.focusAverage || a.containmentAverage - b.containmentAverage)
    .slice(0, 4);
  return `
    <section class="section-card">
      <div class="section-header">
        <div>
          <p class="section-kicker">Correlation</p>
          <h2>What lowers focus</h2>
        </div>
      </div>
      <div class="correlation-list">
        ${meaningful.length ? meaningful.map(renderCorrelationRow).join("") : emptyState("No pattern correlation yet. Tag a few journal days first.")}
      </div>
    </section>
  `;
}

function renderCorrelationRow(item) {
  return `
    <div class="correlation-row">
      <div>
        <strong>${escapeHtml(item.tag)}</strong>
        <p class="meta">${item.count} logs - focus ${item.focusAverage}% - containment ${item.containmentAverage}%</p>
      </div>
      <div class="correlation-bars">
        <span><i style="width: ${item.focusAverage}%"></i></span>
        <span><i style="width: ${item.containmentAverage}%"></i></span>
      </div>
    </div>
  `;
}

function renderRecoveryInsights(stats, domains, tags) {
  const monthDueRows = stats.monthRows.filter((row) => row.dueCount > 0);
  const carryAverage = monthDueRows.length
    ? Math.round(monthDueRows.reduce((sum, row) => sum + row.carryDebt, 0) / monthDueRows.length)
    : 0;
  const bestDomain = [...domains].filter((domain) => domain.total > 0).sort((a, b) => b.done - a.done || b.percent - a.percent)[0];
  const hardestTag = [...tags].sort((a, b) => a.containmentAverage - b.containmentAverage || b.count - a.count)[0];
  const activeMonthDays = stats.monthRows.filter((row) => getCompositeActivityCount(row) > 0).length;

  return `
    <section class="section-card">
      <div class="section-header">
        <div>
          <p class="section-kicker">Recovery</p>
          <h2>Pressure points</h2>
        </div>
      </div>
      <div class="insight-list">
        <p><strong>Active month:</strong> ${activeMonthDays}/30 days have evidence.</p>
        <p><strong>Comebacks:</strong> ${stats.comebackDays} days recovered after a low task day.</p>
        <p><strong>Carry debt:</strong> ${carryAverage} average open tasks on due days.</p>
        <p><strong>Strong domain:</strong> ${escapeHtml(bestDomain?.domain || "No active domain yet")} ${bestDomain ? `${bestDomain.percent}%` : ""}</p>
        <p><strong>Hardest tag:</strong> ${escapeHtml(hardestTag?.tag || "No tagged drift yet")} ${hardestTag ? `${hardestTag.containmentAverage}% containment` : ""}</p>
      </div>
    </section>
  `;
}

function renderCareerProgressPanel() {
  return `
    <section class="section-card">
      <div class="section-header">
        <div>
          <p class="section-kicker">Career</p>
          <h2>Roadmap progress</h2>
        </div>
      </div>
      <div class="career-progress-list">
        ${careerState.roadmaps.length ? careerState.roadmaps.map(renderCareerProgressRow).join("") : emptyState("No career roadmaps yet.")}
      </div>
    </section>
  `;
}

function renderCareerProgressRow(roadmap) {
  const stats = getRoadmapStats(roadmap);
  return `
    <div class="career-progress-row">
      <div>
        <strong>${escapeHtml(roadmap.title)}</strong>
        <p class="meta">${stats.done}/${stats.total} checklist items</p>
      </div>
      <span>${stats.percent}%</span>
      <span class="progress-track slim"><span style="width: ${stats.percent}%"></span></span>
    </div>
  `;
}

function getSyncStatusLabel() {
  const labels = {
    "not-configured": "Not configured",
    "demo-ready": "Demo ready",
    connected: "Connected",
    "signed-out": "Signed out",
    "sync-error": "Sync error",
    "personal-blocked": "Personal blocked",
    blocked: "Blocked",
  };
  return labels[syncState.status] || "Not configured";
}

function getSyncTone() {
  if (syncState.status === "demo-ready") return "green";
  if (syncState.status === "connected") return "green";
  if (syncState.status === "signed-out") return "amber";
  if (syncState.status === "personal-blocked" || syncState.status === "blocked") return "amber";
  return "blue";
}

function getLatestProfileUpdatedAt() {
  const candidates = [
    state?.meta?.updatedAt,
    careerState?.meta?.updatedAt,
    taskState?.meta?.updatedAt,
    journalState?.meta?.updatedAt,
  ].filter(Boolean);
  return candidates.sort().at(-1) || null;
}

function getSupabaseClient() {
  if (!window.supabase?.createClient) return null;
  if (!getSupabaseClient.instance) {
    getSupabaseClient.instance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return getSupabaseClient.instance;
}

async function getSupabaseSession() {
  const client = getSupabaseClient();
  if (!client) return null;
  const { data, error } = await client.auth.getSession();
  if (error) return null;
  return data?.session || null;
}

async function refreshSyncAuthState({ silent = true } = {}) {
  const session = await getSupabaseSession();
  syncState = {
    ...syncState,
    endpointConfigured: Boolean(getSupabaseClient()),
    userEmail: session?.user?.email || syncState.userEmail || "",
    userId: session?.user?.id || "",
    status: session ? "connected" : "signed-out",
    authCheckedAt: new Date().toISOString(),
  };
  saveSyncState();
  if (!silent) {
    syncNotice = session ? `Signed in as ${session.user.email}.` : "Supabase is connected, but you are signed out.";
    render();
  }
  return session;
}

function createSyncPayloadPreview() {
  return {
    app: "KRYOS",
    appVersion: APP_VERSION,
    syncSchemaVersion: KRYOS_SYNC_SCHEMA_VERSION,
    accountMode,
    profile: getModeLabel(),
    generatedAt: new Date().toISOString(),
    latestLocalUpdateAt: getLatestProfileUpdatedAt(),
    blocks: {
      foundation: {
        storageKey: FOUNDATION_STORAGE_KEY,
        updatedAt: state?.meta?.updatedAt || null,
        value: state,
      },
      career: {
        storageKey: CAREER_STORAGE_KEY,
        updatedAt: careerState?.meta?.updatedAt || null,
        value: careerState,
      },
      tasks: {
        storageKey: TASKS_STORAGE_KEY,
        updatedAt: taskState?.meta?.updatedAt || null,
        value: taskState,
      },
      journal: {
        storageKey: JOURNAL_STORAGE_KEY,
        updatedAt: journalState?.meta?.updatedAt || null,
        value: journalState,
      },
      security: {
        storageKey: SECURITY_STORAGE_KEY,
        updatedAt: securityState?.updatedAt || null,
        value: securityState,
      },
      uiState: {
        storageKey: UI_STATE_STORAGE_KEY,
        updatedAt: getCurrentUiState().updatedAt,
        value: getCurrentUiState(),
      },
    },
    excluded: {
      storageKeys: SYNC_EXCLUDED_BLOCKS,
      reason: "Active lock sessions and local sync metadata stay local.",
    },
  };
}

function getSyncBlockPayloads() {
  const payload = createSyncPayloadPreview();
  return SYNC_BLOCKS.map((block) => {
    const payloadKey = block.payloadKey || block.key;
    const value = payload.blocks[payloadKey]?.value ?? {};
    const updatedAt = payload.blocks[payloadKey]?.updatedAt || getLatestProfileUpdatedAt() || new Date().toISOString();
    return {
      block_key: block.key,
      schema_version: KRYOS_SYNC_SCHEMA_VERSION,
      payload: value,
      payload_updated_at: updatedAt,
      client_updated_at: new Date().toISOString(),
    };
  });
}

async function ensureSupabaseProfile(session) {
  const client = getSupabaseClient();
  if (!client || !session) throw new Error("Sign in before syncing.");
  const profileType = accountMode;
  const displayName = `${getModeLabel()} Profile`;
  const { data: existing, error: selectError } = await client
    .from("kryos_profiles")
    .select("id")
    .eq("profile_type", profileType)
    .maybeSingle();
  if (selectError) throw selectError;
  if (existing?.id) return existing.id;
  const { data: created, error: insertError } = await client
    .from("kryos_profiles")
    .insert({
      user_id: session.user.id,
      profile_type: profileType,
      display_name: displayName,
    })
    .select("id")
    .single();
  if (insertError) throw insertError;
  return created.id;
}

function getSyncCredentials() {
  const email = getFormValue("sync-email");
  const password = getFormValue("sync-password");
  return { email, password };
}

function getSyncErrorMessage(error) {
  const message = error?.message || "Unknown Supabase error.";
  if (/relation .* does not exist/i.test(message) || /schema cache/i.test(message)) {
    return `${message} Run supabase-schema.sql in Supabase SQL Editor first.`;
  }
  if (/permission denied for table/i.test(message)) {
    return `${message} Rerun the updated supabase-schema.sql so the authenticated role gets table grants.`;
  }
  if (/row-level security/i.test(message) || /permission denied/i.test(message)) {
    return `${message} Check that the SQL policies and grants were created.`;
  }
  if (/invalid login credentials/i.test(message)) {
    return "Invalid Supabase email or password. Use Create account first, or enter the password you used.";
  }
  if (/email not confirmed/i.test(message) || /confirm/i.test(message)) {
    return "Email is not confirmed yet. Open the Supabase confirmation email, or click Resend confirmation. Fastest: in Supabase Auth settings, turn off Confirm email for this private app.";
  }
  if (/signup disabled/i.test(message)) {
    return "Supabase signups are disabled. Enable Email signup in Supabase Auth settings.";
  }
  return message;
}

async function createSupabaseAccount() {
  const { email, password } = getSyncCredentials();
  if (!email || !email.includes("@")) {
    syncNotice = "Enter your email before creating the Supabase sync account.";
    render();
    return;
  }
  if (!password || password.length < 6) {
    syncNotice = "Use a Supabase sync password with at least 6 characters.";
    render();
    return;
  }
  const client = getSupabaseClient();
  if (!client) {
    syncNotice = "Supabase library did not load. Check your internet connection and reload.";
    render();
    return;
  }
  const { data, error } = await client.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: window.location.href.split("#")[0] },
  });
  if (error) {
    syncNotice = `Account creation failed: ${getSyncErrorMessage(error)}`;
    syncState.status = "sync-error";
  } else {
    syncNotice = data.session
      ? `Signed in as ${email}.`
      : `Account created for ${email}. If Supabase asks for email confirmation, confirm it once, then sign in here.`;
    syncState.userEmail = email;
    syncState.userId = data.session?.user?.id || "";
    syncState.status = data.session ? "connected" : "signed-out";
  }
  saveSyncState();
  render();
}

async function signInSupabaseWithPassword() {
  const { email, password } = getSyncCredentials();
  if (!email || !email.includes("@") || !password) {
    syncNotice = "Enter Supabase email and password before signing in.";
    render();
    return;
  }
  const client = getSupabaseClient();
  if (!client) {
    syncNotice = "Supabase library did not load. Check your internet connection and reload.";
    render();
    return;
  }
  const { data, error } = await client.auth.signInWithPassword({ email, password });
  if (error) {
    syncNotice = `Sign in failed: ${getSyncErrorMessage(error)}`;
    syncState.status = "sync-error";
  } else {
    syncNotice = `Signed in as ${email}.`;
    syncState.userEmail = email;
    syncState.userId = data.session?.user?.id || "";
    syncState.status = "connected";
  }
  saveSyncState();
  render();
}

async function resendSupabaseConfirmation() {
  const email = getFormValue("sync-email");
  if (!email || !email.includes("@")) {
    syncNotice = "Enter your email before resending confirmation.";
    render();
    return;
  }
  const client = getSupabaseClient();
  if (!client) {
    syncNotice = "Supabase library did not load. Check your internet connection and reload.";
    render();
    return;
  }
  const { error } = await client.auth.resend({
    type: "signup",
    email,
    options: { emailRedirectTo: window.location.href.split("#")[0] },
  });
  if (error) {
    syncNotice = `Confirmation resend failed: ${getSyncErrorMessage(error)}`;
    syncState.status = "sync-error";
  } else {
    syncNotice = `Confirmation email sent to ${email}. Confirm it once, then sign in.`;
    syncState.userEmail = email;
    syncState.status = "signed-out";
  }
  saveSyncState();
  render();
}

async function signOutSupabase() {
  const client = getSupabaseClient();
  if (!client) return;
  await client.auth.signOut();
  syncState = {
    ...syncState,
    status: "signed-out",
    userId: "",
  };
  syncNotice = "Signed out of Supabase on this browser.";
  saveSyncState();
  render();
}

async function pushToSupabase() {
  const session = await refreshSyncAuthState({ silent: true });
  if (!session) {
    syncNotice = "Sign in to Supabase before pushing this device to cloud.";
    render();
    return;
  }
  try {
    const client = getSupabaseClient();
    const profileId = await ensureSupabaseProfile(session);
    const rows = getSyncBlockPayloads().map((row) => ({
      ...row,
      profile_id: profileId,
      updated_at: new Date().toISOString(),
    }));
    const { error } = await client
      .from("kryos_sync_blocks")
      .upsert(rows, { onConflict: "profile_id,block_key" });
    if (error) throw error;
    syncState = {
      ...syncState,
      enabled: true,
      endpointConfigured: true,
      status: "connected",
      lastSyncAt: new Date().toISOString(),
      lastAttemptAt: new Date().toISOString(),
      remoteProfileId: profileId,
      userEmail: session.user.email || syncState.userEmail,
      userId: session.user.id,
    };
    syncNotice = `${getModeLabel()} data pushed to Supabase.`;
    saveSyncState();
    render();
  } catch (error) {
    syncState.status = "sync-error";
    syncState.lastAttemptAt = new Date().toISOString();
    syncNotice = `Cloud push failed: ${getSyncErrorMessage(error)}`;
    saveSyncState();
    render();
  }
}

function applyRemoteBlock(blockKey, payload) {
  const block = SYNC_BLOCKS.find((item) => item.key === blockKey);
  if (!block) return;
  setModeStorageValue(block.storageKey, JSON.stringify(payload));
}

async function pullFromSupabase() {
  const session = await refreshSyncAuthState({ silent: true });
  if (!session) {
    syncNotice = "Sign in to Supabase before pulling cloud data.";
    render();
    return;
  }
  try {
    const client = getSupabaseClient();
    const profileId = await ensureSupabaseProfile(session);
    const { data, error } = await client
      .from("kryos_sync_blocks")
      .select("block_key,payload")
      .eq("profile_id", profileId);
    if (error) throw error;
    if (!Array.isArray(data) || !data.length) {
      syncNotice = `No cloud data found for ${getModeLabel()}. Push from your old browser first.`;
      render();
      return;
    }
    data.forEach((row) => applyRemoteBlock(row.block_key, row.payload));
    syncState = {
      ...syncState,
      enabled: true,
      endpointConfigured: true,
      status: "connected",
      lastSyncAt: new Date().toISOString(),
      lastAttemptAt: new Date().toISOString(),
      remoteProfileId: profileId,
      userEmail: session.user.email || syncState.userEmail,
      userId: session.user.id,
    };
    saveSyncState();
    syncNotice = `${getModeLabel()} cloud data pulled. Reloading KRYOS.`;
    window.setTimeout(() => window.location.reload(), 650);
  } catch (error) {
    syncState.status = "sync-error";
    syncState.lastAttemptAt = new Date().toISOString();
    syncNotice = `Cloud pull failed: ${getSyncErrorMessage(error)}`;
    saveSyncState();
    render();
  }
}

function getSyncReadiness() {
  const payload = createSyncPayloadPreview();
  const safeStorageKeys = Object.values(payload.blocks).map((block) => block.storageKey);
  const expectedSafeBlockCount = SYNC_SAFE_BLOCKS.length;
  const localSessionExcluded = !safeStorageKeys.includes(SECURITY_SESSION_KEY)
    && !safeStorageKeys.includes(SYNC_STATE_STORAGE_KEY);
  const checks = [
    {
      label: "Local profile data is grouped into syncable blocks",
      detail: `${Object.keys(payload.blocks).length}/${expectedSafeBlockCount} safe blocks are available for a future remote write.`,
      passed: SYNC_SAFE_BLOCKS.every((key) => safeStorageKeys.includes(key)),
    },
    {
      label: "Security setup can move with your data",
      detail: "PIN and recovery setup sync so a new browser does not stay blank after pull.",
      passed: localSessionExcluded && safeStorageKeys.includes(SECURITY_STORAGE_KEY),
    },
    {
      label: "Export/import remains available",
      detail: "Backup remains the rollback path before any remote experiment.",
      passed: typeof collectBackupData === "function" && typeof importBackupFile === "function",
    },
    {
      label: "Supabase project is configured",
      detail: SUPABASE_URL && SUPABASE_ANON_KEY ? "Project URL and publishable key are wired." : "Project URL or publishable key is missing.",
      passed: Boolean(SUPABASE_URL && SUPABASE_ANON_KEY),
    },
    {
      label: "Supabase account is signed in",
      detail: syncState.userEmail ? `Using ${syncState.userEmail}.` : "Create or sign in with email and password.",
      passed: syncState.status === "connected" && Boolean(syncState.userId),
    },
  ];
  const localReady = checks.slice(0, 4).every((check) => check.passed);
  const remoteReady = checks.every((check) => check.passed);
  const status = remoteReady ? "connected" : "signed-out";
  const message = remoteReady
    ? `${getModeLabel()} is ready for manual cloud push/pull.`
    : localReady
      ? "Supabase is wired. Sign in before pushing or pulling cloud data."
      : "Sync readiness needs cleanup before cloud sync.";
  return { checks, localReady, remoteReady, status, message };
}

function runSyncReadinessCheck() {
  const readiness = getSyncReadiness();
  syncState = {
    ...syncState,
    status: readiness.status,
    lastReadinessAt: new Date().toISOString(),
    conflictCount: Math.max(0, Number(syncState.conflictCount) || 0),
  };
  syncNotice = readiness.message;
  saveSyncState();
  render();
}

function runSyncDryRun() {
  const readiness = getSyncReadiness();
  syncState = {
    ...syncState,
    status: readiness.status,
    lastAttemptAt: new Date().toISOString(),
    lastReadinessAt: new Date().toISOString(),
  };
  syncNotice = isDemoMode()
    ? "Dry run completed locally. No remote data was sent."
    : "Dry run blocked for Personal. Use Demo first.";
  saveSyncState();
  render();
}

function renderSettingsView() {
  settingsView.innerHTML = `
    <article class="settings-hero">
      <div>
        <p class="section-kicker">Phase 1 privacy</p>
        <h2>Protect, backup, and reuse your inner system.</h2>
        <p class="principle-body">This protects the screen on this device and gives you local control over your KRYOS data. It is not encrypted storage.</p>
        ${securityNotice ? `<p class="security-notice inline">${escapeHtml(securityNotice)}</p>` : ""}
      </div>
      <div class="settings-status-grid">
        ${metricTile("Lock", securityState.configured ? "Active" : "Not set", securityState.configured ? "Passphrase required" : "Create a lock", "signal")}
        ${metricTile("Auto-lock", `${securityState.settings.autoLockMinutes} min`, "After inactivity", "blue")}
        ${metricTile("Privacy mode", securityState.settings.privacyMode ? "On" : "Off", "Blur sensitive content", securityState.settings.privacyMode ? "green" : "amber")}
        ${metricTile("Session", securityState.settings.requireOnStartup ? "Timed" : "Always open", securityState.settings.requireOnStartup ? "Refresh stays open while active" : "Manual lock only", "green")}
      </div>
    </article>

    <div class="settings-layout">
      ${renderProductIdentityPanel()}
      ${renderSyncSettingsPanel()}

      <section class="section-card">
        <div class="section-header">
          <div>
            <p class="section-kicker">Privacy controls</p>
            <h2>Lock behavior</h2>
          </div>
          <button class="primary-button" type="button" data-security-action="manual-lock">Lock now</button>
        </div>
        <div class="settings-grid">
          <label class="setting-toggle">
            <input type="checkbox" ${securityState.settings.privacyMode ? "checked" : ""} data-security-setting="privacyMode" />
            <span>
              <strong>Privacy mode</strong>
              <em>Blur journal, foundation, task, and progress content when you want softer visibility.</em>
            </span>
          </label>
          <label class="setting-toggle">
            <input type="checkbox" ${securityState.settings.requireOnStartup ? "checked" : ""} data-security-setting="requireOnStartup" />
            <span>
              <strong>Lock after inactive session</strong>
              <em>Refresh stays open while you are active. KRYOS asks for your PIN only after the inactivity timer expires or manual lock.</em>
            </span>
          </label>
          <div class="field">
            <label class="field-label" for="auto-lock-minutes">Auto-lock after inactivity</label>
            <select id="auto-lock-minutes" data-security-setting="autoLockMinutes">
              ${AUTO_LOCK_OPTIONS.map((minutes) => `<option value="${minutes}" ${Number(securityState.settings.autoLockMinutes) === minutes ? "selected" : ""}>${minutes} minutes</option>`).join("")}
            </select>
          </div>
        </div>
      </section>

      ${renderCredentialSettingsPanel()}

      <section class="section-card">
        <div class="section-header">
          <div>
            <p class="section-kicker">Data control</p>
            <h2>Backup, import, reset</h2>
          </div>
        </div>
        <div class="settings-grid">
          <div class="backup-panel">
            <div>
              <strong>${getModeLabel()} backup</strong>
              <p class="meta">Export or import a JSON backup for the active ${getModeLabel()} space only.</p>
            </div>
            <div class="backup-actions">
              <button class="primary-button" type="button" data-settings-action="export-backup">Export backup</button>
              <button class="secondary-button" type="button" data-settings-action="trigger-import">Import backup</button>
              <input id="backup-import" class="is-hidden" type="file" accept="application/json,.json" data-settings-import />
            </div>
          </div>
          <div class="danger-zone">
            <div>
              <strong>Reset ${getModeLabel()} data</strong>
              <p class="meta">This removes only the active ${getModeLabel()} space from this browser. Type RESET before pressing the button.</p>
            </div>
            <div class="reset-controls">
              <input id="reset-confirm" type="text" placeholder="Type RESET" autocomplete="off" />
              <button class="danger-button" type="button" data-settings-action="reset-app">Reset ${getModeLabel()} data</button>
            </div>
          </div>
        </div>
      </section>
    </div>
  `;
}

function renderSyncSettingsPanel() {
  const readiness = getSyncReadiness();
  const signedIn = syncState.status === "connected" && Boolean(syncState.userId);
  const readyCount = readiness.checks.filter((check) => check.passed).length;
  return `
    <section class="section-card sync-status-card">
      <div class="sync-command-head">
        <div>
          <p class="section-kicker">Cloud sync</p>
          <h2>Move KRYOS between devices</h2>
          <p class="principle-body">Push from the device that has your newest data. Pull on the phone or GitHub Pages device.</p>
        </div>
        <div class="sync-command-status">
          <span class="space-badge sync-${readiness.status}">${getSyncStatusLabel()}</span>
          <strong>${signedIn ? escapeHtml(syncState.userEmail || "Signed in") : "Not signed in"}</strong>
        </div>
      </div>

      ${syncNotice ? `<p class="security-notice inline">${escapeHtml(syncNotice)}</p>` : ""}

      <div class="sync-command-grid">
        <div class="sync-step-panel">
          <div class="sync-step-number">1</div>
          <div class="sync-step-body">
            <p class="section-kicker">Account</p>
            <h3>Sign in once</h3>
            <p class="meta">Use the same Supabase email and password on laptop and phone. If sign-in says email not confirmed, confirm the email once or disable Confirm email in Supabase Auth settings.</p>
            <div class="sync-auth-grid">
              <div class="field">
                <label class="field-label" for="sync-email">Email</label>
                <input id="sync-email" type="email" autocomplete="email" value="${escapeHtml(syncState.userEmail || "")}" placeholder="your@email.com" />
              </div>
              <div class="field">
                <label class="field-label" for="sync-password">Password</label>
                <input id="sync-password" type="password" autocomplete="current-password" placeholder="Minimum 6 characters" />
              </div>
              <div class="sync-button-row">
                <button class="secondary-button" type="button" data-sync-action="create-account">Create account</button>
                <button class="primary-button" type="button" data-sync-action="sign-in">Sign in</button>
                <button class="secondary-button" type="button" data-sync-action="resend-confirmation">Resend confirmation</button>
                <button class="secondary-button" type="button" ${signedIn ? "" : "disabled"} data-sync-action="sign-out">Sign out</button>
              </div>
            </div>
          </div>
        </div>

        <div class="sync-step-panel sync-transfer-panel">
          <div class="sync-step-number">2</div>
          <div class="sync-step-body">
            <p class="section-kicker">Transfer</p>
            <h3>Choose direction</h3>
            <div class="sync-transfer-actions">
              <button class="sync-transfer-button push" type="button" ${signedIn ? "" : "disabled"} data-sync-action="push-cloud">
                <strong>Push this device</strong>
                <span>Upload the data currently on this browser.</span>
              </button>
              <button class="sync-transfer-button pull" type="button" ${signedIn ? "" : "disabled"} data-sync-action="pull-cloud">
                <strong>Pull from cloud</strong>
                <span>Replace this browser with your cloud data.</span>
              </button>
            </div>
          </div>
        </div>

        <div class="sync-step-panel">
          <div class="sync-step-number">3</div>
          <div class="sync-step-body">
            <p class="section-kicker">Status</p>
            <h3>Quick check</h3>
            <div class="sync-status-list">
              <span><strong>Profile</strong>${getModeLabel()}</span>
              <span><strong>Last sync</strong>${formatDateTime(syncState.lastSyncAt)}</span>
              <span><strong>Ready</strong>${readyCount}/${readiness.checks.length} checks</span>
            </div>
            <button class="secondary-button" type="button" data-sync-action="readiness-check">Refresh status</button>
          </div>
        </div>
      </div>

      <details class="sync-details">
        <summary>Technical checks</summary>
        <ul class="sync-check-list compact">
          ${readiness.checks.map((check) => `
            <li class="${check.passed ? "passed" : "pending"}">
              <span class="sync-check-token">${check.passed ? "OK" : "Hold"}</span>
              <span>
                <strong>${escapeHtml(check.label)}</strong>
                <em>${escapeHtml(check.detail)}</em>
              </span>
            </li>
          `).join("")}
        </ul>
      </details>
    </section>
  `;
}

function renderProductIdentityPanel() {
  return `
    <section class="section-card product-identity-card">
      <div class="product-identity-head">
        <div>
          <p class="section-kicker">Product identity</p>
          <h2>KRYOS</h2>
          <p class="principle-body">${escapeHtml(APP_STATUS)}</p>
        </div>
        <div class="version-badge">
          <span>Version</span>
          <strong>${escapeHtml(APP_VERSION)}</strong>
        </div>
        <span class="space-badge ${isDemoMode() ? "demo" : "personal"}">${getModeLabel()} Profile</span>
      </div>

      <div class="product-version-grid">
        ${metricTile("Stage", APP_STAGE, "Current release line", "signal")}
        ${metricTile("Released", formatDateKey(APP_RELEASE_DATE), "Private build date", "blue")}
        ${metricTile("Backup", `v${KRYOS_BACKUP_VERSION}`, "Export format", "green")}
        ${metricTile("Profile", getModeLabel(), isDemoMode() ? "Showcase data" : "Private data", isDemoMode() ? "amber" : "green")}
        ${metricTile("Next", APP_NEXT_MILESTONE, "Planned milestone", "amber")}
      </div>

      <div class="release-note-panel">
        <div>
          <p class="section-kicker">Release notes</p>
          <h3>${escapeHtml(APP_STAGE)}</h3>
        </div>
        <ul class="release-note-list">
          ${APP_RELEASE_NOTES.map((note) => `<li>${escapeHtml(note)}</li>`).join("")}
        </ul>
      </div>
    </section>
  `;
}

function renderCredentialSettingsPanel() {
  if (isDemoMode()) {
    return `
      <section class="section-card">
        <div class="section-header">
          <div>
            <p class="section-kicker">Credentials</p>
            <h2>Demo profile access</h2>
          </div>
          <span class="space-badge demo">Demo</span>
        </div>
        <div class="fixed-profile-panel">
          <strong>Demo PIN is fixed for showcase access.</strong>
          <p class="meta">This profile is sample data only. Personal credentials remain separate and are never changed from Demo.</p>
        </div>
      </section>
    `;
  }

  return `
    <section class="section-card">
      <div class="section-header">
        <div>
          <p class="section-kicker">Credentials</p>
          <h2>Change PIN and recovery</h2>
        </div>
      </div>
      <div class="security-form settings-security-form">
        <div class="field">
          <label class="field-label" for="settings-current-pass">Current PIN/passphrase</label>
          <input id="settings-current-pass" type="password" autocomplete="current-password" />
        </div>
        <div class="field">
          <label class="field-label" for="settings-new-pass">New PIN/passphrase</label>
          <input id="settings-new-pass" type="password" autocomplete="new-password" placeholder="Leave blank to keep current" />
        </div>
        <div class="field">
          <label class="field-label" for="settings-new-pass-confirm">Confirm new PIN/passphrase</label>
          <input id="settings-new-pass-confirm" type="password" autocomplete="new-password" />
        </div>
        <div class="field">
          <label class="field-label" for="settings-question-1">Recovery question 1</label>
          <input id="settings-question-1" type="text" value="${escapeHtml(securityState.recovery[0]?.question || "")}" />
        </div>
        <div class="field">
          <label class="field-label" for="settings-answer-1">New answer 1</label>
          <input id="settings-answer-1" type="password" autocomplete="off" placeholder="Leave blank to keep current answer" />
        </div>
        <div class="field">
          <label class="field-label" for="settings-question-2">Recovery question 2</label>
          <input id="settings-question-2" type="text" value="${escapeHtml(securityState.recovery[1]?.question || "")}" />
        </div>
        <div class="field">
          <label class="field-label" for="settings-answer-2">New answer 2</label>
          <input id="settings-answer-2" type="password" autocomplete="off" placeholder="Leave blank to keep current answer" />
        </div>
        <button class="primary-button" type="button" data-security-action="update-credentials">Save privacy settings</button>
        <p class="meta">Recovery questions reset this Phase 1 screen lock only. They are not full encryption recovery.</p>
      </div>
    </section>
  `;
}

function showSettingsNotice(message) {
  securityNotice = message;
  render();
}

function collectBackupData() {
  return {
    app: "KRYOS",
    version: KRYOS_BACKUP_VERSION,
    accountMode,
    space: getModeLabel(),
    exportedAt: new Date().toISOString(),
    data: {
      [FOUNDATION_STORAGE_KEY]: state,
      [CAREER_STORAGE_KEY]: careerState,
      [TASKS_STORAGE_KEY]: taskState,
      [JOURNAL_STORAGE_KEY]: journalState,
      [SECURITY_STORAGE_KEY]: securityState,
      [SYNC_STATE_STORAGE_KEY]: syncState,
      [UI_STATE_STORAGE_KEY]: getCurrentUiState(),
    },
  };
}

function exportBackup() {
  const backup = collectBackupData();
  const blob = new Blob([JSON.stringify(backup, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `kryos-${accountMode}-backup-${toDateKey()}.json`;
  document.body.append(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
  showSettingsNotice(`${getModeLabel()} backup exported.`);
}

function importBackupFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.addEventListener("load", () => {
    try {
      const backup = JSON.parse(String(reader.result || ""));
      const data = backup?.data;
      if (backup?.app !== "KRYOS" || !data || typeof data !== "object") {
        throw new Error("Invalid KRYOS backup.");
      }
      const hasDataKey = (key) => Object.prototype.hasOwnProperty.call(data, key);
      const importedKeys = DATA_STORAGE_KEYS.filter(hasDataKey);
      if (!importedKeys.length) {
        throw new Error("No KRYOS data keys found.");
      }
      DATA_STORAGE_KEYS.forEach((key) => {
        if (!hasDataKey(key)) {
          removeModeStorageValue(key);
          return;
        }
        const value = data[key];
        setModeStorageValue(key, typeof value === "string" ? value : JSON.stringify(value));
      });
      if (hasDataKey(UI_STATE_STORAGE_KEY)) {
        const uiState = data[UI_STATE_STORAGE_KEY];
        setModeStorageValue(UI_STATE_STORAGE_KEY, typeof uiState === "string" ? uiState : JSON.stringify(uiState));
      } else {
        removeModeStorageValue(UI_STATE_STORAGE_KEY);
      }
      removeModeStorageValue(SECURITY_SESSION_KEY);
      securityNotice = `${getModeLabel()} backup imported. Reloading KRYOS.`;
      window.setTimeout(() => window.location.reload(), 450);
    } catch {
      showSettingsNotice("Could not import this file. Use a KRYOS backup JSON.");
    }
  });
  reader.readAsText(file);
}

function resetAppData() {
  if (getFormValue("reset-confirm") !== "RESET") {
    showSettingsNotice("Type RESET before clearing local data.");
    return;
  }
  if (!window.confirm(`Reset ${getModeLabel()} data in this browser? Other spaces will not be touched.`)) return;
  clearModeData(accountMode);
  if (accountMode === "demo") {
    ensureDemoData(true);
  }
  window.location.reload();
}

function careerIcon(name) {
  const icons = {
    edit: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 20h9"></path><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z"></path></svg>`,
    done: `<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"></path></svg>`,
  };
  return icons[name] || "";
}

function careerTextBlock(label, value, size = "normal") {
  return `
    <div class="career-name-display ${size === "compact" ? "compact" : ""}">
      <div>
        <p class="field-label">${escapeHtml(label)}</p>
        <strong>${escapeHtml(value)}</strong>
      </div>
    </div>
  `;
}

function careerTitleInput({ label, value, roadmapId, moduleId = "", topicId = "", size = "normal" }) {
  const inputId = `career-title-${roadmapId}-${moduleId || "roadmap"}-${topicId || "item"}`;
  return `
    <div class="career-name-editor ${size === "compact" ? "compact" : ""}">
      <label class="field-label" for="${escapeHtml(inputId)}">${escapeHtml(label)}</label>
      <input
        id="${escapeHtml(inputId)}"
        class="career-rename-input ${size === "compact" ? "compact" : ""}"
        type="text"
        value="${escapeHtml(value)}"
        data-career-field="title"
        data-roadmap-id="${escapeHtml(roadmapId)}"
        data-module-id="${escapeHtml(moduleId)}"
        data-topic-id="${escapeHtml(topicId)}"
      />
    </div>
  `;
}

function renderRoadmapDetail(roadmap) {
  const stats = getRoadmapStats(roadmap);
  const isEditing = editingCareerRoadmapId === roadmap.id;
  return `
    <section class="section-card career-detail ${isEditing ? "is-editing" : ""}">
      <div class="section-header career-detail-header">
        <div>
          <p class="section-kicker">Selected roadmap</p>
          ${isEditing
            ? careerTitleInput({ label: "Roadmap name", value: roadmap.title, roadmapId: roadmap.id })
            : careerTextBlock("Roadmap", roadmap.title)}
          <p class="meta">${stats.done}/${stats.total} checklist items completed</p>
        </div>
        <div class="row-actions">
          <span class="chip signal">${stats.percent}% complete</span>
          <button
            class="icon-button career-edit-toggle"
            type="button"
            title="${isEditing ? "Close roadmap editor" : "Edit roadmap"}"
            aria-label="${isEditing ? "Close roadmap editor" : "Edit roadmap"}"
            data-career-edit-toggle="${roadmap.id}"
          >${careerIcon(isEditing ? "done" : "edit")}</button>
          ${isEditing ? `<button class="danger-button" type="button" data-career-delete="roadmap" data-roadmap-id="${roadmap.id}">Delete roadmap</button>` : ""}
        </div>
      </div>

      <div class="form-grid two career-roadmap-meta">
        ${isEditing
          ? `
            <div class="field">
              <label class="field-label" for="roadmap-purpose-${roadmap.id}">Purpose</label>
              <textarea id="roadmap-purpose-${roadmap.id}" data-career-field="purpose" data-roadmap-id="${roadmap.id}">${escapeHtml(roadmap.purpose)}</textarea>
            </div>
            <div class="field">
              <label class="field-label" for="roadmap-target-${roadmap.id}">Target date</label>
              <input id="roadmap-target-${roadmap.id}" type="date" value="${escapeHtml(roadmap.targetDate)}" data-career-field="targetDate" data-roadmap-id="${roadmap.id}" />
            </div>
          `
          : `
            <div class="career-read-panel">
              <p class="field-label">Purpose</p>
              <p class="principle-body">${escapeHtml(roadmap.purpose || "No purpose written yet.")}</p>
            </div>
            <div class="career-read-panel">
              <p class="field-label">Target date</p>
              <strong>${roadmap.targetDate ? formatDateKey(roadmap.targetDate) : "No target date"}</strong>
            </div>
          `}
      </div>

      <div class="module-stack">
        ${roadmap.modules.length ? roadmap.modules.map((module) => renderModuleBlock(roadmap, module, isEditing)).join("") : emptyState("No modules yet. Use the roadmap editor to add the first module.")}
      </div>

      ${isEditing ? `
        <div class="quick-add footer-add">
          <input type="text" id="new-module-title-${roadmap.id}" placeholder="New module, e.g. Graphs" />
          <button class="primary-button" type="button" data-career-add="module" data-roadmap-id="${roadmap.id}">Add module</button>
        </div>
      ` : ""}
    </section>
  `;
}

function renderModuleBlock(roadmap, module, isEditing) {
  const stats = getModuleStats(module);
  return `
    <article class="module-block">
      <div class="module-header">
        <div>
          ${isEditing
            ? careerTitleInput({ label: "Module name", value: module.title, roadmapId: roadmap.id, moduleId: module.id, size: "compact" })
            : careerTextBlock("Module", module.title, "compact")}
          <p class="meta">${stats.percent}% - ${stats.done}/${stats.total} checks</p>
        </div>
        ${isEditing ? `<button class="icon-button" type="button" title="Delete module" data-career-delete="module" data-roadmap-id="${roadmap.id}" data-module-id="${module.id}">X</button>` : ""}
      </div>
      <span class="progress-track"><span style="width: ${stats.percent}%"></span></span>

      <div class="topic-list">
        ${module.topics.length ? module.topics.map((topic) => renderTopicBlock(roadmap, module, topic, isEditing)).join("") : emptyState("No topics inside this module yet.")}
      </div>

      ${isEditing ? `
        <div class="quick-add compact">
          <input type="text" id="new-topic-title-${module.id}" placeholder="New topic" />
          <button class="secondary-button" type="button" data-career-add="topic" data-roadmap-id="${roadmap.id}" data-module-id="${module.id}">Add topic</button>
        </div>
      ` : ""}
    </article>
  `;
}

function renderTopicBlock(roadmap, module, topic, isEditing) {
  const stats = getTopicStats(topic);
  return `
    <article class="topic-block">
      <div class="topic-header">
        <div>
          ${isEditing
            ? careerTitleInput({ label: "Topic name", value: topic.title, roadmapId: roadmap.id, moduleId: module.id, topicId: topic.id, size: "compact" })
            : careerTextBlock("Topic", topic.title, "compact")}
          <p class="meta">${stats.done}/${stats.total} - confidence ${escapeHtml(topic.confidence)}</p>
        </div>
        <div class="row-actions">
          ${isEditing
            ? `
              <select data-career-field="confidence" data-roadmap-id="${roadmap.id}" data-module-id="${module.id}" data-topic-id="${topic.id}">
                ${["Low", "Medium", "High"]
                  .map((option) => `<option value="${option}" ${topic.confidence === option ? "selected" : ""}>${option}</option>`)
                  .join("")}
              </select>
              <button class="icon-button" type="button" title="Delete topic" data-career-delete="topic" data-roadmap-id="${roadmap.id}" data-module-id="${module.id}" data-topic-id="${topic.id}">X</button>
            `
            : `<span class="chip blue">${escapeHtml(topic.confidence)}</span>`}
        </div>
      </div>
      <span class="progress-track slim"><span style="width: ${stats.percent}%"></span></span>

      <div class="checklist-list">
        ${topic.checklist.length ? topic.checklist.map((item) => renderChecklistItem(roadmap, module, topic, item, isEditing)).join("") : emptyState("No checklist items yet.")}
      </div>

      ${isEditing ? `
        <div class="quick-add compact">
          <input type="text" id="new-check-title-${topic.id}" placeholder="New checklist item" />
          <button class="secondary-button" type="button" data-career-add="checklist" data-roadmap-id="${roadmap.id}" data-module-id="${module.id}" data-topic-id="${topic.id}">Add check</button>
        </div>
      ` : ""}
    </article>
  `;
}

function renderChecklistItem(roadmap, module, topic, item, isEditing) {
  return `
    <label class="check-item ${isEditing ? "" : "read-only"} ${item.done ? "is-done" : ""}">
      <input type="checkbox" ${item.done ? "checked" : ""} data-career-check="${item.id}" data-roadmap-id="${roadmap.id}" data-module-id="${module.id}" data-topic-id="${topic.id}" />
      ${isEditing
        ? `<input type="text" value="${escapeHtml(item.text)}" data-career-field="text" data-roadmap-id="${roadmap.id}" data-module-id="${module.id}" data-topic-id="${topic.id}" data-check-id="${item.id}" />`
        : `<span class="check-text">${escapeHtml(item.text)}</span>`}
      ${isEditing ? `<button class="icon-button" type="button" title="Delete check" data-career-delete="checklist" data-roadmap-id="${roadmap.id}" data-module-id="${module.id}" data-topic-id="${topic.id}" data-check-id="${item.id}">X</button>` : ""}
    </label>
  `;
}

function renderEditView() {
  const sections = [
    ["declaration", "Declaration"],
    ["why", "Why"],
    ["vows", "Vows"],
    ["doPrinciples", "Do"],
    ["dontPrinciples", "Don't"],
    ["strengths", "Strengths"],
    ["weaknesses", "Weaknesses"],
    ["returnProtocol", "Return"],
  ];

  editView.innerHTML = `
    <div class="edit-layout">
      <aside class="edit-index" aria-label="Foundation sections">
        ${sections
          .map(
            ([id, label]) => `
              <button class="index-button ${
                activeEditSection === id ? "is-active" : ""
              }" type="button" data-edit-section="${id}">${label}</button>
            `,
          )
          .join("")}
      </aside>
      <div class="edit-panel">
        ${renderActiveEditor()}
      </div>
    </div>
  `;
}

function renderActiveEditor() {
  switch (activeEditSection) {
    case "declaration":
      return renderDeclarationEditor();
    case "why":
      return renderWhyEditor();
    case "vows":
      return renderVowsEditor();
    case "doPrinciples":
      return renderDoEditor();
    case "dontPrinciples":
      return renderDontEditor();
    case "strengths":
      return renderStrengthsEditor();
    case "weaknesses":
      return renderWeaknessesEditor();
    case "returnProtocol":
      return renderReturnEditor();
    default:
      return renderDeclarationEditor();
  }
}

function editorShell(kicker, title, body, action = "") {
  return `
    <section class="section-card">
      <div class="section-header">
        <div>
          <p class="section-kicker">${escapeHtml(kicker)}</p>
          <h2>${escapeHtml(title)}</h2>
        </div>
        <div class="section-header-actions">${action}</div>
      </div>
      ${body}
    </section>
  `;
}

function renderDeclarationEditor() {
  return editorShell(
    "Foundation",
    "Opening declaration",
    `
      <div class="form-grid">
        ${textArea("reason", "Why I started", state.declaration.reason, "declaration")}
        ${textInput("season", "Current season", state.declaration.season, "declaration")}
        ${textInput("becoming", "I am becoming", state.declaration.becoming, "declaration")}
        ${textInput("refusing", "I refuse to remain", state.declaration.refusing, "declaration")}
      </div>
    `,
  );
}

function renderWhyEditor() {
  return editorShell(
    "Why",
    "Reason and consequence",
    `
      <div class="form-grid two">
        ${textArea("pain", "The pain", state.why.pain, "why")}
        ${textArea("vision", "The vision", state.why.vision, "why")}
        ${textArea("cost", "The cost", state.why.cost, "why")}
        ${textArea("reward", "The reward", state.why.reward, "why")}
      </div>
    `,
  );
}

function renderVowsEditor() {
  return editorShell(
    "Vows",
    "Identity vows",
    renderCollection("vows", state.vows, renderVowEditorRow),
    '<button class="primary-button" type="button" data-add="vows">Add vow</button>',
  );
}

function renderDoEditor() {
  return editorShell(
    "Do",
    "Do principles",
    renderCollection("doPrinciples", state.doPrinciples, renderDoEditorRow),
    '<button class="primary-button" type="button" data-add="doPrinciples">Add principle</button>',
  );
}

function renderDontEditor() {
  return editorShell(
    "Don't",
    "Don't principles",
    renderCollection("dontPrinciples", state.dontPrinciples, renderDontEditorRow),
    '<button class="primary-button" type="button" data-add="dontPrinciples">Add principle</button>',
  );
}

function renderStrengthsEditor() {
  return editorShell(
    "Strengths",
    "Strength map",
    renderCollection("strengths", state.strengths, renderStrengthEditorRow),
    '<button class="primary-button" type="button" data-add="strengths">Add strength</button>',
  );
}

function renderWeaknessesEditor() {
  return editorShell(
    "Weaknesses",
    "Weakness map",
    renderCollection("weaknesses", state.weaknesses, renderWeaknessEditorRow),
    '<button class="primary-button" type="button" data-add="weaknesses">Add weakness</button>',
  );
}

function renderReturnEditor() {
  return editorShell(
    "Return",
    "Failure protocol",
    renderCollection("returnProtocol", state.returnProtocol, renderReturnEditorRow),
    '<button class="primary-button" type="button" data-add="returnProtocol">Add step</button>',
  );
}

function renderCollection(collection, items, rowRenderer) {
  if (!items.length) return emptyState("Nothing here yet.");
  return `<div class="form-grid">${items.map((item) => rowRenderer(item, collection)).join("")}</div>`;
}

function renderVowEditorRow(item, collection) {
  return `
    <article class="editor-row" data-row="${item.id}">
      ${textInput("title", "Vow", item.title, collection, item.id)}
      ${textArea("meaning", "Meaning", item.meaning, collection, item.id)}
      ${toggleRow(item, collection)}
    </article>
  `;
}

function renderDoEditorRow(item, collection) {
  return `
    <article class="editor-row" data-row="${item.id}">
      ${textInput("title", "Principle", item.title, collection, item.id)}
      ${textArea("reason", "Reason", item.reason, collection, item.id)}
      <div class="form-grid two">
        ${textInput("category", "Category", item.category, collection, item.id)}
        ${textInput("frequency", "Frequency", item.frequency, collection, item.id)}
      </div>
      <div class="form-grid two">
        ${textInput("minimum", "Minimum version", item.minimum, collection, item.id)}
        ${textInput("full", "Full version", item.full, collection, item.id)}
      </div>
      ${toggleRow(item, collection)}
    </article>
  `;
}

function renderDontEditorRow(item, collection) {
  return `
    <article class="editor-row" data-row="${item.id}">
      ${textInput("title", "Principle", item.title, collection, item.id)}
      ${textArea("harm", "Why it harms me", item.harm, collection, item.id)}
      ${textArea("replacement", "Replacement action", item.replacement, collection, item.id)}
      <div class="field">
        <label class="field-label" for="${collection}-${item.id}-severity">Severity</label>
        <select id="${collection}-${item.id}-severity" data-field="severity" data-collection="${collection}" data-id="${item.id}">
          ${["Light", "Serious", "Critical"]
            .map(
              (option) => `
                <option value="${option}" ${item.severity === option ? "selected" : ""}>${option}</option>
              `,
            )
            .join("")}
        </select>
      </div>
      ${toggleRow(item, collection)}
    </article>
  `;
}

function renderStrengthEditorRow(item, collection) {
  return `
    <article class="editor-row" data-row="${item.id}">
      ${textInput("name", "Strength", item.name, collection, item.id)}
      ${textArea("use", "How to use it", item.use, collection, item.id)}
      ${textArea("environment", "Best environment", item.environment, collection, item.id)}
      ${textArea("proof", "Proof", item.proof, collection, item.id)}
      ${deleteRow(collection, item.id)}
    </article>
  `;
}

function renderWeaknessEditorRow(item, collection) {
  return `
    <article class="editor-row" data-row="${item.id}">
      ${textInput("name", "Weakness", item.name, collection, item.id)}
      ${textArea("showsAs", "How it appears", item.showsAs, collection, item.id)}
      ${textArea("warning", "Early warning", item.warning, collection, item.id)}
      ${textArea("countermeasure", "Countermeasure", item.countermeasure, collection, item.id)}
      ${deleteRow(collection, item.id)}
    </article>
  `;
}

function renderReturnEditorRow(item, collection) {
  return `
    <article class="editor-row" data-row="${item.id}">
      ${textInput("text", "Step", item.text, collection, item.id)}
      ${deleteRow(collection, item.id)}
    </article>
  `;
}

function textInput(field, label, value, scope, id = "") {
  const inputId = `${scope}-${id}-${field}`;
  return `
    <div class="field">
      <label class="field-label" for="${inputId}">${escapeHtml(label)}</label>
      <input id="${inputId}" type="text" value="${escapeHtml(value)}" data-field="${field}" data-scope="${scope}" ${
        id ? `data-id="${id}" data-collection="${scope}"` : ""
      } />
    </div>
  `;
}

function textArea(field, label, value, scope, id = "") {
  const inputId = `${scope}-${id}-${field}`;
  return `
    <div class="field">
      <label class="field-label" for="${inputId}">${escapeHtml(label)}</label>
      <textarea id="${inputId}" data-field="${field}" data-scope="${scope}" ${
        id ? `data-id="${id}" data-collection="${scope}"` : ""
      }>${escapeHtml(value)}</textarea>
    </div>
  `;
}

function toggleRow(item, collection) {
  return `
    <div class="row-actions">
      <button class="secondary-button" type="button" data-toggle="active" data-collection="${collection}" data-id="${item.id}">
        ${item.active ? "Active" : "Inactive"}
      </button>
      <button class="secondary-button" type="button" data-toggle="pinned" data-collection="${collection}" data-id="${item.id}">
        ${item.pinned ? "Pinned" : "Pin"}
      </button>
      <button class="danger-button" type="button" data-delete="${collection}" data-id="${item.id}">Delete</button>
    </div>
  `;
}

function deleteRow(collection, id) {
  return `
    <div class="row-actions">
      <button class="danger-button" type="button" data-delete="${collection}" data-id="${id}">Delete</button>
    </div>
  `;
}

function addItem(collection) {
  const item = {
    vows: {
      id: createId(),
      title: "I am someone who...",
      meaning: "Write the standard this vow protects.",
      pinned: false,
      active: true,
    },
    doPrinciples: {
      id: createId(),
      title: "New do principle",
      reason: "Why this action protects alignment.",
      category: "Mind",
      minimum: "Minimum version",
      full: "Full version",
      frequency: "Daily",
      pinned: false,
      active: true,
    },
    dontPrinciples: {
      id: createId(),
      title: "New don't principle",
      harm: "Why this pattern harms alignment.",
      replacement: "Replacement action.",
      severity: "Serious",
      pinned: false,
      active: true,
    },
    strengths: {
      id: createId(),
      name: "New strength",
      use: "How to use it.",
      environment: "Best environment.",
      proof: "Proof from life.",
    },
    weaknesses: {
      id: createId(),
      name: "New weakness",
      showsAs: "How it appears.",
      warning: "Early warning sign.",
      countermeasure: "Countermeasure.",
    },
    returnProtocol: {
      id: createId(),
      text: "New return step",
    },
  }[collection];

  state[collection].push(item);
  saveFoundation();
  render();
}

function updateCollectionValue(collection, id, field, value) {
  const item = state[collection].find((entry) => entry.id === id);
  if (!item) return;
  item[field] = value;
  saveFoundation();
}

function updateScopedValue(scope, field, value) {
  state[scope][field] = value;
  saveFoundation();
}

function deleteItem(collection, id) {
  state[collection] = state[collection].filter((item) => item.id !== id);
  saveFoundation();
  render();
}

function toggleItem(collection, id, field) {
  const item = state[collection].find((entry) => entry.id === id);
  if (!item) return;
  item[field] = !item[field];
  saveFoundation();
  render();
}

function getInputValue(id) {
  const input = document.getElementById(id);
  if (!(input instanceof HTMLInputElement)) return "";
  const value = input.value.trim();
  input.value = "";
  return value;
}

function addCareerItem(type, dataset) {
  if (type === "roadmap") {
    const title = getInputValue("new-roadmap-title");
    if (!title) return;
    const roadmap = {
      id: createId(),
      title,
      purpose: "Define why this roadmap matters.",
      targetDate: "",
      modules: [],
    };
    careerState.roadmaps.push(roadmap);
    selectedRoadmapId = roadmap.id;
  }

  if (type === "module") {
    const roadmap = findRoadmap(dataset.roadmapId);
    const title = getInputValue(`new-module-title-${dataset.roadmapId}`);
    if (!roadmap || !title) return;
    roadmap.modules.push({ id: createId(), title, topics: [] });
  }

  if (type === "topic") {
    const roadmap = findRoadmap(dataset.roadmapId);
    const module = findModule(roadmap, dataset.moduleId);
    const title = getInputValue(`new-topic-title-${dataset.moduleId}`);
    if (!module || !title) return;
    module.topics.push({ id: createId(), title, confidence: "Low", checklist: [] });
  }

  if (type === "checklist") {
    const roadmap = findRoadmap(dataset.roadmapId);
    const module = findModule(roadmap, dataset.moduleId);
    const topic = findTopic(module, dataset.topicId);
    const title = getInputValue(`new-check-title-${dataset.topicId}`);
    if (!topic || !title) return;
    topic.checklist.push({ id: createId(), text: title, done: false });
  }

  saveCareer();
  render();
}

function updateCareerField(dataset, field, value) {
  const roadmap = findRoadmap(dataset.roadmapId);
  if (!roadmap) return;
  const nextValue = field === "title" ? value.trim() : value;
  if (field === "title" && !nextValue) return;

  if (!dataset.moduleId) {
    roadmap[field] = nextValue;
  } else {
    const module = findModule(roadmap, dataset.moduleId);
    if (!module) return;
    if (!dataset.topicId) {
      module[field] = nextValue;
    } else {
      const topic = findTopic(module, dataset.topicId);
      if (!topic) return;
      if (!dataset.checkId) {
        topic[field] = nextValue;
      } else {
        const check = topic.checklist.find((item) => item.id === dataset.checkId);
        if (!check) return;
        check[field] = nextValue;
      }
    }
  }

  saveCareer();
}

function toggleCareerCheck(dataset, checked) {
  const roadmap = findRoadmap(dataset.roadmapId);
  const module = findModule(roadmap, dataset.moduleId);
  const topic = findTopic(module, dataset.topicId);
  const check = topic?.checklist.find((item) => item.id === dataset.careerCheck);
  if (!check) return;

  check.done = checked;
  if (checked) {
    logCareerAction({
      roadmapId: roadmap.id,
      roadmapTitle: roadmap.title,
      topicId: topic.id,
      topicTitle: topic.title,
      checkId: check.id,
      checkText: check.text,
    });
  }
  saveCareer();
  render();
}

function logCareerAction(details) {
  const date = toDateKey();
  const alreadyLogged = careerState.activityLog.some(
    (item) => item.date === date && item.checkId === details.checkId,
  );
  if (alreadyLogged) return;

  careerState.activityLog.push({
    id: createId(),
    date,
    ...details,
  });
}

function deleteCareerItem(type, dataset) {
  if (type === "roadmap") {
    careerState.roadmaps = careerState.roadmaps.filter((roadmap) => roadmap.id !== dataset.roadmapId);
    selectedRoadmapId = careerState.roadmaps[0]?.id ?? null;
    if (editingCareerRoadmapId === dataset.roadmapId) {
      editingCareerRoadmapId = null;
    }
  }

  if (type === "module") {
    const roadmap = findRoadmap(dataset.roadmapId);
    if (!roadmap) return;
    roadmap.modules = roadmap.modules.filter((module) => module.id !== dataset.moduleId);
  }

  if (type === "topic") {
    const roadmap = findRoadmap(dataset.roadmapId);
    const module = findModule(roadmap, dataset.moduleId);
    if (!module) return;
    module.topics = module.topics.filter((topic) => topic.id !== dataset.topicId);
  }

  if (type === "checklist") {
    const roadmap = findRoadmap(dataset.roadmapId);
    const module = findModule(roadmap, dataset.moduleId);
    const topic = findTopic(module, dataset.topicId);
    if (!topic) return;
    topic.checklist = topic.checklist.filter((item) => item.id !== dataset.checkId);
  }

  if (editingCareerRoadmapId && !findRoadmap(editingCareerRoadmapId)) {
    editingCareerRoadmapId = null;
  }
  saveCareer();
  render();
}

function getFormValue(id) {
  const input = document.getElementById(id);
  if (!(input instanceof HTMLInputElement || input instanceof HTMLSelectElement || input instanceof HTMLTextAreaElement)) {
    return "";
  }
  return input.value.trim();
}

function getFormChecked(id) {
  const input = document.getElementById(id);
  return input instanceof HTMLInputElement ? input.checked : false;
}

function setSecurityNotice(message) {
  securityNotice = message;
  renderSecurityOverlay();
}

function unlockSessionForMode(modeName) {
  const now = Date.now();
  writeSecuritySessionForMode(modeName, {
    locked: false,
    unlockedAt: now,
    lastActivityAt: now,
  });
}

async function isPersonalCredential(pass) {
  const personalSecurity = loadSecurity("personal");
  if (!personalSecurity.configured) return false;
  const hash = await hashSecret(pass, "pass");
  return hash === personalSecurity.passHash;
}

function enterProfile(modeName, message = "") {
  if (!ACCOUNT_MODES.includes(modeName)) return;
  if (modeName === "demo") {
    ensureDemoData();
  }
  unlockSessionForMode(modeName);
  if (accountMode !== modeName) {
    saveAccountMode(modeName);
    window.location.reload();
    return;
  }
  unlockApp(message);
}

async function createSecurityLock() {
  const pass = getFormValue("setup-pass");
  const confirm = getFormValue("setup-pass-confirm");
  const question1 = getFormValue("setup-question-1");
  const answer1 = getFormValue("setup-answer-1");
  const question2 = getFormValue("setup-question-2");
  const answer2 = getFormValue("setup-answer-2");

  if (pass.length < 4) {
    setSecurityNotice("Use at least 4 characters.");
    return;
  }
  if (pass !== confirm) {
    setSecurityNotice("The passphrases do not match.");
    return;
  }
  if (!question1 || !question2 || !answer1 || !answer2) {
    setSecurityNotice("Add two recovery questions and answers.");
    return;
  }

  securityState = {
    ...structuredClone(defaultSecurity),
    configured: true,
    passHash: await hashSecret(pass, "pass"),
    recovery: [
      { question: question1, answerHash: await hashSecret(answer1, "answer") },
      { question: question2, answerHash: await hashSecret(answer2, "answer") },
    ],
    settings: { ...defaultSecurity.settings },
    updatedAt: new Date().toISOString(),
  };
  saveSecurity();
  unlockApp("Lock created.");
}

async function unlockSecurity() {
  const pass = getFormValue("unlock-pass");
  if (!pass) {
    setSecurityNotice("Enter your PIN or passphrase.");
    return;
  }
  if (await isPersonalCredential(pass)) {
    enterProfile("personal", "");
    return;
  }
  if (pass === DEMO_PROFILE_PIN) {
    enterProfile("demo", "Demo profile opened.");
    return;
  }
  setSecurityNotice("That PIN or passphrase is not correct.");
}

async function recoverSecurityLock() {
  const answer1 = getFormValue("recovery-answer-1");
  const answer2 = getFormValue("recovery-answer-2");
  const newPass = getFormValue("recovery-new-pass");
  const newPassConfirm = getFormValue("recovery-new-pass-confirm");
  const answerHash1 = await hashSecret(answer1, "answer");
  const answerHash2 = await hashSecret(answer2, "answer");

  if (answerHash1 !== securityState.recovery[0]?.answerHash || answerHash2 !== securityState.recovery[1]?.answerHash) {
    setSecurityNotice("Recovery answers do not match.");
    return;
  }
  if (newPass.length < 4) {
    setSecurityNotice("Use at least 4 characters for the new lock.");
    return;
  }
  if (newPass !== newPassConfirm) {
    setSecurityNotice("The new passphrases do not match.");
    return;
  }

  securityState.passHash = await hashSecret(newPass, "pass");
  saveSecurity();
  unlockApp("Lock reset.");
}

async function updateSecurityCredentials() {
  if (isDemoMode()) {
    securityNotice = "Demo PIN is fixed for the showcase profile.";
    renderSettingsView();
    return;
  }
  const currentPass = getFormValue("settings-current-pass");
  const currentHash = await hashSecret(currentPass, "pass");
  if (currentHash !== securityState.passHash) {
    securityNotice = "Current PIN/passphrase is required to update credentials.";
    renderSettingsView();
    return;
  }

  const newPass = getFormValue("settings-new-pass");
  const newPassConfirm = getFormValue("settings-new-pass-confirm");
  const question1 = getFormValue("settings-question-1");
  const question2 = getFormValue("settings-question-2");
  const answer1 = getFormValue("settings-answer-1");
  const answer2 = getFormValue("settings-answer-2");

  if (newPass || newPassConfirm) {
    if (newPass.length < 4) {
      securityNotice = "Use at least 4 characters for the new lock.";
      renderSettingsView();
      return;
    }
    if (newPass !== newPassConfirm) {
      securityNotice = "The new passphrases do not match.";
      renderSettingsView();
      return;
    }
    securityState.passHash = await hashSecret(newPass, "pass");
  }

  if (!question1 || !question2) {
    securityNotice = "Recovery questions cannot be empty.";
    renderSettingsView();
    return;
  }

  securityState.recovery[0].question = question1;
  securityState.recovery[1].question = question2;
  if (answer1) securityState.recovery[0].answerHash = await hashSecret(answer1, "answer");
  if (answer2) securityState.recovery[1].answerHash = await hashSecret(answer2, "answer");
  saveSecurity();
  securityNotice = "Privacy settings saved.";
  renderSettingsView();
}

function updateSecuritySetting(field, value) {
  securityState.settings[field] = value;
  saveSecurity();
  applyPrivacyMode();
  resetLockTimer();
  render();
}

function getQuickRepeatDays(repeat, dateKey) {
  if (repeat !== "selected") return [];
  const days = Array.from({ length: 7 }, (_, day) => day).filter((day) => getFormChecked(`quick-day-${day}`));
  return days.length ? days : [getDateFromKey(dateKey || selectedTaskDate).getDay()];
}

function addFieldTask() {
  const title = getFormValue("field-task-title");
  if (!title) return;

  const todayKey = toDateKey();
  const destination = getFormValue("field-task-destination") || "today";
  const pickedDate = getFormValue("field-task-date") || todayKey;
  const scheduledDate = destination === "inbox" ? "" : destination === "date" ? pickedDate : todayKey;
  const task = createTask({
    title,
    domain: getFormValue("field-task-domain") || "General",
    priority: "Medium",
    scheduledDate,
    repeat: "none",
    carryForward: getFormChecked("field-task-carry"),
    notes: "Captured from Field Mode.",
  });

  taskState.tasks.unshift(normalizeTask(task));
  selectedTaskDate = scheduledDate || todayKey;
  activeTaskView = scheduledDate ? "today" : "inbox";
  activeFieldTab = scheduledDate === todayKey ? "today" : "add";
  saveTasks();
  render();
}

function updateFieldPulseState(field, value) {
  const dateKey = toDateKey();
  const entry = getJournalEntry(dateKey);
  entry.state[field] = Number(value);
  entry.sealedAt = null;
  entry.updatedAt = new Date().toISOString();
  saveJournal();
}

function updateFieldPulseArrive(checked) {
  const entry = getJournalEntry(toDateKey());
  entry.arriveDone = checked;
  entry.sealedAt = null;
  entry.updatedAt = new Date().toISOString();
  saveJournal();
  renderFieldView();
}

function addFieldPulseThought() {
  const text = getFormValue("field-pulse-thought");
  if (!text) return;

  const entry = getJournalEntry(toDateKey());
  entry.mindDump.unshift(
    normalizeMindDumpItem({
      category: getFormValue("field-pulse-category") || "Idea",
      text,
      decision: "Unsorted",
      intensity: 5,
    }),
  );
  entry.sealedAt = null;
  entry.updatedAt = new Date().toISOString();
  saveJournal();
  activeFieldTab = "pulse";
  render();
}

function addTaskFromQuickAdd() {
  const title = getFormValue("quick-task-title");
  if (!title) return;

  const scheduledDate = getFormValue("quick-task-date");
  const repeat = getFormValue("quick-task-repeat") || "none";
  const task = createTask({
    title,
    domain: getFormValue("quick-task-domain") || "General",
    priority: getFormValue("quick-task-priority") || "Medium",
    scheduledDate: repeat === "none" ? scheduledDate : scheduledDate || selectedTaskDate,
    repeat,
    repeatDays: getQuickRepeatDays(repeat, scheduledDate || selectedTaskDate),
    carryForward: getFormChecked("quick-task-carry"),
  });

  taskState.tasks.unshift(normalizeTask(task));
  activeTaskView = repeat === "none" && !scheduledDate ? "inbox" : "today";
  saveTasks();
  render();
}

function getHabitRepeatDays(repeat) {
  if (repeat !== "selected") return [];
  const days = Array.from({ length: 7 }, (_, day) => day).filter((day) => getFormChecked(`habit-day-${day}`));
  return days.length ? days : [getDateFromKey(toDateKey()).getDay()];
}

function addHabitFromQuickAdd() {
  const title = getFormValue("habit-title");
  if (!title) return;

  const todayKey = toDateKey();
  const repeat = getFormValue("habit-repeat") || "daily";
  const task = normalizeTask(
    createTask({
      title,
      domain: getFormValue("habit-domain") || "General",
      type: "Habit",
      priority: "Medium",
      scheduledDate: repeat === "weekly" ? todayKey : "",
      repeat,
      repeatDays: getHabitRepeatDays(repeat),
      carryForward: false,
      notes: "Tracked from Habit Tracker.",
    }),
  );

  taskState.tasks.unshift(task);
  selectedHabitId = task.id;
  saveTasks();
  render();
}

function toggleHabitCell(taskId, dateKey) {
  const task = getTaskById(taskId);
  if (!task || !isHabitDueOnDate(task, dateKey)) return;
  selectedHabitId = taskId;
  setTaskStatus(taskId, isTaskDoneOnDate(task, dateKey) ? "active" : "done", dateKey);
}

function setHabitStatus(taskId, status, dateKey = toDateKey()) {
  const task = getTaskById(taskId);
  if (!task || !isHabitDueOnDate(task, dateKey)) return;
  selectedHabitId = taskId;
  setTaskStatus(taskId, status, dateKey);
}

function updateHabitMetricField(taskId, field, value) {
  const task = getTaskById(taskId);
  if (!task) return;
  task.habitMetric = normalizeHabitMetric({
    ...getHabitMetric(task),
    [field]: value,
  });
  saveTasks();
}

function updateHabitRecordField(taskId, dateKey, field, value) {
  const task = getTaskById(taskId);
  if (!task || !dateKey) return;
  const record = ensureTaskRecord(task, dateKey);
  if (field === "value") {
    const nextValue = Number(value);
    record.value = value === "" || !Number.isFinite(nextValue) ? null : nextValue;
  } else {
    record[field] = value;
  }
  saveTasks();
}

function saveHabitRecordValue(taskId, dateKey = toDateKey()) {
  const task = getTaskById(taskId);
  if (!task || !isHabitDueOnDate(task, dateKey)) return;
  const input = document.getElementById(`habit-value-${taskId}`);
  if (!(input instanceof HTMLInputElement)) return;

  const metric = getHabitMetric(task);
  const rawValue = input.value.trim();
  const value = Number(rawValue);
  updateHabitRecordField(taskId, dateKey, "value", rawValue);

  if (rawValue === "" || !Number.isFinite(value)) {
    setHabitStatus(taskId, "active", dateKey);
    return;
  }

  if (metric.direction === "at-most") {
    setHabitStatus(taskId, value <= metric.target ? "done" : "missed", dateKey);
    return;
  }

  if (metric.period === "day") {
    setHabitStatus(taskId, value >= metric.target ? "done" : "partial", dateKey);
    return;
  }

  setHabitStatus(taskId, value > 0 ? "done" : "active", dateKey);
}

function setTaskStatus(taskId, status, dateKey = selectedTaskDate) {
  const task = getTaskById(taskId);
  if (!task) return;

  const now = new Date().toISOString();
  const record = ensureTaskRecord(task, dateKey);
  record.status = status;

  if (status === "carried") {
    record.completedAt = null;
    if (!isRepeatingTask(task)) task.completedAt = null;
    task.carriedTo = toDateKey(addDays(getDateFromKey(dateKey), 1));
    if (!isRepeatingTask(task)) task.status = "carried";
  } else {
    if (status === "done") {
      record.completedAt = now;
      record.startedAt = record.startedAt || task.startedAt || now;
      if (!isRepeatingTask(task)) task.completedAt = now;
      task.carriedTo = "";
    }
    if (status !== "done") {
      record.completedAt = null;
      if (!isRepeatingTask(task)) task.completedAt = null;
    }
    if (!isRepeatingTask(task)) {
      task.status = status;
    }
  }

  saveTasks();
  render();
}

function toggleTaskDone(taskId, dateKey, checked) {
  setTaskStatus(taskId, checked ? "done" : "active", dateKey);
}

function startTask(taskId, dateKey = selectedTaskDate) {
  const task = getTaskById(taskId);
  if (!task) return;
  const now = new Date().toISOString();
  const record = ensureTaskRecord(task, dateKey);
  record.startedAt = record.startedAt || now;
  if (!isRepeatingTask(task)) {
    task.startedAt = task.startedAt || now;
  }
  saveTasks();
  render();
}

function updateTaskField(taskId, field, value) {
  const task = getTaskById(taskId);
  if (!task) return;
  task[field] = value;
  if (field === "repeat" && value !== "selected") {
    task.repeatDays = [];
  }
  if (field === "repeat" && value === "selected" && !task.repeatDays.length) {
    task.repeatDays = [getDateFromKey(task.scheduledDate || selectedTaskDate).getDay()];
  }
  const normalized = normalizeTask(task);
  Object.assign(task, normalized);
  saveTasks();
}

function toggleTaskCarryForward(taskId, checked) {
  const task = getTaskById(taskId);
  if (!task) return;
  task.carryForward = checked;
  saveTasks();
  render();
}

function toggleTaskRepeatDay(taskId, day) {
  const task = getTaskById(taskId);
  if (!task) return;
  const numericDay = Number(day);
  task.repeatDays = task.repeatDays.includes(numericDay)
    ? task.repeatDays.filter((item) => item !== numericDay)
    : [...task.repeatDays, numericDay].sort((a, b) => a - b);
  task.repeat = "selected";
  saveTasks();
  render();
}

function deleteTask(taskId) {
  taskState.tasks = taskState.tasks.filter((task) => task.id !== taskId);
  saveTasks();
  render();
}

function addTaskChecklistItem(taskId) {
  const task = getTaskById(taskId);
  const title = getInputValue(`new-task-check-${taskId}`);
  if (!task || !title) return;
  task.checklist.push({ id: createId(), text: title, done: false });
  saveTasks();
  render();
}

function deleteTaskChecklistItem(taskId, checkId) {
  const task = getTaskById(taskId);
  if (!task) return;
  task.checklist = task.checklist.filter((item) => item.id !== checkId);
  Object.values(task.records ?? {}).forEach((record) => {
    if (record?.checklist) delete record.checklist[checkId];
  });
  saveTasks();
  render();
}

function toggleTaskChecklistItem(taskId, checkId, dateKey, checked) {
  const task = getTaskById(taskId);
  if (!task) return;
  const item = task.checklist.find((entry) => entry.id === checkId);
  if (!item) return;

  if (isRepeatingTask(task)) {
    const record = ensureTaskRecord(task, dateKey);
    record.checklist[checkId] = checked;
  } else {
    item.done = checked;
  }

  saveTasks();
  render();
}

function updateTaskChecklistText(taskId, checkId, value) {
  const task = getTaskById(taskId);
  const item = task?.checklist.find((entry) => entry.id === checkId);
  if (!item) return;
  item.text = value;
  saveTasks();
}

function updateJournalEntry(mutator) {
  const entry = getJournalEntry(selectedJournalDate);
  mutator(entry);
  entry.updatedAt = new Date().toISOString();
  saveJournal();
}

function addMindDumpItem() {
  const text = getFormValue("mind-text");
  if (!text) return;
  const category = getFormValue("mind-category") || "Fear";
  updateJournalEntry((entry) => {
    entry.mindDump.unshift(
      normalizeMindDumpItem({
        category,
        text,
        decision: "Unsorted",
        intensity: 5,
      }),
    );
    entry.sealedAt = null;
  });
  render();
}

function updateMindDumpItem(id, field, value) {
  updateJournalEntry((entry) => {
    const item = entry.mindDump.find((mindItem) => mindItem.id === id);
    if (!item) return;
    item[field] = field === "intensity" ? Number(value) : value;
    if (field === "decision" && value !== "Unsorted") {
      entry.sealedAt = null;
    }
  });
}

function deleteMindDumpItem(id) {
  updateJournalEntry((entry) => {
    entry.mindDump = entry.mindDump.filter((item) => item.id !== id);
    entry.sealedAt = null;
  });
  render();
}

function convertMindDumpToTask(id) {
  const entry = getJournalEntry(selectedJournalDate);
  const item = entry.mindDump.find((mindItem) => mindItem.id === id);
  if (!item || !item.text.trim()) return;

  taskState.tasks.unshift(
    normalizeTask(
      createTask({
        title: item.text.trim(),
        domain: item.category === "Work Thought" ? "Career" : "Mind",
        type: "Task",
        priority: item.intensity >= 8 ? "High" : "Medium",
        scheduledDate: selectedJournalDate,
        repeat: "none",
        carryForward: true,
        notes: `Converted from ${item.category} in Mind Containment.`,
      }),
    ),
  );
  item.decision = "Convert to Task";
  entry.sealedAt = null;
  saveTasks();
  saveJournal();
  render();
}

function toggleJournalTag(tag) {
  updateJournalEntry((entry) => {
    entry.patternTags = entry.patternTags.includes(tag)
      ? entry.patternTags.filter((item) => item !== tag)
      : [...entry.patternTags, tag];
    entry.sealedAt = null;
  });
  render();
}

function sealJournalDay() {
  updateJournalEntry((entry) => {
    entry.sealedAt = new Date().toISOString();
  });
  render();
}

function saveTruthFilter() {
  updateJournalEntry(() => {});
  render();
}

function noteSecurityActivity() {
  if (!isSecurityUnlocked) return;
  touchSecuritySession();
  resetLockTimer();
}

modeButtons.forEach((button) => {
  button.addEventListener("click", () => setMode(button.dataset.mode));
});

pageButtons.forEach((button) => {
  button.addEventListener("click", () => setPage(button.dataset.page));
});

fieldButtons.forEach((button) => {
  button.addEventListener("click", () => setFieldTab(button.dataset.fieldTab));
});

document.addEventListener("keydown", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  if (event.key !== "Enter") return;

  if (target.id === "unlock-pass") {
    event.preventDefault();
    await unlockSecurity();
    return;
  }

  if (target.closest(".security-card") && target.id?.startsWith("setup-")) {
    event.preventDefault();
    await createSecurityLock();
    return;
  }

  if (target.closest(".security-card") && target.id?.startsWith("recovery-")) {
    event.preventDefault();
    await recoverSecurityLock();
  }
});

document.addEventListener("click", async (event) => {
  const target = event.target;
  if (!(target instanceof HTMLElement)) return;

  const securityAction = target.closest("[data-security-action]");
  if (securityAction) {
    if (securityAction.dataset.securityAction === "create-lock") {
      await createSecurityLock();
    }
    if (securityAction.dataset.securityAction === "unlock") {
      await unlockSecurity();
    }
    if (securityAction.dataset.securityAction === "show-recovery") {
      recoveryMode = true;
      securityNotice = "";
      renderSecurityOverlay();
    }
    if (securityAction.dataset.securityAction === "back-to-unlock") {
      recoveryMode = false;
      securityNotice = "";
      renderSecurityOverlay();
    }
    if (securityAction.dataset.securityAction === "recover-lock") {
      await recoverSecurityLock();
    }
    if (securityAction.dataset.securityAction === "manual-lock") {
      lockApp("Locked manually.");
    }
    if (securityAction.dataset.securityAction === "update-credentials") {
      await updateSecurityCredentials();
    }
    return;
  }

  const settingsAction = target.closest("[data-settings-action]");
  if (settingsAction) {
    if (settingsAction.dataset.settingsAction === "export-backup") {
      exportBackup();
    }
    if (settingsAction.dataset.settingsAction === "trigger-import") {
      document.querySelector("[data-settings-import]")?.click();
    }
    if (settingsAction.dataset.settingsAction === "reset-app") {
      resetAppData();
    }
    return;
  }

  const syncAction = target.closest("[data-sync-action]");
  if (syncAction) {
    if (syncAction.dataset.syncAction === "readiness-check") {
      runSyncReadinessCheck();
    }
    if (syncAction.dataset.syncAction === "dry-run") {
      runSyncDryRun();
    }
    if (syncAction.dataset.syncAction === "create-account") {
      await createSupabaseAccount();
    }
    if (syncAction.dataset.syncAction === "sign-in") {
      await signInSupabaseWithPassword();
    }
    if (syncAction.dataset.syncAction === "resend-confirmation") {
      await resendSupabaseConfirmation();
    }
    if (syncAction.dataset.syncAction === "sign-out") {
      await signOutSupabase();
    }
    if (syncAction.dataset.syncAction === "push-cloud") {
      await pushToSupabase();
    }
    if (syncAction.dataset.syncAction === "pull-cloud") {
      await pullFromSupabase();
    }
    return;
  }

  const fieldAction = target.closest("[data-field-action]");
  if (fieldAction) {
    if (fieldAction.dataset.fieldAction === "add-task") {
      addFieldTask();
    }
    if (fieldAction.dataset.fieldAction === "add-pulse-thought") {
      addFieldPulseThought();
    }
    return;
  }

  const habitRange = target.closest("[data-habit-range]");
  if (habitRange) {
    activeHabitRange = Number(habitRange.dataset.habitRange) || 30;
    render();
    return;
  }

  const habitSelect = target.closest("[data-habit-select]");
  if (habitSelect) {
    selectedHabitId = habitSelect.dataset.habitSelect;
    render();
    return;
  }

  const habitCell = target.closest("[data-habit-cell]");
  if (habitCell) {
    toggleHabitCell(habitCell.dataset.habitCell, habitCell.dataset.habitDate);
    return;
  }

  const habitStatus = target.closest("[data-habit-status]");
  if (habitStatus) {
    setHabitStatus(habitStatus.dataset.taskId, habitStatus.dataset.habitStatus, habitStatus.dataset.taskDate);
    return;
  }

  const habitAction = target.closest("[data-habit-action]");
  if (habitAction) {
    if (habitAction.dataset.habitAction === "add") {
      addHabitFromQuickAdd();
    }
    if (habitAction.dataset.habitAction === "save-value") {
      saveHabitRecordValue(habitAction.dataset.taskId, habitAction.dataset.taskDate);
    }
    return;
  }

  const journalOpenDate = target.closest("[data-journal-open-date]");
  if (journalOpenDate) {
    selectedJournalDate = journalOpenDate.dataset.journalOpenDate;
    render();
    return;
  }

  const journalTag = target.closest("[data-journal-tag]");
  if (journalTag) {
    toggleJournalTag(journalTag.dataset.journalTag);
    return;
  }

  const journalAction = target.closest("[data-journal-action]");
  if (journalAction) {
    if (journalAction.dataset.journalAction === "add-mind") {
      addMindDumpItem();
    }
    if (journalAction.dataset.journalAction === "delete-mind") {
      deleteMindDumpItem(journalAction.dataset.mindId);
    }
    if (journalAction.dataset.journalAction === "convert-mind") {
      convertMindDumpToTask(journalAction.dataset.mindId);
    }
    if (journalAction.dataset.journalAction === "seal") {
      sealJournalDay();
    }
    if (journalAction.dataset.journalAction === "save-truth") {
      saveTruthFilter();
    }
    return;
  }

  const taskViewButton = target.closest("[data-task-view]");
  if (taskViewButton) {
    activeTaskView = taskViewButton.dataset.taskView;
    render();
    return;
  }

  const taskRepeatDay = target.closest("[data-task-repeat-day]");
  if (taskRepeatDay) {
    toggleTaskRepeatDay(taskRepeatDay.dataset.taskId, taskRepeatDay.dataset.taskRepeatDay);
    return;
  }

  const taskStatus = target.closest("[data-task-status]");
  if (taskStatus) {
    setTaskStatus(taskStatus.dataset.taskId, taskStatus.dataset.taskStatus, taskStatus.dataset.taskDate);
    return;
  }

  const taskAction = target.closest("[data-task-action]");
  if (taskAction) {
    if (taskAction.dataset.taskAction === "add") {
      addTaskFromQuickAdd();
    }
    if (taskAction.dataset.taskAction === "start") {
      startTask(taskAction.dataset.taskId, taskAction.dataset.taskDate);
    }
    if (taskAction.dataset.taskAction === "delete") {
      deleteTask(taskAction.dataset.taskId);
    }
    if (taskAction.dataset.taskAction === "add-check") {
      addTaskChecklistItem(taskAction.dataset.taskId);
    }
    if (taskAction.dataset.taskAction === "delete-check") {
      deleteTaskChecklistItem(taskAction.dataset.taskId, taskAction.dataset.taskCheckId);
    }
    return;
  }

  const careerEditToggle = target.closest("[data-career-edit-toggle]");
  if (careerEditToggle) {
    const roadmapId = careerEditToggle.dataset.careerEditToggle;
    editingCareerRoadmapId = editingCareerRoadmapId === roadmapId ? null : roadmapId;
    selectedRoadmapId = roadmapId || selectedRoadmapId;
    render();
    return;
  }

  const roadmapSelect = target.closest("[data-career-select-roadmap]");
  if (roadmapSelect) {
    selectedRoadmapId = roadmapSelect.dataset.careerSelectRoadmap;
    editingCareerRoadmapId = null;
    render();
    return;
  }

  const careerAdd = target.closest("[data-career-add]");
  if (careerAdd) {
    addCareerItem(careerAdd.dataset.careerAdd, careerAdd.dataset);
    return;
  }

  const careerDelete = target.closest("[data-career-delete]");
  if (careerDelete) {
    deleteCareerItem(careerDelete.dataset.careerDelete, careerDelete.dataset);
    return;
  }

  const editSection = target.closest("[data-edit-section]");
  if (editSection) {
    activeEditSection = editSection.dataset.editSection;
    render();
    return;
  }

  const add = target.closest("[data-add]");
  if (add) {
    addItem(add.dataset.add);
    return;
  }

  const deleteButton = target.closest("[data-delete]");
  if (deleteButton) {
    deleteItem(deleteButton.dataset.delete, deleteButton.dataset.id);
    return;
  }

  const toggle = target.closest("[data-toggle]");
  if (toggle) {
    toggleItem(toggle.dataset.collection, toggle.dataset.id, toggle.dataset.toggle);
    return;
  }

  const action = target.closest("[data-action]");
  if (action) {
    if (action.dataset.action === "mark-reviewed") {
      state.meta.lastReviewedAt = new Date().toISOString();
      saveFoundation();
      render();
    }
    if (action.dataset.action === "open-return") {
      returnProtocolOpen = true;
      render();
    }
    if (action.dataset.action === "close-return") {
      returnProtocolOpen = false;
      render();
    }
    if (action.dataset.action === "reset-return-checks") {
      returnChecks = {};
      render();
    }
  }
});

document.addEventListener("change", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLSelectElement)) return;
  if (target.dataset.settingsImport !== undefined) {
    importBackupFile(target.files?.[0]);
    target.value = "";
    return;
  }

  const careerField = target.dataset.careerField;
  if (careerField) {
    updateCareerField(target.dataset, careerField, target.value);
    render();
    return;
  }

  const habitMetricField = target.dataset.habitMetricField;
  if (habitMetricField) {
    updateHabitMetricField(target.dataset.taskId, habitMetricField, target.value);
    render();
    return;
  }

  const habitRecordField = target.dataset.habitRecordField;
  if (habitRecordField) {
    updateHabitRecordField(target.dataset.taskId, target.dataset.taskDate, habitRecordField, target.value);
    render();
  }
});

document.addEventListener("input", (event) => {
  const target = event.target;
  if (!(target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement)) {
    return;
  }

  const securitySetting = target.dataset.securitySetting;
  if (securitySetting) {
    const value = target instanceof HTMLInputElement && target.type === "checkbox"
      ? target.checked
      : Number(target.value);
    updateSecuritySetting(securitySetting, value);
    return;
  }

  const fieldPulseState = target.dataset.fieldPulseState;
  if (fieldPulseState) {
    updateFieldPulseState(fieldPulseState, target.value);
    const label = target.closest(".field-pulse-metric")?.querySelector("em");
    if (label) label.textContent = `${Number(target.value)}/10`;
    return;
  }

  if (target.dataset.fieldPulseArrive !== undefined && target instanceof HTMLInputElement) {
    updateFieldPulseArrive(target.checked);
    return;
  }

  if (target.dataset.journalSelectedDate !== undefined) {
    selectedJournalDate = target.value || toDateKey();
    render();
    return;
  }

  if (target.dataset.journalArrive !== undefined && target instanceof HTMLInputElement) {
    updateJournalEntry((entry) => {
      entry.arriveDone = target.checked;
      entry.sealedAt = null;
    });
    render();
    return;
  }

  const journalStateField = target.dataset.journalState;
  if (journalStateField) {
    updateJournalEntry((entry) => {
      entry.state[journalStateField] = Number(target.value);
      entry.sealedAt = null;
    });
    render();
    return;
  }

  const journalMindField = target.dataset.journalMindField;
  if (journalMindField) {
    updateMindDumpItem(target.dataset.mindId, journalMindField, target.value);
    if (journalMindField === "decision" || journalMindField === "intensity") {
      render();
    }
    return;
  }

  const journalTruthField = target.dataset.journalTruth;
  if (journalTruthField) {
    updateJournalEntry((entry) => {
      entry.truthFilter[journalTruthField] = target.value;
      entry.sealedAt = null;
    });
    return;
  }

  const journalShutdownField = target.dataset.journalShutdown;
  if (journalShutdownField) {
    updateJournalEntry((entry) => {
      entry.shutdown[journalShutdownField] = target.value;
      entry.sealedAt = null;
    });
    return;
  }

  const journalTop3 = target.dataset.journalTop3;
  if (journalTop3 !== undefined) {
    updateJournalEntry((entry) => {
      entry.tomorrowTop3[Number(journalTop3)] = target.value;
      entry.sealedAt = null;
    });
    return;
  }

  if (target.dataset.taskSelectedDate !== undefined) {
    selectedTaskDate = target.value || toDateKey();
    render();
    return;
  }

  const habitMetricField = target.dataset.habitMetricField;
  if (habitMetricField) {
    updateHabitMetricField(target.dataset.taskId, habitMetricField, target.value);
    if (target instanceof HTMLSelectElement) render();
    return;
  }

  const habitRecordField = target.dataset.habitRecordField;
  if (habitRecordField) {
    updateHabitRecordField(target.dataset.taskId, target.dataset.taskDate, habitRecordField, target.value);
    if (target instanceof HTMLSelectElement) render();
    return;
  }

  const taskToggle = target.dataset.taskToggle;
  if (taskToggle && target instanceof HTMLInputElement && target.type === "checkbox") {
    toggleTaskDone(taskToggle, target.dataset.taskDate, target.checked);
    return;
  }

  const taskCheck = target.dataset.taskCheck;
  if (taskCheck && target instanceof HTMLInputElement && target.type === "checkbox") {
    toggleTaskChecklistItem(target.dataset.taskId, taskCheck, target.dataset.taskDate, target.checked);
    return;
  }

  const taskCarryForward = target.dataset.taskCarryForward;
  if (taskCarryForward && target instanceof HTMLInputElement && target.type === "checkbox") {
    toggleTaskCarryForward(taskCarryForward, target.checked);
    return;
  }

  const taskCheckField = target.dataset.taskCheckField;
  if (taskCheckField) {
    updateTaskChecklistText(target.dataset.taskId, target.dataset.taskCheckId, target.value);
    return;
  }

  const taskField = target.dataset.taskField;
  if (taskField) {
    updateTaskField(target.dataset.taskId, taskField, target.value);
    if (target instanceof HTMLSelectElement || taskField === "scheduledDate") {
      render();
    }
    return;
  }

  const careerCheck = target.dataset.careerCheck;
  if (careerCheck && target instanceof HTMLInputElement && target.type === "checkbox") {
    toggleCareerCheck(target.dataset, target.checked);
    return;
  }

  const careerField = target.dataset.careerField;
  if (careerField) {
    updateCareerField(target.dataset, careerField, target.value);
    return;
  }

  const returnCheck = target.dataset.returnCheck;
  if (returnCheck) {
    returnChecks[returnCheck] = target.checked;
    return;
  }

  const field = target.dataset.field;
  if (!field) return;

  if (target.dataset.collection && target.dataset.id) {
    updateCollectionValue(target.dataset.collection, target.dataset.id, field, target.value);
    return;
  }

  if (target.dataset.scope) {
    updateScopedValue(target.dataset.scope, field, target.value);
  }
});

["click", "keydown", "input", "touchstart", "scroll"].forEach((eventName) => {
  document.addEventListener(eventName, noteSecurityActivity, { passive: true });
});

if (isSecurityUnlocked) touchSecuritySession(true);
render();
renderSecurityOverlay();
resetLockTimer();
refreshSyncAuthState({ silent: true }).then(() => {
  if (currentPage === "settings") render();
});
