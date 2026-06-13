// Dog-planet — EXPLORE: cinematic wake-up + hand-drawn world (sky, stars, strange debris, the Pump ship), story beats, boss gate
const EX = {
  ch:null, px:0, py:0, speed:3.4, size:64, face:1, follow:false,
  beats:[], gate:null, busy:false, stars:[], decor:[], shipT:0,
  wake:0, fade:0, rise:0,    // wake = lock timer, fade = black overlay, rise = stand-up 0..1

  start(ch){
    this.ch=ch; this.busy=false;
    this.px=0; this.py=420; this.face=1;
    this.follow = (CHAPTERS.indexOf(ch) >= 1);
    this.wake=70; this.fade=1; this.rise=0; this.shipT=0;     // play the wake-up reveal
    // story beats up the corridor
    const lines = ch.beats || [];
    this.beats = lines.map((ls,i)=>({ x:(i%2?1:-1)*rand(80,160), y:140 - i*240, r:64, lines:ls, done:false }));
    const topY = this.beats.length ? this.beats[this.beats.length-1].y - 270 : -160;
    this.gate = { x:0, y:topY, r:80, open:this.beats.length===0 };
    // starfield (screen-space, parallax)
    this.stars = Array.from({length:80}, ()=>({ x:Math.random(), y:Math.random(), z:rand(0.2,1), s:rand(1,2.4) }));
    // scattered "strange" debris/crystals around the world
    this.decor=[]; const acc=ch.bg.accent;
    for(let i=0;i<26;i++){ const side=i%2?1:-1;
      this.decor.push({ x:side*rand(120,520), y:rand(-this.beats.length*240-200, 520),
        type:['crystal','rock','capsule','shard'][i%4], sz:rand(16,40), rot:rand(0,7), col:acc }); }
    cam.x=this.px; cam.y=this.py+60;
  },

  allBeatsDone(){ return this.beats.every(b=>b.done); },

  update(){
    if(this.fade>0) this.fade=Math.max(0,this.fade-0.02*DT);
    if(this.wake>0){                         // wake-up: rise to standing, camera settles, then unlock
      this.wake-=DT; this.rise=clamp(this.rise+0.02*DT,0,1);
      camFollow(this.px,this.py); this.shipT+=DT;
      $('objText').textContent = this.wake>40?'. . .':'Where… am I?';
      return;
    }
    this.rise=1; this.shipT+=DT;
    if(this.busy){ camFollow(this.px,this.py); return; }
    const mv=moveVec();
    if(mv.x||mv.y){ this.px+=mv.x*this.speed*DT; this.py+=mv.y*this.speed*DT; if(mv.x) this.face=mv.x<0?-1:1; }
    camFollow(this.px,this.py);
    for(const b of this.beats){ if(!b.done && dist2(this.px,this.py,b.x,b.y)<b.r*b.r){
        b.done=true; this.busy=true; beep(880,0.12,'sine',0.05);
        playDialogue(b.lines, ()=>{ this.busy=false; if(this.allBeatsDone()) this.gate.open=true; }); break; } }
    const g=this.gate;
    if(g.open && dist2(this.px,this.py,g.x,g.y)<g.r*g.r){ this.busy=true; beep(160,0.5,'sawtooth',0.06); startBoss(); }
    $('objText').textContent = this.gate.open ? '▸ ENTER THE ARENA' : (this.ch.obj||'EXPLORE');
  },

  draw(){
    const bg=this.ch.bg, acc=bg.accent;
    // sky
    const gr=ctx.createLinearGradient(0,0,0,VH); gr.addColorStop(0,bg.c1); gr.addColorStop(1,bg.c2);
    ctx.fillStyle=gr; ctx.fillRect(0,0,VW,VH);
    // stars (parallax with camera)
    ctx.fillStyle='#fff';
    for(const s of this.stars){ const X=((s.x*VW - cam.x*0.15*s.z)%VW+VW)%VW, Y=((s.y*VH - cam.y*0.15*s.z)%VH+VH)%VH;
      ctx.globalAlpha=0.3+0.5*s.z; ctx.fillRect(X,Y,s.s,s.s); } ctx.globalAlpha=1;
    // the Pump.fun ship looming in the sky (distant parallax + slow drift)
    const shipX=VW*0.72 - cam.x*0.08 + Math.sin(this.shipT*0.01)*16, shipY=VH*0.2 - cam.y*0.05 + Math.sin(this.shipT*0.013)*10;
    ctx.save(); ctx.globalAlpha=0.92; ctx.shadowColor='#ff3b3b'; ctx.shadowBlur=40;
    drawImgC('ship-pump', shipX, shipY, Math.min(VW*0.42,460)); ctx.restore();
    // ground glow band
    const gb=ctx.createRadialGradient(VW/2,VH+60,40,VW/2,VH+60,VH); gb.addColorStop(0,acc+'22'); gb.addColorStop(1,'transparent');
    ctx.fillStyle=gb; ctx.fillRect(0,VH*0.4,VW,VH*0.6);
    // faint grid floor
    ctx.strokeStyle=bg.grid; ctx.lineWidth=1; const gs=52, ox=-cam.x%gs, oy=-cam.y%gs;
    ctx.beginPath(); for(let x=ox;x<VW;x+=gs){ctx.moveTo(x,0);ctx.lineTo(x,VH);} for(let y=oy;y<VH;y+=gs){ctx.moveTo(0,y);ctx.lineTo(VW,y);} ctx.stroke();
    // path
    ctx.strokeStyle=acc+'66'; ctx.lineWidth=4; ctx.setLineDash([3,16]); ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(sx(0),sy(this.py+90)); for(const b of this.beats) ctx.lineTo(sx(b.x),sy(b.y));
    ctx.lineTo(sx(this.gate.x),sy(this.gate.y)); ctx.stroke(); ctx.setLineDash([]);
    // strange debris / crystals
    for(const d of this.decor){ const X=sx(d.x), Y=sy(d.y); if(X<-60||X>VW+60||Y<-60||Y>VH+60) continue; this.drawDecor(d,X,Y,acc); }
    // beats
    for(const b of this.beats){ if(b.done) continue; const X=sx(b.x),Y=sy(b.y), p=0.5+0.5*Math.sin(frame*0.1);
      ctx.strokeStyle=acc; ctx.lineWidth=3; ctx.globalAlpha=0.5+0.4*p; ctx.beginPath(); ctx.arc(X,Y,26+p*5,0,TAU); ctx.stroke(); ctx.globalAlpha=1;
      ctx.fillStyle='#fff'; ctx.font='22px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('❗',X,Y); }
    // gate
    const g=this.gate, GX=sx(g.x), GY=sy(g.y);
    ctx.save(); ctx.textAlign='center'; ctx.textBaseline='middle';
    if(g.open){ const p=0.5+0.5*Math.sin(frame*0.12); ctx.shadowColor='#ff3b6b'; ctx.shadowBlur=30; ctx.strokeStyle='#ff3b6b'; ctx.lineWidth=5; ctx.globalAlpha=0.7+0.3*p;
      ctx.beginPath(); ctx.arc(GX,GY,52,0,TAU); ctx.stroke(); ctx.beginPath(); ctx.arc(GX,GY,34,0,TAU); ctx.stroke(); ctx.globalAlpha=1; ctx.shadowBlur=0;
      ctx.fillStyle='#ff8aa8'; ctx.font='28px serif'; ctx.fillText('⚔',GX,GY);
    } else { ctx.strokeStyle='#5566'; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(GX,GY,46,0,TAU); ctx.stroke();
      ctx.fillStyle='#778'; ctx.font='24px serif'; ctx.fillText('🔒',GX,GY); } ctx.restore();
    // Moo Deng follower
    if(this.follow && this.wake<=0) drawImgC('moodeng', sx(this.px)-62*this.face, sy(this.py)+16, 56, this.face<0);
    // MAME — wake-up rise (lying -> standing)
    const r=this.rise, lean=(1-r)*1.4*this.face, sqY=0.35+0.65*r, X=sx(this.px), Y=sy(this.py)+(1-r)*40;
    ctx.save(); ctx.translate(X,Y); ctx.rotate(lean); ctx.scale((this.face<0?-1:1), sqY);
    ctx.shadowColor='#ffd45e'; ctx.shadowBlur=18;
    const im=imgs.mame; if(im&&im.complete&&im.width){ const ar=im.width/im.height, h=this.size, w=h*ar; ctx.drawImage(im,-w/2,-h/2,w,h); }
    ctx.restore();
    // "!" surprise when awake
    if(this.wake>0 && this.wake<45){ ctx.fillStyle='#fff'; ctx.font='bold 30px Trebuchet MS'; ctx.textAlign='center'; ctx.fillText('!', X+this.size*0.4, Y-this.size*0.6); }
    // black fade-in (wake up)
    if(this.fade>0){ ctx.fillStyle='rgba(0,0,0,'+this.fade+')'; ctx.fillRect(0,0,VW,VH); }
  },

  drawDecor(d,X,Y,acc){
    ctx.save(); ctx.translate(X,Y); ctx.rotate(d.rot);
    if(d.type==='crystal'){ ctx.fillStyle=acc; ctx.shadowColor=acc; ctx.shadowBlur=16; ctx.globalAlpha=.85;
      ctx.beginPath(); ctx.moveTo(0,-d.sz); ctx.lineTo(d.sz*0.5,0); ctx.lineTo(0,d.sz); ctx.lineTo(-d.sz*0.5,0); ctx.closePath(); ctx.fill(); }
    else if(d.type==='rock'){ ctx.fillStyle='#2a2a36'; ctx.strokeStyle='#0006'; ctx.lineWidth=3;
      ctx.beginPath(); ctx.arc(0,0,d.sz*0.7,0,TAU); ctx.fill(); ctx.stroke(); }
    else if(d.type==='capsule'){ ctx.fillStyle='#3a4a44'; ctx.shadowColor=acc; ctx.shadowBlur=10;
      ctx.beginPath(); ctx.roundRect(-d.sz*0.7,-d.sz*0.4,d.sz*1.4,d.sz*0.8,d.sz*0.4); ctx.fill();
      ctx.fillStyle=acc; ctx.fillRect(-d.sz*0.2,-d.sz*0.12,d.sz*0.4,d.sz*0.24); }
    else { ctx.strokeStyle=acc; ctx.globalAlpha=.7; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(-d.sz,0); ctx.lineTo(d.sz,-d.sz*0.4); ctx.stroke(); }
    ctx.restore(); ctx.globalAlpha=1; ctx.shadowBlur=0;
  },
};
