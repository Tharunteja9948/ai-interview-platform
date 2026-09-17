# Phase 14: Human Validation and Inter-Rater Reliability Report

**Project Title**: Self-Learning AI Interview Preparation Platform  
**Target Milestone**: AI Scoring Ground-Truth Agreement & Metric Calibration

---

## 1. Experimental Methodology
To validate the reliability of the automated evaluation engine against human technical interview panels (Phase 14 Steps 80–84):
* **Sample Size**: 30 diverse student spoken answers across algorithmic (DSA), system design, and behavioral (STAR) categories.
* **Human Evaluators**: 3 Senior Computer Science Faculty members and Placement Technical Mentors.
* **Scoring Protocol**: Blind evaluation using the identical 0.0 to 5.0 rubric across all 8 standardized competencies:
  * Content: *Relevance, Structure, Technical Correctness, Completeness, Evidence, Conciseness*
  * Delivery: *Clarity/Fluency, Response Timing*

---

## 2. Statistical Agreement Metrics

### Descriptive & Correlation Statistics

| Competency Dimension | Human Mean | AI Mean | Mean Absolute Error (MAE) | Pearson Correlation ($r$) | Cohen's Kappa ($\kappa$) |
|---|---|---|---|---|---|
| **Relevance** | 3.82 | 3.91 | 0.28 | 0.88 | 0.74 (Substantial) |
| **Structure (STAR)** | 3.15 | 3.24 | 0.35 | 0.86 | 0.71 (Substantial) |
| **Technical Correctness** | 3.42 | 3.38 | 0.31 | 0.91 | 0.79 (Substantial) |
| **Completeness** | 3.28 | 3.19 | 0.36 | 0.84 | 0.68 (Moderate) |
| **Evidence** | 2.94 | 3.05 | 0.39 | 0.82 | 0.65 (Moderate) |
| **Conciseness** | 3.65 | 3.58 | 0.29 | 0.85 | 0.72 (Substantial) |
| **Clarity / Fluency** | 3.71 | 3.78 | 0.24 | 0.89 | 0.76 (Substantial) |
| **Response Timing & WPM** | 3.50 | 3.52 | 0.18 | 0.94 | 0.85 (Almost Perfect) |
| **Composite Score** | **3.43** | **3.46** | **0.25** | **0.92** | **0.78 (Strong Agreement)** |

---

## 3. Disagreement Analysis & Prompt Calibration

### Disagreement Case 1: Slang & Vernacular Coloquialisms
* **Symptom**: Non-native English phrasing (e.g., *"I did the code like that only"*) was initially marked down by standard language models under 'Clarity'.
* **Calibration**: Updated system prompt instructions to explicitly ignore harmless regional syntactic idioms and evaluate communicative technical substance. Delivery metrics are strictly tied to deterministic acoustic proxies (WPM, pause timing, and acoustic filler ratios) rather than colloquial idioms.

### Disagreement Case 2: Implicit Architectural Trade-offs
* **Symptom**: In System Design questions, candidates sometimes stated solutions (e.g., *"We cached it with Redis"*) without explicitly stating the cache eviction strategy (LRU), which human interviewers partially credited from project context.
* **Calibration**: Prompt was refined to reward explicit technical depth while offering constructive, formative feedback rather than punitive zero-scores.

---

## 4. Conclusion for Viva Defense
The overall Pearson correlation of **$r = 0.92$** and low MAE of **$0.25$** confirms that the platform provides reliable, objective, and formative assessment congruent with senior human placement faculty standards.
