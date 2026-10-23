package com.examportal.repository;

import com.examportal.model.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRecordRepository extends JpaRepository<AttendanceRecord, Long> {

    List<AttendanceRecord> findByBatchNameAndAttendanceDateAndSessionLanguage(String batchName, LocalDate attendanceDate, String sessionLanguage);

    List<AttendanceRecord> findByBatchNameOrderByAttendanceDateDescMarkedAtDesc(String batchName);

    List<AttendanceRecord> findAllByOrderByAttendanceDateDescMarkedAtDesc();

    @Query("SELECT DISTINCT a.batchName FROM AttendanceRecord a WHERE a.batchName IS NOT NULL AND a.batchName <> ''")
    List<String> findDistinctBatchNames();

    @Query("SELECT DISTINCT a.sessionLanguage FROM AttendanceRecord a WHERE a.sessionLanguage IS NOT NULL AND a.sessionLanguage <> ''")
    List<String> findDistinctSessionLanguages();

    @Modifying
    @Transactional
    @Query("DELETE FROM AttendanceRecord a WHERE a.batchName = :batchName AND a.attendanceDate = :attendanceDate AND a.sessionLanguage = :sessionLanguage")
    void deleteByBatchNameAndAttendanceDateAndSessionLanguage(
            @Param("batchName") String batchName,
            @Param("attendanceDate") LocalDate attendanceDate,
            @Param("sessionLanguage") String sessionLanguage
    );
}
