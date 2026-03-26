#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
Guide de Collaboration d'Équipe - DataSphere Innovation
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image, ListFlowable, ListItem
)
from reportlab.pdfbase.pdfmetrics import registerFont, registerFontFamily
from reportlab.pdfbase.ttfonts import TTFont
import os

# === FONT REGISTRATION ===
registerFont(TTFont('Microsoft YaHei', '/usr/share/fonts/truetype/chinese/msyh.ttf'))
registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))
registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))

# Register font families for bold support
registerFontFamily('Microsoft YaHei', normal='Microsoft YaHei', bold='Microsoft YaHei')
registerFontFamily('SimHei', normal='SimHei', bold='SimHei')
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')

# === OUTPUT PATH ===
output_path = "/home/z/my-project/download/DataSphere_Guide_Collaboration_Equipe.pdf"

# === DOCUMENT SETUP ===
doc = SimpleDocTemplate(
    output_path,
    pagesize=A4,
    rightMargin=2*cm,
    leftMargin=2*cm,
    topMargin=2*cm,
    bottomMargin=2*cm,
    title="DataSphere_Guide_Collaboration_Equipe",
    author="Z.ai",
    creator="Z.ai",
    subject="Guide de collaboration d'équipe pour le projet DataSphere Innovation"
)

# === STYLES ===
styles = getSampleStyleSheet()

# Cover styles
cover_title_style = ParagraphStyle(
    name='CoverTitle',
    fontName='Microsoft YaHei',
    fontSize=36,
    leading=44,
    alignment=TA_CENTER,
    spaceAfter=30
)

cover_subtitle_style = ParagraphStyle(
    name='CoverSubtitle',
    fontName='SimHei',
    fontSize=18,
    leading=26,
    alignment=TA_CENTER,
    spaceAfter=40
)

cover_author_style = ParagraphStyle(
    name='CoverAuthor',
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
    fontSize=18,
    leading=26,
    alignment=TA_LEFT,
    spaceBefore=20,
    spaceAfter=12,
    textColor=colors.HexColor('#1F4E79')
)

h2_style = ParagraphStyle(
    name='Heading2CN',
    fontName='Microsoft YaHei',
    fontSize=14,
    leading=22,
    alignment=TA_LEFT,
    spaceBefore=16,
    spaceAfter=10,
    textColor=colors.HexColor('#2E75B6')
)

h3_style = ParagraphStyle(
    name='Heading3CN',
    fontName='SimHei',
    fontSize=12,
    leading=18,
    alignment=TA_LEFT,
    spaceBefore=12,
    spaceAfter=8,
    textColor=colors.HexColor('#404040')
)

# Body styles
body_style = ParagraphStyle(
    name='BodyCN',
    fontName='SimHei',
    fontSize=11,
    leading=18,
    alignment=TA_LEFT,
    spaceAfter=8,
    firstLineIndent=22,
    wordWrap='CJK'
)

body_no_indent_style = ParagraphStyle(
    name='BodyNoIndent',
    fontName='SimHei',
    fontSize=11,
    leading=18,
    alignment=TA_LEFT,
    spaceAfter=8,
    wordWrap='CJK'
)

# Table styles
table_header_style = ParagraphStyle(
    name='TableHeader',
    fontName='Microsoft YaHei',
    fontSize=10,
    leading=14,
    alignment=TA_CENTER,
    textColor=colors.white,
    wordWrap='CJK'
)

table_cell_style = ParagraphStyle(
    name='TableCell',
    fontName='SimHei',
    fontSize=9,
    leading=13,
    alignment=TA_LEFT,
    wordWrap='CJK'
)

table_cell_center_style = ParagraphStyle(
    name='TableCellCenter',
    fontName='SimHei',
    fontSize=9,
    leading=13,
    alignment=TA_CENTER,
    wordWrap='CJK'
)

# === COLORS ===
TABLE_HEADER_COLOR = colors.HexColor('#1F4E79')
TABLE_ROW_EVEN = colors.white
TABLE_ROW_ODD = colors.HexColor('#F5F5F5')

# === BUILD DOCUMENT ===
story = []

# === COVER PAGE ===
story.append(Spacer(1, 80))
story.append(Paragraph("<b>DataSphere Innovation</b>", cover_title_style))
story.append(Spacer(1, 20))
story.append(Paragraph("Guide de Collaboration d'Équipe", cover_subtitle_style))
story.append(Spacer(1, 40))
story.append(Paragraph("Organisation, Méthodologie et Bonnes Pratiques", cover_author_style))
story.append(Spacer(1, 60))
story.append(Paragraph("Version 1.0", cover_author_style))
story.append(Paragraph("Mars 2026", cover_author_style))
story.append(PageBreak())

# === TABLE OF CONTENTS ===
story.append(Paragraph("<b>Table des Matières</b>", h1_style))
story.append(Spacer(1, 12))

toc_items = [
    ("1. Introduction et Contexte", "3"),
    ("2. Structure de l'Équipe", "4"),
    ("   2.1 Composition et Rôles", "4"),
    ("   2.2 Matrice RACI", "5"),
    ("3. Méthodologie de Travail", "6"),
    ("   3.1 Framework Scrum Adapté", "6"),
    ("   3.2 Rituels et Cérémonies", "7"),
    ("4. Outils de Collaboration", "8"),
    ("   4.1 Stack Technique", "8"),
    ("   4.2 Communication et Documentation", "9"),
    ("5. Standards et Bonnes Pratiques", "10"),
    ("   5.1 Conventions de Code", "10"),
    ("   5.2 Processus de Code Review", "11"),
    ("6. Gestion des Risques", "12"),
    ("7. Plan de Formation", "13"),
]

for item, page in toc_items:
    toc_line = f"{item} {'.' * (60 - len(item))} {page}"
    story.append(Paragraph(toc_line, body_no_indent_style))

story.append(PageBreak())

# === 1. INTRODUCTION ===
story.append(Paragraph("<b>1. Introduction et Contexte</b>", h1_style))
story.append(Spacer(1, 12))

intro_text = """
DataSphere Innovation est une plateforme d'ingénierie de données d'entreprise conçue pour offrir une solution complète de gestion, transformation et analyse de données. Le projet représente un défi technique majeur avec plus de 35 connecteurs multi-secteurs, une architecture de sécurité certifiée, et une infrastructure scalable capable de traiter des volumes de données considérables. Ce guide de collaboration d'équipe a été élaboré pour assurer une coordination efficace entre les différents acteurs du projet, optimiser la productivité collective, et garantir la qualité des livrables tout au long du cycle de développement.
"""
story.append(Paragraph(intro_text.strip(), body_style))

context_text = """
La réussite de ce projet repose sur une collaboration étroite entre équipes multidisciplinaires : développeurs backend et frontend, ingénieurs DevOps, architectes système, spécialistes sécurité, et experts métier. Chaque membre de l'équipe doit comprendre non seulement ses responsabilités individuelles, mais également la manière dont son travail s'intègre dans l'ensemble du projet. Ce document définit les rôles, les processus de communication, les outils collaboratifs, et les standards qualité qui permettront à l'équipe de travailler de manière cohérente et efficace.
"""
story.append(Paragraph(context_text.strip(), body_style))

objectives_text = """
Les objectifs principaux de ce guide sont les suivants : premièrement, établir une structure organisationnelle claire avec des responsabilités bien définies pour chaque rôle. Deuxièmement, mettre en place une méthodologie de travail agile adaptée aux spécificités du projet. Troisièmement, sélectionner et configurer les outils de collaboration les plus appropriés. Quatrièmement, définir des standards de qualité et des processus de validation. Cinquièmement, anticiper et gérer les risques potentiels tout au long du projet.
"""
story.append(Paragraph(objectives_text.strip(), body_style))

story.append(PageBreak())

# === 2. STRUCTURE DE L'ÉQUIPE ===
story.append(Paragraph("<b>2. Structure de l'Équipe</b>", h1_style))
story.append(Spacer(1, 12))

story.append(Paragraph("<b>2.1 Composition et Rôles</b>", h2_style))
story.append(Spacer(1, 8))

team_intro = """
L'équipe DataSphere Innovation est structurée de manière à couvrir l'ensemble des compétences nécessaires au développement, déploiement et maintenance de la plateforme. Cette structure favorise à la fois la spécialisation technique et la collaboration interfonctionnelle. Chaque rôle a été défini en tenant compte des exigences spécifiques du projet et des compétences requises pour atteindre les objectifs de qualité et de délai.
"""
story.append(Paragraph(team_intro.strip(), body_style))

# Team composition table
team_data = [
    [Paragraph("<b>Rôle</b>", table_header_style), 
     Paragraph("<b>Effectif</b>", table_header_style), 
     Paragraph("<b>Responsabilités Principales</b>", table_header_style)],
    [Paragraph("Tech Lead", table_cell_style), 
     Paragraph("1", table_cell_center_style), 
     Paragraph("Architecture technique, décisions technologiques, mentorat, validation des choix d'implémentation", table_cell_style)],
    [Paragraph("Backend Senior", table_cell_style), 
     Paragraph("2", table_cell_center_style), 
     Paragraph("API REST/GraphQL, connecteurs data, optimisation performances, intégrations enterprise", table_cell_style)],
    [Paragraph("Frontend Senior", table_cell_style), 
     Paragraph("2", table_cell_center_style), 
     Paragraph("Interface utilisateur, composants React, expérience utilisateur, responsive design", table_cell_style)],
    [Paragraph("DevOps Engineer", table_cell_style), 
     Paragraph("1", table_cell_center_style), 
     Paragraph("CI/CD, infrastructure cloud, monitoring, sécurité infrastructure, automatisation", table_cell_style)],
    [Paragraph("Data Engineer", table_cell_style), 
     Paragraph("1", table_cell_center_style), 
     Paragraph("Pipelines de données, connecteurs, transformation ETL, optimisation requêtes", table_cell_style)],
    [Paragraph("Security Engineer", table_cell_style), 
     Paragraph("1", table_cell_center_style), 
     Paragraph("Audits sécurité, conformité RGPD/SOC2, chiffrement, gestion des accès, penetration testing", table_cell_style)],
    [Paragraph("QA Engineer", table_cell_style), 
     Paragraph("1", table_cell_center_style), 
     Paragraph("Tests automatisés, validation fonctionnelle, performance testing, gestion des anomalies", table_cell_style)],
    [Paragraph("Product Owner", table_cell_style), 
     Paragraph("1", table_cell_center_style), 
     Paragraph("Vision produit, backlog management, priorisation, relation clients stakeholders", table_cell_style)],
    [Paragraph("Scrum Master", table_cell_style), 
     Paragraph("1", table_cell_center_style), 
     Paragraph("Facilitation agile, résolution d'obstacles, amélioration continue, métriques d'équipe", table_cell_style)],
]

team_table = Table(team_data, colWidths=[3*cm, 2*cm, 10*cm])
team_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 2), (-1, 2), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 3), (-1, 3), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 4), (-1, 4), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 5), (-1, 5), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 6), (-1, 6), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 7), (-1, 7), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 8), (-1, 8), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 9), (-1, 9), TABLE_ROW_EVEN),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 8),
    ('RIGHTPADDING', (0, 0), (-1, -1), 8),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))

story.append(Spacer(1, 12))
story.append(team_table)
story.append(Spacer(1, 6))
story.append(Paragraph("<i>Tableau 1 : Composition de l'équipe DataSphere Innovation</i>", 
    ParagraphStyle(name='Caption', fontName='SimHei', fontSize=9, alignment=TA_CENTER, textColor=colors.grey)))

story.append(Spacer(1, 16))
story.append(Paragraph("<b>2.2 Matrice RACI</b>", h2_style))
story.append(Spacer(1, 8))

raci_intro = """
La matrice RACI (Responsible, Accountable, Consulted, Informed) permet de clarifier les responsabilités pour chaque type d'activité du projet. Cette matrice évite les ambiguïtés et les chevauchements de responsabilités qui pourraient entraîner des conflits ou des oublis. Elle sert de référence pour déterminer qui doit agir, qui doit valider, qui doit être consulté, et qui doit être informé pour chaque décision ou livrable du projet.
"""
story.append(Paragraph(raci_intro.strip(), body_style))

# RACI table
raci_data = [
    [Paragraph("<b>Activité</b>", table_header_style), 
     Paragraph("<b>Tech Lead</b>", table_header_style), 
     Paragraph("<b>Backend</b>", table_header_style), 
     Paragraph("<b>Frontend</b>", table_header_style), 
     Paragraph("<b>DevOps</b>", table_header_style), 
     Paragraph("<b>QA</b>", table_header_style), 
     Paragraph("<b>PO</b>", table_header_style)],
    [Paragraph("Architecture", table_cell_style), 
     Paragraph("A", table_cell_center_style), 
     Paragraph("R", table_cell_center_style), 
     Paragraph("C", table_cell_center_style), 
     Paragraph("C", table_cell_center_style), 
     Paragraph("I", table_cell_center_style), 
     Paragraph("I", table_cell_center_style)],
    [Paragraph("Développement API", table_cell_style), 
     Paragraph("A", table_cell_center_style), 
     Paragraph("R", table_cell_center_style), 
     Paragraph("I", table_cell_center_style), 
     Paragraph("C", table_cell_center_style), 
     Paragraph("C", table_cell_center_style), 
     Paragraph("I", table_cell_center_style)],
    [Paragraph("Interface UI/UX", table_cell_style), 
     Paragraph("C", table_cell_center_style), 
     Paragraph("I", table_cell_center_style), 
     Paragraph("R", table_cell_center_style), 
     Paragraph("I", table_cell_center_style), 
     Paragraph("C", table_cell_center_style), 
     Paragraph("A", table_cell_center_style)],
    [Paragraph("CI/CD Pipeline", table_cell_style), 
     Paragraph("A", table_cell_center_style), 
     Paragraph("C", table_cell_center_style), 
     Paragraph("I", table_cell_center_style), 
     Paragraph("R", table_cell_center_style), 
     Paragraph("C", table_cell_center_style), 
     Paragraph("I", table_cell_center_style)],
    [Paragraph("Tests & QA", table_cell_style), 
     Paragraph("I", table_cell_center_style), 
     Paragraph("C", table_cell_center_style), 
     Paragraph("C", table_cell_center_style), 
     Paragraph("C", table_cell_center_style), 
     Paragraph("R", table_cell_center_style), 
     Paragraph("A", table_cell_center_style)],
    [Paragraph("Backlog Sprint", table_cell_style), 
     Paragraph("C", table_cell_center_style), 
     Paragraph("C", table_cell_center_style), 
     Paragraph("C", table_cell_center_style), 
     Paragraph("C", table_cell_center_style), 
     Paragraph("C", table_cell_center_style), 
     Paragraph("R/A", table_cell_center_style)],
]

raci_table = Table(raci_data, colWidths=[3.5*cm, 2*cm, 2*cm, 2*cm, 2*cm, 1.5*cm, 1.5*cm])
raci_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 2), (-1, 2), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 3), (-1, 3), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 4), (-1, 4), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 5), (-1, 5), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 6), (-1, 6), TABLE_ROW_ODD),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
]))

story.append(Spacer(1, 12))
story.append(raci_table)
story.append(Spacer(1, 6))
story.append(Paragraph("<i>Tableau 2 : Matrice RACI (R=Responsible, A=Accountable, C=Consulted, I=Informed)</i>", 
    ParagraphStyle(name='Caption2', fontName='SimHei', fontSize=9, alignment=TA_CENTER, textColor=colors.grey)))

story.append(PageBreak())

# === 3. MÉTHODOLOGIE DE TRAVAIL ===
story.append(Paragraph("<b>3. Méthodologie de Travail</b>", h1_style))
story.append(Spacer(1, 12))

story.append(Paragraph("<b>3.1 Framework Scrum Adapté</b>", h2_style))
story.append(Spacer(1, 8))

scrum_intro = """
Le projet DataSphere Innovation adopte une méthodologie Scrum adaptée aux spécificités du développement d'une plateforme de données d'entreprise. Cette adaptation prend en compte la complexité technique du projet, la nécessité de coordination entre équipes spécialisées, et les contraintes de conformité réglementaire. Le framework Scrum fournit une structure itérative permettant de livrer de la valeur de manière incrémentale tout en maintenant une flexibilité suffisante pour s'adapter aux évolutions des besoins.
"""
story.append(Paragraph(scrum_intro.strip(), body_style))

# Sprint structure
story.append(Paragraph("<b>Structure des Sprints</b>", h3_style))
story.append(Spacer(1, 8))

sprint_text = """
Les sprints sont organisés sur une durée de deux semaines, offrant un équilibre optimal entre la fréquence des livraisons et le temps nécessaire pour développer des fonctionnalités complexes. Chaque sprint commence par une séance de planification lors de laquelle l'équipe s'engage sur un ensemble d'objectifs atteignables. Les daily standups permettent de synchroniser les efforts quotidiens et d'identifier rapidement les obstacles. La revue de sprint et la rétrospective clôturent chaque itération en célébrant les accomplissements et en identifiant les axes d'amélioration.
"""
story.append(Paragraph(sprint_text.strip(), body_style))

# Sprint details table
sprint_data = [
    [Paragraph("<b>Élément</b>", table_header_style), 
     Paragraph("<b>Durée</b>", table_header_style), 
     Paragraph("<b>Participants</b>", table_header_style), 
     Paragraph("<b>Objectifs</b>", table_header_style)],
    [Paragraph("Sprint Planning", table_cell_style), 
     Paragraph("4 heures", table_cell_center_style), 
     Paragraph("Équipe complète", table_cell_style), 
     Paragraph("Définir les objectifs, estimer les stories, constituer le sprint backlog", table_cell_style)],
    [Paragraph("Daily Standup", table_cell_style), 
     Paragraph("15 min", table_cell_center_style), 
     Paragraph("Équipe dev", table_cell_style), 
     Paragraph("Synchronisation, identification des blocages, ajustement quotidien", table_cell_style)],
    [Paragraph("Sprint Review", table_cell_style), 
     Paragraph("2 heures", table_cell_center_style), 
     Paragraph("Équipe + stakeholders", table_cell_style), 
     Paragraph("Démonstration des livrables, collecte de feedback, validation", table_cell_style)],
    [Paragraph("Rétrospective", table_cell_style), 
     Paragraph("1.5 heures", table_cell_center_style), 
     Paragraph("Équipe complète", table_cell_style), 
     Paragraph("Analyse du sprint, identification des améliorations, plan d'action", table_cell_style)],
    [Paragraph("Backlog Refinement", table_cell_style), 
     Paragraph("2 heures", table_cell_center_style), 
     Paragraph("PO + Tech Lead", table_cell_style), 
     Paragraph("Préparation des stories futures, clarification des requirements", table_cell_style)],
]

sprint_table = Table(sprint_data, colWidths=[3*cm, 2*cm, 3*cm, 7*cm])
sprint_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 2), (-1, 2), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 3), (-1, 3), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 4), (-1, 4), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 5), (-1, 5), TABLE_ROW_EVEN),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
]))

story.append(Spacer(1, 12))
story.append(sprint_table)
story.append(Spacer(1, 6))
story.append(Paragraph("<i>Tableau 3 : Structure des cérémonies Scrum</i>", 
    ParagraphStyle(name='Caption3', fontName='SimHei', fontSize=9, alignment=TA_CENTER, textColor=colors.grey)))

story.append(Spacer(1, 16))
story.append(Paragraph("<b>3.2 Rituels et Cérémonies</b>", h2_style))
story.append(Spacer(1, 8))

rituels_text = """
Au-delà des cérémonies Scrum classiques, l'équipe DataSphere Innovation met en place des rituels complémentaires pour renforcer la cohésion et la qualité. Ces rituels incluent des sessions de partage technique hebdomadaires où chaque membre peut présenter une technologie, un pattern ou une leçon apprise. Les revues d'architecture mensuelles permettent de valider les décisions techniques majeures et d'anticiper les besoins d'évolutivité. Enfin, les hackathons trimestriels offrent l'opportunité d'explorer des innovations technologiques sans la pression des livrables.
"""
story.append(Paragraph(rituels_text.strip(), body_style))

story.append(PageBreak())

# === 4. OUTILS DE COLLABORATION ===
story.append(Paragraph("<b>4. Outils de Collaboration</b>", h1_style))
story.append(Spacer(1, 12))

story.append(Paragraph("<b>4.1 Stack Technique</b>", h2_style))
story.append(Spacer(1, 8))

stack_intro = """
La sélection des outils de collaboration a été guidée par plusieurs critères essentiels : l'intégration fluide entre les différents outils, la sécurité des données, la facilité d'adoption par l'équipe, et la capacité à supporter les workflows agiles. La stack technique retenue offre un écosystème cohérent qui couvre l'ensemble des besoins de développement, de gestion de projet, et de communication. Chaque outil a été configuré pour s'intégrer automatiquement avec les autres, minimisant ainsi la friction et les tâches manuelles.
"""
story.append(Paragraph(stack_intro.strip(), body_style))

# Tools table
tools_data = [
    [Paragraph("<b>Catégorie</b>", table_header_style), 
     Paragraph("<b>Outil</b>", table_header_style), 
     Paragraph("<b>Usage Principal</b>", table_header_style)],
    [Paragraph("Version Control", table_cell_style), 
     Paragraph("Git + GitHub", table_cell_style), 
     Paragraph("Gestion du code source, pull requests, code review, branches strategy", table_cell_style)],
    [Paragraph("Project Management", table_cell_style), 
     Paragraph("Jira + Confluence", table_cell_style), 
     Paragraph("Backlog management, sprint planning, documentation technique, knowledge base", table_cell_style)],
    [Paragraph("CI/CD", table_cell_style), 
     Paragraph("GitHub Actions", table_cell_style), 
     Paragraph("Automatisation des builds, tests automatisés, déploiements continus, quality gates", table_cell_style)],
    [Paragraph("Communication", table_cell_style), 
     Paragraph("Slack + Zoom", table_cell_style), 
     Paragraph("Messagerie instantanée, canaux par équipe, réunions vidéo, screen sharing", table_cell_style)],
    [Paragraph("Design", table_cell_style), 
     Paragraph("Figma", table_cell_style), 
     Paragraph("Maquettes UI/UX, prototypes interactifs, design system, collaboration designers", table_cell_style)],
    [Paragraph("Monitoring", table_cell_style), 
     Paragraph("Datadog + PagerDuty", table_cell_style), 
     Paragraph("Observabilité, alerting, performance monitoring, incident management", table_cell_style)],
    [Paragraph("Security", table_cell_style), 
     Paragraph("Snyk + SonarQube", table_cell_style), 
     Paragraph("Scan de vulnérabilités, analyse de code, security gates, compliance checks", table_cell_style)],
]

tools_table = Table(tools_data, colWidths=[3*cm, 3.5*cm, 8.5*cm])
tools_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 2), (-1, 2), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 3), (-1, 3), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 4), (-1, 4), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 5), (-1, 5), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 6), (-1, 6), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 7), (-1, 7), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 8), (-1, 8), TABLE_ROW_ODD),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
]))

story.append(Spacer(1, 12))
story.append(tools_table)
story.append(Spacer(1, 6))
story.append(Paragraph("<i>Tableau 4 : Stack technique de collaboration</i>", 
    ParagraphStyle(name='Caption4', fontName='SimHei', fontSize=9, alignment=TA_CENTER, textColor=colors.grey)))

story.append(Spacer(1, 16))
story.append(Paragraph("<b>4.2 Communication et Documentation</b>", h2_style))
story.append(Spacer(1, 8))

comm_text = """
La communication au sein de l'équipe suit un modèle hybride optimisé pour l'efficacité tout en préservant les temps de concentration. Les canaux Slack sont organisés par domaine technique (#backend, #frontend, #devops, #security) et par thématique transverse (#incidents, #releases, #architecture). Les communications synchrones sont réservées aux discussions nécessitant une résolution rapide ou une prise de décision collective. La documentation technique est centralisée dans Confluence avec une structure normalisée incluant des templates pour les ADR (Architecture Decision Records), les runbooks opérationnels, et les guides de développement.
"""
story.append(Paragraph(comm_text.strip(), body_style))

doc_text = """
La documentation du projet DataSphere Innovation est organisée selon une hiérarchie claire qui facilite la recherche d'information et la maintenance. Au niveau racine se trouvent les documents de gouvernance : la charte du projet, les guidelines de contribution, et le glossaire métier. Les dossiers techniques contiennent les spécifications fonctionnelles, les schémas d'architecture, et les guides d'intégration pour chaque connecteur. Les dossiers opérationnels regroupent les procédures de déploiement, les plans de reprise d'activité, et les playbooks d'incident. Cette organisation permet à chaque membre de l'équipe de trouver rapidement l'information dont il a besoin.
"""
story.append(Paragraph(doc_text.strip(), body_style))

story.append(PageBreak())

# === 5. STANDARDS ET BONNES PRATIQUES ===
story.append(Paragraph("<b>5. Standards et Bonnes Pratiques</b>", h1_style))
story.append(Spacer(1, 12))

story.append(Paragraph("<b>5.1 Conventions de Code</b>", h2_style))
story.append(Spacer(1, 8))

conventions_text = """
Les conventions de code constituent le fondement de la qualité et de la maintenabilité du projet. Elles assurent la cohérence du codebase malgré la diversité des contributeurs et facilitent les revues de code. Pour le projet DataSphere Innovation, nous avons adopté un ensemble de standards stricts mais pragmatiques, équilibrant rigueur technique et productivité de l'équipe. Ces conventions sont appliquées et vérifiées automatiquement via des outils d'analyse statique intégrés au pipeline CI/CD.
"""
story.append(Paragraph(conventions_text.strip(), body_style))

# Code standards table
code_standards_data = [
    [Paragraph("<b>Aspect</b>", table_header_style), 
     Paragraph("<b>Standard</b>", table_header_style), 
     Paragraph("<b>Outil de Validation</b>", table_header_style)],
    [Paragraph("TypeScript", table_cell_style), 
     Paragraph("Strict mode, explicit types, no any, interfaces over types", table_cell_style), 
     Paragraph("ESLint + TypeScript Compiler", table_cell_style)],
    [Paragraph("React", table_cell_style), 
     Paragraph("Functional components, hooks, component composition, props validation", table_cell_style), 
     Paragraph("ESLint React Plugin", table_cell_style)],
    [Paragraph("API Design", table_cell_style), 
     Paragraph("RESTful conventions, OpenAPI spec, versioning, error standardization", table_cell_style), 
     Paragraph("OpenAPI Linter", table_cell_style)],
    [Paragraph("Testing", table_cell_style), 
     Paragraph("80% coverage minimum, unit + integration + E2E, test-driven features", table_cell_style), 
     Paragraph("Vitest + Playwright", table_cell_style)],
    [Paragraph("Security", table_cell_style), 
     Paragraph("OWASP Top 10, input validation, parameterized queries, secrets management", table_cell_style), 
     Paragraph("Snyk + SonarQube", table_cell_style)],
    [Paragraph("Documentation", table_cell_style), 
     Paragraph("JSDoc for public APIs, README per module, ADR for decisions", table_cell_style), 
     Paragraph("Manual review + templates", table_cell_style)],
]

code_table = Table(code_standards_data, colWidths=[3*cm, 6*cm, 6*cm])
code_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 2), (-1, 2), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 3), (-1, 3), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 4), (-1, 4), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 5), (-1, 5), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 6), (-1, 6), TABLE_ROW_ODD),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
]))

story.append(Spacer(1, 12))
story.append(code_table)
story.append(Spacer(1, 6))
story.append(Paragraph("<i>Tableau 5 : Standards de code et outils de validation</i>", 
    ParagraphStyle(name='Caption5', fontName='SimHei', fontSize=9, alignment=TA_CENTER, textColor=colors.grey)))

story.append(Spacer(1, 16))
story.append(Paragraph("<b>5.2 Processus de Code Review</b>", h2_style))
story.append(Spacer(1, 8))

review_text = """
Le processus de code review est un pilier fondamental de la qualité du projet. Chaque pull request doit passer par plusieurs étapes de validation avant d'être mergée. Premièrement, les checks automatisés vérifient la compilation, l'exécution des tests, l'analyse statique, et le scan de sécurité. Deuxièmement, au moins deux reviewers doivent approuver le code, dont obligatoirement un Tech Lead pour les modifications d'architecture. Troisièmement, les commentaires doivent être adressés et résolus. Ce processus rigoureux garantit que seul du code de qualité atteint la branche principale.
"""
story.append(Paragraph(review_text.strip(), body_style))

review_criteria = """
Les critères d'évaluation lors des revues de code incluent : la correction fonctionnelle du code par rapport aux spécifications, la qualité architecturale et le respect des patterns établis, la lisibilité et la maintenabilité du code, la couverture de tests adéquate pour les nouvelles fonctionnalités, la gestion appropriée des cas d'erreur et des edge cases, et la documentation suffisante pour les API publiques et les algorithmes complexes. Les reviewers sont encouragés à fournir des feedbacks constructifs et à suggérer des améliorations plutôt que de simplement pointer les défauts.
"""
story.append(Paragraph(review_criteria.strip(), body_style))

story.append(PageBreak())

# === 6. GESTION DES RISQUES ===
story.append(Paragraph("<b>6. Gestion des Risques</b>", h1_style))
story.append(Spacer(1, 12))

risks_intro = """
La gestion proactive des risques est essentielle pour le succès d'un projet de cette envergure. Une analyse approfondie des risques potentiels a été réalisée, couvrant les aspects techniques, organisationnels, et métier. Pour chaque risque identifié, des mesures de prévention et des plans de contingence ont été définis. Cette approche permet d'anticiper les problèmes plutôt que de les subir, et de réagir rapidement lorsqu'ils se matérialisent.
"""
story.append(Paragraph(risks_intro.strip(), body_style))

# Risk table
risk_data = [
    [Paragraph("<b>Risque</b>", table_header_style), 
     Paragraph("<b>Probabilité</b>", table_header_style), 
     Paragraph("<b>Impact</b>", table_header_style), 
     Paragraph("<b>Mitigation</b>", table_header_style)],
    [Paragraph("Perte de membres clés", table_cell_style), 
     Paragraph("Moyenne", table_cell_center_style), 
     Paragraph("Élevé", table_cell_center_style), 
     Paragraph("Knowledge sharing, documentation exhaustive, pair programming, backup assignés", table_cell_style)],
    [Paragraph("Retard de dépendances externes", table_cell_style), 
     Paragraph("Élevée", table_cell_center_style), 
     Paragraph("Moyen", table_cell_center_style), 
     Paragraph("Mocking pour développement, contrats d'API, planification anticipée", table_cell_style)],
    [Paragraph("Vulnérabilité sécurité critique", table_cell_style), 
     Paragraph("Moyenne", table_cell_center_style), 
     Paragraph("Critique", table_cell_center_style), 
     Paragraph("Scans automatiques, audits réguliers, processus de patch urgent", table_cell_style)],
    [Paragraph("Problèmes de performance", table_cell_style), 
     Paragraph("Moyenne", table_cell_center_style), 
     Paragraph("Élevé", table_cell_center_style), 
     Paragraph("Load testing, monitoring proactif, capacity planning", table_cell_style)],
    [Paragraph("Scope creep", table_cell_style), 
     Paragraph("Élevée", table_cell_center_style), 
     Paragraph("Moyen", table_cell_center_style), 
     Paragraph("Backlog strict, PO gate, change management process", table_cell_style)],
    [Paragraph("Défaillance infrastructure", table_cell_style), 
     Paragraph("Faible", table_cell_center_style), 
     Paragraph("Critique", table_cell_center_style), 
     Paragraph("Multi-AZ deployment, backups réguliers, disaster recovery plan", table_cell_style)],
]

risk_table = Table(risk_data, colWidths=[3.5*cm, 2.5*cm, 2*cm, 7*cm])
risk_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 2), (-1, 2), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 3), (-1, 3), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 4), (-1, 4), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 5), (-1, 5), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 6), (-1, 6), TABLE_ROW_ODD),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
]))

story.append(Spacer(1, 12))
story.append(risk_table)
story.append(Spacer(1, 6))
story.append(Paragraph("<i>Tableau 6 : Matrice des risques principaux</i>", 
    ParagraphStyle(name='Caption6', fontName='SimHei', fontSize=9, alignment=TA_CENTER, textColor=colors.grey)))

story.append(PageBreak())

# === 7. PLAN DE FORMATION ===
story.append(Paragraph("<b>7. Plan de Formation</b>", h1_style))
story.append(Spacer(1, 12))

training_intro = """
Le plan de formation vise à développer les compétences de l'équipe en alignment avec les besoins du projet et les objectifs de carrière individuels. Chaque membre bénéficie d'un parcours de formation personnalisé, combinant apprentissage théorique, pratique sur le projet, et mentoring. L'investissement dans la formation continue est considéré comme un facteur clé de succès, permettant à l'équipe de rester à la pointe des technologies et des pratiques de développement.
"""
story.append(Paragraph(training_intro.strip(), body_style))

# Training table
training_data = [
    [Paragraph("<b>Domaine</b>", table_header_style), 
     Paragraph("<b>Formation</b>", table_header_style), 
     Paragraph("<b>Durée</b>", table_header_style), 
     Paragraph("<b>Cible</b>", table_header_style)],
    [Paragraph("TypeScript Avancé", table_cell_style), 
     Paragraph("Types generics, utility types, patterns avancés", table_cell_style), 
     Paragraph("2 jours", table_cell_center_style), 
     Paragraph("Équipe dev complète", table_cell_style)],
    [Paragraph("Architecture Microservices", table_cell_style), 
     Paragraph("Patterns, communication, résilience, observabilité", table_cell_style), 
     Paragraph("3 jours", table_cell_center_style), 
     Paragraph("Backend + DevOps", table_cell_style)],
    [Paragraph("DevOps & Kubernetes", table_cell_style), 
     Paragraph("Orchestration, déploiement, monitoring, security", table_cell_style), 
     Paragraph("4 jours", table_cell_center_style), 
     Paragraph("DevOps + Backend seniors", table_cell_style)],
    [Paragraph("Sécurité Applicative", table_cell_style), 
     Paragraph("OWASP, secure coding, audit, penetration testing basics", table_cell_style), 
     Paragraph("3 jours", table_cell_center_style), 
     Paragraph("Équipe complète", table_cell_style)],
    [Paragraph("Data Engineering", table_cell_style), 
     Paragraph("ETL, data pipelines, optimisation, dbt, airflow", table_cell_style), 
     Paragraph("4 jours", table_cell_center_style), 
     Paragraph("Data Engineer + Backend", table_cell_style)],
    [Paragraph("Agile & Scrum", table_cell_style), 
     Paragraph("Certification PSM, facilitation, estimation", table_cell_style), 
     Paragraph("2 jours", table_cell_center_style), 
     Paragraph("SM + PO + Tech Lead", table_cell_style)],
]

training_table = Table(training_data, colWidths=[3.5*cm, 5.5*cm, 2*cm, 4*cm])
training_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 2), (-1, 2), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 3), (-1, 3), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 4), (-1, 4), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 5), (-1, 5), TABLE_ROW_EVEN),
    ('BACKGROUND', (0, 6), (-1, 6), TABLE_ROW_ODD),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
]))

story.append(Spacer(1, 12))
story.append(training_table)
story.append(Spacer(1, 6))
story.append(Paragraph("<i>Tableau 7 : Plan de formation pour l'année</i>", 
    ParagraphStyle(name='Caption7', fontName='SimHei', fontSize=9, alignment=TA_CENTER, textColor=colors.grey)))

story.append(Spacer(1, 20))

conclusion_text = """
Ce guide de collaboration d'équipe constitue un document vivant qui sera mis à jour régulièrement en fonction des retours d'expérience et de l'évolution du projet. L'adhésion de tous les membres de l'équipe à ces principes et processus est essentielle pour assurer le succès du projet DataSphere Innovation. Des révisions trimestrielles permettront d'ajuster les pratiques et d'intégrer les améliorations identifiées lors des rétrospectives.
"""
story.append(Paragraph(conclusion_text.strip(), body_style))

# === BUILD PDF ===
doc.build(story)
print(f"PDF generated successfully: {output_path}")
