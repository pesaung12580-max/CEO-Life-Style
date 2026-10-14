// Web Audio API Synthesizer Chime
// Generates a soft, pleasant, melodic CEO bell chime completely offline without external MP3 assets

let audioCtx: AudioContext | null = null;
let currentAlarmInterval: number | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a single soothing bell chime sequence (notes: C5, E5, G5, C6)
 */
export function playChimeSequence(): void {
  try {
    const ctx = getAudioContext();
    const now = ctx.currentTime;
    
    // Melodic notes in Hz: C5, E5, G5, B5, C6
    const freqs = [523.25, 659.25, 783.99, 987.77, 1046.50];
    
    freqs.forEach((freq, idx) => {
      const startTime = now + idx * 0.16;
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      
      // Soft envelope with gentle decay
      gain.gain.setValueAtTime(0.001, startTime);
      gain.gain.exponentialRampToValueAtTime(0.28, startTime + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start(startTime);
      osc.stop(startTime + 1.3);
    });
  } catch (err) {
    console.warn('Audio playback not allowed or failed:', err);
  }
}

/**
 * Starts continuous alarm chime repeating every 3 seconds until stopped
 */
export function startAlarmLoop(): void {
  stopAlarmLoop();
  playChimeSequence();
  currentAlarmInterval = window.setInterval(() => {
    playChimeSequence();
  }, 3200);
}

/**
 * Stops ongoing continuous alarm chime
 */
export function stopAlarmLoop(): void {
  if (currentAlarmInterval !== null) {
    clearInterval(currentAlarmInterval);
    currentAlarmInterval = null;
  }
}
