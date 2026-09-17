"""
Authentication and Student Profile Management
B.Tech CSE Final Year Project: Self-Learning AI Interview Platform
Implements Phase 5: Student portal, registration, login, profile, and consent audit logs
"""

import sqlite3
from typing import Dict, Any, Optional
from pydantic import BaseModel, EmailStr
from backend.database import get_db_connection, hash_password, verify_password

class RegisterRequest(BaseModel):
    username: str
    email: str
    password: str
    full_name: Optional[str] = None
    branch: Optional[str] = "Computer Science & Engineering"
    grad_year: Optional[int] = 2026
    target_role: Optional[str] = "Software Developer"
    skills_summary: Optional[str] = ""
    projects_summary: Optional[str] = ""
    microphone_consent: Optional[bool] = True

class LoginRequest(BaseModel):
    username: Optional[str] = None
    username_or_email: Optional[str] = None
    email: Optional[str] = None
    password: str

class ConsentRequest(BaseModel):
    student_id: int
    consent_type: str = "microphone_recording"
    granted: bool

def register_student(data: RegisterRequest) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()

    # Check for duplicate username or email
    cursor.execute("SELECT id FROM students WHERE LOWER(username) = ? OR LOWER(email) = ?", 
                   (data.username.lower(), data.email.lower()))
    if cursor.fetchone():
        conn.close()
        raise ValueError("Username or Email already registered in the system.")

    full_name = data.full_name or data.username.replace("_", " ").title()
    pwd_hash = hash_password(data.password)
    cursor.execute("""
        INSERT INTO students (
            username, email, password_hash, full_name, branch, grad_year,
            target_role, skills_summary, projects_summary, microphone_consent
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    """, (
        data.username, data.email, pwd_hash, full_name,
        data.branch, data.grad_year, data.target_role,
        data.skills_summary, data.projects_summary, 1 if data.microphone_consent else 0
    ))
    new_id = cursor.lastrowid

    # Seed baseline competency vector for new student
    standard_competencies = [
        "relevance", "structure", "technical_correctness", 
        "completeness", "evidence", "conciseness", 
        "clarity_fluency", "response_timing"
    ]
    for comp in standard_competencies:
        cursor.execute("""
            INSERT INTO student_skill_profiles (student_id, competency, current_score, attempts_count)
            VALUES (?, ?, 2.5, 0)
        """, (new_id, comp))

    # Log initial consent
    cursor.execute("""
        INSERT INTO audit_consent_logs (student_id, consent_type, granted)
        VALUES (?, 'microphone_recording', ?)
    """, (new_id, 1 if data.microphone_consent else 0))

    conn.commit()
    conn.close()

    user_info = {
        "id": new_id,
        "username": data.username,
        "email": data.email,
        "full_name": full_name,
        "target_role": data.target_role,
        "role_type": "student"
    }

    return {
        "message": "User registered successfully",
        "user": user_info,
        **user_info
    }

def login_student(data: LoginRequest) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()

    ident = (data.username or data.username_or_email or data.email or "").strip().lower()
    if not ident:
        conn.close()
        raise ValueError("Username or Email is required.")

    cursor.execute("""
        SELECT id, username, email, password_hash, full_name, branch, 
               grad_year, target_role, skills_summary, projects_summary, 
               microphone_consent, role_type
        FROM students 
        WHERE LOWER(username) = ? OR LOWER(email) = ?
    """, (ident, ident))
    row = cursor.fetchone()
    conn.close()

    if not row:
        raise ValueError("Invalid username or password.")

    if not verify_password(data.password, row["password_hash"]):
        raise ValueError("Invalid username or password.")

    user_info = {
        "id": row["id"],
        "username": row["username"],
        "email": row["email"],
        "full_name": row["full_name"],
        "branch": row["branch"],
        "grad_year": row["grad_year"],
        "target_role": row["target_role"],
        "skills_summary": row["skills_summary"],
        "projects_summary": row["projects_summary"],
        "microphone_consent": bool(row["microphone_consent"]),
        "role_type": row["role_type"]
    }

    return {
        "message": "Login successful",
        "user": user_info,
        **user_info
    }

def update_profile(student_id: int, updates: Dict[str, Any]) -> Dict[str, Any]:
    conn = get_db_connection()
    cursor = conn.cursor()

    cursor.execute("""
        UPDATE students
        SET target_role = COALESCE(?, target_role),
            skills_summary = COALESCE(?, skills_summary),
            projects_summary = COALESCE(?, projects_summary),
            microphone_consent = COALESCE(?, microphone_consent)
        WHERE id = ?
    """, (
        updates.get("target_role"),
        updates.get("skills_summary"),
        updates.get("projects_summary"),
        1 if updates.get("microphone_consent") else 0 if "microphone_consent" in updates else None,
        student_id
    ))
    conn.commit()
    conn.close()

    return {"status": "success", "message": "Profile updated"}
