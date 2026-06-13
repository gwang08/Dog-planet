// Dog-planet — EXPLORE: cinematic SIDE-SCROLL town (real painted backdrop). Walk MAME right, meet locals,
// talk with film-style subtitles over the scene, reach the arena.
const EX = {
  ch:null, x:40, len:2600, exitX:2600, speed:3.6, face:1, busy:true, fade:1,
  npcs:[], bg:'bg-city', cap:null, capCb:null, capFull:'', capTyped:'', capWho:'narr', typing:false, _ti:0, walk:0,

  start(ch){
    this.ch=ch; this.x=60; this.face=1; this.busy=true; this.fade=1; this.walk=0;
    const sprites=['moodeng','npc-bear','npc-wolf','npc-elder','npc-merchant','npc-stray'];
    const names  =['MOO DENG','BERN','MR. WOLF','ELDER','MERCHANT','STRAY'];
    const beats=ch.beats||[];
    this.npcs=beats.map((ls,i)=>({ x:620+i*640, spr:sprites[i%sprites.length], name:names[i%names.length], lines:ls, done:false }));
    this.exitX=(this.npcs.length?this.npcs[this.npcs.length-1].x:300)+560;
    this.len=this.exitX+160;
    cam.x=this.x; cam.y=0;
    // opening: fade in from black, then the intro plays as subtitles
    this.say(ch.intro, ()=>{ this.busy=false; });
  },

  ground(){ return VH*0.76; },

  // ---- film-style subtitle captions ----
  say(lines, cb){ if(!lines||!lines.length){ cb&&cb(); return; } this.cap={lines,idx:0}; this.capCb=cb||null; this.busy=true; this.line(); },
  line(){ const L=this.cap.lines[this.cap.idx]; this.capFull=L.text; this.capWho=L.who; this.capTyped=''; this.typing=true; this._ti=0; },
  advanceCap(){ if(!this.cap) return;
    if(this.typing){ this.capTyped=this.capFull; this.typing=false; return; }
    this.cap.idx++; if(this.cap.idx>=this.cap.lines.length){ const cb=this.capCb; this.cap=null; this.capCb=null; this.busy=false; cb&&cb(); }
    else { this.line(); beep(this.capWho==='mame'?460:this.capWho==='narr'?300:200,0.04,'square',0.03); } },

  update(){
    if(this.fade>0) this.fade=Math.max(0,this.fade-0.018*DT);
    if(this.typing){ this._ti+=DT*0.55; const n=Math.floor(this._ti);
      if(n>=this.capFull.length){ this.capTyped=this.capFull; this.typing=false; } else this.capTyped=this.capFull.slice(0,n); }
    if(this.busy){ camFollow(this.x,0); return; }
    const mv=moveVec();
    if(mv.x){ this.x=clamp(this.x+mv.x*this.speed*DT,30,this.len); this.face=mv.x<0?-1:1; this.walk+=DT; } else this.walk=0;
    camFollow(this.x,0);
    for(const n of this.npcs){ if(!n.done && Math.abs(this.x-n.x)<96){ n.done=true; beep(820,0.12,'sine',0.05);
      this.say(n.lines); break; } }
    const all=this.npcs.every(c=>c.done);
    if(all && this.x>=this.exitX-30){ this.busy=true; beep(160,0.5,'sawtooth',0.06); startBoss(); }
    $('objText').textContent = all ? '▸ Walk right → enter the arena' : 'Walk → and talk to the locals';
  },

  draw(){
    // painted city backdrop, tiled + parallax
    const im=imgs[this.bg];
    if(im&&im.complete&&im.width){ const bh=VH, bw=bh*(im.width/im.height); let off=(-cam.x*0.5)%bw; if(off>0) off-=bw;
      for(let X=off; X<VW+bw; X+=bw) ctx.drawImage(im,X,0,bw,bh); }
    else { ctx.fillStyle='#0e1220'; ctx.fillRect(0,0,VW,VH); }
    // ground shade for grounding sprites
    ctx.fillStyle='rgba(0,0,0,.28)'; ctx.fillRect(0,this.ground()+8,VW,VH);
    const G=this.ground();
    // arena exit (right end) when ready
    if(this.npcs.every(c=>c.done)){ const X=sx(this.exitX), p=0.5+0.5*Math.sin(frame*0.12);
      ctx.save(); ctx.globalAlpha=0.6+0.4*p; ctx.shadowColor='#ff3b6b'; ctx.shadowBlur=30; ctx.strokeStyle='#ff3b6b'; ctx.lineWidth=6;
      ctx.beginPath(); ctx.ellipse(X,G-90,46,120,0,0,TAU); ctx.stroke(); ctx.restore();
      ctx.fillStyle='#ff8aa8'; ctx.font='bold 22px Trebuchet MS'; ctx.textAlign='center'; ctx.fillText('ARENA ▸',X,G-220); }
    // NPCs
    for(const n of this.npcs) this.drawChar(n,G);
    // MAME
    this.drawSprite('mame', this.x, G, this.face, this.walk>0, true);
    // film subtitle bar
    if(this.cap) this.drawCaption();
    // fade-in
    if(this.fade>0){ ctx.fillStyle='rgba(0,0,0,'+this.fade+')'; ctx.fillRect(0,0,VW,VH); }
  },

  drawChar(n,G){ const X=sx(n.x); if(X<-160||X>VW+160) return;
    const faceL = this.x < n.x;     // turn to face MAME
    this.drawSprite(n.spr, n.x, G, faceL?-1:1, false, false);
    ctx.textAlign='center'; ctx.font='bold 13px Trebuchet MS'; ctx.fillStyle='#fff'; ctx.strokeStyle='#000a'; ctx.lineWidth=4;
    const ny=G-this.spriteH()-14; ctx.strokeText(n.name,X,ny); ctx.fillText(n.name,X,ny);
    if(!n.done){ const p=0.5+0.5*Math.sin(frame*0.18); ctx.globalAlpha=.6+.4*p; ctx.fillStyle='#ffd45e'; ctx.font='bold 26px Trebuchet MS'; ctx.fillText('!',X,ny-22); ctx.globalAlpha=1; }
  },

  spriteH(){ return Math.min(VH*0.46, 380); },
  drawSprite(key, worldX, G, flip, walking, hero){
    const im=imgs[key]; if(!im||!im.complete||!im.width) return;
    const h=this.spriteH(), ar=im.width/im.height, w=h*ar, X=sx(worldX);
    const bob = walking? Math.sin(frame*0.3)*5 : 0;
    // shadow
    ctx.fillStyle='rgba(0,0,0,.35)'; ctx.beginPath(); ctx.ellipse(X,G+4,w*0.32,12,0,0,TAU); ctx.fill();
    ctx.save(); ctx.translate(X, G-h/2+bob); if(flip<0) ctx.scale(-1,1);
    if(hero){ ctx.shadowColor='#ffd45e'; ctx.shadowBlur=18; }
    ctx.drawImage(im,-w/2,-h/2,w,h); ctx.restore();
  },

  drawCaption(){
    const bw=Math.min(VW*0.9,860), bx=(VW-bw)/2, by=VH-150, bh=96;
    ctx.fillStyle='rgba(6,8,16,.82)'; ctx.strokeStyle='#ffffff33'; ctx.lineWidth=2;
    ctx.beginPath(); ctx.roundRect(bx,by,bw,bh,12); ctx.fill(); ctx.stroke();
    const c=CHARS[this.capWho]||CHARS.narr, col=c.cls==='ally'?'#9bff66':c.cls==='foe'?'#ff6b6b':c.cls==='narr'?'#9fb0ff':'#ffd45e';
    ctx.textAlign='left'; ctx.fillStyle=col; ctx.font='bold 14px Trebuchet MS';
    if(c.cls!=='narr') ctx.fillText((c.name||'MAME').toUpperCase(), bx+18, by+26);
    ctx.fillStyle='#eaf2ff'; ctx.font='17px Trebuchet MS';
    this.wrap(this.capTyped, bx+18, by+(c.cls!=='narr'?50:34), bw-36, 23);
    ctx.fillStyle='#ffffff77'; ctx.font='11px Trebuchet MS'; ctx.textAlign='right'; ctx.fillText('▸ tap / space', bx+bw-14, by+bh-10);
  },
  wrap(t,x,y,maxw,lh){ const words=t.split(' '); let line='', yy=y;
    for(const w of words){ const test=line?line+' '+w:w; if(ctx.measureText(test).width>maxw && line){ ctx.fillText(line,x,yy); line=w; yy+=lh; } else line=test; }
    if(line) ctx.fillText(line,x,yy); },
};
