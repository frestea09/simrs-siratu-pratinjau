
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
import Image from "next/image"
import favicon from "@/app/favicon.ico"
import { login } from "@/lib/actions/auth"
import { useLogStore } from "@/store/log-store.tsx"
import {
  useUserStore,
  type UserRole,
  type User as StoreUser,
} from "@/store/user-store.tsx"

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { addLog } = useLogStore()
  const { setCurrentUser, users } = useUserStore()

  const handleLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)

    const formData = new FormData(event.currentTarget)

    try {
      // Server action 'login' sekarang akan mengembalikan data pengguna jika berhasil
      const user = await login(formData)
      if (!user) {
        throw new Error("User not found after login.")
      }

      // Simpan pengguna yang berhasil login ke dalam client-side store
      setCurrentUser(user as StoreUser)
      
      addLog({
        user: user.name,
        action: "LOGIN_SUCCESS",
        details: `Pengguna ${user.name} berhasil login.`,
      })
      router.push("/dashboard/overview")

    } catch (error: any) {
      const email = formData.get("email") as string;
      addLog({
        user: email || "Unknown",
        action: "LOGIN_FAIL",
        details: `Percobaan login gagal untuk email: ${email}.`,
      })
      toast({
        variant: "destructive",
        title: "Login Gagal",
        description: "Email atau password salah. Silakan coba lagi.",
      })
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <div className="mb-4 flex items-center justify-center gap-3">
            <Image
              className="h-10 w-10 text-primary"
              src={favicon}
              alt="logorsud"
            />
            <div>
              <CardTitle className="text-2xl">Selamat Datang di SIRATU</CardTitle>
              <CardDescription>
                Sistem Informasi Rapor Mutu RSUD Oto Iskandar Dinata
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email Pengguna</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="email@sim.rs"
                required
                disabled={isLoading}
                defaultValue="admin@sim.rs"
              />
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Password</Label>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  required
                  className="pr-10"
                  disabled={isLoading}
                  defaultValue="123456"
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
            <Button type="submit" className="w-full" disabled={isLoading} size="lg">
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isLoading ? "Memproses..." : "Login"}
            </Button>
          </form>
          {users.length > 0 && (
            <Alert className="mt-4">
                <Users className="h-4 w-4" />
                <AlertTitle>Akun Demo (untuk coba-coba)</AlertTitle>
                <AlertDescription>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-xs">
                    {users.map((user: any) => (
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
          )}
        </CardContent>
      </Card>
    </div>
  )
}
