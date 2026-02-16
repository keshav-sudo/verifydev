'use client';

import React, { useEffect } from 'react';
import { 
  Sparkles, 
  Code2, 
  Star, 
  GitFork, 
  CheckSquare, 
  Square,
  Zap,
  Target,
  Activity,
  TrendingUp,
  AlertCircle,
  ChevronRight,
  ShieldCheck,
  FolderKanban,
  Briefcase,
  Building,
  BarChart3,
  Terminal
} from 'lucide-react';
import { useUserStore } from '@/store/user-store';
import { cn } from '@/lib/utils';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function Dashboard() {
  const { dashboardData, isLoadingDashboard, error, fetchDashboard } = useUserStore();

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  if (isLoadingDashboard) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center font-['Plus_Jakarta_Sans']">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-2 border-slate-200 rounded-lg relative overflow-hidden">
            <div className="absolute inset-0 border-2 border-[#ADFF2F] border-t-transparent animate-spin rounded-lg"></div>
          </div>
          <p className="text-slate-500 text-[10px] font-extrabold tracking-widest animate-pulse uppercase">Initializing Workspace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#F0F2F5] flex items-center justify-center p-4 font-['Plus_Jakarta_Sans']">
        <div className="bg-white border border-red-200 shadow-sm rounded-xl p-8 max-w-md w-full text-center">
          <div className="w-12 h-12 bg-red-50 rounded-lg mx-auto mb-4 flex items-center justify-center border border-red-100">
             <AlertCircle className="w-5 h-5 text-red-600" />
          </div>
          <h2 className="text-sm font-black text-slate-900 mb-2 uppercase tracking-wide">Connection Error</h2>
          <p className="text-xs text-slate-500 mb-6 font-medium">{error}</p>
          <button
            onClick={() => fetchDashboard()}
            className="px-6 py-2 text-xs bg-slate-900 text-white font-bold rounded-lg hover:bg-slate-800 transition-all uppercase tracking-widest"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) return null;

  const { user, aura, projects, skills, jobs, activity, recommendations } = dashboardData;

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 60) return `${diffMins}m`;
    if (diffHours < 24) return `${diffHours}h`;
    if (diffDays < 7) return `${diffDays}d`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const currentDate = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="w-full min-h-screen bg-[#F0F2F5] relative p-4 md:p-6 lg:p-8 font-['Plus_Jakarta_Sans'] text-slate-800 overflow-x-hidden">
      <div className="max-w-[1536px] mx-auto space-y-6">
        
        {/* ========================================= */}
        {/* 1. DARK COMMAND CENTER HERO               */}
        {/* ========================================= */}
        <div className="bg-[#0A0A0A] rounded-2xl p-8 lg:p-12 shadow-xl relative overflow-hidden border border-slate-800 min-h-[360px] flex items-center">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#ADFF2F]/5 rounded-full blur-[100px] pointer-events-none" />
          <div className="absolute bottom-0 left-20 w-64 h-64 bg-[#A78BFA]/5 rounded-full blur-[80px] pointer-events-none" />
          
          {/* Hero Decorative Element */}
          <div className="absolute right-0 bottom-0 h-[400px] w-[450px] pointer-events-none z-0 hidden lg:block">
             <div className="absolute inset-0 bg-gradient-to-tl from-[#ADFF2F]/10 via-transparent to-transparent rounded-full blur-2xl" />
          </div>

          <div className="relative z-10 max-w-2xl space-y-6">
             {/* Header Badge */}
             <div className="flex items-center gap-3">
               <div className="px-2.5 py-1 rounded-[4px] bg-white/10 border border-white/5 text-[#ADFF2F] text-[10px] font-extrabold uppercase tracking-widest flex items-center gap-1.5 backdrop-blur-md">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#ADFF2F] animate-pulse" /> Live Console
               </div>
               <span className="text-slate-500 text-[10px] font-bold uppercase tracking-widest">{currentDate}</span>
             </div>

             {/* Main Greeting */}
             <div className="space-y-2">
               <h1 className="text-3xl lg:text-5xl font-black text-white tracking-tight leading-tight">
                 Welcome back, <br className="hidden md:block"/> <span className="text-slate-400">{user.name?.split(' ')[0] || 'User'}</span>
               </h1>
               <p className="text-sm text-slate-400 font-medium max-w-lg leading-relaxed">
                 Your workspace is active. Aura sync is optimized and project metrics are updating in real-time.
               </p>
             </div>

             {/* Actions & Stats Row */}
             <div className="flex flex-wrap items-center gap-6 pt-2">
               <Link href="/profile" className="px-6 py-3 bg-white text-slate-900 rounded-lg text-xs font-extrabold uppercase tracking-widest hover:bg-slate-100 transition-all shadow-[0_0_20px_rgba(255,255,255,0.1)] hover:scale-105 active:scale-95 flex items-center gap-2">
                 View Profile <ChevronRight className="w-3 h-3" />
               </Link>
               
               <div className="h-8 w-px bg-white/10" />
               
               <div className="flex items-center gap-3">
                  <div className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Global Rank</div>
                  <div className="text-white font-black text-xl flex items-center gap-2">
                     {aura.rank} <ShieldCheck className="w-4 h-4 text-[#ADFF2F]" />
                  </div>
               </div>
             </div>
          </div>
        </div>

        {/* ========================================= */}
        {/* 2. PREMIUM METRICS GRID                   */}
        {/* ========================================= */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1: Aura */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Zap className="w-16 h-16 text-[#ADFF2F] -rotate-12" />
             </div>
             <div className="relative z-10">
               <div className="flex items-center gap-2 mb-3">
                 <div className="p-1.5 bg-[#ADFF2F]/10 rounded-md border border-[#ADFF2F]/20">
                   <Zap className="w-4 h-4 text-[#65A30D]" />
                 </div>
                 <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Aura Score</span>
               </div>
               <div className="text-4xl font-black text-slate-900 tracking-tight mb-1">{aura.total}</div>
               <div className="flex items-center gap-1.5">
                 <span className="text-[10px] font-bold text-[#65A30D] bg-[#ADFF2F]/20 px-1.5 py-0.5 rounded-sm">Top {100 - aura.percentile}%</span>
                 <span className="text-[10px] font-medium text-slate-400">Global Percentile</span>
               </div>
             </div>
          </div>

          {/* Card 2: Projects */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <FolderKanban className="w-16 h-16 text-blue-500 -rotate-12" />
             </div>
             <div className="relative z-10">
               <div className="flex items-center gap-2 mb-3">
                 <div className="p-1.5 bg-blue-50 rounded-md border border-blue-100">
                   <Code2 className="w-4 h-4 text-blue-600" />
                 </div>
                 <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Projects</span>
               </div>
               <div className="text-4xl font-black text-slate-900 tracking-tight mb-1">{projects.analyzed}</div>
               <div className="w-full bg-slate-100 h-1.5 rounded-full mt-2 overflow-hidden">
                 <div className="bg-blue-500 h-full rounded-full" style={{ width: '70%' }}></div>
               </div>
             </div>
          </div>

          {/* Card 3: Skills */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Target className="w-16 h-16 text-[#A78BFA] -rotate-12" />
             </div>
             <div className="relative z-10">
               <div className="flex items-center gap-2 mb-3">
                 <div className="p-1.5 bg-[#A78BFA]/10 rounded-md border border-[#A78BFA]/20">
                   <Sparkles className="w-4 h-4 text-purple-600" />
                 </div>
                 <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Verified Skills</span>
               </div>
               <div className="text-4xl font-black text-slate-900 tracking-tight mb-1">{skills.verified}</div>
               <div className="flex flex-wrap gap-1 mt-2">
                 {skills.top.slice(0,3).map((s, i) => (
                   <span key={i} className="text-[9px] font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded-[2px]">{s.name}</span>
                 ))}
               </div>
             </div>
          </div>

          {/* Card 4: Pipeline */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
               <Briefcase className="w-16 h-16 text-amber-500 -rotate-12" />
             </div>
             <div className="relative z-10">
               <div className="flex items-center gap-2 mb-3">
                 <div className="p-1.5 bg-amber-50 rounded-md border border-amber-100">
                   <Briefcase className="w-4 h-4 text-amber-600" />
                 </div>
                 <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Job Pipeline</span>
               </div>
               <div className="flex items-baseline gap-2 mb-1">
                 <div className="text-4xl font-black text-slate-900 tracking-tight">{jobs.applied}</div>
                 <span className="text-xs font-bold text-slate-400">Applied</span>
               </div>
               <div className="flex items-center gap-2 text-[10px] font-extrabold uppercase tracking-wide">
                 <span className="text-[#65A30D]">{jobs.shortlisted} Shortlisted</span> • <span className="text-blue-600">{jobs.interviews} Interviews</span>
               </div>
             </div>
          </div>

        </div>

        {/* ========================================= */}
        {/* 3. MAIN CONTENT GRID                      */}
        {/* ========================================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* LEFT COLUMN (8/12) */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            
            {/* FEATURED PROJECTS */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/30">
                <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                  <Code2 className="w-4 h-4 text-slate-400" /> Project Intelligence
                </h3>
                <Link href="/projects" className="text-[10px] font-bold text-slate-500 hover:text-slate-900 flex items-center gap-1 transition-colors uppercase tracking-widest">
                  View All <ChevronRight className="w-3 h-3" />
                </Link>
              </div>
              
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.featured.length > 0 ? (
                  projects.featured.slice(0, 2).map((project) => (
                    <div key={project.id} className="group relative rounded-lg border border-slate-200 bg-white p-5 hover:border-[#ADFF2F] hover:shadow-[0_4px_20px_rgba(0,0,0,0.04)] transition-all cursor-pointer">
                      <div className="flex justify-between items-start mb-4">
                        <div className="flex items-center gap-3">
                           <div className="w-10 h-10 rounded-md bg-slate-50 border border-slate-200 flex items-center justify-center text-slate-900 font-bold shadow-sm">
                             {project.language ? project.language.substring(0,1).toUpperCase() : 'P'}
                           </div>
                           <div>
                             <h4 className="text-sm font-extrabold text-slate-900 truncate max-w-[150px] group-hover:text-blue-600 transition-colors">{project.repoName}</h4>
                             <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{project.language || 'Unknown'}</p>
                           </div>
                        </div>
                        <div className="text-right">
                           <div className="text-2xl font-black text-slate-900 leading-none">{project.overallScore}</div>
                           <div className="text-[8px] font-extrabold text-slate-400 uppercase tracking-widest">Score</div>
                        </div>
                      </div>
                      
                      <p className="text-xs font-medium text-slate-600 line-clamp-2 min-h-[40px] mb-4 leading-relaxed">
                        {project.description || 'No description available for this project.'}
                      </p>
                      
                      <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                        <div className="flex items-center gap-2 text-[10px] font-bold text-slate-500">
                          <Star className="w-3 h-3 text-amber-400 fill-amber-400" /> {project.stars}
                          <span className="w-1 h-1 rounded-full bg-slate-300" />
                          <GitFork className="w-3 h-3" /> {project.forks || 0}
                        </div>
                        {project.analysisStatus === 'COMPLETED' && (
                          <div className="px-2 py-0.5 rounded-[2px] bg-[#ADFF2F]/20 text-[#65A30D] text-[9px] font-extrabold uppercase tracking-widest border border-[#ADFF2F]/30">
                            Verified
                          </div>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-2 py-10 text-center border-2 border-dashed border-slate-100 rounded-lg bg-slate-50/50">
                    <p className="text-sm font-bold text-slate-400 mb-2">No projects analyzed yet</p>
                    <Button variant="outline" className="h-8 text-xs font-bold uppercase tracking-widest" asChild>
                      <Link href="/projects">Add Project</Link>
                    </Button>
                  </div>
                )}
              </div>
            </div>

            {/* SKILLS & PIPELINE SPLIT */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* SKILLS */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden relative">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Target className="w-4 h-4 text-[#A78BFA]" /> Skill DNA
                  </h3>
                </div>
                <div className="flex flex-wrap gap-2">
                   {skills.top.slice(0, 8).map((skill) => (
                     <div key={skill.name} className="flex items-center gap-1.5 pl-2.5 pr-1.5 py-1.5 bg-slate-50 border border-slate-200 rounded-md text-[10px] font-bold text-slate-700 hover:border-[#A78BFA] transition-colors cursor-default">
                       {skill.name}
                       <span className={cn("px-1 py-0.5 rounded-[2px] text-[9px] font-black text-white", skill.verifiedScore > 80 ? 'bg-[#65A30D]' : 'bg-slate-400')}>
                         {skill.verifiedScore}
                       </span>
                     </div>
                   ))}
                </div>
              </div>

              {/* ACTIVITY VELOCITY */}
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden relative">
                <div className="flex items-center justify-between mb-5">
                  <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                    <Activity className="w-4 h-4 text-[#ADFF2F]" /> Velocity
                  </h3>
                  <span className="text-[10px] font-bold text-slate-400 uppercase bg-slate-100 px-2 py-0.5 rounded-sm">30 Days</span>
                </div>
                <div className="h-[120px] flex items-end justify-between gap-1">
                   {[30, 45, 25, 60, 80, 50, 70, 90, 65, 85, 55, 95].map((h, i) => (
                     <div key={i} className="flex-1 bg-slate-100 rounded-t-sm relative group overflow-hidden" style={{ height: `${h}%` }}>
                        <div className="absolute bottom-0 w-full bg-[#ADFF2F] h-0 group-hover:h-full transition-all duration-500 opacity-50" />
                     </div>
                   ))}
                </div>
              </div>

            </div>

          </div>

          {/* RIGHT COLUMN (4/12) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* AURA QUEST / RECOMMENDATIONS */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-0 overflow-hidden">
               <div className="px-6 py-4 border-b border-slate-100 bg-[#ADFF2F]/5 flex items-center justify-between">
                 <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                   <Target className="w-4 h-4 text-[#65A30D]" /> Action Plan
                 </h3>
               </div>
               <div className="p-2 space-y-1">
                 {recommendations.profileImprovements.slice(0, 5).map((imp, idx) => (
                   <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer group">
                      <div className="mt-0.5 text-slate-300 group-hover:text-[#65A30D] transition-colors">
                        {imp.completed ? <CheckSquare className="w-4 h-4" /> : <Square className="w-4 h-4" />}
                      </div>
                      <div className="flex-1 min-w-0">
                         <div className="flex justify-between items-center mb-1">
                           <span className="text-[11px] font-extrabold text-slate-800">{imp.area}</span>
                           <span className={cn("text-[8px] font-black uppercase tracking-widest px-1.5 py-0.5 rounded-[2px]", imp.impact === 'HIGH' ? 'bg-amber-50 text-amber-600' : 'bg-slate-100 text-slate-500')}>{imp.impact}</span>
                         </div>
                         <p className="text-[10px] font-medium text-slate-500 leading-snug">{imp.suggestion}</p>
                      </div>
                   </div>
                 ))}
               </div>
            </div>

            {/* SYSTEM LOG */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 overflow-hidden">
               <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                 <Terminal className="w-4 h-4 text-slate-400" /> System Log
               </h3>
               <div className="relative border-l border-slate-200 ml-1.5 space-y-5">
                 {activity.recentActions.slice(0, 5).map((action, idx) => (
                    <div key={idx} className="relative pl-5">
                       <div className={cn("absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full border-2 border-white shadow-sm", action.type.includes('PROJECT') ? 'bg-blue-500' : action.type.includes('SKILL') ? 'bg-[#A78BFA]' : 'bg-slate-300')} />
                       <div className="flex justify-between items-start">
                         <span className="text-[11px] font-extrabold text-slate-800 leading-none">{action.title}</span>
                         <span className="text-[9px] font-bold text-slate-400 font-mono">{formatDate(action.timestamp)}</span>
                       </div>
                       <p className="text-[10px] text-slate-500 mt-1 truncate">{action.description}</p>
                    </div>
                 ))}
               </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}