import { useEffect, useState } from 'react'
import { listDicomReviews, type DicomReview } from '../dicom-api'
import { DicomReviewCard } from './DicomReviewCard'
import { Button } from '../../../components/ui/Button'
export const DicomReviewsPanel = () => {
  const [items, setItems] = useState<DicomReview[]>([]),
    [error, setError] = useState(''),
    [reload, setReload] = useState(0)
  useEffect(() => {
    let active = true
    void listDicomReviews()
      .then((value) => {
        if (active) {
          setItems(value)
          setError('')
        }
      })
      .catch(() => {
        if (active) setError('Conferências indisponíveis.')
      })
    return () => {
      active = false
    }
  }, [reload])
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Conferência de ingestão</h2>
        <Button size="sm" variant="outline" onClick={() => setReload((x) => x + 1)}>
          Atualizar
        </Button>
      </div>
      {error ? <p role="alert">{error}</p> : null}
      {items
        .filter((x) => x.status === 'OPEN')
        .map((review) => (
          <DicomReviewCard key={review.id} review={review} onDone={() => setReload((x) => x + 1)} />
        ))}
      {!items.some((x) => x.status === 'OPEN') ? (
        <p className="text-sm text-slate-500">Nenhuma conferência aberta.</p>
      ) : null}
    </section>
  )
}
