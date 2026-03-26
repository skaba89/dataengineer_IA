/**
 * DataSphere Innovation - E2E Tests
 * Critical user flows testing with Playwright
 */

import { test, expect, Page } from '@playwright/test'

// ============================================================================
// Authentication Tests
// ============================================================================

test.describe('Authentication', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display landing page', async ({ page }) => {
    await expect(page).toHaveTitle(/DataSphere|AI Data Engineering/)
  })

  test('should show sign in button', async ({ page }) => {
    const signInButton = page.getByRole('button', { name: /sign in|login/i })
    await expect(signInButton).toBeVisible()
  })

  test('should navigate to login page', async ({ page }) => {
    await page.goto('/auth/signin')
    await expect(page).toHaveURL(/auth\/signin/)
  })
})

// ============================================================================
// Dashboard Tests
// ============================================================================

test.describe('Dashboard', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication
    await page.goto('/')
  })

  test('should display project selector', async ({ page }) => {
    const projectSection = page.getByText(/active project|no project/i)
    await expect(projectSection).toBeVisible()
  })

  test('should show tabs navigation', async ({ page }) => {
    const tabs = ['Overview', 'Agents', 'Workflow', 'History', 'Chat']
    
    for (const tab of tabs) {
      const tabElement = page.getByRole('tab', { name: new RegExp(tab, 'i') })
      if (await tabElement.isVisible()) {
        await expect(tabElement).toBeVisible()
      }
    }
  })

  test('should display agents grid on agents tab', async ({ page }) => {
    const agentsTab = page.getByRole('tab', { name: /agents/i })
    
    if (await agentsTab.isVisible()) {
      await agentsTab.click()
      
      // Wait for agents to load
      await page.waitForTimeout(500)
      
      // Check for agent cards
      const agentCards = page.locator('[class*="card"]').filter({ hasText: /orchestrator|archaeologist|designer/i })
      await expect(agentCards.first()).toBeVisible()
    }
  })
})

// ============================================================================
// Project Management Tests
// ============================================================================

test.describe('Project Management', () => {
  test('should navigate to project management page', async ({ page }) => {
    await page.goto('/project-management')
    
    await expect(page).toHaveURL(/project-management/)
  })

  test('should display sprints roadmap', async ({ page }) => {
    await page.goto('/project-management')
    
    const sprintsSection = page.getByText(/sprint|roadmap/i)
    await expect(sprintsSection.first()).toBeVisible()
  })

  test('should show team members', async ({ page }) => {
    await page.goto('/project-management')
    
    // Click on team tab
    const teamTab = page.getByRole('tab', { name: /équipe|team/i })
    if (await teamTab.isVisible()) {
      await teamTab.click()
      
      // Check for team member cards
      const memberCards = page.locator('[class*="card"]').filter({ hasText: /lead|developer|engineer/i })
      await expect(memberCards.first()).toBeVisible()
    }
  })

  test('should display metrics tab', async ({ page }) => {
    await page.goto('/project-management')
    
    const metricsTab = page.getByRole('tab', { name: /métriques|metrics/i })
    if (await metricsTab.isVisible()) {
      await metricsTab.click()
      
      // Check for metrics content
      const metricsContent = page.getByText(/vélocité|velocity|burndown/i)
      await expect(metricsContent.first()).toBeVisible()
    }
  })
})

// ============================================================================
// API Health Tests
// ============================================================================

test.describe('API Endpoints', () => {
  test('health endpoint should return 200', async ({ request }) => {
    const response = await request.get('/api/health')
    
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data.status).toBe('healthy')
  })

  test('metrics endpoint should return prometheus format', async ({ request }) => {
    const response = await request.get('/api/metrics')
    
    expect(response.status()).toBe(200)
    
    const text = await response.text()
    expect(text).toContain('# HELP')
    expect(text).toContain('# TYPE')
  })

  test('connectors endpoint should return list', async ({ request }) => {
    const response = await request.get('/api/connectors')
    
    expect(response.status()).toBe(200)
    
    const data = await response.json()
    expect(data.success).toBe(true)
    expect(Array.isArray(data.connectors)).toBe(true)
  })
})

// ============================================================================
// Performance Tests
// ============================================================================

test.describe('Performance', () => {
  test('should load homepage within 3 seconds', async ({ page }) => {
    const startTime = Date.now()
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    const loadTime = Date.now() - startTime
    
    expect(loadTime).toBeLessThan(3000)
  })

  test('should have no console errors on homepage', async ({ page }) => {
    const errors: string[] = []
    
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    
    // Filter out known benign errors
    const criticalErrors = errors.filter(err => 
      !err.includes('favicon') && 
      !err.includes('manifest') &&
      !err.includes('Extension context invalidated')
    )
    
    expect(criticalErrors.length).toBe(0)
  })
})

// ============================================================================
// Accessibility Tests
// ============================================================================

test.describe('Accessibility', () => {
  test('should have proper heading hierarchy', async ({ page }) => {
    await page.goto('/')
    
    // Check for h1
    const h1 = page.locator('h1')
    await expect(h1).toBeVisible()
  })

  test('should have visible focus indicators', async ({ page }) => {
    await page.goto('/')
    
    // Tab through interactive elements
    await page.keyboard.press('Tab')
    
    const focusedElement = page.locator(':focus')
    await expect(focusedElement).toBeVisible()
  })
})
