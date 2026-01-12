"use client"

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://verifydev.me'

// Organization Schema - for homepage
export function OrganizationJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'VerifyDev',
    url: BASE_URL,
    logo: `${BASE_URL}/logo.png`,
    description: 'AI-Powered Developer Verification Platform. Verify your skills through GitHub code analysis.',
    sameAs: [
      'https://twitter.com/verifydev',
      'https://github.com/verifydev',
      'https://linkedin.com/company/verifydev',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      email: 'support@verifydev.me',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Website Schema - for search features
export function WebsiteJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'VerifyDev',
    url: BASE_URL,
    description: 'AI-Powered Developer Verification Platform',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${BASE_URL}/u/{search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Software Application Schema
export function SoftwareAppJsonLd() {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: 'VerifyDev',
    applicationCategory: 'BusinessApplication',
    operatingSystem: 'Web',
    offers: {
      '@type': 'Offer',
      price: '0',
      priceCurrency: 'USD',
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      ratingCount: '1250',
    },
    description: 'Verify your developer skills with AI-powered GitHub code analysis. Build your verified portfolio and connect with top recruiters.',
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Profile Page Schema (for public profiles)
interface ProfileJsonLdProps {
  name: string
  username: string
  bio?: string
  avatarUrl?: string
  skills?: string[]
}

export function ProfileJsonLd({ name, username, bio, avatarUrl, skills }: ProfileJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name,
    url: `${BASE_URL}/u/${username}`,
    image: avatarUrl,
    description: bio,
    jobTitle: 'Software Developer',
    knowsAbout: skills || [],
    sameAs: [
      `https://github.com/${username}`,
    ],
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Job Posting Schema (for recruiter job posts)
interface JobJsonLdProps {
  title: string
  description: string
  company: string
  location: string
  salary?: { min: number; max: number; currency: string }
  datePosted: string
  isRemote?: boolean
  jobId: string
}

export function JobPostingJsonLd({
  title,
  description,
  company,
  location,
  salary,
  datePosted,
  isRemote,
  jobId,
}: JobJsonLdProps) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title,
    description,
    identifier: {
      '@type': 'PropertyValue',
      name: 'VerifyDev',
      value: jobId,
    },
    datePosted,
    hiringOrganization: {
      '@type': 'Organization',
      name: company,
    },
    jobLocation: {
      '@type': 'Place',
      address: {
        '@type': 'PostalAddress',
        addressLocality: location,
      },
    },
    jobLocationType: isRemote ? 'TELECOMMUTE' : undefined,
    baseSalary: salary
      ? {
          '@type': 'MonetaryAmount',
          currency: salary.currency,
          value: {
            '@type': 'QuantitativeValue',
            minValue: salary.min,
            maxValue: salary.max,
            unitText: 'YEAR',
          },
        }
      : undefined,
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// FAQ Schema (for landing page FAQs)
interface FAQItem {
  question: string
  answer: string
}

export function FAQJsonLd({ faqs }: { faqs: FAQItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}

// Breadcrumb Schema
interface BreadcrumbItem {
  name: string
  url: string
}

export function BreadcrumbJsonLd({ items }: { items: BreadcrumbItem[] }) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  )
}
