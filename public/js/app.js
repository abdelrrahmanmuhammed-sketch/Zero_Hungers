'use strict';
/* ================================================================
   ZERO HUNGER — Food Sharing Platform
   Client JavaScript connected to Node.js & SQLite Backend
   Features:
   - 5-Star Rating System for Charities, Restaurants, Hotels & Donors
   - Interactive KPI & Navigation triggers for all website stats
   ================================================================ */

const $ = s => document.querySelector(s);
const $$ = s => Array.from(document.querySelectorAll(s));
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const todayISO = () => new Date().toISOString().slice(0, 10);
const timeNow = () => new Date().toTimeString().slice(0, 5);
const fmtDate = iso => {
  if (!iso) return '—';
  const d = new Date(iso);
  return isNaN(d) ? esc(iso) : d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });
};
const fmtTimeAgo = t => {
  const s = Math.floor((Date.now() - t) / 1000);
  if (s < 60) return 'just now';
  if (s < 3600) return Math.floor(s / 60) + 'm ago';
  if (s < 86400) return Math.floor(s / 3600) + 'h ago';
  return Math.floor(s / 86400) + 'd ago';
};
const monthsShort = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const FOOD_TYPES = ['Meals/Entrees', 'Bakery', 'Fruits & Vegetables', 'Beverages', 'Others'];
const FT_COLORS = { 'Meals/Entrees': '#0e8a4f', 'Bakery': '#7c3aed', 'Fruits & Vegetables': '#ea7a1f', 'Beverages': '#2563eb', 'Others': '#94a3a0' };

/* ---------- icons ---------- */
const I = {
  logo: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 21s-7.5-4.6-9.5-9C1 8.5 3 5 6.5 5c2 0 3.5 1 4.5 2.5C12 6 13.5 5 15.5 5 19 5 21 8.5 20.5 12c-1 4.4-8.5 9-8.5 9z" fill="#0f7a3a"/><path d="M8 3.5C9.5 2 12 1.5 12 1.5S9 4.5 8 3.5zM16 3.5C14.5 2 12 1.5 12 1.5s3 3 4 2z" fill="#22c55e"/><path d="M9.5 10.5v3M8 12h3" stroke="#fff" stroke-width="1.4" stroke-linecap="round"/></svg>',
  dashboard: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>',
  hotel: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 21V8l7-5 7 5v13"/><path d="M17 21V11h4v10"/><path d="M8 11h.01M12 11h.01M8 15h.01M12 15h.01M8 19h.01M12 19h.01"/></svg>',
  restaurant: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M5 3v7a2 2 0 002 2v9M9 3v7M7 3v9"/><path d="M17 3c-2 0-3 2-3 5v4h3v9M17 3v18"/></svg>',
  charity: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.3-9-8.5C1.7 8 3.5 5 6.8 5c2 0 3.6 1 5.2 3 1.6-2 3.2-3 5.2-3 3.3 0 5.1 3 3.8 6.5-2 4.2-9 8.5-9 8.5z"/></svg>',
  donate: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12M12 8s-4 0-4-2.5S12 3 12 8zm0 0s4 0 4-2.5S12 3 12 8z"/></svg>',
  megaphone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 11l18-6v16L3 15v-4z"/><path d="M11.6 16.8a3 3 0 11-5.8-1.6"/></svg>',
  bell: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>',
  settings: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 11-2.83 2.83l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 11-4 0v-.09a1.65 1.65 0 00-1-1.51 1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 11-2.83-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 110-4h.09a1.65 1.65 0 001.51-1 1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 112.83-2.83l.06.06a1.65 1.65 0 001.82.33h.01a1.65 1.65 0 001-1.51V3a2 2 0 114 0v.09a1.65 1.65 0 001 1.51h.01a1.65 1.65 0 001.82-.33l.06-.06a2 2 0 112.83 2.83l-.06.06a1.65 1.65 0 00-.33 1.82v.01a1.65 1.65 0 001.51 1H21a2 2 0 110 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>',
  meal: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M4 3v7a2 2 0 002 2v9M8 3v9M6 3v9"/><path d="M17 3c-2 0-3 2-3 5v4h3v9M17 3v18"/></svg>',
  people: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"/></svg>',
  box: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 8l-9-5-9 5v8l9 5 9-5V8z"/><path d="M3.3 8.3L12 13l8.7-4.7M12 13v9"/></svg>',
  truck: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="4" width="14" height="12" rx="1"/><path d="M15 9h4l3 4v3h-7V9z"/><circle cx="6" cy="18.5" r="2"/><circle cx="18" cy="18.5" r="2"/></svg>',
  heart: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 20s-7-4.3-9-8.5C1.7 8 3.5 5 6.8 5c2 0 3.6 1 5.2 3 1.6-2 3.2-3 5.2-3 3.3 0 5.1 3 3.8 6.5-2 4.2-9 8.5-9 8.5z"/></svg>',
  gift: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="8" width="18" height="4" rx="1"/><path d="M5 12v8h14v-8M12 8v12M12 8s-4 0-4-2.5S12 3 12 8zm0 0s4 0 4-2.5S12 3 12 8z"/></svg>',
  calendar: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
  clock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><polyline points="12 7 12 12 15.5 14"/></svg>',
  pin: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0116 0z"/><circle cx="12" cy="10" r="3"/></svg>',
  phone: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.9v3a2 2 0 01-2.2 2 19.8 19.8 0 01-8.6-3.1 19.5 19.5 0 01-6-6A19.8 19.8 0 012.1 4.2 2 2 0 014.1 2h3a2 2 0 012 1.7c.13.96.36 1.9.7 2.8a2 2 0 01-.45 2.1L8.1 9.9a16 16 0 006 6l1.3-1.3a2 2 0 012.1-.45c.9.34 1.84.57 2.8.7a2 2 0 011.7 2.05z"/></svg>',
  mail: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 6l-10 7L2 6"/></svg>',
  user: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>',
  lock: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>',
  search: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7"/><line x1="21" y1="21" x2="16.5" y2="16.5"/></svg>',
  plus: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>',
  send: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg>',
  leaf: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z"/></svg>',
  doc: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>',
  check: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  eye: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>',
  globe: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a13.5 13.5 0 010 18 13.5 13.5 0 010-18z"/></svg>',
  save: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>',
  building: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01M16 6h.01M12 6h.01M8 10h.01M16 10h.01M12 10h.01M8 14h.01M16 14h.01M12 14h.01"/></svg>',
  home: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>',
  info: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><circle cx="12" cy="12" r="9"/><line x1="12" y1="11" x2="12" y2="16"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>'
};
const icon = (n, s = 20) => I[n] ? I[n].replace('<svg ', `<svg width="${s}" height="${s}" `) : '';

/* ---------- State & Database Storage ---------- */
const LS_DATA = 'zh_data_v5', LS_USER = 'zh_user_v5', LS_TOKEN = 'zh_token_v5';

const defaultData = () => ({
  donations: [], offers: [], restaurants: [], hotels: [], charities: [], partners: [],
  requests: [], beneficiaries: [], distLocations: [], ads: [],
  notifications: [], ratings: [], ratingMap: {}, theme: 'light'
});

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? Object.assign(fallback(), JSON.parse(raw)) : fallback();
  } catch (e) {
    return fallback();
  }
}

let DB = loadJSON(LS_DATA, defaultData);
let TOKEN = localStorage.getItem(LS_TOKEN) || '';
let USER = null;
try { USER = JSON.parse(localStorage.getItem(LS_USER) || 'null'); } catch (e) {}

const saveLocal = () => {
  try { localStorage.setItem(LS_DATA, JSON.stringify(DB)); } catch (e) {}
};

/* ---------- API Communication (Connects to Node.js Backend) ---------- */
async function api(path, { method = 'GET', body = null } = {}) {
  const m = (method || 'GET').toUpperCase();
  const headers = { 'Content-Type': 'application/json' };
  if (TOKEN) {
    headers['Authorization'] = 'Bearer ' + TOKEN;
  }

  const cleanPath = path.startsWith('/api') ? path : '/api' + (path.startsWith('/') ? path : '/' + path);

  try {
    const res = await fetch(cleanPath, {
      method: m,
      headers,
      body: (m !== 'GET' && m !== 'HEAD' && body) ? JSON.stringify(body) : undefined
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const errMsg = data.error || data.message || `Server error (${res.status})`;
      throw new Error(errMsg);
    }

    if (data.token) {
      TOKEN = data.token;
      try { localStorage.setItem(LS_TOKEN, TOKEN); } catch (e) {}
    }
    if (data.user) {
      USER = data.user;
      try { localStorage.setItem(LS_USER, JSON.stringify(USER)); } catch (e) {}
    }
    if (data.data) {
      DB = data.data;
      saveLocal();
    }

    return data;
  } catch (err) {
    if (err.message && !err.message.includes('Failed to fetch') && !err.message.includes('NetworkError') && !err.message.includes('Load failed')) {
      throw err;
    }

    console.warn('Backend server offline. Running local client mode:', err.message);
    return localFallbackApi(path, m, body);
  }
}

// Graceful local fallback if offline
function localFallbackApi(path, m, b = {}) {
  const normPath = path.replace(/^\/api/, '');
  if (normPath === '/login' && m === 'POST') {
    if (!USER) {
      USER = { id: 'offline-user', name: b.email || 'Demo User', email: b.email || 'user@example.com', type: b.type || 'donor', isAdmin: false, avatar: '', joined: Date.now() };
    }
    TOKEN = 'offline-token-' + Date.now();
    try { localStorage.setItem(LS_TOKEN, TOKEN); localStorage.setItem(LS_USER, JSON.stringify(USER)); } catch (e) {}
    return { ok: true, token: TOKEN, user: USER, data: DB };
  }
  if (normPath === '/register' && m === 'POST') {
    USER = { id: uid(), name: b.name, email: b.email, phone: b.phone, location: b.location, area: b.area, type: b.type || 'donor', isAdmin: false, avatar: '', joined: Date.now() };
    TOKEN = 'offline-token-' + Date.now();
    try { localStorage.setItem(LS_TOKEN, TOKEN); localStorage.setItem(LS_USER, JSON.stringify(USER)); } catch (e) {}
    return { ok: true, token: TOKEN, user: USER, data: DB };
  }
  if (normPath === '/logout' && m === 'POST') {
    TOKEN = '';
    USER = null;
    try { localStorage.removeItem(LS_TOKEN); localStorage.removeItem(LS_USER); } catch (e) {}
    return { ok: true };
  }
  if (normPath === '/ratings' && m === 'POST') {
    const rId = b.targetId || b.targetName;
    const starNum = Math.max(1, Math.min(5, parseInt(b.stars) || 5));
    DB.ratings = DB.ratings || [];
    DB.ratings.unshift({
      id: uid(), targetType: b.targetType || 'partner', targetId: rId, targetName: b.targetName || rId,
      userName: b.userName || 'Charity', stars: starNum, comment: b.comment || '', createdAt: Date.now()
    });
    DB.ratingMap = DB.ratingMap || {};
    const k = rId.toLowerCase();
    if (!DB.ratingMap[k]) DB.ratingMap[k] = { sum: starNum, count: 1, avg: starNum };
    else { DB.ratingMap[k].sum += starNum; DB.ratingMap[k].count++; DB.ratingMap[k].avg = Number((DB.ratingMap[k].sum / DB.ratingMap[k].count).toFixed(1)); }
    saveLocal();
    return { ok: true, data: DB };
  }
  return { ok: true, data: DB, user: USER };
}

/* ---------- 5-Star Rating System Helpers ---------- */
function getRatingData(nameOrId, targetType = '') {
  const map = DB.ratingMap || {};
  const clean = String(nameOrId || '').trim();
  const keys = [
    clean,
    clean.toLowerCase(),
    targetType ? (targetType + ':' + clean).toLowerCase() : '',
    targetType ? (targetType + ':' + clean) : ''
  ].filter(Boolean);

  for (const k of keys) {
    if (map[k]) return map[k];
  }
  return { avg: 5.0, count: 1 };
}

function renderStarsHTML(nameOrId, targetType = '', { showButton = true, compact = false } = {}) {
  const r = getRatingData(nameOrId, targetType);
  const avg = Number(r.avg || 5.0);
  const count = r.count || 1;
  const rounded = Math.round(avg);
  const starsStr = '★'.repeat(rounded) + '☆'.repeat(5 - rounded);

  return `<div class="star-rating-badge" title="${avg.toFixed(1)} / 5.0 (${count} reviews)">
    <span class="stars-gold">${starsStr}</span>
    <b>${avg.toFixed(1)}</b>
    <span style="color:var(--muted);font-size:11px">(${count})</span>
    ${showButton ? `<button class="btn btn-outline btn-sm rate-trigger" style="padding:2px 7px;font-size:11px;border-radius:10px;margin-left:3px" data-rate-type="${esc(targetType || 'partner')}" data-rate-id="${esc(nameOrId)}" data-rate-name="${esc(nameOrId)}" title="Rate ${esc(nameOrId)} 5 stars">⭐ Rate</button>` : ''}
  </div>`;
}

let selectedStars = 5;
const ratingLabels = {
  1: '1 Star — Poor / سيء',
  2: '2 Stars — Fair / مقبول',
  3: '3 Stars — Good / جيد',
  4: '4 Stars — Very Good / ممتاز تقريباً',
  5: '5 Stars — Excellent / ممتاز'
};

function openRateModal({ targetType = 'partner', targetId = '', targetName = '' }) {
  selectedStars = 5;
  const isCharity = USER && USER.type === 'charity';
  const defaultRater = (USER && USER.name) ? USER.name : 'Verified Charity Organisation';

  const bodyHTML = `
    <form id="ratingForm" novalidate>
      <div style="text-align:center;margin-bottom:12px">
        <p style="font-size:13px;color:var(--muted)">Rate the meals, freshness, packaging and cooperation of</p>
        <h4 style="font-size:20px;margin-top:4px;color:var(--green-700)">${esc(targetName || targetId)}</h4>
        <span class="badge b-active" style="margin-top:6px">${esc(targetType.toUpperCase())}</span>
      </div>

      <div class="star-interactive" id="interactiveStarPicker">
        <span data-star="1" class="active">★</span>
        <span data-star="2" class="active">★</span>
        <span data-star="3" class="active">★</span>
        <span data-star="4" class="active">★</span>
        <span data-star="5" class="active">★</span>
      </div>
      <div class="rating-score-label" id="starScoreLabel">${ratingLabels[5]}</div>

      <div class="form-grid" style="grid-template-columns:1fr">
        <div class="field has-icon">
          <label>Reviewer / Charity Organisation Name</label>
          <span class="ficon">${icon('charity', 16)}</span>
          <input name="userName" value="${esc(defaultRater)}" required placeholder="e.g. Goodwill Food Bank, Hope Kitchen"/>
        </div>
        <div class="field">
          <label>Meal Quality Evaluation</label>
          <div style="display:flex;gap:8px;flex-wrap:wrap">
            <span class="badge b-active">${icon('check', 12)} Freshly Packed</span>
            <span class="badge b-active">${icon('check', 12)} Clean & Sealed</span>
            <span class="badge b-active">${icon('check', 12)} Generous Portions</span>
          </div>
        </div>
        <div class="field full">
          <label>Review Comment (Optional)</label>
          <textarea name="comment" placeholder="Describe the food quality, taste, temperature, or add notes for other charities..."></textarea>
        </div>
      </div>
    </form>
  `;

  openModal(`Rate ${esc(targetName || targetId)} (5 Stars)`, bodyHTML, {
    submitLabel: 'Submit 5-Star Rating',
    onSubmit: async () => {
      const comment = ($('#ratingForm [name=comment]') || {}).value || '';
      const userName = ($('#ratingForm [name=userName]') || {}).value || defaultRater;

      await api('/ratings', {
        method: 'POST',
        body: {
          targetType,
          targetId: targetId || targetName,
          targetName: targetName || targetId,
          stars: selectedStars,
          userName,
          comment
        }
      });

      toast(`Thank you! Your ${selectedStars}-star rating for ${targetName || targetId} has been stored.`);
      closeModal();
      renderApp();
    }
  });

  const starsSpans = $$('#interactiveStarPicker span');
  const updateStarsUI = (num) => {
    starsSpans.forEach(s => {
      const val = parseInt(s.dataset.star);
      s.classList.toggle('active', val <= num);
    });
    const lbl = $('#starScoreLabel');
    if (lbl) lbl.textContent = ratingLabels[num] || `${num} Stars`;
  };

  starsSpans.forEach(s => {
    s.onmouseenter = () => updateStarsUI(parseInt(s.dataset.star));
    s.onmouseleave = () => updateStarsUI(selectedStars);
    s.onclick = () => {
      selectedStars = parseInt(s.dataset.star);
      updateStarsUI(selectedStars);
    };
  });
}

/* ---------- Egypt governorates ---------- */
const EGYPT_GOVERNORATES = [
  'Cairo', 'Alexandria', 'Giza', 'Kafr El-Sheikh', 'Gharbia', 'Dakahlia', 'Sharqia',
  'Qalyubia', 'Beheira', 'Damietta', 'Port Said', 'Suez', 'Monufia', 'Ismailia',
  'Minya', 'Assiut', 'Luxor', 'Aswan', 'Fayoum', 'Sohag', 'Beni Suef', 'Qena',
  'Red Sea', 'New Valley', 'Matrouh', 'North Sinai', 'South Sinai'
];

const govSelect = (label = 'Governorate', name = 'governorate', required = true) =>
  `<div class="field has-icon"><label>${label}</label><span class="ficon">${icon('pin', 16)}</span><select name="${name}" ${required ? 'required' : ''}><option value="" disabled selected>Select governorate</option>${EGYPT_GOVERNORATES.map(g => `<option>${g}</option>`).join('')}</select></div>`;

const normGov = v => (v || '').toString().trim().toLowerCase().replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه');

function phoneHref(p) {
  const n = String(p || '').replace(/[^\d+]/g, '');
  return n ? 'tel:' + n : '#';
}
function waHref(p) {
  const n = String(p || '').replace(/[^\d]/g, '');
  return n ? 'https://wa.me/' + n : '';
}
function contactButtons(phone) {
  if (!phone) return '—';
  const wa = waHref(phone);
  return `<span style="display:inline-flex;gap:6px;flex-wrap:wrap">
    <a href="${phoneHref(phone)}" class="badge b-info">${icon('phone', 12)} ${esc(phone)}</a>
    ${wa ? `<a href="${wa}" target="_blank" rel="noopener" class="badge b-active">WhatsApp</a>` : ''}
  </span>`;
}
function statusBadge(st) {
  const s = st || 'Pending';
  const cls = s === 'Received' || s === 'Distributed' ? 'b-active' : s === 'Reserved' ? 'b-info' : s === 'Pending' ? 'b-pending' : 'b-rose';
  return `<span class="badge ${cls}">${esc(s)}</span>`;
}
function isAdmin() {
  return !!(USER && (USER.isAdmin || USER.type === 'admin'));
}
function canSee(pageId) {
  if (!USER) return false;
  if (isAdmin()) return true;
  const t = USER.type;
  const map = {
    dashboard: true, notifications: true, settings: true,
    hotels: t === 'hotel' || t === 'charity' || t === 'donor',
    restaurants: t === 'restaurant' || t === 'charity' || t === 'donor',
    charities: t === 'charity' || t === 'donor' || t === 'restaurant' || t === 'hotel',
    donate: t === 'donor' || t === 'restaurant' || t === 'hotel',
    promotions: true,
    ads: t === 'restaurant' || t === 'hotel' || t === 'donor',
    admin: false
  };
  return map[pageId] !== false;
}

function partnerFor(name, type) {
  return (DB.partners || []).find(x => x.name.toLowerCase() === String(name || '').toLowerCase() && (!type || x.type === type));
}

function donationRankings() {
  const map = {};
  (DB.donations || []).forEach(d => {
    if (!d.donorName) return;
    const type = d.source === 'hotel' ? 'Hotel' : d.source === 'restaurant' ? 'Restaurant' : 'Donor';
    const key = type + '|' + d.donorName;
    if (!map[key]) map[key] = { name: d.donorName, type, donations: 0, meals: 0, phone: d.phone || '', location: d.location || '' };
    map[key].donations++;
    map[key].meals += parseInt(d.quantity) || 0;
    if (d.phone) map[key].phone = d.phone;
    if (d.location) map[key].location = d.location;
  });
  (DB.partners || []).forEach(p => {
    const key = p.type + '|' + p.name;
    if (!map[key]) map[key] = { name: p.name, type: p.type, donations: p.donations || 0, meals: p.meals || 0, phone: p.phone || '', location: p.location || '' };
  });
  return Object.values(map).sort((a, b) => b.donations - a.donations || b.meals - a.meals);
}

function offerRankings() {
  const rows = [];
  (DB.offers || []).forEach(o => {
    const type = o.businessType === 'Hotel' ? 'Hotel' : 'Restaurant';
    const name = o.restaurantName || o.hotelName || '';
    rows.push({
      id: o.id,
      name, type, discount: parseInt(o.discount) || 0, title: o.title,
      location: o.location, phone: o.phone || (partnerFor(name, type) || {}).phone || '',
      audience: o.audience || '', validUntil: o.validUntil || ''
    });
  });
  (DB.ads || []).filter(a => a.status !== 'expired' && (parseInt(a.discount) || 0) > 0).forEach(a => {
    const type = a.businessType === 'Hotel' ? 'Hotel' : (a.businessType === 'Restaurant' ? 'Restaurant' : a.businessType || 'Business');
    rows.push({
      id: a.id,
      name: a.business, type, discount: parseInt(a.discount) || 0, title: a.title,
      location: a.governorate || a.location, phone: a.phone || (partnerFor(a.business, type) || {}).phone || '',
      audience: a.adType || 'Advertisement', validUntil: a.endDate || ''
    });
  });
  return rows.sort((a, b) => b.discount - a.discount || String(a.name).localeCompare(String(b.name)));
}

function nearbyPartners(location) {
  const g = normGov(location);
  const out = [];
  const seen = new Set();
  const add = (name, type, phone, loc) => {
    if (!name || !type || normGov(loc) !== g) return;
    const k = type + '|' + name.toLowerCase();
    if (seen.has(k)) {
      const prev = out.find(x => x.type === type && x.name.toLowerCase() === name.toLowerCase());
      if (prev && phone && !prev.phone) prev.phone = phone;
      return;
    }
    seen.add(k);
    out.push({ name, type, phone: phone || '', location: loc || '' });
  };
  (DB.partners || []).forEach(p => { if (p.type === 'Restaurant' || p.type === 'Hotel') add(p.name, p.type, p.phone, p.location); });
  (DB.donations || []).forEach(d => {
    const type = d.source === 'hotel' ? 'Hotel' : d.source === 'restaurant' ? 'Restaurant' : '';
    if (type) add(d.donorName, type, d.phone, d.location);
  });
  (DB.offers || []).forEach(o => {
    const type = o.businessType === 'Hotel' ? 'Hotel' : 'Restaurant';
    add(o.hotelName || o.restaurantName, type, o.phone, o.location);
  });
  return out;
}

/* ---------- derived stats ---------- */
const stats = () => {
  const totalMeals = (DB.donations || []).reduce((a, d) => a + (parseInt(d.quantity) || 0), 0);
  return {
    totalMeals,
    peopleHelped: totalMeals,
    activeRestaurants: (DB.restaurants || []).length,
    activeHotels: (DB.hotels || []).length,
    charities: (DB.charities || []).length,
    totalDonations: (DB.donations || []).length,
    activeOffers: (DB.offers || []).filter(o => !o.validUntil || o.validUntil >= todayISO()).length,
    totalAdViews: (DB.ads || []).reduce((a, x) => a + (parseInt(x.views) || 0), 0),
    totalAdClicks: (DB.ads || []).reduce((a, x) => a + (parseInt(x.clicks) || 0), 0),
    mealsDistributed: (DB.donations || []).filter(d => d.status === 'Received').reduce((a, d) => a + (parseInt(d.quantity) || 0), 0),
    receivedCount: (DB.donations || []).filter(d => d.status === 'Received').length,
    pendingCount: (DB.donations || []).filter(d => d.status === 'Pending').length,
    peopleSupported: (DB.beneficiaries || []).reduce((a, b) => a + (parseInt(b.count) || 0), 0),
    unread: (DB.notifications || []).filter(n => !n.read).length
  };
};

/* ---------- toast & notifications ---------- */
function toast(msg, type = 'ok') {
  const wrap = $('#toastWrap');
  if (!wrap) return;
  const t = document.createElement('div');
  t.className = 'toast' + (type === 'err' ? ' err' : '');
  t.innerHTML = `<span style="color:${type === 'err' ? '#e11d48' : 'var(--green-500)'}">${icon(type === 'err' ? 'info' : 'check', 18)}</span><span>${esc(msg)}</span>`;
  wrap.appendChild(t);
  setTimeout(() => {
    t.style.opacity = '0';
    t.style.transition = '.4s';
    setTimeout(() => t.remove(), 400);
  }, 3400);
}

function updateBell() {
  const n = stats().unread;
  const dot = $('#bellDot');
  if (!dot) return;
  dot.style.display = n > 0 ? 'flex' : 'none';
  dot.textContent = n > 9 ? '9+' : n;
}

/* ---------- modal ---------- */
let modalSubmit = null;
function openModal(title, bodyHTML, { submitLabel = 'Submit', onSubmit = null, wide = false } = {}) {
  $('#modalTitle').textContent = title;
  $('#modalBody').innerHTML = bodyHTML;
  const foot = $('#modalFoot');
  foot.innerHTML = onSubmit
    ? `<button class="btn btn-ghost" type="button" id="modalCancel">Cancel</button>
       <button class="btn btn-primary" type="button" id="modalOk">${esc(submitLabel)} ${icon('send', 15)}</button>`
    : `<button class="btn btn-outline" type="button" id="modalCancel">Close</button>`;
  $('.modal').style.maxWidth = wide ? '860px' : '760px';
  modalSubmit = onSubmit;
  $('#modalOverlay').classList.add('open');
  const cancel = $('#modalCancel');
  if (cancel) cancel.onclick = closeModal;
  const ok = $('#modalOk');
  if (ok && onSubmit) ok.onclick = async () => {
    const form = $('#modalBody form');
    if (form && !form.reportValidity()) return;
    const data = {};
    $$('#modalBody [name]').forEach(el => {
      if (el.type === 'file') return;
      data[el.name] = el.type === 'checkbox' ? el.checked : el.value.trim();
    });
    ok.disabled = true;
    try { await onSubmit(data); } catch (err) { toast(err.message, 'err'); } finally { ok.disabled = false; }
  };
}
function closeModal() {
  $('#modalOverlay').classList.remove('open');
  modalSubmit = null;
}
$('#modalX').addEventListener('click', closeModal);
$('#modalOverlay').addEventListener('click', e => { if (e.target.id === 'modalOverlay') closeModal(); });

/* ---------- field helpers ---------- */
const fld = (label, name, type = 'text', ph = '', extra = '') =>
  `<div class="field"><label>${label}</label><input name="${name}" type="${type}" placeholder="${ph}" ${extra}/></div>`;
const fldIcon = (label, name, ic, type = 'text', ph = '', extra = '') =>
  `<div class="field has-icon"><label>${label}</label><span class="ficon">${icon(ic, 16)}</span><input name="${name}" type="${type}" placeholder="${ph}" ${extra}/></div>`;
const selFld = (label, name, options, ph = 'Select...', extra = '') =>
  `<div class="field"><label>${label}</label><select name="${name}" ${extra}><option value="" disabled selected>${ph}</option>${options.map(o => `<option>${esc(o)}</option>`).join('')}</select></div>`;
const emptyState = (ic, title, msg) =>
  `<div class="empty"><div class="eic">${icon(ic, 34)}</div><h4>${title}</h4><p>${msg}</p></div>`;

/* ================= AUTH LOGIC ================= */
const ACCOUNT_TYPES = [
  { id: 'restaurant', label: 'Restaurant', icon: 'restaurant' },
  { id: 'hotel', label: 'Hotel', icon: 'hotel' },
  { id: 'charity', label: 'Charity Organisation', icon: 'charity' },
  { id: 'donor', label: 'Donor', icon: 'heart' }
];
let authMode = 'login', authType = 'donor';
$('#authLogo').innerHTML = icon('logo', 30);
$('#sbLogo').innerHTML = icon('logo', 27);

function renderTypeGrid() {
  $('#typeGrid').innerHTML = ACCOUNT_TYPES.map(t =>
    `<div class="type-card ${t.id === authType ? 'active' : ''}" data-type="${t.id}">${icon(t.icon, 26)}<p>${t.label}</p></div>`).join('');
  $$('#typeGrid .type-card').forEach(c => c.onclick = () => { authType = c.dataset.type; renderTypeGrid(); renderAuthFields(); });
}

function renderAuthFields() {
  const t = ACCOUNT_TYPES.find(x => x.id === authType) || ACCOUNT_TYPES[0];
  const nameLabel = authType === 'charity' ? 'Organisation Name' : 'Full Name';
  const namePh = authType === 'charity' ? 'Enter organisation name' : 'Enter your full name';
  let h = '';
  if (authMode === 'register') {
    h += fldIcon(nameLabel, 'name', 'user', 'text', namePh, 'required');
    h += `<div class="two-col" style="gap:12px">
      <div class="field has-icon"><label>Phone Number</label><span class="ficon">${icon('phone', 16)}</span><input name="phone" type="tel" placeholder="+20 10 12345678" required/></div>
      <div class="field has-icon"><label>Email Address</label><span class="ficon">${icon('mail', 16)}</span><input name="email" type="email" placeholder="you@example.com" required/></div></div>`;
    h += govSelect('Governorate', 'location', true);
    h += fldIcon('Area / City', 'area', 'pin', 'text', 'e.g. Nasr City, Tanta', '');
    h += `<div class="two-col" style="gap:12px">
      <div class="field has-icon"><label>Password</label><span class="ficon">${icon('lock', 16)}</span><input name="password" type="password" placeholder="Enter your password (6+ chars)" required minlength="6"/></div>
      <div class="field has-icon"><label>Confirm Password</label><span class="ficon">${icon('lock', 16)}</span><input name="confirm" type="password" placeholder="Repeat your password" required/></div></div>`;
  } else {
    h += fldIcon('Email or Name', 'email', 'mail', 'text', 'admin@zerohunger.local', 'required');
    h += fldIcon('Password', 'password', 'lock', 'password', 'Enter your password', 'required');
  }
  $('#authFields').innerHTML = h;
  $('#authSubmitText').textContent = authMode === 'login' ? 'Login' : 'Create Account';
  $('#authTitle').textContent = authMode === 'login' ? `Welcome back, ${t.label}` : `Register as ${t.label}`;
  $('#authSub').textContent = authMode === 'login'
    ? 'Sign in to manage donations, track impact and help end hunger.'
    : 'Fill in your details to join the Zero Hunger platform.';
  $('#authFoot').innerHTML = authMode === 'login'
    ? `Don't have an account? <a id="switchReg">Register here</a>`
    : `Already have an account? <a id="switchLog">Login here</a>`;
  const sr = $('#switchReg'); if (sr) sr.onclick = () => setAuthMode('register');
  const sl = $('#switchLog'); if (sl) sl.onclick = () => setAuthMode('login');
}

function setAuthMode(m) {
  authMode = m;
  $('#tabLogin').classList.toggle('active', m === 'login');
  $('#tabRegister').classList.toggle('active', m === 'register');
  renderAuthFields();
}
$('#tabLogin').onclick = () => setAuthMode('login');
$('#tabRegister').onclick = () => setAuthMode('register');

$('#authForm').addEventListener('submit', async e => {
  e.preventDefault();
  const fd = new FormData(e.target);
  const get = k => (fd.get(k) || '').toString().trim();
  const btn = $('#authSubmit');
  btn.disabled = true;

  try {
    if (authMode === 'register') {
      if (get('password') !== get('confirm')) {
        toast('Passwords do not match.', 'err');
        btn.disabled = false;
        return;
      }
      await api('/register', {
        method: 'POST',
        body: {
          name: get('name'),
          phone: get('phone'),
          email: get('email'),
          location: get('location'),
          area: get('area'),
          password: get('password'),
          type: authType
        }
      });
    } else {
      await api('/login', {
        method: 'POST',
        body: {
          email: get('email'),
          password: get('password'),
          type: authType
        }
      });
    }

    toast(`Welcome, ${USER.name}!`);
    enterApp();
  } catch (err) {
    toast(err.message || 'Authentication failed.', 'err');
  } finally {
    btn.disabled = false;
  }
});

async function logout() {
  try {
    await api('/logout', { method: 'POST' });
  } catch (e) {}
  try {
    localStorage.removeItem(LS_USER);
    localStorage.removeItem(LS_TOKEN);
  } catch (e) {}
  USER = null;
  TOKEN = '';
  $('#appView').classList.remove('on');
  $('#authView').style.display = 'grid';
  location.hash = '';
  renderTypeGrid();
  renderAuthFields();
}

/* ================= APP SHELL ================= */
const MENU = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard', sec: 'MAIN MENU' },
  { id: 'hotels', label: 'Hotels', icon: 'hotel' },
  { id: 'restaurants', label: 'Restaurants', icon: 'restaurant' },
  { id: 'charities', label: 'Charity Organisation', icon: 'charity' },
  { id: 'donate', label: 'Donate', icon: 'donate' },
  { id: 'promotions', label: 'Ads & Offers', icon: 'megaphone' },
  { id: 'ads', label: 'AD Here', icon: 'megaphone' },
  { id: 'admin', label: 'Admin Ads', icon: 'settings', admin: true },
  { id: 'notifications', label: 'Notifications', icon: 'bell', sec: 'OTHER', badge: true },
  { id: 'settings', label: 'Settings', icon: 'settings' }
];

function visibleMenu() {
  return MENU.filter(m => {
    if (m.admin) return isAdmin();
    return canSee(m.id);
  });
}

function renderSidebar(active) {
  let h = '', lastSec = null;
  visibleMenu().forEach(m => {
    if (m.sec && m.sec !== lastSec) { h += `<div class="sb-label">${m.sec}</div>`; lastSec = m.sec; }
    const badge = m.badge && stats().unread > 0 ? `<span class="sb-badge">${stats().unread}</span>` : '';
    h += `<button class="sb-item ${m.id === active ? 'active' : ''}" data-nav="${m.id}">${icon(m.icon, 20)}<span>${m.label}</span>${badge}</button>`;
  });
  $('#sbMenu').innerHTML = h;
  $$('#sbMenu [data-nav]').forEach(b => b.onclick = () => navigate(b.dataset.nav));
}

function navigate(r) { location.hash = '#/' + r; }
function currentRoute() {
  const h = (location.hash || '').replace(/^#\//, '');
  const allowed = visibleMenu().map(m => m.id);
  if (allowed.includes(h)) return h;
  return 'dashboard';
}

function applyTheme() {
  document.documentElement.dataset.theme = DB.theme || 'light';
  $('#themeIconMoon').style.display = DB.theme === 'light' ? 'block' : 'none';
  $('#themeIconSun').style.display = DB.theme === 'dark' ? 'block' : 'none';
  const sw = $('#prefDark'); if (sw) sw.checked = DB.theme === 'dark';
}

$('#btnTheme').onclick = () => {
  DB.theme = DB.theme === 'light' ? 'dark' : 'light';
  saveLocal();
  applyTheme();
  api('/theme', { method: 'POST', body: { theme: DB.theme } }).catch(() => {});
};
$('#btnBell').onclick = () => navigate('notifications');
$('#btnHamburger').onclick = () => { $('#sidebar').classList.toggle('open'); $('#sbOverlay').classList.toggle('on'); };
$('#sbOverlay').onclick = () => { $('#sidebar').classList.remove('open'); $('#sbOverlay').classList.remove('on'); };
$('#profileChip').onclick = e => { e.stopPropagation(); $('#profileDropdown').classList.toggle('open'); };
document.addEventListener('click', () => $('#profileDropdown').classList.remove('open'));
$('#ddProfile').onclick = e => { e.stopPropagation(); $('#profileDropdown').classList.remove('open'); navigate('settings'); };
$('#ddLogout').onclick = e => { e.stopPropagation(); $('#profileDropdown').classList.remove('open'); logout(); };

async function enterApp() {
  $('#authView').style.display = 'none';
  $('#appView').classList.add('on');

  if (TOKEN) {
    try {
      const res = await api('/bootstrap');
      if (res.user) USER = res.user;
      if (res.data) DB = res.data;
    } catch (e) {}
  }

  const t = ACCOUNT_TYPES.find(x => x.id === USER.type) || (USER.type === 'admin' ? { label: 'Admin' } : ACCOUNT_TYPES[3]);
  $('#tbName').textContent = USER.name;
  $('#tbType').textContent = t.label || USER.type;
  $('#tbAvatar').textContent = (USER.name || 'U').trim().charAt(0).toUpperCase();
  applyTheme();
  updateBell();
  restoreAvatar();
  if (!location.hash) location.hash = '#/dashboard';
  renderApp();
  applyLanguage();
}

function renderApp(opts = {}) {
  if (!USER) return;
  const r = currentRoute();
  renderSidebar(r);
  const gs = $('#globalSearch');
  if (gs && !opts.keepSearchFocus) {
    gs.value = searchTerm;
  }
  const activeInputId = opts.activeInputId || (document.activeElement && document.activeElement.id);
  const activeInputPos = (document.activeElement && typeof document.activeElement.selectionStart === 'number') ? document.activeElement.selectionStart : null;
  const scrollY = window.scrollY;

  const R = {
    dashboard: pageDashboard,
    hotels: pageHotels,
    restaurants: pageRestaurants,
    charities: pageCharities,
    donate: () => pageDonorList('donor'),
    promotions: pagePromotions,
    ads: pageAds,
    admin: pageAdminAds,
    notifications: pageNotifications,
    settings: pageSettings
  };

  (R[r] || pageDashboard)();
  $('#sidebar').classList.remove('open');
  $('#sbOverlay').classList.remove('on');

  if (opts.preserveScroll) {
    window.scrollTo({ top: scrollY });
  } else if (!opts.keepSearchFocus) {
    window.scrollTo({ top: 0 });
  }

  if (activeInputId) {
    const el = $('#' + activeInputId);
    if (el) {
      el.focus();
      if (activeInputPos !== null) {
        el.setSelectionRange(activeInputPos, activeInputPos);
      }
    }
  }
  applyLanguage();
}

window.addEventListener('hashchange', () => {
  searchTerm = '';
  const gs = $('#globalSearch');
  if (gs) gs.value = '';
  if (USER) renderApp();
});

/* ---------- unified search ---------- */
let searchTerm = '';
function handleSearchInput(e) {
  searchTerm = (e.target.value || '').toLowerCase().trim();
  const val = e.target.value;
  $$('input[id$="Search"]').forEach(inp => {
    if (inp !== e.target) inp.value = val;
  });
  const gs = $('#globalSearch');
  if (gs && gs !== e.target) gs.value = val;
  renderApp({ keepSearchFocus: true, preserveScroll: true, activeInputId: e.target.id });
}
$('#globalSearch').addEventListener('input', handleSearchInput);

const matches = d => {
  if (!searchTerm) return true;
  const s = searchTerm.toLowerCase().trim();
  return [
    d.donorName, d.foodType, d.location, d.area, d.notes,
    d.source, d.phone, d.status, d.date
  ].filter(Boolean).join(' ').toLowerCase().includes(s);
};

/* ---------- shared: donation submission ---------- */
async function addDonation(d) {
  try {
    await api('/donations', {
      method: 'POST',
      body: {
        donorName: d.donorName,
        source: d.source,
        foodType: d.foodType,
        quantity: parseInt(d.quantity) || 0,
        date: d.date || todayISO(),
        expiry: d.expiry || '',
        location: d.location,
        area: d.area || '',
        phone: d.phone || '',
        notes: d.notes || '',
        image: d.image || ''
      }
    });
    toast('Donation submitted and permanently saved.');
  } catch (err) {
    toast(err.message || 'Could not submit donation.', 'err');
  }
}

function donationFormHTML(source) {
  const isRest = source === 'restaurant', isHotel = source === 'hotel';
  const nameLabel = isRest ? 'Restaurant Name' : isHotel ? 'Hotel Name' : 'Donor Name';
  const namePh = isRest ? 'Enter restaurant name' : isHotel ? 'Enter hotel name' : 'Enter your name';
  const preName = USER && ((isRest && USER.type === 'restaurant') || (isHotel && USER.type === 'hotel') || (!isRest && !isHotel)) ? esc(USER.name) : '';
  return `<form novalidate>
    <div class="form-grid">
      ${fldIcon(nameLabel, 'donorName', isHotel ? 'hotel' : isRest ? 'restaurant' : 'heart', 'text', namePh, `required value="${preName}"`)}
      ${selFld('Food Type', 'foodType', FOOD_TYPES, 'Select food type', 'required')}
      ${fldIcon('Quantity of Meals', 'quantity', 'meal', 'number', 'Enter quantity', 'required min="1"')}
      ${fldIcon('Donation Date', 'date', 'calendar', 'date', '', `required value="${todayISO()}"`)}
      ${fldIcon('Expiry Time', 'expiry', 'clock', 'time', '', 'required')}
      ${govSelect('Governorate', 'location', true)}
      ${fldIcon('Area / City', 'area', 'pin', 'text', 'Neighbourhood or street', '')}
      ${fldIcon('Phone Number', 'phone', 'phone', 'tel', '+20 10 12345678', 'required')}
      <div class="field span2 full" style="grid-column:1/-1">
        <label>Photo of the food (optional)</label>
        <div style="display:flex;align-items:center;gap:14px;flex-wrap:wrap">
          <input name="imageFile" type="file" accept="image/*" onchange="previewDonationImg(this)"/>
          <div class="img-preview-wrap" style="display:none;width:52px;height:52px;border-radius:12px;overflow:hidden;border:1.5px solid var(--border);flex-shrink:0;box-shadow:var(--shadow-sm)">
            <img class="img-preview" style="width:100%;height:100%;object-fit:cover"/>
          </div>
        </div>
      </div>
      <div class="field span2 full" style="grid-column:1/-1"><label>Notes (Optional)</label><textarea name="notes" placeholder="Any extra information about the food..."></textarea></div>
    </div></form>`;
}

function previewDonationImg(input) {
  if (input.files && input.files[0]) {
    const reader = new FileReader();
    reader.onload = e => {
      const form = input.closest('form');
      const w = form ? form.querySelector('.img-preview-wrap') : null;
      const img = form ? form.querySelector('.img-preview') : null;
      if (w && img) {
        img.src = e.target.result;
        w.style.display = 'block';
      }
    };
    reader.readAsDataURL(input.files[0]);
  }
}

function showImagePreview(src) {
  openModal('Food Donation Photo', `<div style="text-align:center;padding:8px"><img src="${src}" style="max-width:100%;max-height:72vh;border-radius:16px;box-shadow:var(--shadow-lg);object-fit:contain"/></div>`, { submitLabel: 'Close', onSubmit: () => closeModal() });
}

async function readImageInput(root = document) {
  const fileEl = root.querySelector('[name=imageFile]');
  if (!fileEl || !fileEl.files || !fileEl.files[0]) return '';
  const file = fileEl.files[0];
  return new Promise((resolve) => {
    const r = new FileReader();
    r.onload = () => resolve(r.result);
    r.onerror = () => resolve('');
    r.readAsDataURL(file);
  });
}

function openDonationModal(source) {
  const title = source === 'restaurant' ? 'Enter Restaurant Donation' : source === 'hotel' ? 'Enter Hotel Donation' : 'Add Food Donation';
  openModal(title, donationFormHTML(source), {
    submitLabel: 'Submit Donation',
    onSubmit: async d => {
      d.image = await readImageInput($('#modalBody'));
      await addDonation(Object.assign(d, { source }));
      closeModal();
      renderApp();
    }
  });
}

/* ================= DASHBOARD ================= */
let dashFilters = { gov: 'All', kind: 'All' };
function pageDashboard() {
  const isAll = dashFilters.kind === 'All';
  const isRest = dashFilters.kind === 'Restaurant';
  const isHotel = dashFilters.kind === 'Hotel';
  const isDonor = dashFilters.kind === 'Donor';

  const dashDonations = (DB.donations || []).filter(d => {
    if (dashFilters.gov !== 'All' && normGov(d.location) !== normGov(dashFilters.gov)) return false;
    if (isRest && d.source !== 'restaurant') return false;
    if (isHotel && d.source !== 'hotel') return false;
    if (isDonor && d.source !== 'donor') return false;
    if (searchTerm && !matches(d)) return false;
    return true;
  });

  let ranks = donationRankings();
  if (dashFilters.gov !== 'All') {
    ranks = ranks.filter(r => normGov(r.location) === normGov(dashFilters.gov));
  }
  if (!isAll) {
    ranks = ranks.filter(r => r.type === dashFilters.kind);
  }
  if (searchTerm) {
    ranks = ranks.filter(r => [r.name, r.type, r.location, r.phone].filter(Boolean).join(' ').toLowerCase().includes(searchTerm));
  }

  let offers = offerRankings();
  if (dashFilters.gov !== 'All') {
    offers = offers.filter(r => normGov(r.location) === normGov(dashFilters.gov));
  }
  if (!isAll) {
    offers = offers.filter(r => r.type === dashFilters.kind);
  }
  if (searchTerm) {
    offers = offers.filter(r => [r.title, r.name, r.type, r.location, r.phone, r.audience].filter(Boolean).join(' ').toLowerCase().includes(searchTerm));
  }

  const topDonors = ranks.slice(0, 8);
  const topOffers = offers.slice(0, 8);

  const featuredOffers = (DB.offers || []).filter(o => {
    if (!o.featured) return false;
    const type = o.businessType === 'Hotel' || o.hotelName ? 'Hotel' : 'Restaurant';
    if (!isAll && type !== dashFilters.kind) return false;
    if (dashFilters.gov !== 'All' && normGov(o.location) !== normGov(dashFilters.gov)) return false;
    if (searchTerm && ![o.title, o.restaurantName, o.hotelName, o.location].filter(Boolean).join(' ').toLowerCase().includes(searchTerm)) return false;
    return true;
  }).slice(0, 4);

  const featuredAds = (DB.ads || []).filter(a => {
    if (!a.featured || a.status !== 'active') return false;
    const type = a.businessType === 'Hotel' ? 'Hotel' : 'Restaurant';
    if (!isAll && type !== dashFilters.kind) return false;
    if (dashFilters.gov !== 'All' && normGov(a.governorate || a.location) !== normGov(dashFilters.gov)) return false;
    if (searchTerm && ![a.title, a.business, a.governorate, a.location].filter(Boolean).join(' ').toLowerCase().includes(searchTerm)) return false;
    return true;
  }).slice(0, 4);

  const byGov = EGYPT_GOVERNORATES.map(g => ({
    gov: g,
    count: dashDonations.filter(d => normGov(d.location) === normGov(g)).length,
    meals: dashDonations.filter(d => normGov(d.location) === normGov(g)).reduce((a, d) => a + (parseInt(d.quantity) || 0), 0)
  })).filter(g => (dashFilters.gov === 'All' ? (g.meals > 0 || g.count > 0) : normGov(g.gov) === normGov(dashFilters.gov)))
     .sort((a, b) => b.meals - a.meals || b.count - a.count);

  const totalMeals = dashDonations.reduce((a, d) => a + (parseInt(d.quantity) || 0), 0);
  const totalDons = dashDonations.length;

  // Clickable Navigation KPI Helper
  const kpi = (label, val, ic, tone, sub, navRoute = '', filterType = '') => {
    const clickable = navRoute ? `data-nav="${navRoute}" ${filterType ? `data-filter="${filterType}"` : ''} role="button" tabindex="0"` : '';
    return `<div class="card kpi ${navRoute ? 'kpi-clickable' : ''}" ${clickable} title="${navRoute ? 'Click to view ' + label : ''}">
      <div class="kpi-top">
        <span class="kpi-label">${label}</span>
        <span class="kpi-icon tone-${tone}">${icon(ic, 22)}</span>
      </div>
      <div class="kpi-val">${Number(val || 0).toLocaleString()}</div>
      <div class="kpi-trend">${sub}</div>
    </div>`;
  };

  let kpiCardsHTML = '';
  if (isRest) {
    kpiCardsHTML = [
      kpi('Restaurant Meals Shared', totalMeals, 'meal', 'green', 'Filtered to restaurants', 'restaurants'),
      kpi('Restaurant Donations', totalDons, 'gift', 'rose', 'Submitted by restaurants', 'restaurants'),
      kpi('Registered Restaurants', (DB.restaurants || []).length, 'restaurant', 'purple', 'View all restaurants', 'restaurants'),
      kpi('Active Restaurant Offers', offers.length, 'gift', 'blue', 'Discounts & specials', 'restaurants'),
      kpi('Contributing Governorates', byGov.length, 'pin', 'teal', 'Active locations'),
      kpi('Average Meals / Donation', totalDons ? Math.round(totalMeals / totalDons) : 0, 'box', 'orange', 'Meals per delivery')
    ].join('');
  } else if (isHotel) {
    kpiCardsHTML = [
      kpi('Hotel Meals Shared', totalMeals, 'meal', 'green', 'Filtered to hotels', 'hotels'),
      kpi('Hotel Donations', totalDons, 'gift', 'rose', 'Submitted by hotels', 'hotels'),
      kpi('Registered Hotels', (DB.hotels || []).length, 'hotel', 'teal', 'View all hotels', 'hotels'),
      kpi('Night & Stay Offers', offers.length, 'gift', 'blue', 'Special stays & rates', 'hotels'),
      kpi('Contributing Governorates', byGov.length, 'pin', 'purple', 'Active locations'),
      kpi('Average Meals / Donation', totalDons ? Math.round(totalMeals / totalDons) : 0, 'box', 'orange', 'Meals per delivery')
    ].join('');
  } else if (isDonor) {
    kpiCardsHTML = [
      kpi('Donor Meals Shared', totalMeals, 'meal', 'green', 'Individual donations', 'donate'),
      kpi('Total Donations', totalDons, 'gift', 'rose', 'Individual submissions', 'donate'),
      kpi('Contributing Governorates', byGov.length, 'pin', 'teal', 'Active locations'),
      kpi('Charities Supported', (DB.charities || []).length, 'charity', 'orange', 'Registered partners', 'charities'),
      kpi('Average Meals / Donation', totalDons ? Math.round(totalMeals / totalDons) : 0, 'box', 'purple', 'Meals per delivery')
    ].join('');
  } else {
    kpiCardsHTML = [
      kpi('Total Meals Shared', totalMeals, 'meal', 'green', 'View all food donations', 'donate'),
      kpi('Total Donations', totalDons, 'gift', 'rose', 'All submitted donations', 'donate'),
      kpi('Restaurants', (DB.restaurants || []).length, 'restaurant', 'purple', 'Registered partners', 'restaurants'),
      kpi('Hotels', (DB.hotels || []).length, 'hotel', 'teal', 'Registered partners', 'hotels'),
      kpi('Charities', (DB.charities || []).length, 'charity', 'orange', 'Registered organisations', 'charities'),
      kpi('Active Offers', offers.length, 'gift', 'blue', 'Discounts & specials', 'promotions')
    ].join('');
  }

  // Contributor Leaders with 5-star ratings & clickable row
  const rankRows = topDonors.length
    ? topDonors.map((r, i) => {
        const ratingHTML = renderStarsHTML(r.name, r.type.toLowerCase(), { showButton: true });
        const targetNav = r.type === 'Restaurant' ? 'restaurants' : r.type === 'Hotel' ? 'hotels' : 'donate';
        return `<tr style="cursor:pointer" class="row-clickable" data-nav="${targetNav}" title="View ${esc(r.name)}">
          <td><b>#${i + 1}</b></td>
          <td>
            <div class="cell-main" style="display:flex;align-items:center;gap:8px">${esc(r.name)} <span class="badge ${r.type === 'Restaurant' ? 'b-info' : r.type === 'Hotel' ? 'b-active' : 'b-rose'}" style="font-size:10px">${r.type}</span></div>
            <div style="margin-top:3px">${ratingHTML}</div>
          </td>
          <td>${r.donations}</td>
          <td><b>${r.meals.toLocaleString()}</b> meals</td>
          <td>${esc(r.location || '—')}</td>
          <td onclick="event.stopPropagation()">${r.phone ? `<a href="tel:${esc(r.phone)}" class="badge b-info">${icon('phone', 12)} ${esc(r.phone)}</a>` : '—'}</td>
        </tr>`;
      }).join('')
    : `<tr><td colspan="6">${emptyState('gift', 'No contributors found', 'No donation leaders match the selected filters.')}</td></tr>`;

  // Best Offers with ratings & clickable row
  const offerRows = topOffers.length
    ? topOffers.map((r, i) => {
        const ratingHTML = renderStarsHTML(r.name, r.type.toLowerCase(), { showButton: false });
        const targetNav = r.type === 'Hotel' ? 'hotels' : 'restaurants';
        return `<tr style="cursor:pointer" class="row-clickable" data-nav="${targetNav}" title="View offer details">
          <td><b>#${i + 1}</b></td>
          <td>
            <div class="cell-main">${esc(r.title)}</div>
            <div class="cell-sub" style="display:flex;align-items:center;gap:8px;flex-wrap:wrap">
              <span>${esc(r.name)} • ${r.type}${r.audience ? ' • ' + esc(r.audience) : ''}</span>
              ${ratingHTML}
            </div>
          </td>
          <td><span class="badge b-active">${r.discount}% OFF</span></td>
          <td>${esc(r.location || '—')}</td>
          <td onclick="event.stopPropagation()">${r.phone ? `<a href="tel:${esc(r.phone)}" class="badge b-info">${icon('phone', 12)} ${esc(r.phone)}</a>` : '—'}</td>
        </tr>`;
      }).join('')
    : `<tr><td colspan="5">${emptyState('gift', 'No offers found', 'No active offers match the selected filters.')}</td></tr>`;

  const govRows = byGov.length
    ? byGov.map((r, i) => `<tr><td><b>${i + 1}</b></td><td>${esc(r.gov)}</td><td>${r.count}</td><td><b>${r.meals.toLocaleString()}</b></td></tr>`).join('')
    : `<tr><td colspan="4" style="text-align:center;padding:24px;color:var(--muted)">No governorate data matching current filters.</td></tr>`;

  const hasFilter = dashFilters.gov !== 'All' || dashFilters.kind !== 'All' || searchTerm;

  $('#pageContent').innerHTML = `
    <div class="page-head">
      <div><h2>${icon('dashboard', 26)} Dashboard</h2><p class="sub">Donation impact, 5-star ratings, leading donors and best offers across Egypt’s 27 governorates.</p></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap"><span class="badge b-active">🇪🇬 27 Governorates</span><span class="badge b-info">⭐ 5-Star Rating System</span></div>
    </div>
    <div class="toolbar" style="margin-bottom:18px;gap:12px;flex-wrap:wrap">
      <div class="search-wrap" style="flex:1;max-width:340px;min-width:220px">
        <span class="ficon" style="position:absolute;left:13px;top:50%;transform:translateY(-50%);color:var(--muted)">${icon('search', 15)}</span>
        <input id="dashSearch" placeholder="Search donors, offers, governorate..." value="${esc(searchTerm)}" style="padding-left:38px"/>
      </div>
      <select id="dashGov">
        <option value="All">All governorates</option>
        ${EGYPT_GOVERNORATES.map(g => `<option value="${g}" ${dashFilters.gov === g ? 'selected' : ''}>${g}</option>`).join('')}
      </select>
      <select id="dashKind">
        <option value="All" ${dashFilters.kind === 'All' ? 'selected' : ''}>All types</option>
        <option value="Restaurant" ${dashFilters.kind === 'Restaurant' ? 'selected' : ''}>Restaurants</option>
        <option value="Hotel" ${dashFilters.kind === 'Hotel' ? 'selected' : ''}>Hotels</option>
        <option value="Donor" ${dashFilters.kind === 'Donor' ? 'selected' : ''}>Donors</option>
      </select>
      ${hasFilter ? `<button class="btn btn-outline btn-sm" id="dashReset">${icon('check', 14)} Reset Filters</button>` : ''}
    </div>
    ${featuredOffers.length || featuredAds.length ? `<div class="card" style="margin-bottom:16px"><div class="card-head"><h3><span class="ch-ic">${icon('megaphone', 17)}</span>Featured Placements</h3><span class="badge b-active">Premium</span></div><div class="two-col">${[...featuredOffers.map(o => ({ t: o.title, n: o.restaurantName || o.hotelName, d: o.discount, type: 'offer' })), ...featuredAds.map(a => ({ t: a.title, n: a.business, d: a.discount, type: 'ad' }))].map(x => `<div class="stat-mini row-clickable" data-nav="promotions" style="cursor:pointer" title="View details"><span class="mi tone-orange">${icon('gift', 20)}</span><div><b>${esc(x.t)}</b><span>${esc(x.n || '')} ${x.d ? ('• ' + x.d + '% OFF') : ''}</span></div></div>`).join('')}</div></div>` : ''}
    <div class="kpi-grid">${kpiCardsHTML}</div>
    <div class="card" style="margin-bottom:16px"><div class="card-head"><h3><span class="ch-ic">${icon('gift', 17)}</span>Dashboard 1 — Donation Leaders & 5-Star Ratings</h3><span class="badge b-info">${isRest ? 'Restaurants Only' : isHotel ? 'Hotels Only' : isDonor ? 'Donors Only' : 'Restaurants + Hotels + Individual Donors'}</span></div><p class="sub" style="margin-bottom:14px">Contributed meals, donations count, and verified charity 5-star ratings.</p><div class="table-wrap"><table class="resp"><thead><tr><th>Rank</th><th>Contributor & Reviews</th><th>Donations</th><th>Meals</th><th>Governorate</th><th>Phone</th></tr></thead><tbody>${rankRows}</tbody></table></div></div>
    <div class="grid-2" style="align-items:start"><div class="card"><div class="card-head"><h3><span class="ch-ic">${icon('pin', 17)}</span>Donation by Governorate</h3><span class="badge b-active">27 Governorates</span></div><div class="table-wrap"><table class="resp"><thead><tr><th>#</th><th>Governorate</th><th>Donations</th><th>Meals</th></tr></thead><tbody>${govRows}</tbody></table></div></div><div class="card"><div class="card-head"><h3><span class="ch-ic">${icon('gift', 17)}</span>Top Governorates</h3></div>${byGov.slice(0, 6).map((r, i) => `<div class="hbar-row"><span class="hl">${esc(r.gov)}</span><div class="hbar-track"><div class="hbar-fill" style="width:${Math.max(3, (r.meals / (byGov[0].meals || 1)) * 100)}%"></div></div><b>${r.meals}</b></div>`).join('') || emptyState('pin', 'No location data', 'Add a governorate to donations to start the ranking.')}</div></div>
    <div class="card" style="margin-top:16px"><div class="card-head"><h3><span class="ch-ic">${icon('gift', 17)}</span>Dashboard 2 — Best Offers (Clickable)</h3><span class="badge b-active">Highest discount first</span></div><p class="sub" style="margin-bottom:14px">Click any offer to navigate to full details or contact the restaurant/hotel directly.</p><div class="table-wrap"><table class="resp"><thead><tr><th>Rank</th><th>Offer & Rating</th><th>Discount</th><th>Governorate</th><th>Phone</th></tr></thead><tbody>${offerRows}</tbody></table></div></div>
    <div class="grid-2"><div class="card"><div class="card-head"><h3><span class="ch-ic">${icon('donate', 17)}</span>Donation Trends</h3><select class="pill-select" id="dashRange"><option>Last 6 Months</option><option>Last 12 Months</option></select></div><div id="trendChart">${trendChartHTML(6, dashDonations)}</div></div><div class="card"><div class="card-head"><h3><span class="ch-ic">${icon('meal', 17)}</span>Food Type Distribution</h3></div><div id="donutWrap">${donutHTML(dashDonations)}</div></div></div>
    <div class="card" style="margin-top:16px"><div class="card-head"><h3><span class="ch-ic">${icon('gift', 17)}</span>Recent Donations</h3><button class="btn btn-outline btn-sm" id="viewAllDon">${icon('eye', 14)} View All</button></div><div id="recentDon">${recentTableHTML(dashDonations.slice(0, 8))}</div></div>
    <div class="banner" style="margin-top:20px">${icon('leaf', 20)} Click any KPI card or contributor to navigate directly across restaurants, hotels, charities and offers.</div>`;

  const vr = $('#viewAllDon'); if (vr) vr.onclick = () => navigate('donate');
  const dr = $('#dashRange'); if (dr) dr.onchange = () => { const num = dr.value.includes('12') ? 12 : 6; $('#trendChart').innerHTML = trendChartHTML(num, dashDonations); };
  const dg = $('#dashGov'); if (dg) dg.onchange = e => { dashFilters.gov = e.target.value; renderApp(); };
  const dk = $('#dashKind'); if (dk) dk.onchange = e => { dashFilters.kind = e.target.value; renderApp(); };
  const ds = $('#dashSearch'); if (ds) ds.oninput = handleSearchInput;
  const drst = $('#dashReset'); if (drst) drst.onclick = () => { dashFilters.gov = 'All'; dashFilters.kind = 'All'; searchTerm = ''; const gs = $('#globalSearch'); if (gs) gs.value = ''; renderApp(); };
}

function lastMonths(n) {
  const out = [], now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    out.push({ key: d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0'), label: monthsShort[d.getMonth()] });
  }
  return out;
}

function trendChartHTML(n, list = DB.donations) {
  const months = lastMonths(n);
  const monthKey = d => {
    const c = d.createdAt;
    if (typeof c === 'number') return new Date(c).toISOString().slice(0, 7);
    if (c) return String(c).slice(0, 7);
    return String(d.date || '').slice(0, 7);
  };
  const counts = months.map(m => (list || []).filter(d => monthKey(d) === m.key).length);
  const max = Math.max(...counts, 1);
  if (!list || !list.length) return `<div class="chart-empty">No donation data matching current filters.</div>`;
  return `<div class="bar-chart">${months.map((m, i) =>
    `<div class="bar-col"><span class="bar-val">${counts[i]}</span><div class="bar" style="height:${Math.max(4, (counts[i] / max) * 100)}%" title="${counts[i]} donation(s)"></div><span class="bar-x">${m.label}</span></div>`).join('')}</div>`;
}

function donutHTML(list = DB.donations) {
  if (!list || !list.length) return `<div class="chart-empty">No data matching current filters.</div>`;
  const byType = {};
  let total = 0;
  list.forEach(d => { byType[d.foodType] = (byType[d.foodType] || 0) + (parseInt(d.quantity) || 0); total += (parseInt(d.quantity) || 0); });
  if (total <= 0) return `<div class="chart-empty">No meals recorded for this filter.</div>`;
  let acc = 0;
  const segs = Object.entries(byType).map(([t, v]) => { const from = acc; acc += (v / total) * 100; return `${FT_COLORS[t] || '#94a3a0'} ${from}% ${acc}%`; });
  return `<div class="donut-wrap"><div class="donut" style="background:conic-gradient(${segs.join(',')})"><div class="donut-center"><b>${total.toLocaleString()}</b><span>meals</span></div></div>
    <div class="legend">${Object.entries(byType).map(([t, v]) => `<div class="legend-row"><span class="sw" style="background:${FT_COLORS[t] || '#94a3a0'}"></span><span>${esc(t)}</span><b>${v.toLocaleString()}</b></div>`).join('')}</div></div>`;
}

function recentTableHTML(rows) {
  if (!rows || !rows.length) return `<div class="chart-empty">No recent donations.</div>`;
  return `<div class="table-wrap"><table class="resp"><thead><tr><th>Donor & Rating</th><th>Food Type</th><th>Quantity</th><th>Date</th><th>Governorate</th><th>Status</th><th>Review</th></tr></thead>
    <tbody>${rows.map(d => `<tr>
      <td data-label="Donor">
        <div style="display:flex;align-items:center;gap:10px">
          ${d.image ? `<img src="${d.image}" class="food-thumb" alt="Food" onclick="showImagePreview('${esc(d.image)}')"/>` : ''}
          <div>
            <div class="cell-main">${esc(d.donorName)}</div>
            <div style="margin-top:2px">${renderStarsHTML(d.donorName, d.source, { showButton: false })}</div>
          </div>
        </div>
      </td>
      <td data-label="Food Type">${esc(d.foodType)}</td>
      <td data-label="Quantity"><b>${d.quantity}</b> meals</td>
      <td data-label="Date">${fmtDate(d.date)}</td>
      <td data-label="Location">${esc(d.location)}</td>
      <td data-label="Status">${statusBadge(d.status)}</td>
      <td data-label="Review"><button class="btn btn-outline btn-sm rate-trigger" data-rate-type="${esc(d.source || 'donor')}" data-rate-name="${esc(d.donorName)}" data-rate-id="${esc(d.donorName)}">⭐ Rate 5 Stars</button></td>
    </tr>`).join('')}</tbody></table></div>`;
}

/* ================= RESTAURANTS ================= */
function pageRestaurants() {
  const offers = (DB.offers || []).filter(o => o.businessType === 'Restaurant' && (!searchTerm || [o.restaurantName, o.title, o.location, o.audience].join(' ').toLowerCase().includes(searchTerm)));
  const all = (DB.donations || []).filter(d => d.source === 'restaurant' && matches(d));

  $('#pageContent').innerHTML = `
    <div class="page-head">
      <div><h2>${icon('restaurant', 27)} Restaurants</h2><p class="sub">Restaurants can promote offers for regular customers, support charities, and donate surplus meals.</p></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-outline" id="restDonate">${icon('plus', 17)} Enter Donation</button>
        <button class="btn btn-primary" id="addOffer">${icon('plus', 17)} Add Offer</button>
      </div>
    </div>
    <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr)">
      <div class="card kpi kpi-clickable" data-nav="restaurants" title="Click to view restaurants"><div class="kpi-top"><span class="kpi-label">Registered Restaurants</span><span class="kpi-icon tone-purple">${icon('restaurant', 22)}</span></div><div class="kpi-val">${(DB.restaurants || []).length}</div><div class="kpi-trend">Business partners</div></div>
      <div class="card kpi kpi-clickable" id="kpiRestDon" title="Click to view restaurant donations"><div class="kpi-top"><span class="kpi-label">Restaurant Donations</span><span class="kpi-icon tone-green">${icon('donate', 22)}</span></div><div class="kpi-val">${all.length}</div><div class="kpi-trend">Meals donated</div></div>
      <div class="card kpi kpi-clickable" id="kpiRestOff" title="Click to view restaurant offers"><div class="kpi-top"><span class="kpi-label">Active Offers</span><span class="kpi-icon tone-orange">${icon('gift', 22)}</span></div><div class="kpi-val">${offers.length}</div><div class="kpi-trend">Discounts & specials</div></div>
    </div>
    <div class="card" style="margin-bottom:16px" id="secRestOffers">
      <div class="card-head">
        <h3><span class="ch-ic">${icon('megaphone', 17)}</span>Restaurant Offers (with 5-Star Ratings)</h3>
        <div class="toolbar" style="margin:0"><div class="search-wrap"><input id="offerSearch" placeholder="Search restaurant offers..." value="${esc(searchTerm)}"/></div></div>
      </div>
      ${offers.length ? `<div class="two-col">${offers.map(o => `
        <div class="stat-mini" style="align-items:flex-start">
          <span class="mi tone-green">${icon('gift', 20)}</span>
          <div style="flex:1"><b>${esc(o.title)}</b><span>${esc(o.restaurantName)} • ${esc(o.location)}</span>
            <div style="margin-top:7px;display:flex;gap:7px;align-items:center;flex-wrap:wrap">
              <span class="badge b-active">${esc(o.discount)}% OFF</span>
              <span class="badge b-info">${esc(o.audience)}</span>
              ${renderStarsHTML(o.restaurantName, 'restaurant', { showButton: true })}
              ${o.phone ? `<a href="tel:${esc(o.phone)}" class="badge b-info">${icon('phone', 12)} ${esc(o.phone)}</a>` : ''}
            </div>
            <p style="margin-top:8px;font-size:12px;color:var(--muted)">${esc(o.description || '')}</p>
          </div>
        </div>`).join('')}</div>` : emptyState('restaurant', 'No restaurant offers yet', 'Add an offer to make it visible to customers and charity organisations.')}
    </div>
    <div class="grid-2" style="grid-template-columns:1.9fr 1fr">
      <div class="card">
        <div class="card-head"><h3><span class="ch-ic">${icon('restaurant', 17)}</span>Enter Restaurant Donation</h3></div>
        <p style="color:var(--muted);font-size:13px;margin-bottom:16px">Share surplus meals with verified charities across Egypt’s 27 governorates.</p>
        ${donationFormHTML('restaurant').replace('<form novalidate>', `<form id="inlineDonForm" novalidate>`)}
        <div style="display:flex;justify-content:flex-end;margin-top:16px">
          <button class="btn btn-primary" id="inlineSubmit" type="button">${icon('send', 15)} Submit Donation</button>
        </div>
      </div>
      <div class="side-illu">
        <div class="illu-ic">${icon('restaurant', 36)}</div>
        <h3>Restaurants reduce food waste</h3>
        <p>Donate surplus food from weddings, banquets, and daily services. Charities rate every meal.</p>
        <span class="badge b-active">${icon('leaf', 13)} Zero Hunger • Sustainable Food</span>
      </div>
    </div>
    <div class="card" style="margin-top:16px" id="secRestDonations">
      <div class="card-head"><h3><span class="ch-ic">${icon('building', 17)}</span>Restaurant Food Donations & Charity Ratings</h3></div>
      <div class="table-wrap"><table class="resp"><thead><tr>
        <th>Restaurant Name & Rating</th><th>Food Type</th><th>Quantity</th><th>Donation Date</th><th>Expiry Time</th><th>Governorate</th><th>Phone</th><th>Status</th><th>Review</th></tr></thead>
        <tbody>${all.length ? all.map(d => `<tr>
          <td data-label="Restaurant">
            <div style="display:flex;align-items:center;gap:12px">
              ${d.image ? `<img src="${d.image}" class="food-thumb" alt="Food photo" onclick="showImagePreview('${esc(d.image)}')"/>` : ''}
              <div>
                <div class="cell-main">${esc(d.donorName)}</div>
                <div style="margin-top:2px">${renderStarsHTML(d.donorName, 'restaurant', { showButton: false })}</div>
              </div>
            </div>
          </td>
          <td data-label="Food Type">${esc(d.foodType)}</td>
          <td data-label="Quantity"><b>${d.quantity}</b> meals</td>
          <td data-label="Donation Date">${fmtDate(d.date)}</td>
          <td data-label="Expiry Time">${esc(d.expiry || '—')}</td>
          <td data-label="Location">${esc(d.location)}</td>
          <td data-label="Phone">${d.phone ? `<a href="tel:${esc(d.phone)}" class="badge b-info">${esc(d.phone)}</a>` : '—'}</td>
          <td data-label="Status">${statusBadge(d.status)}</td>
          <td data-label="Review"><button class="btn btn-outline btn-sm rate-trigger" data-rate-type="restaurant" data-rate-name="${esc(d.donorName)}" data-rate-id="${esc(d.donorName)}">⭐ Rate 5 Stars</button></td>
        </tr>`).join('')
        : `<tr><td colspan="9">${emptyState('restaurant', 'No restaurant donations yet', 'Submit surplus meals to populate this table.')}</td></tr>`}
        </tbody></table></div>
    </div>
    <div class="banner" style="margin-top:20px">${icon('heart', 20)} Restaurants can publish discounts and donate surplus meals. Both appear in real-time.</div>`;

  const submitInline = async () => {
    const form = $('#inlineDonForm');
    if (!form.reportValidity()) return;
    const data = {}; $$('#inlineDonForm [name]').forEach(el => { if (el.type !== 'file') data[el.name] = el.value.trim(); });
    data.image = await readImageInput(form);
    await addDonation(Object.assign(data, { source: 'restaurant' }));
    renderApp();
  };
  $('#inlineSubmit').onclick = submitInline;
  $('#inlineDonForm').addEventListener('submit', e => { e.preventDefault(); submitInline(); });
  $('#restDonate').onclick = () => openDonationModal('restaurant');
  const kd = $('#kpiRestDon'); if (kd) kd.onclick = () => { const el = $('#secRestDonations'); if (el) el.scrollIntoView({ behavior: 'smooth' }); };
  const ko = $('#kpiRestOff'); if (ko) ko.onclick = () => { const el = $('#secRestOffers'); if (el) el.scrollIntoView({ behavior: 'smooth' }); };

  $('#addOffer').onclick = () => openModal('Add Restaurant Offer', `<form novalidate><div class="form-grid">
    ${fldIcon('Restaurant Name', 'restaurantName', 'restaurant', 'text', 'Enter restaurant name', 'required')}
    ${fldIcon('Offer Title', 'title', 'gift', 'text', 'e.g. Family Meal Discount', 'required')}
    ${fldIcon('Discount %', 'discount', 'gift', 'number', '15', 'required min="1" max="100"')}
    ${selFld('Audience', 'audience', ['Regular Customers', 'Charity Organisations', 'Both'], 'Select audience', 'required')}
    ${govSelect('Governorate', 'location', true)}
    ${fldIcon('Phone Number', 'phone', 'phone', 'tel', '+20 10 12345678', 'required')}
    ${fldIcon('Valid Until', 'validUntil', 'calendar', 'date', '', `required value="${todayISO()}"`)}
    <div class="field full" style="grid-column:1/-1"><label>Description</label><textarea name="description" placeholder="Describe the offer and conditions..."></textarea></div>
  </div></form>`, {
    submitLabel: 'Publish Offer',
    onSubmit: async d => {
      d.businessType = 'Restaurant';
      await api('/offers', { method: 'POST', body: d });
      toast('Restaurant offer published successfully.');
      closeModal();
      renderApp();
    }
  });
  const os = $('#offerSearch'); if (os) os.oninput = handleSearchInput;
}

/* ================= HOTELS ================= */
function pageHotels() {
  const hotelOffers = (DB.offers || []).filter(o => o.businessType === 'Hotel' && (!searchTerm || [o.hotelName, o.restaurantName, o.title, o.location].join(' ').toLowerCase().includes(searchTerm)));
  const all = (DB.donations || []).filter(d => d.source === 'hotel' && matches(d));

  $('#pageContent').innerHTML = `
    <div class="page-head">
      <div><h2>${icon('hotel', 27)} Hotels</h2><p class="sub">Hotels can donate surplus meals and publish night / stay discounts for guests and charity partners.</p></div>
      <div style="display:flex;gap:8px;flex-wrap:wrap">
        <button class="btn btn-outline" id="addHotelOffer">${icon('plus', 17)} Add Hotel Offer</button>
        <button class="btn btn-primary" id="enterDonation">${icon('plus', 17)} Enter Donation</button>
      </div>
    </div>
    <div class="kpi-grid" style="grid-template-columns:repeat(3,1fr)">
      <div class="card kpi kpi-clickable" data-nav="hotels" title="Click to view hotels"><div class="kpi-top"><span class="kpi-label">Registered Hotels</span><span class="kpi-icon tone-teal">${icon('hotel', 22)}</span></div><div class="kpi-val">${(DB.hotels || []).length}</div><div class="kpi-trend">Business partners</div></div>
      <div class="card kpi kpi-clickable" id="kpiHotelDon" title="Click to view hotel donations"><div class="kpi-top"><span class="kpi-label">Hotel Donations</span><span class="kpi-icon tone-green">${icon('donate', 22)}</span></div><div class="kpi-val">${all.length}</div><div class="kpi-trend">Surplus meals shared</div></div>
      <div class="card kpi kpi-clickable" id="kpiHotelOff" title="Click to view stay offers"><div class="kpi-top"><span class="kpi-label">Night / Stay Offers</span><span class="kpi-icon tone-orange">${icon('gift', 22)}</span></div><div class="kpi-val">${hotelOffers.length}</div><div class="kpi-trend">Ranked on Dashboard 2</div></div>
    </div>
    <div class="card" style="margin-bottom:16px" id="secHotelOffers">
      <div class="card-head">
        <h3><span class="ch-ic">${icon('gift', 17)}</span>Hotel Offers (nights & stays with 5-Star Ratings)</h3>
        <div class="toolbar" style="margin:0"><div class="search-wrap"><input id="hotelSearch" placeholder="Search hotel offers..." value="${esc(searchTerm)}"/></div></div>
      </div>
      ${hotelOffers.length ? `<div class="two-col">${hotelOffers.map(o => `
        <div class="stat-mini" style="align-items:flex-start">
          <span class="mi tone-teal">${icon('hotel', 20)}</span>
          <div style="flex:1"><b>${esc(o.title)}</b><span>${esc(o.hotelName || o.restaurantName)} • ${esc(o.location)}</span>
            <div style="margin-top:7px;display:flex;gap:7px;align-items:center;flex-wrap:wrap">
              <span class="badge b-active">${esc(o.discount)}% OFF</span>
              <span class="badge b-info">${esc(o.audience || 'Guests')}</span>
              ${renderStarsHTML(o.hotelName || o.restaurantName, 'hotel', { showButton: true })}
              ${o.phone ? `<a href="tel:${esc(o.phone)}" class="badge b-info">${icon('phone', 12)} ${esc(o.phone)}</a>` : ''}
            </div>
            <p style="margin-top:8px;font-size:12px;color:var(--muted)">${esc(o.description || '')}</p>
          </div>
        </div>`).join('')}</div>` : emptyState('hotel', 'No hotel offers yet', 'Publish a night or stay discount. The highest discount appears first on Dashboard 2.')}
    </div>
    <div class="grid-2" style="grid-template-columns:1.9fr 1fr">
      <div class="card">
        <div class="card-head"><h3><span class="ch-ic">${icon('hotel', 17)}</span>Enter Hotel Donation</h3></div>
        <p style="color:var(--muted);font-size:13px;margin-bottom:16px">Share surplus meals with verified charities across Egypt’s 27 governorates.</p>
        ${donationFormHTML('hotel').replace('<form novalidate>', `<form id="inlineDonForm" novalidate>`)}
        <div style="display:flex;justify-content:flex-end;margin-top:16px">
          <button class="btn btn-primary" id="inlineSubmit" type="button">${icon('send', 15)} Submit Donation</button>
        </div>
      </div>
      <div class="side-illu">
        <div class="illu-ic">${icon('hotel', 36)}</div>
        <h3>Hotels reduce waste</h3>
        <p>Donate extra meals and offer fair night rates. Charities in the same governorate will see your contact details.</p>
        <span class="badge b-active">${icon('leaf', 13)} Less waste • More hope</span>
      </div>
    </div>
    <div class="card" style="margin-top:16px" id="secHotelDonations">
      <div class="card-head"><h3><span class="ch-ic">${icon('building', 17)}</span>Hotel Food Donations & Ratings</h3></div>
      <div class="table-wrap"><table class="resp"><thead><tr>
        <th>Hotel Name & Rating</th><th>Food Type</th><th>Quantity</th><th>Donation Date</th><th>Expiry Time</th><th>Governorate</th><th>Phone</th><th>Status</th><th>Review</th></tr></thead>
        <tbody>${all.length ? all.map(d => `<tr>
          <td data-label="Hotel">
            <div style="display:flex;align-items:center;gap:12px">
              ${d.image ? `<img src="${d.image}" class="food-thumb" alt="Food photo" onclick="showImagePreview('${esc(d.image)}')"/>` : ''}
              <div>
                <div class="cell-main">${esc(d.donorName)}</div>
                <div style="margin-top:2px">${renderStarsHTML(d.donorName, 'hotel', { showButton: false })}</div>
              </div>
            </div>
          </td>
          <td data-label="Food Type">${esc(d.foodType)}</td>
          <td data-label="Quantity"><b>${d.quantity}</b> meals</td>
          <td data-label="Donation Date">${fmtDate(d.date)}</td>
          <td data-label="Expiry Time">${esc(d.expiry || '—')}</td>
          <td data-label="Location">${esc(d.location)}</td>
          <td data-label="Phone">${d.phone ? `<a href="tel:${esc(d.phone)}" class="badge b-info">${esc(d.phone)}</a>` : '—'}</td>
          <td data-label="Status">${statusBadge(d.status)}</td>
          <td data-label="Review"><button class="btn btn-outline btn-sm rate-trigger" data-rate-type="hotel" data-rate-name="${esc(d.donorName)}" data-rate-id="${esc(d.donorName)}">⭐ Rate 5 Stars</button></td>
        </tr>`).join('')
        : `<tr><td colspan="9">${emptyState('hotel', 'No hotel donations yet', 'When hotels submit surplus meals, they appear here.')}</td></tr>`}
        </tbody></table></div>
    </div>
    <div class="banner" style="margin-top:20px">${icon('leaf', 20)} Hotel night discounts and food donations both update the live dashboards.</div>`;

  const submitInline = async () => {
    const form = $('#inlineDonForm');
    if (!form.reportValidity()) return;
    const data = {}; $$('#inlineDonForm [name]').forEach(el => { if (el.type !== 'file') data[el.name] = el.value.trim(); });
    data.image = await readImageInput(form);
    await addDonation(Object.assign(data, { source: 'hotel' }));
    renderApp();
  };
  $('#inlineSubmit').onclick = submitInline;
  $('#inlineDonForm').addEventListener('submit', e => { e.preventDefault(); submitInline(); });
  $('#enterDonation').onclick = () => openDonationModal('hotel');
  const kd = $('#kpiHotelDon'); if (kd) kd.onclick = () => { const el = $('#secHotelDonations'); if (el) el.scrollIntoView({ behavior: 'smooth' }); };
  const ko = $('#kpiHotelOff'); if (ko) ko.onclick = () => { const el = $('#secHotelOffers'); if (el) el.scrollIntoView({ behavior: 'smooth' }); };

  $('#addHotelOffer').onclick = () => openModal('Add Hotel Offer', `<form novalidate><div class="form-grid">
    ${fldIcon('Hotel Name', 'hotelName', 'hotel', 'text', 'Enter hotel name', 'required')}
    ${fldIcon('Offer Title', 'title', 'gift', 'text', 'e.g. 40% off one night', 'required')}
    ${fldIcon('Discount %', 'discount', 'gift', 'number', '40', 'required min="1" max="100"')}
    ${selFld('Offer Type', 'audience', ['Night Stay', 'Room Rate', 'Weekend Package', 'Charity Partner Rate', 'Both Guests & Charities'], 'Select type', 'required')}
    ${govSelect('Governorate', 'location', true)}
    ${fldIcon('Phone Number', 'phone', 'phone', 'tel', '+20 10 12345678', 'required')}
    ${fldIcon('Valid Until', 'validUntil', 'calendar', 'date', '', `required value="${todayISO()}"`)}
    <div class="field full" style="grid-column:1/-1"><label>Description</label><textarea name="description" placeholder="Describe the night/stay offer..."></textarea></div>
  </div></form>`, {
    submitLabel: 'Publish Hotel Offer',
    onSubmit: async d => {
      d.businessType = 'Hotel';
      d.restaurantName = d.hotelName;
      await api('/offers', { method: 'POST', body: d });
      toast('Hotel offer published successfully.');
      closeModal();
      renderApp();
    }
  });
  const hs = $('#hotelSearch'); if (hs) hs.oninput = handleSearchInput;
}

/* ================= DONATE PAGE ================= */
let listFilters = { food: 'All', date: 'All' };
function pageDonorList(source) {
  const isRest = source === 'restaurant', isHotel = source === 'hotel';
  const title = isRest ? 'Restaurants' : isHotel ? 'Hotels' : 'Donate Food';
  const ic = isRest ? 'restaurant' : isHotel ? 'hotel' : 'gift';
  const sub = isRest ? 'Publish special offers and discounts for customers and charity organisations.'
    : isHotel ? 'Help reduce food waste by donating extra meals from your hotel.'
    : 'Share food directly and help people in need. Every meal makes a difference.';
  const all = (DB.donations || []).filter(d => d.source === source && matches(d));
  const filtered = all.filter(d =>
    (listFilters.food === 'All' || d.foodType === listFilters.food) &&
    (listFilters.date === 'All' || d.date === listFilters.date));

  $('#pageContent').innerHTML = `
    <div class="page-head">
      <div><h2>${icon(ic, 27)} ${title}</h2><p class="sub">${sub}</p></div>
      <button class="btn btn-primary" id="enterDonation">${icon('plus', 17)} Enter Donation</button>
    </div>
    <div class="grid-2" style="grid-template-columns:1.9fr 1fr">
      <div class="card">
        <div class="card-head"><h3><span class="ch-ic">${icon(ic, 17)}</span>Enter Donation</h3></div>
        <p style="color:var(--muted);font-size:13px;margin-bottom:16px">Fill in the details below to submit your food donation.</p>
        ${donationFormHTML(source).replace('<form novalidate>', `<form id="inlineDonForm" novalidate>`)}
        <div style="display:flex;justify-content:flex-end;margin-top:16px">
          <button class="btn btn-primary" id="inlineSubmit" type="button">${icon('send', 15)} Submit Donation</button>
        </div>
      </div>
      <div class="side-illu">
        <div class="illu-ic">${icon(isHotel ? 'hotel' : isRest ? 'restaurant' : 'heart', 36)}</div>
        <h3>Your donation makes a difference</h3>
        <p>Help us fight hunger and reduce food waste together.</p>
        <span class="badge b-active">${icon('leaf', 13)} Less waste • More hope</span>
      </div>
    </div>
    <div class="card">
      <div class="card-head"><h3><span class="ch-ic">${icon('building', 17)}</span>${isRest ? 'Donating Restaurants' : isHotel ? 'Donating Hotels' : 'Food Donations'}</h3>
        <div class="toolbar" style="margin:0">
          <div class="search-wrap"><span class="ficon" style="position:absolute;left:13px;top:50%;transform:translateY(-50%);color:var(--muted)">${icon('search', 15)}</span>
            <input id="listSearch" placeholder="${isRest ? 'Search restaurants...' : isHotel ? 'Search hotels...' : 'Search donations...'}" value="${esc(searchTerm)}" style="padding-left:38px"/></div>
          <select id="filterFood"><option>All</option>${FOOD_TYPES.map(t => `<option ${listFilters.food === t ? 'selected' : ''}>${t}</option>`).join('')}</select>
          <select id="filterDate"><option>All</option>${[...new Set(all.map(d => d.date))].sort().reverse().map(dt => `<option ${listFilters.date === dt ? 'selected' : ''}>${dt}</option>`).join('')}</select>
        </div>
      </div>
      <div class="table-wrap"><table class="resp"><thead><tr>
        <th>${isRest ? 'Restaurant Name' : isHotel ? 'Hotel Name' : 'Donor Name'} & Rating</th><th>Food Type</th><th>Quantity</th><th>Donation Date</th><th>Expiry Time</th><th>Location</th><th>Status</th><th>Review</th></tr></thead>
        <tbody id="donorRows">${filtered.length ? filtered.map(d => `<tr>
          <td data-label="Name">
            <div style="display:flex;align-items:center;gap:12px">
              ${d.image ? `<img src="${d.image}" class="food-thumb" alt="Food photo" onclick="showImagePreview('${esc(d.image)}')"/>` : ''}
              <div>
                <div class="cell-main">${esc(d.donorName)}</div>
                <div style="margin-top:2px">${renderStarsHTML(d.donorName, d.source, { showButton: false })}</div>
              </div>
            </div>
          </td>
          <td data-label="Food Type">${esc(d.foodType)}</td>
          <td data-label="Quantity"><b>${d.quantity}</b> meals</td>
          <td data-label="Donation Date">${fmtDate(d.date)}</td>
          <td data-label="Expiry Time">${esc(d.expiry || '—')}</td>
          <td data-label="Location">${esc(d.location)}</td>
          <td data-label="Status">${statusBadge(d.status)}</td>
          <td data-label="Review"><button class="btn btn-outline btn-sm rate-trigger" data-rate-type="${esc(d.source || 'donor')}" data-rate-name="${esc(d.donorName)}" data-rate-id="${esc(d.donorName)}">⭐ Rate</button></td></tr>`).join('')
        : `<tr><td colspan="8">${emptyState(ic, 'No donations yet', 'When donors submit their donations, they will appear here.')}</td></tr>`}
        </tbody></table></div>
    </div>
    <div class="banner">${icon('leaf', 20)} Together we can end hunger — Less food waste • More food for those in need • A sustainable future</div>`;

  const submitInline = async () => {
    const form = $('#inlineDonForm');
    if (!form.reportValidity()) return;
    const data = {}; $$('#inlineDonForm [name]').forEach(el => { if (el.type !== 'file') data[el.name] = el.value.trim(); });
    data.image = await readImageInput(form);
    await addDonation(Object.assign(data, { source }));
    renderApp();
  };
  $('#inlineSubmit').onclick = submitInline;
  $('#inlineDonForm').addEventListener('submit', e => { e.preventDefault(); submitInline(); });
  $('#enterDonation').onclick = () => openDonationModal(source);
  const ls = $('#listSearch'); if (ls) ls.oninput = handleSearchInput;
  $('#filterFood').onchange = e => { listFilters.food = e.target.value; renderApp(); };
  $('#filterDate').onchange = e => { listFilters.date = e.target.value; renderApp(); };
}

/* ================= CHARITIES ================= */
let charityTab = 'organisations';
function pageCharities() {
  const s = stats();
  const tabs = [
    ['organisations', 'Organisations'], ['available', 'Available Donations'], ['received', 'Received Donations'],
    ['requests', 'Donation Requests'], ['beneficiaries', 'Beneficiaries'], ['locations', 'Distribution Locations']
  ];
  let body = '';
  const charityLocation = (USER && USER.location) || '';
  const nearby = nearbyPartners(charityLocation);

  if (charityTab === 'organisations') {
    const orgs = (DB.charities || []).filter(c => !searchTerm || c.name.toLowerCase().includes(searchTerm) || c.location.toLowerCase().includes(searchTerm));
    body = orgs.length
      ? `<div class="table-wrap"><table class="resp"><thead><tr><th>Organisation Name & Rating</th><th>Responsible Person</th><th>Contact</th><th>Location</th><th>Status</th></tr></thead><tbody>
        ${orgs.map(c => `<tr><td data-label="Organisation"><div class="cell-main">${esc(c.name)}</div><div style="margin-top:2px">${renderStarsHTML(c.name, 'charity', { showButton: false })}</div></td>
          <td data-label="Responsible">${esc(c.person)}</td>
          <td data-label="Contact"><div>${esc(c.phone)}</div><div class="cell-sub">${esc(c.email)}</div></td>
          <td data-label="Location">${esc(c.location)}</td>
          <td data-label="Status"><span class="badge b-active">Registered</span></td></tr>`).join('')}</tbody></table></div>`
      : emptyState('charity', 'No organisations yet', 'When charity organisations register, they will appear here.');
  } else if (charityTab === 'available') {
    const avail = (DB.donations || []).filter(d => (d.status === 'Pending' || d.status === 'Reserved') && matches(d));
    body = avail.length ? `<div class="table-wrap"><table class="resp"><thead><tr><th>Donor & Rating</th><th>Food Type</th><th>Quantity</th><th>Expiry</th><th>Location</th><th>Contact</th><th>Status</th><th>Actions</th></tr></thead><tbody>
      ${avail.map(d => `<tr><td data-label="Donor">
          <div class="cell-main">${esc(d.donorName)}</div>
          <div class="cell-sub">${esc(d.area || d.source || '')}</div>
          <div style="margin-top:2px">${renderStarsHTML(d.donorName, d.source, { showButton: false })}</div>
        </td>
        <td data-label="Food Type">${esc(d.foodType)}</td><td data-label="Quantity"><b>${d.quantity}</b> meals</td>
        <td data-label="Expiry">${esc(d.expiry || '—')}</td><td data-label="Location">${esc(d.location)}${d.area ? ' · ' + esc(d.area) : ''}</td><td data-label="Contact">${contactButtons(d.phone)}</td>
        <td data-label="Status">${statusBadge(d.status)}</td>
        <td data-label="Actions">
          <div style="display:flex;gap:5px;flex-wrap:wrap">
            ${d.status === 'Pending' ? `
              <button class="btn btn-outline btn-sm" data-status="${d.id}" data-next="Reserved">Reserve</button>
              <button class="btn btn-primary btn-sm" data-status="${d.id}" data-next="Received">${icon('check', 13)} Receive</button>
            ` : `
              <button class="btn btn-primary btn-sm" data-status="${d.id}" data-next="Received">${icon('check', 13)} Mark received</button>
            `}
            <button class="btn btn-outline btn-sm rate-trigger" data-rate-type="${esc(d.source || 'donor')}" data-rate-name="${esc(d.donorName)}" data-rate-id="${esc(d.donorName)}">⭐ Rate</button>
          </div>
        </td></tr>`).join('')}</tbody></table></div>`
      : emptyState('box', 'No available donations', 'Pending donations from restaurants, hotels and donors will appear here.');
  } else if (charityTab === 'received') {
    const rec = (DB.donations || []).filter(d => (d.status === 'Received' || d.status === 'Distributed') && matches(d));
    body = rec.length ? `<div class="table-wrap"><table class="resp"><thead><tr><th>Donor</th><th>Food Type</th><th>Quantity</th><th>Received On</th><th>Location</th><th>Status</th><th>Review Meal</th></tr></thead><tbody>
      ${rec.map(d => `<tr><td data-label="Donor"><div class="cell-main">${esc(d.donorName)}</div><div style="margin-top:2px">${renderStarsHTML(d.donorName, d.source, { showButton: false })}</div></td>
        <td data-label="Food Type">${esc(d.foodType)}</td><td data-label="Quantity"><b>${d.quantity}</b> meals</td>
        <td data-label="Received">${fmtDate(d.date)}</td><td data-label="Location">${esc(d.location)}</td>
        <td data-label="Status">${statusBadge(d.status)}</td>
        <td data-label="Review Meal">
          <div style="display:flex;gap:6px;flex-wrap:wrap">
            <button class="btn btn-primary btn-sm rate-trigger" data-rate-type="${esc(d.source || 'donor')}" data-rate-name="${esc(d.donorName)}" data-rate-id="${esc(d.donorName)}">⭐ Rate 5 Stars</button>
            ${d.status === 'Received' ? `<button class="btn btn-outline btn-sm" data-status="${d.id}" data-next="Distributed">Mark distributed</button>` : ''}
          </div>
        </td></tr>`).join('')}</tbody></table></div>`
      : emptyState('truck', 'No received donations yet', 'Reserved then received donations appear here.');
  } else if (charityTab === 'requests') {
    const reqs = (DB.requests || []).filter(r => !searchTerm || r.org.toLowerCase().includes(searchTerm));
    body = (reqs.length ? `<div class="table-wrap"><table class="resp"><thead><tr><th>Organisation</th><th>Food Needed</th><th>Quantity</th><th>Location</th><th>Date</th><th>Status</th></tr></thead><tbody>
      ${reqs.map(r => `<tr><td data-label="Organisation"><div class="cell-main">${esc(r.org)}</div></td>
        <td data-label="Food Needed">${esc(r.foodType)}</td><td data-label="Quantity"><b>${r.quantity}</b> meals</td>
        <td data-label="Location">${esc(r.location)}</td><td data-label="Date">${fmtDate(r.date)}</td>
        <td data-label="Status"><span class="badge b-info">Requested</span></td></tr>`).join('')}</tbody></table></div>`
      : emptyState('doc', 'No donation requests yet', 'Charity organisations can request food donations.')) +
      `<div style="margin-top:16px;display:flex;justify-content:flex-end"><button class="btn btn-primary" id="addRequest">${icon('plus', 15)} Request Donation</button></div>`;
  } else if (charityTab === 'beneficiaries') {
    body = ((DB.beneficiaries || []).length ? `<div class="two-col">${DB.beneficiaries.map(b => `
      <div class="stat-mini"><span class="mi tone-blue">${icon('people', 20)}</span><div><b>${esc(b.name)}</b><span>${b.count} people • ${esc(b.location)}</span></div></div>`).join('')}</div>`
      : emptyState('people', 'No beneficiaries yet', 'Register groups of people supported by your organisation.')) +
      `<div style="margin-top:16px;display:flex;justify-content:flex-end"><button class="btn btn-primary" id="addBeneficiary">${icon('plus', 15)} Add Beneficiaries</button></div>`;
  } else {
    body = ((DB.distLocations || []).length ? `<div class="two-col">${DB.distLocations.map(l => `
      <div class="stat-mini"><span class="mi tone-teal">${icon('pin', 20)}</span><div><b>${esc(l.name)}</b><span>${esc(l.area)}</span></div></div>`).join('')}</div>`
      : emptyState('pin', 'No distribution locations yet', 'Add locations where food is distributed.')) +
      `<div style="margin-top:16px;display:flex;justify-content:flex-end"><button class="btn btn-primary" id="addLocation">${icon('plus', 15)} Add Location</button></div>`;
  }

  $('#pageContent').innerHTML = `
    <div class="page-head">
      <div><h2>${icon('charity', 27)} Charity Organisations</h2><p class="sub">Work together with charity organisations to help people in need. Charities can rate every meal and partner.</p></div>
      <button class="btn btn-primary" id="regOrg">${icon('plus', 17)} Register Organisation</button>
    </div>
    <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr)">
      <div class="card kpi kpi-clickable" data-nav="charities" data-tab="organisations" title="Click to view organisations"><div class="kpi-top"><span class="kpi-label">Registered Organisations</span><span class="kpi-icon tone-green">${icon('charity', 22)}</span></div><div class="kpi-val">${(DB.charities || []).length}</div><div class="kpi-trend">Partners</div></div>
      <div class="card kpi kpi-clickable" data-nav="charities" data-tab="received" title="Click to view received donations"><div class="kpi-top"><span class="kpi-label">Donations Received</span><span class="kpi-icon tone-purple">${icon('gift', 22)}</span></div><div class="kpi-val">${s.receivedCount}</div><div class="kpi-trend">Completed</div></div>
      <div class="card kpi kpi-clickable" data-nav="charities" data-tab="beneficiaries" title="Click to view beneficiaries"><div class="kpi-top"><span class="kpi-label">People Supported</span><span class="kpi-icon tone-blue">${icon('people', 22)}</span></div><div class="kpi-val">${s.peopleSupported}</div><div class="kpi-trend">Beneficiaries</div></div>
      <div class="card kpi kpi-clickable" data-nav="charities" data-tab="locations" title="Click to view distribution points"><div class="kpi-top"><span class="kpi-label">Meals Distributed</span><span class="kpi-icon tone-teal">${icon('truck', 22)}</span></div><div class="kpi-val">${s.mealsDistributed}</div><div class="kpi-trend">Delivered</div></div>
    </div>
    <div class="tabs">${tabs.map(([id, l]) => `<button class="tab-btn ${charityTab === id ? 'active' : ''}" data-tab="${id}">${l}</button>`).join('')}</div>
    <div class="toolbar" style="margin-bottom:16px"><div class="search-wrap" style="max-width:340px"><span class="ficon" style="position:absolute;left:13px;top:50%;transform:translateY(-50%);color:var(--muted)">${icon('search', 15)}</span><input id="charitySearch" placeholder="Search organisations, food, locations..." value="${esc(searchTerm)}" style="padding-left:38px"/></div></div>
    <div class="card" id="charityBody">${body}</div>
    <div class="card" style="margin-top:16px"><div class="card-head"><h3><span class="ch-ic">${icon('pin', 17)}</span>Nearby Restaurants & Hotels</h3><span class="badge b-info">${esc(charityLocation || 'Set your governorate in Settings')}</span></div>${nearby.length ? `<div class="two-col">${nearby.slice(0, 8).map(p => `<div class="contact-chip"><span class="ci">${icon(p.type === 'Hotel' ? 'hotel' : 'restaurant', 19)}</span><div style="flex:1"><b>${esc(p.name)}</b><span>${p.type} • ${esc(p.location || '')}</span><div style="margin-top:4px">${renderStarsHTML(p.name, p.type.toLowerCase(), { showButton: true })}</div><div style="margin-top:6px">${contactButtons(p.phone)}</div></div></div>`).join('')}</div>` : emptyState('pin', 'No nearby partners yet', 'Set your governorate in Settings. Partners in the same governorate appear here automatically.')}</div>
    <div class="banner" style="margin-top:20px">${icon('leaf', 20)} Charities evaluate every meal to keep quality high across the platform.</div>`;

  $$('#pageContent [data-tab]').forEach(b => b.onclick = () => { charityTab = b.dataset.tab; renderApp(); });

  $('#regOrg').onclick = () => openModal('Register Charity Organisation', `<form novalidate><div class="form-grid">
    ${fldIcon('Organisation Name', 'name', 'building', 'text', 'Enter organisation name', 'required')}
    ${fldIcon('Responsible Person', 'person', 'user', 'text', 'Enter responsible person name', 'required')}
    ${fldIcon('Phone Number', 'phone', 'phone', 'tel', '+20 10 12345678', 'required')}
    ${fldIcon('Email Address', 'email', 'mail', 'email', 'org@example.com', 'required')}
    ${govSelect('Governorate', 'location', true)}
    <div class="field"><label>Type</label><select name="type" required><option value="" disabled selected>Select type</option><option>Food Bank</option><option>Orphanage</option><option>Relief Organisation</option><option>Community Kitchen</option><option>Other</option></select></div>
    <div class="field full" style="grid-column:1/-1"><label>Description</label><textarea name="desc" placeholder="Brief description of the organisation and its mission..."></textarea></div>
  </div></form>`, {
    submitLabel: 'Register Organisation',
    onSubmit: async d => {
      await api('/charities', { method: 'POST', body: d });
      toast('Organisation registered successfully.');
      closeModal();
      renderApp();
    }
  });

  $$('#pageContent [data-status]').forEach(b => b.onclick = async () => {
    const next = b.dataset.next;
    await api('/donations/' + b.dataset.status, { method: 'PATCH', body: { status: next } });
    toast('Donation marked as ' + next + '.');
    renderApp();
  });

  const ar = $('#addRequest'); if (ar) ar.onclick = () => openModal('Request Donation', `<form novalidate><div class="form-grid">
    ${fldIcon('Organisation Name', 'org', 'building', 'text', 'Enter organisation name', 'required')}
    ${selFld('Food Type', 'foodType', FOOD_TYPES, 'Select food type', 'required')}
    ${fldIcon('Quantity Needed', 'quantity', 'meal', 'number', 'Enter quantity', 'required min="1"')}
    ${govSelect('Governorate', 'location', true)}
    ${fldIcon('Date Needed By', 'date', 'calendar', 'date', '', `required value="${todayISO()}"`)}
  </div></form>`, {
    submitLabel: 'Send Request',
    onSubmit: async d => {
      await api('/requests', { method: 'POST', body: d });
      toast('Donation request sent.');
      closeModal();
      renderApp();
    }
  });

  const ab = $('#addBeneficiary'); if (ab) ab.onclick = () => openModal('Add Beneficiaries', `<form novalidate><div class="form-grid">
    ${fldIcon('Group / Area Name', 'name', 'people', 'text', 'e.g. Families in Downtown', 'required')}
    ${fldIcon('Number of People', 'count', 'people', 'number', 'Enter number', 'required min="1"')}
    ${govSelect('Governorate', 'location', true)}
  </div></form>`, {
    submitLabel: 'Add Beneficiaries',
    onSubmit: async d => {
      await api('/beneficiaries', { method: 'POST', body: d });
      toast('Beneficiaries added.');
      closeModal();
      renderApp();
    }
  });

  const al = $('#addLocation'); if (al) al.onclick = () => openModal('Add Distribution Location', `<form novalidate><div class="form-grid">
    ${fldIcon('Location Name', 'name', 'building', 'text', 'e.g. Community Center', 'required')}
    ${fldIcon('Area / Address', 'area', 'pin', 'text', 'Enter area or address', 'required')}
  </div></form>`, {
    submitLabel: 'Add Location',
    onSubmit: async d => {
      await api('/locations', { method: 'POST', body: d });
      toast('Distribution location added.');
      closeModal();
      renderApp();
    }
  });
  const cs = $('#charitySearch'); if (cs) cs.oninput = handleSearchInput;
}

/* ================= PROMOTIONS ================= */
let promoFilter = 'all';
function pagePromotions() {
  const today = todayISO();
  const activeOffers = (DB.offers || []).filter(o => !o.validUntil || o.validUntil >= today);
  const activeAds = (DB.ads || []).filter(a => a.status !== 'expired' && (!a.endDate || a.endDate >= today));
  const allItems = [
    ...activeOffers.map(o => ({ kind: 'offer', id: o.id, title: o.title, business: o.restaurantName || o.hotelName, businessType: o.businessType, location: o.location, description: o.description, discount: o.discount, audience: o.audience, validUntil: o.validUntil, featured: !!o.featured })),
    ...activeAds.map(a => ({ kind: 'ad', id: a.id, title: a.title || a.business, business: a.business, businessType: a.businessType, location: a.governorate || a.location || a.country || 'Egypt', description: a.desc || '', adType: a.adType, featured: !!a.featured, views: a.views || 0, clicks: a.clicks || 0, endDate: a.endDate }))
  ].filter(x => promoFilter === 'all' || x.kind === promoFilter || (promoFilter === 'featured' && x.featured) || (promoFilter === 'restaurant' && (x.businessType === 'Restaurant' || x.kind === 'offer')) || (promoFilter === 'hotel' && x.businessType === 'Hotel'))
   .filter(x => !searchTerm || [x.title, x.business, x.location, x.description, x.audience, x.adType].join(' ').toLowerCase().includes(searchTerm));

  const renderItem = x => `<div class="card" style="position:relative;overflow:hidden">
    ${x.featured ? '<span class="badge b-active" style="position:absolute;top:14px;right:14px">★ Featured</span>' : ''}
    <div style="display:flex;gap:13px;align-items:flex-start;padding-right:${x.featured ? '78px' : '0'}">
      <span class="mi ${x.kind === 'offer' ? 'tone-green' : 'tone-orange'}">${icon(x.kind === 'offer' ? 'gift' : 'megaphone', 22)}</span>
      <div style="flex:1;min-width:0"><div style="font-size:16px;font-weight:800">${esc(x.title)}</div>
      <div style="font-size:12.5px;color:var(--muted);margin:4px 0 6px">${esc(x.business)} • ${esc(x.location)} • ${renderStarsHTML(x.business, (x.businessType || '').toLowerCase(), { showButton: true })}</div>
      <p style="font-size:13px;color:var(--muted);margin:9px 0;line-height:1.55">${esc(x.description || 'Community offer on Zero Hunger.')}</p>
      <div style="display:flex;gap:7px;flex-wrap:wrap">
        ${x.kind === 'offer' ? `<span class="badge b-active">${x.discount}% OFF</span><span class="badge b-info">${esc(x.audience)}</span><span class="badge">Valid until ${fmtDate(x.validUntil)}</span>` : `<span class="badge b-info">${esc(x.adType || 'Advertisement')}</span><span class="badge">👁 ${x.views} views</span><span class="badge">↗ ${x.clicks} interactions</span>`}
      </div></div>
    </div>
    <div style="display:flex;justify-content:flex-end;margin-top:13px"><button class="btn btn-outline btn-sm" data-promo-view="${esc(x.id)}" data-promo-kind="${x.kind}">${icon('eye', 14)} View Details</button></div>
  </div>`;

  $('#pageContent').innerHTML = `<div class="page-head">
    <div><h2>${icon('megaphone', 27)} Ads & Offers</h2><p class="sub">Discover restaurant offers, hotel advertisements and featured community campaigns in one place.</p></div>
    <button class="btn btn-primary" id="createPromo">${icon('plus', 17)} Create Advertisement</button>
  </div>
  <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr)">
    <div class="card kpi kpi-clickable" data-pf="offer" title="View restaurant offers"><div class="kpi-top"><span class="kpi-label">Active Offers</span><span class="kpi-icon tone-green">${icon('gift', 22)}</span></div><div class="kpi-val">${activeOffers.length}</div><div class="kpi-trend">Filter offers</div></div>
    <div class="card kpi kpi-clickable" data-pf="ad" title="View business ads"><div class="kpi-top"><span class="kpi-label">Active Ads</span><span class="kpi-icon tone-orange">${icon('megaphone', 22)}</span></div><div class="kpi-val">${activeAds.length}</div><div class="kpi-trend">Filter ads</div></div>
    <div class="card kpi kpi-clickable" data-pf="featured" title="View featured placements"><div class="kpi-top"><span class="kpi-label">Featured</span><span class="kpi-icon tone-purple">${icon('heart', 22)}</span></div><div class="kpi-val">${allItems.filter(x => x.featured).length}</div><div class="kpi-trend">Filter featured</div></div>
    <div class="card kpi"><div class="kpi-top"><span class="kpi-label">Total Views</span><span class="kpi-icon tone-blue">${icon('eye', 22)}</span></div><div class="kpi-val">${stats().totalAdViews}</div><div class="kpi-trend">Community reach</div></div>
  </div>
  <div class="tabs"><button class="tab-btn ${promoFilter === 'all' ? 'active' : ''}" data-pf="all">All</button><button class="tab-btn ${promoFilter === 'offer' ? 'active' : ''}" data-pf="offer">Restaurant Offers</button><button class="tab-btn ${promoFilter === 'ad' ? 'active' : ''}" data-pf="ad">Business Ads</button><button class="tab-btn ${promoFilter === 'featured' ? 'active' : ''}" data-pf="featured">★ Featured</button></div>
  <div class="card" style="margin-bottom:16px"><div class="card-head"><h3><span class="ch-ic">${icon('search', 17)}</span>Find an offer or advertisement</h3><div class="search-wrap"><input id="promoSearch" placeholder="Search business, offer or location..." value="${esc(searchTerm)}"/></div></div></div>
  <div id="promoGrid" class="two-col">${allItems.length ? allItems.map(renderItem).join('') : emptyState('megaphone', 'No active ads or offers', 'Businesses can publish offers and advertisements here.')}</div>
  <div class="banner" style="margin-top:20px">${icon('leaf', 20)} Businesses can promote their services while supporting affordable food access.</div>`;

  $$('#pageContent [data-pf]').forEach(b => b.onclick = () => { promoFilter = b.dataset.pf; renderApp(); });
  const ps = $('#promoSearch'); if (ps) ps.oninput = handleSearchInput;

  $$('#pageContent [data-promo-view]').forEach(b => b.onclick = async () => {
    const kind = b.dataset.promoKind, id = b.dataset.promoView;
    if (kind === 'offer') {
      const o = (DB.offers || []).find(x => x.id === id); if (!o) return;
      api('/offers/' + id, { method: 'PATCH', body: { view: true } }).catch(() => {});
      o.views = (o.views || 0) + 1;
      openModal(o.title, `<div class="card" style="box-shadow:none;border:0;padding:0"><h3>${esc(o.restaurantName || o.hotelName)}</h3><div style="margin:4px 0 10px">${renderStarsHTML(o.restaurantName || o.hotelName, (o.businessType || '').toLowerCase(), { showButton: true })}</div><p style="color:var(--muted);line-height:1.7">${esc(o.description || 'No description provided.')}</p><div class="two-col" style="margin-top:12px"><div class="contact-chip"><span class="ci">${icon('gift', 19)}</span><div><b>${o.discount}% OFF</b><span>${esc(o.audience)}</span></div></div><div class="contact-chip"><span class="ci">${icon('pin', 19)}</span><div><b>${esc(o.location)}</b><span>Location</span></div></div></div><p style="font-size:12px;color:var(--muted);margin-top:14px">Valid until ${fmtDate(o.validUntil)} • Views: ${o.views}</p></div>`, { submitLabel: 'Close', onSubmit: () => closeModal() });
    } else {
      const a = (DB.ads || []).find(x => x.id === id); if (!a) return;
      api('/ads/' + id, { method: 'PATCH', body: { view: true, click: true } }).catch(() => {});
      a.views = (a.views || 0) + 1; a.clicks = (a.clicks || 0) + 1;
      openModal(a.title || a.business, `<div class="card" style="box-shadow:none;border:0;padding:0"><h3>${esc(a.business)}</h3><p style="color:var(--muted);line-height:1.7">${esc(a.desc || 'No description provided.')}</p><div class="two-col"><div class="contact-chip"><span class="ci">${icon('megaphone', 19)}</span><div><b>${esc(a.adType || 'Advertisement')}</b><span>Ad Type</span></div></div><div class="contact-chip"><span class="ci">${icon('pin', 19)}</span><div><b>${esc(a.governorate || a.location || 'Egypt')}</b><span>Location</span></div></div></div><p style="font-size:12px;color:var(--muted);margin-top:14px">Views: ${a.views} • Interactions: ${a.clicks}</p></div>`, { submitLabel: 'Close', onSubmit: () => closeModal() });
    }
  });

  $('#createPromo').onclick = () => openModal('Create Business Advertisement', `<form novalidate><div class="form-grid">
    ${selFld('Business Type', 'businessType', ['Restaurant', 'Hotel'], 'Select business type', 'required')}
    ${fldIcon('Business Name', 'business', 'building', 'text', 'Enter business name', 'required')}
    ${fldIcon('Advertisement Title', 'title', 'megaphone', 'text', 'e.g. Weekend Special Offer', 'required')}
    ${fldIcon('Discount % (optional)', 'discount', 'gift', 'number', 'e.g. 30', 'min="0" max="100"')}
    ${fldIcon('Phone Number', 'phone', 'phone', 'tel', '+20 10 12345678', 'required')}
    ${selFld('Advertisement Type', 'adType', ['Banner Ad', 'Featured Listing', 'Sponsored Post', 'Community Campaign'], 'Select type', 'required')}
    ${govSelect('Governorate / Location', 'governorate', true)}
    ${fldIcon('Start Date', 'startDate', 'calendar', 'date', '', `required value="${todayISO()}"`)}
    ${fldIcon('End Date', 'endDate', 'calendar', 'date', '', `required`)}
    <div class="field full" style="grid-column:1/-1"><label>Description</label><textarea name="desc" placeholder="Describe your offer, service or community campaign..." required></textarea></div>
    <label class="check-row full" style="grid-column:1/-1"><input type="checkbox" name="featured"/> Request Featured placement</label>
  </div></form>`, {
    wide: true,
    submitLabel: 'Publish Advertisement',
    onSubmit: async d => {
      await api('/ads', { method: 'POST', body: d });
      toast('Advertisement submitted for review.');
      closeModal();
      renderApp();
    }
  });
}

/* ================= AD HERE ================= */
function pageAds() {
  $('#pageContent').innerHTML = `
    <div class="page-head">
      <div><h2>${icon('megaphone', 27)} Ad Here</h2><p class="sub">Support our mission by advertising your business and reaching a wider audience.</p></div>
      <span class="badge b-active" style="padding:8px 16px">${icon('leaf', 14)} Advertising supports the platform</span>
    </div>
    <div class="grid-2" style="grid-template-columns:1.35fr 1fr">
      <div>
        <div class="card" style="margin-bottom:16px">
          <div class="card-head"><h3><span class="ch-ic">${icon('megaphone', 17)}</span>Advertisement Information</h3></div>
          <p style="color:var(--muted);font-size:13px;margin-bottom:16px">Contact details of the person responsible for ads.</p>
          <div class="two-col">
            <div class="contact-chip"><span class="ci">${icon('user', 19)}</span><div><b>Rawda Mohammed Elsaid</b><span>Full Name — Ad Responsible</span></div></div>
            <div class="contact-chip"><span class="ci">${icon('phone', 19)}</span><div><b>+20 10 33718037</b><span>Contact Number</span></div></div>
            <div class="contact-chip"><span class="ci">${icon('pin', 19)}</span><div><b>Kafr El-Sheikh</b><span>Governorate</span></div></div>
            <div class="contact-chip"><span class="ci">${icon('globe', 19)}</span><div><b>Egypt</b><span>Country</span></div></div>
          </div>
        </div>
        <div class="card">
          <div class="card-head"><h3><span class="ch-ic">${icon('doc', 17)}</span>Submit an Advertisement</h3></div>
          <form id="adForm" novalidate><div class="form-grid">
            ${fldIcon('Business Name', 'business', 'building', 'text', 'Enter business name', 'required')}
            ${fldIcon('Owner Name', 'owner', 'user', 'text', 'Enter owner name', 'required')}
            ${fldIcon('Phone Number', 'phone', 'phone', 'tel', '+20 10 12345678', 'required')}
            ${govSelect('Governorate', 'governorate', true)}
            ${fldIcon('Country', 'country', 'globe', 'text', 'e.g. Egypt', 'required value="Egypt"')}
            ${selFld('Business Type', 'businessType', ['Restaurant', 'Hotel'], 'Select business type', 'required')}
            ${selFld('Advertisement Type', 'adType', ['Banner Ad', 'Sidebar Ad', 'Featured Listing', 'Sponsored Post', 'Community Campaign'], 'Select type', 'required')}
            ${fldIcon('Discount % (optional)', 'discount', 'gift', 'number', 'e.g. 30', 'min="0" max="100"')}
            ${fldIcon('Advertisement Duration', 'duration', 'clock', 'text', 'e.g. 1 month / 3 months', 'required')}
            <div class="field"><label>Start Date</label><input name="startDate" type="date" value="${todayISO()}" required/></div>
            <div class="field full" style="grid-column:1/-1"><label>Advertisement Description</label><textarea name="desc" placeholder="Describe your offer or service..." required></textarea></div>
          </div>
          <div style="display:flex;justify-content:flex-end;margin-top:6px">
            <button class="btn btn-primary" type="submit">${icon('send', 15)} Submit Advertisement</button>
          </div></form>
        </div>
      </div>
      <div>
        <div class="side-illu" style="margin-bottom:16px">
          <div class="illu-ic" style="background:linear-gradient(135deg,#0e9488,#0f766e)">${icon('megaphone', 34)}</div>
          <h3>Advertise With Us</h3>
          <p>Spread the word about your business and make a positive social impact in your community.</p>
          <button class="btn btn-primary" id="adGetStarted" style="width:100%">${icon('megaphone', 15)} Get Started</button>
        </div>
        <div class="card">
          <div class="card-head"><h3><span class="ch-ic">${icon('heart', 17)}</span>Why Advertise With Us?</h3></div>
          <div class="adv-cards" style="grid-template-columns:1fr 1fr">
            <div class="adv-card"><span class="ai">${icon('leaf', 22)}</span><p>Increase your brand awareness</p></div>
            <div class="adv-card"><span class="ai" style="background:#e8f0fe;color:#3b6fd4">${icon('people', 22)}</span><p>Reach a wider audience</p></div>
            <div class="adv-card"><span class="ai" style="background:#fde8ec;color:#d43f5b">${icon('heart', 22)}</span><p>Support a noble cause</p></div>
            <div class="adv-card"><span class="ai" style="background:#fdf0e4;color:#d97706">${icon('globe', 22)}</span><p>Be part of a sustainable future</p></div>
          </div>
        </div>
      </div>
    </div>`;

  $('#adForm').addEventListener('submit', async e => {
    e.preventDefault();
    const form = e.target;
    if (!form.reportValidity()) return;
    const data = {}; $$('#adForm [name]').forEach(el => data[el.name] = el.value.trim());
    await api('/ads', { method: 'POST', body: data });
    toast('Advertisement request submitted for admin review.');
    form.reset();
    renderApp();
  });
  $('#adGetStarted').onclick = () => { const f = $('#adForm [name=business]'); if (f) f.focus(); };
}

/* ================= ADMIN ADS ================= */
function pageAdminAds() {
  if (!isAdmin()) { navigate('dashboard'); return; }
  const ads = DB.ads || [];
  $('#pageContent').innerHTML = `
    <div class="page-head"><div><h2>${icon('settings', 27)} Admin — Advertisements</h2>
      <p class="sub">Approve, feature, or remove ads. All changes are stored directly in SQLite.</p></div></div>
    <div class="kpi-grid" style="grid-template-columns:repeat(4,1fr)">
      <div class="card kpi"><div class="kpi-top"><span class="kpi-label">All ads</span><span class="kpi-icon tone-orange">${icon('megaphone', 22)}</span></div><div class="kpi-val">${ads.length}</div></div>
      <div class="card kpi"><div class="kpi-top"><span class="kpi-label">Pending</span><span class="kpi-icon tone-orange">${icon('clock', 22)}</span></div><div class="kpi-val">${ads.filter(a => a.status === 'pending').length}</div></div>
      <div class="card kpi"><div class="kpi-top"><span class="kpi-label">Active</span><span class="kpi-icon tone-green">${icon('check', 22)}</span></div><div class="kpi-val">${ads.filter(a => a.status === 'active').length}</div></div>
      <div class="card kpi"><div class="kpi-top"><span class="kpi-label">Total Views</span><span class="kpi-icon tone-blue">${icon('eye', 22)}</span></div><div class="kpi-val">${ads.reduce((s, a) => s + (a.views || 0), 0)}</div></div>
    </div>
    <div class="card"><div class="table-wrap"><table class="resp"><thead><tr>
      <th>Business</th><th>Title</th><th>Type</th><th>Governorate</th><th>Views</th><th>Clicks</th><th>Status</th><th>Actions</th></tr></thead><tbody>
      ${ads.length ? ads.map(a => `<tr>
        <td data-label="Business"><div class="cell-main">${esc(a.business)}</div><div class="cell-sub">${esc(a.businessType || '')}</div></td>
        <td data-label="Title">${esc(a.title || '—')}</td>
        <td data-label="Type">${esc(a.adType || '—')}</td>
        <td data-label="Governorate">${esc(a.governorate || a.location || '—')}</td>
        <td data-label="Views">${a.views || 0}</td>
        <td data-label="Clicks">${a.clicks || 0}</td>
        <td data-label="Status">${statusBadge(a.status || 'pending')}</td>
        <td data-label="Actions"><div style="display:flex;gap:6px;flex-wrap:wrap">
          <button class="btn btn-primary btn-sm" data-ad="${a.id}" data-act="active">Approve</button>
          <button class="btn btn-outline btn-sm" data-ad="${a.id}" data-act="featured">${a.featured ? 'Unfeature' : 'Feature'}</button>
          <button class="btn btn-outline btn-sm" data-ad="${a.id}" data-act="expired">Expire</button>
          <button class="btn btn-danger-soft btn-sm" data-ad="${a.id}" data-act="delete">Delete</button>
        </div></td></tr>`).join('') : `<tr><td colspan="8">${emptyState('megaphone', 'No ads yet', 'Submitted advertisements appear here for review.')}</td></tr>`}
      </tbody></table></div></div>`;

  $$('#pageContent [data-ad]').forEach(b => b.onclick = async () => {
    const id = b.dataset.ad, act = b.dataset.act;
    if (act === 'delete') {
      await api('/ads/' + id, { method: 'DELETE' });
    } else if (act === 'featured') {
      const ad = ads.find(x => x.id === id);
      await api('/ads/' + id, { method: 'PATCH', body: { featured: !(ad && ad.featured) } });
    } else {
      await api('/ads/' + id, { method: 'PATCH', body: { status: act } });
    }
    renderApp();
  });
}

/* ================= NOTIFICATIONS ================= */
function pageNotifications() {
  (DB.notifications || []).forEach(n => n.read = true);
  saveLocal();
  updateBell();
  api('/notifications/read', { method: 'PATCH' }).catch(() => {});

  $('#pageContent').innerHTML = `
    <div class="page-head">
      <div><h2>${icon('bell', 27)} Notifications</h2><p class="sub">Stay updated with the latest news, donations, ratings and platform activities.</p></div>
      ${(DB.notifications || []).length ? `<button class="btn btn-outline" id="clearNotif">${icon('doc', 14)} Clear All</button>` : ''}
    </div>
    <div class="card">
      ${(DB.notifications || []).length ? DB.notifications.map(n => `
        <div class="notif-item"><span class="notif-ic tone-green">${icon(n.icon || 'bell', 19)}</span>
          <div><b>${esc(n.text)}</b><p>Platform activity</p></div>
          <span class="notif-time">${fmtTimeAgo(n.time)}</span></div>`).join('')
      : `<div class="empty" style="padding:70px 20px"><div class="eic">${icon('bell', 34)}</div><h4>No new notifications</h4><p>When actions happen — new donations, ratings, accepted donations, registrations or ad requests — notifications will appear here.</p></div>`}
    </div>`;

  const c = $('#clearNotif');
  if (c) c.onclick = async () => {
    await api('/notifications', { method: 'DELETE' });
    DB.notifications = [];
    saveLocal();
    updateBell();
    renderApp();
  };
}

/* ================= SETTINGS ================= */
function pageSettings() {
  const t = ACCOUNT_TYPES.find(x => x.id === USER.type) || ACCOUNT_TYPES[3];
  $('#pageContent').innerHTML = `
    <div class="page-head">
      <div><h2>${icon('settings', 27)} Settings</h2><p class="sub">Manage your account information and preferences.</p></div>
    </div>
    <div class="set-grid">
      <div>
        <div class="card profile-hero" style="margin-bottom:16px">
          <div class="big-avatar" id="setAvatar">${esc((USER.name || 'U').charAt(0).toUpperCase())}</div>
          <div><h3 style="font-size:18px">${esc(USER.name)}</h3><p style="color:var(--muted);font-size:13px">${esc(t.label)} • Zero Hunger</p></div>
          <button class="btn btn-outline btn-sm" id="changePic">${icon('eye', 14)} Change Profile Picture</button>
          <input type="file" id="picInput" accept="image/*" style="display:none"/>
        </div>
        <div class="card">
          <div class="card-head"><h3><span class="ch-ic">${icon('settings', 16)}</span>Preferences</h3></div>
          <div class="pref-row"><div><div class="pl">Dark Mode</div><div class="ps">Toggle the dark theme across the platform</div></div>
            <label class="switch"><input type="checkbox" id="prefDark" ${DB.theme === 'dark' ? 'checked' : ''}/><span class="track"></span></label></div>
          <div class="pref-row"><div><div class="pl">Language</div><div class="ps">Choose your preferred language</div></div>
            <select id="prefLang" style="width:130px;padding:8px 12px"><option>English</option><option>العربية</option></select></div>
          <div class="pref-row"><div><div class="pl">Email Notifications</div><div class="ps">Receive updates by email</div></div>
            <label class="switch"><input type="checkbox" id="prefEmail" checked/><span class="track"></span></label></div>
          <div class="pref-row"><div><div class="pl">Push Notifications</div><div class="ps">Receive in-app notifications</div></div>
            <label class="switch"><input type="checkbox" id="prefPush" checked/><span class="track"></span></label></div>
        </div>
      </div>
      <div>
        <div class="card" style="margin-bottom:16px">
          <div class="card-head"><h3><span class="ch-ic">${icon('user', 16)}</span>Profile</h3><p style="font-size:12.5px;color:var(--muted)">Update your personal information and account details in SQLite.</p></div>
          <form id="profileForm" novalidate><div class="form-grid">
            ${fldIcon('Full Name', 'name', 'user', 'text', 'Enter full name', `required value="${esc(USER.name)}"`)}
            ${fldIcon('Phone Number', 'phone', 'phone', 'tel', '+20 10 12345678', `value="${esc(USER.phone || '')}"`)}
            ${fldIcon('Email Address', 'email', 'mail', 'email', 'you@example.com', `value="${esc(USER.email || '')}"`)}
            ${govSelect('Governorate', 'location', true)}
            <div class="field"><label>Account Type</label><select name="type">${ACCOUNT_TYPES.map(x => `<option value="${x.id}" ${x.id === USER.type ? 'selected' : ''}>${x.label}</option>`).join('')}</select></div>
          </div>
          <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px">
            <button class="btn btn-ghost" type="button" id="profileCancel">Cancel</button>
            <button class="btn btn-primary" type="submit">${icon('save', 15)} Save Changes</button>
          </div></form>
        </div>
        <div class="card">
          <div class="card-head"><h3><span class="ch-ic">${icon('lock', 16)}</span>Security</h3><p style="font-size:12.5px;color:var(--muted)">Change your password to keep your account secure.</p></div>
          <form id="pwdForm" novalidate><div class="form-grid" style="grid-template-columns:1fr 1fr">
            ${fldIcon('New Password', 'pwd', 'lock', 'password', 'Enter new password', 'required minlength="6"')}
            ${fldIcon('Confirm Password', 'pwd2', 'lock', 'password', 'Repeat new password', 'required')}
          </div>
          <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:14px">
            <button class="btn btn-ghost" type="button" id="pwdCancel">Cancel</button>
            <button class="btn btn-primary" type="submit">${icon('lock', 14)} Change Password</button>
          </div></form>
        </div>
      </div>
    </div>`;

  $('#prefDark').onchange = e => {
    DB.theme = e.target.checked ? 'dark' : 'light';
    saveLocal();
    applyTheme();
    api('/theme', { method: 'POST', body: { theme: DB.theme } }).catch(() => {});
  };

  const profLoc = $('#profileForm [name=location]');
  if (profLoc && USER.location) {
    [...profLoc.options].forEach(o => { if (normGov(o.value) === normGov(USER.location)) o.selected = true; });
  }

  $('#prefLang').value = localStorage.getItem('zh_lang') || 'English';
  $('#prefLang').onchange = e => changeLanguage(e.target.value);

  $('#profileForm').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target;
    if (!f.reportValidity()) return;
    const g = k => f.querySelector(`[name=${k}]`).value.trim();
    const payload = { name: g('name'), phone: g('phone'), email: g('email'), location: g('location'), type: g('type') };
    await api('/me', { method: 'PATCH', body: payload });
    enterApp();
    toast('Profile permanently updated in database.');
  });

  $('#profileCancel').onclick = () => renderApp();

  $('#pwdForm').addEventListener('submit', async e => {
    e.preventDefault();
    const f = e.target;
    if (!f.reportValidity()) return;
    const p1 = f.querySelector('[name=pwd]').value, p2 = f.querySelector('[name=pwd2]').value;
    if (p1 !== p2) { toast('Passwords do not match.', 'err'); return; }
    await api('/me', { method: 'PATCH', body: { password: p1 } });
    f.reset();
    toast('Password changed successfully in database.');
  });
  $('#pwdCancel').onclick = e => e.target.closest('form').reset();

  const picBtn = $('#changePic'), picInput = $('#picInput');
  picBtn.onclick = () => picInput.click();
  picInput.onchange = () => {
    const file = picInput.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async ev => {
      $('#setAvatar').innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover"/>`;
      $('#tbAvatar').innerHTML = `<img src="${ev.target.result}" style="width:100%;height:100%;object-fit:cover"/>`;
      USER.avatar = ev.target.result;
      await api('/me', { method: 'PATCH', body: { avatar: ev.target.result } }).catch(() => {});
      toast('Profile picture updated in database.');
    };
    reader.readAsDataURL(file);
  };
}

/* ================= GLOBAL CLICK DELEGATION FOR NAVIGATION & RATINGS ================= */
document.addEventListener('click', e => {
  // 1. Rate Button Trigger
  const rateBtn = e.target.closest('.rate-trigger');
  if (rateBtn) {
    e.stopPropagation();
    openRateModal({
      targetType: rateBtn.dataset.rateType || 'partner',
      targetId: rateBtn.dataset.rateId || rateBtn.dataset.rateName,
      targetName: rateBtn.dataset.rateName || rateBtn.dataset.rateId
    });
    return;
  }

  // 2. Clickable KPI Card or Clickable Table Row / Item
  const navEl = e.target.closest('.kpi-clickable, .row-clickable, [data-nav-target]');
  if (navEl) {
    const route = navEl.dataset.nav || navEl.dataset.navTarget;
    const filter = navEl.dataset.filter || navEl.dataset.pf;
    const tab = navEl.dataset.tab;
    if (filter && (route === 'promotions' || !route)) {
      promoFilter = filter;
      navigate('promotions');
      return;
    }
    if (tab && (route === 'charities' || !route)) {
      charityTab = tab;
      navigate('charities');
      return;
    }
    if (route) {
      navigate(route);
    }
  }
});

/* ================= BILINGUAL DICTIONARY ================= */
const LANG_AR = {
  'Zero Hunger — Food Sharing Platform': 'Zero Hunger — منصة مشاركة الطعام',
  'Food Sharing Platform': 'منصة مشاركة الطعام',
  'Together, we can end hunger.': 'معًا يمكننا القضاء على الجوع.',
  'Connect restaurants, hotels, donors and charity organisations through offers, partnerships and food donations to support communities.': 'اربط المطاعم والفنادق والمتبرعين والجمعيات الخيرية من خلال العروض والشراكات والتبرعات الغذائية لدعم المجتمع.',
  'Publish offers or share food through the platform': 'انشر العروض أو شارك الطعام من خلال المنصة',
  'Help charities reach people in need': 'ساعد الجمعيات الخيرية على الوصول إلى المحتاجين',
  'Reduce waste, build a sustainable future': 'قلل الهدر وابنِ مستقبلًا مستدامًا',
  'Welcome back': 'مرحبًا بعودتك',
  'Choose your account type and sign in to continue.': 'اختر نوع حسابك وسجّل الدخول للمتابعة.',
  'Login': 'تسجيل الدخول', 'Register': 'إنشاء حساب', 'Logout': 'تسجيل الخروج',
  'Profile & Settings': 'الملف الشخصي والإعدادات', 'Settings': 'الإعدادات',
  'Dashboard': 'لوحة التحكم', 'Hotels': 'الفنادق', 'Restaurants': 'المطاعم',
  'Charity Organisation': 'الجمعية الخيرية', 'Charity Organisations': 'الجمعيات الخيرية',
  'Donate': 'التبرع', 'AD Here': 'الإعلانات', 'Notifications': 'الإشعارات',
  'Make a Difference!': 'اصنع فرقًا!', 'Share food, reduce waste, help people in need.': 'شارك الطعام، قلل الهدر، وساعد المحتاجين.',
  'User': 'مستخدم', 'Donor': 'متبرع', 'Restaurant': 'مطعم', 'Hotel': 'فندق',
  'Register here': 'سجّل هنا', 'Login here': 'سجّل الدخول هنا', 'Create Account': 'إنشاء حساب',
  'Organisation Name': 'اسم الجمعية', 'Full Name': 'الاسم الكامل', 'Phone Number': 'رقم الهاتف', 'Email Address': 'البريد الإلكتروني',
  'Location': 'الموقع', 'Password': 'كلمة المرور', 'Confirm Password': 'تأكيد كلمة المرور',
  'MAIN MENU': 'القائمة الرئيسية', 'OTHER': 'أخرى',
  'Search donations, restaurants, locations...': 'ابحث عن التبرعات والمطاعم والمواقع...',
  'Search': 'بحث', 'Cancel': 'إلغاء', 'Close': 'إغلاق', 'Submit': 'إرسال', 'Save Changes': 'حفظ التغييرات',
  'Dashboard 1 — Donation Leaders & 5-Star Ratings': 'لوحة التحكم 1 — المتصدرون وتقييمات الـ 5 نجوم',
  'Restaurants + Hotels + Individual Donors': 'المطاعم + الفنادق + المتبرعون الأفراد',
  'Who has the highest number of donations and meals shared.': 'من لديه أكبر عدد من التبرعات والوجبات التي تمت مشاركتها.',
  'Rank': 'الترتيب', 'Contributor & Reviews': 'المساهم والتقييمات', 'Donations': 'التبرعات', 'Meals': 'الوجبات', 'Governorate': 'المحافظة',
  'Donation by Governorate': 'التبرعات حسب المحافظة', '27 Governorates': '27 محافظة', 'All governorates': 'كل المحافظات',
  'Top Governorates': 'أعلى المحافظات',
  'Dashboard 2 — Best Offers (Clickable)': 'لوحة التحكم 2 — أفضل العروض (قابلة للنقر)', 'Highest discount first': 'أعلى خصم أولًا',
  'Offer & Rating': 'العرض والتقييم', 'Discount': 'الخصم', 'Donation Trends': 'اتجاهات التبرعات',
  'Last 6 Months': 'آخر 6 أشهر', 'Last 12 Months': 'آخر 12 شهرًا',
  'Food Type Distribution': 'توزيع أنواع الطعام', 'Recent Donations': 'أحدث التبرعات', 'View All': 'عرض الكل',
  'Pending': 'قيد الانتظار', 'Received': 'تم الاستلام', 'Requested': 'تم الطلب', 'Active': 'نشط', 'Expired': 'منتهي',
  'Total Meals Shared': 'إجمالي الوجبات المشتركة', 'People Helped': 'الأشخاص الذين تمت مساعدتهم',
  'Active Restaurants': 'المطاعم النشطة', 'Active Hotels': 'الفنادق النشطة', 'Total Donations': 'إجمالي التبرعات',
  'Active Offers': 'العروض النشطة', 'All types': 'كل الأنواع', 'Featured Placements': 'الإعلانات المميزة',
  'Ads & Offers': 'الإعلانات والعروض', 'Create Advertisement': 'إنشاء إعلان',
  'Business': 'النشاط', 'Title': 'العنوان', 'Type': 'النوع', 'Views': 'المشاهدات', 'Clicks': 'النقرات',
  'Approve': 'موافقة', 'Unfeature': 'إلغاء التمييز', 'Feature': 'تمييز', 'Expire': 'إنهاء', 'Delete': 'حذف',
  'View Details': 'عرض التفاصيل', 'Valid until': 'صالح حتى', 'interactions': 'تفاعلات', 'views': 'مشاهدات',
  'Food Type': 'نوع الطعام', 'Quantity of Meals': 'عدد الوجبات', 'Expiry Time': 'وقت الانتهاء',
  'Nearby Restaurants & Hotels': 'أقرب المطاعم والفنادق', 'Preferences': 'التفضيلات',
  'Dark Mode': 'الوضع الداكن', 'Language': 'اللغة', 'English': 'الإنجليزية', 'Arabic': 'العربية', 'العربية': 'العربية',
  'Security': 'الأمان', 'Change Password': 'تغيير كلمة المرور',
  '⭐ 5-Star Rating System': '⭐ نظام التقييم 5 نجوم',
  '⭐ Rate': '⭐ تقييم', '⭐ Rate 5 Stars': '⭐ تقييم 5 نجوم',
  'Together we can end hunger — Less food waste • More food for those in need • A sustainable future': 'معًا يمكننا القضاء على الجوع — هدر أقل للطعام • طعام أكثر للمحتاجين • مستقبل مستدام'
};

function applyLanguage() {
  const ar = (localStorage.getItem('zh_lang') || 'English') === 'العربية';
  document.documentElement.lang = ar ? 'ar' : 'en';
  document.documentElement.dir = ar ? 'rtl' : 'ltr';
  document.body.classList.toggle('rtl', ar);
  document.title = ar ? 'Zero Hunger — منصة مشاركة الطعام' : 'Zero Hunger — Food Sharing Platform';

  const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
  const nodes = [];
  while (walker.nextNode()) nodes.push(walker.currentNode);

  nodes.forEach(node => {
    const parent = node.parentElement;
    if (!parent || ['SCRIPT', 'STYLE'].includes(parent.tagName)) return;
    if (node.nodeValue.trim() === '') return;
    if (!node.dataset.en) node.dataset.en = node.nodeValue;
    const original = node.dataset.en.trim();
    if (ar && LANG_AR[original]) {
      node.nodeValue = node.nodeValue.replace(original, LANG_AR[original]);
    } else if (!ar) {
      node.nodeValue = node.dataset.en;
    }
  });

  $$('[placeholder]').forEach(el => {
    if (!el.dataset.enPlaceholder) el.dataset.enPlaceholder = el.getAttribute('placeholder') || '';
    const v = el.dataset.enPlaceholder;
    el.setAttribute('placeholder', ar ? (LANG_AR[v] || v) : v);
  });
  $$('[aria-label]').forEach(el => {
    if (!el.dataset.enAria) el.dataset.enAria = el.getAttribute('aria-label') || '';
    const v = el.dataset.enAria;
    el.setAttribute('aria-label', ar ? (LANG_AR[v] || v) : v);
  });
  const gs = $('#globalSearch');
  if (gs) gs.placeholder = ar ? 'ابحث عن التبرعات والمطاعم والمواقع...' : 'Search donations, restaurants, locations...';
  const pref = $('#prefLang');
  if (pref) pref.value = ar ? 'العربية' : 'English';
}

function changeLanguage(value) {
  localStorage.setItem('zh_lang', value);
  if (USER) { renderTypeGrid(); renderAuthFields(); renderApp(); }
  else { renderTypeGrid(); renderAuthFields(); }
  applyLanguage();
}

function restoreAvatar() {
  if (USER && USER.avatar) {
    const el = $('#tbAvatar');
    if (el) el.innerHTML = `<img src="${USER.avatar}" style="width:100%;height:100%;object-fit:cover"/>`;
  }
}

/* ---------- App Initialization ---------- */
document.addEventListener('DOMContentLoaded', async () => {
  applyTheme();
  renderTypeGrid();
  renderAuthFields();
  applyLanguage();

  if (TOKEN) {
    try {
      const res = await api('/bootstrap');
      if (res.user) {
        USER = res.user;
        enterApp();
        return;
      }
    } catch (e) {
      console.warn('Bootstrap session validation error:', e);
    }
  }

  if (USER && TOKEN) {
    enterApp();
  }
});
