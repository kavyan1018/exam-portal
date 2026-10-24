package com.examportal.controller;

import com.examportal.dto.auth.RegisterRequest;
import com.examportal.dto.auth.UserDto;
import com.examportal.model.Role;
import com.examportal.model.User;
import com.examportal.repository.UserRepository;
import com.examportal.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/admin")
@PreAuthorize("hasAnyAuthority('ROLE_ADMIN', 'ROLE_FACULTY')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthService authService;

    @Autowired
    private org.springframework.security.crypto.password.PasswordEncoder passwordEncoder;

    @Autowired
    private com.examportal.repository.ExamAttemptRepository examAttemptRepository;

    @GetMapping("/faculty")
    public ResponseEntity<List<UserDto>> listFacultyMembers() {
        List<User> facultyList = userRepository.findByRole(Role.ROLE_FACULTY);
        List<UserDto> dtos = facultyList.stream()
                .map(u -> new UserDto(u.getId(), u.getFullName(), u.getEmail(), u.getRole(), u.getStudentId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/faculty")
    public ResponseEntity<UserDto> addFacultyMember(@Valid @RequestBody RegisterRequest request) {
        User created = authService.createFacultyUser(request);
        return ResponseEntity.ok(new UserDto(
                created.getId(),
                created.getFullName(),
                created.getEmail(),
                created.getRole(),
                created.getStudentId()
        ));
    }

    @DeleteMapping("/faculty/{id}")
    public ResponseEntity<Map<String, String>> removeFacultyMember(@PathVariable Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Faculty member not found"));

        if (user.getRole() != Role.ROLE_FACULTY) {
            throw new IllegalArgumentException("Cannot delete non-faculty user via this endpoint");
        }

        userRepository.delete(user);
        return ResponseEntity.ok(Map.of("message", "Faculty account deleted successfully"));
    }

    // --- STUDENT & BATCH MANAGEMENT (Super Admin) ---

    @GetMapping("/students")
    public ResponseEntity<List<UserDto>> listStudents(@RequestParam(required = false) String batch) {
        List<User> students = userRepository.findByRole(Role.ROLE_STUDENT);
        if (batch != null && !batch.isBlank()) {
            students = students.stream()
                    .filter(s -> batch.equalsIgnoreCase(s.getStudentId()))
                    .collect(Collectors.toList());
        }

        List<UserDto> dtos = students.stream()
                .map(u -> new UserDto(u.getId(), u.getFullName(), u.getEmail(), u.getRole(), u.getStudentId()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(dtos);
    }

    @PostMapping("/students")
    public ResponseEntity<UserDto> addStudentWithBatch(@Valid @RequestBody RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Email is already registered");
        }

        User student = new User(
                request.getFullName(),
                request.getEmail(),
                passwordEncoder.encode(request.getPassword()),
                Role.ROLE_STUDENT,
                request.getStudentId() != null ? request.getStudentId() : "General Batch"
        );

        User saved = userRepository.save(student);
        return ResponseEntity.ok(new UserDto(saved.getId(), saved.getFullName(), saved.getEmail(), saved.getRole(), saved.getStudentId()));
    }

    @PutMapping("/students/{id}/batch")
    public ResponseEntity<UserDto> updateStudentBatch(@PathVariable Long id, @RequestBody Map<String, String> payload) {
        String newBatch = payload.get("batch");
        User student = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        if (student.getRole() != Role.ROLE_STUDENT) {
            throw new IllegalArgumentException("Target user is not a student");
        }

        student.setStudentId(newBatch);
        User updated = userRepository.save(student);
        return ResponseEntity.ok(new UserDto(updated.getId(), updated.getFullName(), updated.getEmail(), updated.getRole(), updated.getStudentId()));
    }

    @PostMapping("/students/bulk-batch")
    public ResponseEntity<Map<String, Object>> bulkAssignBatch(@RequestBody Map<String, Object> payload) {
        String newBatch = (String) payload.get("batch");
        List<Integer> studentIds = (List<Integer>) payload.get("studentIds");

        if (newBatch == null || studentIds == null || studentIds.isEmpty()) {
            throw new IllegalArgumentException("Batch name and student IDs are required");
        }

        int updatedCount = 0;
        for (Integer sId : studentIds) {
            userRepository.findById(sId.longValue()).ifPresent(u -> {
                if (u.getRole() == Role.ROLE_STUDENT) {
                    u.setStudentId(newBatch);
                    userRepository.save(u);
                }
            });
            updatedCount++;
        }

        return ResponseEntity.ok(Map.of(
                "message", "Assigned " + updatedCount + " students to " + newBatch,
                "updatedCount", updatedCount
        ));
    }

    @PutMapping("/students/{id}/remove-batch")
    public ResponseEntity<UserDto> removeStudentFromBatch(@PathVariable Long id) {
        User student = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        if (student.getRole() != Role.ROLE_STUDENT) {
            throw new IllegalArgumentException("Target user is not a student");
        }

        student.setStudentId("Unassigned");
        User updated = userRepository.save(student);
        return ResponseEntity.ok(new UserDto(updated.getId(), updated.getFullName(), updated.getEmail(), updated.getRole(), updated.getStudentId()));
    }

    @PostMapping("/students/bulk-remove-batch")
    public ResponseEntity<Map<String, Object>> bulkRemoveBatch(@RequestBody Map<String, Object> payload) {
        List<Integer> studentIds = (List<Integer>) payload.get("studentIds");

        if (studentIds == null || studentIds.isEmpty()) {
            throw new IllegalArgumentException("Student IDs are required");
        }

        int updatedCount = 0;
        for (Integer sId : studentIds) {
            userRepository.findById(sId.longValue()).ifPresent(u -> {
                if (u.getRole() == Role.ROLE_STUDENT) {
                    u.setStudentId("Unassigned");
                    userRepository.save(u);
                }
            });
            updatedCount++;
        }

        return ResponseEntity.ok(Map.of(
                "message", "Removed " + updatedCount + " students from their batches",
                "updatedCount", updatedCount
        ));
    }

    @DeleteMapping("/students/{id}")
    @org.springframework.transaction.annotation.Transactional
    public ResponseEntity<Map<String, String>> deleteStudent(@PathVariable Long id) {
        User student = userRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Student not found"));

        if (student.getRole() != Role.ROLE_STUDENT) {
            throw new IllegalArgumentException("Cannot delete non-student user through this endpoint");
        }

        // Clean up any attempts and student answers to prevent foreign key issues
        List<com.examportal.model.ExamAttempt> attempts = examAttemptRepository.findByUserIdOrderByStartedAtDesc(id);
        if (attempts != null && !attempts.isEmpty()) {
            examAttemptRepository.deleteAll(attempts);
        }

        userRepository.delete(student);
        return ResponseEntity.ok(Map.of("message", "Student account deleted successfully"));
    }
}
