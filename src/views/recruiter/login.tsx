"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useRecruiterStore } from '@/store/recruiter-store'
import {
  Building,
  Mail,
  Lock,
  User,
  Globe,
  Briefcase,
  Loader2,
  AlertCircle,
  ArrowRight,
  Users,
  Search,
  FileCheck,
  Shield,
} from 'lucide-react'

export default function RecruiterLogin() {
  const router = useRouter()
  const { login, register, isLoading, error, clearError } = useRecruiterStore()

  const [mode, setMode] = useState<'login' | 'register'>('login')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '',
    organizationName: '',
    organizationWebsite: '',
    position: '',
    industry: '',
    organizationSize: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    clearError()

    try {
      if (mode === 'login') {
        await login(formData.email, formData.password)
      } else {
        await register(formData)
      }
      router.push('/recruiter/dashboard')
    } catch {
      // Error is handled by the store
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
  }

  return (
    <div className="min-h-screen flex">
      {/* LEFT PANEL */}
      <div className="hidden lg:flex lg:w-1/2 bg-[#0A0A0A] border-r border-slate-800 relative overflow-hidden flex-col items-center justify-center p-12">
        {/* Decorative blurs */}
        <div className="absolute top-[-120px] left-[-80px] w-72 h-72 bg-[#ADFF2F]/20 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute bottom-[-100px] right-[-60px] w-64 h-64 bg-[#A78BFA]/20 rounded-full blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-md">
          <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-4">
            Recruiter Portal
          </p>
          <h1 className="text-4xl font-black text-white mb-1">VerifyDev</h1>
          <p className="text-lg text-slate-400 mb-10">Recruiter</p>

          <div className="space-y-6">
            <div className="flex items-start gap-4">
              <div className="p-1.5 bg-[#ADFF2F]/10 rounded-md border border-[#ADFF2F]/20">
                <Search className="h-4 w-4 text-[#ADFF2F]" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-0.5">
                  Advanced Search
                </p>
                <p className="text-sm text-slate-400">
                  Filter by skills, aura score, location &amp; more
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-1.5 bg-[#A78BFA]/10 rounded-md border border-[#A78BFA]/20">
                <FileCheck className="h-4 w-4 text-[#A78BFA]" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-0.5">
                  Verified Skills
                </p>
                <p className="text-sm text-slate-400">
                  Skills extracted &amp; verified from actual code analysis
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-1.5 bg-[#ADFF2F]/10 rounded-md border border-[#ADFF2F]/20">
                <Users className="h-4 w-4 text-[#ADFF2F]" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-0.5">
                  Quality Profiles
                </p>
                <p className="text-sm text-slate-400">
                  Detailed code quality metrics &amp; project analysis
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <div className="p-1.5 bg-[#A78BFA]/10 rounded-md border border-[#A78BFA]/20">
                <Shield className="h-4 w-4 text-[#A78BFA]" />
              </div>
              <div>
                <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-0.5">
                  Evidence-Based Hiring
                </p>
                <p className="text-sm text-slate-400">
                  Make decisions based on real data, not just resumes
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="flex-1 bg-[#F0F2F5] flex items-center justify-center p-6 sm:p-8">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8">
            {/* Icon */}
            <div className="flex justify-center mb-5">
              <div className="p-1.5 bg-[#ADFF2F]/10 rounded-md border border-[#ADFF2F]/20">
                <Building className="h-6 w-6 text-[#ADFF2F]" />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-xl font-black text-slate-900 text-center mb-1">
              {mode === 'login' ? 'Recruiter Login' : 'Create Account'}
            </h2>
            <p className="text-sm text-slate-500 text-center mb-6">
              {mode === 'login'
                ? 'Access the talent pool'
                : 'Start finding verified developers'}
            </p>

            {/* Error */}
            {error && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === 'register' && (
                <>
                  {/* Name */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                      Your Name
                    </label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        name="name"
                        placeholder="John Doe"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Company Name */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                      Company Name
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        name="organizationName"
                        placeholder="Acme Inc."
                        value={formData.organizationName}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Company Website */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                      Company Website
                    </label>
                    <div className="relative">
                      <Globe className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="url"
                        name="organizationWebsite"
                        placeholder="https://example.com"
                        value={formData.organizationWebsite}
                        onChange={handleInputChange}
                        required
                        pattern="https?://.+"
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Position */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                      Your Position
                    </label>
                    <div className="relative">
                      <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="text"
                        name="position"
                        placeholder="Hiring Manager"
                        value={formData.position}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-colors"
                      />
                    </div>
                  </div>

                  {/* Industry */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                      Industry
                    </label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                      <select
                        name="industry"
                        value={formData.industry}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 appearance-none transition-colors"
                      >
                        <option value="">Select Industry</option>
                        <option value="Technology">Technology</option>
                        <option value="Finance">Finance</option>
                        <option value="Healthcare">Healthcare</option>
                        <option value="Education">Education</option>
                        <option value="E-commerce">E-commerce</option>
                        <option value="Consulting">Consulting</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>
                  </div>

                  {/* Organization Size */}
                  <div>
                    <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                      Company Size
                    </label>
                    <div className="relative">
                      <Users className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 z-10" />
                      <select
                        name="organizationSize"
                        value={formData.organizationSize}
                        onChange={handleInputChange}
                        required
                        className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 appearance-none transition-colors"
                      >
                        <option value="">Select Company Size</option>
                        <option value="STARTUP">1-10 employees</option>
                        <option value="SMALL">11-50 employees</option>
                        <option value="MEDIUM">51-200 employees</option>
                        <option value="LARGE">201-1000 employees</option>
                        <option value="ENTERPRISE">1000+ employees</option>
                      </select>
                    </div>
                  </div>
                </>
              )}

              {/* Email */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="you@company.com"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-colors"
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <label className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-1.5">
                  Password
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="password"
                    name="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                    minLength={8}
                    className="w-full pl-10 pr-4 py-2.5 text-sm border border-slate-200 rounded-lg bg-white focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20 transition-colors"
                  />
                </div>
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isLoading}
                className="bg-slate-900 text-white text-xs font-extrabold uppercase tracking-widest rounded-lg w-full py-3 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {mode === 'login' ? 'Signing in...' : 'Creating account...'}
                  </>
                ) : (
                  <>
                    {mode === 'login' ? 'Sign In' : 'Create Account'}
                    <ArrowRight className="h-4 w-4" />
                  </>
                )}
              </button>
            </form>

            {/* Toggle */}
            <div className="mt-6 text-center">
              <p className="text-sm text-slate-500">
                {mode === 'login' ? (
                  <>
                    Don&apos;t have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setMode('register'); clearError() }}
                      className="text-[#65A30D] font-bold hover:underline"
                    >
                      Sign up
                    </button>
                  </>
                ) : (
                  <>
                    Already have an account?{' '}
                    <button
                      type="button"
                      onClick={() => { setMode('login'); clearError() }}
                      className="text-[#65A30D] font-bold hover:underline"
                    >
                      Sign in
                    </button>
                  </>
                )}
              </p>
            </div>

            {/* Back link */}
            <div className="mt-4 pt-4 border-t border-slate-200 text-center">
              <Link
                href="/"
                className="text-sm text-slate-500 hover:text-slate-900 transition-colors"
              >
                ← Back to Developer Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
