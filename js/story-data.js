// MAME: THE LAST SHIBA — Chapter 1 branching FMV story graph (COMPLETE).
// node: { video, subs:[{s,e,t}], choices:[{t,next}], auto?, note? }
// `auto:true` → transition scene, auto-advances to choices[0].next (no buttons).
// subs use REAL timestamps transcribed from each scene's spoken audio.
const STORY = {
  start: 'V1',
  nodes: {
    V1: {
      video: 'assets/scenes/chapter1-v1-wakeup.mp4',
      subs: [
        { s: 2.0,  e: 4.6,  t: 'Ugh…' },
        { s: 5.1,  e: 7.0,  t: 'Where am I?' },
        { s: 10.5, e: 13.9, t: 'Is this… Dog Planet? My home?' },
        { s: 16.3, e: 17.5, t: "No, this isn't home." },
        { s: 17.8, e: 23.4, t: 'That airship — the Pump.fun mothership. So the legends were real.' },
      ],
      choices: [
        { t: 'Charge toward Pump.fun', next: 'V2A' },
        { t: 'Scout the city first', next: 'V2B' },
      ],
    },
    V2A: {
      video: 'assets/scenes/chapter1-v2a-charge.mp4', auto: true,
      subs: [
        { s: 0.5, e: 2.3, t: 'Pump.fun burned my home.' },
        { s: 2.6, e: 4.6, t: 'Time to burn it down.' },
        { s: 5.0, e: 5.9, t: 'No more hiding.' },
      ],
      choices: [ { t: 'Continue', next: 'V3' } ],
    },
    V2B: {
      video: 'assets/scenes/chapter1-v2b-scout.mp4', auto: true,
      subs: [
        { s: 1.5, e: 3.0, t: 'An operation this big…' },
        { s: 4.7, e: 6.8, t: 'I need to find its weak point first.' },
      ],
      choices: [ { t: 'Continue', next: 'V3' } ],
    },
    V3: {
      video: 'assets/scenes/chapter1-v3-moodeng.mp4',
      subs: [
        { s: 0.4,  e: 0.7,  t: 'Stop!' },
        { s: 1.0,  e: 3.3,  t: "You can't destroy that ship!" },
        { s: 5.1,  e: 7.2,  t: 'Step aside, Moo Deng.' },
        { s: 8.8,  e: 10.4, t: 'Pump.fun burned my home.' },
        { s: 10.5, e: 12.4, t: 'That ship goes down!' },
        { s: 13.4, e: 15.4, t: '…I can’t stop you, can I.' },
      ],
      choices: [
        { t: 'Reason with her — she’s not the enemy', next: 'V4' },
        { t: 'Warn her to stand down', next: 'V4' },
      ],
    },
    V4: {
      video: 'assets/scenes/chapter1-v4-penguin.mp4',
      subs: [
        { s: 0.8,  e: 3.4,  t: 'Time to tear this ship apart.' },
        { s: 4.6,  e: 7.7,  t: "Touch my ship and you're scrap, mutt." },
        { s: 8.5,  e: 12.4, t: 'I run Pump.fun. Pump and dump is forever.' },
        { s: 12.8, e: 14.9, t: 'Not anymore. This ship ends tonight.' },
      ],
      choices: [
        { t: 'Charge him with everything', next: 'V5A' },
        { t: 'Hesitate — hear his deal', next: 'V5B' },
      ],
    },
    V5A: {
      video: 'assets/scenes/chapter1-v5a-defeat.mp4', auto: true,
      subs: [
        { s: 0.4,  e: 4.5,  t: 'For Dog Planet — and every real meme you killed!' },
        { s: 10.9, e: 13.9, t: "You haven't won yet, Shiba!" },
      ],
      choices: [ { t: 'Chase him down', next: 'ENDTRUE' } ],
    },
    V5B: {
      video: 'assets/scenes/chapter1-v5b-trapped.mp4', auto: true,
      subs: [
        { s: 0.5, e: 2.2, t: 'Charging in blind?' },
        { s: 2.6, e: 3.2, t: 'Foolish.' },
        { s: 3.7, e: 6.1, t: 'Pump.fun always wins.' },
      ],
      choices: [ { t: '…', next: 'ENDBAD' } ],
    },
    ENDTRUE: {
      video: 'assets/scenes/chapter1-endtrue-chase.mp4',
      subs: [ { s: 3.2, e: 5.0, t: "This isn't finished!" } ],
      note: 'CHAPTER 1 COMPLETE — Chapter 2: COMING SOON',
      choices: [ { t: '◀ Play again', next: 'V1' } ],
    },
    ENDBAD: {
      video: 'assets/scenes/chapter1-endbad-caught.mp4',
      subs: [
        { s: 0.7, e: 1.9, t: 'MAME was captured.' },
        { s: 3.5, e: 6.5, t: 'Pump.fun tightens its grip on the galaxy.' },
      ],
      note: 'BAD ENDING',
      choices: [ { t: '↻ Try again', next: 'V1' } ],
    },
  },
};
