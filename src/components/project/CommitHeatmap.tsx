"use client"

import { Calendar, Activity } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CommitHeatmapProps {
  commitFrequency: Array<{ week: number; total: number }>
  className?: string
}

export default function CommitHeatmap({ commitFrequency, className }: CommitHeatmapProps) {
  if (!commitFrequency || commitFrequency.length === 0) {
    return (
      <div className="flex items-center justify-center p-8 text-sm text-slate-500">
        <Activity className="h-5 w-5 mr-2" />
        No commit data available
      </div>
    )
  }

  // Get last 52 weeks of data (1 year)
  const recentData = commitFrequency.slice(-52)
  
  // Find max commits for color scaling
  const maxCommits = Math.max(...recentData.map(d => d.total), 1)
  
  // Get intensity color based on commit count
  const getIntensityColor = (count: number) => {
    if (count === 0) return 'bg-slate-100 border-slate-200'
    const intensity = count / maxCommits
    if (intensity >= 0.75) return 'bg-[#84CC16] border-[#65A30D]'
    if (intensity >= 0.5) return 'bg-emerald-400 border-emerald-500'
    if (intensity >= 0.25) return 'bg-emerald-200 border-emerald-300'
    return 'bg-emerald-100 border-emerald-200'
  }

  // Format week timestamp to date
  const formatWeekDate = (timestamp: number) => {
    const date = new Date(timestamp * 1000)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Group by month for better visualization
  const months: string[] = []
  const weeks: Array<{ date: string; count: number; month: string }> = []
  
  recentData.forEach(item => {
    const date = new Date(item.week * 1000)
    const monthYear = date.toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
    
    if (!months.includes(monthYear)) {
      months.push(monthYear)
    }
    
    weeks.push({
      date: formatWeekDate(item.week),
      count: item.total,
      month: monthYear
    })
  })

  // Calculate statistics
  const totalCommits = recentData.reduce((sum, item) => sum + item.total, 0)
  const activeWeeks = recentData.filter(item => item.total > 0).length
  const avgCommitsPerWeek = activeWeeks > 0 ? (totalCommits / activeWeeks).toFixed(1) : '0'
  const consistency = ((activeWeeks / recentData.length) * 100)
  const consistencyStr = consistency.toFixed(0)

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
          <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 mb-1">Total Commits</p>
          <p className="text-lg font-black text-slate-900">{totalCommits}</p>
        </div>
        
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
          <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 mb-1">Active Weeks</p>
          <p className="text-lg font-black text-slate-900">{activeWeeks}</p>
        </div>
        
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
          <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 mb-1">Avg Per Week</p>
          <p className="text-lg font-black text-slate-900">{avgCommitsPerWeek}</p>
        </div>
        
        <div className="p-3 bg-slate-50 border border-slate-200 rounded-md">
          <p className="text-[9px] font-extrabold uppercase tracking-widest text-slate-500 mb-1">Consistency</p>
          <p className="text-lg font-black text-emerald-600">{consistencyStr}%</p>
        </div>
      </div>

      {/* Heatmap Calendar */}
      <div className="bg-white border border-slate-200 rounded-lg p-5">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 text-blue-500" />
          <h3 className="text-xs font-extrabold uppercase tracking-widest text-slate-900">Commit Activity (Last 52 Weeks)</h3>
        </div>
        
        <div className="overflow-x-auto">
          <div className="inline-block min-w-full">
            {/* Month labels */}
            <div className="flex gap-1 mb-2">
              {months.map((month, i) => (
                <div 
                  key={i} 
                  className="text-[9px] font-bold text-slate-500"
                  style={{ width: `${(weeks.filter(w => w.month === month).length * 12) + (weeks.filter(w => w.month === month).length - 1) * 2}px` }}
                >
                  {month}
                </div>
              ))}
            </div>

            {/* Week grid */}
            <div className="flex flex-wrap gap-0.5" style={{ maxWidth: `${weeks.length * 12 + (weeks.length - 1) * 2}px` }}>
              {weeks.map((week, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-3 h-3 rounded-[2px] border transition-all hover:scale-110 cursor-pointer",
                    getIntensityColor(week.count)
                  )}
                  title={`${week.date}: ${week.count} commits`}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-3 mt-4 pt-4 border-t border-slate-200">
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-[2px] bg-slate-100 border border-slate-200" />
            <div className="w-3 h-3 rounded-[2px] bg-emerald-100 border border-emerald-200" />
            <div className="w-3 h-3 rounded-[2px] bg-emerald-200 border border-emerald-300" />
            <div className="w-3 h-3 rounded-[2px] bg-emerald-400 border border-emerald-500" />
            <div className="w-3 h-3 rounded-[2px] bg-[#84CC16] border border-[#65A30D]" />
          </div>
          <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wider">More</span>
        </div>
      </div>

      {/* Activity Pattern Insight */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-2">
          <Activity className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-extrabold text-blue-900 mb-1">Development Pattern</h4>
            <p className="text-xs font-medium text-blue-800">
              {consistency >= 70 ? (
                `Highly consistent developer with ${consistencyStr}% active weeks. Shows strong dedication and regular contribution patterns.`
              ) : consistency >= 40 ? (
                `Moderately consistent activity with ${activeWeeks} active weeks. Shows steady but sporadic development patterns.`
              ) : (
                `Sporadic development activity detected. ${activeWeeks} active weeks out of ${recentData.length} total weeks.`
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
