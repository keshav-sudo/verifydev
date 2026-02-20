"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRecruiterStore } from '@/store/recruiter-store'
import { useUIStore } from '@/store/ui-store'
import { put, del } from '@/api/client'
import { toast } from '@/hooks/use-toast'
import { cn, getInitials } from '@/lib/utils'
import {
  Settings as SettingsIcon,
  User,
  Bell,
  Palette,
  Shield,
  Moon,
  Sun,
  Monitor,
  Mail,
  MapPin,
  Building,
  Globe,
  Trash2,
  Download,
  AlertTriangle,
  Check,
  Loader2,
  LogOut,
  Layers,
} from 'lucide-react'
import { Switch } from '@/components/ui/switch'

type SettingsSection = 'profile' | 'appearance' | 'notifications' | 'danger'

const sections = [
  { id: 'profile' as const, label: 'Profile', icon: User },
  { id: 'appearance' as const, label: 'Appearance', icon: Palette },
  { id: 'notifications' as const, label: 'Notifications', icon: Bell },
  { id: 'danger' as const, label: 'Danger Zone', icon: AlertTriangle },
]

export default function RecruiterSettings() {
  const router = useRouter()
  const { recruiter, logout } = useRecruiterStore()
  const { theme, setTheme } = useUIStore()
  const queryClient = useQueryClient()

  const [activeSection, setActiveSection] = useState<SettingsSection>('profile')

  const recruiterData = recruiter as any
  const recruiterName = recruiterData?.name || ''
  const recruiterEmail = recruiterData?.email || ''
  const organizationName = recruiterData?.organization?.name || recruiterData?.companyName || ''

  const [profile, setProfile] = useState({
    name: recruiterName,
    email: recruiterEmail,
    company: organizationName,
    location: recruiterData?.location || '',
    website: recruiterData?.website || '',
    phone: recruiterData?.phone || '',
  })

  const [notifications, setNotifications] = useState({
    emailNewApplication: true,
    emailCandidateMatch: true,
    emailWeeklyDigest: false,
  })

  useEffect(() => {
    if (recruiter) {
      setProfile({
        name: recruiterData?.name || '',
        email: recruiterData?.email || '',
        company: recruiterData?.organization?.name || recruiterData?.companyName || '',
        location: recruiterData?.location || '',
        website: recruiterData?.website || '',
        phone: recruiterData?.phone || '',
      })
    }
  }, [recruiter])

  const updateProfileMutation = useMutation({
    mutationFn: (data: typeof profile) => put('/v1/recruiters/profile', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recruiter'] })
      toast({ title: 'Profile updated', description: 'Your changes have been saved.' })
    },
    onError: (error: any) => {
      toast({ variant: 'destructive', title: 'Error', description: error?.response?.data?.message || 'Failed to update profile.' })
    },
  })

  const handleSaveProfile = () => updateProfileMutation.mutate(profile)

  const handleLogout = () => {
    logout()
    router.push('/recruiter/login')
  }

  const handleDeleteAccount = () => {
    if (confirm('Are you sure you want to delete your recruiter account? This action cannot be undone.')) {
      del('/v1/recruiters/me').then(() => {
        toast({ title: 'Account deleted' })
        logout()
        router.push('/recruiter/login')
      }).catch(() => {
        toast({ variant: 'destructive', title: 'Error', description: 'Failed to delete account.' })
      })
    }
  }

  return (
    <div className="min-h-screen bg-[#F0F2F5] font-sans pb-20 relative">
      <div className="absolute inset-0 z-0 bg-[radial-gradient(#cbd5e1_1px,transparent_1px)] [background-size:24px_24px] opacity-30 pointer-events-none" />

      <div className="w-full max-w-[1536px] mx-auto px-4 md:px-6 lg:px-8 py-8 relative z-10">

        {/* Dark Hero Header */}
        <div className="w-full bg-[#0A0A0A] rounded-xl p-8 lg:p-10 shadow-xl border border-slate-800 relative overflow-hidden mb-8">
          <div className="absolute top-0 right-0 w-96 h-96 bg-[#ADFF2F]/10 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-64 h-64 bg-purple-500/10 rounded-full blur-[60px] pointer-events-none" />

          <div className="flex items-center gap-4 relative z-10">
            <div className="w-14 h-14 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center">
              <SettingsIcon className="w-7 h-7 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white tracking-tight">Settings</h1>
              <p className="text-sm text-slate-400 font-medium mt-1">Manage your recruiter account and preferences</p>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-6">

          {/* Sidebar / Section Nav */}
          <div className="lg:w-56 flex-shrink-0">
            <div className="lg:sticky lg:top-24 space-y-4">
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <nav className="flex lg:flex-col overflow-x-auto lg:overflow-visible p-2 gap-1">
                  {sections.map((section) => (
                    <button
                      key={section.id}
                      onClick={() => setActiveSection(section.id)}
                      className={cn(
                        "flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-bold transition-all whitespace-nowrap",
                        activeSection === section.id
                          ? "bg-slate-900 text-white"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900",
                        section.id === 'danger' && activeSection !== section.id && "text-red-500 hover:text-red-600 hover:bg-red-50"
                      )}
                    >
                      <section.icon className="w-4 h-4" />
                      {section.label}
                    </button>
                  ))}
                </nav>
              </div>

              {/* Recruiter Card */}
              <div className="hidden lg:block bg-white rounded-xl border border-slate-200 shadow-sm p-4">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-lg bg-[#ADFF2F] flex items-center justify-center text-black text-xs font-black">
                    {getInitials(recruiterName)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-extrabold text-slate-900 truncate">{recruiterName || 'Recruiter'}</div>
                    <div className="text-[10px] text-slate-400 truncate">{recruiterEmail}</div>
                  </div>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 w-full px-3 py-2 rounded-lg text-xs font-bold text-red-500 hover:bg-red-50 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" /> Logout
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 space-y-6">

            {/* Profile Section */}
            {activeSection === 'profile' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-blue-500/10 rounded-md border border-blue-500/20">
                        <User className="w-4 h-4 text-blue-500" />
                      </div>
                      <div>
                        <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">Profile Information</h2>
                        <p className="text-[10px] text-slate-400 mt-0.5">Update your recruiter profile details</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-5">
                    {/* Avatar preview */}
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-xl bg-[#ADFF2F] flex items-center justify-center text-black text-lg font-black">
                        {getInitials(profile.name)}
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-slate-900">{profile.name || 'Your Name'}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{profile.email}</div>
                      </div>
                    </div>

                    <div className="h-px bg-slate-100" />

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5 block">Display Name</label>
                        <input
                          value={profile.name}
                          onChange={(e) => setProfile(p => ({ ...p, name: e.target.value }))}
                          placeholder="Your name"
                          className="w-full h-9 px-3 text-sm rounded-md border border-slate-200 bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5 block">Email</label>
                        <div className="relative">
                          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <input
                            value={profile.email}
                            disabled
                            className="w-full h-9 pl-9 pr-3 text-sm rounded-md border border-slate-200 bg-slate-50 text-slate-500 cursor-not-allowed"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5 block">Company</label>
                        <div className="relative">
                          <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <input
                            value={profile.company}
                            onChange={(e) => setProfile(p => ({ ...p, company: e.target.value }))}
                            placeholder="Company name"
                            className="w-full h-9 pl-9 pr-3 text-sm rounded-md border border-slate-200 bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none transition-colors"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5 block">Location</label>
                        <div className="relative">
                          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                          <input
                            value={profile.location}
                            onChange={(e) => setProfile(p => ({ ...p, location: e.target.value }))}
                            placeholder="City, Country"
                            className="w-full h-9 pl-9 pr-3 text-sm rounded-md border border-slate-200 bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none transition-colors"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5 block">Website</label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                        <input
                          value={profile.website}
                          onChange={(e) => setProfile(p => ({ ...p, website: e.target.value }))}
                          placeholder="https://company.com"
                          className="w-full h-9 pl-9 pr-3 text-sm rounded-md border border-slate-200 bg-white focus:border-slate-400 focus:ring-1 focus:ring-slate-400 outline-none transition-colors"
                        />
                      </div>
                    </div>

                    <div className="flex justify-end pt-2">
                      <button
                        onClick={handleSaveProfile}
                        disabled={updateProfileMutation.isPending}
                        className="h-9 px-6 rounded-md bg-slate-900 text-white text-xs font-extrabold uppercase tracking-widest hover:bg-slate-800 transition-colors disabled:opacity-50 flex items-center gap-2"
                      >
                        {updateProfileMutation.isPending ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5" />
                        )}
                        Save Changes
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Appearance Section */}
            {activeSection === 'appearance' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-purple-500/10 rounded-md border border-purple-500/20">
                        <Palette className="w-4 h-4 text-purple-500" />
                      </div>
                      <div>
                        <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">Appearance</h2>
                        <p className="text-[10px] text-slate-400 mt-0.5">Customize how the platform looks</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6">
                    <h3 className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-4">Theme Preference</h3>
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      {[
                        { id: 'light', label: 'Light', desc: 'Clean & bright', icon: Sun, bg: 'bg-gradient-to-br from-white to-gray-100 border-gray-200', iconColor: 'text-yellow-500' },
                        { id: 'dark', label: 'Dark', desc: 'Easy on eyes', icon: Moon, bg: 'bg-gradient-to-br from-zinc-900 to-zinc-800 border-zinc-700', iconColor: 'text-blue-400' },
                        { id: 'neutral', label: 'Neutral', desc: 'Modern Slate', icon: Layers, bg: 'bg-gradient-to-br from-slate-900 to-zinc-900 border-slate-700', iconColor: 'text-slate-400' },
                        { id: 'system', label: 'System', desc: 'Match device', icon: Monitor, bg: 'bg-gradient-to-r from-white via-gray-400 to-zinc-900 border-gray-300', iconColor: 'text-slate-500' },
                      ].map((t) => (
                        <button
                          key={t.id}
                          onClick={() => setTheme(t.id as any)}
                          className={cn(
                            "p-4 rounded-xl border-2 transition-all relative text-left",
                            theme === t.id
                              ? "border-slate-900 shadow-lg"
                              : "border-slate-200 hover:border-slate-300"
                          )}
                        >
                          <div className={cn("h-16 w-full rounded-lg border mb-3 flex items-center justify-center", t.bg)}>
                            <t.icon className={cn("w-8 h-8", t.iconColor)} />
                          </div>
                          <div className="text-xs font-extrabold text-slate-900">{t.label}</div>
                          <div className="text-[10px] text-slate-400 mt-0.5">{t.desc}</div>
                          {theme === t.id && (
                            <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-slate-900 flex items-center justify-center">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Notifications Section */}
            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-slate-100">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-amber-500/10 rounded-md border border-amber-500/20">
                        <Bell className="w-4 h-4 text-amber-500" />
                      </div>
                      <div>
                        <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">Notifications</h2>
                        <p className="text-[10px] text-slate-400 mt-0.5">Manage what alerts you receive</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-0">
                    {[
                      { key: 'emailNewApplication', label: 'New Applications', desc: 'Get notified when candidates apply to your jobs', icon: Mail },
                      { key: 'emailCandidateMatch', label: 'Candidate Matches', desc: 'Alerts for candidates matching your job requirements', icon: Shield },
                      { key: 'emailWeeklyDigest', label: 'Weekly Digest', desc: 'Summary of hiring pipeline activity', icon: Bell },
                    ].map((item, i) => (
                      <div key={item.key} className={cn("flex items-center justify-between py-4", i !== 0 && "border-t border-slate-100")}>
                        <div className="flex items-center gap-3">
                          <div className="p-1.5 bg-slate-50 rounded-md border border-slate-200">
                            <item.icon className="w-4 h-4 text-slate-400" />
                          </div>
                          <div>
                            <div className="text-sm font-bold text-slate-900">{item.label}</div>
                            <div className="text-xs text-slate-400 mt-0.5">{item.desc}</div>
                          </div>
                        </div>
                        <Switch
                          checked={(notifications as any)[item.key]}
                          onCheckedChange={(c: boolean) => setNotifications(n => ({ ...n, [item.key]: c }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Danger Zone */}
            {activeSection === 'danger' && (
              <div className="space-y-6">
                <div className="bg-white rounded-xl border border-red-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-5 border-b border-red-100 bg-red-50/50">
                    <div className="flex items-center gap-2.5">
                      <div className="p-1.5 bg-red-500/10 rounded-md border border-red-500/20">
                        <AlertTriangle className="w-4 h-4 text-red-500" />
                      </div>
                      <div>
                        <h2 className="text-xs font-extrabold text-red-600 uppercase tracking-widest">Danger Zone</h2>
                        <p className="text-[10px] text-red-400 mt-0.5">Irreversible and destructive actions</p>
                      </div>
                    </div>
                  </div>
                  <div className="p-6 space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-lg border border-slate-200 bg-slate-50">
                      <div>
                        <div className="text-sm font-bold text-slate-900">Sign Out</div>
                        <div className="text-xs text-slate-400 mt-0.5">Log out of your recruiter account</div>
                      </div>
                      <button
                        onClick={handleLogout}
                        className="h-8 px-4 rounded-md border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 transition-colors flex items-center gap-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5" /> Logout
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-lg border border-red-200 bg-red-50">
                      <div>
                        <div className="text-sm font-bold text-red-600">Delete Account</div>
                        <div className="text-xs text-red-400 mt-0.5">Permanently delete your recruiter account and all data</div>
                      </div>
                      <button
                        onClick={handleDeleteAccount}
                        className="h-8 px-4 rounded-md bg-red-500 text-white text-xs font-bold hover:bg-red-600 transition-colors flex items-center gap-1.5"
                      >
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}
