
"use client"

import * as React from "react"
import { Row } from "@tanstack/react-table"
import { MoreHorizontal, Eye, Pencil, CheckCircle, ShieldQuestion } from "lucide-react"

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

type ActionsCellProps = {
  row: Row<Incident>;
  onViewDetails: (incident: Incident) => void;
}

export function ActionsCell({ row, onViewDetails }: ActionsCellProps) {
  const incident = row.original
  const { currentUser } = useUserStore();
  const addLog = useLogStore((state) => state.addLog);
  const { updateIncidentStatus } = useIncidentStore()
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)

  const canChangeStatus = currentUser?.role === 'Admin Sistem' || currentUser?.role === 'Sub. Komite Keselamatan Pasien';

  const handleStatusChange = (status: IncidentStatus) => {
    updateIncidentStatus(incident.id, status)
    addLog({
      user: currentUser?.name || 'System',
      action: 'UPDATE_INCIDENT',
      details: `Status insiden ${incident.id} diubah menjadi ${status}.`
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
                  <DropdownMenuItem onClick={() => handleStatusChange('Investigasi')}>
                    <ShieldQuestion className="mr-2 h-4 w-4" />
                    <span>Investigasi</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleStatusChange('Selesai')}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    <span>Selesai</span>
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
            </>
          )}
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
