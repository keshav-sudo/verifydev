"use client"

/**
 * SkillRadar - Animated radar/spider chart for skills visualization
 * Features: Animated polygon, pulsing data points, skill labels
 */

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export interface SkillData {
  name: string
  value: number
  angle?: number
}

interface SkillRadarProps {
  skills?: SkillData[]
  size?: number
  animated?: boolean
  showLabels?: boolean
  primaryColor?: string
}

export function SkillRadar({
  skills = [
    { name: 'Frontend', value: 90 },
    { name: 'Backend', value: 85 },
    { name: 'DevOps', value: 70 },
    { name: 'Mobile', value: 65 },
    { name: 'AI/ML', value: 75 },
    { name: 'Database', value: 80 },
  ],
  size = 140,
  animated = true,
  showLabels = true,
  primaryColor = 'hsl(var(--primary))'
}: SkillRadarProps) {
  const [isAnimated, setIsAnimated] = useState(false)
  const [hoveredSkill, setHoveredSkill] = useState<number | null>(null)
  
  // Calculate angles for each skill
  const skillsWithAngles = skills.map((skill, i) => ({
    ...skill,
    angle: (360 / skills.length) * i
  }))
  
  useEffect(() => {
    if (animated) {
      const timer = setTimeout(() => setIsAnimated(true), 500)
      return () => clearTimeout(timer)
    } else {
      setIsAnimated(true)
    }
  }, [animated])
  
  const center = 50
  const maxRadius = 40
  
  const getPoint = (value: number, angle: number) => {
    const radian = (angle - 90) * (Math.PI / 180)
    const radius = (value / 100) * maxRadius
    return {
      x: center + radius * Math.cos(radian),
      y: center + radius * Math.sin(radian)
    }
  }
  
  const polygonPoints = skillsWithAngles.map(s => {
    const p = getPoint(isAnimated ? s.value : 0, s.angle)
    return `${p.x},${p.y}`
  }).join(' ')

  return (
    <motion.div 
      className="relative mx-auto"
      style={{ width: size, height: size }}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <svg viewBox="0 0 100 100" className="w-full h-full">
        {/* Gradient definitions */}
        <defs>
          <radialGradient id="radarGlow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor={primaryColor} stopOpacity="0.3" />
            <stop offset="100%" stopColor={primaryColor} stopOpacity="0" />
          </radialGradient>
          <filter id="radarBlur">
            <feGaussianBlur stdDeviation="2" />
          </filter>
        </defs>
        
        {/* Background glow */}
        <circle 
          cx={center} cy={center} r={maxRadius} 
          fill="url(#radarGlow)" 
          filter="url(#radarBlur)"
        />
        
        {/* Background rings */}
        {[20, 40, 60, 80, 100].map((r, i) => (
          <motion.circle
            key={r}
            cx={center} cy={center} r={r * 0.4}
            fill="none"
            stroke="hsl(var(--muted))"
            strokeWidth="0.5"
            opacity={0.4}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 0.4 }}
            transition={{ delay: i * 0.08, duration: 0.3 }}
          />
        ))}
        
        {/* Axis lines */}
        {skillsWithAngles.map((skill, i) => {
          const end = getPoint(100, skill.angle)
          return (
            <motion.line
              key={i}
              x1={center} y1={center}
              x2={end.x} y2={end.y}
              stroke="hsl(var(--muted))"
              strokeWidth="0.5"
              opacity={0.4}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.3 + i * 0.08, duration: 0.4 }}
            />
          )
        })}
        
        {/* Data polygon with glow */}
        <motion.polygon
          points={polygonPoints}
          fill={primaryColor}
          fillOpacity={0.15}
          stroke={primaryColor}
          strokeWidth="2"
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          style={{ filter: 'drop-shadow(0 0 6px hsl(var(--primary) / 0.5))' }}
        />
        
        {/* Data points */}
        {skillsWithAngles.map((skill, i) => {
          const p = getPoint(isAnimated ? skill.value : 0, skill.angle)
          const isHovered = hoveredSkill === i
          
          return (
            <g key={i}>
              {/* Hover area */}
              <circle
                cx={p.x}
                cy={p.y}
                r={8}
                fill="transparent"
                onMouseEnter={() => setHoveredSkill(i)}
                onMouseLeave={() => setHoveredSkill(null)}
                style={{ cursor: 'pointer' }}
              />
              
              {/* Point */}
              <motion.circle
                cx={p.x}
                cy={p.y}
                r={isHovered ? 5 : 3}
                fill={primaryColor}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1 + i * 0.1, type: 'spring' }}
                style={{ 
                  filter: isHovered ? 'drop-shadow(0 0 8px hsl(var(--primary)))' : undefined 
                }}
              />
              
              {/* Pulse on hover */}
              {isHovered && (
                <motion.circle
                  cx={p.x}
                  cy={p.y}
                  r={3}
                  fill={primaryColor}
                  initial={{ opacity: 0.6, scale: 1 }}
                  animate={{ opacity: 0, scale: 2.5 }}
                  transition={{ duration: 0.8, repeat: Infinity }}
                />
              )}
            </g>
          )
        })}
      </svg>
      
      {/* Skill labels */}
      {showLabels && skillsWithAngles.map((skill, i) => {
        const labelPoint = getPoint(125, skill.angle)
        const isHovered = hoveredSkill === i
        
        return (
          <motion.div
            key={i}
            className={`absolute text-[8px] font-medium whitespace-nowrap transition-colors ${
              isHovered ? 'text-primary' : 'text-muted-foreground'
            }`}
            style={{
              left: `${labelPoint.x}%`,
              top: `${labelPoint.y}%`,
              transform: 'translate(-50%, -50%)'
            }}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 + i * 0.1 }}
          >
            {skill.name}
            {isHovered && (
              <motion.span 
                className="ml-1 text-primary font-bold"
                initial={{ opacity: 0, x: -5 }}
                animate={{ opacity: 1, x: 0 }}
              >
                {skill.value}%
              </motion.span>
            )}
          </motion.div>
        )
      })}
    </motion.div>
  )
}
