
class RomanticAudioManager {
  constructor() {
    this.audioElement = null;
    this.audioCtx = null;
    this.isPlaying = false;
    this.synthInterval = null;
    this.notes = [

      { f: 587.33, d: 0.8 }, 
      { f: 659.25, d: 0.6 }, 
      { f: 739.99, d: 0.9 }, 
      { f: 880.00, d: 1.2 }, 
      { f: 659.25, d: 0.6 }, 
      { f: 587.33, d: 0.8 }, 
      { f: 493.88, d: 0.9 }, 
      { f: 440.00, d: 1.2 }, 
      { f: 392.00, d: 0.8 }, 
      { f: 440.00, d: 0.6 }, 
      { f: 493.88, d: 0.9 }, 
      { f: 587.33, d: 1.2 }, 
      { f: 440.00, d: 0.8 }, 
      { f: 369.99, d: 0.9 }, 
      { f: 392.00, d: 0.9 }, 
      { f: 440.00, d: 1.4 }, 
    ];
    this.noteIndex = 0;
    this.listeners = new Set();
  }

  subscribe(fn) {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }

  notify() {
    this.listeners.forEach((fn) => {
      try {
        fn(this.isPlaying);
      } catch (e) {}
    });
  }

  init(url) {
    if (this.audioElement) {
      if (url && !this.audioElement.src.endsWith(url)) {
        this.audioElement.src = url;
      }
      return;
    }

    if (url) {
      this.audioElement = new Audio(url);
      this.audioElement.loop = true;
      this.audioElement.volume = 0.6;

      this.audioElement.addEventListener('error', () => {
        this.startRomanticSynth();
      });
    }
  }

  play() {
    this.isPlaying = true;
    this.notify();

    if (this.audioElement) {
      const playPromise = this.audioElement.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          this.startRomanticSynth();
        });
        return;
      }
    }

    this.startRomanticSynth();
  }

  pause() {
    this.isPlaying = false;
    this.notify();
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

  warmUp() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!this.audioCtx) this.audioCtx = new AudioContext();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      gain.gain.value = 0.0001;
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.02);
    } catch {

    }
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

    }
  }

  playCollectSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!this.audioCtx) this.audioCtx = new AudioContext();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      const notes = [659.25, 783.99, 1046.5, 1318.51];
      notes.forEach((freq, i) => {
        setTimeout(() => {
          this.playTone(freq, 0.7);
        }, i * 70);
      });
    } catch {

    }
  }

  playMagicFanfare() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!this.audioCtx) this.audioCtx = new AudioContext();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      const fanfareNotes = [392.00, 523.25, 659.25, 783.99, 1046.50, 1318.51, 1567.98];
      fanfareNotes.forEach((freq, i) => {
        setTimeout(() => {
          this.playTone(freq, 1.2);
        }, i * 85);
      });
    } catch {

    }
  }

  playWaterSound() {
    try {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (!AudioContext) return;
      if (!this.audioCtx) this.audioCtx = new AudioContext();
      if (this.audioCtx.state === 'suspended') this.audioCtx.resume();

      for (let i = 0; i < 8; i++) {
        setTimeout(() => {
          if (!this.audioCtx) return;
          const osc = this.audioCtx.createOscillator();
          const gain = this.audioCtx.createGain();

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

    }
  }
}

export const audioManager = new RomanticAudioManager();
