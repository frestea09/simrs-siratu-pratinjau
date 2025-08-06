
"use client"

import * as React from "react"
import {
  ColumnDef,
  ColumnFiltersState,
  SortingState,
  VisibilityState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreHorizontal, Pencil, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { User, useUserStore, UserRole } from "@/store/user-store.tsx"
import { UserDialog } from "./user-dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "../ui/alert-dialog"
import { useLogStore } from "@/store/log-store.tsx"
import { useToast } from "@/hooks/use-toast"


const ActionsCell = ({ row }: { row: any }) => {
    const user = row.original as User;
    const { removeUser, currentUser } = useUserStore();
    const { addLog } = useLogStore();
    const { toast } = useToast();

    const handleDelete = () => {
        if (currentUser?.id === user.id) {
            toast({
                variant: "destructive",
                title: "Aksi Ditolak",
                description: "Anda tidak dapat menghapus akun Anda sendiri.",
            })
            return;
        }
        removeUser(user.id);
        addLog({
            user: currentUser?.name || 'System',
            action: 'DELETE_USER',
            details: `Pengguna ${user.name} (${user.email}) dihapus.`,
        });
        toast({
            title: "Pengguna Dihapus",
            description: `Pengguna ${user.name} telah berhasil dihapus.`,
        });
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuLabel>Aksi</DropdownMenuLabel>
                <DropdownMenuItem asChild>
                    <UserDialog user={user} trigger={
                        <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full">
                            <Pencil className="mr-2 h-4 w-4" />
                            <span>Edit</span>
                        </button>
                    } />
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <AlertDialog>
                    <AlertDialogTrigger asChild>
                        <button className="relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50 w-full text-destructive">
                           <Trash2 className="mr-2 h-4 w-4" />
                            <span>Hapus</span>
                        </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                        <AlertDialogHeader>
                            <AlertDialogTitle>Anda yakin?</AlertDialogTitle>
                            <AlertDialogDescription>
                                Aksi ini tidak dapat dibatalkan. Ini akan menghapus pengguna secara permanen dari sistem.
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
    )
}

export const columns: ColumnDef<User>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Nama
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
    {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "role",
    header: "Peran",
    cell: ({ row }) => <Badge variant="secondary">{row.getValue("role")}</Badge>,
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id))
    },
  },
  {
    accessorKey: "unit",
    header: "Unit",
    cell: ({ row }) => <div>{row.getValue("unit") || "-"}</div>,
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ActionsCell,
  },
]

const roleOptions: UserRole[] = ['Admin Sistem', 'PIC Mutu', 'PJ Ruangan', 'Komite Mutu', 'Kepala Unit/Instalasi', 'Direktur'];

type UserTableProps = {
  users: User[]
}

export function UserTable({ users: initialUsers }: UserTableProps) {
  const [isClient, setIsClient] = React.useState(false);
  const users = useUserStore((state) => state.users);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const data = isClient ? users : initialUsers;


  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])

  const table = useReactTable({
    data,
    columns,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4 gap-2">
        <Input
          placeholder="Cari berdasarkan email..."
          value={(table.getColumn("email")?.getFilterValue() as string) ?? ""}
          onChange={(event) =>
            table.getColumn("email")?.setFilterValue(event.target.value)
          }
          className="max-w-sm"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="ml-auto">
              Peran <ChevronDown className="ml-2 h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Filter berdasarkan peran</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {roleOptions.map((role) => (
              <DropdownMenuCheckboxItem
                key={role}
                className="capitalize"
                checked={
                  (table.getColumn("role")?.getFilterValue() as string[] | undefined)?.includes(role) ?? false
                }
                onCheckedChange={(value) => {
                   const currentFilter = (table.getColumn("role")?.getFilterValue() as string[] | undefined) || [];
                   const newFilter = value ? [...currentFilter, role] : currentFilter.filter(s => s !== role);
                   table.getColumn("role")?.setFilterValue(newFilter.length ? newFilter : undefined);
                }}
              >
                {role}
              </DropdownMenuCheckboxItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  Tidak ada hasil.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Sebelumnya
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Berikutnya
        </Button>
      </div>
    </div>
  )
}
