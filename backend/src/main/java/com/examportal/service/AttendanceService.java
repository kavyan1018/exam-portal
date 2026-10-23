package com.examportal.service;

import com.examportal.dto.attendance.*;
import com.examportal.model.AttendanceRecord;
import com.examportal.model.Role;
import com.examportal.model.User;
import com.examportal.repository.AttendanceRecordRepository;
import com.examportal.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class AttendanceService {

    @Autowired
    private AttendanceRecordRepository attendanceRecordRepository;

    @Autowired
    private UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<String> getBatches() {
        Set<String> batches = new TreeSet<>(String.CASE_INSENSITIVE_ORDER);

        // From student accounts
        List<User> students = userRepository.findByRole(Role.ROLE_STUDENT);
        for (User s : students) {
            if (s.getStudentId() != null && !s.getStudentId().isBlank()) {
                batches.add(s.getStudentId().trim());
            }
        }

        // From previous attendance records
        List<String> recordedBatches = attendanceRecordRepository.findDistinctBatchNames();
        if (recordedBatches != null) {
            for (String b : recordedBatches) {
                if (b != null && !b.isBlank()) {
                    batches.add(b.trim());
                }
            }
        }

        return new ArrayList<>(batches);
    }

    @Transactional(readOnly = true)
    public List<AttendanceRecordDto> getAttendanceSheet(String batchName, LocalDate date, String sessionLanguage) {
        List<AttendanceRecord> existing = attendanceRecordRepository.findByBatchNameAndAttendanceDateAndSessionLanguage(batchName, date, sessionLanguage);
        if (!existing.isEmpty()) {
            return existing.stream().map(this::toDto).collect(Collectors.toList());
        }

        // Initialize sheet from enrolled students in the batch
        List<User> students = userRepository.findByRole(Role.ROLE_STUDENT).stream()
                .filter(u -> batchName.equalsIgnoreCase(u.getStudentId()))
                .sorted(Comparator.comparing(User::getFullName, String.CASE_INSENSITIVE_ORDER))
                .collect(Collectors.toList());

        List<AttendanceRecordDto> sheet = new ArrayList<>();
        for (User s : students) {
            sheet.add(new AttendanceRecordDto(
                    null,
                    batchName,
                    date,
                    sessionLanguage,
                    "",
                    s.getFullName(),
                    s.getEmail(),
                    "PRESENT",
                    "",
                    null,
                    null
            ));
        }

        return sheet;
    }

    @Transactional
    public List<AttendanceRecordDto> saveAttendance(AttendanceSaveRequest request, String markedBy) {
        // Clear previous entries for this exact session
        attendanceRecordRepository.deleteByBatchNameAndAttendanceDateAndSessionLanguage(
                request.getBatchName(),
                request.getAttendanceDate(),
                request.getSessionLanguage()
        );

        List<AttendanceRecord> toSave = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (AttendanceSaveRequest.StudentStatusItem item : request.getRecords()) {
            if (item.getStudentName() == null || item.getStudentName().isBlank()) continue;
            AttendanceRecord record = new AttendanceRecord(
                    request.getBatchName(),
                    request.getAttendanceDate(),
                    request.getSessionLanguage(),
                    request.getSessionTopic(),
                    item.getStudentName().trim(),
                    item.getStudentEmail() != null ? item.getStudentEmail().trim() : null,
                    item.getStatus() != null ? item.getStatus() : "PRESENT",
                    item.getRemarks(),
                    markedBy
            );
            record.setMarkedAt(now);
            toSave.add(record);
        }

        List<AttendanceRecord> saved = attendanceRecordRepository.saveAll(toSave);
        return saved.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional
    public List<AttendanceRecordDto> quickImportAttendance(AttendanceQuickImportRequest request, String markedBy) {
        // Parse raw text of names
        List<String> rawNames = Arrays.stream(request.getRawText().split("[\\r\\n,]+"))
                .map(String::trim)
                .map(line -> line.replaceAll("^[0-9]+[.)\\-:]\\s*", "")) // strip "1.", "1)", "1-"
                .map(line -> line.replaceAll("^[•*\\-]+\\s*", ""))       // strip bullets
                .map(String::trim)
                .filter(name -> !name.isEmpty())
                .collect(Collectors.toList());

        // Find enrolled students in this batch
        List<User> enrolledStudents = userRepository.findByRole(Role.ROLE_STUDENT).stream()
                .filter(u -> request.getBatchName().equalsIgnoreCase(u.getStudentId()))
                .collect(Collectors.toList());

        Set<String> matchedRawNames = new HashSet<>();
        List<AttendanceRecord> toSave = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        for (User student : enrolledStudents) {
            String studentNameLower = student.getFullName().toLowerCase();
            boolean isPresent = false;

            for (String raw : rawNames) {
                String rawLower = raw.toLowerCase();
                if (studentNameLower.contains(rawLower) || rawLower.contains(studentNameLower) ||
                    studentNameLower.equalsIgnoreCase(rawLower)) {
                    isPresent = true;
                    matchedRawNames.add(raw);
                    break;
                }
            }

            String status = isPresent ? "PRESENT" : (request.isMarkOthersAbsent() ? "ABSENT" : "PRESENT");
            AttendanceRecord rec = new AttendanceRecord(
                    request.getBatchName(),
                    request.getAttendanceDate(),
                    request.getSessionLanguage(),
                    request.getSessionTopic(),
                    student.getFullName(),
                    student.getEmail(),
                    status,
                    isPresent ? "Imported via names list" : "Marked absent (not in list)",
                    markedBy
            );
            rec.setMarkedAt(now);
            toSave.add(rec);
        }

        // Add any names that weren't matched to existing enrolled users
        for (String raw : rawNames) {
            if (!matchedRawNames.contains(raw)) {
                AttendanceRecord rec = new AttendanceRecord(
                        request.getBatchName(),
                        request.getAttendanceDate(),
                        request.getSessionLanguage(),
                        request.getSessionTopic(),
                        raw,
                        null,
                        "PRESENT",
                        "Added directly from imported attendance list",
                        markedBy
                );
                rec.setMarkedAt(now);
                toSave.add(rec);
            }
        }

        // Remove old and persist new
        attendanceRecordRepository.deleteByBatchNameAndAttendanceDateAndSessionLanguage(
                request.getBatchName(),
                request.getAttendanceDate(),
                request.getSessionLanguage()
        );

        List<AttendanceRecord> saved = attendanceRecordRepository.saveAll(toSave);
        return saved.stream().map(this::toDto).collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AttendanceSessionSummaryDto> getHistory(String batchName) {
        List<AttendanceRecord> allRecords;
        if (batchName != null && !batchName.isBlank()) {
            allRecords = attendanceRecordRepository.findByBatchNameOrderByAttendanceDateDescMarkedAtDesc(batchName);
        } else {
            allRecords = attendanceRecordRepository.findAllByOrderByAttendanceDateDescMarkedAtDesc();
        }

        // Group by batchName + date + sessionLanguage
        Map<String, List<AttendanceRecord>> grouped = allRecords.stream()
                .collect(Collectors.groupingBy(r -> r.getBatchName() + "___" + r.getAttendanceDate() + "___" + r.getSessionLanguage(),
                        LinkedHashMap::new, Collectors.toList()));

        List<AttendanceSessionSummaryDto> summaries = new ArrayList<>();
        for (Map.Entry<String, List<AttendanceRecord>> entry : grouped.entrySet()) {
            List<AttendanceRecord> list = entry.getValue();
            if (list.isEmpty()) continue;
            AttendanceRecord first = list.get(0);

            int total = list.size();
            int present = (int) list.stream().filter(r -> "PRESENT".equalsIgnoreCase(r.getStatus())).count();
            int absent = (int) list.stream().filter(r -> "ABSENT".equalsIgnoreCase(r.getStatus())).count();
            int late = (int) list.stream().filter(r -> "LATE".equalsIgnoreCase(r.getStatus())).count();

            summaries.add(new AttendanceSessionSummaryDto(
                    first.getBatchName(),
                    first.getAttendanceDate(),
                    first.getSessionLanguage(),
                    first.getSessionTopic(),
                    total,
                    present,
                    absent,
                    late,
                    first.getMarkedBy(),
                    first.getMarkedAt()
            ));
        }

        return summaries;
    }

    @Transactional
    public void deleteSession(String batchName, LocalDate date, String sessionLanguage) {
        attendanceRecordRepository.deleteByBatchNameAndAttendanceDateAndSessionLanguage(batchName, date, sessionLanguage);
    }

    private AttendanceRecordDto toDto(AttendanceRecord r) {
        return new AttendanceRecordDto(
                r.getId(),
                r.getBatchName(),
                r.getAttendanceDate(),
                r.getSessionLanguage(),
                r.getSessionTopic(),
                r.getStudentName(),
                r.getStudentEmail(),
                r.getStatus(),
                r.getRemarks(),
                r.getMarkedBy(),
                r.getMarkedAt()
        );
    }
}
