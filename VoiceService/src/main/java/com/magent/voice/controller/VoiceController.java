package com.magent.voice.controller;

import com.magent.voice.SttService;
import com.magent.voice.TtsService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;
import java.util.Map;

@RestController
@RequestMapping("/voice")
public class VoiceController {

    private final TtsService ttsService;
    private final SttService sttService;

    public VoiceController(TtsService ttsService, SttService sttService) {
        this.ttsService = ttsService;
        this.sttService = sttService;
    }

    @PostMapping("/tts")
    public Mono<ResponseEntity<byte[]>> textToSpeech(@RequestBody Map<String, String> request) {
        String text = request.get("text");
        String provider = request.getOrDefault("provider", "elevenlabs");
        return ttsService.generateSpeech(text, provider)
                .map(audio -> ResponseEntity.ok()
                        .contentType(MediaType.parseMediaType("audio/wav")) // or mpeg
                        .body(audio))
                .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().build()));
    }

    @PostMapping("/stt")
    public Mono<ResponseEntity<String>> speechToText(@RequestParam("file") MultipartFile file) {
        try {
            return sttService.transcribe(file.getBytes())
                    .map(text -> ResponseEntity.ok(text))
                    .onErrorResume(e -> Mono.just(ResponseEntity.badRequest().body("Error: " + e.getMessage())));
        } catch (Exception e) {
            return Mono.just(ResponseEntity.badRequest().body("File error"));
        }
    }
}