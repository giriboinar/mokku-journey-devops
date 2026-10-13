# ---------------------------------------------------------------------------
# Raja's Mokku Journey - optional Java companion service (DevOps demo module)
# Multi-stage build: Maven build -> slim Temurin JRE runtime (non-root)
# ---------------------------------------------------------------------------

# ---- Build stage -----------------------------------------------------------
FROM maven:3.9-eclipse-temurin-17 AS build
WORKDIR /app

# Copy pom first to leverage Docker layer caching for dependencies
COPY pom.xml .
RUN mvn -B -q dependency:go-offline

COPY src ./src
RUN mvn -B clean package

# ---- Runtime stage ---------------------------------------------------------
FROM eclipse-temurin:17-jre

# curl is needed for the HEALTHCHECK; keep the layer small and clean up
RUN apt-get update \
    && apt-get install -y --no-install-recommends curl \
    && rm -rf /var/lib/apt/lists/*

# Run as a non-root user
RUN groupadd -r appuser && useradd -r -g appuser appuser

WORKDIR /app
COPY --from=build /app/target/*.jar app.jar
RUN chown appuser:appuser /app/app.jar

USER appuser
EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=3s --start-period=20s --retries=3 \
  CMD curl -fsS http://localhost:8080/api/health | grep -q '"status":"ok"' || exit 1

ENTRYPOINT ["java", "-jar", "app.jar"]
