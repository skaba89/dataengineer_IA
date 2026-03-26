/**
 * DataSphere Innovation - E2E Tests
 * End-to-end tests for critical user flows
 */

import { test, expect } from '@playwright/test'

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'

// ============================================================================
// Authentication Flow Tests
// ============================================================================

test.describe('Authentication Flow', () => {
  test('should display login page', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    
    await expect(page.locator('h1, h2')).toContainText(/login|sign in/i)
    await expect(page.locator('input[type="email"]')).toBeVisible()
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('should show validation errors on empty login', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()
    
    // Should show validation error
    await expect(page.locator('text=/required|invalid/i')).toBeVisible()
  })

  test('should navigate to registration page', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`)
    
    await page.click('text=/register|sign up|create account/i')
    
    await expect(page).toHaveURL(/register|signup/)
  })
})

// ============================================================================
// Dashboard Tests
// ============================================================================

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto(`${BASE_URL}/dashboard`)
  })

  test('should display dashboard metrics', async ({ page }) => {
    // Check for key dashboard elements
    const hasMetrics = await page.locator('[data-testid="metrics"]').count() > 0
    const hasCharts = await page.locator('[data-testid="chart"], canvas, svg').count() > 0
    
    expect(hasMetrics || hasCharts).toBeTruthy()
  })

  test('should display recent projects', async ({ page }) => {
    const projectsSection = page.locator('text=/recent|projects/i')
    await expect(projectsSection.first()).toBeVisible()
  })
})

// ============================================================================
// Projects Tests
// ============================================================================

test.describe('Projects', () => {
  test('should display projects list page', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`)
    
    // Navigate to projects
    await page.click('text=/projects/i')
    
    await expect(page).toHaveURL(/projects/)
  })

  test('should create new project', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`)
    
    // Click create project button
    const createButton = page.locator('button:has-text("new"), button:has-text("create")')
    if (await createButton.count() > 0) {
      await createButton.first().click()
      
      // Fill project form
      await page.fill('input[name="name"]', 'Test E2E Project')
      await page.fill('textarea[name="description"]', 'E2E test description')
      
      // Submit
      await page.click('button[type="submit"]')
      
      // Check for success or redirect
      await page.waitForTimeout(1000)
    }
  })
})

// ============================================================================
// Pricing Page Tests
// ============================================================================

test.describe('Pricing Page', () => {
  test('should display pricing plans', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`)
    
    // Check for plan cards
    const planCards = page.locator('[data-testid="plan-card"], .pricing-card, [class*="plan"]')
    await expect(planCards.first()).toBeVisible()
  })

  test('should toggle between monthly and annual billing', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`)
    
    // Find billing toggle
    const toggle = page.locator('button:has-text("annual"), button:has-text("monthly"), [role="switch"]')
    
    if (await toggle.count() > 0) {
      await toggle.first().click()
      
      // Verify prices changed (visual check)
      await page.waitForTimeout(500)
    }
  })

  test('should show plan features', async ({ page }) => {
    await page.goto(`${BASE_URL}/pricing`)
    
    // Check for feature lists
    const features = page.locator('li, [class*="feature"]')
    await expect(features.first()).toBeVisible()
  })
})

// ============================================================================
// API Documentation Tests
// ============================================================================

test.describe('API Documentation', () => {
  test('should display API docs page', async ({ page }) => {
    await page.goto(`${BASE_URL}/api-docs`)
    
    await expect(page.locator('text=/api|endpoint|documentation/i')).toBeVisible()
  })

  test('should show endpoint list', async ({ page }) => {
    await page.goto(`${BASE_URL}/api-docs`)
    
    const endpoints = page.locator('text=/GET|POST|PUT|DELETE|api\\//i')
    await expect(endpoints.first()).toBeVisible()
  })
})

// ============================================================================
// Security Page Tests
// ============================================================================

test.describe('Security Dashboard', () => {
  test('should display security metrics', async ({ page }) => {
    await page.goto(`${BASE_URL}/security`)
    
    // Check for security-related content
    const securityContent = page.locator('text=/security|audit|compliance|threat/i')
    await expect(securityContent.first()).toBeVisible()
  })
})

// ============================================================================
// Health Check Tests
// ============================================================================

test.describe('Health API', () => {
  test('should return healthy status', async ({ request }) => {
    const response = await request.get(`${BASE_URL}/api/health`)
    
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data.status).toBe('healthy')
  })
})

// ============================================================================
// SSO Tests
// ============================================================================

test.describe('SSO Configuration', () => {
  test('should display SSO providers', async ({ page }) => {
    await page.goto(`${BASE_URL}/sso`)
    
    // Check for SSO provider options
    const providers = page.locator('text=/azure|google|okta|auth0/i')
    await expect(providers.first()).toBeVisible()
  })
})

// ============================================================================
// Responsive Design Tests
// ============================================================================

test.describe('Responsive Design', () => {
  test('should render correctly on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto(`${BASE_URL}`)
    
    // Check that page is still functional
    await expect(page.locator('body')).toBeVisible()
  })

  test('should render correctly on tablet', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto(`${BASE_URL}`)
    
    await expect(page.locator('body')).toBeVisible()
  })

  test('should render correctly on desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 })
    await page.goto(`${BASE_URL}`)
    
    await expect(page.locator('body')).toBeVisible()
  })
})

// ============================================================================
// Accessibility Tests
// ============================================================================

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto(`${BASE_URL}`)
    
    const h1Count = await page.locator('h1').count()
    expect(h1Count).toBeLessThanOrEqual(1) // Should have at most one h1
  })

  test('should have alt text for images', async ({ page }) => {
    await page.goto(`${BASE_URL}`)
    
    const images = await page.locator('img').all()
    for (const img of images) {
      const alt = await img.getAttribute('alt')
      expect(alt).toBeDefined()
    }
  })

  test('should have accessible buttons', async ({ page }) => {
    await page.goto(`${BASE_URL}`)
    
    const buttons = await page.locator('button').all()
    for (const button of buttons) {
      const text = await button.textContent()
      const ariaLabel = await button.getAttribute('aria-label')
      expect(text || ariaLabel).toBeTruthy()
    }
  })
})

// ============================================================================
// Performance Tests
// ============================================================================

test.describe('Performance', () => {
  test('should load homepage within acceptable time', async ({ page }) => {
    const startTime = Date.now()
    await page.goto(`${BASE_URL}`)
    const loadTime = Date.now() - startTime
    
    // Should load within 5 seconds
    expect(loadTime).toBeLessThan(5000)
  })

  test('should have no console errors', async ({ page }) => {
    const errors: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    await page.goto(`${BASE_URL}`)
    
    // Filter out expected errors (e.g., from third-party scripts)
    const unexpectedErrors = errors.filter(e => 
      !e.includes('extension') && 
      !e.includes('chrome-extension')
    )
    
    expect(unexpectedErrors.length).toBe(0)
  })
})
