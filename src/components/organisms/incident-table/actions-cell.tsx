
"use client"

import * as React from "react"
import { Row } from "@tanstack/react-table"
import { MoreHorizontal, Eye, Pencil, CheckCircle, ShieldQuestion, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger
} from "@/components/ui/dropdown-menu"
import { Incident, IncidentStatus, useIncidentStore } from "@/store/incident-store"
import { IncidentReportDialog } from "../incident-report-dialog"
import { useUserStore } from "@/store/user-store.tsx"
import { useLogStore } from "@/store/log-store.tsx"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

type ActionsCellProps = {
  row: Row<Incident>;
  onViewDetails: (incident: Incident) => void;
}

export function ActionsCell({ row, onViewDetails }: ActionsCellProps) {
  const incident = row.original
  const { currentUser } = useUserStore();
  const { addLog } = useLogStore();
  const { updateIncident, removeIncident } = useIncidentStore()
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)

  const canChangeStatus = currentUser?.role === 'Admin Sistem' || currentUser?.role === 'Sub. Komite Keselamatan Pasien';

  const handleStatusChange = async (status: IncidentStatus) => {
    await updateIncident(incident.id, { status })
    addLog({
      user: currentUser?.name || 'System',
      action: 'UPDATE_INCIDENT',
      details: `Status insiden ${incident.id} diubah menjadi ${status}.`
    })
  }

  const handleDelete = async () => {
    await removeIncident(incident.id)
    addLog({
      user: currentUser?.name || 'System',
      action: 'DELETE_INCIDENT',
      details: `Laporan insiden ${incident.id} dihapus.`,
    })
    toast({
      title: "Laporan Dihapus",
      description: `Laporan insiden ${incident.id} telah berhasil dihapus.`,
    })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Buka menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Aksi</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => onViewDetails(incident)}>
            <Eye className="mr-2 h-4 w-4" />
            Lihat Detail
          </DropdownMenuItem>
          <DropdownMenuItem onSelect={() => setIsEditDialogOpen(true)}>
             <Pencil className="mr-2 h-4 w-4" />
             Edit
          </DropdownMenuItem>
          {canChangeStatus && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  Ubah Status
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={async () => await handleStatusChange('Investigasi')}>
                    <ShieldQuestion className="mr-2 h-4 w-4" />
                    <span>Investigasi</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={async () => await handleStatusChange('Selesai')}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    <span>Selesai</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </>
          )}
          <DropdownMenuSeparator />
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button className="relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-destructive hover:bg-destructive/10">
                <Trash2 className="mr-2 h-4 w-4" />
                <span>Hapus</span>
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
                <AlertDialogDescription>
                  Aksi ini tidak dapat dibatalkan. Ini akan menghapus laporan insiden secara permanen.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Batal</AlertDialogCancel>
                <AlertDialogAction onClick={async () => handleDelete()} className="bg-destructive hover:bg-destructive/90">Hapus</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </DropdownMenuContent>
      </DropdownMenu>

      <IncidentReportDialog 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        incident={incident}
      />
    </>
  )
}
