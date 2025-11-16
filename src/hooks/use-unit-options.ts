"use client"

import * as React from 'react'
import { useUnitStore } from '@/store/unit-store'

export type UnitOption = { value: string; label: string }

export function useUnitOptions() {
  const { units, isLoading, hasLoaded, error, fetchUnits } = useUnitStore()

  React.useEffect(() => {
    if (!hasLoaded && !isLoading) {
      fetchUnits().catch(() => {})
    }
  }, [fetchUnits, hasLoaded, isLoading])

  const options = React.useMemo<UnitOption[]>(
    () => units.map((unit) => ({ value: unit.name, label: unit.name })),
    [units]
  )

  return {
    options,
    isLoading,
    error,
  }
}
