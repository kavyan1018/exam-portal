package com.examportal.service;

import com.examportal.model.ExamAttempt;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private static final Logger logger = LoggerFactory.getLogger(EmailService.class);

    public boolean sendExamResultEmail(ExamAttempt attempt) {
        String studentEmail = attempt.getUser().getEmail();
        String studentName = attempt.getUser().getFullName();
        String examTitle = attempt.getExam().getTitle();
        String batch = attempt.getUser().getStudentId() != null ? attempt.getUser().getStudentId() : "General Batch";
        String status = attempt.isPassed() ? "PASSED" : "FAILED";

        String subject = "Official Result: " + examTitle;
        String content = String.format(
                "\n============================================================\n" +
                "EMAIL DISPATCHED TO: %s\n" +
                "SUBJECT: %s\n" +
                "============================================================\n" +
                "Dear %s,\n\n" +
                "Your examination paper for \"%s\" has been evaluated.\n\n" +
                "--------------------------------------------------\n" +
                "EXAM RESULT SUMMARY\n" +
                "--------------------------------------------------\n" +
                "Student Name  : %s\n" +
                "Batch Name    : %s\n" +
                "Attempt Status: %s\n" +
                "Marks Obtained: %s / %s\n" +
                "Passing Marks : %s\n" +
                "Final Result  : %s\n" +
                "Violations    : %d\n" +
                "--------------------------------------------------\n\n" +
                "You can log in to your student portal at any time to review your performance.\n\n" +
                "Best regards,\n" +
                "Examination Controller\n" +
                "============================================================\n",
                studentEmail, subject, studentName, examTitle, studentName, batch,
                attempt.getStatus(), attempt.getScore(), attempt.getExam().getTotalMarks(),
                attempt.getExam().getPassMarks(), status, attempt.getViolationCount()
        );

        logger.info(content);
        return true;
    }
}
