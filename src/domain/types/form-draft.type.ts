import type { UploadedFile } from './uploaded-file.type'

export interface FormDraft<T = Record<string, unknown>> {
  values: T
  uploadedFiles: Record<string, UploadedFile>
  savedAt: number
}
