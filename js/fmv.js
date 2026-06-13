// MAME: THE LAST SHIBA — interactive FMV engine.
// Plays a node's video → on end shows choices while LOOPING the last ~3s ON MUTE (no frozen
// frame, no repeated voice) forever until the player chooses → choice loads the next node.
// Subtitles type out synced to real audio timestamps. Smooth fade between scenes.
// BACK button returns to the previous decision so you can take a different path.
(function () {
  const $ = (id) => document.getElementById(id);
  const vid = $('vid'), vidbg = $('vidbg'), freeze = $('freeze'), subEl = $('sub'), choicesEl = $('choices'),
        noteEl = $('note'), startEl = $('start'), fadeEl = $('fade'), backBtn = $('backBtn'),
        tension = $('tension'), menubgm = $('menubgm'), mapEl = $('map'), mapBtn = $('mapBtn'), poster = $('poster');

  // each scene's opening keyframe — shown as a poster while the clip buffers (matches the video's first frame)
  const POSTERS = { V1: 'v1-a', V2A: 'v2a', V2B: 'v2b', V3: 'v3a', V4: 'v4a', V5A: 'v5a-a', V5B: 'v5b', ENDTRUE: 'endtrue-a', ENDBAD: 'endbad' };
  const posterSrc = (id) => POSTERS[id] ? 'assets/scenes/' + POSTERS[id] + '.png' : '';

  let node = null, curId = null, cues = [], choiceMode = false, tailStart = 0,
      userMuted = false, history = [];
  const TAIL = 3; // seconds of ending to loop while waiting for a choice

  // video is muted during the choice-loop; suspense music plays instead (until a choice)
  function applyMute() { vid.muted = choiceMode ? true : userMuted; if (tension) tension.muted = userMuted; if (menubgm) menubgm.muted = userMuted; }
  function menuBgmOn() { if (!menubgm) return; menubgm.volume = 0.32; menubgm.muted = userMuted; menubgm.play().catch(() => {}); }
  function menuBgmOff() { if (menubgm) menubgm.pause(); }
  function tensionOn() { if (!tension) return; tension.volume = 0.4; tension.muted = userMuted; tension.currentTime = 0; tension.play().catch(() => {}); }
  function tensionOff() { if (tension) { tension.pause(); } }

  // preload upcoming videos so picking a choice switches instantly (no black "lag")
  const preloadCache = {};
  function preload(src) { if (!src || preloadCache[src]) return; const v = document.createElement('video'); v.preload = 'auto'; v.muted = true; v.src = src; preloadCache[src] = v; }

  // ---- progress tracking + journey map ----
  function getProg() { try { return JSON.parse(localStorage.getItem('mame_ch1') || '{}'); } catch (e) { return {}; } }
  function setProg(p) { try { localStorage.setItem('mame_ch1', JSON.stringify(p)); } catch (e) {} }
  function renderMap() {
    const p = getProg();
    $('endTrue').classList.toggle('done', !!p.true);
    $('endBad').classList.toggle('done', !!p.bad);
    $('mapCount').textContent = 'Endings found: ' + ((p.true ? 1 : 0) + (p.bad ? 1 : 0)) + ' / 2';
  }
  function pauseAll() { try { vid.pause(); } catch (e) {} try { vidbg.pause(); } catch (e) {} tensionOff(); }
  function hideHud() { document.body.classList.remove('playing'); mapBtn.classList.remove('show'); backBtn.classList.remove('show');
    choicesEl.classList.remove('show'); subEl.classList.remove('show'); fadeEl.classList.remove('show', 'busy'); freeze.classList.remove('show'); }
  function setView(tree) { $('viewChapters').style.display = tree ? 'none' : 'flex'; $('viewTree').style.display = tree ? 'flex' : 'none'; }
  // chapter select (3 chapters only — no roadmap): shown by NEW GAME and end-of-chapter
  function showChapters() { pauseAll(); hideHud(); startEl.classList.add('hide'); $('splash').classList.remove('show', 'hide'); renderMap(); setView(false); mapEl.classList.add('show'); menuBgmOn(); }
  // roadmap (branch tree to jump scenes): shown only IN-GAME via the map button
  function showRoadmap() { pauseAll(); hideHud(); menuBgmOff(); renderMap(); setView(true); mapEl.classList.add('show'); }
  function resumeGame() { mapEl.classList.remove('show'); menuBgmOff(); if (curId && STORY.nodes[curId]) { document.body.classList.add('playing'); mapBtn.classList.add('show'); backBtn.classList.toggle('show', history.length > 0); try { vid.play(); } catch (e) {} try { vidbg.play(); } catch (e) {} } }
  function goHome() { pauseAll(); hideHud(); mapEl.classList.remove('show'); $('splash').classList.remove('show', 'hide'); startEl.classList.remove('hide'); menuBgmOn(); }
  function startChapter1() {
    mapEl.classList.remove('show'); menuBgmOff(); userMuted = false; history = [];
    const first = STORY.nodes[STORY.start];
    vid.setAttribute('src', first.video); vid.muted = true; vid.play().then(() => vid.pause()).catch(() => {});
    const sp = $('splash'); sp.classList.add('show');
    setTimeout(() => { sp.classList.add('hide'); setTimeout(() => { sp.classList.remove('show', 'hide'); go(STORY.start); }, 700); }, 3500);
  }
  function jump(id) { if (!STORY.nodes[id]) return; mapEl.classList.remove('show'); history = []; go(id); } // jump to any scene from the map

  function setNode(id) {
    node = STORY.nodes[id]; curId = id;
    if (!node) return;
    choiceMode = false; tensionOff(); applyMute();
    choicesEl.classList.remove('show'); choicesEl.innerHTML = '';
    subEl.classList.remove('show'); subEl.textContent = '';
    noteEl.textContent = node.note || ''; noteEl.classList.toggle('show', !!node.note);
    cues = node.subs || [];
    if (vid.getAttribute('src') !== node.video) vid.setAttribute('src', node.video);
    try { vid.currentTime = 0; } catch (e) {}
    vid.play().catch(() => {});
    // blurred background copy fills the letterbox (portrait); plays independently, muted
    if (vidbg && vidbg.getAttribute('src') !== node.video) vidbg.setAttribute('src', node.video);
    if (vidbg) { vidbg.muted = true; try { vidbg.currentTime = 0; } catch (e) {} vidbg.play().catch(() => {}); }
    // record reached endings for the journey map
    if (id === 'ENDTRUE' || id === 'ENDBAD') { const p = getProg(); p[id === 'ENDTRUE' ? 'true' : 'bad'] = true; setProg(p); }
    document.body.classList.add('playing'); // enables the rotate-to-landscape gate on phones
    menuBgmOff(); // silence menu music while a scene plays
    mapBtn.classList.add('show'); // map jump available during play
    backBtn.classList.toggle('show', history.length > 0);
    // start buffering this scene's possible next videos right away (kills the black "lag")
    (node.choices || []).forEach((c) => { const n = STORY.nodes[c.next]; if (n) preload(n.video); });
  }

  // fade through black, then switch scene
  function go(id) {
    // smooth transition: show the NEW scene's keyframe as a poster (≈ the video's first frame),
    // load the clip underneath, then cross-dissolve poster → video. Never a black gap.
    const ps = posterSrc(id);
    if (poster && ps) { poster.src = ps; poster.classList.add('show'); }
    else { try { if (vid.videoWidth) { freeze.width = vid.videoWidth; freeze.height = vid.videoHeight; freeze.getContext('2d').drawImage(vid, 0, 0); freeze.classList.add('show'); } } catch (e) {} }
    setNode(id);
    let done = false;
    const reveal = () => { if (done) return; done = true;
      poster.classList.remove('show', 'busy'); freeze.classList.remove('show');
      vid.removeEventListener('loadeddata', reveal); vid.removeEventListener('playing', reveal); };
    if (vid.readyState >= 2) setTimeout(reveal, 40);
    else {
      vid.addEventListener('loadeddata', reveal); vid.addEventListener('playing', reveal);
      setTimeout(() => { if (!done) poster.classList.add('busy'); }, 500);  // spinner over the poster if slow
      setTimeout(reveal, 10000); // hard fallback (poster shows meanwhile, never black)
    }
  }

  function navigate(next) { // forward via a choice — remember decision points for BACK
    if (next === 'MAP') { showChapters(); return; }          // special target → chapter select
    if (node && node.choices && node.choices.length > 1) history.push(curId);
    go(next);
  }
  function back() {
    if (!history.length) return;
    go(history.pop(), true);
  }

  function loopTail() { try { vid.currentTime = tailStart; } catch (e) {} vid.play().catch(() => {}); }

  function showChoices() {
    choiceMode = true; applyMute(); subEl.classList.remove('show');
    tailStart = Math.max(0, (vid.duration || 16) - TAIL);
    const list = (node.choices && node.choices.length)
      ? node.choices : [{ t: '◀ Replay', next: STORY.start }];
    choicesEl.innerHTML = '';
    list.forEach((c, i) => {
      const b = document.createElement('button');
      b.className = 'choice';
      b.innerHTML = '<b>' + (i + 1) + '</b><span>' + c.t + '</span>';
      b.onclick = () => navigate(c.next);
      choicesEl.appendChild(b);
    });
    choicesEl.classList.add('show');
    loopTail();
    tensionOn(); // suspense music while waiting for the player's choice
    list.forEach((c) => { const n = STORY.nodes[c.next]; if (n) preload(n.video); }); // buffer next clips now
  }

  vid.addEventListener('timeupdate', () => {
    const t = vid.currentTime, d = vid.duration || 16;
    if (choiceMode) { if (t >= d - 0.15) loopTail(); return; }
    let cur = null;
    for (const c of cues) if (t >= c.s && t <= c.e + 0.6) cur = c;
    if (cur) {
      const dur = Math.max(0.3, cur.e - cur.s);
      const p = Math.max(0, Math.min(1, (t - cur.s) / dur));
      subEl.textContent = cur.t.slice(0, Math.ceil(cur.t.length * p));
      subEl.classList.add('show');
    } else subEl.classList.remove('show');
  });

  vid.addEventListener('ended', () => {
    if (choiceMode) { loopTail(); return; }
    if (node.auto && node.choices && node.choices.length) { go(node.choices[0].next); return; }
    showChoices();
  });

  addEventListener('keydown', (e) => {
    if (choiceMode) {
      const n = +e.key, btns = choicesEl.querySelectorAll('.choice');
      if (n >= 1 && n <= btns.length) btns[n - 1].click();
    }
    if (e.key === 'Backspace') { e.preventDefault(); back(); }
  });

  backBtn.onclick = back;

  $('startBtn').onclick = showChapters;       // NEW GAME → chapter select (3 chapters)
  $('playNow').onclick = startChapter1;       // Chapter 1 card "PLAY NOW" → play from start
  $('playCh1').onclick = startChapter1;       // roadmap "PLAY FROM START" → play from start
  $('mapHome').onclick = goHome;              // chapter select → landing
  $('treeBack').onclick = resumeGame;         // roadmap "BACK" → resume the current scene
  mapBtn.onclick = showRoadmap;               // in-game map button → roadmap (jump scenes)
  // clickable scene nodes on the roadmap → jump to that scene and keep playing
  mapEl.querySelectorAll('[data-go]').forEach((el) => { el.onclick = () => jump(el.getAttribute('data-go')); });
  $('muteBtn').onclick = () => {
    userMuted = !userMuted; $('muteBtn').textContent = userMuted ? '🔇' : '🔊'; applyMute();
  };

  // start menu music on the first user interaction (autoplay is blocked before a gesture)
  function firstGesture() {
    if (!document.body.classList.contains('playing') && !mapEl.classList.contains('show')) menuBgmOn();
    removeEventListener('pointerdown', firstGesture); removeEventListener('keydown', firstGesture);
  }
  addEventListener('pointerdown', firstGesture); addEventListener('keydown', firstGesture);

  window.__fmv = { go, navigate, back, get node() { return node; }, get curId() { return curId; },
    get choiceMode() { return choiceMode; }, get history() { return history.slice(); }, get muted() { return vid.muted; } };
})();
