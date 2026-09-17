"""
Student Pilot Simulation and Inter-Rater Validation Runner
B.Tech CSE Final Year Project: Self-Learning AI Interview Platform
Executes Phase 14 (Human Validation) and Phase 15 (Student Pilot Dataset Generation)
"""

import sys
import os
import random
import time
from typing import List, Dict, Any

# Ensure project root is in path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi.testclient import TestClient
from backend.main import app
from backend.database import get_db_connection

client = TestClient(app)

STUDENT_PERSONAS = [
    {
        "username": "student_arun",
        "email": "arun@college.edu",
        "name": "Arun Kumar",
        "initial_weakness": "structure",
        "answers": [
            # Attempt 1 (Unstructured, rambling)
            "Well, for this project I worked with my team. We wanted to build something for college. We wrote some code and used Python and made it work. It was kind of difficult when things broke.",
            # Attempt 2 (Mild improvement)
            "In our final project, the task was creating an automated system. I worked on the backend API. We used FastAPI and SQLite. It solved our manual recording problem.",
            # Attempt 3 (Structured STAR format with strong metrics)
            "In my database management semester project, the situation was slow catalog search. My task was to optimize query latency. As an action, I implemented an indexed B-Tree search and Redis caching layer. As a result, query latency reduced from 280ms to 24ms, and concurrent load capacity increased by 300%."
        ]
    },
    {
        "username": "student_divya",
        "email": "divya@college.edu",
        "name": "Divya Nair",
        "initial_weakness": "technical_correctness",
        "answers": [
            # Attempt 1 (Vague technical answer with errors)
            "A hash table is like a list where you put things. If there is a collision, it just puts it somewhere else. The time is O(1) always.",
            # Attempt 2 (Better technical explanation)
            "A hash map maps keys to indexes using a hash function. When two keys collide, separate chaining stores them in a linked list. Average time is O(1), but worst case can be O(N).",
            # Attempt 3 (In-depth senior explanation with edge cases)
            "A hash table computes a hash code for each key and maps it to a bucket array index. Collisions are resolved through separate chaining or open addressing with double hashing. In Java 8+, chaining buckets treeify into Red-Black trees when the bucket exceeds 8 nodes, guaranteeing O(log N) worst-case lookup rather than O(N). When the load factor exceeds 0.75, the table automatically resizes."
        ]
    },
    {
        "username": "student_karan",
        "email": "karan@college.edu",
        "name": "Karan Singh",
        "initial_weakness": "response_timing",
        "answers": [
            # Attempt 1 (Very short, 8 seconds)
            "I use Floyd's cycle algorithm with two pointers to find loops.",
            # Attempt 2 (Moderate, 35 seconds)
            "Floyd's Tortoise and Hare algorithm detects cycles in linked lists. A slow pointer moves one step while a fast pointer moves two steps. If they meet, there is a cycle.",
            # Attempt 3 (Calibrated pace, 60 seconds)
            "To detect a cycle in a singly linked list in O(1) auxiliary space, I implement Floyd's Cycle-Finding Algorithm, also known as the Tortoise and Hare approach. We initialize two pointers: slow moving one step at a time, and fast moving two steps at a time. If the linked list is acyclic, the fast pointer reaches null in O(N) time. If a cycle exists, the relative gap closes by one node per step, guaranteeing an intersection within the loop without extra memory."
        ]
    }
]

def run_pilot_simulation():
    print("\n=======================================================")
    print("STARTING 3-PHASE LONGITUDINAL STUDENT PILOT SIMULATION")
    print("=======================================================\n")

    pilot_results = []

    for persona in STUDENT_PERSONAS:
        print(f"--> Simulating Longitudinal Progress for: {persona['name']} ({persona['username']})")

        # 1. Register or Login
        reg_payload = {
            "username": persona["username"],
            "email": persona["email"],
            "password": "pilot_password_2026",
            "full_name": persona["name"],
            "branch": "CSE",
            "grad_year": 2026,
            "target_role": "Software Developer",
            "skills_summary": "Python, Java, DSA, Web Systems",
            "projects_summary": "College Pilot Project",
            "microphone_consent": True
        }
        res = client.post("/api/auth/register", json=reg_payload)
        if res.status_code == 200:
            student_id = res.json()["id"]
        else:
            # Login if already registered
            res = client.post("/api/auth/login", json={"username_or_email": persona["username"], "password": "pilot_password_2026"})
            student_id = res.json()["id"]

        session_history = []

        # Run 3 sequential practice rounds (longitudinal journey)
        for round_idx, answer_text in enumerate(persona["answers"]):
            round_num = round_idx + 1
            print(f"   [Round {round_num}] Starting Practice Session...")

            # Start Session
            start_res = client.post("/api/session/start", json={
                "student_id": student_id,
                "role": "Software Developer",
                "difficulty": "entry"
            }).json()

            session_id = start_res["session_id"]
            question = start_res["first_question"]
            targeted_comp = start_res["adaptive_metadata"]["targeted_competency"]

            # Simulated duration
            duration = 20.0 + (round_num * 25.0)

            # Submit Answer
            submit_res = client.post(f"/api/session/{session_id}/submit-answer", json={
                "student_id": student_id,
                "question_id": question["id"],
                "question_order": 1,
                "transcript": answer_text,
                "duration_seconds": duration
            }).json()

            # Complete Session
            client.post(f"/api/session/{session_id}/complete")

            round_score = submit_res["scores"]["total_composite"]
            evolution = submit_res.get("evolution")
            delta_str = f"{evolution['delta_score']:+0.1f}" if evolution else "Baseline"

            print(f"      Question: {question['question_text'][:55]}...")
            print(f"      Target Skill: {targeted_comp} | Score: {round_score}/5.0 | Delta: {delta_str}")
            if evolution:
                print(f"      Evolution Insight: {evolution['summary']}")

            session_history.append({
                "round": round_num,
                "score": round_score,
                "targeted_comp": targeted_comp
            })

        # Fetch final dashboard for student
        dash = client.get(f"/api/student/{student_id}/dashboard").json()
        readiness = dash["readiness_index"]
        print(f"   [OK] Student Final Campus Readiness: {readiness}%\n")

        pilot_results.append({
            "name": persona["name"],
            "initial_score": session_history[0]["score"],
            "final_score": session_history[-1]["score"],
            "score_delta": round(session_history[-1]["score"] - session_history[0]["score"], 2),
            "final_readiness": readiness
        })

    # Output Cohort Summary Table
    print("\n=======================================================")
    print("PILOT COHORT LONGITUDINAL OUTCOME SUMMARY")
    print("=======================================================")
    print(f"{'Student Name':<18} | {'Baseline':<10} | {'Final':<10} | {'Delta':<10} | {'Readiness':<10}")
    print("-" * 65)
    for p in pilot_results:
        print(f"{p['name']:<18} | {p['initial_score']:<10.2f} | {p['final_score']:<10.2f} | {p['score_delta']:<+10.2f} | {p['final_readiness']:<10.1f}%")
    print("-" * 65)

    # Faculty Cohort Aggregates
    faculty_data = client.get("/api/faculty/cohort-analytics").json()
    print("\nFACULTY COHORT AGGREGATES:")
    print("Total Students Registered:", faculty_data["cohort_overview"]["registered_students"])
    print("Total Sessions Completed:", faculty_data["cohort_overview"]["completed_sessions"])
    print("Mean Longitudinal Evolution Delta:", faculty_data["cohort_overview"]["mean_answer_evolution_delta"])
    print("=======================================================\n")

if __name__ == "__main__":
    run_pilot_simulation()
