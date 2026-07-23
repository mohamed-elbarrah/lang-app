'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAppSelector } from '@/lib/hooks'
import { useUpdateMeMutation } from '@/lib/features/users-api-slice'
import { useChangePasswordMutation } from '@/lib/features/auth-api-slice'
import { Loader2, AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react"

const profileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
})

const passwordSchema = z
  .object({
    currentPassword: z.string().min(1, 'Current password is required'),
    newPassword: z.string().min(8, 'Password must be at least 8 characters').max(128),
    confirmPassword: z.string().min(1, 'Please confirm your new password'),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  })

type ProfileForm = z.infer<typeof profileSchema>
type PasswordForm = z.infer<typeof passwordSchema>

export default function ProfilePage() {
  const { user } = useAppSelector((s) => s.auth)
  const [updateMe, { isLoading: savingProfile }] = useUpdateMeMutation()
  const [changePassword, { isLoading: savingPassword }] = useChangePasswordMutation()
  const [profileSaved, setProfileSaved] = useState(false)
  const [passwordError, setPasswordError] = useState<string | null>(null)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [showCurrent, setShowCurrent] = useState(false)
  const [showNew, setShowNew] = useState(false)

  const profileForm = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: { name: user?.name || '' },
  })

  const passwordForm = useForm<PasswordForm>({
    resolver: zodResolver(passwordSchema),
    defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
  })

  const onProfileSubmit = async (data: ProfileForm) => {
    try {
      await updateMe({ name: data.name }).unwrap()
      setProfileSaved(true)
      setTimeout(() => setProfileSaved(false), 2000)
    } catch {
      // silently fail
    }
  }

  const onPasswordSubmit = async (data: PasswordForm) => {
    setPasswordError(null)
    setPasswordSuccess(false)
    try {
      await changePassword({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      }).unwrap()
      setPasswordSuccess(true)
      passwordForm.reset()
    } catch (err: unknown) {
      const message =
        err && typeof err === 'object' && 'data' in err
          ? String((err as { data: { error?: { message?: string } } }).data?.error?.message ?? 'Failed to change password')
          : 'Failed to change password'
      setPasswordError(message)
    }
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-1">Manage your account settings.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your personal details here.</CardDescription>
        </CardHeader>
        <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input id="name" {...profileForm.register('name')} />
              {profileForm.formState.errors.name && (
                <p className="text-sm text-destructive">{profileForm.formState.errors.name.message}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={user?.email || ''} disabled />
              <p className="text-xs text-muted-foreground">Email cannot be changed.</p>
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={savingProfile}>
              {savingProfile ? (
                <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Saving...</>
              ) : profileSaved ? (
                'Saved!'
              ) : (
                'Save Changes'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Change Password</CardTitle>
          <CardDescription>Update your account password.</CardDescription>
        </CardHeader>
        <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
          <CardContent className="space-y-4">
            {passwordError && (
              <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 px-4 py-3 rounded-md">
                <AlertCircle className="h-4 w-4 shrink-0" />
                {passwordError}
              </div>
            )}
            {passwordSuccess && (
              <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 border border-green-200 px-4 py-3 rounded-md">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                Password changed successfully.
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  type={showCurrent ? 'text' : 'password'}
                  {...passwordForm.register('currentPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordForm.formState.errors.currentPassword && (
                <p className="text-sm text-destructive">{passwordForm.formState.errors.currentPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  type={showNew ? 'text' : 'password'}
                  {...passwordForm.register('newPassword')}
                />
                <button
                  type="button"
                  onClick={() => setShowNew(!showNew)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              {passwordForm.formState.errors.newPassword && (
                <p className="text-sm text-destructive">{passwordForm.formState.errors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...passwordForm.register('confirmPassword')}
              />
              {passwordForm.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">{passwordForm.formState.errors.confirmPassword.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter>
            <Button type="submit" disabled={savingPassword}>
              {savingPassword ? (
                <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Updating...</>
              ) : (
                'Change Password'
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
