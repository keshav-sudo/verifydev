"use client"

/**
 * Skill Card v2 Component
 * Displays skills with VERIFIED/INFERRED/CLAIMED states, evidence chain support,
 * and Phase 6 Deep Evidence (RichEvidence) display
 */

import { useState } from 'react'
import { Check, AlertCircle, PenLine, ChevronRight, ChevronDown, FileCode, Layers, Server, Sparkles, Eye, Zap, GitBranch, Code2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { SkillNode, EvidenceChain, EvidenceItem, SkillVerificationStatus, SkillTier, RichEvidence, SkillDepth } from '@/types/intelligence-v2'

// Props interface
export interface SkillCardV2Props {
  skill: SkillNode
  showEvidence?: boolean
  compact?: boolean
  className?: string
}

// Verification status helpers

function getVerificationStatus(skill: SkillNode): SkillVerificationStatus {
  // Relaxed Verification Logic matching user expectation:
  // 1. Explicit Usage Verification (Code usage found)
  // 2. High Confidence (>= 70%) (Strong patterns found)
  // 3. Resume Ready (Backend flag)
  const isHighConfidence = skill.netConfidence >= 70
  
  if (skill.usageVerified || isHighConfidence) return 'VERIFIED' 
  if (skill.isInferred) return 'INFERRED'
  if (skill.isClaimed) return 'CLAIMED'
  return 'CLAIMED'
}

function getTierLabel(tier: SkillTier): string {
  switch (tier) {
    case 1: return 'Core'
    case 2: return 'Sub-skill'
    case 3: return 'Infrastructure'
    case 4: return 'Related'
    default: return 'Skill'
  }
}

function getTierIcon(tier: SkillTier) {
  switch (tier) {
    case 1: return Sparkles
    case 2: return FileCode
    case 3: return Server
    case 4: return Layers
    default: return FileCode
  }
}

// Depth level styling
function getDepthConfig(level?: string) {
  switch (level) {
    case 'expert':
      return { label: 'Expert', color: 'text-purple-500', bg: 'bg-purple-500/10 border-purple-500/20', icon: '🏆' }
    case 'deep':
      return { label: 'Deep', color: 'text-emerald-500', bg: 'bg-emerald-500/10 border-emerald-500/20', icon: '🔬' }
    case 'moderate':
      return { label: 'Moderate', color: 'text-blue-500', bg: 'bg-blue-500/10 border-blue-500/20', icon: '📊' }
    case 'surface':
    default:
      return { label: 'Surface', color: 'text-slate-500', bg: 'bg-slate-500/10 border-slate-500/20', icon: '📋' }
  }
}

// Status badge component
function StatusBadge({ status }: { status: SkillVerificationStatus }) {
  const config = {
    VERIFIED: {
      icon: Check,
      label: 'Verified',
      className: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800',
      tooltip: 'Detected in code with strong evidence across multiple files',
    },
    INFERRED: {
      icon: AlertCircle,
      label: 'Inferred',
      className: 'bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-900/20 dark:text-slate-400 dark:border-slate-700',
      tooltip: 'Related to verified skills, not directly detected in code',
    },
    CLAIMED: {
      icon: PenLine,
      label: 'Claimed',
      className: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/20 dark:text-amber-400 dark:border-amber-800',
      tooltip: 'Added by user, awaiting automatic verification from code analysis',
    },
  }

  const { icon: Icon, label, className, tooltip } = config[status]

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={cn('gap-1 font-medium', className)}>
            <Icon className="h-3 w-3" />
            {label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="text-xs max-w-[200px]">{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Depth badge component
function DepthBadge({ depth }: { depth: SkillDepth }) {
  const config = getDepthConfig(depth.level)
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="outline" className={cn('gap-1 text-[10px] font-medium border', config.bg, config.color)}>
            <span>{config.icon}</span>
            {config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-xs space-y-1">
            <p className="font-medium">Depth Assessment: {config.label}</p>
            <p>{depth.diversityCount} distinct patterns • {depth.fileSpread} files</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

// Rich Evidence Summary — the "Developer Magnet" section
function RichEvidenceSummary({ richEvidence }: { richEvidence: RichEvidence }) {
  const [expanded, setExpanded] = useState(false)
  
  if (!richEvidence?.summary?.length) return null
  
  const visibleSummaries = expanded ? richEvidence.summary : richEvidence.summary.slice(0, 2)
  const hasMore = richEvidence.summary.length > 2
  
  return (
    <div className="space-y-2 mt-3 pt-3 border-t border-border/30">
      {/* Section header */}
      <div className="flex items-center gap-1.5">
        <Eye className="h-3 w-3 text-primary/70" />
        <span className="text-[10px] font-semibold uppercase tracking-wider text-primary/70">
          Deep Analysis
        </span>
      </div>
      
      {/* Evidence summaries */}
      <div className="space-y-1.5">
        {visibleSummaries.map((summary, i) => (
          <div 
            key={i} 
            className="flex items-start gap-2 text-xs text-muted-foreground leading-relaxed"
          >
            <Code2 className="h-3 w-3 shrink-0 mt-0.5 text-primary/50" />
            <span>{summary}</span>
          </div>
        ))}
      </div>
      
      {/* Show more / less toggle */}
      {hasMore && (
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-[10px] font-medium text-primary/70 hover:text-primary transition-colors pl-5"
        >
          {expanded ? (
            <>Show less <ChevronDown className="h-3 w-3 rotate-180" /></>
          ) : (
            <>+{richEvidence.summary.length - 2} more insights <ChevronDown className="h-3 w-3" /></>
          )}
        </button>
      )}
      
      {/* Depth metrics strip */}
      {richEvidence.depth && (
        <div className="flex items-center gap-3 mt-2 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1">
            <Zap className="h-3 w-3" />
            {richEvidence.depth.patternsUsed} patterns
          </span>
          <span className="flex items-center gap-1">
            <GitBranch className="h-3 w-3" />
            {richEvidence.depth.fileSpread} files
          </span>
          <span className="flex items-center gap-1">
            <Layers className="h-3 w-3" />
            {richEvidence.depth.diversityCount} APIs
          </span>
        </div>
      )}
    </div>
  )
}

// Evidence strength indicator
function EvidenceStrengthBar({ strength }: { strength: 'WEAK' | 'MEDIUM' | 'STRONG' }) {
  const config = {
    STRONG: { value: 100, color: 'bg-emerald-500' },
    MEDIUM: { value: 66, color: 'bg-amber-500' },
    WEAK: { value: 33, color: 'bg-slate-400' },
  }
  const { value, color } = config[strength]
  
  return (
    <div className="flex items-center gap-1">
      <div className={cn('h-1.5 w-1.5 rounded-full', color)} />
      <div className={cn('h-1.5 w-1.5 rounded-full', value >= 66 ? color : 'bg-slate-200 dark:bg-slate-700')} />
      <div className={cn('h-1.5 w-1.5 rounded-full', value >= 100 ? color : 'bg-slate-200 dark:bg-slate-700')} />
    </div>
  )
}

// Evidence item row
function EvidenceItemRow({ item }: { item: EvidenceItem }) {
  return (
    <div className={cn(
      'flex items-start gap-2 py-2 px-3 rounded-lg text-sm',
      item.isAnti 
        ? 'bg-red-50 dark:bg-red-900/10' 
        : 'bg-slate-50 dark:bg-slate-900/30'
    )}>
      <EvidenceStrengthBar strength={item.strength} />
      <div className="flex-1 min-w-0">
        <p className={cn(
          'text-sm',
          item.isAnti ? 'text-red-700 dark:text-red-400' : 'text-foreground'
        )}>
          {item.description}
        </p>
        {item.location && (
          <p className="text-xs text-muted-foreground font-mono mt-0.5 truncate">
            {item.location}
          </p>
        )}
      </div>
    </div>
  )
}

// Evidence modal component (enhanced with Rich Evidence)
function EvidenceModal({ 
  isOpen, 
  onClose, 
  skillName, 
  evidence,
  richEvidence,
}: { 
  isOpen: boolean
  onClose: () => void
  skillName: string
  evidence: EvidenceChain 
  richEvidence?: RichEvidence | null
}) {
  const strongEvidence = evidence.items.filter(e => e.strength === 'STRONG')
  const mediumEvidence = evidence.items.filter(e => e.strength === 'MEDIUM')
  const weakEvidence = evidence.items.filter(e => e.strength === 'WEAK')

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Evidence for: {skillName}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Net confidence */}
          <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/30 rounded-lg">
            <span className="text-sm font-medium">Net Confidence</span>
            <span className="text-lg font-bold text-primary">{Math.round(evidence.netConfidence)}%</span>
          </div>

          {/* Rich Evidence Section */}
          {richEvidence?.summary && richEvidence.summary.length > 0 && (
            <div className="space-y-3 p-4 rounded-xl bg-gradient-to-br from-primary/5 to-primary/10 border border-primary/20">
              <h4 className="text-sm font-semibold flex items-center gap-2 text-primary">
                <Eye className="h-4 w-4" />
                Deep Code Analysis
              </h4>
              
              {/* Depth badge */}
              {richEvidence.depth && (
                <div className="flex items-center gap-2">
                  <DepthBadge depth={richEvidence.depth} />
                  <span className="text-xs text-muted-foreground">
                    {richEvidence.depth.patternsUsed} patterns across {richEvidence.depth.fileSpread} files
                  </span>
                </div>
              )}
              
              {/* Summaries */}
              <div className="space-y-2">
                {richEvidence.summary.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 text-sm">
                    <Code2 className="h-3.5 w-3.5 shrink-0 mt-0.5 text-primary/60" />
                    <span className="text-foreground/90">{s}</span>
                  </div>
                ))}
              </div>

              {/* Pattern details */}
              {richEvidence.patterns && Object.keys(richEvidence.patterns).length > 0 && (
                <div className="mt-3 pt-3 border-t border-primary/10">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-2">
                    Detected Patterns
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.keys(richEvidence.patterns).map((pattern, i) => (
                      <Badge key={i} variant="secondary" className="text-[10px] bg-primary/10 text-primary border-primary/20">
                        {pattern}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Strong evidence */}
          {strongEvidence.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600" />
                Strong Evidence ({strongEvidence.length})
              </h4>
              <div className="space-y-1">
                {strongEvidence.map((item, i) => (
                  <EvidenceItemRow key={i} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Medium evidence */}
          {mediumEvidence.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-amber-500" />
                Medium Evidence ({mediumEvidence.length})
              </h4>
              <div className="space-y-1">
                {mediumEvidence.map((item, i) => (
                  <EvidenceItemRow key={i} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Weak evidence */}
          {weakEvidence.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-slate-400" />
                Weak Evidence ({weakEvidence.length})
              </h4>
              <div className="space-y-1">
                {weakEvidence.map((item, i) => (
                  <EvidenceItemRow key={i} item={item} />
                ))}
              </div>
            </div>
          )}

          {/* Anti-evidence / Concerns */}
          {evidence.antiItems.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2 text-red-600 dark:text-red-400">
                <AlertCircle className="h-4 w-4" />
                Concerns ({evidence.antiItems.length})
              </h4>
              <div className="space-y-1">
                {evidence.antiItems.map((item, i) => (
                  <EvidenceItemRow key={i} item={item} />
                ))}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Main SkillCardV2 component
export function SkillCardV2({ skill, showEvidence = true, compact = false, className }: SkillCardV2Props) {
  const [evidenceOpen, setEvidenceOpen] = useState(false)
  
  const status = getVerificationStatus(skill)
  const TierIcon = getTierIcon(skill.tier)
  const confidence = Math.round(skill.netConfidence)
  const isResumeReady = skill.isClaimed && confidence >= 60
  
  // Opacity for inferred skills
  const opacity = status === 'INFERRED' ? 'opacity-60' : ''

  if (compact) {
    return (
      <div className={cn(
        'flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors',
        opacity,
        className
      )}>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <TierIcon className="h-4 w-4 text-muted-foreground shrink-0" />
          <span className="font-medium truncate">{skill.name}</span>
          <StatusBadge status={status} />
          {skill.richEvidence?.depth && (
            <DepthBadge depth={skill.richEvidence.depth} />
          )}
        </div>
        <div className="flex items-center gap-3">
          <span className={cn(
            'text-sm font-semibold tabular-nums',
            confidence >= 90 ? 'text-emerald-600 dark:text-emerald-400' :
            confidence >= 75 ? 'text-blue-600 dark:text-blue-400' :
            confidence >= 60 ? 'text-indigo-600 dark:text-indigo-400' :
            confidence >= 40 ? 'text-amber-600 dark:text-amber-400' :
            'text-muted-foreground'
          )}>
            {confidence}%
          </span>
          {showEvidence && skill.evidence && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEvidenceOpen(true)}
              className="h-7 px-2 text-xs"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>

        {skill.evidence && (
          <EvidenceModal
            isOpen={evidenceOpen}
            onClose={() => setEvidenceOpen(false)}
            skillName={skill.name}
            evidence={skill.evidence}
            richEvidence={skill.richEvidence}
          />
        )}
      </div>
    )
  }

  // Category-based colors
  const categoryGradients: Record<string, string> = {
    language: 'from-indigo-500/10 to-purple-500/5',
    framework: 'from-emerald-500/10 to-teal-500/5',
    database: 'from-blue-500/10 to-cyan-500/5',
    infrastructure: 'from-orange-500/10 to-amber-500/5',
    security: 'from-red-500/10 to-pink-500/5',
    architecture: 'from-purple-500/10 to-indigo-500/5',
    messaging: 'from-pink-500/10 to-rose-500/5',
    ml: 'from-violet-500/10 to-fuchsia-500/5',
    tool: 'from-gray-500/10 to-slate-500/5',
  }
  
  const categoryBorders: Record<string, string> = {
    language: 'border-indigo-200 dark:border-indigo-800/50',
    framework: 'border-emerald-200 dark:border-emerald-800/50',
    database: 'border-blue-200 dark:border-blue-800/50',
    infrastructure: 'border-orange-200 dark:border-orange-800/50',
    security: 'border-red-200 dark:border-red-800/50',
    architecture: 'border-purple-200 dark:border-purple-800/50',
    messaging: 'border-pink-200 dark:border-pink-800/50',
    ml: 'border-violet-200 dark:border-violet-800/50',
    tool: 'border-slate-200 dark:border-slate-700',
  }

  const gradient = categoryGradients[skill.category] || categoryGradients.tool
  const borderColor = categoryBorders[skill.category] || categoryBorders.tool

  // Full card view
  return (
    <div className={cn(
      'p-4 rounded-xl border transition-all hover:shadow-lg bg-gradient-to-br',
      gradient,
      status === 'VERIFIED' && borderColor,
      status === 'INFERRED' && 'border-slate-200 dark:border-slate-700 opacity-75',
      status === 'CLAIMED' && 'border-amber-200 dark:border-amber-800/50',
      className
    )}>
      {/* Header */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <TierIcon className="h-4 w-4 text-muted-foreground shrink-0" />
            <h3 className="font-semibold truncate">{skill.name}</h3>
            <StatusBadge status={status} />
          </div>
          <div className="text-xs text-muted-foreground flex items-center gap-2 flex-wrap">
            <span>{getTierLabel(skill.tier)}</span>
            {skill.category && (
              <>
                <span>•</span>
                <span>{skill.category}</span>
              </>
            )}
            {isResumeReady && (
              <>
                <span>•</span>
                <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                  Resume Ready
                </Badge>
              </>
            )}
            {skill.richEvidence?.depth && (
              <DepthBadge depth={skill.richEvidence.depth} />
            )}
          </div>
        </div>
        
        {/* Confidence score */}
        <div className="text-right">
          <span className={cn(
            'text-2xl font-bold tabular-nums',
            confidence >= 90 ? 'text-emerald-600 dark:text-emerald-400' :
            confidence >= 75 ? 'text-blue-600 dark:text-blue-400' :
            confidence >= 60 ? 'text-indigo-600 dark:text-indigo-400' :
            confidence >= 40 ? 'text-amber-600 dark:text-amber-400' :
            'text-muted-foreground'
          )}>
            {confidence}
          </span>
          <span className="text-xs text-muted-foreground block">confidence</span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="mb-3">
        <Progress 
          value={confidence} 
          className={cn(
            'h-2',
            confidence >= 90 ? '[&>div]:bg-emerald-500' :
            confidence >= 75 ? '[&>div]:bg-blue-500' :
            confidence >= 60 ? '[&>div]:bg-indigo-500' :
            confidence >= 40 ? '[&>div]:bg-amber-500' :
            '[&>div]:bg-slate-400'
          )}
        />
      </div>

      {/* Status-specific messages */}
      {status === 'INFERRED' && skill.inferredFrom && (
        <p className="text-xs text-muted-foreground mb-3">
          Inferred from: {skill.inferredFrom}
        </p>
      )}
      
      {status === 'CLAIMED' && (
        <p className="text-xs text-amber-600 dark:text-amber-400 mb-3">
          Awaiting verification from code analysis
        </p>
      )}

      {/* Rich Evidence Summary (inline on card) */}
      {skill.richEvidence && (
        <RichEvidenceSummary richEvidence={skill.richEvidence} />
      )}

      {/* View Evidence button */}
      {showEvidence && skill.evidence && status === 'VERIFIED' && (
        <div className="pt-3 border-t border-border/30 mt-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setEvidenceOpen(true)}
            className="w-full justify-between text-xs h-8"
          >
            <span>{skill.richEvidence ? 'View Full Evidence' : 'View Evidence'}</span>
            <ChevronRight className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {skill.evidence && (
        <EvidenceModal
          isOpen={evidenceOpen}
          onClose={() => setEvidenceOpen(false)}
          skillName={skill.name}
          evidence={skill.evidence}
          richEvidence={skill.richEvidence}
        />
      )}
    </div>
  )
}

export default SkillCardV2
