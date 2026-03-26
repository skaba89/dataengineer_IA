/* eslint-disable @typescript-eslint/no-require-imports */
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, 
        Header, Footer, AlignmentType, LevelFormat, TableOfContents, HeadingLevel, 
        BorderStyle, WidthType, ShadingType, VerticalAlign, PageNumber, PageBreak } = require('docx');
const fs = require('fs');

// Color palette: Midnight Code (Tech/AI)
const colors = {
  primary: "020617",
  body: "1E293B",
  secondary: "64748B",
  accent: "94A3B8",
  tableBg: "F8FAFC"
};

const tableBorder = { style: BorderStyle.SINGLE, size: 1, color: colors.accent };
const cellBorders = { top: tableBorder, bottom: tableBorder, left: tableBorder, right: tableBorder };

// Numbering configurations for bullet lists
const numberingConfig = [];
for (let i = 1; i <= 15; i++) {
  numberingConfig.push({
    reference: `bullet-list-${i}`,
    levels: [{
      level: 0,
      format: LevelFormat.BULLET,
      text: "•",
      alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 720, hanging: 360 } } }
    }]
  });
}

// Numbered lists
for (let i = 1; i <= 10; i++) {
  numberingConfig.push({
    reference: `numbered-list-${i}`,
    levels: [{
      level: 0,
      format: LevelFormat.DECIMAL,
      text: "%1.",
      alignment: AlignmentType.LEFT,
      style: { paragraph: { indent: { left: 720, hanging: 360 } } }
    }]
  });
}

const doc = new Document({
  styles: {
    default: {
      document: {
        run: { font: "Times New Roman", size: 22 }
      }
    },
    paragraphStyles: [
      {
        id: "Title",
        name: "Title",
        basedOn: "Normal",
        run: { size: 56, bold: true, color: colors.primary, font: "Times New Roman" },
        paragraph: { spacing: { before: 240, after: 120 }, alignment: AlignmentType.CENTER }
      },
      {
        id: "Heading1",
        name: "Heading 1",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 36, bold: true, color: colors.primary, font: "Times New Roman" },
        paragraph: { spacing: { before: 400, after: 200 }, outlineLevel: 0 }
      },
      {
        id: "Heading2",
        name: "Heading 2",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 28, bold: true, color: colors.body, font: "Times New Roman" },
        paragraph: { spacing: { before: 300, after: 150 }, outlineLevel: 1 }
      },
      {
        id: "Heading3",
        name: "Heading 3",
        basedOn: "Normal",
        next: "Normal",
        quickFormat: true,
        run: { size: 24, bold: true, color: colors.secondary, font: "Times New Roman" },
        paragraph: { spacing: { before: 200, after: 100 }, outlineLevel: 2 }
      }
    ]
  },
  numbering: { config: numberingConfig },
  sections: [
    // COVER PAGE
    {
      properties: {
        page: { margin: { top: 0, bottom: 0, left: 0, right: 0 } }
      },
      children: [
        new Paragraph({ spacing: { before: 6000 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "AI DATA ENGINEERING SYSTEM", bold: true, size: 72, color: colors.primary, font: "Times New Roman" })]
        }),
        new Paragraph({ spacing: { before: 400 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Systeme Multi-Agents pour la Vente et l'Execution", size: 32, color: colors.secondary, font: "Times New Roman" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "de Projets Data Engineering", size: 32, color: colors.secondary, font: "Times New Roman" })]
        }),
        new Paragraph({ spacing: { before: 2000 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Strategie Commerciale & Architecture Technique", size: 28, color: colors.body, font: "Times New Roman" })]
        }),
        new Paragraph({ spacing: { before: 4000 } }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: "Document Strategique", italics: true, size: 24, color: colors.secondary, font: "Times New Roman" })]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          children: [new TextRun({ text: new Date().toLocaleDateString('fr-FR', { year: 'numeric', month: 'long', day: 'numeric' }), size: 24, color: colors.secondary, font: "Times New Roman" })]
        })
      ]
    },
    // MAIN CONTENT
    {
      properties: {
        page: { margin: { top: 1800, bottom: 1440, left: 1440, right: 1440 } }
      },
      headers: {
        default: new Header({
          children: [new Paragraph({
            alignment: AlignmentType.RIGHT,
            children: [new TextRun({ text: "AI Data Engineering System | Document Strategique", size: 18, color: colors.secondary, font: "Times New Roman" })]
          })]
        })
      },
      footers: {
        default: new Footer({
          children: [new Paragraph({
            alignment: AlignmentType.CENTER,
            children: [
              new TextRun({ text: "Page ", size: 18, color: colors.secondary }),
              new TextRun({ children: [PageNumber.CURRENT], size: 18, color: colors.secondary }),
              new TextRun({ text: " sur ", size: 18, color: colors.secondary }),
              new TextRun({ children: [PageNumber.TOTAL_PAGES], size: 18, color: colors.secondary })
            ]
          })]
        })
      },
      children: [
        // TOC
        new TableOfContents("Table des Matieres", { hyperlink: true, headingStyleRange: "1-3" }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 300 },
          children: [new TextRun({ text: "Note: Cliquez droit sur la table des matieres et selectionnez \"Mettre a jour le champ\" pour actualiser les numeros de page.", size: 18, color: "999999", italics: true })]
        }),
        new Paragraph({ children: [new PageBreak()] }),

        // SECTION 1: OFFRE
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("1. Definition de l'Offre")] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.1 Vision et Proposition de Valeur")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "L'AI Data Engineering System represente une innovation majeure dans le domaine du data engineering en tant que service. Notre proposition de valeur fondamentale repose sur l'automatisation intelligente de l'ensemble du cycle de vie des donnees, de la decouverte des sources jusqu'a la generation d'insights metier exploitables. Contrairement aux approches traditionnelles qui necessitent des equipes de data engineers, data architects et analysts travaillant en silos, notre systeme multi-agents coordonne automatiquement ces competences pour livrer des projets complets en une fraction du temps habituel.", size: 22, color: colors.body })]
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "La valeur ajoutee pour nos clients se manifeste a travers plusieurs dimensions essentielles. Premierement, la reduction drastique des delais de mise en oeuvre, passant de plusieurs mois a quelques semaines pour des projets de complexite equivalente. Deuxiemement, la standardisation des bonnes pratiques data engineering garantit une qualite et une maintenabilite optimales de l'infrastructure. Troisiemement, l'approche orientee resultat permet aux equipes metier de se concentrer sur l'analyse et la prise de decision plutot que sur la construction et la maintenance de pipelines de donnees.", size: 22, color: colors.body })]
        }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.2 Capacites Cles du Systeme")] }),
        new Paragraph({
          spacing: { after: 100 },
          children: [new TextRun({ text: "Notre systeme offre un ensemble complet de capacites couvrant l'integralite du spectre du data engineering moderne. Ces capacites sont implementees a travers des agents specialises qui collaborent de maniere transparente pour atteindre les objectifs du client.", size: 22, color: colors.body })]
        }),
        
        new Paragraph({
          numbering: { reference: "bullet-list-1", level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: "Discovery & Assessment : Analyse automatique de l'existant technique, cartographie des sources de donnees, evaluation de la maturite data de l'organisation, et identification des quick wins a haute valeur ajoutee.", size: 22, color: colors.body })]
        }),
        new Paragraph({
          numbering: { reference: "bullet-list-1", level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: "Architecture Design : Conception d'architectures data modernes adaptees au contexte client, incluant le choix des technologies, la modelisation des donnees, et les patterns d'integration optimaux.", size: 22, color: colors.body })]
        }),
        new Paragraph({
          numbering: { reference: "bullet-list-1", level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: "Pipeline Generation : Generation automatique de pipelines ETL/ELT robustes avec gestion des erreurs, monitoring, et documentation integree. Support des frameworks modernes comme Apache Airflow, dbt, et Dagster.", size: 22, color: colors.body })]
        }),
        new Paragraph({
          numbering: { reference: "bullet-list-1", level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: "Data Transformation : Implementation des transformations metier complexes via SQL avance ou frameworks comme Spark, avec optimisation automatique des performances et gestion de la qualite des donnees.", size: 22, color: colors.body })]
        }),
        new Paragraph({
          numbering: { reference: "bullet-list-1", level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: "Business Intelligence : Creation de dashboards interactifs et de rapports automatises alignes sur les KPIs metier, avec support des principales plateformes BI du marche.", size: 22, color: colors.body })]
        }),
        new Paragraph({
          numbering: { reference: "bullet-list-1", level: 0 },
          spacing: { after: 200 },
          children: [new TextRun({ text: "Conversational Analytics : Interface en langage naturel permettant aux utilisateurs non-techniques d'interroger les donnees et d'obtenir des insights instantanes sans connaissance SQL.", size: 22, color: colors.body })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("1.3 Differentiateurs Concurrentiels")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "Notre positionnement sur le marche se distingue par trois facteurs cles qui creent une barriere a l'entree significative pour les concurrents potentiels. L'approche multi-agents permet une specialisation profonde de chaque composant tout en maintenant une coherence globale impossible a atteindre avec des outils monolithiques. L'integration native des capacites de vente et d'execution dans un seul systeme elimine les frictions traditionnelles entre les equipes commerciales et techniques. Enfin, notre methodologie de productization permet de capitaliser sur chaque projet pour enrichir automatiquement notre base de connaissances et nos templates reutilisables.", size: 22, color: colors.body })]
        }),

        // SECTION 2: SECTEURS CIBLES
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("2. Secteurs Cibles et Personas")] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.1 Analyse des Marches Verticaux")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "Notre strategie go-to-market privilegie une approche verticale permettant d'adapter notre offre aux specificites sectorielles. Cette specialisation nous permet de developper des templates, des modeles de donnees et des KPIs pre-definis qui accelerent considerablement le time-to-value pour nos clients. L'analyse approfondie de chaque secteur revele des opportunites differenciees en termes de maturite data, de budget disponible, et de complexite technique.", size: 22, color: colors.body })]
        }),

        // Table secteurs
        new Table({
          alignment: AlignmentType.CENTER,
          columnWidths: [2500, 2500, 2500, 2500],
          margins: { top: 100, bottom: 100, left: 150, right: 150 },
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Secteur", bold: true, size: 20 })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Maturite Data", bold: true, size: 20 })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Budget Moyen", bold: true, size: 20 })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, verticalAlign: VerticalAlign.CENTER, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Priorite", bold: true, size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Retail & E-commerce", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Moyenne", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "50-150K EUR", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Haute", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Sante & Pharmacie", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Faible-Moyenne", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "100-300K EUR", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Moyenne", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Finance & Assurance", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Haute", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "150-500K EUR", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Haute", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Industrie & Manufacturing", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Faible", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "75-200K EUR", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Moyenne", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Logistique & Transport", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Moyenne", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "60-180K EUR", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Haute", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "SaaS & Tech", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Haute", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "40-120K EUR", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, verticalAlign: VerticalAlign.CENTER, width: { size: 2500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Haute", size: 20 })] })] })
              ]
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 300 },
          children: [new TextRun({ text: "Tableau 1 : Analyse des secteurs cibles par maturite, budget et priorite strategique", size: 18, italics: true, color: colors.secondary })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("2.2 Personas et Decideurs Cles")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "La comprehension approfondie de nos personas cibles est essentielle pour adapter notre discours commercial et notre proposition de valeur. Chaque persona possede des preoccupations, des metriques de succes et des parcours de decision distincts que notre systeme doit adresser de maniere personnalisee.", size: 22, color: colors.body })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Chief Data Officer (CDO)")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "Le CDO represente notre interlocuteur privilegie dans les organisations dotees d'une fonction data mature. Ses preoccupations principales incluent la demonstration du ROI des initiatives data, l'industrialisation des cas d'usage analytiques, et la construction d'une culture data-driven au sein de l'organisation. Notre systeme repond a ces enjeux par une approche structuree de mesure d'impact, des livrables standardises et une documentation exhaustive facilitant le transfert de connaissances. Le CDO est generalement le sponsor budgetaire pour les projets superieurs a 100K EUR et dispose d'une equipe technique qu'il souhaite voir operer sur des taches a plus haute valeur ajoutee que l'ecriture de pipelines ETL.", size: 22, color: colors.body })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Chief Technology Officer (CTO)")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "Le CTO intervient principalement dans les organisations technologiques ou lorsque le projet data s'inscrit dans une transformation IT plus large. Ses criteres de decision incluent la compatibilite avec l'ecosysteme technologique existant, les performances et la scalabilite de la solution, ainsi que la maintenabilite a long terme. Notre approche multi-agents et notre capacite a generer du code documente et versionne repondent directement a ces preoccupations. Le CTO evalue egalement les risques de vendor lock-in, ce qui nous pousse a privilegier des technologies open-source et des architectures modulaires permettant une evolution autonome apres la livraison.", size: 22, color: colors.body })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Directeur Financier (CFO)")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "Le CFO devient decideur principal lorsque l'investissement depasse 150K EUR ou dans les organisations ou la fonction finance pilote les initiatives de transformation. Son langage est celui du business case, du payback period et du total cost of ownership. Notre agent Pricing/Offer est specifiquement concu pour generer des propositions chiffrees avec des scenarios ROI qui parlent au CFO. La transparence sur les couts recurents d'infrastructure et la clarte sur les economies generees par l'automatisation sont des arguments cles pour ce persona.", size: 22, color: colors.body })]
        }),

        // SECTION 3: PACKAGES
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("3. Definition des Packages Tarifaires")] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.1 Philosophie de Pricing")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "Notre strategie de pricing repose sur trois principes fondamentaux qui guident la conception de chaque offre. Premierement, l'alignement valeur-prix garantit que chaque package delivre un ROI mesurable pour le client, avec des points de controle clairs permettant de valider la progression. Deuxiemement, la progressivite permet aux clients d'entrer dans notre ecosysteme a un niveau de risque maitrise avant de monter en gamme. Troisiemement, la transparence elimine les surprises budgetaires grace a des forfaits tout inclus sauf exceptions clairement documentees.", size: 22, color: colors.body })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.2 Package Starter : Data Foundation")] }),
        new Table({
          alignment: AlignmentType.CENTER,
          columnWidths: [5000, 5000],
          margins: { top: 100, bottom: 100, left: 150, right: 150 },
          rows: [
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Caracteristique", bold: true, size: 20 })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Description", bold: true, size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Prix", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "25 000 EUR - 40 000 EUR", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Duree", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "4 a 6 semaines", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Sources de donnees", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Jusqu'a 5 sources", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Pipelines", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Jusqu'a 10 pipelines ETL", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Dashboards", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "1 a 3 dashboards", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Support", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "30 jours post-livraison", size: 20 })] })] })
              ]
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 300 },
          children: [new TextRun({ text: "Tableau 2 : Detail du package Starter - Data Foundation", size: 18, italics: true, color: colors.secondary })]
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "Le package Starter s'adresse aux PME et aux departements d'entreprises plus grandes souhaitant initier leur transformation data. Ce niveau d'entree permet de demontrer la valeur de notre approche sur un perimetre circonscrit, typiquement un domaine fonctionnel comme les ventes, le marketing ou les operations. L'architecture deployee est concue pour evoluer vers les packages superieurs sans refonte majeure, creant ainsi un chemin de croissance naturel pour nos clients.", size: 22, color: colors.body })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.3 Package Professional : Data Platform")] }),
        new Table({
          alignment: AlignmentType.CENTER,
          columnWidths: [5000, 5000],
          margins: { top: 100, bottom: 100, left: 150, right: 150 },
          rows: [
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Caracteristique", bold: true, size: 20 })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Description", bold: true, size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Prix", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "75 000 EUR - 150 000 EUR", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Duree", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "8 a 14 semaines", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Sources de donnees", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Jusqu'a 20 sources", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Pipelines", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Jusqu'a 50 pipelines avec orchestration", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Data Warehouse", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Modelisation complete (3 tiers)", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Dashboards", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "5 a 15 dashboards thematiques", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Conversational Analytics", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Interface NL incluse", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Support", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "90 jours + SLA optionnel", size: 20 })] })] })
              ]
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 300 },
          children: [new TextRun({ text: "Tableau 3 : Detail du package Professional - Data Platform", size: 18, italics: true, color: colors.secondary })]
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "Le package Professional constitue notre offre phare, representant environ 60% de notre chiffre d'affaires cible. Il s'adresse aux ETI et aux directions metiers d'entreprises du CAC40 souhaitant deployer une plateforme data complete sur un perimetre fonctionnel etendu. L'inclusion de l'interface Conversational Analytics differencie significativement notre proposition en democratisant l'acces aux donnees pour les utilisateurs non-techniques.", size: 22, color: colors.body })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("3.4 Package Enterprise : Data Organization")] }),
        new Table({
          alignment: AlignmentType.CENTER,
          columnWidths: [5000, 5000],
          margins: { top: 100, bottom: 100, left: 150, right: 150 },
          rows: [
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Caracteristique", bold: true, size: 20 })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Description", bold: true, size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Prix", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "200 000 EUR - 500 000 EUR", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Duree", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "4 a 8 mois", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Sources de donnees", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Illimite", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Architecture", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Data Mesh / Lakehouse enterprise", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Gouvernance", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Catalogue data + lignee complete", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Self-Service", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Portail data self-service complet", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Formation", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Programme de formation inclus", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Support", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "12 mois + SLA enterprise", size: 20 })] })] })
              ]
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 300 },
          children: [new TextRun({ text: "Tableau 4 : Detail du package Enterprise - Data Organization", size: 18, italics: true, color: colors.secondary })]
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "Le package Enterprise s'adresse aux grandes organisations souhaitant transformer leur approche data de maniere systemique. Il inclut la mise en place d'une architecture Data Mesh permettant une decentralisation de la propriete des donnees, un catalogue data complet avec lignee automatisee, et un programme de formation pour accompagner la transformation culturelle. Ce package genere des revenus recurents significatifs via les SLAs enterprise et les extensions de support.", size: 22, color: colors.body })]
        }),

        // SECTION 4: ARCHITECTURE MVP
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("4. Architecture MVP du Systeme")] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.1 Vue d'Ensemble de l'Architecture")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "L'architecture de l'AI Data Engineering System repose sur une approche modulaire et evenementielle permettant une scalabilite horizontale et une evolution independante de chaque composant. Le systeme est concu pour s'executer dans un environnement cloud-native, avec une preference pour Kubernetes comme couche d'orchestration. L'architecture separe clairement trois couches : la couche d'orchestration des agents, la couche de generation de code et d'assets, et la couche d'execution client.", size: 22, color: colors.body })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.2 Stack Technologique Core")] }),
        new Table({
          alignment: AlignmentType.CENTER,
          columnWidths: [3000, 3000, 4000],
          margins: { top: 100, bottom: 100, left: 150, right: 150 },
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Composant", bold: true, size: 20 })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Technologie", bold: true, size: 20 })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 4000, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Justification", bold: true, size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Agent Framework", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "LangGraph + LangChain", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 4000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Orchestration stateful des workflows agents", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "LLM Primary", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "GPT-4o / Claude 3.5", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 4000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Raisonnement complexe et generation de code", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Vector Store", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Pinecone / Qdrant", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 4000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "RAG sur templates et documentation", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Backend API", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "FastAPI (Python)", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 4000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Performance async et ecosysteme data", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Database", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "PostgreSQL + Redis", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 4000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Etat persistant et cache des sessions", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Frontend", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Next.js 15 + React", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 4000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Interface utilisateur moderne et SEO", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Code Execution", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Sandboxes (E2B)", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 4000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Execution securisee du code genere", size: 20 })] })] })
              ]
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 300 },
          children: [new TextRun({ text: "Tableau 5 : Stack technologique core du systeme MVP", size: 18, italics: true, color: colors.secondary })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("4.3 Architecture de Donnees et Stockage")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "Le systeme manipule plusieurs categories de donnees necessitant des strategies de stockage distinctes. Les donnees de configuration des projets et les metadonnees sont stockees dans PostgreSQL avec un schema relationnel optimise pour les requetes analytiques. Les artefacts generes (code, documentation, configurations) sont versions dans un depot Git dedie a chaque projet client. Les embeddings vectoriels pour la recherche semantique sont stockes dans Pinecone avec une separation stricte par namespace client pour garantir la confidentialite.", size: 22, color: colors.body })]
        }),

        // SECTION 5: WORKFLOW MULTI-AGENTS
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("5. Workflow Multi-Agents")] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.1 Architecture des Agents")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "Le systeme multi-agents est organise selon un modele hierarchique avec un agent orchestrateur central coordonnant l'activite des agents specialises. Cette architecture permet une separation claire des responsabilites tout en maintenant une coherence globale dans l'execution des projets. Chaque agent dispose de son propre contexte, de ses outils specialises et de sa base de connaissances sectorielle.", size: 22, color: colors.body })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Agent Business (Strategic Orchestrator)")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "L'agent Business agit comme le cerveau strategique du systeme. Il est responsable de l'analyse initiale des besoins clients, de la qualification des opportunites et de l'alignement entre les attentes metier et les capacites techniques. Il maintient une vue d'ensemble du projet et prend les decisions d'arbitrage entre differentes approches possibles. Ses outils incluent l'analyse de documents d'entree, la generation de business cases et la communication avec les decideurs clients.", size: 22, color: colors.body })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Agent Sales (Revenue Generator)")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "L'agent Sales pilote l'ensemble du cycle commercial, de la prospection initiale a la signature du contrat. Il utilise les donnees de marche et les signaux d'achat pour qualifier les leads, genere des propositions commerciales personnalisees et gere les objections. Integre avec les outils CRM et d'automatisation marketing, il maintient un pipeline previsionnel et assure le suivi des opportunites jusqu'a conversion.", size: 22, color: colors.body })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Agent Discovery (Data Archaeologist)")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "L'agent Discovery explore et cartographie l'ecosysteme de donnees du client. Il se connecte aux differentes sources de donnees pour analyser leur structure, leur qualite et leur volume. Il genere un inventaire complet des donnees disponibles, identifie les relations entre les sources et evalue les contraintes techniques. Ses capacites incluent l'analyse de schemas de bases de donnees, l'echantillonnage de donnees et la detection automatique de patterns de qualite.", size: 22, color: colors.body })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Agent Architecture (Blueprint Designer)")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "L'agent Architecture concoit la solution technique optimale en fonction du contexte client. Il evalue les differentes options technologiques, recommande une architecture cible et definit les patterns d'integration. Il produit des diagrammes d'architecture detailles, des specifications techniques et des estimations d'infrastructure. Sa base de connaissances integre les best practices des principaux frameworks data et les retours d'experience des projets precedents.", size: 22, color: colors.body })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Agent Pipeline (Flow Builder)")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "L'agent Pipeline genere le code des pipelines de donnees selon les specifications architecturales. Il produit des DAGs Airflow, des transformations dbt ou des scripts Spark selon le contexte. Il implemente automatiquement les patterns de resilience (retry, dead letter queue), les mecanismes de quality gates et les hooks de monitoring. Chaque pipeline genere est documente, teste et versionne selon les standards DevOps.", size: 22, color: colors.body })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Agent Transformation (Data Alchemist)")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "L'agent Transformation implemente les logiques de transformation des donnees brutes en insights metier. Il traduit les regles metier en code SQL ou Python optimise, gere les evolutions de schema et implemente les controles de qualite. Il optimise automatiquement les performances des requetes et s'adapte aux specificites du moteur d'execution cible (Snowflake, BigQuery, Databricks).", size: 22, color: colors.body })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Agent BI (Visual Storyteller)")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "L'agent BI cree les visualisations et dashboards qui rendent les donnees accessibles aux utilisateurs finaux. Il recommande les KPIs pertinents en fonction du secteur et des objectifs metier, genere les configurations de dashboards pour les principaux outils BI et implemente les mecanismes d'actualisation automatique. Il s'assure que les visualisations respectent les bonnes pratiques d'UX data et d'accessibilite.", size: 22, color: colors.body })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Agent Conversational Analytics (Query Translator)")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "L'agent Conversational Analytics permet aux utilisateurs d'interroger les donnees en langage naturel. Il traduit les questions metier en requetes SQL optimisees, contextualise les reponses avec des visualisations appropriees et gere les demandes de clarification. Il apprend continuellement des interactions pour ameliorer sa comprehension du vocabulaire metier specifique au client.", size: 22, color: colors.body })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Agent Pricing/Offer (Value Architect)")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "L'agent Pricing/Offer elabore les propositions commerciales chiffrees. Il estime l'effort en fonction de la complexite detectee, calcule les couts d'infrastructure recurents et genere des scenarios ROI pour le client. Il adapte automatiquement le niveau de detail de la proposition au persona du decideur et integre les clauses contractuelles standard.", size: 22, color: colors.body })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Agent Productization (Knowledge Evangelist)")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "L'agent Productization capitalise sur les projets livres pour enrichir le systeme. Il identifie les patterns reutilisables, extrait les templates de code generique et met a jour la base de connaissances sectorielle. Il assure que chaque projet contribue a l'amelioration continue du systeme et genere des actifs commercialisables (case studies, best practices).", size: 22, color: colors.body })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("5.2 Flux d'Execution Typique")] }),
        new Paragraph({
          spacing: { after: 100 },
          children: [new TextRun({ text: "L'execution d'un projet suit un flux sequentiel avec des boucles de validation aux points cles. Chaque phase produit des livrables intermediaires soumis a validation avant passage a la phase suivante.", size: 22, color: colors.body })]
        }),

        new Paragraph({
          numbering: { reference: "numbered-list-1", level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: "Phase d'Engagement : L'agent Sales qualifie le lead et l'agent Business analyse les besoins. L'agent Discovery realise une premiere evaluation du contexte data.", size: 22, color: colors.body })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-list-1", level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: "Phase de Conception : L'agent Architecture propose une solution. L'agent Pricing/Offer genere la proposition commerciale. Validation client et signature.", size: 22, color: colors.body })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-list-1", level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: "Phase de Construction : Les agents Pipeline et Transformation generent les actifs techniques. Tests et validation de qualite automatisee.", size: 22, color: colors.body })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-list-1", level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: "Phase de Valorisation : L'agent BI cree les dashboards. L'agent Conversational Analytics configure l'interface NL.", size: 22, color: colors.body })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-list-1", level: 0 },
          spacing: { after: 200 },
          children: [new TextRun({ text: "Phase de Cloture : Documentation finale, transfert de connaissances. L'agent Productization extrait les enseignements reutilisables.", size: 22, color: colors.body })]
        }),

        // SECTION 6: PLAN DE PROSPECTION
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("6. Plan de Prospection")] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.1 Strategie Outbound")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "La strategie outbound repose sur une approche multi-canal ciblant les decideurs identifies dans chaque secteur prioritaire. Nous combinons la prospection telefonique, l'email sequencing personnalise et l'engagement social media pour maximiser les points de contact avec les prospects qualifies. Chaque sequence de prospection est orchestree par l'agent Sales qui adapte le message en fonction des signaux d'interet et du stade de maturite du prospect.", size: 22, color: colors.body })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Canaux Prioritaires")] }),
        new Paragraph({
          numbering: { reference: "bullet-list-2", level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: "LinkedIn Sales Navigator : Identification et engagement avec les CDO, CTO et Directeurs Data des entreprises cibles. Publication de contenu expert pour etablir l'autorite.", size: 22, color: colors.body })]
        }),
        new Paragraph({
          numbering: { reference: "bullet-list-2", level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: "Email Sequences : Sequences de 5-7 emails personnalises avec des cas d'usage concrets du secteur du prospect. A/B testing continu des sujets et contenus.", size: 22, color: colors.body })]
        }),
        new Paragraph({
          numbering: { reference: "bullet-list-2", level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: "Cold Calling : Appels de prospection sur les leads chauds identifies par engagement digital. Script adaptatif selon le persona et les signaux d'interet.", size: 22, color: colors.body })]
        }),
        new Paragraph({
          numbering: { reference: "bullet-list-2", level: 0 },
          spacing: { after: 200 },
          children: [new TextRun({ text: "Evenements et Conferences : Participation aux evenements data majeurs (DataCraft, DataXDays, etc.). Organisation de webinaires thématiques.", size: 22, color: colors.body })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.2 Strategie Inbound")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "La strategie inbound vise a attirer des prospects qualifies via du contenu a haute valeur ajoutee demontrant notre expertise. L'objectif est de positionner l'AI Data Engineering System comme la reference en matiere d'automatisation du data engineering. Le contenu est optimise pour le SEO et distribue sur les canaux ou nos personas cherchent des solutions a leurs problematiques data.", size: 22, color: colors.body })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun("Piliers de Contenu")] }),
        new Paragraph({
          numbering: { reference: "bullet-list-3", level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: "Blog Technique : Articles approfondis sur les patterns d'architecture data, les benchmarks technologiques et les retours d'experience.", size: 22, color: colors.body })]
        }),
        new Paragraph({
          numbering: { reference: "bullet-list-3", level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: "Case Studies : Etudes de cas detaillees avec metriques de ROI, architecture deployee et temoignages clients.", size: 22, color: colors.body })]
        }),
        new Paragraph({
          numbering: { reference: "bullet-list-3", level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: "Outils Gratuits : Calculateurs de ROI, templates de specifications data, checklists de gouvernance.", size: 22, color: colors.body })]
        }),
        new Paragraph({
          numbering: { reference: "bullet-list-3", level: 0 },
          spacing: { after: 200 },
          children: [new TextRun({ text: "Webinaires et Livres Blancs : Contenus premium necessitant inscription pour capture de leads.", size: 22, color: colors.body })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("6.3 Objectifs et KPIs Commerciaux")] }),
        new Table({
          alignment: AlignmentType.CENTER,
          columnWidths: [3333, 3333, 3333],
          margins: { top: 100, bottom: 100, left: 150, right: 150 },
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 3333, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Metrique", bold: true, size: 20 })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 3333, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "M6", bold: true, size: 20 })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 3333, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "M12", bold: true, size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 3333, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Leads qualifies / mois", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3333, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "20", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3333, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "50", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 3333, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Opportunites creees / mois", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3333, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "5", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3333, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "15", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 3333, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Taux de conversion Lead -> Opp", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3333, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "25%", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3333, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "30%", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 3333, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Deals signes / trimestre", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3333, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "3", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3333, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "8", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 3333, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Panier moyen", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3333, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "80K EUR", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3333, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "120K EUR", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 3333, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "ARR cible", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3333, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "240K EUR", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 3333, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "1M EUR", size: 20 })] })] })
              ]
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 300 },
          children: [new TextRun({ text: "Tableau 6 : Objectifs commerciaux a 6 et 12 mois", size: 18, italics: true, color: colors.secondary })]
        }),

        // SECTION 7: BACKLOG
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("7. Backlog de Construction du Produit")] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("7.1 Phase 1 : Foundation (S1-S4)")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "La phase Foundation etablit les infrastructures techniques et les fondations du systeme multi-agents. Cette phase est critique car elle definit les patterns d'architecture qui seront reutilises tout au long du developpement. L'objectif est d'obtenir un socle fonctionnel permettant d'integrer progressivement les agents specialises.", size: 22, color: colors.body })]
        }),

        new Table({
          alignment: AlignmentType.CENTER,
          columnWidths: [1500, 5500, 1500, 1500],
          margins: { top: 100, bottom: 100, left: 150, right: 150 },
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "ID", bold: true, size: 18 })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 5500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "User Story", bold: true, size: 18 })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Priorite", bold: true, size: 18 })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Effort", bold: true, size: 18 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "F-01", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Setup infrastructure Kubernetes + CI/CD", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "P0", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "5 pts", size: 18 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "F-02", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Framework multi-agents LangGraph de base", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "P0", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "8 pts", size: 18 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "F-03", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Base de donnees PostgreSQL + migrations", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "P0", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "3 pts", size: 18 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "F-04", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "API FastAPI avec authentification JWT", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "P0", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "5 pts", size: 18 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "F-05", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Vector store Pinecone avec namespace par client", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "P0", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "3 pts", size: 18 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "F-06", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Frontend Next.js avec design system de base", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "P1", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "5 pts", size: 18 })] })] })
              ]
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 300 },
          children: [new TextRun({ text: "Tableau 7 : Backlog Phase 1 - Foundation", size: 18, italics: true, color: colors.secondary })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("7.2 Phase 2 : Core Agents (S5-S10)")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "La phase Core Agents developpe les agents essentiels au fonctionnement du systeme. L'agent Discovery et l'agent Architecture sont prioritaires car ils constituent le point d'entree de tout projet. L'agent Pipeline vient ensuite pour valider la capacite du systeme a generer du code executable.", size: 22, color: colors.body })]
        }),

        new Table({
          alignment: AlignmentType.CENTER,
          columnWidths: [1500, 5500, 1500, 1500],
          margins: { top: 100, bottom: 100, left: 150, right: 150 },
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "ID", bold: true, size: 18 })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 5500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "User Story", bold: true, size: 18 })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Priorite", bold: true, size: 18 })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Effort", bold: true, size: 18 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "C-01", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Agent Discovery - Connexion sources de donnees", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "P0", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "8 pts", size: 18 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "C-02", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Agent Discovery - Analyse de schemas automatique", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "P0", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "5 pts", size: 18 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "C-03", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Agent Architecture - Recommandation technologique", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "P0", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "8 pts", size: 18 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "C-04", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Agent Pipeline - Generation DAG Airflow", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "P0", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "8 pts", size: 18 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "C-05", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Agent Transformation - Generation SQL dbt", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "P1", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "8 pts", size: 18 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "C-06", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Sandbox E2B pour execution code securisee", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "P0", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "5 pts", size: 18 })] })] })
              ]
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 300 },
          children: [new TextRun({ text: "Tableau 8 : Backlog Phase 2 - Core Agents", size: 18, italics: true, color: colors.secondary })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("7.3 Phase 3 : Business Layer (S11-S16)")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "La phase Business Layer integre les agents orientes valeur metier et commercialisation. L'agent BI et l'agent Conversational Analytics transforment les donnees en insights accessibles. L'agent Sales et Pricing complete la boucle commerciale.", size: 22, color: colors.body })]
        }),

        new Table({
          alignment: AlignmentType.CENTER,
          columnWidths: [1500, 5500, 1500, 1500],
          margins: { top: 100, bottom: 100, left: 150, right: 150 },
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "ID", bold: true, size: 18 })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 5500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "User Story", bold: true, size: 18 })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Priorite", bold: true, size: 18 })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Effort", bold: true, size: 18 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "B-01", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Agent BI - Generation dashboards Looker/Tableau", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "P1", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "8 pts", size: 18 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "B-02", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Agent Conversational Analytics - Text-to-SQL", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "P1", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "8 pts", size: 18 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "B-03", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Agent Pricing - Estimation automatique projets", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "P1", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "5 pts", size: 18 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "B-04", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Agent Sales - Qualification leads automatisee", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "P2", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "5 pts", size: 18 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "B-05", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 5500, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Agent Productization - Extraction templates", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "P2", size: 18 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 1500, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "5 pts", size: 18 })] })] })
              ]
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 300 },
          children: [new TextRun({ text: "Tableau 9 : Backlog Phase 3 - Business Layer", size: 18, italics: true, color: colors.secondary })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("7.4 Roadmap Synthetique")] }),
        new Table({
          alignment: AlignmentType.CENTER,
          columnWidths: [2000, 4000, 4000],
          margins: { top: 100, bottom: 100, left: 150, right: 150 },
          rows: [
            new TableRow({
              tableHeader: true,
              children: [
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 2000, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Phase", bold: true, size: 20 })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 4000, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Livrables Cles", bold: true, size: 20 })] })] }),
                new TableCell({ borders: cellBorders, shading: { fill: colors.tableBg, type: ShadingType.CLEAR }, width: { size: 4000, type: WidthType.DXA }, children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ text: "Milestone", bold: true, size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 2000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Phase 1 (M1-M2)", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 4000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Infrastructure, Framework agents, API, DB", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 4000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "MVP technique fonctionnel", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 2000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Phase 2 (M3-M4)", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 4000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Agents Discovery, Architecture, Pipeline", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 4000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Premier projet pilote livrable", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 2000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Phase 3 (M5-M6)", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 4000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Agents BI, Conversational, Pricing", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 4000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Produit commercialisable", size: 20 })] })] })
              ]
            }),
            new TableRow({
              children: [
                new TableCell({ borders: cellBorders, width: { size: 2000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Phase 4 (M7+)", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 4000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Scaling, Agents Sales, Productization", size: 20 })] })] }),
                new TableCell({ borders: cellBorders, width: { size: 4000, type: WidthType.DXA }, children: [new Paragraph({ children: [new TextRun({ text: "Croissance commerciale", size: 20 })] })] })
              ]
            })
          ]
        }),
        new Paragraph({
          alignment: AlignmentType.CENTER,
          spacing: { before: 100, after: 300 },
          children: [new TextRun({ text: "Tableau 10 : Roadmap synthetique du developpement", size: 18, italics: true, color: colors.secondary })]
        }),

        // CONCLUSION
        new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun("8. Synthese et Prochaines Actions")] }),
        
        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("8.1 Recapitulatif Executif")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "L'AI Data Engineering System represente une opportunite strategique majeure de creer un business recurrent dans un marche en forte croissance. Le positionnement unique combinant automatisation intelligente et approche multi-agents permet de differencier significativement notre offre des solutions existantes. Les packages tarifaires sont concus pour maximiser la valeur percue tout en garantissant des marges saines a partir du premier projet.", size: 22, color: colors.body })]
        }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "L'architecture technique MVP est dimensionnee pour supporter une croissance rapide tout en maintenant les couts d'infrastructure sous controle. Le choix de technologies matures comme LangGraph, PostgreSQL et Next.js garantit la stabilite et la maintenabilite du systeme. L'approche modulaire permet une evolution independante de chaque agent sans risque de regression.", size: 22, color: colors.body })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("8.2 Actions Immediates (Semaine 1-2)")] }),
        new Paragraph({
          numbering: { reference: "numbered-list-2", level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: "Valider le pitch commercial avec 5 prospects qualifies pour affiner la proposition de valeur et identifier les objections frequentes.", size: 22, color: colors.body })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-list-2", level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: "Initialiser le repository de code avec la structure de base LangGraph et l'architecture multi-agents.", size: 22, color: colors.body })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-list-2", level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: "Creer les templates de contenu inbound : landing page, premier article blog, post LinkedIn.", size: 22, color: colors.body })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-list-2", level: 0 },
          spacing: { after: 80 },
          children: [new TextRun({ text: "Definir le premier projet pilote interne pour valider le workflow end-to-end des agents Discovery, Architecture et Pipeline.", size: 22, color: colors.body })]
        }),
        new Paragraph({
          numbering: { reference: "numbered-list-2", level: 0 },
          spacing: { after: 200 },
          children: [new TextRun({ text: "Etablir les metriques de suivi et le dashboard de pilotage commercial et technique.", size: 22, color: colors.body })]
        }),

        new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun("8.3 Indicateurs de Succes a 3 Mois")] }),
        new Paragraph({
          spacing: { after: 200 },
          children: [new TextRun({ text: "Le succes a court terme se mesure a travers plusieurs indicateurs cles. Cote commercial, l'objectif est d'avoir signe au moins 2 projets Starter et d'avoir un pipeline de 10 opportunites qualifiees. Cote produit, le systeme doit etre capable de livrer un projet complet de decouverte a dashboard sans intervention humaine significative. La satisfaction client mesuree par NPS doit atteindre au moins 40, temoignant d'une valeur delivree superieure aux attentes.", size: 22, color: colors.body })]
        })
      ]
    }
  ]
});

Packer.toBuffer(doc).then(buffer => {
  fs.writeFileSync("/home/z/my-project/download/AI_Data_Engineering_System_Strategie.docx", buffer);
  console.log("Document genere avec succes!");
});
