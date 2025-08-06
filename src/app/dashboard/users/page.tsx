"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserDialog } from "@/components/organisms/user-dialog"
import { UserTable } from "@/components/organisms/user-table"
import { useUserStore } from "@/store/user-store.tsx"

export default function UsersPage() {
  const users = useUserStore((state) => state.users)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Manajemen Pengguna</h2>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar Pengguna</CardTitle>
              <CardDescription>
                Kelola akun pengguna dan hak akses sistem.
              </CardDescription>
            </div>
            <UserDialog />
          </div>
        </CardHeader>
        <CardContent>
          <UserTable users={users} />
        </CardContent>
      </Card>
    </div>
  )
}
