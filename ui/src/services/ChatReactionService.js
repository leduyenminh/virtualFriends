import EmotionDetectionService from './EmotionDetectionService';

/**
 * Real-time Chat Reactions System
 * Analyzes user messages and triggers dynamic avatar reactions
 */

export class ChatReactionAnalyzer {
  constructor() {
    this.reactionMap = this.initializeReactionMap();
    this.contextHistory = [];
    this.maxHistory = 10;
  }

  /**
   * Initialize reaction mapping rules
   */
  initializeReactionMap() {
    return {
      // Greeting reactions
      greeting: {
        keywords: ['hello', 'hi', 'hey', 'greetings', 'good morning', 'good afternoon', 'good evening'],
        reactions: ['wave', 'nod'],
        emotion: 'happy',
        intensity: 0.5
      },

      // Appreciation reactions
      appreciation: {
        keywords: ['thanks', 'thank you', 'appreciate', 'grateful', 'love', 'awesome', 'great', 'amazing'],
        reactions: ['thumbsUp', 'celebrate'],
        emotion: 'happy',
        intensity: 0.7
      },

      // Question reactions
      question: {
        keywords: ['?', 'what', 'how', 'why', 'when', 'where', 'who', 'can you', 'could you', 'would you'],
        reactions: ['thinking', 'nod'],
        emotion: 'neutral',
        intensity: 0.4
      },

      // Agreement reactions
      agreement: {
        keywords: ['yes', 'yeah', 'yep', 'agree', 'absolutely', 'definitely', 'sure', 'okay', 'ok'],
        reactions: ['nod', 'thumbsUp'],
        emotion: 'happy',
        intensity: 0.6
      },

      // Disagreement reactions
      disagreement: {
        keywords: ['no', 'nope', 'disagree', 'never', 'not really', 'false', 'wrong'],
        reactions: ['shake', 'point'],
        emotion: 'sad',
        intensity: 0.5
      },

      // Excitement reactions
      excitement: {
        keywords: ['!', '!!!', 'excited', 'awesome', 'incredible', 'fantastic', 'wow', 'amazing', 'brilliant'],
        reactions: ['jump', 'celebrate', 'spin'],
        emotion: 'happy',
        intensity: 0.9
      },

      // Confusion reactions
      confusion: {
        keywords: ['confused', 'confusing', 'unclear', 'what?', 'huh?', 'pardon?', 'repeat', 'again'],
        reactions: ['headTilt', 'nod'],
        emotion: 'neutral',
        intensity: 0.6
      },

      // Frustration reactions
      frustration: {
        keywords: ['frustrat', 'annoyed', 'angry', 'upset', 'mad', 'hate', 'awful', 'terrible', 'horrible'],
        reactions: ['stamp', 'point'],
        emotion: 'angry',
        intensity: 0.8
      },

      // Sadness reactions
      sadness: {
        keywords: ['sad', 'unhappy', 'depressed', 'down', 'lonely', 'miss', 'hurt', 'pain', 'cry'],
        reactions: ['droop'],
        emotion: 'sad',
        intensity: 0.7
      },

      // Surprise reactions
      surprise: {
        keywords: ['surprise', 'surprised', 'shocked', 'unexpected', 'wow', 'wait', 'really?', 'no way'],
        reactions: ['pop'],
        emotion: 'surprised',
        intensity: 0.8
      },

      // Goodbye reactions
      goodbye: {
        keywords: ['bye', 'goodbye', 'see you', 'later', 'farewell', 'take care', 'cya'],
        reactions: ['wave'],
        emotion: 'happy',
        intensity: 0.6
      },

      // Joke/Humor reactions
      humor: {
        keywords: ['haha', 'lol', 'laugh', 'funny', 'joke', 'lmao', 'rofl', 'hehe'],
        reactions: ['celebrate', 'jump'],
        emotion: 'happy',
        intensity: 0.8
      }
    };
  }

  /**
   * Analyze message and determine reaction
   */
  analyzeMessage(message) {
    if (!message || message.trim().length === 0) {
      return null;
    }

    const lowerMessage = message.toLowerCase();

    // Add to context history
    this.addToContext(message);

    // Get emotion from NLP service
    const emotionResult = EmotionDetectionService.detectEmotion(message);

    // Find matching reaction rules
    let bestMatch = null;
    let bestScore = 0;

    for (const [reactionType, rule] of Object.entries(this.reactionMap)) {
      const score = this.calculateMatchScore(lowerMessage, rule.keywords);

      if (score > bestScore) {
        bestScore = score;
        bestMatch = { type: reactionType, ...rule, score };
      }
    }

    // Combine NLP emotion with pattern-based reaction
    const reaction = {
      type: bestMatch?.type || 'neutral',
      emotion: emotionResult.emotion,
      confidence: Math.max(emotionResult.confidence, bestMatch?.score || 0),
      reactions: bestMatch?.reactions || ['nod'],
      intensity: bestMatch?.intensity || 0.5,
      context: this.getContext(),
      timestamp: Date.now()
    };

    return reaction;
  }

  /**
   * Calculate match score for keyword list
   */
  calculateMatchScore(message, keywords) {
    let score = 0;
    let matches = 0;

    for (const keyword of keywords) {
      if (message.includes(keyword)) {
        score += 1;
        matches++;
      }
    }

    // Boost score for multiple matches
    if (matches > 1) {
      score *= 1.5;
    }

    return Math.min(score / keywords.length, 1.0);
  }

  /**
   * Add message to context history
   */
  addToContext(message) {
    this.contextHistory.push({
      message,
      timestamp: Date.now()
    });

    if (this.contextHistory.length > this.maxHistory) {
      this.contextHistory.shift();
    }
  }

  /**
   * Get context-aware information
   */
  getContext() {
    return {
      messageCount: this.contextHistory.length,
      recentMessages: this.contextHistory.map(c => c.message),
      conversationLength: this.contextHistory.reduce((sum, c) => sum + c.message.length, 0),
      isFirstMessage: this.contextHistory.length === 1,
      timeElapsed: this.contextHistory.length > 1 ?
        this.contextHistory[this.contextHistory.length - 1].timestamp -
        this.contextHistory[0].timestamp : 0
    };
  }

  /**
   * Clear context history
   */
  clearContext() {
    this.contextHistory = [];
  }

  /**
   * Get reaction intensity based on context
   */
  getContextualIntensity(reaction) {
    let intensity = reaction.intensity;

    // Increase intensity if engaged conversation
    if (reaction.context.messageCount > 5) {
      intensity *= 1.1;
    }

    // Decrease intensity if too many reactions already
    if (reaction.context.recentMessages.length > 10) {
      intensity *= 0.8;
    }

    return Math.min(intensity, 1.0);
  }

  /**
   * Get suggested gesture for reaction
   */
  getSuggestedGesture(reaction) {
    if (!reaction || !reaction.reactions || reaction.reactions.length === 0) {
      return 'nod';
    }

    // Select gesture based on intensity
    if (reaction.intensity > 0.8) {
      return reaction.reactions[0]; // Use primary reaction
    } else if (reaction.intensity > 0.5) {
      return reaction.reactions[Math.floor(reaction.reactions.length / 2)];
    } else {
      return reaction.reactions[reaction.reactions.length - 1];
    }
  }
}

/**
 * Chat Reaction Executor
 * Executes avatar reactions based on analysis
 */
export class ChatReactionExecutor {
  constructor(animationPlayer, customizationRenderer) {
    this.animationPlayer = animationPlayer;
    this.customizationRenderer = customizationRenderer;
    this.analyzer = new ChatReactionAnalyzer();
    this.reactionQueue = [];
    this.isProcessing = false;
  }

  /**
   * Process user message and execute reactions
   */
  async processMessage(message) {
    const reaction = this.analyzer.analyzeMessage(message);
    if (!reaction) return;

    await this.executeReaction(reaction);
  }

  /**
   * Execute reaction with all components
   */
  async executeReaction(reaction) {
    // Queue reaction if already processing
    if (this.isProcessing) {
      this.reactionQueue.push(reaction);
      return;
    }

    this.isProcessing = true;

    try {
      // Update emotion
      if (this.customizationRenderer && reaction.emotion) {
        const expressionMap = {
          happy: 'happy',
          sad: 'sad',
          angry: 'angry',
          surprised: 'surprised',
          neutral: 'neutral'
        };
        this.customizationRenderer.applyExpression(expressionMap[reaction.emotion] || 'neutral');
      }

      // Execute gesture animations
      for (const gesture of reaction.reactions) {
        if (this.animationPlayer) {
          this.animationPlayer.playAnimation('gesture', gesture, false);

          // Wait for animation to complete
          await new Promise(resolve => {
            const checkInterval = setInterval(() => {
              if (!this.animationPlayer.isAnimating()) {
                clearInterval(checkInterval);
                resolve();
              }
            }, 50);

            // Timeout after 3 seconds
            setTimeout(() => {
              clearInterval(checkInterval);
              resolve();
            }, 3000);
          });
        }
      }

      // Execute queued reactions
      if (this.reactionQueue.length > 0) {
        const nextReaction = this.reactionQueue.shift();
        this.isProcessing = false;
        await this.executeReaction(nextReaction);
      }
    } finally {
      this.isProcessing = false;
    }
  }

  /**
   * Get analyzer for direct access
   */
  getAnalyzer() {
    return this.analyzer;
  }

  /**
   * Clear reaction queue
   */
  clearQueue() {
    this.reactionQueue = [];
  }
}

/**
 * Conversation Context Manager
 * Tracks conversation state for better reactions
 */
export class ConversationContextManager {
  constructor() {
    this.state = {
      engaged: false,
      messageCount: 0,
      lastMessageTime: null,
      responsePatterns: [],
      emotionalTrend: 'neutral',
      isFirstInteraction: true
    };
    this.conversationTheme = null;
  }

  /**
   * Update state with new message
   */
  updateState(message, reaction) {
    this.state.messageCount++;
    this.state.lastMessageTime = Date.now();
    this.state.isFirstInteraction = this.state.messageCount === 1;

    // Track emotional trends
    this.updateEmotionalTrend(reaction.emotion);

    // Detect conversation themes
    this.updateConversationTheme(message);

    // Track response patterns
    this.recordResponsePattern(message, reaction);

    // Determine engagement level
    this.updateEngagementLevel();
  }

  /**
   * Update emotional trend
   */
  updateEmotionalTrend(emotion) {
    if (!this.state.responsePatterns) {
      this.state.responsePatterns = [];
    }

    this.state.responsePatterns.push(emotion);

    // Keep only last 5 emotions
    if (this.state.responsePatterns.length > 5) {
      this.state.responsePatterns.shift();
    }

    // Calculate trend
    const emotionCounts = {};
    this.state.responsePatterns.forEach(e => {
      emotionCounts[e] = (emotionCounts[e] || 0) + 1;
    });

    const dominant = Object.entries(emotionCounts).reduce((a, b) => 
      a[1] > b[1] ? a : b
    )[0];

    this.state.emotionalTrend = dominant || 'neutral';
  }

  /**
   * Detect conversation theme
   */
  updateConversationTheme(message) {
    const themes = {
      work: /work|project|deadline|meeting|task|boss/i,
      social: /friend|party|event|weekend|night out/i,
      personal: /family|relationship|love|miss|miss you/i,
      tech: /code|program|bug|feature|tech/i,
      health: /sick|tired|exercise|health|workout/i
    };

    for (const [theme, regex] of Object.entries(themes)) {
      if (regex.test(message)) {
        this.conversationTheme = theme;
        break;
      }
    }
  }

  /**
   * Record response pattern
   */
  recordResponsePattern(message, reaction) {
    // Track patterns for future customization
  }

  /**
   * Update engagement level
   */
  updateEngagementLevel() {
    // Consider as engaged if active conversation (multiple messages in short time)
    this.state.engaged = this.state.messageCount > 2 && this.state.lastMessageTime &&
      (Date.now() - this.state.lastMessageTime) < 30000;
  }

  /**
   * Get current state
   */
  getState() {
    return { ...this.state };
  }

  /**
   * Reset state
   */
  resetState() {
    this.state = {
      engaged: false,
      messageCount: 0,
      lastMessageTime: null,
      responsePatterns: [],
      emotionalTrend: 'neutral',
      isFirstInteraction: true
    };
    this.conversationTheme = null;
  }

  /**
   * Get conversation insights
   */
  getInsights() {
    return {
      theme: this.conversationTheme,
      emotionalTrend: this.state.emotionalTrend,
      isEngaged: this.state.engaged,
      messageCount: this.state.messageCount,
      averageEngagementTime: this.state.lastMessageTime ? 
        (Date.now() - this.state.lastMessageTime) / 1000 : 0
    };
  }
}
