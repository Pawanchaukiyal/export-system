import fs from "fs"
import { NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(
  req: Request,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params

  const job = await prisma.exportJob.findUnique({
    where: { id },
  })

  if (!job || job.status !== "completed" || !job.filePath) {
    return NextResponse.json(
      { error: "File not ready" },
      { status: 400 }
    )
  }

  const stream = fs.createReadStream(job.filePath)

  return new NextResponse(stream as any, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${id}.csv"`,
    },
  })
}