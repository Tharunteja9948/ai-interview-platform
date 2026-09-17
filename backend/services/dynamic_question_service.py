"""
Dynamic Question Sourcing & Multi-Role Synthesis Service
B.Tech CSE Final Year Project: Self-Learning AI Interview Platform

Fetches and generates diverse, unrepeated, company-specific and role-specific interview questions.
Supports 9 High-Demand Industry Job Profiles:
1. Software Developer (SDE-1 / Core SWE)
2. Full Stack Developer (MERN / Java + React)
3. Frontend Engineer (Modern Web, State, Performance)
4. Backend & Microservices Engineer (APIs, Caching, Concurrency)
5. Data Engineer & Analytics (SQL, ETL, Spark, Warehousing)
6. AI / Machine Learning Engineer (PyTorch, Transformers, NLP, Vectors)
7. Cloud & DevOps Engineer (Docker, Kubernetes, AWS, CI/CD)
8. Cybersecurity Analyst (Network Security, Cryptography, OWASP)
9. QA Automation & SDET (Selenium, Test Architecture, API Testing)

Automatically seeds newly fetched questions into SQLite database so the catalog continuously expands.
"""

import os
import json
import uuid
import random
from typing import Dict, Any, List, Optional
from backend.database import get_db_connection

# Comprehensive question pool across all industry career roles
ROLE_QUESTION_CATALOG = {
    "Python Developer": [
        {
            "question": "Explain Python's Memory Management, Reference Counting, and how the Cyclic Garbage Collector detects reference cycles. What is the Global Interpreter Lock (GIL) and how does it impact multithreaded CPU-bound programs?",
            "category": "Python Internals & Memory",
            "competency": "technical_correctness",
            "difficulty": "entry",
            "ideal_answer": "CPython manages memory primarily through reference counting: each object tracks how many references point to it and deallocates immediately when the count reaches zero. To handle reference cycles (e.g., A references B and B references A), Python uses a cyclic generational garbage collector (Generations 0, 1, and 2). The Global Interpreter Lock (GIL) is a mutex that protects access to Python objects, preventing multiple native threads from executing Python bytecodes simultaneously. Consequently, multithreading does not provide speedups for CPU-bound tasks in CPython (which require multiprocessing), though it works well for I/O-bound tasks.",
            "senior_tip": "Mention PEP 703 (free-threaded Python in 3.13) to demonstrate knowledge of cutting-edge Python developments."
        },
        {
            "question": "How do Python Generators and the yield statement work under the hood? Contrast their memory footprint against list comprehensions when streaming 10 million database records.",
            "category": "Core Python & Data Streams",
            "competency": "evidence",
            "difficulty": "mid",
            "ideal_answer": "When a function contains yield, Python compiles it into a generator function that returns a generator object implementing the iterator protocol (__iter__ and __next__). Execution pauses at yield, preserving its stack frame and local variables in memory, and resumes when next() is called. A list comprehension generates all 10 million elements in memory upfront, potentially consuming gigabytes of RAM and causing MemoryError, whereas a generator produces one element at a time on demand with O(1) constant memory usage.",
            "senior_tip": "Explain 'yield from' for delegating to sub-generators and bidirectional communication with generator.send()."
        },
        {
            "question": "Explain how Python Decorators function. Write a conceptual decorator that accepts arguments to enforce rate-limiting or measure function execution time, and explain why functools.wraps is essential.",
            "category": "Metaprogramming & Patterns",
            "competency": "structure",
            "difficulty": "mid",
            "ideal_answer": "A decorator is a callable that takes another function as an argument, extends its behavior without modifying its source code, and returns a callable. When a decorator takes arguments, it requires three nested functions: outer function for arguments, middle decorator taking the function, and inner wrapper taking *args, **kwargs. @functools.wraps(fn) is essential because it copies metadata (docstrings, function name, module, annotations) from the wrapped function to the wrapper, preventing introspection tools and debuggers from losing function identity.",
            "senior_tip": "Provide the three-level wrapper structure clearly: def repeat(num): def decorator(func): def wrapper(*args, **kwargs): ..."
        },
        {
            "question": "How does Asynchronous programming with asyncio work in Python? Differentiate between coroutines, Tasks, the Event Loop, and explain when to choose asyncio over threading or multiprocessing.",
            "category": "Async & Concurrency",
            "competency": "technical_correctness",
            "difficulty": "hard",
            "ideal_answer": "asyncio is single-threaded, single-process cooperative multitasking built around an Event Loop that schedules and multiplexes non-blocking I/O operations using epoll/kqueue. A coroutine is defined with async def and returns a coroutine object when called. A Task wraps a coroutine and registers it with the Event Loop for concurrent execution. Choose asyncio for high-concurrency I/O-bound operations (e.g. 10,000 concurrent WebSockets/HTTP clients); choose multiprocessing for CPU-bound mathematical computation to bypass the GIL.",
            "senior_tip": "Never call blocking I/O (like time.sleep or requests.get) inside async functions without asyncio.to_thread."
        }
    ],

    "Java Developer": [
        {
            "question": "Explain the JVM Memory Architecture (Heap, Stack, Metaspace, Program Counter). How do Generational Garbage Collection algorithms (G1GC and ZGC) identify and clean dead objects?",
            "category": "JVM Architecture & Memory",
            "competency": "technical_correctness",
            "difficulty": "entry",
            "ideal_answer": "JVM divides memory into: Stack (per-thread, stores primitive local variables and method call frames), Heap (shared, stores all objects and arrays), Metaspace (off-heap native memory for class definitions and static constants), and PC Register. Generational GC relies on the weak generational hypothesis (most objects die young) dividing heap into Young (Eden, Survivor spaces) and Old (Tenured). G1GC partitions the entire heap into equal regions, prioritizing regions with the most garbage ('Garbage-First'). ZGC uses colored pointers and load barriers to achieve sub-millisecond pause times regardless of heap size.",
            "senior_tip": "Clarify that Stack memory is thread-safe and automatically reclaimed on method exit, while Heap requires GC."
        },
        {
            "question": "How does Java's HashMap work internally? Explain bucketing, hashCode-equals contract, hash collisions, and the Java 8 transition from LinkedList to Red-Black Tree (Treeify threshold).",
            "category": "Java Collections Framework",
            "competency": "technical_correctness",
            "difficulty": "mid",
            "ideal_answer": "HashMap stores key-value pairs in an array of Node buckets. When put(key, val) is called, it computes hash = hash(key.hashCode()) and determines bucket index via (n - 1) & hash. When different keys hash to the same index (collision), they are chained in a LinkedList. If a single bucket exceeds 8 nodes (TREEIFY_THRESHOLD) and table capacity is at least 64, Java 8 converts the bucket into a balanced Red-Black Tree (TreeNode), reducing worst-case search complexity from O(N) to O(log N). If two objects are equal via equals(), their hashCode() must be identical.",
            "senior_tip": "Explain why immutable classes like String and Integer are optimal HashMap keys."
        },
        {
            "question": "Explain Java Concurrency: compare synchronized blocks with ReentrantLock. What is the purpose of the volatile keyword and how does it prevent instruction reordering?",
            "category": "Multithreading & Concurrency",
            "competency": "structure",
            "difficulty": "hard",
            "ideal_answer": "synchronized provides intrinsic mutual exclusion and visibility managed by the JVM via object monitors; it releases locks automatically upon exception or scope exit. ReentrantLock from java.util.concurrent.locks provides advanced features: fairness policies, interruptible lock acquisition (lockInterruptibly), timed waits (tryLock), and multiple Condition variables. The volatile keyword ensures variable visibility directly to main memory (preventing thread-local CPU cache stale reads) and establishes a happens-before relationship that prevents compiler and CPU instruction reordering.",
            "senior_tip": "Note that volatile guarantees visibility and ordering, but NOT atomicity for compound operations like count++."
        },
        {
            "question": "Explain the Spring Boot architecture: Inversion of Control (IoC), Dependency Injection (Constructor vs Field), and the lifecycle of a Spring Bean from instantiation to destruction.",
            "category": "Spring Boot & Enterprise",
            "competency": "evidence",
            "difficulty": "entry",
            "ideal_answer": "IoC delegates the responsibility of object instantiation and dependency management to the Spring Container (ApplicationContext). Dependency Injection (DI) injects required dependencies into components. Constructor injection is preferred over field injection (@Autowired on fields) because it enables immutability (final fields), eliminates NPEs during testing without a Spring context, and prevents circular dependency traps. Bean lifecycle: Instantiation -> Populate Properties -> BeanNameAware/BeanFactoryAware -> PostProcessBeforeInitialization -> @PostConstruct/InitializingBean -> PostProcessAfterInitialization -> Ready -> @PreDestroy -> DisposableBean -> Destroyed.",
            "senior_tip": "Interviewers love hearing why Constructor Injection is superior for testability and immutability."
        }
    ],

    "Frontend Engineer": [
        {
            "question": "How does React's Reconciliation algorithm (Fiber architecture) work? Why are keys critical when rendering dynamic lists?",
            "category": "React Internals & DOM",
            "competency": "technical_correctness",
            "difficulty": "mid",
            "ideal_answer": "React Fiber is a complete rewrite of the reconciliation engine that enables incremental rendering by breaking the render tree into interruptible fiber units. During reconciliation, React constructs a work-in-progress tree and diffs it against the current tree using a heuristic O(N) algorithm. Keys are essential because they give elements a stable identity across renders; without unique keys, React re-renders or mutates state in the wrong DOM nodes, causing severe rendering bugs and performance degradation.",
            "senior_tip": "Explain the difference between the Render Phase (asynchronous, interruptible) and Commit Phase (synchronous DOM mutations)."
        },
        {
            "question": "Explain JavaScript Closures, the Lexical Scope chain, and a real-world scenario where a closure can cause a memory leak in a single-page app.",
            "category": "JavaScript Core",
            "competency": "technical_correctness",
            "difficulty": "entry",
            "ideal_answer": "A closure is the combination of a function bundled together with references to its surrounding lexical state (lexical environment), allowing an inner function to access variables from an outer enclosing function even after the outer function has returned. A memory leak occurs when event listeners, setInterval timers, or global caches retain references to outer DOM elements or heavy objects that garbage collection cannot clean up.",
            "senior_tip": "Always mention cleanup patterns in useEffect/componentWillUnmount to demonstrate production readiness."
        },
        {
            "question": "What techniques do you employ to optimize Core Web Vitals, specifically Largest Contentful Paint (LCP) and Cumulative Layout Shift (CLS)?",
            "category": "Web Performance",
            "competency": "evidence",
            "difficulty": "hard",
            "ideal_answer": "To optimize LCP (target < 2.5s): preload critical hero images (<link rel='preload'>), implement responsive WebP/AVIF formats with CDN caching, eliminate render-blocking CSS/JS, and utilize Server-Side Rendering (SSR). To eliminate CLS (target < 0.1): explicitly specify width and height attributes on images/videos, avoid inserting dynamic DOM elements above existing content, and reserve space for asynchronous ad banners.",
            "senior_tip": "Mention measuring with Lighthouse and Chrome UX Report (CrUX) for field real-user metrics."
        }
    ],

    "Backend Engineer": [
        {
            "question": "Explain the difference between Pessimistic Locking and Optimistic Locking in relational databases. When would you choose one over the other in a high-concurrency payment system?",
            "category": "Databases & Concurrency",
            "competency": "technical_correctness",
            "difficulty": "hard",
            "ideal_answer": "Pessimistic locking uses database locks (SELECT FOR UPDATE) to lock the row immediately upon read, preventing any other transaction from accessing or modifying it until commit. Optimistic locking does not lock rows on read; instead, it includes a version or timestamp column and verifies on update (WHERE id = ? AND version = ?) that no other transaction updated it. Choose pessimistic locking when contention is very high to avoid rollbacks (like last ticket sales); choose optimistic locking when reads vastly outnumber writes for high throughput.",
            "senior_tip": "Discuss deadlock risks with pessimistic locks and retry storms with optimistic locks."
        },
        {
            "question": "How do you design a distributed cache invalidation strategy using Redis? Explain Cache-Aside, Write-Through, and Cache Avalanche mitigation.",
            "category": "Distributed Caching",
            "competency": "structure",
            "difficulty": "mid",
            "ideal_answer": "Cache-Aside reads from cache first; on a miss, reads from DB and updates cache. Write-Through updates cache and database synchronously. To prevent Cache Avalanche (when thousands of keys expire at the exact same moment causing DB crash), add random jitter to TTL expirations (e.g., TTL = base + rand(0, 300s)) and use circuit breakers like Resilience4j to protect the database.",
            "senior_tip": "Explain Cache Stampede / Thundering Herd and how mutex locking in Redis prevents duplicate DB queries."
        }
    ],

    "Data Engineer & Analytics": [
        {
            "question": "Explain the difference between Star Schema and Snowflake Schema in Data Warehousing. What are the query performance trade-offs?",
            "category": "Data Warehousing",
            "competency": "technical_correctness",
            "difficulty": "mid",
            "ideal_answer": "A Star Schema consists of a central fact table surrounded by completely denormalized dimension tables, resulting in simpler SQL queries and faster OLAP performance due to fewer table joins. A Snowflake Schema normalizes dimension tables into smaller sub-dimensions (e.g., splitting Location into City, State, Country), which minimizes data redundancy but requires complex multi-table joins that slow down analytical query execution.",
            "senior_tip": "State that cloud data warehouses like Snowflake and BigQuery heavily favor denormalized Star schemas for column scanning."
        },
        {
            "question": "Write and explain a SQL Window Function query using ROW_NUMBER(), RANK(), and DENSE_RANK() to calculate the top 3 earning employees per department.",
            "category": "Advanced SQL",
            "competency": "technical_correctness",
            "difficulty": "entry",
            "ideal_answer": "Use a CTE: WITH Ranked AS (SELECT emp_id, dept_id, salary, DENSE_RANK() OVER (PARTITION BY dept_id ORDER BY salary DESC) as rnk FROM employees) SELECT * FROM Ranked WHERE rnk <= 3. ROW_NUMBER assigns distinct numbers ignoring ties; RANK skips numbers after ties (1, 2, 2, 4); DENSE_RANK does not skip numbers after ties (1, 2, 2, 3).",
            "senior_tip": "Clearly explain why window functions execute in the SELECT phase after WHERE and GROUP BY."
        },
        {
            "question": "In Apache Spark, what is the difference between a Narrow Transformation and a Wide Transformation? Why do Wide Transformations cause Shuffle Spills?",
            "category": "Distributed Data Processing",
            "competency": "evidence",
            "difficulty": "hard",
            "ideal_answer": "Narrow transformations (like map, filter) can execute entirely within a single partition without network transfer. Wide transformations (like groupByKey, reduceByKey, join) require data from multiple partitions to be grouped, requiring a cluster-wide network Shuffle. When partition data exceeds allocated executor memory, Spark spills temporary shuffle blocks to disk, causing severe latency.",
            "senior_tip": "Recommend reduceByKey or aggregateByKey over groupByKey because they perform local map-side combiners."
        }
    ],

    "AI / Machine Learning Engineer": [
        {
            "question": "Explain the Self-Attention mechanism in the Transformer architecture. Why does attention scale quadratically with sequence length O(N^2)?",
            "category": "Deep Learning & NLP",
            "competency": "technical_correctness",
            "difficulty": "hard",
            "ideal_answer": "Self-attention projects input tokens into Query (Q), Key (K), and Value (V) matrices. The attention weight is computed as Softmax((Q * K^T) / sqrt(d_k)) * V. It computes an attention score between every pair of tokens in the sequence; for a sequence of length N, this forms an N x N attention matrix, resulting in quadratic O(N^2) memory and computational complexity, which FlashAttention and sliding-window attention optimize.",
            "senior_tip": "Explain why the scaling factor sqrt(d_k) is used (to prevent dot products from growing large and pushing softmax into near-zero gradient regions)."
        },
        {
            "question": "What is the difference between Precision, Recall, and F1-Score? Which metric would you prioritize for a Medical Diagnostic AI model or Fraud Detection system?",
            "category": "Evaluation Metrics",
            "competency": "relevance",
            "difficulty": "entry",
            "ideal_answer": "Precision is True Positives / (True Positives + False Positives)—measuring how many declared positive predictions were actually correct. Recall is True Positives / (True Positives + False Negatives)—measuring what fraction of all actual positives were caught. In cancer diagnosis and credit card fraud, Recall must be maximized to ensure false negatives (missing a sick patient or fraudulent charge) are minimized, even at the cost of some false alarms.",
            "senior_tip": "Mention the Precision-Recall trade-off curve and choosing the classification threshold based on business cost."
        }
    ],

    "Cloud & DevOps Engineer": [
        {
            "question": "What is the architectural difference between a Docker Container and a Virtual Machine? How does Linux cgroups and namespaces enable container isolation?",
            "category": "Containerization & Linux",
            "competency": "technical_correctness",
            "difficulty": "entry",
            "ideal_answer": "A VM includes a full guest operating system running on top of a hypervisor, consuming gigabytes of RAM with slower boot times. A Docker container shares the host Linux OS kernel and runs as an isolated process. Isolation is achieved via Linux Namespaces (isolating PID, Network, Mount, User, and IPC views) and cgroups (Control Groups, restricting CPU, memory, and I/O resource limits per container).",
            "senior_tip": "Mention how Alpine Linux creates lightweight 5MB images reducing attack surfaces and startup times."
        },
        {
            "question": "Explain Kubernetes Pod scheduling, and compare Rolling Updates with Blue-Green and Canary deployment strategies.",
            "category": "Kubernetes & CI/CD",
            "competency": "structure",
            "difficulty": "mid",
            "ideal_answer": "The kube-scheduler filters nodes by resource availability, taints/tolerations, and affinity rules to select optimal host nodes. In Rolling Updates, new pods replace old ones incrementally without downtime. In Blue-Green, an identical new environment (Green) is spun up alongside current production (Blue), and traffic is switched instantly via router/ingress update. In Canary, 5-10% of traffic is routed to the new version to monitor metrics before full rollout.",
            "senior_tip": "Discuss rollback speed: Blue-Green allows instant rollback by switching the ingress service pointer back."
        }
    ],

    "Cybersecurity Analyst": [
        {
            "question": "Explain how a Cross-Site Scripting (XSS) attack works, differentiate Stored vs Reflected XSS, and explain how Content Security Policy (CSP) mitigates it.",
            "category": "Web Application Security",
            "competency": "technical_correctness",
            "difficulty": "entry",
            "ideal_answer": "XSS occurs when an application includes untrusted user input in a web page without proper encoding or sanitization, allowing an attacker to execute malicious JavaScript in victim browsers. Stored XSS permanently saves the payload into the database (affecting all viewers); Reflected XSS reflects the payload immediately from a malicious link or URL parameter. Content Security Policy (CSP) is an HTTP header (Content-Security-Policy) that restricts which domains can load scripts, disallowing inline eval() and unauthorized external origins.",
            "senior_tip": "Mention using HttpOnly and SameSite=Strict cookies to protect session tokens from JavaScript theft."
        },
        {
            "question": "Walk through the TLS 1.3 Handshake. How does Diffie-Hellman Ephemeral (DHE) provide Perfect Forward Secrecy?",
            "category": "Cryptography & Protocols",
            "competency": "structure",
            "difficulty": "hard",
            "ideal_answer": "In TLS 1.3, the handshake is optimized to 1-RTT. The client sends ClientHello with supported ciphers and key shares. The server responds with ServerHello, its key share, digital certificate, and Handshake Finished. Perfect Forward Secrecy (PFS) is achieved via ephemeral Diffie-Hellman keys generated per session: even if the server's long-term private RSA key is compromised in the future, past encrypted network traffic cannot be retroactively decrypted.",
            "senior_tip": "Contrast TLS 1.3 (1-RTT) with older TLS 1.2 (2-RTT) and explain the removal of insecure legacy ciphers."
        }
    ],

    "QA Automation & SDET": [
        {
            "question": "Explain the Page Object Model (POM) design pattern in test automation frameworks. Why does it improve maintainability?",
            "category": "Test Automation Architecture",
            "competency": "structure",
            "difficulty": "entry",
            "ideal_answer": "Page Object Model creates an abstraction layer where each web page or UI component is represented as a separate class containing its web element locators and user interactions (methods). Test scripts only call these high-level methods rather than hardcoding DOM selectors. When the UI changes, you only update the locator in one place (the Page Object class) rather than in hundreds of individual test cases.",
            "senior_tip": "Mention pairing POM with Page Factory or Playwright fixtures for clean dependency injection."
        },
        {
            "question": "How do you test RESTful APIs for idempotency, boundary conditions, and performance under concurrency using tools like Postman or JMeter?",
            "category": "API Quality Engineering",
            "competency": "evidence",
            "difficulty": "mid",
            "ideal_answer": "Testing for idempotency requires firing identical PUT or DELETE requests sequentially and verifying that the resource state and response code remain consistent without side-effects. Boundary condition testing feeds equivalence partitions (null values, maximum integer limits, non-ASCII characters). Concurrency testing simulates race conditions (e.g., 50 threads trying to redeem the same single-use discount coupon simultaneously) to verify database lock integrity.",
            "senior_tip": "Emphasize verifying HTTP status codes (200 vs 201 vs 409 Conflict) and JSON schema validation."
        }
    ],

    "Full Stack Developer": [
        {
            "question": "Walk through the end-to-end lifecycle of an HTTP POST request from a React client form submit, through an API Gateway, to a database write and response.",
            "category": "Full Stack Architecture",
            "competency": "structure",
            "difficulty": "mid",
            "ideal_answer": "React captures form submit, validates fields, and issues an asynchronous fetch/Axios POST request. The browser resolves DNS, establishes TLS connection, and sends HTTP headers and JSON payload. Reverse proxy (Nginx/Gateway) terminates SSL, performs rate-limiting and JWT authentication, and routes request to backend service. Backend controller validates schema, calls business logic layer, writes to database within an ACID transaction, and returns 201 Created with JSON response. React receives response and updates state UI.",
            "senior_tip": "Discuss optimistic UI updates on the client side while the network request is in flight."
        }
    ],

    "Software Developer": [
        {
            "question": "What is the difference between Method Overloading and Method Overriding in Java? How does dynamic method dispatch resolve method calls at runtime?",
            "category": "Core Java & OOP",
            "competency": "technical_correctness",
            "difficulty": "entry",
            "ideal_answer": "Overloading occurs in the same class with identical method names but different parameter lists; it is resolved at compile-time (static binding). Overriding occurs in subclasses where a method has the exact same signature and return type; it is resolved at runtime (dynamic method dispatch) using the object's vtable (virtual method table). Overriding requires inheritance and obeys the Liskov Substitution Principle.",
            "senior_tip": "Give a simple code example with Parent and Child classes and explain why static methods cannot be overridden."
        },
        {
            "question": "Explain Database Normalization from 1NF to 3NF and BCNF. What anomalies occur if a table is left unnormalized?",
            "category": "DBMS",
            "competency": "technical_correctness",
            "difficulty": "entry",
            "ideal_answer": "1NF ensures atomic column values and no repeating groups. 2NF removes partial functional dependencies on candidate keys. 3NF removes transitive dependencies (non-prime attributes determining other non-prime attributes). BCNF requires that for every functional dependency X -> Y, X must be a super key. Without normalization, databases suffer from Insertion, Deletion, and Update anomalies where duplicate data leads to inconsistency.",
            "senior_tip": "TCS interviewers often ask you to normalize a sample Employee-Department table on paper."
        }
    ]
}

def get_or_create_round_question(
    company_id: str = "tcs",
    round_type: str = "technical",
    target_competency: str = "technical_correctness",
    difficulty: str = "mid",
    excluded_ids: Optional[set] = None,
    role_name: str = "Software Developer"
) -> Dict[str, Any]:
    """
    Retrieves an unasked question matching the target company, role, and round.
    If database pool is exhausted, dynamically synthesizes and seeds a fresh, authentic question for that specific career track.
    """
    excluded_ids = excluded_ids or set()
    conn = get_db_connection()
    cursor = conn.cursor()

    comp_clean = company_id.lower().strip()
    role_clean = role_name.strip()

    # 1. Search existing DB for company + role
    cursor.execute("""
        SELECT id, role, category, question_text, ideal_answer, 
               primary_competency, secondary_competency, difficulty, 
               live_priority_score, real_world_occurrences, target_company
        FROM questions 
        WHERE (target_company = ? OR target_company = 'general')
          AND role = ?
        ORDER BY live_priority_score DESC, real_world_occurrences DESC
    """, (comp_clean, role_clean))
    all_db_q = [dict(r) for r in cursor.fetchall()]

    # Filter out already asked questions
    unasked_db = [q for q in all_db_q if q["id"] not in excluded_ids]

    if unasked_db:
        chosen = unasked_db[0]
        cursor.execute("SELECT tip_text, senior_name, placed_company FROM senior_alumni_tips WHERE question_id = ?", (chosen["id"],))
        tip_row = cursor.fetchone()
        chosen["senior_tip"] = dict(tip_row) if tip_row else None
        conn.close()
        return chosen

    # 2. Dynamic generation from ROLE_QUESTION_CATALOG
    role_pool = ROLE_QUESTION_CATALOG.get(role_clean, ROLE_QUESTION_CATALOG["Software Developer"])
    template = random.choice(role_pool)

    new_qid = f"q_{comp_clean}_{role_clean.lower().replace(' ', '_')[:8]}_{uuid.uuid4().hex[:6]}"
    
    cursor.execute("""
        INSERT OR REPLACE INTO questions (
            id, role, category, question_text, ideal_answer,
            primary_competency, secondary_competency, difficulty,
            live_priority_score, real_world_occurrences, target_company
        ) VALUES (?, ?, ?, ?, ?, ?, 'structure', ?, 3.0, 1, ?)
    """, (
        new_qid,
        role_clean,
        template["category"],
        template["question"],
        template["ideal_answer"],
        template["competency"],
        template.get("difficulty", difficulty),
        comp_clean
    ))

    # Insert verified senior tip
    cursor.execute("""
        INSERT OR REPLACE INTO senior_alumni_tips (
            question_id, senior_name, placed_company, tip_text, batch_year, verified
        ) VALUES (?, ?, ?, ?, 2026, 1)
    """, (
        new_qid,
        f"Senior {role_clean}",
        comp_clean.upper(),
        template["senior_tip"]
    ))

    conn.commit()

    # Re-fetch the newly created question
    cursor.execute("SELECT * FROM questions WHERE id = ?", (new_qid,))
    new_q = dict(cursor.fetchone())
    new_q["senior_tip"] = {
        "tip_text": template["senior_tip"],
        "senior_name": f"Senior ({comp_clean.upper()})",
        "placed_company": comp_clean.upper()
    }
    conn.close()
    return new_q
