package com.magent.agent;

import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertNotNull;

@SpringBootTest
@TestPropertySource(properties = {
    "serp.apiKey=test",
    "google.credentials.path=",
    "microsoft.client.id=",
    "microsoft.client.secret=",
    "microsoft.tenant.id="
})
public class ToolServiceTest {

    @Autowired
    private ToolService toolService;

    @Test
    public void testWebSearch() {
        String result = toolService.webSearch("test query");
        assertNotNull(result);
    }

    @Test
    public void testCreateSheet() {
        String result = toolService.createSheet("Test Sheet", List.of(List.of("A1", "B1")));
        assertNotNull(result);
    }

    @Test
    public void testFetchWebpage() {
        String result = toolService.fetchWebpage("https://httpbin.org/get");
        assertNotNull(result);
    }
}