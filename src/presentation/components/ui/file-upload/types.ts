import type { UploadedFile } from '@/domain/types'

export interface FileUploadLabels {
  dragTitle: string
  dragHint: string
  browse: string
  replace: string
  remove: string
  existingFile: string
  invalidType: string
  maxSize: string
  maxFiles: string
  uploadProgress?: string
  uploadComplete?: string
}

export interface FileUploadProps {
  value: File[]
  onChange: (files: File[]) => void
  multiple?: boolean
  accept?: string
  maxFiles?: number
  maxSize?: number
  disabled?: boolean
  labels: FileUploadLabels
  existingPreviewUrl?: string | null
  existingFilePath?: string | null
  onExistingPreviewRemove?: () => void
  autoUpload?: boolean
  folder?: string
  uploadedFileUrl?: string | null
  uploadedFileName?: string | null
  uploadedFilePath?: string | null
  onUploadComplete?: (result: UploadedFile) => void
  onUploadError?: (message: string) => void
  onFileRemoved?: (filePath: string) => void
  className?: string
  dropzoneClassName?: string
}

export interface FilePreviewItem {
  id: string
  file?: File
  previewUrl: string
  name: string
  size: number
  isImage: boolean
  isRemote?: boolean
}
