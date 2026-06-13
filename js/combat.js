// Dog-planet — COMBAT: 1v1 boss duel. Player has basic attack + dodge + 4 skills. Boss uses telegraphed patterns.
const CB = {
  ch:null, ci:0, p:null, boss:null, bullets:[], haz:[], mobs:[], over:false, R:560,

  start(ch){
    this.ch=ch; this.ci=CHAPTERS.indexOf(ch); this.over=false;
    this.bullets=[]; this.haz=[]; this.mobs=[];
    const skillsN = Math.min(this.ci+1, 4);
    this.p={ x:0, y:200, r:24, hp:100, maxHp:100, en:60, maxEn:100, speed:3.6, face:1,
      vx:0, vy:0, atkCd:0, iframe:0, dodgeCd:0, shield:0, skillsN, sk:[0,0,0,0] };
    const c=ch.boss, spd=1+this.ci*0.08;
    this.boss={ cfg:c, name:CHARS[c.key].name, img:CHARS[c.key].img,
      x:0, y:-220, r:62, hp:c.hp, maxHp:c.hp, speed:c.speed*spd, face:-1,
      atkCd:80, actCdBase:c.atkCd, action:null, stun:0, charging:0, cvx:0, cvy:0,
      attacks:c.attacks.slice(), phaseLeft:(c.phases||[]).slice(), hit:0, rage:0 };
    cam.x=0; cam.y=0;
  },

  dodge(){ const p=this.p; if(p.dodgeCd>0||p.iframe>0) return;
    const mv=moveVec(); let a; if(mv.x||mv.y) a=Math.atan2(mv.y,mv.x); else a=p.face<0?Math.PI:0;
    p.vx=Math.cos(a)*12; p.vy=Math.sin(a)*12; p.iframe=16; p.dodgeCd=48; beep(520,0.12,'sine',0.05); },

  useSkill(i){ const p=this.p, b=this.boss; if(i>=p.skillsN||p.sk[i]>0) return;
    const s=SKILLS[i]; if(p.en<s.energy) return; p.en-=s.energy; p.sk[i]=s.cd;
    if(i===0){ const a=Math.atan2(b.y-p.y,b.x-p.x);
      this.bullets.push({x:p.x,y:p.y,vx:Math.cos(a)*13,vy:Math.sin(a)*13,r:13,dmg:40,pierce:3,big:1}); beep(720,0.1,'square',0.06); }
    else if(i===1){ burst(p.x,p.y,'#ffd45e',26,6,5,22); addShake(8);
      if(dist2(p.x,p.y,b.x,b.y)<150*150){ this.hurtBoss(38); b.stun=70; } beep(180,0.2,'square',0.07); }
    else if(i===2){ p.shield=120; beep(440,0.25,'sine',0.06); }
    else if(i===3){ const a=(moveVec().x||moveVec().y)?Math.atan2(moveVec().y,moveVec().x):(p.face<0?Math.PI:0);
      p.vx=Math.cos(a)*18; p.vy=Math.sin(a)*18; p.iframe=26; p.dashHit=1; beep(640,0.15,'sawtooth',0.06); }
  },

  hurtBoss(d){ const b=this.boss; b.hp-=d; b.hit=4; floatText(b.x,b.y-b.r*0.6,Math.round(d),'#fff');
    // phase check
    if(b.phaseLeft.length && b.hp/b.maxHp <= b.phaseLeft[0].at){
      const ph=b.phaseLeft.shift(); if(ph.add) b.attacks=b.attacks.concat(ph.add);
      if(ph.cdMul) b.actCdBase=Math.round(b.actCdBase*ph.cdMul); if(ph.spdMul) b.speed*=ph.spdMul;
      b.rage=90; addShake(16); beep(110,0.5,'sawtooth',0.08);
    } }

  ,hurtPlayer(d){ const p=this.p; if(p.iframe>0||p.shield>0) return;
    p.hp-=d; p.iframe=40; addShake(9); burst(p.x,p.y,'#ff4d4d',10,4,4,18); beep(170,0.2,'sawtooth',0.06);
    if(p.hp<=0){ p.hp=0; this.over=true; onBossLose(); } }

  ,pickAttack(){ const b=this.boss, a=b.attacks[(Math.random()*b.attacks.length)|0];
    b.action={ ...a, tele: a.type==='slam'||a.type==='charge'?34:26 }; }
  ,execute(a){ const b=this.boss, p=this.p, ci=this.ci, spd=4.6+ci*0.6;
    const aim=Math.atan2(p.y-b.y,p.x-b.x);
    if(a.type==='aimed'){ const n=a.burst||2; for(let i=0;i<n;i++){ const ang=aim+rand(-0.12,0.12);
        this.haz.push({k:'proj',x:b.x,y:b.y,vx:Math.cos(ang)*spd*1.2,vy:Math.sin(ang)*spd*1.2,r:11,dmg:14,life:160,delay:i*6,col:b.cfg.key}); } }
    else if(a.type==='spread'){ const n=a.count||6, arc=Math.PI*0.9; for(let i=0;i<n;i++){ const ang=aim-arc/2+arc*i/(n-1);
        this.haz.push({k:'proj',x:b.x,y:b.y,vx:Math.cos(ang)*spd,vy:Math.sin(ang)*spd,r:10,dmg:13,life:170}); } }
    else if(a.type==='ring'){ this.haz.push({k:'shock',x:b.x,y:b.y,r:20,max:Math.max(VW,VH)*0.65,grow:5+ci,dmg:18,band:34}); addShake(6); }
    else if(a.type==='slam'){ b.slamT=14; b.tx=p.x; b.ty=p.y; }
    else if(a.type==='charge'){ b.charging=42; b.cvx=Math.cos(aim)*(7+ci*0.6); b.cvy=Math.sin(aim)*(7+ci*0.6); }
    else if(a.type==='beams'){ const n=a.count||4; for(let i=0;i<n;i++){
        this.haz.push({k:'beam',x:p.x+rand(-220,220),y:p.y+rand(-220,220),r:60,t:40,dmg:20}); } }
    else if(a.type==='summon'){ const n=a.count||2; for(let i=0;i<n;i++){ const ang=Math.random()*TAU;
        this.mobs.push({x:b.x+Math.cos(ang)*90,y:b.y+Math.sin(ang)*90,r:18,hp:18,spd:1.6+ci*0.15}); } }
  },

  update(){
    if(this.over) return;
    const p=this.p, b=this.boss;
    // timers
    p.atkCd-=DT; p.dodgeCd-=DT; if(p.iframe>0)p.iframe-=DT; if(p.shield>0)p.shield-=DT;
    for(let i=0;i<4;i++) if(p.sk[i]>0) p.sk[i]-=DT;
    p.en=Math.min(p.maxEn, p.en+0.25*DT);
    // player move
    const mv=moveVec();
    p.x+=(mv.x*p.speed+p.vx)*DT; p.y+=(mv.y*p.speed+p.vy)*DT; p.vx*=0.82; p.vy*=0.82;
    if(mv.x) p.face=mv.x<0?-1:1;
    const R=this.R; p.x=clamp(p.x,-R,R); p.y=clamp(p.y,-R,R);
    camFollow(p.x*0.35,p.y*0.35);
    // auto basic attack toward boss
    if(p.atkCd<=0){ p.atkCd=24; const a=Math.atan2(b.y-p.y,b.x-p.x);
      this.bullets.push({x:p.x,y:p.y,vx:Math.cos(a)*10,vy:Math.sin(a)*10,r:6,dmg:6,pierce:0}); }
    // dash counter
    if(p.dashHit && dist2(p.x,p.y,b.x,b.y)<(b.r+p.r)*(b.r+p.r)){ this.hurtBoss(60); p.dashHit=0; burst(b.x,b.y,'#36d6ff',18,6,5,22); addShake(10); }
    // player bullets
    for(let i=this.bullets.length-1;i>=0;i--){ const u=this.bullets[i]; u.x+=u.vx*DT; u.y+=u.vy*DT;
      if(dist2(u.x,u.y,b.x,b.y)<(b.r+u.r)*(b.r+u.r)){ this.hurtBoss(u.dmg); p.en=Math.min(p.maxEn,p.en+2);
        burst(u.x,u.y,'#fff',4,3,3,12); if((u.pierce|0)>0)u.pierce--; else { this.bullets.splice(i,1); continue; } }
      // hit minions
      for(let m=this.mobs.length-1;m>=0;m--){ const mo=this.mobs[m]; if(dist2(u.x,u.y,mo.x,mo.y)<(mo.r+u.r)*(mo.r+u.r)){ mo.hp-=u.dmg; if(mo.hp<=0){burst(mo.x,mo.y,'#b06bff',8,4,4,16);this.mobs.splice(m,1);} if(!u.big){this.bullets.splice(i,1);} break; } }
      if(Math.abs(u.x)>R+200||Math.abs(u.y)>R+200) this.bullets.splice(i,1);
    }
    if(b.hp<=0){ this.over=true; burst(b.x,b.y,b.cfg.key,90,8,7,50); addShake(28); onBossWin(); return; }
    // boss logic
    if(b.hit>0)b.hit-=DT; if(b.rage>0)b.rage-=DT;
    if(b.stun>0){ b.stun-=DT; }
    else if(b.charging>0){ b.charging-=DT; b.x+=b.cvx*DT; b.y+=b.cvy*DT; b.x=clamp(b.x,-R,R); b.y=clamp(b.y,-R,R);
      if(dist2(p.x,p.y,b.x,b.y)<(b.r+p.r)*(b.r+p.r)) this.hurtPlayer(20); }
    else if(b.slamT>0){ b.slamT-=DT; b.x=lerp(b.x,b.tx,0.25); b.y=lerp(b.y,b.ty,0.25);
      if(b.slamT<=0){ this.haz.push({k:'shock',x:b.x,y:b.y,r:20,max:230,grow:9,dmg:22,band:40}); addShake(14); } }
    else if(b.action){ b.action.tele-=DT; b.face=p.x<b.x?-1:1;
      if(b.action.tele<=0){ this.execute(b.action); b.action=null; b.atkCd=Math.max(28,b.actCdBase); } }
    else { // roam + decide
      const a=Math.atan2(p.y-b.y,p.x-b.x), want=240;
      const d=Math.sqrt(dist2(p.x,p.y,b.x,b.y));
      const dir=d>want?1:-0.6; b.x+=Math.cos(a)*b.speed*dir*DT; b.y+=Math.sin(a)*b.speed*dir*DT;
      b.x=clamp(b.x,-R,R); b.y=clamp(b.y,-R,R);
      b.atkCd-=DT; if(b.atkCd<=0) this.pickAttack();
    }
    // hazards
    for(let i=this.haz.length-1;i>=0;i--){ const h=this.haz[i];
      if(h.k==='proj'){ if(h.delay>0){h.delay-=DT;continue;} h.x+=h.vx*DT; h.y+=h.vy*DT; h.life-=DT;
        if(dist2(p.x,p.y,h.x,h.y)<(p.r+h.r)*(p.r+h.r)){ this.hurtPlayer(h.dmg); this.haz.splice(i,1); continue; }
        if(h.life<=0||Math.abs(h.x)>R+260||Math.abs(h.y)>R+260) this.haz.splice(i,1); }
      else if(h.k==='shock'){ h.r+=h.grow*DT; const d=Math.sqrt(dist2(p.x,p.y,h.x,h.y));
        if(!h.hit && Math.abs(d-h.r)<h.band){ this.hurtPlayer(h.dmg); h.hit=1; }
        if(h.r>h.max) this.haz.splice(i,1); }
      else if(h.k==='beam'){ h.t-=DT;
        if(h.t<=0){ if(dist2(p.x,p.y,h.x,h.y)<(h.r+p.r)*(h.r+p.r)) this.hurtPlayer(h.dmg); burst(h.x,h.y,'#ff3b6b',14,5,5,18); addShake(6); this.haz.splice(i,1); } }
    }
    // minions
    for(let i=this.mobs.length-1;i>=0;i--){ const m=this.mobs[i]; const a=Math.atan2(p.y-m.y,p.x-m.x);
      m.x+=Math.cos(a)*m.spd*DT; m.y+=Math.sin(a)*m.spd*DT;
      if(dist2(p.x,p.y,m.x,m.y)<(p.r+m.r)*(p.r+m.r)){ this.hurtPlayer(10); burst(m.x,m.y,'#b06bff',8,4,4,14); this.mobs.splice(i,1); } }
  },

  draw(){
    const bg=this.ch.bg, b=this.boss, p=this.p;
    ctx.fillStyle=bg.c2; ctx.fillRect(0,0,VW,VH);
    const gr=ctx.createRadialGradient(VW/2,VH/2,40,VW/2,VH/2,Math.max(VW,VH)*0.75);
    gr.addColorStop(0,bg.c1); gr.addColorStop(1,bg.c2); ctx.fillStyle=gr; ctx.fillRect(0,0,VW,VH);
    // arena ring
    ctx.strokeStyle=bg.accent+'44'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(sx(0),sy(0),this.R+30,0,TAU); ctx.stroke();
    ctx.strokeStyle=bg.grid; ctx.lineWidth=1; const gs=46, ox=-cam.x%gs, oy=-cam.y%gs;
    ctx.beginPath(); for(let x=ox;x<VW;x+=gs){ctx.moveTo(x,0);ctx.lineTo(x,VH);} for(let y=oy;y<VH;y+=gs){ctx.moveTo(0,y);ctx.lineTo(VW,y);} ctx.stroke();
    // hazards
    for(const h of this.haz){
      if(h.k==='proj'){ if(h.delay>0)continue; ctx.fillStyle=bg.accent; ctx.shadowColor=bg.accent; ctx.shadowBlur=12;
        ctx.beginPath(); ctx.arc(sx(h.x),sy(h.y),h.r,0,TAU); ctx.fill(); ctx.shadowBlur=0;
        ctx.fillStyle='#fff'; ctx.beginPath(); ctx.arc(sx(h.x),sy(h.y),h.r*0.45,0,TAU); ctx.fill(); }
      else if(h.k==='shock'){ ctx.strokeStyle=bg.accent; ctx.globalAlpha=0.8; ctx.lineWidth=h.band; ctx.beginPath(); ctx.arc(sx(h.x),sy(h.y),h.r,0,TAU); ctx.stroke(); ctx.globalAlpha=1; }
      else if(h.k==='beam'){ const p2=1-h.t/40; ctx.strokeStyle='#ff3b6b'; ctx.globalAlpha=0.4+0.4*p2; ctx.lineWidth=3;
        ctx.beginPath(); ctx.arc(sx(h.x),sy(h.y),h.r,0,TAU); ctx.stroke();
        ctx.fillStyle='#ff3b6b33'; ctx.beginPath(); ctx.arc(sx(h.x),sy(h.y),h.r*p2,0,TAU); ctx.fill(); ctx.globalAlpha=1; }
    }
    // minions
    for(const m of this.mobs){ ctx.fillStyle='#b06bff'; ctx.shadowColor='#b06bff'; ctx.shadowBlur=10;
      ctx.beginPath(); ctx.arc(sx(m.x),sy(m.y),m.r,0,TAU); ctx.fill(); ctx.shadowBlur=0; }
    // boss
    ctx.save(); if(b.rage>0&&Math.floor(frame/4)%2) ctx.filter='brightness(1.6)';
    if(b.action&&b.action.tele>0&&Math.floor(frame/4)%2) ctx.filter='brightness(2)';
    if(b.hit>0) ctx.filter='brightness(2.2)';
    ctx.shadowColor=CHARS[b.cfg.key].cls==='foe'?'#ff3b6b':'#fff'; ctx.shadowBlur=24;
    drawImgC(b.img, sx(b.x), sy(b.y), b.r*2.4, b.face<0); ctx.restore();
    // charge telegraph line
    if(b.action&&b.action.type==='charge'&&b.action.tele>0){ const a=Math.atan2(p.y-b.y,p.x-b.x);
      ctx.strokeStyle='#ff3b6b88'; ctx.lineWidth=6; ctx.setLineDash([10,10]); ctx.beginPath();
      ctx.moveTo(sx(b.x),sy(b.y)); ctx.lineTo(sx(b.x+Math.cos(a)*900),sy(b.y+Math.sin(a)*900)); ctx.stroke(); ctx.setLineDash([]); }
    // player bullets
    for(const u of this.bullets){ ctx.fillStyle=u.big?'#ffd45e':'#cfeaff'; ctx.shadowColor='#36d6ff'; ctx.shadowBlur=10;
      ctx.beginPath(); ctx.arc(sx(u.x),sy(u.y),u.r,0,TAU); ctx.fill(); ctx.shadowBlur=0; }
    // player
    ctx.save();
    if(p.shield>0){ ctx.strokeStyle='#36d6ff'; ctx.globalAlpha=0.6+0.3*Math.sin(frame*0.4); ctx.lineWidth=4; ctx.beginPath(); ctx.arc(sx(p.x),sy(p.y),p.r+12,0,TAU); ctx.stroke(); ctx.globalAlpha=1; }
    if(p.iframe>0 && Math.floor(frame/3)%2) ctx.globalAlpha=0.5;
    ctx.shadowColor='#ffd45e'; ctx.shadowBlur=16; drawImgC('mame', sx(p.x), sy(p.y), 60, p.face<0); ctx.restore();
  },
};
