"use client"

/**
 * ActivityHeatmap - GitHub-style contribution heatmap
 * Features: Interactive cells, hover effects, intensity color coding
 */

import { motion } from 'framer-motion'
import { useState } from 'react'

interface ActivityHeatmapProps {
  weeks?: number
  days?: number
  intensity?: number[][]
}

export function ActivityHeatmap({
  weeks = 8,
  days = 7,
}: ActivityHeatmapProps) {
  const [hoveredCell, setHoveredCell] = useState<{week: number, day: number} | null>(null)
  
  const getIntensity = (week: number, day: number) => {
    // Generate pseudo-random but consistent intensity
    const seed = (week * 7 + day) * 13 % 100
    if (seed < 20) return 0
    if (seed < 40) return 1
    if (seed < 60) return 2
    if (seed < 80) return 3
    return 4
  }
  
  const intensityColors = [
    'bg-muted/30',
    'bg-primary/20',
    'bg-primary/40',
    'bg-primary/60',
    'bg-primary/80',
  ]
  
  const intensityLabels = ['No activity', '1-3 commits', '4-7 commits', '8-12 commits', '13+ commits']
  
  return (
    <motion.div 
      className="space-y-2"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.3 }}
    >
      <div className="flex gap-[3px]">
        {Array.from({ length: weeks }).map((_, weekIndex) => (
          <div key={weekIndex} className="flex flex-col gap-[3px]">
            {Array.from({ length: days }).map((_, dayIndex) => {
              const intensity = getIntensity(weekIndex, dayIndex)
              const isHovered = hoveredCell?.week === weekIndex && hoveredCell?.day === dayIndex
              
              return (
                <motion.div
                  key={dayIndex}
                  className={`w-3 h-3 rounded-sm cursor-pointer transition-all ${intensityColors[intensity]}`}
                  onMouseEnter={() => setHoveredCell({ week: weekIndex, day: dayIndex })}
                  onMouseLeave={() => setHoveredCell(null)}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  whileHover={{ scale: 1.4, zIndex: 10 }}
                  transition={{ 
                    delay: (weekIndex * 7 + dayIndex) * 0.008,
                    duration: 0.15
                  }}
                  style={{
                    boxShadow: isHovered 
                      ? '0 0 12px hsl(var(--primary) / 0.6), 0 0 4px hsl(var(--primary) / 0.4)' 
                      : 'none'
                  }}
                />
              )
            })}
          </div>
        ))}
      </div>
      
      {/* Legend */}
      <div className="flex items-center justify-between text-[9px] text-muted-foreground pt-1">
        <span>Less</span>
        <div className="flex gap-1">
          {intensityColors.map((color, i) => (
            <motion.div 
              key={i} 
              className={`w-2.5 h-2.5 rounded-sm ${color} cursor-pointer`}
              whileHover={{ scale: 1.3 }}
              title={intensityLabels[i]}
            />
          ))}
        </div>
        <span>More</span>
      </div>
      
      {/* Tooltip */}
      {hoveredCell && (
        <motion.div
          className="absolute -top-8 left-1/2 -translate-x-1/2 px-2 py-1 rounded-md bg-card border border-border text-[10px] text-foreground whitespace-nowrap shadow-lg z-20"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {intensityLabels[getIntensity(hoveredCell.week, hoveredCell.day)]}
        </motion.div>
      )}
    </motion.div>
  )
}
