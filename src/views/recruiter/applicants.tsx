"use client"

/**
 * Applicants Management Page for Recruiters
 */

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu'
import { toast } from '@/hooks/use-toast'
import { get, put } from '@/api/client'
import { VerifiedBadge } from '@/components/verified-badge'
import { SendMessageDialog } from '@/components/messaging/send-message-dialog'
import {
  ArrowLeft,
  User,
  Calendar,
  CheckCircle2,
  XCircle,
  Clock,
  MessageSquare,
  FileText,
  ExternalLink,
  Loader2,
  MapPin,
  Star,
  ChevronDown,
  Mail,
  Zap,
  Target,
  Users,
  ListFilter,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

interface Applicant {
  id: string
  userId: string
  jobId: string
  status: 'PENDING' | 'REVIEWING' | 'SHORTLISTED' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'WITHDRAWN'
  appliedAt: string
  note?: string
  recruiterNotes?: string
  candidateName?: string
  candidateEmail?: string
  candidatePhone?: string
  candidateAura?: number
  candidateCores?: number
  candidateSkills?: string[]
  user?: {
    id: string
    name: string
    email: string
    avatarUrl?: string
    location?: string
    title?: string
    githubUsername?: string
  }
  aura?: {
    overallScore: number
    level: string
    isVerified: boolean
  }
  matchScore?: number
  matchedSkills?: string[]
  missingSkills?: string[]
}

interface Job {
  id: string
  title: string
  company: string
  location: string
  requiredSkills: string[]
  preferredSkills: string[]
}

/* ------------------------------------------------------------------ */
/*  Status Config                                                      */
/* ------------------------------------------------------------------ */

const STATUS_CONFIG = {
  PENDING: {
    label: 'Pending',
    icon: Clock,
    bg: 'bg-slate-50',
    text: 'text-slate-600',
    border: 'border-slate-200',
  },
  REVIEWING: {
    label: 'Reviewing',
    icon: FileText,
    bg: 'bg-blue-50',
    text: 'text-blue-700',
    border: 'border-blue-200',
  },
  SHORTLISTED: {
    label: 'Shortlisted',
    icon: Star,
    bg: 'bg-violet-50',
    text: 'text-violet-700',
    border: 'border-violet-200',
  },
  INTERVIEW: {
    label: 'Interview',
    icon: Calendar,
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  OFFER: {
    label: 'Offer',
    icon: CheckCircle2,
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
  REJECTED: {
    label: 'Rejected',
    icon: XCircle,
    bg: 'bg-red-50',
    text: 'text-red-700',
    border: 'border-red-200',
  },
  WITHDRAWN: {
    label: 'Withdrawn',
    icon: XCircle,
    bg: 'bg-slate-50',
    text: 'text-slate-500',
    border: 'border-slate-200',
  },
}

/* ------------------------------------------------------------------ */
/*  Tabs                                                               */
/* ------------------------------------------------------------------ */

const TABS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'shortlisted', label: 'Shortlisted' },
  { key: 'interview', label: 'Interview' },
  { key: 'rejected', label: 'Rejected' },
] as const

/* ================================================================== */
/*  Main Page                                                          */
/* ================================================================== */

export default function ApplicantsPage() {
  const { jobId } = useParams<{ jobId: string }>()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState('all')
  const [selectedApplicant, setSelectedApplicant] = useState<Applicant | null>(null)

  // Messaging & Notes state
  const [isMessageDialogOpen, setIsMessageDialogOpen] = useState(false)
  const [messageApplicant, setMessageApplicant] = useState<Applicant | null>(null)

  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false)
  const [noteText, setNoteText] = useState('')

  // Fetch job details
  const { data: job, isLoading: jobLoading } = useQuery({
    queryKey: ['job', jobId],
    queryFn: async () => {
      const res = await get<{ job: Job }>(`/v1/jobs/${jobId}`)
      return res.job
    },
    enabled: !!jobId,
  })

  // Fetch applicants
  const { data: applicants = [], isLoading: applicantsLoading } = useQuery({
    queryKey: ['applicants', jobId],
    queryFn: async () => {
      const res = await get<{ applications: any[] }>(`/v1/recruiter/jobs/${jobId}/applicants`)

      return res.applications.map((app: any) => ({
        ...app,
        user: {
          id: app.userId,
          name: app.candidateName || 'Unknown',
          email: app.candidateEmail || '',
          avatarUrl: undefined,
          location: undefined,
          title: undefined,
          githubUsername: undefined,
        },
        aura: app.candidateAura
          ? {
              overallScore: app.candidateAura,
              level: app.candidateCores || 1,
              isVerified: false,
            }
          : undefined,
        matchedSkills: app.candidateSkills || [],
      })) as Applicant[]
    },
    enabled: !!jobId,
  })

  // Update application status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ applicationId, status }: { applicationId: string; status: string }) => {
      return put(`/v1/recruiters/applications/${applicationId}/status`, { status })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicants', jobId] })
      toast({ title: 'Status updated successfully' })
    },
    onError: () => {
      toast({ title: 'Failed to update status', variant: 'destructive' })
    },
  })

  // Add recruiter note
  const addNoteMutation = useMutation({
    mutationFn: async ({ applicationId, note }: { applicationId: string; note: string }) => {
      return put(`/v1/recruiters/applications/${applicationId}/note`, { note })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['applicants', jobId] })
      setIsNoteDialogOpen(false)
      setNoteText('')
      toast({ title: 'Note added successfully' })
    },
  })

  const filteredApplicants =
    activeTab === 'all'
      ? applicants
      : applicants.filter((a) => a.status === activeTab.toUpperCase())

  const counts = {
    all: applicants.length,
    pending: applicants.filter((a) => a.status === 'PENDING').length,
    shortlisted: applicants.filter((a) => a.status === 'SHORTLISTED').length,
    interview: applicants.filter((a) => a.status === 'INTERVIEW').length,
    rejected: applicants.filter((a) => a.status === 'REJECTED').length,
  }

  const isLoading = jobLoading || applicantsLoading

  /* -- Loading -- */
  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-[#F0F2F5] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 animate-spin text-[#ADFF2F]" />
          <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
            Loading applicants
          </span>
        </div>
      </div>
    )
  }

  /* -- Render -- */
  return (
    <div className="w-full min-h-screen bg-[#F0F2F5] p-4 md:p-6 lg:p-8 font-sans text-slate-800">
      <div className="max-w-[1536px] mx-auto space-y-6">
        {/* --- Dark Hero Header --- */}
        <div className="bg-[#0A0A0A] rounded-2xl border border-slate-800 p-6 md:p-8">
          <Link
            href="/recruiter/jobs"
            className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to jobs
          </Link>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
                {job?.title}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                {job?.location && (
                  <span className="flex items-center gap-1.5 text-xs text-slate-400">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.location}
                  </span>
                )}
                <span className="text-xs text-slate-600">&bull;</span>
                <span className="text-xs text-slate-400">
                  {job?.company}
                </span>
              </div>
            </div>

            {/* Stat pills */}
            <div className="flex items-center gap-3">
              {[
                { label: 'Total', value: counts.all, icon: Users },
                { label: 'Shortlisted', value: counts.shortlisted, icon: Star },
                { label: 'Interview', value: counts.interview, icon: Calendar },
              ].map((s) => (
                <div
                  key={s.label}
                  className="flex items-center gap-2.5 bg-slate-900/60 border border-slate-800 rounded-lg px-3.5 py-2"
                >
                  <div className="p-1.5 bg-[#ADFF2F]/10 rounded-md border border-[#ADFF2F]/20">
                    <s.icon className="w-3.5 h-3.5 text-[#ADFF2F]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest leading-none">
                      {s.label}
                    </p>
                    <p className="text-lg font-black text-white tracking-tight leading-tight mt-0.5">
                      {s.value}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* --- Tab Bar --- */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-2 py-1.5 flex items-center gap-1 overflow-x-auto">
          {TABS.map((tab) => {
            const count = counts[tab.key as keyof typeof counts]
            const isActive = activeTab === tab.key
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={cn(
                  'px-3.5 py-1.5 rounded-md text-[10px] font-extrabold uppercase tracking-widest transition-all whitespace-nowrap',
                  isActive
                    ? 'bg-slate-900 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-50'
                )}
              >
                {tab.label}
                <span
                  className={cn(
                    'ml-1.5 tabular-nums',
                    isActive ? 'text-slate-400' : 'text-slate-400'
                  )}
                >
                  {count}
                </span>
              </button>
            )
          })}
        </div>

        {/* --- Applicant List --- */}
        <div className="space-y-3">
          <AnimatePresence mode="popLayout">
            {filteredApplicants.length === 0 ? (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col items-center justify-center py-20">
                <div className="p-3 bg-slate-100 rounded-xl mb-4">
                  <User className="w-8 h-8 text-slate-400" />
                </div>
                <p className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">
                  No applicants
                </p>
                <p className="text-xs text-slate-400 mt-1">
                  No applicants found in this category
                </p>
              </div>
            ) : (
              filteredApplicants.map((applicant, index) => (
                <motion.div
                  key={applicant.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.15, delay: index * 0.03 }}
                >
                  <ApplicantCard
                    applicant={applicant}
                    job={job!}
                    index={index}
                    onStatusChange={(status) =>
                      updateStatusMutation.mutate({ applicationId: applicant.id, status })
                    }
                    onAddNote={() => {
                      setSelectedApplicant(applicant)
                      setNoteText(applicant.recruiterNotes || '')
                      setIsNoteDialogOpen(true)
                    }}
                    onMessage={() => {
                      setMessageApplicant(applicant)
                      setIsMessageDialogOpen(true)
                    }}
                  />
                </motion.div>
              ))
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* --- Note Dialog --- */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="bg-white border border-slate-200 rounded-xl">
          <DialogHeader>
            <DialogTitle className="text-sm font-black text-slate-900 uppercase tracking-wide">
              Internal Notes
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Add private notes about {selectedApplicant?.user?.name || 'Applicant'}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Add your notes here..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="min-h-32 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20 text-sm"
          />
          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={() => setIsNoteDialogOpen(false)}
              className="border-slate-200 text-xs font-bold"
            >
              Cancel
            </Button>
            <Button
              onClick={() =>
                selectedApplicant &&
                addNoteMutation.mutate({
                  applicationId: selectedApplicant.id,
                  note: noteText,
                })
              }
              disabled={addNoteMutation.isPending}
              className="bg-slate-900 text-white text-xs font-bold hover:bg-slate-800"
            >
              {addNoteMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin mr-1.5" />
              ) : null}
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* --- Send Message Dialog --- */}
      {messageApplicant && (
        <SendMessageDialog
          open={isMessageDialogOpen}
          onOpenChange={setIsMessageDialogOpen}
          candidateId={messageApplicant.userId}
          candidateName={messageApplicant.user?.name || 'Applicant'}
          candidateAvatar={messageApplicant.user?.avatarUrl}
          jobId={jobId}
          jobTitle={job?.title}
        />
      )}
    </div>
  )
}

/* ================================================================== */
/*  Applicant Card                                                     */
/* ================================================================== */

interface ApplicantCardProps {
  applicant: Applicant
  job: Job
  index: number
  onStatusChange: (status: string) => void
  onAddNote: () => void
  onMessage: () => void
}

function ApplicantCard({ applicant, job, index, onStatusChange, onAddNote, onMessage }: ApplicantCardProps) {
  const status = STATUS_CONFIG[applicant.status]
  const StatusIcon = status.icon

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
      <div className="p-4 md:p-5">
        <div className="flex flex-col md:flex-row gap-4">
          {/* -- Avatar -- */}
          <div className="flex items-start gap-3.5 md:w-auto shrink-0">
            <Avatar className="w-12 h-12 md:w-14 md:h-14 border border-slate-200 shadow-sm">
              <AvatarImage src={applicant.user?.avatarUrl} className="object-cover" />
              <AvatarFallback className="text-sm md:text-base font-black bg-slate-100 text-slate-600">
                {(applicant.user?.name || applicant.candidateName || 'U')
                  .substring(0, 2)
                  .toUpperCase()}
              </AvatarFallback>
            </Avatar>

            {/* Mobile-only header */}
            <div className="md:hidden flex-1 min-w-0">
              <div className="flex justify-between items-start gap-2">
                <div className="min-w-0">
                  <Link
                    href={`/recruiter/candidates/${applicant.userId}`}
                    className="text-sm font-black text-slate-900 hover:text-slate-700 transition-colors block truncate"
                  >
                    {applicant.user?.name || applicant.candidateName || 'Unknown'}
                  </Link>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    {applicant.user?.title || 'Developer'}
                  </p>
                </div>
                <span
                  className={cn(
                    'inline-flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-extrabold uppercase tracking-widest border whitespace-nowrap',
                    status.bg,
                    status.text,
                    status.border
                  )}
                >
                  <StatusIcon className="w-2.5 h-2.5" />
                  {status.label}
                </span>
              </div>
            </div>
          </div>

          {/* -- Main Content -- */}
          <div className="flex-1 min-w-0">
            {/* Desktop header */}
            <div className="hidden md:flex items-start justify-between mb-2.5">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <Link
                    href={`/recruiter/candidates/${applicant.userId}`}
                    className="text-base font-black text-slate-900 hover:text-slate-700 transition-colors truncate"
                  >
                    {applicant.user?.name || applicant.candidateName || 'Unknown'}
                  </Link>
                  {(applicant as any).isVerified && <VerifiedBadge size="sm" />}
                </div>
                <p className="text-xs text-slate-500 mt-0.5">{applicant.user?.title || 'Developer'}</p>
              </div>
              <span
                className={cn(
                  'inline-flex items-center gap-1 px-2.5 py-1 rounded text-[9px] font-extrabold uppercase tracking-widest border shrink-0',
                  status.bg,
                  status.text,
                  status.border
                )}
              >
                <StatusIcon className="w-3 h-3" />
                {status.label}
              </span>
            </div>

            {/* Meta row */}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-500 mb-3">
              {applicant.user?.location && (
                <span className="flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-slate-400" />
                  {applicant.user.location}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                Applied {format(new Date(applicant.appliedAt), 'MMM d, yyyy')}
              </span>
              <span className="flex items-center gap-1 truncate max-w-[180px]">
                <Mail className="w-3 h-3 text-slate-400" />
                {applicant.user?.email || applicant.candidateEmail}
              </span>
            </div>

            {/* Scores */}
            <div className="flex flex-wrap items-center gap-2 mb-3">
              {applicant.aura && (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                  <div className="p-1.5 bg-[#A78BFA]/10 rounded-md border border-[#A78BFA]/20">
                    <Zap className="w-3 h-3 text-[#A78BFA]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest leading-none">
                      Aura
                    </p>
                    <p className="text-sm font-black text-slate-900 tracking-tight leading-tight">
                      {applicant.aura.overallScore}
                    </p>
                  </div>
                </div>
              )}
              {applicant.matchScore !== undefined && (
                <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5">
                  <div className="p-1.5 bg-[#ADFF2F]/10 rounded-md border border-[#ADFF2F]/20">
                    <Target className="w-3 h-3 text-[#65A30D]" />
                  </div>
                  <div>
                    <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest leading-none">
                      Match
                    </p>
                    <p
                      className={cn(
                        'text-sm font-black tracking-tight leading-tight',
                        applicant.matchScore > 80
                          ? 'text-[#65A30D]'
                          : applicant.matchScore > 50
                            ? 'text-amber-600'
                            : 'text-slate-500'
                      )}
                    >
                      {applicant.matchScore}%
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Matched Skills */}
            {applicant.matchedSkills && applicant.matchedSkills.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-3">
                {applicant.matchedSkills.slice(0, 5).map((skill) => (
                  <span
                    key={skill}
                    className="inline-block bg-[#ADFF2F]/20 text-[#65A30D] text-[10px] font-bold border border-[#ADFF2F]/30 rounded-[2px] px-2 py-0.5"
                  >
                    {skill}
                  </span>
                ))}
                {applicant.matchedSkills.length > 5 && (
                  <span className="text-[10px] text-slate-400 font-bold self-center">
                    +{applicant.matchedSkills.length - 5} more
                  </span>
                )}
              </div>
            )}

            {/* Recruiter Notes */}
            {applicant.recruiterNotes && (
              <div className="bg-amber-50 border border-amber-100 rounded-lg p-2.5 mt-1">
                <p className="text-[11px] text-amber-700 flex gap-1.5">
                  <FileText className="w-3.5 h-3.5 mt-0.5 flex-shrink-0 text-amber-500" />
                  <span className="italic leading-relaxed">{applicant.recruiterNotes}</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* -- Footer Actions -- */}
        <div className="mt-4 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <div className="flex gap-2 w-full sm:w-auto">
            <button
              onClick={onMessage}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              Message
            </button>
            <Link
              href={`/recruiter/candidates/${applicant.userId}`}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-md bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
            >
              View Profile
              <ExternalLink className="w-3 h-3 opacity-70" />
            </Link>
          </div>

          <div className="flex items-center gap-2 justify-end">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors w-full sm:w-auto justify-center">
                  <ListFilter className="w-3.5 h-3.5" />
                  Update Status
                  <ChevronDown className="w-3.5 h-3.5 ml-0.5 text-slate-400" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48 bg-white border border-slate-200 rounded-lg shadow-lg">
                <DropdownMenuItem onClick={() => onStatusChange('REVIEWING')} className="text-xs font-bold">
                  <FileText className="w-3.5 h-3.5 mr-2 text-blue-500" /> Reviewing
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange('SHORTLISTED')} className="text-xs font-bold">
                  <Star className="w-3.5 h-3.5 mr-2 text-violet-500" /> Shortlist
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange('INTERVIEW')} className="text-xs font-bold">
                  <Calendar className="w-3.5 h-3.5 mr-2 text-amber-500" /> Interview
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => onStatusChange('OFFER')} className="text-xs font-bold">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-2 text-emerald-500" /> Extended Offer
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => onStatusChange('REJECTED')}
                  className="text-xs font-bold text-red-500 focus:text-red-500"
                >
                  <XCircle className="w-3.5 h-3.5 mr-2" /> Reject
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <button
              onClick={onAddNote}
              title="Add Internal Note"
              className="inline-flex items-center justify-center w-8 h-8 rounded-md border border-slate-200 text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-colors"
            >
              <FileText className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
