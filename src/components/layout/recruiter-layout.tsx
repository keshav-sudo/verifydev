"use client"

/**
 * Recruiter Layout - TOP NAVBAR (matches main dashboard)
 * No sidebar — horizontal navigation with centered content
 */

import { useRef, useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useRecruiterStore } from '@/store/recruiter-store'
import { cn, getInitials } from '@/lib/utils'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  LayoutDashboard,
  Briefcase,
  Plus,
  Settings,
  Menu,
  Building,
  LogOut,
  MessageSquare,
  Users,
  Zap,
  ChevronDown,
  X,
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/recruiter/dashboard', icon: LayoutDashboard },
  { name: 'Jobs', href: '/recruiter/jobs', icon: Briefcase },
  { name: 'Candidates', href: '/recruiter/candidates', icon: Users },
  { name: 'Post Job', href: '/recruiter/post-job', icon: Plus },
  { name: 'Messages', href: '/recruiter/messages', icon: MessageSquare },
  { name: 'Settings', href: '/recruiter/settings', icon: Settings },
]

interface RecruiterLayoutProps {
  children: React.ReactNode
}

export default function RecruiterLayout({ children }: RecruiterLayoutProps) {
  const { recruiter, logout } = useRecruiterStore()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  // Reset scroll & close menu on navigation
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0
    setMobileMenuOpen(false)
  }, [pathname])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined' && window.innerWidth >= 1024) setMobileMenuOpen(false)
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  const handleLogout = () => {
    logout()
    router.push('/recruiter/login')
  }

  // Get recruiter info safely
  const recruiterData = recruiter as any
  const recruiterName = recruiterData?.name || 'Recruiter'
  const recruiterEmail = recruiterData?.email || ''
  const organizationName = recruiterData?.organization?.name || recruiterData?.companyName || 'Organization'

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] flex flex-col font-sans">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* TOP NAVBAR */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0A0A0A] shadow-sm">
        <div className="max-w-[2000px] mx-auto px-6 relative">
          <div className="flex items-center justify-between h-16">

            {/* Left: Brand */}
            <div className="flex items-center gap-2 cursor-pointer shrink-0 min-w-[200px]" onClick={() => router.push('/recruiter/dashboard')}>
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shadow-md border border-white/5 ring-1 ring-white/5">
                <Zap className="w-5 h-5 text-[#ffffff] fill-[#ffffff]" />
              </div>
              <div className="hidden sm:flex flex-col">
                <span className="text-xl font-bold tracking-tight text-white leading-none">VerifyDev</span>
                <span className="text-[8px] font-extrabold text-[#ADFF2F] uppercase tracking-[0.15em] mt-0.5">Recruiter Portal</span>
              </div>
            </div>

            {/* Center: Navigation Links */}
            <nav className="hidden lg:flex flex-1 items-center justify-center gap-8">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== '/recruiter/dashboard' && pathname?.startsWith(item.href))
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-2 px-1 py-1 text-sm font-medium transition-colors duration-200",
                      isActive ? "text-[#ADFF2F]" : "text-gray-400 hover:text-white"
                    )}
                  >
                    <item.icon className={cn("w-4 h-4", isActive && "stroke-[2.5px] drop-shadow-[0_0_8px_rgba(173,255,47,0.5)]")} />
                    <span className={cn(isActive && "drop-shadow-[0_0_8px_rgba(173,255,47,0.3)]")}>{item.name}</span>
                    {isActive && (
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#ADFF2F] shadow-[0_0_8px_#ADFF2F]" />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Right: User Actions */}
            <div className="flex items-center justify-end gap-3 min-w-[200px]">
              {/* Organization Badge (Desktop) */}
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 text-gray-300">
                <Building className="w-3.5 h-3.5 text-gray-400" />
                <span className="text-xs font-bold truncate max-w-[120px]">{organizationName}</span>
              </div>

              {/* User Profile Dropdown */}
              <div
                className="hidden lg:flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full bg-white/10 cursor-pointer hover:bg-white/20 transition-colors"
                onClick={() => router.push('/recruiter/settings')}
              >
                <Avatar className="w-7 h-7 rounded-full border-2 border-white/10">
                  <AvatarImage src={recruiterData?.avatarUrl || undefined} />
                  <AvatarFallback className="bg-[#ADFF2F] text-black text-[10px] font-bold">
                    {getInitials(recruiterName)}
                  </AvatarFallback>
                </Avatar>
                <div className="text-left">
                  <div className="text-xs font-semibold text-white leading-none">{recruiterName.split(' ')[0]}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">Recruiter</div>
                </div>
                <ChevronDown className="w-3 h-3 text-gray-400" />
              </div>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors"
                onClick={() => setMobileMenuOpen(true)}
              >
                <Menu className="w-4 h-4 text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Drawer */}
      <div className={cn(
        "fixed inset-y-0 right-0 z-50 w-60 bg-white shadow-2xl transform transition-transform duration-300 lg:hidden",
        mobileMenuOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              <Avatar className="w-8 h-8 rounded-full">
                <AvatarImage src={recruiterData?.avatarUrl || undefined} />
                <AvatarFallback className="bg-[#ADFF2F] text-black text-xs font-bold">
                  {getInitials(recruiterName)}
                </AvatarFallback>
              </Avatar>
              <div>
                <div className="text-xs font-bold text-gray-900">{recruiterName}</div>
                <div className="text-[10px] text-gray-500">{recruiterEmail}</div>
              </div>
            </div>
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Organization (Mobile) */}
          <div className="p-3 bg-gray-50 border-b border-gray-200">
            <div className="flex items-center gap-2 text-gray-600">
              <Building className="w-4 h-4" />
              <span className="text-xs font-bold truncate">{organizationName}</span>
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== '/recruiter/dashboard' && pathname?.startsWith(item.href))
              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-all",
                    isActive
                      ? "bg-black text-white"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  )}
                >
                  <item.icon className={cn("w-4 h-4", isActive && "stroke-[2.5px]")} />
                  <span>{item.name}</span>
                </Link>
              )
            })}
          </nav>

          {/* Logout */}
          <div className="p-3 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium text-red-600 hover:bg-red-50 w-full transition-all"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        <div ref={scrollRef} className="w-full overflow-y-auto">
          <div className="w-full h-full p-0">
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
