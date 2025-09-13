package com.upishanker.gradehub.controller;

import com.upishanker.gradehub.model.GradeScale;
import com.upishanker.gradehub.model.User;
import com.upishanker.gradehub.repository.GradeScaleRepository;
import com.upishanker.gradehub.repository.UserRepository;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/gradescale")
public class GradeScaleController extends BaseController {
    @Autowired private GradeScaleRepository repo;
    @Autowired private UserRepository userRepo;

    @GetMapping
    public List<GradeScale> getAll(HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        return repo.findAllByUserIdOrderByLetterAsc(userId);
    }

    @PutMapping
    @Transactional
    public List<GradeScale> update(@RequestBody List<GradeScale> scales, HttpServletRequest request) {
        Long userId = getCurrentUserId(request);
        // delete current user's scale rows
        List<GradeScale> existing = repo.findAllByUserIdOrderByLetterAsc(userId);
        repo.deleteAllInBatch(existing);
        // insert new rows owned by this user
        User user = userRepo.findById(userId).orElseThrow();
        scales.forEach(s -> {
            s.setId(null);
            s.setUser(user);
            // Remove s.minPercent usage (see #2)
        });
        return repo.saveAll(scales);
    }
}
