
"use client"

import React from "react"
import { Bell, CheckCheck, CircleAlert } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { useNotificationStore } from "@/store/notification-store.ts"
import { cn } from "@/lib/utils"
import { Badge } from "../ui/badge"

export function NotificationPopover() {
    const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotificationStore()
    const router = useRouter()

    const handleNotificationClick = (notificationId: string, link?: string) => {
        markAsRead(notificationId)
        if (link) {
            router.push(link)
        }
    }

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative rounded-full w-10 h-10">
                    <Bell className="h-6 w-6" />
                    {unreadCount > 0 && (
                        <Badge
                            variant="destructive"
                            className="absolute top-1 right-1 h-5 w-5 justify-center p-0 rounded-full"
                        >
                            {unreadCount}
                        </Badge>
                    )}
                    <span className="sr-only">Notifikasi</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0">
                <div className="flex items-center justify-between p-3 border-b">
                    <h3 className="font-semibold text-lg">Notifikasi</h3>
                    {notifications.length > 0 && (
                        <Button
                            variant="link"
                            size="sm"
                            className="text-primary p-0 h-auto"
                            onClick={() => markAllAsRead()}
                            disabled={unreadCount === 0}
                        >
                            Tandai semua dibaca
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-96">
                    {notifications.length > 0 ? (
                        <div className="divide-y">
                            {notifications.map((notif) => (
                                <div
                                    key={notif.id}
                                    onClick={() => handleNotificationClick(notif.id, notif.link)}
                                    className={cn(
                                        "p-3 hover:bg-muted/50 cursor-pointer",
                                        !notif.isRead && "bg-primary/5"
                                    )}
                                >
                                    <div className="flex items-start gap-3">
                                        {!notif.isRead && <div className="mt-1.5 h-2 w-2 rounded-full bg-primary" />}
                                        <div className="flex-1 space-y-1">
                                            <p className="font-medium">{notif.title}</p>
                                            <p className="text-sm text-muted-foreground">{notif.description}</p>
                                            <p className="text-xs text-muted-foreground/80">
                                                {new Date(notif.timestamp).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full p-6 text-center text-muted-foreground">
                            <CheckCheck className="h-12 w-12 mb-4" />
                            <p className="font-semibold">Semua sudah terbaca</p>
                            <p className="text-sm">Tidak ada notifikasi baru untuk saat ini.</p>
                        </div>
                    )}
                </ScrollArea>
                <Separator />
                <div className="p-2 text-center">
                    <Link href="/dashboard/notifications" passHref>
                        <Button variant="link" className="w-full">
                            Lihat semua notifikasi
                        </Button>
                    </Link>
                </div>
            </PopoverContent>
        </Popover>
    )
}
