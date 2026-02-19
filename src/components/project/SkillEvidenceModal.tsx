"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ExternalLink, FileCode, CheckSquare, Activity, TrendingUp, Award } from 'lucide-react'
import { cn } from '@/lib/utils'

interface SkillEvidenceModalProps {
  isOpen: boolean
  onClose: () => void
  skill: any
  repoUrl?: string
}

function ConfidenceBar({ value, label, color = 'primary' }: { value: number; label?: string; color?: string }) {
  const pct = Math.round(value > 1 ? value : value * 100)
  const colorMap: Record<string, string> = {
    primary: 'bg-slate-900',
    emerald: 'bg-[#84CC16]',
    blue: 'bg-blue-500',
    amber: 'bg-amber-500',
    purple: 'bg-purple-500',
  }
  
  return (
    <div className="space-y-1.5 w-full">
      <div className="flex items-center justify-between">
        {label && <span className="text-[10px] text-slate-600 font-bold uppercase tracking-wider">{label}</span>}
        <span className="text-[10px] font-black text-slate-700">{pct}%</span>
      </div>
      <div className="h-1.5 rounded-sm bg-slate-100 overflow-hidden">
        <div 
          className={cn("h-full rounded-sm transition-all duration-700", colorMap[color] || 'bg-slate-900')} 
          style={{ width: `${pct}%` }} 
        />
      </div>
    </div>
  )
}

export default function SkillEvidenceModal({ isOpen, onClose, skill, repoUrl }: SkillEvidenceModalProps) {
  if (!skill) return null

  const evidence = skill.evidence || []
  const richEvidence = skill.richEvidence || null
  const usageVerified = skill.usageVerified || false
  const usageStrength = skill.usageStrength || 0
  const confidence = skill.confidence || skill.verifiedScore || skill.score || 0
  const resumeReady = skill.resumeReady ?? true

  // Parse rich evidence
  const summary = richEvidence?.summary || []
  const patterns = richEvidence?.patterns || {}
  const depth = richEvidence?.depth || {}
  const depthLevel = depth.level || 'surface'
  const diversityCount = depth.diversityCount || 0
  const patternsUsed = depth.patternsUsed || 0
  const fileSpread = depth.fileSpread || 0

  const getDepthColor = (level: string) => {
    if (level === 'expert' || level === 'deep') return 'text-purple-600 bg-purple-50 border-purple-200'
    if (level === 'moderate') return 'text-blue-600 bg-blue-50 border-blue-200'
    return 'text-slate-600 bg-slate-50 border-slate-200'
  }

  const getGitHubLink = (filePath: string) => {
    if (!repoUrl || !filePath) return null
    // Clean file path and create GitHub link
    const cleanPath = filePath.replace(/^.*?\//, '') // Remove repo name prefix if present
    return `${repoUrl}/blob/main/${cleanPath}`
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black text-slate-900 flex items-center gap-2">
            {skill.name}
            {resumeReady && (
              <span className="text-xs font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-1 rounded-md">
                Resume Ready
              </span>
            )}
          </DialogTitle>
          <DialogDescription className="flex items-center gap-2 text-sm">
            <span className="text-[9px] font-extrabold uppercase tracking-widest bg-slate-100 border border-slate-200 px-2 py-1 rounded-sm text-slate-700">
              {skill.category?.replace('_legacy', '')}
            </span>
            <span className={cn(
              "text-[9px] font-extrabold uppercase tracking-widest border px-2 py-1 rounded-sm",
              skill.level === 'expert' ? 'bg-purple-50 text-purple-700 border-purple-200' :
              skill.level === 'advanced' ? 'bg-blue-50 text-blue-700 border-blue-200' :
              'bg-slate-100 text-slate-600 border-slate-200'
            )}>
              {skill.level}
            </span>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 mt-4">
          {/* Verification Scores */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
            <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-700 mb-3 flex items-center gap-2">
              <Award className="h-4 w-4 text-blue-500" /> Verification Metrics
            </h3>
            <div className="space-y-3">
              <ConfidenceBar value={confidence} label="Confidence Score" color="primary" />
              {usageVerified && (
                <ConfidenceBar value={usageStrength} label="Usage Strength" color="emerald" />
              )}
            </div>
          </div>

          {/* Usage Depth Analysis */}
          {richEvidence && (
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-700 mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-purple-500" /> Usage Depth Analysis
              </h3>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-center">
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 mb-1">Depth Level</p>
                  <span className={cn("inline-block text-xs font-bold px-2 py-1 rounded-md border", getDepthColor(depthLevel))}>
                    {depthLevel}
                  </span>
                </div>
                
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-center">
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 mb-1">Diversity</p>
                  <p className="text-lg font-black text-slate-900">{diversityCount}</p>
                </div>
                
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-center">
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 mb-1">Patterns</p>
                  <p className="text-lg font-black text-slate-900">{patternsUsed}</p>
                </div>
                
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-md text-center">
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 mb-1">Files</p>
                  <p className="text-lg font-black text-slate-900">{fileSpread}</p>
                </div>
              </div>

              {/* Summary Points */}
              {summary.length > 0 && (
                <div className="space-y-2">
                  {summary.map((point: string, i: number) => (
                    <div key={i} className="flex items-start gap-2 p-2 bg-blue-50 border border-blue-200 rounded-md">
                      <Activity className="h-4 w-4 text-blue-600 shrink-0 mt-0.5" />
                      <span className="text-xs font-medium text-blue-900">{point}</span>
                    </div>
                  ))}
                </div>
              )}

              {/* Pattern Details */}
              {Object.keys(patterns).length > 0 && (
                <div className="mt-4 pt-4 border-t border-slate-200">
                  <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 mb-2">Detected Patterns</p>
                  <div className="flex flex-wrap gap-2">
                    {Object.entries(patterns).map(([key, value]: [string, any], i: number) => (
                      <div key={i} className="px-2 py-1 bg-purple-50 border border-purple-200 rounded-md text-xs font-medium text-purple-900">
                        {typeof value === 'object' ? key : `${key}: ${value}`}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Evidence Files */}
          {evidence.length > 0 && (
            <div className="bg-white border border-slate-200 rounded-lg p-4">
              <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-700 mb-3 flex items-center gap-2">
                <FileCode className="h-4 w-4 text-emerald-500" /> Evidence Files ({evidence.length})
              </h3>
              
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {evidence.map((item: string, i: number) => {
                  const githubLink = getGitHubLink(item)
                  
                  return (
                    <div key={i} className="flex items-start gap-2 p-2 bg-slate-50 border border-slate-200 rounded-md hover:bg-white transition-colors">
                      <CheckSquare className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium text-slate-700 break-all">{item}</p>
                      </div>
                      {githubLink && (
                        <Button
                          variant="ghost"
                          size="sm"
                          asChild
                          className="h-6 px-2 shrink-0"
                        >
                          <a href={githubLink} target="_blank" rel="noopener noreferrer">
                            <ExternalLink className="h-3 w-3" />
                          </a>
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center justify-between pt-4 border-t border-slate-200">
            <Button
              variant="ghost"
              onClick={onClose}
              className="text-xs font-bold"
            >
              Close
            </Button>
            
            {resumeReady && (
              <Button
                className="bg-[#84CC16] hover:bg-[#65A30D] text-white text-xs font-extrabold uppercase tracking-wider"
              >
                <CheckSquare className="h-4 w-4 mr-1" />
                Add to Resume
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
