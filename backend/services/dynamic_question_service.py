"""
Dynamic Question Sourcing & Multi-Role Synthesis Service
B.Tech CSE Final Year Project: Self-Learning AI Interview Platform

Fetches and generates diverse, unrepeated, company-specific and role-specific interview questions.
Supports 11 High-Demand Industry Job Profiles with at least 5-6 unique questions per role.
"""

import os
import json
import uuid
import random
import hashlib
from typing import Dict, Any, List, Optional
from backend.database import get_db_connection

# Comprehensive question pool across all 11 industry career roles
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
        },
        {
            "question": "How does Python handle Dict hashing and collision resolution? Why are dictionary keys required to be hashable and immutable?",
            "category": "Data Structures & Internals",
            "competency": "relevance",
            "difficulty": "mid",
            "ideal_answer": "Python dicts use an open-addressing hash table with perturbation hashing to probe indices. An object is hashable if it implements __hash__() and __eq__() and its hash value remains constant throughout its lifecycle. If a mutable object (like a list) were used as a key and then modified, its hash value would change, meaning future lookups would probe the wrong bucket and fail to retrieve the entry.",
            "senior_tip": "Mention Python 3.6+ compact dict architecture which preserves key insertion order while saving 20-25% memory."
        },
        {
            "question": "Compare Django vs FastAPI for building scalable microservices. How do Dependency Injection and Pydantic validation benefit FastAPI services?",
            "category": "Web Frameworks & Architecture",
            "competency": "completeness",
            "difficulty": "entry",
            "ideal_answer": "Django is a batteries-included monolithic framework with an ORM, admin panel, and auth built-in, ideal for full-stack database-heavy apps. FastAPI is a modern, lightweight ASGI framework built on Starlette and Pydantic, providing automatic OpenAPI docs, native async request handling, and sub-millisecond serialization speeds. Dependency Injection (Depends) simplifies database session management and JWT authentication without global state.",
            "senior_tip": "Explain how Pydantic models validate input JSON at runtime and cast types automatically."
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
        },
        {
            "question": "How does the Java Streams API execute operations? Differentiate intermediate vs terminal operations, and explain how parallelStreams leverage the ForkJoinPool.",
            "category": "Functional Java & Streams",
            "competency": "relevance",
            "difficulty": "mid",
            "ideal_answer": "Streams pipeline data lazily: intermediate operations (filter, map, sorted) transform a stream and do not execute until a terminal operation (collect, forEach, reduce) is invoked. ParallelStreams split work across worker threads in the common ForkJoinPool using a work-stealing algorithm, but should be avoided for blocking I/O or stateful predicates to prevent pool starvation.",
            "senior_tip": "Mention that short-circuiting operations (findFirst, anyMatch) stop pipeline execution as soon as a match is found."
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
        },
        {
            "question": "Explain the Browser Event Loop: Call Stack, Web APIs, Microtask Queue (Promises), and Macrotask Queue (setTimeout/setInterval). What order do they execute?",
            "category": "JavaScript Asynchronous Runtime",
            "competency": "structure",
            "difficulty": "mid",
            "ideal_answer": "The JS engine executes synchronous code on the single Call Stack. Asynchronous callbacks are handled by browser Web APIs. When resolved, Promise callbacks (.then, async/await) go to the Microtask Queue, while setTimeout/setInterval go to the Macrotask Queue. After each synchronous task, the Event Loop empties the ENTIRE Microtask Queue before processing the next Macrotask, meaning Promise resolutions always execute before setTimeout(fn, 0).",
            "senior_tip": "Give a quick code snippet with setTimeout and Promise.resolve to prove the execution sequence."
        },
        {
            "question": "Compare CSS Grid vs Flexbox. When should you choose CSS Grid for page layouts over Flexbox?",
            "category": "Modern CSS & Layouts",
            "competency": "relevance",
            "difficulty": "entry",
            "ideal_answer": "Flexbox is one-dimensional (handles either rows OR columns at a time), perfect for distributing space among items in a navbar or list. CSS Grid is two-dimensional (handles rows AND columns simultaneously), designed for complete page structure layouts with header, sidebar, main content, and footer. Use Grid when layout structure is parent-driven; use Flexbox when layout is component-driven.",
            "senior_tip": "Mention grid-template-areas for semantic and clean responsive breakpoint restructuring."
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
        },
        {
            "question": "Explain the Saga Pattern for managing distributed transactions across microservices. Contrast Choreography-based Sagas with Orchestration-based Sagas.",
            "category": "Microservices & Distributed Systems",
            "competency": "evidence",
            "difficulty": "hard",
            "ideal_answer": "Since two-phase commit (2PC) does not scale well across decoupled microservices, Saga breaks a distributed transaction into a sequence of local transactions. Each transaction updates its local DB and publishes an event. If a local transaction fails, compensating transactions execute in reverse order to rollback state. Choreography uses event-driven pub/sub without a central coordinator (loose coupling but hard to track); Orchestration uses a centralized orchestrator (like Temporal/AWS Step Functions) to command services (simpler monitoring but central point of logic).",
            "senior_tip": "Give an e-commerce order checkout example: Order Service -> Payment Service -> Inventory Service with compensations."
        },
        {
            "question": "How do you design an API Rate Limiter? Compare the Token Bucket and Sliding Window Log algorithms.",
            "category": "API Architecture & Security",
            "competency": "technical_correctness",
            "difficulty": "mid",
            "ideal_answer": "Token Bucket maintains a bucket of fixed capacity refilled with tokens at a constant rate; requests take tokens and pass if tokens are available (supports bursts). Sliding Window Log stores timestamps of requests in a Redis Sorted Set (ZSET) and removes timestamps older than the window, providing 100% boundary accuracy without boundary burst exploits at the cost of higher memory.",
            "senior_tip": "Mention returning HTTP 429 Too Many Requests with Retry-After header."
        },
        {
            "question": "What is Database Sharding? Compare Horizontal Partitioning with Vertical Partitioning and explain how Consistent Hashing solves re-sharding problems.",
            "category": "Database Scalability",
            "competency": "relevance",
            "difficulty": "hard",
            "ideal_answer": "Vertical partitioning splits tables by columns (e.g. User Profile vs User Payment Info). Horizontal partitioning (Sharding) divides rows across independent database servers using a shard key (e.g. user_id % N). Consistent Hashing maps keys to a virtual ring; when a new shard node is added or removed, only K/N keys need to be migrated instead of re-hashing all keys.",
            "senior_tip": "Discuss the risk of Shard Hotspots if an uneven shard key (like country) is chosen."
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
        },
        {
            "question": "Compare JWT (JSON Web Tokens) with Server-Side Session Cookies for user authentication in Single Page Applications. How do you store tokens securely against XSS and CSRF?",
            "category": "Authentication & Security",
            "competency": "technical_correctness",
            "difficulty": "entry",
            "ideal_answer": "Session cookies store a random session ID on the server in Redis/DB, enabling instant server-side revocation. JWTs are stateless, self-contained cryptographically signed tokens containing user claims, eliminating DB lookups. To store securely: never store JWTs in localStorage (vulnerable to XSS); store in an httpOnly, SameSite=Strict, Secure cookie so JavaScript cannot access it, preventing XSS token theft.",
            "senior_tip": "Explain using short-lived Access Tokens (15 min) paired with rotatable Refresh Tokens."
        },
        {
            "question": "Explain Server-Side Rendering (SSR) with Next.js vs Client-Side Rendering (CSR) with Vite/React. What are the SEO and Time-to-First-Byte (TTFB) trade-offs?",
            "category": "Full Stack Web Architecture",
            "competency": "evidence",
            "difficulty": "mid",
            "ideal_answer": "CSR downloads an empty HTML skeleton and a JavaScript bundle which builds the DOM in the browser, resulting in fast subsequent page navigation but slower Initial Page Load and poor SEO for crawlers without JS. SSR generates complete HTML on the server per request, providing superior SEO and immediate First Contentful Paint, but increases server CPU load and TTFB. Modern apps use hybrid ISR (Incremental Static Regeneration).",
            "senior_tip": "Discuss hydration and how React attaches event listeners to pre-rendered server HTML."
        },
        {
            "question": "How do you manage database migrations safely in production without downtime when adding a non-nullable column to a table with 10 million rows?",
            "category": "Database DevOps & Migrations",
            "competency": "structure",
            "difficulty": "hard",
            "ideal_answer": "Never add a NOT NULL column with a default value directly in one step, as it locks the table while writing defaults to 10 million rows. Instead use Expand-and-Contract: 1) Add column as nullable. 2) Deploy app code writing to both old and new columns. 3) Backfill existing rows in batched background workers. 4) Add NOT NULL constraint and validation. 5) Deploy final app code reading exclusively from new column.",
            "senior_tip": "Mention tools like Flyway, Liquibase, or Alembic for version-controlled migration scripts."
        },
        {
            "question": "How does CORS (Cross-Origin Resource Sharing) work? Explain Preflight OPTIONS requests and why simple GET requests bypass preflight.",
            "category": "Web Security & Protocols",
            "competency": "relevance",
            "difficulty": "entry",
            "ideal_answer": "CORS is a browser security mechanism that restricts web pages from making AJAX requests to a different domain, port, or protocol. For non-simple requests (methods other than GET/POST/HEAD, or custom headers like Authorization), the browser automatically sends a preflight HTTP OPTIONS request asking the server for Access-Control-Allow-Origin, Access-Control-Allow-Methods, and Access-Control-Allow-Headers before dispatching the real payload.",
            "senior_tip": "Clarify that CORS is enforced by the BROWSER, not by curl or backend server-to-server calls."
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
        },
        {
            "question": "Compare Row-oriented storage (CSV/Avro) vs Columnar storage (Parquet/ORC). Why is Parquet vastly superior for analytical OLAP aggregations?",
            "category": "Storage Formats & Big Data",
            "competency": "structure",
            "difficulty": "entry",
            "ideal_answer": "Row-oriented storage stores entire records contiguously, optimal for OLTP writes. Columnar formats like Parquet store all values of a column contiguously. For analytical queries (e.g. SELECT AVG(salary) FROM emp), Parquet performs Column Projection, skipping 95% of unqueried columns. It also compresses columns efficiently using dictionary and run-length encoding (RLE) and supports Predicate Pushdown.",
            "senior_tip": "Explain Predicate Pushdown: filtering data at the storage layer before reading into memory."
        },
        {
            "question": "How do you handle Late-Arriving Data and Exactly-Once Semantics in streaming data pipelines using Apache Kafka and Apache Flink?",
            "category": "Stream Processing",
            "competency": "relevance",
            "difficulty": "hard",
            "ideal_answer": "Late-arriving data is handled using Watermarks and Event Time rather than Processing Time, paired with allowed lateness windows. Exactly-Once Semantics (EOS) is achieved by combining Kafka's transactional producer (idempotent producer with transactional commit markers) with Flink's Chandy-Lamport distributed snapshotting checkpoint mechanism and two-phase commit sink.",
            "senior_tip": "Distinguish between At-Least-Once (duplicates possible) and Exactly-Once (coordinated two-phase commit)."
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
        },
        {
            "question": "Explain the Bias-Variance Tradeoff. How do L1 (Lasso) and L2 (Ridge) Regularization prevent model overfitting?",
            "category": "Statistical Machine Learning",
            "competency": "structure",
            "difficulty": "entry",
            "ideal_answer": "High bias leads to underfitting (model is too simplistic to capture true patterns); high variance leads to overfitting (model memorizes noise in training data). L1 regularization adds the sum of absolute coefficients (|w|) as a penalty, driving irrelevant weights exactly to zero for feature selection. L2 regularization adds squared weights (w^2), penalizing large weights smoothly without setting them strictly to zero.",
            "senior_tip": "Mention that ElasticNet combines both L1 and L2 penalties."
        },
        {
            "question": "How does Retrieval-Augmented Generation (RAG) work? Walk through embedding generation, vector indexing (HNSW/IVF), and prompt augmentation.",
            "category": "LLMs & Generative AI",
            "competency": "evidence",
            "difficulty": "mid",
            "ideal_answer": "Documents are chunked and converted into dense vector embeddings using an embedding model. These are indexed in a vector database (e.g. Pinecone/Chroma) using approximate nearest neighbor algorithms like Hierarchical Navigable Small World (HNSW). When a user queries, the query is embedded, top-K semantically similar chunks are retrieved via cosine similarity, and injected into the LLM system prompt as factual context.",
            "senior_tip": "Explain how RAG solves LLM hallucinations and outdated training knowledge cutoff dates."
        },
        {
            "question": "Explain Gradient Descent optimization algorithms: compare standard SGD with Momentum, RMSprop, and Adam (Adaptive Moment Estimation).",
            "category": "Deep Learning Optimization",
            "competency": "technical_correctness",
            "difficulty": "hard",
            "ideal_answer": "Standard SGD updates weights in the negative gradient direction with fixed learning rates, often oscillating in ravines. Momentum adds an exponentially decaying moving average of past gradients to accelerate along persistent directions. RMSprop divides the gradient by the root mean square of recent gradients to adapt learning rates per parameter. Adam combines both: first moment (mean of gradients via momentum) and second moment (uncentered variance of gradients via RMSprop).",
            "senior_tip": "Explain bias correction in Adam during initial time steps."
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
        },
        {
            "question": "Explain Infrastructure as Code (IaC) principles. Compare Terraform's declarative approach with Ansible's procedural configuration management.",
            "category": "Infrastructure as Code",
            "competency": "evidence",
            "difficulty": "entry",
            "ideal_answer": "IaC defines computing infrastructure through machine-readable definition files rather than manual console clicks, enabling version control and idempotent provisioning. Terraform is declarative: you describe the desired end-state (e.g. '3 EC2 instances in VPC A') and Terraform computes the delta graph to reach that state. Ansible is primarily configuration management: executing procedural playbooks to install software on running servers.",
            "senior_tip": "Discuss the critical importance of the Terraform State File (tfstate) and locking it in S3 with DynamoDB."
        },
        {
            "question": "How do you design a high-availability CI/CD pipeline using GitHub Actions or GitLab CI? Explain automated testing gates, artifacts, and secrets management.",
            "category": "CI/CD & DevOps Automation",
            "competency": "relevance",
            "difficulty": "mid",
            "ideal_answer": "The pipeline triggers on Pull Request: runs linters and unit tests in parallel matrix runners. Upon merge to main: builds Docker image, runs vulnerability scanning (Trivy/Snyk), tags with git commit SHA, and pushes to container registry. Deployment stages use gated approvals for production environments with short-lived OIDC tokens instead of hardcoded long-lived cloud credentials.",
            "senior_tip": "Emphasize security: never echo secrets in logs and use environment-scoped approval protection."
        },
        {
            "question": "What is Site Reliability Engineering (SRE)? Define SLI, SLO, and SLA, and explain how an Error Budget guides feature velocity.",
            "category": "SRE & Monitoring",
            "competency": "completeness",
            "difficulty": "hard",
            "ideal_answer": "SLI (Service Level Indicator) is a quantified measure of performance (e.g. 99.5% of requests have latency < 200ms). SLO (Service Level Objective) is the internal target team sets (e.g. 99.9% uptime). SLA (Service Level Agreement) is the legal contract with customers with financial penalties. The Error Budget is 100% - SLO: if budget remains, teams can ship new features fast; if budget is burned, all deployments freeze until reliability is restored.",
            "senior_tip": "Mention Prometheus and Grafana for monitoring SLIs in real-time."
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
        },
        {
            "question": "How does SQL Injection work? Explain why parameterized queries (Prepared Statements) completely eliminate SQL injection vulnerabilities.",
            "category": "Database Security & OWASP",
            "competency": "evidence",
            "difficulty": "entry",
            "ideal_answer": "SQL injection occurs when user input is concatenated directly into a SQL query string, allowing an attacker to alter the query logic (e.g. ' OR '1'='1). Prepared statements pre-compile the SQL query structure on the database engine with placeholders (?) before binding values. The database treats parameters strictly as literal data rather than executable SQL commands, making syntax alteration impossible.",
            "senior_tip": "Mention that ORMs protect by default, but raw SQL queries inside ORMs can re-introduce vulnerabilities."
        },
        {
            "question": "Explain the Zero Trust security model. What does 'Never Trust, Always Verify' mean in cloud perimeter defense?",
            "category": "Network Architecture & Security",
            "competency": "relevance",
            "difficulty": "mid",
            "ideal_answer": "Traditional castle-and-moat security assumes any user or device inside the corporate intranet is trusted. Zero Trust operates on the principle that threat actors are already inside the network. It enforces: continuous mutual authentication (mTLS), strict least-privilege role-based access control (RBAC), micro-segmentation of networks, and device posture compliance before granting access to any individual resource.",
            "senior_tip": "Discuss identity as the new security perimeter replacing traditional VPN firewalls."
        },
        {
            "question": "What is the difference between Symmetric and Asymmetric Encryption? How are they combined in modern hybrid cryptosystems?",
            "category": "Applied Cryptography",
            "competency": "completeness",
            "difficulty": "entry",
            "ideal_answer": "Symmetric encryption (AES-GCM, ChaCha20) uses the same secret key for encryption and decryption, offering gigabyte-per-second speeds. Asymmetric encryption (RSA, ECC) uses a public key to encrypt and a private key to decrypt, solving the key distribution problem at high computational cost. Modern hybrid cryptosystems use asymmetric encryption to authenticate identities and exchange a shared symmetric session key, which then encrypts data payloads.",
            "senior_tip": "Explain why Elliptic Curve Cryptography (ECC) provides the same security as RSA with vastly smaller key sizes (256-bit vs 2048-bit)."
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
        },
        {
            "question": "What causes Flaky Tests in end-to-end automation (Selenium/Cypress/Playwright) and what strategies do you employ to eliminate them?",
            "category": "Test Reliability & Triage",
            "competency": "technical_correctness",
            "difficulty": "hard",
            "ideal_answer": "Flakiness is predominantly caused by: hardcoded Thread.sleep() instead of dynamic explicit waits, race conditions during asynchronous AJAX/DOM rendering, animation timing, and shared test database state. Strategies to eliminate: replace sleeps with explicit web driver waits (ExpectedConditions.visibilityOf), mock slow third-party services with WireMock, isolate database state per test with transactions, and run flaky test quarantine suites.",
            "senior_tip": "Playwright's auto-waiting mechanism dramatically reduces flakiness compared to legacy Selenium."
        },
        {
            "question": "Explain the Test Pyramid concept. Why should automated test suites prioritize Unit Tests over UI End-to-End Tests?",
            "category": "Testing Strategy & CI/CD",
            "competency": "relevance",
            "difficulty": "entry",
            "ideal_answer": "The Test Pyramid recommends a broad base of Unit Tests (fast, isolated, cheap to write and debug), a middle tier of Integration/API tests, and a small apex of UI End-to-End tests. Inverting the pyramid into an 'ice cream cone' results in brittle, slow-running test suites that delay CI/CD pipelines and provide poor root-cause localization when a test fails.",
            "senior_tip": "Mention test execution time: 1,000 unit tests run in 5 seconds; 50 UI tests can take 20 minutes."
        },
        {
            "question": "What is the difference between Mocking, Stubbing, and Spying in automated test frameworks (like Mockito or Jest)?",
            "category": "Unit Testing & Mocking",
            "competency": "completeness",
            "difficulty": "mid",
            "ideal_answer": "A Stub provides predetermined canned answers to method calls during the test without verifying behavior. A Mock is an object programmed with expectations to verify that specific methods were called with exact parameters (verifying interactions). A Spy wraps a real object, allowing real method execution while recording interaction telemetry for verification.",
            "senior_tip": "Give an example with PaymentGateway: stubbing returns dummy success; mocking verifies charge() was invoked exactly once."
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
        },
        {
            "question": "Explain Deadlocks in Multithreaded Operating Systems. What are the 4 Coffman conditions required for a deadlock to occur, and how do you prevent them?",
            "category": "Operating Systems & Concurrency",
            "competency": "structure",
            "difficulty": "mid",
            "ideal_answer": "A deadlock is a condition where two or more threads are permanently blocked waiting for resources held by each other. The 4 Coffman conditions: 1) Mutual Exclusion, 2) Hold and Wait, 3) No Preemption, and 4) Circular Wait. Prevention involves breaking at least one condition, typically Circular Wait by enforcing a strict global resource acquisition ordering hierarchy.",
            "senior_tip": "Mention the Dining Philosophers problem as a classic demonstration of circular wait."
        },
        {
            "question": "Explain the Time and Space Complexity of QuickSort vs MergeSort. In what real-world scenarios is MergeSort preferred over QuickSort?",
            "category": "Data Structures & Algorithms",
            "competency": "evidence",
            "difficulty": "entry",
            "ideal_answer": "QuickSort has average O(N log N) time and O(log N) auxiliary space, but degrades to O(N^2) worst-case on poor pivot choices. MergeSort guarantees O(N log N) time in all cases but requires O(N) auxiliary space. MergeSort is preferred when stability is required (preserving order of equal keys) and for sorting Linked Lists or huge datasets stored on disk (External Sorting) where sequential disk access is fast.",
            "senior_tip": "Explain why Java uses Dual-Pivot QuickSort for primitives and Timsort (hybrid MergeSort) for Objects."
        },
        {
            "question": "Explain the Singleton Design Pattern. How do you implement a thread-safe Singleton using Double-Checked Locking in Java or Python?",
            "category": "Design Patterns",
            "competency": "relevance",
            "difficulty": "mid",
            "ideal_answer": "Singleton ensures a class has only one instance and provides a global access point to it. In Java, Double-Checked Locking uses a private static volatile instance: check instance == null, synchronize on the class, and check instance == null again before creating. The volatile keyword is critical to prevent CPU instruction reordering where partially initialized objects become visible to other threads.",
            "senior_tip": "Mention the Bill Pugh Singleton or Enum Singleton as cleaner alternatives in modern Java."
        }
    ]
}

def get_or_create_round_question(
    company_id: str = "tcs",
    round_type: str = "technical",
    target_competency: str = "technical_correctness",
    difficulty: str = "mid",
    excluded_ids: Optional[set] = None,
    excluded_texts: Optional[set] = None,
    role_name: str = "Software Developer"
) -> Dict[str, Any]:
    """
    Retrieves an unasked question matching the target company, role, and round.
    Guarantees that questions already asked in the session (by ID or text) are never repeated.
    """
    excluded_ids = excluded_ids or set()
    excluded_texts = set(t.strip().lower() for t in (excluded_texts or set()))
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

    # Filter out already asked questions by both ID AND question text
    unasked_db = [
        q for q in all_db_q 
        if q["id"] not in excluded_ids and q["question_text"].strip().lower() not in excluded_texts
    ]

    if unasked_db:
        chosen = unasked_db[0]
        cursor.execute("SELECT tip_text, senior_name, placed_company FROM senior_alumni_tips WHERE question_id = ?", (chosen["id"],))
        tip_row = cursor.fetchone()
        chosen["senior_tip"] = dict(tip_row) if tip_row else None
        conn.close()
        return chosen

    # 2. Dynamic generation from ROLE_QUESTION_CATALOG (select unasked template)
    role_pool = ROLE_QUESTION_CATALOG.get(role_clean, ROLE_QUESTION_CATALOG["Software Developer"])
    unasked_templates = [
        t for t in role_pool 
        if t["question"].strip().lower() not in excluded_texts
    ]
    template = random.choice(unasked_templates) if unasked_templates else random.choice(role_pool)

    # Use deterministic hash for question ID
    q_hash = hashlib.sha256(template["question"].encode("utf-8")).hexdigest()[:8]
    new_qid = f"q_{comp_clean}_{role_clean.lower().replace(' ', '_').replace('/', '_')[:8]}_{q_hash}"
    
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

    cursor.execute("SELECT * FROM questions WHERE id = ?", (new_qid,))
    new_q = dict(cursor.fetchone())
    new_q["senior_tip"] = {
        "tip_text": template["senior_tip"],
        "senior_name": f"Senior ({comp_clean.upper()})",
        "placed_company": comp_clean.upper()
    }

    conn.close()
    return new_q
