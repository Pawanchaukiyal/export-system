import "./globals.css"
import type { Metadata } from "next"
import { resumePendingJobs } from "@/lib/resumePendingJobs"

export const metadata: Metadata = {
  title: "Export System",
  description: "Large dataset export with resume support",
}

// Ensure resume runs only once per server start
let hasResumed = false

async function handleResume() {
  if (!hasResumed) {
    hasResumed = true
    await resumePendingJobs()
  }
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  await handleResume()

  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}