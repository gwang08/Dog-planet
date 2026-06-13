// Dog-planet — flow: menu → chapter splash → explore (+story) → boss duel → victory → ... → win
const ST = { MENU:0, SPLASH:1, EXPLORE:2, BOSS:3, VICTORY:4, WIN:5, OVER:6 };
let gs = ST.MENU, scene = null, chIdx = 0, splashT = 0;
let saved = +(localStorage.getItem('dp_chapter')||0);

const overlays = ['menu','splash','vn','victory','win','over'];
function hideAll(){ overlays.forEach(k=>$(k).style.display='none'); }
function show(id){ $(id).style.display='flex'; }
function setHUD(on){ $('hud').style.display=on?'block':'none'; $('skills').style.display=on?'flex':'none';
  $('dodgeBtn').style.display=on?'flex':'none'; }

// ---- visual-novel dialogue ----
let dlg=null, dIdx=0, dCb=null, typing=false, typeTimer=null, fullLine='', lastAlly='mame', lastFoe=null;
function playDialogue(lines, cb){
  if(!lines||!lines.length){ cb&&cb(); return; }
  dlg=lines; dIdx=0; dCb=cb||null; hideAll(); show('vn'); renderLine();
}
function renderLine(){
  const L=dlg[dIdx]; if(!L){ endDialogue(); return; }
  const c=CHARS[L.who]||CHARS.narr;
  if(c.cls==='ally') lastAlly=L.who; if(c.cls==='foe') lastFoe=L.who;
  const li=$('vnLeft'), ri=$('vnRight');
  const lk=CHARS[lastAlly], rk=lastFoe?CHARS[lastFoe]:null;
  if(lk&&lk.img){ li.src='assets/'+lk.img+'.png'; li.style.display='block'; } else li.style.display='none';
  if(rk&&rk.img){ ri.src='assets/'+rk.img+'.png'; ri.style.display='block'; } else ri.style.display='none';
  const right=c.side==='right';
  li.classList.toggle('dim', right); ri.classList.toggle('dim', !right);
  $('vnName').className='vn-name '+c.cls; $('vnName').textContent=c.name;
  $('vnHint').textContent = dIdx>=dlg.length-1 ? '▸ tap to begin' : '▸ tap to continue';
  type($('vnText'), L.text, c.cls==='foe'?170:c.cls==='ally'?460:300);
}
function type(el,text,blip){ clearInterval(typeTimer); typing=true; fullLine=text; let i=0; el.textContent='';
  typeTimer=setInterval(()=>{ i++; el.textContent=fullLine.slice(0,i);
    if(i%2===0&&fullLine[i-1]!==' ') beep(blip,0.03,'square',0.03);
    if(i>=fullLine.length){ clearInterval(typeTimer); typing=false; } },18); }
function advanceDialogue(){ if(!dlg) return; if(typing){ clearInterval(typeTimer); typing=false; $('vnText').textContent=fullLine; return; }
  dIdx++; if(dIdx>=dlg.length) endDialogue(); else renderLine(); }
function endDialogue(){ const cb=dCb; dlg=null; dCb=null; clearInterval(typeTimer); typing=false; $('vn').style.display='none'; cb&&cb(); }

// ---- flow ----
function startGame(i){ chIdx=i; startChapter(i); }
function startChapter(i){
  chIdx=i; const ch=CHAPTERS[i]; scene=null; setHUD(false); hideAll();
  $('splashCh').textContent='CHAPTER '+(i+1); $('splashWd').textContent=ch.world;
  show('splash'); gs=ST.SPLASH; splashT=110;
}
function afterSplash(){ if(gs!==ST.SPLASH) return; const ch=CHAPTERS[chIdx];
  hideAll(); EX.start(ch); scene='explore'; gs=ST.EXPLORE; }   // hide the splash overlay, then run EX
function startBoss(){ const ch=CHAPTERS[chIdx];
  playDialogue(ch.bossIntro, ()=>{ CB.start(ch); buildSkills(); scene='boss'; gs=ST.BOSS; setHUD(true); }); }
function onBossWin(){ const ch=CHAPTERS[chIdx]; setHUD(false); scene=null;
  saved=Math.max(saved, chIdx+1); localStorage.setItem('dp_chapter',saved);
  playDialogue(ch.bossOutro, ()=>{
    if(ch.boss.final){ $('winText').textContent='MAME shattered the Pump Core. Dog Planet’s seeds drift free to replant true meme culture. The Last Shiba found his roots — and chose what to become.'; hideAll(); show('win'); gs=ST.WIN; return; }
    const nx=CHAPTERS[chIdx+1]; const s=SKILLS[Math.min(chIdx+1,3)];
    $('vicSkill').textContent='NEW SKILL: '+s.icon+' '+s.name;
    $('vicText').textContent='Next: '+nx.world; hideAll(); show('victory'); gs=ST.VICTORY;
  });
}
function onBossLose(){ setHUD(false); scene=null; hideAll(); show('over'); gs=ST.OVER; }

// ---- skill buttons ----
function buildSkills(){ const box=$('skills'); box.innerHTML=''; const n=CB.p.skillsN;
  for(let i=0;i<n;i++){ const s=SKILLS[i]; const el=document.createElement('div'); el.className='skbtn'; el.dataset.i=i;
    el.innerHTML=s.icon+'<small>'+(i+1)+'</small><div class="cd" style="display:none"></div>';
    el.onclick=()=>CB.useSkill(i); box.appendChild(el); }
}
function updateHUD(){ const p=CB.p, b=CB.boss; if(!p||!b) return;
  $('hpFill').style.width=clamp(p.hp/p.maxHp,0,1)*100+'%';
  $('enFill').style.width=clamp(p.en/p.maxEn,0,1)*100+'%';
  $('bossFill').style.width=clamp(b.hp/b.maxHp,0,1)*100+'%';
  $('bossName').textContent=b.name;
  const btns=$('skills').children;
  for(let i=0;i<btns.length;i++){ const cd=btns[i].querySelector('.cd'); const t=p.sk[i];
    const ready=t<=0&&p.en>=SKILLS[i].energy; btns[i].classList.toggle('ready',ready);
    if(t>0){ cd.style.display='flex'; cd.textContent=Math.ceil(t/60); } else cd.style.display='none'; }
}

// ---- main loop ----
function loop(ts){
  const dtms = lastTs?ts-lastTs:16; lastTs=ts; DT=clamp(dtms/16.67,0.4,2.2); frame++;
  if(cam.shake>0.2) cam.shake*=0.88; else cam.shake=0;
  const ox=cam.shake>0.2?(Math.random()-0.5)*cam.shake:0, oy=cam.shake>0.2?(Math.random()-0.5)*cam.shake:0;
  // update
  // splash waits for the player to press CONTINUE (no auto-skip)
  if(!dlg){ if(gs===ST.EXPLORE) EX.update(); else if(gs===ST.BOSS){ CB.update(); updateHUD(); } }
  // draw scene
  ctx.save(); ctx.translate(ox,oy);
  if(scene==='explore') EX.draw(); else if(scene==='boss') CB.draw(); else { ctx.fillStyle='#05060f'; ctx.fillRect(-50,-50,VW+100,VH+100); }
  updateParticles(); drawParticles(); updateFloaters(); drawFloaters();
  ctx.restore();
  requestAnimationFrame(loop);
}

// ---- input wiring ----
addEventListener('keydown', e=>{ const k=e.key.toLowerCase();
  if(dlg){ if(k===' '||k==='enter'||k==='arrowright'){ e.preventDefault(); advanceDialogue(); } return; }
  if(gs===ST.SPLASH){ if(k===' '||k==='enter'){ e.preventDefault(); afterSplash(); } return; }
  if(gs===ST.EXPLORE && EX.cap){ if(k===' '||k==='enter'||k==='arrowright'){ e.preventDefault(); EX.advanceCap(); } return; }
  if(gs===ST.BOSS){ if(k===' '){ e.preventDefault(); CB.dodge(); }
    else if(k>='1'&&k<='4') CB.useSkill(+k-1); }
});
cv.addEventListener('click', ()=>{ if(gs===ST.EXPLORE && EX.cap) EX.advanceCap(); });
cv.addEventListener('touchend', ()=>{ if(gs===ST.EXPLORE && EX.cap) EX.advanceCap(); });
$('vn').addEventListener('click', e=>{ if(e.target.id==='vnSkip') return; advanceDialogue(); });
$('vnSkip').onclick=()=>{ while(dlg) advanceDialogue(); };
$('dodgeBtn').onclick=()=>{ if(gs===ST.BOSS) CB.dodge(); };
$('playBtn').onclick=()=>{ saved=0; localStorage.setItem('dp_chapter',0); startGame(0); };
$('contBtn').onclick=()=>startGame(Math.min(saved,CHAPTERS.length-1));
$('splashNext').onclick=()=>afterSplash();
$('splash').addEventListener('click', e=>{ if(e.target.id!=='splashNext') afterSplash(); });
$('vicNext').onclick=()=>startChapter(chIdx+1);
$('winAgain').onclick=()=>startGame(0);
$('overRetry').onclick=()=>{ const ch=CHAPTERS[chIdx]; CB.start(ch); buildSkills(); scene='boss'; gs=ST.BOSS; setHUD(true); hideAll(); };
$('overHome').onclick=$('winHome').onclick=()=>goMenu();
$('homeBtn').onclick=()=>goMenu();
$('muteBtn').onclick=()=>{ muted=!muted; $('muteBtn').textContent=muted?'🔇':'🔊'; };
function goMenu(){ setHUD(false); scene=null; hideAll(); show('menu'); gs=ST.MENU;
  $('homeBtn').style.display='none'; $('muteBtn').style.display='none'; }

// boot
if(saved>0) $('contBtn').style.display='inline-block';
// show home/mute only in-game
const _show=show; // (home/mute toggled per state)
function refreshTopBtns(){ const ing = gs!==ST.MENU; $('homeBtn').style.display=ing?'flex':'none'; $('muteBtn').style.display=ing?'flex':'none'; }
setInterval(refreshTopBtns, 200);
requestAnimationFrame(loop);
