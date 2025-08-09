"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { PlusCircle } from "lucide-react";
import { IndicatorSubmissionForm } from "./indicator-submission-form";
import { SubmittedIndicator } from "@/store/indicator-store";

type IndicatorSubmissionDialogProps = {
  indicator?: SubmittedIndicator;
  open: boolean;
  setOpen: (open: boolean) => void;
};

export function IndicatorSubmissionDialog({
  indicator,
  open,
  setOpen,
}: IndicatorSubmissionDialogProps) {
  const isEditMode = !!indicator;

  // The DialogTrigger is now managed by the parent component (the table or a main button)
  // This component now only controls the content of the dialog.

  if (!open && !isEditMode) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {/* <Button size="lg">
                    <PlusCircle className="mr-2 h-5 w-5" />
                    Ajukan Indikator Baru
                </Button> */}
        </DialogTrigger>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Pengajuan Indikator Mutu Baru</DialogTitle>
            <DialogDescription>
              Isi detail indikator yang akan diajukan. Klik simpan jika sudah
              selesai.
            </DialogDescription>
          </DialogHeader>
          <IndicatorSubmissionForm setOpen={setOpen} />
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {isEditMode
              ? "Edit Pengajuan Indikator"
              : "Pengajuan Indikator Mutu Baru"}
          </DialogTitle>
          <DialogDescription>
            {isEditMode
              ? "Ubah detail indikator di bawah ini."
              : "Isi detail indikator yang akan diajukan. Klik simpan jika sudah selesai."}
          </DialogDescription>
        </DialogHeader>
        <IndicatorSubmissionForm setOpen={setOpen} indicator={indicator} />
      </DialogContent>
    </Dialog>
  );
}
