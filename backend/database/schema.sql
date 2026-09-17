-- ==============================================================================
-- B.Tech CSE Final Year Project: Self-Learning AI Interview Preparation Platform
-- Database Schema: PostgreSQL & SQLite Compatible
-- Phase 4 Deliverable
-- ==============================================================================

-- 1. Students / User Accounts
CREATE TABLE IF NOT EXISTS students (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    branch VARCHAR(100) DEFAULT 'Computer Science & Engineering',
    grad_year INTEGER DEFAULT 2026,
    target_role VARCHAR(100) DEFAULT 'Software Developer',
    skills_summary TEXT DEFAULT '',
    projects_summary TEXT DEFAULT '',
    microphone_consent BOOLEAN DEFAULT 1,
    role_type VARCHAR(20) DEFAULT 'student', -- 'student', 'faculty', 'admin'
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 2. Target Roles
CREATE TABLE IF NOT EXISTS target_roles (
    id VARCHAR(50) PRIMARY KEY,
    title VARCHAR(100) NOT NULL,
    description TEXT,
    competencies_weighting TEXT -- JSON string mapping competency to priority
);

-- 3. Question Bank (Tagged by Competency, Topic, Difficulty)
CREATE TABLE IF NOT EXISTS questions (
    id VARCHAR(100) PRIMARY KEY,
    role VARCHAR(100) NOT NULL DEFAULT 'Software Developer',
    category VARCHAR(100) NOT NULL, -- 'DSA', 'System Design', 'OOP', 'Behavioral', 'Web & Databases'
    question_text TEXT NOT NULL,
    ideal_answer TEXT NOT NULL,
    primary_competency VARCHAR(50) NOT NULL, -- 'relevance', 'structure', 'technical_correctness', etc.
    secondary_competency VARCHAR(50),
    difficulty VARCHAR(20) NOT NULL DEFAULT 'entry', -- 'entry', 'mid', 'senior'
    question_type VARCHAR(50) NOT NULL DEFAULT 'technical', -- 'technical', 'project', 'behavioral', 'follow_up'
    is_baseline BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 4. Interview Practice Sessions
CREATE TABLE IF NOT EXISTS interview_sessions (
    id VARCHAR(100) PRIMARY KEY,
    student_id INTEGER NOT NULL,
    role VARCHAR(100) NOT NULL DEFAULT 'Software Developer',
    status VARCHAR(50) DEFAULT 'in_progress', -- 'in_progress', 'completed', 'abandoned'
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    composite_score REAL DEFAULT 0.0,
    total_questions INTEGER DEFAULT 0,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 5. Session Responses (Granular Audio & Transcript Metrics)
CREATE TABLE IF NOT EXISTS session_responses (
    id VARCHAR(100) PRIMARY KEY,
    session_id VARCHAR(100) NOT NULL,
    student_id INTEGER NOT NULL,
    question_id VARCHAR(100) NOT NULL,
    question_order INTEGER NOT NULL,
    transcript TEXT NOT NULL,
    duration_seconds REAL DEFAULT 0.0,
    word_count INTEGER DEFAULT 0,
    wpm REAL DEFAULT 0.0,
    filler_count INTEGER DEFAULT 0,
    
    -- 8-Dimension Rubric Scores (0.0 to 5.0)
    relevance_score REAL DEFAULT 0.0,
    structure_score REAL DEFAULT 0.0,
    technical_score REAL DEFAULT 0.0,
    completeness_score REAL DEFAULT 0.0,
    evidence_score REAL DEFAULT 0.0,
    conciseness_score REAL DEFAULT 0.0,
    clarity_score REAL DEFAULT 0.0,
    timing_score REAL DEFAULT 0.0,
    
    composite_score REAL DEFAULT 0.0,
    strengths TEXT DEFAULT '',
    improvements TEXT DEFAULT '',
    adaptive_trigger_reason TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES interview_sessions(id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id)
);

-- 6. Longitudinal Student Skill Profile (Exponential Moving Average)
CREATE TABLE IF NOT EXISTS student_skill_profiles (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    competency VARCHAR(50) NOT NULL,
    current_score REAL DEFAULT 2.5,
    attempts_count INTEGER DEFAULT 0,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, competency),
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 7. Longitudinal Answer Evolution Tracking
CREATE TABLE IF NOT EXISTS answer_evolutions (
    id VARCHAR(100) PRIMARY KEY,
    student_id INTEGER NOT NULL,
    session_id VARCHAR(100) NOT NULL,
    previous_response_id VARCHAR(100),
    current_response_id VARCHAR(100),
    competency VARCHAR(50) NOT NULL,
    previous_score REAL NOT NULL,
    current_score REAL NOT NULL,
    delta_score REAL NOT NULL,
    evolution_summary TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (session_id) REFERENCES interview_sessions(id) ON DELETE CASCADE
);

-- 8. Audit and Consent Logs (Microphone / Recording Usage)
CREATE TABLE IF NOT EXISTS audit_consent_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    consent_type VARCHAR(100) NOT NULL,
    granted BOOLEAN NOT NULL,
    ip_address VARCHAR(100) DEFAULT '127.0.0.1',
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE
);

-- 9. Company Tiers & Target Companies (3 Categories)
CREATE TABLE IF NOT EXISTS company_tiers (
    id VARCHAR(50) PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    badge_color VARCHAR(50) DEFAULT 'cyan'
);

CREATE TABLE IF NOT EXISTS companies (
    id VARCHAR(50) PRIMARY KEY,
    tier_id VARCHAR(50) NOT NULL,
    name VARCHAR(100) NOT NULL,
    logo_icon VARCHAR(50) DEFAULT 'Building',
    description TEXT,
    difficulty_tier VARCHAR(20) DEFAULT 'hard',
    typical_focus TEXT,
    FOREIGN KEY (tier_id) REFERENCES company_tiers(id)
);

-- 10. Senior Alumni Placement Tips (Crowdsourced Road Hazards / Guidance)
CREATE TABLE IF NOT EXISTS senior_alumni_tips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    question_id VARCHAR(100) NOT NULL,
    senior_name VARCHAR(100) NOT NULL,
    placed_company VARCHAR(100) NOT NULL,
    tip_text TEXT NOT NULL,
    batch_year INTEGER DEFAULT 2025,
    verified BOOLEAN DEFAULT 1,
    FOREIGN KEY (question_id) REFERENCES questions(id)
);

-- 11. Roadblock Detours (Scaffolding / Stepping-Stone Questions when stuck)
CREATE TABLE IF NOT EXISTS roadblock_detours (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    parent_question_id VARCHAR(100) NOT NULL,
    detour_prompt TEXT NOT NULL,
    stepping_stone_concept VARCHAR(100) NOT NULL,
    hint_guidance TEXT NOT NULL,
    FOREIGN KEY (parent_question_id) REFERENCES questions(id)
);

-- 12. Question Real-World Feedback & Live Priority Tracking
CREATE TABLE IF NOT EXISTS question_real_world_feedback (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    student_id INTEGER NOT NULL,
    question_id VARCHAR(100) NOT NULL,
    company_name VARCHAR(100) NOT NULL,
    was_asked_in_real_interview BOOLEAN DEFAULT 1,
    utility_rating INTEGER DEFAULT 5, -- 1 to 5
    confidence_level VARCHAR(20) DEFAULT 'medium', -- 'high', 'medium', 'low'
    student_comment TEXT DEFAULT '',
    interview_date DATE DEFAULT CURRENT_DATE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES questions(id)
);

-- Create Indexes for Fast Adaptive Lookup and Cohort Aggregation
CREATE INDEX IF NOT EXISTS idx_questions_comp_diff ON questions(primary_competency, difficulty, role);
CREATE INDEX IF NOT EXISTS idx_responses_student ON session_responses(student_id);
CREATE INDEX IF NOT EXISTS idx_responses_session ON session_responses(session_id);
CREATE INDEX IF NOT EXISTS idx_skill_profiles_student ON student_skill_profiles(student_id);
CREATE INDEX IF NOT EXISTS idx_evolutions_student ON answer_evolutions(student_id);
CREATE INDEX IF NOT EXISTS idx_feedback_question ON question_real_world_feedback(question_id);

