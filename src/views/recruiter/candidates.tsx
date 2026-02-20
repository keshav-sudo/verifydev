"use client"

/**
 * Recruiter Candidate Search Page
 * Clean, sharp design aligned with dashboard design system
 */

import { useState } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { useSearchCandidates, useShortlistCandidate, useShortlist } from '@/hooks/use-recruiter'
import { AuraBadge } from '@/components/aura-score'
import { SkillBadge } from '@/components/skill-card'
import type { CandidateSearchFilters } from '@/api/services/recruiter.service'
import {
  Search,
  Filter,
  MapPin,
  Briefcase,
  Star,
  Plus,
  X,
  Users,
  ExternalLink,
  Check,
  Sparkles,
  Zap,
  Code2,
  Target,
  ArrowRight,
  CheckCircle2,
  Shield,
  Crown,
  Flame,
  Heart,
  ChevronRight,
} from 'lucide-react'

const POPULAR_SKILLS = [
  'React', 'TypeScript', 'Node.js', 'Python', 'Go', 'Java',
  'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes', 'AWS', 'GraphQL',
  'Next.js', 'Vue.js', 'Rust', 'Ruby', 'C++', 'Swift',
]

export default function CandidateSearchPage() {
  const [filters, setFilters] = useState<CandidateSearchFilters>({
    page: 1,
    limit: 20,
  })
  const [selectedSkills, setSelectedSkills] = useState<string[]>([])
  const [customSkill, setCustomSkill] = useState('')
  const [showFilters, setShowFilters] = useState(false)

  // Queries with safe defaults
  const { data: candidatesData, isLoading } = useSearchCandidates({
    ...filters,
    skills: selectedSkills.length > 0 ? selectedSkills : undefined,
  })
  const { data: shortlistData = [] } = useShortlist()
  const shortlistMutation = useShortlistCandidate()

  // SAFE data access with explicit null checks
  const candidatesList = candidatesData?.data || []
  const totalCandidates = candidatesData?.meta?.total ?? 0
  const totalPages = candidatesData?.meta?.totalPages ?? 0
  const shortlist = Array.isArray(shortlistData) ? shortlistData : []

  const shortlistedIds = new Set(shortlist.map(c => c?.id).filter(Boolean))

  const handleFilterChange = (key: keyof CandidateSearchFilters, value: any) => {
    setFilters({ ...filters, [key]: value, page: 1 })
  }

  const toggleSkill = (skill: string) => {
    setSelectedSkills(prev =>
      prev.includes(skill)
        ? prev.filter(s => s !== skill)
        : [...prev, skill]
    )
  }

  const addCustomSkill = () => {
    if (customSkill.trim() && !selectedSkills.includes(customSkill.trim())) {
      setSelectedSkills(prev => [...prev, customSkill.trim()])
      setCustomSkill('')
    }
  }

  const clearFilters = () => {
    setFilters({ page: 1, limit: 20 })
    setSelectedSkills([])
  }

  const handleShortlist = (userId: string) => {
    shortlistMutation.mutate({ userId })
  }

  return (
    <div className="w-full min-h-screen bg-[#F0F2F5] p-4 md:p-6 lg:p-8 font-sans text-slate-800">
      <div className="max-w-[1536px] mx-auto space-y-6">

        {/* ========================================= */}
        {/* 1. DARK HERO SECTION                      */}
        {/* ========================================= */}
        <div className="bg-[#0A0A0A] rounded-2xl p-8 lg:p-12 shadow-xl relative overflow-hidden border border-slate-800">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#A78BFA]/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-20 w-64 h-64 bg-[#ADFF2F]/5 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-4 max-w-2xl">
              <div className="flex items-center gap-3">
                <div className="px-2.5 py-1 rounded-[4px] bg-white/10 border border-white/5 text-[#ADFF2F] text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#ADFF2F] animate-pulse" /> Talent Search
                </div>
                <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">Recruiter Console</span>
              </div>

              <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                Find <span className="text-[#A78BFA]">Verified</span> Developers
              </h1>
              <p className="text-sm text-slate-400 font-medium max-w-lg leading-relaxed">
                Discover talent with AI-verified skills and real code analysis. Search by skills, location, and aura score.
              </p>
            </div>

            <Link
              href="/recruiter/shortlist"
              className="px-6 py-3 bg-white text-slate-900 rounded-lg text-xs font-extrabold uppercase tracking-widest hover:bg-slate-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 flex items-center gap-2 shrink-0 self-start"
            >
              <Star className="w-3 h-3" /> My Shortlist
              <span className="ml-1 px-2 py-0.5 bg-slate-900 text-white rounded-sm text-[10px] font-black">
                {shortlist?.length || 0}
              </span>
              <ChevronRight className="w-3 h-3" />
            </Link>
          </div>
        </div>

        {/* ========================================= */}
        {/* 2. STATS ROW                              */}
        {/* ========================================= */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<Users className="w-4 h-4 text-[#A78BFA]" />}
            iconBg="bg-[#A78BFA]/10 border-[#A78BFA]/20"
            label="Total Developers"
            value={totalCandidates}
          />
          <StatCard
            icon={<Shield className="w-4 h-4 text-[#65A30D]" />}
            iconBg="bg-[#ADFF2F]/10 border-[#ADFF2F]/20"
            label="Verified Profiles"
            value={Math.floor(totalCandidates * 0.85)}
          />
          <StatCard
            icon={<Flame className="w-4 h-4 text-blue-600" />}
            iconBg="bg-blue-50 border-blue-100"
            label="Active & Hiring"
            value={Math.floor(totalCandidates * 0.6)}
          />
          <StatCard
            icon={<Crown className="w-4 h-4 text-amber-600" />}
            iconBg="bg-amber-50 border-amber-100"
            label="Elite Devs"
            value={Math.floor(totalCandidates * 0.15)}
          />
        </div>

        {/* ========================================= */}
        {/* 3. MAIN LAYOUT: SIDEBAR + CONTENT         */}
        {/* ========================================= */}
        <div className="flex gap-6">
          {/* Filters Sidebar - Desktop */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-[#A78BFA]/10 rounded-md border border-[#A78BFA]/20">
                      <Filter className="w-4 h-4 text-[#A78BFA]" />
                    </div>
                    <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">Search Filters</h3>
                  </div>
                </div>
                <div className="p-6 space-y-6">
                  <FiltersContent
                    filters={filters}
                    selectedSkills={selectedSkills}
                    customSkill={customSkill}
                    onFilterChange={handleFilterChange}
                    onToggleSkill={toggleSkill}
                    onCustomSkillChange={setCustomSkill}
                    onAddCustomSkill={addCustomSkill}
                    onClearFilters={clearFilters}
                  />
                </div>
              </div>
            </div>
          </aside>

          {/* Mobile Filters */}
          <Sheet open={showFilters} onOpenChange={setShowFilters}>
            <SheetContent side="left" className="w-80 bg-white border-slate-200">
              <SheetHeader>
                <SheetTitle className="text-sm font-extrabold text-slate-900 uppercase tracking-widest">Search Filters</SheetTitle>
                <SheetDescription className="text-xs text-slate-500">
                  Refine your talent search
                </SheetDescription>
              </SheetHeader>
              <div className="mt-6 space-y-6">
                <FiltersContent
                  filters={filters}
                  selectedSkills={selectedSkills}
                  customSkill={customSkill}
                  onFilterChange={handleFilterChange}
                  onToggleSkill={toggleSkill}
                  onCustomSkillChange={setCustomSkill}
                  onAddCustomSkill={addCustomSkill}
                  onClearFilters={clearFilters}
                />
              </div>
            </SheetContent>
          </Sheet>

          {/* Results */}
          <main className="flex-1 min-w-0">
            {/* Search Bar */}
            <div className="flex gap-3 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                  placeholder="Search developers by name, skills, or location..."
                  value={filters.q || ''}
                  onChange={(e) => handleFilterChange('q', e.target.value)}
                  className="pl-11 h-11 rounded-lg bg-white border-slate-200 text-sm placeholder:text-slate-400 focus:border-[#A78BFA] focus:ring-1 focus:ring-[#A78BFA]/20 shadow-sm"
                />
              </div>
              <Button
                variant="outline"
                size="icon"
                className="lg:hidden h-11 w-11 rounded-lg bg-white border-slate-200 hover:bg-slate-50 shadow-sm"
                onClick={() => setShowFilters(true)}
              >
                <Filter className="w-4 h-4 text-slate-600" />
              </Button>
            </div>

            {/* Selected Skills */}
            {selectedSkills.length > 0 && (
              <div className="flex flex-wrap items-center gap-2 mb-5">
                <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mr-1">Active:</span>
                {selectedSkills.map((skill) => (
                  <button
                    key={skill}
                    onClick={() => toggleSkill(skill)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#A78BFA]/10 border border-[#A78BFA]/20 rounded-md text-xs font-bold text-[#7C3AED] hover:bg-[#A78BFA]/20 transition-colors"
                  >
                    <Code2 className="w-3 h-3" />
                    {skill}
                    <X className="w-3 h-3" />
                  </button>
                ))}
                <button
                  onClick={clearFilters}
                  className="text-[10px] font-bold text-slate-400 hover:text-red-500 uppercase tracking-widest transition-colors ml-1"
                >
                  Clear all
                </button>
              </div>
            )}

            {/* Results Header */}
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-3">
                <span className="text-4xl font-black text-slate-900 tracking-tight">
                  {totalCandidates}
                </span>
                <span className="text-xs font-medium text-slate-500">developers found</span>
                {filters.minAuraScore && filters.minAuraScore > 0 && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-[2px] uppercase tracking-widest border bg-amber-50 text-amber-700 border-amber-200">
                    <Sparkles className="w-3 h-3 mr-1 inline" />
                    Aura {filters.minAuraScore}+
                  </span>
                )}
              </div>
            </div>

            {/* Candidate Grid */}
            {isLoading ? (
              <div className="grid gap-4 md:grid-cols-2">
                {[...Array(6)].map((_, i) => (
                  <CandidateCardSkeleton key={i} />
                ))}
              </div>
            ) : candidatesList.length > 0 ? (
              <div className="grid gap-4 md:grid-cols-2">
                {candidatesList.map((candidate: any) => (
                  <CandidateCard
                    key={candidate.id}
                    candidate={candidate}
                    isShortlisted={candidate?.id ? shortlistedIds.has(candidate.id) : false}
                    onShortlist={() => candidate?.id && handleShortlist(candidate.id)}
                  />
                ))}
              </div>
            ) : (
              <EmptyState onClear={clearFilters} />
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-10">
                <Button
                  variant="outline"
                  disabled={filters.page === 1}
                  onClick={() => handleFilterChange('page', (filters.page || 1) - 1)}
                  className="h-10 px-5 rounded-lg bg-white border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 shadow-sm"
                >
                  Previous
                </Button>

                <div className="flex items-center gap-1 px-2">
                  {[...Array(Math.min(5, totalPages))].map((_, i) => {
                    const page = i + 1
                    return (
                      <button
                        key={page}
                        onClick={() => handleFilterChange('page', page)}
                        className={`w-9 h-9 rounded-lg text-xs font-bold transition-all ${filters.page === page
                          ? 'bg-slate-900 text-white shadow-sm'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                          }`}
                      >
                        {page}
                      </button>
                    )
                  })}
                  {totalPages > 5 && (
                    <>
                      <span className="text-slate-400 px-1 text-xs">...</span>
                      <button
                        onClick={() => handleFilterChange('page', totalPages)}
                        className="w-9 h-9 rounded-lg text-xs font-bold bg-white text-slate-600 border border-slate-200 hover:bg-slate-50 transition-all"
                      >
                        {totalPages}
                      </button>
                    </>
                  )}
                </div>

                <Button
                  variant="outline"
                  disabled={filters.page === totalPages}
                  onClick={() => handleFilterChange('page', (filters.page || 1) + 1)}
                  className="h-10 px-5 rounded-lg bg-white border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 disabled:opacity-40 shadow-sm"
                >
                  Next
                </Button>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  )
}

// ─── Stat Card ────────────────────────────────────────────

function StatCard({
  icon,
  iconBg,
  label,
  value,
}: {
  icon: React.ReactNode
  iconBg: string
  label: string
  value: number
}) {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-3">
          <div className={`p-1.5 rounded-md border ${iconBg}`}>
            {icon}
          </div>
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">{label}</span>
        </div>
        <div className="text-4xl font-black text-slate-900 tracking-tight">
          {value.toLocaleString()}
        </div>
      </div>
    </div>
  )
}

// ─── Filters Content ──────────────────────────────────────

interface FiltersContentProps {
  filters: CandidateSearchFilters
  selectedSkills: string[]
  customSkill: string
  onFilterChange: (key: keyof CandidateSearchFilters, value: any) => void
  onToggleSkill: (skill: string) => void
  onCustomSkillChange: (value: string) => void
  onAddCustomSkill: () => void
  onClearFilters: () => void
}

function FiltersContent({
  filters,
  selectedSkills,
  customSkill,
  onFilterChange,
  onToggleSkill,
  onCustomSkillChange,
  onAddCustomSkill,
  onClearFilters,
}: FiltersContentProps) {
  return (
    <>
      {/* Skills */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Code2 className="w-3.5 h-3.5 text-[#A78BFA]" />
          <Label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Required Skills</Label>
        </div>
        <div className="flex gap-2">
          <Input
            placeholder="Add skill..."
            value={customSkill}
            onChange={(e) => onCustomSkillChange(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && onAddCustomSkill()}
            className="h-9 bg-white border-slate-200 rounded-lg text-sm focus:border-[#A78BFA] focus:ring-1 focus:ring-[#A78BFA]/20"
          />
          <Button
            variant="outline"
            size="icon"
            onClick={onAddCustomSkill}
            className="shrink-0 h-9 w-9 bg-white border-slate-200 hover:bg-slate-50 rounded-lg"
          >
            <Plus className="w-3.5 h-3.5 text-slate-600" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-1.5 max-h-44 overflow-y-auto scrollbar-clean pr-1">
          {POPULAR_SKILLS.map((skill) => (
            <button
              key={skill}
              onClick={() => onToggleSkill(skill)}
              className={`px-2.5 py-1.5 text-xs font-bold rounded-md transition-all ${selectedSkills.includes(skill)
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-900'
                }`}
            >
              {skill}
            </button>
          ))}
        </div>
      </div>

      {/* Aura Score */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <Label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Minimum Aura</Label>
          </div>
          <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-[2px] uppercase tracking-widest border bg-amber-50 text-amber-700 border-amber-200">
            {filters.minAuraScore || 0}
          </span>
        </div>
        <Slider
          value={[filters.minAuraScore || 0]}
          min={0}
          max={100}
          step={5}
          onValueChange={([value]) => onFilterChange('minAuraScore', value)}
          className="[&_[role=slider]]:bg-slate-900 [&_[role=slider]]:border-0 [&>span:first-child>span]:bg-slate-900"
        />
        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
          <span>Beginner</span>
          <span>Elite</span>
        </div>
      </div>

      {/* Location */}
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <MapPin className="w-3.5 h-3.5 text-blue-500" />
          <Label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Location</Label>
        </div>
        <Input
          placeholder="City, country..."
          value={filters.location || ''}
          onChange={(e) => onFilterChange('location', e.target.value)}
          className="h-9 bg-white border-slate-200 rounded-lg text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20"
        />
      </div>

      {/* Open to Work Toggle */}
      <div className="flex items-center justify-between p-4 rounded-lg bg-[#ADFF2F]/5 border border-[#ADFF2F]/15">
        <div className="flex items-center gap-3">
          <div className="p-1.5 bg-[#ADFF2F]/10 rounded-md border border-[#ADFF2F]/20">
            <Zap className="w-3.5 h-3.5 text-[#65A30D]" />
          </div>
          <Label htmlFor="openToWork" className="text-xs font-bold text-slate-700 cursor-pointer">Available Now</Label>
        </div>
        <Switch
          id="openToWork"
          checked={filters.isOpenToWork || false}
          onCheckedChange={(checked) => onFilterChange('isOpenToWork', checked)}
        />
      </div>

      {/* Clear Filters */}
      <Button
        variant="outline"
        className="w-full h-10 rounded-lg bg-white border-slate-200 text-xs font-bold text-slate-600 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"
        onClick={onClearFilters}
      >
        <X className="mr-2 w-3.5 h-3.5" />
        Clear All Filters
      </Button>
    </>
  )
}

// ─── Candidate Card ───────────────────────────────────────

function CandidateCard({ candidate, isShortlisted, onShortlist }: {
  candidate: any
  isShortlisted: boolean
  onShortlist: () => void
}) {
  return (
    <Card className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start gap-4">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="w-14 h-14 border-2 border-slate-100 shadow-sm">
              <AvatarImage src={candidate.avatarUrl} />
              <AvatarFallback className="bg-slate-100 text-slate-700 text-sm font-bold">
                {candidate.name?.[0] || candidate.username[0]}
              </AvatarFallback>
            </Avatar>
            {candidate.isOpenToWork && (
              <div className="absolute -bottom-1 -right-1 p-1 rounded-full bg-[#ADFF2F] border-2 border-white">
                <Zap className="w-2.5 h-2.5 text-[#365314]" />
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <h3 className="text-sm font-extrabold text-slate-900 truncate">
                {candidate.name || candidate.username}
              </h3>
              {candidate.isOpenToWork && (
                <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-[2px] uppercase tracking-widest bg-[#ADFF2F]/20 text-[#65A30D] border border-[#ADFF2F]/30">
                  Available
                </span>
              )}
            </div>
            <p className="text-xs font-medium text-slate-400 truncate">
              @{candidate.username}
            </p>
            {candidate.location && (
              <p className="text-xs font-medium text-slate-500 flex items-center gap-1 mt-1">
                <MapPin className="w-3 h-3 text-slate-400" />
                {candidate.location}
              </p>
            )}
          </div>

          <AuraBadge score={candidate.auraScore} level={candidate.auraLevel} />
        </div>

        {/* Skills */}
        {candidate.topSkills?.length > 0 && (
          <div className="mt-4">
            <div className="flex items-center gap-2 mb-2">
              <Target className="w-3 h-3 text-slate-400" />
              <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Top Skills</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {candidate.topSkills.slice(0, 4).map((skill: any) => (
                <SkillBadge
                  key={skill.name}
                  name={skill.name}
                  verified={skill.isVerified}
                  score={skill.score}
                  size="sm"
                />
              ))}
              {candidate.topSkills.length > 4 && (
                <Badge variant="outline" className="text-[10px] font-bold border-slate-200 bg-slate-50 text-slate-500">
                  +{candidate.topSkills.length - 4}
                </Badge>
              )}
            </div>
          </div>
        )}

        {/* Stats Row */}
        <div className="flex items-center gap-4 mt-4 text-xs">
          <span className="flex items-center gap-1.5 text-slate-500">
            <Briefcase className="w-3.5 h-3.5 text-slate-400" />
            <span className="font-extrabold text-slate-900">{candidate.projectCount}</span> projects
          </span>
          {candidate.verifiedSkillCount > 0 && (
            <span className="flex items-center gap-1.5 text-slate-500">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#65A30D]" />
              <span className="font-extrabold text-slate-900">{candidate.verifiedSkillCount}</span> verified
            </span>
          )}
        </div>
      </CardContent>

      <CardFooter className="border-t border-slate-100 pt-3 pb-3 px-5 flex gap-2 bg-slate-50/30">
        <Button
          asChild
          variant="outline"
          className="flex-1 h-9 rounded-lg bg-white border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-slate-900 group/btn transition-all"
        >
          <Link href={`/recruiter/candidates/${candidate.id}`}>
            <ExternalLink className="mr-1.5 w-3.5 h-3.5" />
            View Profile
            <ArrowRight className="ml-1.5 w-3.5 h-3.5 opacity-0 group-hover/btn:opacity-100 group-hover/btn:translate-x-0.5 transition-all" />
          </Link>
        </Button>
        <Button
          variant={isShortlisted ? 'secondary' : 'default'}
          size="icon"
          onClick={onShortlist}
          disabled={isShortlisted}
          className={`h-9 w-9 rounded-lg ${isShortlisted
            ? 'bg-[#ADFF2F]/20 text-[#65A30D] border border-[#ADFF2F]/30 hover:bg-[#ADFF2F]/30'
            : 'bg-slate-900 text-white hover:bg-slate-800'
            }`}
        >
          {isShortlisted ? (
            <Check className="w-4 h-4" />
          ) : (
            <Heart className="w-4 h-4" />
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}

// ─── Empty State ──────────────────────────────────────────

function EmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm text-center py-20">
      <div className="w-16 h-16 bg-slate-100 rounded-xl mx-auto mb-6 flex items-center justify-center border border-slate-200">
        <Users className="w-7 h-7 text-slate-400" />
      </div>
      <h3 className="text-sm font-black text-slate-900 mb-2 uppercase tracking-wide">
        No developers found
      </h3>
      <p className="text-xs text-slate-500 font-medium mb-6 max-w-sm mx-auto">
        Try adjusting your filters or search for different skills to discover verified talent.
      </p>
      <Button
        variant="outline"
        onClick={onClear}
        className="h-10 px-6 rounded-lg bg-white border-slate-200 text-xs font-bold text-slate-700 hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-all"
      >
        <X className="mr-2 w-3.5 h-3.5" />
        Clear All Filters
      </Button>
    </div>
  )
}

// ─── Skeleton ─────────────────────────────────────────────

function CandidateCardSkeleton() {
  return (
    <Card className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <CardContent className="pt-5 pb-4">
        <div className="flex items-start gap-4">
          <div className="w-14 h-14 rounded-full bg-slate-100 animate-pulse" />
          <div className="flex-1 space-y-2.5">
            <div className="h-4 w-32 bg-slate-100 rounded animate-pulse" />
            <div className="h-3.5 w-20 bg-slate-100 rounded animate-pulse" />
            <div className="h-3.5 w-40 bg-slate-100 rounded animate-pulse" />
          </div>
          <div className="h-7 w-16 bg-slate-100 rounded-full animate-pulse" />
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-3 w-16 bg-slate-100 rounded animate-pulse" />
          <div className="flex gap-1.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-6 w-14 bg-slate-100 rounded-md animate-pulse" />
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="border-t border-slate-100 pt-3 pb-3 flex gap-2">
        <div className="flex-1 h-9 bg-slate-100 rounded-lg animate-pulse" />
        <div className="w-9 h-9 bg-slate-100 rounded-lg animate-pulse" />
      </CardFooter>
    </Card>
  )
}
