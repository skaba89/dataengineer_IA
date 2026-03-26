/**
 * DataSphere Innovation - MFA API Routes
 * Two-factor authentication endpoints
 */

import { NextRequest, NextResponse } from 'next/server'
import * as crypto from 'crypto'

// TOTP implementation
function generateSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let secret = ''
  const randomBytes = crypto.randomBytes(20)
  for (let i = 0; i < 16; i++) {
    secret += chars[randomBytes[i] % chars.length]
  }
  return secret
}

function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = []
  for (let i = 0; i < count; i++) {
    const code = crypto.randomBytes(4).toString('hex').toUpperCase()
    codes.push(`${code.slice(0, 4)}-${code.slice(4)}`)
  }
  return codes
}

function generateQRCode(secret: string, email: string): string {
  const issuer = encodeURIComponent('DataSphere Innovation')
  const accountName = encodeURIComponent(email)
  const encodedSecret = secret.toUpperCase()
  
  const otpauth = `otpauth://totp/${issuer}:${accountName}?secret=${encodedSecret}&issuer=${issuer}&algorithm=SHA1&digits=6&period=30`
  
  return `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${encodeURIComponent(otpauth)}&choe=UTF-8`
}

function base32Decode(str: string): Buffer {
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  str = str.toUpperCase().replace(/[^A-Z2-7]/g, '')
  
  const result: number[] = []
  let bits = 0
  let value = 0
  
  for (const char of str) {
    value = (value << 5) | alphabet.indexOf(char)
    bits += 5
    
    if (bits >= 8) {
      result.push((value >>> (bits - 8)) & 255)
      bits -= 8
    }
  }
  
  return Buffer.from(result)
}

function generateTOTP(secret: string, counter: number): string {
  const key = base32Decode(secret)
  const buffer = Buffer.alloc(8)
  buffer.writeBigUInt64BE(BigInt(counter))
  
  const hmac = crypto.createHmac('sha1', key)
  hmac.update(buffer)
  const hmacResult = hmac.digest()
  
  const offset = hmacResult[hmacResult.length - 1] & 0x0f
  const code = hmacResult.readUInt32BE(offset) & 0x7fffffff
  
  return (code % 1000000).toString().padStart(6, '0')
}

function verifyTOTP(secret: string, token: string, window: number = 1): boolean {
  const epoch = Math.floor(Date.now() / 1000)
  const timeStep = 30
  
  for (let i = -window; i <= window; i++) {
    const counter = Math.floor(epoch / timeStep) + i
    const expectedToken = generateTOTP(secret, counter)
    if (token === expectedToken) {
      return true
    }
  }
  return false
}

// In-memory store for demo (use database in production)
const mfaStore = new Map<string, {
  secret: string
  enabled: boolean
  backupCodes: string[]
  verified: boolean
}>()

/**
 * GET /api/security/mfa - Get MFA status for user
 */
export async function GET(request: NextRequest) {
  try {
    const userId = 'demo-user'
    
    const mfaData = mfaStore.get(userId)
    
    return NextResponse.json({
      enabled: mfaData?.enabled || false,
      verified: mfaData?.verified || false,
      backupCodesRemaining: mfaData?.backupCodes?.length || 0,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to get MFA status' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/security/mfa - Setup or verify MFA
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, userId, code, secret, email, isBackupCode } = body
    
    // Setup MFA
    if (action === 'setup' || (!action && email)) {
      const newSecret = generateSecret()
      const backupCodes = generateBackupCodes(10)
      
      mfaStore.set(userId || 'demo-user', {
        secret: newSecret,
        enabled: false,
        backupCodes,
        verified: false,
      })
      
      return NextResponse.json({
        secret: newSecret,
        qrCode: generateQRCode(newSecret, email || 'user@example.com'),
        backupCodes,
      })
    }
    
    // Verify MFA code
    if (action === 'verify' || code) {
      const mfaData = mfaStore.get(userId || 'demo-user')
      
      if (!mfaData && !secret) {
        return NextResponse.json(
          { error: 'MFA not configured' },
          { status: 400 }
        )
      }
      
      // Check backup code
      if (isBackupCode && mfaData) {
        const backupCodeIndex = mfaData.backupCodes.indexOf(code)
        if (backupCodeIndex !== -1) {
          mfaData.backupCodes.splice(backupCodeIndex, 1)
          mfaStore.set(userId || 'demo-user', mfaData)
          return NextResponse.json({ success: true })
        }
        return NextResponse.json(
          { error: 'Invalid backup code' },
          { status: 400 }
        )
      }
      
      // Verify TOTP code
      const secretToVerify = secret || mfaData?.secret
      const isValid = verifyTOTP(secretToVerify, code)
      
      if (isValid) {
        if (mfaData && !mfaData.enabled) {
          mfaData.enabled = true
          mfaData.verified = true
          mfaStore.set(userId || 'demo-user', mfaData)
        }
        return NextResponse.json({ success: true })
      }
      
      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }
    
    // Disable MFA
    if (action === 'disable') {
      const mfaData = mfaStore.get(userId || 'demo-user')
      
      if (!mfaData || !mfaData.enabled) {
        return NextResponse.json(
          { error: 'MFA not enabled' },
          { status: 400 }
        )
      }
      
      const isValid = verifyTOTP(mfaData.secret, code)
      if (!isValid) {
        const backupCodeIndex = mfaData.backupCodes.indexOf(code)
        if (backupCodeIndex === -1) {
          return NextResponse.json(
            { error: 'Invalid verification code' },
            { status: 400 }
          )
        }
      }
      
      mfaStore.delete(userId || 'demo-user')
      return NextResponse.json({ success: true })
    }
    
    // Regenerate backup codes
    if (action === 'regenerate-backup-codes') {
      const mfaData = mfaStore.get(userId || 'demo-user')
      
      if (!mfaData || !mfaData.enabled) {
        return NextResponse.json(
          { error: 'MFA not enabled' },
          { status: 400 }
        )
      }
      
      const newBackupCodes = generateBackupCodes(10)
      mfaData.backupCodes = newBackupCodes
      mfaStore.set(userId || 'demo-user', mfaData)
      
      return NextResponse.json({ backupCodes: newBackupCodes })
    }
    
    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )
  } catch (error) {
    console.error('MFA API error:', error)
    return NextResponse.json(
      { error: 'Failed to process MFA request' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/security/mfa - Disable MFA
 */
export async function DELETE(request: NextRequest) {
  try {
    const body = await request.json()
    const { userId, code } = body
    
    const mfaData = mfaStore.get(userId || 'demo-user')
    
    if (!mfaData || !mfaData.enabled) {
      return NextResponse.json(
        { error: 'MFA not enabled' },
        { status: 400 }
      )
    }
    
    const isValid = verifyTOTP(mfaData.secret, code)
    if (!isValid) {
      const backupCodeIndex = mfaData.backupCodes.indexOf(code)
      if (backupCodeIndex === -1) {
        return NextResponse.json(
          { error: 'Invalid verification code' },
          { status: 400 }
        )
      }
    }
    
    mfaStore.delete(userId || 'demo-user')
    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to disable MFA' },
      { status: 500 }
    )
  }
}
