// Web Audio API notification sounds — no external files needed
const AudioCtx = window.AudioContext || window.webkitAudioContext;
let ctx = null;

function getCtx() {
  if (!ctx) ctx = new AudioCtx();
  return ctx;
}

function playTone(freq, duration = 0.15, type = 'sine', vol = 0.3) {
  try {
    const c = getCtx();
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, c.currentTime);
    gain.gain.setValueAtTime(vol, c.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, c.currentTime + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + duration);
  } catch (e) { /* ignore if audio not supported */ }
}

// --- SOUND PRESETS ---

/** 🔔 New order arrived — bright double-ding */
export function playNewOrder() {
  playTone(880, 0.12, 'sine', 0.35);
  setTimeout(() => playTone(1100, 0.15, 'sine', 0.35), 150);
}

/** ✅ Order ready — pleasant ascending chime */
export function playOrderReady() {
  playTone(660, 0.1, 'sine', 0.3);
  setTimeout(() => playTone(880, 0.1, 'sine', 0.3), 120);
  setTimeout(() => playTone(1100, 0.15, 'sine', 0.3), 240);
}

/** 🚨 Help requested — urgent pulsing alert */
export function playHelpAlert() {
  playTone(600, 0.15, 'square', 0.25);
  setTimeout(() => playTone(600, 0.15, 'square', 0.25), 250);
  setTimeout(() => playTone(600, 0.15, 'square', 0.25), 500);
}

/** 📋 Status update — soft single tone */
export function playStatusUpdate() {
  playTone(700, 0.12, 'sine', 0.2);
}

/** 💰 Payment received — cash register */
export function playPayment() {
  playTone(523, 0.08, 'sine', 0.3);
  setTimeout(() => playTone(659, 0.08, 'sine', 0.3), 100);
  setTimeout(() => playTone(784, 0.08, 'sine', 0.3), 200);
  setTimeout(() => playTone(1047, 0.2, 'sine', 0.35), 300);
}

/** 🛎️ Table update — soft bell */
export function playTableUpdate() {
  playTone(800, 0.1, 'sine', 0.2);
}

/** 📱 Customer order placed — confirmation */
export function playOrderPlaced() {
  playTone(440, 0.1, 'sine', 0.25);
  setTimeout(() => playTone(554, 0.1, 'sine', 0.25), 120);
  setTimeout(() => playTone(660, 0.2, 'sine', 0.3), 240);
}
