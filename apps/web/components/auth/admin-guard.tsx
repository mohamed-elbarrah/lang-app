'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef } from 'react'
import { useAppSelector } from '@/lib/hooks'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAppSelector((s) => s.auth)
  const hasRedirected = useRef(false)

  useEffect(() => {
    if (isLoading || hasRedirected.current) return
    if (!isAuthenticated) {
      hasRedirected.current = true
      router.replace('/login')
    } else if (user?.role !== 'admin') {
      hasRedirected.current = true
      router.replace('/dashboard')
    }
  }, [isLoading, isAuthenticated, user, router])

  if (isLoading || !isAuthenticated || user?.role !== 'admin') {
    return null
  }

  return <>{children}</>
}
