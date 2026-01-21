/**
 * Avatar Customization System
 * Handles colors, outfits, accessories, and expression customization
 */

import * as PIXI from 'pixi.js';

export class AvatarCustomizer {
  constructor() {
    this.customizations = this.initializeCustomizations();
  }

  /**
   * Initialize available customization options
   */
  initializeCustomizations() {
    return {
      colors: {
        skin: [
          { name: 'Light', hex: '#f4a89f', value: 0xf4a89f },
          { name: 'Medium', hex: '#d98860', value: 0xd98860 },
          { name: 'Tan', hex: '#c9944f', value: 0xc9944f },
          { name: 'Dark', hex: '#8b5a3c', value: 0x8b5a3c },
          { name: 'Blue', hex: '#7eb3ff', value: 0x7eb3ff },
          { name: 'Green', hex: '#90ee90', value: 0x90ee90 },
          { name: 'Purple', hex: '#d8a8ff', value: 0xd8a8ff }
        ],
        hair: [
          { name: 'Black', hex: '#1a1a1a', value: 0x1a1a1a },
          { name: 'Brown', hex: '#8b6f47', value: 0x8b6f47 },
          { name: 'Blonde', hex: '#ffd700', value: 0xffd700 },
          { name: 'Red', hex: '#ff6b6b', value: 0xff6b6b },
          { name: 'White', hex: '#ffffff', value: 0xffffff },
          { name: 'Pink', hex: '#ff69b4', value: 0xff69b4 },
          { name: 'Blue', hex: '#4169e1', value: 0x4169e1 }
        ],
        outfit: [
          { name: 'Casual', hex: '#87ceeb', value: 0x87ceeb },
          { name: 'Formal', hex: '#2f4f4f', value: 0x2f4f4f },
          { name: 'Summer', hex: '#ffb347', value: 0xffb347 },
          { name: 'Winter', hex: '#e0ffff', value: 0xe0ffff },
          { name: 'Sporty', hex: '#ff1493', value: 0xff1493 },
          { name: 'Elegant', hex: '#daa520', value: 0xdaa520 }
        ]
      },

      outfits: [
        { id: 'casual', name: 'Casual T-Shirt', scale: 1.0, offset: { x: 0, y: 0 } },
        { id: 'formal', name: 'Formal Suit', scale: 1.05, offset: { x: 0, y: -5 } },
        { id: 'summer', name: 'Summer Dress', scale: 1.1, offset: { x: 0, y: 10 } },
        { id: 'sporty', name: 'Sports Outfit', scale: 0.95, offset: { x: 0, y: 0 } },
        { id: 'coat', name: 'Winter Coat', scale: 1.15, offset: { x: 0, y: -10 } }
      ],

      accessories: [
        { id: 'none', name: 'None', type: 'none' },
        { id: 'hat_beret', name: 'Beret', type: 'hat', offset: { x: 0, y: -60 } },
        { id: 'hat_crown', name: 'Crown', type: 'hat', offset: { x: 0, y: -70 } },
        { id: 'hat_top', name: 'Top Hat', type: 'hat', offset: { x: 0, y: -80 } },
        { id: 'hat_beanie', name: 'Beanie', type: 'hat', offset: { x: 0, y: -50 } },
        { id: 'glasses_normal', name: 'Glasses', type: 'glasses', offset: { x: 0, y: -20 } },
        { id: 'glasses_shades', name: 'Sunglasses', type: 'glasses', offset: { x: 0, y: -18 } },
        { id: 'glasses_hearts', name: 'Heart Glasses', type: 'glasses', offset: { x: 0, y: -20 } },
        { id: 'earrings_pearl', name: 'Pearl Earrings', type: 'earrings', offset: { x: 40, y: -10 } },
        { id: 'earrings_diamond', name: 'Diamond Earrings', type: 'earrings', offset: { x: 40, y: -15 } },
        { id: 'necklace_gold', name: 'Gold Necklace', type: 'necklace', offset: { x: 0, y: 10 } },
        { id: 'necklace_pearl', name: 'Pearl Necklace', type: 'necklace', offset: { x: 0, y: 5 } },
        { id: 'wings_angel', name: 'Angel Wings', type: 'back', offset: { x: 0, y: 0 } },
        { id: 'wings_demon', name: 'Demon Wings', type: 'back', offset: { x: 0, y: 0 } }
      ],

      expressions: [
        { id: 'neutral', name: 'Neutral', eyeScale: 1.0, mouthScale: 1.0 },
        { id: 'happy', name: 'Happy', eyeScale: 1.2, mouthScale: 1.3 },
        { id: 'sad', name: 'Sad', eyeScale: 0.9, mouthScale: 0.8 },
        { id: 'angry', name: 'Angry', eyeScale: 1.1, mouthScale: 0.9 },
        { id: 'surprised', name: 'Surprised', eyeScale: 1.4, mouthScale: 1.4 },
        { id: 'thinking', name: 'Thinking', eyeScale: 1.0, mouthScale: 0.7 },
        { id: 'winking', name: 'Winking', eyeScale: 0.5, mouthScale: 1.1 }
      ],

      effects: [
        { id: 'none', name: 'None', overlay: false },
        { id: 'glow', name: 'Glow', overlay: true, color: 0xffff00, alpha: 0.3 },
        { id: 'shadow', name: 'Shadow', overlay: true, color: 0x000000, alpha: 0.4 },
        { id: 'neon_blue', name: 'Neon Blue', overlay: true, color: 0x00ffff, alpha: 0.5 },
        { id: 'neon_pink', name: 'Neon Pink', overlay: true, color: 0xff00ff, alpha: 0.5 }
      ]
    };
  }

  /**
   * Get all color options for a part
   */
  getColors(part) {
    return this.customizations.colors[part] || [];
  }

  /**
   * Get all outfit options
   */
  getOutfits() {
    return this.customizations.outfits;
  }

  /**
   * Get all accessories
   */
  getAccessories() {
    return this.customizations.accessories;
  }

  /**
   * Get all expression options
   */
  getExpressions() {
    return this.customizations.expressions;
  }

  /**
   * Get all effects
   */
  getEffects() {
    return this.customizations.effects;
  }

  /**
   * Get color by id
   */
  getColor(part, colorId) {
    return this.getColors(part).find(c => c.name.toLowerCase() === colorId.toLowerCase());
  }

  /**
   * Get outfit by id
   */
  getOutfit(outfitId) {
    return this.getOutfits().find(o => o.id === outfitId);
  }

  /**
   * Get accessory by id
   */
  getAccessory(accessoryId) {
    return this.getAccessories().find(a => a.id === accessoryId);
  }

  /**
   * Get expression by id
   */
  getExpression(expressionId) {
    return this.getExpressions().find(e => e.id === expressionId);
  }

  /**
   * Create customization preset
   */
  createPreset(name, customizations) {
    return {
      id: Date.now().toString(),
      name,
      timestamp: new Date(),
      ...customizations
    };
  }

  /**
   * Validate customization values
   */
  validateCustomization(customization) {
    const errors = [];

    if (customization.skinColor && !this.getColor('skin', customization.skinColor)) {
      errors.push('Invalid skin color');
    }
    if (customization.hairColor && !this.getColor('hair', customization.hairColor)) {
      errors.push('Invalid hair color');
    }
    if (customization.outfitColor && !this.getColor('outfit', customization.outfitColor)) {
      errors.push('Invalid outfit color');
    }
    if (customization.outfit && !this.getOutfit(customization.outfit)) {
      errors.push('Invalid outfit');
    }
    if (customization.accessories && Array.isArray(customization.accessories)) {
      customization.accessories.forEach(acc => {
        if (!this.getAccessory(acc)) {
          errors.push(`Invalid accessory: ${acc}`);
        }
      });
    }
    if (customization.expression && !this.getExpression(customization.expression)) {
      errors.push('Invalid expression');
    }

    return errors;
  }
}

/**
 * Avatar Customization Renderer
 * Applies customizations to PIXI sprite
 */
export class AvatarCustomizationRenderer {
  constructor(sprite, customizer) {
    this.sprite = sprite;
    this.customizer = customizer;
    this.customizations = {
      skinColor: 'Light',
      hairColor: 'Black',
      outfitColor: 'Casual',
      outfit: 'casual',
      accessories: [],
      expression: 'neutral',
      effect: 'none'
    };
    this.accessories = {};
    this.overlaySprite = null;
  }

  /**
   * Apply full customization
   */
  applyCustomization(customizations) {
    // Validate
    const errors = this.customizer.validateCustomization(customizations);
    if (errors.length > 0) {
      console.error('Customization errors:', errors);
      return false;
    }

    // Update stored customizations
    this.customizations = { ...this.customizations, ...customizations };

    // Apply colors
    if (customizations.skinColor) {
      this.applySkinColor(customizations.skinColor);
    }
    if (customizations.hairColor) {
      this.applyHairColor(customizations.hairColor);
    }
    if (customizations.outfitColor) {
      this.applyOutfitColor(customizations.outfitColor);
    }

    // Apply outfit
    if (customizations.outfit) {
      this.applyOutfit(customizations.outfit);
    }

    // Apply accessories
    if (customizations.accessories) {
      this.applyAccessories(customizations.accessories);
    }

    // Apply expression
    if (customizations.expression) {
      this.applyExpression(customizations.expression);
    }

    // Apply effect
    if (customizations.effect) {
      this.applyEffect(customizations.effect);
    }

    return true;
  }

  /**
   * Apply skin color
   */
  applySkinColor(colorName) {
    const color = this.customizer.getColor('skin', colorName);
    if (color && this.sprite.skinPart) {
      this.sprite.skinPart.tint = color.value;
    } else if (color) {
      // Apply to main sprite if no specific skin part
      this.sprite.tint = color.value;
    }
  }

  /**
   * Apply hair color
   */
  applyHairColor(colorName) {
    const color = this.customizer.getColor('hair', colorName);
    if (color && this.sprite.hairPart) {
      this.sprite.hairPart.tint = color.value;
    }
  }

  /**
   * Apply outfit color
   */
  applyOutfitColor(colorName) {
    const color = this.customizer.getColor('outfit', colorName);
    if (color && this.sprite.outfitPart) {
      this.sprite.outfitPart.tint = color.value;
    }
  }

  /**
   * Apply outfit style
   */
  applyOutfit(outfitId) {
    const outfit = this.customizer.getOutfit(outfitId);
    if (!outfit) return;

    if (this.sprite.outfitPart) {
      this.sprite.outfitPart.scale.set(outfit.scale);
      this.sprite.outfitPart.position.x += outfit.offset.x;
      this.sprite.outfitPart.position.y += outfit.offset.y;
    }
  }

  /**
   * Apply accessories
   */
  applyAccessories(accessoryIds) {
    // Clear existing accessories
    Object.values(this.accessories).forEach(acc => {
      if (acc.parent) {
        acc.parent.removeChild(acc);
      }
    });
    this.accessories = {};

    // Add new accessories
    accessoryIds.forEach(accId => {
      const accessory = this.customizer.getAccessory(accId);
      if (accessory && accessory.id !== 'none') {
        this.addAccessory(accessory);
      }
    });
  }

  /**
   * Add single accessory
   */
  addAccessory(accessory) {
    // Create visual representation (simplified - would be graphics in real implementation)
    const accSprite = new PIXI.Graphics();
    accSprite.beginFill(0xcccccc);
    accSprite.drawCircle(0, 0, 15);
    accSprite.endFill();

    accSprite.position.set(
      this.sprite.position.x + accessory.offset.x,
      this.sprite.position.y + accessory.offset.y
    );

    this.sprite.parent.addChild(accSprite);
    this.accessories[accessory.id] = accSprite;
  }

  /**
   * Apply expression (eye and mouth modifications)
   */
  applyExpression(expressionId) {
    const expression = this.customizer.getExpression(expressionId);
    if (!expression) return;

    if (this.sprite.eyeSprites) {
      this.sprite.eyeSprites.forEach(eye => {
        eye.scale.y = expression.eyeScale;
      });
    }

    if (this.sprite.mouthSprite) {
      this.sprite.mouthSprite.scale.y = expression.mouthScale;
    }
  }

  /**
   * Apply visual effect
   */
  applyEffect(effectId) {
    // Remove existing overlay
    if (this.overlaySprite && this.overlaySprite.parent) {
      this.overlaySprite.parent.removeChild(this.overlaySprite);
    }

    const effect = this.customizer.getEffects().find(e => e.id === effectId);
    if (!effect || !effect.overlay) return;

    // Create overlay
    const overlay = new PIXI.Graphics();
    overlay.beginFill(effect.color, effect.alpha);
    overlay.drawCircle(0, 0, 100);
    overlay.endFill();

    overlay.position = this.sprite.position;
    this.sprite.parent.addChild(overlay);
    this.sprite.parent.setChildIndex(this.sprite, this.sprite.parent.children.length - 1);

    this.overlaySprite = overlay;
  }

  /**
   * Get current customizations
   */
  getCurrentCustomizations() {
    return { ...this.customizations };
  }

  /**
   * Export customization as JSON
   */
  exportAsJSON() {
    return JSON.stringify(this.customizations, null, 2);
  }

  /**
   * Import customization from JSON
   */
  importFromJSON(jsonString) {
    try {
      const customizations = JSON.parse(jsonString);
      this.applyCustomization(customizations);
      return true;
    } catch (error) {
      console.error('Failed to import customization:', error);
      return false;
    }
  }
}
