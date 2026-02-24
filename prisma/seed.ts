import "dotenv/config"
import { PrismaClient } from "@prisma/client"
import { PrismaPg } from "@prisma/adapter-pg"
import { Pool } from "pg"

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
})

const adapter = new PrismaPg(pool)

const prisma = new PrismaClient({
  adapter,
})

async function main() {
  const categories = ["A", "B", "C", "D"]

  const batchSize = 10000
  const totalRecords = 500000

  for (let i = 0; i < totalRecords; i += batchSize) {
    const data = Array.from({ length: batchSize }).map(() => ({
      name: "User_" + Math.random().toString(36).substring(7),
      category: categories[Math.floor(Math.random() * categories.length)],
    }))

    await prisma.mainData.createMany({
      data,
    })

    console.log(`Inserted: ${i + batchSize}`)
  }
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })