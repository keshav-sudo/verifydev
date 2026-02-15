/**
 * EXAMPLE USAGE: Anti-Gravity Profile Component
 * 
 * This demonstrates how to use the AntiGravityProfile component
 * with real API data from VerifyDev backend
 */

import AntiGravityProfile from '@/components/premium/AntiGravityProfile'

// Sample API Response (based on your actual backend structure)
const sampleProfileData = {
  // Aura Data (from /api/v1/users/me/aura)
  aura: {
    total: 392,
    level: 'Skilled',
    trend: 'up' as const,
    percentile: 15,
    breakdown: {
      profile: 50,
      projects: 142,
      skills: 89,
      activity: 45,
      github: 66,
    },
    breakdownDetails: {
      profile: [
        { label: 'Basic Info', points: 10, earned: true, reason: 'Name and email set' },
        { label: 'Profile Bio', points: 10, earned: true, reason: 'Bio completed' },
        { label: 'Avatar', points: 10, earned: true, reason: 'Profile picture set' },
        { label: 'Location', points: 10, earned: true, reason: 'Location specified' },
        { label: 'Website/Social', points: 10, earned: true, reason: 'Social links added' },
        { label: 'Skills Listed', points: 10, earned: false, reason: 'Skills added to profile' },
      ],
      projects: [
        { label: '3 Projects Analyzed', points: 142, earned: true, reason: 'Avg score: 71/100 (max 50 pts each for 80+ projects)' },
        { label: 'Top: verify-stack', points: 40, earned: true, reason: 'Score: 80/100' },
      ],
      skills: [
        { label: '59 Verified Skills', points: 89, earned: true, reason: 'Skills verified from project analysis (0.15 pts per skill score point)' },
      ],
      activity: [
        { label: 'Platform Activity', points: 45, earned: true, reason: 'Points from logins, profile views, and engagement (max 100)' },
      ],
      github: [
        { label: 'GitHub Profile', points: 66, earned: true, reason: '120 followers, 45 public repos' },
      ],
    },
  },

  // Profile Info
  profile: {
    name: 'Keshav Sharma',
    username: 'keshav-sudo',
    avatarUrl: 'https://avatars.githubusercontent.com/u/12345678?v=4',
    bio: 'Full-stack developer passionate about building scalable systems. Expertise in React, Node.js, and cloud architecture.',
    location: 'San Francisco, CA',
    company: 'Vercel',
    website: 'https://keshav.dev',
    githubUsername: 'keshav-sudo',
  },

  // Stats
  stats: {
    projects: 3,
    skills: 59,
    followers: 120,
    publicRepos: 45,
  },

  // Skills Array (from /api/v1/users/me/skills)
  skills: [
    { name: 'TypeScript', category: 'LANGUAGE', isVerified: true, verifiedScore: 95 },
    { name: 'React', category: 'FRAMEWORK', isVerified: true, verifiedScore: 92 },
    { name: 'Node.js', category: 'FRAMEWORK', isVerified: true, verifiedScore: 88 },
    { name: 'PostgreSQL', category: 'DATABASE', isVerified: true, verifiedScore: 85 },
    { name: 'Docker', category: 'DEVOPS', isVerified: true, verifiedScore: 82 },
    { name: 'Next.js', category: 'FRAMEWORK', isVerified: true, verifiedScore: 90 },
    { name: 'Prisma', category: 'TOOL', isVerified: true, verifiedScore: 87 },
    { name: 'GraphQL', category: 'FRAMEWORK', isVerified: true, verifiedScore: 78 },
    { name: 'Redis', category: 'DATABASE', isVerified: true, verifiedScore: 75 },
    { name: 'Kubernetes', category: 'DEVOPS', isVerified: true, verifiedScore: 70 },
    { name: 'Go', category: 'LANGUAGE', isVerified: true, verifiedScore: 68 },
    { name: 'Python', category: 'LANGUAGE', isVerified: true, verifiedScore: 80 },
    { name: 'AWS', category: 'DEVOPS', isVerified: true, verifiedScore: 85 },
    { name: 'MongoDB', category: 'DATABASE', isVerified: false, verifiedScore: 0 },
    { name: 'Vue.js', category: 'FRAMEWORK', isVerified: false, verifiedScore: 0 },
  ],

  // Projects (from /api/v1/users/me/projects)
  projects: [
    {
      id: '1',
      name: 'verify-stack',
      description: 'AI-powered developer verification platform with microservices architecture',
      language: 'TypeScript',
      stars: 342,
      forks: 48,
      url: 'https://github.com/keshav-sudo/verify-stack',
      auraContribution: 80,
    },
    {
      id: '2',
      name: 'realtime-chat',
      description: 'Scalable real-time chat application using WebSockets and Redis',
      language: 'JavaScript',
      stars: 156,
      forks: 23,
      url: 'https://github.com/keshav-sudo/realtime-chat',
      auraContribution: 35,
    },
    {
      id: '3',
      name: 'ml-pipeline',
      description: 'End-to-end machine learning pipeline with automated training and deployment',
      language: 'Python',
      stars: 89,
      forks: 12,
      url: 'https://github.com/keshav-sudo/ml-pipeline',
      auraContribution: 27,
    },
  ],

  // GitHub Calendar (from GitHub API or backend)
  githubCalendar: generateMockCalendar('github'),

  // LeetCode Calendar (from LeetCode API)
  leetcodeCalendar: generateMockCalendar('leetcode'),
}

// Helper function to generate realistic calendar data
function generateMockCalendar(type: 'github' | 'leetcode'): Record<string, number> {
  const calendar: Record<string, number> = {}
  const today = new Date()
  
  for (let i = 364; i >= 0; i--) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]
    
    // Generate more realistic patterns
    const dayOfWeek = date.getDay()
    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
    
    if (type === 'github') {
      // GitHub: More active on weekdays
      if (isWeekend) {
        calendar[dateStr] = Math.random() > 0.7 ? Math.floor(Math.random() * 5) : 0
      } else {
        calendar[dateStr] = Math.random() > 0.2 ? Math.floor(Math.random() * 15) : 0
      }
    } else {
      // LeetCode: More active on weekends
      if (isWeekend) {
        calendar[dateStr] = Math.random() > 0.4 ? Math.floor(Math.random() * 8) : 0
      } else {
        calendar[dateStr] = Math.random() > 0.6 ? Math.floor(Math.random() * 4) : 0
      }
    }
  }
  
  return calendar
}

// Example Page Component
export default function ExampleProfilePage() {
  return <AntiGravityProfile data={sampleProfileData} />
}

// ============================================
// API INTEGRATION EXAMPLE
// ============================================

/*
// Real-world usage with API calls:

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import { get } from '@/api/client'
import AntiGravityProfile from '@/components/premium/AntiGravityProfile'

export default function PublicProfilePage() {
  const { username } = useParams()
  const [profileData, setProfileData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchProfile() {
      try {
        // Fetch all required data in parallel
        const [userRes, auraRes, skillsRes, projectsRes, githubStatsRes] = await Promise.all([
          get(`/users/u/${username}`),
          get(`/users/u/${username}/aura`),
          get(`/users/u/${username}/skills`),
          get(`/users/u/${username}/projects`),
          get(`/users/u/${username}/github-stats`),
        ])

        // Map API responses to component format
        const data = {
          aura: auraRes.data,
          profile: {
            name: userRes.data.name,
            username: userRes.data.username,
            avatarUrl: userRes.data.avatarUrl,
            bio: userRes.data.bio,
            location: userRes.data.location,
            company: userRes.data.company,
            website: userRes.data.website,
            githubUsername: userRes.data.githubUsername,
          },
          stats: {
            projects: projectsRes.data.length,
            skills: skillsRes.data.length,
            followers: userRes.data.followers,
            publicRepos: userRes.data.publicRepos,
          },
          skills: skillsRes.data,
          projects: projectsRes.data,
          githubCalendar: githubStatsRes.data?.submissionCalendar || {},
          leetcodeCalendar: userRes.data?.leetcodeStats?.submissionCalendar || {},
        }

        setProfileData(data)
      } catch (error) {
        console.error('Failed to fetch profile:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [username])

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (!profileData) {
    return <div className="flex items-center justify-center min-h-screen">Profile not found</div>
  }

  return <AntiGravityProfile data={profileData} />
}
*/
