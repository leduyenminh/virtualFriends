package com.magent.agent.service;

import org.springframework.stereotype.Service;
import java.util.*;
import java.util.regex.Pattern;

/**
 * Advanced Emotion Detection Service
 * Uses multiple NLP techniques: keyword matching, sentiment scoring, intensity analysis
 */
@Service
public class EmotionDetectionService {

    // Comprehensive emotion lexicons with weights
    private static final Map<String, Double> POSITIVE_WORDS = initializePositiveWords();
    private static final Map<String, Double> NEGATIVE_WORDS = initializeNegativeWords();
    private static final Map<String, Double> NEUTRAL_WORDS = initializeNeutralWords();
    private static final Map<String, String> EMOTION_KEYWORDS = initializeEmotionKeywords();

    // Intensifiers and negators for sentiment adjustment
    private static final Set<String> INTENSIFIERS = Set.of(
        "very", "extremely", "incredibly", "absolutely", "definitely", "really", "so", "too",
        "super", "totally", "completely", "utterly", "quite", "rather", "highly"
    );

    private static final Set<String> NEGATORS = Set.of(
        "not", "no", "never", "neither", "nor", "cannot", "can't", "won't", "wouldn't",
        "shouldn't", "couldn't", "doesn't", "don't", "didn't", "hasn't", "haven't", "isn't"
    );

    private static final Pattern EMOJI_PATTERN = Pattern.compile(
        "[😀-🙏🌀-🗿🚀-🛿]|" +  // Emoji range
        "[❤️💙💚💛💜🖤]|" +      // Hearts
        "[😍😂😭😡😱😊😢😤😎]"   // Common emojis
    );

    /**
     * Main emotion detection method with confidence scores
     */
    public EmotionResult detectEmotion(String text) {
        if (text == null || text.trim().isEmpty()) {
            return new EmotionResult("neutral", 0.5, "Empty input");
        }

        String cleanedText = text.toLowerCase().trim();

        // Check for explicit emotion keywords first (highest priority)
        EmotionResult explicitEmotion = detectExplicitEmotions(cleanedText);
        if (explicitEmotion.confidence > 0.7) {
            return explicitEmotion;
        }

        // Analyze sentiment using multiple signals
        SentimentAnalysis sentiment = analyzeSentiment(cleanedText);

        // Detect emotion from sentiment and context
        EmotionResult emotion = emotionFromSentiment(sentiment);

        // Check for emoji-based emotions
        EmotionResult emojiEmotion = detectEmojiEmotions(text);
        if (emojiEmotion.confidence > emotion.confidence) {
            return emojiEmotion;
        }

        return emotion;
    }

    /**
     * Detects explicit emotion keywords with high confidence
     */
    private EmotionResult detectExplicitEmotions(String text) {
        for (Map.Entry<String, String> entry : EMOTION_KEYWORDS.entrySet()) {
            if (text.contains(entry.getKey())) {
                return new EmotionResult(
                    entry.getValue(),
                    0.9,
                    "Detected explicit emotion keyword: " + entry.getKey()
                );
            }
        }
        return new EmotionResult("neutral", 0.3, "No explicit keywords");
    }

    /**
     * Comprehensive sentiment analysis using multiple techniques
     */
    private SentimentAnalysis analyzeSentiment(String text) {
        String[] words = text.split("\\s+");
        double sentimentScore = 0.0;
        int wordCount = 0;
        int positiveCount = 0;
        int negativeCount = 0;

        boolean previousNegated = false;

        for (int i = 0; i < words.length; i++) {
            String word = words[i].replaceAll("[^a-z0-9]", "");

            // Check if current word is a negator
            if (NEGATORS.contains(word)) {
                previousNegated = true;
                continue;
            }

            // Check for intensifiers
            double intensifier = 1.0;
            if (INTENSIFIERS.contains(word)) {
                intensifier = 1.5;
                continue;
            }

            // Score positive words
            if (POSITIVE_WORDS.containsKey(word)) {
                double score = POSITIVE_WORDS.get(word) * intensifier;
                sentimentScore += previousNegated ? -score * 0.8 : score;
                positiveCount++;
                previousNegated = false;
                wordCount++;
            }
            // Score negative words
            else if (NEGATIVE_WORDS.containsKey(word)) {
                double score = NEGATIVE_WORDS.get(word) * intensifier;
                sentimentScore += previousNegated ? score * 0.8 : -score;
                negativeCount++;
                previousNegated = false;
                wordCount++;
            }
            // Score neutral words
            else if (NEUTRAL_WORDS.containsKey(word)) {
                sentimentScore += NEUTRAL_WORDS.get(word);
                previousNegated = false;
                wordCount++;
            } else {
                previousNegated = false;
            }
        }

        // Normalize sentiment score
        double normalizedScore = wordCount > 0 ? sentimentScore / Math.sqrt(wordCount) : 0.0;
        normalizedScore = Math.max(-1.0, Math.min(1.0, normalizedScore));

        return new SentimentAnalysis(normalizedScore, positiveCount, negativeCount, wordCount);
    }

    /**
     * Converts sentiment analysis to emotion result
     */
    private EmotionResult emotionFromSentiment(SentimentAnalysis sentiment) {
        double score = sentiment.score;

        if (score > 0.6) {
            return new EmotionResult("happy", 0.5 + (score * 0.25), "Positive sentiment detected");
        } else if (score > 0.3) {
            return new EmotionResult("neutral", 0.6 + (score * 0.15), "Mildly positive sentiment");
        } else if (score > 0.0) {
            return new EmotionResult("neutral", 0.7, "Slightly positive sentiment");
        } else if (score > -0.3) {
            return new EmotionResult("neutral", 0.7, "Slightly negative sentiment");
        } else if (score > -0.6) {
            return new EmotionResult("sad", 0.6 - (Math.abs(score) * 0.15), "Mildly negative sentiment");
        } else {
            return new EmotionResult("sad", 0.5 - (Math.abs(score) * 0.25), "Strong negative sentiment");
        }
    }

    /**
     * Detects emotions from emoji presence
     */
    private EmotionResult detectEmojiEmotions(String text) {
        Map<String, Integer> emojiEmotions = new HashMap<>();

        // Happy emojis
        if (text.matches(".*[😀😃😄😁😆😅🤣😂😉😊].*")) {
            emojiEmotions.put("happy", emojiEmotions.getOrDefault("happy", 0) + 1);
        }
        // Sad emojis
        if (text.matches(".*[😭😢😿💔😞😔😕].*")) {
            emojiEmotions.put("sad", emojiEmotions.getOrDefault("sad", 0) + 1);
        }
        // Angry emojis
        if (text.matches(".*[😠😡🤬😤].*")) {
            emojiEmotions.put("angry", emojiEmotions.getOrDefault("angry", 0) + 1);
        }
        // Surprised emojis
        if (text.matches(".*[😮😲😲🤭😳].*")) {
            emojiEmotions.put("surprised", emojiEmotions.getOrDefault("surprised", 0) + 1);
        }
        // Fear emojis
        if (text.matches(".*[😨😰😱🤗😨].*")) {
            emojiEmotions.put("fearful", emojiEmotions.getOrDefault("fearful", 0) + 1);
        }

        if (!emojiEmotions.isEmpty()) {
            String emotion = emojiEmotions.entrySet().stream()
                .max(Comparator.comparingInt(Map.Entry::getValue))
                .map(Map.Entry::getKey)
                .orElse("neutral");
            return new EmotionResult(emotion, 0.85, "Detected from emoji");
        }

        return new EmotionResult("neutral", 0.5, "No emoji detected");
    }

    /**
     * Get emotion scores across all emotions for visualization
     */
    public Map<String, Double> getEmotionScores(String text) {
        Map<String, Double> scores = new LinkedHashMap<>();
        scores.put("happy", 0.0);
        scores.put("sad", 0.0);
        scores.put("angry", 0.0);
        scores.put("surprised", 0.0);
        scores.put("fearful", 0.0);
        scores.put("neutral", 0.0);

        EmotionResult result = detectEmotion(text);
        scores.put(result.emotion, result.confidence);

        return scores;
    }

    // Initialization methods for lexicons
    private static Map<String, Double> initializePositiveWords() {
        Map<String, Double> words = new HashMap<>();
        // Strong positive (1.0)
        words.put("love", 1.0);
        words.put("excellent", 1.0);
        words.put("amazing", 1.0);
        words.put("wonderful", 1.0);
        words.put("fantastic", 1.0);
        words.put("perfect", 1.0);
        words.put("great", 1.0);
        // Medium positive (0.7)
        words.put("good", 0.7);
        words.put("nice", 0.7);
        words.put("happy", 0.7);
        words.put("beautiful", 0.7);
        words.put("awesome", 0.7);
        words.put("brilliant", 0.7);
        words.put("wonderful", 0.7);
        words.put("love", 0.8);
        // Light positive (0.4)
        words.put("ok", 0.4);
        words.put("fine", 0.4);
        words.put("decent", 0.4);
        words.put("cool", 0.5);
        words.put("nice", 0.6);
        words.put("impressive", 0.8);
        words.put("outstanding", 0.9);
        words.put("splendid", 0.8);
        words.put("delightful", 0.8);
        words.put("charming", 0.7);
        return words;
    }

    private static Map<String, Double> initializeNegativeWords() {
        Map<String, Double> words = new HashMap<>();
        // Strong negative (-1.0)
        words.put("hate", -1.0);
        words.put("terrible", -1.0);
        words.put("awful", -1.0);
        words.put("horrible", -1.0);
        words.put("despicable", -1.0);
        words.put("disgusting", -1.0);
        // Medium negative (-0.7)
        words.put("bad", -0.7);
        words.put("sad", -0.7);
        words.put("angry", -0.7);
        words.put("upset", -0.7);
        words.put("annoyed", -0.7);
        words.put("frustrated", -0.7);
        words.put("disappointed", -0.7);
        words.put("poor", -0.6);
        // Light negative (-0.4)
        words.put("dislike", -0.6);
        words.put("worst", -1.0);
        words.put("fail", -0.8);
        words.put("broken", -0.7);
        words.put("wrong", -0.6);
        words.put("difficult", -0.4);
        words.put("problem", -0.5);
        words.put("issue", -0.4);
        return words;
    }

    private static Map<String, Double> initializeNeutralWords() {
        Map<String, Double> words = new HashMap<>();
        words.put("the", 0.0);
        words.put("a", 0.0);
        words.put("and", 0.0);
        words.put("or", 0.0);
        words.put("it", 0.0);
        words.put("about", 0.0);
        words.put("think", 0.1);
        words.put("feel", 0.1);
        return words;
    }

    private static Map<String, String> initializeEmotionKeywords() {
        Map<String, String> keywords = new HashMap<>();
        // Happy keywords
        keywords.put("happy", "happy");
        keywords.put("joyful", "happy");
        keywords.put("excited", "happy");
        keywords.put("thrilled", "happy");
        keywords.put("cheerful", "happy");
        keywords.put("delighted", "happy");
        // Sad keywords
        keywords.put("sad", "sad");
        keywords.put("depressed", "sad");
        keywords.put("miserable", "sad");
        keywords.put("melancholy", "sad");
        keywords.put("lonely", "sad");
        keywords.put("down", "sad");
        // Angry keywords
        keywords.put("angry", "angry");
        keywords.put("furious", "angry");
        keywords.put("rage", "angry");
        keywords.put("livid", "angry");
        keywords.put("mad", "angry");
        // Surprised keywords
        keywords.put("surprised", "surprised");
        keywords.put("shocked", "surprised");
        keywords.put("amazed", "surprised");
        keywords.put("astonished", "surprised");
        // Fearful keywords
        keywords.put("afraid", "fearful");
        keywords.put("scared", "fearful");
        keywords.put("terrified", "fearful");
        keywords.put("anxious", "fearful");
        keywords.put("nervous", "fearful");
        return keywords;
    }

    /**
     * Internal class for sentiment analysis results
     */
    private static class SentimentAnalysis {
        double score;
        int positiveCount;
        int negativeCount;
        int wordCount;

        SentimentAnalysis(double score, int positiveCount, int negativeCount, int wordCount) {
            this.score = score;
            this.positiveCount = positiveCount;
            this.negativeCount = negativeCount;
            this.wordCount = wordCount;
        }
    }

    /**
     * Public class for emotion detection results
     */
    public static class EmotionResult {
        public String emotion;
        public double confidence;
        public String reason;

        public EmotionResult(String emotion, double confidence, String reason) {
            this.emotion = emotion;
            this.confidence = Math.max(0.0, Math.min(1.0, confidence));
            this.reason = reason;
        }

        @Override
        public String toString() {
            return String.format("{\"emotion\":\"%s\",\"confidence\":%.2f,\"reason\":\"%s\"}",
                emotion, confidence, reason);
        }
    }
}
