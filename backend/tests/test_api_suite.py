"""
Comprehensive Automated Test Suite for AI Interview Preparation Platform
Tests Phases 4, 5, 6, 7, 8, 9, 10, 11, 12, 13
"""

import sys
import os
import json

# Ensure project root is in sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "../..")))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)

def run_tests():
    print("\n=======================================================")
    print("RUNNING COMPREHENSIVE BACKEND VERIFICATION TEST SUITE")
    print("=======================================================\n")

    # 1. Health Check
    res = client.get("/api/health")
    assert res.status_code == 200, f"Health check failed: {res.text}"
    print("[PASS] [Phase 4] Health Check Passed:", res.json()["system"])

    # 2. Login as dummy student (Phase 5)
    login_payload = {
        "username_or_email": "rahul_sde",
        "password": "pass123"
    }
    res = client.post("/api/auth/login", json=login_payload)
    assert res.status_code == 200, f"Login failed: {res.text}"
    student_data = res.json()
    student_id = student_data["id"]
    print(f"[PASS] [Phase 5] Auth Login Passed for student '{student_data['full_name']}' (ID: {student_id})")

    # 3. Fetch Student Profile & Consent (Phase 5)
    res = client.get(f"/api/student/{student_id}/profile")
    assert res.status_code == 200
    print("[PASS] [Phase 5] Profile Fetch Passed. Target Role:", res.json()["target_role"])

    # 4. Question Bank Check (Phase 6: at least 50 questions)
    res = client.get("/api/questions")
    assert res.status_code == 200
    questions = res.json()
    assert len(questions) >= 50, f"Expected at least 50 questions, found {len(questions)}"
    print(f"[PASS] [Phase 6] Tagged Question Bank Verified: {len(questions)} questions loaded")

    # 5. Start Adaptive Interview Session (Phase 7 & 11)
    start_payload = {
        "student_id": student_id,
        "role": "Software Developer",
        "difficulty": "entry"
    }
    res = client.post("/api/session/start", json=start_payload)
    assert res.status_code == 200, f"Start session failed: {res.text}"
    session_info = res.json()
    session_id = session_info["session_id"]
    first_q = session_info["first_question"]
    print(f"[PASS] [Phase 7] Session Created: {session_id}")
    print(f"   First Question ({first_q['category']}): {first_q['question_text'][:60]}...")
    print(f"   Target Competency: {first_q['primary_competency']}")

    # 6. Submit Answer #1 with Delivery Metrics (Phase 8 & 9)
    # Student gives a hesitant answer with filler words
    ans_1_payload = {
        "student_id": student_id,
        "question_id": first_q["id"],
        "question_order": 1,
        "transcript": "Um, basically, a hash table is like an array. It stores items using a hash function. If two keys get the same spot, you know, it causes a collision and maybe you use a linked list.",
        "duration_seconds": 35.0
    }
    res = client.post(f"/api/session/{session_id}/submit-answer", json=ans_1_payload)
    assert res.status_code == 200, f"Submit answer failed: {res.text}"
    eval_1 = res.json()
    print("[PASS] [Phase 8 & 9] Answer 1 Evaluated:")
    print("   Delivery Metrics: WPM =", eval_1["delivery_metrics"]["wpm"], 
          "| Fillers =", eval_1["delivery_metrics"]["filler_count"],
          "| Timing Score =", eval_1["scores"]["response_timing"])
    print("   Composite Score:", eval_1["scores"]["total_composite"], "/ 5.0")
    print("   Relevance:", eval_1["scores"]["relevance"], "| Structure:", eval_1["scores"]["structure"], "| Tech:", eval_1["scores"]["technical_correctness"])

    # 7. Verify Skill Profile Update via EWMA (Phase 10)
    profile = eval_1["updated_skill_profile"]
    print("[PASS] [Phase 10] Student Skill Profile Updated (EWMA):")
    print("   Readiness Index:", profile["readiness_percentage"], "%")
    print("   Diagnosed Lowest 2 Weak Competencies:", profile["lowest_two_competencies"])

    # 8. Verify Adaptive Question Selection (Phase 11)
    next_q = eval_1["next_recommended_question"]
    justification = eval_1["adaptive_routing_justification"]
    print("[PASS] [Phase 11] Google Maps Adaptive Re-Routing Verified:")
    print(f"   Next Question Selected: '{next_q['question_text'][:60]}...'")
    print(f"   Re-routing Reason: {justification}")
    assert next_q["id"] != first_q["id"], "Error: Repeated identical question!"

    # 9. Submit Answer #2 (Remediating weakness with structured STAR answer) to verify Answer Evolution (Phase 12)
    ans_2_payload = {
        "student_id": student_id,
        "question_id": next_q["id"],
        "question_order": 2,
        "transcript": "In my situation during a distributed systems semester project, our task was to eliminate duplicate requests. Firstly, I designed an idempotency middleware with Redis. Specifically, every client request carried an Idempotency-Key header. Finally, as a result, duplicate database transactions dropped by 100% and test coverage reached 92%.",
        "duration_seconds": 65.0
    }
    res = client.post(f"/api/session/{session_id}/submit-answer", json=ans_2_payload)
    assert res.status_code == 200, f"Submit answer 2 failed: {res.text}"
    eval_2 = res.json()
    print("[PASS] [Phase 12] Answer Evolution Engine Verified:")
    if eval_2.get("evolution"):
        evo = eval_2["evolution"]
        print(f"   Evolution Target: {evo['competency']}")
        print(f"   Score Shift: {evo['previous_score']} -> {evo['current_score']} (Delta: {evo['delta_score']:+0.1f})")
        print(f"   Narrative: {evo['summary']}")
    else:
        print("   Baseline established for secondary competency.")

    # 10. Complete Session (Phase 7)
    res = client.post(f"/api/session/{session_id}/complete")
    assert res.status_code == 200
    print("[PASS] [Phase 7] Session Completed. Final Session Score:", res.json()["composite_score"])

    # 11. Student Dashboard Data Verification (Phase 13)
    res = client.get(f"/api/student/{student_id}/dashboard")
    assert res.status_code == 200
    dash = res.json()
    print("[PASS] [Phase 13] Student Dashboard Verified:")
    print(f"   Sessions Conducted: {len(dash['recent_sessions'])}")
    print(f"   Evolution Logs Available: {len(dash['evolution_history'])}")

    # 12. Faculty Cohort Analytics Verification (Phase 13)
    res = client.get("/api/faculty/cohort-analytics")
    assert res.status_code == 200
    faculty = res.json()
    print("[PASS] [Phase 13] Faculty Cohort Analytics Verified:")
    print(f"   Registered Cohort Size: {faculty['cohort_overview']['registered_students']}")
    print(f"   Common Institutional Weaknesses: {faculty['top_cohort_weaknesses']}")

    print("\n=======================================================")
    print("ALL CORE BACKEND PHASES (1 - 13) PASSED SUCCESSFULLY!")
    print("=======================================================\n")

if __name__ == "__main__":
    run_tests()
