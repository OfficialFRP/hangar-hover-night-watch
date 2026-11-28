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

// Each mode shares the score's orchestral palette and half-time rhythm.
let scoreTrack;
const scoreThemes = {
  menu:{bpm:132,chords:[[41,0],[37,1],[44,1],[39,1]],motif:[0,7,10,12,14,12,7,3],bass:[0,6,11,14],stabs:[0,10],lift:.7},
  story:{bpm:142,chords:[[43,0],[39,1],[46,1],[41,1]],motif:[0,7,12,15,14,10,7,3],bass:[0,3,6,10,13,15],stabs:[0,6,12],lift:1},
  elimination:{bpm:154,chords:[[40,0],[40,0],[43,1],[38,1]],motif:[0,12,7,3,10,12,14,7],bass:[0,3,5,7,10,12,15],stabs:[0,3,10,14],lift:1.15},
  capture:{bpm:144,chords:[[45,0],[48,1],[43,1],[41,1]],motif:[0,5,7,12,15,12,10,7],bass:[0,2,5,10,13,15],stabs:[0,5,11],lift:1.05},
  free:{bpm:136,chords:[[42,0],[45,1],[49,0],[47,1]],motif:[0,7,12,14,19,15,12,7],bass:[0,6,10,14],stabs:[0,9],lift:.8},
  full:{bpm:146,chords:[[43,0],[46,1],[41,1],[48,0]],motif:[0,7,12,19,15,14,10,7],bass:[0,3,6,11,14],stabs:[0,4,10,14],lift:1.05},
  race:{bpm:156,chords:[[47,0],[50,1],[45,1],[43,1]],motif:[0,7,14,12,15,19,17,12],bass:[0,2,5,7,10,12,14],stabs:[0,6,10,13],lift:1.15}
};
const scorePitch = midi => 440*2**((midi-69)/12);
function setScoreMusic(enabled,mode = 'story',level = .22) {
  if (!rotorAudio) return;
  const {context,master} = rotorAudio;
  if (scoreTrack && (!enabled || scoreTrack.mode !== mode)) {
    const {timer,bus} = scoreTrack;
    clearInterval(timer);
    fadeAudio(bus.gain,0,context.currentTime,.38);
    setTimeout(() => bus.disconnect(),460);
    scoreTrack = null;
  }
  if (!enabled) return;
  if (scoreTrack) {
    if (scoreTrack.level !== level) {
      scoreTrack.level = level;
      fadeAudio(scoreTrack.bus.gain,level,context.currentTime,.32);
    }
    return;
  }
  const track = scoreThemes[mode];
  const stepDuration = 60/track.bpm/4;
  const bus = context.createGain();
  bus.gain.value = 0;
  bus.connect(master);
  fadeAudio(bus.gain,level,context.currentTime,.46);
  const noise = context.createBuffer(1,Math.ceil(context.sampleRate*.42),context.sampleRate);
  const samples = noise.getChannelData(0);
  for (let i=0;i<samples.length;i++) samples[i] = Math.random()*2-1;
  const waves = {
    strings:context.createPeriodicWave(new Float32Array(9),new Float32Array([0,1,.42,.52,.19,.24,.11,.12,.06])),
    brass:context.createPeriodicWave(new Float32Array(9),new Float32Array([0,1,.68,.34,.32,.16,.12,.07,.06]))
  };
  let tick = 0;
  let time = context.currentTime+.045;
  function voice(at,type,hz,duration,volume,{attack=.008,release=.08,end=hz,cutoff,detune=0} = {}) {
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    if (waves[type]) oscillator.setPeriodicWave(waves[type]);
    else oscillator.type = type;
    oscillator.detune.value = detune;
    oscillator.frequency.setValueAtTime(hz,at);
    if (end !== hz) oscillator.frequency.exponentialRampToValueAtTime(end,at+duration*.75);
    envelope.gain.setValueAtTime(.0001,at);
    envelope.gain.exponentialRampToValueAtTime(volume,at+attack);
    envelope.gain.exponentialRampToValueAtTime(volume*.65,at+Math.max(attack+.001,duration-release));
    envelope.gain.exponentialRampToValueAtTime(.0001,at+duration);
    if (cutoff) {
      const filter = context.createBiquadFilter();
      filter.frequency.value = cutoff;
      oscillator.connect(filter).connect(envelope);
    } else oscillator.connect(envelope);
    envelope.connect(bus);
    oscillator.start(at);
    oscillator.stop(at+duration+.006);
  }
  function percussion(at,type,hz,duration,volume) {
    const sample = context.createBufferSource();
    const filter = context.createBiquadFilter();
    const envelope = context.createGain();
    sample.buffer = noise;
    filter.type = type;
    filter.frequency.value = hz;
    envelope.gain.setValueAtTime(.0001,at);
    envelope.gain.exponentialRampToValueAtTime(volume,at+.003);
    envelope.gain.exponentialRampToValueAtTime(.0001,at+duration);
    sample.connect(filter).connect(envelope).connect(bus);
    sample.start(at);
    sample.stop(at+duration);
  }
  function growl(at,midi,duration,rate,strength) {
    const hz = scorePitch(midi);
    voice(at,'sine',hz,duration,strength*.39,{attack:.012,release:.07});
    const bass = context.createOscillator();
    const wobble = context.createOscillator();
    const depth = context.createGain();
    const filter = context.createBiquadFilter();
    const envelope = context.createGain();
    bass.type = 'sawtooth';
    bass.frequency.value = hz;
    wobble.type = 'triangle';
    wobble.frequency.value = rate;
    depth.gain.value = 370;
    filter.frequency.value = 570;
    filter.Q.value = 3;
    envelope.gain.setValueAtTime(.0001,at);
    envelope.gain.exponentialRampToValueAtTime(strength*.34,at+.011);
    envelope.gain.exponentialRampToValueAtTime(.0001,at+duration);
    wobble.connect(depth).connect(filter.frequency);
    bass.connect(filter).connect(envelope).connect(bus);
    bass.start(at);
    wobble.start(at);
    bass.stop(at+duration);
    wobble.stop(at+duration);
  }
  function schedule() {
    if (context.state !== 'running') return;
    const now = context.currentTime;
    if (time < now) time = now+.025;
    while (time < now+.16) {
      const bar = Math.floor(tick/16)%8;
      const step = tick%16;
      const [root,major] = track.chords[bar%track.chords.length];
      const third = major ? 4 : 3;
      const drop = bar !== 3 && bar !== 7;
      const intensity = track.lift*(bar < 4 ? .83 : 1);
      if (step === 0) {
        for (const interval of [0,third,7,12]) {
          voice(time,'strings',scorePitch(root+12+interval),stepDuration*15.7,.038,
            {attack:.12,release:.32,cutoff:1500,detune:interval%2 ? -6 : 6});
        }
        voice(time,'sine',scorePitch(root-12),stepDuration*5,.19,{end:scorePitch(root-17),release:.18});
      }
      if (step%2 === 0) {
        const interval = [0,7,12,third][(step/2+bar)%4];
        voice(time,'strings',scorePitch(root+12+interval),stepDuration*1.36,.067*intensity,
          {attack:.025,release:.075,cutoff:2600});
      }
      if (track.stabs.includes(step)) {
        const semitones = track.motif[(bar+track.stabs.indexOf(step)*2)%track.motif.length];
        voice(time,'brass',scorePitch(root+12+semitones),stepDuration*(step===0 ? 3.4 : 2.25),.13*intensity,
          {attack:.038,release:.115,cutoff:2200});
      }
      if (drop && track.bass.includes(step)) {
        const gap = (track.bass.find(next => next > step) ?? 16)-step;
        growl(time,root-12+(step===14 ? 7 : 0),stepDuration*Math.min(3.8,gap*.91),
          (step%3===0 ? 2 : 4)/(stepDuration*4),.52*intensity);
      }
      if (step===0 || step===6 || (drop && step===11)) {
        voice(time,'sine',142,.22,.68*intensity,{end:42,release:.14});
      }
      if (step===8 || (bar===7 && step===14)) {
        percussion(time,'bandpass',1650,.18,.38*intensity);
        voice(time,'triangle',205,.11,.24*intensity,{end:112,release:.075});
      }
      if (step%4===2 || (drop && step%4===3)) percussion(time,'highpass',7000,.057,.14*intensity);
      if (!drop && step===12) percussion(time,'highpass',4600,.32,.21*intensity);
      tick++;
      time += stepDuration;
    }
  }
  schedule();
  scoreTrack = {mode,level,bus,timer:setInterval(schedule,50)};
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
