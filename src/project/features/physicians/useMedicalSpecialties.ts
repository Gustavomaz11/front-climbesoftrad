import { useEffect, useState } from 'react'
import type { MedicalSpecialty } from './physician.types'
import { listMedicalSpecialties } from './physicians-api'

export const useMedicalSpecialties = () => {
  const [specialties, setSpecialties] = useState<MedicalSpecialty[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    void listMedicalSpecialties().then((items) => {
      if (active) setSpecialties(items)
    }).catch(() => {
      if (active) setError(true)
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [])

  return { specialties, loading, error }
}
