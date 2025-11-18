let audioContext: AudioContext | null = null;

const initializeAudioContext = () => {
    if (typeof window !== 'undefined' && !audioContext) {
        try {
            audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        } catch (e) {
            console.error("Web Audio API is not supported in this browser.");
        }
    }
};

/**
 * Plays a sound for a given event type.
 * It initializes the AudioContext on first use and resumes it if suspended,
 * which is common in modern browsers before user interaction.
 * @param type The type of sound to play: 'new-signal', 'tp-hit', or 'scanner-find'.
 */
export function playSound(type: 'new-signal' | 'tp-hit' | 'scanner-find' | 'sl-hit') {
  initializeAudioContext();
  if (!audioContext) return;
  
  if (audioContext.state === 'suspended') {
      audioContext.resume();
  }

  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();

  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);

  gainNode.gain.setValueAtTime(0, audioContext.currentTime);

  if (type === 'new-signal') {
    // A two-tone "chime" sound
    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(523.25, audioContext.currentTime); // C5
    gainNode.gain.linearRampToValueAtTime(0.3, audioContext.currentTime + 0.05);
    oscillator.frequency.exponentialRampToValueAtTime(659.25, audioContext.currentTime + 0.15); // E5
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.25);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  } else if (type === 'tp-hit') {
    // A quick, higher-pitched "ping" sound
    oscillator.type = 'triangle';
    oscillator.frequency.setValueAtTime(880, audioContext.currentTime); // A5
    gainNode.gain.linearRampToValueAtTime(0.25, audioContext.currentTime + 0.01);
    oscillator.frequency.setValueAtTime(1046.50, audioContext.currentTime + 0.08); // C6
    gainNode.gain.exponentialRampToValueAtTime(0.0001, audioContext.currentTime + 0.15);
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.2);
  } else if (type === 'scanner-find') {
    // A subtle, ascending 3-note arpeggio
    oscillator.type = 'sine';
    const t = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(0.2, t + 0.02);

    oscillator.frequency.setValueAtTime(523.25, t); // C5
    oscillator.frequency.setValueAtTime(659.25, t + 0.1); // E5
    oscillator.frequency.setValueAtTime(783.99, t + 0.2); // G5
    
    gainNode.gain.exponentialRampToValueAtTime(0.0001, t + 0.4);
    oscillator.start(t);
    oscillator.stop(t + 0.4);
  } else if (type === 'sl-hit') {
    // A descending, two-tone "uh-oh" sound
    oscillator.type = 'triangle';
    const t = audioContext.currentTime;
    gainNode.gain.setValueAtTime(0, t);
    gainNode.gain.linearRampToValueAtTime(0.3, t + 0.02);
    
    oscillator.frequency.setValueAtTime(440, t); // A4
    oscillator.frequency.setValueAtTime(349.23, t + 0.1); // F4

    gainNode.gain.exponentialRampToValueAtTime(0.0001, t + 0.3);
    oscillator.start(t);
    oscillator.stop(t + 0.3);
  }
}