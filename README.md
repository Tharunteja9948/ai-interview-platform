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

## 🚀 1-Click Cloud Deployment Options

### Option 1: Render.com (Recommended — 100% Free Web Service)
1. Push this repository to **GitHub**.
2. Go to **[render.com](https://render.com/)** → Click **New** → **Web Service** → Connect your GitHub repository.
3. Render will auto-detect `render.yaml` or set:
   - **Runtime**: `Python 3`
   - **Build Command**: `npm --prefix frontend install && npm --prefix frontend run build && pip install -r requirements.txt && python seed_roles.py`
   - **Start Command**: `python -m uvicorn backend.main:app --host 0.0.0.0 --port $PORT`
4. Click **Deploy**. Your app will be live at `https://your-app-name.onrender.com`.

### Option 2: Docker Containerization
```bash
# Build the unified production image
docker build -t ai-interview-platform .

# Run the container
docker run -p 8000:8000 ai-interview-platform
```
Open `http://localhost:8000` in your browser.

### Option 3: Local Production Server
```bash
# 1. Build the React frontend
cd frontend
npm install
npm run build
cd ..

# 2. Install backend dependencies
pip install -r requirements.txt

# 3. Seed questions & roles
python seed_roles.py

# 4. Start the unified production server
python -m uvicorn backend.main:app --host 127.0.0.1 --port 8000
```
Open `http://127.0.0.1:8000`.

---

## 🔑 Demo Login Accounts

| Role | Username | Password | Purpose |
|---|---|---|---|
| **Student** | `rahul_sde` | `pass123` | Full student experience, mock interviews, radar charts, evolution word diff |
| **Faculty / HOD** | `faculty_hod` | `admin123` | Batch-level analytics, cohort weakness heatmaps, accreditation & placement insights |

---

## 📁 Repository Structure
```
ai-interview-platform/
├── backend/
│   ├── main.py              # Unified FastAPI server & SPA static mount
│   ├── database.py          # SQLite schema & DB connection
│   ├── auth.py              # Student/Faculty authentication
│   └── services/            # Adaptive routing, evaluation, skill profiles
├── frontend/
│   ├── src/                 # React 18 + Tailwind CSS + Framer Motion components
│   └── package.json         # Frontend dependencies
├── Dockerfile               # Production multi-stage Docker build
├── render.yaml              # 1-Click Render Cloud deployment spec
├── Procfile                 # Railway / Heroku deployment spec
├── vercel.json              # Vercel deployment spec
├── requirements.txt         # Production Python packages
├── seed_roles.py            # Question bank & roles seeder
└── README.md
```
