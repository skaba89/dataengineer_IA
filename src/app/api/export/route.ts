// Export API - Generate PDF reports and ZIP archives for client deliverables
import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"
import archiver from "archiver"
import { Readable } from "stream"

// PDF Generation using reportlab-like approach with jsPDF
// For server-side, we'll generate markdown and convert to PDF

interface ExportRequest {
  projectId: string
  format: "pdf" | "zip" | "markdown"
  includeArtifacts: boolean
  includeCode: boolean
  includeDiagrams: boolean
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body: ExportRequest = await request.json()
    const { projectId, format, includeArtifacts, includeCode, includeDiagrams } = body

    // Validate project access
    const project = await db.project.findUnique({
      where: { id: projectId },
      include: {
        organization: true,
        dataSources: true,
        pipelines: true,
        dashboards: true,
        executions: {
          orderBy: { createdAt: "desc" },
          take: 50,
        },
        deliverables: true,
      },
    })

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    // Check organization access
    if (project.organizationId !== session.user.organizationId && session.user.role !== "admin") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 })
    }

    if (format === "markdown") {
      const markdown = generateMarkdownReport(project, { includeArtifacts, includeCode, includeDiagrams })
      return new NextResponse(markdown, {
        headers: {
          "Content-Type": "text/markdown",
          "Content-Disposition": `attachment; filename="${project.name.replace(/[^a-z0-9]/gi, '_')}_report.md"`,
        },
      })
    }

    if (format === "zip") {
      const zipBuffer = await generateZipArchive(project, { includeArtifacts, includeCode, includeDiagrams })
      return new NextResponse(new Uint8Array(zipBuffer), {
        headers: {
          "Content-Type": "application/zip",
          "Content-Disposition": `attachment; filename="${project.name.replace(/[^a-z0-9]/gi, '_')}_deliverables.zip"`,
        },
      })
    }

    // Default to PDF-like markdown (can be converted to PDF client-side)
    const report = generateMarkdownReport(project, { includeArtifacts, includeCode, includeDiagrams })
    return new NextResponse(report, {
      headers: {
        "Content-Type": "text/markdown",
        "Content-Disposition": `attachment; filename="${project.name.replace(/[^a-z0-9]/gi, '_')}_report.md"`,
      },
    })
  } catch (error) {
    console.error("Export error:", error)
    return NextResponse.json(
      { error: "Export failed", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    )
  }
}

function generateMarkdownReport(
  project: any,
  options: { includeArtifacts: boolean; includeCode: boolean; includeDiagrams: boolean }
): string {
  const { includeArtifacts, includeCode, includeDiagrams } = options
  const projectName = project.name || "Data Engineering Project"
  const date = new Date().toLocaleDateString("fr-FR", { 
    year: "numeric", 
    month: "long", 
    day: "numeric" 
  })

  let markdown = `# ${projectName}

## Rapport de Projet Data Engineering

**Client:** ${project.organization?.name || "N/A"}  
**Date:** ${date}  
**Statut:** ${project.status || "En cours"}  
**Budget:** ${project.budget ? `${project.budget.toLocaleString()} €` : "Non défini"}

---

## Résumé Exécutif

Ce rapport présente les livrables du projet data engineering "${projectName}". 
Il comprend l'architecture, les pipelines, les transformations et les dashboards générés 
par notre système multi-agents IA autonome.

---

## 1. Architecture du Projet

### 1.1 Sources de Données

`

  // Add data sources
  if (project.dataSources?.length > 0) {
    markdown += `| Source | Type | Statut |\n`
    markdown += `|--------|------|--------|\n`
    for (const ds of project.dataSources) {
      markdown += `| ${ds.name} | ${ds.type} | ${ds.status} |\n`
    }
    markdown += "\n"
  } else {
    markdown += "*Aucune source de données configurée*\n\n"
  }

  // Add pipelines
  markdown += `### 1.2 Pipelines\n\n`
  if (project.pipelines?.length > 0) {
    markdown += `| Pipeline | Type | Framework | Statut |\n`
    markdown += `|----------|------|-----------|--------|\n`
    for (const p of project.pipelines) {
      markdown += `| ${p.name} | ${p.type} | ${p.framework} | ${p.status} |\n`
    }
    markdown += "\n"
  } else {
    markdown += "*Aucun pipeline généré*\n\n"
  }

  // Add dashboards
  markdown += `### 1.3 Dashboards\n\n`
  if (project.dashboards?.length > 0) {
    markdown += `| Dashboard | Type | Statut |\n`
    markdown += `|-----------|------|--------|\n`
    for (const d of project.dashboards) {
      markdown += `| ${d.name} | ${d.type} | ${d.status} |\n`
    }
    markdown += "\n"
  } else {
    markdown += "*Aucun dashboard créé*\n\n"
  }

  // Add agent executions
  markdown += `## 2. Historique des Exécutions\n\n`
  if (project.executions?.length > 0) {
    markdown += `| Agent | Statut | Date | Durée |\n`
    markdown += `|-------|--------|------|-------|\n`
    for (const e of project.executions.slice(0, 20)) {
      markdown += `| ${e.agentType} | ${e.status} | ${new Date(e.createdAt).toLocaleDateString("fr-FR")} | ${e.duration ? `${e.duration}ms` : "N/A"} |\n`
    }
    markdown += "\n"
  } else {
    markdown += "*Aucune exécution d'agent enregistrée*\n\n"
  }

  // Add deliverables if requested
  if (includeArtifacts && project.deliverables?.length > 0) {
    markdown += `## 3. Livrables\n\n`
    for (const d of project.deliverables) {
      markdown += `### 3.${project.deliverables.indexOf(d) + 1} ${d.name}\n\n`
      markdown += `**Type:** ${d.type}  \n`
      markdown += `**Format:** ${d.format || "N/A"}  \n`
      markdown += `**Créé le:** ${new Date(d.createdAt).toLocaleDateString("fr-FR")}  \n\n`
      
      if (includeCode && d.content) {
        markdown += `\`\`\`${d.format || "text"}\n${d.content.slice(0, 2000)}${d.content.length > 2000 ? "\n... (tronqué)" : ""}\n\`\`\`\n\n`
      }
    }
  }

  // Add code artifacts if requested
  if (includeCode) {
    markdown += `## 4. Code Généré\n\n`
    
    // Find code deliverables
    const codeDeliverables = project.deliverables?.filter((d: any) => 
      ["python", "sql", "javascript", "typescript", "yaml", "json"].includes(d.format?.toLowerCase())
    ) || []
    
    if (codeDeliverables.length > 0) {
      for (const code of codeDeliverables) {
        markdown += `### ${code.name}\n\n`
        markdown += `\`\`\`${code.format || "text"}\n${code.content || "// No content"}\n\`\`\`\n\n`
      }
    } else {
      markdown += "*Aucun code généré à afficher*\n\n"
    }
  }

  // Footer
  markdown += `---

*Rapport généré automatiquement par AI Data Engineering System*  
*© ${new Date().getFullYear()} - Tous droits réservés*
`

  return markdown
}

async function generateZipArchive(
  project: any,
  options: { includeArtifacts: boolean; includeCode: boolean; includeDiagrams: boolean }
): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = []
    const archive = archiver("zip", { zlib: { level: 9 } })

    archive.on("data", (chunk) => chunks.push(chunk))
    archive.on("end", () => resolve(Buffer.concat(chunks)))
    archive.on("error", reject)

    // Add main report
    const report = generateMarkdownReport(project, options)
    archive.append(report, { name: "README.md" })

    // Add project info
    const projectInfo = JSON.stringify({
      name: project.name,
      status: project.status,
      budget: project.budget,
      organization: project.organization?.name,
      createdAt: project.createdAt,
    }, null, 2)
    archive.append(projectInfo, { name: "project_info.json" })

    // Add deliverables
    if (options.includeArtifacts && project.deliverables?.length > 0) {
      for (const deliverable of project.deliverables) {
        const folder = deliverable.type === "CODE" ? "code" : 
                       deliverable.type === "DOCUMENT" ? "docs" :
                       deliverable.type === "CONFIG" ? "config" : "artifacts"
        const ext = getFileExtension(deliverable.format)
        archive.append(deliverable.content || "", { 
          name: `${folder}/${deliverable.name}${ext}` 
        })
      }
    }

    // Add data sources info
    if (project.dataSources?.length > 0) {
      const dsInfo = project.dataSources.map((ds: any) => ({
        name: ds.name,
        type: ds.type,
        status: ds.status,
        host: ds.host,
        database: ds.database,
      }))
      archive.append(JSON.stringify(dsInfo, null, 2), { name: "data_sources.json" })
    }

    // Add pipelines
    if (project.pipelines?.length > 0) {
      for (const pipeline of project.pipelines) {
        if (options.includeCode && pipeline.code) {
          const ext = pipeline.framework === "dbt" ? ".sql" : ".py"
          archive.append(pipeline.code, { name: `pipelines/${pipeline.name}${ext}` })
        }
      }
    }

    // Add dashboards config
    if (project.dashboards?.length > 0) {
      for (const dashboard of project.dashboards) {
        if (dashboard.config) {
          archive.append(dashboard.config, { name: `dashboards/${dashboard.name}.json` })
        }
      }
    }

    archive.finalize()
  })
}

function getFileExtension(format?: string | null): string {
  if (!format) return ".txt"
  const extMap: Record<string, string> = {
    python: ".py",
    sql: ".sql",
    javascript: ".js",
    typescript: ".ts",
    json: ".json",
    yaml: ".yaml",
    markdown: ".md",
    text: ".txt",
  }
  return extMap[format.toLowerCase()] || ".txt"
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const projectId = searchParams.get("projectId")
  const format = searchParams.get("format") || "markdown"

  if (!projectId) {
    return NextResponse.json({ error: "projectId is required" }, { status: 400 })
  }

  return POST(new NextRequest(request.url, {
    method: "POST",
    headers: request.headers,
    body: JSON.stringify({
      projectId,
      format,
      includeArtifacts: searchParams.get("includeArtifacts") !== "false",
      includeCode: searchParams.get("includeCode") !== "false",
      includeDiagrams: searchParams.get("includeDiagrams") !== "false",
    }),
  }))
}
