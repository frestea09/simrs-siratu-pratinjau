
"use client"

import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { IndicatorProfile } from "@/store/indicator-store"
import { ProfileForm } from "./profile-form"

type ProfileDialogProps = {
  profile?: IndicatorProfile
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ProfileDialog({ profile, open, onOpenChange }: ProfileDialogProps) {
  const isEditMode = !!profile

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl">
        <DialogHeader>
          <DialogTitle>{isEditMode ? 'Edit Profil Indikator' : 'Buat Profil Indikator Baru'}</DialogTitle>
          <DialogDescription>
            {isEditMode
              ? 'Ubah detail profil di bawah ini. Anda dapat menyimpan sebagai draf atau mengajukan ulang.'
              : 'Isi semua detail untuk membuat profil indikator yang komprehensif.'}
          </DialogDescription>
        </DialogHeader>
        <ProfileForm setOpen={onOpenChange} profileToEdit={profile} />
      </DialogContent>
    </Dialog>
  )
}
