"use client"

/**
 * Job Posting Page for Recruiters
 */

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import { toast } from '@/hooks/use-toast'
import { createJob } from '@/api/services/recruiter-job.service'
import {
  ArrowLeft,
  Briefcase,
  MapPin,
  DollarSign,
  Plus,
  X,
  Eye,
  Send,
  Loader2,
  Zap,
  ListChecks,
  Gift,
  Star,
} from 'lucide-react'
import { cn } from '@/lib/utils'

/* ------------------------------------------------------------------ */
/*  Schema                                                             */
/* ------------------------------------------------------------------ */

const jobSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().min(50, 'Description must be at least 50 characters'),
  location: z.string().min(2, 'Location is required'),
  isRemote: z.boolean(),
  type: z.enum(['FULL_TIME', 'PART_TIME', 'CONTRACT', 'INTERNSHIP']),
  level: z.enum(['ENTRY', 'JUNIOR', 'MID', 'SENIOR', 'LEAD']),
  category: z.enum([
    'FRONTEND',
    'BACKEND',
    'FULLSTACK',
    'MOBILE',
    'DEVOPS',
    'DATA_ENGINEERING',
    'MACHINE_LEARNING',
    'SECURITY',
    'DESIGN',
    'QA',
    'GENERAL',
  ]),
  salaryMin: z.number().optional(),
  salaryMax: z.number().optional(),
  currency: z.string().default('USD'),
  applicationDeadline: z.string().optional(),
})

type JobFormData = z.infer<typeof jobSchema>

/* ------------------------------------------------------------------ */
/*  Constants                                                          */
/* ------------------------------------------------------------------ */

const POPULAR_SKILLS = [
  'JavaScript', 'TypeScript', 'React', 'Node.js', 'Python', 'Go',
  'Java', 'PostgreSQL', 'MongoDB', 'Docker', 'Kubernetes', 'AWS',
  'GraphQL', 'REST API', 'Git', 'CI/CD', 'Agile', 'Testing',
]

const JOB_CATEGORIES = [
  { value: 'FRONTEND', label: 'Frontend Development' },
  { value: 'BACKEND', label: 'Backend Development' },
  { value: 'FULLSTACK', label: 'Full Stack Development' },
  { value: 'MOBILE', label: 'Mobile Development' },
  { value: 'DEVOPS', label: 'DevOps & Infrastructure' },
  { value: 'DATA_ENGINEERING', label: 'Data Engineering' },
  { value: 'MACHINE_LEARNING', label: 'AI & Machine Learning' },
  { value: 'SECURITY', label: 'Cybersecurity' },
  { value: 'DESIGN', label: 'UI/UX Design' },
  { value: 'QA', label: 'Quality Assurance' },
  { value: 'GENERAL', label: 'General / Other' },
] as const

/* ------------------------------------------------------------------ */
/*  Section Wrapper                                                    */
/* ------------------------------------------------------------------ */

function Section({
  icon: Icon,
  iconColor = '#A78BFA',
  title,
  subtitle,
  children,
}: {
  icon: React.ElementType
  iconColor?: string
  title: string
  subtitle?: string
  children: React.ReactNode
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/30 flex items-center gap-3">
        <div
          className="p-1.5 rounded-md border"
          style={{
            backgroundColor: `${iconColor}15`,
            borderColor: `${iconColor}30`,
          }}
        >
          <Icon className="w-4 h-4" style={{ color: iconColor }} />
        </div>
        <div>
          <h2 className="text-xs font-extrabold text-slate-900 uppercase tracking-widest">
            {title}
          </h2>
          {subtitle && (
            <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>
          )}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  )
}

/* ================================================================== */
/*  Main Page                                                          */
/* ================================================================== */

export default function JobPostingPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showPreview, setShowPreview] = useState(false)
  const [requiredSkills, setRequiredSkills] = useState<string[]>([])
  const [preferredSkills, setPreferredSkills] = useState<string[]>([])
  const [responsibilities, setResponsibilities] = useState<string[]>([''])
  const [qualifications] = useState<string[]>([''])
  const [benefits, setBenefits] = useState<string[]>([''])
  const [customSkill, setCustomSkill] = useState('')
  const [customPreferredSkill, setCustomPreferredSkill] = useState('')

  const form = useForm<JobFormData>({
    resolver: zodResolver(jobSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      isRemote: false,
      type: 'FULL_TIME',
      level: 'MID',
      category: 'FULLSTACK',
      currency: 'USD',
    },
  })

  // Watch form for preview
  form.watch()

  /* ---- Skill helpers ---- */

  const addRequiredSkill = (skill: string) => {
    if (!requiredSkills.includes(skill)) {
      setRequiredSkills([...requiredSkills, skill])
    }
  }

  const removeRequiredSkill = (skill: string) => {
    setRequiredSkills(requiredSkills.filter(s => s !== skill))
  }

  const addPreferredSkill = (skill: string) => {
    if (!preferredSkills.includes(skill)) {
      setPreferredSkills([...preferredSkills, skill])
    }
  }

  const removePreferredSkill = (skill: string) => {
    setPreferredSkills(preferredSkills.filter(s => s !== skill))
  }

  const addCustomSkillToRequired = () => {
    if (customSkill.trim() && !requiredSkills.includes(customSkill.trim())) {
      addRequiredSkill(customSkill.trim())
      setCustomSkill('')
    }
  }

  const addCustomSkillToPreferred = () => {
    if (customPreferredSkill.trim() && !preferredSkills.includes(customPreferredSkill.trim())) {
      addPreferredSkill(customPreferredSkill.trim())
      setCustomPreferredSkill('')
    }
  }

  /* ---- List helpers ---- */

  const updateListItem = (
    list: string[],
    setList: (items: string[]) => void,
    index: number,
    value: string
  ) => {
    const newList = [...list]
    newList[index] = value
    setList(newList)
  }

  const addListItem = (list: string[], setList: (items: string[]) => void) => {
    setList([...list, ''])
  }

  const removeListItem = (list: string[], setList: (items: string[]) => void, index: number) => {
    if (list.length > 1) {
      setList(list.filter((_, i) => i !== index))
    }
  }

  /* ---- Submit ---- */

  const onSubmit = async (data: JobFormData) => {
    if (requiredSkills.length === 0) {
      toast({
        title: 'Required skills needed',
        description: 'Please add at least one required skill',
        variant: 'destructive',
      })
      return
    }

    setIsSubmitting(true)
    try {
      await createJob({
        title: data.title,
        description: data.description,
        location: data.location,
        isRemote: data.isRemote,
        type: data.type,
        level: data.level,
        category: data.category as any,
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        salaryCurrency: data.currency,
        requiredSkills: requiredSkills,
        preferredSkills: preferredSkills,
        responsibilities: responsibilities.filter((r: string) => r.trim()).join('\n'),
        requirements: qualifications.filter((q: string) => q.trim()).join('\n'),
      })

      toast({
        title: 'Job posted successfully!',
        description: 'Your job listing is now live.',
      })
      router.push('/recruiter/jobs')
    } catch (error: any) {
      toast({
        title: 'Failed to post job',
        description: error?.response?.data?.message || error?.message || 'Please try again',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  /* ================================================================ */
  /*  Render                                                           */
  /* ================================================================ */

  return (
    <div className="w-full min-h-screen bg-[#F0F2F5] p-4 md:p-6 lg:p-8 font-sans text-slate-800">
      <div className="max-w-[1536px] mx-auto space-y-6">
        {/* ---- Dark Hero Header ---- */}
        <div className="bg-[#0A0A0A] rounded-2xl border border-slate-800 p-6 md:p-8">
          <Link
            href="/recruiter/jobs"
            className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest hover:text-slate-300 transition-colors mb-5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to jobs
          </Link>
          <h1 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">
            Post a New Job
          </h1>
          <p className="text-xs text-slate-400 mt-2">
            Create a job listing to attract verified developers on the platform
          </p>
        </div>

        {/* ---- Form ---- */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* ======== Basic Information ======== */}
            <Section icon={Briefcase} iconColor="#A78BFA" title="Basic Information">
              <div className="space-y-5">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                        Job Title
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. Senior Frontend Developer"
                          className="border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                        Job Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Describe the role, team, and what makes this opportunity exciting..."
                          className="min-h-32 border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-5 md:grid-cols-3">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                          Employment Type
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-slate-200">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="FULL_TIME">Full Time</SelectItem>
                            <SelectItem value="PART_TIME">Part Time</SelectItem>
                            <SelectItem value="CONTRACT">Contract</SelectItem>
                            <SelectItem value="INTERNSHIP">Internship</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                          Category
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-slate-200">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {JOB_CATEGORIES.map((category) => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="level"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                          Experience Level
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="border-slate-200">
                              <SelectValue />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ENTRY">Entry Level</SelectItem>
                            <SelectItem value="JUNIOR">Junior</SelectItem>
                            <SelectItem value="MID">Mid Level</SelectItem>
                            <SelectItem value="SENIOR">Senior</SelectItem>
                            <SelectItem value="LEAD">Lead</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </Section>

            {/* ======== Location ======== */}
            <Section icon={MapPin} iconColor="#65A30D" title="Location">
              <div className="grid gap-5 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                        Location
                      </FormLabel>
                      <FormControl>
                        <Input
                          placeholder="e.g. San Francisco, CA"
                          className="border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isRemote"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border border-slate-200 bg-slate-50/50 p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                          Remote Work
                        </FormLabel>
                        <FormDescription className="text-[11px] text-slate-400">
                          Allow candidates to work remotely
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </Section>

            {/* ======== Compensation ======== */}
            <Section icon={DollarSign} iconColor="#F59E0B" title="Compensation">
              <div className="grid gap-5 md:grid-cols-3">
                <FormField
                  control={form.control}
                  name="salaryMin"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                        Minimum Salary
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="50000"
                          className="border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="salaryMax"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                        Maximum Salary
                      </FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="100000"
                          className="border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest">
                        Currency
                      </FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-slate-200">
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="USD">USD ($)</SelectItem>
                          <SelectItem value="EUR">EUR (&#8364;)</SelectItem>
                          <SelectItem value="GBP">GBP (&#163;)</SelectItem>
                          <SelectItem value="INR">INR (&#8377;)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Section>

            {/* ======== Required Skills ======== */}
            <Section
              icon={Zap}
              iconColor="#A78BFA"
              title="Required Skills"
              subtitle="Add skills that candidates must have"
            >
              <div className="space-y-4">
                {/* Custom input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom skill..."
                    className="border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                    value={customSkill}
                    onChange={(e) => setCustomSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkillToRequired())}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addCustomSkillToRequired}
                    className="border-slate-200 text-slate-600 hover:bg-slate-50 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Popular skills */}
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SKILLS.map(skill => {
                    const isSelected = requiredSkills.includes(skill)
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() =>
                          isSelected ? removeRequiredSkill(skill) : addRequiredSkill(skill)
                        }
                        className={cn(
                          'inline-flex items-center gap-1 rounded-[3px] px-2.5 py-1 text-[10px] font-bold transition-all border cursor-pointer',
                          isSelected
                            ? 'bg-[#ADFF2F]/20 text-[#65A30D] border-[#ADFF2F]/30 font-extrabold'
                            : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200/60'
                        )}
                      >
                        {skill}
                        {isSelected && <X className="w-2.5 h-2.5 ml-0.5" />}
                      </button>
                    )
                  })}
                </div>

                {/* Selected summary */}
                {requiredSkills.length > 0 && (
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">
                      Selected Required Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {requiredSkills.map(skill => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 bg-[#ADFF2F]/20 text-[#65A30D] text-[10px] font-extrabold border border-[#ADFF2F]/30 rounded-[3px] px-2.5 py-1"
                        >
                          {skill}
                          <button type="button" onClick={() => removeRequiredSkill(skill)} className="hover:text-red-500 transition-colors">
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>

            {/* ======== Preferred Skills ======== */}
            <Section
              icon={Star}
              iconColor="#F59E0B"
              title="Preferred Skills"
              subtitle="Nice-to-have skills that give candidates an edge"
            >
              <div className="space-y-4">
                {/* Custom input */}
                <div className="flex gap-2">
                  <Input
                    placeholder="Add custom skill..."
                    className="border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                    value={customPreferredSkill}
                    onChange={(e) => setCustomPreferredSkill(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addCustomSkillToPreferred())}
                  />
                  <Button
                    type="button"
                    variant="outline"
                    onClick={addCustomSkillToPreferred}
                    className="border-slate-200 text-slate-600 hover:bg-slate-50 shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {/* Popular skills (excluding already-required) */}
                <div className="flex flex-wrap gap-1.5">
                  {POPULAR_SKILLS.filter(s => !requiredSkills.includes(s)).map(skill => {
                    const isSelected = preferredSkills.includes(skill)
                    return (
                      <button
                        key={skill}
                        type="button"
                        onClick={() =>
                          isSelected ? removePreferredSkill(skill) : addPreferredSkill(skill)
                        }
                        className={cn(
                          'inline-flex items-center gap-1 rounded-[3px] px-2.5 py-1 text-[10px] font-bold transition-all border cursor-pointer',
                          isSelected
                            ? 'bg-[#ADFF2F]/20 text-[#65A30D] border-[#ADFF2F]/30 font-extrabold'
                            : 'bg-slate-100 border-slate-200 text-slate-600 hover:bg-slate-200/60'
                        )}
                      >
                        {skill}
                        {isSelected && <X className="w-2.5 h-2.5 ml-0.5" />}
                      </button>
                    )
                  })}
                </div>

                {/* Selected summary */}
                {preferredSkills.length > 0 && (
                  <div className="pt-4 border-t border-slate-100">
                    <p className="text-[10px] font-extrabold text-slate-500 uppercase tracking-widest mb-2">
                      Selected Preferred Skills
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {preferredSkills.map(skill => (
                        <span
                          key={skill}
                          className="inline-flex items-center gap-1 bg-amber-50 text-amber-700 text-[10px] font-extrabold border border-amber-200 rounded-[3px] px-2.5 py-1"
                        >
                          {skill}
                          <button type="button" onClick={() => removePreferredSkill(skill)} className="hover:text-red-500 transition-colors">
                            <X className="w-2.5 h-2.5" />
                          </button>
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </Section>

            {/* ======== Responsibilities ======== */}
            <Section
              icon={ListChecks}
              iconColor="#65A30D"
              title="Responsibilities"
              subtitle="What will the candidate be doing?"
            >
              <div className="space-y-3">
                {responsibilities.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <span className="text-[10px] font-extrabold text-slate-400 w-5 text-center shrink-0">
                      {index + 1}
                    </span>
                    <Input
                      placeholder="e.g. Build and maintain web applications..."
                      className="border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                      value={item}
                      onChange={(e) => updateListItem(responsibilities, setResponsibilities, index, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeListItem(responsibilities, setResponsibilities, index)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addListItem(responsibilities, setResponsibilities)}
                  className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest hover:text-slate-800 transition-colors mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Responsibility
                </button>
              </div>
            </Section>

            {/* ======== Benefits ======== */}
            <Section
              icon={Gift}
              iconColor="#EC4899"
              title="Benefits"
              subtitle="Optional - highlight what you offer"
            >
              <div className="space-y-3">
                {benefits.map((item, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <span className="text-[10px] font-extrabold text-slate-400 w-5 text-center shrink-0">
                      {index + 1}
                    </span>
                    <Input
                      placeholder="e.g. Health insurance, 401k, unlimited PTO..."
                      className="border-slate-200 focus:border-slate-400 focus:ring-slate-400/20"
                      value={item}
                      onChange={(e) => updateListItem(benefits, setBenefits, index, e.target.value)}
                    />
                    <button
                      type="button"
                      onClick={() => removeListItem(benefits, setBenefits, index)}
                      className="p-1.5 rounded-md text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors shrink-0"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addListItem(benefits, setBenefits)}
                  className="inline-flex items-center gap-1.5 text-[10px] font-extrabold text-slate-500 uppercase tracking-widest hover:text-slate-800 transition-colors mt-1"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Add Benefit
                </button>
              </div>
            </Section>

            {/* ======== Actions Footer ======== */}
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm px-6 py-4 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <button
                type="button"
                onClick={() => setShowPreview(!showPreview)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-md border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Eye className="w-3.5 h-3.5" />
                {showPreview ? 'Hide Preview' : 'Preview'}
              </button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-[#ADFF2F] text-slate-900 font-extrabold text-xs uppercase tracking-widest hover:bg-[#9FE82B] shadow-sm px-6 py-2.5 h-auto"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 mr-2 animate-spin" />
                    Posting...
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5 mr-2" />
                    Post Job
                  </>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  )
}
