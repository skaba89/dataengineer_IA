import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'DataSphere Innovation',
  description: 'Plateforme d\'ingénierie de données pilotée par l\'IA',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <div lang={locale}>
      {children}
    </div>
  );
}
