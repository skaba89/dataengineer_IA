const { 
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
  Header, Footer, AlignmentType, LevelFormat, HeadingLevel, BorderStyle, 
  WidthType, ShadingType, VerticalAlign, PageNumber, TableOfContents
} = require('docx');
const fs = require('fs');

// Color scheme - Midnight Code
const colors = {
  primary: "020617",
  body: "1E293B",
  secondary: "64748B",
  accent: "94A3B8",
  tableBg: "F8FAFC",
  green: "059669",
  red: "DC2626",
  yellow: "D97706",
  blue: "2563EB"
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

const createStatTable = (stats) => new Table({
  columnWidths: stats.map(() => Math.floor(9360 / stats.length)),
  margins: { top: 100, bottom: 100, left: 180, right: 180 },
  rows: [
    new TableRow({
      children: stats.map(stat => new TableCell({
        borders: cellBorders,
        shading: { fill: colors.tableBg, type: ShadingType.CLEAR },
        verticalAlign: VerticalAlign.CENTER,
        children: [
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: stat.value, bold: true, size: 32, font: "Times New Roman", color: stat.color || colors.primary })] }),
          new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: stat.label, size: 18, font: "Times New Roman", color: colors.secondary })] })
        ]
      }))
    })
  ]
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
      { reference: "bullet-1", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullet-2", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullet-3", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullet-4", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullet-5", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "bullet-6", levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-1", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-2", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] },
      { reference: "numbered-3", levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 720, hanging: 360 } } } }] }
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
          children: [new TextRun({ text: "\u00c9tat du Projet", size: 40, font: "Times New Roman", color: colors.secondary })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100 },
          children: [new TextRun({ text: "Points Forts & Points Faibles", size: 28, font: "Times New Roman", color: colors.accent })]
        }),
        new Paragraph({ spacing: { before: 2000 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Plateforme Data Engineering Multi-Agent", size: 24, font: "Times New Roman", color: colors.body })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100 },
          children: [new TextRun({ text: "Analyse Compl\u00e8te - Janvier 2025", size: 22, font: "Times New Roman", color: colors.secondary })]
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
            children: [new TextRun({ text: "DataSphere Innovation - \u00c9tat du Projet", size: 18, font: "Times New Roman", color: colors.secondary })]
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
        // Executive Summary
        createTitle("1. R\u00e9sum\u00e9 Ex\u00e9cutif"),
        createBody("DataSphere Innovation est une plateforme d'ing\u00e9nierie de donn\u00e9es aliment\u00e9e par IA avec une architecture multi-agent sophistiqu\u00e9e. Apr\u00e8s une analyse compl\u00e8te du codebase, le projet pr\u00e9sente un niveau de maturit\u00e9 de 85% avec des fondations solides mais n\u00e9cessite des am\u00e9liorations pour une mise en production entreprise."),
        
        createStatTable([
          { value: "85%", label: "Compl\u00e9tude", color: colors.green },
          { value: "26", label: "Mod\u00e8les DB", color: colors.blue },
          { value: "10", label: "Agents IA", color: colors.blue },
          { value: "26", label: "API Routes", color: colors.blue }
        ]),

        new Paragraph({ spacing: { before: 200 } }),

        // Points Forts
        createTitle("2. Points Forts"),
        
        createSubtitle("2.1 Architecture Multi-Agent Avanc\u00e9e"),
        createBody("Le syst\u00e8me dispose de 10 agents sp\u00e9cialis\u00e9s qui collaborent pour automatiser l'ensemble du cycle de vie des projets data. Cette architecture repr\u00e9sente un avantage comp\u00e9titif majeur avec un orchestrateur intelligent capable de planifier et ex\u00e9cuter des workflows complexes de mani\u00e8re autonome."),
        createBullet("Business Agent : Orchestrateur strat\u00e9gique alignant les projets sur les objectifs m\u00e9tier", "bullet-1"),
        createBullet("Discovery Agent : D\u00e9couverte automatique des sources de donn\u00e9es et analyse de sch\u00e9mas", "bullet-1"),
        createBullet("Architecture Agent : G\u00e9n\u00e9ration de blueprints d'architecture optimis\u00e9s", "bullet-1"),
        createBullet("Pipeline Agent : Cr\u00e9ation de pipelines ETL/ELT avec dbt, Airflow, Dagster", "bullet-1"),
        createBullet("BI Agent : Dashboards et visualisations automatis\u00e9s", "bullet-1"),
        
        createSubtitle("2.2 Infrastructure de S\u00e9curit\u00e9 Entreprise"),
        createBody("La plateforme int\u00e8gre une suite de s\u00e9curit\u00e9 compl\u00e8te avec chiffrement AES-256-GCM, audit logging infalsifiable, gestion des secrets avec rotation automatique, et support de 5 frameworks de conformit\u00e9 (SOC2, RGPD, HIPAA, PCI-DSS, ISO27001). Cette infrastructure positionne le produit pour les march\u00e9s enterprise les plus exigeants."),
        createBullet("Chiffrement bout en bout : AES-256-GCM pour toutes les donn\u00e9es sensibles", "bullet-2"),
        createBullet("Audit Trail : Signatures HMAC-SHA256 anti-falsification", "bullet-2"),
        createBullet("MFA/2FA : Support TOTP avec codes de r\u00e9cup\u00e9ration", "bullet-2"),
        createBullet("Contr\u00f4le d'acc\u00e8s IP : Whitelist/blacklist avec support CIDR", "bullet-2"),
        
        createSubtitle("2.3 Stack Technique Moderne"),
        createBody("Le projet utilise les derni\u00e8res technologies avec Next.js 16, React 19, Prisma 6, et TypeScript. L'architecture suit les meilleures pratiques avec une s\u00e9paration claire des responsabilit\u00e9s, une API REST compl\u00e8te, et 57 composants UI Shadcn pr\u00eats \u00e0 l'emploi."),
        createBullet("Framework : Next.js 16.1.1 avec App Router", "bullet-3"),
        createBullet("Base de donn\u00e9es : Prisma 6.11.1 avec support PostgreSQL/BigQuery", "bullet-3"),
        createBullet("Authentification : NextAuth v5 avec RBAC complet", "bullet-3"),
        createBullet("UI : 57 composants Radix UI accessibles et customisables", "bullet-3"),

        createSubtitle("2.4 Fonctionnalit\u00e9s Commerciales Int\u00e9gr\u00e9es"),
        createBody("La plateforme inclut d\u00e9j\u00e0 un syst\u00e8me de facturation Stripe complet avec 4 plans tarifaires, une API publique avec gestion des cl\u00e9s et rate limiting, un Visual Builder no-code, et un AI Consultant pour guider les utilisateurs dans leurs projets data."),
        createBullet("Billing : Int\u00e9gration Stripe compl\u00e8te avec webhooks", "bullet-4"),
        createBullet("API Publique : Documentation OpenAPI 3.1.0", "bullet-4"),
        createBullet("Visual Builder : Constructeur drag-and-drop de pipelines", "bullet-4"),
        createBullet("SSO Enterprise : SAML 2.0, OIDC, 8 providers pr\u00e9configur\u00e9s", "bullet-4"),

        new Paragraph({ spacing: { before: 200 } }),

        // Points Faibles
        createTitle("3. Points Faibles"),

        createSubtitle("3.1 Absence de Tests"),
        createBody("Le point faible le plus critique est l'absence totale de tests automatis\u00e9s. Cette lacune repr\u00e9sente un risque majeur pour la stabilit\u00e9 en production et la maintenance \u00e0 long terme. Il est imp\u00e9ratif d'impl\u00e9menter une strat\u00e9gie de test compl\u00e8te avant toute mise en production."),
        createBullet("Tests unitaires : 0% de couverture - Aucun test Jest/Vitest", "bullet-5"),
        createBullet("Tests d'int\u00e9gration : Non impl\u00e9ment\u00e9s", "bullet-5"),
        createBullet("Tests E2E : Aucun test Playwright/Cypress", "bullet-5"),
        createBullet("Tests de s\u00e9curit\u00e9 : Non impl\u00e9ment\u00e9s", "bullet-5"),

        createSubtitle("3.2 Probl\u00e8mes de S\u00e9curit\u00e9 Critiques"),
        createBody("Plusieurs vuln\u00e9rabilit\u00e9s de s\u00e9curit\u00e9 n\u00e9cessitent une correction imm\u00e9diate. Ces probl\u00e8mes peuvent compromettre l'int\u00e9grit\u00e9 de la plateforme et exposer les donn\u00e9es utilisateurs."),
        createBullet("Secret par d\u00e9faut : AUTH_SECRET hardcod\u00e9 dans le code (CRITIQUE)", "bullet-6"),
        createBullet("Mot de passe en clair : Credentials stock\u00e9s sans chiffrement dans les connecteurs", "bullet-6"),
        createBullet("Rate limiting : Non appliqu\u00e9 sur les endpoints IA co\u00fbteux", "bullet-6"),
        createBullet("Validation : Absence de validation Zod sur plusieurs endpoints API", "bullet-6"),

        createSubtitle("3.3 Impl\u00e9mentations Partielles"),
        createBody("Plusieurs fonctionnalit\u00e9s sont partiellement impl\u00e9ment\u00e9es avec des stubs ou des donn\u00e9es de d\u00e9monstration, ce qui limite leur utilit\u00e9 en production."),
        createBullet("Connecteur MySQL : Classe d\u00e9finie mais non impl\u00e9ment\u00e9e", "bullet-1"),
        createBullet("Notifications temps r\u00e9el : Stock en m\u00e9moire (n\u00e9cessite Redis)", "bullet-1"),
        createBullet("Scheduler : Mod\u00e8le existe, API incompl\u00e8te", "bullet-1"),
        createBullet("Diagrammes : Lib exists, API incompl\u00e8te", "bullet-1"),
        createBullet("Knowledge Base RAG : Mod\u00e8le d\u00e9fini, pas d'impl\u00e9mentation", "bullet-1"),

        createSubtitle("3.4 Dette Technique"),
        createBody("Plusieurs \u00e9l\u00e9ments de dette technique ont \u00e9t\u00e9 identifi\u00e9s et n\u00e9cessitent une attention particuli\u00e8re pour maintenir la qualit\u00e9 du code."),
        createBullet("Utilisateur hardcod\u00e9 : Utilisateur demo dans l'API projects", "bullet-2"),
        createBullet("TODO comments : Commentaires non r\u00e9solus dans les connecteurs", "bullet-2"),
        createBullet("Types any : Utilisation de types any dans certains modules", "bullet-2"),
        createBullet("Documentation : Absence de JSDoc sur les fonctions publiques", "bullet-2"),

        new Paragraph({ spacing: { before: 200 } }),

        // Analyse Quantitative
        createTitle("4. Analyse Quantitative"),

        createSubtitle("4.1 Couverture par Cat\u00e9gorie"),
        new Table({
          columnWidths: [4680, 2340, 2340],
          margins: { top: 100, bottom: 100, left: 180, right: 180 },
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Cat\u00e9gorie", bold: true, size: 22, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Impl\u00e9ment\u00e9", bold: true, size: 22, font: "Times New Roman" })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Statut", bold: true, size: 22, font: "Times New Roman" })] })] })
              ]
            }),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Modules lib/", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "15/15", size: 22, font: "Times New Roman", color: colors.green })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "100%", size: 22, font: "Times New Roman", color: colors.green })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Agents IA", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "10/10", size: 22, font: "Times New Roman", color: colors.green })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "100%", size: 22, font: "Times New Roman", color: colors.green })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "API Endpoints", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "22/26", size: 22, font: "Times New Roman", color: colors.yellow })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "85%", size: 22, font: "Times New Roman", color: colors.yellow })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Mod\u00e8les DB", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "26/26", size: 22, font: "Times New Roman", color: colors.green })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "100%", size: 22, font: "Times New Roman", color: colors.green })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Composants UI", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "57/57", size: 22, font: "Times New Roman", color: colors.green })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "100%", size: 22, font: "Times New Roman", color: colors.green })] })] })
            ]}),
            new TableRow({ children: [
              new TableCell({ borders: cellBorders, children: [new Paragraph({ children: [new TextRun({ text: "Tests", size: 22, font: "Times New Roman" })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "0%", size: 22, font: "Times New Roman", color: colors.red })] })] }),
              new TableCell({ borders: cellBorders, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "CRITIQUE", size: 22, font: "Times New Roman", color: colors.red })] })] })
            ]})
          ]
        }),

        new Paragraph({ spacing: { before: 200 } }),

        // Recommandations
        createTitle("5. Recommandations Prioris\u00e9es"),

        createSubtitle("5.1 Priorit\u00e9 Critique (Avant Production)"),
        new Paragraph({
          numbering: { reference: "numbered-1", level: 0 },
          spacing: { after: 80, line: 250 },
          children: [new TextRun({ text: "Impl\u00e9menter les tests : Jest pour les tests unitaires, Playwright pour les E2E - Objectif 80% de couverture", size: 22, font: "Times New Roman", color: colors.body })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-1", level: 0 },
          spacing: { after: 80, line: 250 },
          children: [new TextRun({ text: "Corriger les failles de s\u00e9curit\u00e9 : Supprimer les secrets hardcod\u00e9s, utiliser des variables d'environnement", size: 22, font: "Times New Roman", color: colors.body })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-1", level: 0 },
          spacing: { after: 80, line: 250 },
          children: [new TextRun({ text: "Impl\u00e9menter Redis : Pour les sessions, le cache et les notifications temps r\u00e9el", size: 22, font: "Times New Roman", color: colors.body })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-1", level: 0 },
          spacing: { after: 80, line: 250 },
          children: [new TextRun({ text: "Ajouter la validation : Sch\u00e9mas Zod sur tous les endpoints API", size: 22, font: "Times New Roman", color: colors.body })]
        }),

        createSubtitle("5.2 Priorit\u00e9 Haute (Court Terme)"),
        new Paragraph({
          numbering: { reference: "numbered-2", level: 0 },
          spacing: { after: 80, line: 250 },
          children: [new TextRun({ text: "Compl\u00e9ter les connecteurs : MySQL, Snowflake, MongoDB avec tests d'int\u00e9gration", size: 22, font: "Times New Roman", color: colors.body })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-2", level: 0 },
          spacing: { after: 80, line: 250 },
          children: [new TextRun({ text: "WebSocket : Support temps r\u00e9el pour les mises \u00e0 jour de workflows", size: 22, font: "Times New Roman", color: colors.body })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-2", level: 0 },
          spacing: { after: 80, line: 250 },
          children: [new TextRun({ text: "Jobs en arri\u00e8re-plan : BullMQ pour les exports et g\u00e9n\u00e9rations longues", size: 22, font: "Times New Roman", color: colors.body })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-2", level: 0 },
          spacing: { after: 80, line: 250 },
          children: [new TextRun({ text: "Logging avanc\u00e9 : Int\u00e9gration Sentry pour le monitoring d'erreurs", size: 22, font: "Times New Roman", color: colors.body })]
        }),

        createSubtitle("5.3 Priorit\u00e9 Moyenne (Moyen Terme)"),
        new Paragraph({
          numbering: { reference: "numbered-3", level: 0 },
          spacing: { after: 80, line: 250 },
          children: [new TextRun({ text: "Optimisation des performances : Cache Redis, pagination c\u00f4t\u00e9 serveur, code splitting", size: 22, font: "Times New Roman", color: colors.body })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-3", level: 0 },
          spacing: { after: 80, line: 250 },
          children: [new TextRun({ text: "CI/CD Pipeline : GitHub Actions avec tests automatis\u00e9s et d\u00e9ploiement continu", size: 22, font: "Times New Roman", color: colors.body })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-3", level: 0 },
          spacing: { after: 80, line: 250 },
          children: [new TextRun({ text: "Documentation API : Swagger/OpenAPI interactif avec exemples", size: 22, font: "Times New Roman", color: colors.body })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-3", level: 0 },
          spacing: { after: 80, line: 250 },
          children: [new TextRun({ text: "Onboarding utilisateur : Tutoriels interactifs et guides de d\u00e9marrage", size: 22, font: "Times New Roman", color: colors.body })]
        }),

        new Paragraph({ spacing: { before: 200 } }),

        // Conclusion
        createTitle("6. Conclusion"),
        createBody("DataSphere Innovation est un projet techniquement solide avec une architecture innovante et des fonctionnalit\u00e9s avanc\u00e9es. Les fondations sont excellentes avec un syst\u00e8me multi-agent sophistiqu\u00e9, une infrastructure de s\u00e9curit\u00e9 entreprise et une stack technique moderne. Cependant, l'absence de tests et certaines failles de s\u00e9curit\u00e9 doivent \u00eatre adress\u00e9es imp\u00e9rativement avant toute mise en production."),
        createBody("Le projet a un fort potentiel commercial avec ses fonctionnalit\u00e9s diff\u00e9renciantes (multi-agent, conformit\u00e9 int\u00e9gr\u00e9e, visual builder). Avec un effort estim\u00e9 de 4-6 semaines pour les correctifs prioritaires et l'ajout de tests, la plateforme pourrait \u00eatre pr\u00eate pour un lancement commercial."),
        
        createStatTable([
          { value: "85%", label: "Pr\u00eat Production", color: colors.yellow },
          { value: "4-6", label: "Semaines Restantes", color: colors.blue },
          { value: "HIGH", label: "Potentiel Commercial", color: colors.green }
        ])
      ]
    }
  ]
});

// Generate document
Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/home/z/my-project/download/DataSphere_Innovation_Etat_Projet.docx", buffer);
  console.log("Document generated successfully!");
});
