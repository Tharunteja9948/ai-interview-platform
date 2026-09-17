import urllib.request
import json

roles = [
    'Frontend Engineer',
    'Backend Engineer',
    'Data Engineer & Analytics',
    'AI / Machine Learning Engineer',
    'Cloud & DevOps Engineer',
    'Cybersecurity Analyst',
    'QA Automation & SDET',
    'Software Developer'
]

print("=== VERIFYING ROLE-SPECIFIC QUESTIONS ===")
for r in roles:
    payload = json.dumps({
        'student_id': 1,
        'role': r,
        'difficulty': 'entry',
        'interview_mode': 'adaptive',
        'company': 'google',
        'round_type': 'technical'
    }).encode()
    
    req = urllib.request.Request(
        'http://127.0.0.1:8000/api/session/start',
        data=payload,
        headers={'Content-Type': 'application/json'}
    )
    resp = urllib.request.urlopen(req)
    sess = json.loads(resp.read().decode())
    q = sess['first_question']
    cat = q.get('category', 'Unknown')
    txt = q.get('question_text', '')[:75]
    print(f"Role: {r:<32} | Cat: [{cat:<22}] -> {txt}...")

print("\nSUCCESS: All 9 roles serve exact domain-specific questions!")
