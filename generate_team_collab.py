#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DataSphere Innovation - Guide Collaboration Équipe
Résumé des outils et processus pour travailler ensemble
"""

from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak
)
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
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
cover_title = ParagraphStyle('CoverTitle', fontName='Microsoft YaHei', fontSize=28, leading=36, alignment=TA_CENTER, spaceAfter=24)
cover_subtitle = ParagraphStyle('CoverSubtitle', fontName='SimHei', fontSize=16, leading=24, alignment=TA_CENTER, spaceAfter=18)
h1_style = ParagraphStyle('H1', fontName='Microsoft YaHei', fontSize=16, leading=24, alignment=TA_LEFT, spaceBefore=16, spaceAfter=10, textColor=colors.HexColor('#1F4E79'))
h2_style = ParagraphStyle('H2', fontName='Microsoft YaHei', fontSize=13, leading=20, alignment=TA_LEFT, spaceBefore=12, spaceAfter=6, textColor=colors.HexColor('#2E75B6'))
body_style = ParagraphStyle('Body', fontName='SimHei', fontSize=10, leading=16, alignment=TA_LEFT, spaceBefore=3, spaceAfter=3, firstLineIndent=16, wordWrap='CJK')
body_no_indent = ParagraphStyle('BodyNoIndent', fontName='SimHei', fontSize=10, leading=16, alignment=TA_LEFT, spaceBefore=3, spaceAfter=3, wordWrap='CJK')
code_style = ParagraphStyle('Code', fontName='Times New Roman', fontSize=9, leading=13, alignment=TA_LEFT, leftIndent=10, backColor=colors.HexColor('#F5F5F5'))
tbl_header = ParagraphStyle('TblHeader', fontName='Microsoft YaHei', fontSize=9, leading=13, alignment=TA_CENTER, textColor=colors.white)
tbl_cell = ParagraphStyle('TblCell', fontName='SimHei', fontSize=9, leading=13, alignment=TA_CENTER, wordWrap='CJK')
tbl_cell_left = ParagraphStyle('TblCellLeft', fontName='SimHei', fontSize=9, leading=13, alignment=TA_LEFT, wordWrap='CJK')
caption_style = ParagraphStyle('Caption', fontName='SimHei', fontSize=9, leading=13, alignment=TA_CENTER, spaceBefore=4, spaceAfter=8, textColor=colors.HexColor('#666'))

# Document
output_path = '/home/z/my-project/download/DataSphere_Innovation_Guide_Equipe.pdf'
doc = SimpleDocTemplate(output_path, pagesize=A4, rightMargin=1.8*cm, leftMargin=1.8*cm, topMargin=1.8*cm, bottomMargin=1.8*cm, title='DataSphere_Innovation_Guide_Equipe', author='Z.ai', creator='Z.ai', subject='Guide de collaboration equipe')

story = []

# Cover
story.append(Spacer(1, 60))
story.append(Paragraph('<b>DataSphere Innovation</b>', cover_title))
story.append(Spacer(1, 16))
story.append(Paragraph('Guide de Collaboration Equipe', cover_subtitle))
story.append(Paragraph('Outils, Processus et Standards', cover_subtitle))
story.append(Spacer(1, 40))
story.append(Paragraph('Travailler Ensemble Efficacement', ParagraphStyle('Info', fontName='SimHei', fontSize=12, leading=18, alignment=TA_CENTER)))
story.append(Spacer(1, 60))
story.append(Paragraph('Janvier 2025', ParagraphStyle('Date', fontName='SimHei', fontSize=11, leading=16, alignment=TA_CENTER)))
story.append(PageBreak())

# Files created summary
story.append(Paragraph('<b>FICHIERS CREES POUR L\'EQUIPE</b>', h1_style))
story.append(Spacer(1, 8))

files_data = [
    [Paragraph('<b>Fichier</b>', tbl_header), Paragraph('<b>Description</b>', tbl_header), Paragraph('<b>Usage</b>', tbl_header)],
    [Paragraph('CONTRIBUTING.md', tbl_cell_left), Paragraph('Guide de contribution complet', tbl_cell_left), Paragraph('Référence équipe', tbl_cell)],
    [Paragraph('.github/ISSUE_TEMPLATE/', tbl_cell_left), Paragraph('Templates tickets GitHub', tbl_cell_left), Paragraph('Standardisation', tbl_cell)],
    [Paragraph('.github/PULL_REQUEST_TEMPLATE.md', tbl_cell_left), Paragraph('Template Pull Request', tbl_cell_left), Paragraph('Code review', tbl_cell)],
    [Paragraph('docs/TEAM_GUIDE.md', tbl_cell_left), Paragraph('Guide de l\'équipe', tbl_cell_left), Paragraph('Onboarding', tbl_cell)],
    [Paragraph('docs/SPRINT_BOARD_CONFIG.md', tbl_cell_left), Paragraph('Config sprint board', tbl_cell_left), Paragraph('Gestion projet', tbl_cell)],
    [Paragraph('scripts/setup-team.sh', tbl_cell_left), Paragraph('Script setup environnement', tbl_cell_left), Paragraph('Nouveau dev', tbl_cell)],
]

files_table = Table(files_data, colWidths=[5*cm, 5*cm, 3*cm])
files_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
]))
story.append(files_table)
story.append(Paragraph('Tableau 1: Fichiers de collaboration créés', caption_style))
story.append(Spacer(1, 16))

# Tools section
story.append(Paragraph('<b>OUTILS DE L\'EQUIPE</b>', h1_style))
story.append(Spacer(1, 8))

tools_data = [
    [Paragraph('<b>Categorie</b>', tbl_header), Paragraph('<b>Outil</b>', tbl_header), Paragraph('<b>Usage</b>', tbl_header)],
    [Paragraph('Code', tbl_cell), Paragraph('GitHub', tbl_cell), Paragraph('Repository, Issues, PRs, Projects', tbl_cell_left)],
    [Paragraph('Communication', tbl_cell), Paragraph('Slack', tbl_cell), Paragraph('#dev-datasphere, #incidents', tbl_cell_left)],
    [Paragraph('Documentation', tbl_cell), Paragraph('Notion', tbl_cell), Paragraph('Wiki, specs, decisions', tbl_cell_left)],
    [Paragraph('Design', tbl_cell), Paragraph('Figma', tbl_cell), Paragraph('Maquettes, prototypes', tbl_cell_left)],
    [Paragraph('Monitoring', tbl_cell), Paragraph('Sentry + Grafana', tbl_cell), Paragraph('Erreurs, métriques', tbl_cell_left)],
    [Paragraph('CI/CD', tbl_cell), Paragraph('GitHub Actions', tbl_cell), Paragraph('Build, test, deploy', tbl_cell_left)],
]

tools_table = Table(tools_data, colWidths=[3*cm, 4*cm, 6*cm])
tools_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#2E7D32')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
]))
story.append(tools_table)
story.append(Paragraph('Tableau 2: Stack d\'outils', caption_style))
story.append(Spacer(1, 16))

# Ceremonies
story.append(Paragraph('<b>RITUELS D\'EQUIPE</b>', h1_style))
story.append(Spacer(1, 8))

ceremonies_data = [
    [Paragraph('<b>Rituel</b>', tbl_header), Paragraph('<b>Quand</b>', tbl_header), Paragraph('<b>Duree</b>', tbl_header), Paragraph('<b>Participants</b>', tbl_header)],
    [Paragraph('Daily Standup', tbl_cell_left), Paragraph('9h30 chaque jour', tbl_cell), Paragraph('15 min', tbl_cell), Paragraph('Toute l\'équipe', tbl_cell)],
    [Paragraph('Sprint Planning', tbl_cell_left), Paragraph('Lundi S1', tbl_cell), Paragraph('1h', tbl_cell), Paragraph('Équipe + PO', tbl_cell)],
    [Paragraph('Backlog Grooming', tbl_cell_left), Paragraph('Mercredi S1', tbl_cell), Paragraph('45 min', tbl_cell), Paragraph('Équipe', tbl_cell)],
    [Paragraph('Sprint Review', tbl_cell_left), Paragraph('Vendredi S2', tbl_cell), Paragraph('1h', tbl_cell), Paragraph('Équipe + Stakeholders', tbl_cell)],
    [Paragraph('Retrospective', tbl_cell_left), Paragraph('Vendredi S2', tbl_cell), Paragraph('45 min', tbl_cell), Paragraph('Équipe', tbl_cell)],
    [Paragraph('Code Review Session', tbl_cell_left), Paragraph('Mar/Jeu', tbl_cell), Paragraph('30 min', tbl_cell), Paragraph('Devs', tbl_cell)],
]

ceremonies_table = Table(ceremonies_data, colWidths=[4*cm, 3.5*cm, 2*cm, 3.5*cm])
ceremonies_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#F57C00')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
]))
story.append(ceremonies_table)
story.append(Paragraph('Tableau 3: Rituels d\'équipe', caption_style))
story.append(PageBreak())

# Git workflow
story.append(Paragraph('<b>WORKFLOW GIT</b>', h1_style))
story.append(Spacer(1, 8))

story.append(Paragraph('<b>Branches</b>', h2_style))
branches_data = [
    [Paragraph('<b>Branche</b>', tbl_header), Paragraph('<b>Description</b>', tbl_header)],
    [Paragraph('main', tbl_cell_left), Paragraph('Production - code stable et déployé', tbl_cell_left)],
    [Paragraph('develop', tbl_cell_left), Paragraph('Staging - intégration des features', tbl_cell_left)],
    [Paragraph('feature/*', tbl_cell_left), Paragraph('Nouvelles fonctionnalités', tbl_cell_left)],
    [Paragraph('fix/*', tbl_cell_left), Paragraph('Corrections de bugs', tbl_cell_left)],
    [Paragraph('refactor/*', tbl_cell_left), Paragraph('Refactoring', tbl_cell_left)],
]

branches_table = Table(branches_data, colWidths=[4*cm, 8*cm])
branches_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#6A1B9A')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
]))
story.append(branches_table)
story.append(Paragraph('Tableau 4: Conventions de branches', caption_style))

story.append(Spacer(1, 12))
story.append(Paragraph('<b>Convention de Commits</b>', h2_style))

commits_data = [
    [Paragraph('<b>Type</b>', tbl_header), Paragraph('<b>Description</b>', tbl_header), Paragraph('<b>Exemple</b>', tbl_header)],
    [Paragraph('feat', tbl_cell), Paragraph('Nouvelle fonctionnalité', tbl_cell_left), Paragraph('feat(billing): add subscription upgrade', tbl_cell_left)],
    [Paragraph('fix', tbl_cell), Paragraph('Correction de bug', tbl_cell_left), Paragraph('fix(security): resolve token validation', tbl_cell_left)],
    [Paragraph('refactor', tbl_cell), Paragraph('Refactoring', tbl_cell_left), Paragraph('refactor(lineage): optimize graph traversal', tbl_cell_left)],
    [Paragraph('test', tbl_cell), Paragraph('Tests', tbl_cell_left), Paragraph('test(security): add encryption tests', tbl_cell_left)],
    [Paragraph('docs', tbl_cell), Paragraph('Documentation', tbl_cell_left), Paragraph('docs(api): update OpenAPI spec', tbl_cell_left)],
    [Paragraph('chore', tbl_cell), Paragraph('Maintenance', tbl_cell_left), Paragraph('chore(deps): update dependencies', tbl_cell_left)],
]

commits_table = Table(commits_data, colWidths=[2.5*cm, 4.5*cm, 5*cm])
commits_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#6A1B9A')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
]))
story.append(commits_table)
story.append(Paragraph('Tableau 5: Convention de commits', caption_style))

# Definition of Done
story.append(Spacer(1, 16))
story.append(Paragraph('<b>DEFINITION OF DONE</b>', h1_style))
story.append(Spacer(1, 8))

dod_items = [
    ('Code', 'Implémenté et fonctionnel'),
    ('Tests', 'Unitaires ≥80%, intégration si API'),
    ('Lint', 'Sans erreurs, formaté'),
    ('TypeScript', 'Sans erreurs'),
    ('Code Review', 'Approuvé par 2 reviewers'),
    ('Documentation', 'Mise à jour si nécessaire'),
    ('QA', 'Validé en staging'),
]

for item, desc in dod_items:
    story.append(Paragraph(f'• <b>{item}</b>: {desc}', body_no_indent))

story.append(Spacer(1, 16))

# Quick commands
story.append(Paragraph('<b>COMMANDES UTILES</b>', h1_style))
story.append(Spacer(1, 8))

commands_data = [
    [Paragraph('<b>Commande</b>', tbl_header), Paragraph('<b>Description</b>', tbl_header)],
    [Paragraph('bun run dev', code_style), Paragraph('Lancer le serveur de développement', tbl_cell_left)],
    [Paragraph('bun run test', code_style), Paragraph('Exécuter les tests unitaires', tbl_cell_left)],
    [Paragraph('bun run lint', code_style), Paragraph('Vérifier le lint', tbl_cell_left)],
    [Paragraph('bun run typecheck', code_style), Paragraph('Vérifier TypeScript', tbl_cell_left)],
    [Paragraph('bun run db:push', code_style), Paragraph('Synchroniser le schéma DB', tbl_cell_left)],
    [Paragraph('./scripts/setup-team.sh', code_style), Paragraph('Setup environnement nouveau dev', tbl_cell_left)],
]

commands_table = Table(commands_data, colWidths=[5*cm, 7*cm])
commands_table.setStyle(TableStyle([
    ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#1F4E79')),
    ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
    ('BACKGROUND', (0, 1), (-1, -1), colors.white),
    ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
    ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
]))
story.append(commands_table)
story.append(Paragraph('Tableau 6: Commandes principales', caption_style))

# Build
doc.build(story)
print(f"PDF generated: {output_path}")
