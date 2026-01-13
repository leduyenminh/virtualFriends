package com.magent.agent;

import com.fasterxml.jackson.annotation.JsonProperty;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.BodyInserters;
import org.springframework.web.reactive.function.client.WebClient;
import reactor.core.publisher.Mono;

import java.util.List;
import java.util.Map;

@Component
public class OpenAIClient {

    private final WebClient client;
    private final String model;
    private final ToolService toolService;

    public OpenAIClient(@Value("${openai.apiKey:}") String apiKey,
                        @Value("${openai.model:gpt-4o-mini}") String model,
                        ToolService toolService) {
        this.client = WebClient.builder()
                .baseUrl("https://api.openai.com/v1")
                .defaultHeader("Authorization", "Bearer " + apiKey)
                .build();
        this.model = model;
        this.toolService = toolService;
    }

    @CircuitBreaker(name = "openai", fallbackMethod = "fallbackChat")
    public Mono<String> chat(List<ChatMessage> messages) {
        var tools = List.of(
                Map.of(
                        "type", "function",
                        "function", Map.of(
                                "name", "web_search",
                                "description", "Perform a web search for information",
                                "parameters", Map.of(
                                        "type", "object",
                                        "properties", Map.of(
                                                "query", Map.of("type", "string", "description", "The search query")
                                        ),
                                        "required", List.of("query")
                                )
                        )
                ),
                Map.of(
                        "type", "function",
                        "function", Map.of(
                                "name", "create_sheet",
                                "description", "Create a Google Sheet with data",
                                "parameters", Map.of(
                                        "type", "object",
                                        "properties", Map.of(
                                                "title", Map.of("type", "string", "description", "Title of the sheet"),
                                                "data", Map.of("type", "array", "items", Map.of("type", "array", "items", Map.of("type", "string")), "description", "2D array of data")
                                        ),
                                        "required", List.of("title", "data")
                                )
                        )
                ),
                Map.of(
                        "type", "function",
                        "function", Map.of(
                                "name", "fetch_webpage",
                                "description", "Fetch the content of a webpage",
                                "parameters", Map.of(
                                        "type", "object",
                                        "properties", Map.of(
                                                "url", Map.of("type", "string", "description", "The URL to fetch")
                                        ),
                                        "required", List.of("url")
                                )
                        )
                ),
                Map.of(
                        "type", "function",
                        "function", Map.of(
                                "name", "create_presentation",
                                "description", "Create a PowerPoint presentation",
                                "parameters", Map.of(
                                        "type", "object",
                                        "properties", Map.of(
                                                "title", Map.of("type", "string", "description", "Title of the presentation"),
                                                "slides", Map.of("type", "array", "items", Map.of("type", "string"), "description", "List of slide contents")
                                        ),
                                        "required", List.of("title", "slides")
                                )
                        )
                ),
                Map.of(
                        "type", "function",
                        "function", Map.of(
                                "name", "create_design",
                                "description", "Create a design using Canva",
                                "parameters", Map.of(
                                        "type", "object",
                                        "properties", Map.of(
                                                "description", Map.of("type", "string", "description", "Description of the design")
                                        ),
                                        "required", List.of("description")
                                )
                        )
                ),
                Map.of(
                        "type", "function",
                        "function", Map.of(
                                "name", "generate_voice",
                                "description", "Generate voice audio from text using TTS providers",
                                "parameters", Map.of(
                                        "type", "object",
                                        "properties", Map.of(
                                                "text", Map.of("type", "string", "description", "Text to convert to speech"),
                                                "provider", Map.of("type", "string", "description", "TTS provider: elevenlabs or coeiroink")
                                        ),
                                        "required", List.of("text")
                                )
                        )
                )
        );

        var body = Map.of(
                "model", model,
                "messages", messages,
                "tools", tools
        );

        return client.post()
                .uri("/chat/completions")
                .contentType(MediaType.APPLICATION_JSON)
                .body(BodyInserters.fromValue(body))
                .retrieve()
                .bodyToMono(OpenAiResponse.class)
                .flatMap(resp -> {
                    if (resp.choices != null && !resp.choices.isEmpty()) {
                        var message = resp.choices.get(0).message;
                        if (message.tool_calls != null && !message.tool_calls.isEmpty()) {
                            // Handle tool calls
                            var toolCall = message.tool_calls.get(0);
                            String result = executeTool(toolCall);
                            // Add tool result to messages and call again
                            messages.add(new ChatMessage("assistant", "", toolCall));
                            messages.add(new ChatMessage("tool", result, toolCall.id));
                            return chat(messages); // Recursive call
                        } else {
                            return Mono.just(message.content);
                        }
                    }
                    return Mono.just("");
                });
    }

    private Mono<String> fallbackChat(List<ChatMessage> messages, Throwable t) {
        return Mono.just("OpenAI service is currently unavailable due to high error rate. Please try again later.");
    }

    private String executeTool(ToolCall toolCall) {
        var args = toolCall.function.arguments;
        switch (toolCall.function.name) {
            case "web_search":
                String query = (String) args.get("query");
                return toolService.webSearch(query);
            case "create_sheet":
                String title = (String) args.get("title");
                List<List<String>> data = (List<List<String>>) args.get("data");
                return toolService.createSheet(title, data);
            case "fetch_webpage":
                String url = (String) args.get("url");
                return toolService.fetchWebpage(url);
            case "create_presentation":
                String pTitle = (String) args.get("title");
                List<String> slides = (List<String>) args.get("slides");
                return toolService.createPresentation(pTitle, slides);
            case "create_design":
                String desc = (String) args.get("description");
                return toolService.createDesign(desc);
            case "edit_photo":
                String imageUrl = (String) args.get("imageUrl");
                String edits = (String) args.get("edits");
                return toolService.editPhoto(imageUrl, edits);
            case "generate_voice":
                String text = (String) args.get("text");
                String provider = (String) args.getOrDefault("provider", "elevenlabs");
                return toolService.generateVoice(text, provider);
            default:
                return "Unknown tool: " + toolCall.function.name;
        }
    }

    public static class OpenAiResponse {
        public List<Choice> choices;
        public static class Choice {
            public ChatMessage message;
        }
    }

    public static class ChatMessage {
        public String role;
        public String content;
        public List<ToolCall> tool_calls;
        public String tool_call_id;

        public ChatMessage() {}

        public ChatMessage(String role, String content) {
            this.role = role;
            this.content = content;
        }

        public ChatMessage(String role, String content, ToolCall toolCall) {
            this.role = role;
            this.content = content;
            this.tool_calls = List.of(toolCall);
        }

        public ChatMessage(String role, String content, String toolCallId) {
            this.role = role;
            this.content = content;
            this.tool_call_id = toolCallId;
        }
    }

    public static class ToolCall {
        public String id;
        public String type;
        public Function function;

        public static class Function {
            public String name;
            public Map<String, Object> arguments;
        }
    }
}
