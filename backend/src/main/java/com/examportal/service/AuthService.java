package com.examportal.service;

import com.examportal.dto.auth.AuthResponse;
import com.examportal.dto.auth.LoginRequest;
import com.examportal.dto.auth.RegisterRequest;
import com.examportal.model.Role;
import com.examportal.model.User;
import com.examportal.repository.UserRepository;
import com.examportal.security.JwtUtils;
import com.examportal.security.UserDetailsImpl;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder encoder;

    @Autowired
    private JwtUtils jwtUtils;

    public AuthResponse authenticateUser(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(loginRequest.getEmail(), loginRequest.getPassword()));

        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtUtils.generateJwtToken(authentication);

        UserDetailsImpl userDetails = (UserDetailsImpl) authentication.getPrincipal();
        User user = userRepository.findById(userDetails.getId()).orElseThrow();

        return new AuthResponse(
                jwt,
                user.getId(),
                user.getFullName(),
                user.getEmail(),
                user.getRole().name(),
                user.getStudentId()
        );
    }

    public AuthResponse registerUser(RegisterRequest registerRequest) {
        if (userRepository.existsByEmail(registerRequest.getEmail())) {
            throw new IllegalArgumentException("Error: Email is already in use!");
        }

        // Public registration is strictly locked to Student role
        Role role = Role.ROLE_STUDENT;

        User user = new User(
                registerRequest.getFullName(),
                registerRequest.getEmail(),
                encoder.encode(registerRequest.getPassword()),
                role,
                registerRequest.getStudentId()
        );

        userRepository.save(user);

        // Authenticate immediately upon successful registration
        return authenticateUser(new LoginRequest() {{
            setEmail(registerRequest.getEmail());
            setPassword(registerRequest.getPassword());
        }});
    }

    public User createFacultyUser(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Error: Email is already in use!");
        }

        User faculty = new User(
                request.getFullName(),
                request.getEmail(),
                encoder.encode(request.getPassword()),
                Role.ROLE_FACULTY,
                request.getStudentId() != null ? request.getStudentId() : "FAC-" + System.currentTimeMillis() % 1000
        );

        return userRepository.save(faculty);
    }
}
