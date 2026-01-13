package com.magent.voice;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
public class TtsService {

    private final WebClient elevenLabsClient;
    private final WebClient coeiroinkClient;
    private final String elevenLabsApiKey;
    private final String voiceId;
    private final String coeiroinkUrl;

    public TtsService(@Value("${elevenlabs.apiKey:}") String elevenLabsApiKey,
                      @Value("${elevenlabs.voiceId:21m00Tcm4TlvDq8ikWAM}") String voiceId,
                      @Value("${coeiroink.url:http://localhost:50032}") String coeiroinkUrl) {
        this.elevenLabsClient = WebClient.builder()
                .baseUrl("https://api.elevenlabs.io")
                .defaultHeader("xi-api-key", elevenLabsApiKey)
                .build();
        this.coeiroinkClient = WebClient.builder()
                .baseUrl(coeiroinkUrl)
                .build();
        this.elevenLabsApiKey = elevenLabsApiKey;
        this.voiceId = voiceId;
        this.coeiroinkUrl = coeiroinkUrl;
    }

    public Mono<byte[]> generateSpeech(String text, String provider) {
        if ("elevenlabs".equals(provider)) {
            return generateElevenLabsSpeech(text);
        } else if ("coeiroink".equals(provider)) {
            return generateCoeiroinkSpeech(text);
        } else {
            return generateElevenLabsSpeech(text); // default
        }
    }

    private Mono<byte[]> generateElevenLabsSpeech(String text) {
        if (elevenLabsApiKey.isEmpty()) {
            return Mono.error(new RuntimeException("ElevenLabs API key not configured"));
        }

        var body = Map.of(
                "text", text,
                "model_id", "eleven_monolingual_v1",
                "voice_settings", Map.of(
                        "stability", 0.5,
                        "similarity_boost", 0.5
                )
        );

        return elevenLabsClient.post()
                .uri("/v1/text-to-speech/" + voiceId)
                .contentType(MediaType.APPLICATION_JSON)
                .body(BodyInserters.fromValue(body))
                .retrieve()
                .bodyToMono(byte[].class);
    }

    private Mono<byte[]> generateCoeiroinkSpeech(String text) {
        // Using VOICEVOX API
        // Step 1: Get audio query
        return coeiroinkClient.post()
                .uri(uriBuilder -> uriBuilder.path("/audio_query")
                        .queryParam("text", text)
                        .queryParam("speaker", "2")
                        .build())
                .retrieve()
                .bodyToMono(String.class)
                .flatMap(query -> {
                    // Step 2: Synthesize audio
                    return coeiroinkClient.post()
                            .uri(uriBuilder -> uriBuilder.path("/synthesis")
                                    .queryParam("speaker", "2")
                                    .build())
                            .contentType(MediaType.APPLICATION_JSON)
                            .body(BodyInserters.fromValue(query))
                            .retrieve()
                            .bodyToMono(byte[].class);
                });
    }
}