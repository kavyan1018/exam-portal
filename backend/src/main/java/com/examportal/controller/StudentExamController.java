package com.examportal.controller;

import com.examportal.dto.attempt.*;
import com.examportal.dto.exam.ExamDto;
import com.examportal.security.UserDetailsImpl;
import com.examportal.service.ExamService;
import com.examportal.service.ExamTakingService;
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
@RequestMapping("/api/v1/student")
@PreAuthorize("hasAuthority('ROLE_STUDENT')")
public class StudentExamController {

    @Autowired
    private ExamService examService;

    @Autowired
    private ExamTakingService examTakingService;

    @Autowired
    private ProctoringService proctoringService;

    @Autowired
    private ResultService resultService;

    @GetMapping("/exams")
    public ResponseEntity<List<ExamDto>> getAvailableExams() {
        return ResponseEntity.ok(examService.getActiveAndUpcomingExams());
    }

    @PostMapping("/exams/{examId}/start")
    public ResponseEntity<StartExamResponse> startExam(@PathVariable Long examId,
                                                       @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(examTakingService.startOrResumeExam(examId, userDetails.getId()));
    }

    @PostMapping("/attempts/{attemptId}/save-answer")
    public ResponseEntity<Map<String, String>> saveAnswer(@PathVariable Long attemptId,
                                                          @Valid @RequestBody SaveAnswerRequest request,
                                                          @AuthenticationPrincipal UserDetailsImpl userDetails) {
        examTakingService.saveAnswer(attemptId, userDetails.getId(), request);
        return ResponseEntity.ok(Map.of("status", "SAVED"));
    }

    @PostMapping("/attempts/{attemptId}/heartbeat")
    public ResponseEntity<HeartbeatResponse> heartbeat(@PathVariable Long attemptId,
                                                       @RequestBody HeartbeatRequest request,
                                                       @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(examTakingService.processHeartbeat(attemptId, userDetails.getId(), request));
    }

    @PostMapping("/attempts/{attemptId}/log-event")
    public ResponseEntity<Map<String, String>> logProctoringEvent(@PathVariable Long attemptId,
                                                                 @Valid @RequestBody LogEventRequest request,
                                                                 @AuthenticationPrincipal UserDetailsImpl userDetails) {
        proctoringService.recordEvent(attemptId, userDetails.getId(), request);
        return ResponseEntity.ok(Map.of("status", "RECORDED"));
    }

    @PostMapping("/attempts/{attemptId}/submit")
    public ResponseEntity<SubmitExamResponse> submitExam(@PathVariable Long attemptId,
                                                         @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(examTakingService.submitExam(attemptId, userDetails.getId(), null));
    }

    @GetMapping("/attempts/{attemptId}/result")
    public ResponseEntity<ExamResultDto> getResult(@PathVariable Long attemptId,
                                                   @AuthenticationPrincipal UserDetailsImpl userDetails) {
        return ResponseEntity.ok(resultService.getResultForStudent(attemptId, userDetails.getId()));
    }
}
