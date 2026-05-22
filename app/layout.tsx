import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'CLAIMR',
  description: 'Connecting Landowners to Automated Intelligent Money Recovery',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans">{children}</body>
    </html>
  );
}
