import { useState } from 'react'
import { SettingsPageLayout } from '../settings/components/SettingsPageLayout'
import { useAuthentication } from '../auth/auth-context'
import { hasPermission } from '../auth/auth.types'
import { DicomImportForm } from './components/DicomImportForm'
import { DicomSourcesPanel } from './components/DicomSourcesPanel'
import { DicomReviewsPanel } from './components/DicomReviewsPanel'
import { UploadSessionsList } from '../uploads/components/UploadSessionsList'
export const DicomSettingsPage = () => {
  const { user } = useAuthentication(),
    [reload, setReload] = useState(0)
  return (
    <SettingsPageLayout
      active="dicom"
      title="Recepção de imagens"
      description="Importação DICOM, receptores, validação e conferência de recebimentos."
    >
      <div className="grid items-start gap-6 xl:grid-cols-2">
        <div className="space-y-6">
          {user && hasPermission(user, 'dicom.import') ? (
            <>
              <DicomImportForm onDone={() => setReload((x) => x + 1)} />
              <UploadSessionsList reload={reload} />
            </>
          ) : null}
          {user && hasPermission(user, 'dicom.review') ? <DicomReviewsPanel /> : null}
        </div>
        {user && hasPermission(user, 'dicom.sources.manage') ? <DicomSourcesPanel /> : null}
      </div>
    </SettingsPageLayout>
  )
}
