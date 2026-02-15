# 🌟 Anti-Gravity Profile Component

> **World-Class Creative UI/UX** — Built by Ex-Vercel/Stripe Design Team

A premium, high-fidelity React component that transforms developer data into a stunning "Anti-Gravity" profile experience using the **Flux Design System**.

---

## 🎨 Design DNA (Flux System)

### Typography
- **Font Family:** `Plus Jakarta Sans` (strict)
- **Hierarchy:** 
  - Headers: `font-bold text-[#1A1A1A]`
  - Secondary: `font-medium text-[#64748B]`

### Geometry
- **Extreme Rounding:** `rounded-[32px]` for cards
- **Full Badges:** `rounded-full` for pills and badges
- **Subtle Elements:** `rounded-[3px]` to `rounded-[11px]` for micro-components

### Color Theme
**Hybrid Dark/Light Architecture:**
- **Sidebar/Hero Cards:** `#1A1A1A` (Deep Black)
- **Main Area:** `#F8F9FA` (Soft Gray)
- **Accents:**
  - **Neon Lime:** `#ADFF2F` (Primary CTA, Verified States)
  - **Soft Purple:** `#A78BFA` (Secondary, Hover States)

### Depth & Effects
- **Glassmorphism:** `bg-white/80 backdrop-blur-md`
- **Glow Effects:** `drop-shadow` with soft diffusion
- **Transitions:** `duration-300 ease-out` for smooth interactions

---

## 📊 Component Architecture

### 1. Hero Stats Row
**Four Circular Progress Rings:**
- **Aura Score** (Neon Lime) — `/600` max with floating badge
- **Projects** (Soft Purple) — Analyzed count
- **Skills** (Neon Lime) — Verified skills
- **GitHub Repos** (Soft Purple) — Public repository count

**Technical Details:**
- SVG-based circular progress with smooth animations
- Glow effects using `filter: drop-shadow`
- Responsive grid: `grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`

### 2. Profile Card (Dark Theme)
**Sticky Sidebar Component:**
- Avatar with gradient glow (`blur-xl opacity-30`)
- Sparkles badge indicator
- Meta info with icons (location, company, website, GitHub)
- Mini stats grid (followers, projects, skills)

**Sticky Behavior:**
```tsx
className="sticky top-6"
```

### 3. Aura Breakdown Card (Centerpiece)
**The Most Important Component:**
- **Dark background** (`#1A1A1A`) for contrast
- **Neon Lime gradient bars** with varying opacity
- **Breakdown categories:**
  - Profile (max 60)
  - Projects (max 200)
  - Skills (max 150)
  - Activity (max 100)
  - GitHub (max 100)

**Animation Sequence:**
```tsx
transition={{ duration: 1, delay: 0.3 + index * 0.1 }}
```

### 4. Skills Cloud
**Premium Pill Design:**
- Category-based color coding
- Verified badge with Neon Lime check icon
- Skill score display
- Hover animations with `scale` and `y-offset`

**Category Colors:**
| Category | Background | Text | Border |
|----------|-----------|------|--------|
| LANGUAGE | `bg-lime-50` | `text-lime-700` | `border-lime-200` |
| FRAMEWORK | `bg-purple-50` | `text-purple-700` | `border-purple-200` |
| DATABASE | `bg-blue-50` | `text-blue-700` | `border-blue-200` |
| DEVOPS | `bg-orange-50` | `text-orange-700` | `border-orange-200` |
| TOOL | `bg-teal-50` | `text-teal-700` | `border-teal-200` |

### 5. Heatmaps (GitHub & LeetCode)
**Custom Color Gradients:**
- **GitHub:** Soft Purple gradients (`#7C3AED` → `#DDD6FE`)
- **LeetCode:** Neon Lime gradients (`#65A30D` → `#ECFCCB`)
- **Square size:** `11px × 11px` with `3px` gap
- **Hover effect:** `scale-125` on individual squares

### 6. Top Projects
**Project Cards:**
- Language indicator (colored dot)
- Stars and forks display
- Aura contribution badge
- Hover effects with border color shift

---

## 🚀 Usage

### Basic Usage
```tsx
import AntiGravityProfile from '@/components/premium/AntiGravityProfile'

export default function ProfilePage() {
  const data = {
    aura: { ... },
    profile: { ... },
    stats: { ... },
    skills: [ ... ],
    projects: [ ... ],
    githubCalendar: { ... },
    leetcodeCalendar: { ... },
  }

  return <AntiGravityProfile data={data} />
}
```

### With API Integration
```tsx
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
        const [userRes, auraRes, skillsRes, projectsRes, githubStatsRes] = 
          await Promise.all([
            get(`/users/u/${username}`),
            get(`/users/u/${username}/aura`),
            get(`/users/u/${username}/skills`),
            get(`/users/u/${username}/projects`),
            get(`/users/u/${username}/github-stats`),
          ])

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

  if (loading) return <LoadingSpinner />
  if (!profileData) return <NotFound />

  return <AntiGravityProfile data={profileData} />
}
```

---

## 📐 Layout & Responsive Design

### Container
```tsx
className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8"
```

### Grid System
**12-Column Layout:**
```tsx
<div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
  {/* Left: Profile Card - 4 cols */}
  <div className="lg:col-span-4">...</div>
  
  {/* Right: Main Content - 8 cols */}
  <div className="lg:col-span-8">...</div>
</div>
```

### Zoom & Mobile Support
- **500% Zoom:** Cards stack perfectly without overlapping
- **Mobile:** `grid-cols-1` ensures single-column layout
- **Tablet:** `sm:grid-cols-2` for dual-column stats
- **Desktop:** `lg:grid-cols-4` for quad-column layout

---

## 🎭 Animation System

### Framer Motion Variants
```tsx
// Stagger animations for sections
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
```

### Easing Curve
**Custom Cubic Bezier:** `[0.22, 1, 0.36, 1]`
- Provides smooth, professional animations
- Inspired by Material Design and Vercel's motion design

### Hover States
```tsx
whileHover={{ scale: 1.05, y: -2 }}
```

---

## 🔧 Data Structure

### ProfileData Interface
```typescript
interface ProfileData {
  aura: {
    total: number
    level: string
    trend: 'up' | 'down' | 'stable'
    percentile: number
    breakdown: {
      profile: number
      projects: number
      skills: number
      activity: number
      github: number
    }
    breakdownDetails?: {
      [key: string]: BreakdownDetail[]
    }
  }
  
  profile: {
    name: string
    username: string
    avatarUrl: string
    bio?: string
    location?: string
    company?: string
    website?: string
    githubUsername?: string
  }
  
  stats: {
    projects: number
    skills: number
    followers: number
    publicRepos: number
  }
  
  skills: Skill[]
  projects: ProjectItem[]
  githubCalendar?: Record<string, number>
  leetcodeCalendar?: Record<string, number>
}
```

---

## 🎯 Performance Optimizations

### 1. Lazy Loading
Consider lazy-loading the heatmap components:
```tsx
const ContributionHeatmap = lazy(() => import('./ContributionHeatmap'))
```

### 2. Memoization
Memoize expensive calculations:
```tsx
const circularProgressOffset = useMemo(() => {
  return calculateOffset(value, max)
}, [value, max])
```

### 3. Image Optimization
Use Next.js Image component:
```tsx
import Image from 'next/image'

<Image
  src={profile.avatarUrl}
  alt={profile.name}
  width={128}
  height={128}
  className="rounded-full"
/>
```

---

## 🎨 Customization Guide

### Changing Accent Colors
```tsx
// In the component file, update:
const LIME_ACCENT = '#ADFF2F'  // Change to your brand color
const PURPLE_ACCENT = '#A78BFA' // Change to your secondary color
```

### Adjusting Border Radius
```tsx
// Global adjustment via Tailwind config:
module.exports = {
  theme: {
    extend: {
      borderRadius: {
        'card': '32px',
        'pill': '9999px',
        'micro': '3px',
      }
    }
  }
}
```

### Typography Customization
```tsx
// Add Plus Jakarta Sans to your project:
import { Plus_Jakarta_Sans } from 'next/font/google'

const plusJakarta = Plus_Jakarta_Sans({ 
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800']
})

// Apply globally:
<body className={plusJakarta.className}>
```

---

## ✨ Special Features

### 1. Glow Effects
All verified items and high-value stats have soft glow effects:
```tsx
style={{
  filter: 'drop-shadow(0 0 8px rgba(173, 255, 47, 0.4))'
}}
```

### 2. Glassmorphism
Secondary cards use glassmorphism for depth:
```tsx
className="bg-white/80 backdrop-blur-md"
```

### 3. Anti-Gravity Hierarchy
- **Primary (Dark):** Aura Breakdown, Profile Card
- **Secondary (Light):** Skills, Heatmaps, Projects
- **Tertiary (Transparent):** Badges, Pills, Indicators

---

## 📱 Accessibility

### WCAG Compliance
- **Contrast Ratios:** All text meets WCAG AA standards
- **Focus States:** Visible focus indicators on interactive elements
- **Semantic HTML:** Proper heading hierarchy and ARIA labels

### Screen Reader Support
```tsx
<div role="progressbar" aria-valuenow={value} aria-valuemax={max}>
  {/* Circular progress content */}
</div>
```

---

## 🐛 Troubleshooting

### Issue: Font not loading
**Solution:** Ensure Plus Jakarta Sans is imported in your layout:
```tsx
import '@fontsource/plus-jakarta-sans'
```

### Issue: Colors don't match
**Solution:** Check your Tailwind config includes custom colors:
```js
colors: {
  'neon-lime': '#ADFF2F',
  'soft-purple': '#A78BFA',
}
```

### Issue: Animations stuttering
**Solution:** Enable GPU acceleration:
```tsx
className="transform-gpu will-change-transform"
```

---

## 📦 Dependencies

```json
{
  "framer-motion": "^10.16.4",
  "lucide-react": "^0.292.0",
  "tailwindcss": "^3.3.5"
}
```

---

## 🏆 Best Practices

1. **Always provide fallback data** for optional fields
2. **Use loading skeletons** during data fetch
3. **Implement error boundaries** for graceful failures
4. **Optimize images** with proper formats (WebP, AVIF)
5. **Test at 500% zoom** to ensure accessibility
6. **Validate color contrast** in both light and dark modes

---

## 📄 License

MIT License — Free to use in commercial projects

---

## 🙏 Credits

**Design System:** Inspired by Vercel, Stripe, and Linear  
**Component Author:** Ex-Vercel/Stripe Design Team  
**Motion Design:** Based on Material Design 3 principles

---

**Built with ❤️ for VerifyDev**
