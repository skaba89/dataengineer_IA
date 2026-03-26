#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
DataSphere Innovation - Sprint 3 & 4 Implementation Report
"""

from reportlab.lib.pagesizes import A4
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, 
    PageBreak
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER, TA_LEFT
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.pdfbase.pdfmetrics import registerFontFamily
from datetime import datetime

# Register fonts
pdfmetrics.registerFont(TTFont('Times New Roman', '/usr/share/fonts/truetype/english/Times-New-Roman.ttf'))
pdfmetrics.registerFont(TTFont('SimHei', '/usr/share/fonts/truetype/chinese/SimHei.ttf'))
pdfmetrics.registerFont(TTFont('Microsoft YaHei', '/usr/share/fonts/truetype/chinese/msyh.ttf'))

registerFontFamily('Times New Roman', normal='Times New Roman', bold='Times New Roman')
registerFontFamily('SimHei', normal='SimHei', bold='SimHei')
registerFontFamily('Microsoft YaHei', normal='Microsoft YaHei', bold='Microsoft YaHei')

# Colors
TABLE_HEADER_COLOR = colors.HexColor('#1F4E79')
TABLE_ROW_ODD = colors.HexColor('#F5F5F5')

def create_styles():
    styles = getSampleStyleSheet()
    
    # Cover title
    styles.add(ParagraphStyle(
        name='CoverTitle',
        fontName='Microsoft YaHei',
        fontSize=32,
        leading=42,
        alignment=TA_CENTER,
        spaceAfter=24
    ))
    
    # Cover subtitle
    styles.add(ParagraphStyle(
        name='CoverSubtitle',
        fontName='SimHei',
        fontSize=18,
        leading=26,
        alignment=TA_CENTER,
        spaceAfter=36
    ))
    
    # Body text custom
    styles.add(ParagraphStyle(
        name='BodyCustom',
        fontName='SimHei',
        fontSize=11,
        leading=18,
        alignment=TA_LEFT,
        firstLineIndent=24,
        spaceAfter=12
    ))
    
    # Heading 1
    styles.add(ParagraphStyle(
        name='H1Custom',
        fontName='Microsoft YaHei',
        fontSize=18,
        leading=26,
        alignment=TA_LEFT,
        spaceBefore=24,
        spaceAfter=12,
        textColor=colors.HexColor('#1F4E79')
    ))
    
    # Heading 2
    styles.add(ParagraphStyle(
        name='H2Custom',
        fontName='Microsoft YaHei',
        fontSize=14,
        leading=20,
        alignment=TA_LEFT,
        spaceBefore=18,
        spaceAfter=8,
        textColor=colors.HexColor('#2E75B6')
    ))
    
    # Table header
    styles.add(ParagraphStyle(
        name='TblHeader',
        fontName='SimHei',
        fontSize=10,
        leading=14,
        alignment=TA_CENTER,
        textColor=colors.white
    ))
    
    # Table cell
    styles.add(ParagraphStyle(
        name='TblCell',
        fontName='SimHei',
        fontSize=10,
        leading=14,
        alignment=TA_CENTER
    ))
    
    # Table cell left
    styles.add(ParagraphStyle(
        name='TblCellLeft',
        fontName='SimHei',
        fontSize=10,
        leading=14,
        alignment=TA_LEFT
    ))
    
    return styles

def create_cover_page(story, styles):
    story.append(Spacer(1, 120))
    story.append(Paragraph('<b>DataSphere Innovation</b>', styles['CoverTitle']))
    story.append(Spacer(1, 24))
    story.append(Paragraph('Sprint 3 & 4 Implementation Report', styles['CoverSubtitle']))
    story.append(Paragraph('Infrastructure PostgreSQL & Monitoring', styles['CoverSubtitle']))
    story.append(Spacer(1, 48))
    story.append(Paragraph(f'Date: {datetime.now().strftime("%Y-%m-%d")}', styles['CoverSubtitle']))
    story.append(Paragraph('Author: Z.ai Development Team', styles['CoverSubtitle']))
    story.append(PageBreak())

def create_sprint3_section(story, styles):
    story.append(Paragraph('<b>Sprint 3: Infrastructure & PostgreSQL</b>', styles['H1Custom']))
    
    story.append(Paragraph(
        'Sprint 3 se concentre sur la migration de l\'infrastructure base de donnees de SQLite vers PostgreSQL, '
        'ainsi que sur la configuration d\'un environnement de production robuste avec connection pooling, '
        'caching Redis, et conteneurisation Docker.',
        styles['BodyCustom']
    ))
    
    # Files created table
    story.append(Paragraph('<b>Fichiers Crees</b>', styles['H2Custom']))
    
    files_data = [
        [Paragraph('<b>Fichier</b>', styles['TblHeader']), 
         Paragraph('<b>Description</b>', styles['TblHeader'])],
        [Paragraph('prisma/schema.postgresql.prisma', styles['TblCellLeft']), 
         Paragraph('Schema Prisma optimise pour PostgreSQL avec index et types JSON natifs', styles['TblCellLeft'])],
        [Paragraph('scripts/migrate-to-postgres.ts', styles['TblCellLeft']), 
         Paragraph('Script de migration SQLite vers PostgreSQL avec validation et rollback', styles['TblCellLeft'])],
        [Paragraph('docker-compose.postgres.yml', styles['TblCellLeft']), 
         Paragraph('Configuration Docker Compose complete avec PostgreSQL, PgBouncer, Redis, Prometheus, Grafana', styles['TblCellLeft'])],
        [Paragraph('init-scripts/01-init.sql', styles['TblCellLeft']), 
         Paragraph('Script d\'initialisation PostgreSQL avec extensions, roles, vues et donnees par defaut', styles['TblCellLeft'])],
        [Paragraph('.env.example.production', styles['TblCellLeft']), 
         Paragraph('Template de configuration environnement production securise', styles['TblCellLeft'])],
        [Paragraph('monitoring/prometheus.yml', styles['TblCellLeft']), 
         Paragraph('Configuration Prometheus pour le scraping des metriques', styles['TblCellLeft'])],
        [Paragraph('monitoring/datasources/*.yml', styles['TblCellLeft']), 
         Paragraph('Configuration des datasources Grafana (Prometheus, PostgreSQL, Redis)', styles['TblCellLeft'])],
    ]
    
    files_table = Table(files_data, colWidths=[6*cm, 10*cm])
    files_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    
    story.append(Spacer(1, 12))
    story.append(files_table)
    story.append(Spacer(1, 18))
    
    # Infrastructure components
    story.append(Paragraph('<b>Composants Infrastructure</b>', styles['H2Custom']))
    
    components_data = [
        [Paragraph('<b>Composant</b>', styles['TblHeader']), 
         Paragraph('<b>Version</b>', styles['TblHeader']),
         Paragraph('<b>Port</b>', styles['TblHeader']),
         Paragraph('<b>Role</b>', styles['TblHeader'])],
        [Paragraph('PostgreSQL', styles['TblCell']), 
         Paragraph('16-alpine', styles['TblCell']),
         Paragraph('5432', styles['TblCell']),
         Paragraph('Base de donnees principale', styles['TblCellLeft'])],
        [Paragraph('PgBouncer', styles['TblCell']), 
         Paragraph('latest', styles['TblCell']),
         Paragraph('6432', styles['TblCell']),
         Paragraph('Connection pooling transactionnel', styles['TblCellLeft'])],
        [Paragraph('Redis', styles['TblCell']), 
         Paragraph('7-alpine', styles['TblCell']),
         Paragraph('6379', styles['TblCell']),
         Paragraph('Cache et sessions', styles['TblCellLeft'])],
        [Paragraph('Prometheus', styles['TblCell']), 
         Paragraph('v2.48.0', styles['TblCell']),
         Paragraph('9090', styles['TblCell']),
         Paragraph('Collecte metriques', styles['TblCellLeft'])],
        [Paragraph('Grafana', styles['TblCell']), 
         Paragraph('10.2.2', styles['TblCell']),
         Paragraph('3001', styles['TblCell']),
         Paragraph('Visualisation dashboards', styles['TblCellLeft'])],
        [Paragraph('Postgres Exporter', styles['TblCell']), 
         Paragraph('latest', styles['TblCell']),
         Paragraph('9187', styles['TblCell']),
         Paragraph('Export metriques PostgreSQL', styles['TblCellLeft'])],
        [Paragraph('Backup Service', styles['TblCell']), 
         Paragraph('latest', styles['TblCell']),
         Paragraph('-', styles['TblCell']),
         Paragraph('Sauvegardes automatiques daily', styles['TblCellLeft'])],
    ]
    
    components_table = Table(components_data, colWidths=[3.5*cm, 2.5*cm, 2*cm, 8*cm])
    components_table.setStyle(TableStyle([
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
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    
    story.append(Spacer(1, 12))
    story.append(components_table)
    story.append(Spacer(1, 18))
    
    # Key features
    story.append(Paragraph('<b>Fonctionnalites Cles</b>', styles['H2Custom']))
    
    story.append(Paragraph(
        'Le schema PostgreSQL optimise inclut des index strategiques sur les colonnes frequemment interrogees '
        '(email, organizationId, status, timestamp), des types JSON natifs pour les metadonnees flexibles, '
        'et des tableaux natifs pour les tags et channels. La configuration PgBouncer assure un pooling '
        'transactionnel avec 500 connexions clientes maximum et 50 connexions base de donnees.',
        styles['BodyCustom']
    ))
    
    story.append(Paragraph(
        'Le script de migration implemente une strategie de migration par lots avec validation des connexions, '
        'transformation automatique des types JSON, gestion des erreurs detaillee, et mode dry-run pour '
        'les tests. Le systeme de backup automatique conserve 30 jours de sauvegardes journalieres, '
        '4 semaines de sauvegardes hebdomadaires et 6 mois de sauvegardes mensuelles.',
        styles['BodyCustom']
    ))

def create_sprint4_section(story, styles):
    story.append(Paragraph('<b>Sprint 4: Monitoring & Observabilite</b>', styles['H1Custom']))
    
    story.append(Paragraph(
        'Sprint 4 implemente une solution complete de monitoring et d\'observabilite avec dashboard temps reel, '
        'systeme d\'alertes multi-canal, et integration Prometheus/Grafana pour la visualisation des metriques.',
        styles['BodyCustom']
    ))
    
    # Files created table
    story.append(Paragraph('<b>Fichiers Crees</b>', styles['H2Custom']))
    
    files_data = [
        [Paragraph('<b>Fichier</b>', styles['TblHeader']), 
         Paragraph('<b>Description</b>', styles['TblHeader'])],
        [Paragraph('src/app/(dashboard)/monitoring/page.tsx', styles['TblCellLeft']), 
         Paragraph('Dashboard monitoring temps reel avec 4 onglets: Overview, Database, Alerts, Config', styles['TblCellLeft'])],
        [Paragraph('src/lib/alerting/index.ts', styles['TblCellLeft']), 
         Paragraph('Service d\'alertes complet avec multi-canal (Email, Slack, PagerDuty, SMS, Webhook)', styles['TblCellLeft'])],
    ]
    
    files_table = Table(files_data, colWidths=[6*cm, 10*cm])
    files_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, -1), colors.white),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    
    story.append(Spacer(1, 12))
    story.append(files_table)
    story.append(Spacer(1, 18))
    
    # Dashboard features
    story.append(Paragraph('<b>Dashboard Monitoring</b>', styles['H2Custom']))
    
    story.append(Paragraph(
        'Le dashboard de monitoring offre une interface utilisateur moderne avec visualisation temps reel '
        'des metriques systeme (CPU, Memoire, Disque, Reseau), base de donnees (connexions, queries, cache hit ratio), '
        'et alertes actives. Il inclut un systeme de rafraichissement automatique toutes les 30 secondes '
        'avec indicateur de dernier mise a jour.',
        styles['BodyCustom']
    ))
    
    # Dashboard tabs table
    tabs_data = [
        [Paragraph('<b>Onglet</b>', styles['TblHeader']), 
         Paragraph('<b>Fonctionnalites</b>', styles['TblHeader'])],
        [Paragraph('Overview', styles['TblCell']), 
         Paragraph('Stats rapides (sante systeme, alertes actives, connexions DB), metriques systeme avec tendances, alertes recentes', styles['TblCellLeft'])],
        [Paragraph('Database', styles['TblCell']), 
         Paragraph('Statut connection pool, statistiques queries (total, slow, avg response), top tables par taille', styles['TblCellLeft'])],
        [Paragraph('Alerts', styles['TblCell']), 
         Paragraph('Resume par severite, liste complete avec filtres, resolution manuelle des alertes', styles['TblCellLeft'])],
        [Paragraph('Configuration', styles['TblCell']), 
         Paragraph('Gestion des regles d\'alerte avec toggles, configuration des canaux de notification', styles['TblCellLeft'])],
    ]
    
    tabs_table = Table(tabs_data, colWidths=[3*cm, 13*cm])
    tabs_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, 1), colors.white),
        ('BACKGROUND', (0, 2), (-1, 2), TABLE_ROW_ODD),
        ('BACKGROUND', (0, 3), (-1, 3), colors.white),
        ('BACKGROUND', (0, 4), (-1, 4), TABLE_ROW_ODD),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    
    story.append(Spacer(1, 12))
    story.append(tabs_table)
    story.append(Spacer(1, 18))
    
    # Alerting system
    story.append(Paragraph('<b>Systeme d\'Alertes</b>', styles['H2Custom']))
    
    story.append(Paragraph(
        'Le systeme d\'alertes implemente une architecture modulaire avec deduplication automatique, '
        'resolution intelligente, et support multi-canal. Chaque canal de notification est implemente '
        'comme un handler independant (Email, Slack, PagerDuty, SMS, Webhook), permettant une extension facile.',
        styles['BodyCustom']
    ))
    
    # Alert rules table
    rules_data = [
        [Paragraph('<b>Regle</b>', styles['TblHeader']), 
         Paragraph('<b>Metrique</b>', styles['TblHeader']),
         Paragraph('<b>Seuil</b>', styles['TblHeader']),
         Paragraph('<b>Severite</b>', styles['TblHeader']),
         Paragraph('<b>Canaux</b>', styles['TblHeader'])],
        [Paragraph('High CPU Usage', styles['TblCellLeft']), 
         Paragraph('cpu_usage', styles['TblCell']),
         Paragraph('> 80%', styles['TblCell']),
         Paragraph('Warning', styles['TblCell']),
         Paragraph('Email, Slack', styles['TblCell'])],
        [Paragraph('Critical CPU Usage', styles['TblCellLeft']), 
         Paragraph('cpu_usage', styles['TblCell']),
         Paragraph('> 95%', styles['TblCell']),
         Paragraph('Critical', styles['TblCell']),
         Paragraph('Email, Slack, PagerDuty', styles['TblCell'])],
        [Paragraph('High Memory Usage', styles['TblCellLeft']), 
         Paragraph('memory_usage', styles['TblCell']),
         Paragraph('> 85%', styles['TblCell']),
         Paragraph('Warning', styles['TblCell']),
         Paragraph('Email, Slack', styles['TblCell'])],
        [Paragraph('DB Connection Pool Low', styles['TblCellLeft']), 
         Paragraph('db_available_connections', styles['TblCell']),
         Paragraph('< 10', styles['TblCell']),
         Paragraph('Critical', styles['TblCell']),
         Paragraph('Email, PagerDuty', styles['TblCell'])],
        [Paragraph('Slow Query Count', styles['TblCellLeft']), 
         Paragraph('slow_queries_count', styles['TblCell']),
         Paragraph('> 10', styles['TblCell']),
         Paragraph('Warning', styles['TblCell']),
         Paragraph('Slack', styles['TblCell'])],
        [Paragraph('High Error Rate', styles['TblCellLeft']), 
         Paragraph('error_rate', styles['TblCell']),
         Paragraph('> 5%', styles['TblCell']),
         Paragraph('Critical', styles['TblCell']),
         Paragraph('Email, Slack, PagerDuty', styles['TblCell'])],
        [Paragraph('Slow Response Time', styles['TblCellLeft']), 
         Paragraph('avg_response_time', styles['TblCell']),
         Paragraph('> 1000ms', styles['TblCell']),
         Paragraph('Warning', styles['TblCell']),
         Paragraph('Slack', styles['TblCell'])],
    ]
    
    rules_table = Table(rules_data, colWidths=[4*cm, 3.5*cm, 2*cm, 2.5*cm, 4*cm])
    rules_table.setStyle(TableStyle([
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
        ('TOPPADDING', (0, 0), (-1, -1), 5),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 5),
    ]))
    
    story.append(Spacer(1, 12))
    story.append(rules_table)
    story.append(Spacer(1, 18))

def create_summary_section(story, styles):
    story.append(Paragraph('<b>Resume et Prochaines Etapes</b>', styles['H1Custom']))
    
    story.append(Paragraph(
        'Les Sprint 3 et Sprint 4 etablissent une infrastructure production-ready pour DataSphere Innovation. '
        'La migration vers PostgreSQL avec connection pooling et caching Redis assure des performances optimales '
        'pour des charges de travail elevees. Le systeme de monitoring et d\'alertes fournit une observabilite '
        'complete pour detecter et resoudre rapidement les incidents.',
        styles['BodyCustom']
    ))
    
    # Next steps table
    story.append(Paragraph('<b>Prochains Sprints</b>', styles['H2Custom']))
    
    next_data = [
        [Paragraph('<b>Sprint</b>', styles['TblHeader']), 
         Paragraph('<b>Objectif</b>', styles['TblHeader']),
         Paragraph('<b>Livrables</b>', styles['TblHeader'])],
        [Paragraph('Sprint 5', styles['TblCell']), 
         Paragraph('Security Hardening', styles['TblCellLeft']),
         Paragraph('WAF, Rate Limiting avance, Audit logs enrichis, Penetration testing', styles['TblCellLeft'])],
        [Paragraph('Sprint 6', styles['TblCell']), 
         Paragraph('Performance Optimization', styles['TblCellLeft']),
         Paragraph('Query optimization, Caching strategies, CDN setup, Load balancing', styles['TblCellLeft'])],
        [Paragraph('Sprint 7', styles['TblCell']), 
         Paragraph('Enterprise Features', styles['TblCellLeft']),
         Paragraph('SSO advanced, Custom branding, White-label, Advanced analytics', styles['TblCellLeft'])],
        [Paragraph('Sprint 8', styles['TblCell']), 
         Paragraph('Production Deployment', styles['TblCellLeft']),
         Paragraph('Kubernetes setup, Auto-scaling, Disaster recovery, Runbooks', styles['TblCellLeft'])],
    ]
    
    next_table = Table(next_data, colWidths=[2.5*cm, 4*cm, 9.5*cm])
    next_table.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), TABLE_HEADER_COLOR),
        ('TEXTCOLOR', (0, 0), (-1, 0), colors.white),
        ('BACKGROUND', (0, 1), (-1, 1), colors.white),
        ('BACKGROUND', (0, 2), (-1, 2), TABLE_ROW_ODD),
        ('BACKGROUND', (0, 3), (-1, 3), colors.white),
        ('BACKGROUND', (0, 4), (-1, 4), TABLE_ROW_ODD),
        ('GRID', (0, 0), (-1, -1), 0.5, colors.grey),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('LEFTPADDING', (0, 0), (-1, -1), 8),
        ('RIGHTPADDING', (0, 0), (-1, -1), 8),
        ('TOPPADDING', (0, 0), (-1, -1), 6),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 6),
    ]))
    
    story.append(Spacer(1, 12))
    story.append(next_table)

def main():
    output_path = '/home/z/my-project/download/DataSphere_Sprint3_4_Report.pdf'
    
    doc = SimpleDocTemplate(
        output_path,
        pagesize=A4,
        leftMargin=2*cm,
        rightMargin=2*cm,
        topMargin=2*cm,
        bottomMargin=2*cm,
        title='DataSphere_Sprint3_4_Report',
        author='Z.ai',
        creator='Z.ai',
        subject='Sprint 3 & 4 Implementation Report - Infrastructure PostgreSQL & Monitoring'
    )
    
    styles = create_styles()
    story = []
    
    # Build document
    create_cover_page(story, styles)
    create_sprint3_section(story, styles)
    story.append(PageBreak())
    create_sprint4_section(story, styles)
    story.append(PageBreak())
    create_summary_section(story, styles)
    
    doc.build(story)
    print(f"PDF generated: {output_path}")

if __name__ == '__main__':
    main()
