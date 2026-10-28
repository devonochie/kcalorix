# Kcalorix API

The backend for **Kcalorix**, a calorie and workout tracker. It handles accounts, nutrition tracking, a goal-based exercise library, workout plans and sessions, progress insights, and notifications.

## Features

- **Authentication** with session cookies, email verification, and password reset
- **Profiles and targets** that calculate daily calories and macros from sex, goal, activity level, and body measurements
- **Food tracking** with food search and detail lookup (by FoodData Central id), a daily diary, and meal entries including batch logging
- **Exercise library** seeded from `exercises.json`, filterable by category, muscle group, equipment and difficulty, with recommendations based on the user's goal, level and available equipment
- **Workouts and plans** with predefined workouts (`workouts.json`), custom plans, and automatic plan generation
- **Workout sessions** with warm-up, set logging, finish and cancel, and personal records per exercise
- **Insights** for daily calorie balance, targets, and trends, plus a weight log
- **Notifications** stored in the app, with Web Push support and per-user preferences
- **Data export** as JSON or CSV, and account deletion
- **Roles**: `USER` and `ADMIN`

## Tech stack

- Java and Spring Boot
- Spring Actuator for health checks
- Database: add yours here

## Requirements

- JDK (add your version)
- Maven or Gradle wrapper (included in the repo)
- A running database (add which one)

## Getting started

```bash
# 1. Configure your environment (see the next section)

# 2. Run the app
./mvnw spring-boot:run        # Maven
./gradlew bootRun             # Gradle
```

The API starts at [http://localhost:8080](http://localhost:8080) and every endpoint lives under `/api/v1`.

## Configuration

Set these in `application.properties` (or `application.yml`) or as environment variables. Fill in the real names your project uses:

| Setting | Purpose |
|---|---|
| Database URL, username, password | Database connection |
| Allowed origins | The frontend address, for CORS (credentials must be allowed) |
| Mail settings | Sending verification and password reset emails |
| Food data API key | Food search (FoodData Central) |
| VAPID public and private keys | Web Push notifications |

## Seed data

On startup the app loads the exercise library and workouts from:

- `exercises.json`
- `workouts.json`

Edit these files to add or change exercises. Each exercise has a category, muscle groups, required equipment, and a difficulty level.

## API overview

Base path: `/api/v1`

| Area | Endpoints |
|---|---|
| Auth | `POST /auth/register`, `/auth/login`, `/auth/logout`, `/auth/verify-email`, `/auth/resend-verification`, `/auth/forgot-password`, `/auth/reset-password`, `GET /auth/me` |
| Account | `DELETE /me`, `GET /me/export`, `GET /me/export/csv` |
| Profile | `GET` and `PUT /profile`, `POST` and `GET /weight-logs` |
| Insights | `GET /insights/targets`, `/insights/balance`, `/insights/trends` |
| Food | `GET /foods/search`, `GET /foods/{fdcId}`, `GET /diary`, `POST /meals`, `POST /meals/batch`, `PUT` and `DELETE /meals/{id}` |
| Exercises | `GET /exercises`, `/exercises/meta`, `/exercises/recommended`, `/exercises/{slug}` |
| Workouts | `GET /workouts`, `GET /workouts/{id}` |
| Plans | `GET` and `POST /plans`, `POST /plans/generate`, `GET`, `PUT` and `DELETE /plans/{id}` |
| Sessions | `POST /sessions`, `GET /sessions`, `GET /sessions/active`, `GET /sessions/{id}`, sets, `POST /sessions/{id}/warmup/complete`, `/finish`, `/cancel` |
| Records | `GET /records`, `GET /records/{exerciseId}` |
| Notifications | `GET /notifications`, `/notifications/unread-count`, preferences, read and read-all, push public key, subscribe and unsubscribe |
| System | `GET /ping`, `GET /actuator/health` |

## Domain values

- **Goal:** `LOSE`, `MAINTAIN`, `GAIN`
- **Activity level:** `SEDENTARY`, `LIGHT`, `MODERATE`, `VERY_ACTIVE`, `EXTRA_ACTIVE`
- **Meal type:** `BREAKFAST`, `LUNCH`, `DINNER`, `SNACK`
- **Difficulty:** `BEGINNER`, `INTERMEDIATE`, `ADVANCED`
- **Equipment:** `BODYWEIGHT`, `DUMBBELL`, `BARBELL`, `KETTLEBELL`, `MACHINE`, `CABLE`, `BAND`, `OTHER`
- **Exercise category:** `STRENGTH`, `CARDIO`, `FLEXIBILITY`, `WARMUP`

## Testing

```bash
./mvnw test        # Maven
./gradlew test     # Gradle
```

## Frontend

The web app lives in the `web` folder. See its README for setup.

## License

Add your license here.
