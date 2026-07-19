'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { useAppSelector } from '@/lib/hooks'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { isAuthenticated, isLoading } = useAppSelector((s) => s.auth)
  const hasRedirected = useRef(false)

  useEffect(() => {
    if (isLoading || hasRedirected.current) return
    if (!isAuthenticated) {
      hasRedirected.current = true
      router.replace('/login')
    }
  }, [isLoading, isAuthenticated, router])

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return <>{children}</>
}
