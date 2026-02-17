"use client"

/**
 * Recruiter Dashboard - Overview & Stats
 * The command center for high-performance recruiting.
 */

import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useRecruiterDashboard } from '@/hooks/use-recruiter'
import { useRecruiterStore } from '@/store/recruiter-store'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { getInitials, formatNumber } from '@/lib/utils'
import {
  Briefcase,
  Users,
  Star,
  Plus,
  ArrowRight,
  TrendingUp,
  MessageSquare,
  Activity,
  Zap,
  LayoutDashboard
} from 'lucide-react'

// --- Animated Stats Card ---

interface StatCardProps {
  label: string
  value: number
  icon: React.ReactNode
  trend?: string
  trendUp?: boolean
  gradient: string
  delay: number
}

function StatCard({ label, value, icon, trend, trendUp, gradient, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
    >
      <Card className="relative overflow-hidden border-border/60 hover:border-primary/20 transition-all group">
         {/* Background Gradient */}
        <div className={`absolute inset-0 bg-gradient-to-br ${gradient} opacity-[0.03] group-hover:opacity-[0.08] transition-opacity`} />
        
        <CardContent className="p-6">
          <div className="flex justify-between items-start mb-4">
            <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient} opacity-90 shadow-md`}>
              <div className="text-white">{icon}</div>
            </div>
            {trend && (
              <Badge variant="outline" className={`bg-background/50 backdrop-blur-sm ${trendUp ? 'text-green-500 border-green-500/20' : 'text-red-500 border-red-500/20'}`}>
                {trend}
              </Badge>
            )}
          </div>
          <div>
            <h3 className="text-3xl font-bold tracking-tight text-foreground">{formatNumber(value)}</h3>
            <p className="text-sm font-medium text-muted-foreground mt-1">{label}</p>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function RecruiterDashboard() {
  const router = useRouter()
  const { recruiter } = useRecruiterStore()
  const { data: dashboardData, isLoading } = useRecruiterDashboard()
  
  // Safe defaults if data is missing or loading
  const stats = dashboardData?.stats || { activeJobs: 0, totalApplications: 0, newCandidates: 0, shortlisted: 0 }
  const recentApps = dashboardData?.recentApplications || []
  const topJobs = dashboardData?.topJobs || []

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 space-y-8">
        <div className="flex justify-between items-center">
             <Skeleton className="h-10 w-64" />
             <Skeleton className="h-10 w-32" />
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
             {[...Array(4)].map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
            <Skeleton className="lg:col-span-2 h-96 rounded-xl" />
            <Skeleton className="h-96 rounded-xl" />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen container mx-auto px-4 py-8 space-y-8">
      
      {/* Header & Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
             Welcome back, <span className="font-medium text-foreground">{recruiter?.name || 'Recruiter'}</span>. Here's what's happening today.
          </p>
        </div>
        
        <div className="flex gap-3">
             <Button onClick={() => router.push('/recruiter/jobs/new')} className="gap-2 bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20">
                 <Plus className="w-4 h-4" /> Post New Job
             </Button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
            label="Active Jobs" 
            value={stats.activeJobs} 
            icon={<Briefcase className="w-5 h-5" />} 
            gradient="from-blue-500 to-cyan-500" 
            delay={0}
        />
        <StatCard 
            label="Total Applications" 
            value={stats.totalApplications} 
            icon={<Users className="w-5 h-5" />}
            trend="+12% this week" // Mock trend for robust UI feel
            trendUp={true}
            gradient="from-violet-500 to-purple-500" 
            delay={0.1}
        />
        <StatCard 
            label="New Candidates" 
            value={stats.newCandidates} 
            icon={<Zap className="w-5 h-5" />}
            gradient="from-amber-500 to-orange-500" 
            delay={0.2}
        />
        <StatCard 
            label="Shortlisted" 
            value={stats.shortlisted} 
            icon={<Star className="w-5 h-5" />}
            gradient="from-emerald-500 to-green-500" 
            delay={0.3}
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
          
          {/* Main Content: Recent Activity / Applications */}
          <div className="lg:col-span-2 space-y-6">
              <Card className="border-border/60 shadow-sm">
                  <CardHeader className="flex flex-row items-center justify-between pb-4">
                      <div>
                          <CardTitle className="text-lg flex items-center gap-2">
                              <Activity className="w-5 h-5 text-primary" /> Recent Applications
                          </CardTitle>
                          <CardDescription>New candidates applying for your roles.</CardDescription>
                      </div>
                      <Button variant="ghost" size="sm" asChild>
                          <Link href="/recruiter/applications" className="gap-1 text-primary">
                              View All <ArrowRight className="w-4 h-4" />
                          </Link>
                      </Button>
                  </CardHeader>
                  <CardContent className="px-0">
                      {recentApps.length > 0 ? (
                          <div className="divide-y divide-border/50">
                              {recentApps.map((app, i) => (
                                  <div key={app.id || i} className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors">
                                      <div className="flex items-center gap-4">
                                          <Avatar className="h-10 w-10 border border-border">
                                              <AvatarImage src={app.candidateAvatar} />
                                              <AvatarFallback className="bg-primary/10 text-primary">{getInitials(app.candidateName)}</AvatarFallback>
                                          </Avatar>
                                          <div>
                                              <p className="font-semibold text-sm">{app.candidateName}</p>
                                              <p className="text-xs text-muted-foreground">Applied for <span className="text-foreground font-medium">{app.jobTitle}</span></p>
                                          </div>
                                      </div>
                                      <div className="flex items-center gap-4">
                                           {app.matchScore && (
                                              <Badge variant={app.matchScore >= 80 ? 'default' : 'secondary'} className="text-xs">
                                                  {app.matchScore}% Match
                                              </Badge>
                                           )}
                                           <div className="text-right text-xs text-muted-foreground">
                                               <p>{new Date(app.appliedAt).toLocaleDateString()}</p>
                                               <p className="mt-0.5 capitalize">{app.status}</p>
                                           </div>
                                           <Button 
                                              size="sm" 
                                              variant="outline" 
                                              onClick={() => app.id && router.push(`/recruiter/candidate/${app.id}`)}
                                           >
                                              Review
                                           </Button>
                                      </div>
                                  </div>
                              ))}
                          </div>
                      ) : (
                          <div className="text-center py-12">
                              <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-muted mb-3">
                                  <Users className="h-6 w-6 text-muted-foreground" />
                              </div>
                              <h3 className="text-lg font-medium">No recent applications</h3>
                              <p className="text-muted-foreground text-sm max-w-sm mx-auto mt-1">
                                  Post a new job or search for candidates to start building your pipeline.
                              </p>
                              <Button className="mt-4" onClick={() => router.push('/recruiter/jobs/new')}>
                                  Post a Job
                              </Button>
                          </div>
                      )}
                  </CardContent>
              </Card>

              {/* Quick Pipeline View */}
              <div className="grid md:grid-cols-2 gap-6">
                   <Card className="border-border/60 shadow-sm bg-gradient-to-br from-card to-muted/20">
                       <CardHeader>
                           <CardTitle className="text-base flex items-center gap-2">
                               <MessageSquare className="w-4 h-4 text-violet-500" /> Messages
                           </CardTitle>
                       </CardHeader>
                       <CardContent>
                           <div className="text-2xl font-bold mb-1">0</div>
                           <p className="text-xs text-muted-foreground mb-4">Unread messages from candidates</p>
                           <Button variant="secondary" size="sm" className="w-full" onClick={() => router.push('/recruiter/messages')}>Open Inbox</Button>
                       </CardContent>
                   </Card>
                   
                   <Card className="border-border/60 shadow-sm bg-gradient-to-br from-card to-muted/20">
                       <CardHeader>
                           <CardTitle className="text-base flex items-center gap-2">
                               <TrendingUp className="w-4 h-4 text-green-500" /> Activity
                           </CardTitle>
                       </CardHeader>
                       <CardContent>
                           <div className="text-2xl font-bold mb-1">High</div>
                           <p className="text-xs text-muted-foreground mb-4">You're in the top 10% of active recruiters</p>
                           <Button variant="secondary" size="sm" className="w-full">View Insights</Button>
                       </CardContent>
                   </Card>
              </div>
          </div>

          {/* Right Column: Top Jobs */}
          <div className="space-y-6">
              <Card className="border-border/60 shadow-sm h-full">
                  <CardHeader>
                      <CardTitle className="text-lg flex items-center gap-2">
                          <Star className="w-5 h-5 text-amber-500" /> Top Performing Jobs
                      </CardTitle>
                      <CardDescription>Roles with the most interest.</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                      {topJobs.length > 0 ? (
                          topJobs.map((job) => (
                              <div key={job.id} className="group">
                                  <div className="flex justify-between items-start mb-2">
                                      <h4 className="font-semibold text-sm line-clamp-1 group-hover:text-primary transition-colors cursor-pointer" onClick={() => router.push(`/recruiter/jobs/${job.id}`)}>
                                           {job.title}
                                      </h4>
                                      <Badge variant="outline" className="text-[10px] ml-2 shrink-0">Active</Badge>
                                  </div>
                                  <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground">
                                      <div className="flex items-center gap-1.5 p-2 rounded bg-muted/40">
                                          <Users className="w-3.5 h-3.5" />
                                          <span className="font-medium text-foreground">{job.applicationCount}</span> apps
                                      </div>
                                      <div className="flex items-center gap-1.5 p-2 rounded bg-muted/40">
                                          <LayoutDashboard className="w-3.5 h-3.5" />
                                          <span className="font-medium text-foreground">{job.viewCount}</span> views
                                      </div>
                                  </div>
                              </div>
                          ))
                      ) : (
                          <div className="text-center py-8 px-4 rounded-xl border border-dashed border-border">
                              <Briefcase className="w-8 h-8 text-muted-foreground mx-auto mb-2 opacity-50" />
                              <p className="text-sm text-muted-foreground">No active jobs yet.</p>
                              <Button variant="link" size="sm" className="h-auto p-0 mt-1" onClick={() => router.push('/recruiter/jobs/new')}>
                                  Create one now
                              </Button>
                          </div>
                      )}
                  </CardContent>
                  <div className="p-4 border-t border-border/50 bg-muted/10">
                      <Button variant="ghost" size="sm" className="w-full gap-2" onClick={() => router.push('/recruiter/jobs')}>
                          Manage All Jobs <ArrowRight className="w-3 h-3" />
                      </Button>
                  </div>
              </Card>
          </div>
      </div>
    </div>
  )
}
