"use client"

/**
 * JobCard - Interactive job listing card with premium animations
 * Features: Match score badge, like/save, smooth hover effects
 */

import { motion } from 'framer-motion'
import { useState } from 'react'
import { MapPin, DollarSign, Heart, Bookmark, Building2, Clock, Users } from 'lucide-react'

export interface JobCardProps {
  company: string
  role: string
  location: string
  salary: string
  match: number
  logo: string
  tags: string[]
  delay?: number
  applicants?: number
  postedTime?: string
}

export function JobCard({ 
  company, 
  role, 
  location, 
  salary, 
  match, 
  logo, 
  tags, 
  delay = 0,
  applicants = 42,
  postedTime = '2d ago'
}: JobCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [isSaved, setIsSaved] = useState(false)
  const [isHovered, setIsHovered] = useState(false)
  
  const getMatchColor = () => {
    if (match >= 90) return { bg: 'bg-emerald-500/15', text: 'text-emerald-500', border: 'border-emerald-500/30' }
    if (match >= 80) return { bg: 'bg-primary/15', text: 'text-primary', border: 'border-primary/30' }
    if (match >= 70) return { bg: 'bg-amber-500/15', text: 'text-amber-500', border: 'border-amber-500/30' }
    return { bg: 'bg-muted', text: 'text-muted-foreground', border: 'border-border' }
  }
  
  const matchStyle = getMatchColor()
  
  return (
    <motion.div
      className="relative p-4 rounded-xl bg-card/80 border border-border/50 hover:border-primary/40 transition-all cursor-pointer group overflow-hidden"
      initial={{ opacity: 0, x: 30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      whileHover={{ scale: 1.02, y: -3 }}
      whileTap={{ scale: 0.99 }}
    >
      {/* Background gradient on hover */}
      <motion.div 
        className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-purple-500/5"
        initial={{ opacity: 0 }}
        animate={{ opacity: isHovered ? 1 : 0 }}
        transition={{ duration: 0.3 }}
      />
      
      <div className="relative flex items-start gap-3">
        {/* Company Logo */}
        <motion.div 
          className="relative w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-purple-500/20 flex items-center justify-center text-lg font-bold border border-border/30 overflow-hidden"
          whileHover={{ rotate: 5, scale: 1.05 }}
        >
          {/* Shimmer effect */}
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"
            initial={{ x: '-100%' }}
            animate={{ x: isHovered ? '100%' : '-100%' }}
            transition={{ duration: 0.6 }}
          />
          <span className="relative z-10">{logo}</span>
        </motion.div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h4 className="font-semibold text-sm truncate group-hover:text-primary transition-colors">{role}</h4>
            
            {/* Match badge with animation */}
            <motion.div
              className={`text-xs font-bold px-2.5 py-1 rounded-full ${matchStyle.bg} ${matchStyle.text} border ${matchStyle.border}`}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.3, type: "spring", stiffness: 300 }}
            >
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: delay + 0.5 }}
              >
                {match}%
              </motion.span>
            </motion.div>
          </div>
          
          <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
            <Building2 className="w-3 h-3" />
            {company}
          </p>
          
          {/* Tags with stagger */}
          <div className="flex flex-wrap gap-1.5 mb-3">
            {tags.slice(0, 3).map((tag, i) => (
              <motion.span 
                key={tag} 
                className="px-2 py-0.5 rounded-md bg-muted/60 text-[10px] font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: delay + 0.4 + i * 0.05 }}
              >
                {tag}
              </motion.span>
            ))}
          </div>
          
          {/* Info row */}
          <div className="flex items-center justify-between text-[10px] text-muted-foreground">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                {location}
              </span>
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {salary}
              </span>
            </div>
            
            {/* Action buttons */}
            <div className="flex items-center gap-1.5">
              <motion.button
                onClick={(e) => { e.stopPropagation(); setIsLiked(!isLiked) }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 1.4 }}
                className="p-1.5 rounded-full hover:bg-muted/50"
              >
                <Heart className={`w-3.5 h-3.5 transition-colors ${isLiked ? 'fill-red-500 text-red-500' : 'text-muted-foreground'}`} />
              </motion.button>
              <motion.button
                onClick={(e) => { e.stopPropagation(); setIsSaved(!isSaved) }}
                whileHover={{ scale: 1.2 }}
                whileTap={{ scale: 1.4 }}
                className="p-1.5 rounded-full hover:bg-muted/50"
              >
                <Bookmark className={`w-3.5 h-3.5 transition-colors ${isSaved ? 'fill-primary text-primary' : 'text-muted-foreground'}`} />
              </motion.button>
            </div>
          </div>
          
          {/* Additional info on hover */}
          <motion.div 
            className="flex items-center gap-3 mt-2 pt-2 border-t border-border/30 text-[9px] text-muted-foreground"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: isHovered ? 1 : 0, height: isHovered ? 'auto' : 0 }}
            transition={{ duration: 0.2 }}
          >
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" />
              {applicants} applicants
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {postedTime}
            </span>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
