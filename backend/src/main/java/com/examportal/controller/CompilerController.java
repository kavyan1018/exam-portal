package com.examportal.controller;

import com.examportal.dto.compiler.CompilerExecutionRequest;
import com.examportal.dto.compiler.CompilerExecutionResponse;
import com.examportal.service.CompilerService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/compiler")
@PreAuthorize("isAuthenticated()")
public class CompilerController {

    @Autowired
    private CompilerService compilerService;

    @PostMapping("/execute")
    public ResponseEntity<CompilerExecutionResponse> execute(@Valid @RequestBody CompilerExecutionRequest request) {
        return ResponseEntity.ok(compilerService.execute(request));
    }
}
