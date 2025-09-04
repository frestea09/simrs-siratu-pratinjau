

"use client"

import * as React from "react"
import { Row } from "@tanstack/react-table"
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu"
import { SubmittedIndicator } from "@/store/indicator-store"
import { useUserStore } from "@/store/user-store.tsx"
import { useLogStore } from "@/store/log-store.tsx"
import { useNotificationStore } from "@/store/notification-store.tsx"
import { useIndicatorStore } from "@/store/indicator-store"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../../ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { IndicatorSubmissionDialog } from "../indicator-submission-dialog"
import { IndicatorSubmissionDetailDialog } from "../indicator-submission-detail-dialog"
import { RejectionReasonDialog } from "../rejection-reason-dialog"
import { statusOptions } from "../indicator-submission-table"


type ActionsCellProps = {
  row: Row<SubmittedIndicator>
}

export function ActionsCell({ row }: ActionsCellProps) {
    const indicator = row.original
    const [isDetailOpen, setIsDetailOpen] = React.useState(false)
    const [isEditOpen, setIsEditOpen] = React.useState(false)
    const [rejectionDialog, setRejectionDialog] = React.useState({ isOpen: false, indicator: null as SubmittedIndicator | null })
    
    const { updateSubmittedIndicatorStatus, removeSubmittedIndicator } = useIndicatorStore()
    const { currentUser } = useUserStore()
    const { addLog } = useLogStore()
    const { addNotification } = useNotificationStore()
    const { toast } = useToast()

    const handleStatusChange = async (indicator: SubmittedIndicator, status: SubmittedIndicator['status'], reason?: string) => {
        await updateSubmittedIndicatorStatus(indicator.id, status, reason)
        addLog({
            user: currentUser?.name || 'System',
            action: 'UPDATE_INDICATOR_STATUS',
            details: `Status indikator "${indicator.name}" (${indicator.id}) diubah menjadi ${status}.`,
        });
        addNotification({
            title: `Pengajuan Indikator ${status}`,
            description: `Pengajuan Anda untuk indikator "${indicator.name}" telah ${status}.`,
            link: '/dashboard/indicators',
            recipientUnit: indicator.unit
        });
    }
    
    const openRejectionDialog = (indicator: SubmittedIndicator) => {
        setRejectionDialog({ isOpen: true, indicator });
    };

    const canVerify = currentUser?.role === 'Admin Sistem' ||
                      currentUser?.role === 'Direktur' ||
                      currentUser?.role === 'Sub. Komite Peningkatan Mutu';

    const handleDelete = async () => {
        await removeSubmittedIndicator(indicator.id)
        addLog({
            user: currentUser?.name || 'System',
            action: 'DELETE_SUBMITTED_INDICATOR',
            details: `Pengajuan indikator "${indicator.name}" (${indicator.id}) dihapus.`,
        })
        addNotification({
            title: 'Pengajuan Indikator Dihapus',
            description: `Pengajuan indikator "${indicator.name}" telah dihapus.`,
            link: '/dashboard/indicators',
            recipientUnit: indicator.unit,
        })
        toast({
            title: 'Indikator Dihapus',
            description: `Pengajuan indikator "${indicator.name}" telah dihapus.`,
        })
    }

    return (
        <>
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                    <DropdownMenuItem onSelect={() => setIsDetailOpen(true)}>
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat Detail
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setIsEditOpen(true)}>
                        <Pencil className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigator.clipboard.writeText(indicator.id)}>
                        Salin ID Indikator
                    </DropdownMenuItem>
                    {canVerify && indicator.status === 'Menunggu Persetujuan' && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>Ubah Status</DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    <DropdownMenuItem onSelect={() => handleStatusChange(indicator, 'Diverifikasi')}>
                                        Verifikasi
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onSelect={() => openRejectionDialog(indicator)}>
                                        Tolak
                                    </DropdownMenuItem>
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                        </>
                    )}
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
                                    Aksi ini tidak dapat dibatalkan. Ini akan menghapus pengajuan indikator secara permanen.
                                </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                                <AlertDialogCancel>Batal</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Hapus</AlertDialogAction>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialog>
                </DropdownMenuContent>
            </DropdownMenu>

            <IndicatorSubmissionDetailDialog indicator={indicator} open={isDetailOpen} onOpenChange={setIsDetailOpen} />
            <IndicatorSubmissionDialog indicator={indicator} open={isEditOpen} setOpen={setIsEditOpen} />
            <RejectionReasonDialog
                open={rejectionDialog.isOpen}
                onOpenChange={(isOpen) => setRejectionDialog({ isOpen, indicator: null })}
                onSubmit={(reason) => {
                if (rejectionDialog.indicator) {
                    handleStatusChange(rejectionDialog.indicator, 'Ditolak', reason);
                }
                }}
            />
        </>
    )
}
