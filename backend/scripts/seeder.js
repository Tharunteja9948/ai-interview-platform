import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// DOMAIN PROFILES
const COMPANY_PROFILES = {
  // Geo & Logistics / Delivery
  uber: 'geo_logistics', lyft: 'geo_logistics', zomato: 'geo_logistics', swiggy: 'geo_logistics',
  zepto: 'geo_logistics', blinkit: 'geo_logistics', ola: 'geo_logistics', rapido: 'geo_logistics',

  // Fintech & Ledgers
  stripe: 'fintech_ledger', razorpay: 'fintech_ledger', phonepe: 'fintech_ledger', paytm: 'fintech_ledger',
  cred: 'fintech_ledger', zerodha: 'fintech_ledger', groww: 'fintech_ledger', bharatpe: 'fintech_ledger', slice: 'fintech_ledger',

  // Hardware & High Performance
  nvidia: 'hardware_gpu',

  // Collaboration & SaaS
  atlassian: 'saas_collab',

  // Big 4 Consulting
  deloitte: 'consulting_big4', kpmg: 'consulting_big4', pwc: 'consulting_big4', ey: 'consulting_big4',

  // IT Services
  tcs: 'it_services', infosys: 'it_services', wipro: 'it_services', accenture: 'it_services',
  cognizant: 'it_services', capgemini: 'it_services', hcltech: 'it_services', hexaware: 'it_services',
  ibm: 'it_services', tech_mahindra: 'it_services', virtusa: 'it_services',

  // Consumer Startups
  oyo: 'startup_consumer', lenskart: 'startup_consumer', meesho: 'startup_consumer', nykaa: 'startup_consumer',

  // Big Tech & Cloud Infra (Default)
  google: 'big_tech_infra', microsoft: 'big_tech_infra', amazon: 'big_tech_infra', meta: 'big_tech_infra',
  netflix: 'big_tech_infra', apple: 'big_tech_infra', linkedin: 'big_tech_infra', oracle: 'big_tech_infra',
  salesforce: 'big_tech_infra', adobe: 'big_tech_infra', twitter_x: 'big_tech_infra', flipkart: 'big_tech_infra'
};

// DOMAIN POOLS FOR HIGH-ACCURACY QUESTIONS WITH HYPER-CLEAR STRUCTURED TUTORIALS
const DOMAIN_QUESTIONS = {
  geo_logistics: {
    coding: {
      entry: [
        {
          question: "Given a list of delivery locations (X, Y coordinates), find the closest rider located at (Rx, Ry).",
          ideal_answer: "1. Core Concept:\nWe calculate the distance between the rider's coordinate and each package location using the Euclidean Distance formula: d = sqrt((x2 - x1)^2 + (y2 - y1)^2).\n\n2. Key Approaches:\n- Approach 1: Linear Scan (O(N) Time, O(1) Space). Best for unsorted dynamic coordinates.\n- Approach 2: KD-Tree Partitioning (O(log N) average search, O(N log N) build). Best for static or high-query grids.\n\n3. Python Implementation (Linear Scan):\n```python\nimport math\n\ndef get_nearest_rider(rider_coord, locations):\n    rx, ry = rider_coord\n    min_distance = float('inf')\n    closest_location = None\n    \n    for x, y in locations:\n        # Calculate Euclidean distance squared (saves sqrt CPU cycles)\n        distance_sq = (x - rx)**2 + (y - ry)**2\n        if distance_sq < min_distance:\n            min_distance = distance_sq\n            closest_location = (x, y)\n            \n    return closest_location, math.sqrt(min_distance) if closest_location else None\n```\n\n4. Complexity & Trade-offs:\n- Time Complexity: O(N) since we must check every location once.\n- Space Complexity: O(1) auxiliary space."
        },
        {
          question: "Write an algorithm to sort a list of delivery packages based on their weight in ascending order.",
          ideal_answer: "1. Core Concept:\nSorting packages chronologically or by load values ensures efficient dispatch queues.\n\n2. Key Sorting Approaches:\n- Approach 1: Timsort (Python's native sorted() - O(N log N) time, O(N) space). Highly stable.\n- Approach 2: Quick Sort (O(N log N) average, O(N^2) worst-case, O(log N) space). In-place but unstable.\n\n3. Python Implementation (Quick Sort):\n```python\ndef quicksort_packages(packages):\n    if len(packages) <= 1:\n        return packages\n    pivot = packages[len(packages) // 2]\n    left = [x for x in packages if x < pivot]\n    middle = [x for x in packages if x == pivot]\n    right = [x for x in packages if x > pivot]\n    return quicksort_packages(left) + middle + quicksort_packages(right)\n```\n\n4. Complexity:\n- Time: O(N log N) average.\n- Space: O(N) recursion stack and buffer arrays."
        }
      ],
      mid: [
        {
          question: "Given a road network represented as a graph, calculate the shortest route from a restaurant to a customer using Dijkstra's algorithm.",
          ideal_answer: "1. Core Concept:\nDijkstra's algorithm finds the shortest path from a single source node to all other nodes in a weighted graph with non-negative edge weights.\n\n2. Algorithm Steps (Using a Min-Heap):\n1. Initialize distance to start node as 0, all others as infinity.\n2. Push (distance=0, start_node) to Min-Heap.\n3. Pop node with smallest distance. If already visited, skip.\n4. Relax neighbors: if (distance_to_curr + edge_weight) < current_distance_to_neighbor, update distance and push to heap.\n\n3. Python Implementation:\n```python\nimport heapq\n\ndef dijkstra(graph, start, customer):\n    # graph adjacency structure: {node: {neighbor: cost}}\n    distances = {node: float('inf') for node in graph}\n    distances[start] = 0\n    min_heap = [(0, start)]\n    visited = set()\n    \n    while min_heap:\n        current_dist, current_node = heapq.heappop(min_heap)\n        \n        if current_node == customer:\n            return current_dist\n            \n        if current_node in visited:\n            continue\n        visited.add(current_node)\n        \n        for neighbor, weight in graph.get(current_node, {}).items():\n            distance = current_dist + weight\n            if distance < distances[neighbor]:\n                distances[neighbor] = distance\n                heapq.heappush(min_heap, (distance, neighbor))\n                \n    return -1 # customer is unreachable\n```\n\n4. Complexity:\n- Time Complexity: O((V + E) log V) where V is vertices and E is edges.\n- Space Complexity: O(V) to store distances and heap states."
        },
        {
          question: "Write a program to validate if a driver's GPS coordinate path contains any outlier telemetric jumps.",
          ideal_answer: "1. Core Concept:\nDetect hardware telemetry glitches by measuring speed intervals between consecutive GPS coordinates. If velocity exceeds physical limits (e.g. 150 km/h), flag as an outlier.\n\n2. Formulas:\n- Distance: Geodesic calculation on WGS-84 ellipsoid coordinates.\n- Velocity: distance / delta_time.\n\n3. Python Implementation:\n```python\nfrom geopy.distance import geodesic\n\ndef clean_gps_data(coordinates, max_speed_kmh=150.0):\n    # coordinates format: [(latitude, longitude, timestamp_epoch)]\n    if not coordinates: return []\n    cleaned = [coordinates[0]]\n    \n    for i in range(1, len(coordinates)):\n        lat1, lon1, t1 = cleaned[-1]\n        lat2, lon2, t2 = coordinates[i]\n        \n        dist = geodesic((lat1, lon1), (lat2, lon2)).kilometers\n        time_hours = (t2 - t1) / 3600.0\n        \n        if time_hours > 0:\n            speed = dist / time_hours\n            if speed <= max_speed_kmh:\n                cleaned.append(coordinates[i])\n                \n    return cleaned\n```\n\n4. Complexity:\n- Time: O(N) single linear sweep.\n- Space: O(N) to return the filtered path."
        }
      ],
      senior: [
        {
          question: "Design a real-time driver tracking and dispatching system (like Uber or Zomato) handling millions of active updates.",
          ideal_answer: "1. Core System Architecture:\n- Ingestion Layer: WebSockets / gRPC servers handle high-frequency coordinate uploads from driver apps.\n- Geospatial Indexing: Hexagonal spatial partitions (Uber H3 Index) segment coordinate positions.\n- Spatial Cache: Redis Geo index (GEOADD / GEORADIUS) tracks active drivers inside specific H3 hexagons.\n- Matcher Engine: Node processes query nearest drivers in real-time using OSRM path distances.\n\n2. System Data Flow:\n[Driver App] --(WebSocket coords)--> [Ingestion Microservice] --> [Redis Geo Cache (TTL 10s)]\n                                                                           ^\n[Customer Request] ---------------> [Match Engine] --(radial query)--------/\n\n3. Scalability & High Availability:\nSharding Redis geo keys by parent H3 region cells prevents single-node hot spots."
        }
      ],
      behavioral: [
        {
          question: "Describe a situation where you had to debug a live production issue affecting active delivery routes.",
          ideal_answer: "1. Core Concept:\nDemonstrate logical triage under pressure, incident isolation, diagnostic patterns, and post-mortem resolutions.\n\n2. Key Steps in Response:\n- Blast Radius Containment: Revert the latest deployment or redirect traffic.\n- Diagnostics: Inspect Datadog metrics, ELK log entries, and database transaction counts.\n- Root Cause: e.g., missing index on route lookups caused connection pool exhaustion.\n- Post-Mortem: Set up automated integration checks and alerts."
        }
      ]
    }
  },
  fintech_ledger: {
    coding: {
      entry: [
        {
          question: "Write a function to verify if a ledger balance matches the sum of its credit and debit entries.",
          ideal_answer: "1. Core Concept:\nVerify financial record consistency. Credit operations add to the total balance, while debit operations subtract from it.\n\n2. Implementation Details:\nTo prevent floating-point calculation errors (e.g., 0.1 + 0.2 != 0.3), compare values using a small epsilon threshold.\n\n3. Python Implementation:\n```python\ndef verify_ledger(expected_balance, transactions):\n    # transactions: list of dicts {'type': 'CREDIT'/'DEBIT', 'amount': float}\n    computed_balance = 0.0\n    for tx in transactions:\n        if tx['type'] == 'CREDIT':\n            computed_balance += tx['amount']\n        elif tx['type'] == 'DEBIT':\n            computed_balance -= tx['amount']\n            \n    # Compare using epsilon to bypass float precision limitations\n    return abs(computed_balance - expected_balance) < 1e-9\n```\n\n4. Complexity:\n- Time Complexity: O(N) time.\n- Space Complexity: O(1) space."
        },
        {
          question: "Write a program to detect if a credit card number has a valid format using Luhn's algorithm.",
          ideal_answer: "1. Core Concept:\nLuhn's algorithm (Modulo 10 formula) validates card numbers to catch typos before making external bank API requests.\n\n2. Algorithm Steps:\n1. Starting from the rightmost digit, double the value of every second digit.\n2. If doubling results in a number greater than 9, subtract 9.\n3. Sum all the digits.\n4. If total % 10 == 0, the number is valid.\n\n3. Python Implementation:\n```python\ndef luhn_checksum_isValid(card_str):\n    # Strip out spacing and non-digit characters\n    digits = [int(char) for char in card_str if char.isdigit()]\n    checksum = 0\n    \n    for idx, val in enumerate(reversed(digits)):\n        if idx % 2 == 1:  # Double every second digit from right\n            val *= 2\n            if val > 9:\n                val -= 9\n        checksum += val\n        \n    return checksum % 10 == 0\n```\n\n4. Complexity:\n- Time: O(N) where N is card length.\n- Space: O(N) array allocation."
        }
      ],
      mid: [
        {
          question: "Design an API idempotent receiver that prevents double charges when merchants retry requests.",
          ideal_answer: "1. Core Concept:\nIdempotency guarantees that repeating an API call with the same key yields the exact same result without performing duplicate actions.\n\n2. Execution Sequence:\n1. Client requests payment sending `Idempotency-Key: uuid-value-123`.\n2. Server attempts to set key `idemp:uuid-value-123` to status `IN_PROGRESS` in Redis with a lease TTL (e.g. 5 minutes).\n3. If key is already in Redis:\n   - Status `IN_PROGRESS`: Return 409 Conflict.\n   - Status `COMPLETED`: Return cached response payload directly.\n4. Process payment, write completed result to database, and update Redis status to `COMPLETED` with cached payload.\n\n3. Redis Cache Commands:\n`SET idemp:uuid-value-123 IN_PROGRESS NX EX 300` (Atomic locks using NX flag)."
        },
        {
          question: "Write a function to merge overlapping financial transaction time intervals.",
          ideal_answer: "1. Core Concept:\nMerge intersecting times into a single continuous window.\n\n2. Algorithm:\n1. Sort intervals by start time.\n2. Initialize `merged` list with the first interval.\n3. For each subsequent interval, check if it overlaps with the last item in `merged`. If yes, merge by adjusting end time. If no, append.\n\n3. Python Implementation:\n```python\ndef merge_transaction_intervals(intervals):\n    if not intervals: return []\n    # Sort by start time\n    intervals.sort(key=lambda x: x[0])\n    merged = [intervals[0]]\n    \n    for current in intervals[1:]:\n        last_start, last_end = merged[-1]\n        curr_start, curr_end = current\n        \n        if curr_start <= last_end:  # Overlap detected\n            merged[-1][1] = max(last_end, curr_end)\n        else:\n            merged.append(current)\n            \n    return merged\n```\n\n4. Complexity:\n- Time: O(N log N) due to sorting.\n- Space: O(N) to store merged results."
        }
      ],
      senior: [
        {
          question: "Design a high-throughput payment settlement microservice that guarantees eventual consistency across multiple banking gateways.",
          ideal_answer: "1. Core Architecture Pattern: Saga Pattern (Orchestrator-based)\nBecause two-phase commit (2PC) blocks databases and limits throughput, banking microservices use Saga workflows:\n- Orchestrator publishes message: `Debit Account`.\n- If successful: Publish `Credit Merchant`.\n- If credit fails: Publish compensating reverse event `Refund Account`.\n\n2. Event Log:\nUses Kafka message streams to guarantee delivery. Reconcilers inspect ledger tables periodically to identify anomalies."
        }
      ],
      behavioral: [
        {
          question: "Tell me about a time you had to design a secure payment feature with zero allowance for data loss.",
          ideal_answer: "1. Answer Structure:\nExplain setting up database transaction bounds, using database row locks (`SELECT FOR UPDATE`), audit logging, and automated integration checks. Detail handling currency limits and API input validations."
        }
      ]
    }
  },
  hardware_gpu: {
    coding: {
      entry: [
        {
          question: "Implement parallel array summation using standard threading structures. Avoid race conditions.",
          ideal_answer: "1. Core Concept:\nTo sum an array in parallel, divide the array into segments. Each thread sums its segment locally to prevent memory synchronization lock overhead, then adds its sum to a shared accumulator.\n\n2. Java Implementation:\n```java\nimport java.util.concurrent.atomic.AtomicLong;\n\npublic class ThreadedSum {\n    public static long compute(int[] array, int numThreads) throws InterruptedException {\n        AtomicLong globalTotal = new AtomicLong(0);\n        Thread[] workers = new Thread[numThreads];\n        int size = (array.length + numThreads - 1) / numThreads;\n        \n        for (int i = 0; i < numThreads; i++) {\n            final int startIdx = i * size;\n            final int endIdx = Math.min(startIdx + size, array.length);\n            \n            workers[i] = new Thread(() -> {\n                long localSum = 0;\n                for (int j = startIdx; j < endIdx; j++) {\n                    localSum += array[j];\n                }\n                globalTotal.addAndGet(localSum); // Safe atomic accumulation\n            });\n            workers[i].start();\n        }\n        \n        for (Thread t : workers) t.join();\n        return globalTotal.get();\n    }\n}\n```\n\n3. Complexity:\n- Time: O(N) parallel runtime.\n- Space: O(T) thread allocation overhead."
        }
      ],
      mid: [
        {
          question: "Explain the differences between page-locked (pinned) host memory and pageable memory in CUDA development.",
          ideal_answer: "1. Core Differences:\n- Pageable Host Memory: Standard allocation (e.g. malloc). Can be swapped by OS to disk. Transferring it requires the driver to copy it to a pinned buffer first, then copy it to the GPU.\n- Pinned Memory (Page-locked): Locked in RAM. GPU can copy it directly using DMA (Direct Memory Access).\n\n2. Performance Trade-off:\nPinned memory doubles transfer bandwidth and allows asynchronous copies (`cudaMemcpyAsync`), but consuming too much of it can degrade general system performance."
        }
      ],
      senior: [
        {
          question: "Design a virtualization layer that shares physical GPU hardware resources dynamically among multiple cloud containers.",
          ideal_answer: "1. Shared Resource Strategy:\n- Hardware Level: Multi-Instance GPU (MIG) splits SMs (Streaming Multiprocessors) and memory to guarantee hardware-level isolation.\n- API Level Interception: A custom proxy intercepts CUDA calls, scheduling executions sequentially in a time-sliced schedule.\n\n2. Evaluation: MIG is secure for client separation, while API proxying allows overprovisioning resource capacity."
        }
      ],
      behavioral: [
        {
          question: "Describe a project where you had to optimize low-level performance constraints to achieve hardware acceleration.",
          ideal_answer: "1. Key Areas:\nDiscuss cache spatial locality (contiguous memory reads), compiler optimizations, SIMD vectorizations, and profiling applications (using tools like Nsight)."
        }
      ]
    }
  },
  saas_collab: {
    coding: {
      entry: [
        {
          question: "Design a rate limiter using a sliding window counter algorithm.",
          ideal_answer: "1. Core Concept:\nA sliding window rate limiter counts requests within a precise window (e.g., last 60 seconds), removing expired request timestamps on each check.\n\n2. Implementation Logic:\nStore request timestamps in a Redis sorted set (ZSET) for each user. Remove entries older than `current_time - window_size`, count remaining keys, and add the current request.\n\n3. Python Implementation:\n```python\nimport time\nimport redis\n\ndef rate_limit_check(redis_client, user_id, limit=100, window_secs=60):\n    now = time.time()\n    window_start = now - window_secs\n    key = f\"limits:{user_id}\"\n    \n    # Run transaction pipeline\n    pipe = redis_client.pipeline()\n    pipe.zremrangebyscore(key, 0, window_start) # Clean old timestamps\n    pipe.zcard(key)                             # Count remaining requests\n    pipe.zadd(key, {str(now): now})             # Add current request\n    pipe.expire(key, window_secs)               # Reset key TTL\n    _, current_count, _, _ = pipe.execute()\n    \n    return current_count <= limit\n```\n\n4. Complexity:\n- Time: O(log N) where N is the number of requests in the window.\n- Space: O(N) request history storage."
        }
      ],
      mid: [
        {
          question: "Explain how Operational Transformation (OT) or CRDTs handle concurrent edits in collaborative tools like Jira/Confluence.",
          ideal_answer: "1. Core Concepts:\n- Operational Transformation (OT): Operations are sent to a central server, transformed relative to concurrent updates, and broadcasted to clients (e.g., Google Docs).\n- Conflict-free Replicated Data Types (CRDTs): Operations merge concurrently without a central coordinator (e.g., Figma).\n\n2. Trade-offs:\nOT requires a persistent server connection, while CRDTs support decentralized peer-to-peer editing."
        }
      ],
      senior: [
        {
          question: "Design a real-time collaborative task board (like Jira boards) displaying live card movements to thousands of concurrent users.",
          ideal_answer: "1. System Architecture:\n- Ingestion: WebSocket gateways maintain persistent connections with clients.\n- Event Pipeline: Updates are saved in SQL databases, and event changes are published to a Redis Pub/Sub channel.\n- Broadcast: Gateway instances subscribe to channels and relay updates to active clients.\n\n2. Component Flow:\nClient -> WebSockets -> API Gateway -> DB (Writes)\n                                      -> Publishes to Redis Pub/Sub -> Gateway Instances -> Subscribed Clients"
        }
      ],
      behavioral: [
        {
          question: "Describe a situation where concurrent team updates caused conflict. How did you resolve the design differences?",
          ideal_answer: "1. Resolution Guidelines:\nExplain setting up isolated tests, compiling benchmarks, and aligning team stakeholders on the solution that prioritizes performance and maintainability."
        }
      ]
    }
  },
  consulting_big4: {
    coding: {
      entry: [
        {
          question: "A client wants to scale their retail stores in a new country. How would you calculate their market size (TAM)?",
          ideal_answer: "1. Market Size Frameworks:\n- Top-Down: Start with the total population, filter by target demographic, and multiply by average spend.\n- Bottom-Up: Calculate average store revenue in similar markets, scale by target store counts, and sum the totals.\n\n2. Comparison:\nBottom-up analysis provides a more realistic estimate as it is grounded in operational performance metrics."
        }
      ],
      mid: [
        {
          question: "A client has a legacy relational database with slow transaction report generation. Explain how you would optimize it.",
          ideal_answer: "1. Optimization Strategy:\n- Add indexes on filtered columns.\n- Direct analytics queries to read replicas.\n- Partition large tables horizontally (e.g. by year).\n- Cache aggregate values in Redis.\n\n2. Comparison:\nMoving reporting workloads to read replicas prevents table lock contention on primary write database nodes."
        }
      ],
      senior: [
        {
          question: "Design a business performance dashboard auditing thousands of financial transactions for regulatory compliance.",
          ideal_answer: "1. System Architecture:\n- Ingestion: Stream transaction logs into Kafka queues.\n- Analysis: Apply compliance validation rules in real-time (Apache Flink).\n- Storage: Save verified records in a Write-Once-Read-Many (WORM) compliant database.\n\n2. Key Benefit:\nReal-time event analysis detects anomalies immediately, avoiding compliance validation delays."
        }
      ],
      behavioral: [
        {
          question: "Describe a project where you had to explain a complex technical solution to a non-technical corporate client.",
          ideal_answer: "1. Communication Guidelines:\nAvoid technical jargon, translate process constraints into business and cost impacts, and use simple visual workflow diagrams."
        }
      ]
    }
  },
  it_services: {
    coding: {
      entry: [
        {
          question: "Write a program to check if a given string is a palindrome. Explain your approach.",
          ideal_answer: "1. Core Concept:\nA palindrome is a string that reads the same backward as forward (e.g., 'radar').\n\n2. Key Approaches:\n- Approach 1: Two-Pointer Iteration (O(N) Time, O(1) Space). Most memory efficient.\n- Approach 2: String Reversal (O(N) Time, O(N) Space). Easiest to implement, but allocates extra memory.\n\n3. Python Implementation (Two-Pointer):\n```python\ndef is_palindrome(s):\n    left, right = 0, len(s) - 1\n    while left < right:\n        # Skip non-alphanumeric characters\n        while left < right and not s[left].isalnum():\n            left += 1\n        while left < right and not s[right].isalnum():\n            right -= 1\n            \n        if s[left].lower() != s[right].lower():\n            return False\n            \n        left += 1\n        right -= 1\n        \n    return True\n```\n\n4. Complexity:\n- Time Complexity: O(N) since we visit each character at most once.\n- Space Complexity: O(1) auxiliary space."
        },
        {
          question: "Write a SQL query to find the Nth highest salary of an employee from an Employee table.",
          ideal_answer: "1. Core Concept:\nFind the employee record whose salary is higher than exactly N-1 other unique salaries.\n\n2. SQL Approaches:\n- Approach 1: Correlated Subquery (Universal SQL Standard).\n- Approach 2: LIMIT and OFFSET (MySQL Specific).\n- Approach 3: DENSE_RANK() Window Function (Modern SQL Standard).\n\n3. SQL Implementations:\n```sql\n-- Approach 1: Correlated Subquery\nSELECT DISTINCT Salary \nFROM Employee E1 \nWHERE N-1 = (\n    SELECT COUNT(DISTINCT E2.Salary) \n    FROM Employee E2 \n    WHERE E2.Salary > E1.Salary\n);\n\n-- Approach 2: LIMIT OFFSET (MySQL)\nSELECT DISTINCT Salary \nFROM Employee \nORDER BY Salary DESC \nLIMIT 1 OFFSET N-1;\n\n-- Approach 3: DENSE_RANK() (PostgreSQL/SQL Server)\nWITH RankedSalaries AS (\n    SELECT Salary, DENSE_RANK() OVER (ORDER BY Salary DESC) as rnk\n    FROM Employee\n)\nSELECT Salary FROM RankedSalaries WHERE rnk = N LIMIT 1;\n```\n\n4. Complexity:\n- Correlated subquery: O(N^2) time.\n- Window function: O(N log N) due to sorting."
        },
        {
          question: "Given an array, find the second largest element without sorting the array.",
          ideal_answer: "1. Core Concept:\nTrack the largest and second-largest values in a single pass through the array.\n\n2. Algorithm:\n1. Initialize `largest = -infinity` and `second_largest = -infinity`.\n2. Iterate through the array. For each element:\n   - If element > `largest`: update `second_largest = largest`, then update `largest = element`.\n   - Else if element > `second_largest` and element != `largest`: update `second_largest = element`.\n\n3. Python Implementation:\n```python\ndef get_second_largest(numbers):\n    if len(numbers) < 2:\n        return -1\n        \n    largest = second_largest = float('-inf')\n    for num in numbers:\n        if num > largest:\n            second_largest = largest\n            largest = num\n        elif num > second_largest and num != largest:\n            second_largest = num\n            \n    return second_largest if second_largest != float('-inf') else -1\n```\n\n4. Complexity:\n- Time: O(N) single linear scan.\n- Space: O(1) constant auxiliary space."
        }
      ],
      mid: [
        {
          question: "Explain the difference between clustered and non-clustered indexes in SQL databases.",
          ideal_answer: "1. Core Differences:\n- Clustered Index: Determines the physical sort order of rows in the table. Because of this physical ordering constraint, there can be only one clustered index per table (typically the Primary Key).\n- Non-Clustered Index: Creates a separate logical pointer structure mapping keys to row addresses on disk. You can create multiple non-clustered indexes.\n\n2. Key Metrics:\n- Read Performance: Clustered is faster for range scans. Non-clustered requires an extra pointer lookup step.\n- Write Overhead: Modifying values in a clustered index can force physical rows to move, increasing write latency."
        },
        {
          question: "Write a function to check if a binary tree is symmetric (mirror reflection of itself).",
          ideal_answer: "1. Core Concept:\nA binary tree is symmetric if its left and right subtrees are mirror reflections of each other.\n\n2. Algorithm:\nWrite a recursive helper `isMirror(t1, t2)`:\n- If both nodes are null, return true.\n- If only one is null, return false.\n- Compare values, then recursively verify `isMirror(t1.left, t2.right)` and `isMirror(t1.right, t2.left)`.\n\n3. Python Implementation:\n```python\nclass TreeNode:\n    def __init__(self, val=0, left=None, right=None):\n        self.val = val\n        self.left = left\n        self.right = right\n\ndef is_symmetric(root):\n    if not root: return True\n    \n    def is_mirror(t1, t2):\n        if not t1 and not t2: return True\n        if not t1 or not t2: return False\n        \n        return (t1.val == t2.val) and \\\n               is_mirror(t1.left, t2.right) and \\\n               is_mirror(t1.right, t2.left)\n               \n    return is_mirror(root.left, root.right)\n```\n\n4. Complexity:\n- Time: O(N) as we visit every node once.\n- Space: O(H) recursion stack space."
        }
      ],
      senior: [
        {
          question: "Explain how you would handle database transaction ACID properties under a banking client environment.",
          ideal_answer: "1. Implementation of ACID in Banking:\n- Atomicity: Run operations within transaction blocks (`COMMIT`/`ROLLBACK`). Undo logs track states during execution failures.\n- Consistency: Enforce column constraints and primary key validations.\n- Isolation: Configure isolation level to 'Serializable' or 'Repeatable Read' to prevent phantom reads during money transfers.\n- Durability: Ensure Write-Ahead Logging (WAL) commits to disk before acknowledging transaction completions.\n\n2. Recovery Scenario:\nIf database crashes mid-transfer, on startup the engine rolls back uncommitted steps using the Undo log."
        }
      ],
      behavioral: [
        {
          question: "Describe a situation where a client changed their product requirements mid-way through development. How did you react?",
          ideal_answer: "1. Key Strategy:\nExplain identifying stakeholders, documenting design changes, reviewing impacts on timelines and costs, updating backlog items, and delivering iteratively."
        }
      ]
    }
  },
  startup_consumer: {
    coding: {
      entry: [
        {
          question: "Write a function to merge overlapping customer hotel booking intervals.",
          ideal_answer: "1. Core Concept:\nCombine intersecting time ranges into single continuous intervals.\n\n2. Implementation:\nSort intervals by check-in time, then check overlaps with the last merged range.\n\n3. Python Implementation:\n```python\ndef merge_bookings(bookings):\n    if not bookings: return []\n    # Sort by check-in time\n    bookings.sort(key=lambda x: x[0])\n    merged = [bookings[0]]\n    \n    for check_in, check_out in bookings[1:]:\n        last_out = merged[-1][1]\n        if check_in <= last_out:\n            merged[-1][1] = max(last_out, check_out) # Merge overlap\n        else:\n            merged.append([check_in, check_out])\n            \n    return merged\n```\n\n4. Complexity:\n- Time: O(N log N) sorting cost.\n- Space: O(N) output allocation."
        }
      ],
      mid: [
        {
          question: "Design an inventory reservation system that holds a product for a user for 10 minutes during checkout.",
          ideal_answer: "1. Core System Design:\n- Reservation Store: Set temporary inventory reservation states in Redis using key-expirations (TTL 10m).\n- SQL Inventory: Decrement stock value in database.\n- Cleanup Handler: If key expires without payment completion, a listener receives a keyevent notification and releases the reserved inventory.\n\n2. Flow Diagram:\nClient -> reserve item -> SQL (Stock - 1) -> Redis set TTL key 'item:user' 600s\n                                           |\n                                           --> (If 10m expires) -> Event Listener -> SQL (Stock + 1)"
        }
      ],
      senior: [
        {
          question: "Design a high-scale hotel room search engine (like OYO) that serves real-time pricing and availability to millions of users.",
          ideal_answer: "1. Architecture Patterns:\n- Read/Write Separation: Write operations (bookings) go to SQL databases. Read operations query Elasticsearch indices.\n- Streaming Cache: Change Data Capture (Debezium) streams database writes to Elasticsearch.\n- Local Cache: Redis stores pricing calculations by geographic geohash cells."
        }
      ],
      behavioral: [
        {
          question: "Describe a time you had to build a complex feature under tight startup deadlines. What trade-offs did you make?",
          ideal_answer: "1. Trade-off Logic:\nDetail prioritizing core business paths, writing logic validation tests, and postponing performance optimizations to subsequent sprints."
        }
      ]
    }
  },
  big_tech_infra: {
    coding: {
      entry: [
        {
          question: "Given a binary tree, write a function to check if it is a valid Binary Search Tree (BST).",
          ideal_answer: "1. Core Concept:\nA binary tree is a valid BST if every node's value is greater than all values in its left subtree, and less than all values in its right subtree.\n\n2. Algorithm:\nWrite a recursive helper passing range limits `(low, high)`. Update ranges as you traverse: going left updates high, going right updates low.\n\n3. Python Implementation:\n```python\ndef isValidBST(root):\n    def validate(node, low=float('-inf'), high=float('inf')):\n        if not node: \n            return True\n        if not (low < node.val < high): \n            return False\n        # Left child must be in range (low, node.val), right must be in (node.val, high)\n        return validate(node.left, low, node.val) and validate(node.right, node.val, high)\n        \n    return validate(root)\n```\n\n4. Complexity:\n- Time: O(N) as we visit each node once.\n- Space: O(H) call stack space, where H is the height of the tree."
        },
        {
          question: "Given an unsorted array of integers, find the length of the longest consecutive elements sequence.",
          ideal_answer: "1. Core Concept:\nFind the longest sequence of consecutive integers using a hash set for O(1) lookups.\n\n2. Algorithm:\n1. Insert all numbers into a hash set.\n2. Iterate through the set. For each number, if (num - 1) is not in the set, it marks the start of a sequence.\n3. Count consecutive values (num + 1, num + 2...) present in the set.\n\n3. Python Implementation:\n```python\ndef longestConsecutive(nums):\n    num_set = set(nums)\n    longest_streak = 0\n    \n    for num in num_set:\n        if num - 1 not in num_set:  # start of sequence\n            current_num = num\n            current_streak = 1\n            \n            while current_num + 1 in num_set:\n                current_num += 1\n                current_streak += 1\n                \n            longest_streak = max(longest_streak, current_streak)\n            \n    return longest_streak\n```\n\n4. Complexity:\n- Time: O(N) as each number is processed in at most two lookups.\n- Space: O(N) to store elements in the hash set."
        },
        {
          question: "Design a data structure that follows the constraints of a Least Recently Used (LRU) Cache.",
          ideal_answer: "1. Core Design:\nAn LRU cache requires O(1) Get and Put operations. To achieve this, we combine a Hash Map (for O(1) node lookups) with a Doubly Linked List (to maintain usage order in O(1) time).\n\n2. Linked List Operations:\n- Head: Most recently used element.\n- Tail: Least recently used element (evicted when capacity is exceeded).\n\n3. Python Implementation:\n```python\nclass Node:\n    def __init__(self, key=0, val=0):\n        self.key = key\n        self.val = val\n        self.prev = None\n        self.next = None\n\nclass LRUCache:\n    def __init__(self, capacity: int):\n        self.cap = capacity\n        self.map = {} # stores key -> Node\n        self.head = Node()\n        self.tail = Node()\n        self.head.next = self.tail\n        self.tail.prev = self.head\n\n    def _remove(self, node):\n        node.prev.next = node.next\n        node.next.prev = node.prev\n\n    def _add_to_head(self, node):\n        node.next = self.head.next\n        node.prev = self.head\n        self.head.next.prev = node\n        self.head.next = node\n\n    def get(self, key: int) -> int:\n        if key in self.map:\n            node = self.map[key]\n            self._remove(node)\n            self._add_to_head(node)\n            return node.val\n        return -1\n\n    def put(self, key: int, value: int) -> None:\n        if key in self.map:\n            self._remove(self.map[key])\n        node = Node(key, value)\n        self.map[key] = node\n        self._add_to_head(node)\n        if len(self.map) > self.cap:\n            lru_node = self.tail.prev\n            self._remove(lru_node)\n            del self.map[lru_node.key]\n```\n\n4. Complexity:\n- Time: O(1) for both get and put operations.\n- Space: O(N) to store cached keys and nodes."
        }
      ],
      mid: [
        {
          question: "Given an input string s and a pattern p, implement regular expression matching with support for '.' and '*'.",
          ideal_answer: "1. Core Concept:\nImplement regex matching where '.' matches any character and '*' matches zero or more of the preceding character.\n\n2. Algorithm:\nUse top-down dynamic programming (memoization) to match characters, caching boolean results in a memo grid.\n\n3. Python Implementation:\n```python\ndef isMatch(s: str, p: str) -> bool:\n    memo = {}\n    def dp(i, j):\n        if (i, j) in memo:\n            return memo[(i, j)]\n        if j == len(p):\n            return i == len(s)\n            \n        first_match = i < len(s) and p[j] in (s[i], '.')\n        if j + 1 < len(p) and p[j+1] == '*':\n            # Match zero characters or match one character and repeat pattern\n            ans = dp(i, j + 2) or (first_match and dp(i + 1, j))\n        else:\n            ans = first_match and dp(i + 1, j + 1)\n            \n        memo[(i, j)] = ans\n        return ans\n    return dp(0, 0)\n```\n\n4. Complexity:\n- Time: O(M * N) where M is string length and N is pattern length.\n- Space: O(M * N) memoization table."
        },
        {
          question: "You are given an array of k linked lists, each sorted in ascending order. Merge all the linked lists into one sorted linked list.",
          ideal_answer: "1. Core Concept:\nMerge k sorted lists efficiently using a min-heap to keep track of the smallest current elements across lists.\n\n2. Algorithm:\n1. Insert the head node of each linked list into a min-heap.\n2. Poll the smallest node from the heap and append it to the merged list.\n3. If the popped node has a successor, insert the successor into the heap.\n\n3. Python Implementation:\n```python\nimport heapq\n\nclass ListNode:\n    def __init__(self, val=0, next=None):\n        self.val = val\n        self.next = next\n\ndef mergeKLists(lists):\n    min_heap = []\n    # Add head nodes to heap, using index to break value ties\n    for idx, head_node in enumerate(lists):\n        if head_node:\n            heapq.heappush(min_heap, (head_node.val, idx, head_node))\n            \n    dummy = ListNode(0)\n    current = dummy\n    \n    while min_heap:\n        val, idx, node = heapq.heappop(min_heap)\n        current.next = node\n        current = current.next\n        if node.next:\n            heapq.heappush(min_heap, (node.next.val, idx, node.next))\n            \n    return dummy.next\n```\n\n4. Complexity:\n- Time: O(N log k) where N is total nodes and k is lists count.\n- Space: O(k) min-heap size."
        }
      ],
      senior: [
        {
          question: "Design a distributed search engine crawler that crawls the web and index pages at Google scale.",
          ideal_answer: "1. Core Infrastructure Components:\n- URL Frontier: Distributed queues (Kafka) that partition URLs by hostname to respect crawling rates.\n- Crawler Workers: Read URLs, fetch pages, and extract links.\n- Content Filters: Detect duplicate page content using hashing algorithms (MinHash).\n- Storage: Save raw HTML pages in a distributed wide-column database (Bigtable)."
        },
        {
          question: "Design Google Maps: detail the geospatial data storage, grid partitioning, and routing algorithms.",
          ideal_answer: "1. Core Architecture Design:\n- Storage: Represent road networks as graphs with intersections as nodes and roads as edges.\n- Partitioning: Index coordinates using S2 geometry cells or Geohashes.\n- Routing: Pre-calculate highways and routes using routing algorithms (A* or Contraction Hierarchies)."
        }
      ],
      behavioral: [
        {
          question: "Tell me about a time you worked on a project with vague requirements. How did you handle the ambiguity?",
          ideal_answer: "1. Key Strategy:\nDetail identifying stakeholders, document design choices and assumptions, deploy a minimal prototype, and collect feedback to refine specifications."
        }
      ]
    }
  }
};

// ROLE-SPECIFIC DETAILED TECHNICAL POOL FOR ALL 8 ROLES
const ROLE_TECH_POOL = {
  sde: {
    coding: {
      entry: [
        {
          question: "Explain the difference between a stack and a queue data structure.",
          ideal_answer: "1. Core Differences:\n- Stack: LIFO (Last In First Out) access pattern. Elements are added and removed from the same end (Push/Pop).\n- Queue: FIFO (First In First Out) access pattern. Elements are added at the rear (Enqueue) and removed from the front (Dequeue).\n\n2. Implementation:\n```python\n# Stack using list\nstack = []\nstack.append(1)  # Push\nstack.pop()      # Pop\n\n# Queue using deque\nfrom collections import deque\nqueue = deque()\nqueue.append(1)  # Enqueue\nqueue.popleft()  # Dequeue\n```\n\n3. Use Cases:\n- Stack: Backtracking (DFS), undo history.\n- Queue: Task scheduling (BFS), print queues."
        },
        {
          question: "How does a binary search algorithm work, and what is its time complexity?",
          ideal_answer: "1. Core Concept:\nBinary search finds a target value in a sorted array by repeatedly dividing the search space in half.\n\n2. Python Implementation:\n```python\ndef binary_search(nums, target):\n    low, high = 0, len(nums) - 1\n    while low <= high:\n        mid = (low + high) // 2\n        if nums[mid] == target:\n            return mid\n        elif nums[mid] < target:\n            low = mid + 1\n        else:\n            high = mid - 1\n    return -1\n```\n\n3. Complexity:\n- Time: O(log N) runtime.\n- Space: O(1) constant auxiliary space."
        }
      ],
      mid: [
        {
          question: "What is a Hash Map, and how does it handle key-value collisions?",
          ideal_answer: "1. Collision Resolution:\n- Chaining: Stores colliding keys in a linked list or tree at the calculated hash index.\n- Open Addressing: Finds the next available slot in the table array using probing techniques.\n\n2. Hashing Mechanism:\nHash maps use a hash function to map keys to bucket indexes. When different keys hash to the same bucket index, a collision occurs."
        }
      ],
      senior: [
        {
          question: "Explain the CAP theorem and the trade-offs between consistency and availability.",
          ideal_answer: "1. CAP Theorem Breakdown:\n- Consistency (C): Every read receives the most recent write or an error.\n- Availability (A): Every non-failing node returns a response.\n- Partition Tolerance (P): The system continues to operate despite network partition errors.\n\n2. Trade-off:\nBecause network partitions (P) are inevitable, distributed systems must choose between Consistency (CP) or Availability (AP)."
        }
      ]
    }
  },
  frontend: {
    coding: {
      entry: [
        {
          question: "What is the difference between let, const, and var in JavaScript?",
          ideal_answer: "1. Key Differences:\n- var: Function-scoped, hoisted (initialized as undefined), and allows reassignment.\n- let: Block-scoped, hoisted but not initialized (Temporal Dead Zone), and allows reassignment.\n- const: Block-scoped, hoisted but not initialized, and prevents variable reassignment.\n\n2. JavaScript Example:\n```javascript\nfunction test() {\n  if (true) {\n    var x = 1;     // Function-scoped\n    let y = 2;     // Block-scoped\n    const z = 3;   // Block-scoped & Immutable reference\n  }\n  console.log(x);  // Prints 1\n  // console.log(y); // Throws ReferenceError\n}\n```"
        },
        {
          question: "How does the Virtual DOM work in React, and why is it fast?",
          ideal_answer: "1. Core Concept:\n- State changes: React builds a new virtual DOM representation in memory.\n- Diffing: React compares it with the previous virtual DOM tree.\n- Reconciliation: React updates only the changed elements in the real browser DOM.\n\n2. Benefit:\nMinimizes layout updates and repaints, improving frontend rendering speeds."
        }
      ],
      mid: [
        {
          question: "What is CORS, and how do you resolve it in frontend and backend setups?",
          ideal_answer: "1. Core Concept:\nCORS is a browser security mechanism that blocks cross-origin requests. It is resolved by configuring the backend to include origin headers.\n\n2. Express Solution:\n```javascript\nconst cors = require('cors');\napp.use(cors({\n  origin: 'http://localhost:5173',\n  credentials: true\n}));\n```"
        },
        {
          question: "What are React Hooks rules, and how does the dependency array in useEffect work?",
          ideal_answer: "1. Rules of Hooks:\n- Only call Hooks at the top level of your component.\n- Only call Hooks from React function components.\n\n2. React useEffect Example:\n```javascript\nimport React, { useEffect, useState } from 'react';\n\nfunction Profile({ userId }) {\n  const [user, setUser] = useState(null);\n  useEffect(() => {\n    fetch(`/api/users/${userId}`).then(res => res.json()).then(setUser);\n  }, [userId]); // Dependency array: hooks re-runs when userId changes\n}\n```"
        }
      ],
      senior: [
        {
          question: "How would you optimize the Core Web Vitals (specifically LCP and CLS) of a heavy React landing page?",
          ideal_answer: "1. LCP (Largest Contentful Paint) optimizations:\n- Compress images (WebP/AVIF format) and lazy-load off-screen assets.\n- Code-split route resources using dynamic imports.\n2. CLS (Cumulative Layout Shift) optimizations:\n- Set explicit width/height sizes on image and video containers.\n- Use skeleton loaders to occupy space during dynamic fetches."
        }
      ]
    }
  },
  backend: {
    coding: {
      entry: [
        {
          question: "Explain the differences between SQL and NoSQL databases. When would you choose one over the other?",
          ideal_answer: "1. Core Differences:\n- SQL: Relational tables, strict schemas, and strong transaction consistency (ACID). Best for transactional applications (e.g. banking records).\n- NoSQL: Schema-less documents, scaling horizontally. Best for unstructured or high-volume datasets.\n\n2. Selection Guide:\nChoose SQL for complex relational queries, and NoSQL for quick scalability and dynamic schemas."
        }
      ],
      mid: [
        {
          question: "How do you secure REST APIs using JWT (JSON Web Tokens) and handle token expiration/refresh cycles?",
          ideal_answer: "1. Security Strategy:\n- Sign Access Token with short lifetime (e.g. 15m) and Refresh Token with longer lifetime (e.g. 7d).\n- Send Refresh Token to client in secure, HttpOnly, SameSite cookies.\n\n2. Express Middleware:\n```javascript\nconst jwt = require('jsonwebtoken');\n\nfunction authenticate(req, res, next) {\n  const token = req.headers['authorization']?.split(' ')[1];\n  if (!token) return res.sendStatus(401);\n  \n  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {\n    if (err) return res.sendStatus(403);\n    req.user = user;\n    next();\n  });\n}\n```"
        }
      ],
      senior: [
        {
          question: "Design a distributed job queue worker system (like Celery or BullMQ) that processes async background tasks at scale.",
          ideal_answer: "1. Core Architecture Design:\n- Task Queue: Store task payloads in a Redis queue.\n- Workers: Poll Redis, process tasks inside try-catch blocks, and update task status.\n- Dead Letter Queue (DLQ): Send failed tasks to a separate queue for debugging and retries."
        }
      ]
    }
  },
  fullstack: {
    coding: {
      entry: [
        {
          question: "Explain the differences between Session-based authentication and Token-based (JWT) authentication.",
          ideal_answer: "1. Core Differences:\n- Session: Stateful lookup. Server stores session IDs in memory/database and sends a cookie to the client.\n- Token: Stateless signature. Server signs user data into a JWT, sending it to the client. Server validates the signature mathematically.\n\n2. Guide:\nTokens scale better in distributed architectures as they do not require database lookups."
        }
      ],
      mid: [
        {
          question: "How do you manage frontend state synchronization with backend API records securely and efficiently?",
          ideal_answer: "1. Query Engine Caching (React Query):\nUse query caching to fetch data, handle cache invalidation, and manage background updates.\n\n2. React Code Example:\n```javascript\nimport { useQuery } from '@tanstack/react-query';\n\nfunction Info({ itemId }) {\n  const { data, isLoading } = useQuery({\n    queryKey: ['item', itemId],\n    queryFn: () => fetch(`/api/items/${itemId}`).then(res => res.json()),\n    staleTime: 60000, // cache results for 1 minute\n  });\n  if (isLoading) return <div>Loading...</div>;\n  return <div>{data.title}</div>;\n}\n```"
        }
      ],
      senior: [
        {
          question: "Design a Server-Side Rendered (SSR) web application pipeline (like Next.js) and compare it with Static Site Generation (SSG).",
          ideal_answer: "1. Core Differences:\n- SSR: Server renders page HTML on each request. Best for highly dynamic pages.\n- SSG: Pre-compiles page HTML during build time. Best for static pages (e.g. blogs, documentation)."
        }
      ]
    }
  },
  python: {
    coding: {
      entry: [
        {
          question: "What is the difference between a list and a tuple in Python?",
          ideal_answer: "1. Key Differences:\n- List: Mutable, dynamic sizing, declared with square brackets `[]`.\n- Tuple: Immutable, fixed sizing, declared with parentheses `()`.\n\n2. Python Example:\n```python\n# List allows edits\nnums = [1, 2, 3]\nnums[0] = 99\n\n# Tuple rejects modifications\ncoords = (1, 2, 3)\n# coords[0] = 99 # Throws TypeError\n```"
        },
        {
          question: "Explain how memory management works in Python. What is the role of the Garbage Collector?",
          ideal_answer: "1. Core Concept:\n- Reference Counting: Python tracks references pointing to objects. When count hits zero, memory is freed.\n- Garbage Collector: Periodically sweeps memory to resolve cyclic references."
        }
      ],
      mid: [
        {
          question: "What are generators in Python, and how do they optimize memory usage?",
          ideal_answer: "1. Core Concept:\nGenerators yield values one at a time on demand rather than storing the entire sequence in memory, reducing memory consumption to O(1).\n\n2. Python Example:\n```python\ndef range_generator(limit):\n    val = 0\n    while val < limit:\n        yield val\n        val += 1\n\n# Uses O(1) memory instead of allocating a large list\nfor item in range_generator(1000000):\n    pass\n```"
        }
      ],
      senior: [
        {
          question: "Explain how the asyncio event loop works in Python. How does it achieve concurrency?",
          ideal_answer: "1. Event Loop Mechanism:\nTasks use `await` to yield execution back to the single-threaded event loop during I/O operations, allowing the loop to run other tasks concurrently."
        }
      ]
    }
  },
  java: {
    coding: {
      entry: [
        {
          question: "Explain the JVM memory model. What are Stack and Heap memory?",
          ideal_answer: "1. JVM Memory Allocation:\n- Stack: Stores local variables, primitives, and call stack frames. Each thread has its own stack.\n- Heap: Stores objects and classes shared across all threads. Managed by the Garbage Collector."
        }
      ],
      mid: [
        {
          question: "Explain Garbage Collection in Java. How does the garbage collector reclaim memory?",
          ideal_answer: "1. Heap Generations:\nJVM divides the heap into Young and Old generations. Young generation objects are collected frequently (Minor GC), while long-lived objects are moved to the Old generation (Major GC)."
        }
      ],
      senior: [
        {
          question: "How do JVM garbage collectors like G1 and ZGC achieve low-latency pause times?",
          ideal_answer: "1. Concurrent Compaction:\nG1 GC reclaims regions with the most garbage first to meet target pause times. ZGC compacts memory concurrently with application threads using load barriers and colored pointers, keeping pauses under 1ms."
        }
      ]
    }
  },
  data_analyst: {
    coding: {
      entry: [
        {
          question: "Explain the differences between INNER JOIN, LEFT JOIN, and FULL OUTER JOIN in SQL databases.",
          ideal_answer: "1. Core Differences:\n- INNER JOIN: Returns records with matches in both tables.\n- LEFT JOIN: Returns all records from the left table and matching records from the right table (unmatched columns get NULL).\n- FULL OUTER JOIN: Returns all records from both tables, filling mismatches with NULL values.\n\n2. SQL Example:\n```sql\n-- INNER JOIN\nSELECT A.id, B.name FROM TableA A INNER JOIN TableB B ON A.id = B.id;\n\n-- LEFT JOIN\nSELECT A.id, B.name FROM TableA A LEFT JOIN TableB B ON A.id = B.id;\n```"
        },
        {
          question: "Explain the difference between mean, median, and mode. Which one is best for datasets with extreme outliers?",
          ideal_answer: "1. Statistical Averages:\n- Mean: The average value. Heavily skewed by extreme outliers.\n- Median: The middle value in a sorted list. Robust against outliers.\n- Mode: The most frequent value."
        }
      ],
      mid: [
        {
          question: "How do you clean a dataset in Python Pandas? Detail how you handle duplicate rows and missing null values.",
          ideal_answer: "1. Pandas Cleaning:\nIdentify duplicates using `duplicated()`, and use `dropna()` or `fillna()` to handle missing values.\n\n2. Python Example:\n```python\nimport pandas as pd\n\ndef clean_data(df):\n    df = df.drop_duplicates()\n    df['age'] = df['age'].fillna(df['age'].mean())\n    return df\n```"
        }
      ],
      senior: [
        {
          question: "Explain the design of an ETL (Extract, Transform, Load) pipeline that ingests merchant transaction data into a Data Warehouse for business analytics.",
          ideal_answer: "1. Core Design:\nExtract transaction updates in real-time using Change Data Capture (CDC), transform them using Apache Spark or dbt, and load them into a columnar warehouse (e.g. BigQuery)."
        }
      ]
    }
  },
  ui_ux: {
    coding: {
      entry: [
        {
          question: "What are Nielsen's usability heuristics? Explain 'Consistency and Standards' and 'Visibility of System Status'.",
          ideal_answer: "1. Heuristics:\n- Visibility of System Status: The system should keep users informed about its state (e.g., loaders).\n- Consistency and Standards: The system should follow industry conventions so users know what to expect."
        },
        {
          question: "Explain the difference between mobile-first responsive layouts and desktop-down scaling in CSS.",
          ideal_answer: "1. CSS Layout Strategies:\n- Mobile-First: Apply base styles for small screens, using `min-width` media queries to add layout complexity for larger screens.\n- Desktop-Down: Build desktop layouts first, using `max-width` queries to adjust styles for mobile.\n\n2. CSS Example:\n```css\n/* Mobile-first layout */\n.grid {\n  display: flex;\n  flex-direction: column;\n}\n\n@media (min-width: 768px) {\n  .grid {\n    flex-direction: row; /* row layout on desktop */\n  }\n}\n```"
        }
      ],
      mid: [
        {
          question: "What is the difference between a wireframe, a mockup, and an interactive prototype?",
          ideal_answer: "1. Core Differences:\n- Wireframe: Low-fidelity layout showing page structures.\n- Mockup: High-fidelity static design showing visual themes.\n- Prototype: High-fidelity interactive simulation showing user flows."
        }
      ],
      senior: [
        {
          question: "Design a comprehensive Design Token component hierarchy that allows theme swapping (like Dark/Light) in a large UI design system.",
          ideal_answer: "1. Token Hierarchy:\nStore color values as Global Tokens (e.g. `#3b82f6`), reference them in Semantic Tokens (e.g. `background-primary`), and apply them using Component Tokens."
        }
      ]
    }
  }
};

// List of all companies to seed
const COMPANIES_LIST = [
  'google', 'microsoft', 'amazon', 'meta', 'netflix', 'apple', 'atlassian', 'stripe', 'airbnb', 'uber',
  'lyft', 'linkedin', 'nvidia', 'oracle', 'salesforce', 'adobe', 'twitter_x', 'flipkart',
  'deloitte', 'kpmg', 'pwc', 'ey',
  'tcs', 'infosys', 'wipro', 'accenture', 'cognizant', 'capgemini', 'hcltech', 'hexaware', 'ibm', 'tech_mahindra', 'virtusa',
  'razorpay', 'phonepe', 'paytm', 'zomato', 'swiggy', 'zepto', 'blinkit', 'cred', 'zerodha', 'groww', 'ola', 'oyo', 'rapido',
  'lenskart', 'meesho', 'nykaa', 'bharatpe', 'slice'
];

// Helper to seed questions for a company
function generateCompanyQuestions(companyId) {
  const list = [];
  const roles = ['sde', 'frontend', 'backend', 'fullstack', 'python', 'java', 'data_analyst', 'ui_ux'];
  const levels = ['entry', 'mid', 'senior'];
  
  const roleNames = {
    sde: 'Software Development Engineer (SDE)',
    frontend: 'Frontend Developer',
    backend: 'Backend Developer',
    fullstack: 'Full Stack Developer',
    python: 'Python Developer',
    java: 'Java Developer',
    data_analyst: 'Data Analyst',
    ui_ux: 'UI/UX Designer'
  };

  const roundNames = {
    coding: 'Coding & Logic (Data Structures & Algorithms)',
    design: 'System Design & Architecture',
    behavioral: 'Behavioral & Culture Fit'
  };

  const rounds = ['coding', 'design', 'behavioral'];

  // Resolve the domain profile profile key
  const profileKey = COMPANY_PROFILES[companyId] || 'big_tech_infra';
  const domainData = DOMAIN_QUESTIONS[profileKey];

  roles.forEach(roleKey => {
    rounds.forEach(roundKey => {
      levels.forEach(levelKey => {
        let pool = [];

        // Technical round vs Behavioral
        if (roundKey === 'behavioral') {
          pool = domainData.behavioral || (domainData.coding && domainData.coding.behavioral) || DOMAIN_QUESTIONS.big_tech_infra.coding.behavioral;
        } else {
          // Check if specific round exists (e.g. coding/design), else fall back to coding
          const roundObj = domainData[roundKey] || domainData.coding;
          if (roundObj) {
            pool = roundObj[levelKey] || roundObj.mid || roundObj.entry;
          }
        }

        // If pool is empty or doesn't match this custom role, fall back to global role-specific pool
        if (!pool || pool.length === 0 || profileKey !== COMPANY_PROFILES[companyId]) {
          const roleSource = ROLE_TECH_POOL[roleKey] || ROLE_TECH_POOL.sde;
          if (roundKey === 'behavioral') {
            pool = DOMAIN_QUESTIONS.big_tech_infra.coding.behavioral;
          } else {
            const roundObj = roleSource[roundKey] || roleSource.coding;
            pool = roundObj[levelKey] || roundObj.mid || roundObj.entry;
          }
        }

        // Defensive fallback to prevent any crashes
        if (!pool || pool.length === 0) {
          pool = ROLE_TECH_POOL.sde.coding.entry;
        }

        // Loop and add unique items from the pool
        pool.forEach((sourceItem, idx) => {
          list.push({
            id: `${companyId}_${roleKey}_${roundKey}_${levelKey}_q${idx + 1}`,
            role: roleNames[roleKey] || roleKey,
            round: roundNames[roundKey] || roundKey,
            level: levelKey,
            question: sourceItem.question,
            ideal_answer: sourceItem.ideal_answer
          });
        });
      });
    });
  });

  return {
    companyId,
    questions: list
  };
}

// Main execution function
function run() {
  const dirPath = path.join(__dirname, '../data/questions');
  
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  console.log(`Seeding questions inside: ${dirPath}`);
  
  COMPANIES_LIST.forEach(companyId => {
    const data = generateCompanyQuestions(companyId);
    const filePath = path.join(dirPath, `${companyId}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  });

  console.log(`Seeding completed successfully! Generated data files for ${COMPANIES_LIST.length} companies.`);
}

run();
