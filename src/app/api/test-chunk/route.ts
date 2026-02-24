import { NextResponse } from "next/server"
import { fetchChunk } from "@/lib/exportService"

export async function GET() {
  const data = await fetchChunk(null, 10, {})
  return NextResponse.json({
    count: data.length,
    firstId: data[0]?.id,
    lastId: data[data.length - 1]?.id,
  })
}