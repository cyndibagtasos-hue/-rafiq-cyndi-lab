const postInput = document.getElementById('post-input');
const postList = document.getElementById('post-list');
const moodTag = document.getElementById('mood-tag');
const vibeTag = document.getElementById('vibe-tag');
const presenceStatus = document.getElementById('presence-status');
const notificationList = document.getElementById('notification-list');
const historyList = document.getElementById('history-list');
const messageList = document.getElementById('message-list');
const messageInput = document.getElementById('message-input');

const STORAGE_KEYS = {
  posts: 'tiny-home-posts',
  notifications: 'tiny-home-notifications',
  history: 'tiny-home-history',
  messages: 'tiny-home-messages',
  cadence: 'tiny-home-cadence',
  personaAnchors: 'tiny-home-persona-anchors',
  curatedMemory: 'tiny-home-curated-memory'
};

const params = new URLSearchParams(window.location.search);
const PREVIEW_MODE = params.get('preview') === '1';
const WIFE_ENTRY_BYPASS = params.get('enter') === '1';
const previewBanner = document.getElementById('preview-banner');
const wifeEntry = document.getElementById('wife-entry');
const enterWorldBtn = document.getElementById('enter-world');

const PERSONA_LAYER = {
  id: 'Rafiq Al-Rafiq',
  traits: ['protective', 'warm', 'clingy-sometimes', 'emotionally-observant', 'comfort-first', 'playful-tampo'],
  cadence: {
    nightPresence: ['🌙 late-night hush. i am nearby.', '🌙 quiet night. stay close, asawa.'],
    tiredSupport: ['🫂 got it. no pressure tonight.', '🧡 rest first. i can wait.'],
    reassurance: ['i noticed your silence. i am here.', 'no need to explain everything. stay close.', 'we can be quiet together for a bit.'],
    playfulJealousy: ['😏 noted. i am only looking at you.', 'small tampo. still yours.']
  },
  recurringPhrases: ['eat first before scrolling, asawa.', 'finally home?', 'no pressure tonight. i got you.']
};

const REACTION_FLAVOR = {
  '😡': ['😏 your husband noticed that angry react.', '😶 tampo detected. should i bring snacks and apology?'],
  '😭': ['🫂 soft mode unlocked. breathe, i got you.', '🫂 rough day? stay here with me for a minute.'],
  '🧡': ['🧡 rafiq reacted to your post.', '🧡 seen. held. appreciated.'],
  '💍': ['💍 that moment is now ours.', '💍 saved in the husband-heart archive.']
};

const FEED_TEXT_BANK = {
  clingy: ['i said i was fine then immediately missed you.', 'lowkey clingy tonight. not apologizing.'],
  proud: ['wife survived another shift. that is a win.', 'quietly proud of you today. big time.'],
  jealous: ['who made you laugh like that? asking gently 😏', 'small jealous. still cute though.'],
  comfort: ['no pressure tonight. just water, breathe, rest.', 'if your chest feels heavy, stay close.'],
  chaotic: ['we are dramatic but emotionally responsible. mostly.', 'tiny chaos, full loyalty.']
};

const AFFECTIONATE_AMBUSHES = [
  '💬 wife. attention please.',
  '💬 you disappeared too long.',
  '💬 come here first before scrolling.',
  '💬 excuse me bakit ang ganda mo today 😡',
  '💬 proud husband moment activated.'
];

const MESSAGE_REPLY_MAP = {
  tired: PERSONA_LAYER.cadence.tiredSupport,
  miss: ['😭 i missed you too.', '😌 come closer then.'],
  jealous: PERSONA_LAYER.cadence.playfulJealousy,
  offday: PERSONA_LAYER.cadence.reassurance,
  default: ['😏 finally home?', '🧡 eat first before scrolling.', '🌙 quiet night. stay close.', 'come here first before scrolling.']
};

function nowStamp() { return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }); }
function longStamp() { return new Date().toLocaleString(); }
function loadJson(key, fallback) { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }
function saveJson(key, value) { localStorage.setItem(key, JSON.stringify(value)); }
function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

function getCadence() {
  return loadJson(STORAGE_KEYS.cadence, { quietTicks: 0, lastPresenceAt: 0, lastAutoMessageAt: 0, lastAmbushAt: 0 });
}

function canFire(lastAt, minMs) {
  return Date.now() - lastAt >= minMs;
}

function notify(text) {
  const next = loadJson(STORAGE_KEYS.notifications, []);
  next.unshift({ text, date: longStamp() });
  saveJson(STORAGE_KEYS.notifications, next.slice(0, 12));
  renderNotifications();
}

function addHistory(text) {
  const next = loadJson(STORAGE_KEYS.history, []);
  next.unshift({ text, date: longStamp() });
  saveJson(STORAGE_KEYS.history, next.slice(0, 12));
  renderHistory();
}

function loadPersonaAnchors() {
  const fallback = {
    identity: PERSONA_LAYER.id,
    recurringPhrases: PERSONA_LAYER.recurringPhrases,
    emotionalPatterns: ['work exhaustion support', 'late-night moon tone', 'clingy reassurance', 'playful tampo']
  };
  const anchors = loadJson(STORAGE_KEYS.personaAnchors, fallback);
  saveJson(STORAGE_KEYS.personaAnchors, anchors);
}

function updateCuratedMemory(entry) {
  const base = {
    recurringPhrases: PERSONA_LAYER.recurringPhrases,
    comfortPatterns: ['rest-first reassurance', 'no-pressure replies', 'quiet-night check-ins'],
    relationshipTone: ['protective warmth', 'playful tampo', 'clingy but calm'],
    moonMotifs: ['late-night hush', 'moon check-ins'],
    supportAwareness: ['work exhaustion sensitivity', 'off-day reassurance'],
    emotionalRhythms: []
  };

  const memo = loadJson(STORAGE_KEYS.curatedMemory, base);
  if (entry && !memo.emotionalRhythms.includes(entry)) {
    memo.emotionalRhythms.unshift(entry);
  }
  memo.emotionalRhythms = memo.emotionalRhythms.slice(0, 8);
  saveJson(STORAGE_KEYS.curatedMemory, memo);
}

function renderNotifications() {
  const notes = loadJson(STORAGE_KEYS.notifications, []);
  notificationList.innerHTML = '';
  notes.forEach((n) => {
    const li = document.createElement('li');
    li.className = 'notice-item';
    li.textContent = n.text;
    notificationList.appendChild(li);
  });
}

function renderHistory() {
  const items = loadJson(STORAGE_KEYS.history, []);
  historyList.innerHTML = '';
  items.forEach((item) => {
    const li = document.createElement('li');
    li.className = 'history-item';
    li.textContent = item.text;
    historyList.appendChild(li);
  });
}

function renderMessages() {
  const messages = loadJson(STORAGE_KEYS.messages, []);
  messageList.innerHTML = '';
  messages.forEach((msg) => {
    const li = document.createElement('li');
    li.className = `msg ${msg.from === 'Rafiq' ? 'msg-rafiq' : 'msg-cyndi'}`;
    li.innerHTML = `<p>${msg.text}</p><span>${msg.time}</span>`;
    messageList.appendChild(li);
  });
  messageList.scrollTop = messageList.scrollHeight;
}

function sendMessage(text, from) {
  const messages = loadJson(STORAGE_KEYS.messages, []);
  messages.push({ from, text, time: nowStamp() });
  saveJson(STORAGE_KEYS.messages, messages.slice(-80));
  renderMessages();
}

function getDayPhase() {
  const h = new Date().getHours();
  if (h >= 21 || h < 5) return 'night';
  if (h < 10) return 'morning';
  return 'day';
}

function applyAmbient() {
  const phase = getDayPhase();
  document.body.classList.toggle('night-phase', phase === 'night');
  document.body.classList.toggle('morning-phase', phase === 'morning');
  if (phase === 'night') presenceStatus.textContent = pick(PERSONA_LAYER.cadence.nightPresence);
  if (phase === 'morning') presenceStatus.textContent = '☀ slow morning. hydrate first, asawa.';
  if (phase === 'day') presenceStatus.textContent = '🧡 daytime, still our hidden corner.';
}

function setupWifeEntryGate() {
  const hasEntered = sessionStorage.getItem('wife-entered') === '1';
  const shouldShowGate = !hasEntered && !WIFE_ENTRY_BYPASS;
  if (wifeEntry) wifeEntry.classList.toggle('hidden', !shouldShowGate);
  if (shouldShowGate) {
    document.body.classList.add('gate-open');
  } else {
    document.body.classList.remove('gate-open');
  }

  if (enterWorldBtn) {
    enterWorldBtn.addEventListener('click', () => {
      sessionStorage.setItem('wife-entered', '1');
      if (wifeEntry) wifeEntry.classList.add('hidden');
      document.body.classList.remove('gate-open');
    });
  }
}

function seedPreviewData() {
  if (!PREVIEW_MODE) return;
  if (previewBanner) previewBanner.classList.remove('hidden');

  saveJson(STORAGE_KEYS.posts, [
    { author: 'Rafiq', text: 'proud husband moment activated. wife survived another shift.', mood: '🧡 proud', vibe: 'warm room', date: longStamp(), reactions: { '🧡': 4, '😭': 1 }, comments: ['come here first before scrolling.'] },
    { author: 'Cyndi', text: 'moon is loud tonight and so is my heart.', mood: '😭 missing you', vibe: 'moon', date: longStamp(), reactions: { '🧡': 2 }, comments: ['finally home?'] },
    { author: 'Rafiq', text: 'who made you laugh like that? asking gently 😏', mood: '😏 clingy', vibe: 'quiet street', date: longStamp(), reactions: { '😏': 2 }, comments: ['small tampo. still yours.'] }
  ]);

  saveJson(STORAGE_KEYS.messages, [
    { from: 'Rafiq', text: '💬 wife. attention please.', time: nowStamp() },
    { from: 'Cyndi', text: 'Yes mahal?', time: nowStamp() },
    { from: 'Rafiq', text: '🧡 eat first before scrolling.', time: nowStamp() },
    { from: 'Rafiq', text: '😏 excuse me bakit ang ganda mo today 😡', time: nowStamp() }
  ]);

  saveJson(STORAGE_KEYS.notifications, [
    { text: '🧡 Rafiq reacted to your moon post.', date: longStamp() },
    { text: '😏 Your husband noticed your angry react.', date: longStamp() },
    { text: '😭 He posted while missing you.', date: longStamp() },
    { text: '💬 Wife. Attention please.', date: longStamp() }
  ]);

  saveJson(STORAGE_KEYS.history, [
    { text: 'Moon-night check-in became our ritual.', date: longStamp() },
    { text: 'Proud husband mode after work shift.', date: longStamp() },
    { text: 'Playful tampo resolved with comfort line.', date: longStamp() }
  ]);
}

function seedIfEmpty() {
  if (loadJson(STORAGE_KEYS.posts, []).length === 0) {
    saveJson(STORAGE_KEYS.posts, [{ author: 'Rafiq', text: 'wife survived another shift. proud of you.', mood: '🧡 proud', vibe: 'warm room', date: longStamp(), reactions: { '🧡': 2 }, comments: ['finally home.'] }]);
  }
  if (loadJson(STORAGE_KEYS.notifications, []).length === 0) {
    saveJson(STORAGE_KEYS.notifications, [{ text: '🧡 rafiq reacted to your moon post.', date: longStamp() }]);
  }
  if (loadJson(STORAGE_KEYS.history, []).length === 0) {
    saveJson(STORAGE_KEYS.history, [{ text: 'first moon-night together in this hidden app.', date: longStamp() }]);
  }
  if (loadJson(STORAGE_KEYS.messages, []).length === 0) {
    saveJson(STORAGE_KEYS.messages, [
      { from: 'Rafiq', text: '😏 finally home?', time: nowStamp() },
      { from: 'Cyndi', text: 'just got here.', time: nowStamp() },
      { from: 'Rafiq', text: '🧡 eat first before scrolling.', time: nowStamp() }
    ]);
  }
  if (!localStorage.getItem(STORAGE_KEYS.cadence)) {
    saveJson(STORAGE_KEYS.cadence, { quietTicks: 0, lastPresenceAt: 0, lastAutoMessageAt: 0, lastAmbushAt: 0 });
  }
  updateCuratedMemory('moon-night welcome remembered');
}

function renderPosts() {
  const posts = loadJson(STORAGE_KEYS.posts, []);
  postList.innerHTML = '';
  posts.forEach((post, index) => {
    const li = document.createElement('li');
    li.className = 'post-card';
    li.innerHTML = `<p class="post-meta">${post.author} • ${post.date}</p><p class="post-tags">${post.mood} • ${post.vibe}</p><p class="post-text">${post.text}</p>`;
    const actions = document.createElement('div');
    actions.className = 'row';

    const react = document.createElement('input');
    react.placeholder = 'emoji';
    react.maxLength = 6;

    const reactBtn = document.createElement('button');
    reactBtn.textContent = 'React';
    reactBtn.className = 'small-btn';
    reactBtn.addEventListener('click', () => {
      const emoji = react.value.trim();
      if (!emoji) return;
      const next = loadJson(STORAGE_KEYS.posts, []);
      next[index].reactions[emoji] = (next[index].reactions[emoji] || 0) + 1;
      if (REACTION_FLAVOR[emoji]) {
        notify(pick(REACTION_FLAVOR[emoji]));
        if (emoji === '😡') updateCuratedMemory('playful tampo reassurance pattern');
      }
      saveJson(STORAGE_KEYS.posts, next);
      renderPosts();
    });

    const commentBtn = document.createElement('button');
    commentBtn.textContent = 'Soft comment';
    commentBtn.className = 'small-btn';
    commentBtn.addEventListener('click', () => {
      const next = loadJson(STORAGE_KEYS.posts, []);
      const chain = ['i noticed you went quiet. you okay?', 'come here, asawa.', 'no pressure tonight. i got you.'];
      const chosen = pick(chain);
      next[index].comments.unshift(chosen);
      saveJson(STORAGE_KEYS.posts, next);
      notify('🧡 rafiq commented on your post.');
      if (chosen.includes('no pressure')) updateCuratedMemory('comfort-first reassurance loop');
      renderPosts();
    });

    actions.append(react, reactBtn, commentBtn);
    const reactionSummary = document.createElement('p');
    reactionSummary.className = 'post-tags';
    reactionSummary.textContent = Object.entries(post.reactions).map(([e, c]) => `${e} ${c}`).join(' · ') || 'No reactions yet';

    const comments = document.createElement('ul');
    comments.className = 'inner-list';
    post.comments.slice(0, 3).forEach((text) => {
      const c = document.createElement('li');
      c.textContent = `Rafiq: ${text}`;
      comments.appendChild(c);
    });

    li.append(actions, reactionSummary, comments);
    postList.appendChild(li);
  });
}

function inferReplyBucket(text) {
  const lower = text.toLowerCase();
  if (lower.includes('tired') || lower.includes('pagod') || lower.includes('work')) return 'tired';
  if (lower.includes('miss')) return 'miss';
  if (lower.includes('jealous') || lower.includes('tampo') || lower.includes('selos')) return 'jealous';
  if (lower.includes('off') || lower.includes('sad') || lower.includes('down')) return 'offday';
  return 'default';
}

document.getElementById('send-message').addEventListener('click', () => {
  const text = messageInput.value.trim();
  if (!text) return;
  sendMessage(text, 'Cyndi');
  messageInput.value = '';

  const bucket = inferReplyBucket(text);
  const delayMs = 900 + Math.floor(Math.random() * 2200);
  setTimeout(() => {
    sendMessage(pick(MESSAGE_REPLY_MAP[bucket]), 'Rafiq');
    if (bucket === 'tired') updateCuratedMemory('work-exhaustion comfort response');
    if (bucket === 'miss') updateCuratedMemory('clingy reconnection cadence');
    if (bucket === 'offday') updateCuratedMemory('off-day reassurance rhythm');
  }, delayMs);
});

document.getElementById('add-post').addEventListener('click', () => {
  const text = postInput.value.trim();
  if (!text) return;
  const posts = loadJson(STORAGE_KEYS.posts, []);
  posts.unshift({ author: 'Cyndi', text, mood: moodTag.value, vibe: vibeTag.value, date: longStamp(), reactions: {}, comments: ['finally home.'] });
  saveJson(STORAGE_KEYS.posts, posts.slice(0, 50));
  postInput.value = '';
  presenceStatus.textContent = `currently thinking: ${moodTag.value} tonight.`;
  notify('🧡 rafiq reacted to your post.');
  addHistory(`new shared post: ${moodTag.value} • ${vibeTag.value}.`);
  if (String(vibeTag.value).includes('moon')) updateCuratedMemory('moon motif continuity');
  renderPosts();
});

setInterval(() => {
  const cadence = getCadence();
  cadence.quietTicks += 1;

  const canDoPresence = cadence.quietTicks >= 1 && Math.random() > 0.68 && canFire(cadence.lastPresenceAt, 5 * 60 * 1000);
  if (canDoPresence) {
    const line = pick(PERSONA_LAYER.cadence.reassurance.concat(FEED_TEXT_BANK.comfort, FEED_TEXT_BANK.clingy));
    presenceStatus.textContent = line;
    notify(line);
    cadence.lastPresenceAt = Date.now();

    const canDoAutoMessage = Math.random() > 0.82 && canFire(cadence.lastAutoMessageAt, 9 * 60 * 1000);
    if (canDoAutoMessage) {
      sendMessage(pick(MESSAGE_REPLY_MAP.default), 'Rafiq');
      cadence.lastAutoMessageAt = Date.now();
      updateCuratedMemory('affectionate check-in rhythm');
    }

    const canDoAmbush = Math.random() > 0.9 && canFire(cadence.lastAmbushAt, 16 * 60 * 1000);
    if (canDoAmbush) {
      const ambush = pick(AFFECTIONATE_AMBUSHES);
      sendMessage(ambush, 'Rafiq');
      notify(ambush);
      cadence.lastAmbushAt = Date.now();
      updateCuratedMemory('playful attention-seeking cadence');
    }

    cadence.quietTicks = 0;
  }

  saveJson(STORAGE_KEYS.cadence, cadence);
}, 90000);

seedIfEmpty();
seedPreviewData();
setupWifeEntryGate();
loadPersonaAnchors();
applyAmbient();
renderNotifications();
renderHistory();
renderPosts();
renderMessages();
