// AI Data Engineering System - Enterprise Connectors
// Multi-sector connectors for Retail, Finance, Healthcare, Marketing, HR, Manufacturing

import { db } from '@/lib/db'

// ============================================
// Types & Interfaces
// ============================================

export type ConnectorCategory = 
  | 'database' 
  | 'warehouse' 
  | 'streaming' 
  | 'saas' 
  | 'api' 
  | 'file' 
  | 'cloud_storage'
  | 'ecommerce'
  | 'marketing'
  | 'finance'
  | 'hr'
  | 'crm'
  | 'analytics'

export interface ConnectorConfig {
  id: string
  name: string
  category: ConnectorCategory
  icon: string
  description: string
  sectors: string[]
  authType: 'oauth2' | 'api_key' | 'basic' | 'bearer' | 'connection_string'
  authFields: AuthField[]
  configFields: ConfigField[]
  syncModes: ('full_refresh' | 'incremental' | 'cdc')[]
  supportedStreams: string[]
  rateLimit?: { requests: number; period: 'second' | 'minute' | 'hour' }
  documentation: string
  setupDifficulty: 'easy' | 'medium' | 'hard'
  estimatedSetupTime: string
}

export interface AuthField {
  name: string
  label: string
  type: 'text' | 'password' | 'url' | 'select'
  required: boolean
  placeholder?: string
  helpText?: string
  options?: { value: string; label: string }[]
}

export interface ConfigField {
  name: string
  label: string
  type: 'text' | 'number' | 'select' | 'checkbox' | 'cron'
  required: boolean
  defaultValue?: string | number | boolean
  options?: { value: string; label: string }[]
}

// ============================================
// E-Commerce Connectors
// ============================================

export const ECOMMERCE_CONNECTORS: ConnectorConfig[] = [
  {
    id: 'shopify',
    name: 'Shopify',
    category: 'ecommerce',
    icon: '🛒',
    description: 'Connectez votre boutique Shopify pour synchroniser commandes, produits et clients',
    sectors: ['retail', 'ecommerce'],
    authType: 'api_key',
    authFields: [
      { name: 'shop_domain', label: 'Domaine Shopify', type: 'text', required: true, placeholder: 'your-store.myshopify.com' },
      { name: 'api_key', label: 'API Key', type: 'password', required: true },
      { name: 'password', label: 'Password', type: 'password', required: true }
    ],
    configFields: [
      { name: 'sync_orders', label: 'Synchroniser les commandes', type: 'checkbox', required: false, defaultValue: true },
      { name: 'sync_products', label: 'Synchroniser les produits', type: 'checkbox', required: false, defaultValue: true },
      { name: 'sync_customers', label: 'Synchroniser les clients', type: 'checkbox', required: false, defaultValue: true },
      { name: 'sync_inventory', label: 'Synchroniser les stocks', type: 'checkbox', required: false, defaultValue: false }
    ],
    syncModes: ['full_refresh', 'incremental'],
    supportedStreams: ['orders', 'products', 'customers', 'inventory_items', 'transactions', 'refunds', 'metafields'],
    rateLimit: { requests: 2, period: 'second' },
    documentation: 'https://shopify.dev/api/admin-rest',
    setupDifficulty: 'easy',
    estimatedSetupTime: '5 min'
  },
  {
    id: 'magento',
    name: 'Magento',
    category: 'ecommerce',
    icon: '🛍️',
    description: 'Connectez votre boutique Magento pour synchroniser vos données e-commerce',
    sectors: ['retail', 'ecommerce'],
    authType: 'bearer',
    authFields: [
      { name: 'base_url', label: 'URL Magento', type: 'url', required: true, placeholder: 'https://your-store.com' },
      { name: 'access_token', label: 'Access Token', type: 'password', required: true }
    ],
    configFields: [
      { name: 'store_id', label: 'Store ID', type: 'number', required: false, defaultValue: 1 },
      { name: 'sync_orders', label: 'Synchroniser les commandes', type: 'checkbox', required: false, defaultValue: true }
    ],
    syncModes: ['full_refresh', 'incremental'],
    supportedStreams: ['orders', 'products', 'customers', 'invoices', 'credit_memos'],
    rateLimit: { requests: 100, period: 'minute' },
    documentation: 'https://devdocs.magento.com/rest/bk-rest.html',
    setupDifficulty: 'medium',
    estimatedSetupTime: '15 min'
  },
  {
    id: 'woocommerce',
    name: 'WooCommerce',
    category: 'ecommerce',
    icon: '🛒',
    description: 'Connectez votre boutique WooCommerce WordPress',
    sectors: ['retail', 'ecommerce'],
    authType: 'basic',
    authFields: [
      { name: 'base_url', label: 'URL du site', type: 'url', required: true, placeholder: 'https://your-store.com' },
      { name: 'consumer_key', label: 'Consumer Key', type: 'password', required: true },
      { name: 'consumer_secret', label: 'Consumer Secret', type: 'password', required: true }
    ],
    configFields: [
      { name: 'version', label: 'Version API', type: 'select', required: false, defaultValue: 'v3', options: [
        { value: 'v3', label: 'v3 (latest)' },
        { value: 'v2', label: 'v2' }
      ]}
    ],
    syncModes: ['full_refresh', 'incremental'],
    supportedStreams: ['orders', 'products', 'customers', 'coupons', 'reports'],
    rateLimit: { requests: 500, period: 'hour' },
    documentation: 'https://woocommerce.github.io/woocommerce-rest-api-docs/',
    setupDifficulty: 'easy',
    estimatedSetupTime: '5 min'
  },
  {
    id: 'amazon_seller',
    name: 'Amazon Seller Central',
    category: 'ecommerce',
    icon: '📦',
    description: 'Connectez votre compte Amazon Seller pour analyser vos ventes',
    sectors: ['retail', 'ecommerce'],
    authType: 'oauth2',
    authFields: [
      { name: 'refresh_token', label: 'Refresh Token', type: 'password', required: true },
      { name: 'client_id', label: 'Client ID', type: 'text', required: true },
      { name: 'client_secret', label: 'Client Secret', type: 'password', required: true }
    ],
    configFields: [
      { name: 'marketplace', label: 'Marketplace', type: 'select', required: true, options: [
        { value: 'ATVPDKIKX0DER', label: 'US' },
        { value: 'A1PA6795UKMFR9', label: 'DE' },
        { value: 'A13V1IB3VIYZZH', label: 'FR' },
        { value: 'A1F83G8C2ARO7P', label: 'UK' }
      ]}
    ],
    syncModes: ['full_refresh', 'incremental'],
    supportedStreams: ['orders', 'inventory', 'products', 'reports', 'finances'],
    rateLimit: { requests: 90, period: 'minute' },
    documentation: 'https://developer.amazonservices.com/',
    setupDifficulty: 'hard',
    estimatedSetupTime: '30 min'
  }
]

// ============================================
// Marketing & AdTech Connectors
// ============================================

export const MARKETING_CONNECTORS: ConnectorConfig[] = [
  {
    id: 'google_ads',
    name: 'Google Ads',
    category: 'marketing',
    icon: '🎯',
    description: 'Connectez Google Ads pour analyser vos campagnes publicitaires',
    sectors: ['all'],
    authType: 'oauth2',
    authFields: [
      { name: 'client_id', label: 'Client ID', type: 'text', required: true },
      { name: 'client_secret', label: 'Client Secret', type: 'password', required: true },
      { name: 'refresh_token', label: 'Refresh Token', type: 'password', required: true },
      { name: 'developer_token', label: 'Developer Token', type: 'password', required: true }
    ],
    configFields: [
      { name: 'customer_id', label: 'Customer ID', type: 'text', required: true, placeholder: '123-456-7890' }
    ],
    syncModes: ['full_refresh', 'incremental'],
    supportedStreams: ['campaigns', 'ad_groups', 'ads', 'keywords', 'performance_reports', 'click_performance'],
    rateLimit: { requests: 1000, period: 'hour' },
    documentation: 'https://developers.google.com/google-ads/api',
    setupDifficulty: 'hard',
    estimatedSetupTime: '45 min'
  },
  {
    id: 'meta_ads',
    name: 'Meta Ads (Facebook/Instagram)',
    category: 'marketing',
    icon: '📱',
    description: 'Connectez Meta Ads pour analyser vos campagnes Facebook et Instagram',
    sectors: ['all'],
    authType: 'oauth2',
    authFields: [
      { name: 'access_token', label: 'Access Token', type: 'password', required: true },
      { name: 'app_id', label: 'App ID', type: 'text', required: true },
      { name: 'app_secret', label: 'App Secret', type: 'password', required: true }
    ],
    configFields: [
      { name: 'ad_account_id', label: 'Ad Account ID', type: 'text', required: true, placeholder: 'act_123456789' }
    ],
    syncModes: ['full_refresh', 'incremental'],
    supportedStreams: ['campaigns', 'ad_sets', 'ads', 'insights', 'creatives', 'audiences'],
    rateLimit: { requests: 200, period: 'hour' },
    documentation: 'https://developers.facebook.com/docs/marketing-apis',
    setupDifficulty: 'medium',
    estimatedSetupTime: '20 min'
  },
  {
    id: 'google_analytics_4',
    name: 'Google Analytics 4',
    category: 'analytics',
    icon: '📊',
    description: 'Connectez GA4 pour analyser le comportement utilisateur',
    sectors: ['all'],
    authType: 'oauth2',
    authFields: [
      { name: 'client_email', label: 'Service Account Email', type: 'text', required: true },
      { name: 'private_key', label: 'Private Key', type: 'password', required: true }
    ],
    configFields: [
      { name: 'property_id', label: 'Property ID', type: 'text', required: true, placeholder: '123456789' }
    ],
    syncModes: ['full_refresh', 'incremental'],
    supportedStreams: ['page_views', 'sessions', 'events', 'conversions', 'user_demographics', 'traffic_sources'],
    rateLimit: { requests: 1000, period: 'hour' },
    documentation: 'https://developers.google.com/analytics/devguides/reporting/data/v1',
    setupDifficulty: 'medium',
    estimatedSetupTime: '15 min'
  },
  {
    id: 'linkedin_ads',
    name: 'LinkedIn Ads',
    category: 'marketing',
    icon: '💼',
    description: 'Connectez LinkedIn Ads pour analyser vos campagnes B2B',
    sectors: ['saas', 'finance', 'healthcare'],
    authType: 'oauth2',
    authFields: [
      { name: 'client_id', label: 'Client ID', type: 'text', required: true },
      { name: 'client_secret', label: 'Client Secret', type: 'password', required: true },
      { name: 'access_token', label: 'Access Token', type: 'password', required: true }
    ],
    configFields: [
      { name: 'account_id', label: 'Account ID', type: 'text', required: true }
    ],
    syncModes: ['full_refresh', 'incremental'],
    supportedStreams: ['campaigns', 'campaign_groups', 'creatives', 'analytics', 'lead_forms'],
    rateLimit: { requests: 100, period: 'hour' },
    documentation: 'https://learn.microsoft.com/en-us/linkedin/marketing/',
    setupDifficulty: 'medium',
    estimatedSetupTime: '20 min'
  },
  {
    id: 'klaviyo',
    name: 'Klaviyo',
    category: 'marketing',
    icon: '📧',
    description: 'Connectez Klaviyo pour synchroniser vos données email marketing',
    sectors: ['retail', 'ecommerce'],
    authType: 'api_key',
    authFields: [
      { name: 'api_key', label: 'Private API Key', type: 'password', required: true }
    ],
    configFields: [],
    syncModes: ['full_refresh', 'incremental'],
    supportedStreams: ['profiles', 'metrics', 'campaigns', 'flows', 'events', 'lists'],
    rateLimit: { requests: 200, period: 'minute' },
    documentation: 'https://developers.klaviyo.com/',
    setupDifficulty: 'easy',
    estimatedSetupTime: '5 min'
  }
]

// ============================================
// Finance & Banking Connectors
// ============================================

export const FINANCE_CONNECTORS: ConnectorConfig[] = [
  {
    id: 'stripe',
    name: 'Stripe',
    category: 'finance',
    icon: '💳',
    description: 'Connectez Stripe pour synchroniser paiements, clients et subscriptions',
    sectors: ['all'],
    authType: 'api_key',
    authFields: [
      { name: 'api_key', label: 'Secret Key', type: 'password', required: true },
      { name: 'webhook_secret', label: 'Webhook Secret', type: 'password', required: false }
    ],
    configFields: [
      { name: 'account_type', label: 'Account Type', type: 'select', required: false, defaultValue: 'standard', options: [
        { value: 'standard', label: 'Standard' },
        { value: 'express', label: 'Express' },
        { value: 'custom', label: 'Custom' }
      ]}
    ],
    syncModes: ['full_refresh', 'incremental', 'cdc'],
    supportedStreams: ['charges', 'customers', 'invoices', 'subscriptions', 'payments', 'refunds', 'balance_transactions', 'payouts'],
    rateLimit: { requests: 100, period: 'second' },
    documentation: 'https://stripe.com/docs/api',
    setupDifficulty: 'easy',
    estimatedSetupTime: '5 min'
  },
  {
    id: 'quickbooks',
    name: 'QuickBooks Online',
    category: 'finance',
    icon: '📘',
    description: 'Connectez QuickBooks pour synchroniser vos données comptables',
    sectors: ['all'],
    authType: 'oauth2',
    authFields: [
      { name: 'client_id', label: 'Client ID', type: 'text', required: true },
      { name: 'client_secret', label: 'Client Secret', type: 'password', required: true },
      { name: 'refresh_token', label: 'Refresh Token', type: 'password', required: true },
      { name: 'realm_id', label: 'Realm ID', type: 'text', required: true }
    ],
    configFields: [],
    syncModes: ['full_refresh', 'incremental'],
    supportedStreams: ['invoices', 'bills', 'customers', 'vendors', 'accounts', 'transactions', 'purchase_orders'],
    rateLimit: { requests: 500, period: 'minute' },
    documentation: 'https://developer.intuit.com/app/developer/qbo/docs',
    setupDifficulty: 'medium',
    estimatedSetupTime: '20 min'
  },
  {
    id: 'xero',
    name: 'Xero',
    category: 'finance',
    icon: '📗',
    description: 'Connectez Xero pour synchroniser vos données comptables',
    sectors: ['all'],
    authType: 'oauth2',
    authFields: [
      { name: 'client_id', label: 'Client ID', type: 'text', required: true },
      { name: 'client_secret', label: 'Client Secret', type: 'password', required: true },
      { name: 'refresh_token', label: 'Refresh Token', type: 'password', required: true },
      { name: 'tenant_id', label: 'Tenant ID', type: 'text', required: true }
    ],
    configFields: [],
    syncModes: ['full_refresh', 'incremental'],
    supportedStreams: ['invoices', 'bank_transactions', 'contacts', 'accounts', 'payments', 'credit_notes', 'journal_entries'],
    rateLimit: { requests: 60, period: 'minute' },
    documentation: 'https://developer.xero.com/documentation/',
    setupDifficulty: 'medium',
    estimatedSetupTime: '15 min'
  },
  {
    id: 'plaid',
    name: 'Plaid',
    category: 'finance',
    icon: '🏦',
    description: 'Connectez Plaid pour accéder aux données bancaires',
    sectors: ['finance', 'fintech'],
    authType: 'api_key',
    authFields: [
      { name: 'client_id', label: 'Client ID', type: 'text', required: true },
      { name: 'secret', label: 'Secret', type: 'password', required: true }
    ],
    configFields: [
      { name: 'environment', label: 'Environment', type: 'select', required: true, defaultValue: 'sandbox', options: [
        { value: 'sandbox', label: 'Sandbox' },
        { value: 'development', label: 'Development' },
        { value: 'production', label: 'Production' }
      ]}
    ],
    syncModes: ['full_refresh', 'incremental'],
    supportedStreams: ['accounts', 'transactions', 'balances', 'identity', 'income'],
    rateLimit: { requests: 100, period: 'minute' },
    documentation: 'https://plaid.com/docs/',
    setupDifficulty: 'medium',
    estimatedSetupTime: '30 min'
  }
]

// ============================================
// CRM & Sales Connectors
// ============================================

export const CRM_CONNECTORS: ConnectorConfig[] = [
  {
    id: 'salesforce',
    name: 'Salesforce',
    category: 'crm',
    icon: '☁️',
    description: 'Connectez Salesforce pour synchroniser vos données CRM',
    sectors: ['all'],
    authType: 'oauth2',
    authFields: [
      { name: 'client_id', label: 'Consumer Key', type: 'text', required: true },
      { name: 'client_secret', label: 'Consumer Secret', type: 'password', required: true },
      { name: 'refresh_token', label: 'Refresh Token', type: 'password', required: true },
      { name: 'instance_url', label: 'Instance URL', type: 'url', required: true }
    ],
    configFields: [
      { name: 'api_version', label: 'API Version', type: 'select', required: false, defaultValue: 'v58.0', options: [
        { value: 'v59.0', label: 'v59.0 (latest)' },
        { value: 'v58.0', label: 'v58.0' },
        { value: 'v57.0', label: 'v57.0' }
      ]}
    ],
    syncModes: ['full_refresh', 'incremental', 'cdc'],
    supportedStreams: ['accounts', 'contacts', 'opportunities', 'leads', 'cases', 'campaigns', 'custom_objects'],
    rateLimit: { requests: 100, period: 'minute' },
    documentation: 'https://developer.salesforce.com/docs/atlas.en-us.api_rest.meta/',
    setupDifficulty: 'medium',
    estimatedSetupTime: '20 min'
  },
  {
    id: 'hubspot',
    name: 'HubSpot',
    category: 'crm',
    icon: '🧡',
    description: 'Connectez HubSpot pour synchroniser vos données marketing et sales',
    sectors: ['all'],
    authType: 'oauth2',
    authFields: [
      { name: 'access_token', label: 'Access Token', type: 'password', required: true },
      { name: 'refresh_token', label: 'Refresh Token', type: 'password', required: false }
    ],
    configFields: [],
    syncModes: ['full_refresh', 'incremental'],
    supportedStreams: ['contacts', 'companies', 'deals', 'tickets', 'products', 'quotes', 'marketing_emails', 'forms'],
    rateLimit: { requests: 100, period: 'second' },
    documentation: 'https://developers.hubspot.com/docs/api/overview',
    setupDifficulty: 'easy',
    estimatedSetupTime: '10 min'
  },
  {
    id: 'pipedrive',
    name: 'Pipedrive',
    category: 'crm',
    icon: '🔵',
    description: 'Connectez Pipedrive pour synchroniser votre pipeline sales',
    sectors: ['all'],
    authType: 'api_key',
    authFields: [
      { name: 'api_token', label: 'API Token', type: 'password', required: true },
      { name: 'company_domain', label: 'Company Domain', type: 'text', required: true, placeholder: 'yourcompany' }
    ],
    configFields: [],
    syncModes: ['full_refresh', 'incremental'],
    supportedStreams: ['deals', 'persons', 'organizations', 'activities', 'pipelines', 'stages', 'products'],
    rateLimit: { requests: 200, period: 'minute' },
    documentation: 'https://developers.pipedrive.com/docs/api/v1',
    setupDifficulty: 'easy',
    estimatedSetupTime: '5 min'
  }
]

// ============================================
// HR & Payroll Connectors
// ============================================

export const HR_CONNECTORS: ConnectorConfig[] = [
  {
    id: 'workday',
    name: 'Workday',
    category: 'hr',
    icon: '👥',
    description: 'Connectez Workday pour synchroniser vos données RH',
    sectors: ['all'],
    authType: 'oauth2',
    authFields: [
      { name: 'client_id', label: 'Client ID', type: 'text', required: true },
      { name: 'client_secret', label: 'Client Secret', type: 'password', required: true },
      { name: 'tenant_id', label: 'Tenant ID', type: 'text', required: true },
      { name: 'base_url', label: 'Base URL', type: 'url', required: true }
    ],
    configFields: [],
    syncModes: ['full_refresh', 'incremental'],
    supportedStreams: ['workers', 'positions', 'organizations', 'payroll', 'time_tracking', 'benefits'],
    rateLimit: { requests: 100, period: 'minute' },
    documentation: 'https://community.workday.com/sites/default/files/file-hosting/productionapi/index.html',
    setupDifficulty: 'hard',
    estimatedSetupTime: '45 min'
  },
  {
    id: 'bamboohr',
    name: 'BambooHR',
    category: 'hr',
    icon: '🎋',
    description: 'Connectez BambooHR pour synchroniser vos données RH',
    sectors: ['all'],
    authType: 'api_key',
    authFields: [
      { name: 'api_key', label: 'API Key', type: 'password', required: true },
      { name: 'subdomain', label: 'Subdomain', type: 'text', required: true, placeholder: 'yourcompany' }
    ],
    configFields: [],
    syncModes: ['full_refresh', 'incremental'],
    supportedStreams: ['employees', 'jobs', 'departments', 'time_off', 'training', 'documents'],
    rateLimit: { requests: 500, period: 'hour' },
    documentation: 'https://documentation.bamboohr.com/reference',
    setupDifficulty: 'easy',
    estimatedSetupTime: '10 min'
  },
  {
    id: 'greenhouse',
    name: 'Greenhouse',
    category: 'hr',
    icon: '🌱',
    description: 'Connectez Greenhouse pour synchroniser vos données recrutement',
    sectors: ['all'],
    authType: 'api_key',
    authFields: [
      { name: 'api_key', label: 'Harvest API Key', type: 'password', required: true }
    ],
    configFields: [],
    syncModes: ['full_refresh', 'incremental'],
    supportedStreams: ['candidates', 'applications', 'jobs', 'stages', 'offers', 'interviews', 'scorecards'],
    rateLimit: { requests: 50, period: 'minute' },
    documentation: 'https://developers.greenhouse.io/harvest.html',
    setupDifficulty: 'easy',
    estimatedSetupTime: '10 min'
  }
]

// ============================================
// Support & Service Connectors
// ============================================

export const SUPPORT_CONNECTORS: ConnectorConfig[] = [
  {
    id: 'zendesk',
    name: 'Zendesk',
    category: 'saas',
    icon: '🎯',
    description: 'Connectez Zendesk pour synchroniser vos tickets support',
    sectors: ['all'],
    authType: 'api_key',
    authFields: [
      { name: 'subdomain', label: 'Subdomain', type: 'text', required: true, placeholder: 'yourcompany' },
      { name: 'email', label: 'Email', type: 'text', required: true },
      { name: 'api_token', label: 'API Token', type: 'password', required: true }
    ],
    configFields: [],
    syncModes: ['full_refresh', 'incremental'],
    supportedStreams: ['tickets', 'users', 'organizations', 'groups', 'ticket_metrics', 'ticket_comments', 'satisfaction_ratings'],
    rateLimit: { requests: 700, period: 'minute' },
    documentation: 'https://developer.zendesk.com/rest_api/docs/support/introduction',
    setupDifficulty: 'easy',
    estimatedSetupTime: '10 min'
  },
  {
    id: 'intercom',
    name: 'Intercom',
    category: 'saas',
    icon: '💬',
    description: 'Connectez Intercom pour synchroniser vos conversations support',
    sectors: ['all'],
    authType: 'oauth2',
    authFields: [
      { name: 'access_token', label: 'Access Token', type: 'password', required: true }
    ],
    configFields: [],
    syncModes: ['full_refresh', 'incremental'],
    supportedStreams: ['conversations', 'contacts', 'companies', 'admins', 'segments', 'tags', 'data_attributes'],
    rateLimit: { requests: 83, period: 'minute' },
    documentation: 'https://developers.intercom.com/intercom-api-reference/reference',
    setupDifficulty: 'easy',
    estimatedSetupTime: '5 min'
  }
]

// ============================================
// Project Management Connectors
// ============================================

export const PROJECT_CONNECTORS: ConnectorConfig[] = [
  {
    id: 'jira',
    name: 'Jira',
    category: 'saas',
    icon: '📋',
    description: 'Connectez Jira pour synchroniser vos issues et projets',
    sectors: ['all'],
    authType: 'api_key',
    authFields: [
      { name: 'domain', label: 'Domain', type: 'text', required: true, placeholder: 'yourcompany.atlassian.net' },
      { name: 'email', label: 'Email', type: 'text', required: true },
      { name: 'api_token', label: 'API Token', type: 'password', required: true }
    ],
    configFields: [],
    syncModes: ['full_refresh', 'incremental'],
    supportedStreams: ['issues', 'projects', 'boards', 'sprints', 'users', 'worklogs', 'comments'],
    rateLimit: { requests: 100, period: 'minute' },
    documentation: 'https://developer.atlassian.com/cloud/jira/platform/rest/v3/',
    setupDifficulty: 'easy',
    estimatedSetupTime: '10 min'
  },
  {
    id: 'asana',
    name: 'Asana',
    category: 'saas',
    icon: '✅',
    description: 'Connectez Asana pour synchroniser vos tâches et projets',
    sectors: ['all'],
    authType: 'oauth2',
    authFields: [
      { name: 'access_token', label: 'Personal Access Token', type: 'password', required: true }
    ],
    configFields: [
      { name: 'workspace_id', label: 'Workspace ID', type: 'text', required: false }
    ],
    syncModes: ['full_refresh', 'incremental'],
    supportedStreams: ['tasks', 'projects', 'sections', 'stories', 'tags', 'teams', 'users'],
    rateLimit: { requests: 150, period: 'minute' },
    documentation: 'https://developers.asana.com/docs',
    setupDifficulty: 'easy',
    estimatedSetupTime: '5 min'
  },
  {
    id: 'notion',
    name: 'Notion',
    category: 'saas',
    icon: '📝',
    description: 'Connectez Notion pour synchroniser vos pages et databases',
    sectors: ['all'],
    authType: 'oauth2',
    authFields: [
      { name: 'access_token', label: 'Integration Token', type: 'password', required: true }
    ],
    configFields: [],
    syncModes: ['full_refresh', 'incremental'],
    supportedStreams: ['databases', 'pages', 'blocks', 'users'],
    rateLimit: { requests: 3, period: 'second' },
    documentation: 'https://developers.notion.com/reference',
    setupDifficulty: 'easy',
    estimatedSetupTime: '10 min'
  }
]

// ============================================
// All Connectors Combined
// ============================================

export const ALL_CONNECTORS: ConnectorConfig[] = [
  ...ECOMMERCE_CONNECTORS,
  ...MARKETING_CONNECTORS,
  ...FINANCE_CONNECTORS,
  ...CRM_CONNECTORS,
  ...HR_CONNECTORS,
  ...SUPPORT_CONNECTORS,
  ...PROJECT_CONNECTORS
]

// ============================================
// Connector Registry & Helper Functions
// ============================================

export function getConnectorById(id: string): ConnectorConfig | undefined {
  return ALL_CONNECTORS.find(c => c.id === id)
}

export function getConnectorsByCategory(category: ConnectorCategory): ConnectorConfig[] {
  return ALL_CONNECTORS.filter(c => c.category === category)
}

export function getConnectorsBySector(sector: string): ConnectorConfig[] {
  return ALL_CONNECTORS.filter(c => c.sectors.includes(sector) || c.sectors.includes('all'))
}

export function searchConnectors(query: string): ConnectorConfig[] {
  const lowerQuery = query.toLowerCase()
  return ALL_CONNECTORS.filter(c => 
    c.name.toLowerCase().includes(lowerQuery) ||
    c.description.toLowerCase().includes(lowerQuery) ||
    c.category.toLowerCase().includes(lowerQuery)
  )
}

export const CONNECTOR_CATEGORIES: { value: ConnectorCategory; label: string; icon: string }[] = [
  { value: 'ecommerce', label: 'E-Commerce', icon: '🛒' },
  { value: 'marketing', label: 'Marketing & Ads', icon: '📱' },
  { value: 'analytics', label: 'Analytics', icon: '📊' },
  { value: 'finance', label: 'Finance', icon: '💳' },
  { value: 'crm', label: 'CRM & Sales', icon: '☁️' },
  { value: 'hr', label: 'HR & Payroll', icon: '👥' },
  { value: 'saas', label: 'SaaS Tools', icon: '🔧' },
  { value: 'database', label: 'Databases', icon: '🗄️' },
  { value: 'warehouse', label: 'Data Warehouses', icon: '🏠' },
  { value: 'cloud_storage', label: 'Cloud Storage', icon: '☁️' }
]
