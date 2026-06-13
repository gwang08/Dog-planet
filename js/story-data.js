// MAME: THE LAST SHIBA — branching FMV story graph.
// Each node: { video, subs:[{s,e,t}], choices:[{t,next}], note? }
// subs use REAL timestamps transcribed from the clip's spoken audio (synced subtitles).
// To swap in a new video later: just change `video` (and its `subs`) — no engine changes.
const STORY = {
  start: 'V1',
  nodes: {
    // ── Scene 1: wake up in the city ───────────────────────────────
    V1: {
      video: 'assets/scenes/v1-full.mp4',
      subs: [
        { s: 3.6,  e: 4.7,  t: 'Ugh…' },
        { s: 5.3,  e: 6.7,  t: 'Where am I?' },
        { s: 7.0,  e: 8.3,  t: "This isn't Earth." },
        { s: 8.4,  e: 9.4,  t: "Everyone's running…" },
        { s: 9.4,  e: 10.7, t: 'clutching those pills.' },
        { s: 10.9, e: 14.6, t: 'And that airship — the Pump.fun mothership.' },
        { s: 14.8, e: 16.4, t: 'So the legends were real.' },
      ],
      choices: [
        { t: 'Run straight for the ship', next: 'V2A' },
        { t: 'Stay low and scout the area', next: 'V2B' },
      ],
    },

    // ── Placeholder branches (reuse intro video until real clips gen) ──
    V2A: {
      video: 'assets/scenes/v1-full.mp4',
      note: 'PLACEHOLDER — nhánh "Run for the ship" (sẽ thay video sau)',
      choices: [ { t: '◀ Chơi lại từ đầu', next: 'V1' } ],
    },
    V2B: {
      video: 'assets/scenes/v1-full.mp4',
      note: 'PLACEHOLDER — nhánh "Scout the area" (sẽ thay video sau)',
      choices: [ { t: '◀ Chơi lại từ đầu', next: 'V1' } ],
    },
  },
};
