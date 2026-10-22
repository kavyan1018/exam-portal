package com.examportal.repository;

import com.examportal.model.ProctoringLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProctoringLogRepository extends JpaRepository<ProctoringLog, Long> {
    List<ProctoringLog> findByAttemptIdOrderByLoggedAtDesc(Long attemptId);
    long countByAttemptId(Long attemptId);
}
