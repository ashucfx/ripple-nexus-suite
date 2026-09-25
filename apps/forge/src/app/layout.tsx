import type { Metadata, Viewport } from 'next';
import { Inter, JetBrains_Mono } from 'next/font/google';
import { AuthProvider } from '@rn/auth';
import './globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'RIPPLE NEXUS // Forge Engineering & Deployment',
  description: 'Autonomous Systems Delivery & Pipeline Matrix for Ripple Nexus',
  icons: {
    icon: [
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/rn-mark.svg', type: 'image/svg+xml' },
    ],
    shortcut: '/rn-mark.svg',
    apple: '/rn-mark.svg',
  },
};

export const viewport: Viewport = {
  themeColor: '#0A0D12',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-telemetry-grid bg-radial-cobalt min-h-screen">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
