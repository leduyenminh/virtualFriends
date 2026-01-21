/**
 * Frontend Emotion Detection Service
 * Complements backend NLP with real-time client-side emotion analysis
 * Provides multiple emotion scores for avatar visualization
 */

class EmotionDetectionService {
  constructor() {
    this.emotionLexicon = this.initializeEmotionLexicon();
    this.intensifiers = new Set([
      'very', 'extremely', 'incredibly', 'absolutely', 'definitely', 'really', 'so', 'too',
      'super', 'totally', 'completely', 'utterly', 'quite', 'rather', 'highly', 'awfully'
    ]);
    this.negators = new Set([
      'not', 'no', 'never', 'neither', 'nor', 'cannot', 'can\'t', 'won\'t', 'wouldn\'t',
      'shouldn\'t', 'couldn\'t', 'doesn\'t', 'don\'t', 'didn\'t', 'hasn\'t', 'haven\'t', 'isn\'t'
    ]);
  }

  /**
   * Main emotion detection method
   * Returns object with emotion and confidence score
   */
  detectEmotion(text) {
    if (!text || text.trim().length === 0) {
      return { emotion: 'neutral', confidence: 0.5, reason: 'Empty input' };
    }

    const cleanText = text.toLowerCase().trim();

    // Check for emojis first (highest priority)
    const emojiEmotion = this.detectEmojiEmotion(text);
    if (emojiEmotion.confidence > 0.75) {
      return emojiEmotion;
    }

    // Check for explicit emotion keywords
    const explicitEmotion = this.detectExplicitEmotions(cleanText);
    if (explicitEmotion.confidence > 0.75) {
      return explicitEmotion;
    }

    // Analyze sentiment using word scoring
    const sentiment = this.analyzeSentiment(cleanText);
    const emotionResult = this.emotionFromSentiment(sentiment);

    // Return emoji emotion if it has higher confidence
    return emojiEmotion.confidence > emotionResult.confidence ? emojiEmotion : emotionResult;
  }

  /**
   * Detects emotion from emoji presence
   */
  detectEmojiEmotion(text) {
    const emojiMap = {
      happy: /[😀😃😄😁😆😅🤣😂😉😊😌😍🥰😘😗😚😙🤩🤗💕💖]/g,
      sad: /[😭😢😿💔😞😔😕☹️🙁😫😩😤😠]/g,
      angry: /[😠😡🤬😤😾🔥]/g,
      surprised: /[😮😲😮‍💨🤭😳😱]/g,
      fearful: /[😨😰😱😵‍💫🤗]/g
    };

    const emotionCounts = {};
    let totalEmojis = 0;

    for (const [emotion, pattern] of Object.entries(emojiMap)) {
      const matches = text.match(pattern);
      if (matches) {
        emotionCounts[emotion] = matches.length;
        totalEmojis += matches.length;
      }
    }

    if (totalEmojis === 0) {
      return { emotion: 'neutral', confidence: 0.3, reason: 'No emojis' };
    }

    const topEmotion = Object.entries(emotionCounts).reduce((a, b) => 
      a[1] > b[1] ? a : b
    )[0];

    const confidence = Math.min(0.95, 0.7 + (totalEmojis * 0.1));
    return { emotion: topEmotion, confidence, reason: `Detected ${totalEmojis} emoji(s)` };
  }

  /**
   * Detects explicit emotion keywords
   */
  detectExplicitEmotions(text) {
    for (const [keyword, emotion] of Object.entries(this.emotionLexicon.explicit)) {
      if (text.includes(keyword)) {
        return { 
          emotion, 
          confidence: 0.85, 
          reason: `Keyword: "${keyword}"` 
        };
      }
    }
    return { emotion: 'neutral', confidence: 0.3, reason: 'No keywords' };
  }

  /**
   * Advanced sentiment analysis with negation and intensifiers
   */
  analyzeSentiment(text) {
    const words = text.toLowerCase().split(/\s+/);
    let sentimentScore = 0;
    let positiveCount = 0;
    let negativeCount = 0;
    let wordCount = 0;
    let previousNegated = false;

    for (let i = 0; i < words.length; i++) {
      const word = words[i].replace(/[^a-z0-9]/g, '');

      if (!word) continue;

      // Handle negators
      if (this.negators.has(word)) {
        previousNegated = true;
        continue;
      }

      // Check for intensifiers
      if (this.intensifiers.has(word)) {
        // Intensifier affects next word
        continue;
      }

      // Score words
      const positive = this.emotionLexicon.positive[word];
      const negative = this.emotionLexicon.negative[word];

      if (positive) {
        const score = previousNegated ? -positive * 0.6 : positive;
        sentimentScore += score;
        positiveCount++;
        previousNegated = false;
        wordCount++;
      } else if (negative) {
        const score = previousNegated ? negative * 0.6 : -negative;
        sentimentScore += score;
        negativeCount++;
        previousNegated = false;
        wordCount++;
      }
    }

    // Normalize score
    const normalized = wordCount > 0 ? sentimentScore / Math.sqrt(wordCount) : 0;
    const clamped = Math.max(-1, Math.min(1, normalized));

    return { score: clamped, positiveCount, negativeCount, wordCount };
  }

  /**
   * Convert sentiment to emotion
   */
  emotionFromSentiment(sentiment) {
    const score = sentiment.score;

    if (score > 0.6) {
      return { 
        emotion: 'happy', 
        confidence: 0.5 + score * 0.25,
        reason: 'Strong positive sentiment'
      };
    } else if (score > 0.3) {
      return { 
        emotion: 'happy', 
        confidence: 0.5 + score * 0.15,
        reason: 'Positive sentiment'
      };
    } else if (score > -0.3) {
      return { 
        emotion: 'neutral', 
        confidence: 0.7,
        reason: 'Neutral sentiment'
      };
    } else if (score > -0.6) {
      return { 
        emotion: 'sad', 
        confidence: 0.6 - Math.abs(score) * 0.15,
        reason: 'Negative sentiment'
      };
    } else {
      return { 
        emotion: 'sad', 
        confidence: 0.5 - Math.abs(score) * 0.25,
        reason: 'Strong negative sentiment'
      };
    }
  }

  /**
   * Get emotion probability distribution for all emotions
   */
  getEmotionScores(text) {
    const result = this.detectEmotion(text);
    
    return {
      happy: result.emotion === 'happy' ? result.confidence : Math.max(0, result.confidence - 0.3),
      sad: result.emotion === 'sad' ? result.confidence : Math.max(0, 0.5 - result.confidence),
      angry: result.emotion === 'angry' ? result.confidence : 0.1,
      surprised: result.emotion === 'surprised' ? result.confidence : 0.1,
      fearful: result.emotion === 'fearful' ? result.confidence : 0.1,
      neutral: result.emotion === 'neutral' ? result.confidence : 0.3
    };
  }

  /**
   * Initialize emotion lexicons
   */
  initializeEmotionLexicon() {
    return {
      explicit: {
        'happy': 'happy',
        'joyful': 'happy',
        'excited': 'happy',
        'thrilled': 'happy',
        'cheerful': 'happy',
        'delighted': 'happy',
        'sad': 'sad',
        'depressed': 'sad',
        'miserable': 'sad',
        'lonely': 'sad',
        'angry': 'angry',
        'furious': 'angry',
        'rage': 'angry',
        'livid': 'angry',
        'surprised': 'surprised',
        'shocked': 'surprised',
        'amazed': 'surprised',
        'afraid': 'fearful',
        'scared': 'fearful',
        'terrified': 'fearful',
        'anxious': 'fearful'
      },
      positive: {
        'love': 1.0,
        'excellent': 1.0,
        'amazing': 1.0,
        'wonderful': 1.0,
        'fantastic': 1.0,
        'perfect': 1.0,
        'great': 0.8,
        'good': 0.7,
        'nice': 0.7,
        'happy': 0.7,
        'beautiful': 0.7,
        'awesome': 0.8,
        'brilliant': 0.8,
        'cool': 0.6,
        'impressive': 0.8,
        'outstanding': 0.9,
        'splendid': 0.8,
        'delightful': 0.8,
        'charming': 0.7
      },
      negative: {
        'hate': 1.0,
        'terrible': 1.0,
        'awful': 1.0,
        'horrible': 1.0,
        'disgusting': 1.0,
        'bad': 0.7,
        'sad': 0.7,
        'angry': 0.7,
        'upset': 0.7,
        'annoyed': 0.6,
        'frustrated': 0.7,
        'disappointed': 0.7,
        'poor': 0.6,
        'dislike': 0.6,
        'worst': 1.0,
        'fail': 0.8,
        'broken': 0.7,
        'wrong': 0.6,
        'problem': 0.5,
        'issue': 0.4
      }
    };
  }
}

export default new EmotionDetectionService();
