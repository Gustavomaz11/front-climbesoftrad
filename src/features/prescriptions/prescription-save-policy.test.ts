import { describe, expect, it, vi } from 'vitest'
import {
  setEditorEditableWithoutContentUpdate,
  shouldRunScheduledPrescriptionSave,
} from './prescription-save-policy'

describe('prescription save policy', () => {
  it('does not emit a content update when locking or unlocking the editor', () => {
    const setEditable = vi.fn()

    setEditorEditableWithoutContentUpdate({ setEditable }, false)
    setEditorEditableWithoutContentUpdate({ setEditable }, true)

    expect(setEditable).toHaveBeenNthCalledWith(1, false, false)
    expect(setEditable).toHaveBeenNthCalledWith(2, true, false)
  })

  it('cancels a scheduled autosave for the revision that has just been signed', () => {
    expect(shouldRunScheduledPrescriptionSave(4, 4)).toBe(false)
    expect(shouldRunScheduledPrescriptionSave(4, -1)).toBe(true)
    expect(shouldRunScheduledPrescriptionSave(4, 3)).toBe(true)
  })
})
