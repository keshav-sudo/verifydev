import React from 'react'
import { motion, useMotionTemplate, useMotionValue, useReducedMotion } from 'framer-motion'
import { cn } from '@/lib/utils'

interface MotionCardProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode
    className?: string
    gradientColor?: string
    spotlight?: boolean
    glass?: boolean
    onClick?: () => void
}

export function MotionCard({
    children,
    className,
    gradientColor = '#8b5cf6',
    spotlight = true,
    glass = false,
    onClick,
    ...props
}: MotionCardProps) {
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const prefersReducedMotion = useReducedMotion()

    function handleMouseMove({ currentTarget, clientX, clientY }: React.MouseEvent) {
        // Skip spotlight effect on touch devices or reduced motion
        if (prefersReducedMotion || 'ontouchstart' in window) return
        const { left, top } = currentTarget.getBoundingClientRect()
        mouseX.set(clientX - left)
        mouseY.set(clientY - top)
    }

    const background = useMotionTemplate`radial-gradient(
    650px circle at ${mouseX}px ${mouseY}px,
    ${gradientColor}15,
    transparent 80%
  )`

    // Disable spotlight on mobile/reduced motion
    const showSpotlight = spotlight && !prefersReducedMotion && typeof window !== 'undefined' && !('ontouchstart' in window)

    return (
        <div
            className={cn(
                'group relative rounded-xl border transition-all duration-300',
                glass ? 'bg-black/40 backdrop-blur-md border-white/10 shadow-2xl' : 'bg-card border-border',
                'hover:border-primary/50 hover:shadow-lg',
                className
            )}
            onMouseMove={handleMouseMove}
            onClick={onClick}
            {...props}
        >
            {showSpotlight && (
                <motion.div
                    className="pointer-events-none absolute -inset-px rounded-xl opacity-0 transition duration-300 group-hover:opacity-100 hidden md:block"
                    style={{
                        background,
                    }}
                />
            )}
            <div className="relative h-full">{children}</div>
        </div>
    )
}

export function MotionCardHeader({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('flex flex-col space-y-1.5 p-4 md:p-6', className)} {...props}>
            {children}
        </div>
    )
}

export function MotionCardTitle({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
    return (
        <h3
            className={cn(
                'text-lg md:text-2xl font-semibold leading-none tracking-tight',
                className
            )}
            {...props}
        >
            {children}
        </h3>
    )
}

export function MotionCardDescription({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
    return (
        <p
            className={cn('text-xs md:text-sm text-muted-foreground', className)}
            {...props}
        >
            {children}
        </p>
    )
}

export function MotionCardContent({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div className={cn('p-4 md:p-6 pt-0', className)} {...props}>
            {children}
        </div>
    )
}

export function MotionCardFooter({
    className,
    children,
    ...props
}: React.HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            className={cn('flex items-center p-4 md:p-6 pt-0', className)}
            {...props}
        >
            {children}
        </div>
    )
}
