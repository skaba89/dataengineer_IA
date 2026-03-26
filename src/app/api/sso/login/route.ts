// SSO Login Initiation API
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { OIDCHandler, defaultEnterpriseProviders, type SSOProvider } from '@/lib/sso'

// Enterprise identity providers template
const ENTERPRISE_IDENTITY_PROVIDERS: Record<string, { type: 'oidc' | 'saml'; defaultScope: string }> = {
  azure_ad: { type: 'oidc', defaultScope: 'openid profile email' },
  okta: { type: 'oidc', defaultScope: 'openid profile email groups' },
  google_workspace: { type: 'oidc', defaultScope: 'openid profile email' },
  auth0: { type: 'oidc', defaultScope: 'openid profile email' },
  onelogin: { type: 'saml', defaultScope: '' },
  ping_identity: { type: 'saml', defaultScope: '' },
  adfs: { type: 'saml', defaultScope: '' },
  jumpcloud: { type: 'saml', defaultScope: '' },
}

// Helper to generate OIDC authorization URL
function generateOIDCAuthorizationUrl(params: {
  clientId: string
  authorizationEndpoint: string
  redirectUri: string
  scope: string
  state: string
  nonce: string
}): { url: string } {
  const url = new URL(params.authorizationEndpoint)
  url.searchParams.set('client_id', params.clientId)
  url.searchParams.set('response_type', 'code')
  url.searchParams.set('redirect_uri', params.redirectUri)
  url.searchParams.set('scope', params.scope)
  url.searchParams.set('state', params.state)
  url.searchParams.set('nonce', params.nonce)
  return { url: url.toString() }
}

// POST /api/sso/login - Initiate SSO login
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { provider, organizationId } = body

    if (!provider) {
      return NextResponse.json(
        { error: 'Provider is required' },
        { status: 400 }
      )
    }

    // Generate state for CSRF protection
    const state = Buffer.from(JSON.stringify({
      organizationId,
      nonce: Math.random().toString(36).substring(2, 15),
      timestamp: Date.now(),
    })).toString('base64')

    // Get provider template
    const providerTemplate = ENTERPRISE_IDENTITY_PROVIDERS[provider as keyof typeof ENTERPRISE_IDENTITY_PROVIDERS]
    
    if (!providerTemplate) {
      return NextResponse.json(
        { error: 'Unknown provider' },
        { status: 400 }
      )
    }

    const callbackUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/sso/callback/${provider}`

    if (providerTemplate.type === 'oidc') {
      // Get OIDC configuration from environment or discovery
      let authEndpoint: string
      let issuer: string

      switch (provider) {
        case 'azure_ad':
          issuer = `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID || 'common'}/v2.0`
          authEndpoint = `https://login.microsoftonline.com/${process.env.AZURE_TENANT_ID || 'common'}/oauth2/v2.0/authorize`
          break
        case 'okta':
          issuer = process.env.OKTA_ISSUER || ''
          authEndpoint = `${issuer}/v1/authorize`
          break
        case 'google_workspace':
          issuer = 'https://accounts.google.com'
          authEndpoint = 'https://accounts.google.com/o/oauth2/v2/auth'
          break
        case 'auth0':
          issuer = `https://${process.env.AUTH0_DOMAIN || ''}`
          authEndpoint = `${issuer}/authorize`
          break
        default:
          return NextResponse.json(
            { error: 'Provider not configured' },
            { status: 400 }
          )
      }

      const clientId = getClientIdForProvider(provider)
      
      if (!clientId) {
        return NextResponse.json(
          { error: 'Provider not configured. Please contact your administrator.' },
          { status: 400 }
        )
      }

      const { url } = generateOIDCAuthorizationUrl({
        clientId,
        authorizationEndpoint: authEndpoint,
        redirectUri: callbackUrl,
        scope: providerTemplate.defaultScope,
        state,
        nonce: Math.random().toString(36).substring(2, 15),
      })

      return NextResponse.json({ 
        redirectUrl: url,
        provider,
        type: 'oidc',
      })
    } else if (providerTemplate.type === 'saml') {
      // SAML login
      const samlConfig = {
        entryPoint: getSamlEntryPoint(provider),
        issuer: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/saml/sp`,
        certificate: getSamlCertificate(provider),
      }

      if (!samlConfig.entryPoint) {
        return NextResponse.json(
          { error: 'SAML provider not configured' },
          { status: 400 }
        )
      }

      // Generate SAML request URL
      const samlRequest = generateSAMLAuthRequest(samlConfig.issuer, callbackUrl)
      const encodedRequest = Buffer.from(samlRequest).toString('base64')
      const redirectUrl = `${samlConfig.entryPoint}?SAMLRequest=${encodeURIComponent(encodedRequest)}&RelayState=${encodeURIComponent(state)}`

      return NextResponse.json({
        redirectUrl,
        provider,
        type: 'saml',
      })
    }

    return NextResponse.json(
      { error: 'Invalid provider type' },
      { status: 400 }
    )
  } catch (error) {
    console.error('SSO login error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate SSO login' },
      { status: 500 }
    )
  }
}

function getClientIdForProvider(provider: string): string | null {
  const clientIds: Record<string, string | undefined> = {
    azure_ad: process.env.AZURE_CLIENT_ID,
    okta: process.env.OKTA_CLIENT_ID,
    google_workspace: process.env.GOOGLE_CLIENT_ID,
    auth0: process.env.AUTH0_CLIENT_ID,
  }
  return clientIds[provider] || null
}

function getSamlEntryPoint(provider: string): string | null {
  const entryPoints: Record<string, string | undefined> = {
    onelogin: process.env.ONELOGIN_SSO_URL,
    ping_identity: process.env.PING_SSO_URL,
    adfs: process.env.ADFS_SSO_URL,
    jumpcloud: process.env.JUMPCLOUD_SSO_URL,
  }
  return entryPoints[provider] || null
}

function getSamlCertificate(provider: string): string {
  const certs: Record<string, string | undefined> = {
    onelogin: process.env.ONELOGIN_CERT,
    ping_identity: process.env.PING_CERT,
    adfs: process.env.ADFS_CERT,
    jumpcloud: process.env.JUMPCLOUD_CERT,
  }
  return certs[provider] || ''
}

function generateSAMLAuthRequest(issuer: string, callbackUrl: string): string {
  const timestamp = new Date().toISOString()
  const id = `id_${Math.random().toString(36).substring(2, 15)}`
  
  return `<?xml version="1.0"?>
<samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol" 
    ID="${id}" Version="2.0" IssueInstant="${timestamp}"
    ProtocolBinding="urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST"
    AssertionConsumerServiceURL="${callbackUrl}">
  <saml:Issuer xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">${issuer}</saml:Issuer>
  <samlp:NameIDPolicy Format="urn:oasis:names:tc:SAML:1.1:nameid-format:emailAddress" 
      AllowCreate="true"/>
</samlp:AuthnRequest>`
}

// GET /api/sso/login - Get available SSO providers
export async function GET() {
  try {
    const session = await auth()
    
    // Return available SSO providers based on environment configuration
    const availableProviders: Array<{
      id: string
      name: string
      type: string
      configured: boolean
      icon: string
    }> = []

    // Check Azure AD
    if (process.env.AZURE_CLIENT_ID && process.env.AZURE_CLIENT_SECRET) {
      availableProviders.push({
        id: 'azure_ad',
        name: 'Microsoft Entra ID',
        type: 'oidc',
        configured: true,
        icon: '/icons/azure.svg',
      })
    }

    // Check Okta
    if (process.env.OKTA_CLIENT_ID && process.env.OKTA_CLIENT_SECRET) {
      availableProviders.push({
        id: 'okta',
        name: 'Okta',
        type: 'oidc',
        configured: true,
        icon: '/icons/okta.svg',
      })
    }

    // Check Google Workspace
    if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
      availableProviders.push({
        id: 'google_workspace',
        name: 'Google Workspace',
        type: 'oidc',
        configured: true,
        icon: '/icons/google.svg',
      })
    }

    // Check Auth0
    if (process.env.AUTH0_CLIENT_ID && process.env.AUTH0_CLIENT_SECRET) {
      availableProviders.push({
        id: 'auth0',
        name: 'Auth0',
        type: 'oidc',
        configured: true,
        icon: '/icons/auth0.svg',
      })
    }

    // Check SAML providers
    if (process.env.ONELOGIN_SSO_URL) {
      availableProviders.push({
        id: 'onelogin',
        name: 'OneLogin',
        type: 'saml',
        configured: true,
        icon: '/icons/onelogin.svg',
      })
    }

    if (process.env.ADFS_SSO_URL) {
      availableProviders.push({
        id: 'adfs',
        name: 'ADFS',
        type: 'saml',
        configured: true,
        icon: '/icons/adfs.svg',
      })
    }

    return NextResponse.json({ 
      providers: availableProviders,
      user: session?.user || null,
    })
  } catch (error) {
    console.error('Error fetching SSO providers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch SSO providers' },
      { status: 500 }
    )
  }
}
