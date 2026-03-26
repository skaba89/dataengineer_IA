/**
 * Stripe Products Initialization Script
 * 
 * This script creates all subscription products and prices in Stripe
 * Run with: npx tsx scripts/init-stripe-products.ts
 */

import Stripe from 'stripe'

// Initialize Stripe
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2024-11-20.acacia',
})

// Subscription plans configuration
const plans = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Pour les startups et TPE qui débutent leur transformation data',
    monthlyPrice: 499,
    yearlyPrice: 4784, // 20% off
    features: [
      '1 projet actif',
      '3 sources de données',
      '50 exécutions/mois',
      'Templates basiques',
      'Support email',
      'Export PDF',
    ],
  },
  {
    id: 'professional',
    name: 'Professional',
    description: 'Pour les PME qui veulent accélérer leurs projets data',
    monthlyPrice: 1499,
    yearlyPrice: 14390,
    features: [
      '5 projets actifs',
      '10 sources de données',
      '500 exécutions/mois',
      'Tous les templates',
      'Support prioritaire',
      'Export PDF & ZIP',
      'Calculateur ROI',
      'Orchestration (Airflow/Dagster)',
      'API Access',
    ],
    recommended: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Pour les grandes entreprises avec besoins avancés',
    monthlyPrice: 4999,
    yearlyPrice: 47990,
    features: [
      'Projets illimités',
      'Sources illimitées',
      'Exécutions illimitées',
      'SSO (SAML, OIDC)',
      'Domaine personnalisé',
      'Audit logs',
      'SLA 99.9%',
      'Account manager dédié',
      'Formation incluse',
      'Support 24/7',
    ],
  },
  {
    id: 'agency',
    name: 'Agency',
    description: 'Pour les cabinets conseil et intégrateurs',
    monthlyPrice: 2999,
    yearlyPrice: 28790,
    features: [
      'Multi-clients',
      'White-label',
      'Facturation intégrée',
      'Portail client',
      'Templates personnalisés',
      'Commission marketplace',
      'Support dédié',
      'Onboarding personnalisé',
    ],
  },
]

async function createProducts() {
  console.log('🚀 Initializing Stripe products and prices...\n')

  const results: Record<string, { productId: string; monthlyPriceId: string; yearlyPriceId: string }> = {}

  for (const plan of plans) {
    console.log(`📦 Creating product: ${plan.name}`)
    
    try {
      // Create product
      const product = await stripe.products.create({
        id: `prod_datasphere_${plan.id}`,
        name: plan.name,
        description: plan.description,
        metadata: {
          features: plan.features.join(', '),
          recommended: plan.recommended ? 'true' : 'false',
        },
      })

      console.log(`   ✅ Product created: ${product.id}`)

      // Create monthly price
      const monthlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.monthlyPrice * 100, // Convert to cents
        currency: 'eur',
        recurring: {
          interval: 'month',
        },
        metadata: {
          planId: plan.id,
          billingPeriod: 'monthly',
        },
      })

      console.log(`   ✅ Monthly price created: ${monthlyPrice.id} (${plan.monthlyPrice}€/mois)`)

      // Create yearly price
      const yearlyPrice = await stripe.prices.create({
        product: product.id,
        unit_amount: plan.yearlyPrice * 100, // Convert to cents
        currency: 'eur',
        recurring: {
          interval: 'year',
        },
        metadata: {
          planId: plan.id,
          billingPeriod: 'yearly',
          savings: '20%',
        },
      })

      console.log(`   ✅ Yearly price created: ${yearlyPrice.id} (${plan.yearlyPrice}€/an)\n`)

      results[plan.id] = {
        productId: product.id,
        monthlyPriceId: monthlyPrice.id,
        yearlyPriceId: yearlyPrice.id,
      }

    } catch (error: any) {
      if (error.code === 'resource_already_exists') {
        console.log(`   ⚠️  Product already exists, retrieving existing...`)
        
        // Retrieve existing product
        const product = await stripe.products.retrieve(`prod_datasphere_${plan.id}`)
        const prices = await stripe.prices.list({ product: product.id, active: true })
        
        const monthlyPrice = prices.data.find(p => p.recurring?.interval === 'month')
        const yearlyPrice = prices.data.find(p => p.recurring?.interval === 'year')

        if (monthlyPrice && yearlyPrice) {
          results[plan.id] = {
            productId: product.id,
            monthlyPriceId: monthlyPrice.id,
            yearlyPriceId: yearlyPrice.id,
          }
          console.log(`   ✅ Retrieved existing prices\n`)
        }
      } else {
        console.error(`   ❌ Error: ${error.message}\n`)
      }
    }
  }

  // Print summary
  console.log('\n' + '='.repeat(60))
  console.log('📋 STRIPE CONFIGURATION SUMMARY')
  console.log('='.repeat(60))
  console.log('\nAdd these values to your .env file:\n')
  console.log('# Stripe Products & Prices')
  
  for (const [planId, ids] of Object.entries(results)) {
    const planName = planId.toUpperCase().replace('_', '')
    console.log(`STRIPE_${planName}_PRODUCT_ID=${ids.productId}`)
    console.log(`STRIPE_${planName}_MONTHLY_PRICE=${ids.monthlyPriceId}`)
    console.log(`STRIPE_${planName}_YEARLY_PRICE=${ids.yearlyPriceId}`)
    console.log('')
  }

  console.log('='.repeat(60))
  console.log('\n✅ Stripe initialization complete!')
  console.log('\nNext steps:')
  console.log('1. Copy the price IDs above to your .env file')
  console.log('2. Set up webhooks in Stripe Dashboard')
  console.log('3. Test with Stripe CLI: stripe listen --forward-to localhost:3000/api/billing/webhook')
}

// Run the script
createProducts().catch(console.error)
