import type {Metadata} from 'next';
import { Inter, Space_Grotesk } from 'next/font/google';
import './globals.css'; // Global styles

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-display' });

export const metadata: Metadata = {
  title: 'Throvic | Knowledge Graph Explorer',
  description: 'Stop searching. Start discovering. Click to dive down the rabbit hole and generate interactive mind maps on any topic in seconds.',
  keywords: ['knowledge graph', 'AI', 'learning', 'node graph', 'interactive data', 'education technology', 'research tool'],
  authors: [{ name: 'Yash Trivedi', url: 'https://yash635644.github.io/yash-portfolio/' }],
  openGraph: {
    title: 'Throvic | The Infinite Knowledge Graph',
    description: 'Enter a concept. Watch the universe of knowledge unfold before your eyes. Experience the most dynamic learning engine ever built.',
    url: 'https://throvic.pages.dev',
    siteName: 'Throvic',
    images: [
      {
        url: 'https://throvic.pages.dev/og-image.png',
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
    title: 'Throvic | The Infinite Knowledge Graph',
    description: 'Stop searching. Start discovering. Click to dive down the throvic.',
    images: ['https://throvic.pages.dev/og-image.png'],
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
