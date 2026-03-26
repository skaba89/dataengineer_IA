// SSO Providers Management API
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

// Type definitions for SSO configs
interface SAMLConfig {
  entryPoint: string
  issuer: string
  certificate: string
}

interface OIDCConfig {
  clientId: string
  clientSecret: string
  issuer: string
  authorizationUrl: string
  tokenUrl: string
  userInfoUrl: string
}

// Validation functions
function validateSAMLConfig(config: SAMLConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (!config.entryPoint) errors.push('entryPoint is required')
  if (!config.issuer) errors.push('issuer is required')
  if (!config.certificate) errors.push('certificate is required')
  return { valid: errors.length === 0, errors }
}

function validateOIDCConfig(config: OIDCConfig): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  if (!config.clientId) errors.push('clientId is required')
  if (!config.clientSecret) errors.push('clientSecret is required')
  if (!config.issuer) errors.push('issuer is required')
  return { valid: errors.length === 0, errors }
}

// GET /api/sso/providers - List SSO providers for organization
export async function GET() {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // For now, return mock data since we don't have SSOProvider table
    // In production, this would query the database
    const providers = [
      {
        id: 'sso_azure_001',
        name: 'Microsoft Entra ID',
        type: 'oidc',
        organizationId: session.user.organizationId,
        enabled: true,
        status: 'active',
        lastUsed: new Date(Date.now() - 3600000).toISOString(),
        userCount: 45,
        config: {
          issuer: 'https://login.microsoftonline.com/tenant-id/v2.0',
          clientId: '********',
          attributeMapping: {
            email: 'email',
            firstName: 'given_name',
            lastName: 'family_name',
          },
        },
      },
      {
        id: 'sso_okta_001',
        name: 'Okta',
        type: 'saml',
        organizationId: session.user.organizationId,
        enabled: false,
        status: 'not_configured',
        lastUsed: null,
        userCount: 0,
        config: null,
      },
    ]

    return NextResponse.json({ providers })
  } catch (error) {
    console.error('Error fetching SSO providers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SSO providers' },
      { status: 500 }
    )
  }
}

// POST /api/sso/providers - Create new SSO provider
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has admin role
    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can configure SSO' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { name, type, config } = body

    if (!name || !type || !config) {
      return NextResponse.json(
        { error: 'Name, type, and config are required' },
        { status: 400 }
      )
    }

    // Validate configuration based on type
    if (type === 'saml') {
      const validation = validateSAMLConfig(config as SAMLConfig)
      if (!validation.valid) {
        return NextResponse.json(
          { error: 'Invalid SAML configuration', details: validation.errors },
          { status: 400 }
        )
      }
    } else if (type === 'oidc') {
      const validation = validateOIDCConfig(config as OIDCConfig)
      if (!validation.valid) {
        return NextResponse.json(
          { error: 'Invalid OIDC configuration', details: validation.errors },
          { status: 400 }
        )
      }
    } else {
      return NextResponse.json(
        { error: 'Invalid SSO type. Must be "saml" or "oidc"' },
        { status: 400 }
      )
    }

    // In production, save to database
    const provider = {
      id: `sso_${type}_${Date.now()}`,
      name,
      type,
      organizationId: session.user.organizationId,
      config,
      enabled: true,
      status: 'active',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    // Log the creation
    console.log(`SSO Provider created: ${provider.id} by user ${session.user.id}`)

    return NextResponse.json({ provider }, { status: 201 })
  } catch (error) {
    console.error('Error creating SSO provider:', error)
    return NextResponse.json(
      { error: 'Failed to create SSO provider' },
      { status: 500 }
    )
  }
}

// PUT /api/sso/providers - Update SSO provider
export async function PUT(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can configure SSO' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { id, name, config, enabled } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      )
    }

    // In production, update in database and validate config
    const provider = {
      id,
      name: name || 'Updated Provider',
      config,
      enabled: enabled ?? true,
      updatedAt: new Date().toISOString(),
    }

    return NextResponse.json({ provider })
  } catch (error) {
    console.error('Error updating SSO provider:', error)
    return NextResponse.json(
      { error: 'Failed to update SSO provider' },
      { status: 500 }
    )
  }
}

// DELETE /api/sso/providers - Delete SSO provider
export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    if (!session?.user?.organizationId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Only admins can delete SSO providers' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Provider ID is required' },
        { status: 400 }
      )
    }

    // In production, delete from database
    console.log(`SSO Provider deleted: ${id} by user ${session.user.id}`)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting SSO provider:', error)
    return NextResponse.json(
      { error: 'Failed to delete SSO provider' },
      { status: 500 }
    )
  }
}
