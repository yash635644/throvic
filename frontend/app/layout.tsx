import type {Metadata} from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });

export const metadata: Metadata = {
  title: 'Throvic | Knowledge Graph Explorer',
  description: 'Dive into an infinite, interactive knowledge graph. Explore complex topics, discover hidden connections, and visualize the universe of information.',
  keywords: ['knowledge graph', 'AI', 'learning', 'node graph', 'interactive data', 'education technology', 'research tool'],
  authors: [{ name: 'Yash Trivedi', url: 'https://yash635644.github.io/yash-portfolio/' }],
  openGraph: {
    title: 'Throvic | Interactive Knowledge Graph',
    description: 'Explore complex topics and discover hidden connections with a dynamic, AI-powered physics engine.',
    url: 'https://throvic.pages.dev',
    siteName: 'Throvic',
    images: [
      {
        url: 'https://throvic.pages.dev/demo.webp',
        width: 1200,
        height: 630,
        alt: 'Throvic Knowledge Graph Explorer',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Throvic | Knowledge Graph Explorer',
    description: 'Dive into an infinite, interactive knowledge graph.',
    images: ['https://throvic.pages.dev/demo.webp'],
  },
  robots: {
    index: true,
    follow: true,
  }
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${spaceGrotesk.variable}`}>
      <body suppressHydrationWarning className="font-sans bg-[#0d0d14] text-white">{children}</body>
    </html>
  );
}
