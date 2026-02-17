"use client"

import { useState, useMemo, useEffect, useRef } from 'react'
import { useInfiniteQuery, useMutation } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { get, post } from '@/api/client'
import { formatSalary, formatRelativeTime, cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import type { Job } from '@/types'
import {
  Search,
  MapPin,
  Building,
  Briefcase,
  Zap,
  ArrowRight,
  Loader2,
  Heart,
  Sparkles,
  SlidersHorizontal,
  BookmarkPlus,
  X,
} from 'lucide-react'

const jobTypeLabels: Record<string, string> = {
  'full-time': 'Full-time', 'part-time': 'Part-time', contract: 'Contract', freelance: 'Freelance', internship: 'Internship',
  'FULL_TIME': 'Full-time', 'PART_TIME': 'Part-time', 'CONTRACT': 'Contract', 'FREELANCE': 'Freelance', 'INTERNSHIP': 'Internship',
}

const experienceLevelLabels: Record<string, string> = {
  entry: 'Entry Level', mid: 'Mid Level', senior: 'Senior', lead: 'Lead', executive: 'Executive',
  'ENTRY': 'Entry Level', 'MID': 'Mid Level', 'SENIOR': 'Senior', 'LEAD': 'Lead', 'PRINCIPAL': 'Principal',
}

function JobCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-6 h-[200px] flex flex-col animate-pulse">
      <div className="flex gap-4 mb-4">
        <div className="h-12 w-12 rounded-lg bg-slate-100" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-48 bg-slate-100 rounded-sm" />
          <div className="h-3 w-32 bg-slate-100 rounded-sm" />
        </div>
      </div>
      <div className="space-y-2 flex-1">
        <div className="h-3 w-full bg-slate-100 rounded-sm" />
        <div className="h-3 w-3/4 bg-slate-100 rounded-sm" />
      </div>
      <div className="flex gap-2 mt-3">
        <div className="h-6 w-16 bg-slate-100 rounded-sm" />
        <div className="h-6 w-16 bg-slate-100 rounded-sm" />
      </div>
    </div>
  )
}

export default function Jobs() {
  const [search, setSearch] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const [selectedLevel, setSelectedLevel] = useState<string>('all')
  const [selectedLocation, setSelectedLocation] = useState<string>('all')
  const [sortBy, setSortBy] = useState<string>('relevance')
  const [savedJobs, setSavedJobs] = useState<Set<string>>(new Set())
  const [showFilters, setShowFilters] = useState(false)
  const [viewMode, setViewMode] = useState<'matched' | 'all'>('matched')
  const [isAuthenticated, setIsAuthenticated] = useState(true)

  const router = useRouter()
  const observerTarget = useRef<HTMLDivElement>(null)

  useEffect(() => { if (search) setViewMode('all') }, [search])

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } = useInfiniteQuery({
    queryKey: ['jobs-infinite', { search, type: selectedType, level: selectedLevel, viewMode }],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams()
      params.set('page', String(pageParam))
      params.set('limit', '10')
      if (search) params.set('search', search)
      if (selectedType !== 'all') params.set('type', selectedType.toUpperCase().replace('-', '_'))
      if (selectedLevel !== 'all') params.set('level', selectedLevel.toUpperCase())
      let endpoint = '/v1/jobs'
      if (viewMode === 'matched' && isAuthenticated) endpoint = '/v1/jobs/matched'
      try {
        const response = await get<any>(`${endpoint}?${params}`)
        const jobs = response?.jobs || response?.data?.jobs || []
        const total = response?.totalMatched || response?.total || response?.meta?.total || response?.data?.totalMatched || jobs.length || 0
        const totalPages = Math.ceil(total / 10) || 0
        return { jobs, total, nextPage: pageParam < totalPages ? pageParam + 1 : undefined, page: pageParam }
      } catch (err: any) {
        if (err?.response?.status === 401 && viewMode === 'matched') { setIsAuthenticated(false); setViewMode('all'); throw err }
        throw err
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    retry: 1,
    staleTime: 60000,
  })

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) fetchNextPage()
    }, { threshold: 0.5 })
    if (observerTarget.current) observer.observe(observerTarget.current)
    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  const allJobs = useMemo(() => data?.pages.flatMap(page => page.jobs) || [], [data])

  const filteredJobs = useMemo(() => {
    let jobs = allJobs
    if (selectedLocation !== 'all') {
      if (selectedLocation === 'remote') jobs = jobs.filter((j: Job) => j.location?.toLowerCase().includes('remote') || j.isRemote)
      else if (selectedLocation === 'onsite') jobs = jobs.filter((j: Job) => !j.location?.toLowerCase().includes('remote') && !j.isRemote)
    }
    if (sortBy === 'salary') jobs = [...jobs].sort((a: Job, b: Job) => (b.salaryMax || 0) - (a.salaryMax || 0))
    return jobs
  }, [allJobs, selectedLocation, sortBy])

  const apiStats = useMemo(() => ({ total: data?.pages[0]?.total || 0 }), [data])

  const applyMutation = useMutation({
    mutationFn: (jobId: string) => post(`/v1/jobs/${jobId}/apply`),
    onSuccess: () => toast({ title: 'Application sent!', description: 'Good luck!' }),
    onError: () => toast({ variant: 'destructive', title: 'Error', description: 'Failed to apply.' }),
  })

  const toggleSaveJob = (jobId: string) => {
    const n = new Set(savedJobs)
    n.has(jobId) ? (n.delete(jobId), toast({ title: 'Removed from saved' })) : (n.add(jobId), toast({ title: 'Saved!' }))
    setSavedJobs(n)
  }

  const jobTypes = ['full-time', 'part-time', 'contract', 'freelance', 'internship']
  const experienceLevels = ['entry', 'mid', 'senior', 'lead', 'executive']

  return (
    <div className="w-full min-h-screen bg-[#F0F2F5] relative p-4 md:p-6 lg:p-8 font-['Plus_Jakarta_Sans'] text-slate-800 overflow-x-hidden">
      <div className="max-w-[1536px] mx-auto space-y-6">

        {/* DARK HERO */}
        <div className="bg-[#0A0A0A] rounded-2xl p-8 lg:p-12 shadow-xl relative overflow-hidden border border-slate-800 min-h-[200px] flex items-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#ADFF2F]/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-20 w-64 h-64 bg-[#A78BFA]/5 rounded-full blur-[80px] pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between w-full gap-6">
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <div className="px-2.5 py-1 rounded-[4px] bg-white/10 border border-white/5 text-[#ADFF2F] text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md">
                  <Briefcase className="w-3 h-3" /> Job Board
                </div>
              </div>
              <h1 className="text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight">
                Find Your <span className="text-slate-400">Next Role</span>
              </h1>
              <p className="text-sm text-slate-400 font-medium max-w-lg leading-relaxed">
                Discover opportunities that match your verified skills and aura score.
              </p>
            </div>
            <div className="flex items-center gap-3">
              {isAuthenticated && (
                <div className="flex bg-white/5 border border-white/10 rounded-lg p-1">
                  <button onClick={() => setViewMode('matched')} className={cn("px-4 py-2 text-[10px] font-extrabold uppercase tracking-widest rounded-md transition-all", viewMode === 'matched' ? "bg-[#ADFF2F] text-black" : "text-slate-400 hover:text-white")}>
                    <Sparkles className="w-3 h-3 inline mr-1.5" /> For You
                  </button>
                  <button onClick={() => setViewMode('all')} className={cn("px-4 py-2 text-[10px] font-extrabold uppercase tracking-widest rounded-md transition-all", viewMode === 'all' ? "bg-white/10 text-white" : "text-slate-400 hover:text-white")}>
                    All Jobs
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* SEARCH & FILTERS STRIP */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input placeholder="Search jobs by title, company, or skills..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 h-10 bg-slate-50 border-slate-200 rounded-lg text-sm font-medium" />
            </div>
            <div className="flex gap-2">
              <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="h-10 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold text-slate-700">
                <option value="relevance">Relevance</option>
                <option value="recent">Most Recent</option>
                <option value="salary">Highest Salary</option>
              </select>
              <Button variant="outline" onClick={() => setShowFilters(!showFilters)} className="h-10 px-4 text-xs font-bold border-slate-200 rounded-lg">
                <SlidersHorizontal className="h-3.5 w-3.5 mr-1.5" /> Filters
              </Button>
            </div>
          </div>

          {/* Job Type Pills */}
          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 hide-scrollbar">
            <button onClick={() => setSelectedType('all')} className={cn("px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest rounded-md transition-all whitespace-nowrap border", selectedType === 'all' ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300")}>All Types</button>
            {jobTypes.map((type) => (
              <button key={type} onClick={() => setSelectedType(type)} className={cn("px-3 py-1.5 text-[10px] font-extrabold uppercase tracking-widest rounded-md transition-all whitespace-nowrap border", selectedType === type ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-500 border-slate-200 hover:border-slate-300")}>
                {jobTypeLabels[type]}
              </button>
            ))}
          </div>

          {/* Advanced Filters */}
          <AnimatePresence>
            {showFilters && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                <div className="flex flex-wrap gap-4 mt-3 pt-3 border-t border-slate-100">
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Experience Level</label>
                    <select value={selectedLevel} onChange={(e) => setSelectedLevel(e.target.value)} className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium">
                      <option value="all">All Levels</option>
                      {experienceLevels.map((level) => <option key={level} value={level}>{experienceLevelLabels[level]}</option>)}
                    </select>
                  </div>
                  <div className="flex-1 min-w-[200px]">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1.5 block">Location</label>
                    <select value={selectedLocation} onChange={(e) => setSelectedLocation(e.target.value)} className="w-full h-9 px-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium">
                      <option value="all">All Locations</option>
                      <option value="remote">Remote Only</option>
                      <option value="onsite">On-site Only</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <Button variant="outline" onClick={() => { setSelectedType('all'); setSelectedLevel('all'); setSelectedLocation('all'); setSearch('') }} className="h-9 text-xs font-bold border-slate-200 rounded-lg">
                      <X className="h-3 w-3 mr-1.5" /> Clear
                    </Button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* RESULTS COUNT */}
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
            {isLoading ? "Searching..." : `${apiStats.total} jobs found`}
          </span>
          {savedJobs.size > 0 && (
            <span className="text-[10px] font-extrabold text-[#65A30D] uppercase tracking-widest flex items-center gap-1">
              <Heart className="h-3 w-3 fill-current" /> {savedJobs.size} saved
            </span>
          )}
        </div>

        {/* JOB LISTINGS */}
        <div className="space-y-4">
          {filteredJobs.map((job: Job) => {
            const isSaved = savedJobs.has(job.id)

            return (
              <motion.div
                key={job.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-[#ADFF2F]/30 transition-all cursor-pointer group overflow-hidden"
                onClick={() => router.push(`/jobs/${job.id}`)}
              >
                <div className="p-5 lg:p-6">
                  <div className="flex items-start gap-4">
                    {/* Company Logo */}
                    <div className="w-12 h-12 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center flex-shrink-0 group-hover:border-slate-300 transition-colors">
                      {job.companyLogo ? (
                        <img src={job.companyLogo} alt={job.company} className="w-8 h-8 object-contain rounded-md" />
                      ) : (
                        <Building className="w-5 h-5 text-slate-400" />
                      )}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">{job.title}</h3>
                          <div className="flex items-center gap-2 mt-1 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>{job.company || "Confidential"}</span>
                            <span className="w-1 h-1 rounded-full bg-slate-300" />
                            <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.isRemote ? "Remote" : job.location}</span>
                          </div>
                        </div>
                        <div className="hidden sm:block text-right flex-shrink-0">
                          <p className="text-sm font-black text-[#65A30D]">{formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}</p>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{formatRelativeTime(job.createdAt)}</p>
                        </div>
                      </div>

                      {/* Description */}
                      <p className="text-xs text-slate-600 font-medium mt-3 line-clamp-2 leading-relaxed">
                        {job.description?.length > 150 ? `${job.description.slice(0, 150).trim()}...` : job.description}
                      </p>

                      {/* Bottom Row */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-4 pt-3 border-t border-slate-50">
                        <div className="flex flex-wrap items-center gap-2">
                          {(job.requiredSkills || job.skills || []).slice(0, 4).map((skill: string) => (
                            <span key={skill} className="px-2 py-0.5 text-[9px] font-bold text-slate-600 bg-slate-100 rounded-[2px] uppercase tracking-wider">{skill}</span>
                          ))}
                          {(job.requiredSkills || job.skills || []).length > 4 && (
                            <span className="text-[9px] font-bold text-slate-400">+{(job.requiredSkills || job.skills || []).length - 4}</span>
                          )}
                          {(job.minAuraScore || 0) > 0 && (
                            <span className="px-2 py-0.5 text-[9px] font-extrabold text-[#65A30D] bg-[#ADFF2F]/10 rounded-[2px] border border-[#ADFF2F]/20 flex items-center gap-1">
                              <Zap className="w-2.5 h-2.5" /> {job.minAuraScore}+ Aura
                            </span>
                          )}
                          <span className="px-2 py-0.5 text-[9px] font-bold text-slate-500 bg-slate-50 rounded-[2px] border border-slate-100">{jobTypeLabels[job.type] || job.type}</span>
                        </div>

                        <div className="flex items-center gap-2">
                          <Button
                            onClick={(e) => { e.stopPropagation(); applyMutation.mutate(job.id) }}
                            className="h-8 px-4 rounded-lg text-xs font-extrabold uppercase tracking-widest bg-slate-900 text-white hover:bg-slate-800 transition-all"
                          >
                            Apply <ArrowRight className="w-3 h-3 ml-1" />
                          </Button>
                          <button
                            onClick={(e) => { e.stopPropagation(); toggleSaveJob(job.id) }}
                            className={cn("h-8 w-8 rounded-lg border flex items-center justify-center transition-all", isSaved ? "text-[#65A30D] border-[#ADFF2F]/30 bg-[#ADFF2F]/10" : "text-slate-400 border-slate-200 hover:border-slate-300 bg-white")}
                          >
                            {isSaved ? <Heart className="w-3.5 h-3.5 fill-current" /> : <BookmarkPlus className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}

          {/* Loading Skeletons */}
          {(isLoading || isFetchingNextPage) && (
            <div className="space-y-4">{[...Array(3)].map((_, i) => <JobCardSkeleton key={i} />)}</div>
          )}

          {/* Infinite Scroll Trigger */}
          <div ref={observerTarget} className="h-2 flex items-center justify-center">
            {isFetchingNextPage ? (
              <div className="flex items-center text-slate-400 gap-2 text-xs font-bold"><Loader2 className="h-4 w-4 animate-spin" /> Loading more...</div>
            ) : !hasNextPage && filteredJobs.length > 0 ? (
              <div className="text-slate-400 text-xs font-bold uppercase tracking-widest">End of results</div>
            ) : null}
          </div>

          {!isLoading && filteredJobs.length === 0 && (
            <div className="text-center py-20 bg-white rounded-xl border border-slate-200 shadow-sm">
              <div className="w-16 h-16 rounded-lg bg-slate-50 border border-slate-200 flex items-center justify-center mx-auto mb-4">
                <Search className="w-6 h-6 text-slate-300" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest mb-2">No Jobs Found</h3>
              <p className="text-xs text-slate-500 font-medium mb-4">Try adjusting your filters or search terms.</p>
              <Button variant="outline" className="h-8 text-xs font-bold rounded-md border-slate-200" onClick={() => { setSearch(''); setSelectedType('all'); setSelectedLevel('all'); setSelectedLocation('all') }}>
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
