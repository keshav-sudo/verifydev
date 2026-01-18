"use client"

/**
 * AnimatedChart - Reusable animated line chart component
 * Features: Draw animation, hover effects, gradient fill, data points
 */

import { motion } from 'framer-motion'
import { useState } from 'react'

interface AnimatedChartProps {
  data?: number[]
  height?: number
  showTooltip?: boolean
  gradientId?: string
  primaryColor?: string
  label?: string
}

export function AnimatedChart({
  data = [20, 45, 30, 50, 35, 60, 45, 70, 55, 80, 65, 85],
  height = 100,
  showTooltip = true,
  gradientId = 'chartGradient',
  primaryColor = 'hsl(var(--primary))',
  label = '+27% Growth'
}: AnimatedChartProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [hoveredPoint, setHoveredPoint] = useState<number | null>(null)
  
  const width = 280
  const padding = 10
  const chartWidth = width - padding * 2
  const chartHeight = height - padding * 2
  
  const maxValue = Math.max(...data)
  const minValue = Math.min(...data)
  const range = maxValue - minValue || 1
  
  const getY = (value: number) => {
    return chartHeight - ((value - minValue) / range) * chartHeight + padding
  }
  
  const pathD = data.map((point, i) => {
    const x = (i / (data.length - 1)) * chartWidth + padding
    const y = getY(point)
    return i === 0 ? `M ${x} ${y}` : `L ${x} ${y}`
  }).join(' ')
  
  const areaPath = `${pathD} L ${chartWidth + padding} ${chartHeight + padding} L ${padding} ${chartHeight + padding} Z`

  return (
    <motion.div 
      className="relative w-full overflow-hidden rounded-xl bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 p-3 border border-border/20"
      style={{ height }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setHoveredPoint(null) }}
      whileHover={{ scale: 1.01 }}
    >
      <svg className="w-full h-full" viewBox={`0 0 ${width} ${height}`} preserveAspectRatio="none">
        {/* Grid lines with glow */}
        {[25, 50, 75].map((y) => (
          <motion.line
            key={y}
            x1={padding} y1={y} x2={width - padding} y2={y}
            stroke="hsl(var(--muted))"
            strokeWidth="0.5"
            strokeDasharray="4 4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            transition={{ delay: 0.5 }}
          />
        ))}
        
        {/* Gradient definitions */}
        <defs>
          <linearGradient id={gradientId} x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={primaryColor} stopOpacity={isHovered ? 0.4 : 0.25} />
            <stop offset="50%" stopColor={primaryColor} stopOpacity={isHovered ? 0.2 : 0.1} />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
          </linearGradient>
          <filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
            <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
            <feMerge>
              <feMergeNode in="coloredBlur"/>
              <feMergeNode in="SourceGraphic"/>
            </feMerge>
          </filter>
        </defs>
        
        {/* Area fill with animation */}
        <motion.path
          d={areaPath}
          fill={`url(#${gradientId})`}
          initial={{ opacity: 0, scaleY: 0 }}
          animate={{ opacity: 1, scaleY: 1 }}
          style={{ transformOrigin: 'bottom' }}
          transition={{ duration: 1, delay: 0.5 }}
        />
        
        {/* Main line with draw animation */}
        <motion.path
          d={pathD}
          fill="none"
          stroke={primaryColor}
          strokeWidth={isHovered ? 3 : 2}
          strokeLinecap="round"
          strokeLinejoin="round"
          filter={isHovered ? "url(#glow)" : undefined}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 2, ease: "easeOut" }}
        />
        
        {/* Interactive data points */}
        {data.map((point, i) => {
          const x = (i / (data.length - 1)) * chartWidth + padding
          const y = getY(point)
          const isActive = hoveredPoint === i
          
          return (
            <g key={i}>
              {/* Hover area */}
              <circle
                cx={x}
                cy={y}
                r={15}
                fill="transparent"
                onMouseEnter={() => setHoveredPoint(i)}
                style={{ cursor: 'pointer' }}
              />
              
              {/* Point with animation */}
              <motion.circle
                cx={x}
                cy={y}
                fill={primaryColor}
                initial={{ r: 0, opacity: 0 }}
                animate={{ 
                  r: isActive ? 6 : (i === data.length - 1 ? 4 : 0),
                  opacity: isActive || i === data.length - 1 ? 1 : 0
                }}
                transition={{ duration: 0.2 }}
              />
              
              {/* Pulse effect on last point */}
              {i === data.length - 1 && (
                <motion.circle
                  cx={x}
                  cy={y}
                  r={4}
                  fill={primaryColor}
                  initial={{ opacity: 0.6, scale: 1 }}
                  animate={{ opacity: 0, scale: 3 }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                />
              )}
              
              {/* Tooltip */}
              {isActive && showTooltip && (
                <motion.g
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <rect
                    x={x - 20}
                    y={y - 30}
                    width={40}
                    height={20}
                    rx={4}
                    fill="hsl(var(--card))"
                    stroke="hsl(var(--border))"
                    strokeWidth={0.5}
                  />
                  <text
                    x={x}
                    y={y - 16}
                    textAnchor="middle"
                    fill="hsl(var(--foreground))"
                    fontSize={10}
                    fontWeight={600}
                  >
                    {point}%
                  </text>
                </motion.g>
              )}
            </g>
          )
        })}
      </svg>
      
      {/* Floating label */}
      <motion.div 
        className="absolute top-2 right-2 px-2.5 py-1 rounded-lg bg-primary/10 border border-primary/20 text-primary text-xs font-bold backdrop-blur-sm"
        animate={{ 
          y: isHovered ? -2 : 0,
          scale: isHovered ? 1.05 : 1
        }}
        transition={{ type: 'spring', stiffness: 300 }}
      >
        {label}
      </motion.div>
    </motion.div>
  )
}
