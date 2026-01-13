package com.magent.agent.grpc;

import com.magent.voice.grpc.GenerateVoiceRequest;
import com.magent.voice.grpc.GenerateVoiceResponse;
import com.magent.voice.grpc.TranscribeAudioRequest;
import com.magent.voice.grpc.TranscribeAudioResponse;
import com.magent.voice.grpc.VoiceServiceGrpc;
import io.grpc.ManagedChannel;
import io.grpc.ManagedChannelBuilder;
import org.springframework.stereotype.Service;
import reactor.core.publisher.Mono;

@Service
public class VoiceGrpcClient {

    private final VoiceServiceGrpc.VoiceServiceBlockingStub voiceServiceStub;

    public VoiceGrpcClient() {
        ManagedChannel channel = ManagedChannelBuilder.forAddress("localhost", 9090)
                .usePlaintext()
                .build();
        this.voiceServiceStub = VoiceServiceGrpc.newBlockingStub(channel);
    }

    public Mono<byte[]> generateVoice(String text, String provider) {
        return Mono.fromCallable(() -> {
            GenerateVoiceRequest request = GenerateVoiceRequest.newBuilder()
                    .setText(text)
                    .setProvider(provider)
                    .build();
            GenerateVoiceResponse response = voiceServiceStub.generateVoice(request);
            return response.getAudio().toByteArray();
        });
    }

    public Mono<String> transcribeAudio(byte[] audioData) {
        return Mono.fromCallable(() -> {
            TranscribeAudioRequest request = TranscribeAudioRequest.newBuilder()
                    .setAudioData(com.google.protobuf.ByteString.copyFrom(audioData))
                    .build();
            TranscribeAudioResponse response = voiceServiceStub.transcribeAudio(request);
            return response.getTranscription();
        });
    }
}