'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Database,
  Target,
  Share2,
  Cookie,
  Shield,
  UserCheck,
  Mail,
  Clock,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const securityCertifications = [
  { name: 'SOC 2 Type II', status: 'Certifié', color: 'bg-green-100 text-green-700' },
  { name: 'RGPD', status: 'Conforme', color: 'bg-blue-100 text-blue-700' },
  { name: 'HIPAA', status: 'Compatible', color: 'bg-purple-100 text-purple-700' },
  { name: 'ISO 27001', status: 'En cours', color: 'bg-yellow-100 text-yellow-700' },
];

const dataRetentionPeriods = [
  { type: 'Données de compte', period: 'Durée de l\'abonnement + 30 jours' },
  { type: 'Données projet', period: 'Durée de l\'abonnement + 30 jours' },
  { type: 'Logs techniques', period: '12 mois' },
  { type: 'Données de facturation', period: '10 ans (obligation légale)' },
  { type: 'Cookies', period: '13 mois maximum' },
];

export default function PrivacyPage() {
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
            <h1 className="text-xl font-bold text-gray-900">Politique de Confidentialité</h1>
            <p className="text-sm text-gray-500">DataSphere Innovation SAS</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 mb-4">
            Version 1.0 - Janvier 2025
          </Badge>
          <p className="text-gray-600">
            Cette politique de confidentialité décrit comment DataSphere Innovation collecte, utilise et protège 
            vos données personnelles conformément au Règlement Général sur la Protection des Données (RGPD).
          </p>
        </div>

        <ScrollArea className="h-[calc(100vh-220px)]">
          <div className="space-y-6 pr-4">
            {/* Section 1: Collecte des données */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Database className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>1. Collecte des Données</CardTitle>
                    <CardDescription>Quelles données nous collectons</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">1.1 Données d&apos;identification</h4>
                  <ul className="text-gray-600 text-sm leading-relaxed space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Nom, prénom, adresse email professionnelle</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Nom de l&apos;entreprise, fonction</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Numéro de téléphone (optionnel)</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">1.2 Données de connexion</h4>
                  <ul className="text-gray-600 text-sm leading-relaxed space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Adresse IP, identifiant appareil</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Données de navigation et logs</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Préférences de langue et paramètres</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">1.3 Données de paiement</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Les données bancaires sont collectées et traitées par notre prestataire de paiement 
                    Stripe, certifié PCI-DSS. Nous ne stockons pas les numéros de carte bancaire.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">1.4 Données professionnelles</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Les données que vous importez dans la plateforme (sources de données, pipelines, 
                    configurations) sont traitées conformément à notre accord de traitement des données 
                    conclu avec chaque client.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Utilisation des données */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Target className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>2. Utilisation des Données</CardTitle>
                    <CardDescription>Finalités du traitement</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">2.1 Finalités principales</h4>
                  <ul className="text-gray-600 text-sm leading-relaxed space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Fourniture du service :</strong> exécution du contrat, accès à la plateforme</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Gestion du compte :</strong> création, authentification, support</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Facturation :</strong> gestion des paiements et des abonnements</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Amélioration du service :</strong> analyse d&apos;usage, développement</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">2.2 Base légale du traitement</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Le traitement des données personnelles repose sur les bases légales suivantes :
                  </p>
                  <ul className="text-gray-600 text-sm leading-relaxed space-y-2 mt-3">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span>L&apos;exécution du contrat (Art. 6.1.b du RGPD)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span>Le consentement de l&apos;utilisateur (Art. 6.1.a du RGPD)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span>Nos intérêts légitimes (Art. 6.1.f du RGPD)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                      <span>Nos obligations légales (Art. 6.1.c du RGPD)</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">2.3 Profilage et IA</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Notre plateforme utilise des agents IA pour traiter les données importées par les clients. 
                    Ce traitement est effectué dans le cadre de l&apos;exécution du service demandé. 
                    Les données ne sont pas utilisées pour du profilage à des fins commerciales.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Partage des données */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Share2 className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle>3. Partage des Données</CardTitle>
                    <CardDescription>Destinataires et transferts</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">3.1 Destinataires internes</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Les données sont accessibles uniquement au personnel autorisé de DataSphere Innovation 
                    (équipe technique, support client, administration), dans le cadre de leurs fonctions.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">3.2 Sous-traitants</h4>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    Nous faisons appel aux sous-traitants suivants, avec qui nous avons conclu des accords 
                    de protection des données :
                  </p>
                  <ul className="text-gray-600 text-sm leading-relaxed space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Stripe :</strong> paiement et facturation</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span><strong>AWS / Google Cloud :</strong> hébergement infrastructure</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span><strong>SendGrid :</strong> envoi d&apos;emails transactionnels</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-orange-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Sentry :</strong> monitoring technique</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">3.3 Transferts hors UE</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Certains de nos sous-traitants peuvent être situés en dehors de l&apos;Union Européenne. 
                    Dans ce cas, nous nous assurons que des garanties appropriées sont mises en place 
                    (clauses contractuelles types, certification Privacy Shield, décision d&apos;adéquation).
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">3.4 Obligations légales</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Nous pouvons être amenés à partager des données avec les autorités compétentes 
                    en cas d&apos;obligation légale ou de demande judiciaire.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 4: Cookies */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Cookie className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle>4. Cookies et Traceurs</CardTitle>
                    <CardDescription>Gestion des cookies</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">4.1 Types de cookies utilisés</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-gray-600">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 font-semibold">Type</th>
                          <th className="text-left py-2 font-semibold">Finalité</th>
                          <th className="text-left py-2 font-semibold">Durée</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b">
                          <td className="py-2">Strictement nécessaires</td>
                          <td className="py-2">Authentification, sécurité</td>
                          <td className="py-2">Session</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Performance</td>
                          <td className="py-2">Analyse d&apos;usage, optimisation</td>
                          <td className="py-2">13 mois</td>
                        </tr>
                        <tr className="border-b">
                          <td className="py-2">Fonctionnalité</td>
                          <td className="py-2">Préférences, personnalisation</td>
                          <td className="py-2">13 mois</td>
                        </tr>
                        <tr>
                          <td className="py-2">Marketing</td>
                          <td className="py-2">Publicités ciblées</td>
                          <td className="py-2">13 mois</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">4.2 Gestion des cookies</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Vous pouvez gérer vos préférences de cookies à tout moment via notre bandeau cookies 
                    ou les paramètres de votre navigateur. La désactivation de certains cookies peut 
                    affecter les fonctionnalités de la plateforme.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 5: Sécurité */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Shield className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>5. Sécurité</CardTitle>
                    <CardDescription>Protection et certifications</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">5.1 Mesures techniques</h4>
                  <ul className="text-gray-600 text-sm leading-relaxed space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Chiffrement des données en transit (TLS 1.3) et au repos (AES-256)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Authentification forte et gestion des accès</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Surveillance et détection des anomalies 24/7</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Sauvegardes automatisées et plan de reprise d&apos;activité</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Tests de pénétration et audits réguliers</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">5.2 Certifications et conformité</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                    {securityCertifications.map((cert, index) => (
                      <div key={index} className="p-3 bg-gray-50 rounded-lg text-center">
                        <p className="font-semibold text-gray-800 text-sm">{cert.name}</p>
                        <Badge className={`mt-2 ${cert.color}`}>{cert.status}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">5.3 Notification des violations</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    En cas de violation de données personnelles, nous nous engageons à notifier la CNIL 
                    dans les 72 heures et les personnes concernées sans délai injustifié, 
                    conformément à l&apos;article 33 du RGPD.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 6: Droits des utilisateurs */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <UserCheck className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle>6. Droits des Utilisateurs (RGPD)</CardTitle>
                    <CardDescription>Exercice de vos droits</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">6.1 Vos droits</h4>
                  <p className="text-gray-600 text-sm leading-relaxed mb-3">
                    Conformément au RGPD, vous disposez des droits suivants :
                  </p>
                  <ul className="text-gray-600 text-sm leading-relaxed space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Droit d&apos;accès :</strong> obtenir une copie de vos données</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Droit de rectification :</strong> corriger vos données inexactes</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Droit à l&apos;effacement :</strong> demander la suppression de vos données</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Droit à la portabilité :</strong> récupérer vos données dans un format structuré</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Droit d&apos;opposition :</strong> vous opposer au traitement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-indigo-500 mt-0.5 flex-shrink-0" />
                      <span><strong>Droit à la limitation :</strong> limiter le traitement de vos données</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">6.2 Comment exercer vos droits</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Pour exercer vos droits, contactez notre DPO par email à 
                    <a href="mailto:dpo@datasphere-innovation.fr" className="text-blue-600 hover:underline ml-1">
                      dpo@datasphere-innovation.fr
                    </a> 
                    ou par courrier à l&apos;adresse indiquée ci-dessous. Nous vous répondrons dans un délai 
                    d&apos;un mois (pouvant être étendu à trois mois pour les demandes complexes).
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">6.3 Réclamation</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Si vous estimez que le traitement de vos données personnelles constitue une violation 
                    du RGPD, vous avez le droit d&apos;introduire une réclamation auprès de la CNIL 
                    (Commission Nationale de l&apos;Informatique et des Libertés) : 
                    <a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline ml-1">
                      www.cnil.fr
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 7: Contact DPO */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <Mail className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <CardTitle>7. Contact DPO</CardTitle>
                    <CardDescription>Délégué à la Protection des Données</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 font-semibold">Délégué à la Protection des Données</p>
                  <p className="text-gray-600 text-sm mt-2">
                    <strong>Email :</strong>{' '}
                    <a href="mailto:dpo@datasphere-innovation.fr" className="text-blue-600 hover:underline">
                      dpo@datasphere-innovation.fr
                    </a>
                  </p>
                  <p className="text-gray-600 text-sm mt-1">
                    <strong>Adresse :</strong><br />
                    DataSphere Innovation SAS<br />
                    Délégué à la Protection des Données<br />
                    1 Place de la Bourse<br />
                    75002 Paris, France
                  </p>
                </div>
                <p className="text-gray-600 text-sm leading-relaxed">
                  Notre DPO est votre point de contact pour toute question relative à la protection 
                  de vos données personnelles et à l&apos;exercice de vos droits.
                </p>
              </CardContent>
            </Card>

            {/* Section 8: Durée de conservation */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-100 rounded-lg">
                    <Clock className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <CardTitle>8. Durée de Conservation</CardTitle>
                    <CardDescription>Politique de rétention des données</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">8.1 Principes de conservation</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Nous conservons vos données personnelles pendant la durée nécessaire aux finalités 
                    pour lesquelles elles ont été collectées, conformément à nos obligations légales 
                    et à nos intérêts légitimes.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">8.2 Durées de conservation</h4>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-gray-600">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-2 font-semibold">Type de données</th>
                          <th className="text-left py-2 font-semibold">Durée de conservation</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dataRetentionPeriods.map((item, index) => (
                          <tr key={index} className="border-b last:border-0">
                            <td className="py-2">{item.type}</td>
                            <td className="py-2">{item.period}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">8.3 Anonymisation</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Passé le délai de conservation, les données sont soit supprimées définitivement, 
                    soit anonymisées pour des finalités statistiques.
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
                Siège social : 1 Place de la Bourse, 75002 Paris, France<br />
                N° TVA intracommunautaire : FR 12 345 678 901
              </p>
              <p className="mt-4">
                Dernière mise à jour : Janvier 2025
              </p>
            </div>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
