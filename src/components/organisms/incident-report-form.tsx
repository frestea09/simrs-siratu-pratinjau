
"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { Stepper } from "@/components/molecules/stepper"
import { useIncidentStore, Incident } from "@/store/incident-store"
import { useToast } from "@/hooks/use-toast"
import { useLogStore } from "@/store/log-store"
import { Step1PatientData } from "./incident-report-form/step1-patient-data"
import { Step2IncidentDetails } from "./incident-report-form/step2-incident-details"
import { Step3FollowUp } from "./incident-report-form/step3-follow-up"
import { useNotificationStore } from "@/store/notification-store"
import type { User } from "@prisma/client"

const steps = [
    { id: '01', name: 'Data Pasien' },
    { id: '02', name: 'Rincian Kejadian' },
    { id: '03', name: 'Tindak Lanjut & Pelaporan' },
]

type IncidentReportFormProps = {
    setOpen: (open: boolean) => void;
    incident?: Incident;
    currentUser: User | null;
}

export function IncidentReportForm({ setOpen, incident, currentUser }: IncidentReportFormProps) {
    const [currentStep, setCurrentStep] = React.useState(0)
    const { addIncident, updateIncident } = useIncidentStore()
    const { toast } = useToast()
    const { addLog } = useLogStore();
    const { addNotification } = useNotificationStore();
    
    const [formData, setFormData] = React.useState<Partial<Incident>>(
        incident ? incident : {}
    );

    const isEditMode = !!incident;
    const next = () => setCurrentStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev))
    const prev = () => setCurrentStep((prev) => (prev > 0 ? prev - 1 : prev))
    const updateFormData = (newData: Partial<Incident>) => setFormData(prev => ({...prev, ...newData}));

    const handleSave = () => {
        const finalData = { ...formData } as Omit<Incident, 'id' | 'date' | 'status'>;

        if (isEditMode && incident.id) {
            updateIncident(incident.id, finalData)
            addLog({ user: currentUser?.name || 'System', action: 'UPDATE_INCIDENT', details: `Laporan insiden ${incident.id} diperbarui.` })
            toast({ title: "Laporan Berhasil Diperbarui", description: `Laporan insiden ${incident.id} telah diperbarui.` });
        } else {
            const newId = addIncident(finalData);
            addLog({ user: currentUser?.name || 'Anonymous', action: 'ADD_INCIDENT', details: `Laporan insiden baru ${newId} ditambahkan.` })
            addNotification({
                title: 'Laporan Insiden Baru',
                description: `Insiden baru (${finalData.type}) telah dilaporkan. Segera lakukan investigasi.`,
                link: '/dashboard/incidents',
                recipientRole: 'SUB_KOMITE_KESELAMATAN_PASIEN',
            })
            toast({ title: "Laporan Berhasil Disimpan", description: "Laporan insiden baru telah ditambahkan ke daftar." });
        }
        setOpen(false);
    }

    const renderStep = () => {
        switch (currentStep) {
            case 0: return <Step1PatientData data={formData} onUpdate={updateFormData} />;
            case 1: return <Step2IncidentDetails data={formData} onUpdate={updateFormData} />;
            case 2: return <Step3FollowUp data={formData} onUpdate={updateFormData} currentUser={currentUser} />;
            default: return null;
        }
    }

    return (
        <div className="flex flex-col md:flex-row gap-8 p-1">
            <Stepper steps={steps} currentStep={currentStep} setCurrentStep={setCurrentStep} />
            <div className="flex-1">
                <div className="max-h-[65vh] overflow-y-auto pr-4 pl-1 space-y-8">
                    {renderStep()}
                </div>
                <div className="flex justify-between items-center pt-5 mt-5 border-t">
                    <div>
                        {currentStep > 0 && <Button variant="outline" onClick={prev}>Kembali</Button>}
                    </div>
                    <div>
                        {currentStep < steps.length - 1 ? (
                            <Button onClick={next}>Lanjutkan</Button>
                        ) : (
                            <Button onClick={handleSave} size="lg">{isEditMode ? 'Simpan Perubahan' : 'Simpan Laporan'}</Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

    