package com.hospital.queue.service;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class hello {

    @GetMapping("/hello")
    public String sayHello() {
        return "Hello, welcome to the Hospital Queue Management System!";
    }
}
