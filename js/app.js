// ============================================================
// おしゃべりお父さん — app.js
// ============================================================

// ---- フレーズデータ ----
const PHRASES = {
  okasan: [
    'お母さん、おはよう',
    'お母さん、おやすみ',
    'お母さん、ありがとう',
    'お母さん、ごめんね',
    'お母さん、了解',
    'お母さん、散歩行く？',
    'お母さん、電話だよ',
    'お母さん、今日ごみの日だよ',
    'お母さん、買い物行こう',
    'お母さん、今日の予定は？',
    'お母さん、カーブス行く？',
    'お母さん、帰りは何時くらい？',
  ],
  cocoa: [
    'ココちゃん、おはよう',
    'ココちゃん、おやすみ',
    'ココちゃん、かわいいね',
    'ココちゃん、お父さんだよ',
    'ココちゃん、ご飯だよ',
    'ココちゃん、ハミガキガムあげるね',
    'ココちゃん、おやつだよ',
    'ココちゃん、待て！',
    'ココちゃん、伏せ！',
    'ココちゃん、おすわり',
    'ココちゃん、散歩に行くよ',
    'ココちゃん、おりこうさん',
  ],
  souchan: [
    'そうちゃん、おはよう',
    'そうちゃん、おやすみ',
    'そうちゃん、かわいいね',
    'そうちゃん、じいじだよ',
    'そうちゃん、ご飯だよ',
    'そうちゃん、ハミガキだよ',
    'そうちゃん、おやつだよ',
    'そうちゃん、いってらっしゃい',
    'そうちゃん、いいよ！',
    'じいじは、そうちゃん、大好きだよ',
    'そうちゃん、散歩行くよ',
    'そうちゃん、癇癪のもち、持ってない？',
  ],
  honochan: [
    'ほのちゃん、おはよう',
    'ほのちゃん、おやすみ',
    'ほのちゃん、かわいいね',
    'ほのちゃん、じいじだよ',
    'ほのちゃん、ご飯だよ',
    'ほのちゃん、ハミガキだよ',
    'ほのちゃん、おやつだよ',
    'ほのちゃん、いってらっしゃい',
    'ほのちゃん、いいよ！',
    'じいじは、ほのちゃん、大好きだよ',
    'ほのちゃん、散歩行くよ',
    'ほのちゃん、こっちおいで',
  ],
  meguchan: [
    'めぐちゃん、おはよう',
    'めぐちゃん、おやすみ',
    'めぐちゃん、ほのちゃん起きたよ',
    'めぐちゃん、お風呂何時に入る？',
    'めぐちゃん、髪切って',
    'めぐちゃん、夕飯何食べたい？',
    'めぐちゃん、昼ごはん何食べたい？',
    'めぐちゃん、散歩行ってくるね',
    'めぐちゃん、買い物行ってくるね',
    'めぐちゃん、今日の予定は？',
    'めぐちゃん、いってらっしゃい',
    'めぐちゃん、パン、いる？',
  ],
  ryokun: [
    'りょうくん、おはよう',
    'りょうくん、おやすみ',
    'りょうくん、髪切って',
    'りょうくん、いってらっしゃい',
    'りょうくん、パン、いる？',
    'りょうくん、車のタイヤ変えた？',
    'りょうくん、おいしいものあるけど、いる？',
    'りょうくん、仕事はどう？',
    'りょうくん、ココちゃんにおやつあげてね',
    'りょうくん、気を付けて運転してね',
    'りょうくん、また待ってるね',
    'りょうくん、仕事がんばってね',
  ],
  driving: [
    'まっすぐ進んで',
    'ここを右に曲がって',
    '次を右に曲がって',
    '次の次を右に曲がって',
    'ここを左に曲がって',
    '次を左に曲がって',
    '次の次を左に曲がって',
    '違う道がいいと思うよ',
    '右車線に入って',
    '左車線に入って',
    '右側に空きがある',
    '左側に空きがある',
  ],
};

// ---- 設定 ----
let settings = {
  rate: 0.85,
  volume: 1.0,
  voiceMode: 'tts', // 'tts' | 'mp3'
  voiceName: '',    // 選択した声の名前（空=自動）
};

function loadSettings() {
  try {
    const saved = localStorage.getItem('koeSettings');
    if (saved) Object.assign(settings, JSON.parse(saved));
  } catch (_) {}
}

function saveSettings() {
  try {
    localStorage.setItem('koeSettings', JSON.stringify(settings));
  } catch (_) {}
}

// ---- 音声（TTS）----
let voices = [];
let selectedVoice = null;
let lastSpokenText = '';
let indicatorTimer = null;

function initVoices() {
  function pick() {
    voices = window.speechSynthesis.getVoices();
    if (!voices.length) return;
    applyVoiceSetting();
    populateVoiceSelect();
  }
  pick();
  window.speechSynthesis.onvoiceschanged = pick;
}

function applyVoiceSetting() {
  if (settings.voiceName) {
    selectedVoice = voices.find(v => v.name === settings.voiceName) || null;
  }
  if (!selectedVoice) {
    selectedVoice =
      voices.find(v => /otoya/i.test(v.name)) ||
      voices.find(v => v.lang === 'ja-JP' && /male|SMTm|otoko|男/i.test(v.name)) ||
      voices.find(v => /ja.*male|male.*ja/i.test(v.name)) ||
      voices.find(v => v.lang === 'ja-JP') ||
      voices.find(v => v.lang.startsWith('ja')) ||
      null;
  }
}

function populateVoiceSelect() {
  const sel = document.getElementById('voiceSelect');
  if (!sel) return;
  const jaVoices = voices.filter(v => v.lang.startsWith('ja'));
  if (!jaVoices.length) return;
  sel.innerHTML = '';
  jaVoices.forEach(v => {
    const opt = document.createElement('option');
    opt.value = v.name;
    opt.textContent = v.name;
    if (selectedVoice && v.name === selectedVoice.name) opt.selected = true;
    sel.appendChild(opt);
  });
}

function speakTTS(text) {
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text.trim());
  utt.lang = 'ja-JP';
  utt.rate = settings.rate;
  utt.volume = settings.volume;
  utt.pitch = 0.82;
  if (selectedVoice) utt.voice = selectedVoice;
  window.speechSynthesis.speak(utt);
}

let currentAudio = null;

function speakMP3(category, index) {
  const num = String(index + 1).padStart(2, '0');
  const path = `audio/${category}_${num}.mp3`;

  if (currentAudio) {
    currentAudio.pause();
    currentAudio = null;
  }

  const audio = new Audio(path);
  audio.volume = settings.volume;
  currentAudio = audio;

  audio.play().catch(() => {
    // MP3がない場合はTTSにフォールバック
    const text = PHRASES[category][index];
    if (text) speakTTS(text);
  });
}

function speakText(text, category, index) {
  if (!text || !text.trim()) return;
  const t = text.trim();

  if (category && index !== undefined) {
    speakMP3(category, index);
  } else {
    speakTTS(t);
  }

  lastSpokenText = t;
  updateLastSpoken(t);
  showIndicator(t);
}

// ---- インジケーター ----
function showIndicator(text) {
  const el = document.getElementById('speakingIndicator');
  const textEl = document.getElementById('speakingText');
  if (!el) return;
  textEl.textContent = text;
  el.removeAttribute('aria-hidden');
  el.classList.add('visible');
  clearTimeout(indicatorTimer);
  indicatorTimer = setTimeout(() => {
    el.classList.remove('visible');
    el.setAttribute('aria-hidden', 'true');
  }, 2200);
}

// ---- 最後に話した言葉 ----
function updateLastSpoken(text) {
  const el = document.getElementById('lastText');
  if (el) el.textContent = text;
}

// ---- フレーズグリッド描画 ----
let currentCategory = 'okasan';

function renderPhrases(category) {
  const grid = document.getElementById('phraseGrid');
  grid.innerHTML = '';

  (PHRASES[category] || []).forEach((phrase, index) => {
    const btn = document.createElement('button');
    btn.className = 'phrase-btn';
    btn.dataset.cat = category;
    const idx = phrase.indexOf('、');
    if (idx !== -1) {
      const name = phrase.substring(0, idx);
      const rest = phrase.substring(idx + 1);
      btn.innerHTML = `<span class="btn-name">${name}</span><span class="btn-phrase">${rest}</span>`;
    } else {
      btn.textContent = phrase;
    }
    btn.addEventListener('click', () => {
      btn.classList.remove('speaking');
      void btn.offsetWidth;
      btn.classList.add('speaking');
      speakText(phrase, category, index);
    });
    grid.appendChild(btn);
  });
}

function switchCategory(category) {
  currentCategory = category;
  document.querySelectorAll('.cat-btn').forEach(btn => {
    const active = btn.dataset.category === category;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', String(active));
  });
  renderPhrases(category);
  document.getElementById('phraseGrid').scrollTop = 0;
}

// ---- 設定UI ----
function openSettings() {
  const modal = document.getElementById('settingsModal');
  modal.hidden = false;
  document.getElementById('rateSlider').value = settings.rate;
  document.getElementById('volumeSlider').value = settings.volume;
  document.querySelectorAll('input[name="voiceMode"]').forEach(r => {
    r.checked = r.value === settings.voiceMode;
  });
  updateRateLabel(settings.rate);
  populateVoiceSelect();
}

function closeSettings() {
  applySettings();
  document.getElementById('settingsModal').hidden = true;
}

function applySettings() {
  settings.rate = parseFloat(document.getElementById('rateSlider').value);
  settings.volume = parseFloat(document.getElementById('volumeSlider').value);
  const modeEl = document.querySelector('input[name="voiceMode"]:checked');
  if (modeEl) settings.voiceMode = modeEl.value;
  const voiceSel = document.getElementById('voiceSelect');
  if (voiceSel && voiceSel.value) {
    settings.voiceName = voiceSel.value;
    selectedVoice = voices.find(v => v.name === voiceSel.value) || null;
  }
  saveSettings();
}

function updateRateLabel(val) {
  const el = document.getElementById('rateValue');
  if (!el) return;
  const v = parseFloat(val);
  if (v <= 0.6)       el.textContent = 'とても遅め';
  else if (v <= 0.8)  el.textContent = '遅め';
  else if (v <= 0.95) el.textContent = '標準より少し遅め';
  else if (v <= 1.05) el.textContent = '標準';
  else if (v <= 1.2)  el.textContent = '少し速め';
  else                el.textContent = '速め';
}

// ---- Service Worker 登録 ----
function registerSW() {
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('./sw.js').catch(() => {});
  }
}

// ---- 初期化 ----
function init() {
  loadSettings();
  initVoices();
  renderPhrases(currentCategory);
  registerSW();

  // カテゴリ切り替え
  document.getElementById('categoryNav').addEventListener('click', e => {
    const btn = e.target.closest('.cat-btn');
    if (btn) switchCategory(btn.dataset.category);
  });

  // 最後に話した言葉をもう一度
  document.getElementById('lastText').addEventListener('click', () => {
    if (lastSpokenText) speakText(lastSpokenText);
  });

  // 自由入力「話す」ボタン
  document.getElementById('speakBtn').addEventListener('click', () => {
    const text = document.getElementById('customText').value;
    if (text.trim()) speakText(text);
  });

  // Enterキー（Shift+Enter は改行）
  document.getElementById('customText').addEventListener('keydown', e => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (e.target.value.trim()) speakText(e.target.value);
    }
  });

  // 設定ボタン
  document.getElementById('settingsBtn').addEventListener('click', openSettings);
  document.getElementById('closeSettings').addEventListener('click', closeSettings);
  document.getElementById('settingsModal').addEventListener('click', e => {
    if (e.target === e.currentTarget) closeSettings();
  });

  // スライダーのリアルタイム反映
  document.getElementById('rateSlider').addEventListener('input', e => {
    settings.rate = parseFloat(e.target.value);
    updateRateLabel(e.target.value);
  });
  document.getElementById('volumeSlider').addEventListener('input', e => {
    settings.volume = parseFloat(e.target.value);
  });
}

document.addEventListener('DOMContentLoaded', init);
