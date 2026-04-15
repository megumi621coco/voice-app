// ============================================================
// 声の架け橋 — app.js
// ============================================================

// ---- フレーズデータ ----
const PHRASES = {
  greeting: [
    'おはようございます',
    'こんにちは',
    'こんばんは',
    'おやすみなさい',
    'ありがとうございます',
    'ごめんなさい',
    'はい',
    'いいえ',
    'ちょっと待ってください',
    'わかりました',
    'また後でお願いします',
    'よろしくお願いします',
  ],
  body: [
    '痛いです',
    'とても痛いです',
    '苦しいです',
    'しんどいです',
    'かゆいです',
    '寒いです',
    '暑いです',
    '気持ち悪いです',
    '頭が痛いです',
    'お腹が痛いです',
    '大丈夫です',
    '横になりたいです',
    '休みたいです',
    'めまいがします',
  ],
  feelings: [
    '嬉しいです',
    '悲しいです',
    '不安です',
    '怖いです',
    '落ち着きました',
    '寂しいです',
    '感謝しています',
    '退屈です',
    '眠いです',
    '疲れました',
    '元気です',
    'イライラします',
  ],
  food: [
    'お腹が空きました',
    'お腹がいっぱいです',
    '水が飲みたいです',
    'お茶が飲みたいです',
    'おいしいです',
    'もう少し食べます',
    'ごちそうさまでした',
    '温め直してください',
    '冷たいものが欲しいです',
    '甘いものが食べたいです',
    '薄味にしてください',
    '箸を持ってきてください',
  ],
  requests: [
    '助けてください',
    '呼んでください',
    'トイレに行きたいです',
    '窓を開けてください',
    '窓を閉めてください',
    '電気をつけてください',
    '電気を消してください',
    'テレビをつけてください',
    '音量を上げてください',
    '音量を下げてください',
    '毛布を持ってきてください',
    'もう一度言ってください',
  ],
};

// ---- 設定 ----
let settings = {
  rate: 0.85,
  volume: 1.0,
  voiceMode: 'tts', // 'tts' | 'mp3'
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
    // 日本語男性声を優先（端末依存）
    selectedVoice =
      voices.find(v => v.lang === 'ja-JP' && /男|otoko|male/i.test(v.name)) ||
      voices.find(v => v.lang === 'ja-JP') ||
      voices.find(v => v.lang.startsWith('ja')) ||
      null;
  }
  pick();
  window.speechSynthesis.onvoiceschanged = pick;
}

function speakTTS(text) {
  window.speechSynthesis.cancel();
  const utt = new SpeechSynthesisUtterance(text.trim());
  utt.lang = 'ja-JP';
  utt.rate = settings.rate;
  utt.volume = settings.volume;
  utt.pitch = 0.88; // やや低め（男性的に）
  if (selectedVoice) utt.voice = selectedVoice;
  window.speechSynthesis.speak(utt);
}

function speakMP3(text) {
  // MP3ファイルが用意されている場合のフォールバック
  // audio/ フォルダ配下のファイル名はフレーズのハッシュ or 番号
  // 現時点ではフォールバックとして TTS を使用
  speakTTS(text);
}

function speakText(text) {
  if (!text || !text.trim()) return;
  const t = text.trim();

  if (settings.voiceMode === 'mp3') {
    speakMP3(t);
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
let currentCategory = 'greeting';

function renderPhrases(category) {
  const grid = document.getElementById('phraseGrid');
  grid.innerHTML = '';

  (PHRASES[category] || []).forEach(phrase => {
    const btn = document.createElement('button');
    btn.className = 'phrase-btn';
    btn.dataset.cat = category;
    btn.textContent = phrase;
    btn.addEventListener('click', () => {
      btn.classList.remove('speaking');
      // reflow で再アニメ
      void btn.offsetWidth;
      btn.classList.add('speaking');
      speakText(phrase);
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
