"""
Student Skill Profile Service
B.Tech CSE Final Year Project: Self-Learning AI Interview Platform
Implements Phase 10: Persistent longitudinal skill model using Weighted Moving Average
"""

import sqlite3
from typing import Dict, List, Tuple, Any
from backend.database import get_db_connection

STANDARD_COMPETENCIES = [
    "relevance", "structure", "technical_correctness", 
    "completeness", "evidence", "conciseness", 
    "clarity_fluency", "response_timing"
]

ALPHA = 0.40 # Moving average weight for latest attempt

def get_student_profile(student_id: int) -> Dict[str, Any]:
    """
    Retrieves student's longitudinal competency vector,
    categorizing each into 'weak', 'developing', or 'strong'.
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        SELECT competency, current_score, attempts_count, last_updated 
        FROM student_skill_profiles 
        WHERE student_id = ?
    """, (student_id,))
    rows = cursor.fetchall()
    conn.close()

    profile_dict = {}
    for r in rows:
        profile_dict[r["competency"]] = {
            "score": round(float(r["current_score"]), 2),
            "attempts": int(r["attempts_count"]),
            "last_updated": str(r["last_updated"])
        }

    # Ensure all 8 standard competencies exist
    for comp in STANDARD_COMPETENCIES:
        if comp not in profile_dict:
            profile_dict[comp] = {"score": 2.5, "attempts": 0, "last_updated": None}

    # Categorize and find lowest 2 competencies
    sorted_skills = sorted(profile_dict.items(), key=lambda x: x[1]["score"])
    lowest_two = [item[0] for item in sorted_skills[:2]]
    highest_two = [item[0] for item in sorted_skills[-2:]]

    # Calculate overall campus readiness index (0 to 100%)
    total_score = sum(item["score"] for item in profile_dict.values())
    max_possible = len(STANDARD_COMPETENCIES) * 5.0
    readiness_percentage = round((total_score / max_possible) * 100.0, 1)

    # Classify each skill
    classified = {}
    for comp, data in profile_dict.items():
        s = data["score"]
        if s < 2.5:
            tier = "weak"
        elif s < 3.8:
            tier = "developing"
        else:
            tier = "strong"
        classified[comp] = {**data, "tier": tier}

    return {
        "student_id": student_id,
        "readiness_percentage": readiness_percentage,
        "competencies": classified,
        "lowest_two_competencies": lowest_two,
        "highest_two_competencies": highest_two,
        "formula": "EWMA: Skill_new = 0.40 * AttemptScore + 0.60 * Skill_old"
    }

def update_student_skill_profile(
    student_id: int, 
    new_scores: Dict[str, float]
) -> Dict[str, Any]:
    """
    Applies Exponential Weighted Moving Average (EWMA) to update student skill profile:
    Skill_new = alpha * Score_t + (1 - alpha) * Skill_{t-1}
    """
    conn = get_db_connection()
    cursor = conn.cursor()

    updated_profile = {}

    for comp in STANDARD_COMPETENCIES:
        if comp in new_scores:
            incoming_score = float(new_scores[comp])

            # Fetch current score
            cursor.execute("""
                SELECT current_score, attempts_count 
                FROM student_skill_profiles 
                WHERE student_id = ? AND competency = ?
            """, (student_id, comp))
            row = cursor.fetchone()

            if row:
                old_score = float(row["current_score"])
                attempts = int(row["attempts_count"])
                
                # If first attempt, take raw score; else apply EWMA
                if attempts == 0:
                    updated_val = incoming_score
                else:
                    updated_val = (ALPHA * incoming_score) + ((1.0 - ALPHA) * old_score)
                
                updated_val = round(min(5.0, max(0.0, updated_val)), 2)
                cursor.execute("""
                    UPDATE student_skill_profiles 
                    SET current_score = ?, attempts_count = attempts_count + 1, last_updated = CURRENT_TIMESTAMP
                    WHERE student_id = ? AND competency = ?
                """, (updated_val, student_id, comp))
                updated_profile[comp] = {"old": old_score, "new": updated_val}
            else:
                updated_val = round(min(5.0, max(0.0, incoming_score)), 2)
                cursor.execute("""
                    INSERT INTO student_skill_profiles (student_id, competency, current_score, attempts_count)
                    VALUES (?, ?, ?, 1)
                """, (student_id, comp, updated_val))
                updated_profile[comp] = {"old": 2.5, "new": updated_val}

    conn.commit()
    conn.close()

    return updated_profile
