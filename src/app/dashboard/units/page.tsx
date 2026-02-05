"use client"

import React from "react"
import { UnitManagementCard } from "@/components/organisms/unit-management-card"
import { useUserStore } from "@/store/user-store.tsx"
import { isUnitManager } from "@/lib/role-guards"
import { useRouter } from "next/navigation"

export default function UnitsPage() {
    const { currentUser } = useUserStore()
    const router = useRouter()

    React.useEffect(() => {
        if (currentUser && !isUnitManager(currentUser.role)) {
            router.push("/dashboard/overview")
        }
    }, [currentUser, router])

    if (!currentUser || !isUnitManager(currentUser.role)) {
        return null
    }

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Manajemen Unit</h2>
            </div>
            <UnitManagementCard />
        </div>
    )
}
