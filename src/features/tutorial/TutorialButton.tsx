import { BookOpen } from 'lucide-react'
import { lazy, Suspense, useCallback, useState } from 'react'
import { Button } from '../../components/ui/Button'

const TutorialDialog = lazy(() => import('./TutorialDialog').then(module => ({ default: module.TutorialDialog })))

export const TutorialButton = () => {
  const [open, setOpen] = useState(false)
  const close = useCallback(() => setOpen(false), [])
  return (
    <>
      <Button
        size="sm" variant="outline" leftIcon={<BookOpen size={16} aria-hidden="true" />}
        aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}
      >
        Tutorial
      </Button>
      {open ? (
        <Suspense fallback={<span role="status" className="sr-only">Abrindo tutorial…</span>}>
          <TutorialDialog onClose={close} />
        </Suspense>
      ) : null}
    </>
  )
}
