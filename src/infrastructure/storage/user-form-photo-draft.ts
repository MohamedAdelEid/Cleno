import type { UploadedFile } from '@/domain/types'
import type { UserFormValues } from '@/domain/schemas'
import { fileUploadApi } from '@/infrastructure/api/file-upload.api'
import { draftStorage } from './draft.storage'

export const USER_FORM_PHOTO_DRAFT_KEY = 'photo'

export const getUserFormDraftKey = (mode: 'create' | 'edit', userId?: string) =>
  mode === 'edit' && userId ? `users.edit.${userId}` : 'users.create'

export const getUserFormPhotoDraft = (draftKey: string): UploadedFile | null => {
  const draft = draftStorage.get<UserFormValues>(draftKey)
  return draft?.uploadedFiles?.[USER_FORM_PHOTO_DRAFT_KEY] ?? null
}

export const saveUserFormPhotoDraft = (
  draftKey: string,
  values: UserFormValues,
  photo: UploadedFile | null,
) => {
  draftStorage.save(draftKey, {
    values,
    uploadedFiles: photo ? { [USER_FORM_PHOTO_DRAFT_KEY]: photo } : {},
    savedAt: Date.now(),
  })
}

export const clearUserFormPhotoDraft = (draftKey: string) => {
  const draft = draftStorage.get<UserFormValues>(draftKey)
  if (!draft) return

  draftStorage.save(draftKey, {
    values: draft.values,
    uploadedFiles: {},
    savedAt: Date.now(),
  })
}

export const reconcileUserPhotoDraftOnEditOpen = async (
  draftKey: string,
  serverPhotoPath: string | null | undefined,
): Promise<UploadedFile | null> => {
  const draft = draftStorage.get<UserFormValues>(draftKey)
  const pendingPhoto = draft?.uploadedFiles?.[USER_FORM_PHOTO_DRAFT_KEY] ?? null

  if (!serverPhotoPath) {
    return pendingPhoto
  }

  if (!pendingPhoto) {
    return null
  }

  if (pendingPhoto.filePath === serverPhotoPath) {
    clearUserFormPhotoDraft(draftKey)
    return null
  }

  await fileUploadApi.delete(pendingPhoto.filePath)
  clearUserFormPhotoDraft(draftKey)
  return null
}
