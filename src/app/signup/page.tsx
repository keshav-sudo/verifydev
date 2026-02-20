"use client"

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/auth-store'

export default function SignupRedirect() {
    const { isAuthenticated, accessToken } = useAuthStore()
    const router = useRouter()

    useEffect(() => {
        if (isAuthenticated && accessToken) {
            router.replace('/dashboard')
        } else {
            router.replace('/auth')
        }
    }, [isAuthenticated, accessToken, router])

    return null
}
