# Multi-stage build for lightweight, memory-tuned deployment on free cloud tiers (Render / Koyeb)
FROM maven:3.9.9-eclipse-temurin-21-alpine AS build
WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline -B
COPY src ./src
RUN mvn clean package -DskipTests

FROM eclipse-temurin:21-jre-alpine
WORKDIR /app
COPY --from=build /app/target/*.jar app.jar

# Tuning for 512MB RAM free instances: SerialGC and 350MB heap cap
ENV JAVA_OPTS="-XX:+UseSerialGC -Xss512k -XX:MaxRAM=450m -Xmx350m -Djava.security.egd=file:/dev/./urandom"
ENV SPRING_PROFILES_ACTIVE="mysql"

EXPOSE 8080
ENTRYPOINT ["sh", "-c", "java $JAVA_OPTS -jar app.jar"]
