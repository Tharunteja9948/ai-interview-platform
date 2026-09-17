import sqlite3
from backend.services.dynamic_question_service import ROLE_QUESTION_CATALOG

conn = sqlite3.connect('backend/interview_platform.db')
cursor = conn.cursor()

cursor.execute("SELECT DISTINCT role, COUNT(*) FROM questions GROUP BY role")
print("Existing roles in database:", cursor.fetchall())

# Seed all questions from ROLE_QUESTION_CATALOG into the database for each role
total_added = 0
for role_name, q_list in ROLE_QUESTION_CATALOG.items():
    for q in q_list:
        qid = f"q_seed_{role_name.lower().replace(' ', '_').replace('/', '_')[:10]}_{abs(hash(q['question'])) % 100000}"
        cursor.execute("""
            INSERT OR REPLACE INTO questions (
                id, role, category, question_text, ideal_answer,
                primary_competency, secondary_competency, difficulty,
                live_priority_score, real_world_occurrences, target_company
            ) VALUES (?, ?, ?, ?, ?, ?, 'structure', ?, 3.5, 2, 'general')
        """, (
            qid, role_name, q['category'], q['question'], q['ideal_answer'],
            q['competency'], q.get('difficulty', 'mid')
        ))
        
        # Add senior alumni tip
        cursor.execute("""
            INSERT OR REPLACE INTO senior_alumni_tips (
                question_id, senior_name, placed_company, tip_text, batch_year, verified
            ) VALUES (?, ?, ?, ?, 2026, 1)
        """, (
            qid, f"Senior {role_name}", "Top Tech Firm", q['senior_tip']
        ))
        total_added += 1

conn.commit()
cursor.execute("SELECT DISTINCT role, COUNT(*) FROM questions GROUP BY role")
print("Updated roles in database:", cursor.fetchall())
print(f"Total seeded questions: {total_added}")
conn.close()
