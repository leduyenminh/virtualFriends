/**
 * Advanced Avatar Animation System
 * Supports idle, talking, gesture, and emotion-based animations
 */

export class AvatarAnimationLibrary {
  constructor() {
    this.animations = this.initializeAnimations();
  }

  /**
   * Initialize all animation definitions
   */
  initializeAnimations() {
    return {
      // Idle animations
      idle: {
        breathing: {
          name: 'Breathing',
          duration: 3000,
          keyframes: [
            { time: 0, scale: 1.0, rotation: 0, opacity: 1 },
            { time: 0.5, scale: 1.02, rotation: 0, opacity: 1 },
            { time: 1.0, scale: 1.0, rotation: 0, opacity: 1 }
          ]
        },
        blinking: {
          name: 'Blinking',
          duration: 4000,
          keyframes: [
            { time: 0, eyeOpen: 1.0 },
            { time: 0.9, eyeOpen: 1.0 },
            { time: 0.95, eyeOpen: 0.2 },
            { time: 1.0, eyeOpen: 1.0 }
          ]
        },
        swaying: {
          name: 'Swaying',
          duration: 5000,
          keyframes: [
            { time: 0, x: 0, rotation: 0 },
            { time: 0.25, x: 5, rotation: 0.05 },
            { time: 0.5, x: 0, rotation: 0 },
            { time: 0.75, x: -5, rotation: -0.05 },
            { time: 1.0, x: 0, rotation: 0 }
          ]
        },
        headTilt: {
          name: 'Head Tilt',
          duration: 4000,
          keyframes: [
            { time: 0, rotation: 0 },
            { time: 0.5, rotation: 0.1 },
            { time: 1.0, rotation: 0 }
          ]
        }
      },

      // Talking animations
      talking: {
        joyfulTalking: {
          name: 'Joyful Talking',
          duration: 2000,
          keyframes: [
            { time: 0, mouthOpen: 0.3, scale: 1.0, rotation: -0.02 },
            { time: 0.3, mouthOpen: 0.7, scale: 1.05, rotation: 0 },
            { time: 0.6, mouthOpen: 0.4, scale: 1.02, rotation: 0.02 },
            { time: 1.0, mouthOpen: 0.2, scale: 1.0, rotation: 0 }
          ]
        },
        calmTalking: {
          name: 'Calm Talking',
          duration: 2500,
          keyframes: [
            { time: 0, mouthOpen: 0.2, scale: 1.0 },
            { time: 0.4, mouthOpen: 0.5, scale: 1.01 },
            { time: 0.8, mouthOpen: 0.3, scale: 1.0 },
            { time: 1.0, mouthOpen: 0.1, scale: 1.0 }
          ]
        },
        angryTalking: {
          name: 'Angry Talking',
          duration: 1500,
          keyframes: [
            { time: 0, mouthOpen: 0.4, rotation: 0 },
            { time: 0.3, mouthOpen: 0.8, rotation: 0.08 },
            { time: 0.6, mouthOpen: 0.3, rotation: -0.06 },
            { time: 1.0, mouthOpen: 0.2, rotation: 0 }
          ]
        }
      },

      // Gesture animations
      gesture: {
        wave: {
          name: 'Wave',
          duration: 1000,
          keyframes: [
            { time: 0, armRotation: 0, scale: 1.0 },
            { time: 0.2, armRotation: -0.5 },
            { time: 0.4, armRotation: 0.3 },
            { time: 0.6, armRotation: -0.4 },
            { time: 0.8, armRotation: 0.2 },
            { time: 1.0, armRotation: 0, scale: 1.0 }
          ]
        },
        nod: {
          name: 'Nod',
          duration: 1200,
          keyframes: [
            { time: 0, headRotation: 0 },
            { time: 0.25, headRotation: 0.3 },
            { time: 0.5, headRotation: 0 },
            { time: 0.75, headRotation: 0.3 },
            { time: 1.0, headRotation: 0 }
          ]
        },
        shake: {
          name: 'Shake Head',
          duration: 1000,
          keyframes: [
            { time: 0, headRotation: 0 },
            { time: 0.2, headRotation: 0.2 },
            { time: 0.4, headRotation: -0.2 },
            { time: 0.6, headRotation: 0.2 },
            { time: 0.8, headRotation: -0.1 },
            { time: 1.0, headRotation: 0 }
          ]
        },
        thumbsUp: {
          name: 'Thumbs Up',
          duration: 1500,
          keyframes: [
            { time: 0, armY: 0, scale: 1.0 },
            { time: 0.3, armY: -50, scale: 1.05 },
            { time: 0.7, armY: -50, scale: 1.05 },
            { time: 1.0, armY: 0, scale: 1.0 }
          ]
        },
        point: {
          name: 'Point',
          duration: 1000,
          keyframes: [
            { time: 0, armRotation: 0, armX: 0 },
            { time: 0.3, armRotation: -0.6, armX: 30 },
            { time: 0.7, armRotation: -0.6, armX: 30 },
            { time: 1.0, armRotation: 0, armX: 0 }
          ]
        },
        jump: {
          name: 'Jump',
          duration: 800,
          keyframes: [
            { time: 0, y: 0, scale: 1.0 },
            { time: 0.3, y: -80, scale: 1.1 },
            { time: 0.7, y: -20, scale: 1.05 },
            { time: 1.0, y: 0, scale: 1.0 }
          ]
        },
        spin: {
          name: 'Spin',
          duration: 1500,
          keyframes: [
            { time: 0, rotation: 0, scale: 1.0 },
            { time: 1.0, rotation: Math.PI * 2, scale: 1.0 }
          ]
        }
      },

      // Emotion-based animations
      emotion: {
        happy: {
          celebrate: {
            name: 'Celebrate',
            duration: 2000,
            keyframes: [
              { time: 0, y: 0, scale: 1.0, rotation: 0 },
              { time: 0.25, y: -30, scale: 1.1, rotation: 0.1 },
              { time: 0.5, y: 0, scale: 1.0, rotation: -0.1 },
              { time: 0.75, y: -20, scale: 1.08, rotation: 0.05 },
              { time: 1.0, y: 0, scale: 1.0, rotation: 0 }
            ]
          }
        },
        sad: {
          droop: {
            name: 'Droop',
            duration: 1500,
            keyframes: [
              { time: 0, scale: 1.0, rotation: 0 },
              { time: 0.5, scale: 0.95, rotation: -0.15 },
              { time: 1.0, scale: 1.0, rotation: 0 }
            ]
          }
        },
        angry: {
          stamp: {
            name: 'Stamp',
            duration: 1000,
            keyframes: [
              { time: 0, y: 0, scale: 1.0 },
              { time: 0.2, y: 10, scale: 1.0 },
              { time: 0.4, y: 0, scale: 1.0 },
              { time: 0.6, y: 10, scale: 1.0 },
              { time: 0.8, y: 0, scale: 1.0 },
              { time: 1.0, y: 0, scale: 1.0 }
            ]
          }
        },
        surprised: {
          pop: {
            name: 'Pop',
            duration: 600,
            keyframes: [
              { time: 0, scale: 1.0 },
              { time: 0.5, scale: 1.2 },
              { time: 1.0, scale: 1.0 }
            ]
          }
        }
      }
    };
  }

  /**
   * Get animation by category and name
   */
  getAnimation(category, animationName) {
    return this.animations[category]?.[animationName];
  }

  /**
   * Get all animations in category
   */
  getAnimationsByCategory(category) {
    return this.animations[category] || {};
  }

  /**
   * List all available animation names in category
   */
  listAnimations(category) {
    return Object.keys(this.animations[category] || {});
  }

  /**
   * Get random idle animation
   */
  getRandomIdleAnimation() {
    const idleAnimations = Object.keys(this.animations.idle);
    const randomKey = idleAnimations[Math.floor(Math.random() * idleAnimations.length)];
    return this.animations.idle[randomKey];
  }

  /**
   * Get gesture animation based on emotion
   */
  getGestureForEmotion(emotion) {
    const gestureMap = {
      happy: 'celebrate',
      sad: 'droop',
      angry: 'stamp',
      surprised: 'pop'
    };
    const gestureName = gestureMap[emotion?.toLowerCase()] || 'nod';
    return this.animations.emotion[emotion?.toLowerCase()]?.[gestureName];
  }
}

/**
 * Animation Player - Executes animations on sprite
 */
export class AnimationPlayer {
  constructor(sprite) {
    this.sprite = sprite;
    this.currentAnimation = null;
    this.animationFrameId = null;
    this.animationLibrary = new AvatarAnimationLibrary();
    this.startTime = 0;
    this.queue = [];
    this.isPlaying = false;
  }

  /**
   * Play animation from library
   */
  playAnimation(category, animationName, loop = false) {
    const animation = this.animationLibrary.getAnimation(category, animationName);
    if (!animation) {
      console.warn(`Animation not found: ${category}/${animationName}`);
      return;
    }

    this.currentAnimation = { ...animation, category, animationName, loop };
    this.startTime = performance.now();
    this.isPlaying = true;

    this.animate();
  }

  /**
   * Queue animation to play after current one
   */
  queueAnimation(category, animationName, loop = false) {
    this.queue.push({ category, animationName, loop });
  }

  /**
   * Internal animation loop
   */
  animate = () => {
    if (!this.currentAnimation || !this.sprite) {
      this.animationFrameId = null;
      return;
    }

    const elapsed = performance.now() - this.startTime;
    const progress = (elapsed % this.currentAnimation.duration) / this.currentAnimation.duration;

    // Interpolate keyframes
    this.applyKeyframes(progress, this.currentAnimation.keyframes);

    // Check if animation is complete
    if (elapsed >= this.currentAnimation.duration) {
      if (this.currentAnimation.loop) {
        this.startTime = performance.now();
      } else {
        this.isPlaying = false;

        // Play next queued animation
        if (this.queue.length > 0) {
          const next = this.queue.shift();
          this.playAnimation(next.category, next.animationName, next.loop);
          return;
        }

        this.currentAnimation = null;
        return;
      }
    }

    this.animationFrameId = requestAnimationFrame(this.animate);
  };

  /**
   * Apply keyframe interpolation
   */
  applyKeyframes(progress, keyframes) {
    if (!keyframes || keyframes.length === 0) return;

    // Find surrounding keyframes
    let start = keyframes[0];
    let end = keyframes[keyframes.length - 1];

    for (let i = 0; i < keyframes.length - 1; i++) {
      if (keyframes[i].time <= progress && progress <= keyframes[i + 1].time) {
        start = keyframes[i];
        end = keyframes[i + 1];
        break;
      }
    }

    // Calculate local progress between keyframes
    const frameDuration = end.time - start.time;
    const frameProgress = frameDuration > 0 ? (progress - start.time) / frameDuration : 0;

    // Interpolate properties
    this.interpolateProperty('scale', start, end, frameProgress);
    this.interpolateProperty('rotation', start, end, frameProgress);
    this.interpolateProperty('x', start, end, frameProgress);
    this.interpolateProperty('y', start, end, frameProgress);
    this.interpolateProperty('opacity', start, end, frameProgress);
    this.interpolateProperty('mouthOpen', start, end, frameProgress);
    this.interpolateProperty('eyeOpen', start, end, frameProgress);
    this.interpolateProperty('armRotation', start, end, frameProgress);
    this.interpolateProperty('armX', start, end, frameProgress);
    this.interpolateProperty('armY', start, end, frameProgress);
    this.interpolateProperty('headRotation', start, end, frameProgress);
  }

  /**
   * Interpolate and apply property
   */
  interpolateProperty(prop, start, end, progress) {
    if (!(prop in start) || !(prop in end)) return;

    const value = start[prop] + (end[prop] - start[prop]) * progress;

    // Apply to sprite based on property type
    switch (prop) {
      case 'scale':
        this.sprite.scale.set(value);
        break;
      case 'rotation':
        this.sprite.rotation = value;
        break;
      case 'x':
        this.sprite.position.x += value;
        break;
      case 'y':
        this.sprite.position.y += value;
        break;
      case 'opacity':
        this.sprite.alpha = value;
        break;
      case 'mouthOpen':
        if (this.sprite.mouthSprite) {
          this.sprite.mouthSprite.scale.y = value;
        }
        break;
      case 'eyeOpen':
        if (this.sprite.eyeSprites) {
          this.sprite.eyeSprites.forEach(eye => {
            eye.scale.y = value;
          });
        }
        break;
      case 'armRotation':
        if (this.sprite.armSprite) {
          this.sprite.armSprite.rotation = value;
        }
        break;
      case 'headRotation':
        if (this.sprite.headSprite) {
          this.sprite.headSprite.rotation = value;
        }
        break;
    }
  }

  /**
   * Stop animation
   */
  stop() {
    this.isPlaying = false;
    this.currentAnimation = null;
    this.queue = [];
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  /**
   * Check if animation is playing
   */
  isAnimating() {
    return this.isPlaying;
  }
}

/**
 * Idle Animation Manager
 * Automatically plays random idle animations
 */
export class IdleAnimationManager {
  constructor(animationPlayer) {
    this.animationPlayer = animationPlayer;
    this.idleTimeout = null;
    this.isEnabled = true;
    this.idleDelay = 3000; // Wait 3s before playing idle animation
  }

  /**
   * Enable idle animations
   */
  enable() {
    this.isEnabled = true;
    this.scheduleIdleAnimation();
  }

  /**
   * Disable idle animations
   */
  disable() {
    this.isEnabled = false;
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
    }
  }

  /**
   * Schedule next idle animation
   */
  scheduleIdleAnimation() {
    if (!this.isEnabled) return;

    this.idleTimeout = setTimeout(() => {
      if (this.isEnabled && !this.animationPlayer.isAnimating()) {
        const idleAnim = this.animationPlayer.animationLibrary.getRandomIdleAnimation();
        this.animationPlayer.playAnimation('idle', Object.keys(
          this.animationPlayer.animationLibrary.animations.idle
        )[Math.floor(Math.random() * Object.keys(
          this.animationPlayer.animationLibrary.animations.idle
        ).length)], false);

        this.scheduleIdleAnimation();
      }
    }, this.idleDelay);
  }

  /**
   * Reset idle timer
   */
  reset() {
    if (this.idleTimeout) {
      clearTimeout(this.idleTimeout);
    }
    this.scheduleIdleAnimation();
  }

  /**
   * Set idle delay
   */
  setIdleDelay(delay) {
    this.idleDelay = delay;
    this.reset();
  }
}
