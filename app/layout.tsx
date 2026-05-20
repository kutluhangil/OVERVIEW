import type { Metadata, Viewport } from 'next';
import { Space_Grotesk, JetBrains_Mono, Inter } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-display',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://overview.earth'),
  title: 'OVERVIEW — Real-time Globe of Planet Earth',
  description:
    'Watch the planet\'s pulse in real time. Earthquakes, the ISS, flights, wildfires, and aurora — on a beautiful 3D Earth.',
  keywords: ['earthquake', 'ISS', 'globe', 'real-time', 'earth', 'visualization'],
  authors: [{ name: 'kutluhan.gil' }],
  openGraph: {
    title: 'OVERVIEW — Real-time Globe of Planet Earth',
    description: 'The pulse of the planet, in real time.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://overview.earth',
    siteName: 'OVERVIEW',
    images: [{ url: '/api/og', width: 1200, height: 630 }],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'OVERVIEW — Real-time Globe of Planet Earth',
    description: 'The pulse of the planet, in real time.',
    images: ['/api/og'],
  },
  icons: {
    icon: '/favicon.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#000308',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable} ${inter.variable}`}>
      <body className="bg-[#000308] text-[#e8eef5] overflow-hidden antialiased">
        {children}
      </body>
    </html>
  );
}
