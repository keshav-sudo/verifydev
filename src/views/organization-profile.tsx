'use client'

import { useParams, useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { organizationApi } from '@/api/services/organization.service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import {
  ArrowLeft,
  MapPin,
  Globe,
  Users,
  Briefcase,
  Calendar,
  CheckCircle2,
  ExternalLink,
  Linkedin,
  Mail,
  TrendingUp,
  Star,
} from 'lucide-react'

const companySizeLabels = {
  STARTUP: '1-10 employees',
  SMALL: '11-50 employees',
  MEDIUM: '51-200 employees',
  LARGE: '201-1000 employees',
  ENTERPRISE: '1000+ employees',
}

export default function OrganizationProfilePage() {
  const params = useParams()
  const router = useRouter()
  const organizationId = params.organizationId as string

  const { data: profile, isLoading, error } = useQuery({
    queryKey: ['organization', 'profile', organizationId],
    queryFn: () => organizationApi.getOrganizationProfile(organizationId),
    enabled: !!organizationId,
  })

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground">Loading organization...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle>Organization Not Found</CardTitle>
            <CardDescription>
              The organization you're looking for doesn't exist or you don't have access.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.back()} variant="outline" className="w-full">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const { organization, recruiters, activeJobs, stats } = profile

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-10">
        <div className="container max-w-6xl mx-auto px-4 py-4">
          <Button
            variant="ghost"
            onClick={() => router.back()}
            className="mb-4"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
        </div>
      </div>

      <div className="container max-w-6xl mx-auto px-4 py-8 space-y-8">
        {/* Organization Header Card */}
        <Card className="border-border/50 bg-card/50 backdrop-blur">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row gap-6">
              {/* Logo */}
              <div className="flex-shrink-0">
                <Avatar className="w-24 h-24 rounded-xl border-4 border-background shadow-lg">
                  <AvatarImage src={organization.logo} alt={organization.name} />
                  <AvatarFallback className="text-2xl font-bold bg-gradient-to-br from-primary/20 to-primary/10 rounded-xl">
                    {organization.name.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              {/* Info */}
              <div className="flex-1 space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-3xl font-bold">{organization.name}</h1>
                    {organization.isVerified && (
                      <Badge variant="default" className="gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        Verified
                      </Badge>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                    {organization.industry && (
                      <div className="flex items-center gap-1.5">
                        <Briefcase className="w-4 h-4" />
                        <span>{organization.industry}</span>
                      </div>
                    )}
                    {organization.headquarters && (
                      <div className="flex items-center gap-1.5">
                        <MapPin className="w-4 h-4" />
                        <span>{organization.headquarters}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1.5">
                      <Users className="w-4 h-4" />
                      <span>{companySizeLabels[organization.size]}</span>
                    </div>
                    {organization.foundedYear && (
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-4 h-4" />
                        <span>Founded {organization.foundedYear}</span>
                      </div>
                    )}
                  </div>
                </div>

                {organization.description && (
                  <p className="text-muted-foreground leading-relaxed">
                    {organization.description}
                  </p>
                )}

                {/* Links */}
                <div className="flex flex-wrap gap-3">
                  {organization.website && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={organization.website} target="_blank" rel="noopener noreferrer">
                        <Globe className="w-4 h-4 mr-2" />
                        Website
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                  )}
                  {organization.linkedIn && (
                    <Button variant="outline" size="sm" asChild>
                      <a href={organization.linkedIn} target="_blank" rel="noopener noreferrer">
                        <Linkedin className="w-4 h-4 mr-2" />
                        LinkedIn
                        <ExternalLink className="w-3 h-3 ml-1" />
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Active Jobs</p>
                  <p className="text-2xl font-bold">{stats.activeJobs}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-lg">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total Jobs</p>
                  <p className="text-2xl font-bold">{stats.totalJobs}</p>
                </div>
                <div className="p-3 bg-blue-500/10 rounded-lg">
                  <TrendingUp className="w-6 h-6 text-blue-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Recruiters</p>
                  <p className="text-2xl font-bold">{stats.activeRecruiters}</p>
                </div>
                <div className="p-3 bg-green-500/10 rounded-lg">
                  <Users className="w-6 h-6 text-green-500" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card/50">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Applications</p>
                  <p className="text-2xl font-bold">{stats.totalApplications}</p>
                </div>
                <div className="p-3 bg-amber-500/10 rounded-lg">
                  <Star className="w-6 h-6 text-amber-500" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recruiters Section */}
        {recruiters.length > 0 && (
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Our Recruiters ({recruiters.length})
              </CardTitle>
              <CardDescription>
                Connect with our talent acquisition team
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {recruiters.map((recruiter) => (
                  <div
                    key={recruiter.id}
                    className="flex items-center gap-3 p-4 rounded-lg border border-border/50 hover:border-border hover:bg-muted/50 transition-all"
                  >
                    <Avatar className="w-12 h-12 border-2 border-background">
                      <AvatarImage src={recruiter.avatarUrl} alt={recruiter.name} />
                      <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                        {recruiter.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold truncate">{recruiter.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {recruiter.title || 'Recruiter'}
                      </p>
                      {recruiter.role === 'ADMIN' && (
                        <Badge variant="secondary" className="mt-1 text-xs">
                          Admin
                        </Badge>
                      )}
                    </div>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => router.push(`/messages?userId=${recruiter.id}&userName=${encodeURIComponent(recruiter.name)}`)}
                    >
                      <Mail className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Open Positions */}
        {activeJobs.length > 0 && (
          <Card className="border-border/50 bg-card/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="w-5 h-5" />
                Open Positions ({activeJobs.length})
              </CardTitle>
              <CardDescription>
                Explore career opportunities at {organization.name}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeJobs.map((job, index) => (
                  <div key={job.id}>
                    {index > 0 && <Separator className="my-3" />}
                    <div
                      className="flex items-start justify-between gap-4 p-4 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer"
                      onClick={() => router.push(`/jobs/${job.id}`)}
                    >
                      <div className="flex-1 space-y-1">
                        <h4 className="font-semibold">{job.title}</h4>
                        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                          {job.location && (
                            <span className="flex items-center gap-1">
                              <MapPin className="w-3.5 h-3.5" />
                              {job.location}
                            </span>
                          )}
                          {job.type && <Badge variant="outline">{job.type}</Badge>}
                          {job.experience && <Badge variant="outline">{job.experience}</Badge>}
                          {job.salary && (
                            <span className="text-green-600 dark:text-green-400 font-medium">
                              ₹{job.salary.min?.toLocaleString()} - ₹{job.salary.max?.toLocaleString()}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">
                          Posted {new Date(job.postedAt).toLocaleDateString()} • {job.applicantsCount} applicants
                        </p>
                      </div>
                      <Button size="sm">
                        View Job
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
