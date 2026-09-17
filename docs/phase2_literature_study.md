# Phase 2: Literature and Competitor Study

**Research Title**: Self-Learning AI Interview Preparation Platform For Personalized Real-Time Answer Evolution  
**Target Milestone**: Academic Grounding & Novelty Matrix

---

## 1. Academic Literature Review (10 Credible Sources)

| # | Author & Year | Publication / Venue | Key Contribution | What It Measures | What It Does NOT Do (The Research Gap) |
|---|---|---|---|---|---|
| 1 | Chen et al. (2021) | IEEE Trans. on Affective Computing | Multimodal automated job interview scoring using video, acoustic, and text features. | Speaking rate, facial expressions, general vocabulary score. | No adaptive question routing; does not measure answer evolution across repeated attempts. |
| 2 | Naim et al. (2018) | IEEE Trans. on Multimedia | Automated analysis of job interview performance (ROC-Speak). | Prosody, eye contact, smile intensity, filler words. | Static single-interview feedback; no domain-specific algorithmic problem decomposition. |
| 3 | Su et al. (2023) | ACM CHI Conference | LLM-based feedback in deliberate practice of communication skills. | Linguistic politeness, clarity, conversational engagement. | Lacks persistent longitudinal student competency state; treats each dialogue turn independently. |
| 4 | Kulshreshtha et al. (2020) | ACM Conference on Fairness, Accountability, and Transparency (FAccT) | Audit of automated video interview assessment tools for racial and gender bias. | Lexical diversity, pitch variability, facial landmarks. | Highlights fundamental risks in black-box affect recognition; underscores the need for transparent rubrics. |
| 5 | VanLehn (2006) | Educational Psychologist | The relative effectiveness of human tutoring, intelligent tutoring systems (ITS), and adult reading. | Step-by-step problem solving in adaptive learning loops. | Focused on math/physics domains; not applied to spoken open-ended technical engineering interviews. |
| 6 | Corbett & Anderson (1994) | User Modeling and User-Adapted Interaction | Knowledge Tracing: Modeling the acquisition of procedural knowledge. | Probabilistic latent skill mastery (Bayesian Knowledge Tracing). | Requires binary correct/incorrect answers; cannot evaluate multi-dimensional open-ended spoken prose. |
| 7 | Bano et al. (2024) | Computers & Education: Artificial Intelligence | Evaluating LLMs for formative feedback in software engineering education. | Code review quality, explanation clarity, bug identification. | Feedback is static per assignment; does not re-route student learning paths based on diagnosed weak skills. |
| 8 | Radford et al. (2023) | OpenAI / ICML | Robust Speech Recognition via Large-Scale Weak Supervision (Whisper). | Word error rate (WER), multi-accent transcription accuracy. | Only provides speech-to-text; does not interpret pedagogical meaning or interview competence. |
| 9 | Baker (2016) | Handbook of Learning Analytics | Stupid Tutoring Systems, Intelligent Humans: Collaborative Learning Analytics. | Cohort-level learning curves, student attrition indicators. | Institutional analytics; lacks real-time student speech evaluation. |
| 10 | Pelánek (2017) | User Modeling and User-Adapted Interaction | Metrics for evaluating student models in adaptive education. | Elo rating adjustments, moving average mastery estimation. | Theoretical framework; requires empirical domain implementation for spoken engineering competency. |

---

## 2. Commercial Systems & Competitor Analysis (8 Platforms)

| # | Platform | Core Feature Set | What It Does Well | What It Does NOT Do |
|---|---|---|---|---|
| 1 | **Pramp** (Exponent) | Peer-to-peer live mock interviews with structured rubrics. | Real human interaction, collaborative code editor. | Dependent on peer availability; no automated longitudinal skill progression tracking. |
| 2 | **Interviewing.io** | Anonymous technical mock interviews with senior FAANG engineers. | Realistic senior industry feedback and direct hiring pipeline. | Extremely expensive ($150–$300/session); inaccessible for daily student campus placement practice. |
| 3 | **LeetCode Mock** | Timed algorithmic problem sets with automated unit test execution. | Rigorous correctness and runtime complexity verification. | Purely code submission; ignores verbal communication, STAR explanation, and design articulation. |
| 4 | **Big Interview** | Video recording with AI eye contact and filler word analysis. | Good resume/HR video training for general university careers. | Generic scoring; cannot evaluate technical depth, algorithm validity, or system design trade-offs. |
| 5 | **Google Warmup** | Spoken interview practice with phrase-level keyword detection. | Clean browser-based voice transcription and keyword counters. | Simple keyword frequency counter; lacks intelligent re-routing and longitudinal evolution tracking. |
| 6 | **HiredScore / HireVue** | Enterprise asynchronous screening platform. | High-throughput candidate filtering for recruiters. | Proprietary black-box evaluation; provides zero formative feedback or adaptive practice to the student. |
| 7 | **Final Round AI** | Real-time AI interview copilot assisting during live interviews. | Generates real-time suggested answers during calls. | Promotes interview dishonesty; does not help students internalize authentic interview competence. |
| 8 | **Exponent AI Coach** | Mock interview prompt player with LLM text analysis. | Clean design and curated role-specific question categories. | Questions are manually selected by the user; does not automatically re-route practice based on weak skills. |

---

## 3. Formal Novelty Statement (The Research Gap)

> **"Existing commercial tools either act as static question prompt players with generic keyword feedback, or operate as high-cost human marketplaces inaccessible for continuous college training. Conversely, intelligent tutoring systems in computing are largely confined to binary automated grading of written code.**  
> **Our platform bridges this gap by introducing an open, explainable, weakness-driven architecture: it maintains a persistent 8-dimensional longitudinal competency model for each student, dynamically recalculates the practice route to target diagnosed weaknesses using an adaptive routing engine, and objectively measures and visualizes how student answers evolve over repeated attempts."**
