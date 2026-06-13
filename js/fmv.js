// MAME: THE LAST SHIBA — interactive FMV engine.
// Plays a node's video → on end shows choices while LOOPING the last ~3s ON MUTE (no frozen
// frame, no repeated voice) forever until the player chooses → choice loads the next node.
// Subtitles type out synced to real audio timestamps. Smooth fade between scenes.
// BACK button returns to the previous decision so you can take a different path.
(function () {
  const $ = (id) => document.getElementById(id);
  const vid = $('vid'), subEl = $('sub'), choicesEl = $('choices'),
        noteEl = $('note'), startEl = $('start'), fadeEl = $('fade'), backBtn = $('backBtn');

  let node = null, curId = null, cues = [], choiceMode = false, tailStart = 0,
      userMuted = false, history = [];
  const TAIL = 3; // seconds of ending to loop while waiting for a choice

  function applyMute() { vid.muted = choiceMode ? true : userMuted; } // loop is always silent

  function setNode(id) {
    node = STORY.nodes[id]; curId = id;
    if (!node) return;
    choiceMode = false; applyMute();
    choicesEl.classList.remove('show'); choicesEl.innerHTML = '';
    subEl.classList.remove('show'); subEl.textContent = '';
    noteEl.textContent = node.note || ''; noteEl.classList.toggle('show', !!node.note);
    cues = node.subs || [];
    if (vid.getAttribute('src') !== node.video) vid.setAttribute('src', node.video);
    try { vid.currentTime = 0; } catch (e) {}
    vid.play().catch(() => {});
    backBtn.classList.toggle('show', history.length > 0);
  }

  // fade through black, then switch scene
  function go(id, isBack) {
    fadeEl.classList.add('show');
    setTimeout(() => { setNode(id); setTimeout(() => fadeEl.classList.remove('show'), 60); }, 420);
  }

  function navigate(next) { // forward via a choice — remember decision points for BACK
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

  $('startBtn').onclick = () => {
    startEl.classList.add('hide');
    userMuted = false; history = [];
    const first = STORY.nodes[STORY.start];
    vid.setAttribute('src', first.video); vid.muted = true;
    vid.play().then(() => vid.pause()).catch(() => {});
    const sp = $('splash'); sp.classList.add('show');
    setTimeout(() => {
      sp.classList.add('hide');
      setTimeout(() => { sp.classList.remove('show', 'hide'); setNode(STORY.start); }, 700);
    }, 3500);
  };
  $('muteBtn').onclick = () => {
    userMuted = !userMuted; $('muteBtn').textContent = userMuted ? '🔇' : '🔊'; applyMute();
  };

  window.__fmv = { go, navigate, back, get node() { return node; }, get curId() { return curId; },
    get choiceMode() { return choiceMode; }, get history() { return history.slice(); }, get muted() { return vid.muted; } };
})();
