# raja-journey-java — Optional Companion Microservice

> **Optional DevOps demonstration module.** The core "Raja's Mokku Journey"
> application is served by the Python backend (`backend/`). This small Spring
> Boot service exists only to demonstrate a complete Java/Maven CI/CD slice:
> build, unit tests, container image, vulnerability scan, and deployment —
> without adding complexity to the Python application.

## What it does

A single REST endpoint used as a health check by load balancers, Kubernetes
probes, and pipeline smoke tests:

```
GET /api/health
```

Response (HTTP 200, `application/json`):

```json
{
  "status": "ok",
  "service": "raja-journey-java",
  "version": "1.0.0"
}
```

## Tech stack

- Java 17 (LTS) — `maven.compiler.release=17`
- Spring Boot 3.2.x (`spring-boot-starter-web`, `spring-boot-starter-test`)
- JUnit 5 + MockMvc test for `/api/health`
- Executable JAR via `spring-boot-maven-plugin`

## Build and test (requires JDK 17 + Maven 3.9+)

```bash
cd java-service

# Run unit tests and build the executable JAR
mvn clean package

# Run the service locally
java -jar target/raja-journey-java-1.0.0.jar

# Verify the health endpoint
curl http://localhost:8080/api/health
```

## Docker

Multi-stage build: `maven:3.9-eclipse-temurin-17` compiles the JAR, and the
runtime image is the slim `eclipse-temurin:17-jre` running as a non-root
user (`appuser`), with a `HEALTHCHECK` against `/api/health`.

```bash
cd java-service

# Build the image (tag with the Git SHA for traceability)
docker build -t raja-journey-java:$(git rev-parse --short HEAD) .

# Run it
docker run --rm -p 8080:8080 raja-journey-java:$(git rev-parse --short HEAD)

# Health check
curl http://localhost:8080/api/health
```

## Jenkins pipeline

The module is exercised by the optional Java stage in the root `Jenkinsfile`
(`mvn clean package` + JUnit report + Docker build + image scan). It is
skipped entirely when the `BUILD_JAVA_SERVICE` parameter is false, so the
Python application pipeline stays lean.

## Notes

- No secrets, credentials, or environment-specific values are stored in this
  module or baked into its image.
- Port `8080` is the Spring Boot default; override with `SERVER_PORT` if the
  deployment needs a different port.
