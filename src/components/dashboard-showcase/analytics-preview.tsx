"use client"

/**
 * AnalyticsPreview - Analytics dashboard preview component
 * Features: AURA score, skill radar, metrics, chart, activity heatmap
 */

import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import { 
  Award, TrendingUp, Code2, Activity, Rocket, 
  Flame, BarChart3, Sparkles, Zap
} from 'lucide-react'
import { AnimatedChart, SkillRadar, ActivityHeatmap } from './shared'

// Animated counter hook
function useAnimatedCounter(end: number, duration: number = 2000, delay: number = 0) {
  const [count, setCount] = useState(0)
  
  useEffect(() => {
    const timeout = setTimeout(() => {
      let startTime: number
      let animationFrame: number
      
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp
        const progress = Math.min((timestamp - startTime) / duration, 1)
        setCount(Math.floor(progress * end))
        
        if (progress < 1) {
          animationFrame = requestAnimationFrame(animate)
        }
      }
      
      animationFrame = requestAnimationFrame(animate)
      return () => cancelAnimationFrame(animationFrame)
    }, delay)
    
    return () => clearTimeout(timeout)
  }, [end, duration, delay])
  
  return count
}

export function AnalyticsPreview() {
  const auraScore = useAnimatedCounter(847, 2000, 500)
  const [activeMetric, setActiveMetric] = useState(0)
  
  const metrics = [
    { label: 'Code Quality', value: 94, icon: Code2, color: 'text-blue-500', gradient: 'from-blue-500/20 to-blue-500/5' },
    { label: 'Consistency', value: 87, icon: Activity, color: 'text-green-500', gradient: 'from-green-500/20 to-green-500/5' },
    { label: 'Innovation', value: 92, icon: Rocket, color: 'text-purple-500', gradient: 'from-purple-500/20 to-purple-500/5' },
  ]
  
  return (
    <motion.div 
      className="relative w-[480px] h-[600px] mx-auto"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
    >
      {/* Enhanced depth with stronger shadows */}
      <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 via-purple-600/20 to-pink-600/20 rounded-2xl blur-xl opacity-50" />
      
      <div className="relative rounded-2xl border-2 border-border/80 bg-card/98 backdrop-blur-2xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)] dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.6)] overflow-hidden h-full">
        {/* Window controls */}
        <div className="flex items-center justify-between p-4 border-b border-border/40">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <div className="w-3 h-3 rounded-full bg-green-500" />
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <BarChart3 className="w-3 h-3 text-primary" />
            <span className="font-medium">Analytics Dashboard</span>
          </div>
          <div className="w-16" />
        </div>
        
        <div className="p-4 space-y-4">
          {/* AURA Score Hero - optimized */}
          <motion.div 
            className="relative p-5 rounded-xl bg-card border-2 border-border overflow-hidden"
            whileHover={{ scale: 1.01 }}
          >
            <div className="relative flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Award className="w-5 h-5 text-primary" />
                  <span className="text-sm font-semibold">AURA Score</span>
                  <Sparkles className="w-3 h-3 text-amber-400" />
                </div>
                <motion.div 
                  className="text-5xl font-black text-foreground"
                  initial={{ scale: 0.5 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                >
                  {auraScore}
                </motion.div>
                <div className="flex items-center gap-1 text-xs text-emerald-500 mt-2">
                  <TrendingUp className="w-3 h-3" />
                  <span className="font-medium">Top 5% globally</span>
                  <Zap className="w-3 h-3 ml-1 text-amber-500" />
                </div>
              </div>
              <SkillRadar size={120} />
            </div>
          </motion.div>
          
          {/* Metrics Row - optimized */}
          <div className="grid grid-cols-3 gap-3">
            {metrics.map((metric, i) => (
              <motion.div
                key={metric.label}
                className={`relative p-3 rounded-xl cursor-pointer transition-all ${
                  activeMetric === i 
                    ? 'bg-gradient-to-br ' + metric.gradient + ' border border-primary/30' 
                    : 'bg-muted/30 border border-transparent hover:border-border/50'
                }`}
                onClick={() => setActiveMetric(i)}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1 }}
              >
                <metric.icon className={`w-4 h-4 ${metric.color} mb-2`} />
                <div className="text-xl font-bold">{metric.value}%</div>
                <div className="text-[10px] text-muted-foreground">{metric.label}</div>
              </motion.div>
            ))}
          </div>
          
          {/* Chart */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Skill Growth Trend</span>
              <Flame className="w-4 h-4 text-orange-500" />
            </div>
            <AnimatedChart />
          </div>
          
          {/* Activity Heatmap */}
          <div className="space-y-2 relative">
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-muted-foreground">Coding Activity</span>
              <Activity className="w-4 h-4 text-green-500" />
            </div>
            <ActivityHeatmap />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
