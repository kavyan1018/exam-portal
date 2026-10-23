package com.examportal.controller;

import com.examportal.dto.attendance.*;
import com.examportal.security.UserDetailsImpl;
import com.examportal.service.AttendanceService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/attendance")
@PreAuthorize("hasAnyAuthority('ROLE_FACULTY', 'ROLE_ADMIN')")
public class AttendanceController {

    @Autowired
    private AttendanceService attendanceService;

    @GetMapping("/batches")
    public ResponseEntity<List<String>> getBatches() {
        return ResponseEntity.ok(attendanceService.getBatches());
    }

    @GetMapping("/sheet")
    public ResponseEntity<List<AttendanceRecordDto>> getAttendanceSheet(
            @RequestParam String batchName,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(defaultValue = "CSS") String sessionLanguage
    ) {
        return ResponseEntity.ok(attendanceService.getAttendanceSheet(batchName, date, sessionLanguage));
    }

    @PostMapping("/save")
    public ResponseEntity<List<AttendanceRecordDto>> saveAttendance(
            @Valid @RequestBody AttendanceSaveRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        String markedBy = userDetails != null ? userDetails.getFullName() : "Admin";
        return ResponseEntity.ok(attendanceService.saveAttendance(request, markedBy));
    }

    @PostMapping("/quick-import")
    public ResponseEntity<Map<String, Object>> quickImportAttendance(
            @Valid @RequestBody AttendanceQuickImportRequest request,
            @AuthenticationPrincipal UserDetailsImpl userDetails
    ) {
        String markedBy = userDetails != null ? userDetails.getFullName() : "Admin";
        List<AttendanceRecordDto> saved = attendanceService.quickImportAttendance(request, markedBy);
        long presentCount = saved.stream().filter(r -> "PRESENT".equalsIgnoreCase(r.getStatus())).count();
        long absentCount = saved.stream().filter(r -> "ABSENT".equalsIgnoreCase(r.getStatus())).count();

        return ResponseEntity.ok(Map.of(
                "message", "Successfully recorded attendance for " + saved.size() + " students (" + presentCount + " Present, " + absentCount + " Absent).",
                "totalCount", saved.size(),
                "presentCount", presentCount,
                "absentCount", absentCount,
                "records", saved
        ));
    }

    @GetMapping("/history")
    public ResponseEntity<List<AttendanceSessionSummaryDto>> getHistory(
            @RequestParam(required = false) String batchName
    ) {
        return ResponseEntity.ok(attendanceService.getHistory(batchName));
    }

    @DeleteMapping("/session")
    public ResponseEntity<Map<String, String>> deleteSession(
            @RequestParam String batchName,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam String sessionLanguage
    ) {
        attendanceService.deleteSession(batchName, date, sessionLanguage);
        return ResponseEntity.ok(Map.of("message", "Attendance session deleted successfully"));
    }
}
