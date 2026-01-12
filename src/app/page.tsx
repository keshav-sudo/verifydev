"use client"

import Landing from '@/views/landing'
import { OrganizationJsonLd, WebsiteJsonLd, SoftwareAppJsonLd, FAQJsonLd } from '@/components/seo/json-ld'

const homeFaqs = [
  {
    question: 'What is VerifyDev?',
    answer: 'VerifyDev is an AI-powered platform that analyzes your GitHub repositories to verify and showcase your developer skills. We provide verified skill assessments, portfolio building, and connect developers with top recruiters.',
  },
  {
    question: 'How does skill verification work?',
    answer: 'Our AI analyzes your GitHub code, commits, and project structure to assess your proficiency in different technologies. We look at code quality, best practices, and real-world project experience.',
  },
  {
    question: 'Is VerifyDev free to use?',
    answer: 'Yes! VerifyDev offers a free tier for developers to verify their skills and build their portfolio. Premium features are available for recruiters and enterprise users.',
  },
  {
    question: 'How do I get started?',
    answer: 'Simply sign up with your GitHub account, and our AI will analyze your repositories to create your verified developer profile. The process takes just a few minutes.',
  },
]

export default function HomePage() {
  return (
    <>
      <OrganizationJsonLd />
      <WebsiteJsonLd />
      <SoftwareAppJsonLd />
      <FAQJsonLd faqs={homeFaqs} />
      <Landing />
    </>
  )
}

