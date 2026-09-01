/* ============================================================
   LAGU: Glenn Fredly — Akhir Cerita Cinta

   1. Taruh file mp3-nya di folder yang sama dengan halaman ini.
   2. Tulis nama file-nya persis (huruf besar/kecil ikut dihitung)
      di SONG_URL di bawah.

   Kalau file-nya belum ada atau gagal dimuat, halaman otomatis
   balik ke melodi lembut buatan sendiri, jadi tetap ada suara.
   ============================================================ */
const SONG_URL   = "akhir-cerita-cinta.mp3";
const SONG_TITLE = "Akhir Cerita Cinta";

const gate     = document.getElementById('gate');
const openBtn  = document.getElementById('openBtn');
const musicBtn = document.getElementById('music');
const label    = document.getElementById('musicLabel');
const reduced  = matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- debu cahaya ---------- */
const cv = document.getElementById('motes');
const cx = cv.getContext('2d');
let motes = [], W = 0, H = 0;

function sizeCanvas(){
  const dpr = Math.min(devicePixelRatio || 1, 2);
  W = innerWidth; H = innerHeight;
  cv.width = W * dpr; cv.height = H * dpr;
  cv.style.width = W + 'px'; cv.style.height = H + 'px';
  cx.setTransform(dpr, 0, 0, dpr, 0, 0);
}
function seedMotes(){
  const n = innerWidth < 640 ? 26 : 46;
  motes = Array.from({length:n}, () => ({
    x: Math.random()*W, y: Math.random()*H,
    r: Math.random()*1.7 + .5,
    vy: -(Math.random()*.22 + .05),
    vx: (Math.random()-.5)*.14,
    a: Math.random()*.4 + .12,
    t: Math.random()*Math.PI*2
  }));
}
function drawMotes(){
  cx.clearRect(0,0,W,H);
  for(const m of motes){
    m.y += m.vy; m.x += m.vx; m.t += .012;
    if(m.y < -12){ m.y = H + 12; m.x = Math.random()*W; }
    if(m.x < -12) m.x = W + 12;
    if(m.x > W + 12) m.x = -12;
    const a = m.a * (0.55 + 0.45*Math.sin(m.t));
    const g = cx.createRadialGradient(m.x,m.y,0,m.x,m.y,m.r*5);
    g.addColorStop(0,'rgba(243,206,184,'+a+')');
    g.addColorStop(1,'rgba(243,206,184,0)');
    cx.fillStyle = g;
    cx.beginPath(); cx.arc(m.x,m.y,m.r*5,0,Math.PI*2); cx.fill();
  }
  requestAnimationFrame(drawMotes);
}
sizeCanvas(); seedMotes();
if(!reduced) drawMotes();
addEventListener('resize', () => { sizeCanvas(); seedMotes(); });

/* ---------- mesin lagu ---------- */
const Music = (() => {
  let ctx, master, delay, fb, timer, audioEl, playing = false, bar = 0, nextTime = 0;
  let useFile = !!SONG_URL;

  const SEMI = {C:0,'C#':1,D:2,'D#':3,E:4,F:5,'F#':6,G:7,'G#':8,A:9,'A#':10,B:11};
  const hz = n => {
    const m = /^([A-G]#?)(-?\d)$/.exec(n);
    return 440 * Math.pow(2, ((SEMI[m[1]] + (+m[2]+1)*12) - 69) / 12);
  };

  // Dm7 - B♭maj7 - Fmaj7 - Csus : progresi minor, pelan dan sendu
  const CHORDS = [
    { bass:'D2',  notes:['D4','F4','A4','C5','A4','F4'] },
    { bass:'A#1', notes:['A#3','D4','F4','A4','F4','D4'] },
    { bass:'F1',  notes:['F3','A3','C4','E4','C4','A3'] },
    { bass:'C2',  notes:['C4','E4','G4','D5','G4','E4'] }
  ];
  const STEP = 0.74;               // jeda antar nada, sengaja lebih pelan
  const BAR  = STEP * CHORDS[0].notes.length;

  function build(){
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    master = ctx.createGain(); master.gain.value = 0;
    delay = ctx.createDelay(1.2); delay.delayTime.value = 0.46;
    fb = ctx.createGain(); fb.gain.value = 0.34;
    const tone = ctx.createBiquadFilter();
    tone.type = 'lowpass'; tone.frequency.value = 2100;
    master.connect(tone); tone.connect(ctx.destination);
    master.connect(delay); delay.connect(fb); fb.connect(delay);
    delay.connect(tone);
  }

  function pluck(f, at, dur, vol, type){
    const o = ctx.createOscillator(), g = ctx.createGain();
    o.type = type || 'triangle';
    o.frequency.value = f;
    o.detune.value = (Math.random()-.5) * 7;
    g.gain.setValueAtTime(0.0001, at);
    g.gain.exponentialRampToValueAtTime(vol, at + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, at + dur);
    o.connect(g); g.connect(master);
    o.start(at); o.stop(at + dur + 0.05);
  }

  function schedule(){
    while(nextTime < ctx.currentTime + 1.5){
      const c = CHORDS[bar % CHORDS.length];
      pluck(hz(c.bass), nextTime, 3.4, 0.13, 'sine');
      c.notes.forEach((n,i) => {
        pluck(hz(n), nextTime + i*STEP, 2.2, 0.085 - i*0.006, 'triangle');
      });
      nextTime += BAR;
      bar++;
    }
  }

  function fade(to, secs){
    const now = ctx.currentTime;
    master.gain.cancelScheduledValues(now);
    master.gain.setValueAtTime(Math.max(master.gain.value, 0.0001), now);
    master.gain.linearRampToValueAtTime(to, now + secs);
  }

  function startSynth(){
    if(!ctx) build();
    if(ctx.state === 'suspended') ctx.resume();
    nextTime = ctx.currentTime + 0.15;
    schedule();
    clearInterval(timer);
    timer = setInterval(schedule, 500);
    fade(0.5, 3);
  }

  function startFile(){
    if(!audioEl){
      audioEl = new Audio(SONG_URL);
      audioEl.loop = true;
      audioEl.volume = 0;
      audioEl.addEventListener('error', () => {   // file nggak ketemu -> pakai melodi bawaan
        useFile = false;
        if(playing){ startSynth(); label.textContent = 'Lagu'; }
      });
    }
    const el = audioEl;
    const p = el.play();
    if(p && p.catch) p.catch(()=>{});
    let v = 0;
    const up = setInterval(()=>{
      if(!useFile){ clearInterval(up); return; }
      v = Math.min(0.7, v + 0.03);
      el.volume = v;
      if(v >= 0.7) clearInterval(up);
    }, 90);
  }

  function start(){
    if(useFile) startFile(); else startSynth();
    playing = true;
    musicBtn.classList.add('on');
    musicBtn.setAttribute('aria-pressed','true');
    label.textContent = useFile ? SONG_TITLE : 'Lagu';
  }

  function stop(){
    if(useFile && audioEl){
      const el = audioEl;
      let v = el.volume;
      const dn = setInterval(()=>{ v = Math.max(0, v - 0.06); el.volume = v; if(v <= 0){ clearInterval(dn); el.pause(); } }, 60);
    } else if(ctx){
      fade(0.0001, 1.1);
      clearInterval(timer);
      setTimeout(()=>{ if(!playing) ctx.suspend(); }, 1300);
    }
    playing = false;
    musicBtn.classList.remove('on');
    musicBtn.setAttribute('aria-pressed','false');
    label.textContent = 'Hening';
  }

  return { toggle: () => playing ? stop() : start(), start };
})();

/* ---------- buka amplop ---------- */
function openGate(){
  gate.classList.add('gone');
  document.body.classList.remove('locked');
  document.body.classList.add('lit');
  try { Music.start(); } catch(e) { /* browser nggak izinin, tombol lagu tetap ada */ }
  setTimeout(()=>{ gate.remove(); }, 1300);
}
openBtn.addEventListener('click', openGate);
musicBtn.addEventListener('click', () => Music.toggle());
