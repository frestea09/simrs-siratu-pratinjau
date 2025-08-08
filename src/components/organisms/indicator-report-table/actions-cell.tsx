
"use client"

import * as React from "react"
import { Row } from "@tanstack/react-table"
import { MoreHorizontal, Eye, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { IndicatorInputDialog } from "../indicator-input-dialog"
import { Indicator } from "@/store/indicator-store"
import { ReportDetailDialog } from "../report-detail-dialog"

type ActionsCellProps = {
    row: Row<Indicator>,
}

export function ActionsCell({ row }: ActionsCellProps) {
    const indicator = row.original
    const [isDetailOpen, setIsDetailOpen] = React.useState(false);
    const [isEditDialogOpen, setIsEditDialogOpen] = React.useState(false);

    return (
        <>
            <div className="text-center">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Buka menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => setIsDetailOpen(true)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Lihat Detail
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setIsEditDialogOpen(true)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
            
            <ReportDetailDialog 
                indicator={indicator}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
            />

            <IndicatorInputDialog 
                open={isEditDialogOpen}
                onOpenChange={setIsEditDialogOpen}
                indicatorToEdit={indicator} 
                category={indicator.category}
            />
        </>
    )
}
