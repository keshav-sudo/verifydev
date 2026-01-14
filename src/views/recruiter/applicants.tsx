"use client"

/**
 * Applicants Management Page for Recruiters
 */

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
import { AuraScore } from '@/components/aura-score'
import { MatchScore } from '@/components/match-score'
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
  Github,
  MapPin,
  Star,
  ChevronDown,
  Mail,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface Applicant {
  id: string
  userId: string
  jobId: string
  status: 'PENDING' | 'REVIEWING' | 'SHORTLISTED' | 'INTERVIEW' | 'OFFER' | 'REJECTED' | 'WITHDRAWN'
  appliedAt: string
  note?: string
  recruiterNotes?: string
  // API returns flat candidate data - we'll transform it
  candidateName?: string
  candidateEmail?: string
  candidatePhone?: string
  candidateAura?: number
  candidateCores?: number
  candidateSkills?: string[]
  // Transformed user object for UI
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

const STATUS_CONFIG = {
  PENDING: { label: 'Pending', color: 'bg-gray-500', icon: Clock },
  REVIEWING: { label: 'Reviewing', color: 'bg-blue-500', icon: FileText },
  SHORTLISTED: { label: 'Shortlisted', color: 'bg-purple-500', icon: Star },
  INTERVIEW: { label: 'Interview', color: 'bg-yellow-500', icon: Calendar },
  OFFER: { label: 'Offer', color: 'bg-green-500', icon: CheckCircle2 },
  REJECTED: { label: 'Rejected', color: 'bg-red-500', icon: XCircle },
  WITHDRAWN: { label: 'Withdrawn', color: 'bg-gray-400', icon: XCircle },
}

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
      // Use /v1/recruiter (singular) -> goes to job-service
      const res = await get<{ applications: any[] }>(`/v1/recruiter/jobs/${jobId}/applicants`)
      
      // Transform flat API response to expected UI format
      return res.applications.map((app: any) => ({
        ...app,
        // Create nested user object from flat candidate fields
        user: {
          id: app.userId,
          name: app.candidateName || 'Unknown',
          email: app.candidateEmail || '',
          avatarUrl: undefined, // API doesn't return this
          location: undefined,
          title: undefined,
          githubUsername: undefined,
        },
        // Map aura data
        aura: app.candidateAura ? {
          overallScore: app.candidateAura,
          level: app.candidateCores || 1,
          isVerified: false,
        } : undefined,
        // Map skills for matching
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

  const filteredApplicants = activeTab === 'all'
    ? applicants
    : applicants.filter(a => a.status === activeTab.toUpperCase())

  const counts = {
    all: applicants.length,
    pending: applicants.filter(a => a.status === 'PENDING').length,
    shortlisted: applicants.filter(a => a.status === 'SHORTLISTED').length,
    interview: applicants.filter(a => a.status === 'INTERVIEW').length,
    rejected: applicants.filter(a => a.status === 'REJECTED').length,
  }

  const isLoading = jobLoading || applicantsLoading

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/recruiter/jobs"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to jobs
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">{job?.title}</h1>
            <p className="text-muted-foreground">
              {counts.all} applicant{counts.all !== 1 ? 's' : ''} • {job?.location}
            </p>
          </div>
          <Badge variant="secondary" className="text-lg px-4 py-2">
            {counts.all} Total
          </Badge>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList>
          <TabsTrigger value="all">All ({counts.all})</TabsTrigger>
          <TabsTrigger value="pending">Pending ({counts.pending})</TabsTrigger>
          <TabsTrigger value="shortlisted">Shortlisted ({counts.shortlisted})</TabsTrigger>
          <TabsTrigger value="interview">Interview ({counts.interview})</TabsTrigger>
          <TabsTrigger value="rejected">Rejected ({counts.rejected})</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <AnimatePresence mode="popLayout">
            {filteredApplicants.length === 0 ? (
              <Card className="border border-border/50">
                <CardContent className="flex flex-col items-center justify-center py-16">
                  <User className="w-12 h-12 text-muted-foreground/50 mb-4" />
                  <p className="text-muted-foreground">No applicants in this category</p>
                </CardContent>
              </Card>
            ) : (
              filteredApplicants.map((applicant, index) => (
                <ApplicantCard
                  key={applicant.id}
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
              ))
            )}
          </AnimatePresence>
        </TabsContent>
      </Tabs>

      {/* Note Dialog */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Internal Notes</DialogTitle>
            <DialogDescription>
              Add private notes about {selectedApplicant?.user?.name || 'Applicant'}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Add your notes here..."
            value={noteText}
            onChange={(e) => setNoteText(e.target.value)}
            className="min-h-32"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
              Cancel
            </Button>
            <Button
              onClick={() => selectedApplicant && addNoteMutation.mutate({
                applicationId: selectedApplicant.id,
                note: noteText,
              })}
              disabled={addNoteMutation.isPending}
            >
              {addNoteMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              Save Note
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Send Message Dialog */}
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
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ delay: index * 0.05 }}
    >
      <Card className="border border-border/50 hover:shadow-lg transition-all duration-300">
        <CardContent className="p-4 md:p-6">
          <div className="flex flex-col md:flex-row gap-6">
            {/* Avatar & Header Section - Stacked on Mobile */}
            <div className="flex items-start md:w-auto gap-4">
               {/* Avatar */}
               <Avatar className="w-16 h-16 md:w-20 md:h-20 border-2 border-border shadow-sm">
                <AvatarImage src={applicant.user?.avatarUrl} className="object-cover" />
                <AvatarFallback className="text-xl md:text-2xl font-bold bg-gradient-to-br from-primary/10 to-primary/5 text-primary">
                  {(applicant.user?.name || applicant.candidateName || 'U').substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              
               {/* Mobile-only Title Section (hidden on desktop to avoid dup) */}
               <div className="md:hidden flex-1">
                  <div className="flex justify-between items-start">
                     <div>
                        <Link
                          href={`/recruiter/candidates/${applicant.userId}`}
                          className="text-lg font-bold hover:text-primary transition-colors block"
                        >
                          {applicant.user?.name || applicant.candidateName || 'Unknown'}
                        </Link>
                        <p className="text-sm text-muted-foreground">{applicant.user?.title || 'Developer'}</p>
                     </div>
                     <Badge className={cn('gap-1 ml-2 whitespace-nowrap', status.color)}>
                        <StatusIcon className="w-3 h-3" />
                        {status.label}
                     </Badge>
                  </div>
               </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
               {/* Desktop Header */}
               <div className="hidden md:flex items-start justify-between mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/recruiter/candidates/${applicant.userId}`}
                      className="text-xl font-bold hover:text-primary transition-colors"
                    >
                      {applicant.user?.name || applicant.candidateName || 'Unknown'}
                    </Link>
                    {/* Simplified verification check if available */}
                    {(applicant as any).isVerified && <VerifiedBadge size="sm" />}
                  </div>
                  <p className="text-muted-foreground">{applicant.user?.title}</p>
                </div>

                <Badge className={cn('gap-1', status.color)}>
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </Badge>
              </div>

              {/* Meta Info Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 gap-x-6 text-sm text-muted-foreground mb-4">
                {applicant.user?.location && (
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground/70" />
                    {applicant.user?.location}
                  </span>
                )}
                <span className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-muted-foreground/70" />
                  Applied {format(new Date(applicant.appliedAt), 'MMM d, yyyy')}
                </span>
                
                <span className="flex items-center gap-2">
                    <Mail className="w-4 h-4 text-muted-foreground/70" />
                    <span className="truncate max-w-[150px] sm:max-w-[200px]">
                        {applicant.user?.email || applicant.candidateEmail}
                    </span>
                </span>
              </div>

              {/* Scores & Skills */}
               <div className="flex flex-wrap items-center gap-4 mb-4 p-3 bg-muted/30 rounded-lg border border-border/50">
                {applicant.aura && (
                   <div className="flex items-center gap-2">
                     <span className="text-xs font-medium uppercase text-muted-foreground">Aura</span>
                     <span className="font-bold text-foreground">{applicant.aura.overallScore}</span>
                   </div>
                )}
                <div className="h-4 w-px bg-border mx-2 hidden sm:block" />
                {applicant.matchScore !== undefined && (
                   <div className="flex items-center gap-2">
                     <span className="text-xs font-medium uppercase text-muted-foreground">Match</span>
                     <span className={`font-bold ${applicant.matchScore > 80 ? 'text-green-500' : applicant.matchScore > 50 ? 'text-yellow-500' : 'text-muted-foreground'}`}>
                        {applicant.matchScore}%
                     </span>
                   </div>
                )}
              </div>

              {/* Matched Skills Chips */}
              {applicant.matchedSkills && applicant.matchedSkills.length > 0 && (
                <div className="mb-4">
                   <div className="flex flex-wrap gap-2">
                    {applicant.matchedSkills.slice(0, 5).map(skill => (
                      <Badge key={skill} variant="secondary" className="bg-green-500/10 text-green-600 dark:text-green-400 border-green-200 dark:border-green-900">
                        {skill}
                      </Badge>
                    ))}
                    {applicant.matchedSkills.length > 5 && (
                         <span className="text-xs text-muted-foreground self-center">+{applicant.matchedSkills.length - 5} more</span>
                    )}
                   </div>
                </div>
              )}

              {/* Recruiter Notes */}
              {applicant.recruiterNotes && (
                <div className="mt-3 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                  <p className="text-sm text-yellow-600 dark:text-yellow-400 flex gap-2">
                    <FileText className="w-4 h-4 mt-0.5 flex-shrink-0" />
                    <span className="italic">{applicant.recruiterNotes}</span>
                  </p>
                </div>
              )}
            </div>
           </div>
           
            {/* Footer Actions - Responsive */}
            <div className="mt-6 pt-4 border-t border-border/50 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
               <div className="flex gap-2 w-full sm:w-auto">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={onMessage}
                    className="flex-1 sm:flex-none gap-2"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Message
                  </Button>
                  <Button 
                    variant="default" 
                    size="sm"
                    asChild
                    className="flex-1 sm:flex-none gap-2"
                  >
                    <Link href={`/recruiter/candidates/${applicant.userId}`}>
                        View Profile <ExternalLink className="w-3 h-3 opacity-70" />
                    </Link>
                  </Button>
               </div>

               <div className="flex items-center gap-2 justify-end">
                   <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        Update Status
                        <ChevronDown className="w-4 h-4 ml-2" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem onClick={() => onStatusChange('REVIEWING')}>
                        <FileText className="w-4 h-4 mr-2" /> Reviewing
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onStatusChange('SHORTLISTED')}>
                        <Star className="w-4 h-4 mr-2" /> Shortlist
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onStatusChange('INTERVIEW')}>
                        <Calendar className="w-4 h-4 mr-2" /> Interview
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => onStatusChange('OFFER')}>
                        <CheckCircle2 className="w-4 h-4 mr-2" /> Extended Offer
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => onStatusChange('REJECTED')} className="text-red-500 focus:text-red-500">
                        <XCircle className="w-4 h-4 mr-2" /> Reject
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                  
                  <Button variant="ghost" size="icon" onClick={onAddNote} title="Add Internal Note">
                    <FileText className="w-4 h-4" />
                  </Button>
               </div>
            </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}
