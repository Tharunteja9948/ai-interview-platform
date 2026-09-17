"""
Database initialization, schema migration, and dataset seeding
B.Tech CSE Final Year Project: Self-Learning AI Interview Platform
"""

import sqlite3
import json
import os
import hashlib
from typing import List, Dict, Any

DB_PATH = os.path.join(os.path.dirname(__file__), "interview_platform.db")
SCHEMA_PATH = os.path.join(os.path.dirname(__file__), "database", "schema.sql")
QUESTION_BANK_PATH = os.path.join(os.path.dirname(__file__), "data", "question_bank_50.json")

def hash_password(password: str) -> str:
    """Secure SHA-256 password hashing with static salt for final year demo"""
    salt = "btech_ai_interview_platform_salt_2026"
    return hashlib.sha256((password + salt).encode('utf-8')).hexdigest()

def verify_password(password: str, password_hash: str) -> bool:
    return hash_password(password) == password_hash

def get_db_connection():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

def init_db():
    """Initializes schema and seeds initial data (dummy accounts + 50+ questions)"""
    conn = get_db_connection()
    cursor = conn.cursor()

    # 1. Execute schema.sql
    if os.path.exists(SCHEMA_PATH):
        with open(SCHEMA_PATH, "r", encoding="utf-8") as f:
            cursor.executescript(f.read())
    conn.commit()

    # 2. Seed 5 dummy accounts (Phase 5 Step 30)
    cursor.execute("SELECT COUNT(*) FROM students")
    student_count = cursor.fetchone()[0]

    if student_count == 0:
        dummy_students = [
            ("rahul_sde", "rahul@college.edu", hash_password("pass123"), "Rahul Sharma", "CSE", 2026, "Software Developer", "Python, C++, React, DSA", "E-Commerce Microservice with Redis", 1, "student"),
            ("priya_p", "priya@college.edu", hash_password("pass123"), "Priya Patel", "CSE", 2026, "Software Developer", "Java, Spring Boot, MySQL", "Distributed Task Scheduler", 1, "student"),
            ("amit_v", "amit@college.edu", hash_password("pass123"), "Amit Verma", "IT", 2026, "Software Developer", "JavaScript, Node.js, MongoDB", "Real-Time Collaborative Code Editor", 1, "student"),
            ("sneha_r", "sneha@college.edu", hash_password("pass123"), "Sneha Reddy", "CSE", 2026, "Software Developer", "Python, FastAPI, Docker, PostgreSQL", "Machine Learning Pipeline Orchestrator", 1, "student"),
            ("faculty_hod", "hod_cse@college.edu", hash_password("admin123"), "Dr. K. Ramanathan (HOD)", "CSE", 2026, "Software Developer", "Faculty Oversight", "College Placement & Accreditation Analytics", 1, "faculty")
        ]
        
        cursor.executemany("""
            INSERT INTO students (
                username, email, password_hash, full_name, branch, grad_year, 
                target_role, skills_summary, projects_summary, microphone_consent, role_type
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, dummy_students)
        conn.commit()

        # Seed initial baseline skill profile for each dummy student
        cursor.execute("SELECT id FROM students WHERE role_type = 'student'")
        student_ids = [row[0] for row in cursor.fetchall()]
        
        standard_competencies = [
            "relevance", "structure", "technical_correctness", 
            "completeness", "evidence", "conciseness", 
            "clarity_fluency", "response_timing"
        ]
        
        # Initial baseline scores (starting at 2.5 on a 0-5 scale)
        for s_id in student_ids:
            for comp in standard_competencies:
                cursor.execute("""
                    INSERT OR IGNORE INTO student_skill_profiles (student_id, competency, current_score, attempts_count)
                    VALUES (?, ?, 2.5, 0)
                """, (s_id, comp))
        conn.commit()

    # 3. Seed question bank (Phase 6 Step 32: at least 50 questions)
    cursor.execute("SELECT COUNT(*) FROM questions")
    q_count = cursor.fetchone()[0]

    if q_count == 0 and os.path.exists(QUESTION_BANK_PATH):
        with open(QUESTION_BANK_PATH, "r", encoding="utf-8") as f:
            data = json.load(f)
            questions = data.get("questions", [])

            q_records = []
            for q in questions:
                q_records.append((
                    q["id"],
                    q.get("role", "Software Developer"),
                    q.get("category", "General"),
                    q["question_text"],
                    q["ideal_answer"],
                    q["primary_competency"],
                    q.get("secondary_competency", "clarity_fluency"),
                    q.get("difficulty", "entry"),
                    q.get("question_type", "technical"),
                    1 if q.get("is_baseline", False) else 0
                ))

            cursor.executemany("""
                INSERT OR REPLACE INTO questions (
                    id, role, category, question_text, ideal_answer,
                    primary_competency, secondary_competency, difficulty,
                    question_type, is_baseline
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, q_records)
            conn.commit()

    # 4. Migrate questions table to support live_priority_score and real_world_occurrences
    cursor.execute("PRAGMA table_info(questions)")
    columns = [row[1] for row in cursor.fetchall()]
    if "live_priority_score" not in columns:
        cursor.execute("ALTER TABLE questions ADD COLUMN live_priority_score REAL DEFAULT 1.0")
    if "real_world_occurrences" not in columns:
        cursor.execute("ALTER TABLE questions ADD COLUMN real_world_occurrences INTEGER DEFAULT 0")
    conn.commit()

    # 5. Seed Company Tiers & Target Companies (3 Categories)
    cursor.execute("SELECT COUNT(*) FROM company_tiers")
    if cursor.fetchone()[0] == 0:
        tiers = [
            ("tier1_product", "Product-Based Tech Giants (Tier 1)", "Top technology leaders focusing on deep algorithmic design, distributed scale, and system architecture.", "cyan"),
            ("tier2_startups", "High-Growth Startups & FinTech", "Fast-scaling tech unicorns prioritizing rapid problem solving, microservices, and practical ownership.", "purple"),
            ("tier3_enterprise", "Enterprise & Service Tech Giants", "Mass-recruiting IT leaders assessing core CS fundamentals, OOP, clean code, and communication clarity.", "emerald")
        ]
        cursor.executemany("INSERT OR REPLACE INTO company_tiers (id, name, description, badge_color) VALUES (?, ?, ?, ?)", tiers)

        companies = [
            # Tier 1
            ("google", "tier1_product", "Google", "Globe", "High emphasis on algorithmic trade-offs, clean scalable architecture, and edge-case handling.", "hard", "DSA, System Scale, Concurrency"),
            ("amazon", "tier1_product", "Amazon", "Package", "Heavy focus on STAR behavioral leadership principles, high-throughput backend services, and customer trust.", "hard", "Leadership Principles, Microservices, OOD"),
            ("microsoft", "tier1_product", "Microsoft", "Cpu", "Focus on system design, robust object-oriented patterns, and cloud computing principles.", "hard", "DSA, Cloud Design, OS"),
            ("meta", "tier1_product", "Meta", "Network", "Fast-paced algorithmic interviews testing rapid implementation and graph algorithms.", "hard", "Speed DSA, Distributed Systems"),
            
            # Tier 2
            ("cred", "tier2_startups", "CRED", "ShieldCheck", "FinTech architecture, high concurrency, low latency payment rails, and clean code craftsmanship.", "hard", "Kafka, Event-Driven Architecture, High Concurrency"),
            ("razorpay", "tier2_startups", "Razorpay", "Zap", "Payment gateways, idempotency, transactional consistency, and database locks.", "hard", "Databases, Distributed Locking, APIs"),
            ("uber", "tier2_startups", "Uber", "Navigation", "Geospatial indexing, dispatch algorithms, real-time tracking, and fault tolerance.", "hard", "Real-time streaming, Graph Algorithms"),
            ("flipkart", "tier2_startups", "Flipkart", "ShoppingBag", "Flash-sale scaling, inventory locking, search indexing, and resilient order management.", "medium", "System Design, Microservices, Redis"),
            
            # Tier 3
            ("tcs", "tier3_enterprise", "TCS (Digital & Ninja)", "Award", "Core computer science fundamentals, OOP concepts, SQL queries, and project walkthrough.", "medium", "Java/C++, OOP, SQL, STAR Communication"),
            ("infosys", "tier3_enterprise", "Infosys (Specialist Programmer)", "Terminal", "Data structures, problem solving, database normalization, and debugging logic.", "medium", "DSA Basics, DBMS, Software Engineering"),
            ("accenture", "tier3_enterprise", "Accenture", "Layers", "Logical reasoning, cloud fundamentals, software engineering lifecycle, and structured communication.", "entry", "Communication, SDLC, Cloud Basics"),
            ("cognizant", "tier3_enterprise", "Cognizant", "Code2", "Analytical problem solving, database queries, and web service integration.", "entry", "SQL, REST APIs, OOP")
        ]
        cursor.executemany("""
            INSERT OR REPLACE INTO companies (id, tier_id, name, logo_icon, description, difficulty_tier, typical_focus)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        """, companies)
        conn.commit()

    # 6. Seed Senior Alumni Placement Tips
    cursor.execute("SELECT COUNT(*) FROM senior_alumni_tips")
    if cursor.fetchone()[0] == 0:
        tips = [
            ("q_dsa_01", "Rahul Sharma", "Amazon SDE-1", "Interviewers specifically asked to explain space complexity and collision handling before jumping into code.", 2025, 1),
            ("q_sys_01", "Priya Patel", "Microsoft", "Make sure to clearly differentiate Write-Through vs Write-Back caching and explain TTL cache invalidation.", 2025, 1),
            ("q_star_01", "Amit Verma", "Google", "Follow the STAR format strictly: spend 70% of your explanation on Action and quantifiable Result metrics.", 2025, 1),
            ("q_oop_01", "Sneha Reddy", "TCS Digital", "Give a concrete code scenario showing why class inheritance creates fragile base class issues.", 2025, 1),
            ("q_db_01", "Vikramaditya", "Razorpay", "Explain how B+ trees minimize disk block lookups compared to binary search trees.", 2025, 1),
            ("q_dsa_04", "Karthik Raja", "Flipkart", "Always state the loop termination condition explicitly when explaining two-pointer cycle detection.", 2025, 1)
        ]
        cursor.executemany("""
            INSERT INTO senior_alumni_tips (question_id, senior_name, placed_company, tip_text, batch_year, verified)
            VALUES (?, ?, ?, ?, ?, ?)
        """, tips)
        conn.commit()

    # 7. Seed Roadblock Detours (Scaffolding when student gets stuck)
    cursor.execute("SELECT COUNT(*) FROM roadblock_detours")
    if cursor.fetchone()[0] == 0:
        detours = [
            ("q_db_01", "Let's take a quick detour: Can you explain how a simple Binary Search Tree locates a value in O(log N) time?", "Binary Search Tree Lookup", "Focus on comparing against current root: left if smaller, right if larger."),
            ("q_sys_01", "Let's take a quick detour: Can you explain what happens when memory runs full in a standard FIFO Queue?", "Queue Eviction Logic", "Oldest element at the head gets popped first."),
            ("q_star_01", "Let's take a quick detour: In one single sentence, what was the primary technical goal of your semester project?", "Project Situation Framing", "Keep it concise: What problem existed before you built it?"),
            ("q_dsa_01", "Let's take a quick detour: How would you search for a duplicate element using two nested for-loops?", "Brute Force Baseline", "Outer loop checks index i, inner loop checks j > i, comparing values.")
        ]
        cursor.executemany("""
            INSERT INTO roadblock_detours (parent_question_id, detour_prompt, stepping_stone_concept, hint_guidance)
            VALUES (?, ?, ?, ?)
        """, detours)
        conn.commit()

    # 8. Set initial live priority scores and real-world occurrences
    cursor.execute("UPDATE questions SET live_priority_score = 3.5, real_world_occurrences = 8 WHERE id IN ('q_dsa_01', 'q_star_01', 'q_db_01')")
    cursor.execute("UPDATE questions SET live_priority_score = 2.8, real_world_occurrences = 4 WHERE id IN ('q_sys_01', 'q_oop_01')")
    conn.commit()

    conn.close()

if __name__ == "__main__":
    init_db()
    print("Database schema created and initial datasets seeded successfully.")
