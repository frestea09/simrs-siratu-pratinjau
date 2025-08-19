
"use client"

import React from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { useUserStore } from "@/store/user-store.tsx"
import { useLogStore } from "@/store/log-store.tsx"

// Skema validasi untuk form profil
const profileFormSchema = z.object({
  name: z.string().min(2, { message: "Nama harus memiliki setidaknya 2 karakter." }),
  email: z.string().email(),
})

// Skema validasi untuk form password
const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, { message: "Password saat ini harus diisi." }),
  newPassword: z.string().min(6, { message: "Password baru harus memiliki setidaknya 6 karakter." }),
  confirmPassword: z.string(),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Konfirmasi password tidak cocok dengan password baru.",
  path: ["confirmPassword"],
});

export default function SettingsPage() {
  const { currentUser, updateUser } = useUserStore()
  const addLog = useLogStore((state) => state.addLog)
  const { toast } = useToast()

  // Inisialisasi form untuk profil
  const profileForm = useForm<z.infer<typeof profileFormSchema>>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: currentUser?.name || "",
      email: currentUser?.email || "",
    },
  })

  // Inisialisasi form untuk password
  const passwordForm = useForm<z.infer<typeof passwordFormSchema>>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  })

  // Fungsi untuk handle submit profil
  function onProfileSubmit(values: z.infer<typeof profileFormSchema>) {
    if (currentUser) {
      updateUser(currentUser.id, { name: values.name })
      addLog({ user: currentUser.name, action: "UPDATE_USER", details: "Pengguna memperbarui nama profil." })
      toast({
        title: "Profil Diperbarui",
        description: "Nama Anda telah berhasil diperbarui.",
      })
    }
  }

  // Fungsi untuk handle submit password
  function onPasswordSubmit(values: z.infer<typeof passwordFormSchema>) {
     if (currentUser) {
        // Verifikasi password saat ini (di dunia nyata, ini akan dicek di server)
        if(values.currentPassword !== currentUser.password) {
            passwordForm.setError("currentPassword", {
                type: "manual",
                message: "Password saat ini salah.",
            });
            return;
        }

        updateUser(currentUser.id, { password: values.newPassword })
        addLog({ user: currentUser.name, action: "UPDATE_USER", details: "Pengguna mengubah password." })
        toast({
            title: "Password Diubah",
            description: "Password Anda telah berhasil diperbarui.",
        })
        passwordForm.reset()
    }
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <h2 className="text-3xl font-bold tracking-tight">Pengaturan Akun</h2>
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profil Saya</CardTitle>
            <CardDescription>
              Kelola informasi profil publik Anda.
            </CardDescription>
          </CardHeader>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={profileForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nama Lengkap</FormLabel>
                      <FormControl>
                        <Input placeholder="Nama lengkap Anda" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={profileForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="Email Anda" {...field} disabled />
                      </FormControl>
                      <FormDescription>
                        Email tidak dapat diubah karena digunakan untuk login.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button type="submit">Simpan Perubahan Profil</Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Keamanan</CardTitle>
            <CardDescription>
              Ubah password Anda secara berkala untuk menjaga keamanan akun.
            </CardDescription>
          </CardHeader>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={passwordForm.control}
                  name="currentPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password Saat Ini</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="newPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password Baru</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={passwordForm.control}
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Konfirmasi Password Baru</FormLabel>
                      <FormControl>
                        <Input type="password" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
              <CardFooter className="border-t px-6 py-4">
                <Button type="submit">Ubah Password</Button>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
    </div>
  )
}
