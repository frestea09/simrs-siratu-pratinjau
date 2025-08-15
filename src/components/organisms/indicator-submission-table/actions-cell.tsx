
"use client"

import * as React from "react"
import { Row } from "@tanstack/react-table"
import { MoreHorizontal, Eye, Pencil } from "lucide-react"

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
import { useLogStore } from "@/store/log-store"
import { useNotificationStore } from "@/store/notification-store"
import { useIndicatorStore } from "@/store/indicator-store"
import { IndicatorSubmissionDialog } from "../indicator-submission-dialog"
import { IndicatorSubmissionDetailDialog } from "../indicator-submission-detail-dialog"
import { RejectionReasonDialog } from "../rejection-reason-dialog"
import { statusOptions } from "../indicator-submission-table"
import type { User } from "@prisma/client"


type ActionsCellProps = {
  row: Row<SubmittedIndicator>
  currentUser: User | null
}

export function ActionsCell({ row, currentUser }: ActionsCellProps) {
    const indicator = row.original
    const [isDetailOpen, setIsDetailOpen] = React.useState(false)
    const [isEditOpen, setIsEditOpen] = React.useState(false)
    const [rejectionDialog, setRejectionDialog] = React.useState({ isOpen: false, indicator: null as SubmittedIndicator | null })
    
    const { updateSubmittedIndicatorStatus } = useIndicatorStore.getState()
    const { addLog } = useLogStore()
    const { addNotification } = useNotificationStore()

    const handleStatusChange = (indicator: SubmittedIndicator, status: SubmittedIndicator['status'], reason?: string) => {
        updateSubmittedIndicatorStatus(indicator.id, status, reason)
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

    const canVerify = currentUser?.role === 'ADMIN_SISTEM' || 
                      currentUser?.role === 'DIREKTUR' ||
                      currentUser?.role === 'SUB_KOMITE_PENINGKATAN_MUTU';

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
                    {canVerify && (
                        <>
                            <DropdownMenuSeparator />
                            <DropdownMenuSub>
                                <DropdownMenuSubTrigger>Ubah Status</DropdownMenuSubTrigger>
                                <DropdownMenuSubContent>
                                    {statusOptions.map((status) => (
                                    <DropdownMenuItem 
                                        key={status} 
                                        onSelect={() => {
                                        if (status === 'Ditolak') {
                                            openRejectionDialog(indicator);
                                        } else {
                                            handleStatusChange(indicator, status);
                                        }
                                        }}
                                    >
                                        {status}
                                    </DropdownMenuItem>
                                    ))}
                                </DropdownMenuSubContent>
                            </DropdownMenuSub>
                        </>
                    )}
                </DropdownMenuContent>
            </DropdownMenu>

            <IndicatorSubmissionDetailDialog indicator={indicator} open={isDetailOpen} onOpenChange={setIsDetailOpen} />
            <IndicatorSubmissionDialog indicator={indicator} open={isEditOpen} setOpen={setIsEditOpen} currentUser={currentUser} />
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

    