'use client'

/**
 * DataSphere Innovation - MFA Setup Component
 * Two-factor authentication setup with TOTP support
 */

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { 
  Shield, 
  Smartphone, 
  Key, 
  Copy, 
  Check, 
  RefreshCw, 
  AlertTriangle,
  CheckCircle2,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'

interface MFASetupProps {
  userId: string
  userEmail: string
  onEnable?: () => void
  onDisable?: () => void
}

interface MFAStatus {
  enabled: boolean
  verified: boolean
  backupCodesRemaining?: number
  lastUsed?: string
}

export function MFASetup({ userId, userEmail, onEnable, onDisable }: MFASetupProps) {
  // State
  const [status, setStatus] = useState<MFAStatus>({ enabled: false, verified: false })
  const [loading, setLoading] = useState(true)
  const [setupMode, setSetupMode] = useState(false)
  const [secret, setSecret] = useState<string>('')
  const [qrCode, setQrCode] = useState<string>('')
  const [verificationCode, setVerificationCode] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [backupCodes, setBackupCodes] = useState<string[]>([])
  const [showBackupCodes, setShowBackupCodes] = useState(false)
  const [copied, setCopied] = useState(false)
  const [disableConfirmCode, setDisableConfirmCode] = useState('')
  const [showDisableConfirm, setShowDisableConfirm] = useState(false)

  // Fetch MFA status on mount
  useEffect(() => {
    fetchMFAStatus()
  }, [userId])

  const fetchMFAStatus = async () => {
    try {
      const response = await fetch('/api/security/mfa/status')
      if (response.ok) {
        const data = await response.json()
        setStatus(data)
      }
    } catch (error) {
      console.error('Failed to fetch MFA status:', error)
    } finally {
      setLoading(false)
    }
  }

  // Start MFA setup
  const startSetup = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/security/mfa/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        const data = await response.json()
        setSecret(data.secret)
        setQrCode(data.qrCode)
        setBackupCodes(data.backupCodes || [])
        setSetupMode(true)
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to start MFA setup')
      }
    } catch (error) {
      toast.error('Failed to start MFA setup')
    } finally {
      setLoading(false)
    }
  }

  // Verify and enable MFA
  const verifyAndEnable = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code')
      return
    }

    setVerifying(true)
    try {
      const response = await fetch('/api/security/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          code: verificationCode,
          secret,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setStatus({ enabled: true, verified: true, backupCodesRemaining: backupCodes.length })
        setSetupMode(false)
        setShowBackupCodes(true)
        toast.success('Two-factor authentication enabled successfully!')
        onEnable?.()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Invalid verification code')
      }
    } catch (error) {
      toast.error('Failed to verify code')
    } finally {
      setVerifying(false)
    }
  }

  // Disable MFA
  const disableMFA = async () => {
    if (!disableConfirmCode || disableConfirmCode.length !== 6) {
      toast.error('Please enter a valid 6-digit code to confirm')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/security/mfa/disable', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          code: disableConfirmCode,
        }),
      })

      if (response.ok) {
        setStatus({ enabled: false, verified: false })
        setShowDisableConfirm(false)
        setDisableConfirmCode('')
        toast.success('Two-factor authentication disabled')
        onDisable?.()
      } else {
        const error = await response.json()
        toast.error(error.message || 'Failed to disable MFA')
      }
    } catch (error) {
      toast.error('Failed to disable MFA')
    } finally {
      setLoading(false)
    }
  }

  // Regenerate backup codes
  const regenerateBackupCodes = async () => {
    try {
      const response = await fetch('/api/security/mfa/backup-codes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId }),
      })

      if (response.ok) {
        const data = await response.json()
        setBackupCodes(data.backupCodes)
        setShowBackupCodes(true)
        toast.success('New backup codes generated')
      }
    } catch (error) {
      toast.error('Failed to regenerate backup codes')
    }
  }

  // Copy backup codes
  const copyBackupCodes = () => {
    navigator.clipboard.writeText(backupCodes.join('\n'))
    setCopied(true)
    toast.success('Backup codes copied to clipboard')
    setTimeout(() => setCopied(false), 2000)
  }

  // Cancel setup
  const cancelSetup = () => {
    setSetupMode(false)
    setSecret('')
    setQrCode('')
    setVerificationCode('')
    setBackupCodes([])
  }

  if (loading && !setupMode) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    )
  }

  // Show backup codes after enabling
  if (showBackupCodes && backupCodes.length > 0) {
    return (
      <Card className="border-yellow-200 bg-yellow-50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-yellow-800">
            <Key className="h-5 w-5" />
            Save Your Backup Codes
          </CardTitle>
          <CardDescription className="text-yellow-700">
            Store these codes securely. Each code can only be used once.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2 bg-white p-4 rounded-lg border border-yellow-200">
            {backupCodes.map((code, index) => (
              <code 
                key={index} 
                className="text-sm font-mono bg-gray-100 p-2 rounded text-center"
              >
                {code}
              </code>
            ))}
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button onClick={copyBackupCodes} variant="outline">
            {copied ? <Check className="h-4 w-4 mr-2" /> : <Copy className="h-4 w-4 mr-2" />}
            {copied ? 'Copied!' : 'Copy Codes'}
          </Button>
          <Button onClick={() => setShowBackupCodes(false)}>
            Done
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Disable confirmation dialog
  if (showDisableConfirm) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            Confirm Disable 2FA
          </CardTitle>
          <CardDescription>
            Enter a code from your authenticator app to confirm disabling two-factor authentication.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="disable-code">Verification Code</Label>
            <Input
              id="disable-code"
              type="text"
              placeholder="000000"
              maxLength={6}
              value={disableConfirmCode}
              onChange={(e) => setDisableConfirmCode(e.target.value.replace(/\D/g, ''))}
              className="text-center text-2xl tracking-widest font-mono"
            />
          </div>
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Disabling 2FA will make your account less secure.
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button 
            variant="outline" 
            onClick={() => setShowDisableConfirm(false)}
          >
            Cancel
          </Button>
          <Button 
            variant="destructive" 
            onClick={disableMFA}
            disabled={loading}
          >
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Disable 2FA
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Setup mode - show QR code
  if (setupMode) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Set Up Authenticator App
          </CardTitle>
          <CardDescription>
            Scan the QR code with your authenticator app (Google Authenticator, Authy, etc.)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* QR Code */}
          <div className="flex justify-center">
            <div className="bg-white p-4 rounded-lg border">
              {qrCode ? (
                <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
              ) : (
                <div className="w-48 h-48 flex items-center justify-center bg-gray-100 rounded">
                  <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                </div>
              )}
            </div>
          </div>

          {/* Manual entry option */}
          <div className="space-y-2">
            <Label className="text-sm text-muted-foreground">
              Or enter this code manually:
            </Label>
            <div className="flex items-center gap-2">
              <code className="flex-1 p-2 bg-muted rounded text-sm font-mono break-all">
                {secret}
              </code>
              <Button 
                size="icon" 
                variant="ghost"
                onClick={() => {
                  navigator.clipboard.writeText(secret)
                  toast.success('Secret copied')
                }}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Verification code input */}
          <div className="space-y-2">
            <Label htmlFor="verify-code">Verification Code</Label>
            <Input
              id="verify-code"
              type="text"
              placeholder="Enter 6-digit code"
              maxLength={6}
              value={verificationCode}
              onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
              className="text-center text-2xl tracking-widest font-mono"
            />
            <p className="text-xs text-muted-foreground">
              Enter the code shown in your authenticator app
            </p>
          </div>
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button variant="outline" onClick={cancelSetup}>
            Cancel
          </Button>
          <Button 
            onClick={verifyAndEnable}
            disabled={verifying || verificationCode.length !== 6}
          >
            {verifying && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            Verify & Enable
          </Button>
        </CardFooter>
      </Card>
    )
  }

  // Default view - status and controls
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Shield className="h-5 w-5" />
          Two-Factor Authentication
        </CardTitle>
        <CardDescription>
          Add an extra layer of security to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Status */}
        <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
          <div className="flex items-center gap-3">
            {status.enabled ? (
              <>
                <CheckCircle2 className="h-5 w-5 text-green-500" />
                <div>
                  <p className="font-medium">2FA is enabled</p>
                  {status.backupCodesRemaining !== undefined && (
                    <p className="text-sm text-muted-foreground">
                      {status.backupCodesRemaining} backup codes remaining
                    </p>
                  )}
                </div>
              </>
            ) : (
              <>
                <Shield className="h-5 w-5 text-muted-foreground" />
                <div>
                  <p className="font-medium">2FA is disabled</p>
                  <p className="text-sm text-muted-foreground">
                    Your account is not protected
                  </p>
                </div>
              </>
            )}
          </div>
          <Badge variant={status.enabled ? 'default' : 'secondary'}>
            {status.enabled ? 'Protected' : 'Not Protected'}
          </Badge>
        </div>

        {/* Quick actions */}
        {status.enabled && (
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={regenerateBackupCodes}
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Regenerate Backup Codes
            </Button>
          </div>
        )}
      </CardContent>
      <CardFooter>
        {status.enabled ? (
          <Button 
            variant="destructive" 
            onClick={() => setShowDisableConfirm(true)}
          >
            Disable 2FA
          </Button>
        ) : (
          <Button onClick={startSetup}>
            <Shield className="h-4 w-4 mr-2" />
            Enable 2FA
          </Button>
        )}
      </CardFooter>
    </Card>
  )
}

// MFA Verification Component (for login)
interface MFAVerifyProps {
  userId: string
  onVerify: () => void
  onUseBackupCode?: () => void
}

export function MFAVerify({ userId, onVerify, onUseBackupCode }: MFAVerifyProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [useBackupCode, setUseBackupCode] = useState(false)
  const [error, setError] = useState('')

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setError('Please enter a valid code')
      return
    }

    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/security/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          code,
          isBackupCode: useBackupCode,
        }),
      })

      if (response.ok) {
        onVerify()
      } else {
        const data = await response.json()
        setError(data.message || 'Invalid code')
      }
    } catch (error) {
      setError('Failed to verify code')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <CardTitle>Two-Factor Authentication</CardTitle>
        <CardDescription>
          {useBackupCode 
            ? 'Enter one of your backup codes'
            : 'Enter the code from your authenticator app'
          }
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Input
            type="text"
            placeholder={useBackupCode ? "Backup code" : "000000"}
            value={code}
            onChange={(e) => setCode(e.target.value.toUpperCase())}
            maxLength={useBackupCode ? 9 : 6}
            className="text-center text-2xl tracking-widest font-mono"
          />
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="text-center">
          <button
            type="button"
            className="text-sm text-primary hover:underline"
            onClick={() => {
              setUseBackupCode(!useBackupCode)
              setCode('')
              setError('')
            }}
          >
            {useBackupCode ? 'Use authenticator code' : 'Use backup code instead'}
          </button>
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          className="w-full" 
          onClick={handleVerify}
          disabled={loading || !code}
        >
          {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Verify
        </Button>
      </CardFooter>
    </Card>
  )
}

export default MFASetup
