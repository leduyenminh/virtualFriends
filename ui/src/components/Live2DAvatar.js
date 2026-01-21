import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as PIXI from 'pixi.js';
import EmotionDetectionService from '../services/EmotionDetectionService';
import { VoiceAvatarSyncService, LipSyncController } from '../services/VoiceAvatarSyncService';
import { AnimationPlayer, IdleAnimationManager } from '../services/AvatarAnimationService';
import { AvatarCustomizer, AvatarCustomizationRenderer } from '../services/AvatarCustomizationService';
import { ChatReactionExecutor, ConversationContextManager } from '../services/ChatReactionService';
import './Live2DAvatar.css';

const Live2DAvatar = ({ avatar, emotion, userMessage, audioUrl, onMessageReceived }) => {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const spriteRef = useRef(null);
  const voiceSyncRef = useRef(null);
  const lipSyncRef = useRef(null);
  const animationPlayerRef = useRef(null);
  const idleManagerRef = useRef(null);
  const customizationRef = useRef(null);
  const reactionExecutorRef = useRef(null);
  const conversationContextRef = useRef(null);
  const [isSpeak, setIsSpeak] = useState(false);
  const [showCustomization, setShowCustomization] = useState(false);
  const [currentCustomization, setCurrentCustomization] = useState(null);

  useEffect(() => {
    if (!canvasRef.current || !avatar) return;

    const initializePixiApp = async () => {
      try {
        // Create PIXI Application
        const app = new PIXI.Application({
          view: canvasRef.current,
          width: 400,
          height: 600,
          backgroundColor: 0xf0f0f0,
          resolution: 1
        });
        appRef.current = app;

        // Load avatar texture from API
        const response = await fetch(`http://localhost:8083/avatar/models/${avatar.id}/texture`);
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        
        const texture = await PIXI.Assets.load(url);
        const sprite = new PIXI.Sprite(texture);
        
        sprite.anchor.set(0.5);
        sprite.position.set(app.canvas.width / 2, app.canvas.height / 2);
        sprite.scale.set(0.8);
        
        app.stage.addChild(sprite);
        spriteRef.current = sprite;

        // Initialize animation system
        animationPlayerRef.current = new AnimationPlayer(sprite);
        idleManagerRef.current = new IdleAnimationManager(animationPlayerRef.current);
        idleManagerRef.current.enable();

        // Initialize customization system
        const customizer = new AvatarCustomizer();
        customizationRef.current = new AvatarCustomizationRenderer(sprite, customizer);

        // Initialize chat reaction system
        reactionExecutorRef.current = new ChatReactionExecutor(
          animationPlayerRef.current,
          customizationRef.current
        );
        conversationContextRef.current = new ConversationContextManager();

        // Apply initial customization
        if (currentCustomization) {
          customizationRef.current.applyCustomization(currentCustomization);
        }

        // Apply emotion effect
        applyEmotionEffect(sprite, emotion);
      } catch (err) {
        console.error('Failed to load avatar:', err);
      }
    };

    initializePixiApp();

    return () => {
      if (appRef.current) {
        appRef.current.destroy(true);
      }
      if (idleManagerRef.current) {
        idleManagerRef.current.disable();
      }
      if (animationPlayerRef.current) {
        animationPlayerRef.current.stop();
      }
      if (voiceSyncRef.current) {
        voiceSyncRef.current.stop();
      }
    };
  }, [avatar]);

  // Handle message reactions
  useEffect(() => {
    if (userMessage && reactionExecutorRef.current && conversationContextRef.current) {
      const reaction = reactionExecutorRef.current.getAnalyzer().analyzeMessage(userMessage);
      if (reaction) {
        conversationContextRef.current.updateState(userMessage, reaction);
        reactionExecutorRef.current.processMessage(userMessage);
      }
    }
  }, [userMessage]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (spriteRef.current) {
      applyEmotionEffect(spriteRef.current, emotion);
    }
  }, [emotion]);

  const applyEmotionEffect = (sprite, emotion) => {
    if (!sprite) return;

    // Get emotion scores from the service for advanced effects
    const emotionScores = userMessage ? 
      EmotionDetectionService.getEmotionScores(userMessage) : 
      { happy: 0.5, sad: 0.1, angry: 0.1, surprised: 0.1, fearful: 0.1, neutral: 0.6 };
    
    switch (emotion) {
      case 'happy':
        sprite.tint = 0xffeb3b; // Yellow tint
        sprite.scale.set(0.85);
        sprite.rotation = Math.sin(Date.now() / 500) * 0.05; // Subtle bobbing
        break;
      case 'sad':
        sprite.tint = 0x2196f3; // Blue tint
        sprite.scale.set(0.75);
        sprite.rotation = 0;
        break;
      case 'angry':
        sprite.tint = 0xf44336; // Red tint
        sprite.scale.set(0.8);
        sprite.rotation = Math.sin(Date.now() / 300) * 0.08; // Aggressive shake
        break;
      case 'surprised':
        sprite.tint = 0xff9800; // Orange tint
        sprite.scale.set(0.9);
        sprite.rotation = 0;
        break;
      default:
        sprite.tint = 0xffffff; // Normal
        sprite.scale.set(0.8);
        sprite.rotation = 0;
    }
  };

  // Handle voice playback with lip-sync
  const handlePlayVoice = useCallback(async () => {
    if (!audioUrl || !spriteRef.current) return;

    try {
      setIsSpeak(true);

      // Initialize voice sync if not already done
      if (!voiceSyncRef.current) {
        voiceSyncRef.current = new VoiceAvatarSyncService();
        lipSyncRef.current = new LipSyncController(spriteRef.current);
      }

      // Play voice with lip-sync
      await voiceSyncRef.current.playVoiceWithSync(
        audioUrl,
        (mouthOpening) => {
          if (lipSyncRef.current) {
            lipSyncRef.current.updateMouthShape(mouthOpening);
          }
        },
        () => {
          // Frequency callback - could trigger additional animations
        }
      );

      // Reset when done
      setIsSpeak(false);
    } catch (error) {
      console.error('Error playing voice:', error);
      setIsSpeak(false);
    }
  }, [audioUrl]);

  // Play gesture animation
  const playGesture = useCallback((gestureName) => {
    if (animationPlayerRef.current) {
      animationPlayerRef.current.playAnimation('gesture', gestureName, false);
      if (idleManagerRef.current) {
        idleManagerRef.current.reset();
      }
    }
  }, []);

  // Apply customization
  const applyCustomization = useCallback((customization) => {
    if (customizationRef.current) {
      const success = customizationRef.current.applyCustomization(customization);
      if (success) {
        setCurrentCustomization(customization);
      }
      return success;
    }
    return false;
  }, []);

  // Get available gestures
  const getAvailableGestures = useCallback(() => {
    if (animationPlayerRef.current) {
      return animationPlayerRef.current.animationLibrary.listAnimations('gesture');
    }
    return [];
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (voiceSyncRef.current) {
        voiceSyncRef.current.stop();
      }
    };
  }, []);

  return (
    <div className="live2d-avatar-container">
      {avatar ? (
        <>
          <canvas ref={canvasRef} className="live2d-canvas" />
          <div className="emotion-display">
            {emotion.toUpperCase()}
            {isSpeak && <span className="speaking-indicator">🔊 Speaking</span>}
          </div>
          <div className="avatar-controls">
            {audioUrl && (
              <button 
                className="control-button voice-button" 
                onClick={handlePlayVoice}
                disabled={isSpeak}
                title="Play voice with lip-sync"
              >
                {isSpeak ? '🔊 Playing...' : '🔊 Voice'}
              </button>
            )}
            <button 
              className="control-button gesture-button"
              onClick={() => playGesture('wave')}
              title="Wave gesture"
            >
              👋 Wave
            </button>
            <button 
              className="control-button gesture-button"
              onClick={() => playGesture('nod')}
              title="Nod gesture"
            >
              📍 Nod
            </button>
            <button 
              className="control-button gesture-button"
              onClick={() => playGesture('jump')}
              title="Jump gesture"
            >
              🤸 Jump
            </button>
            <button 
              className="control-button customize-button"
              onClick={() => setShowCustomization(!showCustomization)}
              title="Customize avatar"
            >
              🎨 Customize
            </button>
          </div>
          {showCustomization && (
            <div className="customization-panel">
              <h3>Avatar Customization</h3>
              <div className="customization-group">
                <label>Skin Color:</label>
                <div className="color-options">
                  {['Light', 'Medium', 'Tan', 'Dark'].map(color => (
                    <button
                      key={color}
                      className="color-button"
                      onClick={() => applyCustomization({ skinColor: color })}
                      title={color}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
              <div className="customization-group">
                <label>Hair Color:</label>
                <div className="color-options">
                  {['Black', 'Brown', 'Blonde', 'Red'].map(color => (
                    <button
                      key={color}
                      className="color-button"
                      onClick={() => applyCustomization({ hairColor: color })}
                      title={color}
                    >
                      {color}
                    </button>
                  ))}
                </div>
              </div>
              <div className="customization-group">
                <label>Expression:</label>
                <div className="expression-options">
                  {['happy', 'sad', 'angry', 'surprised', 'neutral'].map(expr => (
                    <button
                      key={expr}
                      className="expression-button"
                      onClick={() => applyCustomization({ expression: expr })}
                      title={expr}
                    >
                      {expr}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="avatar-placeholder">Select an avatar to start</div>
      )}
    </div>
  );
};

export default Live2DAvatar;