
"use client"

import React from "react"
import { useRouter } from "next/navigation"
import { Bell, CheckCheck, Trash2 } from "lucide-react"

import { useNotificationStore, Notification } from "@/store/notification-store.ts"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

const NotificationItem = ({ notification, onClick }: { notification: Notification, onClick: (id: string, link?: string) => void }) => (
  <div
    onClick={() => onClick(notification.id, notification.link)}
    className={cn(
      "flex items-start gap-4 p-4 border-b transition-colors hover:bg-muted/50 cursor-pointer",
      !notification.isRead && "bg-primary/5 font-semibold"
    )}
  >
    {!notification.isRead && <div className="mt-1.5 h-2.5 w-2.5 rounded-full bg-primary flex-shrink-0" />}
    <div className={cn("flex-1 space-y-1", notification.isRead && "pl-7")}>
      <p className="text-sm font-medium leading-none">{notification.title}</p>
      <p className={cn("text-sm text-muted-foreground", !notification.isRead && "text-foreground/80")}>{notification.description}</p>
      <p className="text-xs text-muted-foreground/80">
        {new Date(notification.timestamp).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })}
      </p>
    </div>
  </div>
)

export default function NotificationsPage() {
  const { notifications, markAsRead, markAllAsRead, clearNotifications } = useNotificationStore()
  const router = useRouter()

  const handleNotificationClick = (id: string, link?: string) => {
    markAsRead(id)
    if (link) {
      router.push(link)
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Notifikasi</h2>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Semua Notifikasi</CardTitle>
          <CardDescription>Daftar semua notifikasi yang Anda terima.</CardDescription>
          {notifications.length > 0 && (
            <div className="flex items-center gap-2 pt-2">
              <Button onClick={markAllAsRead}>Tandai semua dibaca</Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="destructive">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Hapus Semua
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Anda yakin ingin menghapus semua notifikasi?</AlertDialogTitle>
                    <AlertDialogDescription>
                      Tindakan ini tidak dapat dibatalkan. Semua notifikasi akan dihapus secara permanen.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Batal</AlertDialogCancel>
                    <AlertDialogAction onClick={clearNotifications}>Hapus</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          )}
        </CardHeader>
        <CardContent className="p-0">
          {notifications.length > 0 ? (
            <div className="border-t">
              {notifications.map((notif) => (
                <NotificationItem key={notif.id} notification={notif} onClick={handleNotificationClick} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center p-12 text-center text-muted-foreground border-t">
              <CheckCheck className="h-16 w-16 mb-4" />
              <p className="text-lg font-semibold">Tidak ada notifikasi</p>
              <p>Anda akan melihat pemberitahuan di sini saat ada aktivitas baru.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
