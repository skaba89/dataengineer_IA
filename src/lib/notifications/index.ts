// AI Data Engineering System - Email Notification Service
// Multi-provider email service with templates

export type EmailTemplate = 
  | 'welcome'
  | 'subscription_created'
  | 'subscription_cancelled'
  | 'payment_failed'
  | 'invoice_paid'
  | 'project_completed'
  | 'agent_execution_complete'
  | 'data_quality_alert'
  | 'trial_ending'
  | 'password_reset'
  | 'team_invite'

export interface EmailData {
  to: string | string[]
  subject: string
  template: EmailTemplate
  data: Record<string, unknown>
  attachments?: Array<{
    filename: string
    content: Buffer | string
    contentType?: string
  }>
}

export interface EmailProvider {
  name: string
  send(email: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }>
}

// ============================================
// Email Templates
// ============================================

export const EMAIL_TEMPLATES: Record<EmailTemplate, { subject: string; html: string; text: string }> = {
  welcome: {
    subject: "Bienvenue sur AI Data Engineering System !",
    html: `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background: #0f172a; color: #e2e8f0; }
          .container { max-width: 600px; margin: 0 auto; padding: 40px 20px; }
          .header { text-align: center; margin-bottom: 40px; }
          .logo { font-size: 24px; font-weight: bold; color: #8b5cf6; }
          .content { background: #1e293b; border-radius: 12px; padding: 30px; margin-bottom: 20px; }
          .button { display: inline-block; background: #8b5cf6; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; }
          .footer { text-align: center; color: #64748b; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <div class="logo">AI Data Engineering</div>
          </div>
          <div class="content">
            <h1>Bienvenue {{name}} !</h1>
            <p>Merci de rejoindre AI Data Engineering System. Vous etes maintenant pret a transformer vos donnees en insights actionnables.</p>
            <p>Votre periode d'essai de 14 jours a commence. Voici ce que vous pouvez faire :</p>
            <ul>
              <li>Creer votre premier projet data</li>
              <li>Connecter vos sources de donnees</li>
              <li>Generer des pipelines automatiquement</li>
              <li>Explorer avec notre AI Consultant</li>
            </ul>
            <p style="text-align: center; margin-top: 30px;">
              <a href="{{dashboard_url}}" class="button">Acceder au Dashboard</a>
            </p>
          </div>
          <div class="footer">
            <p>AI Data Engineering System - La plateforme intelligente de Data Engineering</p>
          </div>
        </div>
      </body>
      </html>
    `,
    text: `Bienvenue {{name}} ! Merci de rejoindre AI Data Engineering System. Votre periode d'essai de 14 jours a commence. Connectez-vous a {{dashboard_url}} pour commencer.`
  },
  subscription_created: {
    subject: "Votre abonnement {{plan}} est actif",
    html: `<html><body><h1>Abonnement active !</h1><p>Bonjour {{name}},</p><p>Votre abonnement {{plan}} est maintenant actif a {{price}}EUR/mois.</p><p>Prochaine facturation : {{next_billing_date}}</p></body></html>`,
    text: `Abonnement active ! Bonjour {{name}}, Votre abonnement {{plan}} est maintenant actif a {{price}}EUR/mois.`
  },
  payment_failed: {
    subject: "Echec de paiement - Action requise",
    html: `<html><body><h1>Echec de paiement</h1><p>Bonjour {{name}},</p><p>Nous n'avons pas pu traiter votre paiement de {{amount}}EUR.</p><p>Raison : {{failure_reason}}</p><p>Mettez a jour votre paiement : {{billing_url}}</p></body></html>`,
    text: `Echec de paiement - Montant : {{amount}}EUR. Mettez a jour : {{billing_url}}`
  },
  invoice_paid: {
    subject: "Facture #{{invoice_number}} payee",
    html: `<html><body><h1>Facture payee</h1><p>Bonjour {{name}},</p><p>Votre facture #{{invoice_number}} de {{amount}}EUR a ete payee.</p><p>Telechargez : {{invoice_url}}</p></body></html>`,
    text: `Facture #{{invoice_number}} payee - {{amount}}EUR`
  },
  project_completed: {
    subject: "Projet {{project_name}} termine !",
    html: `<html><body><h1>Projet termine !</h1><p>Bonjour {{name}},</p><p>Votre projet {{project_name}} a ete genere avec succes.</p><p>{{pipelines_count}} pipelines, {{dashboards_count}} dashboards</p><p>Voir : {{project_url}}</p></body></html>`,
    text: `Projet {{project_name}} termine ! {{pipelines_count}} pipelines generes.`
  },
  data_quality_alert: {
    subject: "Alerte Qualite des Donnees - {{source_name}}",
    html: `<html><body><h1>Alerte Qualite</h1><p>Source : {{source_name}}</p><p>{{alert_type}} : {{alert_message}}</p></body></html>`,
    text: `Alerte Qualite - {{source_name}} : {{alert_message}}`
  },
  trial_ending: {
    subject: "Votre essai se termine dans {{days_remaining}} jours",
    html: `<html><body><h1>Essai se termine bientot</h1><p>Bonjour {{name}},</p><p>Votre periode d'essai se termine dans {{days_remaining}} jours.</p><p>Choisissez votre forfait : {{pricing_url}}</p></body></html>`,
    text: `Essai se termine dans {{days_remaining}} jours. Forfait : {{pricing_url}}`
  },
  password_reset: {
    subject: "Reinitialisation de votre mot de passe",
    html: `<html><body><h1>Reinitialisation mot de passe</h1><p>Code : {{reset_code}}</p><p>Lien : {{reset_url}}</p></body></html>`,
    text: `Code de reinitialisation : {{reset_code}}`
  },
  team_invite: {
    subject: "Invitation a rejoindre {{organization_name}}",
    html: `<html><body><h1>Invitation equipe</h1><p>{{inviter_name}} vous invite a rejoindre {{organization_name}}.</p><p>Role : {{role}}</p><p>Accepter : {{invite_url}}</p></body></html>`,
    text: `Invitation de {{inviter_name}} - Accepter : {{invite_url}}`
  },
  subscription_cancelled: {
    subject: "Confirmation d'annulation",
    html: `<html><body><h1>Abonnement annule</h1><p>Acces jusqu'au : {{access_until}}</p><p>Reactiver : {{billing_url}}</p></body></html>`,
    text: `Abonnement annule. Acces jusqu'au {{access_until}}`
  },
  agent_execution_complete: {
    subject: "Execution {{agent_type}} terminee",
    html: `<html><body><h1>Execution terminee</h1><p>Agent : {{agent_type}}</p><p>Statut : {{status}}</p><p>Duree : {{duration}}</p></body></html>`,
    text: `Agent {{agent_type}} - {{status}} - {{duration}}`
  }
}

// ============================================
// Email Service
// ============================================

class EmailService {
  private provider: EmailProvider | null = null

  constructor() {
    this.initializeProvider()
  }

  private initializeProvider() {
    if (process.env.RESEND_API_KEY) {
      this.provider = new ResendProvider(process.env.RESEND_API_KEY)
    } else if (process.env.SENDGRID_API_KEY) {
      this.provider = new SendGridProvider(process.env.SENDGRID_API_KEY)
    } else {
      this.provider = new ConsoleProvider()
    }
  }

  async send(email: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const html = this.renderTemplate(email.template, email.data)
      const text = this.renderTextTemplate(email.template, email.data)

      return await this.provider!.send({
        ...email,
        subject: this.renderSubject(email.template, email.data),
        template: email.template,
        data: { ...email.data, rendered_html: html, rendered_text: text }
      })
    } catch (error) {
      console.error('Email send error:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }

  private renderTemplate(template: EmailTemplate, data: Record<string, unknown>): string {
    let html = EMAIL_TEMPLATES[template].html
    for (const [key, value] of Object.entries(data)) {
      html = html.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
    }
    return html
  }

  private renderTextTemplate(template: EmailTemplate, data: Record<string, unknown>): string {
    let text = EMAIL_TEMPLATES[template].text
    for (const [key, value] of Object.entries(data)) {
      text = text.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
    }
    return text
  }

  private renderSubject(template: EmailTemplate, data: Record<string, unknown>): string {
    let subject = EMAIL_TEMPLATES[template].subject
    for (const [key, value] of Object.entries(data)) {
      subject = subject.replace(new RegExp(`{{${key}}}`, 'g'), String(value))
    }
    return subject
  }

  async sendWelcome(email: string, name: string, dashboardUrl: string) {
    return this.send({ to: email, subject: '', template: 'welcome', data: { name, dashboard_url: dashboardUrl } })
  }

  async sendSubscriptionCreated(email: string, name: string, plan: string, price: number, nextBillingDate: string, billingUrl: string) {
    return this.send({ to: email, subject: '', template: 'subscription_created', data: { name, plan, price, next_billing_date: nextBillingDate, billing_url: billingUrl } })
  }

  async sendPaymentFailed(email: string, name: string, amount: number, reason: string, gracePeriodEnd: string, billingUrl: string) {
    return this.send({ to: email, subject: '', template: 'payment_failed', data: { name, amount, failure_reason: reason, grace_period_end: gracePeriodEnd, billing_url: billingUrl } })
  }

  async sendProjectCompleted(email: string, name: string, projectName: string, stats: { pipelines: number; dashboards: number; deliverables: number; duration: string }, projectUrl: string) {
    return this.send({ to: email, subject: '', template: 'project_completed', data: { name, project_name: projectName, pipelines_count: stats.pipelines, dashboards_count: stats.dashboards, deliverables_count: stats.deliverables, duration: stats.duration, project_url: projectUrl } })
  }

  async sendTrialEnding(email: string, name: string, daysRemaining: number, trialEndDate: string, pricingUrl: string) {
    return this.send({ to: email, subject: '', template: 'trial_ending', data: { name, days_remaining: daysRemaining, trial_end_date: trialEndDate, pricing_url: pricingUrl } })
  }

  async sendTeamInvite(email: string, inviterName: string, inviterEmail: string, organizationName: string, role: string, inviteUrl: string) {
    return this.send({ to: email, subject: '', template: 'team_invite', data: { inviter_name: inviterName, inviter_email: inviterEmail, organization_name: organizationName, role, invite_url: inviteUrl } })
  }
}

// Providers
class ResendProvider implements EmailProvider {
  name = 'resend'
  private apiKey: string
  constructor(apiKey: string) { this.apiKey = apiKey }

  async send(email: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: `AI Data Engineering <noreply@aidataengineering.com>`,
          to: Array.isArray(email.to) ? email.to : [email.to],
          subject: email.subject,
          html: email.data.rendered_html as string,
          text: email.data.rendered_text as string,
        }),
      })
      const data = await response.json()
      return response.ok ? { success: true, messageId: data.id } : { success: false, error: data.message }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

class SendGridProvider implements EmailProvider {
  name = 'sendgrid'
  private apiKey: string
  constructor(apiKey: string) { this.apiKey = apiKey }

  async send(email: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    try {
      const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.apiKey}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          personalizations: [{ to: Array.isArray(email.to) ? email.to.map(e => ({ email: e })) : [{ email: email.to }] }],
          from: { email: 'noreply@aidataengineering.com', name: 'AI Data Engineering' },
          subject: email.subject,
          content: [{ type: 'text/html', value: email.data.rendered_html as string }],
        }),
      })
      return response.ok ? { success: true, messageId: response.headers.get('X-Message-Id') || undefined } : { success: false, error: 'SendGrid error' }
    } catch (error) {
      return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
    }
  }
}

class ConsoleProvider implements EmailProvider {
  name = 'console'
  async send(email: EmailData): Promise<{ success: boolean; messageId?: string; error?: string }> {
    console.log('\n======== EMAIL ========')
    console.log('To:', Array.isArray(email.to) ? email.to.join(', ') : email.to)
    console.log('Subject:', email.subject)
    console.log('----------------')
    console.log(email.data.rendered_text)
    console.log('========================\n')
    return { success: true, messageId: `console-${Date.now()}` }
  }
}

export const emailService = new EmailService()
export { EmailService }
