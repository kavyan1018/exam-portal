package com.examportal.controller;

import com.examportal.dto.auth.AuthResponse;
import com.examportal.dto.auth.LoginRequest;
import com.examportal.dto.auth.RegisterRequest;
import com.examportal.dto.auth.UserDto;
import com.examportal.model.User;
import com.examportal.repository.UserRepository;
import com.examportal.security.UserDetailsImpl;
import com.examportal.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
public class AuthController {

    @Autowired
    private AuthService authService;

    @Autowired
    private UserRepository userRepository;

    @PostMapping("/login")
    public ResponseEntity<AuthResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.authenticateUser(request);
        return ResponseEntity.ok(response);
    }

    @PostMapping("/register")
    public ResponseEntity<AuthResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.registerUser(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(@AuthenticationPrincipal UserDetailsImpl userDetails) {
        if (userDetails == null) {
            return ResponseEntity.status(401).build();
        }
        User user = userRepository.findById(userDetails.getId()).orElseThrow();
        return ResponseEntity.ok(new UserDto(user.getId(), user.getFullName(), user.getEmail(), user.getRole(), user.getStudentId()));
    }
}
