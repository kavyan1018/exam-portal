package com.examportal.service;

import com.examportal.dto.exam.ExamCreateRequest;
import com.examportal.dto.exam.ExamDto;
import com.examportal.dto.exam.OptionDto;
import com.examportal.dto.exam.QuestionDto;
import com.examportal.model.*;
import com.examportal.repository.ExamRepository;
import com.examportal.repository.OptionRepository;
import com.examportal.repository.QuestionRepository;
import com.examportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class ExamService {

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private OptionRepository optionRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private com.examportal.repository.ExamAttemptRepository attemptRepository;

    @Transactional
    @Transactional
    public void deleteExam(Long examId) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found with id: " + examId));
        List<ExamAttempt> attempts = attemptRepository.findByExamIdOrderByStartedAtDesc(examId);
        if (attempts != null && !attempts.isEmpty()) {
            attemptRepository.deleteAll(attempts);
        }
        examRepository.delete(exam);
    }

    @Transactional
    public ExamDto createExam(ExamCreateRequest request, Long facultyUserId) {
        User faculty = userRepository.findById(facultyUserId)
                .orElseThrow(() -> new IllegalArgumentException("Faculty user not found"));

        Exam exam = new Exam();
        exam.setTitle(request.getTitle());
        exam.setDescription(request.getDescription());
        exam.setStartWindow(request.getStartWindow());
        exam.setEndWindow(request.getEndWindow());
        exam.setDurationMinutes(request.getDurationMinutes());
        exam.setTotalMarks(request.getTotalMarks());
        exam.setPassMarks(request.getPassMarks());
        exam.setNegativeMarkPerQuestion(request.getNegativeMarkPerQuestion());
        exam.setRandomizeQuestions(request.isRandomizeQuestions());
        exam.setRandomizeOptions(request.isRandomizeOptions());
        exam.setMaxViolationsAllowed(request.getMaxViolationsAllowed());
        exam.setEnableWebcam(request.isEnableWebcam());
        exam.setStatus(request.getStatus() != null ? request.getStatus() : ExamStatus.DRAFT);
        exam.setCreatedBy(faculty);

        Exam saved = examRepository.save(exam);
        return convertToDto(saved, false);
    }

    @Transactional
    public ExamDto updateExam(Long examId, ExamCreateRequest request) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found with id: " + examId));

        exam.setTitle(request.getTitle());
        exam.setDescription(request.getDescription());
        exam.setStartWindow(request.getStartWindow());
        exam.setEndWindow(request.getEndWindow());
        exam.setDurationMinutes(request.getDurationMinutes());
        exam.setTotalMarks(request.getTotalMarks());
        exam.setPassMarks(request.getPassMarks());
        exam.setNegativeMarkPerQuestion(request.getNegativeMarkPerQuestion());
        exam.setRandomizeQuestions(request.isRandomizeQuestions());
        exam.setRandomizeOptions(request.isRandomizeOptions());
        exam.setMaxViolationsAllowed(request.getMaxViolationsAllowed());
        exam.setEnableWebcam(request.isEnableWebcam());
        if (request.getStatus() != null) {
            exam.setStatus(request.getStatus());
        }

        Exam updated = examRepository.save(exam);
        return convertToDto(updated, false);
    }

    @Transactional(readOnly = true)
    public List<ExamDto> getExamsByFaculty(Long facultyUserId) {
        return examRepository.findByCreatedByIdOrderByCreatedAtDesc(facultyUserId).stream()
                .map(e -> convertToDto(e, false))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<ExamDto> getActiveAndUpcomingExams() {
        return examRepository.findActiveAndUpcomingExams(ExamStatus.PUBLISHED, LocalDateTime.now()).stream()
                .map(e -> convertToDto(e, false))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public ExamDto getExamById(Long examId, boolean includeQuestions, boolean isStudent) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found with id: " + examId));
        return convertToDto(exam, includeQuestions, isStudent);
    }

    @Transactional
    public QuestionDto addQuestion(Long examId, QuestionDto dto) {
        Exam exam = examRepository.findById(examId)
                .orElseThrow(() -> new IllegalArgumentException("Exam not found with id: " + examId));

        Question question = new Question();
        question.setExam(exam);
        question.setQuestionText(dto.getQuestionText());
        question.setExplanation(dto.getExplanation());
        question.setMarks(dto.getMarks() != null ? dto.getMarks() : BigDecimal.ONE);
        question.setQuestionOrder(dto.getQuestionOrder());

        Question saved = questionRepository.save(question);

        if (dto.getOptions() != null) {
            for (OptionDto optDto : dto.getOptions()) {
                Option opt = new Option(saved, optDto.getOptionText(), Boolean.TRUE.equals(optDto.getIsCorrect()), optDto.getOptionOrder());
                optionRepository.save(opt);
            }
        }

        // Recalculate exam total marks
        List<Question> allQuestions = questionRepository.findByExamIdOrderByQuestionOrderAsc(examId);
        BigDecimal total = allQuestions.stream()
                .map(Question::getMarks)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        exam.setTotalMarks(total);
        examRepository.save(exam);

        return convertQuestionToDto(saved, false);
    }

    @Transactional
    public void deleteQuestion(Long questionId) {
        Question q = questionRepository.findById(questionId)
                .orElseThrow(() -> new IllegalArgumentException("Question not found"));
        Exam exam = q.getExam();
        questionRepository.delete(q);

        // Recalculate
        List<Question> allQuestions = questionRepository.findByExamIdOrderByQuestionOrderAsc(exam.getId());
        BigDecimal total = allQuestions.stream()
                .map(Question::getMarks)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
        exam.setTotalMarks(total);
        examRepository.save(exam);
    }

    public ExamDto convertToDto(Exam exam, boolean includeQuestions) {
        return convertToDto(exam, includeQuestions, false);
    }

    public ExamDto convertToDto(Exam exam, boolean includeQuestions, boolean isStudent) {
        ExamDto dto = new ExamDto();
        dto.setId(exam.getId());
        dto.setTitle(exam.getTitle());
        dto.setDescription(exam.getDescription());
        dto.setStartWindow(exam.getStartWindow());
        dto.setEndWindow(exam.getEndWindow());
        dto.setDurationMinutes(exam.getDurationMinutes());
        dto.setTotalMarks(exam.getTotalMarks());
        dto.setPassMarks(exam.getPassMarks());
        dto.setNegativeMarkPerQuestion(exam.getNegativeMarkPerQuestion());
        dto.setRandomizeQuestions(exam.isRandomizeQuestions());
        dto.setRandomizeOptions(exam.isRandomizeOptions());
        dto.setMaxViolationsAllowed(exam.getMaxViolationsAllowed());
        dto.setEnableWebcam(exam.isEnableWebcam());
        dto.setLocked(exam.isLocked());
        dto.setStatus(exam.getStatus());
        dto.setCreatedByName(exam.getCreatedBy() != null ? exam.getCreatedBy().getFullName() : null);
        dto.setQuestionCount(exam.getQuestions() != null ? exam.getQuestions().size() : 0);

        if (includeQuestions && exam.getQuestions() != null) {
            dto.setQuestions(exam.getQuestions().stream()
                    .map(q -> convertQuestionToDto(q, isStudent))
                    .collect(Collectors.toList()));
        }

        return dto;
    }

    public QuestionDto convertQuestionToDto(Question q, boolean isStudent) {
        QuestionDto dto = new QuestionDto();
        dto.setId(q.getId());
        dto.setQuestionText(q.getQuestionText());
        if (!isStudent) {
            dto.setExplanation(q.getExplanation());
        }
        dto.setMarks(q.getMarks());
        dto.setQuestionOrder(q.getQuestionOrder());

        if (q.getOptions() != null) {
            dto.setOptions(q.getOptions().stream().map(opt -> {
                OptionDto optDto = new OptionDto();
                optDto.setId(opt.getId());
                optDto.setOptionText(opt.getOptionText());
                optDto.setOptionOrder(opt.getOptionOrder());
                if (!isStudent) {
                    optDto.setIsCorrect(opt.isCorrect());
                }
                return optDto;
            }).collect(Collectors.toList()));
        }
        return dto;
    }
}
