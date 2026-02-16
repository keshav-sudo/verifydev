'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { 
  Zap, Code2, Target, CheckCircle2, Star, GitFork, 
  MapPin, Link as LinkIcon, Building, ShieldCheck, Github
} from 'lucide-react';

export interface ProfileData {
  aura: {
    total: number;
    level: string;
    trend: string;
    percentile: number;
    breakdown: {
      profile: number;
      projects: number;
      skills: number;
      activity: number;
      github: number;
    };
    breakdownDetails?: any;
  };
  profile: {
    name: string;
    username: string;
    avatarUrl: string;
    bio: string;
    location: string;
    company: string;
    website: string;
    githubUsername: string;
  };
  stats: {
    projects: number;
    skills: number;
    followers: number;
    publicRepos: number;
  };
  skills: Array<{
    name: string;
    category: string;
    isVerified: boolean;
    score: number;
    verifiedScore: number;
  }>;
  projects: Array<{
    id: string;
    name: string;
    description: string;
    language: string;
    stars: number;
    forks: number;
    url: string;
    auraContribution: number;
  }>;
  githubCalendar: Record<string, number>;
  leetcodeCalendar: Record<string, number>;
}

export default function AntiGravityProfile({ data }: { data: ProfileData }) {
  if (!data) return null;

  const { profile, aura, stats, skills, projects } = data;

  return (
    <div className="w-full bg-[#0A0A0A] text-white font-sans p-6 md:p-8 rounded-xl border border-white/5">
      {/* Header / Identity */}
      <div className="flex flex-col md:flex-row gap-6 mb-8 items-start">
        <div className="relative group">
          <div className="w-24 h-24 rounded-xl overflow-hidden border border-white/10 relative z-10 bg-zinc-900">
            <img 
              src={profile.avatarUrl} 
              alt={profile.name} 
              className="w-full h-full object-cover" 
              onError={(e) => e.currentTarget.style.display = 'none'} 
            />
            <div className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-zinc-700 -z-10">
              {profile.name.charAt(0)}
            </div>
          </div>
          {profile.username && (
            <div className="absolute -bottom-2 -right-2 bg-slate-900 p-1.5 rounded-lg border border-slate-700 z-20 shadow-lg">
               <ShieldCheck className="w-4 h-4 text-[#ADFF2F]" />
            </div>
          )}
          {/* Glow behind avatar */}
          <div className="absolute inset-0 bg-[#ADFF2F]/20 blur-xl -z-10 group-hover:bg-[#ADFF2F]/40 transition-all duration-500" />
        </div>

        <div className="flex-1 space-y-2">
           <div>
              <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
                {profile.name}
                {aura.percentile <= 5 && (
                  <span className="px-2 py-0.5 rounded-full bg-[#ADFF2F]/10 border border-[#ADFF2F]/20 text-[10px] font-bold text-[#ADFF2F] uppercase tracking-widest">
                    Top {aura.percentile}%
                  </span>
                )}
              </h1>
              <p className="text-sm font-mono text-zinc-500">@{profile.username}</p>
           </div>
           <p className="text-sm text-zinc-400 max-w-lg leading-relaxed">
              {profile.bio || "No bio provided."}
           </p>
           <div className="flex flex-wrap gap-4 text-[10px] font-bold text-zinc-500 uppercase tracking-widest pt-2">
              {profile.location && <span className="flex items-center gap-1.5"><MapPin className="w-3 h-3" /> {profile.location}</span>}
              {profile.company && <span className="flex items-center gap-1.5"><Building className="w-3 h-3" /> {profile.company}</span>}
              {profile.website && (
                <a href={profile.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 hover:text-[#ADFF2F] transition-colors">
                  <LinkIcon className="w-3 h-3" /> Website
                </a>
              )}
           </div>
        </div>

        {/* Aura Score */}
        <div className="bg-white/5 border border-white/10 rounded-xl p-4 min-w-[140px] text-center backdrop-blur-sm">
           <div className="text-[10px] font-bold text-[#ADFF2F] uppercase tracking-widest mb-1 flex items-center justify-center gap-1.5">
              <Zap className="w-3 h-3" /> Aura Score
           </div>
           <div className="text-4xl font-black text-white">{aura.total}</div>
           <div className="text-[9px] text-zinc-500 mt-1 font-mono">{aura.level}</div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
         {[
            { label: 'Projects', value: stats.projects, icon: Code2, color: 'text-blue-400' },
            { label: 'Skills', value: stats.skills, icon: Target, color: 'text-purple-400' },
            { label: 'Followers', value: stats.followers, icon: Github, color: 'text-white' },
            { label: 'Contribs', value: aura.breakdown.activity, icon: Zap, color: 'text-[#ADFF2F]' }, // Using activity score as proxy for contribs visualization if specific count missing
         ].map((stat, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col items-center justify-center gap-1 hover:bg-white/[0.07] transition-colors">
               <stat.icon className={`w-4 h-4 ${stat.color} mb-1`} />
               <div className="text-2xl font-black text-white">{stat.value}</div>
               <div className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest">{stat.label}</div>
            </div>
         ))}
      </div>

      {/* Verified Stack */}
      {skills.length > 0 && (
        <div className="mb-8">
           <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Verified Stack</h3>
           <div className="flex flex-wrap gap-2">
              {skills.slice(0, 12).map((skill, i) => (
                 <div key={i} className={`px-3 py-1.5 rounded-md border flex items-center gap-2 group transition-colors ${skill.isVerified ? 'bg-white/5 border-white/10 hover:border-[#ADFF2F]/30' : 'bg-transparent border-white/5 opacity-60'}`}>
                    <span className="text-xs font-bold text-gray-300">{skill.name}</span>
                    {skill.isVerified && <CheckCircle2 className="w-3 h-3 text-[#ADFF2F]" />}
                 </div>
              ))}
           </div>
        </div>
      )}

      {/* Projects */}
      {projects.length > 0 && (
        <div>
           <h3 className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-4 border-b border-white/5 pb-2">Top Projects</h3>
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projects.slice(0, 4).map((project) => (
                <div key={project.id} className="p-4 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-colors group">
                   <div className="flex justify-between items-start mb-2">
                      <h4 className="text-sm font-bold text-white group-hover:text-[#ADFF2F] transition-colors truncate pr-4">{project.name}</h4>
                      {project.language && (
                        <div className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 whitespace-nowrap">
                          {project.language}
                        </div>
                      )}
                   </div>
                   <p className="text-xs text-zinc-400 mb-3 leading-relaxed line-clamp-2">
                      {project.description || "No description provided."}
                   </p>
                   <div className="flex gap-3 text-[10px] font-bold text-zinc-500">
                      <span className="flex items-center gap-1"><Star className="w-3 h-3" /> {project.stars}</span>
                      <span className="flex items-center gap-1"><GitFork className="w-3 h-3" /> {project.forks}</span>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}
    </div>
  );
}
