window.KRYOS_SYSTEM_DESIGN_ROADMAP_DATA = {
  "sourceTitle": "HLD / SYSTEM DESIGN — SDE-2",
  "depthLevels": [
    {
      "title": "L4 — MUST MASTER",
      "items": [
        "Can explain, draw, apply, handle follow-ups, and defend tradeoffs."
      ]
    },
    {
      "title": "L3 — WORKING KNOWLEDGE",
      "items": [
        "Can explain, use correctly, and discuss main tradeoffs."
      ]
    },
    {
      "title": "L2 — CONCEPTUAL",
      "items": [
        "Know what it is, why it exists, where to use it, and one tradeoff."
      ]
    },
    {
      "title": "L1 — AWARENESS",
      "items": [
        "Recognize it and know what problem it solves. Do not deep-dive."
      ]
    },
    {
      "title": "L0 — OPTIONAL / STRETCH",
      "items": [
        "Do not study before core SDE-2 preparation is complete."
      ]
    }
  ],
  "modules": [
    {
      "id": "sd-depth-levels",
      "title": "DEPTH LEVELS",
      "goal": "",
      "topics": [
        {
          "title": "L4 — MUST MASTER",
          "items": [
            "Can explain, draw, apply, handle follow-ups, and defend tradeoffs."
          ]
        },
        {
          "title": "L3 — WORKING KNOWLEDGE",
          "items": [
            "Can explain, use correctly, and discuss main tradeoffs."
          ]
        },
        {
          "title": "L2 — CONCEPTUAL",
          "items": [
            "Know what it is, why it exists, where to use it, and one tradeoff."
          ]
        },
        {
          "title": "L1 — AWARENESS",
          "items": [
            "Recognize it and know what problem it solves. Do not deep-dive."
          ]
        },
        {
          "title": "L0 — OPTIONAL / STRETCH",
          "items": [
            "Do not study before core SDE-2 preparation is complete."
          ]
        }
      ]
    },
    {
      "id": "sd-sde2-01",
      "title": "MODULE 1 — SYSTEM DESIGN INTERVIEW FRAMEWORK",
      "goal": "",
      "topics": [
        {
          "title": "TOPICS",
          "items": [
            "Requirement Clarification — L4",
            "Functional Requirements — L4",
            "Non-Functional Requirements — L4",
            "Establishing Scope — L4",
            "Making Assumptions — L4",
            "Scale Requirements — L4",
            "QPS Estimation — L4",
            "Peak QPS — L4",
            "Read / Write Ratio — L4",
            "Storage Estimation — L4",
            "Bandwidth / Throughput — L3",
            "Latency Budgeting — L3",
            "Availability / Nines — L3",
            "High-Level Design — L4",
            "Getting Interviewer Buy-In — L4",
            "Choosing Deep-Dive Areas — L4",
            "Bottleneck Identification — L4",
            "Tradeoff Discussion — L4",
            "Failure Discussion — L4",
            "Scaling Discussion — L4",
            "Avoiding Overengineering — L4",
            "Wrap-Up — L3",
            "Interview Time Management — L4"
          ]
        },
        {
          "title": "PRACTICE",
          "items": [
            "Alex Xu Chapter 3",
            "A Framework for System Design Interviews",
            "Practice the 4-step framework:",
            "1. Understand problem and establish scope",
            "2. Propose HLD and get buy-in",
            "3. Design deep dive",
            "4. Wrap up"
          ]
        }
      ]
    },
    {
      "id": "sd-sde2-02",
      "title": "MODULE 2 — URL SHORTENER",
      "goal": "",
      "topics": [
        {
          "title": "TOPICS",
          "items": [
            "Client → Server Request Flow — L4",
            "DNS — L3",
            "HTTP Request / Response — L4",
            "REST APIs — L4",
            "GET vs POST — L4",
            "HTTP Redirect — L3",
            "301 vs 302 Redirect — L3",
            "Stateless Web Servers — L4",
            "Load Balancer — L4",
            "Horizontal Scaling — L4",
            "SQL vs NoSQL Selection — L4",
            "Relational Data Model — L3",
            "Primary Key — L4",
            "Read-Heavy System Pattern — L4",
            "Caching — L4",
            "Cache Hit / Miss — L4",
            "Cache Hit Ratio — L4",
            "Cache Miss → Database Flow — L4",
            "Hashing Basics — L3",
            "Hash Collision — L2",
            "Base62 Encoding — L3",
            "Short-ID Generation — L3",
            "Bloom Filter Use Case — L1",
            "QPS Estimation — L4",
            "Storage Estimation — L4",
            "Read / Write Ratio — L4",
            "Database Replication — L3",
            "Database Sharding — L3",
            "High Availability — L3",
            "Fault Tolerance — L3"
          ]
        },
        {
          "title": "PRACTICE QUESTION",
          "items": [
            "Alex Xu Chapter 8",
            "DESIGN A URL SHORTENER"
          ]
        }
      ]
    },
    {
      "id": "sd-sde2-03",
      "title": "MODULE 3 — RATE LIMITER",
      "goal": "",
      "topics": [
        {
          "title": "TOPICS",
          "items": [
            "Why Rate Limiting Exists — L4",
            "Server-Side Rate Limiting — L4",
            "Per-User Rate Limiting — L4",
            "Per-IP Rate Limiting — L4",
            "Rule-Based Rate Limiting — L3",
            "Token Bucket — L4",
            "Leaky Bucket — L3",
            "Fixed Window Counter — L3",
            "Sliding Window Log — L3",
            "Sliding Window Counter — L4",
            "Redis Counter — L4",
            "Centralized Rate-Limit State — L4",
            "Distributed Rate Limiting — L4",
            "Race Conditions — L3",
            "Atomic Operations — L3",
            "Synchronization Across Servers — L3",
            "Low-Latency Design — L4",
            "Memory Efficiency — L3",
            "HTTP 429 — L3",
            "Hard Rate Limits — L3",
            "Soft Rate Limits — L3",
            "Burst Traffic Handling — L4",
            "Rate-Limiter Failure — L3",
            "Monitoring Rate-Limiter Effectiveness — L3",
            "Redis Lua Internals — L1",
            "Redis Sorted-Set Internals — L1"
          ]
        },
        {
          "title": "PRACTICE QUESTION",
          "items": [
            "Alex Xu Chapter 4",
            "DESIGN A RATE LIMITER"
          ]
        }
      ]
    },
    {
      "id": "sd-sde2-04",
      "title": "MODULE 4 — CONSISTENT HASHING",
      "goal": "",
      "topics": [
        {
          "title": "TOPICS",
          "items": [
            "Horizontal Scaling — L4",
            "Data Distribution Across Servers — L4",
            "Hash-Based Distribution — L3",
            "hash(key) % N — L3",
            "Rehashing Problem — L4",
            "Hash Ring — L3",
            "Clockwise Lookup — L3",
            "Adding a Server — L3",
            "Removing a Server — L3",
            "Minimal Key Redistribution — L3",
            "Uneven Distribution Problem — L3",
            "Virtual Nodes — L3",
            "Load Balancing with Virtual Nodes — L3",
            "Hotspot / Hot-Key Problem — L4",
            "Consistent Hashing for Cache Clusters — L3",
            "Consistent Hashing for Sharding — L3",
            "Consistent Hashing Mathematical Internals — L1"
          ]
        },
        {
          "title": "PRACTICE QUESTION",
          "items": [
            "Alex Xu Chapter 5",
            "DESIGN CONSISTENT HASHING"
          ]
        }
      ]
    },
    {
      "id": "sd-sde2-05",
      "title": "MODULE 5 — DISTRIBUTED KEY-VALUE STORE",
      "goal": "",
      "topics": [
        {
          "title": "TOPICS",
          "items": [
            "Key-Value Data Model — L3",
            "put(key, value) / get(key) — L3",
            "Distributed Storage — L4",
            "Partitioning — L4",
            "Consistent Hashing Usage — L3",
            "Replication — L4",
            "Replica Placement — L3",
            "CAP Theorem — L3",
            "Network Partition — L3",
            "Consistency vs Availability — L4",
            "Strong Consistency — L4",
            "Eventual Consistency — L4",
            "Read-Your-Writes — L4",
            "Stale Reads — L4",
            "N / R / W Quorum — L2",
            "Read Quorum — L2",
            "Write Quorum — L2",
            "Tunable Consistency — L2",
            "Concurrent Writes — L2",
            "Versioning — L2",
            "Conflict Resolution — L2",
            "Vector Clock — L1",
            "Failure Detection — L2",
            "Heartbeat — L2",
            "Gossip Protocol — L1",
            "Temporary Node Failure — L2",
            "Sloppy Quorum — L1",
            "Hinted Handoff — L1",
            "Permanent Replica Failure — L2",
            "Anti-Entropy — L1",
            "Merkle Tree — L1",
            "Memory + Disk Storage Path — L1",
            "SSTable — L1",
            "Bloom Filter Read Path — L1",
            "LSM Tree Internals — L0"
          ]
        },
        {
          "title": "PRACTICE QUESTION",
          "items": [
            "Alex Xu Chapter 6",
            "DESIGN A KEY-VALUE STORE"
          ]
        }
      ]
    },
    {
      "id": "sd-sde2-06",
      "title": "MODULE 6 — DISTRIBUTED UNIQUE ID GENERATOR",
      "goal": "",
      "topics": [
        {
          "title": "TOPICS",
          "items": [
            "Why Distributed IDs Are Needed — L3",
            "Global Uniqueness — L4",
            "Time Sortability — L3",
            "High-Throughput ID Generation — L3",
            "Database Auto-Increment Limitation — L3",
            "Multi-Master Auto Increment — L1",
            "UUID — L2",
            "UUID Pros / Cons — L2",
            "Ticket Server — L1",
            "Ticket Server SPOF — L2",
            "Snowflake-Style IDs — L3",
            "Timestamp Component — L3",
            "Datacenter / Worker ID — L3",
            "Sequence Number — L3",
            "Ordering by Time — L3",
            "Multiple ID Generator Servers — L3",
            "High Availability — L3",
            "Clock Synchronization Problem — L2",
            "Clock Skew — L2",
            "Exact Snowflake Bit Counts — L1"
          ]
        },
        {
          "title": "PRACTICE QUESTION",
          "items": [
            "Alex Xu Chapter 7",
            "DESIGN A UNIQUE ID GENERATOR IN DISTRIBUTED SYSTEMS"
          ]
        }
      ]
    },
    {
      "id": "sd-sde2-07",
      "title": "MODULE 7 — NOTIFICATION SYSTEM",
      "goal": "",
      "topics": [
        {
          "title": "TOPICS",
          "items": [
            "Synchronous vs Asynchronous Processing — L4",
            "Producer / Consumer — L4",
            "Message Queue — L4",
            "Worker — L4",
            "Queue Decoupling — L4",
            "Push Notifications — L3",
            "SMS — L3",
            "Email — L3",
            "Channel-Specific Queues — L4",
            "Channel-Specific Workers — L4",
            "Third-Party Provider Integration — L3",
            "Provider Failure — L4",
            "At-Least-Once Delivery — L4",
            "Exactly-Once Limitation — L3",
            "Duplicate Delivery — L4",
            "Event-ID Deduplication — L4",
            "Idempotent Consumer — L4",
            "Retry — L4",
            "Exponential Backoff — L4",
            "Dead-Letter Queue — L4",
            "Queue Depth — L4",
            "Consumer Lag — L4",
            "Backpressure — L3",
            "Notification Persistence — L3",
            "Preventing Notification Loss — L4",
            "User Notification Preferences — L3",
            "Notification Templates — L2",
            "Notification Rate Limiting — L3",
            "Queue Monitoring — L3",
            "Open / Click Tracking — L2"
          ]
        },
        {
          "title": "PRACTICE QUESTION",
          "items": [
            "Alex Xu Chapter 10",
            "DESIGN A NOTIFICATION SYSTEM"
          ]
        }
      ]
    },
    {
      "id": "sd-sde2-08",
      "title": "MODULE 8 — CHAT SYSTEM",
      "goal": "",
      "topics": [
        {
          "title": "TOPICS",
          "items": [
            "Polling — L3",
            "Long Polling — L3",
            "WebSocket — L4",
            "HTTP vs WebSocket — L4",
            "Persistent Connections — L4",
            "Stateful Chat Servers — L4",
            "Stateless API Servers — L3",
            "Service Discovery — L3",
            "Chat Server Selection — L3",
            "Server Capacity Awareness — L3",
            "ZooKeeper Internals — L1",
            "Chat Message Storage — L3",
            "NoSQL / KV Store for Chat History — L3",
            "Conversation Partitioning — L4",
            "Partition Key — L4",
            "Sort Key — L3",
            "Hot Conversation / Hot Partition — L4",
            "Message IDs — L3",
            "Unique Message IDs — L3",
            "Time-Sortable IDs — L3",
            "Local Sequence IDs — L2",
            "Message Ordering — L4",
            "1-to-1 Message Flow — L4",
            "Message Sync Queue — L3",
            "Online User Delivery — L4",
            "Offline User Delivery — L4",
            "Push Notification for Offline Users — L3",
            "Presence Service — L4",
            "Online / Offline Status — L4",
            "Heartbeats — L3",
            "Multi-Device Synchronization — L3",
            "Small Group Chat — L4",
            "Group Message Fanout — L3",
            "Chat Server Failure — L4",
            "Client Reconnection — L4",
            "Large Group Chat Internals — L0"
          ]
        },
        {
          "title": "PRACTICE QUESTION",
          "items": [
            "Alex Xu Chapter 12",
            "DESIGN A CHAT SYSTEM"
          ]
        }
      ]
    },
    {
      "id": "sd-sde2-09",
      "title": "MODULE 9 — NEWS FEED",
      "goal": "",
      "topics": [
        {
          "title": "TOPICS",
          "items": [
            "Feed Publishing — L4",
            "Feed Retrieval — L4",
            "Post Service — L3",
            "Social Graph — L3",
            "Graph Database Use Case — L2",
            "Fanout — L4",
            "Fanout-on-Write — L4",
            "Push Model — L4",
            "Fanout-on-Read — L4",
            "Pull Model — L4",
            "Push vs Pull Tradeoff — L4",
            "Hybrid Fanout — L4",
            "Celebrity / High-Follower Problem — L4",
            "Hot Key — L4",
            "Friend-ID Lookup — L3",
            "Fanout Queue — L4",
            "Fanout Workers — L4",
            "Feed Precomputation — L3",
            "Feed Cache — L4",
            "Store Post IDs Instead of Full Posts — L3",
            "Post Hydration — L3",
            "Read Amplification — L3",
            "Write Amplification — L3",
            "Inactive User Optimization — L3",
            "Feed Consistency — L3",
            "Feed Pagination — L3",
            "Feed Ranking / ML Internals — L0"
          ]
        },
        {
          "title": "PRACTICE QUESTION",
          "items": [
            "Alex Xu Chapter 11",
            "DESIGN A NEWS FEED SYSTEM"
          ]
        }
      ]
    },
    {
      "id": "sd-sde2-10",
      "title": "MODULE 10 — SEARCH AUTOCOMPLETE",
      "goal": "",
      "topics": [
        {
          "title": "TOPICS",
          "items": [
            "Prefix Search — L3",
            "Top-K Suggestions — L4",
            "Popularity / Frequency Ranking — L3",
            "Low-Latency Read Path — L4",
            "Trie — L3",
            "Prefix Lookup in Trie — L3",
            "Top-K Results Per Trie Node — L3",
            "Query Service — L4",
            "Data Gathering Service — L3",
            "Frequency Aggregation — L3",
            "Offline / Batch Aggregation — L3",
            "Precomputation — L3",
            "Caching — L3",
            "Trie Update Strategy — L3",
            "Periodic Updates — L3",
            "Sharding Autocomplete Data — L2",
            "Multi-Language Support — L1",
            "Unicode — L1",
            "Country-Specific Results — L1",
            "Trending Queries — L2",
            "Real-Time Trending Extension — L2",
            "Streaming Processing Internals — L0"
          ]
        },
        {
          "title": "PRACTICE QUESTION",
          "items": [
            "Alex Xu Chapter 13",
            "DESIGN A SEARCH AUTOCOMPLETE SYSTEM"
          ]
        }
      ]
    },
    {
      "id": "sd-sde2-11",
      "title": "MODULE 11 — WEB CRAWLER",
      "goal": "",
      "topics": [
        {
          "title": "TOPICS",
          "items": [
            "Crawler Requirements — L2",
            "Seed URLs — L2",
            "BFS Crawl Intuition — L2",
            "URL Frontier — L2",
            "URL Frontier Queue — L2",
            "HTML Downloader — L2",
            "DNS Resolver — L2",
            "DNS Caching — L2",
            "Content Parser — L2",
            "Content Seen / Duplicate Content Detection — L2",
            "Content Hashing — L2",
            "URL Extractor — L2",
            "URL Filter — L2",
            "URL Seen — L2",
            "Bloom Filter Use Case — L1",
            "Content Storage — L2",
            "Crawler Politeness — L2",
            "Host-Based Queues — L1",
            "URL Priority — L2",
            "Freshness / Recrawling — L2",
            "robots.txt — L1",
            "Distributed Crawling — L2",
            "Consistent Hashing for Crawlers — L2",
            "Short Timeouts — L1",
            "Spider Traps — L1",
            "Noisy / Duplicate Content — L1"
          ]
        },
        {
          "title": "PRACTICE QUESTION",
          "items": [
            "Alex Xu Chapter 9",
            "DESIGN A WEB CRAWLER"
          ]
        }
      ],
      "pattern": "OPTIONAL / STRETCH FOR CORE SDE-2"
    },
    {
      "id": "sd-sde2-12",
      "title": "MODULE 12 — YOUTUBE / VIDEO STREAMING",
      "goal": "",
      "topics": [
        {
          "title": "TOPICS",
          "items": [
            "Video Upload Flow — L1",
            "Video Streaming Flow — L1",
            "Object / Blob Storage — L2",
            "Metadata Database — L1",
            "CDN Video Delivery — L2",
            "Video Transcoding Purpose — L1",
            "Different Formats — L1",
            "Different Resolutions / Bitrates — L1",
            "Adaptive Quality Intuition — L1",
            "Asynchronous Video Processing — L2",
            "DAG Processing Model — L1",
            "Preprocessor — L1",
            "DAG Scheduler — L1",
            "Resource Manager — L1",
            "Task Workers — L1",
            "Temporary Storage — L1",
            "Thumbnail Generation — L1",
            "Watermark Processing — L1",
            "Resumable Upload — L1",
            "Presigned Upload Concept — L1",
            "Transcoding Failure / Retry — L1",
            "Codec Internals — L0",
            "Streaming Protocol Internals — L0",
            "Video Encoding Internals — L0"
          ]
        },
        {
          "title": "PRACTICE QUESTION",
          "items": [
            "Alex Xu Chapter 14",
            "DESIGN YOUTUBE"
          ]
        }
      ],
      "pattern": "OPTIONAL / STRETCH"
    },
    {
      "id": "sd-sde2-13",
      "title": "MODULE 13 — GOOGLE DRIVE / CLOUD FILE STORAGE",
      "goal": "",
      "topics": [
        {
          "title": "TOPICS",
          "items": [
            "File Upload — L1",
            "File Download — L1",
            "File Synchronization — L2",
            "Metadata vs File Content — L2",
            "Metadata Database — L2",
            "Metadata Cache — L2",
            "Object / Cloud Storage — L2",
            "Block Server — L1",
            "File Chunking / Blocks — L1",
            "Block Hash — L1",
            "Compression — L1",
            "Encryption — L1",
            "Delta Sync — L2",
            "Transfer Only Changed Blocks — L2",
            "Strong Metadata Consistency — L2",
            "Cache Invalidation After Metadata Write — L2",
            "Sync Conflict — L2",
            "Conflict Resolution — L2",
            "File Versioning — L1",
            "Revision History — L1",
            "Notification Service for Changes — L2",
            "Offline Client Queue — L1",
            "Long Polling — L2",
            "Long Polling vs WebSocket — L2",
            "Block Deduplication — L1",
            "Version Retention — L1",
            "Cold Storage — L1",
            "API Server Failure — L1",
            "Block Server Failure — L1",
            "Storage Failure — L1",
            "Metadata DB Failure — L1",
            "Notification Server Failure — L1",
            "Collaborative Document Editing Internals — L0"
          ]
        },
        {
          "title": "PRACTICE QUESTION",
          "items": [
            "Alex Xu Chapter 15",
            "DESIGN GOOGLE DRIVE"
          ]
        }
      ],
      "pattern": "OPTIONAL / STRETCH"
    },
    {
      "id": "sd-sde2-14",
      "title": "MODULE 14 — SDE-2 PRODUCTION FOLLOW-UPS",
      "goal": "",
      "topics": [
        {
          "title": "TOPICS",
          "items": [
            "Active-Passive Multi-Region — L3",
            "Active-Active Multi-Region — L3",
            "Read-Local / Write-Global — L3",
            "Cross-Region Replication — L3",
            "Sync vs Async Cross-Region Replication — L3",
            "Region Failure — L4",
            "Regional Failover — L3",
            "Stale Cross-Region Data — L4",
            "RTO — L2",
            "RPO — L2",
            "GeoDNS / Geographic Routing — L2",
            "Traffic Spike / 10x Load — L4",
            "Queueing vs Load Shedding — L4",
            "Load Shedding — L3",
            "Priority Traffic — L3",
            "Graceful Degradation — L4",
            "Disk Full — L3",
            "Connection Pool Exhaustion — L4",
            "Thread Pool Saturation — L3",
            "Queue Depth Growth — L4",
            "SLI — L2",
            "SLO — L2",
            "SLA — L1",
            "Latency Monitoring — L4",
            "Traffic Monitoring — L3",
            "Error Rate — L4",
            "Saturation — L3",
            "p50 — L2",
            "p95 — L3",
            "p99 — L3",
            "Cache Hit Ratio Monitoring — L4",
            "Queue Depth Monitoring — L4",
            "Consumer Lag Monitoring — L4",
            "Database Connection Monitoring — L3",
            "Blue / Green Deployment — L2",
            "Feature Flags — L2",
            "Why This Database? — L4",
            "Why This Consistency Model? — L4",
            "Why This Cache Strategy? — L4",
            "Why This Queue? — L4",
            "Why This Partition Key? — L4",
            "Why This Fanout Strategy? — L4",
            "Why Did You NOT Overengineer? — L4"
          ]
        },
        {
          "title": "PRACTICE",
          "items": [
            "Re-use these BOOK questions as follow-up drills:",
            "Alex Xu Chapter 8 — URL Shortener",
            "Add:",
            "- region failure",
            "- read/write routing",
            "- stale data",
            "Alex Xu Chapter 4 — Rate Limiter",
            "Add:",
            "- Redis failure",
            "- 10x burst",
            "- regional limiting",
            "Alex Xu Chapter 10 — Notification System",
            "Add:",
            "- queue backlog",
            "- provider outage",
            "- 10x traffic",
            "Alex Xu Chapter 11 — News Feed",
            "Add:",
            "- celebrity traffic",
            "- queue pressure",
            "- regional failure",
            "Alex Xu Chapter 12 — Chat",
            "Add:",
            "- chat server dies",
            "- reconnect storm",
            "- regional failure"
          ]
        }
      ]
    },
    {
      "id": "sd-sde2-final-practice",
      "title": "FINAL CLOSED-BOOK PRACTICE",
      "goal": "",
      "topics": [
        {
          "title": "CORE",
          "items": [
            "1. Chapter 8 — Design a URL Shortener",
            "2. Chapter 4 — Design a Rate Limiter",
            "3. Chapter 10 — Design a Notification System",
            "4. Chapter 13 — Design Search Autocomplete",
            "5. Chapter 12 — Design a Chat System",
            "6. Chapter 11 — Design a News Feed System",
            "7. Chapter 6 — Design a Key-Value Store"
          ]
        },
        {
          "title": "SHORT CONCEPT DESIGNS",
          "items": [
            "8. Chapter 5 — Design Consistent Hashing",
            "9. Chapter 7 — Design a Unique ID Generator"
          ]
        },
        {
          "title": "OPTIONAL",
          "items": [
            "10. Chapter 9 — Design a Web Crawler",
            "11. Chapter 14 — Design YouTube",
            "12. Chapter 15 — Design Google Drive"
          ]
        }
      ]
    }
  ]
};
