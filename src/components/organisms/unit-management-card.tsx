"use client"

import * as React from 'react'
import { PlusCircle, Loader2, Pencil, Trash2 } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { useUnitStore, Unit } from '@/store/unit-store'
import { UnitDialog } from './unit-dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { useToast } from '@/hooks/use-toast'
import { useLogStore } from '@/store/log-store'
import { useUserStore } from '@/store/user-store'
import { isUnitManager } from '@/lib/role-guards'

const ITEMS_PER_PAGE = 5

export function UnitManagementCard() {
  const { units, isLoading, hasLoaded, error, fetchUnits, removeUnit } = useUnitStore()
  const { toast } = useToast()
  const { addLog } = useLogStore()
  const { currentUser } = useUserStore()
  const [search, setSearch] = React.useState('')
  const [isDialogOpen, setIsDialogOpen] = React.useState(false)
  const [unitToEdit, setUnitToEdit] = React.useState<Unit | null>(null)
  const [unitPendingDelete, setUnitPendingDelete] = React.useState<Unit | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false)
  const [page, setPage] = React.useState(1)

  React.useEffect(() => {
    if (!hasLoaded && !isLoading) {
      fetchUnits().catch(() => {})
    }
  }, [fetchUnits, hasLoaded, isLoading])

  const filteredUnits = React.useMemo(() => {
    const keyword = search.toLowerCase().trim()
    if (!keyword) return units
    return units.filter((unit) => unit.name.toLowerCase().includes(keyword))
  }, [search, units])

  const totalPages = React.useMemo(() => {
    if (filteredUnits.length === 0) return 1
    return Math.ceil(filteredUnits.length / ITEMS_PER_PAGE)
  }, [filteredUnits.length])

  const paginatedUnits = React.useMemo(() => {
    const start = (page - 1) * ITEMS_PER_PAGE
    return filteredUnits.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredUnits, page])

  const canManageUnits = React.useMemo(
    () => isUnitManager(currentUser?.role),
    [currentUser?.role]
  )

  React.useEffect(() => {
    setPage(1)
  }, [search])

  React.useEffect(() => {
    setPage((prev) => Math.min(prev, totalPages))
  }, [totalPages])

  const handleDialogChange = (open: boolean) => {
    if (!open) {
      setUnitToEdit(null)
    }
    setIsDialogOpen(open)
  }

  const handleAddClick = () => {
    setUnitToEdit(null)
    setIsDialogOpen(true)
  }

  const handleEdit = (unit: Unit) => {
    setUnitToEdit(unit)
    setIsDialogOpen(true)
  }

  const handleDelete = async () => {
    if (!unitPendingDelete) return
    try {
      await removeUnit(unitPendingDelete.id)
      addLog({
        user: currentUser?.name || 'System',
        action: 'DELETE_UNIT',
        details: `Unit ${unitPendingDelete.name} dihapus dari daftar.`,
      })
      toast({
        title: 'Unit dihapus',
        description: 'Daftar unit telah diperbarui.',
      })
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat menghapus unit.'
      toast({
        variant: 'destructive',
        title: 'Gagal menghapus unit',
        description: message,
      })
    } finally {
      setUnitPendingDelete(null)
      setIsDeleteDialogOpen(false)
    }
  }

  const promptDelete = (unit: Unit) => {
    setUnitPendingDelete(unit)
    setIsDeleteDialogOpen(true)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Unit Pelayanan</CardTitle>
        <CardDescription>
          Tambah, ubah, atau hapus daftar unit yang muncul pada formulir lain. Bahasa dibuat sederhana agar mudah dipahami oleh
          rekan non-teknis maupun senior.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Cari nama unit..."
            className="md:max-w-sm"
            aria-label="Cari unit"
          />
          {canManageUnits ? (
            <Button onClick={handleAddClick} className="md:ml-auto" size="lg">
              <PlusCircle className="mr-2 h-5 w-5" />
              Tambah Unit
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground md:ml-auto">
              Hanya Admin Sistem dan Direktur yang dapat mengubah daftar unit.
            </p>
          )}
        </div>
        <p className="text-sm text-muted-foreground">
          Tips: gunakan nama yang sudah akrab, misalnya “RANAP” atau “Rawat Inap”. Hal ini membantu petugas senior memilih opsi dengan cepat.
        </p>
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[60px]">No.</TableHead>
                <TableHead>Nama Unit</TableHead>
                {canManageUnits && <TableHead className="w-[160px] text-right">Aksi</TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {!hasLoaded && isLoading ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    <div className="flex items-center justify-center gap-2 text-muted-foreground">
                      <Loader2 className="h-4 w-4 animate-spin" /> Memuat data unit...
                    </div>
                  </TableCell>
                </TableRow>
              ) : error ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center text-destructive">
                    {error}
                  </TableCell>
                </TableRow>
              ) : filteredUnits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="h-24 text-center">
                    {search ? 'Tidak ada unit dengan kata tersebut.' : 'Belum ada data unit.'}
                  </TableCell>
                </TableRow>
              ) : (
                paginatedUnits.map((unit, index) => (
                  <TableRow key={unit.id}>
                    <TableCell className="font-medium">{(page - 1) * ITEMS_PER_PAGE + index + 1}</TableCell>
                    <TableCell>{unit.name}</TableCell>
                    {canManageUnits && (
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button variant="outline" size="sm" onClick={() => handleEdit(unit)}>
                            <Pencil className="mr-1 h-4 w-4" /> Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="text-destructive hover:text-destructive"
                            onClick={() => promptDelete(unit)}
                          >
                            <Trash2 className="mr-1 h-4 w-4" /> Hapus
                          </Button>
                        </div>
                      </TableCell>
                    )}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        {filteredUnits.length > 0 && (
          <div className="flex flex-col gap-2 text-sm text-muted-foreground md:flex-row md:items-center md:justify-between">
            <p>
              Menampilkan {Math.min((page - 1) * ITEMS_PER_PAGE + 1, filteredUnits.length)}-
              {Math.min(page * ITEMS_PER_PAGE, filteredUnits.length)} dari {filteredUnits.length} unit
            </p>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
                Sebelumnya
              </Button>
              <span>
                Halaman {page} dari {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || filteredUnits.length === 0}
              >
                Selanjutnya
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <UnitDialog open={isDialogOpen} onOpenChange={handleDialogChange} unit={unitToEdit} />
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {unitPendingDelete ? `Hapus unit "${unitPendingDelete.name}"?` : 'Hapus unit'}
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Unit yang dihapus tidak akan muncul lagi pada pilihan formulir.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              onClick={() => {
                setIsDeleteDialogOpen(false)
                setUnitPendingDelete(null)
              }}
            >
              Batal
            </AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}
