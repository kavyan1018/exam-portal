package com.examportal.service;

import com.examportal.dto.attempt.ExamResultDto;
import com.examportal.dto.attempt.MonitorAttemptDto;
import com.examportal.model.*;
import com.examportal.repository.ExamAttemptRepository;
import com.examportal.repository.QuestionRepository;
import com.examportal.repository.StudentAnswerRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ResultService {

    @Autowired
    private ExamAttemptRepository attemptRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private StudentAnswerRepository studentAnswerRepository;

    @Transactional(readOnly = true)
    public ExamResultDto getResultForStudent(Long attemptId, Long userId) {
        ExamAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Attempt not found"));

        if (!attempt.getUser().getId().equals(userId)) {
            throw new SecurityException("Unauthorized");
        }

        return buildResultDto(attempt);
    }

    @Transactional(readOnly = true)
    public List<ExamResultDto> getResultsForExam(Long examId) {
        List<ExamAttempt> attempts = attemptRepository.findByExamIdOrderByStartedAtDesc(examId);
        return attempts.stream().map(this::buildResultDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<MonitorAttemptDto> getLiveMonitorData(Long examId) {
        List<ExamAttempt> attempts = attemptRepository.findByExamIdOrderByStartedAtDesc(examId);
        LocalDateTime now = LocalDateTime.now();

        return attempts.stream().map(att -> {
            MonitorAttemptDto dto = new MonitorAttemptDto();
            dto.setAttemptId(att.getId());
            dto.setStudentId(att.getUser().getId());
            dto.setStudentName(att.getUser().getFullName());
            dto.setStudentEmail(att.getUser().getEmail());
            dto.setRollNumber(att.getUser().getStudentId());
            dto.setStatus(att.getStatus());
            dto.setStartedAt(att.getStartedAt());
            dto.setScheduledEndAt(att.getScheduledEndAt());
            long remaining = Math.max(0, Duration.between(now, att.getScheduledEndAt()).getSeconds());
            dto.setRemainingSeconds(remaining);
            dto.setViolationCount(att.getViolationCount());
            dto.setScore(att.getScore());

            List<StudentAnswer> answers = studentAnswerRepository.findByAttemptId(att.getId());
            long answeredCount = answers.stream().filter(a -> a.getSelectedOption() != null).count();
            dto.setAnsweredQuestions((int) answeredCount);

            return dto;
        }).collect(Collectors.toList());
    }

    private ExamResultDto buildResultDto(ExamAttempt attempt) {
        Exam exam = attempt.getExam();
        ExamResultDto dto = new ExamResultDto();
        dto.setAttemptId(attempt.getId());
        dto.setExamId(exam.getId());
        dto.setExamTitle(exam.getTitle());
        dto.setStudentName(attempt.getUser().getFullName());
        dto.setStudentId(attempt.getUser().getStudentId());
        dto.setStartedAt(attempt.getStartedAt());
        dto.setSubmittedAt(attempt.getSubmittedAt());
        dto.setStatus(attempt.getStatus());
        dto.setScore(attempt.getScore());
        dto.setTotalMarks(exam.getTotalMarks());
        dto.setPassMarks(exam.getPassMarks());
        dto.setPassed(attempt.isPassed());
        dto.setViolationCount(attempt.getViolationCount());

        List<Question> questions = questionRepository.findByExamIdOrderByQuestionOrderAsc(exam.getId());
        dto.setTotalQuestions(questions.size());

        List<StudentAnswer> answers = studentAnswerRepository.findByAttemptId(attempt.getId());
        Map<Long, Option> answerMap = answers.stream()
                .filter(a -> a.getSelectedOption() != null)
                .collect(Collectors.toMap(a -> a.getQuestion().getId(), StudentAnswer::getSelectedOption, (a, b) -> a));

        dto.setAnsweredQuestions(answerMap.size());

        int correct = 0;
        int incorrect = 0;
        for (Question q : questions) {
            Option opt = answerMap.get(q.getId());
            if (opt != null) {
                if (opt.isCorrect()) {
                    correct++;
                } else {
                    incorrect++;
                }
            }
        }
        dto.setCorrectAnswers(correct);
        dto.setIncorrectAnswers(incorrect);

        return dto;
    }
}
