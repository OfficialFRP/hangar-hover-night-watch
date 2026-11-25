// Quiet, continuously synthesized rotors react to flight state and throttle.
let rotorAudio;
function enableFlightAudio() {
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  if (!AudioEngine) return;
  if (!rotorAudio) {
    const context = new AudioEngine();
    const motor = context.createOscillator();
    motor.type = 'triangle';
    motor.frequency.value = 55;
    const gain = context.createGain();
    gain.gain.value = 0;
    motor.connect(gain).connect(context.destination);
    motor.start();
    rotorAudio = {context,motor,gain,throttle:false};
  }
  rotorAudio.context.resume().catch(() => {});
}
function flightAudio(speed, thrusting, braking, flying) {
  if (!rotorAudio) return;
  const {context,motor,gain} = rotorAudio;
  const audible = soundEnabled && flying;
  const now = context.currentTime;
  motor.frequency.setTargetAtTime(47+speed*.18+(thrusting ? 28 : 0),now,.055);
  gain.gain.setTargetAtTime(audible ? (braking ? .025 : thrusting ? .045 : .022) : 0,now,.06);
  if (audible && thrusting && !rotorAudio.throttle) sound('throttle');
  rotorAudio.throttle = audible && thrusting;
}

// Four-on-the-floor industrial techno with a sequenced bass and offbeat hats.
let technoTrack;
const technoStep = 60 / 144 / 4;
function setTechnoMusic(enabled) {
  if (!rotorAudio) return;
  const {context} = rotorAudio;
  if (!enabled) {
    if (!technoTrack) return;
    const {timer,bus} = technoTrack;
    clearInterval(timer);
    bus.gain.setTargetAtTime(0,context.currentTime,.025);
    setTimeout(() => bus.disconnect(),250);
    technoTrack = null;
    return;
  }
  if (technoTrack) return;
  const bus = context.createGain();
  bus.gain.value = .26;
  bus.connect(context.destination);
  const noise = context.createBuffer(1,Math.ceil(context.sampleRate*.19),context.sampleRate);
  const samples = noise.getChannelData(0);
  for (let i=0;i<samples.length;i++) samples[i] = Math.random()*2-1;
  let tick = 0;
  let time = context.currentTime+.045;
  function note(at,type,hz,end,decay,volume,cutoff) {
    const osc = context.createOscillator();
    const gain = context.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(hz,at);
    osc.frequency.exponentialRampToValueAtTime(end,at+decay*.75);
    gain.gain.setValueAtTime(.001,at);
    gain.gain.exponentialRampToValueAtTime(volume,at+.004);
    gain.gain.exponentialRampToValueAtTime(.001,at+decay);
    if (cutoff) {
      const filter = context.createBiquadFilter();
      filter.frequency.setValueAtTime(cutoff,at);
      filter.frequency.exponentialRampToValueAtTime(cutoff*.38,at+decay);
      osc.connect(filter).connect(gain);
    } else osc.connect(gain);
    gain.connect(bus);
    osc.start(at);
    osc.stop(at+decay);
  }
  function percussion(at,type,hz,decay,volume) {
    const sample = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const gain = context.createGain();
    sample.buffer = noise;
    filter.type = type;
    filter.frequency.value = hz;
    gain.gain.setValueAtTime(volume,at);
    gain.gain.exponentialRampToValueAtTime(.001,at+decay);
    sample.connect(filter).connect(gain).connect(bus);
    sample.start(at);
    sample.stop(at+decay);
  }
  const roots = [48.999,48.999,58.270,43.654];
  const melody = [12,19,15,22,12,19,24,15];
  function schedule() {
    const now = context.currentTime;
    if (time < now) time = now+.025;
    while (time < now+.16) {
      const bar = Math.floor(tick/16);
      const step = tick%16;
      const root = roots[bar%roots.length];
      if (step%4 === 0) note(time,'sine',149,45,.23,.88);
      if (step%8 === 4) percussion(time,'bandpass',1500,.13,.47);
      if (step%4 === 2) percussion(time,'highpass',7100,.10,.27);
      if (step%4 === 3) percussion(time,'highpass',8900,.028,.17);
      if (step%4 !== 0) {
        const bass = root * (step%8 === 7 ? 2 : 1);
        note(time,'sawtooth',bass,bass,.079,.30,step%4 === 2 ? 910 : 475);
      }
      if (bar%8 >= 2 && (step%4 === 2 || step%8 === 5)) {
        const pitch = root*4*2**(melody[(bar*3+step)%melody.length]/12);
        note(time,'triangle',pitch,pitch,.19,.13);
        note(time+.156,'triangle',pitch,pitch,.15,.048);
      }
      tick++;
      time += technoStep;
    }
  }
  schedule();
  technoTrack = {bus,timer:setInterval(schedule,50)};
}
