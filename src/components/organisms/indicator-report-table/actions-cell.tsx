
"use client"

import * as React from "react"
import { Row } from "@tanstack/react-table"
import { MoreHorizontal, Eye, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Indicator, useIndicatorStore } from "@/store/indicator-store"
import { ReportDetailDialog } from "../report-detail-dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"
import { useLogStore } from "@/store/log-store"
import { useUserStore } from "@/store/user-store"

type ActionsCellProps = {
    row: Row<Indicator>,
    onEdit: (indicator: Indicator) => void;
}

export function ActionsCell({ row, onEdit }: ActionsCellProps) {
    const indicator = row.original
    const [isDetailOpen, setIsDetailOpen] = React.useState(false);
    
    const { removeIndicator } = useIndicatorStore();
    const { toast } = useToast();
    const { addLog } = useLogStore();
    const { currentUser } = useUserStore();

    const handleDelete = () => {
        removeIndicator(indicator.id);
        addLog({
            user: currentUser?.name || 'System',
            action: 'DELETE_USER',
            details: `Data capaian untuk "${indicator.indicator}" periode ${indicator.period} dihapus.`
        });
        toast({
            title: "Data Capaian Dihapus",
            description: `Data untuk indikator "${indicator.indicator}" telah berhasil dihapus.`,
            variant: "destructive"
        });
    }

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
                        <DropdownMenuItem onClick={() => onEdit(indicator)}>
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                        </DropdownMenuItem>
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
                                    <AlertDialogTitle>Anda yakin ingin menghapus data ini?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Aksi ini tidak dapat dibatalkan. Ini akan menghapus data capaian indikator untuk periode ini secara permanen.
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
            </div>
            
            <ReportDetailDialog 
                indicator={indicator}
                open={isDetailOpen}
                onOpenChange={setIsDetailOpen}
            />
        </>
    )
}
