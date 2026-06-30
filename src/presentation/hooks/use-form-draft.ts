import { useCallback, useEffect, useMemo, useState } from 'react'

import type { FormDraft, UploadedFile } from '@/domain/types'
import { draftStorage } from '@/infrastructure/storage/draft.storage'

const DEFAULT_TTL_MS = 24 * 60 * 60 * 1000

interface UseFormDraftOptions {
  key: string
  ttlMs?: number
}

interface UseFormDraftReturn<T> {
  draft: FormDraft<T> | null
  saveDraft: (values: T, uploadedFiles: Record<string, UploadedFile>) => void
  clearDraft: () => void
  hasDraft: boolean
}

export const useFormDraft = <T extends Record<string, unknown>>({
  key,
  ttlMs = DEFAULT_TTL_MS,
}: UseFormDraftOptions): UseFormDraftReturn<T> => {
  const [draft, setDraft] = useState<FormDraft<T> | null>(() => draftStorage.get<T>(key, ttlMs))

  useEffect(() => {
    setDraft(draftStorage.get<T>(key, ttlMs))
  }, [key, ttlMs])

  const hasDraft = useMemo(() => draft != null, [draft])

  const saveDraft = useCallback(
    (values: T, uploadedFiles: Record<string, UploadedFile>) => {
      const nextDraft: FormDraft<T> = {
        values,
        uploadedFiles,
        savedAt: Date.now(),
      }

      draftStorage.save(key, nextDraft)
      setDraft(nextDraft)
    },
    [key],
  )

  const clearDraft = useCallback(() => {
    draftStorage.remove(key)
    setDraft(null)
  }, [key])

  return {
    draft,
    saveDraft,
    clearDraft,
    hasDraft,
  }
}
