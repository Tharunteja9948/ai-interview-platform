"""
Self-Learning Adaptive Routing Engine
B.Tech CSE Final Year Project: Self-Learning AI Interview Platform
Implements Phase 11: Weakness-driven "Google Maps" question re-routing
"""

import random
from typing import Dict, Any, List, Optional
from backend.database import get_db_connection
from backend.services.skill_profile_service import get_student_profile

def select_next_adaptive_question(
    student_id: int, 
    session_id: str,
    target_role: str = "Software Developer",
    current_difficulty: str = "entry",
    interview_mode: str = "adaptive",
    target_company: Optional[str] = None
) -> Dict[str, Any]:
    """
    Selects the next interview question.
    - 'adaptive' mode: Identifies the student's 2 lowest competencies and queries questions targeting those bottlenecks.
    - 'conventional' mode: Selects questions sequentially or uniformly from the catalog without weakness adaptation (Control Group baseline).
    """
    # 1. Get student's current skill profile
    profile_data = get_student_profile(student_id)
    lowest_skills = profile_data["lowest_two_competencies"]
    
    primary_weakness = lowest_skills[0]
    secondary_weakness = lowest_skills[1] if len(lowest_skills) > 1 else primary_weakness
    
    primary_score = profile_data["competencies"][primary_weakness]["score"]

    conn = get_db_connection()
    cursor = conn.cursor()

    # 2. Find already asked question IDs AND question texts in this session & student history
    cursor.execute("""
        SELECT r.question_id, q.question_text 
        FROM session_responses r
        LEFT JOIN questions q ON r.question_id = q.id
        WHERE r.session_id = ? OR r.student_id = ?
    """, (session_id, student_id))
    asked_rows = cursor.fetchall()
    asked_ids = set(row[0] for row in asked_rows if row[0])
    asked_texts = set(row[1].strip().lower() for row in asked_rows if row[1])

    # Mode 1: Conventional Non-Adaptive Mode (Sequential catalog order)
    if interview_mode == "conventional":
        cursor.execute("""
            SELECT id, role, category, question_text, ideal_answer, 
                   primary_competency, secondary_competency, difficulty, question_type
            FROM questions 
            WHERE role = ?
            ORDER BY id ASC
        """, (target_role,))
        all_q = [dict(row) for row in cursor.fetchall()]
        unasked = [
            q for q in all_q 
            if q["id"] not in asked_ids and q["question_text"].strip().lower() not in asked_texts
        ]
        chosen_question = unasked[0] if unasked else (all_q[0] if all_q else None)
        conn.close()

        adaptive_reason = (
            "Conventional Static Mode Active: Next question selected sequentially by catalog ID. "
            "No weakness diagnosis or adaptive re-routing applied (Control Group benchmark)."
        )
        return {
            "question": chosen_question,
            "targeted_competency": chosen_question["primary_competency"],
            "student_score_for_competency": profile_data["competencies"].get(chosen_question["primary_competency"], {}).get("score", 3.0),
            "adaptive_reason": adaptive_reason,
            "all_weaknesses": lowest_skills,
            "mode": "conventional"
        }

    from backend.services.relevance_service import (
        get_senior_tip_for_question, get_detour_for_question
    )

    # 3. Step A: Target primary weakness for specific role
    cursor.execute("""
        SELECT id, role, category, question_text, ideal_answer, 
               primary_competency, secondary_competency, difficulty, question_type,
               live_priority_score, real_world_occurrences, target_company
        FROM questions 
        WHERE (primary_competency = ? OR secondary_competency = ?)
          AND role = ?
        ORDER BY 
          CASE WHEN target_company = ? THEN 1 WHEN target_company = 'general' THEN 2 ELSE 3 END,
          live_priority_score DESC, difficulty ASC
    """, (primary_weakness, primary_weakness, target_role, target_company or ''))
    candidates = [dict(row) for row in cursor.fetchall()]

    unasked_candidates = [
        q for q in candidates 
        if q["id"] not in asked_ids and q["question_text"].strip().lower() not in asked_texts
    ]

    # Step B: If primary weakness questions are exhausted, target secondary weakness
    if not unasked_candidates:
        cursor.execute("""
            SELECT id, role, category, question_text, ideal_answer, 
                   primary_competency, secondary_competency, difficulty, question_type,
                   live_priority_score, real_world_occurrences, target_company
            FROM questions 
            WHERE (primary_competency = ? OR secondary_competency = ?)
              AND role = ?
            ORDER BY 
              CASE WHEN target_company = ? THEN 1 WHEN target_company = 'general' THEN 2 ELSE 3 END,
              live_priority_score DESC, difficulty ASC
        """, (secondary_weakness, secondary_weakness, target_role, target_company or ''))
        sec_candidates = [dict(row) for row in cursor.fetchall()]
        unasked_candidates = [
            q for q in sec_candidates 
            if q["id"] not in asked_ids and q["question_text"].strip().lower() not in asked_texts
        ]

    # Step C: If both are exhausted, select ANY unasked question for this role
    if not unasked_candidates:
        cursor.execute("""
            SELECT id, role, category, question_text, ideal_answer, 
                   primary_competency, secondary_competency, difficulty, question_type,
                   live_priority_score, real_world_occurrences, target_company
            FROM questions 
            WHERE role = ?
            ORDER BY 
              CASE WHEN target_company = ? THEN 1 WHEN target_company = 'general' THEN 2 ELSE 3 END,
              live_priority_score DESC, difficulty ASC
        """, (target_role, target_company or ''))
        all_role_candidates = [dict(row) for row in cursor.fetchall()]
        unasked_candidates = [
            q for q in all_role_candidates 
            if q["id"] not in asked_ids and q["question_text"].strip().lower() not in asked_texts
        ]

    # Step D: Dynamic generation fallback (guaranteeing fresh unasked template)
    if not unasked_candidates:
        from backend.services.dynamic_question_service import get_or_create_round_question
        fresh_q = get_or_create_round_question(
            company_id=target_company or 'tcs',
            round_type='technical',
            target_competency=primary_weakness,
            difficulty=current_difficulty,
            excluded_ids=asked_ids,
            excluded_texts=asked_texts,
            role_name=target_role
        )
        unasked_candidates = [fresh_q]

    conn.close()

    # 4. Choose question: prioritize highest live priority, matching difficulty if possible
    diff_matches = [q for q in unasked_candidates if q["difficulty"] == current_difficulty]
    pool = diff_matches if diff_matches else unasked_candidates
    # Sort by live_priority_score descending and pick among top candidates
    pool.sort(key=lambda x: x.get("live_priority_score", 1.0), reverse=True)
    chosen_question = pool[0] if len(pool) == 1 else random.choice(pool[:min(3, len(pool))])

    # Attach Senior Alumni Tip & Roadblock Detour if available
    chosen_question["senior_tip"] = get_senior_tip_for_question(chosen_question["id"])
    chosen_question["detour"] = get_detour_for_question(chosen_question["id"])

    # 5. Explainable Re-routing Reason
    target_comp = chosen_question["primary_competency"]
    adaptive_reason = (
        f"Re-routed to test '{target_comp}' because your current skill score "
        f"is {primary_score}/5.0 (one of your two lowest competencies). "
        f"This question targets specific remediation in {chosen_question['category']} "
        f"(Live Priority: {chosen_question.get('live_priority_score', 1.0)}x, "
        f"{chosen_question.get('real_world_occurrences', 0)} verified drive appearances)."
    )

    return {
        "question": chosen_question,
        "targeted_competency": target_comp,
        "student_score_for_competency": primary_score,
        "adaptive_reason": adaptive_reason,
        "all_weaknesses": lowest_skills,
        "mode": "adaptive",
        "unasked_candidates_remaining": len(unasked_candidates)
    }

if __name__ == "__main__":
    # Test routing on student 1
    next_step = select_next_adaptive_question(1, "test_session_1")
    print("Adaptive Next Question Selection:")
    print("Question ID:", next_step["question"]["id"])
    print("Question:", next_step["question"]["question_text"])
    print("Reason:", next_step["adaptive_reason"])
