package com.examportal.config;

import com.examportal.model.*;
import com.examportal.repository.ExamRepository;
import com.examportal.repository.OptionRepository;
import com.examportal.repository.QuestionRepository;
import com.examportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Component
public class DataInitializer implements CommandLineRunner {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private ExamRepository examRepository;

    @Autowired
    private com.examportal.repository.ExamAttemptRepository attemptRepository;

    @Autowired
    private QuestionRepository questionRepository;

    @Autowired
    private OptionRepository optionRepository;

    @Autowired
    private com.examportal.repository.StudentAnswerRepository studentAnswerRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Override
    @org.springframework.transaction.annotation.Transactional
    public void run(String... args) throws Exception {
        // Ensure Kavyan Nayak (Main Administrator) account always exists with requested credentials
        userRepository.findByEmailIgnoreCase("kavvyanfaculty@gmail.com").ifPresentOrElse(
                user -> {
                    user.setFullName("Kavyan Nayak");
                    user.setPassword(passwordEncoder.encode("kavyan@faculty22"));
                    user.setRole(Role.ROLE_ADMIN);
                    userRepository.save(user);
                    System.out.println(">>> [INIT] Updated Kavyan Nayak credentials successfully!");
                },
                () -> {
                    User kavyan = new User(
                            "Kavyan Nayak",
                            "kavvyanfaculty@gmail.com",
                            passwordEncoder.encode("kavyan@faculty22"),
                            Role.ROLE_ADMIN,
                            "ADMIN-KAVYAN"
                    );
                    userRepository.save(kavyan);
                    System.out.println(">>> [INIT] Created Kavyan Nayak account successfully!");
                }
        );

        // Always remove CS301 sample exam from database so it doesn't show in Available Exams
        try {
            examRepository.findAll().stream()
                    .filter(e -> e.getTitle() != null && e.getTitle().contains("CS301"))
                    .forEach(e -> {
                        try {
                            attemptRepository.deleteByExamId(e.getId());
                            examRepository.delete(e);
                            System.out.println(">>> [INIT] Deleted CS301 exam from database successfully!");
                        } catch (Exception ex) {
                            e.setStatus(ExamStatus.ARCHIVED);
                            examRepository.save(e);
                            System.out.println(">>> [INIT] Archived CS301 exam successfully!");
                        }
                    });

            // Ensure any active exam's endWindow is open so students can take it
            examRepository.findAll().forEach(e -> {
                if (e.getEndWindow() != null && e.getEndWindow().isBefore(LocalDateTime.now())) {
                    e.setEndWindow(LocalDateTime.now().plusDays(30));
                    examRepository.save(e);
                    System.out.println(">>> [INIT] Extended exam '" + e.getTitle() + "' endWindow to +30 days!");
                }
            });

            // Cleanup duplicates in JS Exam (keep only clean questions without dummy options for Sec B/C/D)
            examRepository.findAll().stream()
                    .filter(e -> e.getTitle() != null && e.getTitle().contains("2026CWD001(NEW)JS"))
                    .forEach(exam -> {
                        java.util.List<Question> questions = questionRepository.findByExamIdOrderByQuestionOrderAsc(exam.getId());
                        if (questions.size() > 22) {
                            System.out.println(">>> [INIT] Found duplicate questions (" + questions.size() + ") in JS Exam. Cleaning up...");
                            java.util.Map<Integer, java.util.List<Question>> byOrder = new java.util.HashMap<>();
                            for (Question q : questions) {
                                byOrder.computeIfAbsent(q.getQuestionOrder(), k -> new java.util.ArrayList<>()).add(q);
                            }

                            for (java.util.Map.Entry<Integer, java.util.List<Question>> entry : byOrder.entrySet()) {
                                java.util.List<Question> list = entry.getValue();
                                if (list.size() > 1) {
                                    Question cleanQ = list.get(list.size() - 1); // higher ID (has 0 options for Sec B/C/D)
                                    Question oldQ = list.get(0); // lower ID

                                    java.util.List<StudentAnswer> oldAnswers = studentAnswerRepository.findByQuestionId(oldQ.getId());
                                    for (StudentAnswer sa : oldAnswers) {
                                        java.util.Optional<StudentAnswer> existingClean = studentAnswerRepository.findByAttemptIdAndQuestionId(sa.getAttempt().getId(), cleanQ.getId());
                                        if (existingClean.isPresent()) {
                                            StudentAnswer target = existingClean.get();
                                            if (sa.getSelectedOption() != null) {
                                                String selText = sa.getSelectedOption().getOptionText();
                                                if (cleanQ.getOptions() != null) {
                                                    cleanQ.getOptions().stream()
                                                            .filter(o -> o.getOptionText().equalsIgnoreCase(selText))
                                                            .findFirst()
                                                            .ifPresent(target::setSelectedOption);
                                                }
                                            }
                                            if (sa.getTextAnswer() != null) target.setTextAnswer(sa.getTextAnswer());
                                            if (sa.getMarksAwarded() != null) target.setMarksAwarded(sa.getMarksAwarded());
                                            studentAnswerRepository.save(target);
                                            studentAnswerRepository.delete(sa);
                                        } else {
                                            sa.setQuestion(cleanQ);
                                            if (sa.getSelectedOption() != null) {
                                                String selText = sa.getSelectedOption().getOptionText();
                                                if (cleanQ.getOptions() != null) {
                                                    cleanQ.getOptions().stream()
                                                            .filter(o -> o.getOptionText().equalsIgnoreCase(selText))
                                                            .findFirst()
                                                            .ifPresent(sa::setSelectedOption);
                                                }
                                            }
                                            studentAnswerRepository.save(sa);
                                        }
                                    }

                                    questionRepository.delete(oldQ);
                                }
                            }

                            exam.setTotalMarks(BigDecimal.valueOf(40.0));
                            examRepository.save(exam);
                            System.out.println(">>> [INIT] Successfully deduplicated JS exam to exactly 22 questions and 40 marks!");
                        }
                    });
        } catch (Exception e) {
            System.err.println(">>> [INIT] Error in exam cleanup/extension: " + e.getMessage());
        }

        if (examRepository.count() > 0) {
            return;
        }

        // 1. Seed Faculty
        User faculty = new User(
                "Prof. Arvind Sharma",
                "faculty@college.edu",
                passwordEncoder.encode("Faculty@123"),
                Role.ROLE_FACULTY,
                "FAC-101"
        );
        userRepository.save(faculty);

        // 2. Seed Student
        User student = new User(
                "Kavya Verma",
                "student@college.edu",
                passwordEncoder.encode("Student@123"),
                Role.ROLE_STUDENT,
                "CS-2026-042"
        );
        userRepository.save(student);

        // 3. Seed Admin
        User admin = new User(
                "System Administrator",
                "admin@college.edu",
                passwordEncoder.encode("Admin@123"),
                Role.ROLE_ADMIN,
                "ADM-001"
        );
        userRepository.save(admin);
    }

    private Question createQuestion(Exam exam, String text, String explanation, int order, double marks) {
        Question q = new Question();
        q.setExam(exam);
        q.setQuestionText(text);
        q.setExplanation(explanation);
        q.setQuestionOrder(order);
        q.setMarks(BigDecimal.valueOf(marks));
        return questionRepository.save(q);
    }

    private void createOption(Question question, String text, boolean isCorrect, int order) {
        Option opt = new Option(question, text, isCorrect, order);
        optionRepository.save(opt);
    }
}
