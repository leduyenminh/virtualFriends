package com.magent.agent;

import com.google.api.client.googleapis.auth.oauth2.GoogleCredential;
import com.google.api.client.googleapis.javanet.GoogleNetHttpTransport;
import com.google.api.client.json.JsonFactory;
import com.google.api.client.json.gson.GsonFactory;
// import com.google.api.services.sheets.v4.Sheets;
// import com.google.api.services.sheets.v4.model.*;
import com.microsoft.graph.authentication.TokenCredentialAuthProvider;
import com.microsoft.graph.models.*;
import com.microsoft.graph.requests.GraphServiceClient;
import okhttp3.Request;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.io.FileInputStream;
import java.io.IOException;
import java.security.GeneralSecurityException;
import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.Map;

@Service
public class ToolService {

    private final WebClient webClient = WebClient.create();
    private final String serpApiKey;
    private final com.magent.agent.grpc.VoiceGrpcClient voiceGrpcClient;
    private final String googleCredentialsPath;
    private final String microsoftClientId;
    private final String microsoftClientSecret;
    private final String microsoftTenantId;

    public ToolService(@Value("${serp.apiKey:}") String serpApiKey,
                       @Value("${google.credentials.path:}") String googleCredentialsPath,
                       @Value("${microsoft.client.id:}") String microsoftClientId,
                       @Value("${microsoft.client.secret:}") String microsoftClientSecret,
                       @Value("${microsoft.tenant.id:}") String microsoftTenantId,
                       com.magent.agent.grpc.VoiceGrpcClient voiceGrpcClient) {
        this.serpApiKey = serpApiKey;
        this.googleCredentialsPath = googleCredentialsPath;
        this.microsoftClientId = microsoftClientId;
        this.microsoftClientSecret = microsoftClientSecret;
        this.microsoftTenantId = microsoftTenantId;
        this.voiceGrpcClient = voiceGrpcClient;
    }

    public String webSearch(String query) {
        if (serpApiKey.isEmpty()) {
            return "Web search not configured.";
        }
        // Use SerpAPI for real search
        String url = "https://serpapi.com/search.json?q=" + query + "&api_key=" + serpApiKey;
        try {
            return webClient.get().uri(url).retrieve().bodyToMono(String.class).block();
        } catch (Exception e) {
            return "Error performing web search: " + e.getMessage();
        }
    }

    public String createSheet(String title, List<List<String>> data) {
        return "Google Sheets integration not available.";
    }

    public String fetchWebpage(String url) {
        try {
            return webClient.get().uri(url).retrieve().bodyToMono(String.class).block();
        } catch (Exception e) {
            return "Error fetching webpage: " + e.getMessage();
        }
    }

    public String createPresentation(String title, List<String> slides) {
        if (microsoftClientId.isEmpty() || microsoftClientSecret.isEmpty() || microsoftTenantId.isEmpty()) {
            return "Microsoft credentials not configured.";
        }
        try {
            // For demo, create a simple text file as placeholder
            // Real PowerPoint creation requires more setup
            return "Mock PowerPoint created: " + title + " with " + slides.size() + " slides.";
        } catch (Exception e) {
            return "Error creating presentation: " + e.getMessage();
        }
    }

    public String createDesign(String description) {
        // Mock for Canva
        return "Mock Canva design created for: " + description;
    }

    public String editPhoto(String imageUrl, String edits) {
        // Mock for Lightroom
        return "Mock photo edited: " + imageUrl + " with " + edits;
    }

    public String generateVoice(String text, String provider) {
        try {
            return voiceGrpcClient.generateVoice(text, provider)
                    .map(bytes -> "Voice generated successfully, audio size: " + bytes.length + " bytes")
                    .onErrorReturn("Error generating voice: service unavailable")
                    .block();
        } catch (Exception e) {
            return "Error generating voice: " + e.getMessage();
        }
    }
}