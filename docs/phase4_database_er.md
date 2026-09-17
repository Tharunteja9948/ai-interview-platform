# Phase 4: Entity-Relationship (ER) Architecture and Data Dictionary

**Project Milestone**: Relational Database Architecture  
**Database Engines Supported**: SQLite3 (Local Prototyping & CI) & PostgreSQL 15+ (Production College Server)

---

## 1. Entity-Relationship (ER) Diagram

```mermaid
erDiagram
    STUDENTS ||--o{ INTERVIEW_SESSIONS : "conducts"
    STUDENTS ||--o{ STUDENT_SKILL_PROFILES : "maintains"
    STUDENTS ||--o{ ANSWER_EVOLUTIONS : "achieves"
    STUDENTS ||--o{ AUDIT_CONSENT_LOGS : "grants"
    
    INTERVIEW_SESSIONS ||--|{ SESSION_RESPONSES : "contains"
    INTERVIEW_SESSIONS ||--o{ ANSWER_EVOLUTIONS : "generates"
    
    QUESTIONS ||--o{ SESSION_RESPONSES : "presented_in"
    
    TARGET_ROLES ||--o{ QUESTIONS : "governs"
    TARGET_ROLES ||--o{ STUDENTS : "targeted_by"

    STUDENTS {
        int id PK
        string username UK
        string email UK
        string password_hash
        string full_name
        string branch
        int grad_year
        string target_role
        text skills_summary
        text projects_summary
        boolean microphone_consent
        string role_type
        timestamp created_at
    }

    QUESTIONS {
        string id PK
        string role
        string category
        text question_text
        text ideal_answer
        string primary_competency
        string secondary_competency
        string difficulty
        string question_type
        boolean is_baseline
        timestamp created_at
    }

    INTERVIEW_SESSIONS {
        string id PK
        int student_id FK
        string role
        string status
        timestamp started_at
        timestamp completed_at
        float composite_score
        int total_questions
    }

    SESSION_RESPONSES {
        string id PK
        string session_id FK
        int student_id FK
        string question_id FK
        int question_order
        text transcript
        float duration_seconds
        int word_count
        float wpm
        int filler_count
        float relevance_score
        float structure_score
        float technical_score
        float completeness_score
        float evidence_score
        float conciseness_score
        float clarity_score
        float timing_score
        float composite_score
        text strengths
        text improvements
        text adaptive_trigger_reason
        timestamp created_at
    }

    STUDENT_SKILL_PROFILES {
        int id PK
        int student_id FK
        string competency
        float current_score
        int attempts_count
        timestamp last_updated
    }

    ANSWER_EVOLUTIONS {
        string id PK
        int student_id FK
        string session_id FK
        string previous_response_id FK
        string current_response_id FK
        string competency
        float previous_score
        float current_score
        float delta_score
        text evolution_summary
        timestamp created_at
    }

    AUDIT_CONSENT_LOGS {
        int id PK
        int student_id FK
        string consent_type
        boolean granted
        string ip_address
        timestamp timestamp
    }
```

---

## 2. Key Data Integrity & Design Rules

1. **Foreign Key Cascade Deletion**: Deleting a student record cascades to associated sessions, skill profiles, and evolution logs to respect university privacy and right-to-be-forgotten guidelines.
2. **Deterministic Uniqueness**: `student_skill_profiles` enforces `UNIQUE(student_id, competency)` ensuring that each competency per student has exactly one canonical updated moving-average score.
3. **Audit Trail Immutability**: `audit_consent_logs` records all permissions (e.g. microphone access consent) with timestamps and pseudo-IP addresses to satisfy ethical academic guidelines.
4. **Adaptive Routing Query Indexing**: `CREATE INDEX idx_questions_comp_diff ON questions(primary_competency, difficulty, role)` ensures $O(1)$ indexed retrieval of remedial practice questions during live interviews.
