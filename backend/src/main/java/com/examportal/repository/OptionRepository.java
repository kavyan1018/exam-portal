package com.examportal.repository;

import com.examportal.model.Option;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface OptionRepository extends JpaRepository<Option, Long> {
    List<Option> findByQuestionIdOrderByOptionOrderAsc(Long questionId);
}
