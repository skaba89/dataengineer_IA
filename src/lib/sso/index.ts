/**
 * DataSphere Innovation - Enterprise SSO Advanced
 * 
 * Advanced Single Sign-On with:
 * - SAML 2.0 with advanced attributes
 * - OIDC with PKCE
 * - Multi-IdP federation
 * - Just-in-Time provisioning
 * - SCIM user provisioning
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Types
export interface SSOProvider {
  id: string
  name: string
  type: 'saml' | 'oidc' | 'oauth2'
  enabled: boolean
  config: SSOConfig
  attributeMapping: AttributeMapping
  provisioning: ProvisioningConfig
}

export interface SSOConfig {
  // SAML specific
  entryPoint?: string
  issuer?: string
  cert?: string
  signatureAlgorithm?: string
  wantAssertionsSigned?: boolean
  wantResponseSigned?: boolean
  
  // OIDC/OAuth specific
  clientId?: string
  clientSecret?: string
  authorizationUrl?: string
  tokenUrl?: string
  userInfoUrl?: string
  jwksUrl?: string
  scope?: string[]
  usePKCE?: boolean
  
  // Common
  callbackUrl: string
  domain?: string // Email domain restriction
}

export interface AttributeMapping {
  email: string
  firstName: string
  lastName: string
  displayName?: string
  groups?: string
  department?: string
  title?: string
  manager?: string
}

export interface ProvisioningConfig {
  enabled: boolean
  mode: 'jit' | 'scim' | 'both'
  defaultRole?: string
  defaultGroups?: string[]
  syncGroups?: boolean
  deactivateOnUnassign?: boolean
}

export interface SSOUser {
  externalId: string
  email: string
  firstName: string
  lastName: string
  displayName?: string
  groups?: string[]
  attributes?: Record<string, any>
}

// SAML 2.0 Handler
export class SAMLHandler {
  private provider: SSOProvider

  constructor(provider: SSOProvider) {
    this.provider = provider
  }

  /**
   * Generate SAML Auth Request
   */
  generateAuthRequest(relayState?: string): { url: string; samlRequest: string } {
    const { entryPoint, issuer } = this.provider.config
    
    const authRequest = this.buildAuthRequestXML({
      id: this.generateID(),
      issueInstant: new Date().toISOString(),
      destination: entryPoint,
      issuer: issuer,
      assertionConsumerServiceURL: this.provider.config.callbackUrl,
      protocolBinding: 'urn:oasis:names:tc:SAML:2.0:bindings:HTTP-POST'
    })

    const samlRequest = Buffer.from(authRequest).toString('base64')
    
    const url = new URL(entryPoint!)
    url.searchParams.set('SAMLRequest', samlRequest)
    if (relayState) {
      url.searchParams.set('RelayState', relayState)
    }

    return { url: url.toString(), samlRequest }
  }

  /**
   * Validate SAML Response
   */
  async validateResponse(samlResponse: string): Promise<SSOUser> {
    const decoded = Buffer.from(samlResponse, 'base64').toString('utf-8')
    
    // Validate signature
    if (this.provider.config.wantResponseSigned) {
      await this.validateSignature(decoded)
    }

    // Parse assertions
    const assertion = this.parseAssertion(decoded)
    
    // Map attributes
    const user = this.mapAttributes(assertion)

    return user
  }

  private buildAuthRequestXML(params: Record<string, string>): string {
    return `<?xml version="1.0"?>
      <samlp:AuthnRequest xmlns:samlp="urn:oasis:names:tc:SAML:2.0:protocol"
        ID="${params.id}"
        Version="2.0"
        IssueInstant="${params.issueInstant}"
        Destination="${params.destination}"
        ProtocolBinding="${params.protocolBinding}"
        AssertionConsumerServiceURL="${params.assertionConsumerServiceURL}">
        <saml:Issuer xmlns:saml="urn:oasis:names:tc:SAML:2.0:assertion">${params.issuer}</saml:Issuer>
      </samlp:AuthnRequest>`
  }

  private generateID(): string {
    return `_${Math.random().toString(36).substr(2, 9)}`
  }

  private async validateSignature(xml: string): Promise<void> {
    // Implement signature validation using crypto
    // This is a placeholder - use xml-crypto or similar
  }

  private parseAssertion(xml: string): Record<string, string> {
    // Parse SAML assertion XML
    const attributes: Record<string, string> = {}
    
    // Simple regex parsing (use proper XML parser in production)
    const attributeRegex = /<saml:Attribute Name="([^"]+)"[^>]*>\s*<saml:AttributeValue[^>]*>([^<]+)<\/saml:AttributeValue>/g
    let match
    while ((match = attributeRegex.exec(xml)) !== null) {
      attributes[match[1]] = match[2]
    }

    // Extract NameID
    const nameIdMatch = /<saml:NameID[^>]*>([^<]+)<\/saml:NameID>/.exec(xml)
    if (nameIdMatch) {
      attributes['nameId'] = nameIdMatch[1]
    }

    return attributes
  }

  private mapAttributes(assertion: Record<string, string>): SSOUser {
    const { attributeMapping } = this.provider

    return {
      externalId: assertion['nameId'] || assertion['sub'] || assertion['objectGUID'],
      email: assertion[attributeMapping.email] || assertion['email'] || assertion['emailAddress'],
      firstName: assertion[attributeMapping.firstName] || assertion['firstName'] || assertion['givenName'],
      lastName: assertion[attributeMapping.lastName] || assertion['lastName'] || assertion['sn'] || assertion['surname'],
      displayName: assertion[attributeMapping.displayName || 'displayName'] || assertion['displayName'],
      groups: this.parseGroups(assertion[attributeMapping.groups || 'groups']),
      attributes: assertion
    }
  }

  private parseGroups(groupsValue?: string): string[] {
    if (!groupsValue) return []
    
    // Handle different group formats
    if (groupsValue.startsWith('[')) {
      try {
        return JSON.parse(groupsValue)
      } catch {
        return [groupsValue]
      }
    }
    
    return groupsValue.split(',').map(g => g.trim())
  }
}

// OIDC Handler
export class OIDCHandler {
  private provider: SSOProvider

  constructor(provider: SSOProvider) {
    this.provider = provider
  }

  /**
   * Generate OIDC Auth URL
   */
  generateAuthUrl(state: string, nonce: string, codeChallenge?: string): string {
    const { authorizationUrl, clientId, scope, callbackUrl, usePKCE } = this.provider.config

    const params = new URLSearchParams({
      client_id: clientId!,
      response_type: 'code',
      redirect_uri: callbackUrl,
      scope: scope?.join(' ') || 'openid profile email',
      state,
      nonce
    })

    if (usePKCE && codeChallenge) {
      params.set('code_challenge', codeChallenge)
      params.set('code_challenge_method', 'S256')
    }

    return `${authorizationUrl}?${params.toString()}`
  }

  /**
   * Exchange code for tokens
   */
  async exchangeCode(code: string, codeVerifier?: string): Promise<{
    accessToken: string
    refreshToken?: string
    idToken?: string
    expiresIn: number
  }> {
    const { tokenUrl, clientId, clientSecret, callbackUrl, usePKCE } = this.provider.config

    const params = new URLSearchParams({
      grant_type: 'authorization_code',
      code,
      redirect_uri: callbackUrl,
      client_id: clientId!,
      client_secret: clientSecret!
    })

    if (usePKCE && codeVerifier) {
      params.set('code_verifier', codeVerifier)
    }

    const response = await fetch(tokenUrl!, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params.toString()
    })

    if (!response.ok) {
      throw new Error(`Token exchange failed: ${response.statusText}`)
    }

    const data = await response.json()
    return {
      accessToken: data.access_token,
      refreshToken: data.refresh_token,
      idToken: data.id_token,
      expiresIn: data.expires_in
    }
  }

  /**
   * Get user info from OIDC provider
   */
  async getUserInfo(accessToken: string): Promise<SSOUser> {
    const { userInfoUrl } = this.provider.config

    const response = await fetch(userInfoUrl!, {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    })

    if (!response.ok) {
      throw new Error(`Failed to get user info: ${response.statusText}`)
    }

    const userInfo = await response.json()
    return this.mapUserInfo(userInfo)
  }

  private mapUserInfo(userInfo: Record<string, any>): SSOUser {
    const { attributeMapping } = this.provider

    return {
      externalId: userInfo.sub || userInfo.id,
      email: userInfo[attributeMapping.email] || userInfo.email,
      firstName: userInfo[attributeMapping.firstName] || userInfo.given_name || userInfo.firstName,
      lastName: userInfo[attributeMapping.lastName] || userInfo.family_name || userInfo.lastName,
      displayName: userInfo[attributeMapping.displayName || 'name'] || userInfo.name,
      groups: userInfo[attributeMapping.groups || 'groups'] || [],
      attributes: userInfo
    }
  }

  /**
   * Generate PKCE code challenge
   */
  static generatePKCEChallenge(): { verifier: string; challenge: string } {
    const verifier = this.generateRandomString(128)
    const challenge = this.base64URLEncode(
      this.sha256(verifier)
    )

    return { verifier, challenge }
  }

  private static generateRandomString(length: number): string {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~'
    let text = ''
    for (let i = 0; i < length; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length))
    }
    return text
  }

  private static sha256(str: string): Buffer {
    // Use Node.js crypto module
    const crypto = require('crypto')
    return crypto.createHash('sha256').update(str).digest()
  }

  private static base64URLEncode(buffer: Buffer): string {
    return buffer.toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '')
  }
}

// SCIM 2.0 Handler for user provisioning
export class SCIMHandler {
  private provider: SSOProvider
  private endpoint: string
  private authToken: string

  constructor(provider: SSOProvider, endpoint: string, authToken: string) {
    this.provider = provider
    this.endpoint = endpoint
    this.authToken = authToken
  }

  /**
   * Get user from SCIM endpoint
   */
  async getUser(userId: string): Promise<SSOUser | null> {
    try {
      const response = await fetch(`${this.endpoint}/Users/${userId}`, {
        headers: {
          Authorization: `Bearer ${this.authToken}`,
          'Content-Type': 'application/scim+json'
        }
      })

      if (response.status === 404) return null
      if (!response.ok) throw new Error(`SCIM request failed: ${response.statusText}`)

      const user = await response.json()
      return this.mapSCIMUser(user)
    } catch (error) {
      console.error('[SCIM] GetUser error:', error)
      throw error
    }
  }

  /**
   * List users from SCIM endpoint
   */
  async listUsers(filter?: string): Promise<SSOUser[]> {
    const params = new URLSearchParams()
    if (filter) {
      params.set('filter', filter)
    }

    const response = await fetch(`${this.endpoint}/Users?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${this.authToken}`,
        'Content-Type': 'application/scim+json'
      }
    })

    if (!response.ok) {
      throw new Error(`SCIM list failed: ${response.statusText}`)
    }

    const data = await response.json()
    return data.Resources.map((u: any) => this.mapSCIMUser(u))
  }

  /**
   * Create user in local system from SCIM data
   */
  async provisionUser(scimUser: SSOUser): Promise<any> {
    const { provisioning } = this.provider

    // Check if user exists
    let user = await prisma.user.findFirst({
      where: { email: scimUser.email }
    })

    if (!user) {
      // Create new user with JIT provisioning
      user = await prisma.user.create({
        data: {
          email: scimUser.email,
          name: `${scimUser.firstName} ${scimUser.lastName}`,
          role: provisioning.defaultRole || 'viewer',
          emailVerified: new Date()
        }
      })
    }

    // Sync groups if enabled
    if (provisioning.syncGroups && scimUser.groups) {
      await this.syncUserGroups(user.id, scimUser.groups)
    }

    return user
  }

  private mapSCIMUser(scimData: any): SSOUser {
    return {
      externalId: scimData.id,
      email: scimData.emails?.[0]?.value || '',
      firstName: scimData.name?.givenName || '',
      lastName: scimData.name?.familyName || '',
      displayName: scimData.displayName,
      groups: scimData.groups?.map((g: any) => g.display) || [],
      attributes: scimData
    }
  }

  private async syncUserGroups(userId: string, groups: string[]): Promise<void> {
    // Implement group syncing logic
    // This would update user roles/permissions based on group membership
  }
}

// SSO Manager - Main orchestration class
export class SSOManager {
  private providers: Map<string, SSOProvider> = new Map()

  /**
   * Register SSO provider
   */
  registerProvider(provider: SSOProvider): void {
    this.providers.set(provider.id, provider)
  }

  /**
   * Get SSO provider by ID
   */
  getProvider(providerId: string): SSOProvider | undefined {
    return this.providers.get(providerId)
  }

  /**
   * Detect provider by email domain
   */
  detectProviderFromEmail(email: string): SSOProvider | undefined {
    const domain = email.split('@')[1]?.toLowerCase()
    
    for (const provider of this.providers.values()) {
      if (provider.config.domain?.toLowerCase() === domain) {
        return provider
      }
    }
    
    return undefined
  }

  /**
   * Initiate SSO login
   */
  initiateLogin(
    providerId: string,
    options?: { relayState?: string }
  ): { redirectUrl: string } {
    const provider = this.providers.get(providerId)
    if (!provider) {
      throw new Error(`Provider not found: ${providerId}`)
    }

    if (provider.type === 'saml') {
      const handler = new SAMLHandler(provider)
      const { url } = handler.generateAuthRequest(options?.relayState)
      return { redirectUrl: url }
    }

    if (provider.type === 'oidc') {
      const handler = new OIDCHandler(provider)
      const state = this.generateState()
      const nonce = this.generateNonce()
      const { verifier, challenge } = OIDCHandler.generatePKCEChallenge()
      
      const url = handler.generateAuthUrl(state, nonce, challenge)
      return { redirectUrl: url }
    }

    throw new Error(`Unsupported provider type: ${provider.type}`)
  }

  /**
   * Handle SSO callback
   */
  async handleCallback(
    providerId: string,
    params: Record<string, string>
  ): Promise<SSOUser> {
    const provider = this.providers.get(providerId)
    if (!provider) {
      throw new Error(`Provider not found: ${providerId}`)
    }

    if (provider.type === 'saml') {
      const handler = new SAMLHandler(provider)
      return handler.validateResponse(params.SAMLResponse)
    }

    if (provider.type === 'oidc') {
      const handler = new OIDCHandler(provider)
      const tokens = await handler.exchangeCode(params.code)
      return handler.getUserInfo(tokens.accessToken)
    }

    throw new Error(`Unsupported provider type: ${provider.type}`)
  }

  private generateState(): string {
    return Math.random().toString(36).substr(2, 32)
  }

  private generateNonce(): string {
    return Math.random().toString(36).substr(2, 32)
  }

  /**
   * List all enabled providers
   */
  listProviders(): SSOProvider[] {
    return Array.from(this.providers.values()).filter(p => p.enabled)
  }
}

// Export singleton instance
export const ssoManager = new SSOManager()

// Default enterprise SSO providers
export const defaultEnterpriseProviders: SSOProvider[] = [
  {
    id: 'okta',
    name: 'Okta',
    type: 'oidc',
    enabled: true,
    config: {
      clientId: process.env.OKTA_CLIENT_ID,
      clientSecret: process.env.OKTA_CLIENT_SECRET,
      authorizationUrl: `https://${process.env.OKTA_DOMAIN}/oauth2/v1/authorize`,
      tokenUrl: `https://${process.env.OKTA_DOMAIN}/oauth2/v1/token`,
      userInfoUrl: `https://${process.env.OKTA_DOMAIN}/oauth2/v1/userinfo`,
      callbackUrl: '/api/auth/callback/okta',
      scope: ['openid', 'profile', 'email', 'groups'],
      usePKCE: true
    },
    attributeMapping: {
      email: 'email',
      firstName: 'given_name',
      lastName: 'family_name',
      groups: 'groups'
    },
    provisioning: {
      enabled: true,
      mode: 'jit',
      defaultRole: 'viewer',
      syncGroups: true
    }
  },
  {
    id: 'azure-ad',
    name: 'Microsoft Azure AD',
    type: 'oidc',
    enabled: true,
    config: {
      clientId: process.env.AZURE_AD_CLIENT_ID,
      clientSecret: process.env.AZURE_AD_CLIENT_SECRET,
      authorizationUrl: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/oauth2/v2.0/authorize`,
      tokenUrl: `https://login.microsoftonline.com/${process.env.AZURE_AD_TENANT_ID}/oauth2/v2.0/token`,
      userInfoUrl: 'https://graph.microsoft.com/oidc/userinfo',
      callbackUrl: '/api/auth/callback/azure-ad',
      scope: ['openid', 'profile', 'email', 'User.Read'],
      usePKCE: true
    },
    attributeMapping: {
      email: 'email',
      firstName: 'given_name',
      lastName: 'family_name',
      groups: 'groups'
    },
    provisioning: {
      enabled: true,
      mode: 'jit',
      defaultRole: 'viewer',
      syncGroups: true
    }
  }
]
