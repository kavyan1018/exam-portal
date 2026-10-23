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
import com.examportal.service.AiQuestionGeneratorService;
import com.examportal.service.AiAnswerEvaluationService;
import com.examportal.service.EmailService;
import com.examportal.repository.ExamAttemptRepository;
import com.examportal.repository.StudentAnswerRepository;
import com.examportal.model.ExamAttempt;
import com.examportal.model.StudentAnswer;
import com.examportal.model.AttemptStatus;
import com.examportal.dto.attempt.QuestionEvaluationDto;
import com.examportal.dto.attempt.StudentPaperDto;
import java.math.BigDecimal;
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

    @Autowired
    private AiQuestionGeneratorService aiQuestionGeneratorService;

    @Autowired
    private AiAnswerEvaluationService aiAnswerEvaluationService;

    @Autowired
    private StudentAnswerRepository studentAnswerRepository;

    @Autowired
    private EmailService emailService;

    @Autowired
    private com.examportal.repository.ExamAttemptRepository attemptRepository;

    @Autowired
    private com.examportal.service.ExamTakingService examTakingService;

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

    @DeleteMapping("/{id}")
    public ResponseEntity<Map<String, String>> deleteExam(@PathVariable Long id) {
        examService.deleteExam(id);
        return ResponseEntity.ok(Map.of("message", "Exam deleted successfully"));
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

    @PostMapping("/{id}/questions/bulk-import")
    public ResponseEntity<Map<String, Object>> bulkImportQuestions(@PathVariable Long id, @RequestBody com.examportal.dto.exam.BulkImportRequest request) {
        List<QuestionDto> questionsToSave;
        if (request.getParsedQuestions() != null && !request.getParsedQuestions().isEmpty()) {
            questionsToSave = request.getParsedQuestions();
        } else {
            questionsToSave = aiQuestionGeneratorService.parseBulkText(request.getRawText());
        }

        int added = 0;
        for (QuestionDto q : questionsToSave) {
            examService.addQuestion(id, q);
            added++;
        }

        return ResponseEntity.ok(Map.of(
                "message", "Successfully imported " + added + " questions into exam",
                "importedCount", added
        ));
    }

    @PostMapping("/{id}/questions/parse-preview")
    public ResponseEntity<List<QuestionDto>> parseBulkPreview(@RequestBody com.examportal.dto.exam.BulkImportRequest request) {
        List<QuestionDto> parsed = aiQuestionGeneratorService.parseBulkText(request.getRawText());
        return ResponseEntity.ok(parsed);
    }

    @PostMapping("/{id}/questions/ai-generate")
    public ResponseEntity<Map<String, Object>> aiGenerateQuestions(@PathVariable Long id, @RequestBody com.examportal.dto.exam.AiGenerateRequest request) {
        List<QuestionDto> generated = aiQuestionGeneratorService.generateQuestions(request);

        int added = 0;
        for (QuestionDto q : generated) {
            examService.addQuestion(id, q);
            added++;
        }

        return ResponseEntity.ok(Map.of(
                "message", "AI successfully authored and attached " + added + " questions to your exam",
                "generatedCount", added
        ));
    }

    @PostMapping("/{id}/release-and-email-results")
    public ResponseEntity<Map<String, Object>> releaseAndEmailResults(@PathVariable Long id) {
        List<com.examportal.model.ExamAttempt> attempts = attemptRepository.findByExamIdOrderByStartedAtDesc(id);

        int sentCount = 0;
        for (com.examportal.model.ExamAttempt attempt : attempts) {
            if (attempt.getStatus() != com.examportal.model.AttemptStatus.IN_PROGRESS) {
                boolean sent = emailService.sendExamResultEmail(attempt);
                if (sent) sentCount++;
            }
        }

        return ResponseEntity.ok(Map.of(
                "message", "Evaluation complete. Emailed scorecards to " + sentCount + " students.",
                "emailsSent", sentCount
        ));
    }

    @PutMapping("/{id}/toggle-lock")
    public ResponseEntity<Map<String, Object>> toggleExamLock(@PathVariable Long id) {
        boolean isLocked = examTakingService.toggleExamLock(id);
        return ResponseEntity.ok(Map.of(
                "isLocked", isLocked,
                "message", isLocked ? "Exam has been LOCKED. Students cannot enter." : "Exam has been UNLOCKED. Students can take it."
        ));
    }

    @PostMapping("/{id}/students/{studentId}/reset-attempt")
    public ResponseEntity<Map<String, String>> resetStudentAttempt(@PathVariable Long id, @PathVariable Long studentId) {
        examTakingService.resetStudentAttempt(id, studentId);
        return ResponseEntity.ok(Map.of("message", "Student attempt has been reset. The student can now take the exam fresh."));
    }

    @GetMapping("/attempts/{attemptId}/proctoring-logs")
    public ResponseEntity<List<ProctoringLog>> getAttemptProctoringLogs(@PathVariable Long attemptId) {
        return ResponseEntity.ok(proctoringService.getLogsForAttempt(attemptId));
    }

    @PostMapping("/attempts/{attemptId}/evaluate-ai")
    public ResponseEntity<Map<String, Object>> evaluateAttemptAi(@PathVariable Long attemptId) {
        ExamAttempt attempt = aiAnswerEvaluationService.evaluateAttemptWithAi(attemptId);
        return ResponseEntity.ok(Map.of(
                "message", "AI evaluation completed successfully",
                "score", attempt.getScore(),
                "passed", attempt.isPassed()
        ));
    }

    @PostMapping("/{id}/evaluate-all-ai")
    public ResponseEntity<Map<String, Object>> evaluateAllAi(@PathVariable Long id) {
        List<ExamAttempt> attempts = attemptRepository.findByExamIdOrderByStartedAtDesc(id);
        int count = 0;
        for (ExamAttempt att : attempts) {
            if (att.getStatus() != AttemptStatus.IN_PROGRESS) {
                aiAnswerEvaluationService.evaluateAttemptWithAi(att.getId());
                count++;
            }
        }
        return ResponseEntity.ok(Map.of(
                "message", "AI auto-evaluated all " + count + " student submissions.",
                "evaluatedCount", count
        ));
    }

    @PostMapping("/{id}/publish-results")
    public ResponseEntity<Map<String, Object>> publishResults(@PathVariable Long id) {
        List<ExamAttempt> attempts = attemptRepository.findByExamIdOrderByStartedAtDesc(id);
        int count = 0;
        for (ExamAttempt att : attempts) {
            if (att.getStatus() != AttemptStatus.IN_PROGRESS) {
                att.setResultPublished(true);
                attemptRepository.save(att);
                count++;
            }
        }
        return ResponseEntity.ok(Map.of(
                "message", "Official exam results published to " + count + " students.",
                "publishedCount", count
        ));
    }

    @GetMapping("/attempts/{attemptId}/evaluation-details")
    public ResponseEntity<List<QuestionEvaluationDto>> getEvaluationDetails(@PathVariable Long attemptId) {
        return ResponseEntity.ok(aiAnswerEvaluationService.getDetailedEvaluation(attemptId));
    }

    @GetMapping("/attempts/{attemptId}/paper")
    public ResponseEntity<StudentPaperDto> getStudentPaper(@PathVariable Long attemptId) {
        return ResponseEntity.ok(aiAnswerEvaluationService.getStudentPaper(attemptId));
    }

    @PostMapping("/attempts/{attemptId}/update-marks")
    public ResponseEntity<Map<String, Object>> updateQuestionMarks(
            @PathVariable Long attemptId,
            @RequestBody Map<String, Object> payload) {
        Long questionId = Long.valueOf(payload.get("questionId").toString());
        BigDecimal marks = new BigDecimal(payload.get("marks").toString());
        String feedback = payload.get("feedback") != null ? payload.get("feedback").toString() : null;

        StudentAnswer ans = studentAnswerRepository.findByAttemptIdAndQuestionId(attemptId, questionId)
                .orElseThrow(() -> new IllegalArgumentException("Answer not found"));
        ans.setMarksAwarded(marks);
        if (feedback != null) ans.setAiFeedback(feedback);
        ans.setEvaluated(true);
        studentAnswerRepository.save(ans);

        ExamAttempt att = ans.getAttempt();
        List<StudentAnswer> allAns = studentAnswerRepository.findByAttemptId(attemptId);
        BigDecimal total = allAns.stream()
                .map(a -> a.getMarksAwarded() != null ? a.getMarksAwarded() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        att.setScore(total);
        att.setPassed(total.compareTo(att.getExam().getPassMarks()) >= 0);
        attemptRepository.save(att);

        return ResponseEntity.ok(Map.of("message", "Marks updated successfully", "newScore", total));
    }
}
