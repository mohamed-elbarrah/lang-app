'use client'

import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { useAppSelector } from '@/lib/hooks'

export default function AdminGuard({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const { user, isAuthenticated, isLoading } = useAppSelector((s) => s.auth)

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.replace('/login')
      } else if (user?.role !== 'admin') {
        router.replace('/dashboard')
      }
    }
  }, [isLoading, isAuthenticated, user, router])

  if (isLoading || !isAuthenticated || user?.role !== 'admin') {
    return null
  }

  return <>{children}</>
}
