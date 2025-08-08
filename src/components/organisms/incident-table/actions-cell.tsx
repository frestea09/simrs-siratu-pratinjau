
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Incident } from "@/store/incident-store"
import { IncidentReportDialog } from "../incident-report-dialog"

type ActionsCellProps = {
  row: Row<Incident>;
  onViewDetails: (incident: Incident) => void;
}

export function ActionsCell({ row, onViewDetails }: ActionsCellProps) {
  const incident = row.original
  const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false)

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
          <DropdownMenuItem onClick={() => navigator.clipboard.writeText(incident.id)}>
            Salin ID
          </DropdownMenuItem>
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
