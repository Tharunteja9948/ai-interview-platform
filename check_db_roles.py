import sqlite3

conn = sqlite3.connect('backend/interview_platform.db')
cursor = conn.cursor()

print("--- DISTINCT ROLES ---")
cursor.execute("SELECT DISTINCT role, COUNT(*) FROM questions GROUP BY role")
for r in cursor.fetchall():
    print(r)

print("\n--- FRONTEND QUESTIONS ---")
cursor.execute("SELECT id, role, category, question_text FROM questions WHERE role LIKE '%Frontend%'")
for r in cursor.fetchall():
    print(r)

print("\n--- DATA ENGINEER QUESTIONS ---")
cursor.execute("SELECT id, role, category, question_text FROM questions WHERE role LIKE '%Data%'")
for r in cursor.fetchall():
    print(r)
conn.close()
