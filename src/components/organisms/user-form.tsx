
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
import { User, useUserStore, UserRole } from "@/store/user-store.tsx"
import { useToast } from "@/hooks/use-toast"
import { useLogStore } from "@/store/log-store.tsx"
import { FormInputSelect } from "../molecules/form-input-select"
import { HOSPITAL_UNITS } from "@/lib/constants"

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
  unit: z.string().optional(),
}).refine(data => {
    if (['PIC Mutu', 'PJ Ruangan'].includes(data.role) && !data.unit) {
        return false;
    }
    return true;
}, {
    message: 'Unit harus dipilih untuk peran ini.',
    path: ['unit'],
});

type UserFormProps = {
    setOpen: (open: boolean) => void;
    userToEdit?: User;
}

const unitOptions = HOSPITAL_UNITS.map(unit => ({ value: unit, label: unit }));
const roleOptions: {value: UserRole, label: string}[] = [
    { value: "Admin Sistem", label: "Admin Sistem" },
    { value: "PIC Mutu", label: "PIC Mutu" },
    { value: "PJ Ruangan", label: "PJ Ruangan" },
    { value: "Komite Mutu", label: "Komite Mutu" },
]


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
      unit: undefined,
    },
  })
  
  const selectedRole = form.watch("role");

  React.useEffect(() => {
    if (selectedRole === 'Admin Sistem' || selectedRole === 'Komite Mutu') {
        form.setValue('unit', undefined);
    }
  }, [selectedRole, form]);

  function onSubmit(values: z.infer<typeof formSchema>) {
    const finalValues = { ...values };
    if (finalValues.role === 'Admin Sistem' || finalValues.role === 'Komite Mutu') {
        delete finalValues.unit;
    }

    if (isEditMode && userToEdit) {
        updateUser(userToEdit.id, finalValues)
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
        const newId = addUser(finalValues as Omit<User, 'id'>)
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                                {roleOptions.map(role => (
                                    <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                {(selectedRole === 'PIC Mutu' || selectedRole === 'PJ Ruangan') && (
                     <FormField
                        control={form.control}
                        name="unit"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Unit</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                <FormControl>
                                <SelectTrigger>
                                    <SelectValue placeholder="Pilih unit" />
                                </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                     {unitOptions.map(unit => (
                                        <SelectItem key={unit.value} value={unit.value}>{unit.label}</SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                )}
            </div>
            
            <DialogFooter className="pt-4">
                <Button type="submit">{isEditMode ? 'Simpan Perubahan' : 'Tambah Pengguna'}</Button>
            </DialogFooter>
        </form>
    </Form>
  )
}
