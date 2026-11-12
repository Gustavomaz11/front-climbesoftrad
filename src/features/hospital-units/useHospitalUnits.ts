import { useEffect, useState } from 'react'
import type { HospitalUnit } from './hospital-unit.types'
import { listHospitalUnits } from './hospital-units-api'

export const useHospitalUnits = () => {
  const [units, setUnits] = useState<HospitalUnit[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    let active = true
    void listHospitalUnits().then((items) => {
      if (active) setUnits(items)
    }).catch(() => {
      if (active) setError(true)
    }).finally(() => {
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [])

  return { units, loading, error }
}
