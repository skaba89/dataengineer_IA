// Discover Schema API - Discovers tables and columns from a data source
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { discoverSourceSchema } from "@/lib/connectors"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { id } = await params

    const result = await discoverSourceSchema(id)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Discover schema error:", error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : "Unknown error" 
      },
      { status: 500 }
    )
  }
}
