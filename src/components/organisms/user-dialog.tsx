
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
  trigger?: React.ReactNode;
}

export function UserDialog({ user, trigger }: UserDialogProps) {
  const [open, setOpen] = React.useState(false)
  const isEditMode = !!user;

  const defaultTrigger = (
      <Button size="lg">
          <PlusCircle className="mr-2 h-5 w-5" />
          Tambah Pengguna Baru
      </Button>
  )

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || defaultTrigger}
      </DialogTrigger>
      <DialogContent className="sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Pengguna' : 'Tambah Pengguna Baru'}</DialogTitle>
          <DialogDescription>
            {isEditMode ? 'Ubah detail pengguna di bawah ini.' : 'Isi detail pengguna baru. Klik simpan jika sudah selesai.'}
          </DialogDescription>
        </DialogHeader>
        <UserForm setOpen={setOpen} userToEdit={user} />
      </DialogContent>
    </Dialog>
  )
}
