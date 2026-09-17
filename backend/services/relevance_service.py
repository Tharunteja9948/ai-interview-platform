"""
Crowdsourced Question Relevance, Senior Alumni Tips, and Roadblock Detour Service
B.Tech CSE Final Year Project: Self-Learning AI Interview Platform
"""

from typing import Dict, Any, List, Optional
from backend.database import get_db_connection

def get_company_tiers_and_companies() -> List[Dict[str, Any]]:
    """Returns the 3 company tiers with their respective companies"""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("SELECT id, name, description, badge_color FROM company_tiers")
    tiers = [dict(r) for r in cursor.fetchall()]

    for tier in tiers:
        cursor.execute("""
            SELECT id, name, logo_icon, description, difficulty_tier, typical_focus
            FROM companies
            WHERE tier_id = ?
            ORDER BY id ASC
        """, (tier["id"],))
        tier["companies"] = [dict(r) for r in cursor.fetchall()]

    conn.close()
    return tiers

def get_senior_tip_for_question(question_id: str) -> Optional[Dict[str, Any]]:
    """Returns the most relevant senior alumni placement tip for a question"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT senior_name, placed_company, tip_text, batch_year
        FROM senior_alumni_tips
        WHERE question_id = ? AND verified = 1
        LIMIT 1
    """, (question_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def get_detour_for_question(question_id: str) -> Optional[Dict[str, Any]]:
    """Returns a scaffolding roadblock detour question if student gets stuck"""
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        SELECT detour_prompt, stepping_stone_concept, hint_guidance
        FROM roadblock_detours
        WHERE parent_question_id = ?
        LIMIT 1
    """, (question_id,))
    row = cursor.fetchone()
    conn.close()
    return dict(row) if row else None

def record_real_world_feedback(
    student_id: int,
    question_id: Optional[str] = None,
    company_name: str = "TCS",
    was_asked: bool = True,
    utility_rating: int = 5,
    confidence_level: str = "medium",
    student_comment: str = "",
    new_question_text: Optional[str] = None,
    new_question_category: Optional[str] = "Technical",
    senior_tip: Optional[str] = None,
    student_name: Optional[str] = "Senior Student"
) -> Dict[str, Any]:
    """
    Records student feedback from real campus drives and updates question priority:
    Priority = 1.0 + (Real World Occurrences * 1.5) + (Average Utility * 0.4)
    If a new question is reported, inserts it into questions table for that company.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    active_qid = question_id

    # If student is reporting a new question from today's drive
    if (not active_qid or active_qid == "custom" or active_qid.strip() == "") and new_question_text:
        import uuid
        comp_slug = company_name.lower().replace(" ", "_").replace("(", "").replace(")", "").replace("&", "")
        active_qid = f"q_real_{comp_slug}_{uuid.uuid4().hex[:6]}"
        
        cursor.execute("""
            INSERT INTO questions (
                id, role, category, question_text, ideal_answer,
                primary_competency, secondary_competency, difficulty,
                live_priority_score, real_world_occurrences, target_company
            ) VALUES (?, 'Software Developer', ?, ?, ?, 'technical_correctness', 'structure', 'mid', 2.8, 1, ?)
        """, (
            active_qid, 
            new_question_category or "Technical", 
            new_question_text.strip(),
            "Candidate should clearly articulate the core concepts, practical trade-offs, and concrete examples.",
            comp_slug
        ))

    if not active_qid:
        conn.close()
        raise ValueError("Either question_id or new_question_text must be provided.")

    # Record the feedback occurrence
    cursor.execute("""
        INSERT INTO question_real_world_feedback (
            student_id, question_id, company_name, was_asked_in_real_interview,
            utility_rating, confidence_level, student_comment
        ) VALUES (?, ?, ?, ?, ?, ?, ?)
    """, (
        student_id, active_qid, company_name, 
        1 if was_asked else 0, utility_rating, confidence_level, student_comment
    ))

    # Recalculate priority
    cursor.execute("""
        SELECT 
            SUM(CASE WHEN was_asked_in_real_interview = 1 THEN 1 ELSE 0 END) as total_occurrences,
            AVG(utility_rating) as avg_utility
        FROM question_real_world_feedback
        WHERE question_id = ?
    """, (active_qid,))
    stats = cursor.fetchone()
    occurrences = max(1, int(stats["total_occurrences"] or 1))
    avg_utility = float(stats["avg_utility"] or 4.0)

    new_priority = round(1.0 + (occurrences * 1.5) + (avg_utility * 0.4), 2)

    cursor.execute("""
        UPDATE questions 
        SET live_priority_score = ?, real_world_occurrences = ?
        WHERE id = ?
    """, (new_priority, occurrences, active_qid))

    # If senior tip provided, record in senior_alumni_tips
    if senior_tip and senior_tip.strip():
        cursor.execute("""
            INSERT OR REPLACE INTO senior_alumni_tips (
                question_id, senior_name, placed_company, tip_text, batch_year, verified
            ) VALUES (?, ?, ?, ?, 2026, 1)
        """, (active_qid, student_name or "Senior Student", company_name, senior_tip.strip()))

    conn.commit()
    conn.close()

    return {
        "question_id": active_qid,
        "company_name": company_name,
        "new_priority_score": new_priority,
        "real_world_occurrences": occurrences,
        "average_utility": round(avg_utility, 1)
    }

def get_trending_placement_questions(limit: int = 6) -> List[Dict[str, Any]]:
    """Fetches high-priority questions currently trending across campus drives"""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT id, category, question_text, primary_competency, difficulty, 
               live_priority_score, real_world_occurrences
        FROM questions
        ORDER BY live_priority_score DESC, real_world_occurrences DESC
        LIMIT ?
    """, (limit,))
    rows = [dict(r) for r in cursor.fetchall()]

    for r in rows:
        tip = get_senior_tip_for_question(r["id"])
        r["senior_tip"] = tip

    conn.close()
    return rows
