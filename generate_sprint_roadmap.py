#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DataSphere Innovation - Roadmap Sprints Détaillée
Plan de développement sur 8 sprints (16 semaines)
"""

from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, 
    PageBreak, KeepTogether
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
h2_style = ParagraphStyle('H2', fontName='Microsoft YaHei', fontSize=14, leading=22, alignment=TA_LEFT, spaceBefore=14, spaceAfter=8, textColor=colors.HexColor('#2E75B6'))
h3_style = ParagraphStyle('H3', fontName='Microsoft YaHei', fontSize=12, leading=18, alignment=TA_LEFT, spaceBefore=10, spaceAfter=6, textColor=colors.HexColor('#5B9BD5'))
body_style = ParagraphStyle('Body', fontName='SimHei', fontSize=10, leading=16, alignment=TA_LEFT, spaceBefore=3, spaceAfter=3, firstLineIndent=16, wordWrap='CJK')
body_no_indent = ParagraphStyle('BodyNoIndent', fontName='SimHei', fontSize=10, leading=16, alignment=TA_LEFT, spaceBefore=3, spaceAfter=3, wordWrap='CJK')
tbl_header = ParagraphStyle('TblHeader', fontName='Microsoft YaHei', fontSize=9, leading=13, alignment=TA_CENTER, textColor=colors.white)
tbl_cell = ParagraphStyle('TblCell', fontName='SimHei', fontSize=9, leading=13, alignment=TA_CENTER, wordWrap='CJK')
tbl_cell_left = ParagraphStyle('TblCellLeft', fontName='SimHei', fontSize=9, leading=13, alignment=TA_LEFT, wordWrap='CJK')
caption_style = ParagraphStyle('Caption', fontName='SimHei', fontSize=9, leading=13, alignment=TA_CENTER, spaceBefore=4, spaceAfter=10, textColor=colors.HexColor('#666'))

# Colors for sprint status
SPRINT_COLORS = {
    'foundation': colors.HexColor('#1F4E79'),
    'infrastructure': colors.HexColor('#2E7D32'),
    'features': colors.HexColor('#F57C00'),
    'security': colors.HexColor('#C62828'),
}

def create_sprint_table(sprint_num, title, duration, objectives, tasks, deliverables, metrics):
    """Create a formatted sprint section"""
    elements = []
    
    # Sprint header
    elements.append(Paragraph(f'<b>Sprint {sprint_num} - {title}</b>', h2_style))
    elements.append(Paragraph(f'<b>Duree:</b> {duration}', body_no_indent))
    
    # Objectives
    elements.append(Paragraph('<b>Objectifs:</b>', body_no_indent))
    for obj in objectives:
        elements.append(Paragraph(f'• {obj}', body_no_indent))
    
    # Tasks table
    elements.append(Spacer(1, 6))
    task_data = [[Paragraph('<b>Tache</b>', tbl_header), Paragraph('<b>Effort</b>', tbl_header), Paragraph('<b>Responsable</b>', tbl_header), Paragraph('<b>Priorite</b>', tbl_header)]]
    for task in tasks:
        task_data.append([
            Paragraph(task[0], tbl_cell_left),
            Paragraph(task[1], tbl_cell),
            Paragraph(task[2], tbl_cell),
            Paragraph(task[3], tbl_cell),
        ])
    
    task_table = Table(task_data, colWidths=[6*cm, 2.5*cm, 3*cm, 2.5*cm])
    task_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('RIGHTPADDING', (0, 0), (-1, -1), 4),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
    ]))
    elements.append(task_table)
    
    # Deliverables
    elements.append(Spacer(1, 6))
    elements.append(Paragraph('<b>Livrables:</b>', body_no_indent))
    for deliv in deliverables:
        elements.append(Paragraph(f'✓ {deliv}', body_no_indent))
    
    # Metrics
    elements.append(Spacer(1, 4))
    elements.append(Paragraph('<b>Metriques de succes:</b>', body_no_indent))
    for metric in metrics:
        elements.append(Paragraph(f'→ {metric}', body_no_indent))
    
    elements.append(Spacer(1, 12))
    return elements

# Document
output_path = '/home/z/my-project/download/DataSphere_Innovation_Roadmap_Sprints.pdf'
doc = SimpleDocTemplate(output_path, pagesize=A4, rightMargin=1.8*cm, leftMargin=1.8*cm, topMargin=1.8*cm, bottomMargin=1.8*cm, title='DataSphere_Innovation_Roadmap_Sprints', author='Z.ai', creator='Z.ai', subject='Roadmap des sprints de developpement')

story = []

# ===== COVER PAGE =====
story.append(Spacer(1, 60))
story.append(Paragraph('<b>DataSphere Innovation</b>', cover_title))
story.append(Spacer(1, 16))
story.append(Paragraph('Roadmap des Sprints', cover_subtitle))
story.append(Paragraph('Plan de Developpement 2025', cover_subtitle))
story.append(Spacer(1, 40))
story.append(Paragraph('8 Sprints - 16 Semaines', ParagraphStyle('Info', fontName='SimHei', fontSize=14, leading=22, alignment=TA_CENTER)))
story.append(Spacer(1, 20))
story.append(Paragraph('Phase 2: Industrialisation & Production-Ready', ParagraphStyle('Phase', fontName='SimHei', fontSize=12, leading=18, alignment=TA_CENTER)))
story.append(Spacer(1, 60))

# Timeline overview
timeline_data = [
    [Paragraph('<b>Phase</b>', tbl_header), Paragraph('<b>Sprints</b>', tbl_header), Paragraph('<b>Focus</b>', tbl_header)],
    [Paragraph('Foundation', tbl_cell), Paragraph('1-2', tbl_cell), Paragraph('Tests & Infrastructure', tbl_cell_left)],
    [Paragraph('Infrastructure', tbl_cell), Paragraph('3-4', tbl_cell), Paragraph('PostgreSQL & Monitoring', tbl_cell_left)],
    [Paragraph('Features', tbl_cell), Paragraph('5-6', tbl_cell), Paragraph('Performance & UX', tbl_cell_left)],
    [Paragraph('Security', tbl_cell), Paragraph('7-8', tbl_cell), Paragraph('Hardening & Compliance', tbl_cell_left)],
]

timeline_table = Table(timeline_data, colWidths=[4*cm, 3*cm, 7*cm])
timeline_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#E3F2FD')),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#E8F5E9')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.HexColor('#FFF3E0')),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#FFEBEE')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
]))
story.append(timeline_table)
story.append(Paragraph('Tableau 1: Vue d\'ensemble des phases', caption_style))
story.append(Spacer(1, 30))
story.append(Paragraph('Janvier - Avril 2025', ParagraphStyle('Date', fontName='SimHei', fontSize=12, leading=18, alignment=TA_CENTER)))
story.append(PageBreak())

# ===== TABLE OF CONTENTS =====
story.append(Paragraph('<b>Sommaire</b>', h1_style))
story.append(Spacer(1, 8))

toc_items = [
    ('Phase 1 - Foundation (Sprints 1-2)', '3'),
    ('  Sprint 1: Suite de Tests', '3'),
    ('  Sprint 2: CI/CD & Quality Gates', '4'),
    ('Phase 2 - Infrastructure (Sprints 3-4)', '5'),
    ('  Sprint 3: Migration PostgreSQL', '5'),
    ('  Sprint 4: Monitoring & Alerting', '6'),
    ('Phase 3 - Features (Sprints 5-6)', '7'),
    ('  Sprint 5: Performance Optimization', '7'),
    ('  Sprint 6: UX & Onboarding', '8'),
    ('Phase 4 - Security (Sprints 7-8)', '9'),
    ('  Sprint 7: Security Hardening', '9'),
    ('  Sprint 8: Compliance & Certification', '10'),
    ('Ressources & Budget', '11'),
    ('Risques & Mitigation', '12'),
]

for item, page in toc_items:
    if item.startswith('  '):
        story.append(Paragraph(f'    {item.strip()} {"." * 50} {page}', body_no_indent))
    else:
        story.append(Paragraph(f'{item} {"." * 40} {page}', body_no_indent))
story.append(PageBreak())

# ===== PHASE 1: FOUNDATION =====
story.append(Paragraph('<b>PHASE 1: FOUNDATION</b>', h1_style))
story.append(Paragraph('Sprints 1-2 | Semaines 1-4 | Janvier 2025', body_no_indent))
story.append(Spacer(1, 8))
story.append(Paragraph(
    'Cette phase pose les fondations qualite du projet. L\'objectif principal est d\'atteindre '
    'un niveau de confiance suffisant dans le code pour permettre des deploiements frequents sans regression. '
    'La mise en place de la CI/CD garantit que chaque modification est validee automatiquement.',
    body_style
))
story.append(Spacer(1, 12))

# Sprint 1
story.append(Paragraph('<b>SPRINT 1: Suite de Tests Automatises</b>', h2_style))
story.append(Paragraph('<b>Duree:</b> 2 semaines | Semaines 1-2', body_no_indent))
story.append(Spacer(1, 6))

story.append(Paragraph('<b>Objectifs:</b>', body_no_indent))
s1_objectives = [
    'Atteindre 80% de couverture de tests sur les modules critiques',
    'Implementer tests unitaires pour Security, Billing, Lineage',
    'Configurer l\'environnement de test avec mocks et fixtures',
    'Etablir les patterns de test pour l\'equipe',
]
for obj in s1_objectives:
    story.append(Paragraph(f'• {obj}', body_no_indent))

s1_tasks = [
    ['Configuration Vitest + coverage', '1j', 'Backend Dev', 'P0'],
    ['Tests EncryptionService (encrypt/decrypt, hash, tokens)', '1.5j', 'Backend Dev', 'P0'],
    ['Tests BillingService (subscriptions, limits, webhooks)', '2j', 'Backend Dev', 'P0'],
    ['Tests DataLineageEngine (CRUD, queries, impact)', '1.5j', 'Backend Dev', 'P0'],
    ['Tests Connecteurs (Shopify, Stripe, Salesforce)', '1.5j', 'Backend Dev', 'P1'],
    ['Tests API Routes (auth, projects, exports)', '1.5j', 'Backend Dev', 'P1'],
    ['Configuration mocks Prisma, NextAuth, Stripe', '1j', 'Backend Dev', 'P0'],
    ['Documentation patterns de test', '0.5j', 'Tech Lead', 'P1'],
]

s1_task_data = [[Paragraph('<b>Tache</b>', tbl_header), Paragraph('<b>Effort</b>', tbl_header), Paragraph('<b>Responsable</b>', tbl_header), Paragraph('<b>Priorite</b>', tbl_header)]]
for task in s1_tasks:
    s1_task_data.append([Paragraph(task[0], tbl_cell_left), Paragraph(task[1], tbl_cell), Paragraph(task[2], tbl_cell), Paragraph(task[3], tbl_cell)])

s1_table = Table(s1_task_data, colWidths=[6.5*cm, 2*cm, 3*cm, 2.5*cm])
s1_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), SPRINT_COLORS['foundation']),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 4),
]))
story.append(Spacer(1, 6))
story.append(s1_table)

story.append(Spacer(1, 6))
story.append(Paragraph('<b>Livrables:</b>', body_no_indent))
s1_deliverables = [
    'Suite de tests unitaires fonctionnelle (300+ tests)',
    'Configuration Vitest avec coverage reporting',
    'Documentation des patterns de test',
    'Dashboard coverage integre au CI',
]
for d in s1_deliverables:
    story.append(Paragraph(f'✓ {d}', body_no_indent))

story.append(Spacer(1, 4))
story.append(Paragraph('<b>Metriques de succes:</b>', body_no_indent))
s1_metrics = [
    'Coverage >= 80% sur modules Security, Billing, Lineage',
    'Tous les tests passent en < 30 secondes',
    '0 tests flaky (non deterministes)',
]
for m in s1_metrics:
    story.append(Paragraph(f'→ {m}', body_no_indent))
story.append(PageBreak())

# Sprint 2
story.append(Paragraph('<b>SPRINT 2: CI/CD & Quality Gates</b>', h2_style))
story.append(Paragraph('<b>Duree:</b> 2 semaines | Semaines 3-4', body_no_indent))
story.append(Spacer(1, 6))

story.append(Paragraph('<b>Objectifs:</b>', body_no_indent))
s2_objectives = [
    'Automatiser le pipeline de build, test et deploy',
    'Implementer les quality gates (lint, tests, security)',
    'Configurer les environnements staging et production',
    'Mettre en place les notifications et alertes CI',
]
for obj in s2_objectives:
    story.append(Paragraph(f'• {obj}', body_no_indent))

s2_tasks = [
    ['Configuration GitHub Actions complete', '1j', 'DevOps', 'P0'],
    ['Jobs paralleles lint, test, security', '1j', 'DevOps', 'P0'],
    ['Tests integration avec PostgreSQL service', '1.5j', 'Backend Dev', 'P0'],
    ['Configuration Playwright E2E', '1j', 'QA/Dev', 'P0'],
    ['Tests E2E parcours critiques (auth, pipeline)', '2j', 'QA/Dev', 'P0'],
    ['Configuration deployment staging', '1j', 'DevOps', 'P0'],
    ['Configuration deployment production', '1j', 'DevOps', 'P0'],
    ['Integration Slack/Email notifications', '0.5j', 'DevOps', 'P1'],
    ['Documentation pipeline CI/CD', '0.5j', 'DevOps', 'P1'],
]

s2_task_data = [[Paragraph('<b>Tache</b>', tbl_header), Paragraph('<b>Effort</b>', tbl_header), Paragraph('<b>Responsable</b>', tbl_header), Paragraph('<b>Priorite</b>', tbl_header)]]
for task in s2_tasks:
    s2_task_data.append([Paragraph(task[0], tbl_cell_left), Paragraph(task[1], tbl_cell), Paragraph(task[2], tbl_cell), Paragraph(task[3], tbl_cell)])

s2_table = Table(s2_task_data, colWidths=[6.5*cm, 2*cm, 3*cm, 2.5*cm])
s2_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), SPRINT_COLORS['foundation']),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 4),
]))
story.append(Spacer(1, 6))
story.append(s2_table)

story.append(Spacer(1, 6))
story.append(Paragraph('<b>Livrables:</b>', body_no_indent))
s2_deliverables = [
    'Pipeline CI/CD fonctionnel sur GitHub Actions',
    'Tests E2E Playwright pour parcours critiques',
    'Environnements staging et production automatiques',
    'Dashboard qualite avec trends et historique',
]
for d in s2_deliverables:
    story.append(Paragraph(f'✓ {d}', body_no_indent))

story.append(Spacer(1, 4))
story.append(Paragraph('<b>Metriques de succes:</b>', body_no_indent))
s2_metrics = [
    'Pipeline complet execute en < 15 minutes',
    'Deploiement automatique sur merge develop/main',
    '100% des PR validées par CI avant merge',
]
for m in s2_metrics:
    story.append(Paragraph(f'→ {m}', body_no_indent))
story.append(PageBreak())

# ===== PHASE 2: INFRASTRUCTURE =====
story.append(Paragraph('<b>PHASE 2: INFRASTRUCTURE</b>', h1_style))
story.append(Paragraph('Sprints 3-4 | Semaines 5-8 | Fevrier 2025', body_no_indent))
story.append(Spacer(1, 8))
story.append(Paragraph(
    'Cette phase transforme l\'infrastructure pour supporter la montee en charge. '
    'La migration de SQLite vers PostgreSQL est critique pour la scalabilite. '
    'Le monitoring et l\'alerting permettent une visibilite operationnelle complete.',
    body_style
))
story.append(Spacer(1, 12))

# Sprint 3
story.append(Paragraph('<b>SPRINT 3: Migration PostgreSQL</b>', h2_style))
story.append(Paragraph('<b>Duree:</b> 2 semaines | Semaines 5-6', body_no_indent))
story.append(Spacer(1, 6))

story.append(Paragraph('<b>Objectifs:</b>', body_no_indent))
s3_objectives = [
    'Migrer la base de donnees de SQLite vers PostgreSQL',
    'Optimiser le schema pour les performances',
    'Configurer connection pooling et replicas',
    'Valider l\'integrite des donnees migrees',
]
for obj in s3_objectives:
    story.append(Paragraph(f'• {obj}', body_no_indent))

s3_tasks = [
    ['Ajustement schema.prisma pour PostgreSQL', '1j', 'Backend Dev', 'P0'],
    ['Scripts migration donnees SQLite -> PostgreSQL', '2j', 'Backend Dev', 'P0'],
    ['Configuration connection pooling (PgBouncer)', '1j', 'DevOps', 'P0'],
    ['Ajout indexes optimises pour requetes frequentes', '1j', 'Backend Dev', 'P0'],
    ['Tests performance et benchmarks', '1j', 'Backend Dev', 'P0'],
    ['Validation integrite donnees post-migration', '1j', 'QA', 'P0'],
    ['Documentation procedure migration', '0.5j', 'Backend Dev', 'P1'],
    ['Plan rollback et procedures de secours', '0.5j', 'DevOps', 'P1'],
]

s3_task_data = [[Paragraph('<b>Tache</b>', tbl_header), Paragraph('<b>Effort</b>', tbl_header), Paragraph('<b>Responsable</b>', tbl_header), Paragraph('<b>Priorite</b>', tbl_header)]]
for task in s3_tasks:
    s3_task_data.append([Paragraph(task[0], tbl_cell_left), Paragraph(task[1], tbl_cell), Paragraph(task[2], tbl_cell), Paragraph(task[3], tbl_cell)])

s3_table = Table(s3_task_data, colWidths=[6.5*cm, 2*cm, 3*cm, 2.5*cm])
s3_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), SPRINT_COLORS['infrastructure']),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 4),
]))
story.append(Spacer(1, 6))
story.append(s3_table)

story.append(Spacer(1, 6))
story.append(Paragraph('<b>Livrables:</b>', body_no_indent))
s3_deliverables = [
    'Base PostgreSQL operationnelle en staging et production',
    'Scripts de migration reutilisables',
    'Configuration connection pooling active',
    'Documentation architecture base de donnees',
]
for d in s3_deliverables:
    story.append(Paragraph(f'✓ {d}', body_no_indent))

story.append(Spacer(1, 4))
story.append(Paragraph('<b>Metriques de succes:</b>', body_no_indent))
s3_metrics = [
    'Temps de requete moyen reduit de 50%',
    'Support 100+ connexions concurrentes',
    'Zero perte de donnees lors migration',
]
for m in s3_metrics:
    story.append(Paragraph(f'→ {m}', body_no_indent))
story.append(PageBreak())

# Sprint 4
story.append(Paragraph('<b>SPRINT 4: Monitoring & Alerting</b>', h2_style))
story.append(Paragraph('<b>Duree:</b> 2 semaines | Semaines 7-8', body_no_indent))
story.append(Spacer(1, 6))

story.append(Paragraph('<b>Objectifs:</b>', body_no_indent))
s4_objectives = [
    'Integrer Sentry pour tracking erreurs production',
    'Configurer alertes critiques (email, Slack, PagerDuty)',
    'Implementer dashboards Grafana pour metriques',
    'Mettre en place SLOs et SLIs',
]
for obj in s4_objectives:
    story.append(Paragraph(f'• {obj}', body_no_indent))

s4_tasks = [
    ['Integration Sentry avec sourcemaps', '1j', 'Backend Dev', 'P0'],
    ['Configuration alertes erreurs critiques', '1j', 'DevOps', 'P0'],
    ['Dashboards Grafana (latence, erreurs, throughput)', '1.5j', 'DevOps', 'P0'],
    ['Integration Slack pour notifications', '0.5j', 'DevOps', 'P0'],
    ['Definition SLOs (99.9% uptime, P95 < 500ms)', '0.5j', 'Tech Lead', 'P0'],
    ['Configuration PagerDuty pour incidents', '0.5j', 'DevOps', 'P1'],
    ['Runbooks pour incidents courants', '1j', 'DevOps', 'P1'],
    ['Documentation monitoring et procedures', '0.5j', 'DevOps', 'P1'],
]

s4_task_data = [[Paragraph('<b>Tache</b>', tbl_header), Paragraph('<b>Effort</b>', tbl_header), Paragraph('<b>Responsable</b>', tbl_header), Paragraph('<b>Priorite</b>', tbl_header)]]
for task in s4_tasks:
    s4_task_data.append([Paragraph(task[0], tbl_cell_left), Paragraph(task[1], tbl_cell), Paragraph(task[2], tbl_cell), Paragraph(task[3], tbl_cell)])

s4_table = Table(s4_task_data, colWidths=[6.5*cm, 2*cm, 3*cm, 2.5*cm])
s4_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), SPRINT_COLORS['infrastructure']),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 4),
]))
story.append(Spacer(1, 6))
story.append(s4_table)

story.append(Spacer(1, 6))
story.append(Paragraph('<b>Livrables:</b>', body_no_indent))
s4_deliverables = [
    'Sentry operationnel avec alertes',
    'Dashboards Grafana pour monitoring temps reel',
    'SLOs definis et mesures automatiquement',
    'Runbooks pour resolution incidents',
]
for d in s4_deliverables:
    story.append(Paragraph(f'✓ {d}', body_no_indent))

story.append(Spacer(1, 4))
story.append(Paragraph('<b>Metriques de succes:</b>', body_no_indent))
s4_metrics = [
    'MTTD (Mean Time To Detect) < 5 minutes',
    'MTTR (Mean Time To Resolve) < 30 minutes',
    'Alertes correctement categorisees a 95%',
]
for m in s4_metrics:
    story.append(Paragraph(f'→ {m}', body_no_indent))
story.append(PageBreak())

# ===== PHASE 3: FEATURES =====
story.append(Paragraph('<b>PHASE 3: FEATURES & PERFORMANCE</b>', h1_style))
story.append(Paragraph('Sprints 5-6 | Semaines 9-12 | Mars 2025', body_no_indent))
story.append(Spacer(1, 8))
story.append(Paragraph(
    'Cette phase se concentre sur l\'optimisation des performances et l\'amelioration '
    'de l\'experience utilisateur. L\'objectif est de rendre la plateforme plus rapide '
    'et plus intuitive pour favoriser l\'adoption par les utilisateurs.',
    body_style
))
story.append(Spacer(1, 12))

# Sprint 5
story.append(Paragraph('<b>SPRINT 5: Performance Optimization</b>', h2_style))
story.append(Paragraph('<b>Duree:</b> 2 semaines | Semaines 9-10', body_no_indent))
story.append(Spacer(1, 6))

story.append(Paragraph('<b>Objectifs:</b>', body_no_indent))
s5_objectives = [
    'Implementer le caching Redis pour les donnees frequentes',
    'Optimiser les requetes base de donnees',
    'Configurer CDN pour les assets statiques',
    'Reducire le temps de chargement initial de 50%',
]
for obj in s5_objectives:
    story.append(Paragraph(f'• {obj}', body_no_indent))

s5_tasks = [
    ['Integration Redis pour caching', '1.5j', 'Backend Dev', 'P0'],
    ['Cache des metriques et sessions utilisateur', '1j', 'Backend Dev', 'P0'],
    ['Optimisation requetes N+1', '1j', 'Backend Dev', 'P0'],
    ['Implementation database indexing', '1j', 'Backend Dev', 'P0'],
    ['Configuration CDN (Cloudflare/Vercel)', '1j', 'DevOps', 'P0'],
    ['Optimisation images et assets', '0.5j', 'Frontend Dev', 'P1'],
    ['Lazy loading composants lourds', '1j', 'Frontend Dev', 'P1'],
    ['Tests de charge (k6/Artillery)', '1j', 'QA', 'P1'],
]

s5_task_data = [[Paragraph('<b>Tache</b>', tbl_header), Paragraph('<b>Effort</b>', tbl_header), Paragraph('<b>Responsable</b>', tbl_header), Paragraph('<b>Priorite</b>', tbl_header)]]
for task in s5_tasks:
    s5_task_data.append([Paragraph(task[0], tbl_cell_left), Paragraph(task[1], tbl_cell), Paragraph(task[2], tbl_cell), Paragraph(task[3], tbl_cell)])

s5_table = Table(s5_task_data, colWidths=[6.5*cm, 2*cm, 3*cm, 2.5*cm])
s5_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), SPRINT_COLORS['features']),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 4),
]))
story.append(Spacer(1, 6))
story.append(s5_table)

story.append(Spacer(1, 6))
story.append(Paragraph('<b>Livrables:</b>', body_no_indent))
s5_deliverables = [
    'Redis operationnel pour caching',
    'CDN configure pour assets',
    'Requetes optimisees avec indexes',
    'Rapport benchmark avant/apres',
]
for d in s5_deliverables:
    story.append(Paragraph(f'✓ {d}', body_no_indent))

story.append(Spacer(1, 4))
story.append(Paragraph('<b>Metriques de succes:</b>', body_no_indent))
s5_metrics = [
    'Lighthouse score > 90',
    'Time to First Byte < 200ms',
    'Largest Contentful Paint < 2s',
]
for m in s5_metrics:
    story.append(Paragraph(f'→ {m}', body_no_indent))
story.append(PageBreak())

# Sprint 6
story.append(Paragraph('<b>SPRINT 6: UX & Onboarding</b>', h2_style))
story.append(Paragraph('<b>Duree:</b> 2 semaines | Semaines 11-12', body_no_indent))
story.append(Spacer(1, 6))

story.append(Paragraph('<b>Objectifs:</b>', body_no_indent))
s6_objectives = [
    'Creer un parcours d\'onboarding interactif',
    'Implementer un systeme d\'aide contextuelle',
    'Developper des tutoriels video integres',
    'Ameliorer les messages d\'erreur utilisateur',
]
for obj in s6_objectives:
    story.append(Paragraph(f'• {obj}', body_no_indent))

s6_tasks = [
    ['Conception parcours onboarding', '1j', 'UX Designer', 'P0'],
    ['Implementation wizard onboarding', '2j', 'Frontend Dev', 'P0'],
    ['Systeme tooltips contextuels', '1j', 'Frontend Dev', 'P0'],
    ['Integration videos tutoriels', '1j', 'Frontend Dev', 'P1'],
    ['Amelioration messages d\'erreur UI', '1j', 'Frontend Dev', 'P0'],
    ['Creation videos tutoriels', '2j', 'Content', 'P1'],
    ['Documentation utilisateur', '1j', 'Content', 'P1'],
    ['Tests utilisateurs onboarding', '1j', 'QA/UX', 'P1'],
]

s6_task_data = [[Paragraph('<b>Tache</b>', tbl_header), Paragraph('<b>Effort</b>', tbl_header), Paragraph('<b>Responsable</b>', tbl_header), Paragraph('<b>Priorite</b>', tbl_header)]]
for task in s6_tasks:
    s6_task_data.append([Paragraph(task[0], tbl_cell_left), Paragraph(task[1], tbl_cell), Paragraph(task[2], tbl_cell), Paragraph(task[3], tbl_cell)])

s6_table = Table(s6_task_data, colWidths=[6.5*cm, 2*cm, 3*cm, 2.5*cm])
s6_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), SPRINT_COLORS['features']),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 4),
]))
story.append(Spacer(1, 6))
story.append(s6_table)

story.append(Spacer(1, 6))
story.append(Paragraph('<b>Livrables:</b>', body_no_indent))
s6_deliverables = [
    'Parcours onboarding interactif',
    'Systeme aide contextuelle',
    '5+ videos tutoriels',
    'Documentation utilisateur complete',
]
for d in s6_deliverables:
    story.append(Paragraph(f'✓ {d}', body_no_indent))

story.append(Spacer(1, 4))
story.append(Paragraph('<b>Metriques de succes:</b>', body_no_indent))
s6_metrics = [
    'Taux completion onboarding > 70%',
    'NPS (Net Promoter Score) > 40',
    'Time to Value < 10 minutes',
]
for m in s6_metrics:
    story.append(Paragraph(f'→ {m}', body_no_indent))
story.append(PageBreak())

# ===== PHASE 4: SECURITY =====
story.append(Paragraph('<b>PHASE 4: SECURITY & COMPLIANCE</b>', h1_style))
story.append(Paragraph('Sprints 7-8 | Semaines 13-16 | Avril 2025', body_no_indent))
story.append(Spacer(1, 8))
story.append(Paragraph(
    'Cette phase finalise la securisation de la plateforme et prepare les certifications '
    'compliance necessaires pour les clients enterprise. L\'objectif est d\'atteindre '
    'un niveau de securite permettant la certification SOC2 Type I.',
    body_style
))
story.append(Spacer(1, 12))

# Sprint 7
story.append(Paragraph('<b>SPRINT 7: Security Hardening</b>', h2_style))
story.append(Paragraph('<b>Duree:</b> 2 semaines | Semaines 13-14', body_no_indent))
story.append(Spacer(1, 6))

story.append(Paragraph('<b>Objectifs:</b>', body_no_indent))
s7_objectives = [
    'Realiser un audit de securite complet',
    'Corriger les vulnerabilites identifiees',
    'Implementer des headers de securite supplementaires',
    'Configurer WAF (Web Application Firewall)',
]
for obj in s7_objectives:
    story.append(Paragraph(f'• {obj}', body_no_indent))

s7_tasks = [
    ['Audit securite externe (penetration testing)', '2j', 'Security', 'P0'],
    ['Remediation vulnerabilites critiques', '2j', 'Backend Dev', 'P0'],
    ['Implementation CSP, HSTS, X-Frame-Options', '1j', 'Backend Dev', 'P0'],
    ['Configuration WAF (Cloudflare/AWS)', '1j', 'DevOps', 'P0'],
    ['Audit dependances npm (Snyk/Dependabot)', '0.5j', 'Backend Dev', 'P0'],
    ['Rotation secrets et credentials', '0.5j', 'DevOps', 'P0'],
    ['Tests intrusion automatisees', '1j', 'Security', 'P1'],
    ['Documentation securite', '0.5j', 'Security', 'P1'],
]

s7_task_data = [[Paragraph('<b>Tache</b>', tbl_header), Paragraph('<b>Effort</b>', tbl_header), Paragraph('<b>Responsable</b>', tbl_header), Paragraph('<b>Priorite</b>', tbl_header)]]
for task in s7_tasks:
    s7_task_data.append([Paragraph(task[0], tbl_cell_left), Paragraph(task[1], tbl_cell), Paragraph(task[2], tbl_cell), Paragraph(task[3], tbl_cell)])

s7_table = Table(s7_task_data, colWidths=[6.5*cm, 2*cm, 3*cm, 2.5*cm])
s7_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), SPRINT_COLORS['security']),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 4),
]))
story.append(Spacer(1, 6))
story.append(s7_table)

story.append(Spacer(1, 6))
story.append(Paragraph('<b>Livrables:</b>', body_no_indent))
s7_deliverables = [
    'Rapport audit securite',
    'Vulnerabilites critiques resolues',
    'WAF operationnel',
    'Headers securite verifies',
]
for d in s7_deliverables:
    story.append(Paragraph(f'✓ {d}', body_no_indent))

story.append(Spacer(1, 4))
story.append(Paragraph('<b>Metriques de succes:</b>', body_no_indent))
s7_metrics = [
    '0 vulnerabilite critique ou haute',
    'Score securite OWASP > 90%',
    'Headers securite A+ sur securityheaders.com',
]
for m in s7_metrics:
    story.append(Paragraph(f'→ {m}', body_no_indent))
story.append(PageBreak())

# Sprint 8
story.append(Paragraph('<b>SPRINT 8: Compliance & Certification</b>', h2_style))
story.append(Paragraph('<b>Duree:</b> 2 semaines | Semaines 15-16', body_no_indent))
story.append(Spacer(1, 6))

story.append(Paragraph('<b>Objectifs:</b>', body_no_indent))
s8_objectives = [
    'Preparer la documentation SOC2',
    'Implementer les controles manquants',
    'Generer les rapports de compliance automatiques',
    'Valider la conformite RGPD',
]
for obj in s8_objectives:
    story.append(Paragraph(f'• {obj}', body_no_indent))

s8_tasks = [
    ['Documentation politiques SOC2', '2j', 'Compliance', 'P0'],
    ['Implementation controles SOC2 manquants', '2j', 'Backend Dev', 'P0'],
    ['Automatisation rapports compliance', '1j', 'Backend Dev', 'P0'],
    ['Validation conformite RGPD', '1j', 'Legal/Compliance', 'P0'],
    ['Documentation traitement donnees', '1j', 'Legal', 'P0'],
    ['Mise a jour mentions legales et CGU', '0.5j', 'Legal', 'P1'],
    ['Formation equipe securite', '0.5j', 'Security', 'P1'],
    ['Preparation audit SOC2 Type I', '1j', 'Compliance', 'P0'],
]

s8_task_data = [[Paragraph('<b>Tache</b>', tbl_header), Paragraph('<b>Effort</b>', tbl_header), Paragraph('<b>Responsable</b>', tbl_header), Paragraph('<b>Priorite</b>', tbl_header)]]
for task in s8_tasks:
    s8_task_data.append([Paragraph(task[0], tbl_cell_left), Paragraph(task[1], tbl_cell), Paragraph(task[2], tbl_cell), Paragraph(task[3], tbl_cell)])

s8_table = Table(s8_task_data, colWidths=[6.5*cm, 2*cm, 3*cm, 2.5*cm])
s8_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), SPRINT_COLORS['security']),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 4),
]))
story.append(Spacer(1, 6))
story.append(s8_table)

story.append(Spacer(1, 6))
story.append(Paragraph('<b>Livrables:</b>', body_no_indent))
s8_deliverables = [
    'Documentation SOC2 complete',
    'Rapports compliance automatises',
    'Conformite RGPD validee',
    'Dossier preparation audit SOC2',
]
for d in s8_deliverables:
    story.append(Paragraph(f'✓ {d}', body_no_indent))

story.append(Spacer(1, 4))
story.append(Paragraph('<b>Metriques de succes:</b>', body_no_indent))
s8_metrics = [
    'Score compliance SOC2 >= 85%',
    '100% des controles documentes',
    'Preparation audit SOC2 Type I complete',
]
for m in s8_metrics:
    story.append(Paragraph(f'→ {m}', body_no_indent))
story.append(PageBreak())

# ===== RESSOURCES & BUDGET =====
story.append(Paragraph('<b>RESSOURCES & BUDGET</b>', h1_style))
story.append(Spacer(1, 8))

story.append(Paragraph('<b>Equipe Recommandee</b>', h2_style))

team_data = [
    [Paragraph('<b>Role</b>', tbl_header), Paragraph('<b>Allocation</b>', tbl_header), Paragraph('<b>Sprints</b>', tbl_header)],
    [Paragraph('Tech Lead', tbl_cell_left), Paragraph('50%', tbl_cell), Paragraph('1-8', tbl_cell)],
    [Paragraph('Backend Developer Senior', tbl_cell_left), Paragraph('100%', tbl_cell), Paragraph('1-8', tbl_cell)],
    [Paragraph('Frontend Developer', tbl_cell_left), Paragraph('100%', tbl_cell), Paragraph('5-6', tbl_cell)],
    [Paragraph('DevOps Engineer', tbl_cell_left), Paragraph('100%', tbl_cell), Paragraph('3-4', tbl_cell)],
    [Paragraph('QA Engineer', tbl_cell_left), Paragraph('50%', tbl_cell), Paragraph('1-4', tbl_cell)],
    [Paragraph('Security Engineer', tbl_cell_left), Paragraph('50%', tbl_cell), Paragraph('7-8', tbl_cell)],
    [Paragraph('UX Designer', tbl_cell_left), Paragraph('50%', tbl_cell), Paragraph('5-6', tbl_cell)],
    [Paragraph('Content Writer', tbl_cell_left), Paragraph('25%', tbl_cell), Paragraph('6, 8', tbl_cell)],
]

team_table = Table(team_data, colWidths=[5*cm, 4*cm, 4*cm])
team_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
]))
story.append(Spacer(1, 6))
story.append(team_table)
story.append(Paragraph('Tableau 2: Allocation equipe', caption_style))

story.append(Paragraph('<b>Infrastructure Couts Estimes</b>', h2_style))

cost_data = [
    [Paragraph('<b>Service</b>', tbl_header), Paragraph('<b>Fournisseur</b>', tbl_header), Paragraph('<b>Cout mensuel</b>', tbl_header)],
    [Paragraph('Base PostgreSQL', tbl_cell_left), Paragraph('Supabase/Neon', tbl_cell), Paragraph('50-100 EUR', tbl_cell)],
    [Paragraph('Redis Cache', tbl_cell_left), Paragraph('Upstash/Redis Cloud', tbl_cell), Paragraph('30-50 EUR', tbl_cell)],
    [Paragraph('Monitoring (Sentry)', tbl_cell_left), Paragraph('Sentry', tbl_cell), Paragraph('26-80 EUR', tbl_cell)],
    [Paragraph('CDN', tbl_cell_left), Paragraph('Cloudflare', tbl_cell), Paragraph('20-50 EUR', tbl_cell)],
    [Paragraph('CI/CD', tbl_cell_left), Paragraph('GitHub Actions', tbl_cell), Paragraph('0-40 EUR', tbl_cell)],
    [Paragraph('Security Scanner', tbl_cell_left), Paragraph('Snyk', tbl_cell), Paragraph('0-50 EUR', tbl_cell)],
    [Paragraph('<b>TOTAL</b>', tbl_cell_left), Paragraph('-', tbl_cell), Paragraph('<b>126-370 EUR/mois</b>', tbl_cell)],
]

cost_table = Table(cost_data, colWidths=[5*cm, 4*cm, 4*cm])
cost_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2E7D32')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('BACKGROUND', (0, 7), (-1, 7), colors.HexColor('#E8F5E9')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
]))
story.append(Spacer(1, 6))
story.append(cost_table)
story.append(Paragraph('Tableau 3: Couts infrastructure mensuels', caption_style))
story.append(PageBreak())

# ===== RISKS =====
story.append(Paragraph('<b>RISQUES & MITIGATION</b>', h1_style))
story.append(Spacer(1, 8))

risk_data = [
    [Paragraph('<b>Risque</b>', tbl_header), Paragraph('<b>Probabilite</b>', tbl_header), Paragraph('<b>Impact</b>', tbl_header), Paragraph('<b>Mitigation</b>', tbl_header)],
    [Paragraph('Migration DB echec', tbl_cell_left), Paragraph('Moyenne', tbl_cell), Paragraph('Critique', tbl_cell), Paragraph('Plan rollback, tests extensifs', tbl_cell_left)],
    [Paragraph('Tests flaky', tbl_cell_left), Paragraph('Haute', tbl_cell), Paragraph('Moyen', tbl_cell), Paragraph('Isolation tests, mocks stables', tbl_cell_left)],
    [Paragraph('Retard equipe', tbl_cell_left), Paragraph('Moyenne', tbl_cell), Paragraph('Moyen', tbl_cell), Paragraph('Buffer 20%, priorisation', tbl_cell_left)],
    [Paragraph('Vulnerabilite critique', tbl_cell_left), Paragraph('Faible', tbl_cell), Paragraph('Critique', tbl_cell), Paragraph('Scan automatique, process patch', tbl_cell_left)],
    [Paragraph('Scope creep', tbl_cell_left), Paragraph('Haute', tbl_cell), Paragraph('Moyen', tbl_cell), Paragraph('Scope freeze, change control', tbl_cell_left)],
    [Paragraph('Dependance externe', tbl_cell_left), Paragraph('Moyenne', tbl_cell), Paragraph('Moyen', tbl_cell), Paragraph('Abstractions, fallbacks', tbl_cell_left)],
]

risk_table = Table(risk_data, colWidths=[3.5*cm, 2.5*cm, 2.5*cm, 4.5*cm])
risk_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#C62828')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 4),
]))
story.append(Spacer(1, 6))
story.append(risk_table)
story.append(Paragraph('Tableau 4: Matrice des risques', caption_style))

# Summary timeline
story.append(Spacer(1, 16))
story.append(Paragraph('<b>TIMELINE GLOBALE</b>', h2_style))

timeline_summary = [
    [Paragraph('<b>Periode</b>', tbl_header), Paragraph('<b>Sprint</b>', tbl_header), Paragraph('<b>Livrable Principal</b>', tbl_header)],
    [Paragraph('S1-2 (Jan)', tbl_cell), Paragraph('1-2', tbl_cell), Paragraph('Tests + CI/CD operationnels', tbl_cell_left)],
    [Paragraph('S3-4 (Fev)', tbl_cell), Paragraph('3-4', tbl_cell), Paragraph('PostgreSQL + Monitoring', tbl_cell_left)],
    [Paragraph('S5-6 (Mar)', tbl_cell), Paragraph('5-6', tbl_cell), Paragraph('Performance + UX', tbl_cell_left)],
    [Paragraph('S7-8 (Avr)', tbl_cell), Paragraph('7-8', tbl_cell), Paragraph('Security + Compliance', tbl_cell_left)],
]

timeline_sum_table = Table(timeline_summary, colWidths=[3*cm, 2*cm, 8*cm])
timeline_sum_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.HexColor('#E3F2FD')),
    ('BACKGROUND', (0, 2), (-1, 2), colors.HexColor('#E8F5E9')),
    ('BACKGROUND', (0, 3), (-1, 3), colors.HexColor('#FFF3E0')),
    ('BACKGROUND', (0, 4), (-1, 4), colors.HexColor('#FFEBEE')),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
]))
story.append(Spacer(1, 6))
story.append(timeline_sum_table)
story.append(Paragraph('Tableau 5: Timeline globale des livrables', caption_style))

# Build
doc.build(story)
print(f"PDF generated: {output_path}")
