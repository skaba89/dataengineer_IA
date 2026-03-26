const { 
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel, BorderStyle, 
  WidthType, ShadingType, VerticalAlign, PageNumber, PageBreak, TableOfContents
} = require('docx');
const fs = require('fs');

// Color scheme - Midnight Code
const colors = {
  primary: "020617",
  body: "1E293B",
  secondary: "64748B",
  accent: "94A3B8",
  tableBg: "F8FAFC",
  white: "FFFFFF"
};

const tableBorder = { style: BorderStyle.SINGLE, size: 12, color: colors.primary };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: { style: BorderStyle.NONE }, right: { style: BorderStyle.NONE } };

// Helper functions
const createTitle = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_1,
  spacing: { before: 400, after: 200 },
  children: [new TextRun({ text, bold: true, size: 36, font: "Times New Roman", color: colors.primary })]
});

const createSubtitle = (text) => new Paragraph({
  heading: HeadingLevel.HEADING_2,
  spacing: { before: 300, after: 150 },
  children: [new TextRun({ text, bold: true, size: 28, font: "Times New Roman", color: colors.body })]
});

const createBody = (text) => new Paragraph({
  spacing: { after: 150, line: 250 },
  alignment: AlignmentType.JUSTIFIED,
  children: [new TextRun({ text, size: 22, font: "Times New Roman", color: colors.body })]
});

const createBullet = (text, reference) => new Paragraph({
  numbering: { reference, level: 0 },
  spacing: { after: 80, line: 250 },
  children: [new TextRun({ text, size: 22, font: "Times New Roman", color: colors.body })]
});

// Create document
const doc = new Document({
  styles: {
    default: { document: { run: { font: "Times New Roman", size: 22 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, color: colors.primary, font: "Times New Roman" },
        paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, color: colors.body, font: "Times New Roman" },
        paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 1 } }
    ]
  },
  numbering: {
    config: [
      { reference: "bullet-main", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullet-1", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullet-2", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullet-3", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullet-4", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullet-5", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullet-6", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullet-7", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullet-8", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-1", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-2", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }
    ]
  },
  sections: [
    // Cover Page
    {
      properties: { page: { margin: { top: 0, right: 0, bottom: 0, left: 0 } } },
      children: [
        new Paragraph({ spacing: { before: 4000 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "DATASPHERE INNOVATION", bold: true, size: 56, font: "Times New Roman", color: colors.primary })]
        }),
        new Paragraph({ spacing: { before: 200 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Proposition de Fonctionnalit\u00e9s", size: 40, font: "Times New Roman", color: colors.secondary })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100 },
          children: [new TextRun({ text: "Phase 2 - Innovation & Diff\u00e9renciation", size: 28, font: "Times New Roman", color: colors.accent })]
        }),
        new Paragraph({ spacing: { before: 3000 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Plateforme Data Engineering Multi-Agent", size: 24, font: "Times New Roman", color: colors.body })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100 },
          children: [new TextRun({ text: "Document de R\u00e9f\u00e9rence Strat\u00e9gique", size: 22, font: "Times New Roman", color: colors.secondary })]
        }),
        new Paragraph({ spacing: { before: 2000 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Version 2.0 - Janvier 2025", size: 20, font: "Times New Roman", color: colors.accent })]
        })
      ]
    },
    // Main Content
    {
      properties: { page: { margin: { top: 1800, right: 1440, bottom: 1440, left: 1440 } } },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "DataSphere Innovation - Propositions Phase 2", size: 18, font: "Times New Roman", color: colors.secondary })]
          })]
        })
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Page ", size: 18, font: "Times New Roman", color: colors.secondary }),
              new TextRun({ children: [PageNumber.CURRENT], size: 18, font: "Times New Roman", color: colors.secondary }),
              new TextRun({ text: " / ", size: 18, font: "Times New Roman", color: colors.secondary }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, font: "Times New Roman", color: colors.secondary })
            ]
          })]
        })
      },
      children: [
        // Table of Contents
        new TableOfContents("Table des Mati\u00e8res", { hyperlink: true, headingStyleRange: "1-2" }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { after: 300 },
          children: [new TextRun({ text: "Note: Clic droit sur la table \u2192 \u00ab Mettre \u00e0 jour le champ \u00bb pour actualiser les num\u00e9ros de page", size: 18, font: "Times New Roman", color: "999999", italics: true })]
        }),
        
        new Paragraph({ children: [new PageBreak()] }),
        
        // Executive Summary
        createTitle("1. R\u00e9sum\u00e9 Ex\u00e9cutif"),
        createBody("DataSphere Innovation a atteint une maturit\u00e9 commerciale significative avec le d\u00e9ploiement de la Phase 1, incluant le syst\u00e8me de billing Stripe, l'authentification SSO Enterprise, plus de 35 connecteurs multi-secteurs, et une API publique compl\u00e8te. La plateforme dispose d\u00e9sormais d'une infrastructure solide permettant d'envisager des fonctionnalit\u00e9s avanc\u00e9es pour se diff\u00e9rencier sur le march\u00e9 concurrentiel du Data Engineering as a Service."),
        createBody("Ce document pr\u00e9sente huit propositions de fonctionnalit\u00e9s strat\u00e9giques pour la Phase 2, con\u00e7ues pour renforcer la proposition de valeur unique de DataSphere Innovation : \u00ab La seule plateforme qui g\u00e9n\u00e8re une stack data compl\u00e8te en 1 clic, avec architecture, pipelines, transformations et dashboards pr\u00eats \u00e0 d\u00e9ployer \u00bb. Ces fonctionnalit\u00e9s visent \u00e0 am\u00e9liorer la productivit\u00e9 des utilisateurs, renforcer la s\u00e9curit\u00e9 enterprise, et cr\u00e9er de nouvelles sources de revenus."),
        
        new Paragraph({ spacing: { before: 200, after: 200 } }),
        new Table({
          columnWidths: [4680, 4680],
          margins: { top: 100, bottom: 100, left: 180, right: 180 },
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({
                  borders: cellBorders,
                  shading: { fill: colors.tableBg, type: ShadingType.CLEAR },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Indicateur", bold: true, size: 22, font: "Times New Roman" })] })]
                }),
                new TableCell({
                  borders: cellBorders,
                  shading: { fill: colors.tableBg, type: ShadingType.CLEAR },
                  verticalAlign: VerticalAlign.CENTER,
                  children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Objectif Phase 2", bold: true, size: 22, font: "Times New Roman" })] })]
                })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Temps de mise en production", size: 22, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "-75% (2 semaines vs 2 mois)", size: 22, font: "Times New Roman" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Score qualit\u00e9 moyen", size: 22, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "95%+ (vs 72% baseline)", size: 22, font: "Times New Roman" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Taux de r\u00e9tention clients", size: 22, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "95%+ (vs 85% actuel)", size: 22, font: "Times New Roman" })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "ARPU (Revenue moyen)", size: 22, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "+40% via upselling", size: 22, font: "Times New Roman" })] })] })
              ]
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100 },
          children: [new TextRun({ text: "Tableau 1: Objectifs cl\u00e9s de la Phase 2", size: 18, font: "Times New Roman", color: colors.secondary, italics: true })]
        }),
        
        // Feature 1: Data Lineage
        createTitle("2. Data Lineage & Impact Analysis"),
        createBody("Le Data Lineage repr\u00e9sente une fonctionnalit\u00e9 critique pour les entreprises devant tracer le parcours de leurs donn\u00e9es de la source jusqu'aux rapports finaux. Cette capacit\u00e9 devient indispensable dans un contexte r\u00e9glementaire de plus en plus exigeant (RGPD, SOX, B\u00e2le III) o\u00f9 les organisations doivent prouver l'origine et la transformation de chaque indicateur."),
        
        createSubtitle("2.1 Fonctionnalit\u00e9s Principales"),
        createBullet("Visualisation graphique interactive du parcours des donn\u00e9es avec navigation par glisser-d\u00e9poser permettant d'explorer chaque \u00e9tape de transformation", "bullet-1"),
        createBullet("Analyse d'impact automatis\u00e9e avant modification d'un champ source : identification de tous les pipelines, mod\u00e8les et dashboards affect\u00e9s", "bullet-1"),
        createBullet("Tra\u00e7abilit\u00e9 compl\u00e8te colonne par colonne avec historique des transformations appliqu\u00e9es et m\u00e9tadonn\u00e9es associ\u00e9es", "bullet-1"),
        createBullet("Support natif dbt pour extraction automatique du lineage \u00e0 partir des fichiers YAML et SQL du projet", "bullet-1"),
        createBullet("Export des diagrammes de lineage aux formats PNG, SVG et PDF pour documentation et pr\u00e9sentations aux parties prenantes", "bullet-1"),
        
        createSubtitle("2.2 Valeur Commerciale"),
        createBody("Cette fonctionnalit\u00e9 justifie \u00e0 elle seule l'upgrade vers le plan Enterprise pour les entreprises soumises \u00e0 des r\u00e9glementations strictes. Elle permet de r\u00e9duire les risques de non-conformit\u00e9, d'acc\u00e9l\u00e9rer les audits, et d'\u00e9viter les erreurs co\u00fbteuses lors des modifications de structure de donn\u00e9es. L'estimation montre un gain de productivit\u00e9 de 60% sur les analyses d'impact manuelles."),
        
        createSubtitle("2.3 Estimation de D\u00e9veloppement"),
        new Paragraph({ spacing: { before: 150, after: 150 } }),
        new Table({
          columnWidths: [4680, 4680],
          margins: { top: 100, bottom: 100, left: 180, right: 180 },
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Composant", bold: true, size: 22, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Effort (semaines)", bold: true, size: 22, font: "Times New Roman" })] })] })
              ]
            }),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Moteur de parsing dbt", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "3 semaines", size: 22, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Interface de visualisation", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "4 semaines", size: 22, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Analyse d'impact", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "2 semaines", size: 22, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ children: [new TextRun({ text: "Total", bold: true, size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "9 semaines", bold: true, size: 22, font: "Times New Roman" })] })] })
            ]})
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100 },
          children: [new TextRun({ text: "Tableau 2: Estimation Data Lineage", size: 18, font: "Times New Roman", color: colors.secondary, italics: true })]
        }),
        
        // Feature 2: AI Data Catalog
        createTitle("3. AI-Powered Data Catalog"),
        createBody("Le catalogue de donn\u00e9es enrichi par intelligence artificielle transforme la d\u00e9couverte et la compr\u00e9hension des donn\u00e9es. Au lieu de naviguer manuellement dans des milliers de tables, les utilisateurs peuvent poser des questions en langage naturel et recevoir des suggestions pertinentes, accompagn\u00e9es de descriptions automatiques et de contextes m\u00e9tier."),
        
        createSubtitle("3.1 Fonctionnalit\u00e9s Principales"),
        createBullet("D\u00e9couverte en langage naturel : recherche par questions (ex: \u00ab Quelles tables contiennent les revenus clients ? \u00bb) avec r\u00e9sultats contextuels et pertinents", "bullet-2"),
        createBullet("Auto-documentation intelligente g\u00e9n\u00e9r\u00e9e par IA qui analyse les donn\u00e9es \u00e9chantillons et les patterns d'utilisation pour cr\u00e9er des descriptions pr\u00e9cises", "bullet-2"),
        createBullet("Classification automatique des donn\u00e9es sensibles (PII, financiers, m\u00e9dicaux) avec suggestions de masquage et de politiques d'acc\u00e8s appropri\u00e9es", "bullet-2"),
        createBullet("D\u00e9tection et suggestion de jointures intelligentes bas\u00e9es sur l'analyse des cl\u00e9s \u00e9trang\u00e8res et des patterns de donn\u00e9es", "bullet-2"),
        createBullet("Glossaire m\u00e9tier collaboratif avec d\u00e9finitions, propri\u00e9taires, et mapping automatique vers les colonnes correspondantes", "bullet-2"),
        createBullet("Score de popularit\u00e9 et de qualit\u00e9 pour chaque table, aidant les utilisateurs \u00e0 identifier les sources les plus fiables", "bullet-2"),
        
        createSubtitle("3.2 Architecture Technique"),
        createBody("Le catalogue s'appuie sur un pipeline d'enrichissement qui scanne r\u00e9guli\u00e8rement les sources connect\u00e9es. Un moteur NLP analyse les sch\u00e9mas, les donn\u00e9es \u00e9chantillons et les requ\u00eates historiques pour g\u00e9n\u00e9rer des m\u00e9tadonn\u00e9es enrichies. L'index vectoriel permet des recherches s\u00e9mantiques rapides m\u00eame sur des catalogues de plusieurs milliers de tables."),
        
        createSubtitle("3.3 Impact Business"),
        createBody("Les \u00e9tudes montrent que les data scientists passent 80% de leur temps \u00e0 rechercher et pr\u00e9parer les donn\u00e9es. Le catalogue IA r\u00e9duit ce temps \u00e0 20%, lib\u00e9rant du temps pour l'analyse \u00e0 valeur ajout\u00e9e. Cette fonctionnalit\u00e9 est particuli\u00e8rement appr\u00e9ci\u00e9e des \u00e9quipes data dispersed et des nouveaux arrivants n\u00e9cessitant une mont\u00e9e en comp\u00e9tences rapide sur l'environnement de donn\u00e9es."),
        
        // Feature 3: Real-time Streaming
        createTitle("4. Real-time Data Streaming"),
        createBody("Le support natif du streaming temps r\u00e9el permet de capturer, transformer et livrer des donn\u00e9es en mouvement. Cette capacit\u00e9 devient essentielle pour les cas d'usage modernes : d\u00e9tection de fraude en temps r\u00e9el, personnalisation e-commerce instantan\u00e9e, monitoring IoT, et alertes m\u00e9tier critiques."),
        
        createSubtitle("4.1 Sources et Destinations Support\u00e9es"),
        createBullet("Kafka et Confluent Cloud pour l'ingestion de flux haute performance avec support des partitions et consommateur groups", "bullet-3"),
        createBullet("Amazon Kinesis et Azure Event Hubs pour l'int\u00e9gration native cloud avec r\u00e9tention configurable", "bullet-3"),
        createBullet("Google Pub/Sub et Pulsar pour les architectures multi-cloud et hybrides", "bullet-3"),
        createBullet("Webhooks entrants pour capturer des \u00e9v\u00e9nements d'applications tierces sans infrastructure de streaming", "bullet-3"),
        createBullet("CDC (Change Data Capture) depuis PostgreSQL, MySQL, MongoDB pour r\u00e9pliquer les modifications en temps r\u00e9el", "bullet-3"),
        
        createSubtitle("4.2 Capacit\u00e9s de Traitement"),
        createBody("Le moteur de traitement supporte les fen\u00eAtres temporelles (tumbling, sliding, session), les jointures stream-to-stream et stream-to-table, les agr\u00e9gations continues, et les d\u00e9tections de patterns complexes (CEP). Les transformations sont d\u00e9finies visuellement dans le builder et d\u00e9ploy\u00e9es automatiquement vers l'environnement cible."),
        
        createSubtitle("4.3 Cas d'Usage Types"),
        new Paragraph({ spacing: { before: 150, after: 150 } }),
        new Table({
          columnWidths: [3120, 3120, 3120],
          margins: { top: 100, bottom: 100, left: 180, right: 180 },
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Secteur", bold: true, size: 22, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Cas d'usage", bold: true, size: 22, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "ROI estim\u00e9", bold: true, size: 22, font: "Times New Roman" })] })] })
              ]
            }),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Finance", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "D\u00e9tection fraude", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "5M\u20ac/an sauv\u00e9s", size: 22, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "E-commerce", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Personnalisation live", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "+15% conversion", size: 22, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Industrie", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Maintenance pr\u00e9dictive", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "-30% arr\u00eAts", size: 22, font: "Times New Roman" })] })] })
            ]})
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100 },
          children: [new TextRun({ text: "Tableau 3: Cas d'usage streaming par secteur", size: 18, font: "Times New Roman", color: colors.secondary, italics: true })]
        }),
        
        // Feature 4: Data Mesh
        createTitle("5. Data Mesh Architecture Support"),
        createBody("Le Data Mesh repr\u00e9sente un changement de paradigme dans l'organisation des donn\u00e9es d'entreprise. Plut\u00f4t qu'une architecture centralis\u00e9e, le mesh promeut des domaines de donn\u00e9es autonomes, chacun responsable de ses propres produits de donn\u00e9es. DataSphere Innovation devient l'environnement de gouvernance et de f\u00e9d\u00e9ration de ce mesh."),
        
        createSubtitle("5.1 Fonctionnalit\u00e9s Cl\u00e9s"),
        createBullet("Domaines de donn\u00e9es autonomes avec isolation compl\u00e8te des ressources, des permissions et des pipelines par \u00e9quipe m\u00e9tier", "bullet-4"),
        createBullet("Contrats de donn\u00e9es formalis\u00e9s entre domaines avec versioning, SLA, et validation automatique de la conformit\u00e9", "bullet-4"),
        createBullet("Registry central des produits de donn\u00e9es exposant la disponibilit\u00e9, la qualit\u00e9 et les modalit\u00e9s d'acc\u00e8s de chaque dataset", "bullet-4"),
        createBullet("Self-service marketplace permettant aux consommateurs de d\u00e9couvrir et demander l'acc\u00e8s aux produits de donn\u00e9es", "bullet-4"),
        createBullet("Gouvernance f\u00e9d\u00e9r\u00e9e avec politiques centralis\u00e9es mais application distribu\u00e9e au niveau des domaines", "bullet-4"),
        createBullet("M\u00e9triques crois\u00e9es domaines pour mesurer la valeur et l'utilisation des produits de donn\u00e9es", "bullet-4"),
        
        createSubtitle("5.2 B\u00e9n\u00e9fices Organisationnels"),
        createBody("L'architecture Data Mesh permet de scaler le programme data avec l'organisation. Chaque domaine peut it\u00e9rer \u00e0 son rythme sans cr\u00e9er de goulot d'\u00e9tranglement au niveau de l'\u00e9quipe data centrale. Les contrats formalis\u00e9s r\u00e9duisent les ruptures de pipeline et am\u00e9liorent la fiabilit\u00e9 globale des flux de donn\u00e9es inter-\u00e9quipes."),
        
        // Feature 5: Collaborative Workspace
        createTitle("6. Espace Collaboratif pour \u00c9quipes Data"),
        createBody("Le workspace collaboratif transforme DataSphere Innovation d'un outil individuel en une plateforme d'\u00e9quipe. Les fonctionnalit\u00e9s collaboratives permettent \u00e0 plusieurs utilisateurs de travailler simultan\u00e9ment sur un projet, avec tra\u00e7abilit\u00e9 compl\u00e8te des contributions et communication int\u00e9gr\u00e9e."),
        
        createSubtitle("6.1 Fonctionnalit\u00e9s de Collaboration"),
        createBullet("\u00c9dition collaborative en temps r\u00e9el des pipelines avec curseurs multiples et indication des utilisateurs actifs", "bullet-5"),
        createBullet("Syst\u00e8me de commentaires et annotations sur chaque \u00e9l\u00e9ment du projet (tables, transformations, dashboards)", "bullet-5"),
        createBullet("Workflows de revue et approbation avec notifications et tableau de bord des demandes en attente", "bullet-5"),
        createBullet("Historique complet des modifications avec possibilit\u00e9 de restaurer n'importe quelle version ant\u00e9rieure", "bullet-5"),
        createBullet("Branches et environnements isol\u00e9s pour le d\u00e9veloppement et les tests avant merger en production", "bullet-5"),
        createBullet("Int\u00e9gration Slack et Teams pour notifications et alertes en temps r\u00e9el vers les canaux d'\u00e9quipe", "bullet-5"),
        
        createSubtitle("6.2 Gestion des Droits"),
        createBody("Le syst\u00e8me de permissions granulaires permet de d\u00e9finir des r\u00f4les personnalis\u00e9s par projet : Owner (tous les droits), Editor (modification sans suppression), Viewer (lecture seule), et Custom (s\u00e9lection fine des permissions). Les h\u00e9ritages de permissions simplifient l'administration des grandes organisations."),
        
        // Feature 6: Security & Compliance
        createTitle("7. Security & Compliance Center"),
        createBody("Le centre de s\u00e9curit\u00e9 et conformit\u00e9 r\u00e9unit toutes les fonctionnalit\u00e9s de protection des donn\u00e9es et de preuve de conformit\u00e9. Cette centralisation est essentielle pour les entreprises op\u00e9rant dans des secteurs r\u00e9glement\u00e9s n\u00e9cessitant des audits r\u00e9guliers et des preuves de contr\u00f4le."),
        
        createSubtitle("7.1 Fonctionnalit\u00e9s de S\u00e9curit\u00e9"),
        createBullet("Masquage dynamique des donn\u00e9es sensibles bas\u00e9 sur le r\u00f4le et le contexte de l'utilisateur connect\u00e9", "bullet-6"),
        createBullet("Chiffrement de bout en bout avec gestion des cl\u00e9s int\u00e9gr\u00e9e ou BYOK (Bring Your Own Key) pour les entreprises exigentes", "bullet-6"),
        createBullet("Audit logs complets avec recherche, filtres avanc\u00e9s et export pour analyses forensiques et r\u00e9ponses aux incidents", "bullet-6"),
        createBullet("Scanner de vuln\u00e9rabilit\u00e9s automatique sur les configurations et alertes en cas de risque d\u00e9tect\u00e9", "bullet-6"),
        createBullet("Gestion des secrets int\u00e9gr\u00e9e avec rotation automatique et int\u00e9gration HashiCorp Vault et AWS Secrets Manager", "bullet-6"),
        
        createSubtitle("7.2 Compliance Frameworks"),
        new Paragraph({ spacing: { before: 150, after: 150 } }),
        new Table({
          columnWidths: [4680, 4680],
          margins: { top: 100, bottom: 100, left: 180, right: 180 },
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Framework", bold: true, size: 22, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Support", bold: true, size: 22, font: "Times New Roman" })] })] })
              ]
            }),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "SOC 2 Type II", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Rapports automatis\u00e9s, contr\u00f4les continus", size: 22, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "RGPD / CCPA", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Mapping PII, droit \u00e0 l'effacement, consentement", size: 22, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "HIPAA", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "PHI tracking, BAA, access logging", size: 22, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "PCI-DSS", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Card data isolation, encryption, monitoring", size: 22, font: "Times New Roman" })] })] })
            ]})
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100 },
          children: [new TextRun({ text: "Tableau 4: Frameworks de conformit\u00e9 support\u00e9s", size: 18, font: "Times New Roman", color: colors.secondary, italics: true })]
        }),
        
        // Feature 7: Integration Hub
        createTitle("8. Integration Hub & iPaaS"),
        createBody("L'Integration Hub transforme DataSphere Innovation en plateforme d'int\u00e9gration compl\u00e8te, permettant de connecter n'importe quelle application via des connecteurs pr\u00e9construits ou des webhooks personnalis\u00e9s. Cette capacit\u00e9 \u00e9tend la valeur de la plateforme au-del\u00e0 du pure data engineering."),
        
        createSubtitle("8.1 Connecteurs Pr\u00e9construits"),
        createBullet("Plus de 200 connecteurs pr\u00e9construits couvrant CRM, ERP, Marketing, Finance, HR, et applications m\u00e9tier verticales", "bullet-7"),
        createBullet("Connecteurs bidirectionnels permettant la lecture ET l'\u00e9criture vers les syst\u00e8mes sources", "bullet-7"),
        createBullet("Authentification OAuth2 g\u00e9r\u00e9e avec refresh tokens automatiques et rotation s\u00e9curis\u00e9e", "bullet-7"),
        createBullet("Synchronisation incr\u00e9mentale avec d\u00e9tection automatique des modifications pour optimiser les volumes transf\u00e9r\u00e9s", "bullet-7"),
        createBullet("Rate limiting intelligent respectant les quotas de chaque API tierce avec files d'attente et r\u00e9essais", "bullet-7"),
        
        createSubtitle("8.2 Fonctionnalit\u00e9s iPaaS"),
        createBody("Le module iPaaS permet de cr\u00e9er des workflows d'int\u00e9gration complexes avec branchements conditionnels, boucles, gestion d'erreurs, et transformations en vol. Les workflows peuvent \u00eAtre d\u00e9clench\u00e9s par \u00e9v\u00e9nements, planification, ou appel API. Le monitoring temps r\u00e9el permet de suivre chaque ex\u00e9cution et d'intervenir rapidement en cas d'anomalie."),
        
        // Feature 8: Customer Success
        createTitle("9. Customer Success Platform"),
        createBody("La plateforme Customer Success int\u00e8gre les outils n\u00e9cessaires pour maximiser la valeur client et r\u00e9duire le churn. En analysant les patterns d'utilisation et les comportements, le syst\u00e8me peut identifier les clients \u00e0 risque et proposer des interventions proactives."),
        
        createSubtitle("9.1 Fonctionnalit\u00e9s"),
        createBullet("Health Score automatis\u00e9 calcul\u00e9 \u00e0 partir de l'utilisation, de la qualit\u00e9 des donn\u00e9es, et des tickets support", "bullet-8"),
        createBullet("Alertes pr\u00e9dictives de churn avec suggestions d'actions : formation, check-in, upgrade de features", "bullet-8"),
        createBullet("Onboarding personnalis\u00e9 avec parcours guid\u00e9s adapt\u00e9s au secteur et aux objectifs du client", "bullet-8"),
        createBullet("Playbooks de succ\u00e8s avec templates de communication et s\u00e9quences d'engagement automatis\u00e9es", "bullet-8"),
        createBullet("Analytics d'adoption par feature pour identifier les fonctionnalit\u00e9s sous-utilis\u00e9es et cibler la formation", "bullet-8"),
        createBullet("NPS et surveys int\u00e9gr\u00e9s avec suivi des tendances et alertes sur les scores bas", "bullet-8"),
        
        createSubtitle("9.2 Impact Business"),
        createBody("Un syst\u00e8me de Customer Success bien impl\u00e9ment\u00e9 peut r\u00e9duire le churn de 25% et augmenter l'expansion revenue de 40%. L'investissement dans cette fonctionnalit\u00e9 se rentabilise d\u00e8s la premi\u00e8re ann\u00e9e par la r\u00e9tention additionnelle."),
        
        // Roadmap
        createTitle("10. Roadmap d'Impl\u00e9mentation"),
        createBody("L'impl\u00e9mentation des huit fonctionnalit\u00e9s propos\u00e9es s'\u00e9tale sur 12 mois, organis\u00e9e en trois phases distinctes. Chaque phase apporte une valeur incr\u00e9mentale et permet de valider l'adoption avant de passer \u00e0 la suivante."),
        
        createSubtitle("10.1 Phase 2.1 (Mois 1-4)"),
        new Paragraph({
          numbering: { reference: "numbered-1", level: 0 },
          spacing: { after: 80, line: 250 },
          children: [new TextRun({ text: "Data Lineage & Impact Analysis - Fondation pour la conformit\u00e9 et l'audit", size: 22, font: "Times New Roman", color: colors.body })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-1", level: 0 },
          spacing: { after: 80, line: 250 },
          children: [new TextRun({ text: "AI-Powered Data Catalog - Am\u00e9lioration de la productivit\u00e9 des utilisateurs", size: 22, font: "Times New Roman", color: colors.body })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-1", level: 0 },
          spacing: { after: 80, line: 250 },
          children: [new TextRun({ text: "Security & Compliance Center - Pr\u00e9requis pour les clients Enterprise", size: 22, font: "Times New Roman", color: colors.body })]
        }),
        
        createSubtitle("10.2 Phase 2.2 (Mois 5-8)"),
        new Paragraph({
          numbering: { reference: "numbered-2", level: 0 },
          spacing: { after: 80, line: 250 },
          children: [new TextRun({ text: "Real-time Data Streaming - Diff\u00e9renciation concurrentielle forte", size: 22, font: "Times New Roman", color: colors.body })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-2", level: 0 },
          spacing: { after: 80, line: 250 },
          children: [new TextRun({ text: "Collaborative Workspace - R\u00e9tention et engagement des \u00e9quipes", size: 22, font: "Times New Roman", color: colors.body })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-2", level: 0 },
          spacing: { after: 80, line: 250 },
          children: [new TextRun({ text: "Integration Hub & iPaaS - Extension de la valeur plateforme", size: 22, font: "Times New Roman", color: colors.body })]
        }),
        
        createSubtitle("10.3 Phase 2.3 (Mois 9-12)"),
        createBody("Les deux derni\u00e8res fonctionnalit\u00e9s (Data Mesh et Customer Success) n\u00e9cessitent une base install\u00e9e suffisante pour r\u00e9v\u00e9ler leur plein potentiel. Leur impl\u00e9mentation en fin de roadmap permet de capitaliser sur les retours des phases pr\u00e9c\u00e9dentes."),
        
        // Investment Summary
        createTitle("11. Synth\u00e8se de l'Investissement"),
        createBody("L'investissement total pour la Phase 2 est estim\u00e9 \u00e0 40 semaines de d\u00e9veloppement, r\u00e9parties sur 12 mois. Le retour sur investissement est projet\u00e9 sur 3 ans avec des hypoth\u00e8ses conservatrices de croissance."),
        
        new Paragraph({ spacing: { before: 200, after: 150 } }),
        new Table({
          columnWidths: [4680, 4680],
          margins: { top: 100, bottom: 100, left: 180, right: 180 },
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "M\u00e9trique", bold: true, size: 22, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Valeur", bold: true, size: 22, font: "Times New Roman" })] })] })
              ]
            }),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Effort d\u00e9veloppement total", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "40 semaines", size: 22, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Investissement estim\u00e9", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "320K\u20ac", size: 22, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Revenus additionnels projet\u00e9s (an 1)", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "600K\u20ac", size: 22, font: "Times New Roman" })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "ROI \u00e0 3 ans", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "850%", size: 22, font: "Times New Roman" })] })] })
            ]})
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100 },
          children: [new TextRun({ text: "Tableau 5: Synth\u00e8se financi\u00e8re de la Phase 2", size: 18, font: "Times New Roman", color: colors.secondary, italics: true })]
        }),
        
        createBody("Ces propositions positionnent DataSphere Innovation comme une plateforme de r\u00e9f\u00e9rence sur le march\u00e9 du Data Engineering as a Service, avec des fonctionnalit\u00e9s diff\u00e9renciantes justifiant un positionnement premium et une forte fid\u00e9lisation client.")
      ]
    }
  ]
});

// Generate document
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/home/z/my-project/download/DataSphere_Innovation_Propositions_Phase2.docx", buffer);
  console.log("Document generated successfully: /home/z/my-project/download/DataSphere_Innovation_Propositions_Phase2.docx");
});
