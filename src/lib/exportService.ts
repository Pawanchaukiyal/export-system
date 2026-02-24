import { prisma } from "./db"

export async function fetchChunk(
  lastProcessedId: number | null,
  limit: number,
  filters: any
) {
  return prisma.mainData.findMany({
    where: {
      id: lastProcessedId ? { gt: lastProcessedId } : undefined,
      category: filters?.category || undefined,
    },
    orderBy: {
      id: "asc",
    },
    take: limit,
  })
}