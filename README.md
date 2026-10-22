# Secure MCQ Online Exam Portal

An enterprise-grade, anti-cheating, web-based examination platform developed with **Spring Boot 4.x / Java 21**, **React 18 (Vite)**, and **MySQL**, designed to run completely on **100% Free Cloud Hosting** (Render / Vercel / TiDB Cloud).

---

## 🚀 Key Features

### 1. Student Exam Environment & Anti-Cheating Lockdown
- **Enforced Fullscreen Mode**: Exam immediately prompts for and maintains full-screen. Exiting full-screen is logged as a violation.
- **Tab & Window Focus Tracking**: Page Visibility and Blur events capture every tab switch, window minimization, or app switch.
- **Violation Thresholds & Disqualification**: Configurable maximum violations allowed (e.g., 3). Exceeding the threshold automatically terminates and disqualifies the attempt.
- **Periodic Webcam Proctoring**: Automatically takes periodic snapshots and uploads them upon violations for post-exam faculty audits.
- **Shortcut & Context Menu Blocking**: Suppresses right-clicks, copy/paste, text selection, and keys like `F12`, `Ctrl+Shift+I`, `Alt+Tab`, and `Esc`.
- **Server-Authoritative Timer & Auto-Save**: Countdown runs based on server timestamps; responses persist to the server every few seconds.

### 2. Faculty & Admin Management Console
- **Exam Authoring**: Set duration, passing marks, negative marking penalty, randomization toggles, and violation limits.
- **Question Bank Management**: Add MCQs with custom choices, mark correct options, and include answer explanations.
- **Real-Time Live Proctor Monitor**: Auto-refreshing dashboard showing active students, countdowns, answered questions, violation counters, and live status.
- **Proctor Incident Inspector**: Review timestamps and captured webcam photos for flagged students.
- **One-Click CSV Grade Sheet Export**: Download full results including student roll numbers, scores, pass/fail status, and breakdown.

---

## 👥 Default Demo Credentials

When the backend starts up for the first time, it automatically seeds these accounts and an active demo exam:

| Role | Email | Password | Details |
|---|---|---|---|
| **Student** | `student@college.edu` | `Student@123` | Roll No: `CS-2026-042` |
| **Faculty** | `faculty@college.edu` | `Faculty@123` | Can create & monitor exams |
| **Admin** | `admin@college.edu` | `Admin@123` | Full administrative control |

*(You can also use the **Quick Demo Login** buttons on the login screen or register new students!)*

---

## 💻 Running Locally

### Step 1: Start the Spring Boot Backend
The backend runs out of the box using an embedded persistent database (no local MySQL installation required for local testing).

```bash
cd backend
./mvnw.cmd spring-boot:run     # On Windows (PowerShell / CMD)
# or ./mvnw spring-boot:run     # On macOS / Linux
```
*Backend runs at `http://localhost:8080` (Health check: `http://localhost:8080/api/v1/health`)*

### Step 2: Start the React Frontend
In a separate terminal:

```bash
cd frontend
npm install
npm run dev
```
*Frontend opens at `http://localhost:5173` with automatic API proxying.*

---

## ☁️ 100% Free Cloud Deployment Guide

You can deploy this portal so students can log in from anywhere without paying anything:

### 1. Free Cloud MySQL Database (TiDB Cloud Serverless)
1. Sign up for free at [tidbcloud.com](https://tidbcloud.com).
2. Create a free **Serverless Cluster** (5 GB free storage forever).
3. Copy your JDBC connection string, username, and password.

### 2. Free Backend Web Service (Render.com)
1. Push your repository to GitHub.
2. Sign up at [render.com](https://render.com) and click **New + > Web Service**.
3. Select your GitHub repository.
4. Set:
   - **Root Directory**: `backend`
   - **Environment**: `Docker`
   - **Plan**: `Free`
5. In **Environment Variables**, add:
   - `SPRING_PROFILES_ACTIVE`: `mysql`
   - `SPRING_DATASOURCE_URL`: `jdbc:mysql://<tidb-host>:4000/<dbname>?sslMode=VERIFY_IDENTITY`
   - `SPRING_DATASOURCE_USERNAME`: `<your-tidb-user>`
   - `SPRING_DATASOURCE_PASSWORD`: `<your-tidb-password>`
6. Deploy! Render will give you a free HTTPS URL: `https://your-backend.onrender.com`.

### 3. Free Frontend Static Site (Vercel or Render)
1. Go to [vercel.com](https://vercel.com) and import the `frontend` folder from your repo.
2. Under **Environment Variables**, add:
   - `VITE_API_URL`: `https://your-backend.onrender.com`
3. Click **Deploy**. Vercel will give you a public URL (e.g. `https://your-exam-portal.vercel.app`) that students can access from any phone or computer!

---

## 📁 Project Structure

```
exam-portal/
├── backend/
│   ├── Dockerfile                           # Tuned for 512MB RAM free instances
│   ├── pom.xml                              # Spring Boot 4.1.1 + Security + JPA + MySQL + JJWT
│   └── src/main/java/com/examportal/
│       ├── config/DataInitializer.java      # Demo accounts & sample active exam seeder
│       ├── controller/                      # REST endpoints (Auth, Student, Faculty, Health)
│       ├── dto/                             # Request/Response payloads
│       ├── model/                           # JPA Entities (Exam, Question, Option, Attempt, Logs)
│       ├── repository/                      # Spring Data JPA Repositories
│       ├── security/                        # JWT authentication & role filters
│       └── service/                         # Exam taking engine, timer & proctoring service
├── frontend/
│   ├── src/
│   │   ├── api/client.js                    # Axios instance with JWT interceptor
│   │   ├── components/                      # Navbar, Proctoring Inspector Modal
│   │   ├── context/AuthContext.jsx          # User session & login state
│   │   ├── pages/
│   │   │   ├── Login.jsx                    # Sign-in with quick-fill demo buttons
│   │   │   ├── Register.jsx                 # Student self-registration
│   │   │   ├── StudentDashboard.jsx         # Active assessments & instruction modal
│   │   │   ├── ExamTakingView.jsx           # Proctored fullscreen exam engine
│   │   │   ├── ExamResultView.jsx           # Student scorecard & confetti
│   │   │   ├── FacultyDashboard.jsx         # Exam management overview
│   │   │   ├── CreateExamView.jsx           # Exam rules & security configuration
│   │   │   ├── ManageQuestionsView.jsx      # MCQ question authoring
│   │   │   ├── LiveMonitorView.jsx          # Live student session monitoring
│   │   │   └── ExamResultsFacultyView.jsx   # Marksheet & CSV export
│   │   ├── App.jsx                          # Route definitions & security guards
│   │   └── index.css                        # Modern responsive design system
│   └── vercel.json                          # Free Vercel SPA routing
└── render.yaml                              # 1-Click Render blueprint
```
