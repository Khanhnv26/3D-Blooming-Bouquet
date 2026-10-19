// Romantic audio synthesizer as fallback + Audio manager

class RomanticAudioManager {
  constructor() {
    this.audioElement = null;
    this.audioCtx = null;
    this.isPlaying = false;
    this.synthInterval = null;
    this.notes = [
      // Romantic piano/celesta notes (D major / Canon progression frequencies)
      { f: 587.33, d: 0.8 }, // D5
      { f: 659.25, d: 0.6 }, // E5
      { f: 739.99, d: 0.9 }, // F#5
      { f: 880.00, d: 1.2 }, // A5
      { f: 659.25, d: 0.6 }, // E5
      { f: 587.33, d: 0.8 }, // D5
      { f: 493.88, d: 0.9 }, // B4
      { f: 440.00, d: 1.2 }, // A4
      { f: 392.00, d: 0.8 }, // G4
      { f: 440.00, d: 0.6 }, // A4
      { f: 493.88, d: 0.9 }, // B4
      { f: 587.33, d: 1.2 }, // D5
      { f: 440.00, d: 0.8 }, // A4
      { f: 369.99, d: 0.9 }, // F#4
      { f: 392.00, d: 0.9 }, // G4
      { f: 440.00, d: 1.4 }, // A4
    ];
    this.noteIndex = 0;
  }

  init(url) {
    if (this.audioElement) return;

    if (url) {
      this.audioElement = new Audio(url);
      this.audioElement.loop = true;
      this.audioElement.volume = 0.5;

      this.audioElement.addEventListener('error', () => {
        console.log("Audio URL unavailable, falling back to gentle synth chime...");
      });
    }
  }

  play() {
    this.isPlaying = true;

    // Try HTML5 audio first
    if (this.audioElement) {
      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.log("Audio play error, using synth chime:", err);
          this.startRomanticSynth();
        });
        return;
      }
    }

    this.startRomanticSynth();
  }

  pause() {
    this.isPlaying = false;
    if (this.audioElement) {
      this.audioElement.pause();
    }
    this.stopRomanticSynth();
  }

  toggle() {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
    return this.isPlaying;
  }

  startRomanticSynth() {
    if (this.synthInterval) return;

    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return;

    if (!this.audioCtx) {
      this.audioCtx = new AudioContext();
    }
    if (this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }

    const playNextNote = () => {
      if (!this.isPlaying || !this.audioCtx) return;

      const note = this.notes[this.noteIndex];
      this.playTone(note.f, note.d);
      this.noteIndex = (this.noteIndex + 1) % this.notes.length;
    };

    playNextNote();
    this.synthInterval = setInterval(playNextNote, 1300);
  }

  stopRomanticSynth() {
    if (this.synthInterval) {
      clearInterval(this.synthInterval);
      this.synthInterval = null;
    }
  }

  playTone(freq, duration) {
    try {
      if (!this.audioCtx) return;
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);

      gain.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.12, this.audioCtx.currentTime + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + duration);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + duration);
    } catch {
      // ignore
    }
  }

  playChime() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!this.audioCtx) this.audioCtx = new AudioContext();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      const chimeNotes = [523.25, 659.25, 783.99, 1046.50];
      chimeNotes.forEach((freq, i) => {
        setTimeout(() => {
          this.playTone(freq, 0.8);
        }, i * 90);
      });
    } catch {
      // ignore
    }
  }

  playWaterSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!this.audioCtx) this.audioCtx = new AudioContext();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      // Rapid gentle bubbly trickles (8 water droplets)
      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          if (!this.audioCtx) return;
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();

          // Droplet frequency slide down
          const startFreq = 800 + Math.random() * 400;
          osc.type = 'sine';
          osc.frequency.setValueAtTime(startFreq, this.audioCtx.currentTime);
          osc.frequency.exponentialRampToValueAtTime(startFreq * 1.5, this.audioCtx.currentTime + 0.05);
          osc.frequency.exponentialRampToValueAtTime(startFreq * 0.7, this.audioCtx.currentTime + 0.12);

          gain.gain.setValueAtTime(0.001, this.audioCtx.currentTime);
          gain.gain.linearRampToValueAtTime(0.08, this.audioCtx.currentTime + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, this.audioCtx.currentTime + 0.12);

          osc.connect(gain);
          gain.connect(this.audioCtx.destination);

          osc.start();
          osc.stop(this.audioCtx.currentTime + 0.12);
        }, i * 75);
      }
    } catch {
      // ignore
    }
  }
}

export const audioManager = new RomanticAudioManager();
