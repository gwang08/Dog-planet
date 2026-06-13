// MAME: THE LAST SHIBA — Chapter 1 branching FMV story graph.
// node: { video, subs:[{s,e,t}], choices:[{t,next}], auto?, note? }
// `auto:true` → transition scene, auto-advances to choices[0].next (no buttons).
// subs use REAL timestamps transcribed from each scene's audio.
// NOTE: scenes V4→ENDs are TEMP placeholders (Veo daily quota hit at 8/15 clips);
//       swap their `video`/`subs`/`choices` back once the remaining clips are generated.
const STORY = {
  start: 'V1',
  nodes: {
    V1: {
      video: 'assets/scenes/chapter1-v1-wakeup.mp4',
      subs: [
        { s: 3.5,  e: 6.3,  t: 'Ugh…' },
        { s: 6.6,  e: 8.0,  t: 'Where am I?' },
        { s: 10.5, e: 14.2, t: 'Is this… Dog Planet? My home?' },
        { s: 16.5, e: 17.8, t: "This isn't home." },
        { s: 18.2, e: 23.4, t: 'That airship — the Pump.fun mothership. So the legends were real.' },
      ],
      choices: [
        { t: 'Charge toward Pump.fun', next: 'V2A' },
        { t: 'Scout the city first', next: 'V2B' },
      ],
    },
    V2A: {
      video: 'assets/scenes/chapter1-v2a-charge.mp4', auto: true,
      subs: [
        { s: 0.4, e: 2.3, t: 'Pump.fun burned my home.' },
        { s: 2.4, e: 4.6, t: 'Time to burn it down —' },
        { s: 4.9, e: 6.2, t: 'no more hiding.' },
      ],
      choices: [ { t: 'Continue', next: 'V3' } ],
    },
    V2B: {
      video: 'assets/scenes/chapter1-v2b-scout.mp4', auto: true,
      subs: [
        { s: 1.2, e: 3.9, t: 'An operation this big…' },
        { s: 4.6, e: 7.0, t: 'I need to find its weak point first.' },
      ],
      choices: [ { t: 'Continue', next: 'V3' } ],
    },
    V3: {
      video: 'assets/scenes/chapter1-v3-moodeng.mp4',
      subs: [
        { s: 0.4,  e: 0.8,  t: 'Stop!' },
        { s: 0.95, e: 3.4,  t: "You can't destroy that ship!" },
        { s: 5.1,  e: 7.2,  t: 'Step aside, Moo Deng.' },
        { s: 8.7,  e: 10.4, t: 'Pump.fun burned my home.' },
        { s: 10.6, e: 12.2, t: 'That ship goes down.' },
        { s: 13.3, e: 15.5, t: '…I can’t stop you, can I.' },
      ],
      choices: [
        { t: 'Reason with her — she’s not the enemy', next: 'V4' },
        { t: 'Warn her to stand down', next: 'V4' },
      ],
    },

    // ─── TEMP placeholders below (awaiting Veo quota reset) ───
    V4: {
      video: 'assets/scenes/chapter1-v1-wakeup.mp4',
      note: 'CÒN TIẾP — cảnh PENGUIN đang chờ gen (hết quota Veo hôm nay)',
      choices: [ { t: '◀ Chơi lại từ đầu', next: 'V1' } ],
    },
    V5A: { video: 'assets/scenes/chapter1-v1-wakeup.mp4', note: 'COMING SOON', choices: [ { t: '◀ Replay', next: 'V1' } ] },
    V5B: { video: 'assets/scenes/chapter1-v1-wakeup.mp4', note: 'COMING SOON', choices: [ { t: '◀ Replay', next: 'V1' } ] },
    ENDTRUE: { video: 'assets/scenes/chapter1-v1-wakeup.mp4', note: 'COMING SOON', choices: [ { t: '◀ Replay', next: 'V1' } ] },
    ENDBAD: { video: 'assets/scenes/chapter1-v1-wakeup.mp4', note: 'COMING SOON', choices: [ { t: '◀ Replay', next: 'V1' } ] },
  },
};
