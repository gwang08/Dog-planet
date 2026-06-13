// Dog-planet (MAME: ORIGINS) — core engine: canvas, input, camera, particles, audio, helpers
const cv = document.getElementById('game');
const ctx = cv.getContext('2d');
let VW = 0, VH = 0;
function resize(){ VW = cv.width = innerWidth; VH = cv.height = innerHeight; }
addEventListener('resize', resize); resize();

const $ = id => document.getElementById(id);
const rand  = (a,b)=> a + Math.random()*(b-a);
const clamp = (v,a,b)=> v<a?a:v>b?b:v;
const lerp  = (a,b,t)=> a+(b-a)*t;
const dist2 = (ax,ay,bx,by)=>{ const dx=ax-bx, dy=ay-by; return dx*dx+dy*dy; };
const TAU = Math.PI*2;

// ---- camera (follows player) ----
const cam = { x:0, y:0, shake:0 };
function addShake(v){ cam.shake = Math.min(30, cam.shake+v); }
const sx = x => x - cam.x + VW/2;
const sy = y => y - cam.y + VH/2;
function camFollow(tx,ty){ cam.x=lerp(cam.x,tx,0.12); cam.y=lerp(cam.y,ty,0.12); }

// ---- delta-time ----
let DT = 1, lastTs = 0, frame = 0;

// ---- images ----
const imgs = {};
function loadImg(key, src){ const i=new Image(); i.src=src; imgs[key]=i; }
['mame','moodeng','boss-fartcoin','boss-gigachad','boss-whale','boss-pepe','boss-penguin']
  .forEach(k=>loadImg(k,'assets/'+k+'.png'));
function drawImgC(key,X,Y,size,flip){
  const i=imgs[key]; if(!i||!i.complete||!i.width){ return false; }
  const ar=i.width/i.height, h=size, w=size*ar;
  ctx.save(); ctx.translate(X,Y); if(flip) ctx.scale(-1,1);
  ctx.drawImage(i,-w/2,-h/2,w,h); ctx.restore(); return true;
}

// ---- audio (tiny WebAudio) ----
let AC, muted=false;
function beep(freq,dur,type='square',vol=0.05){
  if(muted) return;
  try{ AC = AC || new (AudioContext||webkitAudioContext)();
    const o=AC.createOscillator(), g=AC.createGain();
    o.type=type; o.frequency.value=freq; g.gain.value=vol;
    o.connect(g); g.connect(AC.destination); o.start();
    o.frequency.exponentialRampToValueAtTime(freq*0.6, AC.currentTime+dur);
    g.gain.exponentialRampToValueAtTime(0.0001, AC.currentTime+dur);
    o.stop(AC.currentTime+dur);
  }catch(e){}
}

// ---- input: keys + pointer drag (virtual joystick) ----
const keys = {};
addEventListener('keydown', e=>{ keys[e.key.toLowerCase()]=true;
  if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(e.key.toLowerCase())) e.preventDefault(); });
addEventListener('keyup', e=>{ keys[e.key.toLowerCase()]=false; });
const joy = { active:false, ox:0, oy:0, dx:0, dy:0 };
cv.addEventListener('touchstart', e=>{ const t=e.touches[0]; joy.active=true; joy.ox=t.clientX; joy.oy=t.clientY; joy.dx=joy.dy=0; }, {passive:true});
cv.addEventListener('touchmove',  e=>{ if(!joy.active)return; const t=e.touches[0]; joy.dx=clamp((t.clientX-joy.ox)/55,-1,1); joy.dy=clamp((t.clientY-joy.oy)/55,-1,1); }, {passive:true});
cv.addEventListener('touchend',   ()=>{ joy.active=false; joy.dx=joy.dy=0; }, {passive:true});
function moveVec(){
  let x=0,y=0;
  if(keys['w']||keys['arrowup'])y-=1;
  if(keys['s']||keys['arrowdown'])y+=1;
  if(keys['a']||keys['arrowleft'])x-=1;
  if(keys['d']||keys['arrowright'])x+=1;
  if(joy.active){ x=joy.dx; y=joy.dy; }
  const m=Math.hypot(x,y); if(m>1){ x/=m; y/=m; }
  return {x,y};
}

// ---- particles ----
const particles = [];
function burst(x,y,color,n,spd=4,sz=4,life=26){
  for(let i=0;i<n;i++){ const a=Math.random()*TAU, s=rand(spd*0.3,spd);
    particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life,max:life,color,size:rand(sz*0.5,sz)}); }
}
function updateParticles(){
  for(let i=particles.length-1;i>=0;i--){ const p=particles[i];
    p.x+=p.vx*DT; p.y+=p.vy*DT; p.vx*=0.92; p.vy*=0.92; p.life-=DT; if(p.life<=0)particles.splice(i,1); }
}
function drawParticles(){
  for(const p of particles){ ctx.globalAlpha=Math.max(0,p.life/p.max); ctx.fillStyle=p.color;
    ctx.beginPath(); ctx.arc(sx(p.x),sy(p.y),p.size*(p.life/p.max),0,TAU); ctx.fill(); }
  ctx.globalAlpha=1;
}
const floaters=[];
function floatText(x,y,txt,color){ floaters.push({x,y,txt,color,life:34,max:34}); }
function updateFloaters(){ for(let i=floaters.length-1;i>=0;i--){ const f=floaters[i]; f.y-=0.7*DT; f.life-=DT; if(f.life<=0)floaters.splice(i,1); } }
function drawFloaters(){ ctx.textAlign='center';
  for(const f of floaters){ ctx.globalAlpha=Math.max(0,f.life/f.max); ctx.fillStyle=f.color; ctx.font='bold 16px Trebuchet MS'; ctx.fillText(f.txt,sx(f.x),sy(f.y)); }
  ctx.globalAlpha=1;
}
