/* =========================================================================
 * Raja's Mokku Journey — application logic (vanilla JS, no frameworks)
 * Views: landing (hero + timeline + route map) and full-screen scene view.
 * Data: tries GET /api/stages first, falls back to RAJA_JOURNEY (journey.js).
 * ========================================================================= */
(function () {
  'use strict';

  /* ---------------- i18n UI strings ---------------- */
  var STRINGS = {
    en: {
      tagline: "From Muddanur to Tirumala — a vow fulfilled",
      start: 'Begin the Journey',
      timelineTitle: 'Journey Timeline',
      timelineSub: 'Tap any stage to open its scene.',
      routeTitle: 'Pilgrimage Route',
      routeSub: 'Tap a stop to jump to its stage.',
      stageOf: 'Stage',
      of: 'of',
      prev: 'Previous Stage',
      next: 'Next Stage',
      back: 'Back to Journey',
      replay: 'Replay My Journey',
      watchAll: 'Watch All Stages',
      stopWatch: 'Stop',
      autoOn: 'Auto-playing all stages\u2026',
      musicOn: 'Music: On',
      musicOff: 'Music: Off',
      langBtn: '\u0c24\u0c46\u0c32\u0c41\u0c17\u0c41',
      langLabel: 'Switch to Telugu',
      hill: 'Hill',
      hillsTitle: 'The Seven Hills',
      imgLoading: 'Loading illustration\u2026',
      imgMissing: 'Illustration coming soon',
      route: { muddanur: 'Muddanur', tirupati: 'Tirupati', mettu: 'Srivari Mettu', tirumala: 'Tirumala', home: 'Home' },
      hillMsg: 'With every step, closer to the Lord.',
      finalMsg: 'B.Tech Dream Achieved. Mokku Fulfilled. Govinda Govinda!',
      closing: 'May Lord Venkateswara Swamy bless every sincere vow.'
    },
    te: {
      tagline: '\u0c2e\u0c41\u0c26\u0c4d\u0c26\u0c28\u0c42\u0c30\u0c41 \u0c28\u0c41\u0c02\u0c21\u0c3f \u0c24\u0c3f\u0c30\u0c41\u0c2e\u0c32 \u0c35\u0c30\u0c15\u0c41 \u2014 \u0c28\u0c46\u0c30\u0c35\u0c47\u0c30\u0c3f\u0c28 \u0c2e\u0c4a\u0c15\u0c4d\u0c15\u0c41',
      start: '\u0c2f\u0c3e\u0c24\u0c4d\u0c30 \u0c2a\u0c4d\u0c30\u0c3e\u0c30\u0c02\u0c2d\u0c3f\u0c02\u0c1a\u0c02\u0c21\u0c3f',
      timelineTitle: '\u0c2f\u0c3e\u0c24\u0c4d\u0c30\u0c3e \u0c15\u0c3e\u0c32\u0c15\u0c4d\u0c30\u0c2e\u0c02',
      timelineSub: '\u0c0f \u0c18\u0c1f\u0c4d\u0c1f\u0c02\u0c2a\u0c48\u0c28\u0c3e \u0c28\u0c4a\u0c15\u0c4d\u0c15\u0c3f \u0c06 \u0c26\u0c43\u0c36\u0c4d\u0c2f\u0c3e\u0c28\u0c4d\u0c28\u0c3f \u0c1a\u0c42\u0c21\u0c02\u0c21\u0c3f.',
      routeTitle: '\u0c2f\u0c3e\u0c24\u0c4d\u0c30\u0c3e \u0c2e\u0c3e\u0c30\u0c4d\u0c17\u0c02',
      routeSub: '\u0c0f \u0c38\u0c4d\u0c1f\u0c3e\u0c2a\u0c4d\u200c\u0c2a\u0c48\u0c28\u0c3e \u0c28\u0c4a\u0c15\u0c4d\u0c15\u0c3f \u0c06 \u0c18\u0c1f\u0c4d\u0c1f\u0c3e\u0c28\u0c3f\u0c15\u0c3f \u0c35\u0c46\u0c33\u0c4d\u0c33\u0c02\u0c21\u0c3f.',
      stageOf: '\u0c18\u0c1f\u0c4d\u0c1f\u0c02',
      of: '/',
      prev: '\u0c15\u0c4d\u0c30\u0c3f\u0c24\u0c02 \u0c18\u0c1f\u0c4d\u0c1f\u0c02',
      next: '\u0c24\u0c30\u0c41\u0c35\u0c3e\u0c24 \u0c18\u0c1f\u0c4d\u0c1f\u0c02',
      back: '\u0c2f\u0c3e\u0c24\u0c4d\u0c30\u0c15\u0c41 \u0c24\u0c3f\u0c30\u0c3f\u0c17\u0c3f \u0c35\u0c46\u0c33\u0c4d\u0c33\u0c02\u0c21\u0c3f',
      replay: '\u0c28\u0c3e \u0c2f\u0c3e\u0c24\u0c4d\u0c30\u0c28\u0c41 \u0c2e\u0c33\u0c4d\u0c33\u0c40 \u0c1a\u0c42\u0c21\u0c02\u0c21\u0c3f',
      watchAll: '\u0c05\u0c28\u0c4d\u0c28\u0c3f \u0c18\u0c1f\u0c4d\u0c1f\u0c3e\u0c32\u0c41 \u0c1a\u0c42\u0c21\u0c02\u0c21\u0c3f',
      stopWatch: '\u0c06\u0c2a\u0c02\u0c21\u0c3f',
      autoOn: '\u0c05\u0c28\u0c4d\u0c28\u0c3f \u0c18\u0c1f\u0c4d\u0c1f\u0c3e\u0c32\u0c41 \u0c1a\u0c42\u0c2a\u0c3f\u0c38\u0c4d\u0c24\u0c41\u0c28\u0c4d\u0c28\u0c3e\u0c2f\u0c3f\u2026',
      musicOn: '\u0c38\u0c02\u0c17\u0c40\u0c24\u0c02: \u0c06\u0c28\u0c4d',
      musicOff: '\u0c38\u0c02\u0c17\u0c40\u0c24\u0c02: \u0c06\u0c2b\u0c4d',
      langBtn: 'English',
      langLabel: 'Switch to English',
      hill: '\u0c15\u0c4a\u0c02\u0c21',
      hillsTitle: '\u0c0f\u0c21\u0c41 \u0c15\u0c4a\u0c02\u0c21\u0c32\u0c41',
      imgLoading: '\u0c1a\u0c3f\u0c24\u0c4d\u0c30\u0c02 \u0c32\u0c4b\u0c21\u0c4d \u0c05\u0c35\u0c41\u0c24\u0c4b\u0c02\u0c26\u0c3f\u2026',
      imgMissing: '\u0c1a\u0c3f\u0c24\u0c4d\u0c30\u0c02 \u0c24\u0c4d\u0c35\u0c30\u0c32\u0c4b \u0c35\u0c38\u0c4d\u0c24\u0c41\u0c02\u0c26\u0c3f',
      route: { muddanur: '\u0c2e\u0c41\u0c26\u0c4d\u0c26\u0c28\u0c42\u0c30\u0c41', tirupati: '\u0c24\u0c3f\u0c30\u0c41\u0c2a\u0c24\u0c3f', mettu: '\u0c36\u0c4d\u0c30\u0c40\u0c35\u0c3e\u0c30\u0c3f \u0c2e\u0c46\u0c1f\u0c4d\u0c1f\u0c41', tirumala: '\u0c24\u0c3f\u0c30\u0c41\u0c2e\u0c32', home: '\u0c07\u0c32\u0c4d\u0c32\u0c41' },
      hillMsg: '\u0c2a\u0c4d\u0c30\u0c24\u0c3f \u0c05\u0c21\u0c41\u0c17\u0c41\u0c24\u0c4b \u0c38\u0c4d\u0c35\u0c3e\u0c2e\u0c3f\u0c15\u0c3f \u0c2e\u0c30\u0c3f\u0c02\u0c24 \u0c26\u0c17\u0c4d\u0c17\u0c30.',
      finalMsg: '\u0c36\u0c4d\u0c30\u0c40 \u0c35\u0c47\u0c02\u0c15\u0c1f\u0c47\u0c36\u0c4d\u0c35\u0c30 \u0c38\u0c4d\u0c35\u0c3e\u0c2e\u0c3f \u0c35\u0c3e\u0c30\u0c3f \u0c06\u0c36\u0c40\u0c38\u0c4d\u0c38\u0c41\u0c32\u0c24\u0c4b \u0c30\u0c3e\u0c1c\u0c3e \u0c24\u0c28 \u0c2e\u0c4a\u0c15\u0c4d\u0c15\u0c41\u0c28\u0c41 \u0c2a\u0c42\u0c30\u0c4d\u0c24\u0c3f \u0c1a\u0c47\u0c38\u0c41\u0c15\u0c41\u0c28\u0c4d\u0c28\u0c3e\u0c21\u0c41. \u0c17\u0c4b\u0c35\u0c3f\u0c02\u0c26\u0c3e! \u0c17\u0c4b\u0c35\u0c3f\u0c02\u0c26\u0c3e!',
      closing: '\u0c28\u0c3f\u0c1c\u0c3e\u0c2f\u0c3f\u0c24\u0c40\u0c17\u0c3e \u0c2e\u0c4a\u0c15\u0c4d\u0c15\u0c41\u0c15\u0c41\u0c28\u0c4d\u0c28 \u0c2a\u0c4d\u0c30\u0c24\u0c3f \u0c2d\u0c15\u0c4d\u0c24\u0c41\u0c28\u0c3f\u0c15\u0c3f \u0c36\u0c4d\u0c30\u0c40 \u0c35\u0c47\u0c02\u0c15\u0c1f\u0c47\u0c36\u0c4d\u0c35\u0c30 \u0c38\u0c4d\u0c35\u0c3e\u0c2e\u0c3f \u0c06\u0c36\u0c40\u0c30\u0c4d\u0c35\u0c26\u0c3f\u0c02\u0c1a\u0c41\u0c17\u0c3e\u0c15.'
    }
  };

  /* ---------------- state ---------------- */
  var state = {
    stages: [],
    index: 0,
    lang: 'en',
    view: 'landing', // landing | scene
    autoplay: null,
    dataSource: 'embedded'
  };
  var reducedMotion = window.matchMedia &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- helpers ---------------- */
  function $(sel, root) { return (root || document).querySelector(sel); }
  function $all(sel, root) { return Array.prototype.slice.call((root || document).querySelectorAll(sel)); }
  function t() { return STRINGS[state.lang]; }
  function pick(stage, key) {
    return state.lang === 'te' ? (stage[key + '_te'] || stage[key + '_en']) : stage[key + '_en'];
  }
  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  /* ---------------- data loading ---------------- */
  function normalizeApiStages(raw) {
    if (!raw) return null;
    var arr = Array.isArray(raw) ? raw : raw.stages;
    if (!Array.isArray(arr) || arr.length === 0) return null;
    var mapped = arr.map(function (s, i) {
      return {
        id: s.id != null ? s.id : i + 1,
        image: s.image || ('assets/images/stage-' + String(i + 1).padStart(2, '0') + '.jpg'),
        motion: s.motion || 'float',
        tag_en: s.tag_en || '', tag_te: s.tag_te || '',
        title_en: s.title_en || s.title || 'Stage ' + (i + 1),
        title_te: s.title_te || s.title || '',
        desc_en: s.desc_en || s.description || '',
        desc_te: s.desc_te || s.description || '',
        alt_en: s.alt_en || ('Illustration for stage ' + (i + 1)),
        alt_te: s.alt_te || '',
        caption_en: s.caption_en || '', caption_te: s.caption_te || '',
        milestones: !!s.milestones
      };
    });
    return mapped.length ? mapped : null;
  }

  function loadStages() {
    var fallback = (window.RAJA_JOURNEY && window.RAJA_JOURNEY.stages) || [];
    state.stages = fallback;
    state.dataSource = 'embedded';
    renderAll();

    // Try the backend; keep the embedded copy on any failure.
    var ctrl = null;
    try { ctrl = new AbortController(); } catch (e) { ctrl = null; }
    var timer = setTimeout(function () { if (ctrl) { try { ctrl.abort(); } catch (e) {} } }, 4000);
    var opts = {};
    if (ctrl) opts.signal = ctrl.signal;
    fetch('/api/stages', opts).then(function (res) {
      clearTimeout(timer);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.json();
    }).then(function (data) {
      var mapped = normalizeApiStages(data);
      if (mapped) {
        state.stages = mapped;
        state.dataSource = 'api';
        renderAll();
      }
    }).catch(function () { clearTimeout(timer); /* stay on embedded copy */ });
  }

  /* ---------------- rendering ---------------- */
  function renderAll() {
    if (document.body) document.body.classList.toggle('reduced-motion', !!reducedMotion);
    renderChrome();
    renderHero();
    renderTimeline();
    renderRouteMap();
    if (state.view === 'scene') renderScene(state.index, true);
  }

  function renderChrome() {
    var s = t();
    document.documentElement.lang = state.lang === 'te' ? 'te' : 'en';
    var tagline = $('#tagline'); if (tagline) tagline.textContent = s.tagline;
    var langBtn = $('#lang-toggle');
    if (langBtn) { langBtn.textContent = s.langBtn; langBtn.setAttribute('aria-label', s.langLabel); }
    var musicBtn = $('#music-toggle');
    if (musicBtn) { musicBtn.textContent = AudioEngine.on ? s.musicOn : s.musicOff; }
    var h1 = $('#app-title');
    var appName = state.lang === 'te' ? '\u0c30\u0c3e\u0c1c\u0c3e \u0c2e\u0c4a\u0c15\u0c4d\u0c15\u0c41 \u0c2f\u0c3e\u0c24\u0c4d\u0c30' : "Raja's Mokku Journey";
    if (h1) h1.textContent = appName;
    var heroT = $('#hero-title');
    if (heroT) heroT.textContent = appName;
    var startBtn = $('#start-btn'); if (startBtn) startBtn.textContent = s.start;
    var tlT = $('#timeline-title'); if (tlT) tlT.textContent = s.timelineTitle;
    var tlS = $('#timeline-sub'); if (tlS) tlS.textContent = s.timelineSub;
    var rT = $('#route-title'); if (rT) rT.textContent = s.routeTitle;
    var rS = $('#route-sub'); if (rS) rS.textContent = s.routeSub;
    var replayBtn = $('#replay-btn'); if (replayBtn) replayBtn.textContent = s.replay;
    var watchBtn = $('#watchall-btn'); if (watchBtn) watchBtn.textContent = state.autoplay ? s.stopWatch : s.watchAll;
    var foot = $('#footer-note'); if (foot) foot.textContent = s.closing;
  }

  function renderHero() {
    var hero = $('#hero-media');
    if (!hero || !state.stages.length) return;
    var stage = state.stages[0];
    hero.innerHTML = '';
    var img = document.createElement('img');
    img.src = stage.image;
    img.alt = pick(stage, 'alt');
    img.className = 'hero-img motion-float';
    img.addEventListener('error', function () { showImgFallback(hero, stage); });
    img.addEventListener('load', function () { hero.classList.add('loaded'); });
    hero.appendChild(img);
    var skel = document.createElement('div');
    skel.className = 'img-skeleton';
    skel.setAttribute('aria-hidden', 'true');
    skel.textContent = t().imgLoading;
    hero.appendChild(skel);
  }

  function renderTimeline() {
    var wrap = $('#timeline');
    if (!wrap) return;
    wrap.innerHTML = '';
    state.stages.forEach(function (stage, i) {
      var card = document.createElement('button');
      card.type = 'button';
      card.className = 'tl-card';
      card.setAttribute('aria-label', (state.lang === 'te' ? t().stageOf + ' ' + stage.id + ': ' : 'Stage ' + stage.id + ': ') + pick(stage, 'title'));
      var thumb = document.createElement('span');
      thumb.className = 'tl-thumb';
      var img = document.createElement('img');
      img.loading = 'lazy';
      img.src = stage.image;
      img.alt = '';
      img.addEventListener('error', function () {
        thumb.classList.add('thumb-missing');
        img.remove();
        thumb.innerHTML = '<span class="thumb-om" aria-hidden="true">\u0950</span>';
      });
      thumb.appendChild(img);
      var num = document.createElement('span');
      num.className = 'tl-num';
      num.textContent = String(stage.id).padStart(2, '0');
      var ttl = document.createElement('span');
      ttl.className = 'tl-title';
      ttl.textContent = pick(stage, 'title');
      card.appendChild(thumb); card.appendChild(num); card.appendChild(ttl);
      card.addEventListener('click', function () { goToStage(i); });
      wrap.appendChild(card);
    });
  }

  /* Interactive SVG route map: Muddanur → Tirupati → Srivari Mettu → Tirumala → Home */
  function renderRouteMap() {
    var svg = $('#route-svg');
    if (!svg) return;
    var s = t();
    var stops = [
      { key: 'muddanur', stage: 2, x: 60,  y: 150 },  // stage index 2 (stage 3)
      { key: 'tirupati', stage: 4, x: 200, y: 110 },  // stage 5
      { key: 'mettu',    stage: 6, x: 340, y: 130 },  // stage 7
      { key: 'tirumala', stage: 12, x: 480, y: 70 },  // stage 13
      { key: 'home',     stage: 15, x: 340, y: 190 }  // stage 16 (return leg)
    ];
    var NS = 'http://www.w3.org/2000/svg';
    while (svg.firstChild) svg.removeChild(svg.firstChild);
    function el(name, attrs) {
      var n = document.createElementNS(NS, name);
      for (var k in attrs) n.setAttribute(k, attrs[k]);
      return n;
    }
    var path = el('path', {
      d: 'M60,150 C110,140 150,120 200,110 C260,98 300,120 340,130 C400,142 440,100 480,70 C470,120 410,160 340,190 C260,215 140,200 60,150 Z',
      fill: 'none', stroke: '#d4a017', 'stroke-width': '2.5',
      'stroke-dasharray': '7 6', opacity: '0.85', class: 'route-path'
    });
    svg.appendChild(path);
    stops.forEach(function (st) {
      var g = el('g', { class: 'route-stop', tabindex: '0', role: 'button',
        'aria-label': s.route[st.key] });
      g.appendChild(el('circle', { cx: st.x, cy: st.y, r: 13, class: 'route-dot' }));
      var label = el('text', { x: st.x, y: st.y + 32, 'text-anchor': 'middle', class: 'route-label' });
      label.textContent = s.route[st.key];
      g.appendChild(label);
      function jump() { goToStage(st.stage); }
      g.addEventListener('click', jump);
      g.addEventListener('keydown', function (ev) {
        if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); jump(); }
      });
      svg.appendChild(g);
    });
  }

  /* ---------------- scene view ---------------- */
  function showView(name) {
    state.view = name;
    var landing = $('#view-landing'), scene = $('#view-scene');
    if (landing) landing.hidden = name !== 'landing';
    if (scene) scene.hidden = name !== 'scene';
    if (name === 'scene') {
      var h = $('#scene-title');
      if (h) { h.setAttribute('tabindex', '-1'); h.focus({ preventScroll: true }); }
    }
    window.scrollTo(0, 0);
  }

  function goToStage(i) {
    stopAutoplay();
    if (!state.stages.length) return;
    state.index = Math.max(0, Math.min(state.stages.length - 1, i));
    renderScene(state.index, false);
    showView('scene');
  }

  function showImgFallback(container, stage) {
    container.classList.add('img-missing');
    var skel = container.querySelector('.img-skeleton');
    if (skel) skel.remove();
    var fb = document.createElement('div');
    fb.className = 'img-fallback';
    fb.setAttribute('role', 'img');
    fb.setAttribute('aria-label', pick(stage, 'alt'));
    fb.innerHTML = '<span class="fb-om" aria-hidden="true">\u0950</span>' +
      '<span class="fb-title">' + esc(pick(stage, 'title')) + '</span>' +
      '<span class="fb-note">' + esc(t().imgMissing) + '</span>';
    container.appendChild(fb);
  }

  function renderScene(i, instant) {
    var stage = state.stages[i];
    if (!stage) return;
    var s = t();
    var scene = $('#view-scene');
    if (scene) scene.classList.remove('scene-enter');
    var media = $('#scene-media');
    media.innerHTML = '';
    media.className = 'scene-media motion-' + (stage.motion || 'float');
    var img = document.createElement('img');
    img.src = stage.image;
    img.alt = pick(stage, 'alt');
    img.className = 'scene-img';
    img.addEventListener('error', function () { showImgFallback(media, stage); });
    img.addEventListener('load', function () { media.classList.add('loaded'); });
    media.appendChild(img);
    var skel = document.createElement('div');
    skel.className = 'img-skeleton';
    skel.setAttribute('aria-hidden', 'true');
    skel.textContent = s.imgLoading;
    media.appendChild(skel);

    $('#scene-tag').textContent = pick(stage, 'tag');
    $('#scene-title').textContent = pick(stage, 'title');
    $('#scene-desc').textContent = pick(stage, 'desc');

    var cap = $('#scene-caption');
    var capText = state.lang === 'te' ? stage.caption_te : (stage.caption_en || stage.caption_te);
    if (cap) {
      if (capText) { cap.textContent = capText; cap.hidden = false; }
      else { cap.hidden = true; }
    }

    // Progress
    $('#progress-label').textContent = s.stageOf + ' ' + stage.id + ' ' + s.of + ' ' + state.stages.length;
    $('#progress-fill').style.width = ((i + 1) / state.stages.length * 100) + '%';
    $('#progress-fill').parentElement.setAttribute('aria-valuenow', String(i + 1));

    // Seven-hills milestone tracker
    renderMilestones(stage);

    // Prev/Next
    var prev = $('#prev-btn'), next = $('#next-btn');
    if (prev) { prev.disabled = i === 0; prev.querySelector('span').textContent = s.prev; }
    if (next) { next.disabled = i === state.stages.length - 1; next.querySelector('span').textContent = s.next; }
    var back = $('#back-btn'); if (back) back.textContent = s.back;
    var watchBtn = $('#watchall-btn'); if (watchBtn) watchBtn.textContent = state.autoplay ? s.stopWatch : s.watchAll;

    // Final-stage extras
    var finale = $('#finale');
    if (finale) {
      if (stage.id === state.stages.length) {
        finale.hidden = false;
        $('#finale-msg').textContent = s.finalMsg;
        var rb = $('#replay-btn'); if (rb) rb.textContent = s.replay;
      } else finale.hidden = true;
    }

    if (scene && !instant && !reducedMotion) {
      void scene.offsetWidth; // restart transition
      scene.classList.add('scene-enter');
    }
    var live = $('#scene-live');
    if (live) live.textContent = s.stageOf + ' ' + stage.id + ': ' + pick(stage, 'title');
  }

  function renderMilestones(stage) {
    var box = $('#milestones');
    if (!box) return;
    box.innerHTML = '';
    if (!stage.milestones) { box.hidden = true; return; }
    box.hidden = false;
    var s = t();
    var h = document.createElement('h3');
    h.textContent = s.hillsTitle;
    box.appendChild(h);
    var row = document.createElement('ol');
    row.className = 'hills';
    for (var n = 1; n <= 7; n++) {
      var li = document.createElement('li');
      li.innerHTML = '<span class="hill-dot" aria-hidden="true">' + n + '</span>' +
        '<span class="hill-name">' + esc(s.hill + ' ' + n) + '</span>';
      row.appendChild(li);
    }
    box.appendChild(row);
    var msg = document.createElement('p');
    msg.className = 'hill-msg';
    msg.textContent = s.hillMsg;
    box.appendChild(msg);
  }

  /* ---------------- autoplay ---------------- */
  function startAutoplay() {
    stopAutoplay();
    if (reducedMotion) return;
    var s = t();
    var note = $('#auto-note');
    if (note) { note.textContent = s.autoOn; note.hidden = false; }
    renderChrome();
    state.autoplay = setInterval(function () {
      if (state.index >= state.stages.length - 1) { stopAutoplay(); return; }
      state.index += 1;
      renderScene(state.index, false);
      showView('scene');
    }, 7000);
  }
  function stopAutoplay() {
    if (state.autoplay) { clearInterval(state.autoplay); state.autoplay = null; }
    var note = $('#auto-note');
    if (note) note.hidden = true;
    var watchBtn = $('#watchall-btn');
    if (watchBtn && state.view === 'scene') watchBtn.textContent = t().watchAll;
  }

  /* ---------------- language ---------------- */
  function setLang(lang) {
    state.lang = lang === 'te' ? 'te' : 'en';
    try { localStorage.setItem('raja-lang', state.lang); } catch (e) {}
    renderAll();
  }

  /* ---------------- ambient music (WebAudio, synthesized) ---------------- */
  var AudioEngine = {
    on: false, ctx: null, master: null, bellTimer: null, chant: null,
    start: function () {
      var AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return;
      if (!this.ctx) {
        var ctx = new AC();
        this.ctx = ctx;
        var master = ctx.createGain();
        master.gain.value = 0.0;
        master.connect(ctx.destination);
        this.master = master;
        // Tanpura-like drone: root + fifth + octave, low and warm.
        var freqs = [110, 164.81, 220, 277.18];
        var filt = ctx.createBiquadFilter();
        filt.type = 'lowpass'; filt.frequency.value = 620; filt.Q.value = 0.6;
        filt.connect(master);
        freqs.forEach(function (f, idx) {
          var o = ctx.createOscillator();
          o.type = idx % 2 ? 'triangle' : 'sine';
          o.frequency.value = f;
          var g = ctx.createGain();
          g.gain.value = idx === 0 ? 0.5 : 0.22;
          // Slow breathing LFO on the drone level.
          var lfo = ctx.createOscillator();
          lfo.frequency.value = 0.07 + idx * 0.023;
          var lg = ctx.createGain(); lg.gain.value = 0.06;
          lfo.connect(lg); lg.connect(g.gain);
          o.connect(g); g.connect(filt);
          o.start(); lfo.start();
        });
        this._scheduleBell();
      }
      if (this.ctx.state === 'suspended') this.ctx.resume();
      this.on = true;
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.linearRampToValueAtTime(0.14, this.ctx.currentTime + 2.5);
      // "Om Namo Venkatesaya" chant — loops under the ambient drone.
      try {
        if (!this.chant) {
          var ch = new Audio('assets/audio/om-namo-venkatesaya.mp3');
          ch.loop = true;
          ch.volume = 0.85;
          ch.preload = 'auto';
          this.chant = ch;
        }
        var playP = this.chant.play();
        if (playP && playP.catch) playP.catch(function () { /* autoplay guard */ });
      } catch (e) { /* audio file optional — drone still plays */ }
    },
    _bell: function () {
      if (!this.on || !this.ctx) return;
      var ctx = this.ctx;
      var o = ctx.createOscillator();
      o.type = 'sine';
      o.frequency.value = [523.25, 587.33, 659.25][Math.floor(Math.random() * 3)];
      var g = ctx.createGain();
      var now = ctx.currentTime;
      g.gain.setValueAtTime(0.0, now);
      g.gain.linearRampToValueAtTime(0.16, now + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 4.5);
      o.connect(g); g.connect(this.master);
      o.start(now); o.stop(now + 5);
    },
    _scheduleBell: function () {
      var self = this;
      function tick() {
        self._bell();
        self.bellTimer = setTimeout(tick, 16000 + Math.random() * 16000);
      }
      this.bellTimer = setTimeout(tick, 9000);
    },
    stop: function () {
      if (this.chant) { try { this.chant.pause(); } catch (e) {} }
      if (!this.ctx) { this.on = false; return; }
      this.on = false;
      this.master.gain.cancelScheduledValues(this.ctx.currentTime);
      this.master.gain.linearRampToValueAtTime(0.0, this.ctx.currentTime + 1.2);
    },
    toggle: function () {
      if (this.on) this.stop(); else this.start();
      var btn = $('#music-toggle');
      if (btn) btn.textContent = this.on ? t().musicOn : t().musicOff;
      btn.setAttribute('aria-pressed', this.on ? 'true' : 'false');
    }
  };

  /* ---------------- events ---------------- */
  function bindEvents() {
    var startBtn = $('#start-btn');
    if (startBtn) startBtn.addEventListener('click', function () { goToStage(0); });

    var langBtn = $('#lang-toggle');
    if (langBtn) langBtn.addEventListener('click', function () {
      setLang(state.lang === 'en' ? 'te' : 'en');
    });

    var musicBtn = $('#music-toggle');
    if (musicBtn) musicBtn.addEventListener('click', function () { AudioEngine.toggle(); });

    var prev = $('#prev-btn');
    if (prev) prev.addEventListener('click', function () { if (state.index > 0) goToStage(state.index - 1); });
    var next = $('#next-btn');
    if (next) next.addEventListener('click', function () { if (state.index < state.stages.length - 1) goToStage(state.index + 1); });
    var back = $('#back-btn');
    if (back) back.addEventListener('click', function () { stopAutoplay(); showView('landing'); });
    var replay = $('#replay-btn');
    if (replay) replay.addEventListener('click', function () { goToStage(0); });
    var watch = $('#watchall-btn');
    if (watch) watch.addEventListener('click', function () {
      if (state.autoplay) { stopAutoplay(); renderChrome(); }
      else { if (state.view !== 'scene') { state.index = 0; renderScene(0, false); showView('scene'); } startAutoplay(); }
    });

    document.addEventListener('keydown', function (ev) {
      if (state.view !== 'scene') return;
      var tag = (ev.target && ev.target.tagName) || '';
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      if (ev.key === 'ArrowRight' || ev.key === ' ') {
        ev.preventDefault();
        if (state.index < state.stages.length - 1) goToStage(state.index + 1);
      } else if (ev.key === 'ArrowLeft') {
        ev.preventDefault();
        if (state.index > 0) goToStage(state.index - 1);
      } else if (ev.key === 'Escape') {
        stopAutoplay(); showView('landing');
      }
    });
  }

  /* ---------------- boot ---------------- */
  function init() {
    var saved = null;
    try { saved = localStorage.getItem('raja-lang'); } catch (e) {}
    if (saved === 'te' || saved === 'en') state.lang = saved;
    else if (navigator.language && navigator.language.toLowerCase().indexOf('te') === 0) state.lang = 'te';
    bindEvents();
    loadStages();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
