"""
FastAPI Server Entrypoint
B.Tech CSE Final Year Project: Self-Learning AI Interview Platform
Integrates all Phase 1-13 backend endpoints with CORS and SQLite/Postgres compatibility
"""

import os
import uuid
import sqlite3
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from backend.database import init_db, get_db_connection
from backend.auth import (
    register_student, login_student, update_profile, 
    RegisterRequest, LoginRequest, ConsentRequest
)
from backend.services.evaluation_service import analyze_answer_full
from backend.services.skill_profile_service import (
    get_student_profile, update_student_skill_profile
)
from backend.services.adaptive_engine import select_next_adaptive_question
from backend.services.evolution_service import (
    compute_and_log_evolution, get_student_evolution_history
)

# Initialize database on startup
init_db()

app = FastAPI(
    title="Self-Learning AI Interview Platform",
    description="Backend API for B.Tech CSE Final Year Project",
    version="2.0.0"
)

# Enable CORS for Vite frontend (localhost:5173, 5174, 3000, etc.)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# ------------------------------------------------------------------------------
# Request/Response Schemas
# ------------------------------------------------------------------------------
class StartSessionRequest(BaseModel):
    student_id: int
    role: str = "Software Developer"
    difficulty: str = "entry"
    interview_mode: str = "adaptive"
    company: Optional[str] = "general"
    round_type: Optional[str] = "technical"

class SubmitAnswerRequest(BaseModel):
    student_id: int
    question_id: str
    question_order: int
    transcript: str
    duration_seconds: float = 0.0
    interview_mode: str = "adaptive"
    company: Optional[str] = "general"

# ------------------------------------------------------------------------------
# Core System Endpoints
# ------------------------------------------------------------------------------
@app.get("/api/health")
def health_check():
    return {
        "status": "healthy",
        "system": "Self-Learning AI Interview Platform",
        "version": "2.0.0",
        "database": "SQLite (Local) / PostgreSQL Ready"
    }

# ------------------------------------------------------------------------------
from fastapi.responses import JSONResponse

# ------------------------------------------------------------------------------
# Phase 5: Authentication & Profile Endpoints
# ------------------------------------------------------------------------------
@app.post("/api/auth/register")
@app.post("/api/register")
def register(data: RegisterRequest):
    try:
        res = register_student(data)
        return res
    except ValueError as e:
        return JSONResponse(status_code=400, content={"error": str(e), "detail": str(e)})

@app.post("/api/auth/login")
@app.post("/api/login")
def login(data: LoginRequest):
    try:
        res = login_student(data)
        return res
    except ValueError as e:
        return JSONResponse(status_code=401, content={"error": str(e), "detail": str(e)})

@app.get("/api/student/{student_id}/profile")
def get_profile(student_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT id, username, email, full_name, branch, grad_year, target_role, skills_summary, projects_summary, microphone_consent, role_type FROM students WHERE id = ?", (student_id,))
    row = cursor.fetchone()
    conn.close()
    if not row:
        raise HTTPException(status_code=404, detail="Student not found")
    return dict(row)

@app.put("/api/student/{student_id}/profile")
def modify_profile(student_id: int, updates: Dict[str, Any]):
    return update_profile(student_id, updates)

@app.post("/api/student/consent")
def log_consent(data: ConsentRequest):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO audit_consent_logs (student_id, consent_type, granted)
        VALUES (?, ?, ?)
    """, (data.student_id, data.consent_type, 1 if data.granted else 0))
    cursor.execute("UPDATE students SET microphone_consent = ? WHERE id = ?", (1 if data.granted else 0, data.student_id))
    conn.commit()
    conn.close()
    return {"status": "success", "message": "Consent logged"}

# ------------------------------------------------------------------------------
# Phase 6: Question Bank Endpoints
# ------------------------------------------------------------------------------
@app.get("/api/questions")
def list_questions(category: Optional[str] = None, competency: Optional[str] = None):
    conn = get_db_connection()
    cursor = conn.cursor()
    query = "SELECT * FROM questions WHERE 1=1"
    params = []
    if category:
        query += " AND category = ?"
        params.append(category)
    if competency:
        query += " AND (primary_competency = ? OR secondary_competency = ?)"
        params.extend([competency, competency])
    cursor.execute(query, params)
    rows = cursor.fetchall()
    conn.close()
    return [dict(r) for r in rows]

# ------------------------------------------------------------------------------
# Phase 7, 8, 9, 10, 11, 12: Interview Session & Adaptive Loop
# ------------------------------------------------------------------------------
@app.post("/api/session/start")
def start_interview_session(data: StartSessionRequest):
    """
    Starts an interview session. If first session, selects baseline question;
    otherwise executes adaptive router based on student's weak skills.
    """
    session_id = f"sess_{uuid.uuid4().hex[:10]}"
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        INSERT INTO interview_sessions (id, student_id, role, status)
        VALUES (?, ?, ?, 'in_progress')
    """, (session_id, data.student_id, data.role))
    conn.commit()
    conn.close()

    # Select the first question adaptively or conventionally
    first_step = select_next_adaptive_question(
        student_id=data.student_id,
        session_id=session_id,
        target_role=data.role,
        current_difficulty=data.difficulty,
        interview_mode=data.interview_mode,
        target_company=data.company
    )

    # Strip ideal_answer so student cannot see or inspect it before submitting!
    first_q = dict(first_step["question"])
    first_q.pop("ideal_answer", None)

    return {
        "session_id": session_id,
        "student_id": data.student_id,
        "role": data.role,
        "interview_mode": data.interview_mode,
        "first_question": first_q,
        "adaptive_metadata": {
            "targeted_competency": first_step["targeted_competency"],
            "adaptive_reason": first_step["adaptive_reason"],
            "mode": first_step.get("mode", data.interview_mode)
        }
    }

@app.get("/api/session/{session_id}/next-question")
def get_next_question(
    session_id: str, 
    student_id: int, 
    difficulty: str = "entry", 
    role: str = "Software Developer",
    interview_mode: str = "adaptive"
):
    """Fetches the next question targeting the student's latest diagnosed weakness or next sequential"""
    return select_next_adaptive_question(
        student_id=student_id,
        session_id=session_id,
        target_role=role,
        current_difficulty=difficulty,
        interview_mode=interview_mode
    )

@app.post("/api/session/{session_id}/submit-answer")
def submit_answer(session_id: str, payload: SubmitAnswerRequest):
    """
    The Core Adaptive Learning Engine Pipeline:
    1. Evaluates answer (Speech signals + LLM/Rubric scores).
    2. Persists response in database.
    3. Updates student's longitudinal skill profile using EWMA.
    4. Computes Answer Evolution Delta against previous attempt.
    5. Calculates next practice question targeting diagnosed roadblock.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Fetch question details
    cursor.execute("SELECT * FROM questions WHERE id = ?", (payload.question_id,))
    q_row = cursor.fetchone()
    if not q_row:
        conn.close()
        raise HTTPException(status_code=404, detail="Question not found")
    
    question_text = q_row["question_text"]
    ideal_answer = q_row["ideal_answer"]
    primary_comp = q_row["primary_competency"]

    # 2. Evaluate answer across 8 dimensions (Phase 8 & 9)
    eval_result = analyze_answer_full(
        question_text=question_text,
        ideal_answer=ideal_answer,
        student_answer=payload.transcript,
        primary_competency=primary_comp,
        duration_seconds=payload.duration_seconds
    )
    scores = eval_result["scores"]
    metrics = eval_result["delivery_metrics"]

    # 3. Save response record
    response_id = f"resp_{uuid.uuid4().hex[:10]}"
    cursor.execute("""
        INSERT INTO session_responses (
            id, session_id, student_id, question_id, question_order,
            transcript, duration_seconds, word_count, wpm, filler_count,
            relevance_score, structure_score, technical_score, completeness_score,
            evidence_score, conciseness_score, clarity_score, timing_score,
            composite_score, strengths, improvements, adaptive_trigger_reason
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        response_id, session_id, payload.student_id, payload.question_id, payload.question_order,
        payload.transcript, metrics["duration_seconds"], metrics["word_count"], 
        metrics["wpm"], metrics["filler_count"],
        scores["relevance"], scores["structure"], scores["technical_correctness"],
        scores["completeness"], scores["evidence"], scores["conciseness"],
        scores["clarity_fluency"], scores["response_timing"],
        scores["total_composite"], eval_result["strengths"], eval_result["improvements"],
        f"Evaluated against primary competency: {primary_comp}"
    ))

    # Update session question counter
    cursor.execute("""
        UPDATE interview_sessions 
        SET total_questions = total_questions + 1
        WHERE id = ?
    """, (session_id,))
    conn.commit()
    conn.close()

    # 4. Update Student Skill Profile with EWMA (Phase 10)
    profile_updates = update_student_skill_profile(
        student_id=payload.student_id,
        new_scores=scores
    )

    # 5. Compute Answer Evolution vs Previous Attempt (Phase 12)
    current_target_score = scores.get(primary_comp, scores["total_composite"])
    evolution = compute_and_log_evolution(
        student_id=payload.student_id,
        session_id=session_id,
        current_response_id=response_id,
        target_competency=primary_comp,
        current_score=current_target_score,
        current_transcript=payload.transcript
    )

    # 6. Retrieve refreshed student profile & find next adaptive practice question (Phase 11)
    # 6. Retrieve refreshed student profile & find next adaptive practice question (Phase 11)
    from backend.services.relevance_service import get_detour_for_question
    detour_info = get_detour_for_question(payload.question_id) if scores.get("total_composite", 0.0) < 2.3 else None

    updated_profile = get_student_profile(payload.student_id)
    next_adaptive_step = select_next_adaptive_question(
        student_id=payload.student_id,
        session_id=session_id,
        target_role=q_row["role"],
        current_difficulty=q_row["difficulty"],
        interview_mode=payload.interview_mode
    )

    # Strip ideal_answer from next recommended question so candidate cannot see it before answering
    next_q = dict(next_adaptive_step["question"])
    next_q.pop("ideal_answer", None)

    return {
        "response_id": response_id,
        "scores": scores,
        "delivery_metrics": metrics,
        "strengths": eval_result["strengths"],
        "improvements": eval_result["improvements"],
        "ideal_model_answer": ideal_answer,  # UNLOCKED EXCLUSIVELY AFTER SCORING!
        "evolution": evolution,
        "updated_skill_profile": updated_profile,
        "next_recommended_question": next_q,
        "adaptive_routing_justification": next_adaptive_step["adaptive_reason"],
        "detour_triggered": detour_info is not None,
        "detour_info": detour_info
    }

@app.post("/api/session/{session_id}/complete")
def complete_session(session_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Compute average composite score of all answers in this session
    cursor.execute("""
        SELECT AVG(composite_score) as avg_score, COUNT(*) as q_count 
        FROM session_responses 
        WHERE session_id = ?
    """, (session_id,))
    row = cursor.fetchone()
    avg_score = round(float(row["avg_score"] or 0.0), 2)
    q_count = int(row["q_count"] or 0)

    cursor.execute("""
        UPDATE interview_sessions 
        SET status = 'completed', completed_at = CURRENT_TIMESTAMP, composite_score = ?
        WHERE id = ?
    """, (avg_score, session_id))
    conn.commit()
    conn.close()

    return {
        "session_id": session_id,
        "status": "completed",
        "composite_score": avg_score,
        "questions_answered": q_count
    }

# ------------------------------------------------------------------------------
# Full AI Evaluation & Questions Integration Endpoint (used by Practice Arena)
# ------------------------------------------------------------------------------
class LegacyEvaluateAnswerItem(BaseModel):
    id: Optional[str] = ""
    question: str
    answer: str

class LegacyEvaluateRequest(BaseModel):
    companyId: Optional[str] = "google"
    role: Optional[str] = "Software Developer"
    round: Optional[str] = "Technical"
    level: Optional[str] = "entry"
    answers: List[LegacyEvaluateAnswerItem]
    userId: Optional[int] = None

@app.get("/api/interview/questions")
def get_practice_questions(
    companyId: str = "google",
    role: str = "Software Developer",
    round: str = "coding",
    level: str = "entry",
    count: int = 5,
    userId: Optional[int] = None
):
    conn = get_db_connection()
    cursor = conn.cursor()

    # Query from 52-question tagged bank
    cursor.execute("""
        SELECT id, category, question_text, ideal_answer, primary_competency, difficulty
        FROM questions
        ORDER BY RANDOM()
        LIMIT ?
    """, (count,))
    rows = cursor.fetchall()
    conn.close()

    formatted_questions = []
    for r in rows:
        formatted_questions.append({
            "id": r["id"],
            "question": r["question_text"],
            "ideal_answer": r["ideal_answer"],
            "category": r["category"],
            "primary_competency": r["primary_competency"],
            "difficulty": r["difficulty"]
        })

    return {
        "companyId": companyId,
        "questions": formatted_questions
    }

@app.post("/api/interview/evaluate")
def evaluate_interview_batch(payload: LegacyEvaluateRequest):
    """
    Evaluates interview responses using the 8-dimension rubric and acoustic feature extractor.
    Updates the student's longitudinal skill profile and returns full explainable scorecards.
    """
    if not payload.answers:
        raise HTTPException(status_code=400, detail="No answers provided for evaluation")

    conn = get_db_connection()
    cursor = conn.cursor()

    results = []
    total_comp_score = 0.0

    for item in payload.answers:
        # Match ideal answer from DB if possible
        cursor.execute("SELECT ideal_answer, primary_competency FROM questions WHERE id = ? OR question_text = ?", (item.id, item.question))
        q_row = cursor.fetchone()
        
        if q_row:
            ideal_ans = q_row["ideal_answer"]
            prim_comp = q_row["primary_competency"]
        else:
            ideal_ans = "Demonstrate deep understanding of software design, algorithmic trade-offs, and clear structure."
            prim_comp = "technical_correctness"

        # Run 8-dimension evaluation
        eval_res = analyze_answer_full(
            question_text=item.question,
            ideal_answer=ideal_ans,
            student_answer=item.answer,
            primary_competency=prim_comp,
            duration_seconds=55.0
        )

        scores = eval_res["scores"]
        comp_score_5 = scores["total_composite"]
        score_10 = round(comp_score_5 * 2.0, 1) # scale to 10
        total_comp_score += comp_score_5

        # Update profile if user is logged in
        if payload.userId:
            update_student_skill_profile(payload.userId, scores)

        results.append({
            "question": item.question,
            "userAnswer": item.answer,
            "score": score_10,
            "rubricScores": scores,
            "deliveryMetrics": eval_res["delivery_metrics"],
            "strengths": eval_res["strengths"],
            "improvements": eval_res["improvements"],
            "modelAnswer": ideal_ans
        })

    conn.close()

    avg_score_5 = round(total_comp_score / max(1, len(payload.answers)), 2)
    avg_score_10 = round(avg_score_5 * 2.0, 1)

    return {
        "averageScore": avg_score_10,
        "compositeScore": avg_score_5,
        "results": results
    }

# ------------------------------------------------------------------------------
# Phase 13: Student & Faculty Dashboards
# ------------------------------------------------------------------------------
@app.get("/api/student/{student_id}/dashboard")
def get_student_dashboard_data(student_id: int):
    """Aggregates all student progression data, radar metrics, and evolution logs"""
    profile = get_student_profile(student_id)
    evolution_history = get_student_evolution_history(student_id)

    conn = get_db_connection()
    cursor = conn.cursor()

    # Recent sessions
    cursor.execute("""
        SELECT id, role, status, started_at, completed_at, composite_score, total_questions
        FROM interview_sessions
        WHERE student_id = ?
        ORDER BY started_at DESC
        LIMIT 10
    """, (student_id,))
    sessions = [dict(r) for r in cursor.fetchall()]

    # Detailed response history
    cursor.execute("""
        SELECT r.id, r.session_id, r.question_id, q.question_text, q.category, 
               r.transcript, r.wpm, r.filler_count, r.composite_score, 
               r.strengths, r.improvements, r.created_at
        FROM session_responses r
        JOIN questions q ON r.question_id = q.id
        WHERE r.student_id = ?
        ORDER BY r.created_at DESC
        LIMIT 15
    """, (student_id,))
    recent_responses = [dict(r) for r in cursor.fetchall()]

    conn.close()

    return {
        "profile": profile,
        "readiness_index": profile["readiness_percentage"],
        "weak_competencies": profile["lowest_two_competencies"],
        "strong_competencies": profile["highest_two_competencies"],
        "evolution_history": evolution_history,
        "recent_sessions": sessions,
        "recent_responses": recent_responses
    }

@app.get("/api/faculty/cohort-analytics")
def get_faculty_cohort_analytics():
    """
    Anonymized cohort analytics for Training & Placement Officers (TPOs) and HODs:
    - Average score per competency across all students
    - Departmental weakness distribution
    - Total practice sessions and active candidates
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Competency cohort averages
    cursor.execute("""
        SELECT competency, AVG(current_score) as avg_score, COUNT(DISTINCT student_id) as student_count
        FROM student_skill_profiles
        GROUP BY competency
        ORDER BY avg_score ASC
    """)
    competency_breakdown = [
        {"competency": r["competency"], "avg_score": round(float(r["avg_score"]), 2), "sample_size": r["student_count"]}
        for r in cursor.fetchall()
    ]

    # Overall totals
    cursor.execute("SELECT COUNT(DISTINCT id) FROM students WHERE role_type = 'student'")
    total_students = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM interview_sessions WHERE status = 'completed'")
    completed_sessions = cursor.fetchone()[0]

    cursor.execute("SELECT COUNT(*) FROM session_responses")
    total_responses_given = cursor.fetchone()[0]

    cursor.execute("""
        SELECT AVG(delta_score) as mean_improvement 
        FROM answer_evolutions
    """)
    avg_delta_row = cursor.fetchone()
    avg_delta = round(float(avg_delta_row["mean_improvement"] or 0.0), 2)

    conn.close()

    return {
        "cohort_overview": {
            "registered_students": total_students,
            "completed_sessions": completed_sessions,
            "total_answers_analyzed": total_responses_given,
            "mean_answer_evolution_delta": avg_delta
        },
        "competency_breakdown": competency_breakdown,
        "top_cohort_weaknesses": [c["competency"] for c in competency_breakdown[:3]] if competency_breakdown else []
    }

# ------------------------------------------------------------------------------
# Batch 1 Pitch Research Endpoints (Adaptive vs Conventional & Human Validation)
# ------------------------------------------------------------------------------
from backend.services.research_study_service import (
    get_adaptive_vs_conventional_study, 
    get_human_validation_study
)

@app.get("/api/research/adaptive-vs-conventional")
def get_research_comparison():
    """Empirical experimental comparison between Adaptive Re-routing and Static Mock"""
    return get_adaptive_vs_conventional_study()

@app.get("/api/research/human-validation")
def get_human_validation():
    """Inter-rater reliability validation comparing AI scoring against Senior Faculty ratings"""
    return get_human_validation_study()

# ------------------------------------------------------------------------------
# Crowdsourced Placement Weighting, Company Tiers, and Senior Tips
# ------------------------------------------------------------------------------
from backend.services.relevance_service import (
    get_company_tiers_and_companies,
    record_real_world_feedback,
    get_trending_placement_questions,
    get_detour_for_question,
    get_senior_tip_for_question
)

class RealWorldFeedbackRequest(BaseModel):
    student_id: int
    question_id: Optional[str] = None
    company_name: str = "TCS"
    was_asked: bool = True
    utility_rating: int = 5
    confidence_level: str = "medium"
    student_comment: str = ""
    new_question_text: Optional[str] = None
    new_question_category: Optional[str] = "Technical"
    senior_tip: Optional[str] = None
    student_name: Optional[str] = "Senior Student"

@app.get("/api/companies/tiers")
def get_tiers_and_companies():
    """Returns the 3 company tiers with their respective companies"""
    return get_company_tiers_and_companies()

@app.post("/api/feedback/real-world-report")
def submit_real_world_report(payload: RealWorldFeedbackRequest):
    """Submits student feedback from a real campus interview to dynamically re-weight question priority"""
    return record_real_world_feedback(
        student_id=payload.student_id,
        question_id=payload.question_id,
        company_name=payload.company_name,
        was_asked=payload.was_asked,
        utility_rating=payload.utility_rating,
        confidence_level=payload.confidence_level,
        student_comment=payload.student_comment,
        new_question_text=payload.new_question_text,
        new_question_category=payload.new_question_category,
        senior_tip=payload.senior_tip,
        student_name=payload.student_name
    )

@app.get("/api/questions/trending")
def get_trending_questions(limit: int = 6):
    """Returns questions with highest live priority scores and senior alumni tips"""
    return get_trending_placement_questions(limit=limit)


@app.get("/api/questions/company/{company_id}")
def get_company_questions(company_id: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT q.id, q.role, q.category, q.question_text, q.ideal_answer,
               q.primary_competency, q.secondary_competency, q.difficulty,
               q.live_priority_score, q.real_world_occurrences, q.target_company,
               t.tip_text, t.senior_name, t.placed_company
        FROM questions q
        LEFT JOIN senior_alumni_tips t ON q.id = t.question_id
        WHERE q.target_company = ? OR q.target_company = 'general'
        ORDER BY CASE WHEN q.target_company = ? THEN 1 ELSE 2 END, q.live_priority_score DESC
    """, (company_id, company_id))
    rows = [dict(row) for row in cursor.fetchall()]
    conn.close()
    return {
        "company_id": company_id,
        "total_available": len(rows),
        "questions": rows
    }

# ------------------------------------------------------------------------------
# Production Serving: Static Files & SPA Catch-All Route
# ------------------------------------------------------------------------------
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

DIST_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "frontend", "dist")
ASSETS_DIR = os.path.join(DIST_DIR, "assets")

if os.path.exists(ASSETS_DIR):
    app.mount("/assets", StaticFiles(directory=ASSETS_DIR), name="assets")

@app.get("/")
async def serve_index():
    index_path = os.path.join(DIST_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    return {
        "status": "online",
        "system": "Self-Learning AI Interview Platform API",
        "docs": "/docs",
        "note": "Frontend build not detected. Run 'npm run build' inside /frontend directory."
    }

@app.get("/{full_path:path}")
async def serve_spa_catchall(full_path: str):
    # 1. Skip /api routes (FastAPI already handles them or returns 404)
    if full_path.startswith("api/") or full_path == "api":
        raise HTTPException(status_code=404, detail="API route not found")
    
    # 2. Check if a static file directly matches in dist
    target_file = os.path.join(DIST_DIR, full_path)
    if os.path.isfile(target_file):
        return FileResponse(target_file)
    
    # 3. Fallback to index.html for client-side React routing
    index_path = os.path.join(DIST_DIR, "index.html")
    if os.path.exists(index_path):
        return FileResponse(index_path)
    
    raise HTTPException(status_code=404, detail="Resource not found")

if __name__ == "__main__":
    import uvicorn
    port = int(os.environ.get("PORT", 8000))
    uvicorn.run("backend.main:app", host="0.0.0.0", port=port, reload=False)

