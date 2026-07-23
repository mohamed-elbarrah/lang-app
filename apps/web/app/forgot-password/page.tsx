'use client'

import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useForgotPasswordMutation } from '@/lib/features/auth-api-slice'
import { Loader2, Mail, ArrowLeft, CheckCircle2 } from "lucide-react"
import Link from "next/link"

const forgotSchema = z.object({
  email: z.string().email('Enter a valid email'),
})

type ForgotForm = z.infer<typeof forgotSchema>

export default function ForgotPasswordPage() {
  const [forgotPassword, { isLoading }] = useForgotPasswordMutation()
  const [sent, setSent] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotForm>({
    resolver: zodResolver(forgotSchema),
  })

  const onSubmit = async (data: ForgotForm) => {
    await forgotPassword(data).unwrap()
    setSent(true)
  }

  if (sent) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-2" />
            <CardTitle className="text-2xl">Check Your Email</CardTitle>
            <CardDescription className="text-base mt-2">
              If an account exists, we&apos;ve sent a password reset link.
            </CardDescription>
          </CardHeader>
          <CardFooter className="justify-center">
            <Button variant="ghost" asChild>
              <Link href="/login"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Login</Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-2xl">Forgot Password</CardTitle>
          <CardDescription className="text-base mt-2">
            Enter your email and we&apos;ll send you a reset link.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  className="pl-9"
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-sm text-destructive">{errors.email.message}</p>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-3">
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <><Loader2 className="h-4 w-4 mr-1 animate-spin" /> Sending...</>
              ) : (
                'Send Reset Link'
              )}
            </Button>
            <Button variant="ghost" className="w-full" asChild>
              <Link href="/login"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Login</Link>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
