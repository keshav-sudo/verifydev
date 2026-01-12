"use client"

import { useParams, useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  ArrowLeft,
  Building2,
  MapPin,
  Briefcase,
  Calendar,
  DollarSign,
  Clock,
  CheckCircle2,
  FileText,
  Loader2,
  MessageCircle,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getApplication, getApplicationStatusLabel, getApplicationStatusColor } from '@/api/services/application.service';

export default function ApplicationDetail() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const { data, isLoading, error } = useQuery({
    queryKey: ['application', id],
    queryFn: () => getApplication(id!),
    enabled: !!id,
  });

  const application = data?.data;

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Loading application details...</p>
      </div>
    );
  }

  if (error || !application) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center max-w-md mx-auto">
        <AlertCircle className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-2xl font-bold mb-2">Application Not Found</h2>
        <p className="text-muted-foreground mb-6">
          We couldn't find the application you're looking for. It might have been deleted or you don't have access.
        </p>
        <Button onClick={() => router.push('/applications')}>Back to Applications</Button>
      </div>
    );
  }

  const statusColor = getApplicationStatusColor(application.status);

  return (
    <div className="space-y-6 pb-20 animate-in fade-in duration-500">
      {/* Navigation */}
      <Button variant="ghost" className="mb-2 pl-0 hover:pl-2 transition-all" onClick={() => router.push('/applications')}>
        <ArrowLeft className="h-4 w-4 mr-2" />
        Back to Applications
      </Button>

      {/* Header Card */}
      <Card className="border-border/50 shadow-sm overflow-hidden">
        <div className="h-2 bg-primary/10 w-full" />
        <CardContent className="p-6 sm:p-8">
          <div className="flex flex-col md:flex-row justify-between gap-6">
            <div className="flex items-start gap-5">
              {application.job.companyLogo ? (
                <img 
                  src={application.job.companyLogo} 
                  alt={application.job.companyName} 
                  className="h-20 w-20 rounded-xl object-cover border shadow-sm"
                />
              ) : (
                <div className="h-20 w-20 rounded-xl bg-muted flex items-center justify-center border shadow-sm">
                  <Building2 className="h-10 w-10 text-muted-foreground" />
                </div>
              )}
              
              <div className="space-y-1.5">
                <div className="flex items-center flex-wrap gap-2">
                  <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">{application.job.title}</h1>
                  <Badge className={`bg-${statusColor}-100 text-${statusColor}-700 hover:bg-${statusColor}-100 border-${statusColor}-200`}>
                    {getApplicationStatusLabel(application.status)}
                  </Badge>
                </div>
                
                <div className="flex items-center gap-2 text-lg text-muted-foreground font-medium">
                  {application.job.companyName}
                  <span className="text-muted-foreground/40">•</span>
                  <span className="text-sm">{application.job.type.replace('_', ' ')}</span>
                </div>

                <div className="flex items-center flex-wrap gap-4 text-sm text-muted-foreground pt-1">
                  <div className="flex items-center gap-1.5">
                    <MapPin className="h-4 w-4" />
                    {application.job.location}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="h-4 w-4" />
                    Applied {new Date(application.appliedAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 self-start md:self-center">
              <Button asChild variant="outline">
                 <a href={`/jobs/${application.jobId}`} target="_blank" rel="noopener noreferrer">
                   View Job Posting
                 </a>
              </Button>
              <Button onClick={() => router.push(`/messages?userId=${application.recruiterId}`)}>
                <MessageCircle className="h-4 w-4 mr-2" />
                Message Recruiter
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Main Info */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Match Score */}
          <Card className="border-border/50">
           <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-primary" />
                AI Match Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
                 {application.matchScore ? (
                        <div className="space-y-6">
                            <div className="p-6 rounded-xl border bg-gradient-to-br from-background to-primary/5">
                                <div className="flex items-center justify-between mb-3">
                                    <div>
                                      <span className="text-lg font-semibold block">Match Score</span>
                                      <span className="text-sm text-muted-foreground">Based on your profile & job requirements</span>
                                    </div>
                                    <span className="text-4xl font-bold text-primary">{Math.round(application.matchScore.overall)}%</span>
                                </div>
                                <div className="h-3 bg-muted rounded-full overflow-hidden">
                                    <div 
                                        className="h-full bg-primary transition-all duration-1000 ease-out"
                                        style={{ width: `${application.matchScore.overall}%` }}
                                    />
                                </div>
                            </div>
                            
                            {/* Breakdown Grid - Only show if data exists */}
                            {(application.matchScore.breakdown.skills.score > 0 || 
                              application.matchScore.breakdown.experience.score > 0 || 
                              application.matchScore.breakdown.aura.score > 0) ? (
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <div className="p-4 rounded-lg bg-muted/30 border text-center">
                                        <div className="text-2xl font-bold mb-1">{Math.round(application.matchScore.breakdown.skills.score)}%</div>
                                        <div className="text-xs font-medium text-muted-foreground uppercase">Skills</div>
                                    </div>
                                    <div className="p-4 rounded-lg bg-muted/30 border text-center">
                                        <div className="text-2xl font-bold mb-1">{Math.round(application.matchScore.breakdown.experience.score)}%</div>
                                        <div className="text-xs font-medium text-muted-foreground uppercase">Experience</div>
                                    </div>
                                    <div className="p-4 rounded-lg bg-muted/30 border text-center">
                                        <div className="text-2xl font-bold mb-1">{Math.round(application.matchScore.breakdown.aura.score)}%</div>
                                        <div className="text-xs font-medium text-muted-foreground uppercase">Aura Score</div>
                                    </div>
                                    <div className="p-4 rounded-lg bg-muted/30 border text-center">
                                        <div className="text-2xl font-bold mb-1">{Math.round(application.matchScore.breakdown.location.score)}%</div>
                                        <div className="text-xs font-medium text-muted-foreground uppercase">Location</div>
                                    </div>
                                </div>
                            ) : (
                                <div className="text-center py-6 bg-muted/30 rounded-lg border border-dashed">
                                    <p className="text-sm text-muted-foreground">Detailed breakdown unavailable for this application.</p>
                                </div>
                            )}
                        </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">Match analysis not available</div>
                    )}
            </CardContent>
          </Card>

           {/* Skills Snapshot */}
           <Card className="border-border/50">
             <CardHeader>
                <CardTitle className="text-lg">Skills Submitted</CardTitle>
             </CardHeader>
             <CardContent>
                {application.candidateSkills && application.candidateSkills.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {application.candidateSkills.map(skill => (
                      <Badge key={skill} variant="secondary" className="px-3 py-1 text-sm">{skill}</Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No specific skills recorded in snapshot.</p>
                )}
             </CardContent>
           </Card>

          {/* Cover Letter */}
          <Card className="border-border/50">
            <CardHeader>
              <CardTitle className="text-lg">Cover Letter</CardTitle>
            </CardHeader>
            <CardContent>
               {application.coverLetter ? (
                 <div className="bg-muted/30 p-6 rounded-xl border text-muted-foreground leading-relaxed whitespace-pre-wrap">
                   {application.coverLetter}
                 </div>
               ) : (
                 <div className="text-muted-foreground italic text-center py-4">No cover letter submitted.</div>
               )}
            </CardContent>
          </Card>

        </div>

        {/* Right Column: Sidebar Specs */}
        <div className="space-y-6">
            
            {/* Preferences */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Application Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                 <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                       <DollarSign className="h-5 w-5 text-muted-foreground" />
                       <span className="text-sm font-medium">Expected Salary</span>
                    </div>
                    <span className="font-semibold">
                      {application.expectedSalary ? `$${application.expectedSalary.toLocaleString()}` : 'N/A'}
                    </span>
                 </div>
                 
                 <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div className="flex items-center gap-3">
                       <Clock className="h-5 w-5 text-muted-foreground" />
                       <span className="text-sm font-medium">Notice Period</span>
                    </div>
                    <span className="font-semibold">
                      {application.noticePeriod ? `${application.noticePeriod} Days` : 'Immediate'}
                    </span>
                 </div>
              </CardContent>
            </Card>

            {/* Documents */}
             <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Documents</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                  {application.resumeUrl ? (
                    <a href={application.resumeUrl} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors group">
                       <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mr-3 group-hover:bg-primary/20 transition-colors">
                          <FileText className="h-5 w-5 text-primary" />
                       </div>
                       <div>
                          <div className="font-medium">Resume</div>
                          <div className="text-xs text-muted-foreground">PDF / DOCX</div>
                       </div>
                    </a>
                  ) : (
                     <div className="p-4 border border-dashed rounded-lg text-center text-sm text-muted-foreground">No Resume</div>
                  )}

                  {application.portfolioUrl ? (
                    <a href={application.portfolioUrl} target="_blank" rel="noopener noreferrer" className="flex items-center p-4 bg-muted/30 rounded-lg border hover:bg-muted/50 transition-colors group">
                       <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center mr-3 group-hover:bg-primary/20 transition-colors">
                          <Briefcase className="h-5 w-5 text-primary" />
                       </div>
                       <div>
                          <div className="font-medium">Portfolio</div>
                          <div className="text-xs text-muted-foreground">External Link</div>
                       </div>
                    </a>
                  ) : (
                     <div className="p-4 border border-dashed rounded-lg text-center text-sm text-muted-foreground">No Portfolio</div>
                  )}
              </CardContent>
            </Card>

            {/* Timeline */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="text-lg">Application History</CardTitle>
              </CardHeader>
              <CardContent>
                  <div className="relative border-l-2 border-muted ml-2 space-y-6 pb-2">
                        {application.statusHistory && application.statusHistory.map((item, i) => (
                            <div key={i} className="pl-6 relative">
                                <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-background" />
                                <div className="flex flex-col">
                                    <span className="font-medium text-sm">{getApplicationStatusLabel(item.to)}</span>
                                    <span className="text-xs text-muted-foreground">{new Date(item.changedAt).toLocaleString()}</span>
                                    {item.reason && (
                                        <p className="text-xs mt-1 bg-muted p-2 rounded">{item.reason}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                         {/* Initial */}
                         <div className="pl-6 relative">
                            <div className="absolute -left-[5px] top-1.5 h-2.5 w-2.5 rounded-full bg-muted-foreground/30 ring-4 ring-background" />
                            <div className="flex flex-col">
                                <span className="font-medium text-sm text-muted-foreground">Applied</span>
                                <span className="text-xs text-muted-foreground">{new Date(application.appliedAt).toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
              </CardContent>
            </Card>

        </div>
      </div>
    </div>
  );
}
