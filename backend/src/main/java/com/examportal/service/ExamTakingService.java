package com.examportal.service;

import com.examportal.dto.attempt.*;
import com.examportal.dto.exam.OptionDto;
import com.examportal.dto.exam.QuestionDto;
import com.examportal.model.*;
import com.examportal.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExamTakingService {

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private ExamAttemptRepository attemptRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private OptionRepository optionRepository;

    @Autowired
    private StudentAnswerRepository studentAnswerRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ProctoringLogRepository proctoringLogRepository;

    @Autowired
    private ExamService examService;

    @Transactional
    public StartExamResponse startOrResumeExam(Long examId, Long userId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found"));

        if (exam.getStatus() != ExamStatus.PUBLISHED) {
            throw new IllegalStateException("Exam is not currently published for taking");
        }

        if (exam.isLocked()) {
            throw new IllegalStateException("This exam is currently LOCKED by the Super Admin. Students cannot take it until it is unlocked.");
        }

        LocalDateTime now = LocalDateTime.now();
        if (now.isBefore(exam.getStartWindow())) {
            throw new IllegalStateException("Exam window has not opened yet. Scheduled to start at: " + exam.getStartWindow());
        }
        if (now.isAfter(exam.getEndWindow())) {
            throw new IllegalStateException("Exam submission window has closed. The deadline was: " + exam.getEndWindow() + ". Please ask faculty to extend the exam end time.");
        }

        User student = userRepository.findById(userId)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        List<Question> allExamQuestions = questionRepository.findByExamIdOrderByQuestionOrderAsc(examId);
        if (allExamQuestions.isEmpty()) {
            throw new IllegalStateException("This exam does not have any questions added yet. Faculty must add questions before students can start taking it.");
        }

        Optional<ExamAttempt> existingOpt = attemptRepository.findByExamIdAndUserId(examId, userId);
        ExamAttempt attempt;

        if (existingOpt.isPresent()) {
            attempt = existingOpt.get();
            if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
                throw new IllegalStateException("You have already submitted this exam (" + attempt.getStatus() + "). Final Score: " + attempt.getScore() + " / " + exam.getTotalMarks() + ". To retake, contact Super Admin to unlock your attempt.");
            }

            // Check if time expired
            if (now.isAfter(attempt.getScheduledEndAt())) {
                submitExam(attempt.getId(), userId, AttemptStatus.AUTO_SUBMITTED);
                throw new IllegalStateException("Exam duration has expired. Attempt has been auto-submitted.");
            }
        } else {
            // New attempt
            attempt = new ExamAttempt();
            attempt.setExam(exam);
            attempt.setUser(student);
            attempt.setStartedAt(now);

            // Server-authoritative scheduled end time:
            // either now + duration, or exam.endWindow (whichever comes first)
            LocalDateTime durationLimit = now.plusMinutes(exam.getDurationMinutes());
            LocalDateTime effectiveEnd = durationLimit.isBefore(exam.getEndWindow()) ? durationLimit : exam.getEndWindow();
            attempt.setScheduledEndAt(effectiveEnd);
            attempt.setStatus(AttemptStatus.IN_PROGRESS);

            // Generate question sequence (shuffled or sequential)
            List<Question> questions = questionRepository.findByExamIdOrderByQuestionOrderAsc(examId);
            List<Long> qIds = questions.stream().map(Question::getId).collect(Collectors.toList());
            if (exam.isRandomizeQuestions()) {
                Collections.shuffle(qIds, new Random(userId + examId));
            }
            attempt.setQuestionOrderSequence(qIds.stream().map(String::valueOf).collect(Collectors.joining(",")));

            attempt = attemptRepository.save(attempt);
        }

        // Build response
        StartExamResponse response = new StartExamResponse();
        response.setAttemptId(attempt.getId());
        response.setExamId(exam.getId());
        response.setExamTitle(exam.getTitle());
        response.setStartedAt(attempt.getStartedAt());
        response.setScheduledEndAt(attempt.getScheduledEndAt());
        long remaining = Math.max(0, Duration.between(LocalDateTime.now(), attempt.getScheduledEndAt()).getSeconds());
        response.setRemainingSeconds(remaining);
        response.setMaxViolationsAllowed(exam.getMaxViolationsAllowed());
        response.setEnableWebcam(exam.isEnableWebcam());
        response.setStatus(attempt.getStatus());

        // Load ordered questions based on attempt's saved sequence
        List<QuestionDto> orderedQuestions = getOrderedQuestionsForAttempt(attempt, exam);
        response.setQuestions(orderedQuestions);

        // Load existing answers
        List<StudentAnswer> answers = studentAnswerRepository.findByAttemptId(attempt.getId());
        Map<Long, Long> existingMap = new HashMap<>();
        Map<Long, String> existingTextMap = new HashMap<>();
        Map<Long, String> existingLangMap = new HashMap<>();
        Map<Long, Boolean> reviewMap = new HashMap<>();
        for (StudentAnswer a : answers) {
            if (a.getSelectedOption() != null) {
                existingMap.put(a.getQuestion().getId(), a.getSelectedOption().getId());
            }
            if (a.getTextAnswer() != null) {
                existingTextMap.put(a.getQuestion().getId(), a.getTextAnswer());
            }
            if (a.getCodeLanguage() != null) {
                existingLangMap.put(a.getQuestion().getId(), a.getCodeLanguage());
            }
            reviewMap.put(a.getQuestion().getId(), a.isMarkedForReview());
        }
        response.setExistingAnswers(existingMap);
        response.setExistingTextAnswers(existingTextMap);
        response.setExistingCodeLanguages(existingLangMap);
        response.setReviewFlags(reviewMap);

        return response;
    }

    private List<QuestionDto> getOrderedQuestionsForAttempt(ExamAttempt attempt, Exam exam) {
        List<Question> allQuestions = questionRepository.findByExamIdOrderByQuestionOrderAsc(exam.getId());
        Map<Long, Question> qMap = allQuestions.stream().collect(Collectors.toMap(Question::getId, q -> q));

        List<Long> orderedIds = new ArrayList<>();
        if (attempt.getQuestionOrderSequence() != null && !attempt.getQuestionOrderSequence().isBlank()) {
            for (String s : attempt.getQuestionOrderSequence().split(",")) {
                try {
                    orderedIds.add(Long.parseLong(s.trim()));
                } catch (NumberFormatException ignored) {}
            }
        } else {
            orderedIds.addAll(allQuestions.stream().map(Question::getId).toList());
        }

        List<QuestionDto> dtos = new ArrayList<>();
        Random optRandom = new Random(attempt.getId());

        for (Long qId : orderedIds) {
            Question q = qMap.get(qId);
            if (q != null) {
                QuestionDto qDto = examService.convertQuestionToDto(q, true); // true = hides correct answers from student
                if (exam.isRandomizeOptions() && qDto.getOptions() != null) {
                    List<OptionDto> shuffledOptions = new ArrayList<>(qDto.getOptions());
                    Collections.shuffle(shuffledOptions, optRandom);
                    qDto.setOptions(shuffledOptions);
                }
                dtos.add(qDto);
            }
        }
        return dtos;
    }

    @Transactional
    public void saveAnswer(Long attemptId, Long userId, SaveAnswerRequest request) {
        ExamAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Attempt not found"));

        if (!attempt.getUser().getId().equals(userId)) {
            throw new SecurityException("Unauthorized attempt modification");
        }
        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            throw new IllegalStateException("Attempt is already closed (" + attempt.getStatus() + ")");
        }

        // Server timer check
        if (LocalDateTime.now().isAfter(attempt.getScheduledEndAt())) {
            submitExam(attemptId, userId, AttemptStatus.AUTO_SUBMITTED);
            throw new IllegalStateException("Time has expired. Attempt auto-submitted.");
        }

        Question question = questionRepository.findById(request.getQuestionId())
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));

        Option option = null;
        if (request.getSelectedOptionId() != null) {
            option = optionRepository.findById(request.getSelectedOptionId())
                    .orElseThrow(() -> new IllegalArgumentException("Option not found"));
            if (!option.getQuestion().getId().equals(question.getId())) {
                throw new IllegalArgumentException("Option does not belong to question");
            }
        }

        Optional<StudentAnswer> existingAnswer = studentAnswerRepository.findByAttemptIdAndQuestionId(attemptId, request.getQuestionId());
        StudentAnswer answer = existingAnswer.orElseGet(() -> new StudentAnswer(attempt, question, null, false));
        answer.setSelectedOption(option);
        if (request.getTextAnswer() != null) {
            answer.setTextAnswer(request.getTextAnswer());
        }
        if (request.getCodeLanguage() != null) {
            answer.setCodeLanguage(request.getCodeLanguage());
        }
        answer.setMarkedForReview(request.isMarkedForReview());
        answer.setLastSavedAt(LocalDateTime.now());
        studentAnswerRepository.save(answer);
    }

    @Transactional
    public HeartbeatResponse processHeartbeat(Long attemptId, Long userId, HeartbeatRequest request) {
        ExamAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Attempt not found"));

        if (!attempt.getUser().getId().equals(userId)) {
            throw new SecurityException("Unauthorized");
        }

        LocalDateTime now = LocalDateTime.now();
        long remaining = Duration.between(now, attempt.getScheduledEndAt()).getSeconds();

        if (remaining <= -30 && attempt.getStatus() == AttemptStatus.IN_PROGRESS) {
            submitExam(attemptId, userId, AttemptStatus.AUTO_SUBMITTED);
            return new HeartbeatResponse(0, AttemptStatus.AUTO_SUBMITTED, attempt.getViolationCount(), true, now.toString());
        }

        return new HeartbeatResponse(
                Math.max(0, remaining),
                attempt.getStatus(),
                attempt.getViolationCount(),
                false,
                now.toString()
        );
    }

    @Transactional
    public SubmitExamResponse submitExam(Long attemptId, Long userId, AttemptStatus finalStatus) {
        ExamAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Attempt not found"));

        if (!attempt.getUser().getId().equals(userId)) {
            throw new SecurityException("Unauthorized");
        }

        if (attempt.getStatus() != AttemptStatus.IN_PROGRESS) {
            return new SubmitExamResponse(attempt.getId(), attempt.getStatus(), "Exam was already submitted", attempt.getSubmittedAt(), attempt.getScore(), attempt.isPassed());
        }

        attempt.setStatus(finalStatus != null ? finalStatus : AttemptStatus.SUBMITTED);
        attempt.setSubmittedAt(LocalDateTime.now());

        // Grade attempt
        gradeAttempt(attempt);

        attemptRepository.save(attempt);

        return new SubmitExamResponse(
                attempt.getId(),
                attempt.getStatus(),
                "Exam submitted successfully",
                attempt.getSubmittedAt(),
                attempt.getScore(),
                attempt.isPassed()
        );
    }

    private void gradeAttempt(ExamAttempt attempt) {
        Exam exam = attempt.getExam();
        List<Question> questions = questionRepository.findByExamIdOrderByQuestionOrderAsc(exam.getId());
        List<StudentAnswer> answers = studentAnswerRepository.findByAttemptId(attempt.getId());
        Map<Long, Option> answerMap = answers.stream()
                .filter(a -> a.getSelectedOption() != null)
                .collect(Collectors.toMap(a -> a.getQuestion().getId(), StudentAnswer::getSelectedOption, (a, b) -> a));

        BigDecimal score = BigDecimal.ZERO;
        BigDecimal negPenalty = exam.getNegativeMarkPerQuestion() != null ? exam.getNegativeMarkPerQuestion() : BigDecimal.ZERO;

        for (Question q : questions) {
            Option selected = answerMap.get(q.getId());
            if (selected != null) {
                if (selected.isCorrect()) {
                    score = score.add(q.getMarks() != null ? q.getMarks() : BigDecimal.ONE);
                } else if (negPenalty.compareTo(BigDecimal.ZERO) > 0) {
                    score = score.subtract(negPenalty);
                }
            }
        }

        // Score cannot be negative
        if (score.compareTo(BigDecimal.ZERO) < 0) {
            score = BigDecimal.ZERO;
        }

        attempt.setScore(score);
        attempt.setPassed(score.compareTo(exam.getPassMarks()) >= 0);
    }

    @Transactional
    public boolean toggleExamLock(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found"));
        boolean newLockState = !exam.isLocked();
        exam.setLocked(newLockState);
        examRepository.save(exam);
        return newLockState;
    }

    @Transactional
    public void resetStudentAttempt(Long examId, Long userId) {
        Optional<ExamAttempt> attemptOpt = attemptRepository.findByExamIdAndUserId(examId, userId);
        if (attemptOpt.isPresent()) {
            ExamAttempt attempt = attemptOpt.get();
            studentAnswerRepository.deleteAll(studentAnswerRepository.findByAttemptId(attempt.getId()));
            proctoringLogRepository.deleteAll(proctoringLogRepository.findByAttemptIdOrderByLoggedAtDesc(attempt.getId()));
            attemptRepository.delete(attempt);
        }
    }

    // Runs every 30 seconds to auto-close any abandoned or timed-out exams
    @Scheduled(fixedRate = 30000)
    @Transactional
    public void autoSubmitExpiredAttempts() {
        LocalDateTime cutoff = LocalDateTime.now().minusMinutes(2);
        List<ExamAttempt> expired = attemptRepository.findExpiredActiveAttempts(cutoff);
        for (ExamAttempt a : expired) {
            a.setStatus(AttemptStatus.AUTO_SUBMITTED);
            a.setSubmittedAt(cutoff);
            gradeAttempt(a);
            attemptRepository.save(a);
        }
    }
}
