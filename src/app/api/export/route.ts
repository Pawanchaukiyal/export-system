import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"
import { processExport } from "@/lib/exportProcessor"

export async function POST(req: Request) {
  const body = await req.json().catch(() => ({}))

  const job = await prisma.exportJob.create({
    data: {
      status: "running",
      filters: body.filters || {},
    },
  })

  // run export async (non-blocking)
  processExport(job.id).catch(async (err) => {
    console.error(err)
    await prisma.exportJob.update({
      where: { id: job.id },
      data: { status: "failed" },
    })
  })

  return NextResponse.json({ jobId: job.id })
}