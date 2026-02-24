import fs from "fs"
import path from "path"
import { format } from "@fast-csv/format"
import { fetchChunk } from "./exportService"
import { prisma } from "./db"
import { once } from "events"
const EXPORT_DIR = path.join(process.cwd(), "exports")

// Ensure exports directory exists
if (!fs.existsSync(EXPORT_DIR)) {
  fs.mkdirSync(EXPORT_DIR)
}
export async function processExport(jobId: string) {
  try {
    const job = await prisma.exportJob.findUnique({
      where: { id: jobId },
    })

    if (!job) throw new Error("Job not found")

    const filePath = path.join(EXPORT_DIR, `${jobId}.csv`)

    const writeStream = fs.createWriteStream(filePath)
    const csvStream = format({ headers: true })

    csvStream.pipe(writeStream)

    let lastProcessedId = job.lastProcessedId ?? null
    const limit = 10000

while (true) {
  const chunk = await fetchChunk(lastProcessedId, limit, job.filters)


  // throw new Error("Simulated failure for testing")

  if (chunk.length === 0) break

  for (const row of chunk) {
    const canContinue = csvStream.write(row)
    if (!canContinue) {
      await once(csvStream, "drain")
    }
  }

  lastProcessedId = chunk[chunk.length - 1].id

  await prisma.exportJob.update({
    where: { id: jobId },
    data: { lastProcessedId },
  })
}

    csvStream.end()

    await prisma.exportJob.update({
      where: { id: jobId },
      data: {
        status: "completed",
        filePath,
      },
    })

    console.log("Export completed:", filePath)
  } catch (error) {
    console.error("Export failed:", error)

    await prisma.exportJob.update({
      where: { id: jobId },
      data: { status: "failed" },
    })
  }
}