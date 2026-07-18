'use client'

import { useEffect } from 'react'
import { useGetSessionQuery } from '@/lib/features/auth-api-slice'
import { setUser, clearUser } from '@/lib/features/auth-slice'
import { useAppDispatch, useAppSelector } from '@/lib/hooks'

export default function SessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const dispatch = useAppDispatch()
  const { user } = useAppSelector((s) => s.auth)
  const { data, isLoading } = useGetSessionQuery(undefined, {
    skip: !!user,
  })

  useEffect(() => {
    if (!isLoading) {
      if (data?.user) {
        dispatch(setUser(data.user))
      } else if (!user) {
        dispatch(clearUser())
      }
    }
  }, [data, isLoading, dispatch, user])

  if (isLoading && !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return <>{children}</>
}
