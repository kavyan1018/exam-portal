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
@PreAuthorize("hasAuthority('ROLE_ADMIN')")
public class AdminController {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private AuthService authService;

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
}
