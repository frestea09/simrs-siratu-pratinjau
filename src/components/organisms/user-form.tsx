
"use client"

import * as React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { DialogFooter } from "../ui/dialog"
import { User, useUserStore } from "@/store/user-store"
import { useToast } from "@/hooks/use-toast"
import { useLogStore } from "@/store/log-store"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Nama harus memiliki setidaknya 2 karakter.",
  }),
  email: z.string().email({
    message: "Format email tidak valid.",
  }),
  password: z.string().min(6, {
    message: "Password harus memiliki setidaknya 6 karakter.",
  }),
  role: z.enum(['Admin Sistem', 'PIC Mutu', 'PJ Ruangan', 'Komite Mutu'], {
    required_error: "Anda harus memilih peran.",
  }),
})

type UserFormProps = {
    setOpen: (open: boolean) => void;
    userToEdit?: User;
}

export function UserForm({ setOpen, userToEdit }: UserFormProps) {
  const { toast } = useToast()
  const { addUser, updateUser } = useUserStore()
  const { currentUser } = useUserStore()
  const { addLog } = useLogStore()

  const isEditMode = !!userToEdit;
  
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: isEditMode ? {
        ...userToEdit
    } : {
      name: "",
      email: "",
      password: "",
    },
  })

  function onSubmit(values: z.infer<typeof formSchema>) {
    if (isEditMode && userToEdit) {
        updateUser(userToEdit.id, values)
        addLog({
            user: currentUser?.name || 'System',
            action: 'UPDATE_USER',
            details: `Data pengguna ${values.name} (${values.email}) diperbarui.`
        })
        toast({
            title: "Pengguna Diperbarui",
            description: `Data untuk pengguna "${values.name}" telah berhasil diperbarui.`,
        })
    } else {
        const newId = addUser(values)
        addLog({
            user: currentUser?.name || 'System',
            action: 'ADD_USER',
            details: `Pengguna baru ${values.name} (${values.email}) ditambahkan dengan ID ${newId}.`
        })
        toast({
          title: "Pengguna Ditambahkan",
          description: `Pengguna baru "${values.name}" telah berhasil ditambahkan.`,
        })
    }
    setOpen(false)
    form.reset()
  }

  return (
    <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
            <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Nama Lengkap</FormLabel>
                <FormControl>
                    <Input placeholder="John Doe" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                    <Input type="email" placeholder="email@sim.rs" {...field} disabled={isEditMode}/>
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
             <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                    <Input type="password" placeholder="******" {...field} />
                </FormControl>
                <FormMessage />
                </FormItem>
            )}
            />
            <FormField
            control={form.control}
            name="role"
            render={({ field }) => (
                <FormItem>
                <FormLabel>Peran</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                    <SelectTrigger>
                        <SelectValue placeholder="Pilih peran untuk pengguna" />
                    </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                        <SelectItem value="Admin Sistem">Admin Sistem</SelectItem>
                        <SelectItem value="PIC Mutu">PIC Mutu</SelectItem>
                        <SelectItem value="PJ Ruangan">PJ Ruangan</SelectItem>
                        <SelectItem value="Komite Mutu">Komite Mutu</SelectItem>
                    </SelectContent>
                </Select>
                <FormMessage />
                </FormItem>
            )}
            />
            <DialogFooter className="pt-4">
                <Button type="submit">{isEditMode ? 'Simpan Perubahan' : 'Tambah Pengguna'}</Button>
            </DialogFooter>
        </form>
    </Form>
  )
}
