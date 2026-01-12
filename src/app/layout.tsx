import type { Metadata, Viewport } from 'next'
import Providers from './providers'
import '@/index.css'

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
    default: 'VerifyDev | AI-Powered Developer Verification Platform - Prove Your Skills',
    template: '%s | VerifyDev',
  },
  description: 'VerifyDev is the leading platform for developers to verify their skills through GitHub code analysis. Get AI-powered skill verification, build your developer portfolio, and connect with top recruiters. Join 10,000+ verified developers today.',
  keywords: ['developer verification', 'GitHub portfolio', 'code analysis', 'developer skills', 'tech jobs', 'software engineer portfolio', 'verified developer', 'skill assessment', 'coding skills', 'developer hiring', 'tech talent', 'programming verification', 'AI code review', 'developer portfolio', 'hire developers'],
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
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/apple-touch-icon.png',
    other: [
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '32x32',
        url: '/favicon-32x32.png',
      },
      {
        rel: 'icon',
        type: 'image/png',
        sizes: '16x16',
        url: '/favicon-16x16.png',
      },
    ],
  },
  manifest: '/site.webmanifest',
  openGraph: {
    type: 'website',
    url: BASE_URL,
    title: 'VerifyDev | AI-Powered Developer Verification Platform',
    description: 'Verify your developer skills through GitHub code analysis. Get AI-powered assessments, build your portfolio, and connect with top recruiters. Join 10,000+ verified developers.',
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: 'VerifyDev - AI-Powered Developer Verification',
      },
    ],
    siteName: 'VerifyDev',
    locale: 'en_US',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VerifyDev | AI-Powered Developer Verification Platform',
    description: 'Verify your developer skills through GitHub code analysis. Get AI-powered assessments, build your portfolio, and connect with top recruiters.',
    images: [`${BASE_URL}/og-image.png`],
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
    <html lang="en" suppressHydrationWarning>
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&family=Outfit:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
        <GoogleAnalytics />
        <GoogleTagManager />
      </head>
      <body className="font-sans antialiased">
        <GoogleTagManagerNoScript />
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}

