package com.examportal.repository;

import com.examportal.model.AttemptStatus;
import com.examportal.model.ExamAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface ExamAttemptRepository extends JpaRepository<ExamAttempt, Long> {
    Optional<ExamAttempt> findByExamIdAndUserId(Long examId, Long userId);
    List<ExamAttempt> findByUserIdOrderByStartedAtDesc(Long userId);
    List<ExamAttempt> findByExamIdOrderByStartedAtDesc(Long examId);
    List<ExamAttempt> findByExamIdAndStatus(Long examId, AttemptStatus status);

    @Query("SELECT a FROM ExamAttempt a WHERE a.status = 'IN_PROGRESS' AND a.scheduledEndAt < :cutoff")
    List<ExamAttempt> findExpiredActiveAttempts(@Param("cutoff") LocalDateTime cutoff);

    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.transaction.annotation.Transactional
    @Query("DELETE FROM ExamAttempt a WHERE a.exam.id = :examId")
    void deleteByExamId(@Param("examId") Long examId);
}
