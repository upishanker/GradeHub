package com.upishanker.gradehub.controller;

import com.upishanker.gradehub.service.OcrService;
import com.upishanker.gradehub.service.ParseService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.Map;

@RestController
@RequestMapping("/api/ocr")
public class OCRController extends BaseController {

    @Autowired
    private OcrService ocrService;

    @Autowired
    private ParseService parseService;

    @PostMapping
    // **CHANGE 1: Updated the return type to Map<String, Object>**
    public Map<String, Object> processSyllabus(@RequestPart("file") MultipartFile file,
                                               HttpServletRequest request) throws Exception {
        Long userId = getCurrentUserId(request); // ensures user is authenticated
        String text = ocrService.extractTextFromImage(file.getBytes(), file.getOriginalFilename());

        return parseService.parseTextToJson(text);
    }
}