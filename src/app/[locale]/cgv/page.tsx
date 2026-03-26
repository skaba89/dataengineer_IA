'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  FileText,
  Package,
  CreditCard,
  Clock,
  XCircle,
  Shield,
  Scale,
  MapPin,
  CheckCircle,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

const pricingPlans = [
  {
    name: 'Starter',
    price: 499,
    features: [
      '1 projet actif',
      '5 sources de données',
      '10 pipelines ETL',
      'Support email',
      '1 utilisateur',
    ],
  },
  {
    name: 'Professional',
    price: 1499,
    features: [
      '5 projets actifs',
      '20 sources de données',
      '50 pipelines ETL',
      'Support prioritaire',
      '5 utilisateurs',
      'Intégrations avancées',
    ],
  },
  {
    name: 'Enterprise',
    price: 4999,
    features: [
      'Projets illimités',
      'Sources de données illimitées',
      'Pipelines illimités',
      'Support dédié 24/7',
      'Utilisateurs illimités',
      'SSO / SAML',
      'SLA garanti',
      'Formation incluse',
    ],
  },
  {
    name: 'Agency',
    price: 2999,
    features: [
      '10 projets actifs',
      '50 sources de données',
      '100 pipelines ETL',
      'Support prioritaire',
      '10 utilisateurs',
      'Multi-tenant',
      'White-label disponible',
    ],
  },
];

export default function CGVPage() {
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
            <h1 className="text-xl font-bold text-gray-900">Conditions Générales de Vente</h1>
            <p className="text-sm text-gray-500">DataSphere Innovation SAS</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 mb-4">
            Version 1.0 - Janvier 2025
          </Badge>
          <p className="text-gray-600">
            Les présentes conditions générales de vente (CGV) régissent les relations contractuelles entre 
            DataSphere Innovation SAS et ses clients pour l&apos;utilisation de la plateforme d&apos;ingénierie de données.
          </p>
        </div>

        <ScrollArea className="h-[calc(100vh-220px)]">
          <div className="space-y-6 pr-4">
            {/* Section 1: Objet et acceptation */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>1. Objet et Acceptation</CardTitle>
                    <CardDescription>Champ d&apos;application des conditions</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">1.1 Objet</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Les présentes Conditions Générales de Vente (CGV) ont pour objet de définir les modalités 
                    et conditions dans lesquelles DataSphere Innovation SAS (ci-après &quot;la Société&quot;) fournit 
                    ses services d&apos;ingénierie de données assistée par intelligence artificielle à ses clients 
                    professionnels (ci-après &quot;le Client&quot;).
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">1.2 Acceptation</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Toute commande de services implique l&apos;acceptation sans réserve par le Client des présentes CGV. 
                    Ces conditions prévalent sur tout autre document du Client, sauf accord écrit et signé par les deux parties.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">1.3 Modification</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    La Société se réserve le droit de modifier les présentes CGV à tout moment. 
                    Les CGV applicables sont celles en vigueur au jour de la commande.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Produits et services */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Package className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>2. Produits et Services</CardTitle>
                    <CardDescription>Plans tarifaires disponibles</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 text-sm leading-relaxed">
                  La Société propose une plateforme SaaS d&apos;ingénierie de données avec les forfaits suivants :
                </p>
                
                <div className="grid md:grid-cols-2 gap-4">
                  {pricingPlans.map((plan, index) => (
                    <Card key={index} className="border border-gray-200">
                      <CardHeader className="pb-2">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{plan.name}</CardTitle>
                          <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                            {plan.price}€/mois
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-2">
                          {plan.features.map((feature, i) => (
                            <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  ))}
                </div>

                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-semibold text-gray-800 mb-2">2.1 Description des services</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Les services incluent l&apos;accès à la plateforme, l&apos;exécution d&apos;agents IA pour l&apos;analyse 
                    de données, la génération de pipelines ETL, la création de tableaux de bord, et le support technique 
                    selon le plan souscrit.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Prix et paiement */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <CreditCard className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>3. Prix et Paiement</CardTitle>
                    <CardDescription>Modalités financières</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">3.1 Tarifs</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Les prix sont indiqués en euros hors taxes. La TVA applicable sera ajoutée au taux en vigueur. 
                    Les tarifs sont susceptibles d&apos;être modifiés avec un préavis de 30 jours.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">3.2 Paiement via Stripe</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Le paiement s&apos;effectue par carte bancaire via la plateforme sécurisée Stripe. 
                    Le Client autorise la Société à débiter le montant dû sur la carte enregistrée. 
                    Les données bancaires sont traitées conformément aux normes PCI-DSS.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">3.3 Facturation</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Une facture est émise automatiquement à chaque paiement et mise à disposition dans l&apos;espace client. 
                    Le Client peut la télécharger à tout moment.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">3.4 Retard de paiement</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    En cas de retard de paiement, des pénalités de retard au taux de 3 fois le taux d&apos;intérêt 
                    légal seront appliquées. L&apos;accès aux services pourra être suspendu après 7 jours de retard.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 4: Durée et renouvellement */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Clock className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle>4. Durée et Renouvellement</CardTitle>
                    <CardDescription>Engagement et reconduction</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">4.1 Durée de l&apos;abonnement</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Les abonnements sont conclus pour une durée de 12 mois, avec tacite reconduction. 
                    Le Client peut opter pour une facturation mensuelle ou annuelle.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">4.2 Renouvellement</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    L&apos;abonnement se renouvelle automatiquement à chaque échéance, sauf dénonciation 
                    par le Client dans les conditions prévues à l&apos;article 5.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">4.3 Engagement initial</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    L&apos;engagement initial est de 12 mois minimum pour les plans Professional et Enterprise. 
                    Le plan Starter ne nécessite aucun engagement minimum.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 5: Résiliation et remboursements */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <XCircle className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <CardTitle>5. Résiliation et Remboursements</CardTitle>
                    <CardDescription>Conditions d&apos;annulation</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">5.1 Période d&apos;essai (14 jours)</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Le Client bénéficie d&apos;une période d&apos;essai gratuite de 14 jours pour évaluer les services. 
                    Durant cette période, il peut résilier sans frais ni justification.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">5.2 Remboursement au prorata</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    En cas de résiliation en cours d&apos;abonnement, un remboursement au prorata temporis sera effectué 
                    pour la période restante, déduction faite des frais de traitement (10% du montant remboursé, 
                    minimum 50€).
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">5.3 Conditions de résiliation</h4>
                  <ul className="text-gray-600 text-sm leading-relaxed space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Résiliation possible à tout moment après la période d&apos;engagement initial</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Préavis de 30 jours avant la date de renouvellement</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                      <span>Demande par email à support@datasphere-innovation.fr</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">5.4 Résiliation pour faute</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    La Société peut résilier le contrat avec effet immédiat en cas de violation des CGU par le Client, 
                    d&apos;utilisation frauduleuse, ou de non-paiement après mise en demeure.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 6: Responsabilités */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Shield className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle>6. Responsabilités</CardTitle>
                    <CardDescription>Obligations des parties</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">6.1 Responsabilité de la Société</h4>
                  <ul className="text-gray-600 text-sm leading-relaxed space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Fournir un accès continu à la plateforme (SLA 99.9%)</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Assurer la sécurité des données hébergées</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Fournir un support technique selon le plan souscrit</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Notifier les maintenances planifiées</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">6.2 Responsabilité du Client</h4>
                  <ul className="text-gray-600 text-sm leading-relaxed space-y-2">
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Utiliser les services conformément à leur destination</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Garantir l&apos;exactitude des données fournies</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Respecter les droits de propriété intellectuelle</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                      <span>Sécuriser ses identifiants de connexion</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">6.3 Limitation de responsabilité</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    La responsabilité de la Société est limitée aux dommages directs et prévisibles. 
                    En tout état de cause, l&apos;indemnisation ne pourra excéder le montant des sommes versées 
                    par le Client au cours des 12 derniers mois.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 7: Propriété intellectuelle */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-violet-100 rounded-lg">
                    <Scale className="h-5 w-5 text-violet-600" />
                  </div>
                  <div>
                    <CardTitle>7. Propriété Intellectuelle</CardTitle>
                    <CardDescription>Droits sur les contenus</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">7.1 Propriété de la plateforme</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    La plateforme DataSphere Innovation, son code source, ses algorithmes, ses interfaces et 
                    toute documentation associée restent la propriété exclusive de la Société. 
                    Le Client dispose d&apos;un droit d&apos;usage non exclusif pour la durée de l&apos;abonnement.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">7.2 Données du Client</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Les données importées par le Client ainsi que les résultats générés lui appartiennent. 
                    La Société s&apos;engage à ne pas utiliser ces données à d&apos;autres fins que l&apos;exécution du service.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">7.3 Licences tierces</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    La plateforme peut intégrer des composants open source soumis à leurs licences respectives, 
                    disponibles sur demande.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 8: Droit applicable */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <MapPin className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <CardTitle>8. Droit Applicable et Juridiction</CardTitle>
                    <CardDescription>Cadre légal</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">8.1 Droit applicable</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Les présentes CGV sont régies par le droit français. 
                    La Convention de Vienne sur la vente internationale de marchandises ne s&apos;applique pas.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">8.2 Juridiction compétente</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    En cas de litige relatif à l&apos;interprétation ou l&apos;exécution des présentes CGV, 
                    les tribunaux de Paris seront seuls compétents, après tentative de résolution amiable.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">8.3 Médiation</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Le Client professionnel peut recourir au médiateur de la consommation agréé : 
                    Médiateur du Commerce Électronique - www.mediateur-ecommerce.fr
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
                Pour toute question concernant ces CGV : <br />
                <a href="mailto:legal@datasphere-innovation.fr" className="text-blue-600 hover:underline">
                  legal@datasphere-innovation.fr
                </a>
              </p>
            </div>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
