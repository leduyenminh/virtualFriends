package com.magent.agent.model;

import com.magent.agent.OpenAIClient.ChatMessage;

import java.util.List;

public class ChatRequest {
    private List<ChatMessage> messages;

    public List<ChatMessage> getMessages() {
        return messages;
    }

    public void setMessages(List<ChatMessage> messages) {
        this.messages = messages;
    }
}
