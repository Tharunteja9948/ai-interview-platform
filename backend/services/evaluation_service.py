"""
Answer Evaluation Service
B.Tech CSE Final Year Project: Self-Learning AI Interview Platform
Implements Phase 8 (Delivery signal extraction) and Phase 9 (Structured rubric evaluation)
"""

import os
import re
import json
import math
from typing import Dict, Any, Tuple
from dotenv import load_dotenv

load_dotenv()

# Try to import google genai if available
GEMINI_API_KEY = os.getenv("GEMINI_API_KEY", "")

FILLER_PATTERNS = [
    r"\bum\b", r"\buh\b", r"\ber\b", r"\bah\b", r"\blike\b", 
    r"\byou know\b", r"\bbasically\b", r"\bactually\b", 
    r"\bliterally\b", r"\bsort of\b", r"\bkind of\b", r"\bi mean\b"
]

def analyze_speech_delivery(transcript: str, duration_seconds: float) -> Dict[str, Any]:
    """
    Extracts objective acoustic/delivery proxy features:
    - Word count
    - Filler count and filler ratio
    - Speaking rate (WPM)
    - Pacing / Timing score (0-5)
    - Delivery Clarity score (0-5)
    """
    cleaned_text = transcript.strip()
    words = re.findall(r"\b[a-zA-Z0-9'-]+\b", cleaned_text.lower())
    word_count = len(words)

    # Count filler words
    filler_count = 0
    for pat in FILLER_PATTERNS:
        matches = re.findall(pat, cleaned_text.lower())
        filler_count += len(matches)

    # Estimate duration if not provided or 0
    if duration_seconds <= 0:
        # Standard conversational pace is ~130 wpm
        duration_seconds = max(10.0, (word_count / 130.0) * 60.0)

    # Words Per Minute (WPM)
    wpm = round((word_count / duration_seconds) * 60.0, 1) if duration_seconds > 0 else 0.0

    # Filler word ratio
    filler_ratio = (filler_count / max(1, word_count)) * 100.0

    # Pacing / Timing Score (0 - 5 scale based on Phase 3 rubric)
    # Optimal target: 120-155 WPM, 45-120 seconds duration
    if word_count < 10 or duration_seconds < 10:
        timing_score = 1.0
    elif 115 <= wpm <= 165 and 30 <= duration_seconds <= 150:
        timing_score = 5.0
    elif (95 <= wpm < 115 or 165 < wpm <= 185) and (20 <= duration_seconds <= 180):
        timing_score = 3.8
    elif (80 <= wpm < 95 or 185 < wpm <= 210):
        timing_score = 2.8
    else:
        timing_score = 1.8

    # Clarity / Fluency Score (0 - 5 scale based on filler ratio)
    if filler_ratio < 2.0 and word_count >= 20:
        clarity_score = 5.0
    elif filler_ratio < 4.5 and word_count >= 15:
        clarity_score = 4.0
    elif filler_ratio < 7.5:
        clarity_score = 3.0
    elif filler_ratio < 12.0:
        clarity_score = 2.0
    else:
        clarity_score = 1.0

    return {
        "word_count": word_count,
        "duration_seconds": round(duration_seconds, 1),
        "wpm": wpm,
        "filler_count": filler_count,
        "filler_ratio": round(filler_ratio, 1),
        "timing_score": timing_score,
        "clarity_score": clarity_score
    }

def evaluate_with_llm(
    question_text: str, 
    ideal_answer: str, 
    student_answer: str,
    primary_competency: str
) -> Dict[str, Any]:
    """
    Evaluates answer using Google Gemini API with temperature=0.2 for score reproducibility.
    Falls back to deterministic rule-based semantic analyzer if API key is not present.
    """
    # Check if Gemini API is available
    if GEMINI_API_KEY:
        try:
            from google import genai
            from google.genai import types
            client = genai.Client(api_key=GEMINI_API_KEY)

            system_instruction = """
You are a senior computer science placement interviewer.
Evaluate the candidate's answer against the ideal technical answer and rubric dimensions.
You MUST output ONLY a valid JSON object matching the following structure exactly, with NO markdown backticks or extra text:
{
  "relevance": 4.5,
  "structure": 4.0,
  "technical_correctness": 4.2,
  "completeness": 3.8,
  "evidence": 3.5,
  "conciseness": 4.0,
  "strengths": "Direct explanation of concepts and good naming conventions.",
  "improvements": "Could add explicit worst-case time complexity edge cases."
}
Scores MUST be floats from 0.0 to 5.0 according to these criteria:
0.0 - Completely incorrect, irrelevant, or missing.
3.0 - Acceptable baseline; understands core concepts with minor omissions.
5.0 - Flawless, precise, and senior-level depth.
"""

            user_prompt = f"""
Question: "{question_text}"
Ideal Reference Answer: "{ideal_answer}"
Primary Target Competency: {primary_competency}
Candidate's Spoken Answer: "{student_answer}"

Evaluate this answer. Return only JSON.
"""

            response = client.models.generate_content(
                model="gemini-2.5-flash",
                contents=user_prompt,
                config=types.GenerateContentConfig(
                    system_instruction=system_instruction,
                    temperature=0.2, # Low temperature for stability
                    response_mime_type="application/json"
                )
            )

            result_text = response.text.strip()
            clean_json = re.sub(r"^```(json)?", "", result_text)
            clean_json = re.sub(r"```$", "", clean_json).strip()
            parsed = json.loads(clean_json)

            return {
                "relevance": float(parsed.get("relevance", 3.0)),
                "structure": float(parsed.get("structure", 3.0)),
                "technical_correctness": float(parsed.get("technical_correctness", 3.0)),
                "completeness": float(parsed.get("completeness", 3.0)),
                "evidence": float(parsed.get("evidence", 3.0)),
                "conciseness": float(parsed.get("conciseness", 3.0)),
                "strengths": str(parsed.get("strengths", "Solid effort expressing core logic.")),
                "improvements": str(parsed.get("improvements", "Continue refining structured problem decomposition.")),
                "mode": "llm_gemini"
            }
        except Exception as e:
            print(f"[EvaluationService] LLM evaluation exception ({e}), falling back to deterministic heuristic.")

    # Deterministic Rule-Based Semantic Heuristic (Offline / Fallback Mode)
    return evaluate_deterministic_fallback(question_text, ideal_answer, student_answer, primary_competency)

def evaluate_deterministic_fallback(
    question_text: str, 
    ideal_answer: str, 
    student_answer: str, 
    primary_competency: str
) -> Dict[str, Any]:
    """
    Transparent, explainable heuristic matching keyword concepts, length density, and STAR markers.
    Guarantees deterministic scoring when offline.
    """
    words = re.findall(r"\b\w+\b", student_answer.lower())
    n_words = len(words)
    
    if n_words < 5 or "no response" in student_answer.lower():
        return {
            "relevance": 0.5,
            "structure": 0.5,
            "technical_correctness": 0.5,
            "completeness": 0.5,
            "evidence": 0.5,
            "conciseness": 1.0,
            "strengths": "Prompt received.",
            "improvements": "Please speak or type a complete answer so competency can be assessed.",
            "mode": "deterministic_heuristic"
        }

    # Extract keywords (>3 letters) from ideal answer
    ideal_words = set(w for w in re.findall(r"\b\w+\b", ideal_answer.lower()) if len(w) > 3)
    matched_words = ideal_words.intersection(set(words))
    match_ratio = len(matched_words) / max(1, len(ideal_words))

    # Base technical correctness score
    tech_score = round(min(5.0, 1.5 + (match_ratio * 4.2)), 1)
    if n_words > 40:
        tech_score = min(5.0, tech_score + 0.5)

    # Relevance: penalize if off-topic or zero keyword overlap
    relevance_score = round(min(5.0, 2.0 + (match_ratio * 3.5)), 1)
    if n_words < 15:
        relevance_score = min(2.5, relevance_score)

    # Structure: check for transition words and STAR indicators
    star_indicators = ["situation", "task", "action", "result", "firstly", "then", "finally", "because", "therefore", "in contrast", "for example", "specifically"]
    star_matches = sum(1 for ind in star_indicators if ind in student_answer.lower())
    structure_score = round(min(5.0, 2.0 + (star_matches * 0.75)), 1)

    # Completeness: based on substantive length and topic coverage
    completeness_score = round(min(5.0, 1.5 + (match_ratio * 2.5) + (min(100, n_words) / 50.0)), 1)

    # Evidence: check for concrete numbers, project mentions, and metrics
    evidence_markers = ["percent", "%", "ms", "latency", "redis", "postgres", "sql", "github", "team", "project", "implemented", "built", "designed", "cache"]
    evid_matches = sum(1 for em in evidence_markers if em in student_answer.lower())
    evidence_score = round(min(5.0, 1.5 + (evid_matches * 0.7)), 1)

    # Conciseness: penalize overly verbose or overly sparse
    if 30 <= n_words <= 120:
        conciseness_score = 4.5
    elif 20 <= n_words < 30 or 120 < n_words <= 200:
        conciseness_score = 3.5
    else:
        conciseness_score = 2.0

    # Boost primary competency slightly if evidence is present
    if primary_competency == "structure":
        strengths = "Identified key components of the solution."
        improvements = "Adopt the STAR (Situation, Task, Action, Result) framework more explicitly to structure technical stories."
    elif primary_competency == "evidence":
        strengths = "Referred to technical scenarios."
        improvements = "Quantify your impact with explicit numbers (e.g. latency, users, tests passed) to provide stronger evidence."
    elif primary_competency == "technical_correctness":
        strengths = f"Mentioned relevant concepts: {', '.join(list(matched_words)[:4])}."
        improvements = "Include exact time/space complexities (Big-O) and discuss trade-offs."
    else:
        strengths = "Articulated response in clear terms."
        improvements = "Continue practicing concise technical synthesis with domain terms."

    return {
        "relevance": relevance_score,
        "structure": structure_score,
        "technical_correctness": tech_score,
        "completeness": completeness_score,
        "evidence": evidence_score,
        "conciseness": conciseness_score,
        "strengths": strengths,
        "improvements": improvements,
        "mode": "deterministic_heuristic"
    }

def analyze_answer_full(
    question_text: str,
    ideal_answer: str,
    student_answer: str,
    primary_competency: str,
    duration_seconds: float = 0.0
) -> Dict[str, Any]:
    """
    Main evaluation pipeline combining LLM content evaluation with rule-based acoustic delivery.
    Calculates the master composite score:
    Composite = 0.70 * ContentScore + 0.30 * DeliveryScore
    """
    # 1. Delivery analysis (Phase 8)
    delivery = analyze_speech_delivery(student_answer, duration_seconds)

    # 2. Content analysis (Phase 9)
    content = evaluate_with_llm(question_text, ideal_answer, student_answer, primary_competency)

    # 3. Master Composite calculation (Phase 3)
    content_avg = (
        content["relevance"] + 
        content["structure"] + 
        content["technical_correctness"] + 
        content["completeness"] + 
        content["evidence"] + 
        content["conciseness"]
    ) / 6.0

    delivery_avg = (delivery["clarity_score"] + delivery["timing_score"]) / 2.0
    composite_score = round((0.70 * content_avg) + (0.30 * delivery_avg), 2)

    return {
        "scores": {
            "relevance": content["relevance"],
            "structure": content["structure"],
            "technical_correctness": content["technical_correctness"],
            "completeness": content["completeness"],
            "evidence": content["evidence"],
            "conciseness": content["conciseness"],
            "clarity_fluency": delivery["clarity_score"],
            "response_timing": delivery["timing_score"],
            "content_composite": round(content_avg, 2),
            "delivery_composite": round(delivery_avg, 2),
            "total_composite": composite_score
        },
        "delivery_metrics": delivery,
        "strengths": content["strengths"],
        "improvements": content["improvements"],
        "eval_mode": content.get("mode", "hybrid")
    }

if __name__ == "__main__":
    test_q = "Explain how a Hash Table handles collisions."
    test_ideal = "Hash tables handle collisions using separate chaining with linked lists or open addressing."
    test_ans = "A hash table handles collisions primarily using separate chaining or open addressing with linear probing. In chaining, each bucket has a linked list. Average search is O(1) but worst case can degrade to O(N)."
    res = analyze_answer_full(test_q, test_ideal, test_ans, "technical_correctness", 45.0)
    print("Test Evaluation Result:")
    print(json.dumps(res, indent=2))
