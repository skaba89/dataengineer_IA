/**
 * DataSphere Innovation - Email Templates
 * Transactional email templates in French and English
 */

import * as React from 'react'

// ==========================================
// Types
// ==========================================

export type EmailLocale = 'fr' | 'en'

export interface BaseEmailProps {
  locale?: EmailLocale
  userName: string
  companyName?: string
}

export interface WelcomeEmailProps extends BaseEmailProps {
  loginUrl: string
  supportEmail: string
}

export interface VerificationEmailProps extends BaseEmailProps {
  verificationUrl: string
  verificationCode?: string
  expiresIn: string
}

export interface PasswordResetEmailProps extends BaseEmailProps {
  resetUrl: string
  expiresIn: string
}

export interface SubscriptionCreatedEmailProps extends BaseEmailProps {
  planName: string
  amount: string
  billingCycle: string
  nextBillingDate: string
  manageUrl: string
  features: string[]
}

export interface SubscriptionCancelledEmailProps extends BaseEmailProps {
  planName: string
  endDate: string
  reactivateUrl: string
  feedbackUrl?: string
}

export interface PaymentFailedEmailProps extends BaseEmailProps {
  amount: string
  attemptDate: string
  retryDate?: string
  updatePaymentUrl: string
  invoiceNumber?: string
}

export interface ProjectCompletedEmailProps extends BaseEmailProps {
  projectName: string
  completionDate: string
  projectUrl: string
  summary: {
    duration: string
    recordsProcessed?: number
    successRate?: number
  }
}

export interface AgentExecutionEmailProps extends BaseEmailProps {
  agentName: string
  executionId: string
  status: 'success' | 'failed' | 'partial'
  startTime: string
  endTime: string
  duration: string
  detailsUrl: string
  metrics?: {
    recordsProcessed?: number
    successCount?: number
    errorCount?: number
  }
  errorMessage?: string
}

export interface InvoiceEmailProps extends BaseEmailProps {
  invoiceNumber: string
  amount: string
  currency: string
  dueDate: string
  invoiceUrl: string
  items: Array<{
    description: string
    quantity?: number
    unitPrice?: string
    total: string
  }>
}

// ==========================================
// Email Layout Component
// ==========================================

const translations = {
  fr: {
    footer: {
      copyright: '© 2024 DataSphere Innovation. Tous droits réservés.',
      support: 'Contacter le support',
      unsubscribe: 'Se désinscrire',
      privacy: 'Politique de confidentialité',
      terms: 'Conditions d\'utilisation'
    },
    poweredBy: 'Propulsé par DataSphere Innovation'
  },
  en: {
    footer: {
      copyright: '© 2024 DataSphere Innovation. All rights reserved.',
      support: 'Contact support',
      unsubscribe: 'Unsubscribe',
      privacy: 'Privacy Policy',
      terms: 'Terms of Service'
    },
    poweredBy: 'Powered by DataSphere Innovation'
  }
}

interface EmailLayoutProps {
  children: React.ReactNode
  locale?: EmailLocale
  previewText?: string
}

export function EmailLayout({ children, locale = 'fr', previewText }: EmailLayoutProps) {
  const t = translations[locale]
  
  return (
    <html lang={locale}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        {previewText && <meta name="description" content={previewText} />}
        <style>{`
          /* Reset styles */
          body, html { margin: 0; padding: 0; width: 100% !important; height: 100% !important; }
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; }
          
          /* Container styles */
          .email-container { max-width: 600px; margin: 0 auto; padding: 20px; }
          
          /* Header styles */
          .email-header { background: linear-gradient(135deg, #1F4E79 0%, #2E75B6 100%); padding: 40px 30px; text-align: center; }
          .email-header h1 { margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; }
          .email-header p { margin: 10px 0 0; color: rgba(255, 255, 255, 0.9); font-size: 16px; }
          
          /* Content styles */
          .email-content { background: #f8fafc; padding: 40px 30px; }
          .email-content h2 { margin: 0 0 20px; color: #1F4E79; font-size: 24px; }
          .email-content p { margin: 0 0 16px; color: #374151; font-size: 16px; line-height: 1.6; }
          .email-content ul { margin: 16px 0; padding-left: 24px; }
          .email-content li { margin: 8px 0; color: #374151; font-size: 16px; }
          
          /* Button styles */
          .email-button { display: inline-block; padding: 14px 32px; margin: 20px 0; font-size: 16px; font-weight: 600; text-decoration: none; border-radius: 8px; }
          .email-button-primary { background: #1F4E79; color: #ffffff !important; }
          .email-button-success { background: #10B981; color: #ffffff !important; }
          .email-button-danger { background: #DC2626; color: #ffffff !important; }
          .email-button-warning { background: #F59E0B; color: #ffffff !important; }
          
          /* Alert box styles */
          .alert-box { padding: 20px; border-radius: 8px; margin: 20px 0; }
          .alert-warning { background: #FEF3C7; border-left: 4px solid #F59E0B; }
          .alert-danger { background: #FEE2E2; border-left: 4px solid #DC2626; }
          .alert-success { background: #D1FAE5; border-left: 4px solid #10B981; }
          .alert-info { background: #DBEAFE; border-left: 4px solid #3B82F6; }
          
          /* Card styles */
          .info-card { background: #ffffff; border-radius: 12px; padding: 24px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); }
          .info-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
          .info-row:last-child { border-bottom: none; }
          .info-label { color: #6B7280; font-size: 14px; }
          .info-value { color: #111827; font-size: 14px; font-weight: 600; }
          
          /* Code styles */
          .code-box { background: #F3F4F6; padding: 16px 24px; border-radius: 8px; font-family: 'Monaco', 'Menlo', monospace; font-size: 20px; letter-spacing: 4px; text-align: center; margin: 20px 0; }
          
          /* Metrics grid */
          .metrics-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin: 20px 0; }
          .metric-card { background: #ffffff; padding: 20px; border-radius: 12px; text-align: center; }
          .metric-value { font-size: 28px; font-weight: 700; color: #1F4E79; margin: 0; }
          .metric-label { font-size: 12px; color: #6B7280; margin: 4px 0 0; }
          
          /* Footer styles */
          .email-footer { text-align: center; padding: 30px 20px; background: #ffffff; border-top: 1px solid #e5e7eb; }
          .email-footer p { margin: 0 0 8px; color: #6B7280; font-size: 14px; }
          .email-footer a { color: #1F4E79; text-decoration: none; }
          .email-footer .social-links { margin: 16px 0; }
          .email-footer .social-links a { margin: 0 8px; }
          
          /* Tracking pixel */
          .tracking-pixel { width: 1px; height: 1px; }
        `}</style>
      </head>
      <body style={{ margin: 0, padding: 0, backgroundColor: '#f8fafc' }}>
        <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={{ backgroundColor: '#f8fafc' }}>
          <tbody>
            <tr>
              <td align="center" style={{ padding: '20px 0' }}>
                <table role="presentation" width="600" cellPadding="0" cellSpacing="0" style={{ borderRadius: '16px', overflow: 'hidden', backgroundColor: '#ffffff', boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)' }}>
                  <tbody>
                    {children}
                  </tbody>
                </table>
                
                {/* Footer */}
                <table role="presentation" width="600" cellPadding="0" cellSpacing="0" style={{ marginTop: '20px' }}>
                  <tbody>
                    <tr>
                      <td align="center" style={{ padding: '20px' }}>
                        <p style={{ margin: 0, color: '#6B7280', fontSize: '12px' }}>
                          {t.footer.copyright}
                        </p>
                        <p style={{ margin: '8px 0 0', fontSize: '12px' }}>
                          <a href="https://datasphere-innovation.fr/support" style={{ color: '#1F4E79', textDecoration: 'none' }}>
                            {t.footer.support}
                          </a>
                          {' • '}
                          <a href="https://datasphere-innovation.fr/privacy" style={{ color: '#1F4E79', textDecoration: 'none' }}>
                            {t.footer.privacy}
                          </a>
                          {' • '}
                          <a href="https://datasphere-innovation.fr/terms" style={{ color: '#1F4E79', textDecoration: 'none' }}>
                            {t.footer.terms}
                          </a>
                        </p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
            </tr>
          </tbody>
        </table>
      </body>
    </html>
  )
}

// ==========================================
// Header Component
// ==========================================

interface HeaderProps {
  title: string
  subtitle?: string
  logoUrl?: string
}

export function EmailHeader({ title, subtitle, logoUrl }: HeaderProps) {
  return (
    <tr>
      <td style={{ background: 'linear-gradient(135deg, #1F4E79 0%, #2E75B6 100%)', padding: '40px 30px', textAlign: 'center' }}>
        {logoUrl && (
          <img src={logoUrl} alt="DataSphere Innovation" width="180" style={{ marginBottom: '20px' }} />
        )}
        <h1 style={{ margin: 0, color: '#ffffff', fontSize: '28px', fontWeight: '700' }}>
          {title}
        </h1>
        {subtitle && (
          <p style={{ margin: '10px 0 0', color: 'rgba(255, 255, 255, 0.9)', fontSize: '16px' }}>
            {subtitle}
          </p>
        )}
      </td>
    </tr>
  )
}

// ==========================================
// Content Components
// ==========================================

interface ContentProps {
  children: React.ReactNode
}

export function EmailContent({ children }: ContentProps) {
  return (
    <tr>
      <td style={{ background: '#f8fafc', padding: '40px 30px' }}>
        {children}
      </td>
    </tr>
  )
}

interface ButtonProps {
  href: string
  variant?: 'primary' | 'success' | 'danger' | 'warning'
  children: React.ReactNode
}

export function EmailButton({ href, variant = 'primary', children }: ButtonProps) {
  const colors = {
    primary: '#1F4E79',
    success: '#10B981',
    danger: '#DC2626',
    warning: '#F59E0B'
  }
  
  return (
    <table role="presentation" cellPadding="0" cellSpacing="0" style={{ margin: '20px 0' }}>
      <tbody>
        <tr>
          <td style={{ borderRadius: '8px', background: colors[variant] }}>
            <a href={href} style={{ display: 'inline-block', padding: '14px 32px', color: '#ffffff', fontSize: '16px', fontWeight: '600', textDecoration: 'none' }}>
              {children}
            </a>
          </td>
        </tr>
      </tbody>
    </table>
  )
}

interface AlertBoxProps {
  variant?: 'warning' | 'danger' | 'success' | 'info'
  children: React.ReactNode
}

export function AlertBox({ variant = 'info', children }: AlertBoxProps) {
  const styles = {
    warning: { bg: '#FEF3C7', border: '#F59E0B' },
    danger: { bg: '#FEE2E2', border: '#DC2626' },
    success: { bg: '#D1FAE5', border: '#10B981' },
    info: { bg: '#DBEAFE', border: '#3B82F6' }
  }
  
  const style = styles[variant]
  
  return (
    <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={{ margin: '20px 0' }}>
      <tbody>
        <tr>
          <td style={{ background: style.bg, borderLeft: `4px solid ${style.border}`, padding: '20px', borderRadius: '8px' }}>
            {children}
          </td>
        </tr>
      </tbody>
    </table>
  )
}

interface InfoCardProps {
  rows: Array<{ label: string; value: string }>
}

export function InfoCard({ rows }: InfoCardProps) {
  return (
    <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={{ margin: '20px 0', background: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
      <tbody>
        <tr>
          <td style={{ padding: '24px' }}>
            {rows.map((row, index) => (
              <table key={index} role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={{ borderBottom: index < rows.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                <tbody>
                  <tr>
                    <td style={{ padding: '12px 0', color: '#6B7280', fontSize: '14px' }}>
                      {row.label}
                    </td>
                    <td align="right" style={{ padding: '12px 0', color: '#111827', fontSize: '14px', fontWeight: 600 }}>
                      {row.value}
                    </td>
                  </tr>
                </tbody>
              </table>
            ))}
          </td>
        </tr>
      </tbody>
    </table>
  )
}

// ==========================================
// WELCOME EMAIL
// ==========================================

const welcomeTranslations = {
  fr: {
    title: 'Bienvenue sur DataSphere Innovation',
    subtitle: 'Votre plateforme d\'ingénierie de données',
    greeting: 'Bienvenue',
    intro: 'Merci de rejoindre DataSphere Innovation ! Nous sommes ravis de vous accompagner dans la transformation de vos opérations data avec l\'automatisation pilotée par l\'IA.',
    nextSteps: 'Prochaines étapes',
    steps: [
      'Configurez votre premier projet data',
      'Connectez vos sources de données',
      'Explorez nos agents IA spécialisés',
      'Consultez notre documentation'
    ],
    cta: 'Accéder au tableau de bord',
    support: 'Des questions ? Notre équipe support est disponible à'
  },
  en: {
    title: 'Welcome to DataSphere Innovation',
    subtitle: 'Your data engineering platform',
    greeting: 'Welcome',
    intro: 'Thank you for joining DataSphere Innovation! We\'re excited to help you transform your data operations with AI-powered automation.',
    nextSteps: 'Next Steps',
    steps: [
      'Set up your first data project',
      'Connect your data sources',
      'Explore our specialized AI agents',
      'Check out our documentation'
    ],
    cta: 'Access Dashboard',
    support: 'Questions? Our support team is available at'
  }
}

export function WelcomeEmail({ locale = 'fr', userName, loginUrl, supportEmail }: WelcomeEmailProps) {
  const t = welcomeTranslations[locale]
  
  return (
    <EmailLayout previewText={t.title}>
      <EmailHeader title={t.title} subtitle={t.subtitle} />
      <EmailContent>
        <h2 style={{ margin: '0 0 20px', color: '#1F4E79', fontSize: '24px' }}>
          {t.greeting} {userName} 👋
        </h2>
        <p style={{ margin: '0 0 16px', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
          {t.intro}
        </p>
        
        <h3 style={{ margin: '24px 0 12px', color: '#1F4E79', fontSize: '18px' }}>
          {t.nextSteps}
        </h3>
        <ul style={{ margin: '0 0 24px', paddingLeft: '24px' }}>
          {t.steps.map((step, index) => (
            <li key={index} style={{ margin: '8px 0', color: '#374151', fontSize: '16px' }}>
              {step}
            </li>
          ))}
        </ul>
        
        <EmailButton href={loginUrl} variant="primary">
          {t.cta}
        </EmailButton>
        
        <p style={{ margin: '24px 0 0', color: '#6B7280', fontSize: '14px' }}>
          {t.support} <a href={`mailto:${supportEmail}`} style={{ color: '#1F4E79' }}>{supportEmail}</a>
        </p>
      </EmailContent>
    </EmailLayout>
  )
}

// ==========================================
// VERIFICATION EMAIL
// ==========================================

const verificationTranslations = {
  fr: {
    title: 'Vérifiez votre adresse email',
    subtitle: 'Confirmation de compte',
    greeting: 'Bonjour',
    intro: 'Veuillez confirmer votre adresse email pour activer votre compte DataSphere Innovation.',
    clickButton: 'Cliquez sur le bouton ci-dessous pour vérifier votre email :',
    orCopy: 'Ou copiez ce lien dans votre navigateur :',
    expires: 'Ce lien expire dans',
    codeLabel: 'Votre code de vérification :',
    ignore: 'Si vous n\'avez pas créé de compte, vous pouvez ignorer cet email.',
    cta: 'Vérifier mon email'
  },
  en: {
    title: 'Verify your email address',
    subtitle: 'Account confirmation',
    greeting: 'Hello',
    intro: 'Please confirm your email address to activate your DataSphere Innovation account.',
    clickButton: 'Click the button below to verify your email:',
    orCopy: 'Or copy this link into your browser:',
    expires: 'This link expires in',
    codeLabel: 'Your verification code:',
    ignore: 'If you didn\'t create an account, you can safely ignore this email.',
    cta: 'Verify Email'
  }
}

export function VerificationEmail({ locale = 'fr', userName, verificationUrl, verificationCode, expiresIn }: VerificationEmailProps) {
  const t = verificationTranslations[locale]
  
  return (
    <EmailLayout previewText={t.title}>
      <EmailHeader title={t.title} subtitle={t.subtitle} />
      <EmailContent>
        <h2 style={{ margin: '0 0 20px', color: '#1F4E79', fontSize: '24px' }}>
          {t.greeting} {userName},
        </h2>
        <p style={{ margin: '0 0 16px', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
          {t.intro}
        </p>
        
        <p style={{ margin: '20px 0 12px', color: '#374151', fontSize: '16px' }}>
          {t.clickButton}
        </p>
        
        <EmailButton href={verificationUrl} variant="primary">
          {t.cta}
        </EmailButton>
        
        {verificationCode && (
          <>
            <p style={{ margin: '20px 0 12px', color: '#374151', fontSize: '16px' }}>
              {t.codeLabel}
            </p>
            <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
              <tbody>
                <tr>
                  <td style={{ background: '#F3F4F6', padding: '16px 24px', borderRadius: '8px', fontFamily: 'Monaco, Menlo, monospace', fontSize: '24px', letterSpacing: '4px', textAlign: 'center' }}>
                    {verificationCode}
                  </td>
                </tr>
              </tbody>
            </table>
          </>
        )}
        
        <AlertBox variant="warning">
          <p style={{ margin: 0, color: '#92400E', fontSize: '14px' }}>
            ⏱️ {t.expires} <strong>{expiresIn}</strong>
          </p>
        </AlertBox>
        
        <p style={{ margin: '24px 0 0', color: '#6B7280', fontSize: '14px' }}>
          {t.orCopy}
        </p>
        <p style={{ margin: '8px 0 0', color: '#1F4E79', fontSize: '12px', wordBreak: 'break-all' }}>
          {verificationUrl}
        </p>
        
        <p style={{ margin: '24px 0 0', color: '#6B7280', fontSize: '14px' }}>
          {t.ignore}
        </p>
      </EmailContent>
    </EmailLayout>
  )
}

// ==========================================
// PASSWORD RESET EMAIL
// ==========================================

const passwordResetTranslations = {
  fr: {
    title: 'Réinitialisation du mot de passe',
    subtitle: 'Demande de réinitialisation',
    greeting: 'Bonjour',
    intro: 'Nous avons reçu une demande de réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe :',
    security: 'Avis de sécurité : Si vous n\'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité. Votre mot de passe actuel reste inchangé.',
    expires: 'Ce lien expire dans',
    cta: 'Réinitialiser le mot de passe',
    ignore: 'Si vous n\'avez pas fait cette demande, veuillez contacter notre support.'
  },
  en: {
    title: 'Password Reset Request',
    subtitle: 'Reset your password',
    greeting: 'Hello',
    intro: 'We received a request to reset your password. Click the button below to create a new password:',
    security: 'Security Notice: If you didn\'t request this reset, you can safely ignore this email. Your current password remains unchanged.',
    expires: 'This link expires in',
    cta: 'Reset Password',
    ignore: 'If you didn\'t make this request, please contact our support.'
  }
}

export function PasswordResetEmail({ locale = 'fr', userName, resetUrl, expiresIn }: PasswordResetEmailProps) {
  const t = passwordResetTranslations[locale]
  
  return (
    <EmailLayout previewText={t.title}>
      <EmailHeader title={t.title} subtitle={t.subtitle} />
      <EmailContent>
        <h2 style={{ margin: '0 0 20px', color: '#DC2626', fontSize: '24px' }}>
          {t.greeting} {userName},
        </h2>
        <p style={{ margin: '0 0 16px', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
          {t.intro}
        </p>
        
        <EmailButton href={resetUrl} variant="danger">
          {t.cta}
        </EmailButton>
        
        <AlertBox variant="warning">
          <p style={{ margin: 0, color: '#374151', fontSize: '14px' }}>
            ⏱️ {t.expires} <strong>{expiresIn}</strong>
          </p>
        </AlertBox>
        
        <AlertBox variant="info">
          <p style={{ margin: 0, color: '#374151', fontSize: '14px' }}>
            🔒 {t.security}
          </p>
        </AlertBox>
        
        <p style={{ margin: '24px 0 0', color: '#6B7280', fontSize: '14px' }}>
          {t.ignore}
        </p>
      </EmailContent>
    </EmailLayout>
  )
}

// ==========================================
// SUBSCRIPTION CREATED EMAIL
// ==========================================

const subscriptionCreatedTranslations = {
  fr: {
    title: 'Bienvenue dans',
    subtitle: 'Votre abonnement est activé',
    greeting: 'Félicitations',
    intro: 'Merci de souscrire à l\'offre {planName} ! Votre abonnement est maintenant actif.',
    details: 'Détails de l\'abonnement',
    plan: 'Forfait',
    amount: 'Montant',
    cycle: 'Cycle de facturation',
    nextBilling: 'Prochaine facturation',
    features: 'Vos avantages inclus',
    cta: 'Gérer mon abonnement',
    support: 'Des questions ? Notre équipe est disponible à'
  },
  en: {
    title: 'Welcome to',
    subtitle: 'Your subscription is active',
    greeting: 'Congratulations',
    intro: 'Thank you for subscribing to the {planName} plan! Your subscription is now active.',
    details: 'Subscription Details',
    plan: 'Plan',
    amount: 'Amount',
    cycle: 'Billing Cycle',
    nextBilling: 'Next Billing Date',
    features: 'Your included benefits',
    cta: 'Manage Subscription',
    support: 'Questions? Our team is available at'
  }
}

export function SubscriptionCreatedEmail({ locale = 'fr', userName, planName, amount, billingCycle, nextBillingDate, manageUrl, features }: SubscriptionCreatedEmailProps) {
  const t = subscriptionCreatedTranslations[locale]
  
  return (
    <EmailLayout previewText={`${t.title} ${planName}`}>
      <EmailHeader title={`${t.title} ${planName}`} subtitle={t.subtitle} />
      <EmailContent>
        <h2 style={{ margin: '0 0 20px', color: '#10B981', fontSize: '24px' }}>
          🎉 {t.greeting} {userName} !
        </h2>
        <p style={{ margin: '0 0 16px', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
          {t.intro.replace('{planName}', planName)}
        </p>
        
        <h3 style={{ margin: '24px 0 12px', color: '#1F4E79', fontSize: '18px' }}>
          {t.details}
        </h3>
        
        <InfoCard rows={[
          { label: t.plan, value: planName },
          { label: t.amount, value: amount },
          { label: t.cycle, value: billingCycle },
          { label: t.nextBilling, value: nextBillingDate }
        ]} />
        
        <h3 style={{ margin: '24px 0 12px', color: '#1F4E79', fontSize: '18px' }}>
          {t.features}
        </h3>
        <ul style={{ margin: '0 0 24px', paddingLeft: '24px' }}>
          {features.map((feature, index) => (
            <li key={index} style={{ margin: '8px 0', color: '#374151', fontSize: '16px' }}>
              ✅ {feature}
            </li>
          ))}
        </ul>
        
        <EmailButton href={manageUrl} variant="success">
          {t.cta}
        </EmailButton>
      </EmailContent>
    </EmailLayout>
  )
}

// ==========================================
// SUBSCRIPTION CANCELLED EMAIL
// ==========================================

const subscriptionCancelledTranslations = {
  fr: {
    title: 'Annulation de votre abonnement',
    subtitle: 'Confirmation d\'annulation',
    greeting: 'Bonjour',
    intro: 'Votre abonnement {planName} a été annulé. Vous pourrez continuer à utiliser nos services jusqu\'au {endDate}.',
    details: 'Détails de l\'annulation',
    plan: 'Forfait annulé',
    endDate: 'Date de fin d\'accès',
    feedback: 'Nous serions reconnaissants de connaître la raison de votre départ pour améliorer nos services.',
    cta: 'Réactiver mon abonnement',
    feedbackCta: 'Donner mon avis',
    sorry: 'Nous sommes désolés de vous voir partir.'
  },
  en: {
    title: 'Subscription Cancelled',
    subtitle: 'Cancellation confirmation',
    greeting: 'Hello',
    intro: 'Your {planName} subscription has been cancelled. You will continue to have access until {endDate}.',
    details: 'Cancellation Details',
    plan: 'Cancelled Plan',
    endDate: 'Access End Date',
    feedback: 'We would appreciate knowing why you\'re leaving to help us improve our services.',
    cta: 'Reactivate Subscription',
    feedbackCta: 'Give Feedback',
    sorry: 'We\'re sorry to see you go.'
  }
}

export function SubscriptionCancelledEmail({ locale = 'fr', userName, planName, endDate, reactivateUrl, feedbackUrl }: SubscriptionCancelledEmailProps) {
  const t = subscriptionCancelledTranslations[locale]
  
  return (
    <EmailLayout previewText={t.title}>
      <EmailHeader title={t.title} subtitle={t.subtitle} />
      <EmailContent>
        <h2 style={{ margin: '0 0 20px', color: '#1F4E79', fontSize: '24px' }}>
          {t.greeting} {userName},
        </h2>
        <p style={{ margin: '0 0 16px', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
          {t.intro.replace('{planName}', planName).replace('{endDate}', endDate)}
        </p>
        
        <InfoCard rows={[
          { label: t.plan, value: planName },
          { label: t.endDate, value: endDate }
        ]} />
        
        <AlertBox variant="info">
          <p style={{ margin: 0, color: '#374151', fontSize: '14px' }}>
            😢 {t.sorry}
          </p>
        </AlertBox>
        
        <EmailButton href={reactivateUrl} variant="primary">
          {t.cta}
        </EmailButton>
        
        {feedbackUrl && (
          <p style={{ margin: '16px 0 0', color: '#6B7280', fontSize: '14px', textAlign: 'center' }}>
            <a href={feedbackUrl} style={{ color: '#1F4E79' }}>{t.feedbackCta}</a> - {t.feedback}
          </p>
        )}
      </EmailContent>
    </EmailLayout>
  )
}

// ==========================================
// PAYMENT FAILED EMAIL
// ==========================================

const paymentFailedTranslations = {
  fr: {
    title: 'Échec de paiement',
    subtitle: 'Action requise',
    greeting: 'Bonjour',
    intro: 'Nous n\'avons pas pu traiter votre paiement de {amount}. Votre abonnement risque d\'être suspendu si le problème persiste.',
    details: 'Détails de la tentative',
    amount: 'Montant',
    date: 'Date de tentative',
    invoice: 'Facture',
    retry: 'Nouvelle tentative',
    reasons: 'Causes possibles : carte expirée, fonds insuffisants, ou restriction bancaire.',
    cta: 'Mettre à jour le paiement',
    support: 'Pour toute question, contactez notre support.'
  },
  en: {
    title: 'Payment Failed',
    subtitle: 'Action required',
    greeting: 'Hello',
    intro: 'We couldn\'t process your payment of {amount}. Your subscription may be suspended if the issue persists.',
    details: 'Attempt Details',
    amount: 'Amount',
    date: 'Attempt Date',
    invoice: 'Invoice',
    retry: 'Retry Date',
    reasons: 'Possible reasons: expired card, insufficient funds, or bank restriction.',
    cta: 'Update Payment Method',
    support: 'For any questions, contact our support.'
  }
}

export function PaymentFailedEmail({ locale = 'fr', userName, amount, attemptDate, retryDate, updatePaymentUrl, invoiceNumber }: PaymentFailedEmailProps) {
  const t = paymentFailedTranslations[locale]
  
  const rows = [
    { label: t.amount, value: amount },
    { label: t.date, value: attemptDate }
  ]
  
  if (invoiceNumber) {
    rows.push({ label: t.invoice, value: invoiceNumber })
  }
  
  if (retryDate) {
    rows.push({ label: t.retry, value: retryDate })
  }
  
  return (
    <EmailLayout previewText={t.title}>
      <EmailHeader title={t.title} subtitle={t.subtitle} />
      <EmailContent>
        <h2 style={{ margin: '0 0 20px', color: '#DC2626', fontSize: '24px' }}>
          ⚠️ {t.greeting} {userName},
        </h2>
        <p style={{ margin: '0 0 16px', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
          {t.intro.replace('{amount}', amount)}
        </p>
        
        <InfoCard rows={rows} />
        
        <AlertBox variant="danger">
          <p style={{ margin: 0, color: '#991B1B', fontSize: '14px' }}>
            💳 {t.reasons}
          </p>
        </AlertBox>
        
        <EmailButton href={updatePaymentUrl} variant="danger">
          {t.cta}
        </EmailButton>
        
        <p style={{ margin: '16px 0 0', color: '#6B7280', fontSize: '14px' }}>
          {t.support}
        </p>
      </EmailContent>
    </EmailLayout>
  )
}

// ==========================================
// PROJECT COMPLETED EMAIL
// ==========================================

const projectCompletedTranslations = {
  fr: {
    title: 'Projet terminé',
    subtitle: 'Rapport de complétion',
    greeting: 'Bonjour',
    intro: 'Votre projet "{projectName}" a été terminé avec succès le {date}.',
    summary: 'Résumé du projet',
    duration: 'Durée',
    records: 'Enregistrements traités',
    successRate: 'Taux de réussite',
    cta: 'Voir le projet',
    downloadReport: 'Télécharger le rapport'
  },
  en: {
    title: 'Project Completed',
    subtitle: 'Completion report',
    greeting: 'Hello',
    intro: 'Your project "{projectName}" has been completed successfully on {date}.',
    summary: 'Project Summary',
    duration: 'Duration',
    records: 'Records Processed',
    successRate: 'Success Rate',
    cta: 'View Project',
    downloadReport: 'Download Report'
  }
}

export function ProjectCompletedEmail({ locale = 'fr', userName, projectName, completionDate, projectUrl, summary }: ProjectCompletedEmailProps) {
  const t = projectCompletedTranslations[locale]
  
  return (
    <EmailLayout previewText={t.title}>
      <EmailHeader title={t.title} subtitle={t.subtitle} />
      <EmailContent>
        <h2 style={{ margin: '0 0 20px', color: '#10B981', fontSize: '24px' }}>
          ✅ {t.greeting} {userName},
        </h2>
        <p style={{ margin: '0 0 16px', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
          {t.intro.replace('{projectName}', projectName).replace('{date}', completionDate)}
        </p>
        
        <h3 style={{ margin: '24px 0 12px', color: '#1F4E79', fontSize: '18px' }}>
          📊 {t.summary}
        </h3>
        
        <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={{ margin: '20px 0' }}>
          <tbody>
            <tr>
              <td style={{ width: '33%', padding: '10px' }}>
                <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={{ background: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                  <tbody>
                    <tr>
                      <td align="center" style={{ padding: '20px' }}>
                        <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#1F4E79' }}>{summary.duration}</p>
                        <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6B7280' }}>{t.duration}</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </td>
              {summary.recordsProcessed !== undefined && (
                <td style={{ width: '33%', padding: '10px' }}>
                  <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={{ background: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                    <tbody>
                      <tr>
                        <td align="center" style={{ padding: '20px' }}>
                          <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#1F4E79' }}>{summary.recordsProcessed.toLocaleString()}</p>
                          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6B7280' }}>{t.records}</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              )}
              {summary.successRate !== undefined && (
                <td style={{ width: '33%', padding: '10px' }}>
                  <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={{ background: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                    <tbody>
                      <tr>
                        <td align="center" style={{ padding: '20px' }}>
                          <p style={{ margin: 0, fontSize: '28px', fontWeight: 700, color: '#10B981' }}>{summary.successRate}%</p>
                          <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6B7280' }}>{t.successRate}</p>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                </td>
              )}
            </tr>
          </tbody>
        </table>
        
        <EmailButton href={projectUrl} variant="success">
          {t.cta}
        </EmailButton>
      </EmailContent>
    </EmailLayout>
  )
}

// ==========================================
// AGENT EXECUTION EMAIL
// ==========================================

const agentExecutionTranslations = {
  fr: {
    title: 'Rapport d\'exécution Agent',
    subtitle: 'Rapport d\'exécution',
    success: 'Réussi',
    failed: 'Échoué',
    partial: 'Partiel',
    greeting: 'Bonjour',
    intro: 'L\'agent {agentName} a terminé son exécution.',
    details: 'Détails de l\'exécution',
    executionId: 'ID d\'exécution',
    status: 'Statut',
    startTime: 'Début',
    endTime: 'Fin',
    duration: 'Durée',
    metrics: 'Métriques',
    recordsProcessed: 'Enregistrements traités',
    successCount: 'Succès',
    errorCount: 'Erreurs',
    errorMessage: 'Message d\'erreur',
    cta: 'Voir les détails'
  },
  en: {
    title: 'Agent Execution Report',
    subtitle: 'Execution report',
    success: 'Success',
    failed: 'Failed',
    partial: 'Partial',
    greeting: 'Hello',
    intro: 'The agent {agentName} has finished executing.',
    details: 'Execution Details',
    executionId: 'Execution ID',
    status: 'Status',
    startTime: 'Start Time',
    endTime: 'End Time',
    duration: 'Duration',
    metrics: 'Metrics',
    recordsProcessed: 'Records Processed',
    successCount: 'Success',
    errorCount: 'Errors',
    errorMessage: 'Error Message',
    cta: 'View Details'
  }
}

export function AgentExecutionEmail({ locale = 'fr', userName, agentName, executionId, status, startTime, endTime, duration, detailsUrl, metrics, errorMessage }: AgentExecutionEmailProps) {
  const t = agentExecutionTranslations[locale]
  
  const statusColors = {
    success: '#10B981',
    failed: '#DC2626',
    partial: '#F59E0B'
  }
  
  const statusLabels = {
    success: t.success,
    failed: t.failed,
    partial: t.partial
  }
  
  return (
    <EmailLayout previewText={t.title}>
      <EmailHeader 
        title={t.title} 
        subtitle={`${agentName} - ${statusLabels[status]}`} 
      />
      <EmailContent>
        <h2 style={{ margin: '0 0 20px', color: '#1F4E79', fontSize: '24px' }}>
          🤖 {t.greeting} {userName},
        </h2>
        <p style={{ margin: '0 0 16px', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
          {t.intro.replace('{agentName}', agentName)}
        </p>
        
        <h3 style={{ margin: '24px 0 12px', color: '#1F4E79', fontSize: '18px' }}>
          {t.details}
        </h3>
        
        <InfoCard rows={[
          { label: t.executionId, value: executionId },
          { label: t.status, value: statusLabels[status] },
          { label: t.startTime, value: startTime },
          { label: t.endTime, value: endTime },
          { label: t.duration, value: duration }
        ]} />
        
        {metrics && (
          <>
            <h3 style={{ margin: '24px 0 12px', color: '#1F4E79', fontSize: '18px' }}>
              📈 {t.metrics}
            </h3>
            <table role="presentation" width="100%" cellPadding="0" cellSpacing="0">
              <tbody>
                <tr>
                  {metrics.recordsProcessed !== undefined && (
                    <td style={{ width: '33%', padding: '10px' }}>
                      <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={{ background: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                        <tbody>
                          <tr>
                            <td align="center" style={{ padding: '20px' }}>
                              <p style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#1F4E79' }}>{metrics.recordsProcessed.toLocaleString()}</p>
                              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6B7280' }}>{t.recordsProcessed}</p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  )}
                  {metrics.successCount !== undefined && (
                    <td style={{ width: '33%', padding: '10px' }}>
                      <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={{ background: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                        <tbody>
                          <tr>
                            <td align="center" style={{ padding: '20px' }}>
                              <p style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#10B981' }}>{metrics.successCount.toLocaleString()}</p>
                              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6B7280' }}>{t.successCount}</p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  )}
                  {metrics.errorCount !== undefined && (
                    <td style={{ width: '33%', padding: '10px' }}>
                      <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={{ background: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
                        <tbody>
                          <tr>
                            <td align="center" style={{ padding: '20px' }}>
                              <p style={{ margin: 0, fontSize: '24px', fontWeight: 700, color: '#DC2626' }}>{metrics.errorCount.toLocaleString()}</p>
                              <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#6B7280' }}>{t.errorCount}</p>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  )}
                </tr>
              </tbody>
            </table>
          </>
        )}
        
        {errorMessage && (
          <AlertBox variant="danger">
            <p style={{ margin: '0 0 8px', color: '#991B1B', fontSize: '14px', fontWeight: 600 }}>
              {t.errorMessage}:
            </p>
            <p style={{ margin: 0, color: '#991B1B', fontSize: '14px' }}>
              {errorMessage}
            </p>
          </AlertBox>
        )}
        
        <EmailButton href={detailsUrl} variant="primary">
          {t.cta}
        </EmailButton>
      </EmailContent>
    </EmailLayout>
  )
}

// ==========================================
// INVOICE EMAIL
// ==========================================

const invoiceTranslations = {
  fr: {
    title: 'Votre facture',
    subtitle: 'Facture disponible',
    greeting: 'Bonjour',
    intro: 'Veuillez trouver ci-joint votre facture n°{invoiceNumber} d\'un montant de {amount}.',
    details: 'Détails de la facture',
    invoiceNumber: 'Numéro de facture',
    amount: 'Montant total',
    dueDate: 'Date d\'échéance',
    items: 'Lignes de facturation',
    description: 'Description',
    total: 'Total',
    cta: 'Télécharger la facture',
    questions: 'Des questions ? Contactez notre équipe facturation.'
  },
  en: {
    title: 'Your Invoice',
    subtitle: 'Invoice available',
    greeting: 'Hello',
    intro: 'Please find attached your invoice #{invoiceNumber} for the amount of {amount}.',
    details: 'Invoice Details',
    invoiceNumber: 'Invoice Number',
    amount: 'Total Amount',
    dueDate: 'Due Date',
    items: 'Invoice Items',
    description: 'Description',
    total: 'Total',
    cta: 'Download Invoice',
    questions: 'Questions? Contact our billing team.'
  }
}

export function InvoiceEmail({ locale = 'fr', userName, invoiceNumber, amount, currency, dueDate, invoiceUrl, items }: InvoiceEmailProps) {
  const t = invoiceTranslations[locale]
  
  return (
    <EmailLayout previewText={`${t.title} #${invoiceNumber}`}>
      <EmailHeader title={t.title} subtitle={t.subtitle} />
      <EmailContent>
        <h2 style={{ margin: '0 0 20px', color: '#1F4E79', fontSize: '24px' }}>
          📄 {t.greeting} {userName},
        </h2>
        <p style={{ margin: '0 0 16px', color: '#374151', fontSize: '16px', lineHeight: 1.6 }}>
          {t.intro.replace('{invoiceNumber}', invoiceNumber).replace('{amount}', amount)}
        </p>
        
        <h3 style={{ margin: '24px 0 12px', color: '#1F4E79', fontSize: '18px' }}>
          {t.details}
        </h3>
        
        <InfoCard rows={[
          { label: t.invoiceNumber, value: invoiceNumber },
          { label: t.amount, value: amount },
          { label: t.dueDate, value: dueDate }
        ]} />
        
        <h3 style={{ margin: '24px 0 12px', color: '#1F4E79', fontSize: '18px' }}>
          {t.items}
        </h3>
        
        <table role="presentation" width="100%" cellPadding="0" cellSpacing="0" style={{ margin: '20px 0', background: '#ffffff', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
              <th style={{ padding: '12px 16px', textAlign: 'left', color: '#6B7280', fontSize: '12px', fontWeight: 600 }}>{t.description}</th>
              <th style={{ padding: '12px 16px', textAlign: 'right', color: '#6B7280', fontSize: '12px', fontWeight: 600 }}>{t.total}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, index) => (
              <tr key={index} style={{ borderBottom: index < items.length - 1 ? '1px solid #e5e7eb' : 'none' }}>
                <td style={{ padding: '12px 16px', color: '#374151', fontSize: '14px' }}>
                  {item.description}
                </td>
                <td style={{ padding: '12px 16px', textAlign: 'right', color: '#111827', fontSize: '14px', fontWeight: 600 }}>
                  {item.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        <EmailButton href={invoiceUrl} variant="primary">
          {t.cta}
        </EmailButton>
        
        <p style={{ margin: '16px 0 0', color: '#6B7280', fontSize: '14px' }}>
          {t.questions}
        </p>
      </EmailContent>
    </EmailLayout>
  )
}

// ==========================================
// TRACKING PIXEL
// ==========================================

interface TrackingPixelProps {
  trackingId: string
  trackingUrl?: string
}

export function TrackingPixel({ trackingId, trackingUrl = 'https://api.datasphere-innovation.fr/email/track' }: TrackingPixelProps) {
  return (
    <img 
      src={`${trackingUrl}?id=${trackingId}`} 
      alt="" 
      width="1" 
      height="1" 
      style={{ width: '1px', height: '1px', border: 0 }} 
    />
  )
}

// ==========================================
// EXPORT ALL TEMPLATES
// ==========================================

export const emailTemplates = {
  welcome: WelcomeEmail,
  verification: VerificationEmail,
  passwordReset: PasswordResetEmail,
  subscriptionCreated: SubscriptionCreatedEmail,
  subscriptionCancelled: SubscriptionCancelledEmail,
  paymentFailed: PaymentFailedEmail,
  projectCompleted: ProjectCompletedEmail,
  agentExecution: AgentExecutionEmail,
  invoice: InvoiceEmail
}

export type EmailTemplateType = keyof typeof emailTemplates
export type { EmailLocale as Locale }
