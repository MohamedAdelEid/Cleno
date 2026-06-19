export interface FileUploadResponseDto {
  success: boolean
  filePath: string
  fileUrl: string
  originalFileName: string
  storedFileName: string
  fileSize: number
  contentType: string
  folder: string
  message: string
}

export interface FileDeleteResponseDto {
  success: boolean
  message: string
}

export interface FileUploadRequestDto {
  file: File
  folder: string
}

export interface FileUploadMultipleRequestDto {
  files: File[]
  folder: string
}

export interface FileDeleteRequestDto {
  filePath: string
}

export interface FileDeleteFolderRequestDto {
  folderName: string
}
