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

        // 4. Seed Sample Active MCQ Exam
        Exam exam = new Exam();
        exam.setTitle("CS301: Data Structures & Algorithms Online Assessment");
        exam.setDescription("End-term MCQ exam covering Binary Trees, Sorting Algorithms, Time Complexity, and Graphs. Fullscreen mode and tab switch detection enabled.");
        exam.setStartWindow(LocalDateTime.now().minusHours(1));
        exam.setEndWindow(LocalDateTime.now().plusDays(30)); // Active for test taking
        exam.setDurationMinutes(20);
        exam.setTotalMarks(BigDecimal.valueOf(5.0));
        exam.setPassMarks(BigDecimal.valueOf(2.5));
        exam.setNegativeMarkPerQuestion(BigDecimal.valueOf(0.25));
        exam.setRandomizeQuestions(true);
        exam.setRandomizeOptions(true);
        exam.setMaxViolationsAllowed(3);
        exam.setEnableWebcam(true);
        exam.setStatus(ExamStatus.PUBLISHED);
        exam.setCreatedBy(faculty);
        Exam savedExam = examRepository.save(exam);

        // Question 1
        Question q1 = createQuestion(savedExam, "What is the worst-case time complexity of QuickSort?",
                "When the chosen pivot is always the extreme element, recurrence is T(n) = T(n-1) + O(n) which is O(n^2).", 1, 1.0);
        createOption(q1, "O(n log n)", false, 1);
        createOption(q1, "O(n^2)", true, 2);
        createOption(q1, "O(log n)", false, 3);
        createOption(q1, "O(n)", false, 4);

        // Question 2
        Question q2 = createQuestion(savedExam, "Which data structure follows the LIFO (Last In First Out) principle?",
                "A Stack pushes elements on top and pops from the top, adhering to LIFO.", 2, 1.0);
        createOption(q2, "Queue", false, 1);
        createOption(q2, "Linked List", false, 2);
        createOption(q2, "Stack", true, 3);
        createOption(q2, "Heap", false, 4);

        // Question 3
        Question q3 = createQuestion(savedExam, "What is the minimum number of queues needed to implement a stack?",
                "Two queues can be used to simulate stack operations by shifting elements between them.", 3, 1.0);
        createOption(q3, "1", false, 1);
        createOption(q3, "2", true, 2);
        createOption(q3, "3", false, 3);
        createOption(q3, "4", false, 4);

        // Question 4
        Question q4 = createQuestion(savedExam, "In a balanced Binary Search Tree (AVL), what is the maximum search time complexity?",
                "Because height is strictly maintained at O(log n), search is always O(log n).", 4, 1.0);
        createOption(q4, "O(1)", false, 1);
        createOption(q4, "O(log n)", true, 2);
        createOption(q4, "O(n)", false, 3);
        createOption(q4, "O(n log n)", false, 4);

        // Question 5
        Question q5 = createQuestion(savedExam, "Which graph traversal algorithm uses a Queue as its underlying auxiliary data structure?",
                "Breadth First Search (BFS) visits nodes level by level using a FIFO Queue.", 5, 1.0);
        createOption(q5, "Breadth First Search (BFS)", true, 1);
        createOption(q5, "Depth First Search (DFS)", false, 2);
        createOption(q5, "Topological Sort using recursion", false, 3);
        createOption(q5, "Dijkstra's without Priority Queue", false, 4);
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
