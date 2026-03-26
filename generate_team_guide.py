#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DataSphere Innovation - Guide de Collaboration d'Equipe
"""

from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, ListFlowable, ListItem
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_JUSTIFY
from reportlab.lib.units import cm, inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
import os

# Register fonts
pdfmetrics.registerFont(TTFont('Microsoft YaHei', '/usr/share/fonts/truetype/chinese/msyh.ttf'))
pdfmetrics.registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))

# Register font families for bold tags
registerFontFamily('Microsoft YaHei', normal='Microsoft YaHei', bold='Microsoft YaHei')
registerFontFamily('SimHei', normal='SimHei', bold='SimHei')
registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')

# Output path
output_path = '/home/z/my-project/download/DataSphere_Guide_Collaboration_Equipe.pdf'

# Create document
doc = SimpleDocTemplate(
    output_path,
    pagesize=A4,
    rightMargin=2*cm,
    leftMargin=2*cm,
    topMargin=2*cm,
    bottomMargin=2*cm,
    title='DataSphere_Guide_Collaboration_Equipe',
    author='Z.ai',
    creator='Z.ai',
    subject='Guide de collaboration equipe pour le projet DataSphere Innovation'
)

# Styles
styles = getSampleStyleSheet()

# Custom styles
cover_title = ParagraphStyle(
    'CoverTitle',
    fontName='Microsoft YaHei',
    fontSize=36,
    leading=44,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#1F4E79'),
    spaceAfter=20
)

cover_subtitle = ParagraphStyle(
    'CoverSubtitle',
    fontName='SimHei',
    fontSize=18,
    leading=24,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#2E75B6'),
    spaceAfter=40
)

h1_style = ParagraphStyle(
    'H1Style',
    fontName='Microsoft YaHei',
    fontSize=20,
    leading=28,
    alignment=TA_LEFT,
    textColor=colors.HexColor('#1F4E79'),
    spaceBefore=24,
    spaceAfter=12
)

h2_style = ParagraphStyle(
    'H2Style',
    fontName='Microsoft YaHei',
    fontSize=16,
    leading=22,
    alignment=TA_LEFT,
    textColor=colors.HexColor('#2E75B6'),
    spaceBefore=18,
    spaceAfter=8
)

h3_style = ParagraphStyle(
    'H3Style',
    fontName='Microsoft YaHei',
    fontSize=13,
    leading=18,
    alignment=TA_LEFT,
    textColor=colors.HexColor('#404040'),
    spaceBefore=12,
    spaceAfter=6
)

body_style = ParagraphStyle(
    'BodyStyle',
    fontName='SimHei',
    fontSize=11,
    leading=18,
    alignment=TA_LEFT,
    firstLineIndent=2*12,
    spaceAfter=8,
    wordWrap='CJK'
)

body_no_indent = ParagraphStyle(
    'BodyNoIndent',
    fontName='SimHei',
    fontSize=11,
    leading=18,
    alignment=TA_LEFT,
    spaceAfter=8,
    wordWrap='CJK'
)

# Table styles
header_style = ParagraphStyle(
    'TableHeader',
    fontName='Microsoft YaHei',
    fontSize=10,
    leading=14,
    textColor=colors.white,
    alignment=TA_CENTER
)

cell_style = ParagraphStyle(
    'TableCell',
    fontName='SimHei',
    fontSize=9,
    leading=13,
    alignment=TA_LEFT,
    wordWrap='CJK'
)

cell_center = ParagraphStyle(
    'TableCellCenter',
    fontName='SimHei',
    fontSize=9,
    leading=13,
    alignment=TA_CENTER,
    wordWrap='CJK'
)

# Color scheme
TABLE_HEADER_COLOR = colors.HexColor('#1F4E79')
TABLE_ROW_ODD = colors.HexColor('#F5F5F5')

story = []

# ========== COVER PAGE ==========
story.append(Spacer(1, 120))
story.append(Paragraph('<b>DataSphere Innovation</b>', cover_title))
story.append(Spacer(1, 20))
story.append(Paragraph('Guide de Collaboration d\'Equipe', cover_subtitle))
story.append(Spacer(1, 30))
story.append(Paragraph('Organisation, Methodologie et Bonnes Pratiques', ParagraphStyle(
    'CoverInfo',
    fontName='SimHei',
    fontSize=14,
    leading=20,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#666666')
)))
story.append(Spacer(1, 80))
story.append(Paragraph('Version 1.0', ParagraphStyle(
    'Version',
    fontName='SimHei',
    fontSize=12,
    leading=16,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#888888')
)))
story.append(Paragraph('Mars 2026', ParagraphStyle(
    'Date',
    fontName='SimHei',
    fontSize=12,
    leading=16,
    alignment=TA_CENTER,
    textColor=colors.HexColor('#888888')
)))
story.append(PageBreak())

# ========== INTRODUCTION ==========
story.append(Paragraph('<b>1. Introduction</b>', h1_style))

story.append(Paragraph(
    'Ce guide definit l\'organisation, les processus et les bonnes pratiques pour le travail collaboratif '
    'sur le projet DataSphere Innovation. Il a ete conçu pour assurer une communication efficace, '
    'une distribution claire des responsabilites et une livraison de qualite dans le respect des delais. '
    'L\'objectif principal est de creer un environnement de travail structuré tout en préservant '
    'la flexibilité necessaire à l\'innovation. Ce document s\'adresse à tous les membres de l\'equipe, '
    'qu\'ils soient developpeurs, designers, product owners ou stakeholders, et constitue une reference '
    'commune pour aligner les attentes et harmoniser les pratiques de travail au quotidien.',
    body_style
))

story.append(Paragraph(
    'DataSphere Innovation est une plateforme de data engineering qui integre de nombreuses fonctionnalites '
    'avancees: connecteurs multi-sources, pipelines de transformation, securite entreprise, billing Stripe, '
    'et bien d\'autres. La complexite du projet requiert une coordination rigoureuse entre les differents '
    'membres de l\'equipe. Ce guide etablit les fondations d\'une collaboration reussie en definissant '
    'les roles, les responsabilites, les processus de communication et les standards techniques '
    'qui permettront à chaque contributeur de travailler de maniere efficace et autonome.',
    body_style
))

# ========== TEAM STRUCTURE ==========
story.append(Paragraph('<b>2. Structure de l\'Equipe</b>', h1_style))

story.append(Paragraph(
    'La structure de l\'equipe a ete concue pour couvrir l\'ensemble des competences necessaires au '
    'developpement et à la maintenance de DataSphere Innovation. Chaque role a ete defini avec des '
    'responsabilites claires pour eviter les chevauchements et les zones d\'ombre. Cette organisation '
    'permet une specialisation efficace tout en favorisant les interactions transversales entre les '
    'differentes expertises. L\'equipe ideale est composee de 8 à 12 personnes, ce qui permet '
    'de maintenir une communication fluide tout en couvrant tous les domaines critiques du projet.',
    body_style
))

story.append(Paragraph('<b>2.1 Roles et Responsabilites</b>', h2_style))

# Team roles table
team_data = [
    [Paragraph('<b>Role</b>', header_style), Paragraph('<b>Effectif</b>', header_style), 
     Paragraph('<b>Responsabilites Principales</b>', header_style)],
    [Paragraph('Tech Lead', cell_center), Paragraph('1', cell_center),
     Paragraph('Architecture technique, decisions technologiques, mentoring, code review final, coordination technique avec les equipes externes', cell_style)],
    [Paragraph('Product Owner', cell_center), Paragraph('1', cell_center),
     Paragraph('Vision produit, priorisation backlog, liaison avec stakeholders, validation des livraisons, definition des user stories et acceptance criteria', cell_style)],
    [Paragraph('Scrum Master', cell_center), Paragraph('1', cell_center),
     Paragraph('Facilitation des ceremonies, resolution des blockers, amelioration continue, coaching agile, suivi des metriques d\'equipe', cell_style)],
    [Paragraph('Senior Backend Dev', cell_center), Paragraph('2', cell_center),
     Paragraph('APIs REST, pipelines data, integrations, optimisation performances, securite backend, documentation technique', cell_style)],
    [Paragraph('Senior Frontend Dev', cell_center), Paragraph('2', cell_center),
     Paragraph('UI/UX components, pages React, optimisation frontend, accessibility, tests E2E, integration des maquettes design', cell_style)],
    [Paragraph('DevOps Engineer', cell_center), Paragraph('1', cell_center),
     Paragraph('CI/CD, infrastructure cloud, monitoring, securite infrastructure, automatisation, gestion des environnements', cell_style)],
    [Paragraph('QA Engineer', cell_center), Paragraph('1', cell_center),
     Paragraph('Strategie de test, automatisation, validation fonctionnelle, rapports de bugs, non-regression, performance testing', cell_style)],
    [Paragraph('Data Engineer', cell_center), Paragraph('1', cell_center),
     Paragraph('Connecteurs, transformations, optimisation queries, data quality, documentation des schemas et flux de donnees', cell_style)],
]

team_table = Table(team_data, colWidths=[3*cm, 2*cm, 11*cm])
team_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('BACKGROUND', (0, 6), (-1, 6), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 7), (-1, 7), colors.white),
    ('BACKGROUND', (0, 8), (-1, 8), TABLE_ROW_ODD),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))

story.append(Spacer(1, 12))
story.append(team_table)
story.append(Spacer(1, 6))
story.append(Paragraph('Tableau 1. Distribution des roles dans l\'equipe DataSphere', ParagraphStyle(
    'Caption', fontName='SimHei', fontSize=9, alignment=TA_CENTER, textColor=colors.HexColor('#666666')
)))
story.append(Spacer(1, 18))

story.append(Paragraph('<b>2.2 Matrice RACI</b>', h2_style))

story.append(Paragraph(
    'La matrice RACI (Responsible, Accountable, Consulted, Informed) definit clairement qui fait quoi '
    'pour chaque type d\'activite. Cette clarification est essentielle pour eviter les malentendus et '
    'les responsabilites diluees. Le role "Accountable" est toujours unique pour garantir une prise '
    'de decision claire, tandis que plusieurs personnes peuvent etre "Responsible" pour l\'execution. '
    'Les personnes "Consulted" apportent leur expertise avant la decision, et les "Informed" sont '
    'tenues au courant des decisions prises. Cette matrice doit etre consultee systematiquement '
    'lors de l\'attribution de nouvelles taches ou de la resolution de conflits.',
    body_style
))

# RACI table
raci_data = [
    [Paragraph('<b>Activite</b>', header_style), 
     Paragraph('<b>Tech Lead</b>', header_style),
     Paragraph('<b>PO</b>', header_style),
     Paragraph('<b>SM</b>', header_style),
     Paragraph('<b>Devs</b>', header_style),
     Paragraph('<b>DevOps</b>', header_style),
     Paragraph('<b>QA</b>', header_style)],
    [Paragraph('Architecture technique', cell_style), 
     Paragraph('A', cell_center), Paragraph('C', cell_center), Paragraph('I', cell_center),
     Paragraph('R', cell_center), Paragraph('C', cell_center), Paragraph('I', cell_center)],
    [Paragraph('Backlog refinement', cell_style), 
     Paragraph('C', cell_center), Paragraph('A', cell_center), Paragraph('R', cell_center),
     Paragraph('C', cell_center), Paragraph('I', cell_center), Paragraph('C', cell_center)],
    [Paragraph('Code implementation', cell_style), 
     Paragraph('C', cell_center), Paragraph('I', cell_center), Paragraph('I', cell_center),
     Paragraph('R/A', cell_center), Paragraph('C', cell_center), Paragraph('I', cell_center)],
    [Paragraph('Code review', cell_style), 
     Paragraph('A', cell_center), Paragraph('I', cell_center), Paragraph('I', cell_center),
     Paragraph('R', cell_center), Paragraph('C', cell_center), Paragraph('I', cell_center)],
    [Paragraph('Testing strategy', cell_style), 
     Paragraph('C', cell_center), Paragraph('C', cell_center), Paragraph('I', cell_center),
     Paragraph('C', cell_center), Paragraph('I', cell_center), Paragraph('R/A', cell_center)],
    [Paragraph('Deployment', cell_style), 
     Paragraph('C', cell_center), Paragraph('I', cell_center), Paragraph('I', cell_center),
     Paragraph('C', cell_center), Paragraph('R/A', cell_center), Paragraph('C', cell_center)],
    [Paragraph('Sprint planning', cell_style), 
     Paragraph('C', cell_center), Paragraph('A', cell_center), Paragraph('R', cell_center),
     Paragraph('R', cell_center), Paragraph('C', cell_center), Paragraph('C', cell_center)],
]

raci_table = Table(raci_data, colWidths=[4*cm, 2*cm, 2*cm, 2*cm, 2*cm, 2*cm, 2*cm])
raci_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('BACKGROUND', (0, 6), (-1, 6), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 7), (-1, 7), colors.white),
    ('BACKGROUND', (0, 8), (-1, 8), TABLE_ROW_ODD),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 4),
    ('RIGHTPADDING', (0, 0), (-1, -1), 4),
    ('TOPPADDING', (0, 0), (-1, -1), 5),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
]))

story.append(Spacer(1, 12))
story.append(raci_table)
story.append(Spacer(1, 6))
story.append(Paragraph('Tableau 2. Matrice RACI (R=Responsible, A=Accountable, C=Consulted, I=Informed)', ParagraphStyle(
    'Caption', fontName='SimHei', fontSize=9, alignment=TA_CENTER, textColor=colors.HexColor('#666666')
)))
story.append(Spacer(1, 18))

# ========== METHODOLOGY ==========
story.append(Paragraph('<b>3. Methodologie de Travail</b>', h1_style))

story.append(Paragraph(
    'L\'equipe DataSphere adopte une approche Agile hybride, combinant les elements les plus efficaces '
    'de Scrum et de Kanban. Cette methode a ete choisie pour s\'adapter à la nature du projet, qui '
    'combine des cycles de livraison reguliers avec une necessite de flexibilite sur les priorites. '
    'Scrum fournit la structure necessaire avec ses ceremonies et ses sprints, tandis que Kanban '
    'permet de visualiser le flux de travail et de gerer les taches urgentes de maniere plus fluide. '
    'Cette combinaison a fait ses preuves dans de nombreuses equipes tech et s\'adapte particulierement '
    'bien aux projets de plateforme data avec des deadlines clients et des besoins d\'innovation continue.',
    body_style
))

story.append(Paragraph('<b>3.1 Organisation des Sprints</b>', h2_style))

story.append(Paragraph(
    'Les sprints durent deux semaines, une duree qui represente le meilleur compromis entre la frequence '
    'de livraison et le temps necessaire pour developper des fonctionnalites significatives. Chaque sprint '
    'commence par un Sprint Planning le lundi matin et se termine par une Demo et une Retrospective le '
    'vendredi de la deuxieme semaine. Cette organisation laisse un weekend de buffer pour traiter les '
    'imprevus de derniere minute sans impacter le sprint suivant. Les objectifs du sprint sont fixes '
    'lors du planning et ne doivent pas changer sauf cas d\'urgence majeur, ce qui permet à l\'equipe '
    'de maintenir un focus optimal et d\'atteindre une velocite previsible.',
    body_style
))

# Sprint calendar
sprint_data = [
    [Paragraph('<b>Jour</b>', header_style), Paragraph('<b>Matin</b>', header_style), Paragraph('<b>Apres-midi</b>', header_style)],
    [Paragraph('Lundi (S1)', cell_center), Paragraph('Sprint Planning (2h)', cell_style), Paragraph('Refinement Backlog (1h)', cell_style)],
    [Paragraph('Mardi-Jeudi', cell_center), Paragraph('Developpement', cell_style), Paragraph('Developpement', cell_style)],
    [Paragraph('Vendredi', cell_center), Paragraph('Daily + Dev', cell_style), Paragraph('Code Review + Tests', cell_style)],
    [Paragraph('Lundi (S2)', cell_center), Paragraph('Daily + Dev', cell_style), Paragraph('Developpement', cell_style)],
    [Paragraph('Mardi-Jeudi', cell_center), Paragraph('Developpement', cell_style), Paragraph('Developpement', cell_style)],
    [Paragraph('Vendredi (S2)', cell_center), Paragraph('Sprint Review (1h)', cell_style), Paragraph('Retrospective (1h)', cell_style)],
]

sprint_table = Table(sprint_data, colWidths=[4*cm, 6*cm, 6*cm])
sprint_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('BACKGROUND', (0, 6), (-1, 6), TABLE_ROW_ODD),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))

story.append(Spacer(1, 12))
story.append(sprint_table)
story.append(Spacer(1, 6))
story.append(Paragraph('Tableau 3. Calendrier type d\'un sprint de 2 semaines', ParagraphStyle(
    'Caption', fontName='SimHei', fontSize=9, alignment=TA_CENTER, textColor=colors.HexColor('#666666')
)))
story.append(Spacer(1, 18))

story.append(Paragraph('<b>3.2 Ceremonies Agile</b>', h2_style))

story.append(Paragraph('<b>Daily Standup (15 min)</b>', h3_style))
story.append(Paragraph(
    'Chaque jour à 9h30, l\'equipe se reunie debout pour un point rapide. Chacun repond aux trois '
    'questions classiques: qu\'ai-je fait hier, que vais-je faire aujourd\'hui, y a-t-il des blockers? '
    'Cette breve ceremonie maintient l\'alignement de l\'equipe et identifie rapidement les obstacles. '
    'Le Scrum Master note les blockers et s\'assure qu\'ils sont resolus dans la journee. Les discussions '
    'techniques approfondies sont repoussees à une reunion dediee pour ne pas rallonger le daily. '
    'La discipline sur la duree (15 minutes max) est essentielle pour maintenir l\'energie et l\'attention.',
    body_style
))

story.append(Paragraph('<b>Sprint Planning (2h)</b>', h3_style))
story.append(Paragraph(
    'Le lundi du premier jour du sprint, l\'equipe se reunie pour planifier le travail des deux semaines '
    'à venir. Le Product Owner presente les priorites et les user stories du haut du backlog. L\'equipe '
    'estime collectivement les taches en story points et s\'engage sur un objectif de sprint realiste. '
    'L\'estimation se fait en planning poker pour impliquer tout le monde et eviter les biais d\'ancrage. '
    'Le Tech Lead s\'assure que les dependances techniques sont identifiees. Le resultat est un sprint '
    'backlog clair avec des taches assignees et un engagement collectif sur les objectifs.',
    body_style
))

story.append(Paragraph('<b>Sprint Review / Demo (1h)</b>', h3_style))
story.append(Paragraph(
    'Le vendredi de la deuxieme semaine, l\'equipe presente les fonctionnalites developpees aux stakeholders. '
    'Cette demo est l\'occasion de collecter des feedbacks immediats et de valider que les attentes sont '
    'remplies. Les fonctionnalites non terminees sont expliquees et re-priorisees pour le sprint suivant. '
    'Le Product Owner anime cette session et capture les retours dans le backlog. Les stakeholders sont '
    'encourages à poser des questions et à exprimer leurs besoins evolutifs. Cette transparence renforce '
    'la confiance et permet d\'ajuster rapidement la direction du produit si necessaire.',
    body_style
))

story.append(Paragraph('<b>Retrospective (1h)</b>', h3_style))
story.append(Paragraph(
    'Immediately apres la demo, l\'equipe se reunit sans les stakeholders pour une retrospective. '
    'Le format "What went well, What could be improved, Actions for next sprint" permet d\'identifier '
    'les points ameliorables de maniere constructive. Le Scrum Master facilite les discussions et '
    's\'assure que les actions sont concretes, mesurables et assignees. Un maximum de 3 actions '
    'par retrospective garantit qu\'elles seront effectivement implementees. Ces ameliorations '
    'continues sont essentielles pour maintenir la motivation de l\'equipe et optimiser les processus.',
    body_style
))

# ========== TOOLS ==========
story.append(Paragraph('<b>4. Outils de Collaboration</b>', h1_style))

story.append(Paragraph(
    'Le choix des outils de collaboration est crucial pour l\'efficacite de l\'equipe. Nous avons '
    'selectionne des outils qui s\'integrent bien entre eux et qui correspondent aux besoins specifiques '
    'de DataSphere. La regle d\'or est: un seul outil par fonction pour eviter la dispersion de l\'information. '
    'Tous les membres de l\'equipe doivent maitriser ces outils et respecter les conventions d\'usage '
    'definies dans ce guide. La formation aux outils fait partie de l\'onboarding de chaque nouveau membre.',
    body_style
))

# Tools table
tools_data = [
    [Paragraph('<b>Categorie</b>', header_style), Paragraph('<b>Outil</b>', header_style), Paragraph('<b>Usage Principal</b>', header_style)],
    [Paragraph('Gestion de projet', cell_style), Paragraph('Jira / Linear', cell_center), Paragraph('Backlog, sprints, user stories, time tracking', cell_style)],
    [Paragraph('Code source', cell_style), Paragraph('GitHub', cell_center), Paragraph('Repositories, pull requests, code review, CI/CD', cell_style)],
    [Paragraph('Documentation', cell_style), Paragraph('Notion / Confluence', cell_center), Paragraph('Specs, wiki, onboarding, meeting notes', cell_style)],
    [Paragraph('Communication sync', cell_style), Paragraph('Slack', cell_center), Paragraph('Channels par equipe, DMs, integrations, alerts', cell_style)],
    [Paragraph('Communication async', cell_style), Paragraph('Loom', cell_center), Paragraph('Videos explicatives, demos async, knowledge base', cell_style)],
    [Paragraph('Design', cell_style), Paragraph('Figma', cell_center), Paragraph('Maquettes, design system, prototypes', cell_style)],
    [Paragraph('Monitoring', cell_style), Paragraph('Datadog / Grafana', cell_center), Paragraph('Alertes, dashboards, performance tracking', cell_style)],
    [Paragraph('Video calls', cell_style), Paragraph('Google Meet / Zoom', cell_center), Paragraph('Reunions, screen sharing, recordings', cell_style)],
]

tools_table = Table(tools_data, colWidths=[4*cm, 4*cm, 8*cm])
tools_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('BACKGROUND', (0, 6), (-1, 6), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 7), (-1, 7), colors.white),
    ('BACKGROUND', (0, 8), (-1, 8), TABLE_ROW_ODD),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))

story.append(Spacer(1, 12))
story.append(tools_table)
story.append(Spacer(1, 6))
story.append(Paragraph('Tableau 4. Stack d\'outils de collaboration', ParagraphStyle(
    'Caption', fontName='SimHei', fontSize=9, alignment=TA_CENTER, textColor=colors.HexColor('#666666')
)))
story.append(Spacer(1, 18))

story.append(Paragraph('<b>4.1 Conventions Slack</b>', h2_style))

story.append(Paragraph(
    'L\'utilisation de Slack doit etre structuree pour eviter la surcharge informationnelle. Les canaux '
    'sont organises par theme et par equipe, avec une convention de nommage claire: #team-datasphere pour '
    'les discussions generales, #team-datasphere-dev pour les sujets techniques, #team-datasphere-alerts '
    'pour les notifications automatiques. Les messages importants doivent etre threads pour faciliter '
    'le suivi et eviter le bruit dans le canal principal. Le status et les horaires de travail doivent '
    'etre mis à jour pour respecter les fuseaux horaires si l\'equipe est distribuee.',
    body_style
))

story.append(Paragraph(
    'Les integrations avec GitHub, Jira et le monitoring sont configurees pour poster automatiquement '
    'les informations pertinentes dans les canaux appropries. Les alerts de production sont centralisees '
    'dans #team-datasphere-alerts avec un systeme de mention @oncall pour les urgences. Les decisions '
    'importantes prises sur Slack doivent etre documentees dans Notion pour reference future. '
    'L\'usage des emojis reactions permet de confirmer la lecture sans encombrer le fil de discussion.',
    body_style
))

# ========== CODE STANDARDS ==========
story.append(Paragraph('<b>5. Standards de Code</b>', h1_style))

story.append(Paragraph(
    'La qualite du code est un pilier fondamental de DataSphere Innovation. Des standards clairs et '
    'des processus de review rigoureux garantissent la maintenabilité et la fiabilite du codebase. '
    'Chaque contributeur est responsable de la qualite de son code et de son adherence aux standards. '
    'La dette technique est traquee et planifiee comme n\'importe quelle autre tache du backlog.',
    body_style
))

story.append(Paragraph('<b>5.1 Conventions de Code</b>', h2_style))

story.append(Paragraph(
    'Le projet utilise TypeScript strict avec ESLint et Prettier pour garantir la coherence du code. '
    'Les regles ESLint sont configurees dans le fichier .eslintrc.json et doivent etre respectees. '
    'Les commits suivent la convention Conventional Commits: feat: pour les nouvelles fonctionnalites, '
    'fix: pour les corrections de bugs, refactor: pour les refactorisations, docs: pour la documentation. '
    'Cette convention permet de generer automatiquement le changelog et de faciliter les code reviews.',
    body_style
))

# Code standards table
code_data = [
    [Paragraph('<b>Aspect</b>', header_style), Paragraph('<b>Standard</b>', header_style)],
    [Paragraph('Langage', cell_style), Paragraph('TypeScript strict (strict mode active)', cell_style)],
    [Paragraph('Linter', cell_style), Paragraph('ESLint avec config @typescript-eslint/recommended', cell_style)],
    [Paragraph('Formatter', cell_style), Paragraph('Prettier avec config projet', cell_style)],
    [Paragraph('Commits', cell_style), Paragraph('Conventional Commits (feat:, fix:, refactor:, docs:)', cell_style)],
    [Paragraph('Branches', cell_style), Paragraph('main, develop, feature/*, bugfix/*, hotfix/*', cell_style)],
    [Paragraph('Tests', cell_style), Paragraph('Vitest (unit), Playwright (E2E), coverage >= 80%', cell_style)],
    [Paragraph('Documentation', cell_style), Paragraph('JSDoc pour APIs publiques, README par module', cell_style)],
]

code_table = Table(code_data, colWidths=[4*cm, 12*cm])
code_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('BACKGROUND', (0, 6), (-1, 6), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 7), (-1, 7), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))

story.append(Spacer(1, 12))
story.append(code_table)
story.append(Spacer(1, 6))
story.append(Paragraph('Tableau 5. Standards de code DataSphere', ParagraphStyle(
    'Caption', fontName='SimHei', fontSize=9, alignment=TA_CENTER, textColor=colors.HexColor('#666666')
)))
story.append(Spacer(1, 18))

story.append(Paragraph('<b>5.2 Processus de Code Review</b>', h2_style))

story.append(Paragraph(
    'Chaque pull request doit etre relue par au moins un autre developpeur avant d\'etre mergee. '
    'Les PRs critiques (architecture, securite) necessitent l\'approbation du Tech Lead. Le revieweur '
    'verifie la qualite du code, le respect des standards, la couverture de tests et la documentation. '
    'Les commentaires sont constructifs et portent sur le code, jamais sur la personne. Le temps '
    'maximum de review est de 24h ouvrées pour maintenir un flux de travail fluide.',
    body_style
))

story.append(Paragraph(
    'Le template de PR inclut une description de la fonctionnalite, les tests effectues, les screenshots '
    'si applicable, et les issues Jira liees. L\'auteur de la PR est responsable de repondre aux commentaires '
    'et de resoudre les conflits. Le merge se fait par squash pour maintenir un historique propre sur main. '
    'Les PRs restant ouvertes plus de 3 jours sont automatiquement flaggees pour attention. Le Tech Lead '
    'organise une revue hebdomadaire des PRs stagnantes pour identifier les blockers systemiques.',
    body_style
))

story.append(Paragraph('<b>5.3 Definition of Done</b>', h2_style))

story.append(Paragraph(
    'Une user story est consideree comme "Done" uniquement si tous les criteres suivants sont satisfaits. '
    'Cette definition stricte evite les faux finishes et garantit une qualite constante. Chaque critere '
    'est verifiable objectivement et ne laisse pas de place à l\'interpretation. Le Product Owner valide '
    'formellement le DoD avant de marquer une story comme terminee dans le backlog.',
    body_style
))

# DoD checklist
dod_items = [
    'Code implemente selon les specifications et acceptance criteria',
    'Tests unitaires ecrits et passent (coverage >= 80%)',
    'Tests d\'integration/E2E passes si applicable',
    'Code review approuvee par au moins un pair',
    'Documentation technique mise a jour (API, schemas, README)',
    'Pas de regressions identifiees sur les tests existants',
    'Linting passe sans erreurs ni warnings non justifies',
    'Performance verifiee pour les features critiques',
    'Accessibilite verifiee (WCAG 2.1 niveau AA minimum)',
    'Deploye en staging et valide par le PO'
]

story.append(Spacer(1, 12))
for item in dod_items:
    story.append(Paragraph(f'• {item}', body_no_indent))
story.append(Spacer(1, 12))

# ========== CI/CD ==========
story.append(Paragraph('<b>6. Pipeline CI/CD</b>', h1_style))

story.append(Paragraph(
    'Le pipeline CI/CD automatise les verifications de qualite et les deploiements, reduisant les erreurs '
    'humaines et accelerant le cycle de livraison. Chaque commit declenche automatiquement le pipeline, '
    'et seuls les codes passant toutes les etapes peuvent etre deployes. Cette automatisation est essentielle '
    'pour maintenir un rythme de livraison soutenu tout en garantissant la qualite.',
    body_style
))

# Pipeline stages
pipeline_data = [
    [Paragraph('<b>Etape</b>', header_style), Paragraph('<b>Declencheur</b>', header_style), Paragraph('<b>Actions</b>', header_style)],
    [Paragraph('Lint & Build', cell_style), Paragraph('Chaque push', cell_center), 
     Paragraph('ESLint, TypeScript compile, build Next.js', cell_style)],
    [Paragraph('Unit Tests', cell_style), Paragraph('Chaque push', cell_center), 
     Paragraph('Vitest, coverage report, threshold check', cell_style)],
    [Paragraph('Integration Tests', cell_style), Paragraph('PR vers develop/main', cell_center), 
     Paragraph('Tests API, database tests, contract tests', cell_style)],
    [Paragraph('E2E Tests', cell_style), Paragraph('PR vers main', cell_center), 
     Paragraph('Playwright, critical user flows, visual regression', cell_style)],
    [Paragraph('Security Scan', cell_style), Paragraph('Chaque push', cell_center), 
     Paragraph('Dependency audit, SAST, secrets detection', cell_style)],
    [Paragraph('Deploy Staging', cell_style), Paragraph('Merge vers develop', cell_center), 
     Paragraph('Build, deploy, smoke tests, notify team', cell_style)],
    [Paragraph('Deploy Production', cell_style), Paragraph('Merge vers main', cell_center), 
     Paragraph('Blue-green deploy, health checks, rollback ready', cell_style)],
]

pipeline_table = Table(pipeline_data, colWidths=[4*cm, 4*cm, 8*cm])
pipeline_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('BACKGROUND', (0, 6), (-1, 6), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 7), (-1, 7), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))

story.append(Spacer(1, 12))
story.append(pipeline_table)
story.append(Spacer(1, 6))
story.append(Paragraph('Tableau 6. Etapes du pipeline CI/CD', ParagraphStyle(
    'Caption', fontName='SimHei', fontSize=9, alignment=TA_CENTER, textColor=colors.HexColor('#666666')
)))
story.append(Spacer(1, 18))

# ========== COMMUNICATION ==========
story.append(Paragraph('<b>7. Communication et Culture</b>', h1_style))

story.append(Paragraph(
    'Une communication ouverte et transparente est fondamentale pour le succes de l\'equipe. Nous '
    'encourageons les echanges directs, la remise en question constructive et le partage des connaissances. '
    'Les erreurs sont vues comme des opportunites d\'apprentissage, pas des echecs à punir. Cette culture '
    'de securite psychologique permet à chacun de s\'exprimer librement et de contribuer à l\'amelioration continue.',
    body_style
))

story.append(Paragraph('<b>7.1 Canaux de Communication</b>', h2_style))

story.append(Paragraph(
    'Le choix du canal de communication depend de l\'urgence et de la nature du message. Les questions '
    'rapides et les discussions quotidiennes se font sur Slack. Les sujets techniques complexes meritent '
    'une call ou une reunion dediee. Les decisions importantes et les specifications sont documentees '
    'dans Notion pour reference future. Les urgences de production utilisent le channel #alerts avec '
    'mentions du robot oncall. Cette hierarchie des canaux evite la surcharge et assure que chaque '
    'message recoit l\'attention appropriee.',
    body_style
))

story.append(Paragraph('<b>7.2 Feedback et Amelioration Continue</b>', h2_style))

story.append(Paragraph(
    'Le feedback est encourage à tous les niveaux: code review, retrospectives, one-on-ones et feedback '
    'spontane. Les one-on-ones bi-hebdomadaires avec le manager permettent un suivi individuel et une '
    'resolution proactive des problemes. Les retrospectives captent les ameliorations de processus. '
    'Un feedback specifique, oriente action et livre avec bienveillance est le plus efficace. '
    'Le modèle SBI (Situation - Behavior - Impact) guide les feedbacks pour les rendre objectifs et utiles.',
    body_style
))

story.append(Paragraph('<b>7.3 Knowledge Sharing</b>', h2_style))

story.append(Paragraph(
    'Le partage de connaissances est institutionnalise à travers plusieurs mecanismes. Les sessions '
    'de "Lunch and Learn" permettent aux membres de partager leurs expertises. La documentation technique '
    'est maintenue à jour et accessible à tous. Le pairing programmation est encourage pour les taches '
    'complexes ou pour l\'onboarding. Les "Tech Talks" hebdomadaires permettent de decoder les nouveautes '
    'technologiques et les decisions d\'architecture. Ces pratiques renforcent la resilience de l\'equipe '
    'en reduisant les silos de connaissance.',
    body_style
))

# ========== ONBOARDING ==========
story.append(Paragraph('<b>8. Onboarding</b>', h1_style))

story.append(Paragraph(
    'L\'onboarding d\'un nouveau membre est un processus critique qui determine son integration et sa '
    'productivité futures. Un onboarding structure sur deux semaines permet au nouveau de monter en '
    'competence progressivement tout en construisant des relations avec l\'equipe. Le mentor assigne '
    'guide le nouveau à travers les differentes etapes et repond à ses questions.',
    body_style
))

# Onboarding table
onboarding_data = [
    [Paragraph('<b>Semaine</b>', header_style), Paragraph('<b>Objectifs</b>', header_style), Paragraph('<b>Activites</b>', header_style)],
    [Paragraph('Semaine 1', cell_center), 
     Paragraph('Environnement, outils, culture', cell_style),
     Paragraph('Setup dev, acces outils, rencontre equipe, lecture documentation, premier bug fix simple', cell_style)],
    [Paragraph('Semaine 2', cell_center), 
     Paragraph('Codebase, processus, premiere feature', cell_style),
     Paragraph('Architecture overview, pairing, premiere PR, participation ceremonies, codebase exploration', cell_style)],
]

onboarding_table = Table(onboarding_data, colWidths=[3*cm, 5*cm, 8*cm])
onboarding_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), TABLE_ROW_ODD),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 8),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 8),
]))

story.append(Spacer(1, 12))
story.append(onboarding_table)
story.append(Spacer(1, 6))
story.append(Paragraph('Tableau 7. Plan d\'onboarding pour nouveaux membres', ParagraphStyle(
    'Caption', fontName='SimHei', fontSize=9, alignment=TA_CENTER, textColor=colors.HexColor('#666666')
)))
story.append(Spacer(1, 18))

# ========== CONCLUSION ==========
story.append(Paragraph('<b>9. Metrics et Suivi</b>', h1_style))

story.append(Paragraph(
    'Le suivi de metriques permet d\'identifier les tendances et les zones d\'amelioration. Les metriques '
    'sont analysees pendant les retrospectives et partagees avec l\'equipe pour maintenir la transparence. '
    'Cependant, les metriques sont des indicateurs, pas des objectifs en soi. L\'amelioration continue '
    'prime sur l\'optimisation des chiffres.',
    body_style
))

# Metrics table
metrics_data = [
    [Paragraph('<b>Metric</b>', header_style), Paragraph('<b>Target</b>', header_style), Paragraph('<b>Fréquence</b>', header_style)],
    [Paragraph('Velocity', cell_style), Paragraph('Stable (+/- 10%)', cell_center), Paragraph('Par sprint', cell_center)],
    [Paragraph('Code Coverage', cell_style), Paragraph('>= 80%', cell_center), Paragraph('Par PR', cell_center)],
    [Paragraph('Lead Time', cell_style), Paragraph('< 5 jours', cell_center), Paragraph('Hebdomadaire', cell_center)],
    [Paragraph('Bug Escape Rate', cell_style), Paragraph('< 5%', cell_center), Paragraph('Mensuel', cell_center)],
    [Paragraph('Sprint Goal Achievement', cell_style), Paragraph('>= 85%', cell_center), Paragraph('Par sprint', cell_center)],
    [Paragraph('PR Review Time', cell_style), Paragraph('< 24h', cell_center), Paragraph('Continue', cell_center)],
]

metrics_table = Table(metrics_data, colWidths=[6*cm, 4*cm, 4*cm])
metrics_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, 1), colors.white),
    ('BACKGROUND', (0, 2), (-1, 2), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 3), (-1, 3), colors.white),
    ('BACKGROUND', (0, 4), (-1, 4), TABLE_ROW_ODD),
    ('BACKGROUND', (0, 5), (-1, 5), colors.white),
    ('BACKGROUND', (0, 6), (-1, 6), TABLE_ROW_ODD),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
    ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ('RIGHTPADDING', (0, 0), (-1, -1), 6),
    ('TOPPADDING', (0, 0), (-1, -1), 6),
    ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
]))

story.append(Spacer(1, 12))
story.append(metrics_table)
story.append(Spacer(1, 6))
story.append(Paragraph('Tableau 8. Metriques de suivi de l\'equipe', ParagraphStyle(
    'Caption', fontName='SimHei', fontSize=9, alignment=TA_CENTER, textColor=colors.HexColor('#666666')
)))
story.append(Spacer(1, 24))

story.append(Paragraph(
    'Ce guide de collaboration constitue un document vivant qui evolue avec l\'equipe et le projet. '
    'Chaque membre est encourage à proposer des ameliorations lors des retrospectives. Les mises à jour '
    'sont validees par l\'equipe et communiquees à tous. Le respect de ces principes et processus permet '
    'à l\'equipe DataSphere de livrer un produit de qualite tout en maintenant un environnement de travail '
    'agreable et productif pour tous ses membres.',
    body_style
))

# Build PDF
doc.build(story)
print(f'PDF generated: {output_path}')
