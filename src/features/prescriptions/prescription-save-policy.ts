interface EditablePrescriptionEditor {
  setEditable: (editable: boolean, emitUpdate?: boolean) => void
}

export const setEditorEditableWithoutContentUpdate = (
  editor: EditablePrescriptionEditor,
  editable: boolean,
) => {
  editor.setEditable(editable, false)
}

export const shouldRunScheduledPrescriptionSave = (
  scheduledRevision: number,
  signedRevision: number,
) => signedRevision !== scheduledRevision
