"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { LogTable } from "@/components/organisms/log-table"
import { useLogStore } from "@/store/log-store"

export default function LogsPage() {
  const logs = useLogStore((state) => state.logs)

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Log Aktivitas Sistem</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Log Aktivitas</CardTitle>
          <CardDescription>
            Rekaman semua aktivitas penting yang terjadi di dalam sistem.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <LogTable logs={logs} />
        </CardContent>
      </Card>
    </div>
  )
}
