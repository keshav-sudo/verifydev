"use client"

/**
 * Unified Auth Page - Developer & Recruiter Login/Signup
 * Single entry point for authentication with role-based tabs
 * Redesigned to match VerifyDev dark premium theme
 */
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Mail,
  ArrowLeft,
  Github,
  Loader2,
  Code2,
  Check,
  Building,
  Lock,
  User,
  Globe,
  Briefcase,
  AlertCircle,
  ArrowRight
} from 'lucide-react'
import { useAuthStore } from '@/store/auth-store'
import { useRecruiterStore } from '@/store/recruiter-store'
import { cn } from '@/lib/utils'

type AuthStep = 'email' | 'otp'
type AuthMode = 'login' | 'signup'
type UserRole = 'developer' | 'recruiter'

// Google Icon SVG
const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
)



export default function AuthPage() {
  const router = useRouter()
  const { login: devLogin, setTokens, checkAuth } = useAuthStore()
  const { login: recruiterLogin, register: recruiterRegister, isLoading: recruiterLoading, error: recruiterError, clearError } = useRecruiterStore()

  // State
  const [role, setRole] = useState<UserRole>('developer')
  const [step, setStep] = useState<AuthStep>('email')
  const [mode, setMode] = useState<AuthMode>('login')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  // Developer form
  const [email, setEmail] = useState('')
  const [otp, setOtp] = useState('')

  // Recruiter form - matches backend schema
  const [recruiterForm, setRecruiterForm] = useState({
    email: '',
    password: '',
    name: '',
    organizationName: '',
    organizationWebsite: '',
    position: '',
    industry: '',
    organizationSize: '',
  })

  const API_URL = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://api.verifydev.me'

  // Handle role switch
  const handleRoleSwitch = (newRole: UserRole) => {
    setRole(newRole)
    setStep('email')
    setMode('login')
    setError('')
    setSuccess('')
    clearError()
  }

  // Developer: Request OTP
  const handleRequestOtp = async (e?: React.FormEvent) => {
    if (e) e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)

    try {
      if (!email || !email.includes('@')) {
        setError('Please enter a valid email address')
        setLoading(false)
        return
      }

      const response = await fetch(`${API_URL}/api/v1/auth/otp/request-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, type: mode }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send OTP')
      }

      setSuccess('OTP sent! Check your email')
      setStep('otp')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send OTP')
    } finally {
      setLoading(false)
    }
  }

  // Developer: Verify OTP
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!otp || otp.length !== 4) {
        setError('Please enter a valid 4-digit OTP')
        setLoading(false)
        return
      }

      const response = await fetch(`${API_URL}/api/v1/auth/otp/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, type: mode }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Invalid OTP')
      }

      setTokens(data.accessToken, data.refreshToken)
      await checkAuth()

      if (mode === 'signup') {
        router.push('/connect-platforms')
      } else {
        router.push('/dashboard')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify OTP')
    } finally {
      setLoading(false)
    }
  }

  // Developer: OAuth handlers
  const handleGitHubLogin = () => {
    devLogin()
  }

  const handleGoogleLogin = () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL || process.env.NEXT_PUBLIC_GATEWAY_URL || 'https://api.verifydev.me'
    window.location.href = `${apiUrl}/api/v1/auth/google`
  }



  // Recruiter: Form submit
  const handleRecruiterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    try {
      if (mode === 'login') {
        await recruiterLogin(recruiterForm.email, recruiterForm.password)
      } else {
        await recruiterRegister(recruiterForm)
      }
      router.push('/recruiter/dashboard')
    } catch {
      // Error handled by store
    }
  }

  const handleRecruiterInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setRecruiterForm(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const currentLoading = role === 'developer' ? loading : recruiterLoading
  const currentError = role === 'developer' ? error : recruiterError

  // Shared dark input classes
  const inputClasses = "w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-slate-700/80 rounded-lg focus:border-[#ADFF2F]/50 focus:ring-1 focus:ring-[#ADFF2F]/30 outline-none transition text-white placeholder:text-slate-500 text-sm font-medium"
  const selectClasses = "w-full pl-10 pr-4 py-3 bg-white/[0.04] border border-slate-700/80 rounded-lg focus:border-[#ADFF2F]/50 focus:ring-1 focus:ring-[#ADFF2F]/30 outline-none transition text-white appearance-none text-sm font-medium"

  return (
    <div className="min-h-screen bg-[#050505] flex items-center justify-center p-4 font-['Plus_Jakarta_Sans'] relative overflow-hidden selection:bg-[#ADFF2F] selection:text-black">

      {/* SUBTLE GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff04_1px,transparent_1px),linear-gradient(to_bottom,#ffffff04_1px,transparent_1px)] bg-[size:48px_48px] pointer-events-none" />

      {/* AMBIENT GLOW */}
      <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] bg-[#ADFF2F]/[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-30%] left-[-10%] w-[500px] h-[500px] bg-[#ADFF2F]/[0.02] rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute top-[40%] left-[50%] w-[300px] h-[300px] bg-[#A78BFA]/[0.02] rounded-full blur-[80px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 w-full max-w-md"
      >
        {/* Logo */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1">
            <span className="text-2xl font-black text-white tracking-tight">
              Verify<span className="text-[#ADFF2F]">Dev</span>
            </span>
          </Link>
          <div className="flex items-center justify-center gap-2 mt-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#ADFF2F] animate-pulse" />
            <span className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">Secure Authentication</span>
          </div>
        </div>

        {/* Main Card */}
        <div className="bg-[#0A0A0A] border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden">
          {/* Card glow accent */}
          <div className="absolute top-0 right-0 w-48 h-48 bg-[#ADFF2F]/[0.04] rounded-full blur-[60px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-[#A78BFA]/[0.03] rounded-full blur-[40px] pointer-events-none" />

          {/* Role Switcher - TOP TABS */}
          <div className="relative z-10 flex gap-1 p-1 bg-white/[0.04] border border-slate-800 rounded-lg mb-6">
            <button
              onClick={() => handleRoleSwitch('developer')}
              className={cn(
                'flex-1 py-2.5 px-4 rounded-md text-xs font-extrabold transition-all flex items-center justify-center gap-2 uppercase tracking-wider',
                role === 'developer'
                  ? 'bg-white/10 text-white shadow-sm border border-white/10'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <Code2 className="w-3.5 h-3.5" />
              Developer
            </button>
            <button
              onClick={() => handleRoleSwitch('recruiter')}
              className={cn(
                'flex-1 py-2.5 px-4 rounded-md text-xs font-extrabold transition-all flex items-center justify-center gap-2 uppercase tracking-wider',
                role === 'recruiter'
                  ? 'bg-white/10 text-white shadow-sm border border-white/10'
                  : 'text-slate-500 hover:text-slate-300'
              )}
            >
              <Building className="w-3.5 h-3.5" />
              Recruiter
            </button>
          </div>

          {/* Content based on role */}
          <AnimatePresence mode="wait">
            {role === 'developer' ? (
              <motion.div
                key="developer"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="relative z-10"
              >
                {/* Sign In / Sign Up Tabs */}
                <div className="flex gap-1 p-1 bg-white/[0.03] rounded-lg mb-6">
                  <button
                    onClick={() => { setMode('login'); setStep('email'); setError(''); setSuccess(''); }}
                    className={cn(
                      'flex-1 py-2 px-4 rounded-md text-xs font-bold transition-all',
                      mode === 'login'
                        ? 'bg-white/10 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-300'
                    )}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setMode('signup'); setStep('email'); setError(''); setSuccess(''); }}
                    className={cn(
                      'flex-1 py-2 px-4 rounded-md text-xs font-bold transition-all',
                      mode === 'signup'
                        ? 'bg-white/10 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-300'
                    )}
                  >
                    Sign Up
                  </button>
                </div>

                <h2 className="text-xl font-black text-white mb-1 tracking-tight">
                  {mode === 'login' ? 'Welcome back!' : 'Create your account'}
                </h2>
                <p className="text-sm text-slate-500 mb-6 font-medium">
                  {mode === 'login'
                    ? 'Sign in to access your developer profile'
                    : 'Join VerifyDev and showcase your verified skills'}
                </p>

                {/* OAuth Buttons */}
                <div className="space-y-3 mb-6">
                  <button
                    type="button"
                    className="w-full h-11 flex items-center justify-center gap-3 bg-white/[0.04] border border-slate-700/80 rounded-lg text-white text-sm font-bold hover:bg-white/[0.08] hover:border-slate-600 transition-all duration-200"
                    onClick={handleGitHubLogin}
                  >
                    <Github className="w-5 h-5" />
                    Continue with GitHub
                  </button>

                  <button
                    type="button"
                    className="w-full h-11 flex items-center justify-center gap-3 bg-white/[0.04] border border-slate-700/80 rounded-lg text-white text-sm font-bold hover:bg-white/[0.08] hover:border-slate-600 transition-all duration-200"
                    onClick={handleGoogleLogin}
                  >
                    <GoogleIcon />
                    Continue with Google
                  </button>
                </div>

                {/* Divider */}
                <div className="relative flex items-center my-6">
                  <div className="flex-grow border-t border-slate-800"></div>
                  <span className="px-3 text-[10px] text-slate-600 uppercase font-extrabold tracking-widest">or continue with email</span>
                  <div className="flex-grow border-t border-slate-800"></div>
                </div>

                {/* Email OTP Form */}
                {step === 'email' ? (
                  <form onSubmit={handleRequestOtp} className="space-y-4">
                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 mb-2 uppercase tracking-widest">
                        Email Address
                      </label>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          placeholder="you@example.com"
                          className={inputClasses}
                          required
                        />
                      </div>
                    </div>

                    {currentError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        {currentError}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full h-11 bg-[#ADFF2F] text-black font-extrabold text-sm rounded-lg hover:bg-[#9AE62A] transition-all duration-300 hover:shadow-[0_0_24px_rgba(173,255,47,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wider"
                      disabled={currentLoading}
                    >
                      {currentLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>Send OTP <ArrowRight className="w-3.5 h-3.5" /></>
                      )}
                    </button>
                  </form>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <button
                      type="button"
                      onClick={() => { setStep('email'); setOtp(''); setError(''); }}
                      className="flex items-center gap-2 text-xs text-slate-500 hover:text-white transition font-bold"
                    >
                      <ArrowLeft className="w-3.5 h-3.5" />
                      Change email
                    </button>

                    <div className="p-3 bg-white/[0.04] border border-slate-800 rounded-lg flex items-center gap-3">
                      <Mail className="w-4 h-4 text-[#ADFF2F]" />
                      <div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">OTP sent to</p>
                        <p className="text-sm font-bold text-white">{email}</p>
                      </div>
                    </div>

                    {success && (
                      <div className="p-3 bg-[#ADFF2F]/10 border border-[#ADFF2F]/20 rounded-lg text-[#ADFF2F] text-xs font-bold flex items-center gap-2">
                        <Check className="w-3.5 h-3.5" />
                        {success}
                      </div>
                    )}

                    <div>
                      <label className="block text-[10px] font-extrabold text-slate-400 mb-2 uppercase tracking-widest">
                        Enter OTP
                      </label>
                      <input
                        type="text"
                        maxLength={4}
                        value={otp}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                        placeholder="1234"
                        className="w-full px-4 py-3 bg-white/[0.04] border border-slate-700/80 rounded-lg focus:border-[#ADFF2F]/50 focus:ring-1 focus:ring-[#ADFF2F]/30 outline-none text-center text-2xl tracking-[0.5em] font-mono text-white placeholder:text-slate-600 transition"
                        autoFocus
                      />

                    </div>

                    {currentError && (
                      <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-xs font-bold flex items-center gap-2">
                        <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                        {currentError}
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full h-11 bg-[#ADFF2F] text-black font-extrabold text-sm rounded-lg hover:bg-[#9AE62A] transition-all duration-300 hover:shadow-[0_0_24px_rgba(173,255,47,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wider"
                      disabled={currentLoading || otp.length !== 4}
                    >
                      {currentLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <>Verify & Continue <ArrowRight className="w-3.5 h-3.5" /></>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleRequestOtp()}
                      disabled={currentLoading}
                      className="w-full text-center text-xs text-[#ADFF2F] hover:text-[#c8ff60] font-bold transition"
                    >
                      Resend OTP
                    </button>
                  </form>
                )}
              </motion.div>
            ) : (
              <motion.div
                key="recruiter"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="relative z-10"
              >
                {/* Sign In / Sign Up Tabs */}
                <div className="flex gap-1 p-1 bg-white/[0.03] rounded-lg mb-6">
                  <button
                    onClick={() => { setMode('login'); clearError(); }}
                    className={cn(
                      'flex-1 py-2 px-4 rounded-md text-xs font-bold transition-all',
                      mode === 'login'
                        ? 'bg-white/10 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-300'
                    )}
                  >
                    Sign In
                  </button>
                  <button
                    onClick={() => { setMode('signup'); clearError(); }}
                    className={cn(
                      'flex-1 py-2 px-4 rounded-md text-xs font-bold transition-all',
                      mode === 'signup'
                        ? 'bg-white/10 text-white shadow-sm'
                        : 'text-slate-500 hover:text-slate-300'
                    )}
                  >
                    Sign Up
                  </button>
                </div>

                <h2 className="text-xl font-black text-white mb-1 tracking-tight">
                  {mode === 'login' ? 'Recruiter Login' : 'Create Recruiter Account'}
                </h2>
                <p className="text-sm text-slate-500 mb-6 font-medium">
                  {mode === 'login'
                    ? 'Access verified developer talent'
                    : 'Start finding the best developers'}
                </p>

                {currentError && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold flex items-center gap-2"
                  >
                    <AlertCircle className="h-3.5 w-3.5 flex-shrink-0" />
                    {currentError}
                  </motion.div>
                )}

                <form onSubmit={handleRecruiterSubmit} className="space-y-3">
                  {mode === 'signup' && (
                    <>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                          type="text"
                          name="name"
                          placeholder="Your Name *"
                          value={recruiterForm.name}
                          onChange={handleRecruiterInputChange}
                          required
                          className={inputClasses}
                        />
                      </div>

                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                          type="text"
                          name="organizationName"
                          placeholder="Company Name *"
                          value={recruiterForm.organizationName}
                          onChange={handleRecruiterInputChange}
                          required
                          className={inputClasses}
                        />
                      </div>

                      <div className="relative">
                        <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                          type="url"
                          name="organizationWebsite"
                          placeholder="Company Website (https://...) *"
                          value={recruiterForm.organizationWebsite}
                          onChange={handleRecruiterInputChange}
                          required
                          pattern="https?://.+"
                          className={inputClasses}
                        />
                      </div>

                      <div className="relative">
                        <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                        <input
                          type="text"
                          name="position"
                          placeholder="Your Position *"
                          value={recruiterForm.position}
                          onChange={handleRecruiterInputChange}
                          required
                          className={inputClasses}
                        />
                      </div>

                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 z-10" />
                        <select
                          name="industry"
                          value={recruiterForm.industry}
                          onChange={handleRecruiterInputChange}
                          required
                          className={selectClasses}
                        >
                          <option value="" className="bg-[#0A0A0A] text-slate-400">Select Industry *</option>
                          <option value="Technology" className="bg-[#0A0A0A]">Technology</option>
                          <option value="Finance" className="bg-[#0A0A0A]">Finance</option>
                          <option value="Healthcare" className="bg-[#0A0A0A]">Healthcare</option>
                          <option value="Education" className="bg-[#0A0A0A]">Education</option>
                          <option value="E-commerce" className="bg-[#0A0A0A]">E-commerce</option>
                          <option value="Consulting" className="bg-[#0A0A0A]">Consulting</option>
                          <option value="Other" className="bg-[#0A0A0A]">Other</option>
                        </select>
                      </div>

                      <div className="relative">
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 z-10" />
                        <select
                          name="organizationSize"
                          value={recruiterForm.organizationSize}
                          onChange={handleRecruiterInputChange}
                          required
                          className={selectClasses}
                        >
                          <option value="" className="bg-[#0A0A0A] text-slate-400">Select Company Size *</option>
                          <option value="STARTUP" className="bg-[#0A0A0A]">1-10 employees</option>
                          <option value="SMALL" className="bg-[#0A0A0A]">11-50 employees</option>
                          <option value="MEDIUM" className="bg-[#0A0A0A]">51-200 employees</option>
                          <option value="LARGE" className="bg-[#0A0A0A]">201-1000 employees</option>
                          <option value="ENTERPRISE" className="bg-[#0A0A0A]">1000+ employees</option>
                        </select>
                      </div>
                    </>
                  )}

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email Address"
                      value={recruiterForm.email}
                      onChange={handleRecruiterInputChange}
                      required
                      className={inputClasses}
                    />
                  </div>

                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500" />
                    <input
                      type="password"
                      name="password"
                      placeholder="Password"
                      value={recruiterForm.password}
                      onChange={handleRecruiterInputChange}
                      required
                      minLength={8}
                      className={inputClasses}
                    />
                  </div>

                  <button
                    type="submit"
                    className="w-full h-11 bg-[#ADFF2F] text-black font-extrabold text-sm rounded-lg hover:bg-[#9AE62A] transition-all duration-300 hover:shadow-[0_0_24px_rgba(173,255,47,0.3)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 uppercase tracking-wider mt-2"
                    disabled={currentLoading}
                  >
                    {currentLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                      </>
                    ) : (
                      <>
                        {mode === 'login' ? 'Sign In' : 'Create Account'}
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Footer */}
          <p className="relative z-10 text-[10px] text-center text-slate-600 mt-6 font-medium">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-[#ADFF2F]/70 hover:text-[#ADFF2F] hover:underline transition">Terms</Link>
            {' '}and{' '}
            <Link href="/privacy" className="text-[#ADFF2F]/70 hover:text-[#ADFF2F] hover:underline transition">Privacy Policy</Link>
          </p>
        </div>

        {/* Back link */}
        <div className="text-center mt-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs text-slate-600 hover:text-white transition font-bold"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Home
          </Link>
        </div>
      </motion.div>
    </div>
  )
}
