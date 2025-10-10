package com.upishanker.gradehub.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

@Service
public class OcrService {
    @Value("${ocr.apikey}")
    private String ocrApiKey;

    @Value("${ocr.endpoint}")
    private String ocrEndpoint;

    private final RestTemplate rest = new RestTemplate();

    public String extractTextFromImage(byte[] imageBytes, String filename) {
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);
        headers.set("apikey", ocrApiKey);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file", new ByteArrayResource(imageBytes) {
            @Override
            public String getFilename() {
                return filename;
            }
        });
        body.add("language", "eng");
        body.add("isOverlayRequired", "false");

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        ResponseEntity<Map> response = rest.exchange(ocrEndpoint, HttpMethod.POST, requestEntity, Map.class);

        if (response.getStatusCode().is2xxSuccessful()) {
            Map<?, ?> resp = response.getBody();
            if (resp != null && resp.get("ParsedResults") instanceof List<?>) {
                List<?> list = (List<?>) resp.get("ParsedResults");
                if (!list.isEmpty()) {
                    Map<?, ?> first = (Map<?, ?>) list.get(0);
                    return first.get("ParsedText").toString();
                }
            }
        }
        throw new RuntimeException("OCR extraction failed");
    }
}