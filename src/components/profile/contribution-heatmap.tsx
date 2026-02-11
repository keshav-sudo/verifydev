import { useMemo } from 'react'
import { motion } from 'framer-motion'
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"
import { cn } from "@/lib/utils"

interface ContributionHeatmapProps {
    data: Record<string, number>
    type: 'github' | 'leetcode'
    totalContributions: number
    username: string
}

export function ContributionHeatmap({
    data,
    type,
    totalContributions,
    username
}: ContributionHeatmapProps) {
    // Generate last 365 days
    const calendarData = useMemo(() => {
        const today = new Date()
        const days = []

        // Start from 52 weeks ago (approx 1 year)
        // We want to end on today, so start date should be today - 364 days
        const startDate = new Date(today)
        startDate.setDate(today.getDate() - 364)

        // Adjust start date to be a Sunday to align grid properly
        const dayOfWeek = startDate.getDay()
        startDate.setDate(startDate.getDate() - dayOfWeek)

        for (let i = 0; i < 371; i++) { // 53 weeks * 7 days
            const date = new Date(startDate)
            date.setDate(startDate.getDate() + i)

            const dateStr = date.toISOString().split('T')[0]

            let count = data[dateStr] || 0

            // Handle LeetCode timestamp format (seconds string)
            if (type === 'leetcode') {
                const timestamp = Math.floor(date.getTime() / 1000).toString()
                if (data[timestamp]) {
                    count = data[timestamp]
                }
            }

            days.push({
                date,
                dateStr,
                count,
                level: getLevel(count)
            })
        }
        return days
    }, [data, type])

    // Group by weeks for vertical layout
    const weeks = useMemo(() => {
        const weeksArray = []
        for (let i = 0; i < calendarData.length; i += 7) {
            weeksArray.push(calendarData.slice(i, i + 7))
        }
        return weeksArray
    }, [calendarData])

    function getLevel(count: number): number {
        if (count === 0) return 0
        if (count <= 2) return 1
        if (count <= 5) return 2
        if (count <= 10) return 3
        return 4
    }

    // Dynamic color mapping using Tailwind opacity modifiers on the primary color
    // Level 0 is muted (empty)
    const getLevelClass = (level: number) => {
        switch (level) {
            case 1: return 'bg-primary/20'
            case 2: return 'bg-primary/40'
            case 3: return 'bg-primary/70'
            case 4: return 'bg-primary'
            default: return 'bg-muted/50' // Lighter empty state matches "clean" theme
        }
    }

    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

    return (
        <div className="w-full">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                    {/* Icon/Dot also uses primary color now */}
                    <div className={cn(
                        "w-2 h-2 rounded-full bg-primary animate-pulse"
                    )} />
                    <span className="text-sm font-medium text-foreground">
                        {totalContributions.toLocaleString()} {type === 'leetcode' ? 'submissions' : 'contributions'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                        in the last year
                    </span>
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                    {months[calendarData[0].date.getMonth()]} - {months[new Date().getMonth()]}
                </div>
            </div>

            <div className="overflow-x-auto pb-2 scrollbar-none">
                <div className="flex gap-[3px] min-w-max">
                    {weeks.map((week, wIndex) => (
                        <div key={wIndex} className="flex flex-col gap-[3px]">
                            {week.map((day, dIndex) => (
                                <TooltipProvider key={`${wIndex}-${dIndex}`}>
                                    <Tooltip delayDuration={0}>
                                        <TooltipTrigger asChild>
                                            <motion.div
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: wIndex * 0.01 + dIndex * 0.005 }}
                                                className={cn(
                                                    "w-[10px] h-[10px] rounded-sm transition-all duration-300",
                                                    getLevelClass(day.level),
                                                    // Hover effect: Scale up slightly and show ring
                                                    "hover:scale-125 hover:z-10 hover:shadow-lg hover:ring-2 hover:ring-primary/50 hover:ring-offset-1 hover:ring-offset-background"
                                                )}
                                            />
                                        </TooltipTrigger>
                                        <TooltipContent side="top" className="bg-popover border-border text-popover-foreground text-xs shadow-xl">
                                            <p className="font-semibold">
                                                {day.count} {type === 'leetcode' ? 'submissions' : 'contributions'}
                                            </p>
                                            <p className="text-muted-foreground">
                                                {day.date.toLocaleDateString(undefined, {
                                                    weekday: 'short',
                                                    month: 'short',
                                                    day: 'numeric',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </TooltipContent>
                                    </Tooltip>
                                </TooltipProvider>
                            ))}
                        </div>
                    ))}
                </div>
            </div>

            <div className="flex items-center gap-2 mt-3 text-[10px] text-muted-foreground justify-end font-medium">
                <span>Less</span>
                <div className={cn("w-[10px] h-[10px] rounded-sm", getLevelClass(0))} />
                <div className={cn("w-[10px] h-[10px] rounded-sm", getLevelClass(1))} />
                <div className={cn("w-[10px] h-[10px] rounded-sm", getLevelClass(2))} />
                <div className={cn("w-[10px] h-[10px] rounded-sm", getLevelClass(3))} />
                <div className={cn("w-[10px] h-[10px] rounded-sm", getLevelClass(4))} />
                <span>More</span>
            </div>
        </div>
    )
}
