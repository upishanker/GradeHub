package com.upishanker.gradehub.repository;
import com.upishanker.gradehub.model.Code;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface CodeRepository extends JpaRepository<Code, Long> {
    Optional<Code> findByUserIdAndCode(Long userId, String code);
    void deleteByUserId(Long userId);
}

