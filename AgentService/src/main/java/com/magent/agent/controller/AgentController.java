package com.magent.agent.controller;

import com.magent.agent.OpenAIClient;
import com.magent.agent.OpenAIClient.ChatMessage;
import com.magent.agent.model.ChatHistory;
import com.magent.agent.model.Sticker;
import com.magent.agent.repository.ChatHistoryRepository;
import com.magent.agent.repository.StickerRepository;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import reactor.core.publisher.Mono;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/agent")
@Tag(name = "Agent Service", description = "AI Agent operations including chat, history management, and sticker handling")
public class AgentController {

    private final OpenAIClient openAIClient;
    private final ChatHistoryRepository chatHistoryRepository;
    private final StickerRepository stickerRepository;

    public AgentController(OpenAIClient openAIClient, ChatHistoryRepository chatHistoryRepository, StickerRepository stickerRepository) {
        this.openAIClient = openAIClient;
        this.chatHistoryRepository = chatHistoryRepository;
        this.stickerRepository = stickerRepository;
    }

    @PostMapping("/chat")
    @Operation(summary = "Send chat message to AI agent",
               description = "Process a chat message through the AI agent and return the response. User messages are automatically saved to chat history.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Chat response generated successfully",
                    content = @Content(mediaType = "text/plain", schema = @Schema(type = "string"))),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public Mono<ResponseEntity<String>> chat(@RequestBody List<ChatMessage> messages, @RequestHeader("X-User") String userId) {
        // Save user messages
        messages.forEach(msg -> {
            if ("user".equals(msg.role)) {
                chatHistoryRepository.save(new ChatHistory(userId, msg.role, msg.content));
            }
        });

        return openAIClient.chat(messages)
                .doOnNext(response -> {
                    // Save assistant response
                    chatHistoryRepository.save(new ChatHistory(userId, "assistant", response));
                })
                .map(ResponseEntity::ok);
    }

    @GetMapping("/history")
    @Operation(summary = "Get chat history for user",
               description = "Retrieve the complete chat history for a specific user, ordered by timestamp.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Chat history retrieved successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(implementation = ChatMessage.class))),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<List<ChatMessage>> getHistory(@RequestHeader("X-User") String userId) {
        List<ChatHistory> history = chatHistoryRepository.findByUserIdOrderByTimestampAsc(userId);
        List<ChatMessage> messages = history.stream()
                .map(h -> new ChatMessage(h.getRole(), h.getContent()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(messages);
    }

    @GetMapping("/export")
    @Operation(summary = "Export chat history as CSV",
               description = "Export the user's chat history in CSV format for download.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "CSV file generated successfully",
                    content = @Content(mediaType = "text/csv")),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<String> exportHistory(@RequestHeader("X-User") String userId) {
        List<ChatHistory> history = chatHistoryRepository.findByUserIdOrderByTimestampAsc(userId);
        StringBuilder sb = new StringBuilder();
        sb.append("Timestamp,Role,Content\n");
        for (ChatHistory h : history) {
            sb.append(h.getTimestamp()).append(",").append(h.getRole()).append(",\"").append(h.getContent().replace("\"", "\"\"")).append("\"\n");
        }
        return ResponseEntity.ok()
                .header("Content-Disposition", "attachment; filename=chat_history.csv")
                .body(sb.toString());
    }

    @PostMapping("/upload-sticker")
    @Operation(summary = "Upload a sticker image",
               description = "Upload a sticker image file for the user. Supported formats depend on the file type.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Sticker uploaded successfully",
                    content = @Content(mediaType = "text/plain", schema = @Schema(type = "string"))),
        @ApiResponse(responseCode = "400", description = "Invalid file format or upload failed"),
        @ApiResponse(responseCode = "500", description = "Internal server error")
    })
    public ResponseEntity<String> uploadSticker(@RequestParam("file") MultipartFile file, @RequestHeader("X-User") String userId) throws IOException {
        Sticker sticker = new Sticker(userId, file.getOriginalFilename(), file.getBytes(), file.getContentType());
        stickerRepository.save(sticker);
        return ResponseEntity.ok("Sticker uploaded: " + sticker.getId());
    }

    @GetMapping("/stickers")
    @Operation(summary = "Get user's sticker IDs",
               description = "Retrieve a list of sticker IDs belonging to the user.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Sticker IDs retrieved successfully",
                    content = @Content(mediaType = "application/json", schema = @Schema(type = "array", format = "int64"))),
        @ApiResponse(responseCode = "404", description = "User not found")
    })
    public ResponseEntity<List<Long>> getStickers(@RequestHeader("X-User") String userId) {
        List<Long> stickerIds = stickerRepository.findByUserId(userId).stream()
                .map(Sticker::getId)
                .collect(Collectors.toList());
        return ResponseEntity.ok(stickerIds);
    }

    @GetMapping("/sticker/{id}")
    @Operation(summary = "Get sticker image by ID",
               description = "Retrieve a sticker image by its ID. Returns the image data with appropriate content type.")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Sticker image retrieved successfully",
                    content = @Content(mediaType = "image/*")),
        @ApiResponse(responseCode = "404", description = "Sticker not found")
    })
    public ResponseEntity<byte[]> getSticker(@Parameter(description = "Sticker ID") @PathVariable Long id) {
        Sticker sticker = stickerRepository.findById(id).orElse(null);
        if (sticker == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok()
                .contentType(MediaType.parseMediaType(sticker.getContentType()))
                .body(sticker.getData());
    }
}
