#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DataSphere Innovation - Plan d'Action Détaillé
Recommandations d'amélioration avec implémentation
"""

from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, 
    PageBreak, ListFlowable, ListItem
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily

# Font Registration
pdfmetrics.registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))
pdfmetrics.registerFont(TTFont('Microsoft YaHei', '/usr/share/fonts/truetype/chinese/msyh.ttf'))
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))

registerFontFamily('Microsoft YaHei', normal='Microsoft YaHei', bold='Microsoft YaHei')
registerFontFamily('SimHei', normal='SimHei', bold='SimHei')

# Styles
styles = getSampleStyleSheet()

cover_title = ParagraphStyle('CoverTitle', fontName='Microsoft YaHei', fontSize=32, leading=40, alignment=TA_CENTER, spaceAfter=24)
cover_subtitle = ParagraphStyle('CoverSubtitle', fontName='SimHei', fontSize=18, leading=26, alignment=TA_CENTER, spaceAfter=18)
h1_style = ParagraphStyle('H1', fontName='Microsoft YaHei', fontSize=18, leading=26, alignment=TA_LEFT, spaceBefore=20, spaceAfter=12, textColor=colors.HexColor('#1F4E79'))
h2_style = ParagraphStyle('H2', fontName='Microsoft YaHei', fontSize=14, leading=22, alignment=TA_LEFT, spaceBefore=16, spaceAfter=8, textColor=colors.HexColor('#2E75B6'))
h3_style = ParagraphStyle('H3', fontName='Microsoft YaHei', fontSize=12, leading=18, alignment=TA_LEFT, spaceBefore=12, spaceAfter=6, textColor=colors.HexColor('#5B9BD5'))
body_style = ParagraphStyle('Body', fontName='SimHei', fontSize=10.5, leading=17, alignment=TA_LEFT, spaceBefore=4, spaceAfter=4, firstLineIndent=20, wordWrap='CJK')
code_style = ParagraphStyle('Code', fontName='Times New Roman', fontSize=9, leading=13, alignment=TA_LEFT, spaceBefore=4, spaceAfter=4, leftIndent=20, backColor=colors.HexColor('#F5F5F5'))
tbl_header = ParagraphStyle('TblHeader', fontName='Microsoft YaHei', fontSize=10, leading=14, alignment=TA_CENTER, textColor=colors.white)
tbl_cell = ParagraphStyle('TblCell', fontName='SimHei', fontSize=9, leading=13, alignment=TA_CENTER, wordWrap='CJK')
tbl_cell_left = ParagraphStyle('TblCellLeft', fontName='SimHei', fontSize=9, leading=13, alignment=TA_LEFT, wordWrap='CJK')
caption_style = ParagraphStyle('Caption', fontName='SimHei', fontSize=9, leading=13, alignment=TA_CENTER, spaceBefore=4, spaceAfter=10, textColor=colors.HexColor('#666'))

# Document
output_path = '/home/z/my-project/download/DataSphere_Innovation_Plan_Action.pdf'
doc = SimpleDocTemplate(output_path, pagesize=A4, rightMargin=2*cm, leftMargin=2*cm, topMargin=2*cm, bottomMargin=2*cm, title='DataSphere_Innovation_Plan_Action', author='Z.ai', creator='Z.ai', subject='Plan d\'action detaille pour les recommandations')

story = []

# Cover
story.append(Spacer(1, 80))
story.append(Paragraph('<b>DataSphere Innovation</b>', cover_title))
story.append(Spacer(1, 20))
story.append(Paragraph('Plan d\'Action Detaille', cover_subtitle))
story.append(Paragraph('Recommandations d\'Amelioration', cover_subtitle))
story.append(Spacer(1, 50))
story.append(Paragraph('Implementation des Ameliorations Prioritaires', ParagraphStyle('Info', fontName='SimHei', fontSize=14, leading=22, alignment=TA_CENTER)))
story.append(Spacer(1, 60))
story.append(Paragraph('Janvier 2025', ParagraphStyle('Date', fontName='SimHei', fontSize=12, leading=18, alignment=TA_CENTER)))
story.append(PageBreak())

# 1. PRIORITE 0 - TESTS
story.append(Paragraph('<b>1. PRIORITE 0 - Suite de Tests Automatises</b>', h1_style))
story.append(Spacer(1, 8))

story.append(Paragraph('<b>1.1 Contexte et Enjeux</b>', h2_style))
story.append(Paragraph(
    'L\'absence de tests automatises constitue le risque le plus critique pour le projet DataSphere Innovation. '
    'Sans verification automatique, chaque modification du code peut introduire des regressions non detectees '
    'jusqu\'en production. Cette situation est particulierement dangereuse pour les modules de securite et de '
    'facturation ou les erreurs peuvent avoir des consequences financieres et juridiques majeures.',
    body_style
))

story.append(Paragraph('<b>1.2 Architecture de Tests Proposee</b>', h2_style))

# Test architecture table
test_arch_data = [
    [Paragraph('<b>Type</b>', tbl_header), Paragraph('<b>Outil</b>', tbl_header), Paragraph('<b>Couverture Cible</b>', tbl_header), Paragraph('<b>Modules Prioritaires</b>', tbl_header)],
    [Paragraph('Unitaires', tbl_cell), Paragraph('Vitest', tbl_cell), Paragraph('80%', tbl_cell), Paragraph('Security, Billing, Lineage', tbl_cell_left)],
    [Paragraph('Integration', tbl_cell), Paragraph('Vitest + MSW', tbl_cell), Paragraph('70%', tbl_cell), Paragraph('API Routes, Connectors', tbl_cell_left)],
    [Paragraph('E2E', tbl_cell), Paragraph('Playwright', tbl_cell), Paragraph('Parcours critiques', tbl_cell), Paragraph('Auth, Pipeline, Export', tbl_cell_left)],
    [Paragraph('Performance', tbl_cell), Paragraph('Lighthouse CI', tbl_cell), Paragraph('Score > 90', tbl_cell), Paragraph('Landing, Dashboard', tbl_cell_left)],
    [Paragraph('Securite', tbl_cell), Paragraph('OWASP ZAP', tbl_cell), Paragraph('0 vulns critiques', tbl_cell), Paragraph('Auth, API, Secrets', tbl_cell_left)],
]

test_table = Table(test_arch_data, colWidths=[2.5*cm, 3*cm, 3.5*cm, 5*cm])
test_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
]))
story.append(Spacer(1, 8))
story.append(test_table)
story.append(Paragraph('Tableau 1: Architecture de tests proposee', caption_style))

story.append(Paragraph('<b>1.3 Tests Unitaires - Modules Critiques</b>', h2_style))

story.append(Paragraph('<b>Module EncryptionService</b>', h3_style))
story.append(Paragraph(
    'Le service de chiffrement necessite une couverture complete incluant: chiffrement/dechiffrement AES-256-GCM, '
    'generation de cles securisees, hachage et verification de mots de passe, generation de tokens et API keys. '
    'Chaque test doit verifier a la fois le cas nominal et les cas d\'erreur.',
    body_style
))

story.append(Paragraph(
    'Tests a implementer: encrypt_decrypt_success, encrypt_produces_different_ciphertext, '
    'decrypt_fails_with_wrong_tag, hash_verify_success, hash_verify_failure, generate_unique_api_keys.',
    body_style
))

story.append(Paragraph('<b>Module BillingService</b>', h3_style))
story.append(Paragraph(
    'Le service de facturation gere les abonnements Stripe et doit etre teste rigoureusement. '
    'Les tests doivent couvrir la creation d\'abonnements, les upgrades/downgrades avec proration, '
    'les annulations et reactivations, la verification des limites par plan, et les webhooks Stripe.',
    body_style
))

story.append(Paragraph('<b>Module DataLineageEngine</b>', h3_style))
story.append(Paragraph(
    'Le moteur de lineage doit etre teste pour les operations CRUD sur les noeuds et arcs, '
    'les requetes upstream/downstream, l\'analyse d\'impact avec calcul du niveau de risque, '
    'et l\'import depuis les manifests dbt.',
    body_style
))

story.append(Paragraph('<b>1.4 Estimation et Planning</b>', h2_style))

effort_data = [
    [Paragraph('<b>Tache</b>', tbl_header), Paragraph('<b>Effort</b>', tbl_header), Paragraph('<b>Dependances</b>', tbl_header)],
    [Paragraph('Configuration Vitest', tbl_cell_left), Paragraph('0.5 jour', tbl_cell), Paragraph('Aucune', tbl_cell)],
    [Paragraph('Tests Security Module', tbl_cell_left), Paragraph('2 jours', tbl_cell), Paragraph('Config Vitest', tbl_cell)],
    [Paragraph('Tests Billing Module', tbl_cell_left), Paragraph('2 jours', tbl_cell), Paragraph('Config Vitest', tbl_cell)],
    [Paragraph('Tests Lineage Module', tbl_cell_left), Paragraph('1.5 jours', tbl_cell), Paragraph('Config Vitest', tbl_cell)],
    [Paragraph('Tests Connecteurs', tbl_cell_left), Paragraph('1 jour', tbl_cell), Paragraph('Config Vitest', tbl_cell)],
    [Paragraph('Configuration Playwright E2E', tbl_cell_left), Paragraph('1 jour', tbl_cell), Paragraph('Tests unitaires', tbl_cell)],
    [Paragraph('Tests E2E parcours critiques', tbl_cell_left), Paragraph('2 jours', tbl_cell), Paragraph('Playwright config', tbl_cell)],
    [Paragraph('<b>TOTAL</b>', tbl_cell_left), Paragraph('<b>10 jours</b>', tbl_cell), Paragraph('-', tbl_cell)],
]

effort_table = Table(effort_data, colWidths=[6*cm, 3*cm, 5*cm])
effort_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2E7D32')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 6), colors.white),
    ('BACKGROUND', (0, 7), (-1, 7), colors.HexColor('#E8F5E9')),
    ('BACKGROUND', (0, 8), (-1, 8), colors.HexColor('#C8E6C9')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
]))
story.append(Spacer(1, 8))
story.append(effort_table)
story.append(Paragraph('Tableau 2: Estimation effort tests', caption_style))
story.append(PageBreak())

# 2. PRIORITE 1 - INFRASTRUCTURE
story.append(Paragraph('<b>2. PRIORITE 1 - Infrastructure et Base de Donnees</b>', h1_style))
story.append(Spacer(1, 8))

story.append(Paragraph('<b>2.1 Migration SQLite vers PostgreSQL</b>', h2_style))

story.append(Paragraph(
    'SQLite presente des limitations majeures pour une application SaaS enterprise: pas de connexions concurrentes '
    'en ecriture, pas de scalabilite horizontale, pas de replication, limites de taille. La migration vers '
    'PostgreSQL est indispensable pour supporter la croissance.',
    body_style
))

story.append(Paragraph('<b>Etapes de Migration</b>', h3_style))

migration_steps = [
    ('1. Preparation', 'Installer PostgreSQL, creer les environnements dev/staging/prod, configurer connection pooling (PgBouncer)'),
    ('2. Ajustement Schema', 'Modifier schema.prisma pour PostgreSQL, gerer les types specifiques (UUID, JSONB), ajouter indexes'),
    ('3. Migration Donnees', 'Exporter SQLite, transformer les donnees, importer PostgreSQL, valider integrite'),
    ('4. Validation', 'Tests de regression complets, verification performances, validation metier'),
    ('5. Deploiement', 'Migration blue-green, monitoring post-migration, rollback plan'),
]

for step, desc in migration_steps:
    story.append(Paragraph(f'<b>{step}</b>: {desc}', body_style))

story.append(Paragraph('<b>2.2 Monitoring et Observabilite</b>', h2_style))

story.append(Paragraph(
    'Un systeme de monitoring complet a ete implemente dans src/lib/monitoring/. Il inclut: '
    'collecte de metriques (counters, gauges, histograms), health checks automatiques, '
    'gestion d\'alertes configurable, export Prometheus-compatible.',
    body_style
))

# Monitoring features
monitoring_data = [
    [Paragraph('<b>Composant</b>', tbl_header), Paragraph('<b>Description</b>', tbl_header), Paragraph('<b>Status</b>', tbl_header)],
    [Paragraph('MetricsCollector', tbl_cell_left), Paragraph('Compteurs, jauges, histograms avec labels', tbl_cell_left), Paragraph('Implemente', tbl_cell)],
    [Paragraph('HealthCheckSystem', tbl_cell_left), Paragraph('Checks DB, memory, latency, error rate', tbl_cell_left), Paragraph('Implemente', tbl_cell)],
    [Paragraph('AlertManager', tbl_cell_left), Paragraph('Alertes configurables avec cooldown', tbl_cell_left), Paragraph('Implemente', tbl_cell)],
    [Paragraph('API /api/health', tbl_cell_left), Paragraph('Endpoint health check pour load balancers', tbl_cell_left), Paragraph('Implemente', tbl_cell)],
    [Paragraph('API /api/metrics', tbl_cell_left), Paragraph('Export metriques Prometheus/JSON', tbl_cell_left), Paragraph('Implemente', tbl_cell)],
]

monitoring_table = Table(monitoring_data, colWidths=[4*cm, 7*cm, 3*cm])
monitoring_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#6A1B9A')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#F3E5F5')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#F3E5F5')),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
]))
story.append(Spacer(1, 8))
story.append(monitoring_table)
story.append(Paragraph('Tableau 3: Composants monitoring implementes', caption_style))

story.append(Paragraph('<b>2.3 CI/CD avec GitHub Actions</b>', h2_style))

story.append(Paragraph(
    'Un workflow CI/CD complet a ete configure dans .github/workflows/ci.yml. Il automatise: '
    'lint et type check, tests unitaires avec coverage, tests d\'integration avec PostgreSQL, '
    'tests E2E avec Playwright, scan de securite, build et deploiement staging/production.',
    body_style
))

# CI/CD stages
cicd_data = [
    [Paragraph('<b>Job</b>', tbl_header), Paragraph('<b>Trigger</b>', tbl_header), Paragraph('<b>Actions</b>', tbl_header)],
    [Paragraph('lint', tbl_cell), Paragraph('Push/PR', tbl_cell), Paragraph('ESLint, TypeScript check', tbl_cell_left)],
    [Paragraph('test', tbl_cell), Paragraph('Apres lint', tbl_cell), Paragraph('Vitest avec coverage', tbl_cell_left)],
    [Paragraph('test-integration', tbl_cell), Paragraph('Apres test', tbl_cell), Paragraph('PostgreSQL service', tbl_cell_left)],
    [Paragraph('test-e2e', tbl_cell), Paragraph('Apres test', tbl_cell), Paragraph('Playwright sur build', tbl_cell_left)],
    [Paragraph('security', tbl_cell), Paragraph('Apres lint', tbl_cell), Paragraph('npm audit, Snyk', tbl_cell_left)],
    [Paragraph('build', tbl_cell), Paragraph('Tests OK', tbl_cell), Paragraph('Next.js build', tbl_cell_left)],
    [Paragraph('deploy-staging', tbl_cell), Paragraph('develop branch', tbl_cell), Paragraph('Auto-deploy', tbl_cell_left)],
    [Paragraph('deploy-production', tbl_cell), Paragraph('main branch', tbl_cell), Paragraph('Auto-deploy + tag', tbl_cell_left)],
]

cicd_table = Table(cicd_data, colWidths=[3.5*cm, 3*cm, 7.5*cm])
cicd_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F57C00')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#FFF3E0')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#FFF3E0')),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('BACKGROUND', (0, 6), (-1, 6), colors.HexColor('#FFF3E0')),
    ('BACKGROUND', (0, 7), (-1, 7), colors.white),
    ('BACKGROUND', (0, 8), (-1, 8), colors.HexColor('#FFF3E0')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
]))
story.append(Spacer(1, 8))
story.append(cicd_table)
story.append(Paragraph('Tableau 4: Pipeline CI/CD GitHub Actions', caption_style))
story.append(PageBreak())

# 3. GESTION D'ERREURS
story.append(Paragraph('<b>3. PRIORITE 2 - Gestion d\'Erreurs Centralisee</b>', h1_style))
story.append(Spacer(1, 8))

story.append(Paragraph('<b>3.1 Systeme Implemente</b>', h2_style))

story.append(Paragraph(
    'Un systeme complet de gestion d\'erreurs a ete implemente dans src/lib/error-handler/. '
    'Il fournit une classification standardisee des erreurs, des classes d\'erreurs personnalisées, '
    'un handler centralise avec logging et audit, et des strategies de recuperation.',
    body_style
))

story.append(Paragraph('<b>Classes d\'Erreurs Disponibles</b>', h3_style))

error_classes = [
    ('ValidationError', 'Erreurs de validation des donnees d\'entree (HTTP 400)'),
    ('AuthenticationError', 'Echecs d\'authentification (HTTP 401)'),
    ('AuthorizationError', 'Acces non autorises (HTTP 403)'),
    ('NotFoundError', 'Ressources non trouvees (HTTP 404)'),
    ('ConflictError', 'Conflits de ressources (HTTP 409)'),
    ('RateLimitError', 'Limites de taux depassees (HTTP 429)'),
    ('ExternalServiceError', 'Erreurs services externes (HTTP 502)'),
    ('DatabaseError', 'Erreurs base de donnees (HTTP 500)'),
    ('SubscriptionLimitError', 'Limites d\'abonnement (HTTP 402)'),
    ('SecurityError', 'Incidents de securite (HTTP 403)'),
]

for cls, desc in error_classes:
    story.append(Paragraph(f'<b>{cls}</b>: {desc}', body_style))

story.append(Paragraph('<b>3.2 Codes d\'Erreur Standardises</b>', h2_style))

story.append(Paragraph(
    'Chaque erreur dispose d\'un code unique facilitant le debugging et le support. '
    'Les codes sont organises par categorie: 1xxx validation, 2xxx authentification, '
    '3xxx autorisation, 4xxx not found, 5xxx conflit, 6xxx rate limit, 7xxx externe, '
    '8xxx base de donnees, 9xxx business logic, Sxxx securite.',
    body_style
))

story.append(Paragraph('<b>3.3 Integration avec Security Audit</b>', h2_style))

story.append(Paragraph(
    'Les erreurs de securite sont automatiquement auditees via le module Security.Audit.log. '
    'Cela garantit une trace complete des incidents pour les audits de conformite SOC2, RGPD, HIPAA.',
    body_style
))
story.append(PageBreak())

# 4. RECOMMANDATIONS FUTURES
story.append(Paragraph('<b>4. Recommandations Futures</b>', h1_style))
story.append(Spacer(1, 8))

story.append(Paragraph('<b>4.1 Court Terme (2-4 semaines)</b>', h2_style))

short_term = [
    ('Completion tests', 'Atteindre 80% couverture sur modules critiques'),
    ('Migration PostgreSQL', 'Deploiement en staging, validation, migration production'),
    ('Integration Sentry', 'Tracking erreurs production avec sourcemaps'),
    ('Documentation API', 'Generation OpenAPI automatique depuis types'),
]

for item, desc in short_term:
    story.append(Paragraph(f'<b>{item}</b>: {desc}', body_style))

story.append(Paragraph('<b>4.2 Moyen Terme (1-3 mois)</b>', h2_style))

medium_term = [
    ('Caching Redis', 'Implementation caching pour metriques et sessions'),
    ('CDN Configuration', 'Static assets via CDN (Cloudflare/Vercel)'),
    ('Auto-scaling', 'Configuration Kubernetes/ECS pour scaling horizontal'),
    ('DRS/BCP', 'Plan reprise activite et continuite business'),
]

for item, desc in medium_term:
    story.append(Paragraph(f'<b>{item}</b>: {desc}', body_style))

story.append(Paragraph('<b>4.3 Long Terme (3-6 mois)</b>', h2_style))

long_term = [
    ('Multi-region', 'Deploiement multi-region pour resilience'),
    ('SOC2 Certification', 'Audit et certification SOC2 Type II'),
    ('Performance', 'Optimisation requetes, indexing, connection pooling'),
    ('Feature Flags', 'Systeme feature flags pour deploiements progressifs'),
]

for item, desc in long_term:
    story.append(Paragraph(f'<b>{item}</b>: {desc}', body_style))

# Summary
story.append(Spacer(1, 20))
story.append(Paragraph('<b>5. Synthese des Actions Implementees</b>', h1_style))
story.append(Spacer(1, 8))

summary_data = [
    [Paragraph('<b>Action</b>', tbl_header), Paragraph('<b>Status</b>', tbl_header), Paragraph('<b>Fichier</b>', tbl_header)],
    [Paragraph('Gestion erreurs centralisee', tbl_cell_left), Paragraph('Implemente', tbl_cell), Paragraph('src/lib/error-handler/index.ts', tbl_cell_left)],
    [Paragraph('Systeme monitoring', tbl_cell_left), Paragraph('Implemente', tbl_cell), Paragraph('src/lib/monitoring/index.ts', tbl_cell_left)],
    [Paragraph('API health check', tbl_cell_left), Paragraph('Implemente', tbl_cell), Paragraph('src/app/api/health/route.ts', tbl_cell_left)],
    [Paragraph('API metriques', tbl_cell_left), Paragraph('Implemente', tbl_cell), Paragraph('src/app/api/metrics/route.ts', tbl_cell_left)],
    [Paragraph('Tests unitaires', tbl_cell_left), Paragraph('Implemente', tbl_cell), Paragraph('src/__tests__/lib/core-modules.test.ts', tbl_cell_left)],
    [Paragraph('Configuration Vitest', tbl_cell_left), Paragraph('Implemente', tbl_cell), Paragraph('vitest.config.ts', tbl_cell_left)],
    [Paragraph('CI/CD GitHub Actions', tbl_cell_left), Paragraph('Implemente', tbl_cell), Paragraph('.github/workflows/ci.yml', tbl_cell_left)],
    [Paragraph('Scripts tests package.json', tbl_cell_left), Paragraph('Implemente', tbl_cell), Paragraph('package.json (scripts)', tbl_cell_left)],
]

summary_table = Table(summary_data, colWidths=[5*cm, 3*cm, 6*cm])
summary_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#E8F5E9')),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#E8F5E9')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.HexColor('#E8F5E9')),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#E8F5E9')),
    ('BACKGROUND', (0, 5), (-1, 5), colors.HexColor('#E8F5E9')),
    ('BACKGROUND', (0, 6), (-1, 6), colors.HexColor('#E8F5E9')),
    ('BACKGROUND', (0, 7), (-1, 7), colors.HexColor('#E8F5E9')),
    ('BACKGROUND', (0, 8), (-1, 8), colors.HexColor('#E8F5E9')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
]))
story.append(Spacer(1, 8))
story.append(summary_table)
story.append(Paragraph('Tableau 5: Synthese des actions implementees', caption_style))

# Build
doc.build(story)
print(f"PDF generated: {output_path}")
