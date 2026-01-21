/**
 * Voice-Avatar Synchronization Service
 * Handles real-time audio playback, lip-sync, and animation timing
 */

export class VoiceAvatarSyncService {
  constructor() {
    this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
    this.analyser = this.audioContext.createAnalyser();
    this.isPlaying = false;
    this.currentAudio = null;
    this.lipSyncData = [];
    this.animationFrameId = null;
  }

  /**
   * Play voice with lip-sync animation
   * @param {string} audioUrl - URL to audio file
   * @param {Function} onLipSync - Callback with mouth open amount (0-1)
   * @param {Function} onFrequency - Callback with frequency data
   */
  async playVoiceWithSync(audioUrl, onLipSync, onFrequency) {
    try {
      // Fetch audio
      const response = await fetch(audioUrl);
      const arrayBuffer = await response.arrayBuffer();
      
      // Decode audio
      const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      // Create audio source
      const source = this.audioContext.createBufferSource();
      source.buffer = audioBuffer;
      
      // Connect to analyser for frequency data
      source.connect(this.analyser);
      this.analyser.connect(this.audioContext.destination);
      
      // Set analyser properties
      this.analyser.fftSize = 256;
      const bufferLength = this.analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);
      
      // Start playback
      source.start(0);
      this.currentAudio = source;
      this.isPlaying = true;
      
      // Animation loop for lip-sync
      const updateSync = () => {
        if (!this.isPlaying) return;
        
        // Get frequency data
        this.analyser.getByteFrequencyData(dataArray);
        
        // Calculate mouth opening based on frequency content
        const mouthOpening = this.calculateMouthOpening(dataArray);
        const frequency = this.calculateFrequencyScore(dataArray);
        
        if (onLipSync) onLipSync(mouthOpening);
        if (onFrequency) onFrequency(frequency);
        
        this.animationFrameId = requestAnimationFrame(updateSync);
      };
      
      updateSync();
      
      // Stop when audio ends
      source.onended = () => {
        this.isPlaying = false;
        if (this.animationFrameId) {
          cancelAnimationFrame(this.animationFrameId);
        }
        if (onLipSync) onLipSync(0);
      };
      
    } catch (error) {
      console.error('Error playing voice with sync:', error);
      throw error;
    }
  }

  /**
   * Calculate mouth opening amount from frequency data
   * Higher frequencies (speech) = more mouth opening
   */
  calculateMouthOpening(frequencyData) {
    // Focus on mid-to-high frequencies (speech range: 500Hz-4kHz)
    const speechRange = frequencyData.slice(10, 100);
    const average = speechRange.reduce((a, b) => a + b) / speechRange.length;
    
    // Normalize to 0-1 range
    const normalized = Math.min(average / 255, 1.0);
    
    // Apply smoothing for natural motion
    return this.smoothValue(normalized);
  }

  /**
   * Calculate frequency intensity score
   */
  calculateFrequencyScore(frequencyData) {
    let total = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      total += frequencyData[i];
    }
    return (total / frequencyData.length) / 255;
  }

  /**
   * Smooth value changes for natural animation
   */
  smoothValue(value) {
    // Store last value if not exists
    if (!this.lastSmoothedValue) {
      this.lastSmoothedValue = value;
    }
    
    // Smooth transition
    const smoothFactor = 0.7;
    this.lastSmoothedValue = this.lastSmoothedValue * smoothFactor + value * (1 - smoothFactor);
    
    return this.lastSmoothedValue;
  }

  /**
   * Stop voice playback
   */
  stop() {
    if (this.currentAudio) {
      this.currentAudio.stop();
      this.isPlaying = false;
    }
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  /**
   * Pause voice playback
   */
  pause() {
    if (this.audioContext.state === 'running') {
      this.audioContext.suspend();
      this.isPlaying = false;
    }
  }

  /**
   * Resume voice playback
   */
  resume() {
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume();
      this.isPlaying = true;
    }
  }

  /**
   * Get current playback position
   */
  getCurrentTime() {
    return this.audioContext.currentTime;
  }

  /**
   * Get audio duration
   */
  getAudioDuration(audioBuffer) {
    return audioBuffer.duration;
  }
}

/**
 * Lip-Sync Animation Controller
 * Manages mouth shape and animation states
 */
export class LipSyncController {
  constructor(spriteRef) {
    this.spriteRef = spriteRef;
    this.mouthShape = 0; // 0-1 (closed to open)
    this.currentViseme = 'neutral'; // Current mouth shape
    this.visemeShapes = this.initializeVisemeShapes();
  }

  /**
   * Initialize viseme (mouth shape) definitions
   */
  initializeVisemeShapes() {
    return {
      // Vowels
      'A': { openAmount: 0.8, scaleX: 1.0, scaleY: 1.2 },
      'E': { openAmount: 0.6, scaleX: 1.1, scaleY: 0.9 },
      'I': { openAmount: 0.3, scaleX: 0.8, scaleY: 0.8 },
      'O': { openAmount: 0.9, scaleX: 0.7, scaleY: 1.3 },
      'U': { openAmount: 0.7, scaleX: 0.6, scaleY: 1.1 },
      
      // Consonants
      'M-B-P': { openAmount: 0.0, scaleX: 1.0, scaleY: 1.0 },
      'F-V': { openAmount: 0.2, scaleX: 0.9, scaleY: 0.9 },
      'T-D': { openAmount: 0.1, scaleX: 0.7, scaleY: 0.8 },
      'S-Z': { openAmount: 0.2, scaleX: 0.8, scaleY: 0.7 },
      'Sh': { openAmount: 0.3, scaleX: 0.9, scaleY: 0.8 },
      
      'neutral': { openAmount: 0.0, scaleX: 1.0, scaleY: 1.0 }
    };
  }

  /**
   * Update mouth shape based on mouth opening value
   */
  updateMouthShape(mouthOpeningValue) {
    this.mouthShape = mouthOpeningValue;
    
    if (!this.spriteRef) return;
    
    // Apply scale transformations based on mouth opening
    const scale = 0.8 + mouthOpeningValue * 0.4; // Scale between 0.8 and 1.2
    
    // Apply slight rotation for natural motion
    this.spriteRef.scale.set(scale, scale);
    this.spriteRef.rotation = Math.sin(mouthOpeningValue * Math.PI) * 0.05;
    
    // Tint changes with mouth opening (red tint when speaking)
    const blendFactor = mouthOpeningValue * 0.2;
    const red = 1.0;
    const green = 1.0 - blendFactor * 0.3;
    const blue = 1.0 - blendFactor * 0.3;
    
    // Apply color tint
    const tint = (Math.floor(red * 255) << 16) | 
                 (Math.floor(green * 255) << 8) | 
                 Math.floor(blue * 255);
    this.spriteRef.tint = tint;
  }

  /**
   * Apply specific viseme (mouth shape)
   */
  applyViseme(visemeName) {
    const viseme = this.visemeShapes[visemeName] || this.visemeShapes.neutral;
    this.currentViseme = visemeName;
    
    if (!this.spriteRef) return;
    
    // Apply scale transformations
    this.spriteRef.scale.set(viseme.scaleX, viseme.scaleY);
    
    // Apply open amount
    this.mouthShape = viseme.openAmount;
  }

  /**
   * Get current viseme
   */
  getCurrentViseme() {
    return this.currentViseme;
  }

  /**
   * Get mouth opening percentage
   */
  getMouthOpening() {
    return this.mouthShape;
  }
}

/**
 * Animation Timing Manager
 * Synchronizes animations with voice playback
 */
export class AnimationTimingManager {
  constructor() {
    this.animations = [];
    this.currentAnimation = null;
    this.startTime = null;
    this.animationFrameId = null;
  }

  /**
   * Add timed animation
   * @param {number} startTime - Time in seconds to start
   * @param {number} duration - Duration in seconds
   * @param {Function} update - Update function to call
   */
  addTimedAnimation(startTime, duration, update) {
    this.animations.push({
      startTime,
      duration,
      update,
      played: false
    });
  }

  /**
   * Start animation timeline
   */
  start(currentTime = 0) {
    this.startTime = currentTime;
    this.animate();
  }

  /**
   * Animate function called in loop
   */
  animate() {
    const currentTime = this.startTime + 
      (performance.now() - (this.animationStartPerformanceTime || performance.now())) / 1000;
    
    if (!this.animationStartPerformanceTime) {
      this.animationStartPerformanceTime = performance.now();
    }

    // Update all active animations
    for (let animation of this.animations) {
      const elapsed = currentTime - animation.startTime;
      
      if (elapsed >= 0 && elapsed < animation.duration) {
        animation.update(elapsed / animation.duration);
      } else if (!animation.played && elapsed >= animation.duration) {
        animation.update(1.0);
        animation.played = true;
      }
    }

    this.animationFrameId = requestAnimationFrame(() => this.animate());
  }

  /**
   * Stop animation timeline
   */
  stop() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  /**
   * Clear all animations
   */
  clear() {
    this.animations = [];
    this.stop();
  }
}

// Create singleton instance
export const voiceAvatarSync = new VoiceAvatarSyncService();
