let words = [];
let current = 0;
let correctCount = 0;
let wrongCount = 0;
let streak = 0;
let todayCount = 0;
let answered = false;

const $ = id => document.getElementById(id);

function show(screenId) {
  document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
  $(screenId).classList.add('active');
}

function normalize(str) {
  return str.normalize('NFC').trim();
}

function loadWord() {
  const w = words[current];
  answered = false;

  $('arabic-input').value = '';
  $('arabic-input').className = 'arabic-input';
  $('feedback-correct').classList.remove('visible');
  $('btn-next').disabled = true;

  $('word-progress').textContent = `${current + 1} / ${words.length} 단어`;
  $('card-category').textContent = w.category;
  $('card-num').textContent = String(current + 1).padStart(2, '0');
  $('arabic-word').textContent = w.arabic;
  $('transliteration').textContent = w.transliteration;
  $('pronunciation-ko').textContent = w.pronunciation_ko || '';
  $('meaning-ko').textContent = w.meaning_ko;
  $('hint-text').textContent = `힌트: ${w.hint_len}글자, ${w.hint_start}으로 시작해요`;

  const pct = Math.round((current / words.length) * 100);
  $('progress-bar').style.width = pct + '%';
  $('pct-label').textContent = pct + '% 완료';
  $('score-label').textContent = `정답 ${correctCount} / 오답 ${wrongCount}`;

  $('streak-badge').textContent = `⚡ ${streak}연속`;
  $('arabic-input').focus();
}

function checkAnswer() {
  if (answered) return;
  const w = words[current];
  const input = $('arabic-input').value;
  if (!input.trim()) return;

  answered = true;
  todayCount++;

  if (normalize(input) === normalize(w.arabic)) {
    correctCount++;
    streak++;
    $('arabic-input').classList.add('correct');
    $('feedback-correct').classList.add('visible');
    $('feedback-word').textContent = w.arabic;
    $('btn-next').disabled = false;
    setTimeout(() => nextWord(), 1600);
  } else {
    wrongCount++;
    streak = 0;
    showWrongScreen(input, w);
  }

  updateHomeStats();
}

function showWrongScreen(myInput, w) {
  $('wrong-category').textContent = w.category;
  $('wrong-arabic').textContent = w.arabic;
  $('wrong-trans').textContent = w.transliteration;
  $('wrong-pronunciation-ko').textContent = w.pronunciation_ko || '';
  $('wrong-meaning').textContent = w.meaning_ko;
  $('my-answer').textContent = myInput;
  $('correct-answer').textContent = w.arabic;
  $('streak-badge-wrong').textContent = `⚡ ${streak}연속`;
  $('compare-note').textContent = `ⓘ 이런 부분이 달랐어요\n입력값과 정답의 모음 부호나 장단음이 다를 수 있어요.`;
  show('screen-wrong');
}

function nextWord() {
  current++;
  if (current >= words.length) {
    showComplete();
  } else {
    show('screen-practice');
    loadWord();
  }
}

function showComplete() {
  $('c-total').textContent = words.length;
  $('c-correct').textContent = correctCount;
  $('c-rate').textContent = Math.round((correctCount / words.length) * 100) + '%';
  show('screen-complete');
  updateHomeStats();
}

function updateHomeStats() {
  $('stat-today').textContent = todayCount;
  $('stat-streak').textContent = streak;
  const rate = (correctCount + wrongCount) > 0
    ? Math.round((correctCount / (correctCount + wrongCount)) * 100)
    : 0;
  $('stat-bar').style.width = rate + '%';
}

// ── 이벤트 바인딩 ──

$('btn-start').addEventListener('click', () => {
  current = 0; correctCount = 0; wrongCount = 0; streak = 0;
  show('screen-practice');
  loadWord();
});

$('arabic-input').addEventListener('keydown', e => {
  if (e.key === 'Enter') checkAnswer();
});

// 모바일: 가상 키보드 올라올 때 입력창이 가려지지 않도록 스크롤
$('arabic-input').addEventListener('focus', () => {
  setTimeout(() => {
    $('arabic-input').scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, 350);
});

$('arabic-input').addEventListener('input', () => {
  if (!answered && $('arabic-input').value.trim()) {
    $('arabic-input').classList.remove('wrong-input');
  }
});

$('btn-next').addEventListener('click', nextWord);

$('btn-skip').addEventListener('click', () => {
  if (!answered) {
    wrongCount++;
    streak = 0;
    updateHomeStats();
    nextWord();
  }
});

$('btn-back').addEventListener('click', () => show('screen-home'));

$('btn-retry').addEventListener('click', () => {
  show('screen-practice');
  $('arabic-input').value = '';
  $('arabic-input').className = 'arabic-input';
  $('feedback-correct').classList.remove('visible');
  $('btn-next').disabled = true;
  answered = false;
  $('arabic-input').focus();
});

$('btn-next-wrong').addEventListener('click', nextWord);
$('btn-back-wrong').addEventListener('click', () => show('screen-home'));
$('btn-home').addEventListener('click', () => show('screen-home'));

// ── TIP SHEET ──
const tipKeyboard = [
  [
    {ar:'ض',ko:'다드',cat:'emph'},{ar:'ص',ko:'싸드',cat:'emph'},{ar:'ث',ko:'싸',cat:'basic'},
    {ar:'ق',ko:'카프',cat:'basic'},{ar:'ف',ko:'파',cat:'basic'},{ar:'غ',ko:'가인',cat:'basic'},
    {ar:'ع',ko:'아인',cat:'basic'},{ar:'ه',ko:'하',cat:'basic'},{ar:'خ',ko:'하',cat:'basic'},
    {ar:'ح',ko:'하',cat:'basic'},{ar:'ج',ko:'짐',cat:'basic'},{ar:'د',ko:'달',cat:'basic'},
  ],
  [
    {ar:'ش',ko:'쉰',cat:'basic'},{ar:'س',ko:'신',cat:'basic'},{ar:'ي',ko:'야',cat:'long'},
    {ar:'ب',ko:'바',cat:'basic'},{ar:'ل',ko:'람',cat:'basic'},{ar:'ا',ko:'알리프',cat:'long'},
    {ar:'ت',ko:'타',cat:'basic'},{ar:'ن',ko:'눈',cat:'basic'},{ar:'م',ko:'밈',cat:'basic'},
    {ar:'ك',ko:'카프',cat:'basic'},{ar:'ط',ko:'타',cat:'emph'},
  ],
  [
    {ar:'ئ',ko:'야함자',cat:'special'},{ar:'ء',ko:'함자',cat:'special'},{ar:'ؤ',ko:'와우함자',cat:'special'},
    {ar:'ر',ko:'라',cat:'basic'},{ar:'ى',ko:'알막수라',cat:'long'},{ar:'ة',ko:'타마르부타',cat:'special'},
    {ar:'و',ko:'와우',cat:'long'},{ar:'ز',ko:'자이',cat:'basic'},{ar:'ظ',ko:'자',cat:'emph'},
  ],
];

const tipHarakat = [
  { ar:'بَ', ko:'파타', sub:'단모음 a', color:'orange' },
  { ar:'بِ', ko:'카스라', sub:'단모음 i', color:'orange' },
  { ar:'بُ', ko:'담마', sub:'단모음 u', color:'orange' },
  { ar:'بْ', ko:'수쿤', sub:'받침/묵음', color:'blue', selected:true },
  { ar:'بّ', ko:'샷다', sub:'겹자음', color:'purple' },
  { ar:'بً', ko:'탄윈파타', sub:'~an', color:'gray' },
  { ar:'بٌ', ko:'탄윈담마', sub:'~un', color:'gray' },
  { ar:'بٍ', ko:'탄윈카스라', sub:'~in', color:'gray' },
  { ar:'ـ', ko:'타트윌', sub:'늘임표', color:'gray' },
];

function buildTipSheet() {
  tipKeyboard.forEach((row, i) => {
    const el = document.getElementById(`tip-row${i + 1}`);
    if (!el) return;
    row.forEach(k => {
      const div = document.createElement('div');
      div.className = `tip-key cat-${k.cat}`;
      div.innerHTML = `<span class="tk-ar">${k.ar}</span><span class="tk-ko">${k.ko}</span>`;
      el.appendChild(div);
    });
    if (i === 2) {
      const del = document.createElement('div');
      del.className = 'tip-key-del';
      del.textContent = '⌫';
      el.appendChild(del);
    }
  });

  const hg = document.getElementById('tip-harakat');
  if (!hg) return;
  tipHarakat.forEach(h => {
    const btn = document.createElement('div');
    btn.className = `tip-h-key ${h.color}${h.selected ? ' selected' : ''}`;
    btn.innerHTML = `<span class="thk-ar">${h.ar}</span><span class="thk-ko">${h.ko}</span><span class="thk-sub">${h.sub}</span>`;
    hg.appendChild(btn);
  });
}

function openTip() {
  document.getElementById('tip-overlay').classList.add('open');
  document.getElementById('tip-sheet').classList.add('open');
}
function closeTip() {
  document.getElementById('tip-overlay').classList.remove('open');
  document.getElementById('tip-sheet').classList.remove('open');
}

$('btn-tip').addEventListener('click', openTip);
buildTipSheet();

// ── 단어 로드 ──
fetch('words.json')
  .then(r => r.json())
  .then(data => { words = data; })
  .catch(() => {
    words = [
      { id:'b001', arabic:'مَرْحَبًا', transliteration:'mar·ha·ban', meaning_ko:'안녕하세요', category:'기초 단어', hint_len:7, hint_start:'م' },
      { id:'b002', arabic:'شُكْرًا', transliteration:'shuk·ran', meaning_ko:'감사합니다', category:'기초 단어', hint_len:6, hint_start:'ش' },
      { id:'b003', arabic:'نَعَم', transliteration:'na·am', meaning_ko:'네', category:'기초 단어', hint_len:4, hint_start:'ن' },
      { id:'b004', arabic:'لَا', transliteration:'laa', meaning_ko:'아니요', category:'기초 단어', hint_len:2, hint_start:'ل' },
      { id:'b005', arabic:'مَاء', transliteration:"maa'", meaning_ko:'물', category:'기초 단어', hint_len:3, hint_start:'م' },
    ];
  });
