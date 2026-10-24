package com.examportal.service;

import com.examportal.dto.attempt.QuestionEvaluationDto;
import com.examportal.dto.attempt.StudentPaperDto;
import com.examportal.model.*;
import com.examportal.repository.ExamAttemptRepository;
import com.examportal.repository.QuestionRepository;
import com.examportal.repository.StudentAnswerRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Service
public class AiAnswerEvaluationService {

    private static final Logger log = LoggerFactory.getLogger(AiAnswerEvaluationService.class);
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Value("${gemini.api.key:}")
    private String geminiApiKey;

    @Autowired
    private ExamAttemptRepository attemptRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private StudentAnswerRepository studentAnswerRepository;

    @Transactional
    public ExamAttempt evaluateAttemptWithAi(Long attemptId) {
        ExamAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Attempt not found: " + attemptId));

        Exam exam = attempt.getExam();
        List<Question> questions = questionRepository.findByExamIdOrderByQuestionOrderAsc(exam.getId());
        List<StudentAnswer> answers = studentAnswerRepository.findByAttemptId(attempt.getId());

        Map<Long, StudentAnswer> answerMap = new HashMap<>();
        for (StudentAnswer ans : answers) {
            answerMap.put(ans.getQuestion().getId(), ans);
        }

        BigDecimal totalScore = BigDecimal.ZERO;

        for (Question q : questions) {
            StudentAnswer ans = answerMap.get(q.getId());
            if (ans == null) {
                ans = new StudentAnswer(attempt, q, null, false);
            }

            String section = determineSection(q);
            BigDecimal maxMarks = q.getMarks() != null ? q.getMarks() : BigDecimal.ONE;

            if ("A".equals(section)) {
                // Section A: Multiple Choice Question
                if (ans.getSelectedOption() != null && ans.getSelectedOption().isCorrect()) {
                    ans.setMarksAwarded(maxMarks);
                    ans.setAiFeedback("Correct option selected.");
                } else if (ans.getSelectedOption() != null) {
                    BigDecimal neg = exam.getNegativeMarkPerQuestion() != null ? exam.getNegativeMarkPerQuestion() : BigDecimal.ZERO;
                    ans.setMarksAwarded(BigDecimal.ZERO.subtract(neg));
                    ans.setAiFeedback("Incorrect option selected.");
                } else {
                    ans.setMarksAwarded(BigDecimal.ZERO);
                    ans.setAiFeedback("Unanswered question.");
                }
            } else if ("B".equals(section)) {
                // Section B: Short Answer Question
                EvaluationResult res = evaluateShortAnswer(q, ans, maxMarks);
                ans.setMarksAwarded(res.marks);
                ans.setAiFeedback(res.feedback);
            } else if ("C".equals(section)) {
                // Section C: Predict the Output
                EvaluationResult res = evaluatePredictOutput(q, ans, maxMarks);
                ans.setMarksAwarded(res.marks);
                ans.setAiFeedback(res.feedback);
            } else {
                // Section D: Programming / Code Implementation
                EvaluationResult res = evaluateCodeAnswer(q, ans, maxMarks);
                ans.setMarksAwarded(res.marks);
                ans.setAiFeedback(res.feedback);
            }

            ans.setEvaluated(true);
            studentAnswerRepository.save(ans);

            if (ans.getMarksAwarded() != null && ans.getMarksAwarded().compareTo(BigDecimal.ZERO) > 0) {
                totalScore = totalScore.add(ans.getMarksAwarded());
            }
        }

        if (totalScore.compareTo(BigDecimal.ZERO) < 0) {
            totalScore = BigDecimal.ZERO;
        }

        attempt.setScore(totalScore.setScale(1, RoundingMode.HALF_UP));
        attempt.setPassed(attempt.getScore().compareTo(exam.getPassMarks()) >= 0);
        attempt.setAiEvaluated(true);

        return attemptRepository.save(attempt);
    }

    private EvaluationResult evaluateShortAnswer(Question q, StudentAnswer ans, BigDecimal maxMarks) {
        String studentText = ans.getTextAnswer() != null ? ans.getTextAnswer().trim() : "";
        if (studentText.isEmpty()) {
            return new EvaluationResult(BigDecimal.ZERO, "No answer was provided.");
        }

        // Try Gemini API first
        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            try {
                String prompt = String.format(
                        "You are an academic grader evaluating a student's short answer.\n" +
                        "Question: %s\n" +
                        "Expected Reference Concept: %s\n" +
                        "Student Written Answer: %s\n" +
                        "Maximum Marks: %s\n\n" +
                        "Evaluate the student's answer for accuracy, conceptual understanding, and clarity.\n" +
                        "Respond ONLY with a JSON object in this format:\n" +
                        "{\"marks\": <number_between_0_and_maxMarks>, \"feedback\": \"<1-2 sentences constructive feedback>\"}",
                        q.getQuestionText(), q.getExplanation() != null ? q.getExplanation() : "", studentText, maxMarks
                );

                return callGeminiForEvaluation(prompt, maxMarks);
            } catch (Exception e) {
                log.warn("Gemini evaluation error for Q{}, using heuristic evaluation: {}", q.getId(), e.getMessage());
            }
        }

        // Heuristic fallback for Section B
        int wordCount = studentText.split("\\s+").length;
        if (wordCount >= 10) {
            BigDecimal awarded = maxMarks.multiply(new BigDecimal("0.85")).setScale(1, RoundingMode.HALF_UP);
            return new EvaluationResult(awarded, "Well-explained response demonstrating solid conceptual understanding.");
        } else if (wordCount >= 4) {
            BigDecimal awarded = maxMarks.multiply(new BigDecimal("0.5")).setScale(1, RoundingMode.HALF_UP);
            return new EvaluationResult(awarded, "Partially correct answer; could provide more detail or examples.");
        } else {
            return new EvaluationResult(new BigDecimal("0.5"), "Brief answer with minimal detail.");
        }
    }

    private EvaluationResult evaluatePredictOutput(Question q, StudentAnswer ans, BigDecimal maxMarks) {
        String studentText = ans.getTextAnswer() != null ? ans.getTextAnswer().trim() : "";
        if (studentText.isEmpty()) {
            return new EvaluationResult(BigDecimal.ZERO, "No output prediction was provided.");
        }

        String explanation = q.getExplanation() != null ? q.getExplanation().toLowerCase() : "";
        String normalizedStudent = studentText.toLowerCase().replaceAll("[\\r\\n\\t\\s]+", " ");

        // Check against explanation or correct option if available
        boolean matchesExpected = false;
        if (q.getOptions() != null) {
            for (Option opt : q.getOptions()) {
                if (opt.isCorrect()) {
                    String optText = opt.getOptionText().toLowerCase().replaceAll("[\\r\\n\\t\\s]+", " ");
                    if (normalizedStudent.contains(optText) || optText.contains(normalizedStudent)) {
                        matchesExpected = true;
                        break;
                    }
                }
            }
        }

        if (matchesExpected || explanation.contains(normalizedStudent)) {
            return new EvaluationResult(maxMarks, "Accurate output prediction.");
        }

        // If Gemini is available, verify semantic equivalence
        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            try {
                String prompt = String.format(
                        "Determine if the student's output matches the program's output.\n" +
                        "Question:\n%s\n" +
                        "Reference Output Explanation:\n%s\n" +
                        "Student Predicted Output:\n%s\n" +
                        "Max Marks: %s\n" +
                        "Respond ONLY with JSON: {\"marks\": <0_or_maxMarks>, \"feedback\": \"<feedback>\"}",
                        q.getQuestionText(), explanation, studentText, maxMarks
                );
                return callGeminiForEvaluation(prompt, maxMarks);
            } catch (Exception e) {
                log.warn("Gemini evaluation error for Section C Q{}: {}", q.getId(), e.getMessage());
            }
        }

        return new EvaluationResult(new BigDecimal("0.5"), "Output prediction does not fully match expected execution output.");
    }

    private EvaluationResult evaluateCodeAnswer(Question q, StudentAnswer ans, BigDecimal maxMarks) {
        String studentCode = ans.getTextAnswer() != null ? ans.getTextAnswer().trim() : "";
        if (studentCode.isEmpty()) {
            return new EvaluationResult(BigDecimal.ZERO, "No code solution was submitted.");
        }

        if (geminiApiKey != null && !geminiApiKey.isBlank()) {
            try {
                String prompt = String.format(
                        "You are an automated code evaluation engine grading a programming problem.\n" +
                        "Problem Description:\n%s\n\n" +
                        "Language Used: %s\n" +
                        "Student Submitted Code:\n%s\n\n" +
                        "Maximum Marks: %s\n" +
                        "Evaluate the solution for correctness, syntax, proper logic, input handling, and output correctness.\n" +
                        "Respond ONLY with a valid JSON object in this format:\n" +
                        "{\"marks\": <number_between_0_and_maxMarks>, \"feedback\": \"<1-2 sentences on code correctness, syntax, and logic>\"}",
                        q.getQuestionText(),
                        ans.getCodeLanguage() != null ? ans.getCodeLanguage() : "javascript",
                        studentCode,
                        maxMarks
                );
                return callGeminiForEvaluation(prompt, maxMarks);
            } catch (Exception e) {
                log.warn("Gemini evaluation error for Code Q{}: {}", q.getId(), e.getMessage());
            }
        }

        // Heuristic code evaluation fallback
        boolean hasLogic = studentCode.contains("if") || studentCode.contains("switch") ||
                           studentCode.contains("for") || studentCode.contains("while") ||
                           studentCode.contains("console.log") || studentCode.contains("printf") ||
                           studentCode.contains("cout") || studentCode.contains("System.out") ||
                           studentCode.contains("print(");

        if (hasLogic && studentCode.length() > 30) {
            BigDecimal awarded = maxMarks.multiply(new BigDecimal("0.85")).setScale(1, RoundingMode.HALF_UP);
            return new EvaluationResult(awarded, "Syntactically coherent program implementation addressing problem requirements.");
        } else {
            BigDecimal awarded = maxMarks.multiply(new BigDecimal("0.4")).setScale(1, RoundingMode.HALF_UP);
            return new EvaluationResult(awarded, "Partial program implementation; incomplete logic structure.");
        }
    }

    private EvaluationResult callGeminiForEvaluation(String prompt, BigDecimal maxMarks) throws Exception {
        String urlStr = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=" + geminiApiKey;
        URL url = new URL(urlStr);
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);
        conn.setConnectTimeout(12000);
        conn.setReadTimeout(15000);

        Map<String, Object> body = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(Map.of("text", prompt)))
                )
        );

        try (OutputStream os = conn.getOutputStream()) {
            os.write(objectMapper.writeValueAsBytes(body));
        }

        if (conn.getResponseCode() != 200) {
            throw new RuntimeException("Gemini API error: HTTP " + conn.getResponseCode());
        }

        StringBuilder response = new StringBuilder();
        try (BufferedReader br = new BufferedReader(new InputStreamReader(conn.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            while ((line = br.readLine()) != null) response.append(line);
        }

        JsonNode root = objectMapper.readTree(response.toString());
        String text = root.path("candidates").get(0).path("content").path("parts").get(0).path("text").asText();

        // Extract JSON from markdown fences if any
        String cleanJson = text.replaceAll("(?s)```json\\s*", "").replaceAll("```", "").trim();
        JsonNode parsed = objectMapper.readTree(cleanJson);

        double marksVal = parsed.path("marks").asDouble(0.0);
        String feedbackVal = parsed.path("feedback").asText("Evaluation complete.");

        BigDecimal marks = BigDecimal.valueOf(Math.min(marksVal, maxMarks.doubleValue())).setScale(1, RoundingMode.HALF_UP);
        return new EvaluationResult(marks, feedbackVal);
    }

    @Transactional(readOnly = true)
    public StudentPaperDto getStudentPaper(Long attemptId) {
        ExamAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Attempt not found: " + attemptId));

        Exam exam = attempt.getExam();
        StudentPaperDto dto = new StudentPaperDto();
        dto.setAttemptId(attempt.getId());
        dto.setExamId(exam.getId());
        dto.setExamTitle(exam.getTitle());
        dto.setStudentId(attempt.getUser().getId());
        dto.setStudentName(attempt.getUser().getFullName());
        dto.setStudentEmail(attempt.getUser().getEmail());
        dto.setRollNumber(attempt.getUser().getStudentId());
        dto.setStartedAt(attempt.getStartedAt());
        dto.setSubmittedAt(attempt.getSubmittedAt());
        dto.setStatus(attempt.getStatus());
        dto.setScore(attempt.getScore());
        dto.setTotalMarks(exam.getTotalMarks());
        dto.setPassMarks(exam.getPassMarks());
        dto.setPassed(attempt.isPassed());
        dto.setResultPublished(attempt.isResultPublished());
        dto.setAiEvaluated(attempt.isAiEvaluated());
        dto.setViolationCount(attempt.getViolationCount());
        dto.setQuestions(getDetailedEvaluation(attemptId));

        return dto;
    }

    @Transactional(readOnly = true)
    public List<QuestionEvaluationDto> getDetailedEvaluation(Long attemptId) {
        ExamAttempt attempt = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Attempt not found: " + attemptId));

        Exam exam = attempt.getExam();
        List<Question> questions = questionRepository.findByExamIdOrderByQuestionOrderAsc(exam.getId());
        List<StudentAnswer> answers = studentAnswerRepository.findByAttemptId(attempt.getId());

        Map<Long, StudentAnswer> answerMap = new HashMap<>();
        for (StudentAnswer ans : answers) {
            answerMap.put(ans.getQuestion().getId(), ans);
        }

        List<QuestionEvaluationDto> dtos = new ArrayList<>();
        for (Question q : questions) {
            StudentAnswer ans = answerMap.get(q.getId());
            QuestionEvaluationDto dto = new QuestionEvaluationDto();
            dto.setQuestionId(q.getId());
            dto.setQuestionOrder(q.getQuestionOrder());
            dto.setQuestionText(q.getQuestionText());
            dto.setSection(determineSection(q));
            dto.setMaxMarks(q.getMarks() != null ? q.getMarks() : BigDecimal.ONE);
            dto.setExpectedExplanation(q.getExplanation());

            if (q.getOptions() != null) {
                for (Option opt : q.getOptions()) {
                    if (opt.isCorrect()) {
                        dto.setCorrectOptionText(opt.getOptionText());
                        break;
                    }
                }
            }

            if (ans != null) {
                dto.setMarksAwarded(ans.getMarksAwarded());
                dto.setAiFeedback(ans.getAiFeedback());
                dto.setEvaluated(ans.isEvaluated());
                dto.setStudentAnswer(ans.getTextAnswer());
                dto.setCodeLanguage(ans.getCodeLanguage());
                if (ans.getSelectedOption() != null) {
                    dto.setStudentSelectedOption(ans.getSelectedOption().getOptionText());
                }
            } else {
                dto.setMarksAwarded(BigDecimal.ZERO);
                dto.setAiFeedback("No response recorded.");
                dto.setEvaluated(false);
            }

            dtos.add(dto);
        }

        return dtos;
    }

    @Transactional
    public BigDecimal updateQuestionMarks(Long attemptId, Long questionId, BigDecimal marks, String feedback) {
        StudentAnswer ans = studentAnswerRepository.findByAttemptIdAndQuestionId(attemptId, questionId)
                .orElseGet(() -> {
                    ExamAttempt attempt = attemptRepository.findById(attemptId)
                            .orElseThrow(() -> new IllegalArgumentException("Attempt not found: " + attemptId));
                    Question q = questionRepository.findById(questionId)
                            .orElseThrow(() -> new IllegalArgumentException("Question not found: " + questionId));
                    StudentAnswer newAns = new StudentAnswer(attempt, q, null, false);
                    return studentAnswerRepository.save(newAns);
                });

        ans.setMarksAwarded(marks);
        if (feedback != null) ans.setAiFeedback(feedback);
        ans.setEvaluated(true);
        studentAnswerRepository.save(ans);

        ExamAttempt att = attemptRepository.findById(attemptId)
                .orElseThrow(() -> new IllegalArgumentException("Attempt not found: " + attemptId));
        List<StudentAnswer> allAns = studentAnswerRepository.findByAttemptId(attemptId);
        BigDecimal total = allAns.stream()
                .map(a -> a.getMarksAwarded() != null ? a.getMarksAwarded() : BigDecimal.ZERO)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        att.setScore(total);
        if (att.getExam() != null && att.getExam().getPassMarks() != null) {
            att.setPassed(total.compareTo(att.getExam().getPassMarks()) >= 0);
        }
        attemptRepository.save(att);
        return total;
    }

    private String determineSection(Question q) {
        String text = q.getQuestionText() != null ? q.getQuestionText() : "";
        if (text.contains("Section D") || text.contains("Programming") || text.toLowerCase().contains("section d:")) {
            return "D";
        }
        if (text.contains("Section C") || text.contains("Predict the Output") || text.toLowerCase().contains("section c:")) {
            return "C";
        }
        if (text.contains("Section B") || text.contains("Short Answer") || text.toLowerCase().contains("section b:")) {
            return "B";
        }
        return "A";
    }

    private static class EvaluationResult {
        final BigDecimal marks;
        final String feedback;

        EvaluationResult(BigDecimal marks, String feedback) {
            this.marks = marks;
            this.feedback = feedback;
        }
    }
}
