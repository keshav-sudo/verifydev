"use client"

/**
 * InteractiveDashboardShowcase - Stable, optimized dashboard preview
 * NO framer-motion, NO animations, NO auto-rotate = NO flickering
 */

import { useState } from 'react'
import { BarChart3, Target, Users } from 'lucide-react'

import { AnalyticsPreview } from './analytics-preview'
import { JobMatchingPreview } from './job-matching-preview'
import { ProfilePreview } from './profile-preview'

const previews = [
  { name: 'Analytics', icon: BarChart3, color: 'bg-blue-600 hover:bg-blue-700', indicatorColor: 'bg-blue-600' },
  { name: 'Job Matching', icon: Target, color: 'bg-emerald-600 hover:bg-emerald-700', indicatorColor: 'bg-emerald-600' },
  { name: 'Profile', icon: Users, color: 'bg-purple-600 hover:bg-purple-700', indicatorColor: 'bg-purple-600' },
]

export function InteractiveDashboardShowcase() {
  const [activePreview, setActivePreview] = useState(0)
  
  return (
    <div className="relative">
      {/* Preview Selector - simple buttons, no animations */}
      <div className="flex justify-center gap-2 mb-8">
        {previews.map((preview, i) => (
          <button
            key={preview.name}
            onClick={() => setActivePreview(i)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${
              activePreview === i
                ? `${preview.color} text-white shadow-lg`
                : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground'
            }`}
          >
            <preview.icon className="w-4 h-4" />
            <span className="hidden sm:inline">{preview.name}</span>
          </button>
        ))}
      </div>
      
      {/* Preview Container - centered with proper spacing */}
      <div className="min-h-[640px] flex items-center justify-center py-4">
        {activePreview === 0 && <AnalyticsPreview />}
        {activePreview === 1 && <JobMatchingPreview />}
        {activePreview === 2 && <ProfilePreview />}
      </div>
      
      {/* Progress indicators - simple CSS, no animations */}
      <div className="flex justify-center gap-3 mt-8">
        {previews.map((preview, i) => (
          <button
            key={i}
            className={`h-1.5 rounded-full transition-all ${
              i === activePreview 
                ? `${preview.indicatorColor} w-12` 
                : 'bg-muted/50 w-4'
            }`}
            onClick={() => setActivePreview(i)}
            aria-label={`View ${preview.name} preview`}
          />
        ))}
      </div>
    </div>
  )
}

// Also export individual previews for direct use
export { AnalyticsPreview } from './analytics-preview'
export { JobMatchingPreview } from './job-matching-preview'
export { ProfilePreview } from './profile-preview'
