package com.examportal.repository;

import com.examportal.model.Exam;
import com.examportal.model.ExamStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface ExamRepository extends JpaRepository<Exam, Long> {
    List<Exam> findByCreatedByIdOrderByCreatedAtDesc(Long userId);
    List<Exam> findByStatusOrderByStartWindowAsc(ExamStatus status);

    @Query("SELECT e FROM Exam e WHERE e.status = :status AND e.endWindow >= :now ORDER BY e.startWindow ASC")
    List<Exam> findActiveAndUpcomingExams(@Param("status") ExamStatus status, @Param("now") LocalDateTime now);
}
