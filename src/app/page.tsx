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
import { Hospital } from 'lucide-react'

export default function LoginPage() {
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
              <Label htmlFor="email">Username</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
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
              <Input id="password" type="password" required />
            </div>
            <Button type="submit" className="w-full as" asChild>
              <Link href="/dashboard/overview">Login</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
