package com.examportal.controller;

import com.examportal.dto.attempt.ExamResultDto;
import com.examportal.dto.attempt.MonitorAttemptDto;
import com.examportal.dto.exam.ExamCreateRequest;
import com.examportal.dto.exam.ExamDto;
import com.examportal.dto.exam.QuestionDto;
import com.examportal.model.ProctoringLog;
import com.examportal.security.UserDetailsImpl;
import com.examportal.service.ExamService;
import com.examportal.service.ProctoringService;
import com.examportal.service.ResultService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/faculty/exams")
@PreAuthorize("hasAnyAuthority('ROLE_FACULTY', 'ROLE_ADMIN')")
public class FacultyExamController {

    @Autowired
    private ExamService examService;

    @Autowired
    private ResultService resultService;

    @Autowired
    private ProctoringService proctoringService;

    @GetMapping
    public ResponseEntity<List<ExamDto>> getMyExams(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(examService.getExamsByFaculty(userDetails.getId()));
    }

    @PostMapping
    public ResponseEntity<ExamDto> createExam(@Valid @RequestBody ExamCreateRequest request,
                                              @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(examService.createExam(request, userDetails.getId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<ExamDto> getExamDetails(@PathVariable Long id) {
        return ResponseEntity.ok(examService.getExamById(id, true, false));
    }

    @PutMapping("/{id}")
    public ResponseEntity<ExamDto> updateExam(@PathVariable Long id, @Valid @RequestBody ExamCreateRequest request) {
        return ResponseEntity.ok(examService.updateExam(id, request));
    }

    @PostMapping("/{id}/questions")
    public ResponseEntity<QuestionDto> addQuestion(@PathVariable Long id, @Valid @RequestBody QuestionDto questionDto) {
        return ResponseEntity.ok(examService.addQuestion(id, questionDto));
    }

    @DeleteMapping("/questions/{questionId}")
    public ResponseEntity<Map<String, String>> deleteQuestion(@PathVariable Long questionId) {
        examService.deleteQuestion(questionId);
        return ResponseEntity.ok(Map.of("message", "Question deleted successfully"));
    }

    @GetMapping("/{id}/monitor")
    public ResponseEntity<List<MonitorAttemptDto>> getLiveMonitoring(@PathVariable Long id) {
        return ResponseEntity.ok(resultService.getLiveMonitorData(id));
    }

    @GetMapping("/{id}/results")
    public ResponseEntity<List<ExamResultDto>> getExamResults(@PathVariable Long id) {
        return ResponseEntity.ok(resultService.getResultsForExam(id));
    }

    @GetMapping("/attempts/{attemptId}/proctoring-logs")
    public ResponseEntity<List<ProctoringLog>> getAttemptProctoringLogs(@PathVariable Long attemptId) {
        return ResponseEntity.ok(proctoringService.getLogsForAttempt(attemptId));
    }
}
