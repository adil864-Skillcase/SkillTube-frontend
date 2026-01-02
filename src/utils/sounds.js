// Sound effects manager
class SoundManager {
  constructor() {
    this.sounds = {
      like: null,
      bookmark: null,
      tap: null,
      success: null,
    };
    this.enabled = true;
  }

  // Load sound files
  loadSound(name, path) {
    this.sounds[name] = new Audio(path);
    this.sounds[name].volume = 0.3;
  }

  // Play sound
  play(name) {
    if (!this.enabled || !this.sounds[name]) return;

    // Clone and play to allow overlapping
    const sound = this.sounds[name].cloneNode();
    sound.volume = 0.3;
    sound.play().catch(() => {});
  }

  // Toggle on/off
  toggle() {
    this.enabled = !this.enabled;
  }
}

// Singleton instance
const soundManager = new SoundManager();

// Initialize sounds (call this in App.jsx)
export const initSounds = () => {
  soundManager.loadSound("like", "/sounds/like.mp3");
  soundManager.loadSound("bookmark", "/sounds/bookmark.mp3");
  soundManager.loadSound("tap", "/sounds/tap.mp3");
  soundManager.loadSound("success", "/sounds/success.mp3");
};

export const playSound = (name) => soundManager.play(name);

export const toggleSounds = () => soundManager.toggle();

export default soundManager;
