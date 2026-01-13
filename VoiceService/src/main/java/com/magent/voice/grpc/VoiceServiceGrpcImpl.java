package com.magent.voice.grpc;

import com.magent.voice.SttService;
import com.magent.voice.TtsService;
import io.grpc.stub.StreamObserver;
import net.devh.boot.grpc.server.service.GrpcService;
import org.springframework.beans.factory.annotation.Autowired;

@GrpcService
public class VoiceServiceGrpcImpl extends VoiceServiceGrpc.VoiceServiceImplBase {

    @Autowired
    private TtsService ttsService;

    @Autowired
    private SttService sttService;

    @Override
    public void generateVoice(GenerateVoiceRequest request, StreamObserver<GenerateVoiceResponse> responseObserver) {
        try {
            String provider = request.getProvider().isEmpty() ? "elevenlabs" : request.getProvider();
            byte[] audio = ttsService.generateSpeech(request.getText(), provider).block();
            GenerateVoiceResponse response = GenerateVoiceResponse.newBuilder()
                    .setAudio(com.google.protobuf.ByteString.copyFrom(audio))
                    .build();
            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
            responseObserver.onError(e);
        }
    }

    @Override
    public void transcribeAudio(TranscribeAudioRequest request, StreamObserver<TranscribeAudioResponse> responseObserver) {
        try {
            String transcription = sttService.transcribe(request.getAudioData().toByteArray()).block();
            TranscribeAudioResponse response = TranscribeAudioResponse.newBuilder()
                    .setTranscription(transcription)
                    .build();
            responseObserver.onNext(response);
            responseObserver.onCompleted();
        } catch (Exception e) {
            responseObserver.onError(e);
        }
    }
}