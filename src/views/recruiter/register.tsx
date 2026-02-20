"use client"

/**
 * Recruiter Register Page
 */

import { useState } from 'react'
import Link from 'next/link'
import { useRecruiterRegister } from '@/hooks/use-recruiter'
import {
  Building2,
  Mail,
  Lock,
  User,
  Globe,
  Briefcase,
  Loader2,
  ArrowLeft,
  Building,
  Users,
} from 'lucide-react'

export default function RecruiterRegisterPage() {
  const registerMutation = useRecruiterRegister()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    name: '',
    position: '',
    organizationName: '',
    organizationWebsite: '',
    industry: '',
    organizationSize: '',
    organizationDescription: '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validate = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email) newErrors.email = 'Email is required'
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email'

    if (!formData.password) newErrors.password = 'Password is required'
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters'

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match'
    }

    if (!formData.name) newErrors.name = 'Name is required'
    if (!formData.position) newErrors.position = 'Position is required'
    if (!formData.organizationName) newErrors.organizationName = 'Company name is required'
    if (!formData.organizationWebsite) newErrors.organizationWebsite = 'Company website is required'
    else if (!/^https?:\/\/.+/.test(formData.organizationWebsite)) newErrors.organizationWebsite = 'Invalid URL (must start with http:// or https://)'
    if (!formData.industry) newErrors.industry = 'Industry is required'
    if (!formData.organizationSize) newErrors.organizationSize = 'Company size is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    registerMutation.mutate({
      email: formData.email,
      password: formData.password,
      name: formData.name,
      position: formData.position,
      organizationName: formData.organizationName,
      organizationWebsite: formData.organizationWebsite,
      industry: formData.industry,
      organizationSize: formData.organizationSize,
      organizationDescription: formData.organizationDescription || undefined,
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: '' }))
    }
  }

  return (
    <div className="bg-[#F0F2F5] min-h-screen p-4 md:p-6 lg:p-8 font-sans">
      <div className="max-w-2xl mx-auto">
        {/* Dark Hero */}
        <div className="bg-[#0A0A0A] rounded-2xl border border-slate-800 p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-1.5 bg-[#ADFF2F]/10 rounded-md border border-[#ADFF2F]/20">
              <Building2 className="w-6 h-6 text-[#ADFF2F]" />
            </div>
          </div>
          <h1 className="text-2xl font-black text-white">Join as a Recruiter</h1>
          <p className="text-slate-400 text-sm mt-2">Find verified developers with real, analyzed skills</p>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm mt-6">
          <form onSubmit={handleSubmit}>
            {/* Personal Information Section */}
            <div className="px-6 pt-6 pb-2">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-3">
                Personal Information
              </h3>
            </div>
            <div className="px-6 pb-6 space-y-4 pt-4">
              {/* Name */}
              <div className="space-y-1.5">
                <label htmlFor="name" className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="name"
                    name="name"
                    type="text"
                    placeholder="John Doe"
                    value={formData.name}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 border border-slate-200 rounded-lg py-2.5 text-sm focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20"
                  />
                </div>
                {errors.name && <p className="text-[10px] font-bold text-red-500">{errors.name}</p>}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <label htmlFor="email" className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                  Work Email *
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@company.com"
                    value={formData.email}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 border border-slate-200 rounded-lg py-2.5 text-sm focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20"
                  />
                </div>
                {errors.email && <p className="text-[10px] font-bold text-red-500">{errors.email}</p>}
              </div>

              {/* Position */}
              <div className="space-y-1.5">
                <label htmlFor="position" className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                  Your Position *
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="position"
                    name="position"
                    type="text"
                    placeholder="HR Manager, Talent Acquisition Lead, etc."
                    value={formData.position}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 border border-slate-200 rounded-lg py-2.5 text-sm focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20"
                  />
                </div>
                {errors.position && <p className="text-[10px] font-bold text-red-500">{errors.position}</p>}
              </div>
            </div>

            {/* Organization Details Section */}
            <div className="px-6 pb-2">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-3">
                Organization Details
              </h3>
            </div>
            <div className="px-6 pb-6 space-y-4 pt-4">
              {/* Company Name */}
              <div className="space-y-1.5">
                <label htmlFor="organizationName" className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                  Company Name *
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="organizationName"
                    name="organizationName"
                    type="text"
                    placeholder="Acme Inc."
                    value={formData.organizationName}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 border border-slate-200 rounded-lg py-2.5 text-sm focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20"
                  />
                </div>
                {errors.organizationName && <p className="text-[10px] font-bold text-red-500">{errors.organizationName}</p>}
              </div>

              {/* Company Website */}
              <div className="space-y-1.5">
                <label htmlFor="organizationWebsite" className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                  Company Website *
                </label>
                <div className="relative">
                  <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="organizationWebsite"
                    name="organizationWebsite"
                    type="text"
                    placeholder="https://company.com"
                    value={formData.organizationWebsite}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 border border-slate-200 rounded-lg py-2.5 text-sm focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20"
                  />
                </div>
                {errors.organizationWebsite && <p className="text-[10px] font-bold text-red-500">{errors.organizationWebsite}</p>}
              </div>

              {/* Industry */}
              <div className="space-y-1.5">
                <label htmlFor="industry" className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                  Industry *
                </label>
                <div className="relative">
                  <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                  <select
                    id="industry"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 border border-slate-200 rounded-lg py-2.5 text-sm appearance-none bg-white focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20"
                  >
                    <option value="">Select industry...</option>
                    <option value="Technology">Technology</option>
                    <option value="Finance">Finance</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Education">Education</option>
                    <option value="E-commerce">E-commerce</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Consulting">Consulting</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Real Estate">Real Estate</option>
                    <option value="Retail">Retail</option>
                    <option value="Media">Media & Entertainment</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                {errors.industry && <p className="text-[10px] font-bold text-red-500">{errors.industry}</p>}
              </div>

              {/* Company Size */}
              <div className="space-y-1.5">
                <label htmlFor="organizationSize" className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                  Company Size *
                </label>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 z-10" />
                  <select
                    id="organizationSize"
                    name="organizationSize"
                    value={formData.organizationSize}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 border border-slate-200 rounded-lg py-2.5 text-sm appearance-none bg-white focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20"
                  >
                    <option value="">Select company size...</option>
                    <option value="STARTUP">1-10 employees</option>
                    <option value="SMALL">11-50 employees</option>
                    <option value="MEDIUM">51-200 employees</option>
                    <option value="LARGE">201-1000 employees</option>
                    <option value="ENTERPRISE">1000+ employees</option>
                  </select>
                </div>
                {errors.organizationSize && <p className="text-[10px] font-bold text-red-500">{errors.organizationSize}</p>}
              </div>

              {/* Organization Description */}
              <div className="space-y-1.5">
                <label htmlFor="organizationDescription" className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                  Company Description (Optional)
                </label>
                <textarea
                  id="organizationDescription"
                  name="organizationDescription"
                  placeholder="Brief description of your company..."
                  value={formData.organizationDescription}
                  onChange={handleChange}
                  className="w-full px-3 border border-slate-200 rounded-lg py-2.5 text-sm min-h-[80px] resize-none focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20"
                  maxLength={500}
                />
                <p className="text-[10px] text-slate-400">
                  {formData.organizationDescription?.length || 0}/500 characters
                </p>
              </div>
            </div>

            {/* Security Section */}
            <div className="px-6 pb-2">
              <h3 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest border-b border-slate-200 pb-3">
                Security
              </h3>
            </div>
            <div className="px-6 pb-6 space-y-4 pt-4">
              {/* Password */}
              <div className="space-y-1.5">
                <label htmlFor="password" className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                  Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 border border-slate-200 rounded-lg py-2.5 text-sm focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20"
                  />
                </div>
                {errors.password && <p className="text-[10px] font-bold text-red-500">{errors.password}</p>}
              </div>

              {/* Confirm Password */}
              <div className="space-y-1.5">
                <label htmlFor="confirmPassword" className="block text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                  Confirm Password *
                </label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    placeholder="••••••••"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className="w-full pl-10 pr-3 border border-slate-200 rounded-lg py-2.5 text-sm focus:outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-400/20"
                  />
                </div>
                {errors.confirmPassword && <p className="text-[10px] font-bold text-red-500">{errors.confirmPassword}</p>}
              </div>
            </div>

            {/* Footer */}
            <div className="px-6 pb-6 space-y-4">
              <button
                type="submit"
                disabled={registerMutation.isPending}
                className="bg-slate-900 text-white text-xs font-extrabold uppercase tracking-widest py-3 w-full rounded-lg hover:bg-slate-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  'Create Recruiter Account'
                )}
              </button>

              <p className="text-xs text-center text-slate-500">
                Already have an account?{' '}
                <Link href="/recruiter/login" className="text-[#65A30D] hover:text-[#4d7c0f] font-bold text-xs">
                  Sign in
                </Link>
              </p>

              <Link
                href="/"
                className="flex items-center justify-center gap-2 text-slate-500 text-[10px] uppercase tracking-widest hover:text-slate-700 transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                Back to home
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
