/**
 * Unit Tests for Avatar Animation System
 * Tests animation library, player, and idle manager
 */

import { AvatarAnimationLibrary, AnimationPlayer, IdleAnimationManager } from '../AvatarAnimationService';

describe('AvatarAnimationLibrary', () => {
  let library;

  beforeEach(() => {
    library = new AvatarAnimationLibrary();
  });

  test('should initialize with all animation categories', () => {
    expect(library.animations).toHaveProperty('idle');
    expect(library.animations).toHaveProperty('talking');
    expect(library.animations).toHaveProperty('gesture');
    expect(library.animations).toHaveProperty('emotion');
  });

  test('should have idle animations', () => {
    const idleAnimations = library.listAnimations('idle');
    expect(idleAnimations.length).toBeGreaterThan(0);
    expect(idleAnimations).toContain('breathing');
    expect(idleAnimations).toContain('blinking');
  });

  test('should have gesture animations', () => {
    const gestures = library.listAnimations('gesture');
    expect(gestures.length).toBeGreaterThan(0);
    expect(gestures).toContain('wave');
    expect(gestures).toContain('nod');
    expect(gestures).toContain('jump');
  });

  test('should get animation by category and name', () => {
    const waveAnimation = library.getAnimation('gesture', 'wave');
    expect(waveAnimation).toBeDefined();
    expect(waveAnimation.name).toBe('Wave');
    expect(waveAnimation.keyframes).toBeDefined();
  });

  test('should get random idle animation', () => {
    const animation = library.getRandomIdleAnimation();
    expect(animation).toBeDefined();
    expect(animation.keyframes).toBeDefined();
  });

  test('should get gesture for emotion', () => {
    const celebrate = library.getGestureForEmotion('happy');
    expect(celebrate).toBeDefined();
    
    const droop = library.getGestureForEmotion('sad');
    expect(droop).toBeDefined();
  });

  test('should have talking animations for different emotions', () => {
    const joyful = library.getAnimation('talking', 'joyfulTalking');
    expect(joyful).toBeDefined();
    expect(joyful.name).toBe('Joyful Talking');
  });
});

describe('AvatarCustomizer', () => {
  let customizer;

  beforeEach(() => {
    const { AvatarCustomizer } = require('../AvatarCustomizationService');
    customizer = new AvatarCustomizer();
  });

  test('should have skin colors', () => {
    const colors = customizer.getColors('skin');
    expect(colors.length).toBeGreaterThan(0);
    expect(colors.some(c => c.name === 'Light')).toBe(true);
  });

  test('should have hair colors', () => {
    const colors = customizer.getColors('hair');
    expect(colors.length).toBeGreaterThan(0);
  });

  test('should have outfits', () => {
    const outfits = customizer.getOutfits();
    expect(outfits.length).toBeGreaterThan(0);
    expect(outfits.some(o => o.id === 'casual')).toBe(true);
  });

  test('should have accessories', () => {
    const accessories = customizer.getAccessories();
    expect(accessories.length).toBeGreaterThan(0);
  });

  test('should have expressions', () => {
    const expressions = customizer.getExpressions();
    expect(expressions.length).toBeGreaterThan(0);
    expect(expressions.some(e => e.id === 'happy')).toBe(true);
  });

  test('should get color by id', () => {
    const light = customizer.getColor('skin', 'Light');
    expect(light).toBeDefined();
    expect(light.hex).toBeDefined();
  });

  test('should validate customization', () => {
    const customization = {
      skinColor: 'Light',
      hairColor: 'Black',
      expression: 'happy'
    };
    const errors = customizer.validateCustomization(customization);
    expect(errors.length).toBe(0);
  });

  test('should detect invalid customization', () => {
    const customization = {
      skinColor: 'InvalidColor',
      expression: 'happy'
    };
    const errors = customizer.validateCustomization(customization);
    expect(errors.length).toBeGreaterThan(0);
  });

  test('should create preset', () => {
    const customization = { skinColor: 'Light', hairColor: 'Black' };
    const preset = customizer.createPreset('My Avatar', customization);
    expect(preset.id).toBeDefined();
    expect(preset.name).toBe('My Avatar');
    expect(preset.skinColor).toBe('Light');
  });
});

describe('ChatReactionAnalyzer', () => {
  let analyzer;

  beforeEach(() => {
    const { ChatReactionAnalyzer } = require('../ChatReactionService');
    analyzer = new ChatReactionAnalyzer();
  });

  test('should handle empty message', () => {
    const reaction = analyzer.analyzeMessage('');
    expect(reaction).toBeNull();
  });

  test('should detect greeting', () => {
    const reaction = analyzer.analyzeMessage('Hello there!');
    expect(reaction).toBeDefined();
    expect(['greeting', 'happy', 'neutral']).toContain(reaction.type || reaction.emotion);
  });

  test('should detect appreciation', () => {
    const reaction = analyzer.analyzeMessage('Thank you so much!');
    expect(reaction).toBeDefined();
    expect(reaction.emotion).toBeTruthy();
  });

  test('should detect excitement', () => {
    const reaction = analyzer.analyzeMessage('This is amazing!!!');
    expect(reaction).toBeDefined();
    expect(reaction.intensity).toBeGreaterThan(0.5);
  });

  test('should detect sadness', () => {
    const reaction = analyzer.analyzeMessage('I am so sad');
    expect(reaction).toBeDefined();
    expect(['sad', 'neutral']).toContain(reaction.emotion);
  });

  test('should have confidence score', () => {
    const reaction = analyzer.analyzeMessage('Hello!');
    expect(reaction.confidence).toBeGreaterThanOrEqual(0);
    expect(reaction.confidence).toBeLessThanOrEqual(1);
  });

  test('should have reactions list', () => {
    const reaction = analyzer.analyzeMessage('Wave!');
    expect(Array.isArray(reaction.reactions)).toBe(true);
  });

  test('should add messages to context', () => {
    analyzer.analyzeMessage('First message');
    analyzer.analyzeMessage('Second message');
    const context = analyzer.getContext();
    expect(context.messageCount).toBe(2);
  });

  test('should clear context', () => {
    analyzer.analyzeMessage('Message');
    analyzer.clearContext();
    const context = analyzer.getContext();
    expect(context.messageCount).toBe(0);
  });
});

describe('ConversationContextManager', () => {
  let manager;
  let mockReaction;

  beforeEach(() => {
    const { ConversationContextManager } = require('../ChatReactionService');
    manager = new ConversationContextManager();
    mockReaction = {
      emotion: 'happy',
      reactions: ['wave']
    };
  });

  test('should track message count', () => {
    manager.updateState('Hello', mockReaction);
    manager.updateState('How are you?', mockReaction);
    expect(manager.state.messageCount).toBe(2);
  });

  test('should detect emotional trend', () => {
    manager.updateState('I am happy', { emotion: 'happy', reactions: ['wave'] });
    manager.updateState('I am still happy', { emotion: 'happy', reactions: ['wave'] });
    expect(manager.state.emotionalTrend).toBe('happy');
  });

  test('should detect conversation theme', () => {
    manager.updateState('I am working on a project', mockReaction);
    expect(manager.conversationTheme).toBe('work');
  });

  test('should track engagement', () => {
    manager.updateState('Hello', mockReaction);
    manager.updateState('Hi there', mockReaction);
    manager.updateState('How are you?', mockReaction);
    expect(manager.state.engaged).toBeTruthy();
  });

  test('should get insights', () => {
    manager.updateState('I love this!', mockReaction);
    const insights = manager.getInsights();
    expect(insights).toHaveProperty('theme');
    expect(insights).toHaveProperty('emotionalTrend');
    expect(insights).toHaveProperty('isEngaged');
    expect(insights).toHaveProperty('messageCount');
  });

  test('should reset state', () => {
    manager.updateState('Message', mockReaction);
    manager.resetState();
    expect(manager.state.messageCount).toBe(0);
  });
});

describe('EmotionDetectionService', () => {
  let service;

  beforeEach(() => {
    service = require('../EmotionDetectionService').default;
  });

  test('should detect happy emotion', () => {
    const result = service.detectEmotion('I am so happy!');
    expect(result).toBeDefined();
    expect(['happy', 'neutral']).toContain(result.emotion);
  });

  test('should detect sad emotion', () => {
    const result = service.detectEmotion('I feel so sad');
    expect(result).toBeDefined();
    expect(['sad', 'neutral']).toContain(result.emotion);
  });

  test('should have confidence score', () => {
    const result = service.detectEmotion('Great!');
    expect(result.confidence).toBeGreaterThanOrEqual(0);
    expect(result.confidence).toBeLessThanOrEqual(1);
  });

  test('should provide reason for detection', () => {
    const result = service.detectEmotion('Hello');
    expect(result.reason).toBeDefined();
    expect(typeof result.reason).toBe('string');
  });

  test('should get emotion scores', () => {
    const scores = service.getEmotionScores('I am happy');
    expect(scores).toHaveProperty('happy');
    expect(scores).toHaveProperty('sad');
    expect(scores).toHaveProperty('neutral');
  });

  test('should handle emoji', () => {
    const result = service.detectEmotion('😊');
    expect(result).toBeDefined();
  });
});

describe('ErrorHandler', () => {
  let handler;

  beforeEach(() => {
    const { ErrorHandler } = require('../ErrorHandling');
    handler = ErrorHandler;
  });

  test('should have error messages defined', () => {
    expect(handler.ERROR_MESSAGES).toBeDefined();
    expect(handler.ERROR_MESSAGES.FILE_TOO_LARGE).toBeDefined();
  });

  test('should validate files', () => {
    const errors = handler.validateFile(null);
    expect(errors.length).toBeGreaterThan(0);
  });

  test('should validate images', () => {
    const errors = handler.validateImage(null);
    expect(errors.length).toBe(0); // Images are optional
  });

  test('should validate input', () => {
    const errors = handler.validateInput('', '', '');
    expect(errors.length).toBeGreaterThan(0);
  });

  test('should validate non-empty input', () => {
    const errors = handler.validateInput('Test', 'Description', 'Category');
    expect(errors.length).toBe(0);
  });
});
