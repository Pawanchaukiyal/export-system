# Large Dataset CSV Export System (Next.js)

## Overview

This project implements a scalable and fault-tolerant CSV export system for a potentially large dataset (~1 million rows) using **Next.js** and **PostgreSQL**.

The system is designed to:

* Prevent database overload
* Handle large datasets efficiently
* Resume export automatically if interrupted
* Provide fast and memory-safe file download
* Maintain clean and maintainable backend architecture

---

## Problem Statement

A database table contains approximately 1 million records.
An API server provides paginated listing with filtering capabilities.

Requirement:

Enable exporting the entire filtered dataset as a CSV file without:

* Overloading the database
* Blocking API responsiveness
* Crashing due to memory issues
* Losing progress if the server fails

---

## Architecture Decisions

### 1. Optimized Query Strategy (Keyset Pagination — No OFFSET)

Instead of OFFSET-based pagination, the system uses keyset pagination:

```sql
WHERE id > lastProcessedId
ORDER BY id
LIMIT 10000
```

**Why not OFFSET?**

* OFFSET performance degrades linearly as dataset size grows
* It causes large table scans for deep pages
* It may skip or duplicate rows in concurrent environments

Keyset pagination ensures:

* Stable performance at scale
* Predictable query cost
* No duplicate or skipped rows

**Indexed Columns:**

* `id` (Primary Key)
* `category`
* `createdAt`

---

### 2. Chunk-Based Processing

* Data is fetched in batches of 10,000 rows
* Each batch is processed independently
* Reduces database pressure
* Avoids long-running locks
* Controls memory usage

---

### 3. Streaming CSV Generation

* CSV is generated using Node.js streams
* Backpressure is handled using the `drain` event
* Data is written incrementally to disk
* No full dataset is stored in memory

This ensures stable memory usage even for very large exports.

---

### 4. Background Processing

Export workflow:

1. `POST /api/export` → creates export job
2. Export runs asynchronously in background
3. API returns immediately with `jobId`

This prevents long-running HTTP requests and keeps the API responsive.

---

### 5. Resume on Failure

Checkpoint mechanism:

* `lastProcessedId` is updated after every chunk
* Job status stored in database (`running`, `completed`, `failed`)

If server crashes:

* On restart, all jobs with `status = running` are detected
* Export resumes automatically from `lastProcessedId`

This guarantees fault tolerance and prevents reprocessing from the beginning.

---

### 6. Streaming File Download

Download endpoint uses:

```ts
fs.createReadStream()
```

Benefits:

* File is streamed to client
* No full file loaded into memory
* Memory-safe even for large CSV files
* Faster response delivery

---

## API Endpoints

### Create Export

**POST** `/api/export`

Response:

```json
{
  "jobId": "uuid"
}
```

---

### Check Export Status

**GET** `/api/export/{jobId}/status`

Response:

```json
{
  "status": "running | completed | failed",
  "lastProcessedId": number,
  "filePath": string | null
}
```

---

### Download CSV

**GET** `/api/export/{jobId}/download`

Returns streamed CSV file.
Download is allowed only when `status = completed`.

---

## Failure Handling

* Entire export process wrapped in try/catch
* On any unexpected error:

  * Job status is updated to `failed`
  * No job remains permanently in `running` state
* Resume mechanism handles incomplete jobs safely

---

## How To Run (3 Steps)

1. Install dependencies:

```
npm install
```

2. Setup database and seed large dataset:

```
npx prisma migrate dev
npx prisma db seed
```

3. Start server:

```
npm run dev
```

---

## Assumptions

* `id` is an auto-incrementing primary key
* Snapshot consistency is not enforced (live export model)
* CSV files are stored locally in `/exports` directory

---

## Scalability Considerations (Production Enhancements)

For higher scale (millions of rows, concurrent exports):

* Introduce distributed job queue (Redis + BullMQ)
* Limit concurrent export processing
* Store files in object storage (e.g., S3)
* Implement job cleanup and retention policy

---

## Conclusion

This solution:

* Handles large datasets efficiently
* Protects database from heavy load
* Uses memory-safe streaming techniques
* Supports crash recovery through checkpointing
* Meets all technical requirements specified in the assignment

---
