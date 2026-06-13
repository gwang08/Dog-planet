// MAME: THE LAST SHIBA — interactive FMV engine.
// Plays a node's video → on end shows choices while LOOPING the last ~3s ON MUTE (no frozen
// frame, no repeated voice) forever until the player chooses → choice loads the next node.
// Subtitles type out synced to real audio timestamps. Smooth fade between scenes.
// BACK button returns to the previous decision so you can take a different path.
(function () {
  const $ = (id) => document.getElementById(id);
  const vid = $('vid'), vidbg = $('vidbg'), freeze = $('freeze'), subEl = $('sub'), choicesEl = $('choices'),
        noteEl = $('note'), startEl = $('start'), fadeEl = $('fade'), backBtn = $('backBtn'),
        tension = $('tension'), mapEl = $('map'), mapBtn = $('mapBtn');

  let node = null, curId = null, cues = [], choiceMode = false, tailStart = 0,
      userMuted = false, history = [];
  const TAIL = 3; // seconds of ending to loop while waiting for a choice

  // video is muted during the choice-loop; suspense music plays instead (until a choice)
  function applyMute() { vid.muted = choiceMode ? true : userMuted; if (tension) tension.muted = userMuted; }
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
  function hideHud() { mapBtn.classList.remove('show'); backBtn.classList.remove('show');
    choicesEl.classList.remove('show'); subEl.classList.remove('show'); fadeEl.classList.remove('show', 'busy'); freeze.classList.remove('show'); }
  function showMap() { pauseAll(); hideHud(); startEl.classList.add('hide'); $('splash').classList.remove('show', 'hide');
    renderMap(); mapEl.classList.add('show'); }
  function goHome() { pauseAll(); hideHud(); mapEl.classList.remove('show'); $('splash').classList.remove('show', 'hide'); startEl.classList.remove('hide'); }
  function startChapter1() {
    mapEl.classList.remove('show'); userMuted = false; history = [];
    const first = STORY.nodes[STORY.start];
    vid.setAttribute('src', first.video); vid.muted = true; vid.play().then(() => vid.pause()).catch(() => {});
    const sp = $('splash'); sp.classList.add('show');
    setTimeout(() => { sp.classList.add('hide'); setTimeout(() => { sp.classList.remove('show', 'hide'); setNode(STORY.start); }, 700); }, 3500);
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
    mapBtn.classList.add('show'); // map jump available during play
    backBtn.classList.toggle('show', history.length > 0);
    // start buffering this scene's possible next videos right away (kills the black "lag")
    (node.choices || []).forEach((c) => { const n = STORY.nodes[c.next]; if (n) preload(n.video); });
  }

  // fade through black, then switch scene
  function go(id, isBack) {
    // smoothest transition: freeze the current frame, switch the video underneath, then
    // cross-dissolve from the frozen frame to the new scene — no black gap at all.
    try {
      if (vid.videoWidth) {
        freeze.width = vid.videoWidth; freeze.height = vid.videoHeight;
        freeze.getContext('2d').drawImage(vid, 0, 0);
        freeze.classList.add('show');
      }
    } catch (e) {}
    setNode(id); // suspense music keeps playing; setNode() stops it as the new scene starts
    let done = false;
    const reveal = () => { if (done) return; done = true;
      freeze.classList.remove('show'); fadeEl.classList.remove('show', 'busy');
      vid.removeEventListener('loadeddata', reveal); vid.removeEventListener('playing', reveal); };
    if (vid.readyState >= 2) setTimeout(reveal, 40);
    else {
      vid.addEventListener('loadeddata', reveal); vid.addEventListener('playing', reveal);
      setTimeout(() => { if (!done) fadeEl.classList.add('show', 'busy'); }, 600); // spinner only if really slow
      setTimeout(reveal, 4000);
    }
  }

  function navigate(next) { // forward via a choice — remember decision points for BACK
    if (next === 'MAP') { showMap(); return; }              // special target → open journey map
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

  $('startBtn').onclick = showMap;            // NEW GAME → journey map
  $('playCh1').onclick = startChapter1;       // PLAY FROM START → Chapter 1
  $('mapHome').onclick = goHome;              // map → landing
  mapBtn.onclick = showMap;                   // in-game → open map
  // clickable scene nodes on the map → jump to that scene and keep playing
  mapEl.querySelectorAll('[data-go]').forEach((el) => { el.onclick = () => jump(el.getAttribute('data-go')); });
  $('muteBtn').onclick = () => {
    userMuted = !userMuted; $('muteBtn').textContent = userMuted ? '🔇' : '🔊'; applyMute();
  };

  window.__fmv = { go, navigate, back, get node() { return node; }, get curId() { return curId; },
    get choiceMode() { return choiceMode; }, get history() { return history.slice(); }, get muted() { return vid.muted; } };
})();
