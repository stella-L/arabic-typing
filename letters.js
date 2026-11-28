// 아랍어 단어를 글자 단위로 나눠 한글 발음과 묵음·장모음 이유를 붙인다.
(function () {
  const FATHA = 'َ', DAMMA = 'ُ', KASRA = 'ِ';
  const FATHATAN = 'ً', DAMMATAN = 'ٌ', KASRATAN = 'ٍ';
  const SHADDA = 'ّ', SUKUN = 'ْ', DAGGER = 'ٰ';

  const CHO = 'ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ';
  const CONSONANT = {
    'ب':'ㅂ','ت':'ㅌ','ث':'ㅆ','ج':'ㅈ','ح':'ㅎ','خ':'ㅋ','د':'ㄷ','ذ':'ㄷ','ر':'ㄹ','ز':'ㅈ',
    'س':'ㅅ','ش':'ㅅ','ص':'ㅅ','ض':'ㄷ','ط':'ㅌ','ظ':'ㄷ','ع':'ㅇ','غ':'ㄱ','ف':'ㅍ','ق':'ㅋ',
    'ك':'ㅋ','ل':'ㄹ','م':'ㅁ','ن':'ㄴ','ه':'ㅎ','و':'ㅇ','ي':'ㅇ','ة':'ㅌ',
    'ء':'ㅇ','أ':'ㅇ','إ':'ㅇ','ؤ':'ㅇ','ئ':'ㅇ'
  };
  const JUNG = { a:0, ya:2, wa:9, u:13, wi:16, yu:17, eu:18, i:20 };
  const SUN = 'تثدذرزسشصضطظلن';
  const HAMZA = 'ءأإؤئ';

  const REASONS = {
    sun: {
      title: '태양 문자 — ل이 소리 안 나요',
      body: '정관사 اَلْ (알) 뒤에 "태양 문자"가 오면 ل (ㄹ)이 뒤 자음에 녹아서 사라져요. 대신 뒤 자음에 샷다 표시가 붙어 두 번 세게 읽어요. 태양 문자: ت ث د ذ ر ز س ش ص ض ط ظ ل ن',
      ex: 'اَلرَّسْمُ → 앗라스무 (알라스무 ✗)'
    },
    wasl: {
      title: '연결 알리프 — ا가 소리 안 나요',
      body: 'اَلْ 이나 اِسْ… 처럼 단어 앞에 붙는 ا는 앞 소리에 이어 읽을 때 사라져요. 앞 모음이 바로 다음 자음으로 넘어가요. 문장 맨 처음일 때만 "아/이"로 소리 나요.',
      ex: 'عَصِيرُ الْبُرْتُقَالِ → 아시룰 부르투칼 (아시루 알부르투칼 ✗)'
    },
    tanwin_alif: {
      title: '탄윈 받침 ا — 소리 안 나요',
      body: '단어 끝에 "-안" 소리가 붙을 때 ا를 받침대처럼 같이 써요. ا 자체는 소리가 없고, 앞 글자가 "-안"으로 읽혀요.',
      ex: 'شُكْرًا → 슈크란'
    },
    ta_marbuta: {
      title: '타 마르부타 ة — ㅌ 소리가 안 나요',
      body: 'ة 위에 모음 표시가 없으면(말을 끝낼 때) ㅌ 소리 없이 앞의 "아"로 끝나요. 모음이 붙으면(ةٌ, ةُ) "툰/투"처럼 ㅌ이 살아나요.',
      ex: 'قَهْوَة → 카흐와 / قَهْوَةٌ → 카흐와툰'
    },
    long_a: {
      title: '장모음 ا — 앞 소리를 길게',
      body: 'ا는 따로 소리를 내지 않고 앞 글자의 "아"를 길게 늘여요. 그래서 한글 발음에는 따로 안 적혀요.',
      ex: 'كِتَابٌ → 키타~분'
    },
    long_u: {
      title: '장모음 و — 앞 소리를 길게',
      body: '앞 글자에 "우" 모음가 있고 و에 모음 표시가 없으면, و는 그 "우"를 길게 늘이는 역할만 해요.',
      ex: 'نُورٌ → 누~룬'
    },
    long_i: {
      title: '장모음 ي — 앞 소리를 길게',
      body: '앞 글자에 "이" 모음가 있고 ي에 모음 표시가 없으면, ي는 그 "이"를 길게 늘이는 역할만 해요.',
      ex: 'كَبِيرٌ → 카비~룬'
    },
    alif_maqsura: {
      title: '알리프 막수라 ى — "아"로 읽어요',
      body: '점 없는 ي 모양이지만 ا처럼 앞의 "아"를 길게 늘여요. 단어 끝에만 나와요.',
      ex: 'عَلَى → 알라~'
    },
    hamza: {
      title: '함자 ء — 목에서 잠깐 끊는 소리',
      body: '목을 순간 막았다 떼는 소리라 한글로 딱 맞는 글자가 없어요. 모음이 있으면 "아/이/우"처럼 들리고, 모음이 없으면 거의 안 들리고 숨을 살짝 끊어요. أ إ ؤ ئ 의 ا و ي 는 함자를 얹는 받침대일 뿐이에요.',
      ex: 'مَاءٌ → 마~운 / يَأْكُلُ → 야(ㆆ)쿨루'
    },
    ain: {
      title: '아인 ع — 목을 조이는 소리',
      body: '목 깊은 곳을 조이며 내는 소리라 한글에 없어요. 보통 "ㅇ"이나 "으"로 적고, 모음이 없으면 짧게 목을 조이는 느낌만 나요.',
      ex: 'كَعْكٌ → 카으쿤'
    },
    double: {
      title: '샷다 — 같은 자음을 두 번',
      body: '글자 위 w 모양 표시(샷다)는 같은 자음을 두 번 읽으라는 뜻이에요. 앞 글자의 받침 + 이 글자의 첫소리로 읽어요.',
      ex: 'أُمٌّ → 움문 / سَيَّارَةٌ → 사이야라툰'
    }
  };

  function syllable(jamo, jung, nieun) {
    const cho = CHO.indexOf(jamo);
    if (cho < 0) return jamo;
    return String.fromCharCode(0xAC00 + (cho * 21 + JUNG[jung]) * 28 + (nieun ? 4 : 0));
  }

  function vowelOf(marks) {
    if (marks.includes(FATHA) || marks.includes(FATHATAN) || marks.includes(DAGGER)) return 'a';
    if (marks.includes(DAMMA) || marks.includes(DAMMATAN)) return 'u';
    if (marks.includes(KASRA) || marks.includes(KASRATAN)) return 'i';
    return '';
  }

  const hasTanwin = marks => /[ً-ٍ]/.test(marks);

  function sound(ch, marks) {
    const v = vowelOf(marks);
    const jamo = CONSONANT[ch];
    let jung = v || 'eu';
    if (ch === 'ش') jung = { a:'ya', u:'yu', i:'i', eu:'yu' }[jung];
    if (ch === 'و') jung = { a:'wa', u:'u', i:'wi', eu:'u' }[jung];
    if (ch === 'ي') jung = { a:'ya', u:'yu', i:'i', eu:'i' }[jung];
    return syllable(jamo, jung, hasTanwin(marks));
  }

  function split(arabic) {
    const units = [];
    let wordIdx = 0, pos = 0;
    for (const ch of String(arabic).normalize('NFC')) {
      const cp = ch.codePointAt(0);
      if (/\s/.test(ch)) { if (pos) { wordIdx++; pos = 0; } continue; }
      if ((cp >= 0x064B && cp <= 0x065F) || cp === 0x0670) {
        if (units.length) units[units.length - 1].marks += ch;
        continue;
      }
      if ((cp >= 0x0621 && cp <= 0x064A) || cp === 0x0671) {
        units.push({ ch, marks: '', wordIdx, pos });
        pos++;
      }
    }
    units.forEach((u, i) => {
      u.prev = units[i - 1] && units[i - 1].wordIdx === u.wordIdx ? units[i - 1] : null;
      u.next = units[i + 1] && units[i + 1].wordIdx === u.wordIdx ? units[i + 1] : null;
    });
    return units;
  }

  function breakdown(arabic) {
    return split(arabic).map(u => {
      const { ch, marks, prev, next } = u;
      const out = (ko, kind = 'sound', reason = '') => ({ ch, ko, kind, reason });
      const v = vowelOf(marks);
      const bare = !v && !marks.includes(SUKUN) && !marks.includes(SHADDA);

      if (ch === 'ا' || ch === 'ٱ') {
        if (hasTanwin(marks)) return out('안');
        if (!next && prev && prev.marks.includes(FATHATAN)) return out('묵음', 'silent', 'tanwin_alif');
        if (u.pos === 0) {
          if (u.wordIdx > 0 || ch === 'ٱ') return out('묵음', 'silent', 'wasl');
          return out(syllable('ㅇ', v || 'a'));
        }
        if (!v && prev && /[ُِ]/.test(prev.marks) && next && next.marks.includes(SUKUN)) {
          return out('묵음', 'silent', 'wasl');
        }
        return out('길게', 'long', 'long_a');
      }
      if (ch === 'آ') return out('아~');
      if (ch === 'ى') return v === 'i' ? out('이') : out('길게', 'long', 'alif_maqsura');

      if (ch === 'ل' && bare && u.pos === 1 && prev && 'اٱ'.includes(prev.ch)
          && next && next.marks.includes(SHADDA) && SUN.includes(next.ch)) {
        return out('묵음', 'silent', 'sun');
      }
      if ((ch === 'و' || ch === 'ي') && !v && !marks.includes(SHADDA)) {
        const pv = prev ? vowelOf(prev.marks) : '';
        if (ch === 'و' && pv === 'u' && bare) return out('길게', 'long', 'long_u');
        if (ch === 'ي' && pv === 'i' && bare) return out('길게', 'long', 'long_i');
        return out(ch === 'و' ? '우' : '이');
      }
      if (ch === 'ة' && !v) return out('묵음', 'silent', 'ta_marbuta');
      if (HAMZA.includes(ch)) {
        if (!v) return ch === 'إ' ? out('이', 'soft', 'hamza') : out('(끊음)', 'soft', 'hamza');
        return out(sound(ch, marks), 'soft', 'hamza');
      }
      if (ch === 'ع' && !v) return out('으', 'soft', 'ain');

      const ko = sound(ch, marks);
      if (marks.includes(SHADDA)) {
        const first = { 'و':'우', 'ي':'이' }[ch] || CONSONANT[ch];
        return out(first + '+' + ko, 'soft', 'double');
      }
      return out(ko, ch === 'ع' ? 'soft' : 'sound', ch === 'ع' ? 'ain' : '');
    });
  }

  function esc(value) {
    return String(value).replace(/[&<>"']/g, ch => ({
      '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
    })[ch]);
  }

  // 한글 문장 속 아랍어가 앞뒤 순서를 뒤집지 않도록 따로 감싼다.
  function isolate(text) {
    return esc(text).replace(/[\u0600-\u06FF\u25CC]+(?:\s+[\u0600-\u06FF]+)*/g,
      m => `<bdi dir="rtl" class="lr-ar">${m}</bdi>`);
  }

  function renderChips(arabic) {
    return breakdown(arabic).map(l => {
      const tag = l.reason ? 'button' : 'span';
      const attrs = l.reason ? ` type="button" data-reason="${l.reason}" aria-label="${esc(l.ko)} 이유 보기"` : '';
      const q = l.reason ? '<span class="l-q">?</span>' : '';
      return `<${tag} class="l-chip lk-${l.kind}"${attrs}>${q}<span class="l-ar">${esc(l.ch)}</span><span class="l-ko">${esc(l.ko)}</span></${tag}>`;
    }).join('');
  }

  const css = `
.l-chip{position:relative;flex-direction:column;height:auto!important;min-height:44px;padding:6px 6px 5px!important;gap:3px;border:none;color:inherit;font:inherit}
.l-ko{font-family:'Noto Sans KR',sans-serif;font-size:10px;font-weight:700;color:var(--accent,#f59e0b);line-height:1;white-space:nowrap}
button.l-chip{cursor:pointer}
.l-chip.lk-silent{opacity:.55;outline:1px dashed var(--dim,#8888aa)}
.l-chip.lk-silent .l-ko{color:var(--dim,#8888aa)}
.l-chip.lk-long .l-ko{color:#60a5fa}
.l-q{position:absolute;top:-6px;right:-6px;width:15px;height:15px;border-radius:50%;background:var(--primary,#6c63ff);color:#fff;font-size:10px;font-weight:800;line-height:15px;text-align:center;font-family:'Noto Sans KR',sans-serif}
.lr-overlay{position:fixed;inset:0;background:rgba(0,0,0,.5);z-index:900}
.lr-sheet{position:fixed;left:16px;right:16px;margin:0 auto;max-width:440px;box-sizing:border-box;bottom:calc(16px + env(safe-area-inset-bottom,0px));background:var(--surface,#1a1d27);color:var(--text,#f0f0f5);border-radius:18px;padding:20px 20px 16px;z-index:901;box-shadow:0 12px 40px rgba(0,0,0,.4);font-family:'Noto Sans KR',sans-serif}
.lr-title{font-size:16px;font-weight:800;margin-bottom:10px}
.lr-body{font-size:14px;line-height:1.65;color:var(--text,#f0f0f5)}
.lr-ex{margin-top:12px;background:var(--surface2,#22263a);border-radius:10px;padding:10px 12px;font-size:14px;font-weight:700;color:var(--accent,#f59e0b)}
.lr-ar{font-family:'Noto Naskh Arabic',serif;font-size:1.15em}
.lr-close{margin-top:14px;width:100%;border:none;border-radius:12px;padding:12px;background:var(--primary,#6c63ff);color:#fff;font-size:14px;font-weight:800;font-family:inherit}
`;
  const style = document.createElement('style');
  style.textContent = css;
  document.head.appendChild(style);

  function closeReason() {
    document.querySelectorAll('.lr-overlay,.lr-sheet').forEach(el => el.remove());
  }

  function openReason(key) {
    const r = REASONS[key];
    if (!r) return;
    closeReason();
    const overlay = document.createElement('div');
    overlay.className = 'lr-overlay';
    overlay.addEventListener('click', closeReason);
    const sheet = document.createElement('div');
    sheet.className = 'lr-sheet';
    sheet.setAttribute('role', 'dialog');
    sheet.innerHTML = `<div class="lr-title">${isolate(r.title)}</div><div class="lr-body">${isolate(r.body)}</div>`
      + `<div class="lr-ex">${isolate(r.ex)}</div><button class="lr-close" type="button">알겠어요</button>`;
    sheet.querySelector('.lr-close').addEventListener('click', closeReason);
    document.body.append(overlay, sheet);
  }

  document.addEventListener('click', e => {
    const chip = e.target.closest && e.target.closest('.l-chip[data-reason]');
    if (!chip) return;
    e.preventDefault();
    e.stopPropagation();
    openReason(chip.dataset.reason);
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeReason();
  });

  window.ArabicLetters = { breakdown, renderChips, openReason };
})();
