import { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://verifydev.me'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/dashboard/',
          '/settings/',
          '/api/',
          '/auth/callback',
          '/messages/',
          '/applications/',
          '/projects/',
          '/profile/',
          '/resume/',
          '/claim-skills/',
          '/notifications/',
          '/onboarding/',
          '/connect-platforms/',
          '/recruiter/dashboard/',
          '/recruiter/candidates/',
          '/recruiter/jobs/',
          '/recruiter/post-job/',
          '/recruiter/messages/',
          '/recruiter/settings/',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/api/', '/auth/callback'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
