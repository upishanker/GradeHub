package com.upishanker.gradehub.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class ParseService {

    @Value("${gemini.apikey}")
    private String API_KEY;

    private static final String MODEL_BASE =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent";

    // **IMPROVEMENT**: Add an ObjectMapper to parse the final JSON string
    private final ObjectMapper objectMapper = new ObjectMapper();

    public Map<String, Object> parseTextToJson(String syllabusText) { // Renamed for clarity
        RestTemplate restTemplate = new RestTemplate();

        String prompt = """
                You are a data extraction tool. Your sole purpose is to parse the following text and return a valid JSON object.
                Do not include any introductory text, explanations, or markdown formatting like ```json.
                The JSON object should contain key-value pairs where the key is the grading category as a lowercase string and the value is its corresponding percentage as a number.

                Text to parse:
                """ + syllabusText;


        Map<String, Object> textPart = Map.of("text", prompt);
        Map<String, Object> contentPart = Map.of("parts", List.of(textPart));

        // **CORRECTION**: The generationConfig map should directly contain the mime type.
        Map<String, String> generationConfig = Map.of("response_mime_type", "application/json");

        Map<String, Object> requestBody = Map.of(
                "contents", List.of(contentPart),
                "generationConfig", generationConfig // This is now correctly structured
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> request = new HttpEntity<>(requestBody, headers);

        try {
            String endpointWithKey = MODEL_BASE + "?key=" + API_KEY;
            Map<String, Object> responseMap = restTemplate.postForObject(endpointWithKey, request, Map.class);

            if (responseMap != null && responseMap.containsKey("candidates")) {
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseMap.get("candidates");
                Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                String jsonText = (String) parts.get(0).get("text");

                // **IMPROVEMENT**: Parse the clean JSON string from the model into a Java Map
                return objectMapper.readValue(jsonText, new TypeReference<Map<String, Object>>() {});
            } else {
                throw new RuntimeException("No candidates returned from API. Response: " + responseMap);
            }
        } catch (Exception e) {
            throw new RuntimeException("Error calling Generative AI API or parsing its response", e);
        }
    }
}