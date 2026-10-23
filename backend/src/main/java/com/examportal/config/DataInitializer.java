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
    private PasswordEncoder passwordEncoder;

    @Override
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
