// Industry Templates for AI Data Engineering System
// Provides pre-configured templates for different industries

import { WarehouseType, DataStack, STACK_TEMPLATES } from "@/lib/stacks"

// ============================================
// Types & Interfaces
// ============================================

export type IndustryType =
  | "retail"
  | "ecommerce"
  | "finance"
  | "healthcare"
  | "saas"
  | "manufacturing"
  | "logistics"
  | "fintech"
  | "insurance"
  | "real_estate"
  | "education"
  | "media"
  | "telecommunications"
  | "energy"
  | "government"

export interface IndustryTemplate {
  id: string
  name: string
  industry: IndustryType
  description: string
  useCases: string[]
  kpis: KPIDefinition[]
  dataSources: DataSourceTemplate[]
  transformationModels: TransformationTemplate[]
  dashboards: DashboardTemplate[]
  recommendedStacks: string[]
  complianceRequirements: string[]
  estimatedSetupTime: string
  complexityLevel: "beginner" | "intermediate" | "advanced"
}

export interface KPIDefinition {
  name: string
  description: string
  formula: string
  category: "revenue" | "operations" | "customer" | "finance" | "product"
  targetValue?: number
  unit?: string
  dataSource: string
}

export interface DataSourceTemplate {
  name: string
  type: "database" | "api" | "file" | "streaming"
  description: string
  expectedTables: string[]
  keyFields: string[]
  refreshFrequency: "realtime" | "hourly" | "daily" | "weekly"
}

export interface TransformationTemplate {
  name: string
  layer: "staging" | "intermediate" | "marts"
  description: string
  sourceTables: string[]
  targetTable: string
  sqlTemplate: string
}

export interface DashboardTemplate {
  name: string
  audience: "executive" | "operational" | "analyst"
  charts: ChartTemplate[]
  refreshInterval: string
}

export interface ChartTemplate {
  title: string
  type: "line" | "bar" | "pie" | "kpi" | "table" | "heatmap" | "scatter"
  dataSource: string
  dimensions: string[]
  metrics: string[]
  filters?: string[]
}

// ============================================
// Industry Templates
// ============================================

export const INDUSTRY_TEMPLATES: Record<string, IndustryTemplate> = {
  // ============================================
  // RETAIL
  // ============================================
  retail: {
    id: "retail",
    name: "Retail Analytics",
    industry: "retail",
    description: "Complete data engineering template for retail businesses including inventory management, sales analytics, customer behavior, and supply chain optimization.",
    useCases: [
      "Sales Performance Analytics",
      "Inventory Optimization",
      "Customer Segmentation",
      "Demand Forecasting",
      "Store Performance Analysis",
      "Promotional Effectiveness",
      "Supply Chain Analytics",
      "Fraud Detection",
    ],
    kpis: [
      { name: "Gross Revenue", description: "Total revenue before deductions", formula: "SUM(sales_amount)", category: "revenue", unit: "currency", dataSource: "sales" },
      { name: "Average Transaction Value", description: "Average amount per transaction", formula: "SUM(sales_amount) / COUNT(transactions)", category: "revenue", unit: "currency", dataSource: "sales" },
      { name: "Inventory Turnover", description: "How fast inventory is sold", formula: "COGS / Average Inventory", category: "operations", unit: "ratio", dataSource: "inventory" },
      { name: "Customer Retention Rate", description: "Percentage of returning customers", formula: "(Customers at End - New Customers) / Customers at Start * 100", category: "customer", unit: "percent", dataSource: "customers" },
      { name: "Sales per Square Foot", description: "Revenue efficiency per store area", formula: "Total Revenue / Total Store Area", category: "operations", unit: "currency/sqft", dataSource: "stores" },
      { name: "Stock-out Rate", description: "Percentage of items out of stock", formula: "COUNT(out_of_stock_items) / COUNT(total_items) * 100", category: "operations", unit: "percent", dataSource: "inventory" },
    ],
    dataSources: [
      { name: "Point of Sale", type: "database", description: "Transaction-level sales data from POS systems", expectedTables: ["transactions", "transaction_items", "payments", "refunds"], keyFields: ["transaction_id", "store_id", "customer_id", "product_id", "quantity", "amount", "timestamp"], refreshFrequency: "realtime" },
      { name: "Inventory Management", type: "database", description: "Real-time inventory levels and movements", expectedTables: ["inventory", "stock_movements", "purchase_orders", "suppliers"], keyFields: ["sku", "location_id", "quantity_on_hand", "quantity_reserved", "reorder_point"], refreshFrequency: "hourly" },
      { name: "Customer Database", type: "database", description: "Customer profiles and loyalty program data", expectedTables: ["customers", "loyalty_points", "customer_preferences", "segments"], keyFields: ["customer_id", "email", "loyalty_tier", "first_purchase_date", "lifetime_value"], refreshFrequency: "daily" },
      { name: "Product Catalog", type: "database", description: "Product master data and categories", expectedTables: ["products", "categories", "brands", "attributes"], keyFields: ["product_id", "sku", "category_id", "brand_id", "price", "cost"], refreshFrequency: "daily" },
    ],
    transformationModels: [
      {
        name: "stg_sales",
        layer: "staging",
        description: "Cleaned and standardized sales transactions",
        sourceTables: ["raw_transactions", "raw_transaction_items"],
        targetTable: "stg_sales",
        sqlTemplate: `SELECT t.transaction_id, t.store_id, t.customer_id, t.transaction_timestamp, ti.product_id, ti.quantity, ti.unit_price FROM raw_transactions t JOIN raw_transaction_items ti ON t.transaction_id = ti.transaction_id`,
      },
      {
        name: "int_customer_360",
        layer: "intermediate",
        description: "360-degree customer view with aggregated metrics",
        sourceTables: ["stg_sales", "stg_customers", "stg_loyalty"],
        targetTable: "int_customer_360",
        sqlTemplate: `SELECT c.customer_id, COUNT(DISTINCT s.transaction_id) as total_transactions, SUM(s.line_total) as lifetime_value FROM stg_customers c LEFT JOIN stg_sales s ON c.customer_id = s.customer_id GROUP BY 1`,
      },
      {
        name: "marts_daily_sales",
        layer: "marts",
        description: "Daily sales aggregations by store and product",
        sourceTables: ["stg_sales", "stg_products", "stg_stores"],
        targetTable: "marts_daily_sales",
        sqlTemplate: `SELECT DATE(s.transaction_timestamp) as sale_date, s.store_id, COUNT(DISTINCT s.transaction_id) as transaction_count, SUM(s.line_total) as gross_sales FROM stg_sales s GROUP BY 1, 2`,
      },
    ],
    dashboards: [
      {
        name: "Executive Sales Dashboard",
        audience: "executive",
        charts: [
          { title: "Total Revenue", type: "kpi", dataSource: "marts_daily_sales", dimensions: [], metrics: ["SUM(net_sales)"] },
          { title: "Revenue Trend", type: "line", dataSource: "marts_daily_sales", dimensions: ["sale_date"], metrics: ["net_sales"] },
          { title: "Sales by Region", type: "bar", dataSource: "marts_daily_sales", dimensions: ["region"], metrics: ["net_sales"] },
        ],
        refreshInterval: "1 hour",
      },
    ],
    recommendedStacks: ["modern_data_stack_bigquery", "startup_minimal"],
    complianceRequirements: ["PCI-DSS", "GDPR"],
    estimatedSetupTime: "4-6 weeks",
    complexityLevel: "intermediate",
  },

  // ============================================
  // E-COMMERCE
  // ============================================
  ecommerce: {
    id: "ecommerce",
    name: "E-Commerce Analytics",
    industry: "ecommerce",
    description: "Complete data engineering template for e-commerce businesses including web analytics, conversion optimization, customer journey, and marketing attribution.",
    useCases: [
      "Conversion Funnel Analysis",
      "Customer Journey Mapping",
      "Marketing Attribution",
      "Product Recommendation Engine",
      "A/B Test Analysis",
      "Cart Abandonment Analysis",
      "Customer Lifetime Value",
      "Churn Prediction",
    ],
    kpis: [
      { name: "Conversion Rate", description: "Percentage of visitors who make a purchase", formula: "CONVERT(customers) / VISITORS * 100", category: "revenue", unit: "percent", dataSource: "web_analytics" },
      { name: "Average Order Value", description: "Average revenue per order", formula: "SUM(order_value) / COUNT(orders)", category: "revenue", unit: "currency", dataSource: "orders" },
      { name: "Cart Abandonment Rate", description: "Percentage of carts abandoned", formula: "(carts_created - orders_placed) / carts_created * 100", category: "customer", unit: "percent", dataSource: "cart_events" },
      { name: "Customer Acquisition Cost", description: "Cost to acquire a new customer", formula: "SUM(marketing_spend) / COUNT(new_customers)", category: "customer", unit: "currency", dataSource: "marketing" },
    ],
    dataSources: [
      { name: "Web Analytics", type: "api", description: "Google Analytics or similar web tracking data", expectedTables: ["sessions", "pageviews", "events", "conversions"], keyFields: ["session_id", "user_id", "page_url", "event_type", "timestamp"], refreshFrequency: "hourly" },
      { name: "E-Commerce Platform", type: "api", description: "Shopify, Magento, or custom platform data", expectedTables: ["orders", "order_items", "products", "customers"], keyFields: ["order_id", "customer_id", "product_id", "quantity", "price", "status"], refreshFrequency: "realtime" },
      { name: "Marketing Platforms", type: "api", description: "Ad platforms and email marketing data", expectedTables: ["ad_campaigns", "ad_performance", "email_campaigns", "email_events"], keyFields: ["campaign_id", "impressions", "clicks", "conversions", "spend"], refreshFrequency: "daily" },
    ],
    transformationModels: [
      {
        name: "stg_web_events",
        layer: "staging",
        description: "Standardized web analytics events",
        sourceTables: ["raw_ga_events", "raw_segment_events"],
        targetTable: "stg_web_events",
        sqlTemplate: `SELECT event_id, session_id, user_id, event_type, page_url, event_timestamp FROM raw_ga_events`,
      },
      {
        name: "int_conversion_funnel",
        layer: "intermediate",
        description: "Conversion funnel by session",
        sourceTables: ["stg_web_events"],
        targetTable: "int_conversion_funnel",
        sqlTemplate: `SELECT session_id, MIN(CASE WHEN event_type = 'page_view' THEN event_timestamp END) as viewed_products, MIN(CASE WHEN event_type = 'add_to_cart' THEN event_timestamp END) as added_to_cart FROM stg_web_events GROUP BY 1`,
      },
      {
        name: "marts_customer_ltv",
        layer: "marts",
        description: "Customer lifetime value model",
        sourceTables: ["int_customer_360", "stg_orders"],
        targetTable: "marts_customer_ltv",
        sqlTemplate: `SELECT c.customer_id, c.total_revenue, c.avg_order_value * (365.0 / NULLIF(c.frequency_days, 0)) * 2 as predicted_ltv_2yr FROM int_customer_360 c`,
      },
    ],
    dashboards: [
      {
        name: "E-Commerce Overview",
        audience: "executive",
        charts: [
          { title: "Revenue Today", type: "kpi", dataSource: "marts_daily_revenue", dimensions: [], metrics: ["SUM(revenue)"] },
          { title: "Conversion Rate", type: "kpi", dataSource: "int_conversion_funnel", dimensions: [], metrics: ["AVG(conversion_rate)"] },
          { title: "Revenue Trend", type: "line", dataSource: "marts_daily_revenue", dimensions: ["date"], metrics: ["revenue", "orders"] },
        ],
        refreshInterval: "15 minutes",
      },
    ],
    recommendedStacks: ["modern_data_stack_bigquery", "startup_minimal"],
    complianceRequirements: ["GDPR", "CCPA"],
    estimatedSetupTime: "3-4 weeks",
    complexityLevel: "intermediate",
  },

  // ============================================
  // FINANCE
  // ============================================
  finance: {
    id: "finance",
    name: "Financial Services Analytics",
    industry: "finance",
    description: "Comprehensive data engineering template for financial institutions including risk analytics, fraud detection, customer analytics, and regulatory reporting.",
    useCases: [
      "Credit Risk Scoring",
      "Fraud Detection",
      "Anti-Money Laundering (AML)",
      "Customer Profitability Analysis",
      "Regulatory Reporting",
      "Portfolio Analytics",
      "Market Risk Analysis",
      "Customer Churn Prediction",
    ],
    kpis: [
      { name: "Net Interest Margin", description: "Difference between interest earned and paid", formula: "(Interest Income - Interest Expense) / Average Earning Assets", category: "finance", unit: "percent", dataSource: "financial_statements" },
      { name: "Cost-to-Income Ratio", description: "Operating efficiency metric", formula: "Operating Costs / Operating Income * 100", category: "finance", unit: "percent", dataSource: "financial_statements" },
      { name: "Non-Performing Loan Ratio", description: "Percentage of loans in default", formula: "NPLs / Total Loans * 100", category: "finance", unit: "percent", dataSource: "loan_portfolio" },
      { name: "Fraud Detection Rate", description: "Percentage of fraud caught", formula: "Detected Fraud / Total Fraud * 100", category: "operations", unit: "percent", dataSource: "fraud_system" },
    ],
    dataSources: [
      { name: "Core Banking System", type: "database", description: "Transaction accounts, loans, deposits", expectedTables: ["accounts", "transactions", "loans", "deposits", "customers"], keyFields: ["account_id", "customer_id", "balance", "interest_rate", "status"], refreshFrequency: "realtime" },
      { name: "Trading Platform", type: "database", description: "Securities trading data", expectedTables: ["trades", "positions", "securities", "market_data"], keyFields: ["trade_id", "security_id", "quantity", "price", "timestamp"], refreshFrequency: "realtime" },
      { name: "Risk Management", type: "database", description: "Risk calculations and models", expectedTables: ["risk_scores", "exposures", "var_calculations", "stress_tests"], keyFields: ["risk_type", "exposure_amount", "var_95", "timestamp"], refreshFrequency: "daily" },
    ],
    transformationModels: [
      {
        name: "stg_transactions",
        layer: "staging",
        description: "Cleaned transaction data",
        sourceTables: ["raw_transactions"],
        targetTable: "stg_transactions",
        sqlTemplate: `SELECT transaction_id, account_id, customer_id, transaction_type, amount, currency, transaction_timestamp FROM raw_transactions`,
      },
      {
        name: "int_fraud_detection",
        layer: "intermediate",
        description: "Fraud risk scoring model",
        sourceTables: ["stg_transactions", "int_customer_profile"],
        targetTable: "int_fraud_detection",
        sqlTemplate: `SELECT t.transaction_id, t.customer_id, t.amount, CASE WHEN t.amount > c.avg_transaction_amount * 5 THEN 0.8 ELSE 0.1 END as fraud_risk_score FROM stg_transactions t JOIN int_customer_profile c ON t.customer_id = c.customer_id`,
      },
      {
        name: "marts_customer_profitability",
        layer: "marts",
        description: "Customer profitability analysis",
        sourceTables: ["int_customer_360", "stg_accounts", "stg_transactions"],
        targetTable: "marts_customer_profitability",
        sqlTemplate: `SELECT c.customer_id, SUM(CASE WHEN t.transaction_type = 'fee' THEN t.amount ELSE 0 END) as fee_income FROM int_customer_360 c LEFT JOIN stg_transactions t ON c.customer_id = t.customer_id GROUP BY 1`,
      },
    ],
    dashboards: [
      {
        name: "Executive Dashboard",
        audience: "executive",
        charts: [
          { title: "Net Interest Income", type: "kpi", dataSource: "marts_financial_metrics", dimensions: [], metrics: ["net_interest_income"] },
          { title: "Cost-to-Income", type: "kpi", dataSource: "marts_financial_metrics", dimensions: [], metrics: ["cost_to_income_ratio"] },
          { title: "Revenue Trend", type: "line", dataSource: "marts_daily_revenue", dimensions: ["date"], metrics: ["interest_income", "fee_income"] },
        ],
        refreshInterval: "1 day",
      },
    ],
    recommendedStacks: ["modern_data_stack_snowflake", "databricks_lakehouse"],
    complianceRequirements: ["SOX", "Basel III", "Dodd-Frank", "GDPR"],
    estimatedSetupTime: "8-12 weeks",
    complexityLevel: "advanced",
  },

  // ============================================
  // HEALTHCARE
  // ============================================
  healthcare: {
    id: "healthcare",
    name: "Healthcare Analytics",
    industry: "healthcare",
    description: "Healthcare data engineering template for hospitals, clinics, and health systems including patient analytics, clinical outcomes, and operational efficiency.",
    useCases: [
      "Patient Journey Analytics",
      "Clinical Outcomes Analysis",
      "Resource Utilization",
      "Readmission Prediction",
      "Length of Stay Optimization",
      "Revenue Cycle Analytics",
      "Population Health Management",
      "Quality Reporting",
    ],
    kpis: [
      { name: "Average Length of Stay", description: "Average patient stay duration", formula: "SUM(patient_days) / COUNT(discharges)", category: "operations", unit: "days", dataSource: "patient_encounters" },
      { name: "Readmission Rate", description: "30-day readmission percentage", formula: "COUNT(readmissions) / COUNT(discharges) * 100", category: "operations", unit: "percent", dataSource: "patient_encounters" },
      { name: "Bed Occupancy Rate", description: "Percentage of beds occupied", formula: "Occupied Bed Days / Available Bed Days * 100", category: "operations", unit: "percent", dataSource: "bed_management" },
      { name: "Patient Satisfaction Score", description: "HCAHPS survey scores", formula: "AVG(satisfaction_rating)", category: "customer", unit: "score", dataSource: "surveys" },
    ],
    dataSources: [
      { name: "Electronic Health Records", type: "database", description: "Patient records and clinical data", expectedTables: ["patients", "encounters", "diagnoses", "procedures", "medications", "lab_results"], keyFields: ["patient_id", "encounter_id", "diagnosis_code", "procedure_code", "timestamp"], refreshFrequency: "realtime" },
      { name: "Revenue Cycle", type: "database", description: "Billing and claims data", expectedTables: ["charges", "claims", "payments", "denials", "adjustments"], keyFields: ["claim_id", "patient_id", "charge_code", "amount", "payer_id"], refreshFrequency: "daily" },
      { name: "Quality Measures", type: "database", description: "Quality metrics and outcomes", expectedTables: ["quality_measures", "patient_safety", "infections", "mortality"], keyFields: ["measure_id", "patient_id", "outcome", "measure_date"], refreshFrequency: "weekly" },
    ],
    transformationModels: [
      {
        name: "stg_encounters",
        layer: "staging",
        description: "Standardized patient encounter data",
        sourceTables: ["raw_encounters", "raw_admissions"],
        targetTable: "stg_encounters",
        sqlTemplate: `SELECT e.encounter_id, e.patient_id, e.encounter_type, e.admission_date, e.discharge_date, DATEDIFF(day, e.admission_date, e.discharge_date) as length_of_stay FROM raw_encounters e`,
      },
      {
        name: "int_readmission_analysis",
        layer: "intermediate",
        description: "30-day readmission analysis",
        sourceTables: ["stg_encounters", "int_patient_risk"],
        targetTable: "int_readmission_analysis",
        sqlTemplate: `SELECT patient_id, encounter_id, discharge_date, DATEDIFF(day, discharge_date, LEAD(admission_date) OVER (PARTITION BY patient_id ORDER BY admission_date)) as days_to_readmission FROM stg_encounters`,
      },
      {
        name: "marts_quality_dashboard",
        layer: "marts",
        description: "Quality metrics for reporting",
        sourceTables: ["stg_encounters", "stg_quality_measures", "int_patient_outcomes"],
        targetTable: "marts_quality_dashboard",
        sqlTemplate: `SELECT q.measure_id, DATE_TRUNC('month', q.measure_date) as reporting_month, COUNT(*) as total_patients, SUM(CASE WHEN q.outcome = 'passed' THEN 1 ELSE 0 END) * 100.0 / COUNT(*) as pass_rate FROM stg_quality_measures q GROUP BY 1, 2`,
      },
    ],
    dashboards: [
      {
        name: "Executive Quality Dashboard",
        audience: "executive",
        charts: [
          { title: "Overall Quality Score", type: "kpi", dataSource: "marts_quality_dashboard", dimensions: [], metrics: ["AVG(pass_rate)"] },
          { title: "Readmission Rate", type: "kpi", dataSource: "int_readmission_analysis", dimensions: [], metrics: ["AVG(readmission_rate)"] },
          { title: "Quality Trend", type: "line", dataSource: "marts_quality_dashboard", dimensions: ["reporting_month"], metrics: ["pass_rate"] },
        ],
        refreshInterval: "1 day",
      },
    ],
    recommendedStacks: ["databricks_lakehouse", "modern_data_stack_snowflake"],
    complianceRequirements: ["HIPAA", "HITECH", "CMS Quality Reporting"],
    estimatedSetupTime: "10-16 weeks",
    complexityLevel: "advanced",
  },

  // ============================================
  // SAAS
  // ============================================
  saas: {
    id: "saas",
    name: "SaaS Analytics",
    industry: "saas",
    description: "Complete SaaS metrics template including MRR, churn, cohort analysis, product analytics, and customer success metrics.",
    useCases: [
      "MRR/ARR Tracking",
      "Churn Analysis",
      "Cohort Retention",
      "Product Usage Analytics",
      "Customer Health Scoring",
      "Expansion Revenue Analysis",
      "Trial Conversion",
      "Feature Adoption",
    ],
    kpis: [
      { name: "Monthly Recurring Revenue", description: "Total predictable monthly revenue", formula: "SUM(monthly_subscription_value)", category: "revenue", unit: "currency", dataSource: "subscriptions" },
      { name: "Annual Recurring Revenue", description: "Annualized recurring revenue", formula: "MRR * 12", category: "revenue", unit: "currency", dataSource: "subscriptions" },
      { name: "Customer Churn Rate", description: "Monthly customer churn", formula: "Customers Lost / Starting Customers * 100", category: "customer", unit: "percent", dataSource: "subscriptions" },
      { name: "Lifetime Value", description: "Customer lifetime value", formula: "ARPU / Churn Rate", category: "customer", unit: "currency", dataSource: "subscriptions" },
    ],
    dataSources: [
      { name: "Subscription Billing", type: "api", description: "Stripe, Chargebee, Recurly data", expectedTables: ["subscriptions", "invoices", "customers", "plans"], keyFields: ["subscription_id", "customer_id", "plan_id", "status", "current_period_start", "current_period_end"], refreshFrequency: "realtime" },
      { name: "Product Analytics", type: "api", description: "Amplitude, Mixpanel, or similar", expectedTables: ["events", "users", "sessions", "features"], keyFields: ["event_name", "user_id", "session_id", "timestamp", "properties"], refreshFrequency: "hourly" },
      { name: "CRM", type: "api", description: "Salesforce, HubSpot data", expectedTables: ["accounts", "opportunities", "contacts", "activities"], keyFields: ["account_id", "opportunity_id", "stage", "amount", "close_date"], refreshFrequency: "hourly" },
    ],
    transformationModels: [
      {
        name: "stg_subscriptions",
        layer: "staging",
        description: "Cleaned subscription data",
        sourceTables: ["raw_stripe_subscriptions", "raw_stripe_customers"],
        targetTable: "stg_subscriptions",
        sqlTemplate: `SELECT s.subscription_id, s.customer_id, c.email, s.plan_id, s.status, s.current_period_start, s.current_period_end FROM raw_stripe_subscriptions s JOIN raw_stripe_customers c ON s.customer_id = c.customer_id`,
      },
      {
        name: "int_mrr_movements",
        layer: "intermediate",
        description: "MRR changes over time",
        sourceTables: ["stg_subscriptions"],
        targetTable: "int_mrr_movements",
        sqlTemplate: `SELECT DATE_TRUNC('month', effective_date) as month, SUM(CASE WHEN movement_type = 'new' THEN mrr_change ELSE 0 END) as new_mrr, SUM(CASE WHEN movement_type = 'churn' THEN ABS(mrr_change) ELSE 0 END) as churned_mrr FROM stg_subscription_history GROUP BY 1`,
      },
      {
        name: "marts_customer_health",
        layer: "marts",
        description: "Customer health scoring",
        sourceTables: ["int_cohort_retention", "stg_subscriptions", "stg_support_tickets"],
        targetTable: "marts_customer_health",
        sqlTemplate: `SELECT c.customer_id, c.company_name, c.mrr, GREATEST(0, LEAST(100, (p.days_active_last_30 * 2) + (p.feature_adoption_rate * 50))) as engagement_score FROM stg_customers c LEFT JOIN int_product_engagement p ON c.customer_id = p.customer_id`,
      },
    ],
    dashboards: [
      {
        name: "Executive SaaS Metrics",
        audience: "executive",
        charts: [
          { title: "MRR", type: "kpi", dataSource: "int_mrr_movements", dimensions: [], metrics: ["ending_mrr"] },
          { title: "ARR", type: "kpi", dataSource: "int_mrr_movements", dimensions: [], metrics: ["ending_mrr * 12"] },
          { title: "MRR Growth", type: "line", dataSource: "int_mrr_movements", dimensions: ["month"], metrics: ["ending_mrr", "net_mrr_change"] },
        ],
        refreshInterval: "1 hour",
      },
    ],
    recommendedStacks: ["startup_minimal", "modern_data_stack_bigquery"],
    complianceRequirements: ["SOC 2", "GDPR"],
    estimatedSetupTime: "2-3 weeks",
    complexityLevel: "beginner",
  },

  // ============================================
  // MANUFACTURING
  // ============================================
  manufacturing: {
    id: "manufacturing",
    name: "Manufacturing Analytics",
    industry: "manufacturing",
    description: "Manufacturing data engineering template for production analytics, quality control, supply chain, and predictive maintenance.",
    useCases: [
      "Production Efficiency (OEE)",
      "Quality Control Analytics",
      "Predictive Maintenance",
      "Supply Chain Visibility",
      "Inventory Optimization",
      "Energy Consumption Analysis",
      "Yield Optimization",
      "Workforce Analytics",
    ],
    kpis: [
      { name: "Overall Equipment Effectiveness", description: "Manufacturing efficiency metric", formula: "Availability × Performance × Quality", category: "operations", unit: "percent", dataSource: "production" },
      { name: "First Pass Yield", description: "Products passing QC first time", formula: "Good Units / Total Units Produced * 100", category: "operations", unit: "percent", dataSource: "quality" },
      { name: "Unplanned Downtime", description: "Unplanned stoppage time", formula: "SUM(unplanned_stop_minutes) / Available Minutes * 100", category: "operations", unit: "percent", dataSource: "maintenance" },
      { name: "Mean Time Between Failures", description: "Equipment reliability", formula: "Operating Time / Number of Failures", category: "operations", unit: "hours", dataSource: "maintenance" },
    ],
    dataSources: [
      { name: "MES/SCADA", type: "database", description: "Manufacturing execution system data", expectedTables: ["production_orders", "operations", "equipment_status", "shifts"], keyFields: ["order_id", "product_id", "machine_id", "start_time", "end_time", "quantity_good", "quantity_scrap"], refreshFrequency: "realtime" },
      { name: "Quality Management", type: "database", description: "Quality inspection data", expectedTables: ["inspections", "defects", "test_results", "specifications"], keyFields: ["inspection_id", "product_id", "parameter", "measured_value", "pass_fail"], refreshFrequency: "realtime" },
      { name: "Maintenance", type: "database", description: "Equipment maintenance records", expectedTables: ["work_orders", "equipment", "failures", "parts"], keyFields: ["work_order_id", "equipment_id", "failure_type", "repair_time", "parts_used"], refreshFrequency: "daily" },
    ],
    transformationModels: [
      {
        name: "stg_production_events",
        layer: "staging",
        description: "Production event stream",
        sourceTables: ["raw_mes_operations", "raw_scada_events"],
        targetTable: "stg_production_events",
        sqlTemplate: `SELECT event_id, event_timestamp, machine_id, product_id, production_order_id, event_type, quantity, duration_seconds FROM raw_mes_operations`,
      },
      {
        name: "int_oee_calculation",
        layer: "intermediate",
        description: "OEE calculation by machine/line",
        sourceTables: ["stg_production_events", "stg_equipment", "stg_quality"],
        targetTable: "int_oee_calculation",
        sqlTemplate: `SELECT machine_id, DATE_TRUNC('day', event_timestamp) as production_date, (planned_time - downtime) * 100.0 / planned_time as availability, performance_rate as performance, quality_rate as quality, availability * performance * quality / 10000 as oee FROM production_aggregates`,
      },
      {
        name: "marts_production_dashboard",
        layer: "marts",
        description: "Production KPIs and metrics",
        sourceTables: ["int_oee_calculation", "stg_production_events", "stg_inventory"],
        targetTable: "marts_production_dashboard",
        sqlTemplate: `SELECT DATE_TRUNC('day', event_timestamp) as production_date, plant_id, line_id, COUNT(DISTINCT production_order_id) as orders_completed, SUM(quantity_good) as good_units, AVG(oee) as avg_oee FROM stg_production_events GROUP BY 1, 2, 3`,
      },
    ],
    dashboards: [
      {
        name: "Production Overview",
        audience: "executive",
        charts: [
          { title: "Overall OEE", type: "kpi", dataSource: "marts_production_dashboard", dimensions: [], metrics: ["AVG(avg_oee)"] },
          { title: "First Pass Yield", type: "kpi", dataSource: "marts_production_dashboard", dimensions: [], metrics: ["AVG(first_pass_yield)"] },
          { title: "OEE Trend", type: "line", dataSource: "int_oee_calculation", dimensions: ["production_date"], metrics: ["AVG(oee)"] },
        ],
        refreshInterval: "1 hour",
      },
    ],
    recommendedStacks: ["databricks_lakehouse", "real_time_streaming"],
    complianceRequirements: ["ISO 9001", "ISO 14001"],
    estimatedSetupTime: "6-8 weeks",
    complexityLevel: "advanced",
  },
}

// ============================================
// Template Utilities
// ============================================

export function getTemplateByIndustry(industry: IndustryType): IndustryTemplate | undefined {
  return INDUSTRY_TEMPLATES[industry]
}

export function getTemplatesByComplexity(level: "beginner" | "intermediate" | "advanced"): IndustryTemplate[] {
  return Object.values(INDUSTRY_TEMPLATES).filter((t) => t.complexityLevel === level)
}

export function getTemplatesForStack(stackName: string): IndustryTemplate[] {
  return Object.values(INDUSTRY_TEMPLATES).filter((t) => t.recommendedStacks.includes(stackName))
}

export function generateProjectFromTemplate(template: IndustryTemplate, projectName: string): {
  name: string
  description: string
  industry: string
  dataSources: { name: string; type: string; description: string }[]
  kpis: { name: string; description: string; formula: string }[]
  dashboards: { name: string; audience: string }[]
} {
  return {
    name: projectName,
    description: template.description,
    industry: template.industry,
    dataSources: template.dataSources.map((ds) => ({
      name: ds.name,
      type: ds.type,
      description: ds.description,
    })),
    kpis: template.kpis.map((kpi) => ({
      name: kpi.name,
      description: kpi.description,
      formula: kpi.formula,
    })),
    dashboards: template.dashboards.map((d) => ({
      name: d.name,
      audience: d.audience,
    })),
  }
}
