# Phase 16: College Deployment & User Guides

**Project Title**: Self-Learning AI Interview Preparation Platform  
**Target Environment**: College Local Network / Department Linux Server / Cloud VM

---

## 1. Production Deployment Checklist

- [x] **Database Engine**: Migrated from SQLite local testing to PostgreSQL 15+ compatible SQL scripts (`backend/database/schema.sql`).
- [x] **Secrets Management**: Environment variables configured in `.env` (`GEMINI_API_KEY`, `DB_HOST`, `DB_USER`, `DB_PASSWORD`, `SECRET_KEY`).
- [x] **Reverse Proxy & SSL**: Nginx configured with Let's Encrypt SSL/TLS reverse proxying port 443 to FastAPI port 8000 and Vite static build.
- [x] **Automated Database Backup**: Daily automated `pg_dump` cron job scheduled at 02:00 AM.
- [x] **CORS Lockdown**: Restricted allowed origins to college domain (`*.college.edu`).
- [x] **System Health Endpoint**: Real-time heartbeat endpoint available at `/api/health`.

---

## 2. Student User Guide (1-Page Reference)

### How to Practice with Your AI Interview Coach

```
  [1. Login] ──> [2. Set Role] ──> [3. Mic Consent] ──> [4. Practice & Evolve]
```

1. **Sign In**: Navigate to the platform portal and log in with your college roll number or registered email.
2. **Select Target Role**: Choose **Software Developer** (or customized domain tracks).
3. **Grant Microphone Consent**: Allow browser microphone permissions so acoustic signals (WPM, pause cadence, filler words) can be analyzed.
4. **Answer Aloud**:
   * Click **Start Recording** and answer clearly into your microphone for 60 to 120 seconds.
   * Maintain a natural conversational pace (~130 WPM).
   * For behavioral or project questions, structure your thoughts using **STAR** (*Situation, Task, Action, Result*).
5. **Review Instant Feedback**:
   * Inspect your 8-dimension rubric scorecard.
   * Read the targeted strengths and actionable tips.
6. **Follow the Adaptive Practice Route ("Google Maps")**:
   * The platform detects your weakest dimension and automatically re-routes your next question to target that weakness.
7. **Inspect Your Answer Evolution**:
   * Visit **Skill Evolution** in the top navigation bar to watch your score progression deltas ($\Delta$) and view before-and-after transcript comparisons.

---

## 3. Faculty & Placement Officer Guide (1-Page Reference)

### Institutional Cohort Analytics Manual

1. **Accessing Cohort Analytics**:
   * Log in with institutional faculty credentials (e.g. `hod_cse@college.edu`).
   * Click **Faculty Analytics** in the top navigation bar.
2. **Monitoring Departmental Readiness**:
   * The **Readiness Distribution** shows the percentage of final-year students currently meeting campus placement benchmark thresholds ($>70\%$).
3. **Targeting Curricular Interventions**:
   * The **Priority Departmental Training Interventions** alert box highlights the lowest cohort-wide competencies across the batch.
   * *Example*: If *Evidence (STAR)* is flagged cohort-wide, the placement cell schedules resume and project presentation workshops.
4. **Data Privacy & Ethical Governance**:
   * Faculty dashboards display **strictly anonymized aggregates**.
   * Individual candidate performance, private audio recordings, and raw transcripts remain confidential to foster a psychological safety environment for low-stakes practice.
