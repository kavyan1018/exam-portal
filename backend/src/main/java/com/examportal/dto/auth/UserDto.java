package com.examportal.dto.auth;

import com.examportal.model.Role;

public class UserDto {
    private Long id;
    private String fullName;
    private String email;
    private Role role;
    private String studentId;

    public UserDto() {}

    public UserDto(Long id, String fullName, String email, Role role, String studentId) {
        this.id = id;
        this.fullName = fullName;
        this.email = email;
        this.role = role;
        this.studentId = studentId;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getFullName() { return fullName; }
    public void setFullName(String fullName) { this.fullName = fullName; }

    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public Role getRole() { return role; }
    public void setRole(Role role) { this.role = role; }

    public String getStudentId() { return studentId; }
    public void setStudentId(String studentId) { this.studentId = studentId; }
}
