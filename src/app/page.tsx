
"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useFormState, useFormStatus } from "react-dom"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import { Hospital, Users, Eye, EyeOff, Loader2 } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Image from "next/image";
import favicon from "@/app/favicon.ico";
import { login } from "@/lib/actions/auth"
import { AlertCircle } from "lucide-react"

function LoginButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {pending ? 'Memproses...' : 'Login'}
    </Button>
  )
}

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [state, formAction] = useFormState(login, undefined);

  useEffect(() => {
    if(state?.error) {
       toast({
          variant: "destructive",
          title: "Login Gagal",
          description: state.error,
        })
    }
    if (state?.success) {
      toast({
        title: "Login Berhasil",
        description: "Selamat datang kembali!",
      });
      router.push("/dashboard/overview")
    }
  }, [state, router, toast]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
              <Image className="h-8 w-8 text-primary"  src={favicon} alt="logorsud" />
              <CardTitle className="text-2xl">SIRATU</CardTitle>
          </div>
          <CardDescription>
            Sistem Informasi Rapor Mutu - RSUD Oto Iskandar Dinata
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={formAction} className="grid gap-4">
            {state?.error && (
                 <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Error</AlertTitle>
                    <AlertDescription>
                        {state.error}
                    </AlertDescription>
                </Alert>
            )}
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@sim.rs"
                required
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
                <Link
                  href="#"
                  className="ml-auto inline-block text-sm underline"
                >
                  Lupa password?
                </Link>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  <span className="sr-only">{showPassword ? 'Sembunyikan password' : 'Tampilkan password'}</span>
                </button>
              </div>
            </div>
            <LoginButton />
          </form>
          <Alert className="mt-4">
            <Users className="h-4 w-4" />
            <AlertTitle>Akun Demo</AlertTitle>
            <AlertDescription>
               <p className="text-xs mt-2">Gunakan akun yang disediakan untuk mencoba berbagai peran.</p>
               <p className="text-xs mt-2">Password untuk semua akun: <b>123456</b></p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
