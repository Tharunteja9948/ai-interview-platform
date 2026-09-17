# Phase 3: Competencies and Explainable Scoring Rubrics

**Project Milestone**: Formal Assessment Rubric & Scoring Formulas  
**Evaluation Scale**: Discrete 0 to 5 points with granular half-point allowances (0.0 to 5.0)

---

## 1. Content Quality Competencies (6 Dimensions)

Content quality measures the semantic substance, logical reasoning, and technical depth of the response.

### 1. Relevance
* **0 (Irrelevant / Evasive)**: The response completely misunderstands or avoids the prompt. Rambles on unrelated topics or provides no meaningful answer.
* **3 (Adequate / Partially Targeted)**: Answers the main question directly, but introduces slight tangential details or omits a secondary constraint stated in the prompt.
* **5 (Laser-Focused & Insightful)**: Directly, precisely, and immediately addresses every aspect and sub-clause of the question without filler or deviation.

### 2. Structure
* **0 (Disorganized / Free Association)**: Thoughts are fragmented; jumping between conclusion, background, and implementation without chronological or logical progression.
* **3 (Understandable Flow)**: Has an identifiable beginning, middle, and end. For behavioral questions, loosely follows STAR (Situation, Task, Action, Result) but lacks crisp transition markers.
* **5 (Masterful Decomposition & STAR)**: Flawless structural hygiene. Begins with a top-down summary, logically breaks down the solution step-by-step, clearly demarcates Situation $\rightarrow$ Task $\rightarrow$ Action $\rightarrow$ Result, and concludes cleanly.

### 3. Technical Correctness
* **0 (Factually Inaccurate / Broken)**: States fundamentally false algorithms, incorrect time/space complexities (e.g., claiming linear search on unsorted arrays is $O(\log n)$), or flawed architectural concepts.
* **3 (Generally Sound with Minor Oversights)**: The foundational logic is correct; mentions appropriate data structures and approaches, but misses subtle edge-case bounds (e.g., null checks, off-by-one, integer overflow).
* **5 (Flawlessly Accurate & Nuanced)**: Fully optimal algorithmic reasoning; exact time ($O$) and space ($O$) complexity derivations; accurately discusses concurrency, caching, or memory trade-offs.

### 4. Completeness
* **0 (Severely Incomplete / One-Liner)**: Drops the explanation after a single superficial sentence. Ignores essential constraints, failure cases, and system requirements.
* **3 (Substantial Coverage)**: Addresses the happy-path solution and standard cases, but overlooks boundary conditions, fault tolerance, or scale constraints.
* **5 (Holistic & Comprehensive)**: Thoroughly covers core logic, input validation, scale implications, trade-offs, alternative approaches, and testing strategies.

### 5. Evidence (STAR & Personal Contribution)
* **0 (Abstract / Generic Boilerplate)**: Uses vague passive phrases ("we built an app", "things were done"). Provides zero quantifiable metrics, code decisions, or specific roles.
* **3 (Moderate Evidence)**: Describes a specific project and mentions individual tasks, but lacks quantified impact (e.g., latency reduction, user count) or specific architectural choices made by the candidate.
* **5 (High-Impact Concrete Evidence)**: Emphasizes specific personal engineering decisions ("I implemented a Redis caching layer which reduced P99 latency by 35%"), clear ownership, and measurable outcomes.

### 6. Conciseness
* **0 (Rambling & High Redundancy)**: Extremely repetitive; repeats the same thought across multiple sentences; low signal-to-noise ratio.
* **3 (Reasonable Density)**: Expresses the ideas clearly, but takes 3 sentences where 1 concise technical phrase would suffice.
* **5 (High Signal Density)**: Economical, precise vocabulary; zero conversational fluff; every sentence communicates distinct technical value.

---

## 2. Speech Delivery Competencies (2 Dimensions)

Delivery metrics are calculated using deterministic signal analysis combined with language modeling, keeping delivery independent from technical knowledge.

### 7. Clarity & Fluency
* **0 (Incoherent / High Fillers)**: Severe hesitation; excessive filler words ($> 8\%$ of total spoken words); disjointed clauses that obscure comprehension.
* **3 (Conversational & Understandable)**: Natural speech flow with moderate filler words ($3\% - 6\%$); minor pauses; easily understood by a technical panel.
* **5 (Articulate & Professional)**: Clean, polished articulation; minimal fillers ($< 2\%$); confident cadence and natural phrasing.

### 8. Response Timing & Pacing
* **0 (Severely Rushed or Unfinished)**: Speaking rate $< 80$ WPM (lethargic/stalled) or $> 200$ WPM (unintelligible rush); finishes in $< 15$ seconds or exceeds timeout without finishing.
* **3 (Acceptable Cadence)**: Speaking rate between $100$ and $120$ WPM, or $160$ to $180$ WPM. Answer duration within acceptable range ($45 - 90$ seconds for standard questions).
* **5 (Optimal Cadence)**: Ideal professional pacing between $120$ and $155$ WPM; calibrated response duration ($60 - 120$ seconds) proportional to question complexity.

---

## 3. Composite Scoring Formulas

To guarantee transparency and defensibility during viva examination, the overall session and answer scores are derived deterministically:

### Answer-Level Composite Score:
$$\text{Score}_{\text{content}} = \frac{1}{6} \left( S_{\text{rel}} + S_{\text{struct}} + S_{\text{tech}} + S_{\text{comp}} + S_{\text{evid}} + S_{\text{conc}} \right)$$

$$\text{Score}_{\text{delivery}} = \frac{1}{2} \left( S_{\text{clar}} + S_{\text{timing}} \right)$$

$$\text{Score}_{\text{total}} = 0.70 \times \text{Score}_{\text{content}} + 0.30 \times \text{Score}_{\text{delivery}}$$

### Longitudinal Skill Update (Exponential Weighted Moving Average):
When a student completes an answer evaluating competency $c$:
$$\text{SkillProfile}_{t}(c) = \alpha \times \text{Score}_{t}(c) + (1 - \alpha) \times \text{SkillProfile}_{t-1}(c)$$
Where $\alpha = 0.40$, balancing recent performance sensitivity with historical baseline stability.

### Answer Evolution Score ($\Delta$):
$$\Delta_{\text{competency}} = \text{Score}_{\text{current}}(c) - \text{Score}_{\text{previous}}(c)$$
$$\Delta_{\text{overall}} = \frac{1}{K} \sum_{k=1}^{K} \Delta_{k}$$

---

## 4. Sample Scored Answers for Benchmark Reference

### Sample Question:
*"Can you explain how a Hash Map handles collisions, and what is the worst-case lookup time complexity?"*

#### Sample Answer A (Score: 1.8 / 5.0)
> *"Uh, so a hash map is basically like an array where you store things with keys. If two keys get the same spot, that's called a collision. It handles collisions by maybe making a list there or something like that. The time complexity is like O(1), but sometimes it can be slow if there are many items."*
* **Relevance**: 3.5 / 5.0 (addresses collisions and lookup time)
* **Structure**: 2.0 / 5.0 (unstructured stream of consciousness)
* **Technical Correctness**: 2.0 / 5.0 (vague about chaining vs open addressing; failed to state $O(N)$ worst case)
* **Completeness**: 1.5 / 5.0 (omitted resizing, load factor, and worst-case treeification)
* **Evidence**: 1.0 / 5.0 (no practical context)
* **Conciseness**: 2.5 / 5.0 (filler words: "uh", "basically", "or something like that")
* **Clarity / Fluency**: 2.0 / 5.0 (hesitant phrasing)
* **Response Timing**: 2.0 / 5.0 (too brief, ~22 seconds)

#### Sample Answer B (Score: 4.6 / 5.0)
> *"A hash map maps keys to bucket indices using a hash function. When two distinct keys hash to the same bucket index, a collision occurs. There are two primary strategies to resolve this: Separate Chaining and Open Addressing. In Separate Chaining, each bucket points to a linked list—or a balanced red-black tree as in Java 8 HashMap once a bucket exceeds 8 nodes. In Open Addressing, linear or quadratic probing finds the next vacant bucket. While the average lookup time is O(1), the worst-case lookup degrades to O(N) in linked-list chaining if all keys hash to the same bucket, or O(log N) with treeification. To prevent degradation, modern hash maps automatically rehash and double the table capacity once the load factor exceeds a threshold, typically 0.75."*
* **Relevance**: 5.0 / 5.0
* **Structure**: 4.8 / 5.0 (Core concept $\rightarrow$ Resolution techniques $\rightarrow$ Time complexity analysis $\rightarrow$ Mitigation/Rehashing)
* **Technical Correctness**: 5.0 / 5.0 (exact complexities, Java 8 treeification, load factor 0.75)
* **Completeness**: 4.8 / 5.0 (covers both chaining and open addressing + rehashing)
* **Evidence**: 4.0 / 5.0 (cites specific industry implementations like Java 8)
* **Conciseness**: 4.5 / 5.0 (dense, precise terminology)
* **Clarity / Fluency**: 4.8 / 5.0 (articulate, logical connectors)
* **Response Timing**: 4.5 / 5.0 (optimal pacing, ~65 seconds)
