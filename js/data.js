// Dog-planet — all story & balance data (chapters, dialogue, boss configs)

// dialogue speaker -> portrait + name + style
const CHARS = {
  mame:    { name:'MAME',     img:'mame',          side:'left',  cls:'ally' },
  moodeng: { name:'MOO DENG', img:'moodeng',       side:'left',  cls:'ally' },
  narr:    { name:'',         img:null,            side:'left',  cls:'narr' },
  fartcoin:{ name:'FARTCOIN', img:'boss-fartcoin', side:'right', cls:'foe' },
  gigachad:{ name:'GIGACHAD', img:'boss-gigachad', side:'right', cls:'foe' },
  whale:   { name:'WHITE WHALE', img:'boss-whale', side:'right', cls:'foe' },
  pepe:    { name:'PEPE LORD', img:'boss-pepe',    side:'right', cls:'foe' },
  penguin: { name:'PENGUIN',  img:'boss-penguin',  side:'right', cls:'foe' },
};

// 4 player skills (unlocked progressively, 1 per chapter)
const SKILLS = [
  { name:'Moon Blaster', icon:'🔫', cd:90,  energy:12 },  // ranged burst
  { name:'Paw Smash',    icon:'💥', cd:300, energy:25 },  // AoE stun
  { name:'HODL Shield',  icon:'🛡️', cd:480, energy:30 },  // invuln 2s
  { name:'Diamond Dash', icon:'🚀', cd:360, energy:28 },  // dash + counter
];

// helper to build a boss attack
const A = (type,o={}) => Object.assign({type},o);

const CHAPTERS = [
  { // 1
    title:'CHAPTER 1', world:'ASHES OF DOG PLANET',
    bg:{c1:'#1c0f0a',c2:'#0a0604',grid:'#ff7a3c1f',accent:'#ff7a3c'},
    intro:[
      {who:'narr', text:'The market bled red. Pump Planet rose — and Dog Planet, the cradle of true meme culture, was burned to ash.'},
      {who:'mame', text:'…Where am I? Why does this ruin feel like home?'},
      {who:'narr', text:'A broken hologram flickers among the embers.'},
    ],
    beats:[
      [{who:'narr', text:'A fallen statue of FLOKI, the elder. Its eyes still glow faintly.'},
       {who:'mame', text:'These legends… I feel like I knew them. But I can’t remember anything.'}],
      [{who:'narr', text:'A hologram sputters to life.'},
       {who:'mame', text:'"Find your roots on Pump Planet"… then that’s where I’m going.'}],
      [{who:'narr', text:'Toxic green fog rolls in. Something bloated and angry stirs inside it.'}],
    ],
    obj:'Explore the ruins — reach the fog',
    bossIntro:[
      {who:'fartcoin', text:'Hrrk… fresh meat. The hype always wins, little dog.'},
      {who:'mame', text:'Real memes never needed hype. Out of my way.'},
    ],
    bossOutro:[
      {who:'fartcoin', text:'Pop… the hype… fades…'},
      {who:'mame', text:'One down. Onward to Pump Planet.'},
    ],
    boss:{ key:'fartcoin', hp:230, speed:0.9, atkCd:95,
      attacks:[A('aimed',{burst:2}),A('spread',{count:5}),A('ring')],
      phases:[{at:0.5, cdMul:0.8, add:[A('slam')]}] },
  },
  { // 2
    title:'CHAPTER 2', world:'THE HYPE BAZAAR',
    bg:{c1:'#140a22',c2:'#070310',grid:'#b06bff22',accent:'#b06bff'},
    intro:[
      {who:'narr', text:'A neon market in space. Fake billboards scream "100000x!!" as coins are minted and dumped in seconds.'},
      {who:'moodeng', text:'Stop! You reek of Pump tech. Are you one of them?'},
      {who:'mame', text:'I don’t even know what I am. That’s why I’m heading to the Core.'},
      {who:'moodeng', text:'…Fine. Prove it. Get past Gigachad.'},
    ],
    beats:[
      [{who:'narr', text:'Crowds of shill-bots cheer at empty charts.'},
       {who:'moodeng', text:'None of this is real. They forgot what memes were even for.'}],
      [{who:'mame', text:'Then I’ll remind them. Where’s this Gigachad?'},
       {who:'moodeng', text:'Flexing by the gate. Try not to die, pup.'}],
    ],
    obj:'Cross the Bazaar — find Gigachad',
    bossIntro:[
      {who:'gigachad', text:'You actually think you can lift with me? Cute.'},
      {who:'mame', text:'Less talk. More liquidation.'},
    ],
    bossOutro:[
      {who:'gigachad', text:'Tch… you actually… lift…'},
      {who:'moodeng', text:'Okay. Maybe you’re not so bad. I’m coming with you.'},
    ],
    boss:{ key:'gigachad', hp:320, speed:1.15, atkCd:88,
      attacks:[A('charge'),A('slam'),A('aimed',{burst:3})],
      phases:[{at:0.5, cdMul:0.72, spdMul:1.15, add:[A('charge')]}] },
  },
  { // 3
    title:'CHAPTER 3', world:'LIQUIDITY OCEAN',
    bg:{c1:'#06182a',c2:'#020a14',grid:'#36d6ff22',accent:'#36d6ff'},
    intro:[
      {who:'narr', text:'A frozen sea of locked liquidity. Icebergs of dead coins drift in the dark blue.'},
      {who:'mame', text:'A memory fragment… a lab… a black shiba in a tank. Is that… me?'},
      {who:'moodeng', text:'Whatever you came from, you choose what you become. Keep moving.'},
    ],
    beats:[
      [{who:'narr', text:'The ice cracks. A colossal shadow circles beneath.'},
       {who:'mame', text:'Something big guards this vault.'}],
      [{who:'moodeng', text:'White Whale. It hoards everything and gives nothing. Very on-brand for Pump.'}],
    ],
    obj:'Cross the frozen sea — wake the guardian',
    bossIntro:[
      {who:'whale', text:'The tide takes all. You will sink like the rest.'},
      {who:'mame', text:'I HODL. Always. Bring it.'},
    ],
    bossOutro:[
      {who:'whale', text:'You hold… even against the tide…'},
      {who:'mame', text:'Diamonds don’t melt.'},
    ],
    boss:{ key:'whale', hp:430, speed:0.8, atkCd:90,
      attacks:[A('beams',{count:4}),A('slam'),A('spread',{count:7})],
      phases:[{at:0.5, cdMul:0.78, add:[A('ring')]}] },
  },
  { // 4
    title:'CHAPTER 4', world:'PUMP CITADEL',
    bg:{c1:'#0a1f12',c2:'#02080a',grid:'#39d98a22',accent:'#39d98a'},
    intro:[
      {who:'narr', text:'A neon-green fortress orbits Pump Planet. The PUMP-01 ship looms at the dock.'},
      {who:'mame', text:'The throne is close. I can feel the answer waiting.'},
      {who:'moodeng', text:'Their high sorcerer guards the inner gate. Be careful.'},
    ],
    beats:[
      [{who:'narr', text:'Guards mutter: "the Last Shiba came back… the Overlord will want him alive."'},
       {who:'mame', text:'They know me. What did Pump do to me?'}],
      [{who:'pepe', text:'Far enough, prototype. None pass the Frog Lord.'}],
    ],
    obj:'Infiltrate the Citadel — reach the inner gate',
    bossIntro:[
      {who:'pepe', text:'Feels good to crush a legend. You should have stayed buried.'},
      {who:'mame', text:'Move aside, frog. The Overlord is mine.'},
    ],
    bossOutro:[
      {who:'pepe', text:'Impossible… the Overlord said you were just… a weapon…'},
      {who:'mame', text:'Weapon? …What does that mean? To the throne.'},
    ],
    boss:{ key:'pepe', hp:540, speed:1.1, atkCd:80,
      attacks:[A('spread',{count:8}),A('aimed',{burst:3}),A('beams',{count:5}),A('summon',{count:2})],
      phases:[{at:0.5, cdMul:0.7, spdMul:1.1, add:[A('charge')]}] },
  },
  { // 5
    title:'CHAPTER 5', world:'THE PUMP CORE',
    bg:{c1:'#160826',c2:'#04020a',grid:'#ff3b6b22',accent:'#ff3b6b'},
    intro:[
      {who:'narr', text:'The glowing heart of Pump Planet. Screens replay every coin ever rugged. A small throne turns…'},
      {who:'penguin', text:'Welcome to the Core, MAME. I am the Overlord of Pump Planet. You came a long way… to lose.'},
      {who:'mame', text:'You burned Dog Planet. You ends here, Penguin.'},
      {who:'penguin', text:'Everything real dies. Hype is forever. Let me show you.'},
    ],
    beats:[],
    obj:'Face the Overlord',
    bossIntro:[
      {who:'penguin', text:'No more running, Last Shiba. Freeze.'},
      {who:'mame', text:'For Dog Planet. For real memes. Let’s finish this.'},
    ],
    bossOutro:[
      {who:'penguin', text:'Impossible… a meme with… a soul…'},
      {who:'mame', text:'I’m the last real one. And I choose what I become.'},
      {who:'moodeng', text:'Come on, hero. Let’s go home and rebuild it — for real.'},
    ],
    boss:{ key:'penguin', hp:700, speed:1.0, atkCd:78, final:true,
      attacks:[A('aimed',{burst:3}),A('spread',{count:7})],
      phases:[
        {at:0.66, cdMul:0.82, add:[A('beams',{count:5}),A('summon',{count:2})]},
        {at:0.33, cdMul:0.66, spdMul:1.2, add:[A('ring'),A('charge')]},
      ] },
  },
];
