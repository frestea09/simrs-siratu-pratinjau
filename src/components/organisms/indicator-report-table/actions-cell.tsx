
"use client"

import { Row } from "@tanstack/react-table"
import { MoreHorizontal, Eye, Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { IndicatorInputDialog } from "../indicator-input-dialog"
import { Indicator } from "@/store/indicator-store"

type ActionsCellProps = {
    row: Row<Indicator>,
    onDetailClick: () => void,
}

export function ActionsCell({ row, onDetailClick }: ActionsCellProps) {
    const indicator = row.original

    return (
        <div className="text-center">
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Buka menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={onDetailClick}>
                        <Eye className="mr-2 h-4 w-4" />
                        Lihat Detail
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                        <IndicatorInputDialog 
                            indicatorToEdit={indicator} 
                            category={indicator.category}
                            trigger={
                                <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full">
                                    <Pencil className="mr-2 h-4 w-4" />
                                    <span>Edit</span>
                                </button>
                            } 
                        />
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </div>
    )
}
