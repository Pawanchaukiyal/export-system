import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { processExport } from "@/lib/exportProcessor"

export async function GET() {
  const job = await prisma.exportJob.create({
    data: {
      status: "running",
      filters: {},
    },
  })

  await processExport(job.id)

  return NextResponse.json({ jobId: job.id })
}