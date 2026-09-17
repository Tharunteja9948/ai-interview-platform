"""
Longitudinal Answer Evolution Engine
B.Tech CSE Final Year Project: Self-Learning AI Interview Platform
Implements Phase 12: Delta score computation, transcript comparisons, and narrative generation
"""

import uuid
from typing import Dict, List, Any, Optional
from backend.database import get_db_connection

def compute_and_log_evolution(
    student_id: int,
    session_id: str,
    current_response_id: str,
    target_competency: str,
    current_score: float,
    current_transcript: str
) -> Optional[Dict[str, Any]]:
    """
    Computes delta between the current response and the student's previous response
    on the same competency, generating an explainable evolution narrative.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    # Find the most recent previous response by this student evaluating this competency
    cursor.execute("""
        SELECT r.id, r.session_id, r.transcript, r.created_at,
               CASE 
                 WHEN ? = 'relevance' THEN r.relevance_score
                 WHEN ? = 'structure' THEN r.structure_score
                 WHEN ? = 'technical_correctness' THEN r.technical_score
                 WHEN ? = 'completeness' THEN r.completeness_score
                 WHEN ? = 'evidence' THEN r.evidence_score
                 WHEN ? = 'conciseness' THEN r.conciseness_score
                 WHEN ? = 'clarity_fluency' THEN r.clarity_score
                 WHEN ? = 'response_timing' THEN r.timing_score
                 ELSE r.composite_score
               END as previous_comp_score
        FROM session_responses r
        WHERE r.student_id = ? AND r.id != ?
        ORDER BY r.created_at DESC
        LIMIT 1
    """, (
        target_competency, target_competency, target_competency, 
        target_competency, target_competency, target_competency, 
        target_competency, target_competency, student_id, current_response_id
    ))
    prev_row = cursor.fetchone()

    if not prev_row:
        conn.close()
        return None # First attempt in this competency, baseline established

    prev_id = prev_row["id"]
    prev_score = float(prev_row["previous_comp_score"] or 2.5)
    prev_transcript = str(prev_row["transcript"] or "")

    delta = round(current_score - prev_score, 2)

    # Plain English narrative generation (Phase 12 Step 75)
    clean_comp_name = target_competency.replace("_", " ").title()
    if delta > 0.8:
        narrative = (
            f"Significant breakthrough in {clean_comp_name}: your score evolved from {prev_score:.1f} to {current_score:.1f} "
            f"(+{delta:.1f}). You provided substantially clearer structured evidence."
        )
    elif delta > 0.0:
        narrative = (
            f"Steady improvement in {clean_comp_name}: score increased from {prev_score:.1f} to {current_score:.1f} "
            f"(+{delta:.1f}). Continue refining technical depth."
        )
    elif delta == 0.0:
        narrative = (
            f"Plateau in {clean_comp_name}: score remained steady at {current_score:.1f}. "
            f"Review suggested rubric adjustments for further gains."
        )
    else:
        narrative = (
            f"Regression in {clean_comp_name}: score shifted from {prev_score:.1f} to {current_score:.1f} "
            f"({delta:.1f}). Ensure you directly answer constraints before diving into tangential details."
        )

    # Record evolution log in database
    evolution_id = str(uuid.uuid4())
    cursor.execute("""
        INSERT INTO answer_evolutions (
            id, student_id, session_id, previous_response_id, 
            current_response_id, competency, previous_score, 
            current_score, delta_score, evolution_summary
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        evolution_id, student_id, session_id, prev_id, 
        current_response_id, target_competency, prev_score, 
        current_score, delta, narrative
    ))
    conn.commit()
    conn.close()

    return {
        "id": evolution_id,
        "competency": target_competency,
        "previous_score": prev_score,
        "current_score": current_score,
        "delta_score": delta,
        "summary": narrative,
        "previous_snippet": prev_transcript[:120] + "..." if len(prev_transcript) > 120 else prev_transcript,
        "current_snippet": current_transcript[:120] + "..." if len(current_transcript) > 120 else current_transcript
    }

def get_student_evolution_history(student_id: int) -> List[Dict[str, Any]]:
    """Returns chronological evolution records for the student dashboard"""
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT e.id, e.session_id, e.competency, e.previous_score, 
               e.current_score, e.delta_score, e.evolution_summary, e.created_at,
               r_prev.transcript as prev_transcript,
               r_curr.transcript as curr_transcript
        FROM answer_evolutions e
        LEFT JOIN session_responses r_prev ON e.previous_response_id = r_prev.id
        LEFT JOIN session_responses r_curr ON e.current_response_id = r_curr.id
        WHERE e.student_id = ?
        ORDER BY e.created_at DESC
    """, (student_id,))
    rows = cursor.fetchall()
    conn.close()

    results = []
    for r in rows:
        results.append({
            "id": r["id"],
            "competency": r["competency"],
            "previous_score": round(float(r["previous_score"]), 1),
            "current_score": round(float(r["current_score"]), 1),
            "delta_score": round(float(r["delta_score"]), 1),
            "summary": r["evolution_summary"],
            "created_at": str(r["created_at"]),
            "prev_snippet": r["prev_transcript"][:140] if r["prev_transcript"] else "",
            "curr_snippet": r["curr_transcript"][:140] if r["curr_transcript"] else ""
        })
    return results
