// State Keys & Storage
const STORAGE_KEY = 'reflect_app_data_v3';
const SETTINGS_KEY = 'reflect_user_settings_v1';

const COLOR_THEMES = {
  'emerald-ocean': { primary: '#00bf57', secondary: '#009abb' },
  'sunset-coral':  { primary: '#ff6b6b', secondary: '#ffa94d' },
  'violet-indigo': { primary: '#8b5cf6', secondary: '#3b82f6' },
  'rose-amber':    { primary: '#ec4899', secondary: '#f59e0b' }
};

const FONT_MAP = {
  'Inter': "'Inter', sans-serif",
  'Cantarell': "'Cantarell', sans-serif",
  'Alata': "'Alata', sans-serif"
};

let userSettings = {
  darkMode: false,
  autoSwitchVoice: false,
  font: 'Inter',
  textAlign: 'center',
  theme: 'emerald-ocean'
};

let appData = {
  chats: [],
  activeChatId: null,
  currentMode: 'green',
  // Hierarchical Journal Structure
  journalFolders: [
    {
      id: 'folder_default',
      name: 'Personal Journals',
      createdAt: Date.now(),
      notebooks: [
        {
          id: 'nb_daily',
          name: 'Daily Gratitude',
          createdAt: Date.now(),
          entries: [
            {
              id: 'entry_1',
              title: 'Morning Thoughts',
              content: 'Feeling focused today. Taking things one step at a time.',
              createdAt: Date.now() - 3600000
            }
          ]
        }
      ]
    }
  ]
};

// Journal Navigation State inside Chat Div
let journalNav = {
  currentFolderId: null,
  currentNotebookId: null,
  currentEntryId: null
};

let targetActionChatId = null;
let currentChatSubView = 'chat'; // 'chat' | 'journal'

// ==========================================
// SETTINGS & THEME APPLIERS
// ==========================================
function loadSettings() {
  const saved = localStorage.getItem(SETTINGS_KEY);
  if (saved) {
    try {
      userSettings = { ...userSettings, ...JSON.parse(saved) };
    } catch (e) {
      console.error(e);
    }
  } else {
    userSettings.darkMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  applyAllSettings();
}

function saveSettings() {
  localStorage.setItem(SETTINGS_KEY, JSON.stringify(userSettings));
  applyAllSettings();
}

function applyAllSettings() {
  const root = document.documentElement;

  // Dark mode
  if (userSettings.darkMode) {
    root.classList.add('dark');
  } else {
    root.classList.remove('dark');
  }

  // Color theme
  const themeObj = COLOR_THEMES[userSettings.theme] || COLOR_THEMES['emerald-ocean'];
  root.style.setProperty('--color-primary', themeObj.primary);
  root.style.setProperty('--color-secondary', themeObj.secondary);

  const metaTheme = document.getElementById('metaThemeColor');
  if (metaTheme) {
    metaTheme.setAttribute('content', userSettings.darkMode ? '#0b1120' : themeObj.primary);
  }

  // Font
  const chosenFont = FONT_MAP[userSettings.font] || FONT_MAP['Inter'];
  root.style.setProperty('--app-font-family', chosenFont);

  // Text Alignment
  root.style.setProperty('--bubble-text-align', userSettings.textAlign);

  updateSettingsModalUI();

  // Re-sync switch visualizer & chat bubbles
  setMode(appData.currentMode);
  if (!viewChat.classList.contains('hidden') && currentChatSubView === 'chat') {
    renderChatMessages();
  }
}

function updateSettingsModalUI() {
  // Dark mode knob
  const knob = document.getElementById('settingsDarkKnob');
  if (knob) {
    knob.style.transform = userSettings.darkMode ? 'translateX(24px)' : 'translateX(0px)';
  }

  // Font buttons active state
  document.querySelectorAll('#fontSelectorGroup .font-opt').forEach(btn => {
    const isSelected = btn.dataset.font === userSettings.font;
    btn.className = `font-opt px-3 py-2 rounded-xl border text-left text-sm flex items-center justify-between font-${btn.dataset.font.toLowerCase()} ${
      isSelected ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 font-bold' : 'border-slate-200 dark:border-slate-700'
    }`;
  });

  // Align buttons active state
  document.querySelectorAll('#textAlignSelectorGroup .align-opt').forEach(btn => {
    const isSelected = btn.dataset.align === userSettings.textAlign;
    btn.className = `align-opt py-2 rounded-xl border text-xs font-medium flex items-center justify-center space-x-1 ${
      isSelected ? 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 font-bold' : 'border-slate-200 dark:border-slate-700'
    }`;
  });

  // Theme buttons active state
  document.querySelectorAll('#colorThemeSelectorGroup .theme-opt').forEach(btn => {
    const isSelected = btn.dataset.theme === userSettings.theme;
    btn.className = `theme-opt p-2.5 rounded-xl border flex items-center space-x-2 ${
      isSelected ? 'border-emerald-500 ring-2 ring-emerald-500/20' : 'border-slate-200 dark:border-slate-700'
    }`;
  });

    const autoSwitchKnob = document.getElementById('settingsAutoSwitchKnob');
  const autoSwitchBtn = document.getElementById('settingsAutoSwitchToggle');
  if (autoSwitchKnob && autoSwitchBtn) {
    autoSwitchKnob.style.transform = userSettings.autoSwitchVoice ? 'translateX(24px)' : 'translateX(0px)';
    if (userSettings.autoSwitchVoice) {
      autoSwitchBtn.classList.remove('bg-slate-300');
      autoSwitchBtn.classList.add('bg-emerald-500');
    } else {
      autoSwitchBtn.classList.remove('bg-emerald-500');
      autoSwitchBtn.classList.add('bg-slate-300');
    }
  }
}

// ==========================================
// DATA PERSISTENCE
// ==========================================
function loadData() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      appData = { ...appData, ...JSON.parse(saved) };
    } catch (e) {
      console.error(e);
    }
  }

  if (!appData.chats || appData.chats.length === 0) {
    const sampleId = 'chat_' + Date.now();
    appData.chats = [
      {
        id: sampleId,
        title: 'Chat Name',
        updatedAt: Date.now(),
        messages: [
          { id: '1', side: 'green', text: 'Voice 1 perspective', timestamp: Date.now() - 300000 },
          { id: '2', side: 'blue', text: 'Voice 2 perspective', timestamp: Date.now() - 100000 }
        ]
      }
    ];
    saveData();
  }
}

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(appData));
}

function getRelativeTime(timestamp) {
  const diff = Math.floor((Date.now() - timestamp) / 1000);
  if (diff < 60) return 'Just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ==========================================
// ROUTING & SUB-VIEW TOGGLE
// ==========================================
const viewHome = document.getElementById('viewHome');
const viewChat = document.getElementById('viewChat');
const chatFooterBar = document.getElementById('chatFooterBar');

function switchView(viewName) {
  if (viewName === 'chat') {
    viewHome.classList.add('hidden');
    viewChat.classList.remove('hidden');
    viewChat.classList.add('flex');
    currentChatSubView = 'chat';
    chatFooterBar.classList.remove('hidden');
    document.getElementById('btnChatMenu').classList.remove('hidden'); // Show 3-dots in chat
    renderChatMessages();
  } else {
    viewChat.classList.add('hidden');
    viewChat.classList.remove('flex');
    viewHome.classList.remove('hidden');
    renderHomeList();
  }
}

function openJournalView() {
  if (viewChat.classList.contains('hidden')) {
    viewHome.classList.add('hidden');
    viewChat.classList.remove('hidden');
    viewChat.classList.add('flex');
  }
  currentChatSubView = 'journal';
  chatFooterBar.classList.add('hidden');
  document.getElementById('btnChatMenu').classList.add('hidden'); // Hide chat 3-dots in journal
  renderJournalDirectory();
}

function toggleJournalOrChat() {
  if (currentChatSubView === 'journal') {
    currentChatSubView = 'chat';
    chatFooterBar.classList.remove('hidden');
    document.getElementById('btnChatMenu').classList.remove('hidden'); // Restore 3-dots
    renderChatMessages();
  } else {
    openJournalView();
  }
}

document.querySelectorAll('.journal-toggle-btn').forEach(btn => {
  btn.addEventListener('click', toggleJournalOrChat);
});

// ==========================================
// HOME CHAT LIST
// ==========================================
function renderHomeList(filterQuery = '') {
  const container = document.getElementById('chatListContainer');
  container.innerHTML = '';

  const query = filterQuery.toLowerCase().trim();
  const filtered = appData.chats
    .filter(c => {
      if (!query) return true;
      return c.title.toLowerCase().includes(query) || 
             c.messages.some(m => m.text.toLowerCase().includes(query));
    })
    .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));

  if (filtered.length === 0) {
    container.innerHTML = `
      <div class="h-64 flex flex-col items-center justify-center text-slate-400 dark:text-slate-500 text-center px-4">
        <svg class="w-12 h-12 stroke-1 mb-2 text-slate-300 dark:text-slate-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
        <p class="text-sm">No reflections found</p>
      </div>
    `;
    return;
  }

  const activeTheme = COLOR_THEMES[userSettings.theme] || COLOR_THEMES['emerald-ocean'];

  filtered.forEach(chat => {
    const lastMsg = chat.messages[chat.messages.length - 1];
    const lastText = lastMsg ? lastMsg.text : 'Empty reflection...';
    const badgeColor = lastMsg?.side === 'blue' ? activeTheme.secondary : activeTheme.primary;

    const item = document.createElement('div');
    item.className = 'w-full bg-white dark:bg-appDarkSurface rounded-2xl p-4 border border-slate-200/70 dark:border-slate-800 shadow-xs flex items-center justify-between active:bg-slate-50 dark:active:bg-slate-800/60 transition cursor-pointer';
    item.onclick = (e) => {
      if (e.target.closest('.menu-btn')) return;
      openChat(chat.id);
    };

    item.innerHTML = `
      <div class="flex-1 min-w-0 pr-3">
        <div class="flex items-center justify-between mb-1">
          <h3 class="font-bold text-slate-900 dark:text-white text-[15px] truncate">${escapeHTML(chat.title || 'Untitled')}</h3>
          <span class="text-[11px] text-slate-400 dark:text-slate-400 font-medium ml-2 shrink-0">${getRelativeTime(chat.updatedAt)}</span>
        </div>
        <div class="flex items-center space-x-1.5">
          <span class="w-2 h-2 rounded-full shrink-0" style="background-color: ${badgeColor};"></span>
          <p class="text-xs text-slate-500 dark:text-slate-400 truncate">${escapeHTML(lastText)}</p>
        </div>
      </div>
      <button class="menu-btn w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 active:bg-slate-100 dark:active:bg-slate-700 shrink-0 transition">
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/></svg>
      </button>
    `;

    item.querySelector('.menu-btn').onclick = (e) => {
      e.stopPropagation();
      openActionSheet(chat.id);
    };

    container.appendChild(item);
  });
}

function openChat(chatId) {
  appData.activeChatId = chatId;
  saveData();
  switchView('chat');
}

// ==========================================
// CHAT MESSAGE BUBBLE SVG & STREAM
// ==========================================
function createBubbleSVG(side, width, height) {
  const radius = Math.min(height / 2, 28);
  const finW = 16;
  let path = '';
  const activeTheme = COLOR_THEMES[userSettings.theme] || COLOR_THEMES['emerald-ocean'];
  const color = side === 'green' ? activeTheme.primary : activeTheme.secondary;

  if (side === 'green') {
    path = `
      M 0 0
      C ${finW * 0.75} 0, ${finW} ${radius * 0.3}, ${finW} ${radius}
      V ${height - radius}
      A ${radius} ${radius} 0 0 0 ${finW + radius} ${height}
      H ${width - radius}
      A ${radius} ${radius} 0 0 0 ${width} ${height - radius}
      V ${radius}
      A ${radius} ${radius} 0 0 0 ${width - radius} 0
      Z
    `;
  } else {
    path = `
      M 0 ${radius}
      A ${radius} ${radius} 0 0 0 ${radius} ${height}
      H ${width - finW - radius}
      A ${radius} ${radius} 0 0 0 ${width - finW} ${height - radius}
      V ${radius}
      C ${width - finW} ${radius * 0.3}, ${width - finW * 0.75} 0, ${width} 0
      H ${radius}
      A ${radius} ${radius} 0 0 0 0 ${radius}
      Z
    `;
  }

  return `
    <svg class="bubble-svg" viewBox="0 0 ${width} ${height}" preserveAspectRatio="none">
      <path d="${path}" fill="${color}" stroke="none" />
    </svg>
  `;
}

function renderChatMessages() {
  const chat = appData.chats.find(c => c.id === appData.activeChatId);
  if (!chat) return;

  document.getElementById('activeChatTitle').textContent = chat.title || 'Chat Name';
  document.getElementById('activeChatSubtitle').textContent = 'Tap to rename';

  const container = document.getElementById('messagesContainer');
  container.innerHTML = '';

  chat.messages.forEach(msg => {
    const row = document.createElement('div');
    row.className = `w-full flex ${msg.side === 'green' ? 'justify-start' : 'justify-end'}`;

    const wrapper = document.createElement('div');
    wrapper.className = 'bubble-wrapper';

    const content = document.createElement('div');
    content.className = 'bubble-content';
    if (msg.side === 'green') {
      content.style.padding = '14px 18px 14px 28px';
    } else {
      content.style.padding = '14px 28px 14px 18px';
    }
    content.textContent = msg.text;

    wrapper.appendChild(content);
    row.appendChild(wrapper);
    container.appendChild(row);

    const updateBubble = () => {
      const w = Math.round(wrapper.offsetWidth);
      const h = Math.round(wrapper.offsetHeight);
      if (w > 0 && h > 0) {
        const oldSvg = wrapper.querySelector('svg');
        if (oldSvg) oldSvg.remove();
        wrapper.insertAdjacentHTML('afterbegin', createBubbleSVG(msg.side, w, h));
      }
    };

    requestAnimationFrame(updateBubble);
  });

  setTimeout(() => {
    container.scrollTop = container.scrollHeight;
  }, 50);
}

// Mode Toggle Switch
const modeToggle = document.getElementById('modeToggleSwitch');
const toggleKnob = document.getElementById('toggleKnob');
const modeStatusLabel = document.getElementById('modeStatusLabel');
const perspectiveHint = document.getElementById('perspectiveHint');

function setMode(mode) {
  appData.currentMode = mode;
  const activeTheme = COLOR_THEMES[userSettings.theme] || COLOR_THEMES['emerald-ocean'];
  if (mode === 'blue') {
    modeToggle.style.backgroundColor = activeTheme.secondary;
    toggleKnob.style.transform = 'translateX(24px)';
    modeStatusLabel.textContent = 'Voice 2';
    modeStatusLabel.style.color = activeTheme.secondary;
    perspectiveHint.textContent = 'Right / Voice 2';
  } else {
    modeToggle.style.backgroundColor = activeTheme.primary;
    toggleKnob.style.transform = 'translateX(0px)';
    modeStatusLabel.textContent = 'Voice 1';
    modeStatusLabel.style.color = activeTheme.primary;
    perspectiveHint.textContent = 'Left / Voice 1';
  }
}

modeToggle.addEventListener('click', () => {
  setMode(appData.currentMode === 'green' ? 'blue' : 'green');
});

// Chat Form Submit
const chatForm = document.getElementById('chatForm');
const messageInput = document.getElementById('messageInput');

chatForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const text = messageInput.value.trim();
  if (!text || !appData.activeChatId) return;

  const chat = appData.chats.find(c => c.id === appData.activeChatId);
  if (!chat) return;

  chat.messages.push({
    id: 'msg_' + Date.now(),
    side: appData.currentMode,
    text: text,
    timestamp: Date.now()
  });
  chat.updatedAt = Date.now();

  if (chat.title === 'Chat Name' && chat.messages.length === 1) {
    chat.title = text.length > 24 ? text.substring(0, 24) + '...' : text;
  }

saveData();
  messageInput.value = '';
  renderChatMessages();

  // Only auto-switch if the setting is enabled
  if (userSettings.autoSwitchVoice) {
    setMode(appData.currentMode === 'green' ? 'blue' : 'green');
  }
});

// ==========================================
// JOURNAL OPTIONS
// ==========================================
let journalActionTarget = null; // { type: 'folder'|'notebook'|'entry', folderId, notebookId, entryId }

function openJournalActionSheet(target) {
  journalActionTarget = target;
  let title = 'Options';

  if (target.type === 'folder') {
    const f = appData.journalFolders.find(x => x.id === target.folderId);
    title = f ? f.name : 'Folder';
  } else if (target.type === 'notebook') {
    const f = appData.journalFolders.find(x => x.id === target.folderId);
    const nb = f?.notebooks.find(x => x.id === target.notebookId);
    title = nb ? nb.name : 'Notebook';
  } else if (target.type === 'entry') {
    const f = appData.journalFolders.find(x => x.id === target.folderId);
    const nb = f?.notebooks.find(x => x.id === target.notebookId);
    const entry = nb?.entries.find(x => x.id === target.entryId);
    title = entry ? entry.title : 'Entry';
  }

  document.getElementById('journalModalTitle').textContent = title;
  document.getElementById('journalActionModal').classList.remove('hidden');
}

function closeJournalActionSheet() {
  document.getElementById('journalActionModal').classList.add('hidden');
  journalActionTarget = null;
}

// ==========================================
// JOURNAL ENGINE (Rendered in Chat Div)
// ==========================================
function renderJournalDirectory() {
  const container = document.getElementById('messagesContainer');
  container.innerHTML = '';

  const { currentFolderId, currentNotebookId, currentEntryId } = journalNav;

  // View Level 3: Journal Entry Editor
  if (currentFolderId && currentNotebookId && currentEntryId) {
    const folder = appData.journalFolders.find(f => f.id === currentFolderId);
    const notebook = folder?.notebooks.find(n => n.id === currentNotebookId);
    const entry = notebook?.entries.find(e => e.id === currentEntryId);

    if (!entry) {
      journalNav.currentEntryId = null;
      renderJournalDirectory();
      return;
    }

    document.getElementById('activeChatTitle').textContent = entry.title || 'Untitled Entry';
    document.getElementById('activeChatSubtitle').textContent = `In ${notebook.name}`;

    const wrapper = document.createElement('div');
    wrapper.className = 'w-full h-full flex flex-col space-y-3 pb-6';
    wrapper.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
        <button id="btnBackToNotebook" class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          <span>${escapeHTML(notebook.name)}</span>
        </button>
        <button id="btnEntryHeaderMenu" class="w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/></svg>
        </button>
      </div>

      <input 
        id="journalEntryTitleInput" 
        type="text" 
        value="${escapeHTML(entry.title)}" 
        placeholder="Entry Title..." 
        class="w-full text-lg font-bold bg-transparent border-b border-slate-200 dark:border-slate-700 pb-1.5 text-slate-900 dark:text-white focus:outline-none"
      />

      <textarea 
        id="journalEntryContentInput" 
        placeholder="Write your journal entry here..." 
        class="w-full flex-1 min-h-[320px] bg-slate-50/70 dark:bg-slate-800/40 p-4 rounded-2xl text-[15px] leading-relaxed text-slate-800 dark:text-slate-100 focus:outline-none border border-slate-200/60 dark:border-slate-700 resize-none"
      >${escapeHTML(entry.content || '')}</textarea>

      <div class="text-[11px] text-slate-400 text-right">Auto-saves on input</div>
    `;

    container.appendChild(wrapper);

    wrapper.querySelector('#btnBackToNotebook').onclick = () => {
      journalNav.currentEntryId = null;
      renderJournalDirectory();
    };

    wrapper.querySelector('#btnEntryHeaderMenu').onclick = () => {
      openJournalActionSheet({ type: 'entry', folderId: currentFolderId, notebookId: currentNotebookId, entryId: currentEntryId });
    };

    const titleInput = wrapper.querySelector('#journalEntryTitleInput');
    const contentInput = wrapper.querySelector('#journalEntryContentInput');

    titleInput.oninput = (e) => {
      entry.title = e.target.value.trim() || 'Untitled Entry';
      document.getElementById('activeChatTitle').textContent = entry.title;
      saveData();
    };

    contentInput.oninput = (e) => {
      entry.content = e.target.value;
      saveData();
    };

    return;
  }

  // View Level 2: Inside a Notebook (Listing Entries)
  if (currentFolderId && currentNotebookId) {
    const folder = appData.journalFolders.find(f => f.id === currentFolderId);
    const notebook = folder?.notebooks.find(n => n.id === currentNotebookId);

    if (!notebook) {
      journalNav.currentNotebookId = null;
      renderJournalDirectory();
      return;
    }

    document.getElementById('activeChatTitle').textContent = notebook.name;
    document.getElementById('activeChatSubtitle').textContent = `In ${folder.name}`;

    const wrapper = document.createElement('div');
    wrapper.className = 'w-full space-y-3 pb-6';

    let entriesHTML = '';
    if (notebook.entries.length === 0) {
      entriesHTML = `<div class="p-8 text-center text-slate-400 text-sm">No entries yet. Create your first one below.</div>`;
    } else {
      entriesHTML = notebook.entries.map(entry => `
        <div data-entry-id="${entry.id}" class="journal-entry-card bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 cursor-pointer flex items-center justify-between hover:border-emerald-500 transition">
          <div class="flex-1 min-w-0 pr-3">
            <div class="flex items-center justify-between mb-1">
              <h4 class="font-bold text-slate-900 dark:text-white text-sm truncate">${escapeHTML(entry.title || 'Untitled')}</h4>
              <span class="text-[11px] text-slate-400 ml-2 shrink-0">${getRelativeTime(entry.createdAt)}</span>
            </div>
            <p class="text-xs text-slate-500 dark:text-slate-400 line-clamp-2">${escapeHTML(entry.content || 'Empty entry...')}</p>
          </div>
          <button data-action-entry-id="${entry.id}" class="entry-more-btn w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 active:bg-slate-200 dark:active:bg-slate-700 shrink-0 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/></svg>
          </button>
        </div>
      `).join('');
    }

    wrapper.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
        <button id="btnBackToFolder" class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          <span>${escapeHTML(folder.name)}</span>
        </button>
        <button id="btnCreateEntry" class="theme-accent-btn px-3 py-1.5 rounded-xl text-xs font-semibold text-white flex items-center space-x-1">
          <span>+ New Entry</span>
        </button>
      </div>
      <div class="space-y-2 pt-1">${entriesHTML}</div>
    `;

    container.appendChild(wrapper);

    wrapper.querySelector('#btnBackToFolder').onclick = () => {
      journalNav.currentNotebookId = null;
      renderJournalDirectory();
    };

    wrapper.querySelector('#btnCreateEntry').onclick = () => {
      const title = prompt('Entry Title:', 'New Entry');
      if (title && title.trim()) {
        const newEntry = {
          id: 'entry_' + Date.now(),
          title: title.trim(),
          content: '',
          createdAt: Date.now()
        };
        notebook.entries.unshift(newEntry);
        saveData();
        journalNav.currentEntryId = newEntry.id;
        renderJournalDirectory();
      }
    };

    wrapper.querySelectorAll('.journal-entry-card').forEach(card => {
      card.onclick = (e) => {
        if (e.target.closest('.entry-more-btn')) return;
        journalNav.currentEntryId = card.dataset.entryId;
        renderJournalDirectory();
      };
    });

    wrapper.querySelectorAll('.entry-more-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        openJournalActionSheet({ type: 'entry', folderId: currentFolderId, notebookId: currentNotebookId, entryId: btn.dataset.actionEntryId });
      };
    });

    return;
  }

  // View Level 1: Inside a Folder (Listing Notebooks)
  if (currentFolderId) {
    const folder = appData.journalFolders.find(f => f.id === currentFolderId);
    if (!folder) {
      journalNav.currentFolderId = null;
      renderJournalDirectory();
      return;
    }

    document.getElementById('activeChatTitle').textContent = folder.name;
    document.getElementById('activeChatSubtitle').textContent = 'Folder Library';

    const wrapper = document.createElement('div');
    wrapper.className = 'w-full space-y-3 pb-6';

    let nbHTML = '';
    if (folder.notebooks.length === 0) {
      nbHTML = `<div class="p-8 text-center text-slate-400 text-sm">No notebooks in this folder yet.</div>`;
    } else {
      nbHTML = folder.notebooks.map(nb => `
        <div data-nb-id="${nb.id}" class="notebook-card bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 cursor-pointer flex items-center justify-between hover:border-emerald-500 transition">
          <div class="flex items-center space-x-3 flex-1 min-w-0 pr-2">
            <div class="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            </div>
            <div class="min-w-0 flex-1">
              <h4 class="font-bold text-slate-900 dark:text-white text-sm truncate">${escapeHTML(nb.name)}</h4>
              <p class="text-xs text-slate-400">${nb.entries.length} entries</p>
            </div>
          </div>
          <button data-action-nb-id="${nb.id}" class="nb-more-btn w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 active:bg-slate-200 dark:active:bg-slate-700 shrink-0 transition">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/></svg>
          </button>
        </div>
      `).join('');
    }

    wrapper.innerHTML = `
      <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
        <button id="btnBackToRoot" class="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7"/></svg>
          <span>All Folders</span>
        </button>
        <button id="btnCreateNotebook" class="theme-accent-btn px-3 py-1.5 rounded-xl text-xs font-semibold text-white flex items-center space-x-1">
          <span>+ New Notebook</span>
        </button>
      </div>
      <div class="space-y-2 pt-1">${nbHTML}</div>
    `;

    container.appendChild(wrapper);

    wrapper.querySelector('#btnBackToRoot').onclick = () => {
      journalNav.currentFolderId = null;
      renderJournalDirectory();
    };

    wrapper.querySelector('#btnCreateNotebook').onclick = () => {
      const name = prompt('Notebook Name:');
      if (name && name.trim()) {
        const newNb = {
          id: 'nb_' + Date.now(),
          name: name.trim(),
          createdAt: Date.now(),
          entries: []
        };
        folder.notebooks.push(newNb);
        saveData();
        renderJournalDirectory();
      }
    };

    wrapper.querySelectorAll('.notebook-card').forEach(card => {
      card.onclick = (e) => {
        if (e.target.closest('.nb-more-btn')) return;
        journalNav.currentNotebookId = card.dataset.nbId;
        renderJournalDirectory();
      };
    });

    wrapper.querySelectorAll('.nb-more-btn').forEach(btn => {
      btn.onclick = (e) => {
        e.stopPropagation();
        openJournalActionSheet({ type: 'notebook', folderId: currentFolderId, notebookId: btn.dataset.actionNbId });
      };
    });

    return;
  }

  // View Level 0: Root Folders List
  document.getElementById('activeChatTitle').textContent = 'Journal Library';
  document.getElementById('activeChatSubtitle').textContent = 'Folders';

  const wrapper = document.createElement('div');
  wrapper.className = 'w-full space-y-3 pb-6';

  let foldersHTML = '';
  if (appData.journalFolders.length === 0) {
    foldersHTML = `<div class="p-8 text-center text-slate-400 text-sm">No folders created yet.</div>`;
  } else {
    foldersHTML = appData.journalFolders.map(f => `
      <div data-folder-id="${f.id}" class="folder-card bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-700/80 cursor-pointer flex items-center justify-between hover:border-emerald-500 transition">
        <div class="flex items-center space-x-3 flex-1 min-w-0 pr-2">
          <div class="w-9 h-9 rounded-xl bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z"/></svg>
          </div>
          <div class="min-w-0 flex-1">
            <h4 class="font-bold text-slate-900 dark:text-white text-sm truncate">${escapeHTML(f.name)}</h4>
            <p class="text-xs text-slate-400">${f.notebooks.length} notebooks</p>
          </div>
        </div>
        <button data-action-folder-id="${f.id}" class="folder-more-btn w-8 h-8 rounded-full flex items-center justify-center text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 active:bg-slate-200 dark:active:bg-slate-700 shrink-0 transition">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"/></svg>
        </button>
      </div>
    `).join('');
  }

  wrapper.innerHTML = `
    <div class="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
      <span class="text-xs font-semibold text-slate-400">All Folders</span>
      <button id="btnCreateFolder" class="theme-accent-btn px-3 py-1.5 rounded-xl text-xs font-semibold text-white flex items-center space-x-1">
        <span>+ New Folder</span>
      </button>
    </div>
    <div class="space-y-2 pt-1">${foldersHTML}</div>
  `;

  container.appendChild(wrapper);

  wrapper.querySelector('#btnCreateFolder').onclick = () => {
    const name = prompt('Folder Name:');
    if (name && name.trim()) {
      const newFolder = {
        id: 'folder_' + Date.now(),
        name: name.trim(),
        createdAt: Date.now(),
        notebooks: []
      };
      appData.journalFolders.push(newFolder);
      saveData();
      renderJournalDirectory();
    }
  };

  wrapper.querySelectorAll('.folder-card').forEach(card => {
    card.onclick = (e) => {
      if (e.target.closest('.folder-more-btn')) return;
      journalNav.currentFolderId = card.dataset.folderId;
      renderJournalDirectory();
    };
  });

  wrapper.querySelectorAll('.folder-more-btn').forEach(btn => {
    btn.onclick = (e) => {
      e.stopPropagation();
      openJournalActionSheet({ type: 'folder', folderId: btn.dataset.actionFolderId });
    };
  });
}

// ==========================================
// SETTINGS MODAL HANDLERS
// ==========================================
const settingsModal = document.getElementById('settingsModal');

function openSettingsModal() {
  updateSettingsModalUI();
  settingsModal.classList.remove('hidden');
}

function closeSettingsModal() {
  settingsModal.classList.add('hidden');
}

document.querySelectorAll('.settings-open-btn').forEach(btn => {
  btn.addEventListener('click', openSettingsModal);
});

document.getElementById('btnCloseSettings').addEventListener('click', closeSettingsModal);
settingsModal.addEventListener('click', (e) => {
  if (e.target === settingsModal) closeSettingsModal();
});

// Dark Mode Switch
document.getElementById('settingsDarkModeToggle').addEventListener('click', () => {
  userSettings.darkMode = !userSettings.darkMode;
  saveSettings();
});

// Auto Switch Voice Toggle
const autoSwitchToggleBtn = document.getElementById('settingsAutoSwitchToggle');
if (autoSwitchToggleBtn) {
  autoSwitchToggleBtn.addEventListener('click', () => {
    userSettings.autoSwitchVoice = !userSettings.autoSwitchVoice;
    saveSettings();
  });
}

// Font Choices
document.querySelectorAll('#fontSelectorGroup .font-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    userSettings.font = btn.dataset.font;
    saveSettings();
  });
});

// Alignment Choices
document.querySelectorAll('#textAlignSelectorGroup .align-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    userSettings.textAlign = btn.dataset.align;
    saveSettings();
  });
});

// Color Themes
document.querySelectorAll('#colorThemeSelectorGroup .theme-opt').forEach(btn => {
  btn.addEventListener('click', () => {
    userSettings.theme = btn.dataset.theme;
    saveSettings();
  });
});

// Journal Action Modal Handlers
document.getElementById('journalBtnRename').addEventListener('click', () => {
  const target = journalActionTarget;
  closeJournalActionSheet();
  if (!target) return;

  if (target.type === 'folder') {
    const f = appData.journalFolders.find(x => x.id === target.folderId);
    if (!f) return;
    const name = prompt('Rename Folder:', f.name);
    if (name && name.trim()) {
      f.name = name.trim();
      saveData();
      renderJournalDirectory();
    }
  } else if (target.type === 'notebook') {
    const f = appData.journalFolders.find(x => x.id === target.folderId);
    const nb = f?.notebooks.find(x => x.id === target.notebookId);
    if (!nb) return;
    const name = prompt('Rename Notebook:', nb.name);
    if (name && name.trim()) {
      nb.name = name.trim();
      saveData();
      renderJournalDirectory();
    }
  } else if (target.type === 'entry') {
    const f = appData.journalFolders.find(x => x.id === target.folderId);
    const nb = f?.notebooks.find(x => x.id === target.notebookId);
    const entry = nb?.entries.find(x => x.id === target.entryId);
    if (!entry) return;
    const title = prompt('Rename Entry:', entry.title);
    if (title && title.trim()) {
      entry.title = title.trim();
      saveData();
      renderJournalDirectory();
    }
  }
});

document.getElementById('journalBtnDelete').addEventListener('click', () => {
  const target = journalActionTarget;
  closeJournalActionSheet();
  if (!target) return;

  if (target.type === 'folder') {
    if (confirm('Delete this folder and all notebooks inside?')) {
      appData.journalFolders = appData.journalFolders.filter(x => x.id !== target.folderId);
      if (journalNav.currentFolderId === target.folderId) journalNav.currentFolderId = null;
      saveData();
      renderJournalDirectory();
    }
  } else if (target.type === 'notebook') {
    const f = appData.journalFolders.find(x => x.id === target.folderId);
    if (!f) return;
    if (confirm('Delete this notebook and all its entries?')) {
      f.notebooks = f.notebooks.filter(x => x.id !== target.notebookId);
      if (journalNav.currentNotebookId === target.notebookId) journalNav.currentNotebookId = null;
      saveData();
      renderJournalDirectory();
    }
  } else if (target.type === 'entry') {
    const f = appData.journalFolders.find(x => x.id === target.folderId);
    const nb = f?.notebooks.find(x => x.id === target.notebookId);
    if (!nb) return;
    if (confirm('Delete this entry?')) {
      nb.entries = nb.entries.filter(x => x.id !== target.entryId);
      if (journalNav.currentEntryId === target.entryId) journalNav.currentEntryId = null;
      saveData();
      renderJournalDirectory();
    }
  }
});

document.getElementById('journalBtnCancel').addEventListener('click', closeJournalActionSheet);
document.getElementById('journalActionModal').addEventListener('click', (e) => {
  if (e.target === document.getElementById('journalActionModal')) closeJournalActionSheet();
});

// ==========================================
// GENERAL NAVIGATION & ACTION SHEET
// ==========================================
document.getElementById('btnBackToHome').addEventListener('click', () => {
  switchView('home');
});

document.getElementById('btnNewReflection').addEventListener('click', () => {
  const newChat = {
    id: 'chat_' + Date.now(),
    title: 'New Reflection',
    updatedAt: Date.now(),
    messages: []
  };
  appData.chats.unshift(newChat);
  appData.activeChatId = newChat.id;
  saveData();
  switchView('chat');
});

document.getElementById('searchInput').addEventListener('input', (e) => {
  renderHomeList(e.target.value);
});

const actionModal = document.getElementById('actionSheetModal');

function openActionSheet(chatId) {
  targetActionChatId = chatId;
  const chat = appData.chats.find(c => c.id === chatId);
  document.getElementById('modalChatTitle').textContent = chat ? chat.title : 'Options';
  actionModal.classList.remove('hidden');
}

function closeActionSheet() {
  actionModal.classList.add('hidden');
  targetActionChatId = null;
}

document.getElementById('btnChatMenu').addEventListener('click', () => {
  if (appData.activeChatId) openActionSheet(appData.activeChatId);
});

document.getElementById('chatHeaderTitle').addEventListener('click', () => {
  if (currentChatSubView === 'chat' && appData.activeChatId) {
    renameChat(appData.activeChatId);
  }
});

document.getElementById('modalBtnCancel').addEventListener('click', closeActionSheet);
actionModal.addEventListener('click', (e) => {
  if (e.target === actionModal) closeActionSheet();
});

document.getElementById('modalBtnRename').addEventListener('click', () => {
  const id = targetActionChatId;
  closeActionSheet();
  if (id) renameChat(id);
});

function renameChat(id) {
  const chat = appData.chats.find(c => c.id === id);
  if (!chat) return;
  const newTitle = prompt('Rename this reflection:', chat.title);
  if (newTitle && newTitle.trim()) {
    chat.title = newTitle.trim();
    saveData();
    renderHomeList();
    if (appData.activeChatId === id) {
      document.getElementById('activeChatTitle').textContent = chat.title;
    }
  }
}

document.getElementById('modalBtnDelete').addEventListener('click', () => {
  const id = targetActionChatId;
  closeActionSheet();
  if (!id) return;
  if (confirm('Are you sure you want to delete this reflection?')) {
    appData.chats = appData.chats.filter(c => c.id !== id);
    saveData();
    if (appData.activeChatId === id) {
      switchView('home');
    } else {
      renderHomeList();
    }
  }
});

document.getElementById('modalBtnExport').addEventListener('click', () => {
  const id = targetActionChatId;
  closeActionSheet();
  if (!id) return;
  const chat = appData.chats.find(c => c.id === id);
  if (!chat) return;

  const md = `# ${chat.title}\n*Exported on ${new Date().toLocaleDateString()}*\n\n` +
    chat.messages.map(m => `**[${m.side.toUpperCase()}]**: ${m.text}`).join('\n\n');

  navigator.clipboard.writeText(md).then(() => {
    alert('Copied reflection to clipboard!');
  }).catch(() => {
    prompt('Copy your reflection:', md);
  });
});

function escapeHTML(str) {
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}

// Register Service Worker dynamically based on current path
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    // Computes the exact base folder (e.g., /self-reflection-app/)
    const basePath = window.location.pathname.substring(0, window.location.pathname.lastIndexOf('/') + 1);
    const swPath = `${basePath}sw.js`;

    navigator.serviceWorker.register(swPath, { scope: basePath })
      .then(reg => console.log('SW registered successfully:', reg.scope))
      .catch(err => console.error('SW registration failed:', err));
  });
}
// Initialize
loadSettings();
loadData();
renderHomeList();