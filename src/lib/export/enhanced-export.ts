// @ts-nocheck
// Enhanced Export Utilities for AI Data Engineering System
// Supports PDF, ZIP, and comprehensive project deliverables

import jsPDF from "jspdf"
import archiver from "archiver"

// ============================================
// Types
// ============================================

export interface ExportableProject {
  id: string
  name: string
  description?: string
  industry?: string
  status: string
  createdAt: Date
  updatedAt: Date
  organization?: {
    name: string
    logo?: string
  }
  dataSources?: DataSourceExport[]
  architecture?: ArchitectureExport
  pipelines?: PipelineExport[]
  transformations?: TransformationExport[]
  dashboards?: DashboardExport[]
  kpis?: KPIExport[]
  qualityReport?: QualityReportExport
  costEstimate?: CostEstimateExport
}

export interface DataSourceExport {
  name: string
  type: string
  description?: string
  tables?: TableExport[]
}

export interface TableExport {
  name: string
  schema?: string
  columns: { name: string; type: string; nullable: boolean }[]
  rowCount?: number
}

export interface ArchitectureExport {
  warehouseType: string
  orchestrationTool: string
  transformationFramework: string
  biTool?: string
  architecturePattern: string
  deploymentTarget?: string
  diagrams?: DiagramExport[]
  rationale?: string
}

export interface DiagramExport {
  name: string
  type: "flow" | "architecture" | "er_diagram"
  format: "mermaid" | "drawio" | "plantuml"
  content: string
}

export interface PipelineExport {
  name: string
  type: string
  framework: string
  schedule?: string
  code: string
  language: "python" | "sql" | "yaml"
}

export interface TransformationExport {
  name: string
  layer: "staging" | "intermediate" | "marts"
  sourceTables: string[]
  targetTable: string
  sql: string
  tests?: string[]
  documentation?: string
}

export interface DashboardExport {
  name: string
  tool: string
  url?: string
  charts: ChartExport[]
}

export interface ChartExport {
  title: string
  type: string
  dataSource: string
  query?: string
}

export interface KPIExport {
  name: string
  description: string
  formula: string
  currentValue?: number
  targetValue?: number
  unit?: string
  trend?: "up" | "down" | "stable"
}

export interface QualityReportExport {
  overallScore: number
  issues: { table: string; column?: string; type: string; severity: string; description: string }[]
  recommendations: string[]
}

export interface CostEstimateExport {
  monthly: number
  yearly: number
  breakdown: { category: string; amount: number; percentage: number }[]
  currency: string
}

export interface ExportOptions {
  format: "pdf" | "zip" | "both"
  includeCode?: boolean
  includeDiagrams?: boolean
  includeCosts?: boolean
  includeQuality?: boolean
  language?: "en" | "fr"
}

export interface ExportResult {
  success: boolean
  files: { name: string; content: Buffer; mimeType: string }[]
  errors?: string[]
}

// ============================================
// PDF Generator Class
// ============================================

export class EnhancedPDFGenerator {
  private doc: jsPDF
  private yPosition: number = 20
  private pageHeight: number
  private pageWidth: number
  private margin: number = 20
  private pageNumber: number = 1

  constructor() {
    this.doc = new jsPDF()
    this.pageHeight = this.doc.internal.pageSize.height
    this.pageWidth = this.doc.internal.pageSize.width
  }

  addCoverPage(project: ExportableProject): void {
    // Background
    this.doc.setFillColor(30, 41, 59)
    this.doc.rect(0, 0, this.pageWidth, this.pageHeight, "F")

    // Title
    this.doc.setFontSize(36)
    this.doc.setTextColor(255, 255, 255)
    this.doc.text(project.name, this.pageWidth / 2, 80, { align: "center" })

    // Subtitle
    this.doc.setFontSize(16)
    this.doc.setTextColor(148, 163, 184)
    if (project.description) {
      const lines = this.doc.splitTextToSize(project.description, this.pageWidth - 80)
      this.doc.text(lines, this.pageWidth / 2, 100, { align: "center" })
    }

    // Metadata
    this.doc.setFontSize(12)
    this.doc.setTextColor(100, 116, 139)
    this.doc.text(`Industry: ${project.industry || "Not specified"}`, this.pageWidth / 2, 150, { align: "center" })
    this.doc.text(`Status: ${project.status}`, this.pageWidth / 2, 160, { align: "center" })
    this.doc.text(`Generated: ${new Date().toLocaleDateString()}`, this.pageWidth / 2, 170, { align: "center" })

    // Organization
    if (project.organization) {
      this.doc.text(`Organization: ${project.organization.name}`, this.pageWidth / 2, 180, { align: "center" })
    }

    // Footer
    this.doc.setFontSize(10)
    this.doc.setTextColor(71, 85, 105)
    this.doc.text("AI Data Engineering System - Professional Deliverable", this.pageWidth / 2, this.pageHeight - 20, { align: "center" })

    this.doc.addPage()
    this.pageNumber++
    this.yPosition = this.margin
    this.doc.setTextColor(0, 0, 0)
  }

  addTableOfContents(sections: string[]): void {
    this.doc.setFontSize(24)
    this.doc.setTextColor(30, 41, 59)
    this.doc.text("Table of Contents", this.margin, this.yPosition)
    this.yPosition += 20

    this.doc.setFontSize(12)
    this.doc.setTextColor(51, 65, 85)

    sections.forEach((section, index) => {
      this.doc.text(`${index + 1}. ${section}`, this.margin + 10, this.yPosition)
      this.yPosition += 10
    })

    this.addPage()
    this.pageNumber++
    this.yPosition = this.margin
  }

  addSection(title: string, content: string): void {
    this.checkPageBreak(30)

    // Section header
    this.doc.setFontSize(18)
    this.doc.setTextColor(30, 41, 59)
    this.doc.text(title, this.margin, this.yPosition)
    this.yPosition += 8

    // Underline
    this.doc.setDrawColor(59, 130, 246)
    this.doc.setLineWidth(0.5)
    this.doc.line(this.margin, this.yPosition, this.pageWidth - this.margin, this.yPosition)
    this.yPosition += 10

    // Content
    this.doc.setFontSize(11)
    this.doc.setTextColor(51, 65, 85)
    const lines = this.doc.splitTextToSize(content, this.pageWidth - 2 * this.margin)
    lines.forEach((line: string) => {
      this.checkPageBreak(8)
      this.doc.text(line, this.margin, this.yPosition)
      this.yPosition += 6
    })

    this.yPosition += 10
  }

  addCodeBlock(code: string, language?: string, title?: string): void {
    this.checkPageBreak(50)

    // Title if provided
    if (title) {
      this.doc.setFontSize(12)
      this.doc.setTextColor(30, 41, 59)
      this.doc.text(title, this.margin, this.yPosition)
      this.yPosition += 8
    }

    // Background
    const lines = code.split("\n")
    const lineHeight = 5
    const blockHeight = Math.min(lines.length, 30) * lineHeight + 15

    this.doc.setFillColor(30, 41, 59)
    this.doc.roundedRect(this.margin, this.yPosition, this.pageWidth - 2 * this.margin, blockHeight, 3, 3, "F")

    // Language badge
    if (language) {
      this.doc.setFontSize(8)
      this.doc.setTextColor(59, 130, 246)
      this.doc.text(language.toUpperCase(), this.margin + 5, this.yPosition + 6)
    }

    // Code
    this.doc.setFontSize(9)
    this.doc.setTextColor(226, 232, 240)
    let codeY = this.yPosition + (language ? 15 : 8)
    const maxLines = 30
    lines.slice(0, maxLines).forEach((line) => {
      const truncatedLine = line.length > 80 ? line.substring(0, 77) + "..." : line
      this.doc.text(truncatedLine, this.margin + 5, codeY)
      codeY += lineHeight
    })

    if (lines.length > maxLines) {
      this.doc.setTextColor(148, 163, 184)
      this.doc.text(`... ${lines.length - maxLines} more lines`, this.margin + 5, codeY)
    }

    this.yPosition += blockHeight + 10
  }

  addTable(headers: string[], rows: string[][]): void {
    this.checkPageBreak(30)

    const colWidth = (this.pageWidth - 2 * this.margin) / headers.length
    const rowHeight = 8

    // Header
    this.doc.setFillColor(30, 41, 59)
    this.doc.rect(this.margin, this.yPosition, this.pageWidth - 2 * this.margin, rowHeight, "F")

    this.doc.setFontSize(10)
    this.doc.setTextColor(255, 255, 255)
    headers.forEach((header, i) => {
      this.doc.text(header, this.margin + i * colWidth + 3, this.yPosition + 6)
    })
    this.yPosition += rowHeight

    // Rows
    this.doc.setTextColor(51, 65, 85)
    rows.forEach((row, rowIndex) => {
      this.checkPageBreak(rowHeight)
      if (rowIndex % 2 === 0) {
        this.doc.setFillColor(248, 250, 252)
        this.doc.rect(this.margin, this.yPosition, this.pageWidth - 2 * this.margin, rowHeight, "F")
      }
      row.forEach((cell, i) => {
        const truncatedCell = cell.length > 30 ? cell.substring(0, 27) + "..." : cell
        this.doc.text(truncatedCell, this.margin + i * colWidth + 3, this.yPosition + 6)
      })
      this.yPosition += rowHeight
    })

    this.yPosition += 10
  }

  addKPICard(name: string, value: string | number, trend?: "up" | "down" | "stable"): void {
    this.checkPageBreak(30)

    const cardWidth = 80
    const cardHeight = 30

    // Card background
    this.doc.setFillColor(248, 250, 252)
    this.doc.roundedRect(this.margin, this.yPosition, cardWidth, cardHeight, 3, 3, "F")

    // KPI Name
    this.doc.setFontSize(10)
    this.doc.setTextColor(100, 116, 139)
    this.doc.text(name, this.margin + 5, this.yPosition + 10)

    // KPI Value
    this.doc.setFontSize(18)
    this.doc.setTextColor(30, 41, 59)
    this.doc.text(String(value), this.margin + 5, this.yPosition + 24)

    // Trend indicator
    if (trend) {
      const trendColor = trend === "up" ? [34, 197, 94] : trend === "down" ? [239, 68, 68] : [148, 163, 184]
      this.doc.setTextColor(trendColor[0], trendColor[1], trendColor[2])
      this.doc.text(trend === "up" ? "↑" : trend === "down" ? "↓" : "→", this.margin + cardWidth - 15, this.yPosition + 24)
    }

    this.yPosition += cardHeight + 10
  }

  private checkPageBreak(requiredSpace: number): void {
    if (this.yPosition + requiredSpace > this.pageHeight - this.margin - 20) {
      this.addPageNumber()
      this.doc.addPage()
      this.pageNumber++
      this.yPosition = this.margin
    }
  }

  private addPageNumber(): void {
    this.doc.setFontSize(10)
    this.doc.setTextColor(148, 163, 184)
    this.doc.text(`Page ${this.pageNumber}`, this.pageWidth - this.margin, this.pageHeight - 10, { align: "right" })
  }

  generate(): Buffer {
    this.addPageNumber()
    return Buffer.from(this.doc.output("arraybuffer"))
  }

  private addPage(): void {
    this.doc.addPage()
  }
}

// ============================================
// ZIP Generator Class
// ============================================

export class ZIPGenerator {
  private archive: archiver.Archiver

  constructor() {
    this.archive = archiver("zip", { zlib: { level: 9 } })
  }

  addFile(path: string, content: string | Buffer): void {
    this.archive.append(Buffer.isBuffer(content) ? content : Buffer.from(content), { name: path })
  }

  addProjectStructure(project: ExportableProject): void {
    const baseDir = project.name.toLowerCase().replace(/[^a-z0-9]/g, "-")

    // README
    this.addFile(
      `${baseDir}/README.md`,
      `# ${project.name}

${project.description || "Data Engineering Project"}

## Overview

- **Industry**: ${project.industry || "Not specified"}
- **Status**: ${project.status}
- **Created**: ${project.createdAt.toLocaleDateString()}
- **Last Updated**: ${project.updatedAt.toLocaleDateString()}

## Structure

- \`pipelines/\` - ETL/ELT pipeline code
- \`transformations/\` - dbt models and SQL transformations
- \`config/\` - Configuration files
- \`docs/\` - Documentation

## Getting Started

1. Review the architecture documentation
2. Configure your data source connections
3. Deploy pipelines using your orchestration tool
4. Run transformations with dbt or equivalent

---
Generated by AI Data Engineering System
`
    )

    // Add pipelines
    if (project.pipelines) {
      project.pipelines.forEach((pipeline) => {
        const ext = pipeline.language === "python" ? "py" : pipeline.language === "yaml" ? "yml" : "sql"
        this.addFile(`${baseDir}/pipelines/${pipeline.name}.${ext}`, pipeline.code)
      })
    }

    // Add transformations
    if (project.transformations) {
      project.transformations.forEach((t) => {
        const layerDir = t.layer === "staging" ? "staging" : t.layer === "intermediate" ? "intermediate" : "marts"
        this.addFile(`${baseDir}/transformations/models/${layerDir}/${t.name}.sql`, t.sql)

        if (t.documentation) {
          this.addFile(`${baseDir}/transformations/models/${layerDir}/${t.name}.md`, t.documentation)
        }
      })

      // dbt_project.yml
      this.addFile(
        `${baseDir}/transformations/dbt_project.yml`,
        `
name: '${project.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}'
version: '1.0.0'
config-version: 2

profile: 'default'

model-paths: ["models"]
seed-paths: ["seeds"]
test-paths: ["tests"]
macro-paths: ["macros"]

target-path: "target"
clean-targets:
  - "target"
  - "dbt_packages"

models:
  ${project.name.toLowerCase().replace(/[^a-z0-9]/g, "_")}:
    staging:
      +materialized: view
    intermediate:
      +materialized: view
    marts:
      +materialized: table
`
      )
    }

    // Add architecture diagrams
    if (project.architecture?.diagrams) {
      project.architecture.diagrams.forEach((diagram) => {
        const ext = diagram.format === "mermaid" ? "mmd" : diagram.format === "plantuml" ? "puml" : "xml"
        this.addFile(`${baseDir}/docs/diagrams/${diagram.name}.${ext}`, diagram.content)
      })
    }

    // Add KPIs documentation
    if (project.kpis && project.kpis.length > 0) {
      const kpiDocs = project.kpis
        .map(
          (kpi) => `### ${kpi.name}

${kpi.description}

**Formula**: ${kpi.formula}
${kpi.currentValue ? `**Current Value**: ${kpi.currentValue}${kpi.unit ? ` ${kpi.unit}` : ""}` : ""}
${kpi.targetValue ? `**Target**: ${kpi.targetValue}${kpi.unit ? ` ${kpi.unit}` : ""}` : ""}
`
        )
        .join("\n")

      this.addFile(`${baseDir}/docs/kpis.md`, `# Key Performance Indicators\n\n${kpiDocs}`)
    }

    // Add quality report
    if (project.qualityReport) {
      this.addFile(
        `${baseDir}/docs/data_quality_report.md`,
        `# Data Quality Report

## Overall Score: ${project.qualityReport.overallScore}/100

## Issues

${project.qualityReport.issues
  .map(
    (issue) => `- **${issue.severity.toUpperCase()}**: ${issue.table}${issue.column ? `.${issue.column}` : ""} - ${issue.description} (${issue.type})`
  )
  .join("\n")}

## Recommendations

${project.qualityReport.recommendations.map((r) => `- ${r}`).join("\n")}
`
      )
    }

    // Add cost estimate
    if (project.costEstimate) {
      this.addFile(
        `${baseDir}/docs/cost_estimate.md`,
        `# Cost Estimation

## Monthly Estimate: ${project.costEstimate.currency} ${project.costEstimate.monthly.toLocaleString()}
## Yearly Estimate: ${project.costEstimate.currency} ${project.costEstimate.yearly.toLocaleString()}

### Breakdown

| Category | Amount | Percentage |
|----------|--------|------------|
${project.costEstimate.breakdown.map((b) => `| ${b.category} | ${project.costEstimate.currency} ${b.amount.toLocaleString()} | ${b.percentage}% |`).join("\n")}
`
      )
    }
  }

  async generate(): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const chunks: Buffer[] = []

      this.archive.on("data", (chunk) => chunks.push(chunk))
      this.archive.on("end", () => resolve(Buffer.concat(chunks)))
      this.archive.on("error", reject)

      this.archive.finalize()
    })
  }
}

// ============================================
// Main Export Functions
// ============================================

export async function exportProject(
  project: ExportableProject,
  options: ExportOptions
): Promise<ExportResult> {
  const files: { name: string; content: Buffer; mimeType: string }[] = []
  const errors: string[] = []

  try {
    if (options.format === "pdf" || options.format === "both") {
      const pdfBuffer = await generateProjectPDF(project, options)
      files.push({
        name: `${project.name}_Report.pdf`,
        content: pdfBuffer,
        mimeType: "application/pdf",
      })
    }

    if (options.format === "zip" || options.format === "both") {
      const zipBuffer = await generateProjectZIP(project, options)
      files.push({
        name: `${project.name}_Deliverables.zip`,
        content: zipBuffer,
        mimeType: "application/zip",
      })
    }

    return { success: true, files, errors: errors.length > 0 ? errors : undefined }
  } catch (error) {
    return {
      success: false,
      files: [],
      errors: [error instanceof Error ? error.message : "Unknown error during export"],
    }
  }
}

async function generateProjectPDF(project: ExportableProject, options: ExportOptions): Promise<Buffer> {
  const pdf = new EnhancedPDFGenerator()

  // Cover page
  pdf.addCoverPage(project)

  // Table of contents
  const sections: string[] = ["Executive Summary"]
  if (project.dataSources?.length) sections.push("Data Sources")
  if (project.architecture) sections.push("Architecture Design")
  if (project.pipelines?.length) sections.push("Pipelines")
  if (project.transformations?.length) sections.push("Transformations")
  if (project.kpis?.length) sections.push("Key Performance Indicators")
  if (project.qualityReport) sections.push("Data Quality Report")
  if (project.costEstimate && options.includeCosts) sections.push("Cost Estimation")

  pdf.addTableOfContents(sections)

  // Executive Summary
  pdf.addSection(
    "1. Executive Summary",
    `This document presents the data engineering deliverables for ${project.name}.

Project Status: ${project.status}
Industry: ${project.industry || "Not specified"}
Generated: ${new Date().toLocaleDateString()}

${project.description || "No description provided."}`
  )

  // Data Sources
  if (project.dataSources?.length) {
    let content = `The project integrates data from ${project.dataSources.length} source(s):\n\n`
    project.dataSources.forEach((ds) => {
      content += `**${ds.name}** (${ds.type})\n`
      if (ds.tables?.length) {
        content += `  - ${ds.tables.length} tables discovered\n`
        ds.tables.slice(0, 5).forEach((t) => {
          content += `    - ${t.name}: ${t.columns?.length || 0} columns, ${t.rowCount?.toLocaleString() || "unknown"} rows\n`
        })
        if (ds.tables.length > 5) {
          content += `    - ... and ${ds.tables.length - 5} more tables\n`
        }
      }
      content += "\n"
    })
    pdf.addSection("2. Data Sources", content)

    // Data source table
    if (project.dataSources[0]?.tables) {
      pdf.addSection("2.1 Source Tables Overview", "")
      const rows = project.dataSources[0].tables.slice(0, 10).map((t) => [
        t.name,
        t.schema || "public",
        String(t.columns?.length || 0),
        t.rowCount?.toLocaleString() || "N/A",
      ])
      pdf.addTable(["Table Name", "Schema", "Columns", "Rows"], rows)
    }
  }

  // Architecture
  if (project.architecture) {
    pdf.addSection(
      "3. Architecture Design",
      `**Data Warehouse**: ${project.architecture.warehouseType}
**Orchestration**: ${project.architecture.orchestrationTool}
**Transformation**: ${project.architecture.transformationFramework}
**BI Tool**: ${project.architecture.biTool || "Not specified"}
**Architecture Pattern**: ${project.architecture.architecturePattern}

${project.architecture.rationale || ""}`
    )

    if (project.architecture.diagrams?.length && options.includeDiagrams) {
      project.architecture.diagrams.forEach((diagram) => {
        pdf.addCodeBlock(diagram.content, diagram.format, diagram.name)
      })
    }
  }

  // Pipelines
  if (project.pipelines?.length && options.includeCode) {
    let content = `The project includes ${project.pipelines.length} pipeline(s):\n\n`
    project.pipelines.forEach((p) => {
      content += `- **${p.name}** (${p.type}, ${p.framework})${p.schedule ? ` - Schedule: ${p.schedule}` : ""}\n`
    })
    pdf.addSection("4. Pipelines", content)

    project.pipelines.forEach((p) => {
      pdf.addCodeBlock(p.code, p.language, p.name)
    })
  }

  // Transformations
  if (project.transformations?.length && options.includeCode) {
    let content = `The project includes ${project.transformations.length} transformation model(s):\n\n`
    content += `| Layer | Count |\n|-------|-------|\n`
    const layerCounts = project.transformations.reduce(
      (acc, t) => {
        acc[t.layer] = (acc[t.layer] || 0) + 1
        return acc
      },
      {} as Record<string, number>
    )
    Object.entries(layerCounts).forEach(([layer, count]) => {
      content += `| ${layer} | ${count} |\n`
    })
    pdf.addSection("5. Transformations", content)

    project.transformations.slice(0, 5).forEach((t) => {
      pdf.addCodeBlock(t.sql, "sql", `${t.layer}/${t.name}`)
    })
  }

  // KPIs
  if (project.kpis?.length) {
    pdf.addSection("6. Key Performance Indicators", "")

    project.kpis.forEach((kpi) => {
      pdf.addKPICard(
        kpi.name,
        kpi.currentValue !== undefined ? `${kpi.currentValue}${kpi.unit ? ` ${kpi.unit}` : ""}` : "N/A",
        kpi.trend
      )
    })
  }

  // Quality Report
  if (project.qualityReport && options.includeQuality) {
    pdf.addSection(
      "7. Data Quality Report",
      `Overall Quality Score: ${project.qualityReport.overallScore}/100

**Issues Found**: ${project.qualityReport.issues.length}

${project.qualityReport.issues
  .slice(0, 10)
  .map((i) => `- [${i.severity.toUpperCase()}] ${i.table}${i.column ? `.${i.column}` : ""}: ${i.description}`)
  .join("\n")}

**Recommendations**:
${project.qualityReport.recommendations.map((r) => `- ${r}`).join("\n")}`
    )
  }

  // Cost Estimate
  if (project.costEstimate && options.includeCosts) {
    pdf.addSection(
      "8. Cost Estimation",
      `**Monthly Estimate**: ${project.costEstimate.currency} ${project.costEstimate.monthly.toLocaleString()}
**Yearly Estimate**: ${project.costEstimate.currency} ${project.costEstimate.yearly.toLocaleString()}`
    )

    const rows = project.costEstimate.breakdown.map((b) => [
      b.category,
      `${project.costEstimate!.currency} ${b.amount.toLocaleString()}`,
      `${b.percentage}%`,
    ])
    pdf.addTable(["Category", "Amount", "Percentage"], rows)
  }

  return pdf.generate()
}

async function generateProjectZIP(project: ExportableProject, options: ExportOptions): Promise<Buffer> {
  const zip = new ZIPGenerator()
  zip.addProjectStructure(project)
  return zip.generate()
}
