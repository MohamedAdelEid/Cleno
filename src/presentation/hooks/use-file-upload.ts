import { useCallback, useEffect, useRef, useState } from 'react'

import type { UploadedFile } from '@/domain/types'
import { fileUploadApi } from '@/infrastructure/api/file-upload.api'

const FAKE_PROGRESS_DURATION_MS = 1500
const COMPLETE_PROGRESS_DURATION_MS = 300
const FAKE_PROGRESS_TARGET = 70

const easeOutCubic = (value: number) => 1 - (1 - value) ** 3

interface UseFileUploadOptions {
  folder: string
  onSuccess?: (result: UploadedFile) => void
  onError?: (message: string) => void
}

interface UseFileUploadReturn {
  upload: (file: File) => Promise<UploadedFile | null>
  remove: (filePath: string) => Promise<boolean>
  deleteRemote: (filePath: string) => Promise<boolean>
  progress: number
  isUploading: boolean
  uploadedFile: UploadedFile | null
  reset: () => void
}

export const useFileUpload = ({
  folder,
  onSuccess,
  onError,
}: UseFileUploadOptions): UseFileUploadReturn => {
  const [progress, setProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null)

  const animationFrameRef = useRef<number | null>(null)
  const fakeProgressStartRef = useRef<number | null>(null)

  const stopAnimation = useCallback(() => {
    if (animationFrameRef.current != null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
  }, [])

  const animateFakeProgress = useCallback(() => {
    stopAnimation()
    fakeProgressStartRef.current = performance.now()
    setProgress(0)

    const tick = (timestamp: number) => {
      const start = fakeProgressStartRef.current ?? timestamp
      const elapsed = timestamp - start
      const ratio = Math.min(elapsed / FAKE_PROGRESS_DURATION_MS, 1)
      setProgress(Math.round(easeOutCubic(ratio) * FAKE_PROGRESS_TARGET))

      if (ratio < 1) {
        animationFrameRef.current = requestAnimationFrame(tick)
      }
    }

    animationFrameRef.current = requestAnimationFrame(tick)
  }, [stopAnimation])

  const animateToComplete = useCallback(() => {
    stopAnimation()
    const startProgress = FAKE_PROGRESS_TARGET
    const startTime = performance.now()

    const tick = (timestamp: number) => {
      const elapsed = timestamp - startTime
      const ratio = Math.min(elapsed / COMPLETE_PROGRESS_DURATION_MS, 1)
      setProgress(Math.round(startProgress + (100 - startProgress) * easeOutCubic(ratio)))

      if (ratio < 1) {
        animationFrameRef.current = requestAnimationFrame(tick)
      }
    }

    animationFrameRef.current = requestAnimationFrame(tick)
  }, [stopAnimation])

  const reset = useCallback(() => {
    stopAnimation()
    setProgress(0)
    setIsUploading(false)
    setUploadedFile(null)
  }, [stopAnimation])

  const upload = useCallback(
    async (file: File): Promise<UploadedFile | null> => {
      setIsUploading(true)
      setUploadedFile(null)
      animateFakeProgress()

      const result = await fileUploadApi.upload(file, folder)

      if (!result.success) {
        stopAnimation()
        setProgress(0)
        setIsUploading(false)
        onError?.(result.message)
        return null
      }

      animateToComplete()
      setUploadedFile(result.data)
      setIsUploading(false)
      onSuccess?.(result.data)

      window.setTimeout(() => setProgress(100), COMPLETE_PROGRESS_DURATION_MS)
      return result.data
    },
    [animateFakeProgress, animateToComplete, folder, onError, onSuccess, stopAnimation],
  )

  const deleteRemote = useCallback(
    async (filePath: string): Promise<boolean> => {
      const result = await fileUploadApi.delete(filePath)

      if (!result.success) {
        onError?.(result.message)
        return false
      }

      return true
    },
    [onError],
  )

  const remove = useCallback(
    async (filePath: string): Promise<boolean> => {
      const deleted = await deleteRemote(filePath)
      if (!deleted) return false

      reset()
      return true
    },
    [deleteRemote, reset],
  )

  useEffect(() => () => stopAnimation(), [stopAnimation])

  return {
    upload,
    remove,
    deleteRemote,
    progress,
    isUploading,
    uploadedFile,
    reset,
  }
}
