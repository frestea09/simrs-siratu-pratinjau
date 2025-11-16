"use client"

import * as React from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import * as z from 'zod'

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { useUnitStore, Unit } from '@/store/unit-store'
import { useToast } from '@/hooks/use-toast'
import { useLogStore } from '@/store/log-store'
import { useUserStore } from '@/store/user-store'

const unitSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Nama unit minimal 2 karakter.' })
    .max(80, { message: 'Nama unit terlalu panjang.' }),
})

type UnitDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  unit?: Unit | null
}

type UnitFormValues = z.infer<typeof unitSchema>

export function UnitDialog({ open, onOpenChange, unit }: UnitDialogProps) {
  const { addUnit, updateUnit } = useUnitStore()
  const { toast } = useToast()
  const { addLog } = useLogStore()
  const { currentUser } = useUserStore()
  const isEditMode = Boolean(unit)

  const form = useForm<UnitFormValues>({
    resolver: zodResolver(unitSchema),
    defaultValues: { name: unit?.name ?? '' },
  })

  React.useEffect(() => {
    form.reset({ name: unit?.name ?? '' })
  }, [form, unit])

  const handleSubmit = async (values: UnitFormValues) => {
    try {
      const trimmedName = values.name.trim()
      if (isEditMode && unit) {
        await updateUnit(unit.id, trimmedName)
        addLog({
          user: currentUser?.name || 'System',
          action: 'UPDATE_UNIT',
          details: `Nama unit diperbarui menjadi ${trimmedName}.`,
        })
        toast({
          title: 'Unit diperbarui',
          description: 'Nama unit berhasil diperbarui.',
        })
      } else {
        const created = await addUnit(trimmedName)
        addLog({
          user: currentUser?.name || 'System',
          action: 'ADD_UNIT',
          details: `Unit ${created.name} ditambahkan.`,
        })
        toast({
          title: 'Unit ditambahkan',
          description: 'Unit baru siap digunakan pada formulir lain.',
        })
      }
      form.reset({ name: '' })
      onOpenChange(false)
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Terjadi kesalahan saat menyimpan data unit.'
      toast({
        variant: 'destructive',
        title: 'Gagal menyimpan',
        description: message,
      })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Unit Pelayanan' : 'Tambah Unit Pelayanan'}</DialogTitle>
          <DialogDescription>
            Masukkan nama unit seperti yang dikenal staf. Gunakan kata yang mudah dipahami agar petugas senior dan non-teknis tidak bingung.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nama Unit</FormLabel>
                  <FormControl>
                    <Input autoFocus placeholder="Contoh: IGD, Rawat Jalan" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter className="gap-2 sm:gap-0">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Batal
              </Button>
              <Button type="submit">{isEditMode ? 'Simpan Perubahan' : 'Tambah Unit'}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
