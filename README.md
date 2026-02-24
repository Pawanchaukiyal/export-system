Large Dataset Export System (Next.js)
Overview

This project implements a scalable CSV export system for a potentially large dataset (~1 million rows) using Next.js and PostgreSQL.

The system is designed to:

Avoid database overload

Handle large datasets efficiently

Resume export if interrupted

Provide fast file download

Follow clean backend architecture principles

Problem Context

A database table contains a large number of records (~1M rows).
An API server provides paginated listing with filters.

Requirement:
Allow users to export the entire filtered dataset as a CSV without impacting transactional database operations.

Architecture Decisions
1. Optimized Query Strategy (No OFFSET)

Instead of OFFSET pagination, the system uses keyset pagination:

WHERE id > lastProcessedId
ORDER BY id
LIMIT 10000

Why:

OFFSET degrades linearly as data grows

Keyset pagination keeps performance stable

Prevents skipped/duplicate rows

Indexed fields:

id (primary key)

category

createdAt

2. Chunk-Based Processing

Data fetched in batches of 10,000 rows

Prevents long-running DB locks

Reduces memory pressure

3. Streaming CSV Generation

CSV generated using Node.js streams

Backpressure handled using drain event

No full dataset loaded into memory

This ensures stable memory usage even for large exports.

4. Background Processing

Export flow:

POST /api/export → creates job

Export runs asynchronously

API returns immediately with jobId

Prevents blocking HTTP requests.

5. Resume on Failure

Checkpoint mechanism:

lastProcessedId updated after each chunk

If server crashes:

Unfinished jobs (status = running) detected on restart

Export resumes automatically from last checkpoint

This guarantees fault tolerance.

6. Streaming File Download

Download endpoint streams file using:

fs.createReadStream()

Benefits:

No full file memory loading

Fast and memory-safe download

API Endpoints
Create Export

POST /api/export

Response:

{
  "jobId": "uuid"
}
Check Status

GET /api/export/{jobId}/status

Response:

{
  "status": "running | completed | failed",
  "lastProcessedId": number,
  "filePath": string | null
}
Download CSV

GET /api/export/{jobId}/download

Returns streamed CSV file (only if status = completed)

Failure Handling

If export fails:

Job status updated to failed

No job remains permanently in running

Resume logic handles incomplete jobs on restart

How To Run (3 Steps)

Install dependencies

npm install

Setup database

npx prisma migrate dev
npx prisma db seed

Start server

npm run dev
Assumptions

Primary key id is strictly increasing

Snapshot consistency is not enforced

Local file storage is used for CSV files

Scalability Considerations

For production-scale usage:

Introduce job queue (e.g., Redis + BullMQ)

Add concurrency limits

Use object storage (S3)

Implement job cleanup policy

Conclusion

This solution:

Handles large datasets efficiently

Protects database from overload

Ensures memory-safe streaming

Supports crash recovery

Meets all assignment constraints