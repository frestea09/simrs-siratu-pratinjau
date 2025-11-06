

"use client"

import * as React from "react"
import { Row } from "@tanstack/react-table"
import { MoreHorizontal, Eye, Pencil, Trash2, Send, FileCheck2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { IndicatorProfile, useIndicatorStore } from "@/store/indicator-store"
import { useUserStore } from "@/store/user-store.tsx"
import { centralRoles } from "@/store/central-roles"
import { useLogStore } from "@/store/log-store.tsx"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { ProfileDialog } from "../profile-dialog"
// import { ProfileDetailDialog } from "../profile-detail-dialog" // This will be created later

type ActionsCellProps = {
  row: Row<IndicatorProfile>
}

export function ActionsCell({ row }: ActionsCellProps) {
    const profile = row.original
    const [isDetailOpen, setIsDetailOpen] = React.useState(false)
    const [isEditOpen, setIsEditOpen] = React.useState(false)
    
    const { updateProfile, removeProfile } = useIndicatorStore()
    const { currentUser } = useUserStore()
    const { addLog } = useLogStore()
    const { toast } = useToast()

    const isCentralUser = currentUser ? centralRoles.includes(currentUser.role) : false
    const canManageProfile = currentUser ? (isCentralUser || currentUser.id === profile.createdBy) : false
    const canEdit = canManageProfile
    const canSubmit = canManageProfile && (profile.status === 'Draf' || profile.status === 'Ditolak')
    const canApprove = isCentralUser && profile.status === 'Menunggu Persetujuan'
    const hasAnyAction = canEdit || canSubmit || canApprove

    const handleStatusChange = async (status: IndicatorProfile['status']) => {
        await updateProfile(profile.id, { status });
        addLog({
            user: currentUser?.name || 'System',
            action: 'UPDATE_INDICATOR', // Assuming this is a valid log action
            details: `Status profil "${profile.title}" diubah menjadi ${status}.`,
        });
        toast({ title: "Status Profil Diperbarui", description: `Profil "${profile.title}" sekarang berstatus ${status}.`})
    }

    const handleDelete = async () => {
        await removeProfile(profile.id)
        addLog({
            user: currentUser?.name || 'System',
            action: 'DELETE_INDICATOR', // Assuming this is a valid log action
            details: `Profil indikator "${profile.title}" dihapus.`,
        })
        toast({
            title: 'Profil Dihapus',
            description: `Profil indikator "${profile.title}" telah dihapus.`,
        })
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0" disabled={!hasAnyAction}>
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                {hasAnyAction && (
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                    {/* <DropdownMenuItem onSelect={() => setIsDetailOpen(true)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat Detail
                    </DropdownMenuItem> */}
                    {canEdit && (
                        <DropdownMenuItem onSelect={() => setIsEditOpen(true)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            Edit
                        </DropdownMenuItem>
                    )}
                    {canEdit && canSubmit && (
                        <DropdownMenuItem onSelect={() => handleStatusChange('Menunggu Persetujuan')}>
                            <Send className="mr-2 h-4 w-4" />
                            Ajukan Persetujuan
                        </DropdownMenuItem>
                    )}
                     {canApprove && (
                        <DropdownMenuItem onSelect={() => handleStatusChange('Disetujui')}>
                            <FileCheck2 className="mr-2 h-4 w-4" />
                            Setujui Profil
                        </DropdownMenuItem>
                    )}
                    {canEdit && (
                        <>
                            <DropdownMenuSeparator />
                            <AlertDialog>
                                <AlertDialogTrigger asChild>
                                    <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-destructive">
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Hapus
                                    </button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                    <AlertDialogHeader>
                                        <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
                                        <AlertDialogDescription>
                                            Aksi ini tidak dapat dibatalkan. Ini akan menghapus draf profil indikator secara permanen.
                                        </AlertDialogDescription>
                                    </AlertDialogHeader>
                                    <AlertDialogFooter>
                                        <AlertDialogCancel>Batal</AlertDialogCancel>
                                        <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Hapus</AlertDialogAction>
                                    </AlertDialogFooter>
                                </AlertDialogContent>
                            </AlertDialog>
                        </>
                    )}
                </DropdownMenuContent>
                )}
            </DropdownMenu>

            {/* <ProfileDetailDialog profile={profile} open={isDetailOpen} onOpenChange={setIsDetailOpen} /> */}
            <ProfileDialog profile={profile} open={isEditOpen} onOpenChange={setIsEditOpen} />
        </>
    )
}
