# 1) Build React
FROM --platform=$BUILDPLATFORM node:24-alpine AS frontend
WORKDIR /app
COPY frontend/package.json frontend/package-lock.json ./
RUN npm ci
COPY frontend/ ./
RUN npm run build

# 2) Build the Spring jar with React inside
FROM --platform=$BUILDPLATFORM maven:3.9-eclipse-temurin-25 AS backend
WORKDIR /app
COPY backend/pom.xml ./
RUN mvn -B -q dependency:go-offline
COPY backend/src ./src
COPY --from=frontend /app/dist ./src/main/resources/static
RUN mvn -B -q package -DskipTests

# 3) Small runtime image
FROM eclipse-temurin:25-jre
LABEL org.opencontainers.image.source=https://github.com/dezsoab/Chefie
WORKDIR /app
COPY --from=backend /app/target/*.jar app.jar
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]