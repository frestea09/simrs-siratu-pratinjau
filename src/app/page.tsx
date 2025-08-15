"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
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
import { Users, Eye, EyeOff, Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useUserStore } from "@/store/user-store"
import { useLogStore } from "@/store/log-store"
import Image from "next/image"
import favicon from "@/app/favicon.ico"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { users, setCurrentUser } = useUserStore()
  const { addLog } = useLogStore()

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)
    const username = formData.get("username") as string
    const password = formData.get("password") as string
    const trimmedUsername = username.trim()

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedUsername, password }),
      })

      if (!res.ok) {
        throw new Error("Invalid credentials")
      }

      const data = await res.json()
      setCurrentUser(data.user)
      addLog({
        user: data.user.name,
        action: "LOGIN_SUCCESS",
        details: `Pengguna ${data.user.name} berhasil login.`,
      })
      router.push("/dashboard/overview")
    } catch {
      addLog({
        user: trimmedUsername,
        action: "LOGIN_FAIL",
        details: `Percobaan login gagal untuk username: ${trimmedUsername}.`,
      })
      toast({
        variant: "destructive",
        title: "Login Gagal",
        description: "Username atau password salah. Silakan coba lagi.",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <div className="mb-4 flex items-center justify-center">
            <Image
              className="h-8 w-8 text-primary"
              src={favicon}
              alt="logorsud"
            />
            <CardTitle className="text-2xl">SIRATU</CardTitle>
          </div>
          <CardDescription>
            Sistem Informasi Rapor Mutu - RSUD Oto Iskandar Dinata
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                name="username"
                type="text"
                placeholder="email@sim.rs"
                required
                disabled={isLoading}
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
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                  <span className="sr-only">
                    {showPassword
                      ? "Sembunyikan password"
                      : "Tampilkan password"}
                  </span>
                </button>
              </div>
            </div>
            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Memproses..." : "Login"}
            </Button>
          </form>
          <Alert className="mt-4">
            <Users className="h-4 w-4" />
            <AlertTitle>Akun Demo</AlertTitle>
            <AlertDescription>
              <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
                {users.map((user) => (
                  <li key={user.email}>
                    <b>{user.email}</b> ({user.name})
                  </li>
                ))}
              </ul>
              <p className="mt-2 text-xs">
                Password untuk semua akun: <b>123456</b>
              </p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
