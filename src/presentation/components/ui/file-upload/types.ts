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
  onExistingPreviewRemove?: () => void
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
