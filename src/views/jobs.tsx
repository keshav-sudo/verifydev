"use client"

import { useState, useMemo, useEffect, useRef } from 'react'
import { useInfiniteQuery, useMutation } from '@tanstack/react-query'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select'
import { get, post } from '@/api/client'
import { formatSalary, formatRelativeTime, cn } from '@/lib/utils'
import { toast } from '@/hooks/use-toast'
import type { Job } from '@/types'
import {
  Search,
  MapPin,
  Building,
  Clock,
  Briefcase,
  Zap,
  ArrowRight,
  Loader2,
  Heart,
  DollarSign,
  TrendingUp,
  Sparkles,
  SlidersHorizontal,
  BookmarkPlus,
  BarChart3,
  Globe,
  X,
} from 'lucide-react'

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 }
}

const jobTypeLabels: Record<string, string> = {
  'full-time': 'Full-time',
  'part-time': 'Part-time',
  contract: 'Contract',
  freelance: 'Freelance',
  internship: 'Internship',
  'FULL_TIME': 'Full-time',
  'PART_TIME': 'Part-time',
  'CONTRACT': 'Contract',
  'FREELANCE': 'Freelance',
  'INTERNSHIP': 'Internship',
}

const experienceLevelLabels: Record<string, string> = {
  entry: 'Entry Level',
  mid: 'Mid Level',
  senior: 'Senior',
  lead: 'Lead',
  executive: 'Executive',
  'ENTRY': 'Entry Level',
  'MID': 'Mid Level',
  'SENIOR': 'Senior',
  'LEAD': 'Lead',
  'PRINCIPAL': 'Principal',
}

const jobTypeIcons: Record<string, React.ReactNode> = {
  'full-time': <Briefcase className="h-3 w-3" />,
  'part-time': <Clock className="h-3 w-3" />,
  contract: <DollarSign className="h-3 w-3" />,
  freelance: <Globe className="h-3 w-3" />,
  internship: <TrendingUp className="h-3 w-3" />,
}

// Skeleton component
function JobCardSkeleton() {
  return (
    <Card className="border border-border/80">
      <CardContent className="py-6">
        <div className="flex gap-4">
          <div className="h-14 w-14 rounded-xl bg-muted animate-pulse" />
          <div className="flex-1 space-y-3">
            <div className="h-5 w-48 bg-muted rounded animate-pulse" />
            <div className="h-4 w-32 bg-muted rounded animate-pulse" />
            <div className="flex gap-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-6 w-16 bg-muted rounded animate-pulse" />
              ))}
            </div>
          </div>
          <div className="space-y-2 text-right">
            <div className="h-5 w-24 bg-muted rounded animate-pulse ml-auto" />
            <div className="h-4 w-16 bg-muted rounded animate-pulse ml-auto" />
          </div>
        </div>
      </CardContent>
    </Card>
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
  const [isAuthenticated, setIsAuthenticated] = useState(true) // Should be derived from context/token
  
  const router = useRouter()
  const observerTarget = useRef<HTMLDivElement>(null)

  // Infinite Scroll Query
  // Auto-switch to global search when user searches
  useEffect(() => {
    if (search) {
      setViewMode('all')
    }
  }, [search])

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading
  } = useInfiniteQuery({
    queryKey: ['jobs-infinite', { search, type: selectedType, level: selectedLevel, viewMode }],
    queryFn: async ({ pageParam = 1 }) => {
      const params = new URLSearchParams()
      params.set('page', String(pageParam))
      params.set('limit', '10') // Faster loading with smaller chunks
      
      if (search) params.set('search', search)
      if (selectedType !== 'all') params.set('type', selectedType.toUpperCase().replace('-', '_'))
      if (selectedLevel !== 'all') params.set('level', selectedLevel.toUpperCase())
      
      // Choose endpoint
      let endpoint = '/v1/jobs'
      if (viewMode === 'matched' && isAuthenticated) {
        endpoint = '/v1/jobs/matched'
      }

      try {
        const response = await get<any>(`${endpoint}?${params}`)
        
        // Handle response differences - get() returns response.data.data,
        // so 'response' is already the inner data object { jobs: [...], totalMatched: N }
        const jobs = response?.jobs || response?.data?.jobs || []
        const total = response?.totalMatched || response?.total || response?.meta?.total || response?.data?.totalMatched || jobs.length || 0
        const totalPages = Math.ceil(total / 10) || 0
        
        return {
          jobs,
          total,
          nextPage: pageParam < totalPages ? pageParam + 1 : undefined,
          page: pageParam
        }
      } catch (err: any) {
        // Fallback to 'all' view if unauthorized
        if (err?.response?.status === 401 && viewMode === 'matched') {
           setIsAuthenticated(false)
           setViewMode('all')
           throw parseError(err) // Retry will handle switch
        }
        throw err
      }
    },
    getNextPageParam: (lastPage) => lastPage.nextPage,
    initialPageParam: 1,
    retry: 1,
    staleTime: 60000, // 1 minute cache
  })

  // Intersection Observer for Infinite Scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage()
        }
      },
      { threshold: 0.5 } // Trigger when 50% visible
    )

    if (observerTarget.current) {
      observer.observe(observerTarget.current)
    }

    return () => observer.disconnect()
  }, [hasNextPage, isFetchingNextPage, fetchNextPage])

  // Flatten logic
  const allJobs = useMemo(() => {
    return data?.pages.flatMap(page => page.jobs) || []
  }, [data])

  // Filter local logic (optional, if API doesn't filter perfectly)
  const filteredJobs = useMemo(() => {
    let jobs = allJobs
    
    // Client-side location filter (if API doesn't support specific location enum)
    if (selectedLocation !== 'all') {
      if (selectedLocation === 'remote') {
        jobs = jobs.filter((j: Job) => j.location?.toLowerCase().includes('remote') || j.isRemote)
      } else if (selectedLocation === 'onsite') {
        jobs = jobs.filter((j: Job) => !j.location?.toLowerCase().includes('remote') && !j.isRemote)
      }
    }
    
    // Client-side Sort (if needed, though API is preferred)
    if (sortBy === 'salary') {
      jobs = [...jobs].sort((a: Job, b: Job) => (b.salaryMax || 0) - (a.salaryMax || 0))
    }
    // 'relevance' and 'recent' handled by API

    return jobs
  }, [allJobs, selectedLocation, sortBy])

  const apiStats = useMemo(() => {
     const total = data?.pages[0]?.total || 0
     return { total }
  }, [data])

  const applyMutation = useMutation({
    mutationFn: (jobId: string) => post(`/v1/jobs/${jobId}/apply`),
    onSuccess: () => {
      toast({ title: 'Application sent!', description: 'Good luck with your application.' })
    },
    onError: () => {
      toast({ variant: 'destructive', title: 'Error', description: 'Failed to apply. Try again.' })
    },
  })

  const toggleSaveJob = (jobId: string) => {
    const newSaved = new Set(savedJobs)
    if (newSaved.has(jobId)) {
      newSaved.delete(jobId)
      toast({ title: 'Removed from saved jobs' })
    } else {
      newSaved.add(jobId)
      toast({ title: 'Saved!', description: 'Job added to your saved list.' })
    }
    setSavedJobs(newSaved)
  }

  const jobTypes = ['full-time', 'part-time', 'contract', 'freelance', 'internship']
  const experienceLevels = ['entry', 'mid', 'senior', 'lead', 'executive']

  // Helper for error parsing
  const parseError = (err: any) => err

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
      >
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-2">
            <Briefcase className="h-8 w-8 text-primary" />
            Jobs
          </h1>
          <p className="text-muted-foreground mt-1">
            Find opportunities that match your skills and aura
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isAuthenticated && (
            <div className="flex bg-muted rounded-lg p-1 mr-2">
                <button
                    onClick={() => setViewMode('matched')}
                    className={cn(
                        "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                        viewMode === 'matched' ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    For You
                </button>
                <button
                    onClick={() => setViewMode('all')}
                    className={cn(
                        "px-3 py-1.5 text-sm font-medium rounded-md transition-all",
                        viewMode === 'all' ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                    )}
                >
                    All Jobs
                </button>
            </div>
          )}
          <Button variant="outline" onClick={() => setShowFilters(!showFilters)}>
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
          </Button>
        </div>
      </motion.div>

      {/* Mode Banner */}
      {viewMode === 'matched' && isAuthenticated && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="bg-primary/5 border border-primary/20 rounded-lg p-4 flex items-center gap-3"
          >
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                  <Sparkles className="h-5 w-5 text-primary animate-pulse" />
              </div>
              <div>
                  <h3 className="font-semibold text-primary">Curated Matches</h3>
                  <p className="text-xs text-muted-foreground">Jobs selected based on your verified skills and aura score.</p>
              </div>
          </motion.div>
      )}

      {/* Search & Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="space-y-4 sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-4 border-b"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search jobs by title, company, or skills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 h-11 shadow-sm"
            />
          </div>
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px] h-11">
              <BarChart3 className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance">Relevance</SelectItem>
              <SelectItem value="recent">Most Recent</SelectItem>
              <SelectItem value="salary">Highest Salary</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Job Type Pills (Scrollable) */}
        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
          <Button
            variant={selectedType === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedType('all')}
            className="flex-shrink-0"
          >
            All Types
          </Button>
          {jobTypes.map((type) => (
            <Button
              key={type}
              variant={selectedType === type ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedType(type)}
              className="flex-shrink-0 gap-1"
            >
              {jobTypeIcons[type]}
              {jobTypeLabels[type]}
            </Button>
          ))}
        </div>

        {/* Advanced Filters */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="overflow-hidden"
            >
              <Card className="border border-border/80 shadow-sm mt-2">
                <CardContent className="py-4">
                  <div className="flex flex-wrap gap-4">
                    <div className="flex-1 min-w-[200px]">
                      <label className="text-sm font-medium mb-2 block">Experience Level</label>
                      <Select value={selectedLevel} onValueChange={setSelectedLevel}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Levels" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Levels</SelectItem>
                          {experienceLevels.map((level) => (
                            <SelectItem key={level} value={level}>
                              {experienceLevelLabels[level]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex-1 min-w-[200px]">
                      <label className="text-sm font-medium mb-2 block">Location</label>
                      <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                        <SelectTrigger>
                          <SelectValue placeholder="All Locations" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Locations</SelectItem>
                          <SelectItem value="remote">Remote Only</SelectItem>
                          <SelectItem value="onsite">On-site Only</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex items-end">
                      <Button 
                        variant="outline" 
                        onClick={() => {
                          setSelectedType('all')
                          setSelectedLevel('all')
                          setSelectedLocation('all')
                          setSearch('')
                        }}
                      >
                        <X className="h-4 w-4 mr-2" />
                        Clear Filters
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Results count */}
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>
            {isLoading ? "Searching..." : `Found ${apiStats.total} jobs`}
        </span>
        {savedJobs.size > 0 && (
          <Link href="/jobs/saved" className="text-primary hover:underline flex items-center gap-1">
            <Heart className="h-4 w-4 fill-current" />
            {savedJobs.size} saved
          </Link>
        )}
      </div>

      {/* Jobs List */}
      <motion.div 
        className="space-y-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {filteredJobs.map((job: Job) => {
            const isMatched = viewMode === 'matched' || (job as any).matchResult?.matchScore > 70
            const isSaved = savedJobs.has(job.id)
            
            return (
              <motion.div 
                key={job.id} 
                variants={itemVariants}
                initial="hidden"
                animate="visible"
                layoutId={job.id}
              >
                <Card 
                  onClick={() => router.push(`/jobs/${job.id}`)}
                  className={cn(
                  "group relative overflow-hidden transition-all duration-300 hover:shadow-xl border-border/60 cursor-pointer",
                  "hover:border-primary/50 active:scale-[0.99]",
                  isMatched ? "bg-gradient-to-br from-background to-primary/5 border-primary/20" : "bg-card",
                  isSaved && "border-yellow-500/40"
                )}>
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                  
                  <CardContent className="p-4 sm:p-6 relative">
                    <div className="flex flex-col gap-4">
                      {/* Top Row */}
                      <div className="flex items-start gap-4">
                        <div className={cn(
                          "h-10 w-10 sm:h-14 sm:w-14 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-300",
                          "bg-surface-1 border border-border/50 shadow-sm group-hover:shadow-md"
                        )}>
                          {job.companyLogo ? (
                            <img src={job.companyLogo} alt={job.company} className="h-9 w-9 object-contain rounded-md" />
                          ) : (
                            <Building className="h-7 w-7 text-muted-foreground/40" />
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-y-2">
                             <div>
                               <h3 className="text-base sm:text-lg font-bold text-foreground hover:text-primary transition-colors line-clamp-1">
                                  {job.title}
                                </h3>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-0.5">
                                  <span className="font-medium text-foreground/80">
                                    {job.company || "Confidential Company"}
                                  </span>
                                  <span className="h-1 w-1 rounded-full bg-border" />
                                  <span className="flex items-center gap-1">
                                     <MapPin className="h-3 w-3" />
                                     {job.isRemote ? "Remote" : job.location}
                                  </span>
                                </div>
                             </div>

                             <div className="hidden sm:flex flex-col items-end gap-1">
                                <p className="font-bold text-lg text-emerald-600 dark:text-emerald-400">
                                  {formatSalary(job.salaryMin, job.salaryMax, job.salaryCurrency)}
                                </p>
                                <div className="flex items-center gap-2 text-xs">
                                    {(job.minAuraScore || 0) > 0 && (
                                        <Badge variant="outline" className="h-5 border-primary/20 text-primary bg-primary/5 gap-1 px-1.5 font-normal">
                                            <Zap className="h-3 w-3" /> {job.minAuraScore}+ Aura
                                        </Badge>
                                    )}
                                    <Badge variant="secondary" className="h-5 gap-1 font-normal bg-secondary/50 text-muted-foreground">
                                        {jobTypeLabels[job.type] || job.type}
                                    </Badge>
                                    <span className="text-muted-foreground flex items-center gap-1">
                                       <Clock className="h-3 w-3" /> {formatRelativeTime(job.createdAt)}
                                    </span>
                                </div>
                             </div>
                          </div>
                        </div>
                      </div>

                      {/* Description */}
                      <div className="text-sm text-muted-foreground leading-relaxed pl-0 sm:pl-[3.5rem] break-words mt-2">
                          {job.description?.length > 150 ? (
                              <>{job.description.slice(0, 150).trim()}... <span className="ml-1 text-primary font-medium">Read more</span></>
                          ) : (
                              job.description
                          )}
                      </div>

                      {/* Skills */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 pl-0 sm:pl-[3.5rem] pt-3">
                          <div className="flex flex-wrap gap-2">
                            {(job.requiredSkills || job.skills || []).slice(0, 4).map((skill: string) => (
                                <span key={skill} className="px-2 py-1 rounded-md bg-secondary/40 text-xs font-medium text-secondary-foreground border border-transparent group-hover:border-border/60 transition-colors">
                                  {skill}
                                </span>
                            ))}
                            {(job.requiredSkills || job.skills || []).length > 4 && (
                                <span className="px-2 py-1 text-xs text-muted-foreground font-medium">
                                  +{(job.requiredSkills || job.skills || []).length - 4}
                                </span>
                            )}
                          </div>
                          
                          {/* Mobile Apply Button */}
                          <div className="flex sm:hidden items-center gap-2 w-full pt-2">
                              <Button 
                                  className="flex-1 h-10 rounded-lg shadow-sm hover:shadow-md transition-all gap-2 font-medium"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    applyMutation.mutate(job.id)
                                  }}
                              >
                                  Quick Apply <ArrowRight className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleSaveJob(job.id)
                                  }}
                                  className={cn("h-10 w-10 rounded-lg border-border/60 bg-transparent", isSaved && "text-yellow-500 border-yellow-500/20 bg-yellow-500/5")}
                              >
                                  {isSaved ? <Heart className="h-4 w-4 fill-current" /> : <BookmarkPlus className="h-4 w-4" />}
                              </Button>
                          </div>
                          
                          <div className="hidden sm:flex items-center gap-3">
                              <Button 
                                  className="h-9 px-4 rounded-lg shadow-sm hover:shadow-md transition-all gap-2 font-medium"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    applyMutation.mutate(job.id)
                                  }}
                              >
                                  Quick Apply <ArrowRight className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                  variant="outline"
                                  size="icon"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    toggleSaveJob(job.id)
                                  }}
                                  className={cn("h-9 w-9 rounded-lg border-border/60 bg-transparent hover:bg-secondary", isSaved && "text-yellow-500 border-yellow-500/20 bg-yellow-500/5")}
                              >
                                  {isSaved ? <Heart className="h-4 w-4 fill-current" /> : <BookmarkPlus className="h-4 w-4" />}
                              </Button>
                          </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            )
          })}
          
          {/* Loading Skeletons */}
          {(isLoading || isFetchingNextPage) && (
            <div className="space-y-4">
              {[...Array(3)].map((_, i) => (
                <JobCardSkeleton key={i} />
              ))}
            </div>
          )}

          {/* Infinite Scroll Trigger */}
          <div ref={observerTarget} className="h-20 flex items-center justify-center">
            {isFetchingNextPage ? (
               <div className="flex items-center text-muted-foreground gap-2">
                 <Loader2 className="h-4 w-4 animate-spin" /> Loading more jobs...
               </div>
            ) : !hasNextPage && filteredJobs.length > 0 ? (
               <div className="text-muted-foreground text-sm">You've reached the end!</div>
            ) : null}
          </div>

          {!isLoading && filteredJobs.length === 0 && (
            <div className="text-center py-20">
              <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Search className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-xl font-semibold">No jobs found</h3>
              <p className="text-muted-foreground mt-2">Try adjusting your filters or search terms.</p>
              <Button 
                variant="outline" 
                className="mt-6"
                onClick={() => {
                   setSearch('')
                   setSelectedType('all')
                   setSelectedLevel('all')
                   setSelectedLocation('all')
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
      </motion.div>
    </div>
  )
}
