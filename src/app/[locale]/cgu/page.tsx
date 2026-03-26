'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  CheckCircle,
  Users,
  Database,
  Lock,
  AlertTriangle,
  FileText,
  Edit,
  Scale,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CGUPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Retour
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold text-gray-900">Conditions Générales d&apos;Utilisation</h1>
            <p className="text-sm text-gray-500">DataSphere Innovation SAS</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200 mb-4">
            Version 1.0 - Janvier 2025
          </Badge>
          <p className="text-gray-600">
            Les présentes conditions générales d&apos;utilisation (CGU) définissent les règles d&apos;accès et 
            d&apos;utilisation de la plateforme DataSphere Innovation.
          </p>
        </div>

        <ScrollArea className="h-[calc(100vh-220px)]">
          <div className="space-y-6 pr-4">
            {/* Section 1: Acceptation des conditions */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>1. Acceptation des Conditions</CardTitle>
                    <CardDescription>Validation des termes d&apos;utilisation</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">1.1 Accord juridique</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    L&apos;accès et l&apos;utilisation de la plateforme DataSphere Innovation impliquent l&apos;acceptation 
                    pleine et entière des présentes Conditions Générales d&apos;Utilisation (CGU). Si vous n&apos;acceptez 
                    pas ces conditions, vous ne devez pas utiliser nos services.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">1.2 Capacité juridique</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    L&apos;utilisation de nos services est réservée aux personnes morales (entreprises, associations, 
                    administrations) et aux personnes physiques majeures ayant la capacité de contracter.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">1.3 Modification des CGU</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    DataSphere Innovation se réserve le droit de modifier les présentes CGU à tout moment. 
                    Les utilisateurs seront informés de toute modification substantielle par email au moins 30 jours 
                    avant leur entrée en vigueur. La poursuite de l&apos;utilisation des services vaut acceptation 
                    des nouvelles conditions.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Description du service */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Database className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>2. Description du Service</CardTitle>
                    <CardDescription>Contenu et périmètre des prestations</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">2.1 Nature du service</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    DataSphere Innovation est une plateforme SaaS d&apos;ingénierie de données assistée par 
                    intelligence artificielle. Elle permet aux utilisateurs de :
                  </p>
                  <ul className="text-gray-600 text-sm leading-relaxed space-y-2 mt-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Analyser et découvrir des sources de données</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Générer automatiquement des architectures de données optimisées</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Créer des pipelines ETL/ELT avec des agents IA spécialisés</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Concevoir des tableaux de bord et visualisations</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Interroger les données en langage naturel</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">2.2 Évolutions du service</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    La plateforme est en constante évolution. Des nouvelles fonctionnalités peuvent être ajoutées, 
                    et d&apos;autres modifiées ou supprimées, avec un préavis raisonnable.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">2.3 Disponibilité</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Nous nous engageons à maintenir un taux de disponibilité de 99,9% (SLA). 
                    Les maintenances programmées sont effectuées préférentiellement en dehors des heures ouvrées 
                    et font l&apos;objet d&apos;une notification préalable.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Inscription et compte */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Users className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle>3. Inscription et Compte</CardTitle>
                    <CardDescription>Création et gestion du compte utilisateur</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">3.1 Création de compte</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    L&apos;inscription nécessite la fourniture d&apos;informations exactes et complètes : 
                    nom, prénom, adresse email professionnelle, nom de l&apos;entreprise, et toutes autres 
                    informations demandées.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">3.2 Sécurité des identifiants</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    L&apos;utilisateur est responsable de la confidentialité de ses identifiants de connexion. 
                    Toute activité effectuée depuis son compte est réputée avoir été effectuée par lui. 
                    En cas de suspicion de compromission, l&apos;utilisateur doit nous en informer immédiatement.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">3.3 Compte professionnel</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Les comptes professionnels permettent l&apos;ajout de membres d&apos;équipe. L&apos;administrateur 
                    du compte est responsable des actions des membres qu&apos;il a invités.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">3.4 Vérification</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Nous nous réservons le droit de vérifier les informations fournies et de refuser 
                    ou suspendre un compte en cas d&apos;informations inexactes ou de suspicion de fraude.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 4: Obligations de l'utilisateur */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle>4. Obligations de l&apos;Utilisateur</CardTitle>
                    <CardDescription>Règles de conduite et interdictions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">4.1 Utilisation licite</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    L&apos;utilisateur s&apos;engage à utiliser la plateforme conformément à sa destination, 
                    aux présentes CGU, et à la réglementation applicable.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">4.2 Interdictions</h4>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    Il est strictement interdit de :
                  </p>
                  <ul className="text-gray-600 text-sm leading-relaxed space-y-2">
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Utiliser la plateforme à des fins illégales ou frauduleuses</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Tenter d&apos;accéder aux données d&apos;autres utilisateurs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Porter atteinte à l&apos;intégrité de la plateforme ou de ses systèmes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Utiliser des robots, scripts ou moyens automatisés non autorisés</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Traiter des données personnelles sans respecter le RGPD</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Revendre ou sous-traiter l&apos;accès à la plateforme sans autorisation</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">4.3 Responsabilité</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    L&apos;utilisateur est seul responsable des données qu&apos;il importe et des traitements 
                    qu&apos;il effectue. Il garantit disposer des droits nécessaires sur ces données.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 5: Propriété intellectuelle */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-100 rounded-lg">
                    <Scale className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <CardTitle>5. Propriété Intellectuelle</CardTitle>
                    <CardDescription>Droits et licences</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">5.1 Droits de DataSphere Innovation</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    La plateforme, ses algorithmes, son code source, ses interfaces, ses bases de données, 
                    ses marques et tous éléments associés sont la propriété exclusive de DataSphere Innovation. 
                    Toute reproduction ou utilisation non autorisée est strictement interdite.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">5.2 Droits de l&apos;utilisateur</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    L&apos;utilisateur conserve tous ses droits sur les données qu&apos;il importe et sur les 
                    résultats générés par les traitements (pipelines, modèles, tableaux de bord). 
                    Il dispose d&apos;un droit d&apos;usage non exclusif sur la plateforme.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">5.3 Licence d&apos;utilisation</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    DataSphere Innovation accorde à l&apos;utilisateur une licence non exclusive, 
                    non transférable, révocable, d&apos;accès et d&apos;utilisation de la plateforme, 
                    limitée à la durée de son abonnement.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 6: Données et confidentialité */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <Lock className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <CardTitle>6. Données et Confidentialité</CardTitle>
                    <CardDescription>Protection et traitement des données</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">6.1 Confidentialité</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Chaque partie s&apos;engage à garder confidentielles les informations de l&apos;autre partie 
                    dont elle aurait connaissance dans le cadre de l&apos;exécution du contrat. 
                    Cette obligation perdure pendant 5 ans après la fin de la relation contractuelle.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">6.2 Traitement des données</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Le traitement des données personnelles est décrit dans notre 
                    <Link href="/privacy" className="text-blue-600 hover:underline ml-1">
                      Politique de Confidentialité
                    </Link>. 
                    DataSphere Innovation agit en tant que sous-traitant pour les données importées par le Client.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">6.3 Sécurité</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Nous mettons en œuvre des mesures techniques et organisationnelles appropriées pour 
                    protéger les données : chiffrement, contrôle d&apos;accès, audit, surveillance.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 7: Limitation de responsabilité */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertTriangle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <CardTitle>7. Limitation de Responsabilité</CardTitle>
                    <CardDescription>Exclusions et plafonds</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">7.1 Exclusions</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    DataSphere Innovation ne peut être tenue responsable des dommages résultant de :
                  </p>
                  <ul className="text-gray-600 text-sm leading-relaxed space-y-2 mt-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>Une utilisation non conforme aux présentes CGU</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>D&apos;une faute ou négligence de l&apos;utilisateur</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>D&apos;un cas de force majeure</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                      <span>D&apos;une défaillance des réseaux ou équipements de l&apos;utilisateur</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">7.2 Plafond d&apos;indemnisation</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    La responsabilité totale de DataSphere Innovation, quel qu&apos;en soit le fondement, 
                    est plafonnée au montant des sommes versées par l&apos;utilisateur au cours des 12 derniers 
                    mois précédant le fait générateur.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">7.3 Dommages indirects</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    DataSphere Innovation décline toute responsabilité pour les dommages indirects, 
                    incluant notamment les pertes de données, de revenus, de profit, ou d&apos;opportunité.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 8: Résiliation */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 rounded-lg">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                  <div>
                    <CardTitle>8. Résiliation</CardTitle>
                    <CardDescription>Fin de la relation contractuelle</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">8.1 Par l&apos;utilisateur</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    L&apos;utilisateur peut résilier son abonnement à tout moment, selon les conditions 
                    définies dans nos Conditions Générales de Vente. La résiliation prend effet à la 
                    fin de la période de facturation en cours.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">8.2 Par DataSphere Innovation</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Nous pouvons suspendre ou résilier l&apos;accès en cas de violation des CGU, 
                    de comportement frauduleux, ou de non-paiement. Un préavis de 30 jours sera 
                    donné pour les autres motifs.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">8.3 Effets de la résiliation</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    À la résiliation, l&apos;accès à la plateforme est désactivé. L&apos;utilisateur dispose 
                    d&apos;un délai de 30 jours pour exporter ses données. Passé ce délai, les données 
                    seront définitivement supprimées.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 9: Modification des CGU */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Edit className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle>9. Modification des CGU</CardTitle>
                    <CardDescription>Mise à jour des conditions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">9.1 Notification</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    En cas de modification substantielle des CGU, l&apos;utilisateur sera informé par email 
                    au moins 30 jours avant leur entrée en vigueur.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">9.2 Acceptation</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    La poursuite de l&apos;utilisation des services après l&apos;entrée en vigueur des nouvelles 
                    CGU vaut acceptation de celles-ci. L&apos;utilisateur qui refuse les nouvelles conditions 
                    peut résilier son abonnement.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">9.3 Archivage</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Les versions successives des CGU sont archivées et disponibles sur demande 
                    à legal@datasphere-innovation.fr.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 10: Droit applicable */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Scale className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>10. Droit Applicable et Juridiction</CardTitle>
                    <CardDescription>Cadre légal</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">10.1 Loi applicable</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Les présentes CGU sont régies par le droit français.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">10.2 Juridiction</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Tout litige relatif à l&apos;interprétation ou l&apos;exécution des présentes CGU sera 
                    soumis aux tribunaux compétents de Paris, après tentative de résolution amiable.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">10.3 Contact</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Pour toute question relative aux CGU : 
                    <a href="mailto:legal@datasphere-innovation.fr" className="text-blue-600 hover:underline ml-1">
                      legal@datasphere-innovation.fr
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>

            <Separator className="my-8" />

            {/* Footer */}
            <div className="text-center text-sm text-gray-500 pb-8">
              <p>
                <strong>DataSphere Innovation SAS</strong><br />
                Capital social : 100 000 € - RCS Paris B 123 456 789<br />
                Siège social : 1 Place de la Bourse, 75002 Paris, France
              </p>
            </div>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
