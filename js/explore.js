// Dog-planet — EXPLORE mode: walk a top-down world, trigger story beats, reach the boss gate
const EX = {
  ch:null, px:0, py:0, speed:3.4, size:60, face:1, follow:false,
  beats:[], gate:null, busy:false, started:false,

  start(ch){
    this.ch=ch; this.busy=false; this.started=true;
    this.px=0; this.py=420; this.face=1;
    this.follow = (CHAPTERS.indexOf(ch) >= 1);     // Moo Deng joins from chapter 2
    // lay story beats in a corridor going UP; gate at the top
    const lines = ch.beats || [];
    this.beats = lines.map((ls,i)=>({ x:(i%2?1:-1)*rand(70,150), y:160 - i*230, r:64, lines:ls, done:false }));
    const topY = this.beats.length ? this.beats[this.beats.length-1].y - 260 : -120;
    this.gate = { x:0, y:topY, r:80, open: this.beats.length===0 };
    cam.x=this.px; cam.y=this.py;
  },

  allBeatsDone(){ return this.beats.every(b=>b.done); },

  update(){
    if(this.busy) { camFollow(this.px,this.py); return; }
    const mv=moveVec();
    if(mv.x||mv.y){ this.px+=mv.x*this.speed*DT; this.py+=mv.y*this.speed*DT; if(mv.x) this.face=mv.x<0?-1:1; }
    camFollow(this.px,this.py);
    // story beats
    for(const b of this.beats){
      if(!b.done && dist2(this.px,this.py,b.x,b.y) < b.r*b.r){
        b.done=true; this.busy=true; beep(880,0.12,'sine',0.05);
        playDialogue(b.lines, ()=>{ this.busy=false; if(this.allBeatsDone()) this.gate.open=true; });
        break;
      }
    }
    // boss gate
    const g=this.gate;
    if(g.open && dist2(this.px,this.py,g.x,g.y) < g.r*g.r){
      this.busy=true; beep(160,0.5,'sawtooth',0.06); startBoss();
    }
    $('objText').textContent = this.gate.open ? '▸ ENTER THE ARENA' : (this.ch.obj||'EXPLORE');
  },

  draw(){
    const bg=this.ch.bg;
    ctx.fillStyle=bg.c2; ctx.fillRect(0,0,VW,VH);
    // radial vignette glow
    const gr=ctx.createRadialGradient(VW/2,VH/2,40,VW/2,VH/2,Math.max(VW,VH)*0.7);
    gr.addColorStop(0,bg.c1); gr.addColorStop(1,bg.c2); ctx.fillStyle=gr; ctx.fillRect(0,0,VW,VH);
    // grid
    ctx.strokeStyle=bg.grid; ctx.lineWidth=1; const gs=46, ox=-cam.x%gs, oy=-cam.y%gs;
    ctx.beginPath();
    for(let x=ox; x<VW; x+=gs){ ctx.moveTo(x,0); ctx.lineTo(x,VH); }
    for(let y=oy; y<VH; y+=gs){ ctx.moveTo(0,y); ctx.lineTo(VW,y); }
    ctx.stroke();
    // path line through beats -> gate
    ctx.strokeStyle=bg.accent+'55'; ctx.lineWidth=4; ctx.setLineDash([3,16]); ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(sx(0),sy(this.py+80));
    for(const b of this.beats) ctx.lineTo(sx(b.x),sy(b.y));
    ctx.lineTo(sx(this.gate.x),sy(this.gate.y)); ctx.stroke(); ctx.setLineDash([]);
    // beats
    for(const b of this.beats){ if(b.done) continue;
      const X=sx(b.x),Y=sy(b.y), p=0.5+0.5*Math.sin(frame*0.1);
      ctx.strokeStyle=bg.accent; ctx.lineWidth=3; ctx.globalAlpha=0.5+0.4*p;
      ctx.beginPath(); ctx.arc(X,Y,26+p*5,0,TAU); ctx.stroke(); ctx.globalAlpha=1;
      ctx.fillStyle='#fff'; ctx.font='22px serif'; ctx.textAlign='center'; ctx.textBaseline='middle';
      ctx.fillText('❗',X,Y);
    }
    // gate
    const g=this.gate, GX=sx(g.x), GY=sy(g.y);
    if(g.open){
      const p=0.5+0.5*Math.sin(frame*0.12);
      ctx.save(); ctx.shadowColor='#ff3b6b'; ctx.shadowBlur=30;
      ctx.strokeStyle='#ff3b6b'; ctx.lineWidth=5; ctx.globalAlpha=0.7+0.3*p;
      ctx.beginPath(); ctx.arc(GX,GY,52,0,TAU); ctx.stroke();
      ctx.beginPath(); ctx.arc(GX,GY,34,0,TAU); ctx.stroke(); ctx.restore();
      ctx.fillStyle='#ff8aa8'; ctx.font='28px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('⚔',GX,GY);
    } else {
      ctx.strokeStyle='#5566'; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(GX,GY,46,0,TAU); ctx.stroke();
      ctx.fillStyle='#778'; ctx.font='24px serif'; ctx.textAlign='center'; ctx.textBaseline='middle'; ctx.fillText('🔒',GX,GY);
    }
    // Moo Deng follower
    if(this.follow) drawImgC('moodeng', sx(this.px)-58*this.face, sy(this.py)+14, 56, this.face<0);
    // MAME
    ctx.save(); ctx.shadowColor='#ffd45e'; ctx.shadowBlur=18;
    drawImgC('mame', sx(this.px), sy(this.py), this.size, this.face<0); ctx.restore();
  },
};
