package com.rajajourney;

import java.util.Map;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Health-check endpoint for container orchestrators, load balancers,
 * and CI/CD smoke tests.
 */
@RestController
public class HealthController {

    @GetMapping("/api/health")
    public Map<String, String> health() {
        return Map.of(
            "status", "ok",
            "service", "raja-journey-java",
            "version", "1.0.0"
        );
    }
}
