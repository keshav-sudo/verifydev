import { motion, useReducedMotion } from 'framer-motion'
import { useEffect, useState } from 'react'

// Hook to detect mobile - check on first render for SSR safety
function useIsMobile() {
    const [isMobile, setIsMobile] = useState(() => {
        if (typeof window !== 'undefined') {
            return window.innerWidth < 768
        }
        return false
    })

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768)
        checkMobile()
        window.addEventListener('resize', checkMobile)
        return () => window.removeEventListener('resize', checkMobile)
    }, [])

    return isMobile
}

// Check if mobile BEFORE any component renders (for conditional imports)
const isMobileDevice = typeof window !== 'undefined' && window.innerWidth < 768

export function ParticleBackground() {
    const isMobile = useIsMobile()
    const prefersReducedMotion = useReducedMotion()

    // Skip particles on mobile or if user prefers reduced motion
    if (isMobile || prefersReducedMotion) {
        return null
    }

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            {Array.from({ length: 12 }).map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-primary/20"
                    style={{
                        left: `${Math.random() * 100}%`,
                        top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                        y: [0, -40, 0],
                        opacity: [0, 0.4, 0],
                    }}
                    transition={{
                        duration: 6 + Math.random() * 4,
                        repeat: Infinity,
                        delay: Math.random() * 3,
                        ease: "easeInOut",
                    }}
                />
            ))}
        </div>
    )
}

export function FloatingOrbs() {
    const isMobile = useIsMobile()
    const prefersReducedMotion = useReducedMotion()

    // Use simplified static orbs on mobile
    if (isMobile || prefersReducedMotion) {
        return (
            <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
                <div
                    className="absolute -top-[20%] -left-[10%] w-[250px] h-[250px] rounded-full opacity-40"
                    style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.06) 0%, transparent 70%)' }}
                />
                <div
                    className="absolute top-[30%] -right-[10%] w-[200px] h-[200px] rounded-full opacity-40"
                    style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.04) 0%, transparent 70%)' }}
                />
            </div>
        )
    }

    return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
            <motion.div
                className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] rounded-full"
                style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.08) 0%, transparent 70%)' }}
                animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
                transition={{ duration: 20, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.div
                className="absolute top-[20%] -right-[10%] w-[400px] h-[400px] rounded-full"
                style={{ background: 'radial-gradient(circle, hsl(var(--primary) / 0.05) 0%, transparent 70%)' }}
                animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
                transition={{ duration: 25, repeat: Infinity, ease: "easeInOut" }}
            />
        </div>
    )
}

// Lottie Player wrapper - ONLY loads library on desktop
interface LottieWrapperProps {
    src: string
    style?: React.CSSProperties
    autoplay?: boolean
    loop?: boolean
    className?: string
}

// Desktop-only Lottie component that dynamically imports
function DesktopLottie({ src, style, autoplay, loop }: LottieWrapperProps) {
    const [Player, setPlayer] = useState<React.ComponentType<any> | null>(null)

    useEffect(() => {
        // Only import on desktop
        import('@lottiefiles/react-lottie-player').then(module => {
            setPlayer(() => module.Player)
        })
    }, [])

    if (!Player) {
        return (
            <div
                className="flex items-center justify-center bg-gradient-to-br from-primary/10 to-purple-500/10 rounded-2xl"
                style={style}
            >
                <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
            </div>
        )
    }

    return <Player autoplay={autoplay} loop={loop} src={src} style={style} />
}

export function LottieWrapper({ src, style, autoplay = true, loop = true }: LottieWrapperProps) {
    // Use the initial check to completely skip on mobile
    // This prevents ANY Lottie code from running on mobile
    if (isMobileDevice) {
        return null
    }

    return <DesktopLottie src={src} style={style} autoplay={autoplay} loop={loop} />
}

// Export hook for external use
export { useIsMobile }
