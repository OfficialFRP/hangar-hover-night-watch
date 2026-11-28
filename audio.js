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

// Rock backbeats, electric bass, and palm-muted guitar riffs.
let scoreTrack;
const scoreThemes = {
  menu:{bpm:116,roots:[41,37,44,39],kicks:[0,7,10],bass:[0,6,10],keys:[0,10],swing:.22},
  story:{bpm:128,roots:[43,39,46,41],kicks:[0,6,10,15],bass:[0,7,10,14],keys:[0,7,13],swing:.18},
  elimination:{bpm:148,roots:[40,40,38,43],kicks:[0,3,7,10,14],bass:[0,3,10,14],keys:[0,11],hook:[12,15,19,17],swing:.09},
  capture:{bpm:140,roots:[45,41,43,48],kicks:[0,6,9,14],bass:[0,6,9,13],keys:[0,6,12],hook:[19,22,19,24],swing:.13},
  free:{bpm:124,roots:[42,45,49,47],kicks:[0,6,10],bass:[0,6,11],keys:[0,9],swing:.25},
  full:{bpm:136,roots:[43,46,41,48],kicks:[0,5,8,14],bass:[0,5,9,13],keys:[0,6,11],hook:[19,15,22,26],swing:.17},
  race:{bpm:152,roots:[47,50,45,43],kicks:[0,3,6,10,13],bass:[0,6,10,13],keys:[0,7,12],hook:[19,24,22,15],swing:.10}
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
  const keys = context.createPeriodicWave(new Float32Array(7),new Float32Array([0,1,.16,0,.09,0,.03]));
  const guitar = context.createPeriodicWave(new Float32Array(11),new Float32Array([0,1,.54,.72,.28,.31,.17,.14,.08,.07,.04]));
  let tick = 0;
  let time = context.currentTime+.045;
  function voice(at,type,hz,duration,volume,{attack=.008,release=.08,end=hz,cutoff,detune=0} = {}) {
    const oscillator = context.createOscillator();
    const envelope = context.createGain();
    if (type === 'keys' || type === 'guitar') oscillator.setPeriodicWave(type === 'keys' ? keys : guitar);
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
      filter.frequency.setValueAtTime(cutoff,at);
      if (type === 'guitar') filter.frequency.exponentialRampToValueAtTime(cutoff*.52,at+duration*.82);
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
  function schedule() {
    if (context.state !== 'running') return;
    const now = context.currentTime;
    if (time < now) time = now+.025;
    while (time < now+.16) {
      const bar = Math.floor(tick/16)%8;
      const step = tick%16;
      const root = track.roots[bar%track.roots.length];
      const beat = time+(step%2 ? stepDuration*track.swing : 0);
      const turnaround = bar%4 === 3;
      const driving = Boolean(track.hook);
      const chorus = bar >= 4;
      const kick = step === 0 || step === 8 || (track.kicks.includes(step) && step !== 4 && step !== 12);
      if (kick) {
        voice(beat,'sine',driving ? 116 : 96,.15,.66,{end:44,release:.105});
        percussion(beat,'bandpass',1850,.024,.045);
      } else if (chorus && track.kicks.includes(step)) {
        percussion(beat,'bandpass',950,.065,.11);
      }
      if (step === 4 || step === 12) {
        const snare = beat+stepDuration*.045;
        percussion(snare,'bandpass',1790,.17,.43);
        percussion(snare+.009,'highpass',2900,.095,.20);
        voice(snare,'triangle',165,.076,.11,{end:116,release:.059});
      } else if (turnaround && step === 15) {
        percussion(beat,'bandpass',1420,.065,.11);
      }
      if (step%2 === 0 || (step === 11 && bar%2)) {
        const openHat = step === 14 && (chorus || turnaround);
        percussion(beat,'highpass',6650,openHat ? .115 : .034,openHat ? .16 : step%4 === 0 ? .12 : .075);
      }
      if (driving && ((chorus && step === 7) || (step === 15 && bar%2))) {
        for (let hit=0;hit<3;hit++) percussion(time+stepDuration*(.12+hit*.26),'highpass',7900,.028,.06+hit*.021);
      }
      if (track.bass.includes(step)) {
        const gap = (track.bass.find(next => next > step) ?? 16)-step;
        const note = root+(step === track.bass.at(-1) && bar%2 ? 7 : 0);
        const midi = note > 47 ? note-12 : note;
        const hz = scorePitch(midi);
        const duration = stepDuration*Math.min(driving ? 4.8 : 3.2,gap*.92);
        voice(beat,'triangle',hz,duration,driving ? .31 : .25,
          {attack:kick ? .025 : .009,release:.14,end:hz});
        voice(beat,'triangle',hz*2,duration,.064,{attack:.016,release:.13,cutoff:380});
      }
      if ((step%2 === 0 && (!turnaround || step < 10)) || (chorus && track.keys.includes(step))) {
        const accent = step === 0 || step === 8 || (chorus && step === 12);
        const rootNote = root+(step >= 12 && !turnaround ? 7 : 0);
        const length = stepDuration*(accent ? 2.7 : .83);
        const intervals = accent ? [0,7,12] : [0,7];
        for (const [index,interval] of intervals.entries()) {
          voice(beat+index*.008,'guitar',scorePitch(rootNote+interval),length,accent ? .086 : .059,
            {attack:.008,release:accent ? .12 : .045,cutoff:accent ? 2850 : 1250,detune:index%2 ? 5 : -4});
        }
      }
      if (driving && chorus && [2,7,11,14].includes(step)) {
        const motifStep = [2,7,11,14].indexOf(step);
        const note = scorePitch(root+track.hook[(motifStep+bar)%track.hook.length]);
        const length = stepDuration*(step === 7 ? 1.75 : 1.28);
        voice(beat,'guitar',note,length,.09,{attack:.012,release:.07,cutoff:3200,detune:-4});
        voice(beat+stepDuration*.74,'guitar',note,length,.023,{attack:.015,release:.08,cutoff:1650,detune:4});
      } else if (!driving && turnaround && step === 13) {
        voice(beat,'keys',scorePitch(root+26),stepDuration*2.4,.046,
          {attack:.026,release:.22,cutoff:1350});
      }
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
