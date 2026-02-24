import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  const job = await prisma.exportJob.findUnique({
    where: { id },
    select: {
      status: true,
      lastProcessedId: true,
      filePath: true,
    },
  })

  if (!job) {
    return NextResponse.json({ error: "Job not found" }, { status: 404 })
  }

  return NextResponse.json(job)
}