# -*- coding: utf-8 -*-
"""
Rapport Complet - DataSphere Innovation
État des Lieux et Plan de Lancement Commercial
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.units import cm, mm
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY, TA_RIGHT
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image, KeepTogether
)
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from reportlab.platypus.tableofcontents import TableOfContents
import os

# Enregistrement des polices
pdfmetrics.registerFont(TTFont('Microsoft YaHei', '/usr/share/fonts/truetype/chinese/msyh.ttf'))
pdfmetrics.registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))
pdfmetrics.registerFont(TTFont('Calibri', '/usr/share/fonts/truetype/english/calibri-regular.ttf'))

# Enregistrement des familles de polices pour le gras
registerFontFamily('Microsoft YaHei', normal='Microsoft YaHei', bold='Microsoft YaHei')
registerFontFamily('SimHei', normal='SimHei', bold='SimHei')
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')

# Couleurs personnalisées
PRIMARY_BLUE = colors.HexColor('#1F4E79')
SECONDARY_BLUE = colors.HexColor('#2E75B6')
ACCENT_GREEN = colors.HexColor('#28A745')
ACCENT_ORANGE = colors.HexColor('#FFA500')
ACCENT_RED = colors.HexColor('#DC3545')
LIGHT_GRAY = colors.HexColor('#F5F5F5')
DARK_GRAY = colors.HexColor('#333333')

# Création des styles
styles = getSampleStyleSheet()

# Style titre de couverture
cover_title = ParagraphStyle(
    'CoverTitle',
    fontName='Microsoft YaHei',
    fontSize=36,
    leading=44,
    alignment=TA_CENTER,
    textColor=PRIMARY_BLUE,
    spaceAfter=20
)

cover_subtitle = ParagraphStyle(
    'CoverSubtitle',
    fontName='SimHei',
    fontSize=18,
    leading=24,
    alignment=TA_CENTER,
    textColor=DARK_GRAY,
    spaceAfter=30
)

cover_info = ParagraphStyle(
    'CoverInfo',
    fontName='SimHei',
    fontSize=14,
    leading=20,
    alignment=TA_CENTER,
    textColor=DARK_GRAY
)

# Styles de contenu
h1_style = ParagraphStyle(
    'H1Style',
    fontName='Microsoft YaHei',
    fontSize=20,
    leading=28,
    alignment=TA_LEFT,
    textColor=PRIMARY_BLUE,
    spaceBefore=24,
    spaceAfter=12
)

h2_style = ParagraphStyle(
    'H2Style',
    fontName='Microsoft YaHei',
    fontSize=16,
    leading=22,
    alignment=TA_LEFT,
    textColor=SECONDARY_BLUE,
    spaceBefore=18,
    spaceAfter=8
)

h3_style = ParagraphStyle(
    'H3Style',
    fontName='SimHei',
    fontSize=13,
    leading=18,
    alignment=TA_LEFT,
    textColor=DARK_GRAY,
    spaceBefore=12,
    spaceAfter=6
)

body_style = ParagraphStyle(
    'BodyStyle',
    fontName='SimHei',
    fontSize=11,
    leading=18,
    alignment=TA_LEFT,
    textColor=DARK_GRAY,
    firstLineIndent=24,
    spaceAfter=8,
    wordWrap='CJK'
)

body_no_indent = ParagraphStyle(
    'BodyNoIndent',
    fontName='SimHei',
    fontSize=11,
    leading=18,
    alignment=TA_LEFT,
    textColor=DARK_GRAY,
    spaceAfter=8,
    wordWrap='CJK'
)

# Styles pour tableaux
table_header = ParagraphStyle(
    'TableHeader',
    fontName='Microsoft YaHei',
    fontSize=10,
    leading=14,
    alignment=TA_CENTER,
    textColor=colors.white
)

table_cell = ParagraphStyle(
    'TableCell',
    fontName='SimHei',
    fontSize=9,
    leading=13,
    alignment=TA_CENTER,
    textColor=DARK_GRAY,
    wordWrap='CJK'
)

table_cell_left = ParagraphStyle(
    'TableCellLeft',
    fontName='SimHei',
    fontSize=9,
    leading=13,
    alignment=TA_LEFT,
    textColor=DARK_GRAY,
    wordWrap='CJK'
)

# Style pour les metrics
metric_style = ParagraphStyle(
    'MetricStyle',
    fontName='Microsoft YaHei',
    fontSize=24,
    leading=30,
    alignment=TA_CENTER,
    textColor=PRIMARY_BLUE
)

metric_label = ParagraphStyle(
    'MetricLabel',
    fontName='SimHei',
    fontSize=10,
    leading=14,
    alignment=TA_CENTER,
    textColor=DARK_GRAY
)

def create_progress_bar(percentage, width=150, height=12):
    """Créer une barre de progression visuelle"""
    bar_color = ACCENT_GREEN if percentage >= 80 else (ACCENT_ORANGE if percentage >= 60 else ACCENT_RED)
    
    data = [[
        Table([['']], colWidths=[width * percentage / 100, width * (1 - percentage / 100)]).style(TableStyle([
            ('BACKGROUND', (0, 0), (0, 0), bar_color),
            ('BACKGROUND', (1, 0), (1, 0), LIGHT_GRAY),
            ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ]))
    ]]
    
    return Table(data, colWidths=[width])

def build_document():
    # Configuration du document
    doc = SimpleDocTemplate(
        '/home/z/my-project/download/DataSphere_Innovation_Rapport_Complet.pdf',
        pagesize=A4,
        rightMargin=2*cm,
        leftMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm,
        title='DataSphere Innovation - Etat des Lieux et Plan Commercial',
        author='Z.ai',
        creator='Z.ai',
        subject='Rapport complet: etat davancement du projet DataSphere Innovation et plan de lancement commercial sur 2 mois'
    )
    
    story = []
    
    # ==================== PAGE DE COUVERTURE ====================
    story.append(Spacer(1, 80))
    story.append(Paragraph('DataSphere Innovation', cover_title))
    story.append(Spacer(1, 20))
    story.append(Paragraph('Etat des Lieux et Plan de Lancement Commercial', cover_subtitle))
    story.append(Spacer(1, 10))
    story.append(Paragraph('Objectif: Lancement commercial rentable en 8 semaines', cover_info))
    story.append(Spacer(1, 60))
    
    # Boîte métriques
    metrics_data = [
        [
            Paragraph('<b>86%</b>', metric_style),
            Paragraph('<b>47+</b>', metric_style),
            Paragraph('<b>10</b>', metric_style),
            Paragraph('<b>4</b>', metric_style)
        ],
        [
            Paragraph('Completion Globale', metric_label),
            Paragraph('Endpoints API', metric_label),
            Paragraph('Agents IA', metric_label),
            Paragraph('Langues', metric_label)
        ]
    ]
    
    metrics_table = Table(metrics_data, colWidths=[3.5*cm, 3.5*cm, 3.5*cm, 3.5*cm])
    metrics_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, -1), LIGHT_GRAY),
        ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 15),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 15),
        ('BOX', (0, 0), (-1, -1), 1, PRIMARY_BLUE),
    ]))
    story.append(metrics_table)
    
    story.append(Spacer(1, 80))
    story.append(Paragraph('Date: Mars 2026', cover_info))
    story.append(Paragraph('Prepared by: Z.ai', cover_info))
    
    story.append(PageBreak())
    
    # ==================== TABLE DES MATIERES ====================
    story.append(Paragraph('<b>Table des Matieres</b>', h1_style))
    story.append(Spacer(1, 15))
    
    toc_items = [
        ('1. Resume Executif', '3'),
        ('2. Etat des Lieux Detaille', '4'),
        ('   2.1 Architecture Technique', '4'),
        ('   2.2 Fonctionnalites Implementees', '5'),
        ('   2.3 Agents IA et Automatisation', '6'),
        ('   2.4 Securite et Conformite', '7'),
        ('3. Analyse SWOT', '8'),
        ('4. Gap Analysis', '9'),
        ('5. Plan dAction 8 Semaines', '10'),
        ('   5.1 Semaines 1-2: Fondations', '10'),
        ('   5.2 Semaines 3-4: Qualite et Tests', '11'),
        ('   5.3 Semaines 5-6: Pre-Production', '12'),
        ('   5.4 Semaines 7-8: Lancement', '13'),
        ('6. Budget et Ressources', '14'),
        ('7. Strategie Commerciale', '15'),
        ('8. KPIs et Metriques de Succes', '16'),
        ('9. Conclusion et Recommandations', '17'),
    ]
    
    for item, page in toc_items:
        toc_line = ParagraphStyle('TOCLine', fontName='SimHei', fontSize=11, leading=18, textColor=DARK_GRAY)
        story.append(Paragraph(f'{item} {"." * (60 - len(item))} {page}', toc_line))
    
    story.append(PageBreak())
    
    # ==================== 1. RESUME EXECUTIF ====================
    story.append(Paragraph('<b>1. Resume Executif</b>', h1_style))
    story.append(Spacer(1, 12))
    
    story.append(Paragraph(
        'DataSphere Innovation est une plateforme SaaS de nouvelle generation pour lingenierie des donnees assistee par IA. '
        'Le projet presente une maturite technique exceptionnelle avec un taux de completion global de 86%, le positionnant '
        'comme un candidat serieux pour un lancement commercial dans les 8 prochaines semaines. Larchitecture repose sur '
        'des technologies modernes et eprouvees: Next.js 16 avec App Router, Prisma ORM, NextAuth.js pour lauthentification '
        'enterprise, et Stripe pour la facturation recurrente.',
        body_style
    ))
    
    story.append(Paragraph(
        'Le projet dispose datouts majeurs pour le marche B2B: 10 agents IA autonomes specialises dans differents aspects '
        'de lingenierie des donnees, une infrastructure de securite de niveau enterprise (audit logging, encryption AES-256, '
        'conformite SOC2/RGPD/HIPAA), un systeme de facturation complet avec 4 plans tarifaires, et une support '
        'dinternationalisation en 4 langues (FR, EN, DE, ES). Les connecteurs de donnees supportent deja PostgreSQL et BigQuery, '
        'avec une architecture extensible pour 35+ sources supplementaires.',
        body_style
    ))
    
    story.append(Paragraph(
        'Les principaux axes damelioration identifies concernent les tests (coverage actuel de 50%), la finalisation des '
        'connecteurs supplementaires (MySQL, MongoDB, Snowflake), et la mise en place dune pipeline CI/CD robuste. Ces elements '
        'sont critiques pour un lancement commercial reussi et sont integralement couverts dans le plan daction propose. '
        'Le budget total estime pour atteindre un niveau production-ready est de 45 000 EUR, incluant developpement, infrastructure, '
        'et marketing initial.',
        body_style
    ))
    
    # Tableau récapitulatif
    story.append(Spacer(1, 15))
    story.append(Paragraph('<b>Vue densemble du projet</b>', h3_style))
    
    overview_data = [
        [
            Paragraph('<b>Metrique</b>', table_header),
            Paragraph('<b>Valeur</b>', table_header),
            Paragraph('<b>Statut</b>', table_header)
        ],
        [
            Paragraph('Fichiers source', table_cell_left),
            Paragraph('201+', table_cell),
            Paragraph('Operationnel', table_cell)
        ],
        [
            Paragraph('Endpoints API', table_cell_left),
            Paragraph('47+', table_cell),
            Paragraph('Operationnel', table_cell)
        ],
        [
            Paragraph('Composants UI', table_cell_left),
            Paragraph('60+', table_cell),
            Paragraph('Operationnel', table_cell)
        ],
        [
            Paragraph('Modeles Prisma', table_cell_left),
            Paragraph('25+', table_cell),
            Paragraph('Operationnel', table_cell)
        ],
        [
            Paragraph('Tests coverage', table_cell_left),
            Paragraph('50%', table_cell),
            Paragraph('A ameliorer', table_cell)
        ],
        [
            Paragraph('Langues supportees', table_cell_left),
            Paragraph('4', table_cell),
            Paragraph('Complet', table_cell)
        ],
    ]
    
    overview_table = Table(overview_data, colWidths=[6*cm, 4*cm, 4*cm])
    overview_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('BACKGROUND', (0, 2), (-1, 2), LIGHT_GRAY),
        ('BACKGROUND', (0, 4), (-1, 4), LIGHT_GRAY),
        ('BACKGROUND', (0, 6), (-1, 6), LIGHT_GRAY),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(overview_table)
    
    story.append(PageBreak())
    
    # ==================== 2. ETAT DES LIEUX DETAILLE ====================
    story.append(Paragraph('<b>2. Etat des Lieux Detaille</b>', h1_style))
    
    # 2.1 Architecture Technique
    story.append(Paragraph('<b>2.1 Architecture Technique</b>', h2_style))
    
    story.append(Paragraph(
        'Larchitecture technique de DataSphere Innovation repose sur une stack moderne et robuste, specifiquement '
        'concue pour les besoins des entreprises B2B. Le framework Next.js 16.1.1 avec App Router offre un rendu '
        'hybride optimise, combinant Server Components pour les performances et Client Components pour linteractivite. '
        'Cette architecture permet une experience utilisateur fluide tout en maintenant dexcellentes performances SEO.',
        body_style
    ))
    
    story.append(Paragraph(
        'La couche de donnees utilise Prisma ORM, offrant une abstraction type-safe sur SQLite en developpement et '
        'PostgreSQL en production. Les 25+ modeles Prisma couvrent lensemble des besoins fonctionnels: gestion des '
        'utilisateurs et organisations, projets et pipelines, sources de donnees et connecteurs, facturation et '
        'abonnements, securite et audit. Les relations sont completement definies avec des suppressions en cascade '
        'appropriees.',
        body_style
    ))
    
    # Tableau stack technique
    story.append(Spacer(1, 12))
    tech_stack = [
        [
            Paragraph('<b>Composant</b>', table_header),
            Paragraph('<b>Technologie</b>', table_header),
            Paragraph('<b>Version</b>', table_header),
            Paragraph('<b>Completion</b>', table_header)
        ],
        [
            Paragraph('Frontend Framework', table_cell_left),
            Paragraph('Next.js', table_cell),
            Paragraph('16.1.1', table_cell),
            Paragraph('95%', table_cell)
        ],
        [
            Paragraph('UI Library', table_cell_left),
            Paragraph('React', table_cell),
            Paragraph('19', table_cell),
            Paragraph('95%', table_cell)
        ],
        [
            Paragraph('ORM', table_cell_left),
            Paragraph('Prisma', table_cell),
            Paragraph('6.x', table_cell),
            Paragraph('95%', table_cell)
        ],
        [
            Paragraph('Authentication', table_cell_left),
            Paragraph('NextAuth.js', table_cell),
            Paragraph('5 beta', table_cell),
            Paragraph('95%', table_cell)
        ],
        [
            Paragraph('Payments', table_cell_left),
            Paragraph('Stripe', table_cell),
            Paragraph('20.4.1', table_cell),
            Paragraph('90%', table_cell)
        ],
        [
            Paragraph('Internationalisation', table_cell_left),
            Paragraph('next-intl', table_cell),
            Paragraph('3.x', table_cell),
            Paragraph('100%', table_cell)
        ],
        [
            Paragraph('UI Components', table_cell_left),
            Paragraph('shadcn/ui', table_cell),
            Paragraph('Latest', table_cell),
            Paragraph('100%', table_cell)
        ],
        [
            Paragraph('AI SDK', table_cell_left),
            Paragraph('z-ai-web-dev-sdk', table_cell),
            Paragraph('Latest', table_cell),
            Paragraph('85%', table_cell)
        ],
    ]
    
    tech_table = Table(tech_stack, colWidths=[4.5*cm, 4*cm, 3*cm, 2.5*cm])
    tech_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, 1), colors.white),
        ('BACKGROUND', (0, 2), (-1, 2), LIGHT_GRAY),
        ('BACKGROUND', (0, 3), (-1, 3), colors.white),
        ('BACKGROUND', (0, 4), (-1, 4), LIGHT_GRAY),
        ('BACKGROUND', (0, 5), (-1, 5), colors.white),
        ('BACKGROUND', (0, 6), (-1, 6), LIGHT_GRAY),
        ('BACKGROUND', (0, 7), (-1, 7), colors.white),
        ('BACKGROUND', (0, 8), (-1, 8), LIGHT_GRAY),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(tech_table)
    
    story.append(PageBreak())
    
    # 2.2 Fonctionnalités Implémentées
    story.append(Paragraph('<b>2.2 Fonctionnalites Implementees</b>', h2_style))
    
    story.append(Paragraph(
        'La plateforme offre un ensemble complet de fonctionnalites couvrant lensemble du cycle de vie des projets '
        'data engineering. Le dashboard principal fournit une vue densemble des projets actifs, des metriques de '
        'performance et des alertes systeme. Les utilisateurs peuvent creer et gerer des projets data, configurer '
        'des sources de donnees, et construire des pipelines visuels via le Pipeline Builder.',
        body_style
    ))
    
    story.append(Paragraph(
        'Le systeme de facturation est entierement operationnel avec Stripe, supportant 4 plans tarifaires '
        '(Starter a 499 EUR/mois, Professional a 1499 EUR/mois, Enterprise a 4999 EUR/mois, et Agency a 2999 EUR/mois). '
        'Les fonctionnalites incluent la creation de sessions de checkout, la gestion des webhooks, le portail client, '
        'et la gestion des abonnements (creation, upgrade, annulation, reactivation). Chaque plan definit des limites '
        'specifiques en termes de projets, utilisateurs, et ressources.',
        body_style
    ))
    
    # Tableau pages principales
    story.append(Spacer(1, 12))
    pages_data = [
        [
            Paragraph('<b>Page</b>', table_header),
            Paragraph('<b>Description</b>', table_header),
            Paragraph('<b>Statut</b>', table_header)
        ],
        [
            Paragraph('Dashboard', table_cell_left),
            Paragraph('Vue densemble projets et metriques', table_cell_left),
            Paragraph('Complet', table_cell)
        ],
        [
            Paragraph('Projects', table_cell_left),
            Paragraph('Gestion des projets data engineering', table_cell_left),
            Paragraph('Complet', table_cell)
        ],
        [
            Paragraph('Builder', table_cell_left),
            Paragraph('Pipeline builder visuel', table_cell_left),
            Paragraph('Complet', table_cell)
        ],
        [
            Paragraph('Analytics', table_cell_left),
            Paragraph('Dashboards et visualisations', table_cell_left),
            Paragraph('Complet', table_cell)
        ],
        [
            Paragraph('Billing', table_cell_left),
            Paragraph('Gestion facturation et abonnements', table_cell_left),
            Paragraph('Complet', table_cell)
        ],
        [
            Paragraph('Security', table_cell_left),
            Paragraph('Dashboard securite et conformite', table_cell_left),
            Paragraph('Complet', table_cell)
        ],
        [
            Paragraph('SSO', table_cell_left),
            Paragraph('Configuration SSO enterprise', table_cell_left),
            Paragraph('Complet', table_cell)
        ],
        [
            Paragraph('API Docs', table_cell_left),
            Paragraph('Documentation OpenAPI', table_cell_left),
            Paragraph('Complet', table_cell)
        ],
        [
            Paragraph('Lineage', table_cell_left),
            Paragraph('Data lineage et traçabilite', table_cell_left),
            Paragraph('Partiel', table_cell)
        ],
    ]
    
    pages_table = Table(pages_data, colWidths=[3.5*cm, 7*cm, 3.5*cm])
    pages_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, 1), colors.white),
        ('BACKGROUND', (0, 2), (-1, 2), LIGHT_GRAY),
        ('BACKGROUND', (0, 3), (-1, 3), colors.white),
        ('BACKGROUND', (0, 4), (-1, 4), LIGHT_GRAY),
        ('BACKGROUND', (0, 5), (-1, 5), colors.white),
        ('BACKGROUND', (0, 6), (-1, 6), LIGHT_GRAY),
        ('BACKGROUND', (0, 7), (-1, 7), colors.white),
        ('BACKGROUND', (0, 8), (-1, 8), LIGHT_GRAY),
        ('BACKGROUND', (0, 9), (-1, 9), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(pages_table)
    
    story.append(PageBreak())
    
    # 2.3 Agents IA
    story.append(Paragraph('<b>2.3 Agents IA et Automatisation</b>', h2_style))
    
    story.append(Paragraph(
        'Le coeur differentiant de DataSphere Innovation reside dans ses 10 agents IA specialises, concus pour '
        'automatiser et optimiser les taches complexes dingenierie des donnees. Chaque agent est responsable '
        'dun domaine specifique et opere de maniere autonome tout en collaborant avec les autres agents via '
        'un systeme dorchestration de workflows. Cette approche modulaire permet une grande flexibilite et '
        'une extensibilite naturelle.',
        body_style
    ))
    
    story.append(Paragraph(
        'Lagent Business Agent analyse les besoins metiers et traduit les objectifs business en specifications '
        'techniques. Le Sales Agent qualifie les prospects et genere des propositions commerciales personnalisees. '
        'Le Discovery Agent decouvre automatiquement les schemas des sources de donnees. LArchitecture Agent '
        'concoit larchitecture data optimale. Le Pipeline Agent genere les DAGs Airflow et modeles dbt. Le '
        'Transformation Agent ecrit les transformations SQL. Lagent BI cree les dashboards et KPIs. Le '
        'Conversational Agent permet les requetes en langage naturel. Le Pricing Agent genere des propositions '
        'tarifaires. Enfin, le Productization Agent transforme les projets reussis en templates reutilisables.',
        body_style
    ))
    
    # Tableau agents
    story.append(Spacer(1, 12))
    agents_data = [
        [
            Paragraph('<b>Agent</b>', table_header),
            Paragraph('<b>Role Principal</b>', table_header),
            Paragraph('<b>Statut</b>', table_header)
        ],
        [
            Paragraph('Business Agent', table_cell_left),
            Paragraph('Analyse business et strategie', table_cell_left),
            Paragraph('Operationnel', table_cell)
        ],
        [
            Paragraph('Sales Agent', table_cell_left),
            Paragraph('Qualification et propositions', table_cell_left),
            Paragraph('Operationnel', table_cell)
        ],
        [
            Paragraph('Discovery Agent', table_cell_left),
            Paragraph('Decouverte des sources', table_cell_left),
            Paragraph('Operationnel', table_cell)
        ],
        [
            Paragraph('Architecture Agent', table_cell_left),
            Paragraph('Design architecture data', table_cell_left),
            Paragraph('Operationnel', table_cell)
        ],
        [
            Paragraph('Pipeline Agent', table_cell_left),
            Paragraph('Generation DAGs/dbt', table_cell_left),
            Paragraph('Operationnel', table_cell)
        ],
        [
            Paragraph('Transformation Agent', table_cell_left),
            Paragraph('SQL et transformations', table_cell_left),
            Paragraph('Operationnel', table_cell)
        ],
        [
            Paragraph('BI Agent', table_cell_left),
            Paragraph('Dashboards et KPIs', table_cell_left),
            Paragraph('Operationnel', table_cell)
        ],
        [
            Paragraph('Conversational Agent', table_cell_left),
            Paragraph('Requetes langage naturel', table_cell_left),
            Paragraph('Operationnel', table_cell)
        ],
        [
            Paragraph('Pricing Agent', table_cell_left),
            Paragraph('Propositions tarifaires', table_cell_left),
            Paragraph('Operationnel', table_cell)
        ],
        [
            Paragraph('Productization Agent', table_cell_left),
            Paragraph('Templates reutilisables', table_cell_left),
            Paragraph('Operationnel', table_cell)
        ],
    ]
    
    agents_table = Table(agents_data, colWidths=[4*cm, 6.5*cm, 3.5*cm])
    agents_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, 1), colors.white),
        ('BACKGROUND', (0, 2), (-1, 2), LIGHT_GRAY),
        ('BACKGROUND', (0, 3), (-1, 3), colors.white),
        ('BACKGROUND', (0, 4), (-1, 4), LIGHT_GRAY),
        ('BACKGROUND', (0, 5), (-1, 5), colors.white),
        ('BACKGROUND', (0, 6), (-1, 6), LIGHT_GRAY),
        ('BACKGROUND', (0, 7), (-1, 7), colors.white),
        ('BACKGROUND', (0, 8), (-1, 8), LIGHT_GRAY),
        ('BACKGROUND', (0, 9), (-1, 9), colors.white),
        ('BACKGROUND', (0, 10), (-1, 10), LIGHT_GRAY),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(agents_table)
    
    story.append(PageBreak())
    
    # 2.4 Sécurité
    story.append(Paragraph('<b>2.4 Securite et Conformite</b>', h2_style))
    
    story.append(Paragraph(
        'La securite est un pilier fondamental de DataSphere Innovation, avec une infrastructure complete '
        'correspondant aux exigences des grandes entreprises et des secteurs reglementes. Le systeme de chiffrement '
        'utilise AES-256-GCM pour toutes les donnees sensibles, avec une gestion securisee des cles et une rotation '
        'automatique. Laudit logging capture tous les evenements critiques avec des signatures infalsifiables pour '
        'garantir lintegrite des traces.',
        body_style
    ))
    
    story.append(Paragraph(
        'La gestion des secrets est integree avec rotation automatique et chiffrement en base. Le controle dacces IP '
        'permet de configurer des listes blanches et noires, incluant le support des notations CIDR. Le rate limiting '
        'protege contre les abus, actuellement implemente en memoire avec une migration prevue vers Redis pour la '
        'production. Le framework de conformite couvre SOC 2 (85%), RGPD (92%), HIPAA (88%), PCI-DSS (80%), et '
        'ISO 27001 (87%).',
        body_style
    ))
    
    # Tableau conformité
    story.append(Spacer(1, 12))
    compliance_data = [
        [
            Paragraph('<b>Framework</b>', table_header),
            Paragraph('<b>Score</b>', table_header),
            Paragraph('<b>Elements Principaux</b>', table_header)
        ],
        [
            Paragraph('SOC 2', table_cell_left),
            Paragraph('85%', table_cell),
            Paragraph('Audit logging, encryption, access controls', table_cell_left)
        ],
        [
            Paragraph('RGPD', table_cell_left),
            Paragraph('92%', table_cell),
            Paragraph('Data export, consent management, privacy', table_cell_left)
        ],
        [
            Paragraph('HIPAA', table_cell_left),
            Paragraph('88%', table_cell),
            Paragraph('PHI protection, audit trails, encryption', table_cell_left)
        ],
        [
            Paragraph('PCI-DSS', table_cell_left),
            Paragraph('80%', table_cell),
            Paragraph('Payment security, data handling', table_cell_left)
        ],
        [
            Paragraph('ISO 27001', table_cell_left),
            Paragraph('87%', table_cell),
            Paragraph('ISMS framework, risk management', table_cell_left)
        ],
    ]
    
    compliance_table = Table(compliance_data, colWidths=[3.5*cm, 2.5*cm, 8*cm])
    compliance_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, 1), colors.white),
        ('BACKGROUND', (0, 2), (-1, 2), LIGHT_GRAY),
        ('BACKGROUND', (0, 3), (-1, 3), colors.white),
        ('BACKGROUND', (0, 4), (-1, 4), LIGHT_GRAY),
        ('BACKGROUND', (0, 5), (-1, 5), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(compliance_table)
    
    story.append(PageBreak())
    
    # ==================== 3. ANALYSE SWOT ====================
    story.append(Paragraph('<b>3. Analyse SWOT</b>', h1_style))
    
    story.append(Paragraph(
        'Lanalyse SWOT permet devaluer de maniere structuree les forces et faiblesses internes du projet, '
        'ainsi que les opportunites et menaces externes. Cette analyse est essentielle pour definir la strategie '
        'de lancement et identifier les axes prioritaires.',
        body_style
    ))
    
    # Forces
    story.append(Paragraph('<b>Forces (Strengths)</b>', h3_style))
    forces = [
        'Architecture technique moderne et robuste (Next.js 16, Prisma, TypeScript)',
        '10 agents IA specialises offrant une forte valeur differentiante',
        'Infrastructure securite enterprise-grade (encryption, audit, compliance)',
        'Systeme de facturation complet avec Stripe (4 plans tarifaires)',
        'Support SSO multi-providers (Azure AD, Google, Okta, Auth0)',
        'Internationalisation complete en 4 langues europeennes',
        'Architecture multi-tenant avec gestion des organisations',
        'Configuration Kubernetes production-ready avec auto-scaling',
        'Documentation technique complete et guides utilisateur',
    ]
    for f in forces:
        story.append(Paragraph(f'- {f}', body_no_indent))
    
    # Faiblesses
    story.append(Paragraph('<b>Faiblesses (Weaknesses)</b>', h3_style))
    faiblesses = [
        'Coverage de tests insuffisant (50%) pour un lancement commercial',
        'Connecteurs supplementaires non implementes (MySQL, MongoDB, Snowflake)',
        'Absence de pipeline CI/CD pour automatisation du deploiement',
        'Dockerfile manquant a la racine du projet',
        'Autonomous engine non connecte a linterface utilisateur',
        'Systeme de notifications email non configure en production',
        'MFA supporte dans le schema mais non implemente dans lUI',
    ]
    for f in faiblesses:
        story.append(Paragraph(f'- {f}', body_no_indent))
    
    # Opportunités
    story.append(Paragraph('<b>Opportunites (Opportunities)</b>', h3_style))
    opportunites = [
        'Marche du Data Engineering en forte croissance (+25% par an)',
        'Demande croissante pour des solutions dautomatisation IA',
        'Adoption massive des architectures data mesh et data lakehouse',
        'Penurie de talents data engineers favorisant les outils dautomatisation',
        'Reglementations croissantes (RGPD, AI Act) creant des besoins de conformite',
        'Marche europeen moins sature que le marche americain',
        'Partenariats potentiels avec des integrateurs et cabinets de conseil',
    ]
    for o in opportunites:
        story.append(Paragraph(f'- {o}', body_no_indent))
    
    # Menaces
    story.append(Paragraph('<b>Menaces (Threats)</b>', h3_style))
    menaces = [
        'Concurrents etablis (Fivetran, Airbyte, dbt Labs) avec plus de ressources',
        'Geants du cloud (AWS, GCP, Azure) integrant des fonctionnalites similaires',
        'Rapidite devolution technologique necessitant une innovation continue',
        'Sensibilite des entreprises a la securite des donnees',
        'Risque de commoditisation des outils ETL/ELT',
    ]
    for m in menaces:
        story.append(Paragraph(f'- {m}', body_no_indent))
    
    story.append(PageBreak())
    
    # ==================== 4. GAP ANALYSIS ====================
    story.append(Paragraph('<b>4. Gap Analysis</b>', h1_style))
    
    story.append(Paragraph(
        'La gap analysis identifie les ecarts entre letat actuel du projet et les exigences pour un lancement '
        'commercial reussi. Chaque ecart est qualifie en termes de priorite, deffort estime et dimpact sur '
        'le lancement.',
        body_style
    ))
    
    # Tableau gap analysis
    story.append(Spacer(1, 12))
    gap_data = [
        [
            Paragraph('<b>Ecart</b>', table_header),
            Paragraph('<b>Priorite</b>', table_header),
            Paragraph('<b>Effort</b>', table_header),
            Paragraph('<b>Impact</b>', table_header)
        ],
        [
            Paragraph('Tests unitaires/e2e', table_cell_left),
            Paragraph('Critique', table_cell),
            Paragraph('2 semaines', table_cell),
            Paragraph('Bloquant', table_cell)
        ],
        [
            Paragraph('Pipeline CI/CD', table_cell_left),
            Paragraph('Critique', table_cell),
            Paragraph('1 semaine', table_cell),
            Paragraph('Bloquant', table_cell)
        ],
        [
            Paragraph('Dockerfile production', table_cell_left),
            Paragraph('Haute', table_cell),
            Paragraph('2 jours', table_cell),
            Paragraph('Important', table_cell)
        ],
        [
            Paragraph('Connecteurs MySQL/MongoDB', table_cell_left),
            Paragraph('Haute', table_cell),
            Paragraph('1 semaine', table_cell),
            Paragraph('Important', table_cell)
        ],
        [
            Paragraph('MFA implementation UI', table_cell_left),
            Paragraph('Moyenne', table_cell),
            Paragraph('3 jours', table_cell),
            Paragraph('Important', table_cell)
        ],
        [
            Paragraph('Email notifications production', table_cell_left),
            Paragraph('Moyenne', table_cell),
            Paragraph('2 jours', table_cell),
            Paragraph('Moderateur', table_cell)
        ],
        [
            Paragraph('Rate limiter Redis', table_cell_left),
            Paragraph('Haute', table_cell),
            Paragraph('1 jour', table_cell),
            Paragraph('Important', table_cell)
        ],
        [
            Paragraph('Autonomous engine UI', table_cell_left),
            Paragraph('Basse', table_cell),
            Paragraph('1 semaine', table_cell),
            Paragraph('Moderateur', table_cell)
        ],
        [
            Paragraph('Snowflake connector', table_cell_left),
            Paragraph('Moyenne', table_cell),
            Paragraph('4 jours', table_cell),
            Paragraph('Moderateur', table_cell)
        ],
        [
            Paragraph('Load testing', table_cell_left),
            Paragraph('Haute', table_cell),
            Paragraph('3 jours', table_cell),
            Paragraph('Important', table_cell)
        ],
    ]
    
    gap_table = Table(gap_data, colWidths=[5*cm, 2.5*cm, 3*cm, 3.5*cm])
    gap_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, 1), colors.white),
        ('BACKGROUND', (0, 2), (-1, 2), LIGHT_GRAY),
        ('BACKGROUND', (0, 3), (-1, 3), colors.white),
        ('BACKGROUND', (0, 4), (-1, 4), LIGHT_GRAY),
        ('BACKGROUND', (0, 5), (-1, 5), colors.white),
        ('BACKGROUND', (0, 6), (-1, 6), LIGHT_GRAY),
        ('BACKGROUND', (0, 7), (-1, 7), colors.white),
        ('BACKGROUND', (0, 8), (-1, 8), LIGHT_GRAY),
        ('BACKGROUND', (0, 9), (-1, 9), colors.white),
        ('BACKGROUND', (0, 10), (-1, 10), LIGHT_GRAY),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(gap_table)
    
    story.append(PageBreak())
    
    # ==================== 5. PLAN D'ACTION 8 SEMAINES ====================
    story.append(Paragraph('<b>5. Plan dAction 8 Semaines</b>', h1_style))
    
    story.append(Paragraph(
        'Le plan daction suivant est structure pour transformer DataSphere Innovation en un produit commercial '
        'pret a etre lance en 8 semaines. Chaque phase a des objectifs clairs, des livrables definis et des '
        'metriques de succes mesurables.',
        body_style
    ))
    
    # Semaines 1-2
    story.append(Paragraph('<b>5.1 Semaines 1-2: Fondations et Infrastructure</b>', h2_style))
    
    story.append(Paragraph('<b>Objectifs:</b>', h3_style))
    story.append(Paragraph(
        'Cette premiere phase vise a etablir les fondations necessaires pour un developpement efficace et '
        'un deploiement fiable. Il sagit de mettre en place les outils de qualite, la containerisation, '
        'et la pipeline CI/CD qui supporteront tout le reste du developpement.',
        body_style
    ))
    
    s12_tasks = [
        ['Jour 1-2', 'Creation Dockerfile multi-stage optimise', 'Image < 500MB'],
        ['Jour 2-3', 'Configuration GitHub Actions CI/CD', 'Build automatique'],
        ['Jour 3-4', 'Mise en place environnement staging', 'URL staging operationnelle'],
        ['Jour 4-7', 'Configuration Redis pour sessions et rate limiting', 'Performance validée'],
        ['Jour 7-10', 'Implementation du rate limiter Redis', 'Tests de charge OK'],
        ['Jour 10-14', 'Setup monitoring production (Sentry, LogRocket)', 'Alertes configurees'],
    ]
    
    s12_data = [[Paragraph('<b>Periode</b>', table_header), Paragraph('<b>Tache</b>', table_header), Paragraph('<b>Livrable</b>', table_header)]]
    for row in s12_tasks:
        s12_data.append([Paragraph(row[0], table_cell), Paragraph(row[1], table_cell_left), Paragraph(row[2], table_cell)])
    
    s12_table = Table(s12_data, colWidths=[2.5*cm, 7*cm, 4.5*cm])
    s12_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, 1), colors.white),
        ('BACKGROUND', (0, 2), (-1, 2), LIGHT_GRAY),
        ('BACKGROUND', (0, 3), (-1, 3), colors.white),
        ('BACKGROUND', (0, 4), (-1, 4), LIGHT_GRAY),
        ('BACKGROUND', (0, 5), (-1, 5), colors.white),
        ('BACKGROUND', (0, 6), (-1, 6), LIGHT_GRAY),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(s12_table)
    
    story.append(PageBreak())
    
    # Semaines 3-4
    story.append(Paragraph('<b>5.2 Semaines 3-4: Qualite et Tests</b>', h2_style))
    
    story.append(Paragraph('<b>Objectifs:</b>', h3_style))
    story.append(Paragraph(
        'Cette phase est critique pour la fiabilite du produit. Lobjectif est datteindre un coverage de tests '
        'de 80% minimum, incluant des tests unitaires pour les composants critiques, des tests dintegration '
        'pour les APIs, et des tests end-to-end pour les parcours utilisateur principaux.',
        body_style
    ))
    
    s34_tasks = [
        ['Jour 1-4', 'Tests unitaires composants React', 'Coverage UI > 70%'],
        ['Jour 4-8', 'Tests integration APIs critiques', 'Toutes APIs couvertes'],
        ['Jour 8-10', 'Tests E2E parcours principaux', '5+ scenarios E2E'],
        ['Jour 10-12', 'Tests de securite (OWASP)', 'Passage audit securite'],
        ['Jour 12-14', 'Performance testing et optimisation', 'P95 < 500ms'],
    ]
    
    s34_data = [[Paragraph('<b>Periode</b>', table_header), Paragraph('<b>Tache</b>', table_header), Paragraph('<b>Livrable</b>', table_header)]]
    for row in s34_tasks:
        s34_data.append([Paragraph(row[0], table_cell), Paragraph(row[1], table_cell_left), Paragraph(row[2], table_cell)])
    
    s34_table = Table(s34_data, colWidths=[2.5*cm, 7*cm, 4.5*cm])
    s34_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, 1), colors.white),
        ('BACKGROUND', (0, 2), (-1, 2), LIGHT_GRAY),
        ('BACKGROUND', (0, 3), (-1, 3), colors.white),
        ('BACKGROUND', (0, 4), (-1, 4), LIGHT_GRAY),
        ('BACKGROUND', (0, 5), (-1, 5), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(s34_table)
    
    story.append(Spacer(1, 15))
    
    # Semaines 5-6
    story.append(Paragraph('<b>5.3 Semaines 5-6: Pre-Production</b>', h2_style))
    
    story.append(Paragraph('<b>Objectifs:</b>', h3_style))
    story.append(Paragraph(
        'La phase de pre-production finalise les fonctionnalites manquantes et prepare lenvironnement de '
        'production. Les connecteurs additionnels sont implementes, le systeme de notifications est configure, '
        'et linfrastructure production est deployee et validee.',
        body_style
    ))
    
    s56_tasks = [
        ['Jour 1-4', 'Implementation connecteur MySQL', 'Connecteur operationnel'],
        ['Jour 4-7', 'Implementation connecteur MongoDB', 'Connecteur operationnel'],
        ['Jour 7-10', 'Configuration email production (SendGrid)', 'Emails transactionnels OK'],
        ['Jour 10-12', 'Implementation MFA UI', 'TOTP operationnel'],
        ['Jour 12-14', 'Deploiement infrastructure production', 'K8s operationnel'],
    ]
    
    s56_data = [[Paragraph('<b>Periode</b>', table_header), Paragraph('<b>Tache</b>', table_header), Paragraph('<b>Livrable</b>', table_header)]]
    for row in s56_tasks:
        s56_data.append([Paragraph(row[0], table_cell), Paragraph(row[1], table_cell_left), Paragraph(row[2], table_cell)])
    
    s56_table = Table(s56_data, colWidths=[2.5*cm, 7*cm, 4.5*cm])
    s56_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, 1), colors.white),
        ('BACKGROUND', (0, 2), (-1, 2), LIGHT_GRAY),
        ('BACKGROUND', (0, 3), (-1, 3), colors.white),
        ('BACKGROUND', (0, 4), (-1, 4), LIGHT_GRAY),
        ('BACKGROUND', (0, 5), (-1, 5), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(s56_table)
    
    story.append(PageBreak())
    
    # Semaines 7-8
    story.append(Paragraph('<b>5.4 Semaines 7-8: Lancement</b>', h2_style))
    
    story.append(Paragraph('<b>Objectifs:</b>', h3_style))
    story.append(Paragraph(
        'La phase finale prepare et execute le lancement commercial. Cela inclut la finalisation de la '
        'documentation utilisateur, la mise en place du support client, la configuration des analytics '
        'produit, et lexecution de la strategie marketing initiale.',
        body_style
    ))
    
    s78_tasks = [
        ['Jour 1-3', 'Documentation utilisateur finale', 'Docs site complet'],
        ['Jour 3-5', 'Configuration support (Intercom)', 'Chat support actif'],
        ['Jour 5-7', 'Analytics produit (Mixpanel)', 'Funnels configures'],
        ['Jour 7-10', 'Beta testing avec 10 utilisateurs', 'Feedback integre'],
        ['Jour 10-12', 'Site marketing et landing pages', 'Site marketing live'],
        ['Jour 12-14', 'Lancement et communication', 'Press release'],
    ]
    
    s78_data = [[Paragraph('<b>Periode</b>', table_header), Paragraph('<b>Tache</b>', table_header), Paragraph('<b>Livrable</b>', table_header)]]
    for row in s78_tasks:
        s78_data.append([Paragraph(row[0], table_cell), Paragraph(row[1], table_cell_left), Paragraph(row[2], table_cell)])
    
    s78_table = Table(s78_data, colWidths=[2.5*cm, 7*cm, 4.5*cm])
    s78_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, 1), colors.white),
        ('BACKGROUND', (0, 2), (-1, 2), LIGHT_GRAY),
        ('BACKGROUND', (0, 3), (-1, 3), colors.white),
        ('BACKGROUND', (0, 4), (-1, 4), LIGHT_GRAY),
        ('BACKGROUND', (0, 5), (-1, 5), colors.white),
        ('BACKGROUND', (0, 6), (-1, 6), LIGHT_GRAY),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(s78_table)
    
    story.append(PageBreak())
    
    # ==================== 6. BUDGET ET RESSOURCES ====================
    story.append(Paragraph('<b>6. Budget et Ressources</b>', h1_style))
    
    story.append(Paragraph(
        'Le budget total estime pour amener le projet au niveau production-ready et assurer un lancement '
        'commercial reussi est de 45 000 EUR. Ce budget couvre le developpement supplementaire, linfrastructure, '
        'et les outils necessaires pour les 8 semaines de preparation.',
        body_style
    ))
    
    # Tableau budget
    story.append(Spacer(1, 12))
    budget_data = [
        [
            Paragraph('<b>Categorie</b>', table_header),
            Paragraph('<b>Description</b>', table_header),
            Paragraph('<b>Montant</b>', table_header)
        ],
        [
            Paragraph('Developpement', table_cell_left),
            Paragraph('Tests, connecteurs, features manquantes', table_cell_left),
            Paragraph('20 000 EUR', table_cell)
        ],
        [
            Paragraph('Infrastructure', table_cell_left),
            Paragraph('Kubernetes, Redis, monitoring, CDN', table_cell_left),
            Paragraph('8 000 EUR', table_cell)
        ],
        [
            Paragraph('Outils et services', table_cell_left),
            Paragraph('CI/CD, analytics, support, email', table_cell_left),
            Paragraph('4 000 EUR', table_cell)
        ],
        [
            Paragraph('Marketing initial', table_cell_left),
            Paragraph('Site web, content, advertising', table_cell_left),
            Paragraph('8 000 EUR', table_cell)
        ],
        [
            Paragraph('Legal et administratif', table_cell_left),
            Paragraph('CGV, privacy policy, trademarks', table_cell_left),
            Paragraph('3 000 EUR', table_cell)
        ],
        [
            Paragraph('Contingence', table_cell_left),
            Paragraph('Imprevus et ajustements', table_cell_left),
            Paragraph('2 000 EUR', table_cell)
        ],
        [
            Paragraph('<b>TOTAL</b>', table_header),
            Paragraph('', table_cell),
            Paragraph('<b>45 000 EUR</b>', table_header)
        ],
    ]
    
    budget_table = Table(budget_data, colWidths=[4*cm, 7*cm, 3*cm])
    budget_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, 1), colors.white),
        ('BACKGROUND', (0, 2), (-1, 2), LIGHT_GRAY),
        ('BACKGROUND', (0, 3), (-1, 3), colors.white),
        ('BACKGROUND', (0, 4), (-1, 4), LIGHT_GRAY),
        ('BACKGROUND', (0, 5), (-1, 5), colors.white),
        ('BACKGROUND', (0, 6), (-1, 6), LIGHT_GRAY),
        ('BACKGROUND', (0, 7), (-1, 7), PRIMARY_BLUE),
        ('TEXTCOLOR', (0, 7), (-1, 7), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(budget_table)
    
    story.append(Spacer(1, 15))
    story.append(Paragraph('<b>Equipe necessaire:</b>', h3_style))
    
    equipe = [
        '1 Tech Lead / Architecte (temps plein) - Coordination technique et decisions',
        '1 Developpeur Senior (temps plein) - Implementation features et tests',
        '1 DevOps Engineer (mi-temps) - Infrastructure et CI/CD',
        '1 Product Manager (mi-temps) - Roadmap et coordination',
        '1 Designer UX/UI (temps partiel) - Ajustements interface',
    ]
    for e in equipe:
        story.append(Paragraph(f'- {e}', body_no_indent))
    
    story.append(PageBreak())
    
    # ==================== 7. STRATEGIE COMMERCIALE ====================
    story.append(Paragraph('<b>7. Strategie Commerciale</b>', h1_style))
    
    story.append(Paragraph(
        'La strategie commerciale de DataSphere Innovation cible le marche B2B des entreprises de taille '
        'moyenne a grande ayant des besoins significatifs en ingenierie des donnees. Lapproche repose sur '
        'un modele SaaS avec abonnements mensuels ou annuels, complete par des services de professional services '
        'pour les implementations complexes.',
        body_style
    ))
    
    story.append(Paragraph('<b>7.1 Positionnement et Cibles</b>', h2_style))
    
    story.append(Paragraph(
        'Le positionnement se fait comme une plateforme dautomatisation intelligente pour le data engineering, '
        'differentiee par ses agents IA specialises. Les cibles principales sont les entreprises de 50 a 5000 '
        'employes dans les secteurs finance, retail, healthcare et SaaS, qui construisent ou modernisent leur '
        'infrastructure data.',
        body_style
    ))
    
    # Tableau pricing
    story.append(Spacer(1, 12))
    pricing_data = [
        [
            Paragraph('<b>Plan</b>', table_header),
            Paragraph('<b>Mensuel</b>', table_header),
            Paragraph('<b>Annuel</b>', table_header),
            Paragraph('<b>Cible</b>', table_header)
        ],
        [
            Paragraph('Starter', table_cell_left),
            Paragraph('499 EUR', table_cell),
            Paragraph('4 784 EUR', table_cell),
            Paragraph('PME, startups', table_cell)
        ],
        [
            Paragraph('Professional', table_cell_left),
            Paragraph('1 499 EUR', table_cell),
            Paragraph('14 390 EUR', table_cell),
            Paragraph('ETI, scale-ups', table_cell)
        ],
        [
            Paragraph('Enterprise', table_cell_left),
            Paragraph('4 999 EUR', table_cell),
            Paragraph('47 990 EUR', table_cell),
            Paragraph('Grandes entreprises', table_cell)
        ],
        [
            Paragraph('Agency', table_cell_left),
            Paragraph('2 999 EUR', table_cell),
            Paragraph('28 790 EUR', table_cell),
            Paragraph('Cabinets conseil', table_cell)
        ],
    ]
    
    pricing_table = Table(pricing_data, colWidths=[3.5*cm, 3*cm, 3*cm, 4.5*cm])
    pricing_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, 1), colors.white),
        ('BACKGROUND', (0, 2), (-1, 2), LIGHT_GRAY),
        ('BACKGROUND', (0, 3), (-1, 3), colors.white),
        ('BACKGROUND', (0, 4), (-1, 4), LIGHT_GRAY),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(pricing_table)
    
    story.append(Paragraph('<b>7.2 Canaux dacquisition</b>', h2_style))
    
    canaux = [
        'Marketing de contenu: Articles techniques, case studies, webinaires sur le data engineering',
        'SEO: Optimisation pour mots-cles data engineering, ETL automation, data pipeline',
        'Partenariats: Integration avec ecosysteme (dbt, Airflow, Snowflake, Databricks)',
        'Sales outbound: Prospection aupres des CTOs et Data Leads cibles',
        'Events: Presence aux conferences data (Data + AI Summit, dbt Coalesce)',
        'Marketplace: Deploiement sur AWS Marketplace, GCP Marketplace',
    ]
    for c in canaux:
        story.append(Paragraph(f'- {c}', body_no_indent))
    
    story.append(PageBreak())
    
    # ==================== 8. KPIs ET METRIQUES ====================
    story.append(Paragraph('<b>8. KPIs et Metriques de Succes</b>', h1_style))
    
    story.append(Paragraph(
        'Les KPIs suivants permettront de mesurer le succes du lancement et la sante du business. Ils sont '
        'classes par categorie et accompagnes dobjectifs a 3 mois, 6 mois et 12 mois.',
        body_style
    ))
    
    # Tableau KPIs
    story.append(Spacer(1, 12))
    kpi_data = [
        [
            Paragraph('<b>KPI</b>', table_header),
            Paragraph('<b>3 mois</b>', table_header),
            Paragraph('<b>6 mois</b>', table_header),
            Paragraph('<b>12 mois</b>', table_header)
        ],
        [
            Paragraph('MRR (Monthly Recurring Revenue)', table_cell_left),
            Paragraph('15 000 EUR', table_cell),
            Paragraph('50 000 EUR', table_cell),
            Paragraph('150 000 EUR', table_cell)
        ],
        [
            Paragraph('Clients payants', table_cell_left),
            Paragraph('10', table_cell),
            Paragraph('30', table_cell),
            Paragraph('80', table_cell)
        ],
        [
            Paragraph('Conversion trial to paid', table_cell_left),
            Paragraph('15%', table_cell),
            Paragraph('20%', table_cell),
            Paragraph('25%', table_cell)
        ],
        [
            Paragraph('Churn mensuel', table_cell_left),
            Paragraph('< 5%', table_cell),
            Paragraph('< 3%', table_cell),
            Paragraph('< 2%', table_cell)
        ],
        [
            Paragraph('NPS (Net Promoter Score)', table_cell_left),
            Paragraph('> 30', table_cell),
            Paragraph('> 40', table_cell),
            Paragraph('> 50', table_cell)
        ],
        [
            Paragraph('CAC (Customer Acquisition Cost)', table_cell_left),
            Paragraph('< 3 000 EUR', table_cell),
            Paragraph('< 2 500 EUR', table_cell),
            Paragraph('< 2 000 EUR', table_cell)
        ],
        [
            Paragraph('LTV (Lifetime Value)', table_cell_left),
            Paragraph('> 15 000 EUR', table_cell),
            Paragraph('> 25 000 EUR', table_cell),
            Paragraph('> 40 000 EUR', table_cell)
        ],
    ]
    
    kpi_table = Table(kpi_data, colWidths=[5.5*cm, 3*cm, 3*cm, 3*cm])
    kpi_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), PRIMARY_BLUE),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, 1), colors.white),
        ('BACKGROUND', (0, 2), (-1, 2), LIGHT_GRAY),
        ('BACKGROUND', (0, 3), (-1, 3), colors.white),
        ('BACKGROUND', (0, 4), (-1, 4), LIGHT_GRAY),
        ('BACKGROUND', (0, 5), (-1, 5), colors.white),
        ('BACKGROUND', (0, 6), (-1, 6), LIGHT_GRAY),
        ('BACKGROUND', (0, 7), (-1, 7), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    story.append(kpi_table)
    
    story.append(Spacer(1, 15))
    story.append(Paragraph('<b>KPIs techniques:</b>', h3_style))
    
    tech_kpis = [
        'Uptime: 99.9% SLA garanti',
        'Latence API: P95 < 200ms, P99 < 500ms',
        'Tests coverage: > 80% maintenu',
        'Temps de deploiement: < 15 minutes',
        'Mean Time to Recovery (MTTR): < 1 heure',
    ]
    for k in tech_kpis:
        story.append(Paragraph(f'- {k}', body_no_indent))
    
    story.append(PageBreak())
    
    # ==================== 9. CONCLUSION ====================
    story.append(Paragraph('<b>9. Conclusion et Recommandations</b>', h1_style))
    
    story.append(Paragraph(
        'DataSphere Innovation presente un potentiel commercial significatif grace a une architecture technique '
        'solide, des fonctionnalites innovantes portees par les agents IA, et une infrastructure securite '
        'conforme aux standards enterprise. Le projet atteint deja 86% de completion, le positionnant favorablement '
        'pour un lancement commercial dans 8 semaines.',
        body_style
    ))
    
    story.append(Paragraph(
        'Les principaux defis a adresse sont la qualite des tests (coverage actuel de 50%), la finalisation '
        'des connecteurs de donnees supplementaires, et la mise en place dune pipeline CI/CD robuste. Le plan '
        'daction detaille dans ce rapport fournit une feuille de route claire pour resoudre ces points critiques '
        'tout en prepareant le lancement commercial.',
        body_style
    ))
    
    story.append(Paragraph('<b>Recommandations prioritaires:</b>', h3_style))
    
    recommendations = [
        'Demarrer immediatement par les tests et la CI/CD - ce sont les blocants critiques',
        'Allouer le budget necessaire pour une equipe dediee sur les 8 semaines',
        'Prioriser les connecteurs MySQL et MongoDB pour elargir le marche adressable',
        'Etablir des partenariats avec des integrateurs pour accelerer la distribution',
        'Planifier une beta ferme avec 10 clients cibles avant le lancement public',
    ]
    for r in recommendations:
        story.append(Paragraph(f'- {r}', body_no_indent))
    
    story.append(Spacer(1, 15))
    
    story.append(Paragraph(
        'Avec une execution disciplinee du plan propose et un budget de 45 000 EUR, DataSphere Innovation est '
        'positionne pour atteindre un MRR de 15 000 EUR des les 3 premiers mois et croitre vers 150 000 EUR '
        'de MRR a 12 mois. Le ratio LTV/CAC cible de 20+ des le premier annee assurera la rentabilite et la '
        'scalabilite du business.',
        body_style
    ))
    
    # Génération du PDF
    doc.build(story)
    print('Rapport PDF genere avec succes!')

if __name__ == '__main__':
    build_document()
