package com.upishanker.gradehub.controller;

import com.upishanker.gradehub.model.GradeScale;
import com.upishanker.gradehub.repository.GradeScaleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gradescale")
public class GradeScaleController {

    @Autowired
    private GradeScaleRepository gradeScaleRepository;

    @GetMapping
    public List<GradeScale> getAll() {
        return gradeScaleRepository.findAllByOrderByMinPercentDesc();
    }

    @PutMapping
    @Transactional
    public List<GradeScale> update(@RequestBody List<GradeScale> scales) {
        gradeScaleRepository.deleteAllInBatch(); // faster, avoids per-entity
        scales.forEach(s -> s.setId(null));      // force insert
        return gradeScaleRepository.saveAll(scales);
    }
}

