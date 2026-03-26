/**
 * DataSphere Innovation - OpenAPI Specification
 * Comprehensive API documentation with Swagger/OpenAPI 3.1.0
 */

import type { OpenAPI } from 'openapi-types'

/**
 * Generate the complete OpenAPI specification for DataSphere Innovation
 */
export function generateOpenAPISpec(baseUrl: string = 'http://localhost:3000/api'): OpenAPI.Document {
  return {
    openapi: '3.1.0',
    info: {
      title: 'DataSphere Innovation API',
      description: `
# DataSphere Innovation API

Plateforme d'ingénierie de données propulsée par l'IA avec 10 agents autonomes.

## Fonctionnalités
- **10 Agents IA spécialisés**: Discovery, Architecture, Pipeline, Transformation, BI, Conversational, Pricing, Productization, Business, Quality
- **35+ connecteurs**: PostgreSQL, MySQL, MongoDB, BigQuery, Snowflake, etc.
- **Pipelines automatisés**: Génération ETL/ELT avec Airflow, dbt, Dagster, Spark
- **Data Quality**: Tests et validation automatiques
- **Visual Builder**: Design de pipelines sans code

## Authentification
L'API utilise deux méthodes d'authentification:
1. **Bearer Token (JWT)**: Pour les sessions utilisateur
2. **API Key**: Pour les intégrations programmatiques

## Rate Limits
| Plan | Requêtes/minute | Requêtes/jour |
|------|-----------------|---------------|
| Free | 20 | 1,000 |
| Starter | 100 | 10,000 |
| Professional | 500 | 100,000 |
| Enterprise | 2,000 | Illimité |

## Support
- Email: support@datasphere.io
- Documentation: https://docs.datasphere.io
- Status: https://status.datasphere.io
      `,
      version: '2.0.0',
      contact: {
        name: 'DataSphere Innovation Support',
        email: 'support@datasphere.io',
        url: 'https://datasphere.io/support',
      },
      license: {
        name: 'Proprietary',
        url: 'https://datasphere.io/terms',
      },
      termsOfService: 'https://datasphere.io/terms',
    },
    servers: [
      {
        url: baseUrl,
        description: 'Development Server',
      },
      {
        url: 'https://api.datasphere.io/api',
        description: 'Production Server',
      },
      {
        url: 'https://staging-api.datasphere.io/api',
        description: 'Staging Server',
      },
    ],
    security: [
      { BearerAuth: [] },
      { ApiKeyAuth: [] },
    ],
    tags: [
      { name: 'Auth', description: 'Authentification et gestion des sessions' },
      { name: 'Projects', description: 'Gestion des projets data engineering' },
      { name: 'Agents', description: 'Exécution et gestion des agents IA' },
      { name: 'Billing', description: 'Facturation et gestion des abonnements' },
      { name: 'Connectors', description: 'Connexion aux sources de données' },
      { name: 'Workflows', description: 'Création et exécution de workflows' },
      { name: 'Organizations', description: 'Gestion des organisations et équipes' },
      { name: 'API Keys', description: 'Gestion des clés API' },
    ],
    paths: {
      // ==================== AUTH API ====================
      '/auth/register': {
        post: {
          summary: 'Inscription d\'un nouvel utilisateur',
          description: 'Crée un nouveau compte utilisateur avec organisation',
          operationId: 'register',
          tags: ['Auth'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/RegisterRequest' },
                example: {
                  email: 'user@example.com',
                  password: 'SecurePassword123!',
                  name: 'Jean Dupont',
                  organizationName: 'Mon Entreprise',
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Utilisateur créé avec succès',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' },
                },
              },
            },
            '400': {
              description: 'Données invalides',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '409': {
              description: 'Email déjà utilisé',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
          security: [],
        },
      },
      '/auth/[...nextauth]': {
        post: {
          summary: 'Authentification NextAuth',
          description: 'Endpoint d\'authentification utilisant NextAuth.js (login, logout, callback)',
          operationId: 'nextauth',
          tags: ['Auth'],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    email: { type: 'string', format: 'email' },
                    password: { type: 'string' },
                    provider: { type: 'string', enum: ['credentials', 'google', 'github', 'microsoft'] },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Authentification réussie',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AuthResponse' },
                },
              },
            },
            '401': {
              description: 'Identifiants invalides',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
          security: [],
        },
      },

      // ==================== PROJECTS API ====================
      '/projects': {
        get: {
          summary: 'Liste tous les projets',
          description: 'Récupère une liste paginée des projets de l\'organisation',
          operationId: 'listProjects',
          tags: ['Projects'],
          parameters: [
            {
              name: 'page',
              in: 'query',
              schema: { type: 'integer', default: 1, minimum: 1 },
              description: 'Numéro de page',
            },
            {
              name: 'limit',
              in: 'query',
              schema: { type: 'integer', default: 20, minimum: 1, maximum: 100 },
              description: 'Éléments par page',
            },
            {
              name: 'status',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['draft', 'discovery', 'architecture', 'development', 'deployed', 'completed'],
              },
              description: 'Filtrer par statut',
            },
            {
              name: 'search',
              in: 'query',
              schema: { type: 'string' },
              description: 'Recherche par nom ou description',
            },
          ],
          responses: {
            '200': {
              description: 'Liste des projets',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ProjectListResponse' },
                },
              },
            },
            '401': {
              description: 'Non authentifié',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        post: {
          summary: 'Créer un nouveau projet',
          description: 'Crée un nouveau projet data engineering',
          operationId: 'createProject',
          tags: ['Projects'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateProjectRequest' },
                example: {
                  name: 'Mon Projet Data',
                  description: 'Pipeline ETL pour le reporting',
                  industry: 'finance',
                  budget: 50000,
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Projet créé',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Project' },
                },
              },
            },
            '400': {
              description: 'Données invalides',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '403': {
              description: 'Limite de projets atteinte',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/projects/{id}': {
        get: {
          summary: 'Détails d\'un projet',
          description: 'Récupère les détails complets d\'un projet',
          operationId: 'getProject',
          tags: ['Projects'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'ID du projet',
            },
          ],
          responses: {
            '200': {
              description: 'Détails du projet',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Project' },
                },
              },
            },
            '404': {
              description: 'Projet non trouvé',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        put: {
          summary: 'Modifier un projet',
          description: 'Met à jour les informations d\'un projet',
          operationId: 'updateProject',
          tags: ['Projects'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'ID du projet',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateProjectRequest' },
              },
            },
          },
          responses: {
            '200': {
              description: 'Projet mis à jour',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Project' },
                },
              },
            },
            '400': {
              description: 'Données invalides',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '404': {
              description: 'Projet non trouvé',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        delete: {
          summary: 'Supprimer un projet',
          description: 'Supprime un projet et toutes ses ressources associées',
          operationId: 'deleteProject',
          tags: ['Projects'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'ID du projet',
            },
          ],
          responses: {
            '204': {
              description: 'Projet supprimé',
            },
            '404': {
              description: 'Projet non trouvé',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },

      // ==================== AGENTS API ====================
      '/agents': {
        get: {
          summary: 'Liste les agents disponibles',
          description: 'Récupère la liste des agents IA disponibles pour l\'organisation',
          operationId: 'listAgents',
          tags: ['Agents'],
          responses: {
            '200': {
              description: 'Liste des agents',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Agent' },
                  },
                },
              },
            },
          },
        },
      },
      '/agents/{id}/execute': {
        post: {
          summary: 'Exécuter un agent',
          description: 'Déclenche l\'exécution d\'un agent IA sur un projet',
          operationId: 'executeAgent',
          tags: ['Agents'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string' },
              description: 'ID de l\'agent ou type d\'agent',
            },
          ],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/AgentExecutionRequest' },
                example: {
                  projectId: '550e8400-e29b-41d4-a716-446655440000',
                  input: {
                    dataSourceId: '550e8400-e29b-41d4-a716-446655440001',
                    options: { deepScan: true },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Exécution démarrée',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/AgentExecution' },
                },
              },
            },
            '400': {
              description: 'Paramètres invalides',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
            '429': {
              description: 'Limite d\'exécutions atteinte',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },

      // ==================== BILLING API ====================
      '/billing/checkout': {
        post: {
          summary: 'Créer une session checkout',
          description: 'Crée une session Stripe checkout pour souscrire à un plan',
          operationId: 'createCheckout',
          tags: ['Billing'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CheckoutRequest' },
                example: {
                  plan: 'professional',
                  billingPeriod: 'monthly',
                  seats: 5,
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Session checkout créée',
              content: {
                'application/json': {
                  schema: {
                    type: 'object',
                    properties: {
                      checkoutUrl: { type: 'string', format: 'uri' },
                      sessionId: { type: 'string' },
                    },
                  },
                },
              },
            },
            '400': {
              description: 'Plan invalide',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/billing/subscription': {
        get: {
          summary: 'Détails de l\'abonnement',
          description: 'Récupère les détails de l\'abonnement actuel',
          operationId: 'getSubscription',
          tags: ['Billing'],
          responses: {
            '200': {
              description: 'Détails de l\'abonnement',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Subscription' },
                },
              },
            },
            '404': {
              description: 'Aucun abonnement actif',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
        patch: {
          summary: 'Modifier l\'abonnement',
          description: 'Met à jour le plan ou les options de l\'abonnement',
          operationId: 'updateSubscription',
          tags: ['Billing'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/UpdateSubscriptionRequest' },
                example: {
                  plan: 'enterprise',
                  seats: 50,
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Abonnement mis à jour',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Subscription' },
                },
              },
            },
            '400': {
              description: 'Modification invalide',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },

      // ==================== CONNECTORS API ====================
      '/connectors': {
        get: {
          summary: 'Liste les connecteurs',
          description: 'Récupère la liste des connexions aux sources de données',
          operationId: 'listConnectors',
          tags: ['Connectors'],
          parameters: [
            {
              name: 'projectId',
              in: 'query',
              schema: { type: 'string', format: 'uuid' },
              description: 'Filtrer par projet',
            },
            {
              name: 'type',
              in: 'query',
              schema: {
                type: 'string',
                enum: ['postgresql', 'mysql', 'mongodb', 'bigquery', 'snowflake', 'redshift', 'api', 'file'],
              },
              description: 'Filtrer par type',
            },
          ],
          responses: {
            '200': {
              description: 'Liste des connecteurs',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Connector' },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: 'Créer une connexion',
          description: 'Crée une nouvelle connexion à une source de données',
          operationId: 'createConnector',
          tags: ['Connectors'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateConnectorRequest' },
                example: {
                  projectId: '550e8400-e29b-41d4-a716-446655440000',
                  name: 'Production Database',
                  type: 'postgresql',
                  config: {
                    host: 'db.example.com',
                    port: 5432,
                    database: 'production',
                    username: 'readonly_user',
                    password: 'secure_password',
                  },
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Connecteur créé',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Connector' },
                },
              },
            },
            '400': {
              description: 'Configuration invalide',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/connectors/{id}/test': {
        post: {
          summary: 'Tester une connexion',
          description: 'Teste la validité d\'une connexion à une source de données',
          operationId: 'testConnector',
          tags: ['Connectors'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'ID du connecteur',
            },
          ],
          responses: {
            '200': {
              description: 'Résultat du test',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ConnectorTestResult' },
                },
              },
            },
            '404': {
              description: 'Connecteur non trouvé',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },

      // ==================== WORKFLOWS API ====================
      '/workflows': {
        get: {
          summary: 'Liste les workflows',
          description: 'Récupère la liste des workflows d\'un projet',
          operationId: 'listWorkflows',
          tags: ['Workflows'],
          parameters: [
            {
              name: 'projectId',
              in: 'query',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'ID du projet',
            },
          ],
          responses: {
            '200': {
              description: 'Liste des workflows',
              content: {
                'application/json': {
                  schema: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Workflow' },
                  },
                },
              },
            },
          },
        },
        post: {
          summary: 'Créer un workflow',
          description: 'Crée un nouveau workflow de transformation de données',
          operationId: 'createWorkflow',
          tags: ['Workflows'],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: { $ref: '#/components/schemas/CreateWorkflowRequest' },
                example: {
                  projectId: '550e8400-e29b-41d4-a716-446655440000',
                  name: 'ETL Daily Sales',
                  description: 'Pipeline quotidien d\'extraction des ventes',
                  framework: 'airflow',
                  schedule: '0 6 * * *',
                  nodes: [
                    { type: 'source', connectorId: '550e8400-e29b-41d4-a716-446655440001' },
                    { type: 'transform', config: { transformations: ['clean', 'aggregate'] } },
                    { type: 'destination', connectorId: '550e8400-e29b-41d4-a716-446655440002' },
                  ],
                },
              },
            },
          },
          responses: {
            '201': {
              description: 'Workflow créé',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/Workflow' },
                },
              },
            },
            '400': {
              description: 'Configuration invalide',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
      '/workflows/{id}/execute': {
        post: {
          summary: 'Exécuter un workflow',
          description: 'Déclenche l\'exécution d\'un workflow',
          operationId: 'executeWorkflow',
          tags: ['Workflows'],
          parameters: [
            {
              name: 'id',
              in: 'path',
              required: true,
              schema: { type: 'string', format: 'uuid' },
              description: 'ID du workflow',
            },
          ],
          requestBody: {
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  properties: {
                    parameters: {
                      type: 'object',
                      description: 'Paramètres d\'exécution',
                    },
                    dryRun: {
                      type: 'boolean',
                      default: false,
                      description: 'Exécuter en mode test sans écriture',
                    },
                  },
                },
              },
            },
          },
          responses: {
            '200': {
              description: 'Exécution démarrée',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/WorkflowExecution' },
                },
              },
            },
            '404': {
              description: 'Workflow non trouvé',
              content: {
                'application/json': {
                  schema: { $ref: '#/components/schemas/ErrorResponse' },
                },
              },
            },
          },
        },
      },
    },
    components: {
      securitySchemes: {
        BearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Authentification JWT pour les sessions utilisateur',
        },
        ApiKeyAuth: {
          type: 'apiKey',
          in: 'header',
          name: 'X-API-Key',
          description: 'Clé API pour les intégrations programmatiques',
        },
      },
      schemas: {
        // ==================== USER & AUTH ====================
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            email: { type: 'string', format: 'email' },
            name: { type: 'string' },
            image: { type: 'string', format: 'uri' },
            role: {
              type: 'string',
              enum: ['admin', 'manager', 'analyst', 'viewer'],
            },
            organizationId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['id', 'email', 'role'],
        },
        Organization: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            slug: { type: 'string' },
            logo: { type: 'string', format: 'uri' },
            plan: { $ref: '#/components/schemas/Plan' },
            seats: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
          required: ['id', 'name', 'slug'],
        },
        RegisterRequest: {
          type: 'object',
          properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string', minLength: 8 },
            name: { type: 'string' },
            organizationName: { type: 'string' },
          },
          required: ['email', 'password', 'name'],
        },
        AuthResponse: {
          type: 'object',
          properties: {
            user: { $ref: '#/components/schemas/User' },
            organization: { $ref: '#/components/schemas/Organization' },
            token: { type: 'string' },
            expiresAt: { type: 'string', format: 'date-time' },
          },
        },

        // ==================== PROJECT ====================
        Project: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            slug: { type: 'string' },
            description: { type: 'string' },
            status: {
              type: 'string',
              enum: ['draft', 'discovery', 'architecture', 'development', 'deployed', 'completed'],
            },
            industry: {
              type: 'string',
              enum: ['retail', 'finance', 'healthcare', 'saas', 'manufacturing', 'logistics', 'other'],
            },
            budget: { type: 'number' },
            organizationId: { type: 'string', format: 'uuid' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['id', 'name', 'status'],
        },
        ProjectListResponse: {
          type: 'object',
          properties: {
            data: {
              type: 'array',
              items: { $ref: '#/components/schemas/Project' },
            },
            pagination: {
              type: 'object',
              properties: {
                page: { type: 'integer' },
                limit: { type: 'integer' },
                total: { type: 'integer' },
                totalPages: { type: 'integer' },
              },
            },
          },
        },
        CreateProjectRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 255 },
            description: { type: 'string', maxLength: 2000 },
            industry: {
              type: 'string',
              enum: ['retail', 'finance', 'healthcare', 'saas', 'manufacturing', 'logistics', 'other'],
            },
            budget: { type: 'number', minimum: 0 },
          },
          required: ['name'],
        },
        UpdateProjectRequest: {
          type: 'object',
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 255 },
            description: { type: 'string', maxLength: 2000 },
            status: {
              type: 'string',
              enum: ['draft', 'discovery', 'architecture', 'development', 'deployed', 'completed'],
            },
            budget: { type: 'number', minimum: 0 },
          },
        },

        // ==================== AGENT ====================
        Agent: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: { type: 'string' },
            type: {
              type: 'string',
              enum: ['discovery', 'architecture', 'pipeline', 'transformation', 'bi', 'conversational', 'pricing', 'productization', 'business', 'quality'],
            },
            description: { type: 'string' },
            capabilities: {
              type: 'array',
              items: { type: 'string' },
            },
            status: {
              type: 'string',
              enum: ['available', 'busy', 'maintenance'],
            },
          },
          required: ['id', 'name', 'type'],
        },
        AgentExecutionRequest: {
          type: 'object',
          properties: {
            projectId: { type: 'string', format: 'uuid' },
            input: { type: 'object' },
            options: {
              type: 'object',
              properties: {
                timeout: { type: 'integer', default: 300 },
                priority: { type: 'string', enum: ['low', 'normal', 'high'], default: 'normal' },
              },
            },
          },
          required: ['projectId'],
        },
        AgentExecution: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            agentType: { type: 'string' },
            projectId: { type: 'string', format: 'uuid' },
            status: {
              type: 'string',
              enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
            },
            input: { type: 'object' },
            output: { type: 'object' },
            error: { type: 'string' },
            duration: { type: 'integer', description: 'Duration in seconds' },
            createdAt: { type: 'string', format: 'date-time' },
            completedAt: { type: 'string', format: 'date-time' },
          },
          required: ['id', 'agentType', 'projectId', 'status'],
        },

        // ==================== BILLING ====================
        Plan: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            name: {
              type: 'string',
              enum: ['free', 'starter', 'professional', 'enterprise'],
            },
            displayName: { type: 'string' },
            price: { type: 'number' },
            currency: { type: 'string', default: 'EUR' },
            features: {
              type: 'array',
              items: { type: 'string' },
            },
            limits: {
              type: 'object',
              properties: {
                projects: { type: 'integer' },
                users: { type: 'integer' },
                executions: { type: 'integer' },
                connectors: { type: 'integer' },
              },
            },
          },
          required: ['id', 'name', 'price'],
        },
        Subscription: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            plan: { $ref: '#/components/schemas/Plan' },
            status: {
              type: 'string',
              enum: ['active', 'past_due', 'canceled', 'trialing', 'expired'],
            },
            seats: { type: 'integer' },
            billingPeriod: {
              type: 'string',
              enum: ['monthly', 'yearly'],
            },
            currentPeriodStart: { type: 'string', format: 'date-time' },
            currentPeriodEnd: { type: 'string', format: 'date-time' },
            cancelAtPeriodEnd: { type: 'boolean' },
          },
          required: ['id', 'plan', 'status'],
        },
        CheckoutRequest: {
          type: 'object',
          properties: {
            plan: {
              type: 'string',
              enum: ['starter', 'professional', 'enterprise'],
            },
            billingPeriod: {
              type: 'string',
              enum: ['monthly', 'yearly'],
              default: 'monthly',
            },
            seats: { type: 'integer', minimum: 1, default: 1 },
          },
          required: ['plan'],
        },
        UpdateSubscriptionRequest: {
          type: 'object',
          properties: {
            plan: {
              type: 'string',
              enum: ['starter', 'professional', 'enterprise'],
            },
            seats: { type: 'integer', minimum: 1 },
            cancelAtPeriodEnd: { type: 'boolean' },
          },
        },

        // ==================== CONNECTOR ====================
        Connector: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            type: {
              type: 'string',
              enum: ['postgresql', 'mysql', 'mongodb', 'bigquery', 'snowflake', 'redshift', 'oracle', 'sqlserver', 'api', 'file', 'kafka'],
            },
            status: {
              type: 'string',
              enum: ['pending', 'connected', 'error', 'disabled'],
            },
            projectId: { type: 'string', format: 'uuid' },
            config: {
              type: 'object',
              description: 'Configuration (sensitive fields are masked)',
            },
            lastSync: { type: 'string', format: 'date-time' },
            tableCount: { type: 'integer' },
            createdAt: { type: 'string', format: 'date-time' },
          },
          required: ['id', 'name', 'type', 'status', 'projectId'],
        },
        CreateConnectorRequest: {
          type: 'object',
          properties: {
            projectId: { type: 'string', format: 'uuid' },
            name: { type: 'string', minLength: 1 },
            type: {
              type: 'string',
              enum: ['postgresql', 'mysql', 'mongodb', 'bigquery', 'snowflake', 'redshift', 'oracle', 'sqlserver', 'api', 'file', 'kafka'],
            },
            config: {
              type: 'object',
              description: 'Connection configuration (varies by type)',
            },
          },
          required: ['projectId', 'name', 'type', 'config'],
        },
        ConnectorTestResult: {
          type: 'object',
          properties: {
            success: { type: 'boolean' },
            message: { type: 'string' },
            details: {
              type: 'object',
              properties: {
                serverVersion: { type: 'string' },
                latency: { type: 'integer', description: 'Latency in ms' },
                database: { type: 'string' },
                tables: { type: 'integer' },
              },
            },
            error: { type: 'string' },
          },
          required: ['success'],
        },

        // ==================== WORKFLOW ====================
        Workflow: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            name: { type: 'string' },
            description: { type: 'string' },
            projectId: { type: 'string', format: 'uuid' },
            framework: {
              type: 'string',
              enum: ['airflow', 'dbt', 'dagster', 'spark', 'custom'],
            },
            status: {
              type: 'string',
              enum: ['draft', 'active', 'paused', 'error'],
            },
            schedule: { type: 'string', description: 'Cron expression' },
            nodes: {
              type: 'array',
              items: {
                type: 'object',
                properties: {
                  id: { type: 'string' },
                  type: {
                    type: 'string',
                    enum: ['source', 'transform', 'destination', 'validator', 'trigger'],
                  },
                  config: { type: 'object' },
                },
              },
            },
            lastExecution: { $ref: '#/components/schemas/WorkflowExecution' },
            createdAt: { type: 'string', format: 'date-time' },
            updatedAt: { type: 'string', format: 'date-time' },
          },
          required: ['id', 'name', 'projectId', 'framework', 'status'],
        },
        CreateWorkflowRequest: {
          type: 'object',
          properties: {
            projectId: { type: 'string', format: 'uuid' },
            name: { type: 'string', minLength: 1 },
            description: { type: 'string' },
            framework: {
              type: 'string',
              enum: ['airflow', 'dbt', 'dagster', 'spark', 'custom'],
            },
            schedule: { type: 'string' },
            nodes: {
              type: 'array',
              items: { type: 'object' },
            },
          },
          required: ['projectId', 'name', 'framework'],
        },
        WorkflowExecution: {
          type: 'object',
          properties: {
            id: { type: 'string', format: 'uuid' },
            workflowId: { type: 'string', format: 'uuid' },
            status: {
              type: 'string',
              enum: ['pending', 'running', 'completed', 'failed', 'cancelled'],
            },
            startedAt: { type: 'string', format: 'date-time' },
            completedAt: { type: 'string', format: 'date-time' },
            duration: { type: 'integer', description: 'Duration in seconds' },
            recordsProcessed: { type: 'integer' },
            error: { type: 'string' },
            logs: { type: 'string', format: 'uri' },
          },
          required: ['id', 'workflowId', 'status'],
        },

        // ==================== ERROR ====================
        ErrorResponse: {
          type: 'object',
          properties: {
            error: {
              type: 'string',
              description: 'Error type/code',
            },
            message: {
              type: 'string',
              description: 'Human-readable error message',
            },
            details: {
              type: 'object',
              description: 'Additional error details',
            },
            statusCode: {
              type: 'integer',
              description: 'HTTP status code',
            },
            requestId: {
              type: 'string',
              description: 'Unique request identifier for support',
            },
          },
          required: ['error', 'message'],
        },
      },
    },
  }
}

/**
 * Get OpenAPI specification as JSON string
 */
export function getOpenAPIJson(baseUrl?: string): string {
  return JSON.stringify(generateOpenAPISpec(baseUrl), null, 2)
}

export type OpenAPISpec = ReturnType<typeof generateOpenAPISpec>
