# Premium Developer Public Profile Component

## 🎨 Flux Design System Implementation

A comprehensive, ultra-responsive developer profile component built with React, TypeScript, and Tailwind CSS. Strictly adheres to the "Flux" premium design aesthetic with Neon Lime and Soft Purple brand accents.

## ✨ Key Features

### 🌊 Fluid Architecture
- **Responsive Grid System**: Perfect scaling from mobile (320px) to 500% zoom
- **No Fixed Dimensions**: Uses `w-full max-w-[1400px]` for fluid containers
- **CSS Grid Layouts**: `grid-cols-1 md:grid-cols-2 lg:grid-cols-3` for automatic stacking

### 🎯 Design DNA
- **Component Geometry**: Extreme border-radius (`rounded-[30px]` for cards, `rounded-full` for pills)
- **Typography**: Strictly `Plus Jakarta Sans` with stark contrast (Jet Black headings, Slate Gray subtitles)
- **Color Palette**:
  - Primary Dark: `#1A1A1A`
  - Primary Light: White cards with `shadow-sm`
  - Neon Lime: `#ADFF2F` (primary accent)
  - Soft Purple: `#A78BFA` (secondary accent)

### 📊 Dynamic Data Mapping

#### Profile Hero Section
- Avatar with gradient fallback
- User name, username, and verified badge
- Tag pills with category-specific colors
- Prominent Aura Score display with Neon Lime glow
- Quick stats grid (Projects, Stars, Followers)

#### Premium Dark Aura Card
- **CRUCIAL**: Dark mode card (`bg-[#1A1A1A]`) standing out against light background
- Neon Lime progress bars for score breakdown
- Animated progress indicators
- Trend display with icons

#### Navigation Tabs
- Horizontally scrollable pill navigation
- Active tab: Dark pill (`bg-[#1A1A1A] text-white`)
- Inactive tabs: Gray text with hover effects
- Tabs: Overview, Skills, Projects, GitHub, LeetCode

#### Skills Cloud
- Category-specific color coding:
  - `LANGUAGE`: Lime
  - `FRAMEWORK`: Purple
  - `DATABASE`: Blue
  - `DEVOPS`: Orange
  - `TOOL`: Teal
- Neon Lime checkmark for verified skills
- Confidence scores displayed as percentages

#### Projects Grid
- Fluid responsive grid
- Circular progress rings (SVG) showing Aura contribution
- Soft Purple/Neon Lime gradient progress
- Language indicators, stars, and forks
- Hover effects with smooth transitions

#### GitHub & LeetCode Heatmaps
- **NO DEFAULT BLUE/GREEN**: Custom brand colors
- GitHub: Soft Purple gradient (`bg-purple-200` to `bg-purple-600`)
- LeetCode: Neon Lime gradient (`bg-lime-200` to `bg-lime-600`)
- Contribution density visualization
- Interactive hover states

## 🚀 Usage

### Basic Implementation

```tsx
import PublicProfileV2 from '@/views/public-profile-v2'

const profileData = {
  user: {
    name: "John Doe",
    username: "johndoe",
    email: "john@example.com",
    avatarUrl: "https://...",
    bio: "Full-stack developer...",
    location: "San Francisco, CA",
    company: "Tech Corp",
    website: "https://johndoe.dev",
    tags: ["Full Stack", "AI/ML"],
    auraScore: 724,
    publicRepos: 42,
    followers: 1250
  },
  aura: {
    total: 724,
    level: "Elite",
    trend: "rising",
    percentile: 5,
    breakdown: {
      profile: 145,
      projects: 220,
      skills: 180,
      activity: 95,
      github: 84
    }
  },
  skills: [
    {
      name: "TypeScript",
      category: "LANGUAGE",
      isVerified: true,
      verifiedScore: 95
    }
    // ... more skills
  ],
  projects: [
    {
      id: "1",
      name: "AI Code Analyzer",
      repoName: "ai-code-analyzer",
      description: "Advanced static analysis tool...",
      language: "TypeScript",
      stars: 2847,
      forks: 342,
      auraContribution: 74,
      url: "https://github.com/..."
    }
    // ... more projects
  ],
  githubStats: {
    username: "johndoe",
    submissionCalendar: {
      "2024-01-01": 5,
      "2024-01-02": 12,
      // ... more dates
    }
  },
  leetcodeStats: {
    username: "johndoe",
    totalSolved: 487,
    easySolved: 142,
    mediumSolved: 268,
    hardSolved: 77,
    ranking: 12458,
    acceptanceRate: 78.5,
    contributionPoints: 2847,
    reputation: 1523,
    submissionCalendar: { /* ... */ }
  }
}

export default function ProfilePage() {
  return <PublicProfileV2 data={profileData} />
}
```

### Demo Page

Visit `/demo/profile` to see the component with sample data.

## 📐 Component Architecture

### Main Components

1. **PublicProfileV2** (Main Container)
   - Fluid responsive wrapper
   - Tab state management
   - Data distribution to child sections

2. **ContributionHeatmap**
   - Custom heatmap with brand colors
   - Weekly grouping
   - Interactive hover states
   - Type-specific color schemes

3. **CircularProgress**
   - SVG-based progress ring
   - Gradient stroke (Purple to Lime)
   - Animated transitions
   - Configurable size

### Utility Functions

- `getInitials(name)`: Extract initials from name
- `formatNumber(num)`: Format numbers with K/M suffixes
- `getLanguageColor(lang)`: Get color for programming languages

## 🎨 Design Tokens

### Border Radius
- Cards: `rounded-[30px]`
- Small cards: `rounded-[24px]` or `rounded-[20px]`
- Pills/Buttons: `rounded-full`
- Icons: `rounded-xl`

### Spacing Scale
- Container padding: `px-4 sm:px-6 lg:px-8`
- Card padding: `p-6 sm:p-8 lg:p-10`
- Grid gaps: `gap-4`, `gap-6`
- Section spacing: `space-y-6`

### Typography Scale
- Hero heading: `text-3xl sm:text-4xl`
- Section heading: `text-xl` or `text-2xl`
- Body text: `text-sm` or `text-base`
- Labels: `text-xs`
- Font weight: `font-black` for numbers, `font-bold` for headings

### Color System
```css
/* Primary */
--primary-dark: #1A1A1A;
--primary-light: #FFFFFF;

/* Accents */
--neon-lime: #ADFF2F;
--soft-purple: #A78BFA;

/* Grays */
--gray-50: #F9FAFB;
--gray-100: #F3F4F6;
--gray-500: #6B7280;
--gray-900: #111827;
```

## 🔧 Customization

### Skill Categories

Add or modify skill category colors in the `skillCategoryColors` object:

```tsx
const skillCategoryColors = {
  LANGUAGE: { bg: 'bg-lime-50', text: 'text-lime-700', border: 'border-lime-200' },
  FRAMEWORK: { bg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200' },
  // Add custom categories...
}
```

### Heatmap Colors

Modify the `getColor` function in `ContributionHeatmap` to customize intensity colors.

### Progress Ring

Adjust the gradient in `CircularProgress`:

```tsx
<linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
  <stop offset="0%" stopColor="#A78BFA" /> {/* Soft Purple */}
  <stop offset="100%" stopColor="#ADFF2F" /> {/* Neon Lime */}
</linearGradient>
```

## 📱 Responsive Breakpoints

- Mobile: `< 640px` (sm)
- Tablet: `640px - 1024px` (md)
- Desktop: `1024px+` (lg)
- Max width: `1400px`

## ♿ Accessibility

- Semantic HTML structure
- ARIA labels on interactive elements
- Keyboard navigation support
- Sufficient color contrast ratios
- Focus indicators on all interactive elements

## 🚀 Performance

- Framer Motion for smooth animations
- Lazy loading of tab content
- Optimized re-renders with React hooks
- Efficient calendar data processing

## 📦 Dependencies

```json
{
  "react": "^18.x",
  "framer-motion": "^10.x",
  "lucide-react": "^0.x",
  "tailwindcss": "^3.x"
}
```

## 🎯 Best Practices

1. **Always use fluid containers**: Never set fixed widths
2. **Test at 500% zoom**: Ensure perfect scaling
3. **Maintain brand colors**: Stick to Neon Lime and Soft Purple
4. **Use extreme border-radius**: `rounded-[30px]` for premium feel
5. **Dark Aura card is crucial**: Must stand out with `bg-[#1A1A1A]`

## 🐛 Troubleshooting

### Layout breaks at high zoom
- Ensure no fixed widths are used
- Check that grids use responsive columns
- Verify padding scales properly

### Colors look off
- Confirm Tailwind config includes custom colors
- Check that brand colors are used consistently
- Verify gradient definitions

### Heatmap not rendering
- Ensure calendar data is in correct format
- Check date string format (YYYY-MM-DD)
- Verify data is not empty

## 📄 License

MIT License - VerifyDev 2024
