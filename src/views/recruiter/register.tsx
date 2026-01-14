"use client"

/**
 * Recruiter Register Page - Enhanced with Complete Organization Details
 */

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
  CheckCircle,
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
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/30 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-2xl"
      >
        <Card className="border-2">
          <CardHeader className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-2">
              <Building2 className="w-8 h-8 text-primary" />
            </div>
            <CardTitle className="text-2xl">Join as a Recruiter</CardTitle>
            <CardDescription>
              Find verified developers with real, analyzed skills
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-6">
              {/* Personal Information Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground border-b pb-2">Personal Information</h3>
                
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="name"
                      name="name"
                      placeholder="John Doe"
                      value={formData.name}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                  {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                </div>

                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email">Work Email *</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="john@company.com"
                      value={formData.email}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                  {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                </div>

                {/* Position */}
                <div className="space-y-2">
                  <Label htmlFor="position">Your Position *</Label>
                  <div className="relative">
                    <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="position"
                      name="position"
                      placeholder="HR Manager, Talent Acquisition Lead, etc."
                      value={formData.position}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                  {errors.position && <p className="text-sm text-destructive">{errors.position}</p>}
                </div>
              </div>

              {/* Organization Details Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground border-b pb-2">Organization Details</h3>
                
                {/* Company Name */}
                <div className="space-y-2">
                  <Label htmlFor="organizationName">Company Name *</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="organizationName"
                      name="organizationName"
                      placeholder="Acme Inc."
                      value={formData.organizationName}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                  {errors.organizationName && <p className="text-sm text-destructive">{errors.organizationName}</p>}
                </div>

                {/* Company Website */}
                <div className="space-y-2">
                  <Label htmlFor="organizationWebsite">Company Website *</Label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="organizationWebsite"
                      name="organizationWebsite"
                      placeholder="https://company.com"
                      value={formData.organizationWebsite}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                  {errors.organizationWebsite && <p className="text-sm text-destructive">{errors.organizationWebsite}</p>}
                </div>

                {/* Industry */}
                <div className="space-y-2">
                  <Label htmlFor="industry">Industry *</Label>
                  <div className="relative">
                    <Building className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                    <select
                      id="industry"
                      name="industry"
                      value={formData.industry}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
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
                  {errors.industry && <p className="text-sm text-destructive">{errors.industry}</p>}
                </div>

                {/* Company Size */}
                <div className="space-y-2">
                  <Label htmlFor="organizationSize">Company Size *</Label>
                  <div className="relative">
                    <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground z-10" />
                    <select
                      id="organizationSize"
                      name="organizationSize"
                      value={formData.organizationSize}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-input bg-background rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="">Select company size...</option>
                      <option value="STARTUP">1-10 employees</option>
                      <option value="SMALL">11-50 employees</option>
                      <option value="MEDIUM">51-200 employees</option>
                      <option value="LARGE">201-1000 employees</option>
                      <option value="ENTERPRISE">1000+ employees</option>
                    </select>
                  </div>
                  {errors.organizationSize && <p className="text-sm text-destructive">{errors.organizationSize}</p>}
                </div>

                {/* Organization Description */}
                <div className="space-y-2">
                  <Label htmlFor="organizationDescription">Company Description (Optional)</Label>
                  <Textarea
                    id="organizationDescription"
                    name="organizationDescription"
                    placeholder="Brief description of your company..."
                    value={formData.organizationDescription}
                    onChange={handleChange}
                    className="min-h-[80px] resize-none"
                    maxLength={500}
                  />
                  <p className="text-xs text-muted-foreground">
                    {formData.organizationDescription?.length || 0}/500 characters
                  </p>
                </div>
              </div>

              {/* Security Section */}
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-foreground border-b pb-2">Security</h3>
                
                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="password"
                      name="password"
                      type="password"
                      placeholder="••••••••"
                      value={formData.password}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                  {errors.password && <p className="text-sm text-destructive">{errors.password}</p>}
                </div>

                {/* Confirm Password */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password *</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      placeholder="••••••••"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      className="pl-10"
                    />
                  </div>
                  {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword}</p>}
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col gap-4">
              <Button 
                type="submit" 
                className="w-full" 
                disabled={registerMutation.isPending}
              >
                {registerMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Creating Account...
                  </>
                ) : (
                  <>
                    <CheckCircle className="mr-2 w-4 h-4" />
                    Create Recruiter Account
                  </>
                )}
              </Button>

              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{' '}
                <Link href="/recruiter/login" className="text-primary hover:underline">
                  Sign in
                </Link>
              </p>

              <Link
                href="/"
                className="flex items-center justify-center gap-2 text-sm text-muted-foreground hover:text-foreground"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to home
              </Link>
            </CardFooter>
          </form>
        </Card>
      </motion.div>
    </div>
  )
}
