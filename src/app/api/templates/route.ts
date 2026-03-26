// Templates API - Industry templates for quick project setup

import { NextRequest, NextResponse } from 'next/server'
import { 
  INDUSTRY_TEMPLATES,
  getTemplateByIndustry,
  generateProjectFromTemplate as generateFromTemplate,
  type IndustryType 
} from '@/lib/templates/industry-templates'

// Helper to get all templates as array
function getAllIndustryTemplates() {
  return Object.values(INDUSTRY_TEMPLATES)
}

// Helper to get template by industry
function getIndustryTemplate(industry: IndustryType) {
  return getTemplateByIndustry(industry)
}

// Helper to generate project from template
function generateProjectConfig(industry: IndustryType, projectName: string, customizations?: any) {
  const template = getTemplateByIndustry(industry)
  if (!template) return null
  return generateFromTemplate(template, projectName)
}

// Type alias for API compatibility
type Industry = IndustryType

// GET /api/templates - List all industry templates
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const industry = searchParams.get('industry')

    if (industry) {
      const template = getIndustryTemplate(industry as Industry)
      if (!template) {
        return NextResponse.json(
          { success: false, error: 'Template not found' },
          { status: 404 }
        )
      }
      return NextResponse.json({
        success: true,
        template,
      })
    }

    const templates = getAllIndustryTemplates()
    
    return NextResponse.json({
      success: true,
      templates: templates.map(t => ({
        id: t.id,
        industry: t.industry,
        name: t.name,
        description: t.description,
        useCases: t.useCases,
        estimatedDuration: t.estimatedDuration,
        estimatedCost: t.estimatedCost,
        kpiCount: t.kpis.length,
        dataSourceCount: t.dataSources.length,
      })),
      total: templates.length,
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// POST /api/templates - Generate project from template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { industry, projectName, customizations } = body

    if (!industry || !projectName) {
      return NextResponse.json(
        { success: false, error: 'industry and projectName are required' },
        { status: 400 }
      )
    }

    const projectConfig = generateProjectConfig(
      industry as Industry,
      projectName,
      customizations
    )

    return NextResponse.json({
      success: true,
      projectConfig,
      message: 'Project configuration generated successfully',
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
