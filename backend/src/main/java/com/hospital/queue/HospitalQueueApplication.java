package com.hospital.queue;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class HospitalQueueApplication {

	public static void main(String[] args) {
		SpringApplication.run(HospitalQueueApplication.class, args);
	}
}