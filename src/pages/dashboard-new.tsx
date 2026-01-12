/**
 * Developer Dashboard - Premium Edition
 * Features: Spotlights, Glassmorphism, Staggered Animations
 */

import { Link } from 'react-router-dom'
import {
  MotionCard,
  MotionCardHeader,
  MotionCardTitle,
  MotionCardDescription,
  MotionCardContent,
  MotionCardFooter,
} from '@/components/ui/motion-card'
import { FloatingOrbs, ParticleBackground } from '@/components/ui/animated-backgrounds'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  useMyProfile,
  useMyAura,
  useMySkills,
  useMyProjects,
} from '@/hooks/use-user'
import { useRecommendedJobs, useMyApplications } from '@/hooks/use-jobs'
import { AuraScore } from '@/components/aura-score'
import { SkillBadge } from '@/components/skill-card'
import { ProjectCardCompact } from '@/components/project-card'
import { MatchScoreCompact } from '@/components/match-score'
import {
  Sparkles,
  Code2,
  Briefcase,
  FileText,
  Settings,
  Plus,
  ArrowRight,
  CheckCircle,
  Target,
} from 'lucide-react'
import { motion, useReducedMotion } from 'framer-motion'

// Animation Variants - Optimized for performance
const getContainerVariants = (reduceMotion: boolean) => ({
  hidden: { opacity: reduceMotion ? 1 : 0 },
  visible: {
    opacity: 1,
    transition: reduceMotion ? { duration: 0 } : {
      staggerChildren: 0.08,
    },
  },
})

const getItemVariants = (reduceMotion: boolean) => ({
  hidden: { opacity: reduceMotion ? 1 : 0, y: reduceMotion ? 0 : 15 },
  visible: {
    opacity: 1,
    y: 0,
    transition: reduceMotion ? { duration: 0 } : {
      type: 'spring',
      stiffness: 120,
      damping: 20,
    },
  },
})

export default function DashboardPage() {
  const prefersReducedMotion = useReducedMotion() ?? false
  const containerVariants = getContainerVariants(prefersReducedMotion)
  const itemVariants = getItemVariants(prefersReducedMotion)

  // Queries
  const { data: profile, isLoading: profileLoading } = useMyProfile()
  const { data: aura, isLoading: auraLoading } = useMyAura()
  const { data: skills, isLoading: skillsLoading } = useMySkills()
  const { data: projects, isLoading: projectsLoading } = useMyProjects()
  const { data: recommendedJobs, isLoading: jobsLoading } = useRecommendedJobs(5)
  const { data: applications, isLoading: applicationsLoading } = useMyApplications(
    1,
    5
  )

  const verifiedSkills = skills?.filter((s) => s.isVerified) || []
  const completedProjects =
    projects?.filter((p) => p.analysisStatus === 'COMPLETED') || []
  const profileCompleteness = profile?.profileCompleteness || 0

  return (
    <div className="relative w-full min-h-[calc(100vh-4rem)]">
      <FloatingOrbs />
      <ParticleBackground />

      <motion.div
        className="container relative z-10 mx-auto px-4 py-8 space-y-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Header & Welcome Area */}
        <motion.div
          className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
          variants={itemVariants}
        >
          <div>
            <h1 className="text-2xl md:text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-400">
              Welcome, {profileLoading ? '...' : profile?.name?.split(' ')[0] || 'Developer'}! 👋
            </h1>
            <p className="text-muted-foreground mt-1 md:mt-2 text-sm md:text-lg">
              <span className="hidden md:inline">Your daily briefing: </span>
              <span className="text-foreground font-medium">3 job matches</span>
              <span className="hidden md:inline"> and <span className="text-foreground font-medium">1 skill waiting</span></span>
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline" className="hidden md:flex">
              <Link to="/settings">
                <Settings className="mr-2 w-4 h-4" />
                Settings
              </Link>
            </Button>
            <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg shadow-primary/25">
              <Link to="/projects/new">
                <Plus className="mr-2 w-4 h-4" />
                New Analysis
              </Link>
            </Button>
          </div>
        </motion.div>

        {/* Profile Completeness Alert (Premium Style) */}
        {profileCompleteness < 100 && (
          <motion.div variants={itemVariants}>
            <div className="relative overflow-hidden rounded-xl border border-yellow-500/30 bg-yellow-500/10 p-1">
              <div className="absolute inset-0 bg-yellow-500/5 blur-xl" />
              <div className="relative flex items-center justify-between p-4 flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-500/20 text-yellow-500">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">Complete Your Profile</h3>
                    <p className="text-sm text-muted-foreground">Reach 100% to boost visibility by 3x</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 flex-1 md:flex-none min-w-[200px]">
                  <div className="flex-1 space-y-1">
                    <div className="flex justify-between text-xs font-medium">
                      <span className="text-yellow-600 dark:text-yellow-400">Progress</span>
                      <span className="text-foreground">{profileCompleteness}%</span>
                    </div>
                    <Progress value={profileCompleteness} className="h-2 bg-yellow-500/20" />
                  </div>
                  <Button asChild size="sm" className="bg-yellow-500 hover:bg-yellow-600 text-black border-none">
                    <Link to="/profile">
                      Finish
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Stats Grid - Premium Cards */}
        <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
          {/* Aura Score */}
          <motion.div variants={itemVariants}>
            <StatCard
              icon={<Sparkles className="w-5 h-5" />}
              title="Aura Score"
              loading={auraLoading}
              gradient="from-purple-500 to-indigo-500"
            >
              {aura && (
                <div className="flex items-center justify-between mt-2">
                  <AuraScore
                    score={aura.score}
                    level={aura.level}
                    trend={aura.trend}
                    size="lg"
                    showLevel={false}
                    showTooltip={false}
                  />
                  <Link to="/profile#aura">
                    <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                      Details
                    </Button>
                  </Link>
                </div>
              )}
            </StatCard>
          </motion.div>

          {/* Verified Skills */}
          <motion.div variants={itemVariants}>
            <StatCard
              icon={<CheckCircle className="w-5 h-5" />}
              title="Verified Skills"
              loading={skillsLoading}
              gradient="from-emerald-500 to-teal-500"
            >
              <div className="flex items-center justify-between mt-2">
                <div>
                  <p className="text-4xl font-bold tracking-tight">{verifiedSkills.length}</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <Badge variant="outline" className="text-[10px] h-5 border-emerald-500/30 text-emerald-500 bg-emerald-500/5">
                      {Math.round((verifiedSkills.length / (skills?.length || 1)) * 100)}% Verified
                    </Badge>
                  </div>
                </div>
                <Link to="/profile#skills">
                  <Button variant="ghost" size="sm" className="hover:bg-emerald-500/10">View</Button>
                </Link>
              </div>
            </StatCard>
          </motion.div>

          {/* Projects Analyzed */}
          <motion.div variants={itemVariants}>
            <StatCard
              icon={<Code2 className="w-5 h-5" />}
              title="Projects"
              loading={projectsLoading}
              gradient="from-blue-500 to-cyan-500"
            >
              <div className="flex items-center justify-between mt-2">
                <div>
                  <p className="text-4xl font-bold tracking-tight">{completedProjects.length}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {projects?.length || 0} total repositories
                  </p>
                </div>
                <Link to="/projects">
                  <Button variant="ghost" size="sm" className="hover:bg-blue-500/10">Manage</Button>
                </Link>
              </div>
            </StatCard>
          </motion.div>

          {/* Applications */}
          <motion.div variants={itemVariants}>
            <StatCard
              icon={<Briefcase className="w-5 h-5" />}
              title="Applications"
              loading={applicationsLoading}
              gradient="from-pink-500 to-rose-500"
            >
              <div className="flex items-center justify-between mt-2">
                <div>
                  <p className="text-4xl font-bold tracking-tight">{applications?.meta.total || 0}</p>
                  <p className="text-xs text-muted-foreground mt-1">Active applications</p>
                </div>
                <Link to="/applications">
                  <Button variant="ghost" size="sm" className="hover:bg-pink-500/10">View</Button>
                </Link>
              </div>
            </StatCard>
          </motion.div>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          {/* Left Column - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
            {/* Recent Projects */}
            <motion.div variants={itemVariants}>
              <MotionCard className="h-full">
                <MotionCardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <MotionCardTitle>Recent Projects</MotionCardTitle>
                      <MotionCardDescription>Your GitHub projects with analysis status</MotionCardDescription>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/projects">
                        <Plus className="mr-2 w-4 h-4" />
                        Add Project
                      </Link>
                    </Button>
                  </div>
                </MotionCardHeader>
                <MotionCardContent>
                  {projectsLoading ? (
                    <div className="space-y-3">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-20 w-full" />
                      ))}
                    </div>
                  ) : projects && projects.length > 0 ? (
                    <div className="space-y-3">
                      {projects.slice(0, 5).map((project) => (
                        <Link key={project.id} to={`/projects/${project.id}`} className="block group">
                          <div className="transition-transform duration-200 group-hover:scale-[1.01]">
                            <ProjectCardCompact project={project} />
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border rounded-lg border-dashed">
                      <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Code2 className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-foreground font-medium mb-1">No projects yet</p>
                      <p className="text-muted-foreground text-sm mb-4">Add your first repository to get verified skills</p>
                      <Button asChild>
                        <Link to="/projects">
                          <Plus className="mr-2 w-4 h-4" />
                          Add Project
                        </Link>
                      </Button>
                    </div>
                  )}
                </MotionCardContent>
                {projects && projects.length > 5 && (
                  <MotionCardFooter>
                    <Button asChild variant="ghost" className="w-full">
                      <Link to="/projects">
                        View All Projects
                        <ArrowRight className="ml-2 w-4 h-4" />
                      </Link>
                    </Button>
                  </MotionCardFooter>
                )}
              </MotionCard>
            </motion.div>

            {/* Recommended Jobs */}
            <motion.div variants={itemVariants}>
              <MotionCard>
                <MotionCardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <MotionCardTitle>Recommended Jobs</MotionCardTitle>
                      <MotionCardDescription>Jobs matched to your verified skills</MotionCardDescription>
                    </div>
                    <Button asChild variant="outline" size="sm">
                      <Link to="/jobs">Browse All</Link>
                    </Button>
                  </div>
                </MotionCardHeader>
                <MotionCardContent>
                  {jobsLoading ? (
                    <div className="space-y-4">
                      {[...Array(3)].map((_, i) => (
                        <Skeleton key={i} className="h-24 w-full" />
                      ))}
                    </div>
                  ) : recommendedJobs && recommendedJobs.length > 0 ? (
                    <div className="space-y-4">
                      {recommendedJobs.map((job) => (
                        <JobCard key={job.id} job={job} />
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border rounded-lg border-dashed">
                      <div className="mx-auto w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                        <Briefcase className="w-6 h-6 text-primary" />
                      </div>
                      <p className="text-foreground font-medium mb-1">No matches found yet</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Add more projects to improve your skill matching
                      </p>
                      <Button asChild>
                        <Link to="/jobs">Browse Jobs</Link>
                      </Button>
                    </div>
                  )}
                </MotionCardContent>
              </MotionCard>
            </motion.div>
          </div>

          {/* Right Column - 1/3 width */}
          <div className="space-y-8">
            {/* Top Skills */}
            <motion.div variants={itemVariants}>
              <MotionCard>
                <MotionCardHeader>
                  <MotionCardTitle>Top Skills</MotionCardTitle>
                  <MotionCardDescription>Your most verified skills</MotionCardDescription>
                </MotionCardHeader>
                <MotionCardContent>
                  {skillsLoading ? (
                    <div className="space-y-2">
                      {[...Array(5)].map((_, i) => (
                        <Skeleton key={i} className="h-8 w-full" />
                      ))}
                    </div>
                  ) : verifiedSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {verifiedSkills
                        .sort((a, b) => b.score - a.score)
                        .slice(0, 10)
                        .map((skill) => (
                          <SkillBadge
                            key={skill.id}
                            name={skill.name}
                            verified={skill.isVerified}
                            score={skill.score}
                          />
                        ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-sm text-muted-foreground">
                        No verified skills yet. Analyze projects to get verified skills.
                      </p>
                    </div>
                  )}
                </MotionCardContent>
                <MotionCardFooter>
                  <Button asChild variant="ghost" className="w-full">
                    <Link to="/profile#skills">
                      View All Skills
                      <ArrowRight className="ml-2 w-4 h-4" />
                    </Link>
                  </Button>
                </MotionCardFooter>
              </MotionCard>
            </motion.div>

            {/* Quick Actions */}
            <motion.div variants={itemVariants}>
              <MotionCard>
                <MotionCardHeader>
                  <MotionCardTitle>Quick Actions</MotionCardTitle>
                </MotionCardHeader>
                <MotionCardContent className="space-y-2">
                  {[
                    { l: 'Build Resume', i: FileText, to: '/resume' },
                    { l: 'Browse Jobs', i: Briefcase, to: '/jobs' },
                    { l: 'Add Project', i: Code2, to: '/projects' },
                    { l: 'Edit Profile', i: Settings, to: '/profile' },
                  ].map((action, i) => (
                    <Button key={i} asChild variant="outline" className="w-full justify-start h-10 group bg-card hover:bg-accent hover:border-primary/50 transition-all duration-300">
                      <Link to={action.to}>
                        <action.i className="mr-3 w-4 h-4 text-primary group-hover:scale-110 transition-transform" />
                        {action.l}
                      </Link>
                    </Button>
                  ))}
                </MotionCardContent>
              </MotionCard>
            </motion.div>

            {/* Aura Breakdown */}
            {aura && (
              <motion.div variants={itemVariants}>
                <MotionCard>
                  <MotionCardHeader>
                    <MotionCardTitle>Aura Breakdown</MotionCardTitle>
                    <MotionCardDescription>What makes up your score</MotionCardDescription>
                  </MotionCardHeader>
                  <MotionCardContent className="space-y-4">
                    <AuraBreakdownItem
                      label="Skill Diversity"
                      value={aura.breakdown.skillDiversity}
                      color="bg-purple-500"
                    />
                    <AuraBreakdownItem
                      label="Project Quality"
                      value={aura.breakdown.projectQuality}
                      color="bg-blue-500"
                    />
                    <AuraBreakdownItem
                      label="Activity Consistency"
                      value={aura.breakdown.activityConsistency}
                      color="bg-green-500"
                    />
                    <AuraBreakdownItem
                      label="Community Impact"
                      value={aura.breakdown.communityImpact}
                      color="bg-orange-500"
                    />
                  </MotionCardContent>
                </MotionCard>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  )
}

// ============================================
// HELPER COMPONENTS
// ============================================

function StatCard({
  icon,
  title,
  loading,
  children,
  gradient = "from-primary to-purple-600",
}: {
  icon: React.ReactNode
  title: string
  loading: boolean
  children: React.ReactNode
  gradient?: string
}) {
  return (
    <MotionCard spotlight className="overflow-hidden">
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-br ${gradient} opacity-10 blur-3xl rounded-full translate-x-1/2 -translate-y-1/2`} />
      <MotionCardHeader className="pb-2">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg bg-gradient-to-br ${gradient} bg-opacity-10 dark:bg-opacity-20 text-white shadow-inner`}>
            <div className="text-white/90 drop-shadow-sm [&>svg]:w-4 [&>svg]:h-4">{icon}</div>
          </div>
          <MotionCardTitle className="text-sm font-medium text-muted-foreground">{title}</MotionCardTitle>
        </div>
      </MotionCardHeader>
      <MotionCardContent>
        {loading ? (
          <Skeleton className="h-12 w-full" />
        ) : (
          children
        )}
      </MotionCardContent>
    </MotionCard>
  )
}

function JobCard({ job }: { job: any }) {
  return (
    <Link to={`/jobs/${job.id}`}>
      <div className="group relative p-4 rounded-xl border bg-card/50 hover:bg-accent/50 transition-all duration-300 hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <h4 className="font-semibold text-lg truncate group-hover:text-primary transition-colors">{job.title}</h4>
            <p className="text-sm text-muted-foreground truncate">{job.companyName}</p>
          </div>
          {job.matchScore !== undefined && (
            <div className="transition-transform duration-300 group-hover:scale-110">
              <MatchScoreCompact score={job.matchScore} />
            </div>
          )}
        </div>
        <div className="flex items-center flex-wrap gap-2 text-xs text-muted-foreground">
          <Badge variant="secondary" className="bg-secondary/50 group-hover:bg-secondary transition-colors">{job.type.replace('_', ' ')}</Badge>
          <span className="text-muted-foreground/30">•</span>
          <span>{job.location}</span>
          {job.isRemote && (
            <>
              <span className="text-muted-foreground/30">•</span>
              <Badge variant="outline" className="border-primary/20 text-primary/80">Remote</Badge>
            </>
          )}
        </div>
        <div className="absolute right-4 bottom-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
          <ArrowRight className="w-4 h-4 text-primary" />
        </div>
      </div>
    </Link>
  )
}

function AuraBreakdownItem({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground font-medium">{label}</span>
        <span className="font-bold">{value}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-secondary/50 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  )
}
