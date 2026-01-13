import React, { useEffect, useRef } from 'react';
import * as PIXI from 'pixi.js';
import './Live2DAvatar.css';

const Live2DAvatar = ({ avatar, emotion }) => {
  const canvasRef = useRef(null);
  const appRef = useRef(null);
  const spriteRef = useRef(null);

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
    };
  }, [avatar]);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (spriteRef.current) {
      applyEmotionEffect(spriteRef.current, emotion);
    }
  }, [emotion]);

  const applyEmotionEffect = (sprite, emotion) => {
    if (!sprite) return;

    switch (emotion) {
      case 'happy':
        sprite.tint = 0xffeb3b; // Yellow tint
        sprite.scale.set(0.85);
        break;
      case 'sad':
        sprite.tint = 0x2196f3; // Blue tint
        sprite.scale.set(0.75);
        break;
      case 'angry':
        sprite.tint = 0xf44336; // Red tint
        sprite.scale.set(0.8);
        break;
      case 'surprised':
        sprite.tint = 0xff9800; // Orange tint
        sprite.scale.set(0.9);
        break;
      default:
        sprite.tint = 0xffffff; // Normal
        sprite.scale.set(0.8);
    }
  };

  return (
    <div className="live2d-avatar-container">
      {avatar ? (
        <>
          <canvas ref={canvasRef} className="live2d-canvas" />
          <div className="emotion-display">{emotion.toUpperCase()}</div>
        </>
      ) : (
        <div className="avatar-placeholder">Select an avatar to start</div>
      )}
    </div>
  );
};

export default Live2DAvatar;