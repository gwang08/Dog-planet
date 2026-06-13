// MAME: THE LAST SHIBA — Chapter 1 branching FMV story graph (COMPLETE).
// node: { video, subs:[{s,e,t}], choices:[{t,next}], auto?, note? }
// `auto:true` → transition scene, auto-advances to choices[0].next (no buttons).
// subs use REAL timestamps transcribed from each scene's spoken audio.
const STORY = {
  start: 'V1',
  nodes: {
    V1: {
      video: 'assets/scenes/ch1/chapter1-v1-wakeup.mp4',
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
      video: 'assets/scenes/ch1/chapter1-v2a-charge.mp4', auto: true,
      subs: [
        { s: 0.3, e: 2.3, t: 'Pump.fun burned my home.' },
        { s: 3.6, e: 5.6, t: 'Time to burn it down.' },
        { s: 6.3, e: 7.9, t: 'No more hiding.' },
      ],
      choices: [ { t: 'Continue', next: 'V3' } ],
    },
    V2B: {
      video: 'assets/scenes/ch1/chapter1-v2b-scout.mp4', auto: true,
      subs: [
        { s: 3.7, e: 5.3, t: 'An operation this big…' },
        { s: 6.0, e: 8.1, t: 'I need to find its weak point first.' },
      ],
      choices: [ { t: 'Continue', next: 'V3' } ],
    },
    V3: {
      video: 'assets/scenes/ch1/chapter1-v3-moodeng.mp4',
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
      video: 'assets/scenes/ch1/chapter1-v4-penguin.mp4',
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
      video: 'assets/scenes/ch1/chapter1-v5a-defeat.mp4', auto: true,
      subs: [
        { s: 0.4,  e: 4.5,  t: 'For Dog Planet — and every real meme you killed!' },
        { s: 10.9, e: 13.9, t: "You haven't won yet, Shiba!" },
      ],
      choices: [ { t: 'Chase him down', next: 'ENDTRUE' } ],
    },
    V5B: {
      video: 'assets/scenes/ch1/chapter1-v5b-trapped.mp4', auto: true,
      subs: [
        { s: 0.5, e: 2.2, t: 'Charging in blind?' },
        { s: 2.6, e: 3.2, t: 'Foolish.' },
        { s: 3.7, e: 6.1, t: 'Pump.fun always wins.' },
      ],
      choices: [ { t: '…', next: 'ENDBAD' } ],
    },
    ENDTRUE: {
      video: 'assets/scenes/ch1/chapter1-endtrue-chase.mp4',
      subs: [
        { s: 3.0, e: 6.9,  t: "This isn't finished!" },
        { s: 8.5, e: 13.1, t: 'Run all you want, Penguin — I’ll chase you to the moon and back!' },
      ],
      note: 'CHAPTER 1 COMPLETE',
      choices: [ { t: '▶ Continue to Chapter 2', next: 'C2V1' }, { t: '🗺 Journey Map', next: 'MAP' }, { t: '↻ Play from start', next: 'V1' } ],
    },
    ENDBAD: {
      video: 'assets/scenes/ch1/chapter1-endbad-caught.mp4',
      subs: [
        { s: 0.7, e: 1.9, t: 'MAME was captured.' },
        { s: 3.5, e: 6.5, t: 'Pump.fun tightens its grip on the galaxy.' },
      ],
      note: 'BAD ENDING',
      choices: [ { t: '↻ Try Again — back to the choice', next: 'V4' }, { t: '🗺 Journey Map', next: 'MAP' } ],
    },

    // ═══════════════ CHAPTER 2 — DARK SIDE OF THE MOON ═══════════════
    C2V1: {
      video: 'assets/scenes/ch2/chapter2-v1.mp4',
      subs: [
        { s: 0.8, e: 2.9, t: 'So this is where Pump.fun really hides.' },
        { s: 3.7, e: 5.3, t: 'The dark side of the moon.' },
        { s: 5.6, e: 8.2, t: 'End of the line — for Penguin, and for Pump.fun.' },
      ],
      choices: [
        { t: 'Storm the front gate', next: 'C2V2A' },
        { t: 'Find a quiet way in', next: 'C2V2B' },
      ],
    },
    C2V2A: {
      video: 'assets/scenes/ch2/chapter2-v2a.mp4', auto: true,
      subs: [ { s: 3.0, e: 3.8, t: 'No more sneaking.' }, { s: 4.5, e: 6.9, t: "I'm walking right through the front door!" } ],
      choices: [ { t: 'Continue', next: 'C2V3' } ],
    },
    C2V2B: {
      video: 'assets/scenes/ch2/chapter2-v2b.mp4', auto: true,
      subs: [ { s: 1.0, e: 3.5, t: 'Cameras everywhere…' }, { s: 4.0, e: 7.5, t: "I'll slip in through the cargo airlock." } ],
      choices: [ { t: 'Continue', next: 'C2V3' } ],
    },
    C2V3: {
      video: 'assets/scenes/ch2/chapter2-v3.mp4', auto: true,
      subs: [
        { s: 0.8,  e: 3.0,  t: 'You followed me all the way to the moon?' },
        { s: 4.2,  e: 6.1,  t: 'Persistent little mutt.' },
        { s: 6.8,  e: 9.1,  t: "Where's the Pump.fun core, Penguin?" },
        { s: 9.9,  e: 12.2, t: "Oh, I'm done with you." },
        { s: 13.5, e: 15.2, t: 'Meet someone who isn’t…' },
      ],
      choices: [ { t: 'Continue', next: 'C2V4' } ],
    },
    C2V4: {
      video: 'assets/scenes/ch2/chapter2-v4.mp4',
      subs: [
        { s: 0.3, e: 2.9, t: 'Tung tung tung… Sahur. You should not have come, little dog.' },
        { s: 3.3, e: 5.9, t: 'A walking log guards Pump.fun now? Step aside.' },
        { s: 6.3, e: 8.6, t: 'Those who ignore the call… get the bat.' },
      ],
      choices: [
        { t: 'Charge him with everything', next: 'C2V5A' },
        { t: 'Hesitate', next: 'C2V5B' },
      ],
    },
    C2V5A: {
      video: 'assets/scenes/ch2/chapter2-v5a.mp4', auto: true,
      subs: [ { s: 0.7, e: 1.7, t: 'For Dog Planet —' }, { s: 2.6, e: 4.6, t: 'your hypnosis ends here!' }, { s: 5.7, e: 7.9, t: 'Tung… tung… crack.' } ],
      choices: [ { t: 'Chase the core', next: 'C2ENDTRUE' } ],
    },
    C2V5B: {
      video: 'assets/scenes/ch2/chapter2-v5b.mp4', auto: true,
      subs: [ { s: 2.2, e: 8.0, t: "You ignored the call. Now you're just firewood, pup." } ],
      choices: [ { t: '…', next: 'C2ENDBAD' } ],
    },
    C2ENDTRUE: {
      video: 'assets/scenes/ch2/chapter2-endtrue.mp4',
      subs: [
        { s: 2.3,  e: 4.1,  t: 'The Pump.fun core…' },
        { s: 5.1,  e: 6.3,  t: "It's alive." },
        { s: 7.3,  e: 9.2,  t: "And it's… fleeing deeper." },
        { s: 11.5, e: 12.4, t: "This isn't over." },
        { s: 12.8, e: 15.0, t: "I'm coming for the heart of it all." },
      ],
      note: 'CHAPTER 2 COMPLETE — Chapter 3: COMING SOON',
      choices: [ { t: '🗺 Journey Map', next: 'MAP' }, { t: '↻ Play Chapter 2 again', next: 'C2V1' } ],
    },
    C2ENDBAD: {
      video: 'assets/scenes/ch2/chapter2-endbad.mp4',
      subs: [ { s: 2.5, e: 4.1, t: 'MAME fell on the moon.' }, { s: 4.7, e: 8.0, t: "Pump.fun's grip tightens across the galaxy." } ],
      note: 'BAD ENDING',
      choices: [ { t: '↻ Try Again — back to the choice', next: 'C2V4' }, { t: '🗺 Journey Map', next: 'MAP' } ],
    },
  },
};

// chapter config for the journey map + splash + in-game roadmap (data-driven)
const CHAPTERS = {
  1: { start: 'V1', title: 'CHAPTER 1', sub: 'ASHES OF DOG PLANET',
       roadmap: [['Wake Up','V1'],['Charge','V2A'],['Scout','V2B'],['Moo Deng','V3'],['Penguin','V4'],['🏆 True Ending','V5A'],['💀 Bad Ending','V5B']] },
  2: { start: 'C2V1', title: 'CHAPTER 2', sub: 'DARK SIDE OF THE MOON',
       roadmap: [['Arrival','C2V1'],['Storm','C2V2A'],['Scout','C2V2B'],['Penguin','C2V3'],['Tung Sahur','C2V4'],['🏆 True Ending','C2V5A'],['💀 Bad Ending','C2V5B']] },
};
