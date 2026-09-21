# 🎙️ Self-Learning AI Interview Platform
> *An Adaptive AI Mock Interview Coach with Real-World Drive Feedback, Anti-Cheat Proctoring, and Dynamic Skill Remediation.*

---

## 🌟 Key System Capabilities

1. **🧠 Self-Learning Adaptive Routing ("Google Maps" Model)**:
   - Evaluates spoken student answers across **8 rubric dimensions**: *Technical Correctness, Relevance, Structure, Completeness, Evidence, Conciseness, Clarity/Fluency, Response Timing*.
   - Updates student skill profile dynamically using **EWMA (Exponentially Weighted Moving Average)**.
   - Diagnoses the candidate's 2 weakest skills and re-routes upcoming questions to remediate those exact bottlenecks.

2. **🏢 11 Specialized Career Tracks**:
   - **Software Developer** (SDE-1 / Core SWE)
   - **Python Developer** (GIL, Memory, Asyncio, Decorators, Generators)
   - **Java Developer** (JVM Architecture, GC, HashMap, Spring Boot, Concurrency)
   - **Full Stack Developer** (MERN / Spring Boot + React)
   - **Frontend Engineer** (React Internals, DOM, Closures, Web Vitals)
   - **Backend Engineer** (Distributed Systems, Locking, Caching, Saga)
   - **Data Engineer & Analytics** (Star/Snowflake Schemas, Window Functions, Spark Shuffle)
   - **AI / Machine Learning Engineer** (Transformers, Attention, Precision/Recall)
   - **Cloud & DevOps Engineer** (Docker, Kubernetes, Blue-Green, CI/CD)
   - **Cybersecurity Analyst** (XSS, CSP, TLS 1.3 Handshake, OWASP)
   - **QA Automation & SDET** (Page Object Model, Test Automation Architecture)

3. **🛡️ Proctored Realistic Interview Room**:
   - **AI Speaks Questions Aloud**: Browser Speech Synthesis (TTS) with animated voice waves and question replay.
   - **Full-Screen Enforcement**: Locks candidate into full-screen mode to simulate high-stakes placement exams.
   - **Anti-Cheat Tab Proctoring**: Detects tab switches / window unfocus, pauses recording, and issues strike warnings.
   - **Live Camera & Audio Waveform**: Continuous mic speech-to-text, real-time WPM, and filler-word counter.
   - **Post-Evaluation Model Answers**: Benchmark recruiter answers and alumni tips are unlocked strictly after evaluation.

4. **⚡ Real-World Campus Drive Feedback & Live Priority Weightage**:
   - Students who attended real placement drives (TCS, Google, Amazon) can report questions or upvote them.
   - Dynamic weightage formula:
     Live Priority = 1.0 + (Drive Reports * 1.5) + (Utility * 0.4)
   - Higher priority questions automatically get routed to other students preparing for that company.

---

## 🚀 Quick Deployment Guide

### Deploy Online (Render.com)
1. In **[render.com](https://render.com/)**, click **New +** → **Web Service** → Select your GitHub repository.
2. Render auto-configures from `render.yaml`:
   - **Runtime**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
3. Click **Deploy**. Your platform is live in ~30 seconds!

---

## 💻 Run Locally

```bash
# 1. Install dependencies
pip install -r requirements.txt

# 2. Start the unified platform (serves both API & Frontend)
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
Open **`http://127.0.0.1:8000`** in your browser.

---

## 🔑 Demo Login Accounts

| Role | Username | Password | Purpose |
|---|---|---|---|
| **Student** | `rahul_sde` | `pass123` | Full interview studio, AI interviewer, radar charts, and word-diff evolution |
| **Faculty / HOD** | `faculty_hod` | `admin123` | Batch-level skill analytics, cohort weakness heatmaps, and placement insights |

---

## 📁 Clean Repository Structure

```
ai-interview-platform/
├── backend/
│   ├── main.py              # Unified FastAPI server & React SPA mount
│   ├── database.py          # SQLite schema & database connection
│   ├── auth.py              # User authentication & roles
│   ├── interview_platform.db # Pre-seeded SQLite database
│   └── services/            # Adaptive routing, 11-role catalogs, and rubric scoring
├── frontend/
│   ├── dist/                # Pre-compiled production web app
│   ├── src/                 # React UI components
│   └── package.json         # Frontend dependencies
├── Dockerfile               # Container build configuration
├── render.yaml              # Render cloud deployment specification
├── requirements.txt         # Production Python dependencies
├── seed_roles.py            # Question bank & roles seeder
└── README.md
```
