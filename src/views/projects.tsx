"use client"

import { useState, useMemo, useEffect } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { get, post, del } from '@/api/client'
import { toast } from '@/hooks/use-toast'
import {
  formatNumber,
  formatRelativeTime,
  cn
} from '@/lib/utils'
import type { Project } from '@/types'
import {
  Plus,
  Search,
  Star,
  GitFork,
  Clock,
  RefreshCw,
  FolderGit2,
  Loader2,
  LayoutGrid,
  List,
  Zap,
  CheckCircle2,
  X,
  Check,
  Trash2,
  MoreVertical,
  Code2,
  Activity,
  SortAsc,
  Server,
  MonitorSmartphone,
  Layers,
  BrainCircuit,
  Settings2,
  GitBranch,
  ChevronDown
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

// GitHub repo type from available endpoint
interface GitHubRepo {
  id: number
  name: string
  fullName: string
  url: string
  description: string | null
  language: string | null
  stars: number
  forks: number
  defaultBranch: string
  sizeMB: number
  isAdded: boolean
}

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.05 }
  }
}

const itemVariants = {
  hidden: { opacity: 0, y: 15 },
  visible: { opacity: 1, y: 0 }
}

// View modes
type ViewMode = 'grid' | 'list'
type SortField = 'updatedAt' | 'stars' | 'auraContribution' | 'name'
type SortOrder = 'asc' | 'desc'
type ProjectType = 'backend' | 'frontend' | 'fullstack' | 'ml' | 'library'

// ============================================
// SHARP PROGRESS RING
// ============================================
function CircularProgress({ value, size = 48, strokeWidth = 4 }: { value: number, size?: number, strokeWidth?: number }) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (value / 100) * circumference

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90 w-full h-full">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#F1F5F9" // slate-100
          strokeWidth={strokeWidth}
          fill="none"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#84CC16" // Lime 500
          strokeWidth={strokeWidth}
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-[11px] font-black text-slate-900">{value}</span>
      </div>
    </div>
  )
}


// Skeleton components (Sharpened)
function ProjectCardSkeleton() {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-5 h-[240px] flex flex-col">
      <div className="flex justify-between items-start mb-5 pb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-md bg-slate-100 animate-pulse" />
          <div>
            <div className="h-4 w-32 bg-slate-100 rounded-sm animate-pulse mb-2" />
            <div className="h-3 w-20 bg-slate-100 rounded-sm animate-pulse" />
          </div>
        </div>
        <div className="h-8 w-8 bg-slate-100 rounded-full animate-pulse" />
      </div>
      <div className="flex-1 space-y-2.5">
        <div className="h-3 w-full bg-slate-100 rounded-sm animate-pulse" />
        <div className="h-3 w-4/5 bg-slate-100 rounded-sm animate-pulse" />
      </div>
      <div className="flex justify-between mt-4 pt-4 border-t border-slate-100">
        <div className="flex gap-3">
          <div className="h-4 w-12 bg-slate-100 rounded-sm animate-pulse" />
          <div className="h-4 w-12 bg-slate-100 rounded-sm animate-pulse" />
        </div>
        <div className="h-4 w-16 bg-slate-100 rounded-sm animate-pulse" />
      </div>
    </div>
  )
}

function StatsSkeleton() {
  return (
    <div className="bg-[#0A0A0A] border border-slate-800 rounded-lg shadow-lg flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-800 mb-8 overflow-hidden h-[120px]">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="flex-1 p-6">
          <div className="h-3 w-24 bg-slate-800 rounded-sm animate-pulse mb-4" />
          <div className="h-8 w-16 bg-slate-800 rounded-sm animate-pulse" />
        </div>
      ))}
    </div>
  )
}

export default function Projects() {
  // State
  const [search, setSearch] = useState('')
  const [repoSearch, setRepoSearch] = useState('')
  const [selectedRepos, setSelectedRepos] = useState<Set<string>>(new Set())
  const [viewMode, setViewMode] = useState<ViewMode>('grid')
  const [sortField, setSortField] = useState<SortField>('updatedAt')
  const [sortOrder] = useState<SortOrder>('desc')
  const [languageFilter, setLanguageFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [showAddModal, setShowAddModal] = useState(false)
  const [projectType, setProjectType] = useState<ProjectType>('fullstack')
  const [repoBranches, setRepoBranches] = useState<Record<string, { name: string; isDefault: boolean }[]>>({})
  const [selectedBranches, setSelectedBranches] = useState<Record<string, string>>({})
  const [loadingBranches, setLoadingBranches] = useState<Set<string>>(new Set())

  const queryClient = useQueryClient()

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['projects'],
    queryFn: () => get<{ projects: Project[]; total: number }>('/v1/projects'),
  })

  // Fetch available GitHub repos
  const { data: availableReposData, isLoading: isLoadingRepos } = useQuery({
    queryKey: ['available-repos'],
    queryFn: () => get<{ repos: GitHubRepo[] }>('/v1/projects/available'),
    enabled: showAddModal,
    retry: 1,
  })

  // Filter available repos based on search
  const filteredRepos = useMemo(() => {
    const repos = availableReposData?.repos || []
    if (!repoSearch) return repos
    const searchLower = repoSearch.toLowerCase()
    return repos.filter(repo =>
      repo.name.toLowerCase().includes(searchLower) ||
      repo.fullName.toLowerCase().includes(searchLower) ||
      repo.description?.toLowerCase().includes(searchLower) ||
      repo.language?.toLowerCase().includes(searchLower)
    )
  }, [availableReposData?.repos, repoSearch])

  // Fetch branches for a repo
  const fetchBranches = async (repoUrl: string, defaultBranch: string) => {
    if (repoBranches[repoUrl]) return
    setLoadingBranches(prev => new Set(prev).add(repoUrl))
    try {
      const data = await get<{ branches: { name: string; protected: boolean }[] }>(`/v1/projects/repo/branches?repo=${encodeURIComponent(repoUrl)}`)
      const branches = (data?.branches || []).map(b => ({
        name: b.name,
        isDefault: b.name === defaultBranch,
      }))
      // Sort so default branch is first
      branches.sort((a, b) => (b.isDefault ? 1 : 0) - (a.isDefault ? 1 : 0))
      setRepoBranches(prev => ({ ...prev, [repoUrl]: branches }))
      // Auto-select default branch
      setSelectedBranches(prev => ({ ...prev, [repoUrl]: defaultBranch }))
    } catch (e) {
      // Fallback to just the default branch
      setRepoBranches(prev => ({ ...prev, [repoUrl]: [{ name: defaultBranch, isDefault: true }] }))
      setSelectedBranches(prev => ({ ...prev, [repoUrl]: defaultBranch }))
    } finally {
      setLoadingBranches(prev => { const n = new Set(prev); n.delete(repoUrl); return n })
    }
  }

  // Compute stats
  const stats = useMemo(() => {
    const projects = data?.projects || []
    return {
      total: projects.length,
      analyzed: projects.filter(p => p.analysisStatus?.toLowerCase() === 'completed').length,
      totalStars: projects.reduce((acc, p) => acc + (p.stars || 0), 0),
      totalAura: projects.reduce((acc, p) => acc + (p.auraContribution || 0), 0),
      languages: [...new Set(projects.map(p => p.language).filter(Boolean))]
    }
  }, [data?.projects])

  // Filtered and sorted projects
  const filteredProjects = useMemo(() => {
    let projects = data?.projects || []

    if (search) {
      const searchLower = search.toLowerCase()
      projects = projects.filter(p =>
        p.name?.toLowerCase().includes(searchLower) ||
        p.language?.toLowerCase().includes(searchLower) ||
        p.description?.toLowerCase().includes(searchLower)
      )
    }
    if (languageFilter !== 'all') {
      projects = projects.filter(p => p.language === languageFilter)
    }
    if (statusFilter !== 'all') {
      projects = projects.filter(p => p.analysisStatus?.toLowerCase() === statusFilter)
    }

    projects = [...projects].sort((a, b) => {
      let comparison = 0
      switch (sortField) {
        case 'stars': comparison = (a.stars || 0) - (b.stars || 0); break;
        case 'auraContribution': comparison = (a.auraContribution || 0) - (b.auraContribution || 0); break;
        case 'name': comparison = (a.name || '').localeCompare(b.name || ''); break;
        case 'updatedAt':
        default: comparison = new Date(a.updatedAt || 0).getTime() - new Date(b.updatedAt || 0).getTime()
      }
      return sortOrder === 'desc' ? -comparison : comparison
    })

    return projects.sort((a, b) => (b.isPinned ? 1 : 0) - (a.isPinned ? 1 : 0))
  }, [data?.projects, search, languageFilter, statusFilter, sortField, sortOrder])

  // Mutations
  const addSelectedReposMutation = useMutation({
    mutationFn: async ({ repos, type }: { repos: GitHubRepo[], type: ProjectType }) => {
      const results = await Promise.allSettled(
        repos.map(repo =>
          post('/v1/projects', {
            githubRepoUrl: repo.url,
            repoName: repo.name,
            description: repo.description || undefined,
            defaultBranch: selectedBranches[repo.url] || repo.defaultBranch,
            projectType: type,
          })
        )
      )
      const failed = results.filter(r => r.status === 'rejected').length
      if (failed > 0) throw new Error(`${failed} repos failed to add`)
      return results
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['available-repos'] })
      queryClient.invalidateQueries({ queryKey: ['aura'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      setSelectedRepos(new Set())
      setSelectedBranches({})
      setRepoBranches({})
      setRepoSearch('')
      setShowAddModal(false)
      toast({ title: 'Projects added', description: `${selectedRepos.size} project(s) are being analyzed.` })
    },
    onError: (error: Error) => {
      toast({ variant: 'destructive', title: 'Some projects failed', description: error.message })
    },
  })

  const analyzeProjectMutation = useMutation({
    mutationFn: (id: string) => post(`/v1/projects/${id}/analyze`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      toast({ title: 'Analysis started', description: 'Your project is being re-analyzed.' })
    },
  })

  const deleteProjectMutation = useMutation({
    mutationFn: (id: string) => del(`/v1/projects/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] })
      queryClient.invalidateQueries({ queryKey: ['aura'] })
      queryClient.invalidateQueries({ queryKey: ['profile'] })
      queryClient.invalidateQueries({ queryKey: ['available-repos'] })
      toast({ title: 'Project deleted', description: 'The project has been removed.' })
    },
  })

  // Real-time polling
  useEffect(() => {
    const projects = data?.projects || []
    const hasAnalyzing = projects.some(p => {
      const s = p.analysisStatus?.toLowerCase()
      return s === 'analyzing' || s === 'pending' || s === 'processing'
    })

    if (hasAnalyzing) {
      const interval = setInterval(() => {
        refetch()
        queryClient.invalidateQueries({ queryKey: ['aura'] })
      }, 4000)
      return () => clearInterval(interval)
    }
  }, [data?.projects, refetch, queryClient])

  return (
    <div className="space-y-6 pb-12 w-full min-h-screen bg-[#F8F9FA] relative font-['Plus_Jakarta_Sans'] text-slate-800">

      {/* Subtle Blueprint Grid */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none"></div>

      {/* NAYI LINE: pt-6 ko hatakar pt-0 kar diya taaki gap khatam ho jaye */}
      <div className="max-w-[1536px] mx-auto relative z-10 px-4 md:px-6 lg:px-8 pt-0">

        {/* ========================================= */}
        {/* HEADER SECTION                            */}
        {/* ========================================= */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col md:flex-row md:items-center justify-between mb-4 pb-3 border-b border-slate-200 gap-4"
        >
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2 mb-1">
              <FolderGit2 className="h-5 w-5 text-slate-400" /> Project Hub
            </h1>
            <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
              Manage & Verify Repositories
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              onClick={() => refetch()}
              className="bg-white border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-sm transition-all h-8 px-4 text-xs font-bold rounded-md"
            >
              <RefreshCw className="h-3 w-3 mr-2" /> Refresh
            </Button>
            <Button
              onClick={() => setShowAddModal(true)}
              className="bg-[#1A1A1A] text-white hover:bg-black shadow-md transition-all h-8 px-5 text-xs font-bold gap-1.5 rounded-md"
            >
              <Plus className="h-3 w-3" /> Import Project
            </Button>
          </div>
        </motion.div>

        {/* ========================================= */}
        {/* DARK STRIP STATS                          */}
        {/* ========================================= */}
        {isLoading ? (
          <StatsSkeleton />
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0A0A0A] border border-slate-800 rounded-lg shadow-lg flex flex-col lg:flex-row divide-y lg:divide-y-0 lg:divide-x divide-slate-800 mb-6 overflow-hidden"
          >
            <div className="flex-1 p-5 relative group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all pointer-events-none" />
              <div className="flex items-center gap-2 text-blue-400 mb-2">
                <FolderGit2 className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Repositories</span>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-black text-white leading-none tracking-tight">{stats.total}</div>
                <div className="text-[9px] font-bold text-slate-500 uppercase">Tracked</div>
              </div>
            </div>

            <div className="flex-1 p-5 relative group">
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#ADFF2F]/5 rounded-full blur-2xl group-hover:bg-[#ADFF2F]/10 transition-all pointer-events-none" />
              <div className="flex items-center gap-2 text-[#ADFF2F] mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Analysis Status</span>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-black text-white leading-none tracking-tight">{stats.analyzed}</div>
                <div className="text-[9px] font-bold text-slate-500 uppercase">Verified</div>
              </div>
              {stats.total > 0 && (
                <div className="w-full bg-slate-800 h-1 rounded-sm mt-3 overflow-hidden">
                  <div className="bg-[#ADFF2F] h-full rounded-sm shadow-[0_0_8px_rgba(173,255,47,0.5)]" style={{ width: `${(stats.analyzed / stats.total) * 100}%` }}></div>
                </div>
              )}
            </div>

            <div className="flex-1 p-5">
              <div className="flex items-center gap-2 text-amber-400 mb-2">
                <Star className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Total Stars</span>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-black text-white leading-none tracking-tight">{formatNumber(stats.totalStars)}</div>
                <div className="text-[9px] font-bold text-slate-500 uppercase">Across all repos</div>
              </div>
            </div>

            <div className="flex-1 p-5">
              <div className="flex items-center gap-2 text-purple-400 mb-2">
                <Zap className="w-4 h-4" />
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-300">Aura Yield</span>
              </div>
              <div className="flex items-baseline gap-2">
                <div className="text-3xl font-black text-white leading-none tracking-tight">+{formatNumber(stats.totalAura)}</div>
                <div className="text-[9px] font-bold text-slate-500 uppercase">Points Gained</div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ========================================= */}
        {/* FILTERS & SEARCH (High Contrast Bar)      */}
        {/* ========================================= */}
        <div className="flex flex-col md:flex-row gap-3 items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm mb-6">
          <div className="relative flex-1 w-full md:w-auto">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 h-4 w-4" />
            <Input
              placeholder="Filter by name, language..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 rounded-md border-slate-200 bg-slate-50 focus:bg-white focus:ring-1 focus:ring-slate-300 text-sm font-medium"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto scrollbar-none pb-1 md:pb-0">
            {/* Language */}
            <Select value={languageFilter} onValueChange={setLanguageFilter}>
              <SelectTrigger className="w-[130px] h-9 rounded-md bg-white border-slate-200 font-bold text-[11px] text-slate-600 uppercase tracking-wide">
                <Code2 className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                <SelectValue placeholder="Lang" />
              </SelectTrigger>
              <SelectContent className="rounded-md">
                <SelectItem value="all" className="text-xs font-bold">All Languages</SelectItem>
                {stats.languages.map(lang => (
                  <SelectItem key={lang} value={lang} className="text-xs font-bold">{lang}</SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Status */}
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px] h-9 rounded-md bg-white border-slate-200 font-bold text-[11px] text-slate-600 uppercase tracking-wide">
                <Activity className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-md">
                <SelectItem value="all" className="text-xs font-bold">All Status</SelectItem>
                <SelectItem value="completed" className="text-xs font-bold">Verified</SelectItem>
                <SelectItem value="analyzing" className="text-xs font-bold">Analyzing</SelectItem>
                <SelectItem value="failed" className="text-xs font-bold">Failed</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortField} onValueChange={(val) => setSortField(val as SortField)}>
              <SelectTrigger className="w-[130px] h-9 rounded-md bg-white border-slate-200 font-bold text-[11px] text-slate-600 uppercase tracking-wide">
                <SortAsc className="w-3.5 h-3.5 mr-1.5 text-slate-400" />
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent className="rounded-md">
                <SelectItem value="updatedAt" className="text-xs font-bold">Updated</SelectItem>
                <SelectItem value="stars" className="text-xs font-bold">Stars</SelectItem>
                <SelectItem value="auraContribution" className="text-xs font-bold">Aura Score</SelectItem>
              </SelectContent>
            </Select>

            {/* View Toggles */}
            <div className="flex bg-slate-50 rounded-md border border-slate-200 p-0.5 ml-1">
              <Button
                variant="ghost"
                size="icon"
                className={cn("rounded-sm h-7 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-200", viewMode === 'grid' && "bg-white text-slate-900 shadow-sm border border-slate-200/50")}
                onClick={() => setViewMode('grid')}
              >
                <LayoutGrid className="h-3.5 w-3.5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className={cn("rounded-sm h-7 w-8 text-slate-400 hover:text-slate-900 hover:bg-slate-200", viewMode === 'list' && "bg-white text-slate-900 shadow-sm border border-slate-200/50")}
                onClick={() => setViewMode('list')}
              >
                <List className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* PROJECTS GRID (Sharpened Cards)           */}
        {/* ========================================= */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map(i => <ProjectCardSkeleton key={i} />)}
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-lg border border-dashed border-slate-300 shadow-sm group">
            <div className="w-12 h-12 bg-slate-50 border border-slate-100 rounded-md flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform">
              <FolderGit2 className="h-5 w-5 text-slate-400 group-hover:text-slate-900 transition-colors" />
            </div>
            <h3 className="text-sm font-extrabold text-slate-900">No Projects Tracked</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {search || languageFilter !== 'all' ? 'Adjust your filters to find what you are looking for.' : 'Import your repositories to start earning Aura points.'}
            </p>
            {!search && languageFilter === 'all' && (
              <Button onClick={() => setShowAddModal(true)} className="mt-5 rounded-md bg-slate-900 hover:bg-slate-800 text-xs font-bold gap-2 px-5 h-8">
                <Plus className="h-3.5 w-3.5" /> Import Repository
              </Button>
            )}
          </div>
        ) : (
          <motion.div
            className={cn(
              "grid gap-5",
              viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            {filteredProjects.map((project) => (
              <motion.div key={project.id} variants={itemVariants}>
                <Link href={`/projects/${project.id}`}>
                  <div className="group h-full bg-white rounded-lg p-5 shadow-sm border border-slate-200 hover:border-slate-300 hover:shadow-md transition-all duration-300 relative flex flex-col">

                    {/* Header & Score */}
                    <div className="flex justify-between items-start mb-4 pb-3 border-b border-slate-100">
                      <div className="flex items-start gap-3">
                        {/* Sharp Score Visual */}
                        <div className="shrink-0 bg-slate-50 border border-slate-100 p-1.5 rounded-md shadow-sm">
                          <CircularProgress value={project.auraContribution || project.score || 0} size={36} strokeWidth={3.5} />
                        </div>
                        <div className="pt-0.5">
                          <h3 className="text-sm font-extrabold text-slate-900 leading-tight line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors" title={project.repoName}>
                            {project.repoName}
                          </h3>
                          <div className="flex items-center gap-1.5">
                            <span className="bg-slate-100 border border-slate-200 text-slate-700 text-[9px] font-extrabold px-1.5 py-0.5 rounded-sm uppercase tracking-wider">
                              {project.language || 'Code'}
                            </span>
                            {project.analysisStatus === 'completed' && (
                              <span className="text-[#65A30D] text-[9px] font-extrabold uppercase tracking-widest flex items-center gap-0.5">
                                <CheckCircle2 className="w-3 h-3" /> Verified
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Menu */}
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild onClick={(e) => e.preventDefault()}>
                          <Button variant="ghost" size="icon" className="h-6 w-6 text-slate-400 hover:text-slate-900 hover:bg-slate-100 rounded-sm -mr-1">
                            <MoreVertical className="h-3.5 w-3.5" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="rounded-md border-slate-200 shadow-lg min-w-[140px]">
                          <DropdownMenuItem onClick={() => analyzeProjectMutation.mutate(project.id)} className="text-xs font-bold text-slate-700 focus:bg-slate-50">
                            <RefreshCw className="mr-2 h-3.5 w-3.5" /> Re-analyze
                          </DropdownMenuItem>
                          <DropdownMenuItem className="text-xs font-bold text-red-600 focus:bg-red-50 focus:text-red-700" onClick={() => deleteProjectMutation.mutate(project.id)}>
                            <Trash2 className="mr-2 h-3.5 w-3.5" /> Remove
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>

                    {/* Description */}
                    <p className="text-slate-500 text-xs font-medium line-clamp-2 leading-relaxed mb-5 min-h-[32px]">
                      {project.description || 'No description provided. Add one in GitHub to improve verification context.'}
                    </p>

                    {/* Footer Stats */}
                    <div className="mt-auto flex items-center justify-between pt-3 border-t border-slate-100">
                      <div className="flex items-center gap-3 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                        <div className="flex items-center gap-1 hover:text-slate-800 transition-colors">
                          <Star className="h-3 w-3 text-slate-400" />
                          <span>{formatNumber(project.stars)}</span>
                        </div>
                        <div className="flex items-center gap-1 hover:text-slate-800 transition-colors">
                          <GitFork className="h-3 w-3 text-slate-400" />
                          <span>{project.forks || 0}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-1 text-[#65A30D] font-extrabold text-[11px] bg-[#84CC16]/10 px-1.5 py-0.5 rounded-sm border border-[#84CC16]/20">
                          <Zap className="h-3 w-3" />
                          +{project.auraContribution || 0} Aura
                        </div>
                      </div>
                    </div>

                    {/* Hover Accent Line */}
                    <div className="absolute inset-x-0 bottom-0 h-[2px] bg-slate-900 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left rounded-b-lg" />
                  </div>
                </Link>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>

      {/* ============================================
        ADD PROJECT MODAL (Command Menu Style)
        ============================================
      */}
      <AnimatePresence>
        {showAddModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-start justify-center bg-slate-900/40 backdrop-blur-sm pt-[10vh]"
            onClick={() => setShowAddModal(false)}
          >
            <motion.div
              initial={{ scale: 0.98, opacity: 0, y: -10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.98, opacity: 0, y: -10 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-xl shadow-2xl border border-slate-200 w-full max-w-2xl mx-4 max-h-[80vh] flex flex-col overflow-hidden"
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="h-4 w-4 text-slate-500" />
                  <h2 className="text-sm font-extrabold text-slate-900 uppercase tracking-widest">Import Repository</h2>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowAddModal(false)}
                  className="h-6 w-6 rounded-md hover:bg-slate-200 text-slate-500"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Project Role Tabs */}
              <div className="px-6 pt-5 pb-2">
                <label className="text-[10px] font-extrabold uppercase tracking-widest text-slate-400 mb-2 block">Project Architecture</label>
                <div className="flex gap-2 overflow-x-auto scrollbar-none">
                  {[
                    { id: 'fullstack', label: 'Fullstack', icon: Layers },
                    { id: 'backend', label: 'Backend', icon: Server },
                    { id: 'frontend', label: 'Frontend', icon: MonitorSmartphone },
                    { id: 'ml', label: 'AI/ML', icon: BrainCircuit }
                  ].map((type) => (
                    <button
                      key={type.id}
                      onClick={() => setProjectType(type.id as ProjectType)}
                      className={cn(
                        "px-3 py-1.5 rounded-md text-[11px] font-extrabold border flex items-center gap-1.5 transition-all shrink-0",
                        projectType === type.id
                          ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                          : "bg-white text-slate-600 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                      )}
                    >
                      <type.icon className="w-3 h-3" /> {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Bar */}
              <div className="px-6 py-3 border-b border-slate-100">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    placeholder="Search GitHub repositories..."
                    value={repoSearch}
                    onChange={(e) => setRepoSearch(e.target.value)}
                    className="pl-9 h-10 rounded-md border-slate-200 bg-white shadow-sm text-sm font-medium focus:ring-slate-300 focus:border-slate-300"
                    autoFocus
                  />
                </div>
              </div>

              {/* Repo List */}
              <div className="flex-1 overflow-y-auto min-h-[300px] p-2 bg-slate-50/50 scrollbar-thin">
                {isLoadingRepos ? (
                  <div className="h-full flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                  </div>
                ) : filteredRepos.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-slate-400">
                    <Code2 className="h-8 w-8 mb-2 opacity-50" />
                    <p className="text-xs font-bold">No repositories found</p>
                  </div>
                ) : (filteredRepos.map(repo => (
                  <div
                    key={repo.id}
                    className={cn(
                      "mx-4 my-1 rounded-md border transition-all",
                      selectedRepos.has(repo.url) ? "bg-blue-50 border-blue-200 shadow-sm" : "bg-white border-transparent hover:border-slate-200 hover:shadow-sm",
                      repo.isAdded && "opacity-50 cursor-not-allowed bg-slate-50 border-transparent"
                    )}
                  >
                    <div
                      onClick={() => {
                        if (repo.isAdded) return;
                        const newSelected = new Set(selectedRepos)
                        if (newSelected.has(repo.url)) {
                          newSelected.delete(repo.url)
                        } else {
                          newSelected.add(repo.url)
                          fetchBranches(repo.url, repo.defaultBranch)
                        }
                        setSelectedRepos(newSelected)
                      }}
                      className="p-3 flex items-center justify-between cursor-pointer"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn(
                          "w-4 h-4 rounded-sm border flex items-center justify-center shrink-0 transition-colors",
                          selectedRepos.has(repo.url) ? "bg-blue-500 border-blue-500" : "border-slate-300 bg-white"
                        )}>
                          {selectedRepos.has(repo.url) && <Check className="w-3 h-3 text-white" />}
                        </div>
                        <div className="min-w-0">
                          <h4 className="font-extrabold text-sm text-slate-900 truncate">{repo.name}</h4>
                          <p className="text-[10px] text-slate-500 truncate mt-0.5">{repo.description || 'No description available'}</p>
                        </div>
                      </div>
                      {repo.language && (
                        <span className="px-2 py-0.5 bg-slate-100 border border-slate-200 rounded-sm text-[9px] font-extrabold text-slate-600 shrink-0 uppercase tracking-wider ml-3">
                          {repo.language}
                        </span>
                      )}
                    </div>
                    {/* Branch selector - shown when repo is selected */}
                    {selectedRepos.has(repo.url) && (
                      <div className="px-3 pb-3 pt-0 ml-10" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-2">
                          <GitBranch className="w-3 h-3 text-slate-400 shrink-0" />
                          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">Branch:</span>
                          {loadingBranches.has(repo.url) ? (
                            <div className="flex items-center gap-1.5">
                              <Loader2 className="w-3 h-3 animate-spin text-slate-400" />
                              <span className="text-[10px] text-slate-400">Loading...</span>
                            </div>
                          ) : (
                            <div className="relative">
                              <select
                                value={selectedBranches[repo.url] || repo.defaultBranch}
                                onChange={(e) => setSelectedBranches(prev => ({ ...prev, [repo.url]: e.target.value }))}
                                className="appearance-none bg-white border border-slate-200 rounded-md px-2.5 py-1 pr-7 text-[11px] font-bold text-slate-700 cursor-pointer hover:border-slate-300 focus:outline-none focus:ring-1 focus:ring-blue-300 focus:border-blue-300 transition-colors"
                              >
                                {(repoBranches[repo.url] || [{ name: repo.defaultBranch, isDefault: true }]).map(branch => (
                                  <option key={branch.name} value={branch.name}>
                                    {branch.name}{branch.isDefault ? ' (default)' : ''}
                                  </option>
                                ))}
                              </select>
                              <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )))}
              </div>

              {/* Footer */}
              <div className="p-4 border-t border-slate-200 bg-white flex items-center justify-between">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                  {selectedRepos.size} Selected
                </span>
                <Button
                  size="sm"
                  disabled={selectedRepos.size === 0}
                  onClick={() => addSelectedReposMutation.mutate({ repos: filteredRepos.filter(r => selectedRepos.has(r.url)), type: projectType })}
                  className="rounded-md bg-slate-900 hover:bg-slate-800 text-white font-extrabold px-6 shadow-sm"
                >
                  Import Projects
                </Button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}