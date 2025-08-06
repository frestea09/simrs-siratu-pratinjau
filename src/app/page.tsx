"use client"

import { useState } from "react"
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
import { Hospital, Users } from 'lucide-react'
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Terminal } from "lucide-react"

const users = {
  "admin@sim.rs": { password: "123456", name: "Admin Sistem" },
  "delina@sim.rs": { password: "123456", name: "Delina (PIC Mutu)" },
  "deti@sim.rs": { password: "123456", name: "Deti (PJ Ruangan)" },
  "devin@sim.rs": { password: "123456", name: "Devin (Komite Mutu)" },
}

export default function LoginPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")

  const handleLogin = () => {
    const user = users[username as keyof typeof users];
    if (user && user.password === password) {
      router.push("/dashboard/overview")
    } else {
      toast({
        variant: "destructive",
        title: "Login Gagal",
        description: "Username atau password salah.",
      })
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <div className="flex items-center justify-center mb-4">
            <Hospital className="h-8 w-8 mr-2 text-primary" />
            <CardTitle className="text-2xl">Si Ratu Web</CardTitle>
          </div>
          <CardDescription>
            Sistem Informasi Rapor Mutu - RSUD Oto Iskandar Dinata
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="username">Username</Label>
              <Input
                id="username"
                type="text"
                placeholder="email@sim.rs"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
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
              <Input 
                id="password" 
                type="password" 
                required 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleLogin()
                  }
                }}
              />
            </div>
            <Button onClick={handleLogin} type="submit" className="w-full">
              Login
            </Button>
          </div>
          <Alert className="mt-4">
            <Users className="h-4 w-4" />
            <AlertTitle>Akun Demo</AlertTitle>
            <AlertDescription>
              <ul className="list-disc pl-5 text-xs space-y-1 mt-2">
                {Object.entries(users).map(([email, user]) => (
                    <li key={email}><b>{email}</b> ({user.name})</li>
                ))}
              </ul>
               <p className="text-xs mt-2">Password untuk semua akun: <b>123456</b></p>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  )
}
