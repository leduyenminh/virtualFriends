package com.magent.voice;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.Map;

@Service
public class SttService {

    private final WebClient webClient;
    private final String apiKey;

    public SttService(@Value("${openai.apiKey:}") String apiKey) {
        this.webClient = WebClient.builder()
                .baseUrl("https://api.openai.com")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();
        this.apiKey = apiKey;
    }

    public Mono<String> transcribe(byte[] audioData) {
        if (apiKey.isEmpty()) {
            return Mono.error(new RuntimeException("OpenAI API key not configured"));
        }

        return webClient.post()
                .uri("/v1/audio/transcriptions")
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(BodyInserters.fromMultipartData("file", audioData)
                        .with("model", "whisper-1"))
                .retrieve()
                .bodyToMono(Map.class)
                .map(response -> (String) response.get("text"));
    }
}