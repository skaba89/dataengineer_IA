#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DataSphere Innovation - Analyse du Projet
Rapport complet avec points forts et points faibles
"""

from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, 
    PageBreak, Image
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
import os

# ==================== FONT REGISTRATION ====================
pdfmetrics.registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))
pdfmetrics.registerFont(TTFont('Microsoft YaHei', '/usr/share/fonts/truetype/chinese/msyh.ttf'))
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))
pdfmetrics.registerFont(TTFont('Calibri', '/usr/share/fonts/truetype/english/calibri-regular.ttf'))

registerFontFamily('Microsoft YaHei', normal='Microsoft YaHei', bold='Microsoft YaHei')
registerFontFamily('SimHei', normal='SimHei', bold='SimHei')
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')

# ==================== STYLES ====================
styles = getSampleStyleSheet()

# Cover styles
cover_title = ParagraphStyle(
    name='CoverTitle',
    fontName='Microsoft YaHei',
    fontSize=36,
    leading=44,
    alignment=TA_CENTER,
    spaceAfter=36
)

cover_subtitle = ParagraphStyle(
    name='CoverSubtitle',
    fontName='SimHei',
    fontSize=18,
    leading=26,
    alignment=TA_CENTER,
    spaceAfter=24
)

cover_info = ParagraphStyle(
    name='CoverInfo',
    fontName='SimHei',
    fontSize=14,
    leading=22,
    alignment=TA_CENTER,
    spaceAfter=12
)

# Heading styles
h1_style = ParagraphStyle(
    name='Heading1CN',
    fontName='Microsoft YaHei',
    fontSize=20,
    leading=28,
    alignment=TA_LEFT,
    spaceBefore=24,
    spaceAfter=12,
    textColor=colors.HexColor('#1F4E79')
)

h2_style = ParagraphStyle(
    name='Heading2CN',
    fontName='Microsoft YaHei',
    fontSize=16,
    leading=24,
    alignment=TA_LEFT,
    spaceBefore=18,
    spaceAfter=10,
    textColor=colors.HexColor('#2E75B6')
)

h3_style = ParagraphStyle(
    name='Heading3CN',
    fontName='Microsoft YaHei',
    fontSize=13,
    leading=20,
    alignment=TA_LEFT,
    spaceBefore=12,
    spaceAfter=8,
    textColor=colors.HexColor('#5B9BD5')
)

# Body styles
body_style = ParagraphStyle(
    name='BodyCN',
    fontName='SimHei',
    fontSize=11,
    leading=18,
    alignment=TA_LEFT,
    spaceBefore=6,
    spaceAfter=6,
    firstLineIndent=24,
    wordWrap='CJK'
)

body_no_indent = ParagraphStyle(
    name='BodyNoIndent',
    fontName='SimHei',
    fontSize=11,
    leading=18,
    alignment=TA_LEFT,
    spaceBefore=6,
    spaceAfter=6,
    wordWrap='CJK'
)

# Table styles
tbl_header = ParagraphStyle(
    name='TableHeader',
    fontName='Microsoft YaHei',
    fontSize=10,
    leading=14,
    alignment=TA_CENTER,
    textColor=colors.white
)

tbl_cell = ParagraphStyle(
    name='TableCell',
    fontName='SimHei',
    fontSize=10,
    leading=14,
    alignment=TA_CENTER,
    wordWrap='CJK'
)

tbl_cell_left = ParagraphStyle(
    name='TableCellLeft',
    fontName='SimHei',
    fontSize=10,
    leading=14,
    alignment=TA_LEFT,
    wordWrap='CJK'
)

# Caption style
caption_style = ParagraphStyle(
    name='Caption',
    fontName='SimHei',
    fontSize=10,
    leading=14,
    alignment=TA_CENTER,
    spaceBefore=6,
    spaceAfter=12,
    textColor=colors.HexColor('#666666')
)

# ==================== BUILD DOCUMENT ====================
output_path = '/home/z/my-project/download/DataSphere_Innovation_Analyse_Projet.pdf'
doc = SimpleDocTemplate(
    output_path,
    pagesize=A4,
    rightMargin=2*cm,
    leftMargin=2*cm,
    topMargin=2*cm,
    bottomMargin=2*cm,
    title='DataSphere_Innovation_Analyse_Projet',
    author='Z.ai',
    creator='Z.ai',
    subject='Analyse complete du projet DataSphere Innovation avec points forts et faibles'
)

story = []

# ==================== COVER PAGE ====================
story.append(Spacer(1, 100))
story.append(Paragraph('<b>DataSphere Innovation</b>', cover_title))
story.append(Spacer(1, 24))
story.append(Paragraph('Analyse du Projet', cover_subtitle))
story.append(Paragraph('Points Forts et Points Faibles', cover_subtitle))
story.append(Spacer(1, 60))
story.append(Paragraph('Plateforme SaaS de Data Engineering pilote par IA', cover_info))
story.append(Spacer(1, 80))
story.append(Paragraph('Version 0.2.0', cover_info))
story.append(Paragraph('Janvier 2025', cover_info))
story.append(PageBreak())

# ==================== TABLE OF CONTENTS ====================
story.append(Paragraph('<b>Sommaire</b>', h1_style))
story.append(Spacer(1, 12))

toc_items = [
    ('1. Resume Executif', '3'),
    ('2. Architecture Technique', '4'),
    ('3. Fonctionnalites Implementees', '5'),
    ('4. Points Forts du Projet', '7'),
    ('5. Points Faibles et Lacunes', '9'),
    ('6. Analyse des Risques', '11'),
    ('7. Recommandations', '12'),
    ('8. Conclusion', '13'),
]

for title, page in toc_items:
    story.append(Paragraph(f'{title} {"." * 60} {page}', body_no_indent))
story.append(PageBreak())

# ==================== 1. RESUME EXECUTIF ====================
story.append(Paragraph('<b>1. Resume Executif</b>', h1_style))
story.append(Spacer(1, 12))

story.append(Paragraph(
    'DataSphere Innovation est une plateforme SaaS de data engineering pilotée par intelligence artificielle, '
    'conçue pour automatiser et accélérer la création de pipelines de données professionnels. Le projet a évolué '
    'depuis une initiale "AI Data Engineering System" vers une solution complète avec branding professionnel, '
    'support enterprise et fonctionnalités avancées de sécurité.',
    body_style
))

story.append(Paragraph(
    'Le système repose sur une architecture moderne utilisant Next.js 16 avec App Router, TypeScript pour la '
    'sécurité du typage, Prisma ORM pour l\'abstraction de base de données, et NextAuth.js pour l\'authentification. '
    'Cette stack technologique assure maintenabilité, performance et évolutivité au projet.',
    body_style
))

story.append(Paragraph('<b>1.1 Indicateurs Cles</b>', h2_style))

# Key metrics table
metrics_data = [
    [Paragraph('<b>Indicateur</b>', tbl_header), Paragraph('<b>Valeur</b>', tbl_header), Paragraph('<b>Statut</b>', tbl_header)],
    [Paragraph('Connecteurs Multi-Secteurs', tbl_cell), Paragraph('35+', tbl_cell), Paragraph('Operationnel', tbl_cell)],
    [Paragraph('Fournisseurs SSO Enterprise', tbl_cell), Paragraph('8', tbl_cell), Paragraph('Operationnel', tbl_cell)],
    [Paragraph('Plans Tarifaires', tbl_cell), Paragraph('4', tbl_cell), Paragraph('Operationnel', tbl_cell)],
    [Paragraph('Frameworks Compliance', tbl_cell), Paragraph('5', tbl_cell), Paragraph('Operationnel', tbl_cell)],
    [Paragraph('Endpoints API', tbl_cell), Paragraph('40+', tbl_cell), Paragraph('Operationnel', tbl_cell)],
    [Paragraph('Composants UI Shadcn', tbl_cell), Paragraph('50+', tbl_cell), Paragraph('Operationnel', tbl_cell)],
    [Paragraph('Lignes de Code (Security)', tbl_cell), Paragraph('1,200+', tbl_cell), Paragraph('Operationnel', tbl_cell)],
]

metrics_table = Table(metrics_data, colWidths=[5.5*cm, 3.5*cm, 4*cm])
metrics_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('BACKGROUND', (0, 6), (-1, 6), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 7), (-1, 7), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))
story.append(Spacer(1, 12))
story.append(metrics_table)
story.append(Paragraph('Tableau 1: Indicateurs cles du projet DataSphere Innovation', caption_style))
story.append(PageBreak())

# ==================== 2. ARCHITECTURE TECHNIQUE ====================
story.append(Paragraph('<b>2. Architecture Technique</b>', h1_style))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>2.1 Stack Technologique</b>', h2_style))

story.append(Paragraph(
    'L\'architecture technique de DataSphere Innovation a été soigneusement conçue pour répondre aux exigences '
    'd\'une plateforme SaaS enterprise moderne. Le choix des technologies privilégie la robustesse, la maintenabilité '
    'et l\'écosystème actif. Next.js 16 offre le rendu côté serveur optimisé et les Server Components pour de '
    'meilleures performances, tandis que TypeScript assure une base de code robuste et moins sujette aux erreurs.',
    body_style
))

# Tech stack table
tech_data = [
    [Paragraph('<b>Categorie</b>', tbl_header), Paragraph('<b>Technologie</b>', tbl_header), Paragraph('<b>Version</b>', tbl_header)],
    [Paragraph('Framework Frontend', tbl_cell_left), Paragraph('Next.js', tbl_cell), Paragraph('16.1.1', tbl_cell)],
    [Paragraph('Langage', tbl_cell_left), Paragraph('TypeScript', tbl_cell), Paragraph('5.x', tbl_cell)],
    [Paragraph('Styling', tbl_cell_left), Paragraph('Tailwind CSS', tbl_cell), Paragraph('4.x', tbl_cell)],
    [Paragraph('UI Components', tbl_cell_left), Paragraph('shadcn/ui + Radix', tbl_cell), Paragraph('Latest', tbl_cell)],
    [Paragraph('ORM', tbl_cell_left), Paragraph('Prisma', tbl_cell), Paragraph('6.11.1', tbl_cell)],
    [Paragraph('Base de Donnees', tbl_cell_left), Paragraph('SQLite', tbl_cell), Paragraph('3.x', tbl_cell)],
    [Paragraph('Authentification', tbl_cell_left), Paragraph('NextAuth.js', tbl_cell), Paragraph('5.0.0-beta.30', tbl_cell)],
    [Paragraph('Paiements', tbl_cell_left), Paragraph('Stripe', tbl_cell), Paragraph('API 2024-11-20', tbl_cell)],
    [Paragraph('State Management', tbl_cell_left), Paragraph('Zustand', tbl_cell), Paragraph('5.0.6', tbl_cell)],
    [Paragraph('Graphiques', tbl_cell_left), Paragraph('Recharts', tbl_cell), Paragraph('2.15.4', tbl_cell)],
]

tech_table = Table(tech_data, colWidths=[4.5*cm, 5*cm, 3.5*cm])
tech_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('BACKGROUND', (0, 6), (-1, 6), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 7), (-1, 7), colors.white),
    ('BACKGROUND', (0, 8), (-1, 8), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 9), (-1, 9), colors.white),
    ('BACKGROUND', (0, 10), (-1, 10), colors.HexColor('#F5F5F5')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
]))
story.append(Spacer(1, 12))
story.append(tech_table)
story.append(Paragraph('Tableau 2: Stack technologique du projet', caption_style))

story.append(Paragraph('<b>2.2 Modele de Donnees</b>', h2_style))

story.append(Paragraph(
    'Le modèle de données Prisma définit 27 modèles couvrant l\'authentification, les organisations multi-tenant, '
    'les projets data engineering, les notifications, la sécurité et la conformité. Cette architecture permet une '
    'séparation claire des préoccupations et une évolutivité maîtrisée. Les relations sont optimisées pour les '
    'requêtes fréquentes avec des indexes appropriés sur les champs de recherche courants.',
    body_style
))

story.append(Paragraph(
    'Les modèles de sécurité incluent AuditLog pour la traçabilité, SecurityEvent pour la détection d\'intrusion, '
    'Secret pour la gestion des secrets chiffrés, IpRule pour le contrôle d\'accès réseau, ComplianceReport pour '
    'les audits réglementaires, et Vulnerability pour la gestion des failles de sécurité. Cette couverture '
    'complète répond aux exigences enterprise les plus strictes.',
    body_style
))
story.append(PageBreak())

# ==================== 3. FONCTIONNALITES IMPLEMENTEES ====================
story.append(Paragraph('<b>3. Fonctionnalites Implementees</b>', h1_style))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>3.1 SSO Enterprise (SAML/OIDC)</b>', h2_style))

story.append(Paragraph(
    'Le module SSO Enterprise supporte 8 fournisseurs d\'identité majeurs: Microsoft Entra ID (Azure AD), '
    'Okta, Google Workspace, Auth0, Keycloak, Ping Identity, OneLogin et JumpCloud. L\'implémentation '
    'respecte les protocoles SAML 2.0 et OpenID Connect avec gestion automatique du provisioning JIT '
    '(Just-In-Time) des utilisateurs et synchronisation des attributs utilisateur depuis les annuaires LDAP/AD.',
    body_style
))

story.append(Paragraph(
    'La configuration permet le mapping flexible des attributs, la gestion des groupes et rôles, et '
    'l\'application de politiques de sécurité granulaires par fournisseur d\'identité. Un dashboard dédié '
    'offre une visualisation en temps réel des connexions SSO et des statistiques d\'utilisation.',
    body_style
))

story.append(Paragraph('<b>3.2 Connecteurs Multi-Secteurs</b>', h2_style))

story.append(Paragraph(
    'La plateforme intègre plus de 35 connecteurs couvrant 6 secteurs d\'activité majeurs. Les connecteurs '
    'e-commerce incluent Shopify, Magento, WooCommerce pour les données de ventes et clients. Les connecteurs '
    'finance comprennent Plaid, Stripe Analytics, Bloomberg pour les transactions et données de marché. '
    'Les connecteurs CRM intègrent Salesforce, HubSpot pour la gestion de la relation client.',
    body_style
))

story.append(Paragraph(
    'Le système de connecteurs implémente un pattern BaseConnector avec méthodes standardisées testConnection() '
    'et discoverSchema(). Chaque connecteur expose des métadonnées riches incluant les types de données supportés, '
    'les fonctionnalités disponibles (read, write, webhooks, incremental_sync), et les exigences SSL. '
    'L\'architecture permet l\'ajout facile de nouveaux connecteurs via extension de classe.',
    body_style
))

story.append(Paragraph('<b>3.3 Billing et Monetisation Stripe</b>', h2_style))

story.append(Paragraph(
    'Le système de facturation Stripe implémente 4 plans tarifaires adaptés aux différents segments de clientèle. '
    'Le plan Starter à 499 EUR/mois cible les startups avec 1 projet et 3 sources de données. Le plan Professional '
    'à 1 499 EUR/mois offre 5 projets et support Airflow/Dagster pour les PME. Le plan Enterprise à 4 999 EUR/mois '
    'apporte projets illimités, SSO et SLA 99.9% pour les grandes entreprises. Le plan Agency à 2 999 EUR/mois '
    'propose le white-label et multi-clients pour les cabinets conseil.',
    body_style
))

story.append(Paragraph(
    'L\'intégration Stripe gère le cycle de vie complet des abonnements: création via checkout session, '
    'upgrades/downgrades avec proration, annulation immédiate ou en fin de période, réactivation, et webhook '
    'pour la synchronisation des états. Les limites par plan sont vérifiées côté serveur pour éviter les abus.',
    body_style
))

story.append(Paragraph('<b>3.4 Security and Compliance Center</b>', h2_style))

story.append(Paragraph(
    'Le centre de sécurité implémente un moteur de chiffrement AES-256-GCM avec rotation automatique des clés, '
    'un audit logging avec signatures HMAC pour garantir l\'intégrité, un gestionnaire de secrets avec tracking '
    'des accès, un système de détection d\'intrusion (IDS) analysant les patterns de connexion, et un contrôle '
    'd\'accès IP avec whitelist/blacklist CIDR.',
    body_style
))

story.append(Paragraph(
    'Les frameworks de compliance supportés incluent SOC2 pour les contrôles organisationnels, RGPD pour la '
    'protection des données européennes, HIPAA pour les données de santé, PCI-DSS pour les paiements, et '
    'ISO27001 pour la sécurité de l\'information. Chaque framework dispose d\'un ensemble de contrôles évaluables '
    'automatiquement avec génération de rapports de conformité.',
    body_style
))

story.append(Paragraph('<b>3.5 Data Lineage et Impact Analysis</b>', h2_style))

story.append(Paragraph(
    'Le moteur de data lineage implémente un graphe de dépendances bidirectionnel permettant de tracer l\'origine '
    'des données (upstream lineage) et leur impact (downstream lineage). Les noeuds du graphe représentent '
    'différentes couches: sources raw, staging, intermediate, marts et reporting. L\'analyse d\'impact '
    'calcule automatiquement le niveau de risque (low, medium, high, critical) et fournit des recommandations.',
    body_style
))

story.append(Paragraph(
    'L\'intégration avec dbt permet l\'import automatique du manifest.json pour extraire la lineage des '
    'transformations. Le système supporte également la lineage au niveau colonne avec traçabilité des '
    'transformations appliquées. L\'export est disponible en JSON, CSV et formats visuels.',
    body_style
))
story.append(PageBreak())

# ==================== 4. POINTS FORTS ====================
story.append(Paragraph('<b>4. Points Forts du Projet</b>', h1_style))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>4.1 Architecture Enterprise-Grade</b>', h2_style))

story.append(Paragraph(
    'L\'architecture du projet démontre une maturité technique remarquable avec une séparation claire des '
    'préoccupations. L\'utilisation de Next.js App Router permet une organisation modulaire avec les route groups '
    'pour les layouts distincts (marketing, dashboard). Le pattern de services (BillingService, SecurityService, '
    'LineageEngine) assure une logique métier centralisée et testable.',
    body_style
))

story.append(Paragraph(
    'Le multi-tenancy est implémenté au niveau base de données avec isolation par organizationId, permettant '
    'une véritable séparation des données entre clients. Les middlewares assurent la validation automatique '
    'des accès et l\'application des quotas par plan d\'abonnement.',
    body_style
))

story.append(Paragraph('<b>4.2 Couverture Securitaire Complete</b>', h2_style))

story.append(Paragraph(
    'Le module de sécurité dépasse 1 200 lignes de code implémentant les standards enterprise. Le chiffrement '
    'AES-256-GCM avec authentification garantit la confidentialité et l\'intégrité des données sensibles. '
    'L\'audit logging avec signatures HMAC empêche la modification rétroactive des journaux, répondant aux '
    'exigences légales de traçabilité.',
    body_style
))

story.append(Paragraph(
    'La détection d\'intrusion analyse automatiquement les patterns suspects: tentatives de brute force, '
    'activités anormales, tentatives d\'exfiltration. Le système de rate limiting protège les endpoints '
    'sensibles avec des limites différenciées par type d\'action.',
    body_style
))

story.append(Paragraph('<b>4.3 Ecosysteme de Connecteurs Etendu</b>', h2_style))

story.append(Paragraph(
    'Les 35+ connecteurs couvrent les besoins de la plupart des secteurs d\'activité. L\'architecture '
    'modulaire permet l\'ajout de nouveaux connecteurs par simple extension de classe. Chaque connecteur '
    'implémente la découverte automatique de schéma, facilitant l\'intégration avec les outils ETL/ELT.',
    body_style
))

story.append(Paragraph(
    'La normalisation des schémas de sortie permet une interoperabilité avec les data warehouses modernes '
    '(Snowflake, BigQuery, Databricks). Les connecteurs supportent la synchronisation incrémentale pour '
    'optimiser les temps de chargement sur les gros volumes.',
    body_style
))

story.append(Paragraph('<b>4.4 Modelisation de Donnees Robuste</b>', h2_style))

story.append(Paragraph(
    'Le schéma Prisma définit 27 modèles couvrant tous les aspects de la plateforme. Les relations sont '
    'optimisées avec suppression en cascade pour maintenir l\'intégrité référentielle. Les indexes sont '
    'stratégiquement placés sur les champs de recherche fréquente.',
    body_style
))

# Strengths summary table
strengths_data = [
    [Paragraph('<b>Domaine</b>', tbl_header), Paragraph('<b>Force</b>', tbl_header), Paragraph('<b>Impact</b>', tbl_header)],
    [Paragraph('Architecture', tbl_cell_left), Paragraph('Modulaire et scalable', tbl_cell_left), Paragraph('Maintenabilite accrue', tbl_cell)],
    [Paragraph('Securite', tbl_cell_left), Paragraph('AES-256-GCM, MFA, Audit logs', tbl_cell_left), Paragraph('Compliance enterprise', tbl_cell)],
    [Paragraph('Integration', tbl_cell_left), Paragraph('35+ connecteurs standardises', tbl_cell_left), Paragraph('Time-to-value reduit', tbl_cell)],
    [Paragraph('Authentification', tbl_cell_left), Paragraph('8 providers SSO, OIDC/SAML', tbl_cell_left), Paragraph('Adoption enterprise', tbl_cell)],
    [Paragraph('Monetisation', tbl_cell_left), Paragraph('4 plans, Stripe integration', tbl_cell_left), Paragraph('Revenue streams clairs', tbl_cell)],
    [Paragraph('Lineage', tbl_cell_left), Paragraph('Graphe bidirectionnel, dbt import', tbl_cell_left), Paragraph('Gouvernance data', tbl_cell)],
]

strengths_table = Table(strengths_data, colWidths=[3*cm, 6*cm, 4*cm])
strengths_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2E7D32')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#E8F5E9')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#E8F5E9')),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('BACKGROUND', (0, 6), (-1, 6), colors.HexColor('#E8F5E9')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
]))
story.append(Spacer(1, 12))
story.append(strengths_table)
story.append(Paragraph('Tableau 3: Synthese des points forts du projet', caption_style))
story.append(PageBreak())

# ==================== 5. POINTS FAIBLES ====================
story.append(Paragraph('<b>5. Points Faibles et Lacunes</b>', h1_style))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>5.1 Absence de Suite de Tests</b>', h2_style))

story.append(Paragraph(
    'Le projet manque cruellement d\'une suite de tests automatisés. Aucun fichier de test unitaire, '
    'd\'intégration ou end-to-end n\'est présent dans le codebase. Cette lacune expose le projet à des '
    'régressions lors des évolutions et complique la maintenance. Les tests manuels ne permettent pas '
    'de garantir la non-régression sur l\'ensemble des cas d\'usage.',
    body_style
))

story.append(Paragraph(
    'L\'absence de tests est particulièrement critique pour les modules de sécurité et de facturation où '
    'les erreurs peuvent avoir des conséquences financières ou juridiques. La mise en place de tests '
    'unitaires avec Jest/Vitest et de tests E2E avec Playwright devrait être une priorité absolue.',
    body_style
))

story.append(Paragraph('<b>5.2 Base de Donnees SQLite Limitante</b>', h2_style))

story.append(Paragraph(
    'L\'utilisation de SQLite comme base de données principale constitue une limitation majeure pour un '
    'produit SaaS enterprise. SQLite ne supporte pas les connexions concurrentes en écriture, limite '
    'la scalabilité horizontale, et ne dispose pas des fonctionnalités avancées des bases enterprise '
    '(partitioning, replication, failover automatique).',
    body_style
))

story.append(Paragraph(
    'La migration vers PostgreSQL ou une base cloud (Supabase, PlanetScale, Neon) devrait être planifiée '
    'pour supporter la montée en charge. Le schéma Prisma faciliterait cette migration mais les données '
    'de production nécessiteraient un plan de migration avec zero-downtime.',
    body_style
))

story.append(Paragraph('<b>5.3 Gestion d\'Erreurs Insuffisante</b>', h2_style))

story.append(Paragraph(
    'La gestion des erreurs est souvent basique avec des try/catch qui loggent simplement en console. '
    'Le manque d\'une stratégie centralisée de gestion d\'erreurs rend difficile le debugging en production '
    'et ne permet pas de remonter les problèmes aux équipes appropriées.',
    body_style
))

story.append(Paragraph(
    'L\'intégration d\'un système comme Sentry pour le tracking d\'erreurs en production, combiné à des '
    'error boundaries React pour une UX gracieuse en cas d\'erreur, améliorerait significativement la '
    'fiabilité perçue par les utilisateurs.',
    body_style
))

story.append(Paragraph('<b>5.4 Documentation Incomplete</b>', h2_style))

story.append(Paragraph(
    'Malgré un README de base et quelques fichiers de documentation, le projet manque de documentation '
    'exhaustive. Les APIs ne disposent pas de documentation OpenAPI générée automatiquement. Le guide '
    'de contribution et les standards de code ne sont pas formalisés.',
    body_style
))

story.append(Paragraph(
    'La documentation utilisateur est également lacunaire. Un système d\'aide contextuelle et des '
    'tutoriels interactifs faciliteraient l\'onboarding des nouveaux utilisateurs sur une plateforme '
    'aux fonctionnalités aussi riches.',
    body_style
))

story.append(Paragraph('<b>5.5 Monitoring et Observabilite Absents</b>', h2_style))

story.append(Paragraph(
    'Aucune solution de monitoring applicatif n\'est intégrée. Les métriques de performance, la santé '
    'des services, et les alertes automatiques ne sont pas configurées. En production, cette lacune '
    'rendrait difficile la détection proactive des incidents.',
    body_style
))

# Weaknesses table
weaknesses_data = [
    [Paragraph('<b>Lacune</b>', tbl_header), Paragraph('<b>Severite</b>', tbl_header), Paragraph('<b>Effort Correction</b>', tbl_header)],
    [Paragraph('Absence de tests automatises', tbl_cell_left), Paragraph('Critique', tbl_cell), Paragraph('Eleve (2-4 semaines)', tbl_cell)],
    [Paragraph('Base SQLite limitante', tbl_cell_left), Paragraph('Haute', tbl_cell), Paragraph('Moyen (1-2 semaines)', tbl_cell)],
    [Paragraph('Gestion erreurs insuffisante', tbl_cell_left), Paragraph('Moyenne', tbl_cell), Paragraph('Moyen (1 semaine)', tbl_cell)],
    [Paragraph('Documentation incomplete', tbl_cell_left), Paragraph('Moyenne', tbl_cell), Paragraph('Continu', tbl_cell)],
    [Paragraph('Monitoring absent', tbl_cell_left), Paragraph('Haute', tbl_cell), Paragraph('Moyen (1 semaine)', tbl_cell)],
    [Paragraph('Caching non implemente', tbl_cell_left), Paragraph('Moyenne', tbl_cell), Paragraph('Moyen (1 semaine)', tbl_cell)],
]

weaknesses_table = Table(weaknesses_data, colWidths=[5*cm, 3*cm, 5*cm])
weaknesses_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#C62828')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#FFEBEE')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#FFEBEE')),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('BACKGROUND', (0, 6), (-1, 6), colors.HexColor('#FFEBEE')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
]))
story.append(Spacer(1, 12))
story.append(weaknesses_table)
story.append(Paragraph('Tableau 4: Synthese des points faibles du projet', caption_style))
story.append(PageBreak())

# ==================== 6. ANALYSE DES RISQUES ====================
story.append(Paragraph('<b>6. Analyse des Risques</b>', h1_style))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>6.1 Risques Techniques</b>', h2_style))

story.append(Paragraph(
    'Le risque technique principal réside dans l\'absence de tests qui expose le projet à des régressions '
    'imprévues lors des évolutions. Chaque modification du code pourrait introduire des bugs non détectés '
    'jusqu\'en production. Ce risque est amplifié par la complexité des modules de sécurité et de facturation.',
    body_style
))

story.append(Paragraph(
    'Le choix de SQLite représente un risque de scalabilité. Si le produit rencontre le succès, la base '
    'de données deviendra rapidement un goulot d\'étranglement. La migration vers PostgreSQL devra être '
    'planifiée avant d\'atteindre les limites de SQLite.',
    body_style
))

story.append(Paragraph('<b>6.2 Risques Business</b>', h2_style))

story.append(Paragraph(
    'La complexité de la plateforme pourrait ralentir l\'adoption par les utilisateurs non techniques. '
    'Les 35+ connecteurs et les nombreuses options de configuration nécessitent un onboarding structuré '
    'pour éviter la frustration des nouveaux utilisateurs.',
    body_style
))

story.append(Paragraph(
    'La concurrence dans le secteur du data engineering est intense avec des acteurs comme Fivetran, '
    'Airbyte, dbt Cloud. La différenciation par l\'IA et l\'automatisation devra être clairement '
    'communiquée pour justifier le positionnement tarifaire premium.',
    body_style
))

# Risk matrix
risk_data = [
    [Paragraph('<b>Risque</b>', tbl_header), Paragraph('<b>Probabilite</b>', tbl_header), Paragraph('<b>Impact</b>', tbl_header), Paragraph('<b>Mitigation</b>', tbl_header)],
    [Paragraph('Regressions sans tests', tbl_cell_left), Paragraph('Haute', tbl_cell), Paragraph('Eleve', tbl_cell), Paragraph('Suite de tests complete', tbl_cell_left)],
    [Paragraph('Scalabilite SQLite', tbl_cell_left), Paragraph('Moyenne', tbl_cell), Paragraph('Critique', tbl_cell), Paragraph('Migration PostgreSQL', tbl_cell_left)],
    [Paragraph('Adoption utilisateur', tbl_cell_left), Paragraph('Moyenne', tbl_cell), Paragraph('Eleve', tbl_cell), Paragraph('Onboarding ameliore', tbl_cell_left)],
    [Paragraph('Concurrence', tbl_cell_left), Paragraph('Haute', tbl_cell), Paragraph('Moyen', tbl_cell), Paragraph('Differentiation IA', tbl_cell_left)],
    [Paragraph('Dependance Stripe', tbl_cell_left), Paragraph('Faible', tbl_cell), Paragraph('Eleve', tbl_cell), Paragraph('Backup payment provider', tbl_cell_left)],
]

risk_table = Table(risk_data, colWidths=[3.5*cm, 2.5*cm, 2.5*cm, 4.5*cm])
risk_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#6A1B9A')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#F3E5F5')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#F3E5F5')),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
]))
story.append(Spacer(1, 12))
story.append(risk_table)
story.append(Paragraph('Tableau 5: Matrice des risques du projet', caption_style))
story.append(PageBreak())

# ==================== 7. RECOMMANDATIONS ====================
story.append(Paragraph('<b>7. Recommandations</b>', h1_style))
story.append(Spacer(1, 12))

story.append(Paragraph('<b>7.1 Priorite 0 - Fondations (1-2 semaines)</b>', h2_style))

story.append(Paragraph(
    'La mise en place d\'une suite de tests doit être la priorité absolue. Commencer par les tests '
    'unitaires des services critiques: BillingService, EncryptionService, AuditLogger. Utiliser Vitest '
    'pour sa rapidité d\'exécution et son intégration native avec l\'écosystème Vite. Viser un minimum '
    'de 80% de couverture sur les modules critiques.',
    body_style
))

story.append(Paragraph(
    'Parallèlement, mettre en place l\'intégration continue avec GitHub Actions pour exécuter les tests '
    'à chaque pull request et empêcher les fusions de code non testé.',
    body_style
))

story.append(Paragraph('<b>7.2 Priorite 1 - Infrastructure (2-3 semaines)</b>', h2_style))

story.append(Paragraph(
    'Planifier la migration de SQLite vers PostgreSQL. Utiliser Supabase ou Neon pour une solution '
    'gérée avec connection pooling et backups automatiques. Le schéma Prisma facilitera la migration, '
    'mais prévoir une stratégie de migration des données existantes avec fenêtre de maintenance.',
    body_style
))

story.append(Paragraph(
    'Intégrer Sentry pour le monitoring d\'erreurs en production et Prometheus/Grafana pour les métriques '
    'applicatives. Configurer des alertes sur les métriques critiques: temps de réponse, taux d\'erreur, '
    'utilisation mémoire.',
    body_style
))

story.append(Paragraph('<b>7.3 Priorite 2 - Qualite (2-4 semaines)</b>', h2_style))

story.append(Paragraph(
    'Implémenter une stratégie de gestion d\'erreurs centralisée avec des classes d\'erreurs personnalisées '
    'et des handlers globaux. Documenter l\'API avec OpenAPI/Swagger et générer la documentation '
    'automatiquement à partir des types TypeScript.',
    body_style
))

story.append(Paragraph(
    'Mettre en place des tests end-to-end avec Playwright pour valider les parcours utilisateur critiques: '
    'inscription, connexion SSO, création de projet, configuration de connecteur, export de pipeline.',
    body_style
))

story.append(Paragraph('<b>7.4 Priorite 3 - Experience Utilisateur (Continu)</b>', h2_style))

story.append(Paragraph(
    'Développer un système d\'onboarding interactif avec des guides contextuels et des tutoriels vidéo. '
    'Créer une documentation utilisateur complète avec des exemples concrets par secteur d\'activité. '
    'Implémenter un système de feedback in-app pour collecter les points de friction.',
    body_style
))
story.append(PageBreak())

# ==================== 8. CONCLUSION ====================
story.append(Paragraph('<b>8. Conclusion</b>', h1_style))
story.append(Spacer(1, 12))

story.append(Paragraph(
    'DataSphere Innovation est un projet ambitieux qui démontre une vision claire du marché du data '
    'engineering automatisé. L\'architecture technique est solide, les fonctionnalités enterprise sont '
    'largement implémentées, et le positionnement tarifaire est cohérent avec la valeur apportée. '
    'La couverture des connecteurs et les capacités de sécurité sont des atouts majeurs.',
    body_style
))

story.append(Paragraph(
    'Cependant, le projet nécessite des investissements en qualité avant une mise en production à '
    'grande échelle. L\'absence de tests automatisés et la base SQLite constituent des risques '
    'techniques significatifs qui doivent être adressés en priorité. Le monitoring et l\'observabilité '
    'manquants seront critiques pour maintenir un service fiable.',
    body_style
))

story.append(Paragraph(
    'Avec les corrections recommandées, DataSphere Innovation a le potentiel de devenir une plateforme '
    'compétitive sur le marché du data engineering, notamment grâce à son approche IA-first et sa '
    'couverture multi-secteurs. La feuille de route suggérée permettrait d\'atteindre un niveau de '
    'maturité production-ready en 6-8 semaines d\'effort concentré.',
    body_style
))

# Final score table
score_data = [
    [Paragraph('<b>Critere</b>', tbl_header), Paragraph('<b>Note</b>', tbl_header), Paragraph('<b>Commentaire</b>', tbl_header)],
    [Paragraph('Architecture', tbl_cell_left), Paragraph('8/10', tbl_cell), Paragraph('Modulaire et scalable', tbl_cell_left)],
    [Paragraph('Fonctionnalites', tbl_cell_left), Paragraph('9/10', tbl_cell), Paragraph('Couverture enterprise complete', tbl_cell_left)],
    [Paragraph('Securite', tbl_cell_left), Paragraph('8/10', tbl_cell), Paragraph('Standards enterprise respectes', tbl_cell_left)],
    [Paragraph('Qualite Code', tbl_cell_left), Paragraph('6/10', tbl_cell), Paragraph('Manque tests et monitoring', tbl_cell_left)],
    [Paragraph('Documentation', tbl_cell_left), Paragraph('5/10', tbl_cell), Paragraph('Incomplete et dispersée', tbl_cell_left)],
    [Paragraph('Scalabilite', tbl_cell_left), Paragraph('5/10', tbl_cell), Paragraph('SQLite limitant', tbl_cell_left)],
    [Paragraph('SCORE GLOBAL', tbl_cell_left), Paragraph('<b>7.0/10</b>', tbl_cell), Paragraph('Potentiel eleve, corrections necessaires', tbl_cell_left)],
]

score_table = Table(score_data, colWidths=[4*cm, 2*cm, 7*cm])
score_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('BACKGROUND', (0, 6), (-1, 6), colors.HexColor('#F5F5F5')),
    ('BACKGROUND', (0, 7), (-1, 7), colors.HexColor('#E3F2FD')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
]))
story.append(Spacer(1, 24))
story.append(score_table)
story.append(Paragraph('Tableau 6: Evaluation globale du projet DataSphere Innovation', caption_style))

# Build PDF
doc.build(story)
print(f"PDF generated: {output_path}")
