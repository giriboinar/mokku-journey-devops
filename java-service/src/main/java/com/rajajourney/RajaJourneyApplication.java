package com.rajajourney;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Optional companion microservice for "Raja's Mokku Journey".
 *
 * This module exists purely as a DevOps demonstration artifact: a small
 * Spring Boot service with a health-check endpoint, unit tests, a
 * multi-stage Dockerfile, and a Jenkins pipeline stage. The core
 * application is the Python backend; this service is optional.
 */
@SpringBootApplication
public class RajaJourneyApplication {

    public static void main(String[] args) {
        SpringApplication.run(RajaJourneyApplication.class, args);
    }
}
