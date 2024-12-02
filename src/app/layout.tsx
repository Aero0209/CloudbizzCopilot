import React from 'react';
import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import EmailJSProvider from '@/components/EmailJSProvider';
import { ModulesProvider } from '@/providers/ModulesProvider';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Cloudbizz - Solutions Cloud pour Entreprise',
  description: 'Solutions cloud professionnelles pour votre transformation digitale',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}): React.ReactElement {
  return (
    <html lang="fr">
      <body className={inter.className}>
        <ModulesProvider>
          <EmailJSProvider>
            {children}
          </EmailJSProvider>
        </ModulesProvider>
      </body>
    </html>
  );
} 