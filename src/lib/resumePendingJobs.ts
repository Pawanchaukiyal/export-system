import { prisma } from "./db"
import { processExport } from "./exportProcessor"

export async function resumePendingJobs() {
  const pendingJobs = await prisma.exportJob.findMany({
    where: {
      status: "running",
    },
  })

  for (const job of pendingJobs) {
    console.log(`Resuming job: ${job.id}`)
    processExport(job.id).catch(async (err) => {
      console.error("Resume failed:", err)
      await prisma.exportJob.update({
        where: { id: job.id },
        data: { status: "failed" },
      })
    })
  }
}