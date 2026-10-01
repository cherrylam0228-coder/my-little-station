/* ============================================
   我的小站 — 清新文藝風個人主頁
   ============================================ */

const STORE_KEY = 'my-little-station/v1';

const DEFAULT_DATA = {
  profile: {
    name: '林深時見鹿',
    bio: '做一個溫柔的人，記錄日常的小美好 ☁️',
    mood: '今天想喝杯桂花烏龍',
    location: '杭州 · 窗外有雨',
    avatar: 'L'
  },
  links: [
    { id: 1, label: '豆瓣', icon: '📖', url: 'douban.com' },
    { id: 2, label: '微信讀書', icon: '📚', url: 'weread.qq.com' },
    { id: 3, label: '即刻', icon: '✨', url: 'okjike.com' },
    { id: 4, label: '小宇宙', icon: '🎙', url: 'xiaoyuzhoufm.com' }
  ],
  todos: [
    { id: 1, text: '買一束鮮花放在床頭', done: false },
    { id: 2, text: '回一封很長的信', done: true },
    { id: 3, text: '把家裡的書重新整理一遍', done: false }
  ],
  contacts: [
    { id: 1, icon: '✉️', label: 'Email', value: '[email protected]' },
    { id: 2, icon: '💬', label: '微信', value: 'little_station_' }
  ],
  note: ''
};

const ICON_SET = [
  '📖','📚','✨','🎙','🎵','🎬','☕','🍵',
  '🌿','🌸','🐱','🐶','✏️','📷','🎨','💌',
  '🌙','☀️','⭐','🌊','🍃','🕊','🎈','🎁'
];

/* ============ 狀態管理 ============ */
function load() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    if (!raw) return JSON.parse(JSON.stringify(DEFAULT_DATA));
    return { ...JSON.parse(JSON.stringify(DEFAULT_DATA)), ...JSON.parse(raw) };
  } catch (e) {
    return JSON.parse(JSON.stringify(DEFAULT_DATA));
  }
}

function save() {
  localStorage.setItem(STORE_KEY, JSON.stringify(state));
}

let state = load();

/* ============ 頭像 / 名片 ============ */
function renderProfile() {
  const p = state.profile;
  document.getElementById('name').textContent = p.name;
  document.getElementById('bio').textContent = p.bio;
  document.getElementById('mood').textContent = p.mood;
  document.getElementById('location').textContent = p.location;
  document.getElementById('avatarText').textContent = p.avatar || (p.name || '·').slice(0, 1).toUpperCase();
}

function bindProfileEditable() {
  const fields = [
    ['name', 'name'],
    ['bio', 'bio'],
    ['mood', 'mood'],
    ['location', 'location']
  ];
  fields.forEach(([id, key]) => {
    const el = document.getElementById(id);
    el.addEventListener('blur', () => {
      state.profile[key] = el.textContent.trim() || DEFAULT_DATA.profile[key];
      save();
      renderProfile();
    });
    el.addEventListener('keydown', e => {
      if (e.key === 'Enter') { e.preventDefault(); el.blur(); }
    });
  });

  document.getElementById('avatar').addEventListener('click', () => {
    if (!document.body.classList.contains('editing')) return;
    openModal('更換頭像字符', `
      <label>輸入一個字符作為頭像</label>
      <input id="avatarInput" maxlength="2" value="${state.profile.avatar}" placeholder="例如：L / 林 / 🌸" />
    `, () => {
      const v = document.getElementById('avatarInput').value.trim();
      if (v) state.profile.avatar = v;
      save(); renderProfile();
    });
  });
}

/* ============ 快捷連結 ============ */
function renderLinks() {
  const grid = document.getElementById('linksGrid');
  grid.innerHTML = '';
  state.links.forEach(l => {
    const a = document.createElement('a');
    a.className = 'link-item';
    a.href = /^https?:/.test(l.url) ? l.url : 'https://' + l.url;
    a.target = '_blank';
    a.rel = 'noopener';
    a.innerHTML = `
      <div class="link-icon">${l.icon || '🔗'}</div>
      <div class="link-label">${escape(l.label)}</div>
      <button class="link-del" data-id="${l.id}">×</button>
    `;
    grid.appendChild(a);
  });
  grid.querySelectorAll('.link-del').forEach(btn => {
    btn.addEventListener('click', e => {
      e.preventDefault(); e.stopPropagation();
      const id = Number(btn.dataset.id);
      state.links = state.links.filter(l => l.id !== id);
      save(); renderLinks();
    });
  });
}

function openLinkDialog(link) {
  const isEdit = !!link;
  openModal(isEdit ? '編輯連結' : '新增連結', `
    <label>名稱</label>
    <input id="linkLabel" value="${isEdit ? escape(link.label) : ''}" placeholder="例如：豆瓣" maxlength="12" />
    <label>網址</label>
    <input id="linkUrl" value="${isEdit ? escape(link.url) : ''}" placeholder="例如：douban.com" />
    <label>圖標</label>
    <div class="icon-picker" id="iconPicker"></div>
  `, () => {
    const label = document.getElementById('linkLabel').value.trim();
    const url   = document.getElementById('linkUrl').value.trim();
    const icon  = document.getElementById('iconPicker').dataset.selected || '🔗';
    if (!label || !url) return alert('請填寫名稱和網址');
    if (isEdit) {
      Object.assign(link, { label, url, icon });
    } else {
      state.links.push({ id: Date.now(), label, url, icon });
    }
    save(); renderLinks();
  });

  const picker = document.getElementById('iconPicker');
  picker.dataset.selected = isEdit ? link.icon : '🔗';
  ICON_SET.forEach(ic => {
    const span = document.createElement('span');
    span.textContent = ic;
    if (ic === picker.dataset.selected) span.classList.add('selected');
    span.addEventListener('click', () => {
      picker.dataset.selected = ic;
      picker.querySelectorAll('span').forEach(s => s.classList.remove('selected'));
      span.classList.add('selected');
    });
    picker.appendChild(span);
  });
}

/* ============ 待辦 ============ */
function renderTodos() {
  const list = document.getElementById('todoList');
  list.innerHTML = '';
  if (!state.todos.length) {
    const li = document.createElement('li');
    li.className = 'todo-empty';
    li.textContent = '— 暫無心事，清風自來 —';
    list.appendChild(li);
    return;
  }
  state.todos.forEach(t => {
    const li = document.createElement('li');
    li.className = 'todo-item' + (t.done ? ' done' : '');
    li.innerHTML = `
      <div class="todo-check"></div>
      <div class="todo-text">${escape(t.text)}</div>
      <button class="todo-del" data-id="${t.id}">×</button>
    `;
    li.querySelector('.todo-check').addEventListener('click', () => {
      t.done = !t.done; save(); renderTodos();
    });
    li.querySelector('.todo-text').addEventListener('click', () => {
      if (document.body.classList.contains('editing')) {
        openTodoDialog(t);
      }
    });
    li.querySelector('.todo-del').addEventListener('click', e => {
      e.stopPropagation();
      state.todos = state.todos.filter(x => x.id !== t.id);
      save(); renderTodos();
    });
    list.appendChild(li);
  });
}

function openTodoDialog(todo) {
  const isEdit = !!todo;
  openModal(isEdit ? '編輯這條心願' : '新增心願', `
    <label>內容</label>
    <input id="todoText" value="${isEdit ? escape(todo.text) : ''}" placeholder="想做什麼？" maxlength="50" />
  `, () => {
    const text = document.getElementById('todoText').value.trim();
    if (!text) return alert('寫點什麼吧');
    if (isEdit) todo.text = text;
    else state.todos.push({ id: Date.now(), text, done: false });
    save(); renderTodos();
  });
}

/* ============ 聯絡方式 ============ */
function renderContacts() {
  const list = document.getElementById('contactList');
  list.innerHTML = '';
  state.contacts.forEach(c => {
    const div = document.createElement('div');
    div.className = 'contact-item';
    let href = '#';
    if (/^https?:/.test(c.value)) href = c.value;
    else if (c.value.includes('@')) href = 'mailto:' + c.value;
    div.innerHTML = `
      <div class="contact-icon">${c.icon || '✉️'}</div>
      <div class="contact-info">
        <div class="contact-label">${escape(c.label)}</div>
        <div class="contact-value">${escape(c.value)}</div>
      </div>
      <button class="contact-del" data-id="${c.id}">×</button>
    `;
    div.addEventListener('click', e => {
      if (e.target.classList.contains('contact-del')) return;
      if (document.body.classList.contains('editing')) {
        openContactDialog(c);
      } else if (href !== '#') {
        window.open(href, '_blank');
      }
    });
    div.querySelector('.contact-del').addEventListener('click', e => {
      e.stopPropagation();
      state.contacts = state.contacts.filter(x => x.id !== c.id);
      save(); renderContacts();
    });
    list.appendChild(div);
  });
}

function openContactDialog(c) {
  openModal('編輯聯絡方式', `
    <label>圖標</label>
    <div class="icon-picker" id="contactIconPicker"></div>
    <label>名稱</label>
    <input id="contactLabel" value="${escape(c.label)}" placeholder="例如：Email" maxlength="10" />
    <label>值</label>
    <input id="contactValue" value="${escape(c.value)}" placeholder="例如：[email protected]" />
  `, () => {
    const icon  = document.getElementById('contactIconPicker').dataset.selected || c.icon;
    const label = document.getElementById('contactLabel').value.trim();
    const value = document.getElementById('contactValue').value.trim();
    if (!label || !value) return alert('請填寫完整');
    Object.assign(c, { icon, label, value });
    save(); renderContacts();
  });

  const picker = document.getElementById('contactIconPicker');
  picker.dataset.selected = c.icon;
  ['✉️','💬','📱','🐦','📷','🎵','🌐','💼'].forEach(ic => {
    const span = document.createElement('span');
    span.textContent = ic;
    if (ic === picker.dataset.selected) span.classList.add('selected');
    span.addEventListener('click', () => {
      picker.dataset.selected = ic;
      picker.querySelectorAll('span').forEach(s => s.classList.remove('selected'));
      span.classList.add('selected');
    });
    picker.appendChild(span);
  });
}

/* ============ 心情筆記 ============ */
function bindNote() {
  const note = document.getElementById('note');
  const dateEl = document.getElementById('noteDate');
  const savedEl = document.getElementById('noteSaved');

  note.value = state.note || '';
  const updateDate = () => {
    const d = new Date();
    const w = ['日','一','二','三','四','五','六'][d.getDay()];
    dateEl.textContent = `${d.getMonth()+1} 月 ${d.getDate()} 日 · 週${w}`;
  };
  updateDate();

  let timer;
  note.addEventListener('input', () => {
    state.note = note.value;
    clearTimeout(timer);
    timer = setTimeout(() => {
      save();
      savedEl.textContent = '✓ 已保存';
      savedEl.classList.add('show');
      setTimeout(() => savedEl.classList.remove('show'), 1500);
    }, 400);
  });
}

/* ============ 彈窗 ============ */
let modalOkHandler = null;
function openModal(title, bodyHTML, onOk) {
  document.getElementById('modalTitle').textContent = title;
  document.getElementById('modalBody').innerHTML = bodyHTML;
  modalOkHandler = onOk;
  document.getElementById('modal').hidden = false;
}
function closeModal() {
  document.getElementById('modal').hidden = true;
  modalOkHandler = null;
}
document.getElementById('modalCancel').addEventListener('click', closeModal);
document.getElementById('modalOk').addEventListener('click', () => {
  if (modalOkHandler) modalOkHandler();
  closeModal();
});
document.getElementById('modal').addEventListener('click', e => {
  if (e.target.id === 'modal') closeModal();
});

/* ============ 編輯模式 ============ */
let editing = false;
function setEditing(on) {
  editing = on;
  document.body.classList.toggle('editing', on);
  document.getElementById('editBar').hidden = !on;
  const fab = document.getElementById('editFab');
  fab.classList.toggle('editing', on);
  // contenteditable 切換
  ['name','bio','mood','location'].forEach(id => {
    document.getElementById(id).setAttribute('contenteditable', on);
  });
  // 隱藏/顯示新增按鈕
  document.querySelectorAll('.add-btn').forEach(b => b.style.display = on ? 'none' : '');
}

document.getElementById('editFab').addEventListener('click', () => setEditing(!editing));
document.getElementById('exitEdit').addEventListener('click', () => setEditing(false));

document.getElementById('addLinkBtn').addEventListener('click', () => openLinkDialog(null));
document.getElementById('addTodoBtn').addEventListener('click', () => openTodoDialog(null));
document.getElementById('addContactBtn').addEventListener('click', () => {
  openContactDialog({ icon: '✉️', label: '', value: '' });
});

/* ============ PWA 安裝提示 ============ */
let deferredPrompt = null;
window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  deferredPrompt = e;
  // 延遲 3 秒再提示，避免打擾
  setTimeout(() => {
    if (!localStorage.getItem('install-dismissed')) {
      document.getElementById('installBanner').hidden = false;
    }
  }, 3000);
});

document.getElementById('installBtn').addEventListener('click', async () => {
  document.getElementById('installBanner').hidden = true;
  if (!deferredPrompt) return;
  deferredPrompt.prompt();
  const { outcome } = await deferredPrompt.userChoice;
  if (outcome === 'accepted') localStorage.setItem('install-dismissed', '1');
  deferredPrompt = null;
});
document.getElementById('installClose').addEventListener('click', () => {
  document.getElementById('installBanner').hidden = true;
  localStorage.setItem('install-dismissed', '1');
});

// iOS 提示
function isIos() {
  return /iphone|ipad|ipod/i.test(navigator.userAgent);
}
function isStandalone() {
  return window.navigator.standalone || window.matchMedia('(display-mode: standalone)').matches;
}
if (isIos() && !isStandalone()) {
  setTimeout(() => {
    document.getElementById('installHint').textContent =
      '（Safari 下方「分享」→ 加到主畫面）';
  }, 4000);
}

/* ============ Service Worker 註冊 ============ */
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('sw.js').catch(err => console.log('SW 註冊失敗：', err));
  });
}

/* ============ 工具 ============ */
function escape(s) {
  return String(s ?? '').replace(/[&<>"']/g, c => ({
    '&':'&','<':'<','>':'>','"':'"',"'":'&#39;'
  })[c]);
}

/* ============ 啟動 ============ */
renderProfile();
renderLinks();
renderTodos();
renderContacts();
bindProfileEditable();
bindNote();
