# Phase 1: Problem Statement and Scope Boundary

**Project Title**: Self-Learning AI Interview Preparation Platform For Personalized Real-Time Answer Evolution  
**Department**: Computer Science & Engineering (Final-Year Project)  
**Target Role (Initial Prototype)**: Software Developer (Campus Placement Track)

---

## 1. One-Sentence Problem Statement
> **"Students receive limited repeated interview practice and often do not know which specific answer skills are improving or stagnating across attempts."**

---

## 2. Target Users & Constraints
* **Primary Users**: Final-year undergraduate engineering students preparing for technical and behavioral on-campus placement interviews.
* **Secondary Stakeholders**: Training & Placement Officers (TPOs) and department faculty mentors who need aggregated cohort readiness insights without violating individual student privacy.
* **User Constraints**: Variable microphone hardware, standard campus internet connectivity, varying English fluency levels, and limited prior mock-interview coaching.

---

## 3. Scope Boundary (What is In-Scope vs. Out-of-Scope)

### In-Scope (Committed Capabilities)
1. **Target Role Scope**: Software Developer (encompassing Data Structures & Algorithms, Object-Oriented Design, System Design fundamentals, and STAR-format project experiences).
2. **Longitudinal Memory**: Maintaining a persistent competency state for each registered student across multiple practice sessions.
3. **Adaptive "Google Maps" Practice Route**: Dynamically choosing subsequent questions targeting diagnosed competency deficiencies rather than following a static sequential list.
4. **Answer Evolution Tracking**: Explicitly calculating and visualizing improvement deltas ($\Delta = \text{Score}_{\text{current}} - \text{Score}_{\text{previous}}$) and qualitative shifts across attempts.
5. **Separation of Evaluation**: Keeping content substance separate from speech delivery metrics.
6. **Cohort Analytics**: Anonymized aggregate dashboards for faculty and institutional review.

### Out-of-Scope (Explicitly NOT Claimed)
1. **No Psychometric or Polygraph Claims**: The system does *not* claim to measure student honesty, innate intelligence, mental health, or emotional stability from webcam video or voice pitches.
2. **No Unvalidated Human Equivalence**: The AI score is *not* represented as identical to an enterprise interviewer's hiring decision unless verified against ground-truth human ratings.
3. **No Definitive Employment Guarantee**: The platform does *not* promise guaranteed employment; it serves as a personalized formative learning tutor.
4. **No Permanent Audio Retention**: Audio recordings are processed for transcription and immediate acoustic features, with strict deletion and retention boundaries.

---

## 4. The 8 Core Interview Competencies

The system evaluates interview performance across 8 distinct, measurable dimensions grouped into Content Quality and Speech Delivery:

| # | Dimension | Category | Core Measurement Focus |
|---|---|---|---|
| 1 | **Relevance** | Content | Directness of answer; addressing the core question without tangential drift. |
| 2 | **Structure** | Content | Logical organization, problem decomposition, and adherence to standard frameworks (e.g., STAR: Situation, Task, Action, Result). |
| 3 | **Technical Correctness** | Content | Accuracy of algorithms, computational complexity ($O(n)$ notation), system design trade-offs, and architectural concepts. |
| 4 | **Completeness** | Content | Coverage of key edge cases, constraints, failure handling, and trade-offs. |
| 5 | **Evidence (STAR)** | Content | Concrete examples from real coursework, GitHub projects, or internships demonstrating personal contributions rather than generic theory. |
| 6 | **Conciseness** | Content | Signal-to-noise ratio; avoiding verbose padding while maintaining technical depth. |
| 7 | **Clarity & Fluency** | Delivery | Coherence of spoken prose, sentence structure, and minimization of excessive filler phrases. |
| 8 | **Response Timing & Pacing**| Delivery | Speaking rate (words per minute, target 110–160 WPM), appropriate response length, and pause distribution. |

---

## 5. Success Criteria for Evaluation
A student's interaction is defined as successful if:
1. Over 3 to 5 adaptive sessions, the student's two weakest baseline competencies demonstrate a statistically measurable upward progression ($\Delta > 0$).
2. The student receives actionable, plain-English comparative guidance explaining *why* their answer evolved.
3. The adaptive routing engine achieves zero question loops while prioritizing weak dimensions.
