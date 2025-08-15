
"use server"

import React from "react"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { SettingsForm } from "./form-client"
import { getCurrentUser } from "@/lib/actions/auth"

export default async function SettingsPage() {
  const currentUser = await getCurrentUser()

  if (!currentUser) {
    return <div>Loading...</div>
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Pengaturan Akun</h2>
      <SettingsForm currentUser={currentUser} />
    </div>
  )
}
