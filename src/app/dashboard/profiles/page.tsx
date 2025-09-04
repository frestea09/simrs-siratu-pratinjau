

"use client"

import * as React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { PlusCircle } from "lucide-react"
import { useIndicatorStore } from "@/store/indicator-store"
import { useUserStore } from "@/store/user-store.tsx"
import { ProfileDialog } from "@/components/organisms/profile-dialog"
import { ProfileTable } from "@/components/organisms/profile-table"
import { centralRoles } from "@/store/central-roles"

export default function ProfilesPage() {
  const { profiles } = useIndicatorStore()
  const { currentUser } = useUserStore()
  const [isNewDialogOpen, setIsNewDialogOpen] = React.useState(false)

  const userCanSeeAll = currentUser && centralRoles.includes(currentUser.role)

  const filteredProfiles = React.useMemo(() => {
    if (userCanSeeAll || !currentUser?.unit) {
      return profiles
    }
    // Users can see their own drafts and all approved profiles
    return profiles.filter(
      (p) => p.unit === currentUser.unit || p.status === 'Disetujui'
    )
  }, [profiles, currentUser, userCanSeeAll])

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">
          Profil Indikator Mutu
        </h2>
      </div>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Daftar Profil Indikator</CardTitle>
              <CardDescription>
                Buat, kelola, dan ajukan draf profil indikator untuk standardisasi sebelum digunakan dalam pelaporan.
              </CardDescription>
            </div>
            <Button size="lg" onClick={() => setIsNewDialogOpen(true)}>
              <PlusCircle className="mr-2 h-5 w-5" />
              Buat Profil Baru
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <ProfileTable profiles={filteredProfiles} />
        </CardContent>
      </Card>
      <ProfileDialog
        open={isNewDialogOpen}
        onOpenChange={setIsNewDialogOpen}
      />
    </div>
  )
}
