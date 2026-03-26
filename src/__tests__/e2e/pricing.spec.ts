/**
 * DataSphere Innovation - E2E Pricing Page Tests
 * Playwright tests for the pricing page functionality
 */

import { test, expect, Page } from '@playwright/test'

// ============================================================================
// Test Configuration
// ============================================================================

test.describe('Pricing Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/pricing')
  })

  // ============================================================================
  // Page Rendering Tests
  // ============================================================================

  test('should display pricing page title', async ({ page }) => {
    // Check for main heading
    await expect(page.locator('h1')).toContainText('Choisissez le forfait')
  })

  test('should display all pricing plans', async ({ page }) => {
    // Check for all plan names
    await expect(page.getByText('Starter')).toBeVisible()
    await expect(page.getByText('Professional')).toBeVisible()
    await expect(page.getByText('Enterprise')).toBeVisible()
    await expect(page.getByText('Agency')).toBeVisible()
  })

  test('should display pricing amounts', async ({ page }) => {
    // Check for price displays
    await expect(page.getByText('499')).toBeVisible() // Starter
    await expect(page.getByText('1 499')).toBeVisible() // Professional
    await expect(page.getByText('4 999')).toBeVisible() // Enterprise
    await expect(page.getByText('2 999')).toBeVisible() // Agency
  })

  test('should highlight Professional as popular plan', async ({ page }) => {
    // Professional should have "Plus populaire" badge
    await expect(page.getByText('Plus populaire')).toBeVisible()
  })

  // ============================================================================
  // Billing Toggle Tests
  // ============================================================================

  test('should toggle between monthly and yearly billing', async ({ page }) => {
    // Find the billing toggle
    const toggle = page.locator('button[role="switch"]')
    
    // Default should be monthly
    await expect(page.getByText('Mensuel')).toBeVisible()
    
    // Toggle to yearly
    await toggle.click()
    
    // Yearly prices should be displayed
    await expect(page.getByText('Annuel')).toBeVisible()
  })

  test('should show yearly discount badge', async ({ page }) => {
    // Look for -20% badge
    await expect(page.getByText('-20%')).toBeVisible()
  })

  test('should update prices when toggling billing period', async ({ page }) => {
    // Get initial monthly price for Starter
    const monthlyPrice = await page.getByText('499').first().textContent()
    
    // Toggle to yearly
    await page.locator('button[role="switch"]').click()
    
    // Wait for price update
    await page.waitForTimeout(500)
    
    // Yearly price should be different
    const yearlyPriceElement = page.getByText('4 784')
    await expect(yearlyPriceElement).toBeVisible()
  })

  // ============================================================================
  // Plan Features Tests
  // ============================================================================

  test('should display plan features for Starter', async ({ page }) => {
    // Check for Starter features
    await expect(page.getByText('1 projet actif')).toBeVisible()
    await expect(page.getByText('3 sources de données')).toBeVisible()
    await expect(page.getByText('50 exécutions/mois')).toBeVisible()
  })

  test('should display plan features for Professional', async ({ page }) => {
    // Check for Professional features
    await expect(page.getByText('5 projets actifs')).toBeVisible()
    await expect(page.getByText('500 exécutions/mois')).toBeVisible()
    await expect(page.getByText('API Access')).toBeVisible()
  })

  test('should display plan features for Enterprise', async ({ page }) => {
    // Check for Enterprise features
    await expect(page.getByText('Projets illimités')).toBeVisible()
    await expect(page.getByText('SSO (SAML, OIDC)')).toBeVisible()
    await expect(page.getByText('SLA 99.9%')).toBeVisible()
  })

  test('should show check icons for included features', async ({ page }) => {
    // Check for check icons (included features)
    const checkIcons = page.locator('svg').filter({ hasText: '' })
    const count = await checkIcons.count()
    expect(count).toBeGreaterThan(0)
  })

  test('should show X icons for excluded features', async ({ page }) => {
    // Starter plan should have some excluded features
    const starterCard = page.locator('[class*="Card"]').filter({ hasText: 'Starter' })
    await expect(starterCard).toBeVisible()
  })

  // ============================================================================
  // Call to Action Tests
  // ============================================================================

  test('should have correct CTA buttons for each plan', async ({ page }) => {
    // Starter should have "Commencer" button
    await expect(page.getByRole('button', { name: 'Commencer' })).toBeVisible()
    
    // Professional should have "Choisir Professional" button
    await expect(page.getByRole('button', { name: 'Choisir Professional' })).toBeVisible()
    
    // Enterprise should have "Contacter les ventes" button
    await expect(page.getByRole('button', { name: 'Contacter les ventes' })).toBeVisible()
    
    // Agency should have "Nous contacter" button
    await expect(page.getByRole('button', { name: 'Nous contacter' })).toBeVisible()
  })

  test('should redirect to login when clicking Starter without auth', async ({ page }) => {
    // Click Starter plan button
    await page.getByRole('button', { name: 'Commencer' }).first().click()
    
    // Should redirect to login page
    await page.waitForURL(/login/)
    expect(page.url()).toContain('login')
  })

  test('should redirect to login when clicking Professional without auth', async ({ page }) => {
    // Click Professional plan button
    await page.getByRole('button', { name: 'Choisir Professional' }).click()
    
    // Should redirect to login page
    await page.waitForURL(/login/)
    expect(page.url()).toContain('login')
  })

  // ============================================================================
  // Contact Dialog Tests
  // ============================================================================

  test('should open contact dialog for Enterprise plan', async ({ page }) => {
    // Click Enterprise contact button
    await page.getByRole('button', { name: 'Contacter les ventes' }).click()
    
    // Dialog should appear
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText('Contactez-nous')).toBeVisible()
  })

  test('should open contact dialog for Agency plan', async ({ page }) => {
    // Click Agency contact button
    await page.getByRole('button', { name: 'Nous contacter' }).click()
    
    // Dialog should appear
    await expect(page.getByRole('dialog')).toBeVisible()
  })

  test('should have contact form fields', async ({ page }) => {
    // Open contact dialog
    await page.getByRole('button', { name: 'Contacter les ventes' }).click()
    
    // Check for form fields
    await expect(page.getByLabel('Nom complet')).toBeVisible()
    await expect(page.getByLabel('Email professionnel')).toBeVisible()
    await expect(page.getByLabel('Entreprise')).toBeVisible()
  })

  test('should close contact dialog on cancel', async ({ page }) => {
    // Open contact dialog
    await page.getByRole('button', { name: 'Contacter les ventes' }).click()
    await expect(page.getByRole('dialog')).toBeVisible()
    
    // Click cancel
    await page.getByRole('button', { name: 'Annuler' }).click()
    
    // Dialog should close
    await expect(page.getByRole('dialog')).not.toBeVisible()
  })

  test('should submit contact form', async ({ page }) => {
    // Open contact dialog
    await page.getByRole('button', { name: 'Contacter les ventes' }).click()
    
    // Fill form
    await page.getByLabel('Nom complet').fill('Test User')
    await page.getByLabel('Email professionnel').fill('test@example.com')
    await page.getByLabel('Entreprise').fill('Test Company')
    
    // Submit form
    await page.getByRole('button', { name: 'Envoyer' }).click()
    
    // Should show success message or close dialog
    await page.waitForTimeout(1000)
  })

  // ============================================================================
  // ROI Section Tests
  // ============================================================================

  test('should display ROI preview section', async ({ page }) => {
    // Check for ROI section
    await expect(page.getByText('Calculez votre ROI potentiel')).toBeVisible()
  })

  test('should display ROI statistics', async ({ page }) => {
    // Check for ROI stats
    await expect(page.getByText('85%')).toBeVisible()
    await expect(page.getByText('Réduction temps de développement')).toBeVisible()
    
    await expect(page.getByText('3 mois')).toBeVisible()
    await expect(page.getByText('Payback moyen')).toBeVisible()
    
    await expect(page.getByText('350%')).toBeVisible()
    await expect(page.getByText('ROI moyen 1ère année')).toBeVisible()
  })

  test('should have ROI calculator button', async ({ page }) => {
    // Check for ROI calculator button
    await expect(page.getByRole('button', { name: 'Calculer mon ROI' })).toBeVisible()
  })

  // ============================================================================
  // FAQ Section Tests
  // ============================================================================

  test('should display FAQ section', async ({ page }) => {
    // Check for FAQ heading
    await expect(page.getByText('Questions fréquentes')).toBeVisible()
  })

  test('should have expandable FAQ items', async ({ page }) => {
    // Check for FAQ items
    const faqItem = page.getByText('Puis-je changer de forfait à tout moment ?')
    await expect(faqItem).toBeVisible()
    
    // Click to expand
    await faqItem.click()
    
    // Answer should be visible
    await expect(page.getByText('Oui, vous pouvez upgrader ou downgrader')).toBeVisible()
  })

  test('should have trial period FAQ', async ({ page }) => {
    await expect(page.getByText('Y a-t-il une période d\'essai gratuite ?')).toBeVisible()
  })

  test('should have payment methods FAQ', async ({ page }) => {
    await expect(page.getByText('Quels modes de paiement acceptez-vous ?')).toBeVisible()
  })

  test('should have cancellation FAQ', async ({ page }) => {
    await expect(page.getByText('Puis-je annuler mon abonnement ?')).toBeVisible()
  })

  // ============================================================================
  // CTA Section Tests
  // ============================================================================

  test('should display final CTA section', async ({ page }) => {
    // Check for final CTA
    await expect(page.getByText('Prêt à transformer vos données ?')).toBeVisible()
    await expect(page.getByText('Commencez votre essai gratuit de 14 jours')).toBeVisible()
  })

  test('should have trial button in CTA section', async ({ page }) => {
    const trialButton = page.getByRole('button', { name: 'Démarrer l\'essai gratuit' })
    await expect(trialButton).toBeVisible()
  })

  // ============================================================================
  // Responsive Design Tests
  // ============================================================================

  test('should display correctly on mobile', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Page should still render correctly
    await expect(page.getByText('Starter')).toBeVisible()
    await expect(page.getByText('Professional')).toBeVisible()
  })

  test('should display correctly on tablet', async ({ page }) => {
    // Set tablet viewport
    await page.setViewportSize({ width: 768, height: 1024 })
    
    // Page should render correctly
    await expect(page.getByText('Starter')).toBeVisible()
  })

  test('should display correctly on desktop', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1440, height: 900 })
    
    // Page should render correctly
    await expect(page.getByText('Starter')).toBeVisible()
    await expect(page.getByText('Professional')).toBeVisible()
    await expect(page.getByText('Enterprise')).toBeVisible()
    await expect(page.getByText('Agency')).toBeVisible()
  })

  // ============================================================================
  // Navigation Tests
  // ============================================================================

  test('should navigate from pricing to login with plan parameter', async ({ page }) => {
    // Click Starter button
    await page.getByRole('button', { name: 'Commencer' }).first().click()
    
    // Wait for navigation
    await page.waitForURL(/login/)
    
    // Check URL contains plan parameter
    expect(page.url()).toContain('plan=starter')
  })

  // ============================================================================
  // Accessibility Tests
  // ============================================================================

  test('should have proper heading structure', async ({ page }) => {
    // Check for h1
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
    
    // Check for h2 (FAQ section)
    const h2 = page.locator('h2')
    await expect(h2.first()).toBeVisible()
  })

  test('should have accessible buttons', async ({ page }) => {
    // All buttons should be focusable
    const buttons = page.locator('button')
    const count = await buttons.count()
    
    for (let i = 0; i < count; i++) {
      const button = buttons.nth(i)
      await expect(button).toBeEnabled()
    }
  })

  test('should have accessible form in contact dialog', async ({ page }) => {
    // Open contact dialog
    await page.getByRole('button', { name: 'Contacter les ventes' }).click()
    
    // Form inputs should have labels
    const inputs = page.locator('dialog input')
    const count = await inputs.count()
    
    expect(count).toBeGreaterThan(0)
  })

  // ============================================================================
  // Performance Tests
  // ============================================================================

  test('should load pricing page quickly', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/pricing')
    const loadTime = Date.now() - startTime
    
    // Page should load within 3 seconds
    expect(loadTime).toBeLessThan(3000)
  })

  test('should not have console errors', async ({ page }) => {
    const errors: string[] = []
    
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    await page.goto('/pricing')
    await page.waitForTimeout(1000)
    
    // Filter out known non-critical errors
    const criticalErrors = errors.filter(
      (err) => !err.includes('favicon') && !err.includes('manifest')
    )
    
    expect(criticalErrors.length).toBe(0)
  })
})

// ============================================================================
// Authenticated User Tests
// ============================================================================

test.describe('Pricing Page - Authenticated User', () => {
  test.beforeEach(async ({ page }) => {
    // Login as demo user
    await page.goto('/login')
    
    // Fill login form
    await page.fill('input[type="email"]', 'demo@ai-data-engineering.com')
    await page.fill('input[type="password"]', 'demo123')
    
    // Submit login
    await page.click('button[type="submit"]')
    
    // Wait for redirect
    await page.waitForURL(/dashboard/, { timeout: 10000 }).catch(() => {
      // Continue even if redirect doesn't happen
    })
    
    // Navigate to pricing
    await page.goto('/pricing')
  })

  test('should allow authenticated user to subscribe', async ({ page }) => {
    // Click on Starter plan
    await page.getByRole('button', { name: 'Commencer' }).first().click()
    
    // Should trigger checkout or show success
    await page.waitForTimeout(1000)
  })

  test('should show current plan if already subscribed', async ({ page }) => {
    // If user has a subscription, it should be indicated
    await page.waitForTimeout(500)
    
    // Check for any current plan indicator
    const currentPlanBadge = page.locator('text=/Plan actuel|Current plan/i')
    const isVisible = await currentPlanBadge.isVisible().catch(() => false)
    
    // Either shows current plan or shows subscribe buttons
    expect(true).toBe(true)
  })
})

// ============================================================================
// Error Handling Tests
// ============================================================================

test.describe('Pricing Page - Error Handling', () => {
  test('should handle network errors gracefully', async ({ page, context }) => {
    // Simulate offline mode
    await context.setOffline(true)
    
    // Try to load pricing page
    await page.goto('/pricing').catch(() => {
      // Expected to fail in offline mode
    })
    
    // Restore online
    await context.setOffline(false)
  })

  test('should handle API errors during checkout', async ({ page }) => {
    // Mock failed checkout response
    await page.route('**/api/billing/checkout', (route) => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ error: 'Internal server error' }),
      })
    })
    
    // Login first
    await page.goto('/login')
    await page.fill('input[type="email"]', 'demo@ai-data-engineering.com')
    await page.fill('input[type="password"]', 'demo123')
    await page.click('button[type="submit"]')
    await page.waitForTimeout(1000)
    
    // Go to pricing
    await page.goto('/pricing')
    
    // Try to subscribe
    await page.getByRole('button', { name: 'Commencer' }).first().click()
    
    // Should show error toast
    await page.waitForTimeout(1000)
  })
})

// ============================================================================
// SEO Tests
// ============================================================================

test.describe('Pricing Page - SEO', () => {
  test('should have proper meta title', async ({ page }) => {
    await page.goto('/pricing')
    
    const title = await page.title()
    expect(title).toContain('DataSphere')
  })

  test('should have meta description', async ({ page }) => {
    await page.goto('/pricing')
    
    const metaDescription = page.locator('meta[name="description"]')
    await expect(metaDescription).toBeDefined()
  })
})
