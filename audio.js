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
