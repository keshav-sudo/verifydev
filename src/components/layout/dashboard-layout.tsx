"use client"

/**
 * Dashboard Layout - MODERN TOP NAVBAR DESIGN
 * Professional job platform / admin panel style
 * Horizontal navigation with centered content
 */

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'
import { cn } from '@/lib/utils'
// import { Button } from '@/components/ui/button'
// import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  LayoutGrid,
  FolderGit2,
  Briefcase,
  FileText,
  Settings,
  User,
  Menu,
  ScrollText,
  MessageSquare,
  Zap,
  Bell,
  ChevronDown,
  X
} from 'lucide-react'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutGrid, badge: 3 },
  { name: 'Projects', href: '/projects', icon: FolderGit2 },
  { name: 'Resume', href: '/resume', icon: ScrollText },
  { name: 'Jobs', href: '/jobs', icon: Briefcase },
  { name: 'Applications', href: '/applications', icon: FileText },
  { name: 'Messages', href: '/messages', icon: MessageSquare },
  { name: 'Profile', href: '/profile', icon: User },
  { name: 'Settings', href: '/settings', icon: Settings },
]

interface DashboardLayoutProps {
  children: React.ReactNode
}

export default function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user } = useAuthStore()
  const pathname = usePathname()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const scrollRef = useRef<HTMLDivElement>(null)

  // Reset scroll position when route changes
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0
    }
    setMobileMenuOpen(false)
  }, [pathname])

  // Close mobile menu on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (typeof window !== 'undefined' && window.innerWidth >= 1024) {
        setMobileMenuOpen(false)
      }
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
      return () => window.removeEventListener('resize', handleResize)
    }
  }, [])

  return (
    <div className="min-h-screen w-full bg-[#F8F9FA] flex flex-col font-sans">
      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* TOP NAVBAR - Professional Design (SCALED DOWN) */}
      <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#0A0A0A] shadow-sm">
        <div className="max-w-[2000px] mx-auto px-6 relative">
          <div className="flex items-center justify-between h-16">
            
            {/* Left: Brand Logo */}
            <div className="flex items-center gap-2 cursor-pointer shrink-0 min-w-[200px]" onClick={() => router.push('/')}>
              <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center shadow-md border border-white/5 ring-1 ring-white/5">
                <Zap className="w-5 h-5 text-[#ffffff] fill-[#ffffff]" />
              </div>
              <span className="text-xl font-bold tracking-tight text-white hidden sm:block">VerifyDev</span>
            </div>

            {/* Center: Navigation Links */}
            <nav className="hidden lg:flex flex-1 items-center justify-center gap-8">
              {navigation.slice(0, 6).map((item) => {
                const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    className={cn(
                      "group relative flex items-center gap-2 px-1 py-1 text-sm font-medium transition-colors duration-200",
                      isActive 
                        ? "text-[#ADFF2F]" 
                        : "text-gray-400 hover:text-white"
                    )}
                  >
                    <item.icon className={cn("w-4 h-4", isActive && "stroke-[2.5px] drop-shadow-[0_0_8px_rgba(173,255,47,0.5)]")} />
                    <span className={cn(isActive && "drop-shadow-[0_0_8px_rgba(173,255,47,0.3)]")}>{item.name}</span>
                    
                    {/* Active Indicator Dot */}
                    {isActive && (
                      <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-[#ADFF2F] shadow-[0_0_8px_#ADFF2F]" />
                    )}
                  </Link>
                )
              })}
            </nav>

            {/* Right: User Actions */}
            <div className="flex items-center justify-end gap-3 min-w-[200px]">
              {/* Aura Score Badge (Desktop) */}
              <div className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#ADFF2F] text-black">
                <Zap className="w-3.5 h-3.5 fill-black" />
                <span className="text-xs font-bold">{user?.auraScore || '---'}</span>
                <span className="text-[10px] font-medium opacity-70">Aura</span>
              </div>

              {/* Notifications */}
              <button className="relative w-8 h-8 rounded-full bg-white/10 flex items-center justify-center hover:bg-white/20 transition-colors">
                <Bell className="w-4 h-4 text-gray-400" />
                <span className="absolute top-0.5 right-0.5 w-1.5 h-1.5 bg-red-500 rounded-full border border-black" />
              </button>

              {/* User Profile Dropdown */}
              <div className="hidden lg:flex items-center gap-1.5 pl-1.5 pr-2.5 py-1 rounded-full bg-white/10 cursor-pointer hover:bg-white/20 transition-colors" onClick={() => router.push('/profile')}>
                {/* <Avatar className="w-7 h-7 rounded-full border-2 border-white/10">
                  <AvatarImage src={user?.avatarUrl} />
                  <AvatarFallback className="bg-black text-white text-[10px] font-bold">
                    {getInitials(user?.name || '')}
                  </AvatarFallback>
                </Avatar> */}
                <div className="w-7 h-7 rounded-full border-2 border-white/10 bg-gray-500"></div>
                <div className="text-left">
                  <div className="text-xs font-semibold text-white leading-none">{user?.name?.split(' ')[0] || 'User'}</div>
                  <div className="text-[10px] text-gray-400 mt-0.5">{user?.auraLevel || 'Developer'}</div>
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

      {/* Mobile Menu Drawer (SCALED DOWN) */}
      <div className={cn(
        "fixed inset-y-0 right-0 z-50 w-60 bg-white shadow-2xl transform transition-transform duration-300 lg:hidden",
        mobileMenuOpen ? "translate-x-0" : "translate-x-full"
      )}>
        <div className="flex flex-col h-full">
          {/* Mobile Menu Header */}
          <div className="flex items-center justify-between p-3 border-b border-gray-200">
            <div className="flex items-center gap-2">
              {/* <Avatar className="w-8 h-8 rounded-full">
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback className="bg-black text-white text-xs font-bold">
                  {getInitials(user?.name || '')}
                </AvatarFallback>
              </Avatar> */}
              <div className="w-8 h-8 rounded-full bg-gray-500"></div>
              <div>
                <div className="text-xs font-bold text-gray-900">{user?.name || 'User'}</div>
                <div className="text-[10px] text-gray-500">{user?.email}</div>
              </div>
            </div>
            <button 
              onClick={() => setMobileMenuOpen(false)}
              className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200"
            >
              <X className="w-4 h-4 text-gray-600" />
            </button>
          </div>

          {/* Aura Score (Mobile) */}
          <div className="p-3 bg-[#ADFF2F] text-black">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-[10px] font-bold opacity-70 mb-0.5">Global Aura Score</div>
                <div className="text-xl font-extrabold">{user?.auraScore || '---'}</div>
              </div>
              <Zap className="w-10 h-10 opacity-20 fill-black" />
            </div>
          </div>

          {/* Mobile Navigation */}
          <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
            {navigation.map((item) => {
              const isActive = pathname === item.href || pathname?.startsWith(item.href + '/')
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
                  {item.badge && (
                    <span className={cn(
                      "ml-auto w-4 h-4 flex items-center justify-center rounded-full text-[9px] font-bold",
                      isActive ? "bg-[#ADFF2F] text-black" : "bg-gray-200 text-gray-600"
                    )}>
                      {item.badge}
                    </span>
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 w-full">
        <div 
          ref={scrollRef}
          className="w-full overflow-y-auto"
        >
          <div className={cn(
            "w-full h-full p-0"
          )}>
            {children}
          </div>
        </div>
      </main>
    </div>
  )
}
