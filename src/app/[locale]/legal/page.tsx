'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Building2,
  User,
  Server,
  Copyright,
  Mail,
  Phone,
  MapPin,
  Scale,
  ArrowLeft
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function LegalPage() {
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
            <h1 className="text-xl font-bold text-gray-900">Mentions Légales</h1>
            <p className="text-sm text-gray-500">DataSphere Innovation SAS</p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8">
        <div className="mb-8">
          <Badge variant="outline" className="bg-gray-100 text-gray-700 border-gray-300 mb-4">
            Mise à jour : Janvier 2025
          </Badge>
          <p className="text-gray-600">
            Conformément aux dispositions des articles 6-III et 19 de la Loi n°2004-575 du 21 juin 2004 
            pour la Confiance dans l&apos;économie numérique, dite LCEN, nous portons à la connaissance 
            des utilisateurs du site les informations suivantes :
          </p>
        </div>

        <ScrollArea className="h-[calc(100vh-220px)]">
          <div className="space-y-6 pr-4">
            {/* Section 1: Éditeur */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Building2 className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle>1. Éditeur du Site</CardTitle>
                    <CardDescription>Informations sur l&apos;entreprise</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Raison sociale</h4>
                      <p className="text-gray-600 text-sm">
                        <strong>DataSphere Innovation SAS</strong>
                      </p>
                      <p className="text-gray-600 text-sm mt-1">
                        Société par Actions Simplifiée à associé unique
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Capital social</h4>
                      <p className="text-gray-600 text-sm">100 000 euros</p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Immatriculation</h4>
                      <p className="text-gray-600 text-sm">
                        RCS Paris B 123 456 789<br />
                        SIRET : 123 456 789 00012<br />
                        N° TVA intracommunautaire : FR 12 345 678 901
                      </p>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-blue-600" />
                        Siège social
                      </h4>
                      <p className="text-gray-600 text-sm">
                        1 Place de la Bourse<br />
                        75002 Paris<br />
                        France
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Code NAF / APE</h4>
                      <p className="text-gray-600 text-sm">
                        6201Z - Programmation informatique
                      </p>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-800 mb-2">Date de création</h4>
                      <p className="text-gray-600 text-sm">Janvier 2023</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 2: Directeur de publication */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <User className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <CardTitle>2. Directeur de Publication</CardTitle>
                    <CardDescription>Responsable du contenu</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-gray-800 font-semibold">M. Jean-Pierre Martin</p>
                  <p className="text-gray-600 text-sm mt-1">
                    Président de DataSphere Innovation SAS
                  </p>
                  <p className="text-gray-600 text-sm mt-2">
                    En qualité de directeur de la publication, il est responsable du contenu 
                    mis en ligne sur le site datasphere-innovation.fr
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 3: Hébergeur */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Server className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <CardTitle>3. Hébergeur du Site</CardTitle>
                    <CardDescription>Infrastructure technique</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                        Principal
                      </Badge>
                    </div>
                    <p className="text-gray-800 font-semibold">Amazon Web Services EMEA SARL</p>
                    <p className="text-gray-600 text-sm mt-1">
                      5 Rue Plaetis<br />
                      L-2338 Luxembourg<br />
                      Luxembourg
                    </p>
                    <p className="text-gray-600 text-sm mt-2">
                      Téléphone : +352 26 12 41 1<br />
                      Site web : <a href="https://aws.amazon.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">aws.amazon.com</a>
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2 mb-2">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        Secondaire
                      </Badge>
                    </div>
                    <p className="text-gray-800 font-semibold">Google Cloud Platform</p>
                    <p className="text-gray-600 text-sm mt-1">
                      Google Ireland Limited<br />
                      Gordon House, Barrow Street<br />
                      Dublin 4, Ireland
                    </p>
                    <p className="text-gray-600 text-sm mt-2">
                      Site web : <a href="https://cloud.google.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">cloud.google.com</a>
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 4: Propriété intellectuelle */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-amber-100 rounded-lg">
                    <Copyright className="h-5 w-5 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle>4. Propriété Intellectuelle</CardTitle>
                    <CardDescription>Droits d&apos;auteur et marques</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">4.1 Site web</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    L&apos;ensemble du site datasphere-innovation.fr, incluant mais non limité à 
                    son architecture, ses textes, images, vidéos, logos, icônes, sons, logiciels, 
                    ainsi que les bases de données, est la propriété exclusive de DataSphere Innovation SAS 
                    ou de ses partenaires et est protégé par les lois françaises et internationales 
                    relatives à la propriété intellectuelle.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">4.2 Marques</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Les marques et logos &quot;DataSphere Innovation&quot;, &quot;DSI&quot; et tous les signes distinctifs 
                    associés sont des marques déposées de DataSphere Innovation SAS. 
                    Toute reproduction ou représentation, totale ou partielle, de ces marques sans 
                    autorisation préalable écrite est strictement interdite.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">4.3 Contenu utilisateur</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Les contenus créés ou importés par les utilisateurs sur la plateforme restent 
                    leur propriété exclusive. En utilisant nos services, les utilisateurs nous accordent 
                    une licence non exclusive pour traiter ces données conformément à nos 
                    <Link href="/cgu" className="text-blue-600 hover:underline ml-1">
                      Conditions Générales d&apos;Utilisation
                    </Link>.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">4.4 Sanctions</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Toute reproduction, représentation, modification, publication, adaptation de tout 
                    ou partie des éléments du site, quel que soit le moyen ou le procédé utilisé, 
                    est interdite, sauf autorisation écrite préalable de DataSphere Innovation SAS. 
                    Toute exploitation non autorisée du site ou de l&apos;un quelconque des éléments 
                    qu&apos;il contient sera considérée comme constitutive d&apos;une contrefaçon et poursuivie 
                    conformément aux dispositions des articles L.335-2 et suivants du Code de Propriété Intellectuelle.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Section 5: Contact */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-100 rounded-lg">
                    <Mail className="h-5 w-5 text-teal-600" />
                  </div>
                  <div>
                    <CardTitle>5. Contact</CardTitle>
                    <CardDescription>Nous contacter</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Mail className="h-4 w-4 text-teal-600" />
                        Email
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">Service client :</span>
                          <a href="mailto:support@datasphere-innovation.fr" className="text-blue-600 hover:underline ml-1">
                            support@datasphere-innovation.fr
                          </a>
                        </div>
                        <div>
                          <span className="text-gray-500">Service commercial :</span>
                          <a href="mailto:sales@datasphere-innovation.fr" className="text-blue-600 hover:underline ml-1">
                            sales@datasphere-innovation.fr
                          </a>
                        </div>
                        <div>
                          <span className="text-gray-500">Service juridique :</span>
                          <a href="mailto:legal@datasphere-innovation.fr" className="text-blue-600 hover:underline ml-1">
                            legal@datasphere-innovation.fr
                          </a>
                        </div>
                        <div>
                          <span className="text-gray-500">DPO (Protection des données) :</span>
                          <a href="mailto:dpo@datasphere-innovation.fr" className="text-blue-600 hover:underline ml-1">
                            dpo@datasphere-innovation.fr
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <Phone className="h-4 w-4 text-teal-600" />
                        Téléphone
                      </h4>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="text-gray-500">Standard :</span>
                          <span className="text-gray-600 ml-1">+33 1 23 45 67 89</span>
                        </div>
                        <div>
                          <span className="text-gray-500">Support technique :</span>
                          <span className="text-gray-600 ml-1">+33 1 23 45 67 90</span>
                        </div>
                        <p className="text-gray-500 text-xs mt-2">
                          Du lundi au vendredi, de 9h00 à 18h00 (heure de Paris)
                        </p>
                      </div>
                    </div>
                    <div className="p-4 bg-gray-50 rounded-lg">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-teal-600" />
                        Courrier
                      </h4>
                      <p className="text-gray-600 text-sm">
                        DataSphere Innovation SAS<br />
                        1 Place de la Bourse<br />
                        75002 Paris<br />
                        France
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Section 6: Informations complémentaires */}
            <Card>
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 rounded-lg">
                    <Scale className="h-5 w-5 text-indigo-600" />
                  </div>
                  <div>
                    <CardTitle>6. Informations Complémentaires</CardTitle>
                    <CardDescription>Données supplémentaires</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">6.1 Responsabilité</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    DataSphere Innovation SAS s&apos;efforce d&apos;assurer au mieux l&apos;exactitude et la mise à jour 
                    des informations diffusées sur ce site. Toutefois, DataSphere Innovation SAS ne peut 
                    garantir l&apos;exactitude, la précision ou l&apos;exhaustivité des informations mises à disposition 
                    sur ce site.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">6.2 Liens hypertextes</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Le site peut contenir des liens vers d&apos;autres sites internet. DataSphere Innovation SAS 
                    n&apos;exerce aucun contrôle sur ces sites et décline toute responsabilité quant à leur contenu. 
                    La création de liens hypertextes vers le site datasphere-innovation.fr est soumise 
                    à l&apos;accord préalable de DataSphere Innovation SAS.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">6.3 Cookies</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Le site utilise des cookies pour améliorer l&apos;expérience utilisateur. 
                    Pour en savoir plus, consultez notre 
                    <Link href="/privacy" className="text-blue-600 hover:underline ml-1">
                      Politique de Confidentialité
                    </Link>.
                  </p>
                </div>
                <div>
                  <h4 className="font-semibold text-gray-800 mb-2">6.4 Droit applicable</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Les présentes mentions légales sont soumises au droit français. En cas de litige, 
                    et après tentative de résolution amiable, les tribunaux français seront seuls compétents.
                  </p>
                </div>
              </CardContent>
            </Card>

            <Separator className="my-8" />

            {/* Documents légaux */}
            <div className="bg-gray-50 rounded-lg p-6">
              <h3 className="font-semibold text-gray-800 mb-4">Documents légaux</h3>
              <div className="grid md:grid-cols-3 gap-4">
                <Link href="/cgv" className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all">
                  <h4 className="font-medium text-gray-800">CGV</h4>
                  <p className="text-sm text-gray-500 mt-1">Conditions Générales de Vente</p>
                </Link>
                <Link href="/cgu" className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all">
                  <h4 className="font-medium text-gray-800">CGU</h4>
                  <p className="text-sm text-gray-500 mt-1">Conditions Générales d&apos;Utilisation</p>
                </Link>
                <Link href="/privacy" className="block p-4 bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all">
                  <h4 className="font-medium text-gray-800">Confidentialité</h4>
                  <p className="text-sm text-gray-500 mt-1">Politique de Confidentialité</p>
                </Link>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center text-sm text-gray-500 pb-8">
              <p>
                © {new Date().getFullYear()} DataSphere Innovation SAS - Tous droits réservés
              </p>
            </div>
          </div>
        </ScrollArea>
      </main>
    </div>
  );
}
