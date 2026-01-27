package com.hospital.queue.service;

import com.hospital.queue.entity.Department;
import com.hospital.queue.repository.DepartmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;

    public List<Department> getAllDepartments() {
        return departmentRepository.findAll();
    }

    public Department getDepartmentById(Long id) {
        return departmentRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Department not found"));
    }

    public List<Department> getDepartmentsByHospital(Long hospitalId) {
        return departmentRepository.findByHospitalId(hospitalId);
    }

    public Department createDepartment(Department department) {
        return departmentRepository.save(department);
    }
}