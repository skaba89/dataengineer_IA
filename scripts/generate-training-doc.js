/* eslint-disable */
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
        Header, Footer, AlignmentType, HeadingLevel, BorderStyle, WidthType, 
        PageNumber, LevelFormat, ShadingType, VerticalAlign, TableOfContents,
        PageBreak } = require('docx');
const fs = require('fs');

// Color palette - "Midnight Code" for tech/AI
const colors = {
  primary: "020617",
  body: "1E293B",
  secondary: "64748B",
  accent: "7c3aed",
  tableBg: "F8FAFC",
  tableHeader: "E2E8F0",
};

const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: colors.secondary };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };

const numberingConfig = {
  config: [
    { reference: "bullet-main", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    { reference: "bullet-features", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    { reference: "numbered-steps", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    { reference: "numbered-workflow", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    { reference: "numbered-quality", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    { reference: "numbered-api", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    { reference: "numbered-demo", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
    { reference: "bullet-demo", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
  ]
};

const doc = new Document({
  numbering: numberingConfig,
  styles: {
    default: { document: { run: { font: "Calibri", size: 22 } } },
    paragraphStyles: [
      { id: "Title", name: "Title", basedOn: "Normal",
        run: { size: 56, bold: true, color: colors.primary, font: "Times New Roman" },
        paragraph: { spacing: { before: 240, after: 120 }, alignment: AlignmentType.CENTER } },
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 36, bold: true, color: colors.primary, font: "Times New Roman" },
        paragraph: { spacing: { before: 360, after: 200 }, outlineLevel: 0 } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 28, bold: true, color: colors.body, font: "Times New Roman" },
        paragraph: { spacing: { before: 280, after: 160 }, outlineLevel: 1 } },
      { id: "Heading3", name: "Heading 3", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { size: 24, bold: true, color: colors.secondary, font: "Times New Roman" },
        paragraph: { spacing: { before: 200, after: 120 }, outlineLevel: 2 } },
    ]
  },
  sections: [
    // Cover Page
    {
      properties: { page: { margin: { top: 0, right: 0, bottom: 0, left: 0 } } },
      children: [
        new Paragraph({ spacing: { before: 3000 }, children: [] }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "DataSphere Innovation", size: 72, bold: true, color: colors.accent, font: "Times New Roman" })]
        }),
        new Paragraph({ spacing: { before: 400 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Documentation de Formation", size: 44, color: colors.primary, font: "Times New Roman" })]
        }),
        new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Guide Complet de l'Utilisateur", size: 28, color: colors.secondary, font: "Calibri" })]
        }),
        new Paragraph({ spacing: { before: 2000 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Plateforme Data Engineering propulsée par l'IA", size: 24, color: colors.body, font: "Calibri", italics: true })]
        }),
        new Paragraph({ spacing: { before: 400 }, alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Version 2.0 | 2024", size: 22, color: colors.secondary, font: "Calibri" })]
        }),
      ]
    },
    // TOC
    {
      properties: { page: { margin: { top: 1800, right: 1440, bottom: 1440, left: 1440 } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "DataSphere Innovation - Formation", size: 18, color: colors.secondary })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("Page "), new TextRun({ children: [PageNumber.CURRENT] }), new TextRun(" / "), new TextRun({ children: [PageNumber.TOTAL_PAGES] })] })] }) },
      children: [
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("Table des Matières")] }),
        new TableOfContents("Table des Matières", { hyperlink: true, headingStyleRange: "1-3" }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 200 },
          children: [new TextRun({ text: "Note: Faites un clic droit sur la table des matières et sélectionnez \"Mettre à jour le champ\" pour afficher les numéros de page.", size: 18, color: "999999", italics: true })] }),
      ]
    },
    // Main Content
    {
      properties: { page: { margin: { top: 1800, right: 1440, bottom: 1440, left: 1440 } } },
      headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: "DataSphere Innovation - Guide de Formation", size: 18, color: colors.secondary })] })] }) },
      footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun("Page "), new TextRun({ children: [PageNumber.CURRENT] }), new TextRun(" / "), new TextRun({ children: [PageNumber.TOTAL_PAGES] })] })] }) },
      children: [
        // 1. Introduction
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("1. Introduction à DataSphere Innovation")] }),
        new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "DataSphere Innovation est une plateforme révolutionnaire de data engineering propulsée par l'intelligence artificielle. Elle permet aux entreprises de toutes tailles de transformer leurs opérations de données sans nécessiter d'expertise technique approfondie. Cette documentation vous guidera à travers toutes les fonctionnalités de la plateforme, de la connexion des sources de données à la génération automatique de pipelines ETL optimisés.", font: "Calibri" })] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.1 Vision et Mission")] }),
        new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "Notre mission est de démocratiser le data engineering en rendant accessible à toutes les entreprises les capacités autrefois réservées aux grandes organisations technologiques. Nous croyons que chaque entreprise, quel que soit son secteur d'activité, mérite de pouvoir exploiter pleinement ses données pour prendre des décisions éclairées et optimiser ses opérations.", font: "Calibri" })] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.2 Avantages Clés")] }),
        new Paragraph({ numbering: { reference: "bullet-main", level: 0 }, children: [new TextRun({ text: "Réduction de 80% du temps de développement des pipelines de données grâce à l'automatisation IA", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullet-main", level: 0 }, children: [new TextRun({ text: "30+ connecteurs pré-configurés pour les bases de données, API et services SaaS populaires", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullet-main", level: 0 }, children: [new TextRun({ text: "Interface no-code intuitive permettant aux utilisateurs non-techniques de créer des pipelines complexes", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullet-main", level: 0 }, children: [new TextRun({ text: "Qualité des données garantie avec des tests automatisés et détection d'anomalies par ML", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullet-main", level: 0 }, children: [new TextRun({ text: "Support multi-framework: dbt, Airflow, Dagster, Spark selon vos préférences", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullet-main", level: 0 }, children: [new TextRun({ text: "Déploiement enterprise avec SSO SAML/OIDC et conformité RGPD", font: "Calibri" })] }),
        
        // 2. Architecture
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("2. Architecture de la Plateforme")] }),
        new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "DataSphere Innovation repose sur une architecture moderne et évolutive, conçue pour s'adapter aux besoins des entreprises de toutes tailles. La plateforme est divisée en plusieurs modules interconnectés qui travaillent ensemble pour offrir une expérience data engineering complète et automatisée.", font: "Calibri" })] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.1 Composants Principaux")] }),
        new Table({
          columnWidths: [2800, 6560],
          margins: { top: 100, bottom: 100, left: 180, right: 180 },
          rows: [
            new TableRow({ tableHeader: true, children: [
              new TableCell({ borders: cellBorders, shading: { fill: colors.tableHeader, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Composant", bold: true, size: 22 })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: colors.tableHeader, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Description", bold: true, size: 22 })] })] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Connecteurs", bold: true, size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "30+ connecteurs pour bases de données SQL/NoSQL, API REST, services SaaS", size: 22 })] })] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Moteur IA", bold: true, size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Agents IA spécialisés pour découverte, architecture, pipelines, transformations", size: 22 })] })] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Visual Builder", bold: true, size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Interface drag-and-drop pour créer des pipelines sans code", size: 22 })] })] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Quality Engine", bold: true, size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "15+ types de tests de qualité, détection d'anomalies ML, scoring automatique", size: 22 })] })] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "API Publique", bold: true, size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "API REST complète avec documentation OpenAPI, authentification par clés API", size: 22 })] })] }),
            ]}),
          ]
        }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80 }, children: [new TextRun({ text: "Tableau 1: Composants principaux de la plateforme", size: 18, italics: true, color: colors.secondary })] }),
        
        // 3. Workflow
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("3. Workflow de l'Utilisateur")] }),
        new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "Le workflow typique d'un utilisateur DataSphere Innovation suit un processus structuré en 5 étapes principales, conçu pour maximiser l'efficacité tout en garantissant la qualité des résultats. Chaque étape est automatisée par nos agents IA spécialisés.", font: "Calibri" })] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.1 Étape 1: Connexion des Sources")] }),
        new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "La première étape consiste à connecter vos sources de données à la plateforme. Cette phase est simplifiée grâce à nos connecteurs pré-configurés qui gèrent automatiquement l'authentification, la découverte du schéma et l'échantillonnage des données.", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "numbered-steps", level: 0 }, children: [new TextRun({ text: "Accédez à l'onglet \"Data Sources\" depuis le tableau de bord principal", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "numbered-steps", level: 0 }, children: [new TextRun({ text: "Cliquez sur \"Nouvelle Source\" et sélectionnez le type de connecteur souhaité", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "numbered-steps", level: 0 }, children: [new TextRun({ text: "Renseignez les informations de connexion (hôte, port, identifiants, base de données)", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "numbered-steps", level: 0 }, children: [new TextRun({ text: "Testez la connexion pour valider les paramètres avant de sauvegarder", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "numbered-steps", level: 0 }, children: [new TextRun({ text: "Lancez la découverte automatique pour analyser le schéma de vos données", font: "Calibri" })] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.2 Étape 2: Découverte et Analyse")] }),
        new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "Une fois les sources connectées, l'agent \"Data Archaeologist\" prend le relais pour analyser en profondeur vos données. Il identifie automatiquement les tables, colonnes, relations, types de données et détecte les problèmes potentiels.", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "numbered-workflow", level: 0 }, children: [new TextRun({ text: "Analyse du schéma: identification des tables, colonnes, types et contraintes", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "numbered-workflow", level: 0 }, children: [new TextRun({ text: "Profilage des données: statistiques sur la distribution, valeurs distinctes, patterns", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "numbered-workflow", level: 0 }, children: [new TextRun({ text: "Détection des relations: clés primaires/étrangères suggérées automatiquement", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "numbered-workflow", level: 0 }, children: [new TextRun({ text: "Identification des PII: données sensibles à protéger automatiquement détectées", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "numbered-workflow", level: 0 }, children: [new TextRun({ text: "Génération de recommandations: optimisations suggérées pour vos données", font: "Calibri" })] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.3 Étape 3: Génération des Pipelines")] }),
        new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "L'agent \"Flow Builder\" génère automatiquement des pipelines ETL optimisés basés sur vos sources de données et objectifs business. Vous pouvez choisir parmi plusieurs frameworks populaires ou utiliser le visual builder no-code pour personnaliser vos flux.", font: "Calibri" })] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Frameworks Supportés")] }),
        new Paragraph({ numbering: { reference: "bullet-features", level: 0 }, children: [new TextRun({ text: "dbt: Génération de modèles SQL avec tests intégrés et documentation automatique", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullet-features", level: 0 }, children: [new TextRun({ text: "Apache Airflow: DAGs Python avec orchestration avancée et monitoring", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullet-features", level: 0 }, children: [new TextRun({ text: "Dagster: Assets et jobs avec typage fort et tests intégrés", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullet-features", level: 0 }, children: [new TextRun({ text: "Apache Spark: Jobs PySpark optimisés pour le traitement distribué", font: "Calibri" })] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.4 Étape 4: Validation de la Qualité")] }),
        new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "Le Quality Engine applique automatiquement des tests de qualité sur toutes vos données. Il utilise des algorithmes de machine learning pour détecter les anomalies et génère des alertes en cas de problème.", font: "Calibri" })] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.5 Étape 5: Déploiement et Monitoring")] }),
        new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "Une fois vos pipelines validés, vous pouvez les déployer en production en un clic. Le système de monitoring intégré surveille l'exécution, collecte les métriques de performance et vous alerte en cas d'anomalie.", font: "Calibri" })] }),
        
        // 4. Agents IA
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("4. Les Agents IA Spécialisés")] }),
        new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "DataSphere Innovation s'appuie sur une équipe d'agents IA spécialisés, chacun expert dans un domaine précis du data engineering. Ces agents collaborent automatiquement pour couvrir l'ensemble du cycle de vie de vos projets de données.", font: "Calibri" })] }),
        
        new Table({
          columnWidths: [2200, 2500, 4660],
          margins: { top: 100, bottom: 100, left: 180, right: 180 },
          rows: [
            new TableRow({ tableHeader: true, children: [
              new TableCell({ borders: cellBorders, shading: { fill: colors.tableHeader, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Agent", bold: true, size: 22 })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: colors.tableHeader, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Spécialité", bold: true, size: 22 })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: colors.tableHeader, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Fonctionnalités", bold: true, size: 22 })] })] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Data Archaeologist", bold: true, size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Découverte & Profilage", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Analyse de schémas, profiling, détection PII, relations", size: 22 })] })] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Blueprint Designer", bold: true, size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Architecture", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Design d'architecture, sélection tech stack, coûts", size: 22 })] })] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Flow Builder", bold: true, size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Pipelines ETL", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Génération DAG, modèles dbt, jobs Spark optimisés", size: 22 })] })] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Data Alchemist", bold: true, size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Transformations", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Modélisation dimensionnelle, optimisation SQL", size: 22 })] })] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Visual Storyteller", bold: true, size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Business Intelligence", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Dashboards, KPIs, rapports automatisés, insights", size: 22 })] })] }),
            ]}),
          ]
        }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80 }, children: [new TextRun({ text: "Tableau 2: Agents IA spécialisés", size: 18, italics: true, color: colors.secondary })] }),
        
        // 5. Connecteurs
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("5. Connecteurs Disponibles")] }),
        new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "DataSphere Innovation offre une bibliothèque étendue de connecteurs couvrant tous les types de sources de données courantes. Chaque connecteur est pré-configuré pour une intégration rapide.", font: "Calibri" })] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.1 Bases de Données SQL")] }),
        new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "Support complet des bases de données relationnelles les plus populaires:", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullet-features", level: 0 }, children: [new TextRun({ text: "PostgreSQL: Support complet avec extensions PostGIS, partitionnement", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullet-features", level: 0 }, children: [new TextRun({ text: "MySQL/MariaDB: Compatible toutes versions, support vues et procédures", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullet-features", level: 0 }, children: [new TextRun({ text: "Microsoft SQL Server: Intégration Azure SQL, types géographiques", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullet-features", level: 0 }, children: [new TextRun({ text: "Oracle: Support Enterprise, optimisation performances", font: "Calibri" })] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.2 Data Warehouses Cloud")] }),
        new Paragraph({ numbering: { reference: "bullet-features", level: 0 }, children: [new TextRun({ text: "Snowflake: Intégration native, warehouses multi-cluster", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullet-features", level: 0 }, children: [new TextRun({ text: "Google BigQuery: Optimisation coûts, partitionnement automatique", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullet-features", level: 0 }, children: [new TextRun({ text: "Amazon Redshift: Support Spectrum, intégration AWS Glue", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullet-features", level: 0 }, children: [new TextRun({ text: "Databricks: Delta Lake, Unity Catalog, MLflow intégrés", font: "Calibri" })] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.3 NoSQL & Streaming")] }),
        new Paragraph({ numbering: { reference: "bullet-features", level: 0 }, children: [new TextRun({ text: "MongoDB: Pipelines d'agrégation, change streams", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullet-features", level: 0 }, children: [new TextRun({ text: "Redis: Caching, sessions, streams avec clustering", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullet-features", level: 0 }, children: [new TextRun({ text: "Apache Kafka: Streaming temps réel, schema registry", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullet-features", level: 0 }, children: [new TextRun({ text: "Elasticsearch: Recherche full-text, analytics logs", font: "Calibri" })] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.4 Connecteurs SaaS Business")] }),
        new Paragraph({ numbering: { reference: "bullet-features", level: 0 }, children: [new TextRun({ text: "CRM: Salesforce, HubSpot, Pipedrive - contacts, opportunités, activités", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullet-features", level: 0 }, children: [new TextRun({ text: "E-Commerce: Shopify, Magento, WooCommerce - commandes, produits", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullet-features", level: 0 }, children: [new TextRun({ text: "Finance: Stripe, Plaid, QuickBooks - transactions, factures", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullet-features", level: 0 }, children: [new TextRun({ text: "Marketing: Google Ads, Facebook Ads, Analytics 4 - campagnes", font: "Calibri" })] }),
        
        // 6. Data Quality
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("6. Data Quality Monitoring")] }),
        new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "Le module Data Quality offre une approche complète et automatisée de la qualité des données. Il combine des tests traditionnels avec des algorithmes de machine learning pour une détection proactive des problèmes.", font: "Calibri" })] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.1 Types de Tests Disponibles")] }),
        new Paragraph({ numbering: { reference: "numbered-quality", level: 0 }, children: [new TextRun({ text: "Tests de complétude: NULL check, pourcentage nulls acceptable, champs requis", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "numbered-quality", level: 0 }, children: [new TextRun({ text: "Tests d'unicité: clés primaires, détection doublons, combinaisons uniques", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "numbered-quality", level: 0 }, children: [new TextRun({ text: "Tests de validité: valeurs acceptées, plages numériques, patterns regex", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "numbered-quality", level: 0 }, children: [new TextRun({ text: "Tests d'intégrité référentielle: foreign keys, orphelins, références cassées", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "numbered-quality", level: 0 }, children: [new TextRun({ text: "Tests de fraîcheur: âge maximum données, fréquence mise à jour", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "numbered-quality", level: 0 }, children: [new TextRun({ text: "Tests de volume: nombre lignes attendu, variations anormales", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "numbered-quality", level: 0 }, children: [new TextRun({ text: "Détection d'anomalies ML: algorithmes prédictifs pour données suspectes", font: "Calibri" })] }),
        
        // 7. API
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("7. API Publique")] }),
        new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "DataSphere Innovation expose une API REST complète permettant d'intégrer toutes les fonctionnalités de la plateforme dans vos applications existantes.", font: "Calibri" })] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("7.1 Authentification")] }),
        new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "L'API utilise l'authentification par clés API. Chaque organisation peut créer plusieurs clés avec des permissions différentes.", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "numbered-api", level: 0 }, children: [new TextRun({ text: "Accédez à /api-keys pour créer une nouvelle clé API", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "numbered-api", level: 0 }, children: [new TextRun({ text: "Définissez les permissions: lecture seule, lecture/écriture, ou admin", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "numbered-api", level: 0 }, children: [new TextRun({ text: "Optionnellement, définissez une date d'expiration pour la clé", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "numbered-api", level: 0 }, children: [new TextRun({ text: "Incluez la clé dans le header X-API-Key de vos requêtes", font: "Calibri" })] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("7.2 Endpoints Principaux")] }),
        new Table({
          columnWidths: [1500, 3500, 4360],
          margins: { top: 100, bottom: 100, left: 180, right: 180 },
          rows: [
            new TableRow({ tableHeader: true, children: [
              new TableCell({ borders: cellBorders, shading: { fill: colors.tableHeader, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Méthode", bold: true, size: 22 })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: colors.tableHeader, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Endpoint", bold: true, size: 22 })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: colors.tableHeader, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Description", bold: true, size: 22 })] })] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "GET", bold: true, color: "22c55e", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "/api/projects", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Liste tous les projets", size: 22 })] })] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "POST", bold: true, color: "3b82f6", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "/api/pipelines", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Génère un nouveau pipeline", size: 22 })] })] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "POST", bold: true, color: "3b82f6", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "/api/agents/execute", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Exécute un agent IA", size: 22 })] })] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "POST", bold: true, color: "3b82f6", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "/api/quality/run", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Lance les tests de qualité", size: 22 })] })] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "POST", bold: true, color: "3b82f6", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "/api/export", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Exporte les livrables", size: 22 })] })] }),
            ]}),
          ]
        }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80 }, children: [new TextRun({ text: "Tableau 3: Principaux endpoints de l'API", size: 18, italics: true, color: colors.secondary })] }),
        
        // 8. Pricing
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("8. Plans et Tarification")] }),
        new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "DataSphere Innovation propose trois plans adaptés aux besoins et à la taille des organisations. Tous les plans incluent les fonctionnalités essentielles de data engineering.", font: "Calibri" })] }),
        
        new Table({
          columnWidths: [2340, 2340, 2340, 2340],
          margins: { top: 100, bottom: 100, left: 180, right: 180 },
          rows: [
            new TableRow({ tableHeader: true, children: [
              new TableCell({ borders: cellBorders, shading: { fill: colors.tableHeader, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Caractéristique", bold: true, size: 22 })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: colors.tableHeader, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Starter (499€)", bold: true, size: 22 })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: colors.tableHeader, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Professional (1499€)", bold: true, size: 22 })] })] }),
              new TableCell({ borders: cellBorders, shading: { fill: colors.tableHeader, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Enterprise (4999€)", bold: true, size: 22 })] })] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Projets actifs", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "5", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "25", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Illimité", size: 22 })] })] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Sources de données", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "10", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "25", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Illimité", size: 22 })] })] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Exécutions/mois", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "1 000", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "10 000", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Illimité", size: 22 })] })] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Membres équipe", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "3", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "10", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Illimité", size: 22 })] })] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Support", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Email", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Prioritaire", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Dédié 24/7", size: 22 })] })] }),
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "SSO Entreprise", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "—", size: 22, color: colors.secondary })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Basique", size: 22 })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "SAML/OIDC", size: 22 })] })] }),
            ]}),
          ]
        }),
        new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 80 }, children: [new TextRun({ text: "Tableau 4: Comparatif des plans tarifaires", size: 18, italics: true, color: colors.secondary })] }),
        
        // 9. Demo
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("9. Tutoriel Pratique: Démonstration TechMart")] }),
        new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "Cette section vous guide à travers un cas d'usage réel pour illustrer les capacités de DataSphere Innovation. Nous utiliserons l'exemple d'une entreprise de e-commerce fictive, \"TechMart\", qui souhaite optimiser sa chaîne d'approvisionnement.", font: "Calibri" })] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("9.1 Contexte: TechMart")] }),
        new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "TechMart est un retailer en ligne spécialisé dans les produits technologiques. L'entreprise dispose de plusieurs sources de données disparates:", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "numbered-demo", level: 0 }, children: [new TextRun({ text: "Base PostgreSQL contenant les commandes, clients et produits (500K+ enregistrements)", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "numbered-demo", level: 0 }, children: [new TextRun({ text: "Compte Shopify pour les ventes marketplace avec synchronisation temps réel", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "numbered-demo", level: 0 }, children: [new TextRun({ text: "Google Analytics 4 pour le tracking comportemental et les conversions", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "numbered-demo", level: 0 }, children: [new TextRun({ text: "Google Ads pour les campagnes marketing et les données de performance", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "numbered-demo", level: 0 }, children: [new TextRun({ text: "API Stripe pour les paiements et la facturation récurrente", font: "Calibri" })] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("9.2 Objectifs Business")] }),
        new Paragraph({ numbering: { reference: "bullet-demo", level: 0 }, children: [new TextRun({ text: "360° Customer View: Vue unifiée du client à travers tous les canaux de vente", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullet-demo", level: 0 }, children: [new TextRun({ text: "Inventory Optimization: Prédiction des stocks pour réduire les ruptures de 40%", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullet-demo", level: 0 }, children: [new TextRun({ text: "Marketing Attribution: Mesure précise du ROI marketing multi-canal", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullet-demo", level: 0 }, children: [new TextRun({ text: "Churn Prediction: Identification proactive des clients à risque de départ", font: "Calibri" })] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("9.3 Mise en Œuvre")] }),
        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Phase 1: Connexion des sources (Jours 1-2)")] }),
        new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "Création d'un nouveau projet \"TechMart Analytics\" dans la plateforme, puis connexion successive des 5 sources de données. Chaque connecteur a été configuré avec les paramètres de sécurité appropriés et testé individuellement. La découverte automatique a identifié 47 tables au total avec 312 colonnes.", font: "Calibri" })] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Phase 2: Découverte et profilage (Jours 3-4)")] }),
        new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "L'agent Data Archaeologist a analysé les données et produit un rapport complet: identification de 12 relations entre tables, détection de 3.2% de valeurs nulles problématiques, découverte de 23 champs PII nécessitant une protection, et suggéré 15 optimisations d'index.", font: "Calibri" })] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Phase 3: Architecture et pipelines (Jours 5-10)")] }),
        new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "L'agent Blueprint Designer a proposé une architecture moderne basée sur dbt + Airflow + Snowflake. Ensuite, l'agent Flow Builder a généré 23 modèles dbt (staging, intermediate, marts) et 5 DAGs Airflow pour l'orchestration. Le code généré a été directement déployable.", font: "Calibri" })] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Phase 4: Qualité et déploiement (Jours 11-14)")] }),
        new Paragraph({ spacing: { after: 80 }, children: [new TextRun({ text: "Configuration de 45 tests de qualité couvrant toutes les tables critiques. Score de qualité initial de 87% après correction des problèmes détectés. Mise en place d'alertes email et Slack pour les tests en échec. Déploiement en production avec monitoring temps réel.", font: "Calibri" })] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("9.4 Résultats Obtenus")] }),
        new Paragraph({ numbering: { reference: "bullet-demo", level: 0 }, children: [new TextRun({ text: "Temps de développement réduit de 6 mois (approche traditionnelle) à 2 semaines", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullet-demo", level: 0 }, children: [new TextRun({ text: "Qualité des données améliorée de 72% à 94% grâce aux tests automatisés", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullet-demo", level: 0 }, children: [new TextRun({ text: "ROI marketing mesuré avec précision: attribution multi-touch opérationnelle", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullet-demo", level: 0 }, children: [new TextRun({ text: "Prédictions de stock fiables à 89% permettant d'optimiser les commandes fournisseurs", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullet-demo", level: 0 }, children: [new TextRun({ text: "Économies estimées de 150K€/an sur les coûts opérationnels", font: "Calibri" })] }),
        
        // 10. Support
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("10. Support et Ressources")] }),
        new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: "DataSphere Innovation s'engage à accompagner ses clients dans leur transformation data avec un support réactif et des ressources pédagogiques complètes.", font: "Calibri" })] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("10.1 Canaux de Support")] }),
        new Paragraph({ numbering: { reference: "bullet-features", level: 0 }, children: [new TextRun({ text: "Documentation en ligne: docs.datasphere-innovation.com avec guides et tutoriels", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullet-features", level: 0 }, children: [new TextRun({ text: "Support email: support@datasphere-innovation.com (réponse sous 24h)", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullet-features", level: 0 }, children: [new TextRun({ text: "Chat en direct: disponible dans l'application pour les plans Professional et Enterprise", font: "Calibri" })] }),
        new Paragraph({ numbering: { reference: "bullet-features", level: 0 }, children: [new TextRun({ text: "Support téléphonique: ligne dédiée pour les clients Enterprise", font: "Calibri" })] }),
        
        // Footer
        new Paragraph({ spacing: { before: 400 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "— — —", size: 24, color: colors.secondary })] }),
        new Paragraph({ spacing: { before: 200 }, alignment: AlignmentType.CENTER, children: [new TextRun({ text: "DataSphere Innovation", size: 24, bold: true, color: colors.accent })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Transformez vos données avec l'intelligence artificielle", size: 20, italics: true, color: colors.secondary })] }),
        new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "www.datasphere-innovation.com", size: 20, color: colors.body })] }),
      ]
    }
  ]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/home/z/my-project/download/DataSphere_Innovation_Formation.docx", buffer);
  console.log("Document created: /home/z/my-project/download/DataSphere_Innovation_Formation.docx");
});
