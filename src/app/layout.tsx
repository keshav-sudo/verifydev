import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk, Plus_Jakarta_Sans, Poppins, Figtree } from 'next/font/google'
import Providers from './providers'
import '@/index.css'

const inter = Inter({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  display: 'swap',
  variable: '--font-inter',
  preload: true,
  fallback: ['system-ui', 'arial'],
})

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-space-grotesk',
  preload: false,
})

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  weight: ['500', '600', '700'],
  display: 'swap',
  variable: '--font-plus-jakarta',
  preload: false,
})

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-poppins',
  preload: false,
})

const figtree = Figtree({ 
  subsets: ['latin'],
  weight: ['400', '600', '700'],
  display: 'swap',
  variable: '--font-figtree',
  preload: false,
})

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://verifydev.me'

export const viewport: Viewport = {
  themeColor: '#f97316',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'VerifyDev | Verified Developer Jobs & AI-Powered Skill Verification Platform',
    template: '%s | VerifyDev',
  },
  description: 'VerifyDev connects verified developers with top tech companies. Get AI-powered skill verification through GitHub code analysis, build your verified profile, and access exclusive job opportunities. Join 50,000+ verified developers landing their dream jobs.',
  keywords: ['verified developer jobs', 'developer verification', 'GitHub portfolio', 'code analysis', 'developer skills', 'tech jobs', 'software engineer jobs', 'verified developer profile', 'skill assessment', 'coding skills', 'developer hiring', 'tech talent', 'programming verification', 'job platform for developers', 'verified tech jobs', 'AI code review', 'developer portfolio', 'hire developers'],
  authors: [{ name: 'VerifyDev', url: BASE_URL }],
  creator: 'VerifyDev',
  publisher: 'VerifyDev',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/logo.png',
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        url: '/logo.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        url: '/logo.png',
      },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    url: BASE_URL,
    title: 'VerifyDev | Verified Developer Jobs & AI Skill Verification',
    description: 'Connect with top tech companies through verified profiles. Get AI-powered skill verification via GitHub code analysis and access exclusive job opportunities. Join 50,000+ verified developers.',
    images: [
      {
        url: `${BASE_URL}/logo.png`,
        width: 512,
        height: 512,
        alt: 'VerifyDev - Verified Developer Jobs & AI Skill Verification',
      },
    ],
    siteName: 'VerifyDev',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VerifyDev | Verified Developer Jobs & AI Skill Verification',
    description: 'Connect with top tech companies through verified profiles. Get AI-powered skill verification and access exclusive job opportunities for developers.',
    images: [`${BASE_URL}/logo.png`],
    creator: '@verifydev',
    site: '@verifydev',
  },
  verification: {
    google: process.env.GOOGLE_SITE_VERIFICATION || 'r3TG-0w1jSiCY5fS6TjkdrhgySLNGKTdrwQz8LLz6TY',
    yandex: process.env.YANDEX_SITE_VERIFICATION,
    other: {
      'msvalidate.01': process.env.BING_SITE_VERIFICATION || '',
    },
  },
  alternates: {
    canonical: BASE_URL,
  },
  category: 'technology',
}

// Import analytics components
import { GoogleAnalytics, GoogleTagManager, GoogleTagManagerNoScript } from '@/components/seo/analytics'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`${inter.variable} ${spaceGrotesk.variable} ${plusJakarta.variable} ${poppins.variable} ${figtree.variable}`}>
      <head>
        {/* Preconnect to critical domains */}
        <link rel="preconnect" href="https://ik.imagekit.io" />
        <link rel="dns-prefetch" href="https://ik.imagekit.io" />
        <link rel="preconnect" href="https://www.googletagmanager.com" />
        <link rel="dns-prefetch" href="https://www.googletagmanager.com" />
        
        {/* Analytics - async loading */}
        <GoogleAnalytics />
        <GoogleTagManager />
      </head>
      <body className={`${inter.className} antialiased`}>
        <GoogleTagManagerNoScript />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

