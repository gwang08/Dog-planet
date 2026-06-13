// MAME: THE LAST SHIBA — interactive FMV engine.
// Plays a node's video → on end shows choices while LOOPING the last ~3s ON MUTE (no frozen
// frame, no repeated voice) forever until the player chooses → choice loads the next node.
// Subtitles type out, synced to real audio timestamps.
(function () {
  const $ = (id) => document.getElementById(id);
  const vid = $('vid'), subEl = $('sub'), choicesEl = $('choices'),
        noteEl = $('note'), startEl = $('start');

  let node = null, cues = [], choiceMode = false, tailStart = 0, userMuted = false;
  const TAIL = 3; // seconds of ending to loop while waiting for a choice

  function applyMute() { vid.muted = choiceMode ? true : userMuted; } // loop is always silent

  function playNode(id) {
    node = STORY.nodes[id];
    if (!node) return;
    choiceMode = false;
    applyMute();
    choicesEl.classList.remove('show');
    choicesEl.innerHTML = '';
    subEl.classList.remove('show');
    subEl.textContent = '';
    noteEl.textContent = node.note || '';
    noteEl.classList.toggle('show', !!node.note);
    cues = node.subs || [];
    if (vid.getAttribute('src') !== node.video) vid.setAttribute('src', node.video);
    try { vid.currentTime = 0; } catch (e) {}
    vid.play().catch(() => {});
  }

  function loopTail() { try { vid.currentTime = tailStart; } catch (e) {} vid.play().catch(() => {}); }

  function showChoices() {
    choiceMode = true;
    applyMute();                 // silence the looping tail
    subEl.classList.remove('show');
    tailStart = Math.max(0, (vid.duration || 16) - TAIL);
    const list = (node.choices && node.choices.length)
      ? node.choices : [{ t: '◀ Replay', next: STORY.start }];
    choicesEl.innerHTML = '';
    list.forEach((c, i) => {
      const b = document.createElement('button');
      b.className = 'choice';
      b.innerHTML = '<b>' + (i + 1) + '</b><span>' + c.t + '</span>';
      b.onclick = () => { playNode(c.next); };
      choicesEl.appendChild(b);
    });
    choicesEl.classList.add('show');
    loopTail();
  }

  vid.addEventListener('timeupdate', () => {
    const t = vid.currentTime, d = vid.duration || 16;
    if (choiceMode) { if (t >= d - 0.15) loopTail(); return; } // pre-empt the freeze: loop early
    // synced typewriter subtitles
    let cur = null;
    for (const c of cues) if (t >= c.s && t <= c.e + 0.6) cur = c;
    if (cur) {
      const dur = Math.max(0.3, cur.e - cur.s);
      const p = Math.max(0, Math.min(1, (t - cur.s) / dur));
      subEl.textContent = cur.t.slice(0, Math.ceil(cur.t.length * p));
      subEl.classList.add('show');
    } else {
      subEl.classList.remove('show');
    }
  });

  // failsafe: if it still reaches the very end, loop (choice mode) or open choices
  vid.addEventListener('ended', () => { if (choiceMode) loopTail(); else showChoices(); });

  // keyboard shortcuts for choices (1 / 2 …)
  addEventListener('keydown', (e) => {
    if (!choiceMode) return;
    const n = +e.key, btns = choicesEl.querySelectorAll('.choice');
    if (n >= 1 && n <= btns.length) btns[n - 1].click();
  });

  $('startBtn').onclick = () => {
    startEl.classList.add('hide');
    userMuted = false;
    // buffer + audio-unlock the first video behind the splash (uses this click gesture)
    const first = STORY.nodes[STORY.start];
    vid.setAttribute('src', first.video);
    vid.muted = true;
    vid.play().then(() => vid.pause()).catch(() => {});
    // show CHAPTER 1 card ~3.5s, fade, then start the scene with sound
    const sp = $('splash');
    sp.classList.add('show');
    setTimeout(() => {
      sp.classList.add('hide');
      setTimeout(() => { sp.classList.remove('show', 'hide'); playNode(STORY.start); }, 700);
    }, 3500);
  };
  $('muteBtn').onclick = () => {
    userMuted = !userMuted;
    $('muteBtn').textContent = userMuted ? '🔇' : '🔊';
    applyMute();
  };

  // expose for headless testing
  window.__fmv = { playNode, showChoices, loopTail, get node() { return node; }, get choiceMode() { return choiceMode; }, get muted() { return vid.muted; } };
})();
