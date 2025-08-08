
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { PlusCircle } from "lucide-react"
import { UserForm } from "./user-form"
import { User } from "@/store/user-store"

type UserDialogProps = {
  user?: User;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function UserDialog({ user, open, onOpenChange }: UserDialogProps) {
  const isEditMode = !!user;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Ubah detail pengguna di bawah ini.' : 'Isi detail pengguna baru. Klik simpan jika sudah selesai.'}
          </DialogDescription>
        </DialogHeader>
        <UserForm setOpen={onOpenChange} userToEdit={user} />
      </DialogContent>
    </Dialog>
  )
}
