// Quiet, continuously synthesized rotors react to flight state and throttle.
let rotorAudio;
function fadeAudio(param,value,now,seconds) {
  if (param.cancelAndHoldAtTime) param.cancelAndHoldAtTime(now);
  else {
    const current = param.value;
    param.cancelScheduledValues(now);
    param.setValueAtTime(current,now);
  }
  param.linearRampToValueAtTime(value,now+seconds);
}
function routeFlightEffect(player) {
  if (!rotorAudio || typeof rotorAudio.context.createMediaElementSource !== 'function') return null;
  const {context,fx,media} = rotorAudio;
  if (!media.has(player)) {
    const gain = context.createGain();
    gain.gain.value = 0;
    context.createMediaElementSource(player).connect(gain).connect(fx);
    media.set(player,gain);
  }
  return media.get(player);
}
const extraFlightVoices = new WeakMap();
function playFlightEffect(player,allowOverlap = false) {
  if (!player.paused && !player.ended) {
    if (!allowOverlap) return;
    if (!extraFlightVoices.has(player)) {
      const voice = player.cloneNode();
      voice.volume = player.volume;
      extraFlightVoices.set(player,voice);
    }
    player = extraFlightVoices.get(player);
    if (!player.paused && !player.ended) return;
  }
  const gain = routeFlightEffect(player);
  player.currentTime = 0;
  if (gain) {
    const now = rotorAudio.context.currentTime;
    gain.gain.cancelScheduledValues(now);
    gain.gain.setValueAtTime(0,now);
    gain.gain.linearRampToValueAtTime(1,now+.012);
  }
  player.play().catch(() => {});
}
function stopFlightEffects(players) {
  for (const player of players) {
    for (const voice of [player,extraFlightVoices.get(player)]) {
      if (voice && !rotorAudio?.media.has(voice)) voice.pause();
    }
  }
}
function setAudioFocus(audible) {
  if (!rotorAudio) return;
  const {context,master} = rotorAudio;
  fadeAudio(master.gain,audible ? .85 : 0,context.currentTime,.18);
}
function enableFlightAudio() {
  const AudioEngine = window.AudioContext || window.webkitAudioContext;
  if (!AudioEngine) return;
  if (!rotorAudio) {
    const context = new AudioEngine();
    const master = context.createGain();
    const fx = context.createGain();
    const limiter = context.createDynamicsCompressor();
    limiter.threshold.value = -12;
    limiter.knee.value = 8;
    limiter.ratio.value = 5;
    master.gain.value = 0;
    fx.connect(master);
    master.connect(limiter).connect(context.destination);
    const motor = context.createOscillator();
    motor.type = 'triangle';
    motor.frequency.value = 55;
    const gain = context.createGain();
    gain.gain.value = 0;
    motor.connect(gain).connect(fx);
    motor.start();
    rotorAudio = {context,motor,gain,master,fx,media:new WeakMap(),throttle:false};
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

// Each mode has its own tempo, bass line, drum pattern and lead phrase.
let technoTrack;
const technoModes = {
  menu:{bpm:104,roots:[41,44,39,46],bass:[0,6,10,14],lead:[12,15,19,22,24,19,15,12],leadSteps:[2,7,11,14],snare:[8],hat:[4,12],wave:'sine'},
  story:{bpm:144,roots:[43,43,46,41],bass:[1,2,3,5,6,7,9,10,11,13,14,15],lead:[12,19,15,22,12,19,24,15],leadSteps:[2,5,10,13],snare:[4,12],hat:[2,6,10,14],wave:'triangle'},
  elimination:{bpm:152,roots:[40,40,43,38],bass:[1,3,6,7,9,11,13,15],lead:[12,24,15,22,19,15,10,7],leadSteps:[0,3,7,10,14],snare:[4,12,15],hat:[2,5,6,10,13,14],wave:'sawtooth'},
  capture:{bpm:140,roots:[45,48,43,40],bass:[0,2,5,7,8,10,13,15],lead:[7,12,16,19,17,12,14,19],leadSteps:[2,6,9,12,15],snare:[4,12],hat:[2,3,6,10,11,14],wave:'square'},
  free:{bpm:128,roots:[42,45,49,47],bass:[0,6,8,10,14],lead:[12,16,21,24,23,19,16,14],leadSteps:[1,5,8,11,14],snare:[4,12],hat:[2,6,10,14,15],wave:'sine'},
  race:{bpm:160,roots:[47,50,45,43],bass:[1,2,5,6,9,10,11,13,14,15],lead:[12,14,19,21,22,19,17,14],leadSteps:[0,3,6,8,11,14],snare:[4,7,12],hat:[2,6,9,10,14,15],wave:'triangle'}
};
function setTechnoMusic(enabled,mode = 'story',level = .22) {
  if (!rotorAudio) return;
  const {context,master} = rotorAudio;
  if (technoTrack && (!enabled || technoTrack.mode !== mode)) {
    const {timer,bus} = technoTrack;
    clearInterval(timer);
    fadeAudio(bus.gain,0,context.currentTime,.38);
    setTimeout(() => bus.disconnect(),460);
    technoTrack = null;
  }
  if (!enabled) return;
  if (technoTrack) {
    if (technoTrack.level !== level) {
      technoTrack.level = level;
      fadeAudio(technoTrack.bus.gain,level,context.currentTime,.32);
    }
    return;
  }
  const track = technoModes[mode];
  const stepDuration = 60/track.bpm/4;
  const bus = context.createGain();
  bus.gain.value = 0;
  bus.connect(master);
  fadeAudio(bus.gain,level,context.currentTime,.46);
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
    gain.gain.setValueAtTime(.001,at);
    gain.gain.exponentialRampToValueAtTime(volume,at+.003);
    gain.gain.exponentialRampToValueAtTime(.001,at+decay);
    sample.connect(filter).connect(gain).connect(bus);
    sample.start(at);
    sample.stop(at+decay);
  }
  const roots = track.roots.map(midi => 440*2**((midi-69)/12));
  function schedule() {
    if (context.state !== 'running') return;
    const now = context.currentTime;
    if (time < now) time = now+.025;
    while (time < now+.16) {
      const bar = Math.floor(tick/16);
      const step = tick%16;
      const root = roots[bar%roots.length];
      if (step%4 === 0) note(time,'sine',149,45,.23,.88);
      if (track.snare.includes(step)) percussion(time,'bandpass',1500,.13,.38);
      if (track.hat.includes(step)) percussion(time,'highpass',7100,.08,.27);
      if (track.bass.includes(step)) {
        const bass = root*(step%8 === 7 ? 2 : 1);
        note(time,'sawtooth',bass,bass,stepDuration*.84,.27,step%4 === 2 ? 910 : 475);
      }
      const phrase = track.leadSteps.indexOf(step);
      if (phrase >= 0 && bar%8 !== 7) {
        const pitch = root*2*2**(track.lead[(bar*2+phrase)%track.lead.length]/12);
        note(time,track.wave,pitch,pitch,.18,.105,1800);
        note(time+stepDuration*1.5,'sine',pitch,pitch,.14,.046);
      }
      tick++;
      time += stepDuration;
    }
  }
  schedule();
  technoTrack = {mode,level,bus,timer:setInterval(schedule,50)};
}

// Short synthesized effects share the game's sound toggle and audio context.
const battleSoundProfiles = {
  pulse:['triangle',940,300,.095,.07],
  powered:['sawtooth',230,78,.27,.055],
  scatter:['triangle',380,95,.12,.065],
  shield:['sine',210,1050,.28,.075],
  turret:['triangle',135,390,.2,.06],
  slowed:['sine',510,130,.25,.065],
  hit:['triangle',145,63,.085,.065],
  blocked:['sine',1120,760,.09,.045],
  repair:['sine',400,1220,.28,.06],
  win:['triangle',440,1046,.36,.07],
  loss:['sine',390,147,.34,.055]
};
const battleSoundTimes = new Map();
function battleSound(effect) {
  if (!soundEnabled || !rotorAudio) return;
  const {context,fx} = rotorAudio;
  const now = context.currentTime;
  if (context.state !== 'running' || now-(battleSoundTimes.get(effect) ?? -Infinity)<.065) return;
  battleSoundTimes.set(effect,now);
  const [wave,start,end,seconds,volume] = battleSoundProfiles[effect];
  const oscillator = context.createOscillator();
  const gain = context.createGain();
  oscillator.type = wave;
  oscillator.frequency.setValueAtTime(start,now);
  oscillator.frequency.exponentialRampToValueAtTime(end,now+seconds);
  gain.gain.setValueAtTime(.001,now);
  gain.gain.exponentialRampToValueAtTime(volume,now+.012);
  gain.gain.exponentialRampToValueAtTime(.001,now+seconds);
  oscillator.connect(gain).connect(fx);
  oscillator.start(now);
  oscillator.stop(now+seconds+.01);
}
