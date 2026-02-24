Project Title

Large Dataset CSV Export with Resume Support (Next.js + PostgreSQL)

Problem Statement

Generate a CSV export of a potentially large dataset (~1 million rows) without:

Overloading the database

Crashing server memory

Blocking the request lifecycle

Losing progress if the server crashes

Architecture Overview
1. Keyset Pagination (No OFFSET)

Instead of OFFSET-based pagination, the system uses:

WHERE id > lastProcessedId
ORDER BY id
LIMIT 10000

This ensures:

Stable performance on large datasets

No full-table scan degradation

No skipped or duplicated rows

2. Chunk-Based Processing

Data fetched in batches of 10,000 rows

Prevents database overload

Reduces transaction pressure

3. Streaming CSV Generation

Uses Node.js streams with backpressure handling

Writes incrementally to file

Prevents memory spikes

Backpressure handled via:

if (!csvStream.write(row)) {
  await once(csvStream, "drain")
}
4. Background Processing

Export is executed asynchronously:

POST /api/export creates job

Processing runs in background

API returns immediately with jobId

5. Resume Capability

lastProcessedId stored after each chunk

On server restart, unfinished jobs are detected

Export resumes from last checkpoint automatically

This guarantees no data loss on crash.

6. Streaming File Download

Download endpoint streams file via createReadStream

No full-file memory loading

Memory-safe even for large CSV files

API Endpoints

POST /api/export
→ Creates export job

GET /api/export/{id}/status
→ Returns job status and progress

GET /api/export/{id}/download
→ Streams generated CSV file

Performance Considerations

Indexed filter columns

No OFFSET pagination

Controlled chunk size

Backpressure-aware streaming

Memory-safe file serving

Resume on crash

How To Run

Install dependencies

npm install

Setup database and run migrations

npx prisma migrate dev

Seed large dataset

npx prisma db seed

Start server

npm run dev
Assumptions

Primary key (id) is auto-increment and strictly increasing

Snapshot consistency is not enforced (live export model)

Local file storage used for generated CSV