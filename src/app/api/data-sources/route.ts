// Data Sources API - Manage and test data source connections
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import { testDataSourceConnection, discoverSourceSchema } from "@/lib/connectors"

// GET /api/data-sources - List all data sources for a project
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("projectId")

    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 })
    }

    // Verify project access
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { organizationId: true },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    if (project.organizationId !== session.user.organizationId && session.user.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const dataSources = await db.dataSource.findMany({
      where: { projectId },
      include: {
        tables: {
          orderBy: { name: "asc" },
          take: 100,
        },
      },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json({
      success: true,
      dataSources,
      total: dataSources.length,
    })
  } catch (error) {
    console.error("Error fetching data sources:", error)
    return NextResponse.json(
      { error: "Failed to fetch data sources" },
      { status: 500 }
    )
  }
}

// POST /api/data-sources - Create a new data source
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { projectId, name, type, host, port, database, metadata } = body

    if (!projectId || !name || !type) {
      return NextResponse.json(
        { error: "projectId, name, and type are required" },
        { status: 400 }
      )
    }

    // Verify project access
    const project = await db.project.findUnique({
      where: { id: projectId },
      select: { organizationId: true },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    if (project.organizationId !== session.user.organizationId && session.user.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const dataSource = await db.dataSource.create({
      data: {
        projectId,
        name,
        type,
        host,
        port,
        database,
        metadata: metadata ? JSON.stringify(metadata) : null,
        status: "pending",
      },
    })

    return NextResponse.json({
      success: true,
      dataSource,
    })
  } catch (error) {
    console.error("Error creating data source:", error)
    return NextResponse.json(
      { error: "Failed to create data source" },
      { status: 500 }
    )
  }
}

// PATCH /api/data-sources - Update a data source
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { id, name, host, port, database, metadata } = body

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    const dataSource = await db.dataSource.findUnique({
      where: { id },
      include: { project: { select: { organizationId: true } } },
    })

    if (!dataSource) {
      return NextResponse.json({ error: "Data source not found" }, { status: 404 })
    }

    if (dataSource.project.organizationId !== session.user.organizationId && session.user.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    const updated = await db.dataSource.update({
      where: { id },
      data: {
        name,
        host,
        port,
        database,
        metadata: metadata ? JSON.stringify(metadata) : undefined,
      },
    })

    return NextResponse.json({
      success: true,
      dataSource: updated,
    })
  } catch (error) {
    console.error("Error updating data source:", error)
    return NextResponse.json(
      { error: "Failed to update data source" },
      { status: 500 }
    )
  }
}

// DELETE /api/data-sources - Delete a data source
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 })
    }

    const dataSource = await db.dataSource.findUnique({
      where: { id },
      include: { project: { select: { organizationId: true } } },
    })

    if (!dataSource) {
      return NextResponse.json({ error: "Data source not found" }, { status: 404 })
    }

    if (dataSource.project.organizationId !== session.user.organizationId && session.user.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    await db.dataSource.delete({
      where: { id },
    })

    return NextResponse.json({
      success: true,
      message: "Data source deleted",
    })
  } catch (error) {
    console.error("Error deleting data source:", error)
    return NextResponse.json(
      { error: "Failed to delete data source" },
      { status: 500 }
    )
  }
}
