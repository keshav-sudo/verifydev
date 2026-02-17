"use client"

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity,
  Calendar, XCircle,
  Briefcase, MapPin, 
  MoreHorizontal, Filter,
  Sparkles, Award
} from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { useUserStore } from '@/store/user-store'
import Link from 'next/link'
import { cn } from '@/lib/utils'

// ━━━ MOCK DATA ━━━
const MOCK_JOBS = [
  { 
    id: 1, 
    company: 'Google', 
    role: 'Senior Backend Engineer', 
    location: 'Mountain View, CA', 
    salary: '$180k – $250k', 
    status: 'SHORTLISTED', 
    logo: 'https://logo.clearbit.com/google.com', 
    match: 94, 
    appliedDate: 'Feb 10',
    trend: 'up'
  },
  { 
    id: 2, 
    company: 'Stripe', 
    role: 'Go Developer', 
    location: 'San Francisco, CA', 
    salary: '$170k – $230k', 
    status: 'INTERVIEW', 
    logo: 'https://logo.clearbit.com/stripe.com', 
    match: 89, 
    appliedDate: 'Feb 12',
    trend: 'up'
  },
  { 
    id: 3, 
    company: 'Vercel', 
    role: 'Full Stack Engineer', 
    location: 'Remote', 
    salary: '$160k – $220k', 
    status: 'PENDING', 
    logo: 'https://logo.clearbit.com/vercel.com', 
    match: 87, 
    appliedDate: 'Feb 13',
    trend: 'neutral'
  },
  { 
    id: 4, 
    company: 'Netflix', 
    role: 'Backend Systems Engineer', 
    location: 'Los Gatos, CA', 
    salary: '$190k – $280k', 
    status: 'REJECTED', 
    logo: 'https://logo.clearbit.com/netflix.com', 
    match: 76, 
    appliedDate: 'Feb 08',
    trend: 'down'
  },
]

const STATUS_STYLES = {
  SHORTLISTED: { label: 'Shortlisted', bg: 'bg-emerald-500/10', text: 'text-emerald-600', dot: 'bg-emerald-500' },
  INTERVIEW: { label: 'Interview', bg: 'bg-purple-500/10', text: 'text-purple-600', dot: 'bg-purple-500' },
  PENDING: { label: 'Pending', bg: 'bg-amber-500/10', text: 'text-amber-600', dot: 'bg-amber-500' },
  REJECTED: { label: 'Rejected', bg: 'bg-red-500/10', text: 'text-red-600', dot: 'bg-red-500' },
} as const

export default function JobHuntDashboard() {
  const { user } = useAuthStore()
  const { aura, fetchAura } = useUserStore()

  useEffect(() => {
    if (user) fetchAura()
  }, [user, fetchAura])

  if (!user) return null

  const totalAura = aura?.total || 397
  const auraBreakdown = aura?.breakdown || { profile: 25, projects: 91, skills: 150, activity: 100, github: 31 }

  // ━━━ VISUAL COMPONENT: SPARKLINE ━━━
  const Sparkline = ({ color = "green" }: { color?: "green" | "red" | "gray" }) => (
    <svg width="60" height="24" viewBox="0 0 60 24" fill="none" className="opacity-80">
      <path 
        d="M2 12C2 12 10 18 18 12C26 6 34 18 42 12C50 6 58 12 58 12" 
        stroke={color === "green" ? "#10B981" : color === "red" ? "#EF4444" : "#9CA3AF"} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
      />
    </svg>
  )

  return (
    <div className="min-h-screen bg-white font-['Plus_Jakarta_Sans'] text-gray-900 pb-20">
      
      <main className="max-w-[1600px] mx-auto px-6">
        
        {/* ━━━ GRID LAYOUT ━━━ */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 w-full">
          
          {/* ━━━ LEFT COLUMN (JOBS) ━━━ */}
          <div className="col-span-1 lg:col-span-9 flex flex-col gap-10 min-w-0">
            
            {/* 1. TOP STATS ROW */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {[
                { label: 'Total Applications', value: '24', icon: Briefcase, trend: 'green' },
                { label: 'Response Rate', value: '42%', icon: Activity, trend: 'green' },
                { label: 'Interviews', value: '7', icon: Calendar, trend: 'green' },
                { label: 'Rejected', value: '12', icon: XCircle, trend: 'red' },
              ].map((stat, i) => (
                <div key={i} className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[160px] group hover:shadow-[0_8px_30px_rgba(0,0,0,0.04)] transition-all duration-300">
                  <div className="flex justify-between items-start">
                    <div className="p-2.5 rounded-xl bg-gray-50 text-gray-900 group-hover:bg-gray-900 group-hover:text-white transition-colors duration-300">
                      <stat.icon className="w-5 h-5" />
                    </div>
                    <Sparkline color={stat.trend as "green" | "red"} />
                  </div>
                  <div>
                    <h3 className="text-3xl font-bold tracking-tight text-gray-900 mb-1">{stat.value}</h3>
                    <p className="text-sm font-medium text-gray-400 group-hover:text-gray-500 transition-colors">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* 2. APPLIED JOBS LIST */}
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-[0_2px_15px_rgba(0,0,0,0.02)] overflow-hidden flex flex-col min-h-0">
              <div className="px-8 py-6 border-b border-gray-50 flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-1">Active Applications</h2>
                  <p className="text-sm text-gray-400">Track and manage your job search progress</p>
                </div>
                <div className="flex gap-3">
                  <button className="px-4 py-2 rounded-full border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 flex items-center gap-2 transition-colors">
                    <Filter className="w-4 h-4" /> Filter
                  </button>
                  <button className="px-4 py-2 rounded-full bg-gray-900 text-white text-sm font-semibold hover:bg-gray-800 transition-colors">
                    + Manual Entry
                  </button>
                </div>
              </div>

              <div className="divide-y divide-gray-50 overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead className="bg-gray-50/50">
                    <tr>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Company</th>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Role</th>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Status</th>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Match</th>
                      <th className="px-8 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Date</th>
                      <th className="px-8 py-4 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Action</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {MOCK_JOBS.map((job) => {
                      const statusStyle = STATUS_STYLES[job.status as keyof typeof STATUS_STYLES]
                      return (
                        <tr key={job.id} className="group hover:bg-gray-50/50 transition-colors">
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 rounded-xl bg-white border border-gray-100 shadow-sm flex items-center justify-center p-1.5 flex-shrink-0">
                                {/* Using clearbit logo API for demo - in prod use next/image */}
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img src={job.logo} alt={job.company} className="w-full h-full object-contain rounded-lg opacity-90 group-hover:opacity-100 transition-opacity" onError={(e) => (e.currentTarget.src = 'https://ui-avatars.com/api/?name=' + job.company)} />
                              </div>
                              <span className="font-bold text-gray-900">{job.company}</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex flex-col">
                              <span className="font-semibold text-gray-900">{job.role}</span>
                              <span className="text-xs text-gray-400 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3" /> {job.location}
                              </span>
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <span className={cn("inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold", statusStyle.bg, statusStyle.text)}>
                              <span className={cn("w-1.5 h-1.5 rounded-full", statusStyle.dot)} />
                              {statusStyle.label}
                            </span>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                <div className="h-full bg-gray-900 rounded-full" style={{ width: `${job.match}%` }} />
                              </div>
                              <span className="text-xs font-bold text-gray-900">{job.match}%</span>
                            </div>
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-sm font-medium text-gray-400">
                            {job.appliedDate}
                          </td>
                          <td className="px-8 py-6 whitespace-nowrap text-right">
                            <button className="p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-900 transition-colors">
                              <MoreHorizontal className="w-5 h-5" />
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </div>

          </div>

          {/* ━━━ RIGHT COLUMN (AURA SIDEBAR) ━━━ */}
          <div className="col-span-1 lg:col-span-3 min-w-0">
            <div className="sticky top-24 bg-[#0A0A0A] rounded-[40px] p-8 text-white shadow-2xl border border-white/5 overflow-hidden">
              
              {/* Glow Effects */}
              <div className="absolute -top-20 -right-20 w-64 h-64 bg-[#ADFF2F]/10 rounded-full blur-[80px]" />
              <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#0A0A0A] to-transparent z-10" />

              <div className="relative z-20 flex flex-col items-center text-center">
                
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-6">
                  <Award className="w-6 h-6 text-[#ADFF2F]" />
                </div>
                
                <h3 className="text-lg font-bold text-white mb-1">Global Aura</h3>
                <p className="text-xs font-medium text-gray-500 uppercase tracking-widest mb-10">Developer Score</p>
                
                {/* Aura Ring */}
                <div className="relative w-48 h-48 mb-10">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle cx="96" cy="96" r="88" strokeWidth="4" stroke="#ffffff10" fill="none" />
                    <circle 
                      cx="96" cy="96" r="88" strokeWidth="4" 
                      stroke="#ADFF2F" fill="none"
                      strokeDasharray={`${2 * Math.PI * 88 * (totalAura / 1000)} ${2 * Math.PI * 88}`}
                      strokeLinecap="round"
                      style={{ filter: 'drop-shadow(0 0 8px rgba(173, 255, 47, 0.5))' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-5xl font-black tracking-tighter text-white drop-shadow-[0_0_15px_rgba(173,255,47,0.4)]">
                      {totalAura}
                    </span>
                    <span className="text-[10px] font-bold text-[#ADFF2F] uppercase tracking-wider mt-1">Top 5%</span>
                  </div>
                </div>

                {/* Breakdown List */}
                <div className="w-full space-y-5 mb-8">
                  {Object.entries(auraBreakdown).map(([key, value]) => (
                    <div key={key} className="flex flex-col gap-1.5">
                      <div className="flex justify-between text-xs font-medium">
                        <span className="text-gray-400 capitalize">{key}</span>
                        <span className="text-white">{value as number}</span>
                      </div>
                      <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
                        <motion.div 
                          initial={{ width: 0 }}
                          animate={{ width: `${Math.min((value as number) / 2, 100)}%` }}
                          className="h-full bg-[#ADFF2F] rounded-full opacity-80"
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <Link 
                  href="/profile" 
                  className="w-full py-4 rounded-full bg-white text-black text-sm font-bold hover:bg-gray-200 transition-colors flex items-center justify-center gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  View Analytics
                </Link>
                
              </div>
            </div>
          </div>
          
        </div>
      </main>
    </div>
  )
}
