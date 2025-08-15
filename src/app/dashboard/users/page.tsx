
"use server"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { UserDialog } from "@/components/organisms/user-dialog"
import { UserTable } from "@/components/organisms/user-table"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import prisma from "@/lib/prisma"
import { getCurrentUser } from "@/lib/actions/auth"
import { UsersPageClient } from "./page-client"

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' }
  });
  const currentUser = await getCurrentUser();

  return <UsersPageClient users={users} currentUser={currentUser} />
}
