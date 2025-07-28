'use client'

import { useState, useEffect, useRef, } from 'react'

interface MediaRecorderOptions {
  audio?: boolean
  video?: boolean
  audioConstraints?: MediaTrackConstraints
  videoConstraints?: MediaTrackConstraints
  mimeType?: string
  onRecordingComplete?: (data: {
    blob: Blob
    url: string
    type: string
    size: number
    video?: { height?: number; width?: number }
  }) => void
}

interface MediaRecorderError {
  message: string
  type: string
  originalError: Error | null
}

/**
 * Custom hook for recording audio and/or video with enhanced capabilities
 *
 * @param {Object} options - Configuration options
 * @param {boolean} options.audio - Whether to record audio
 * @param {boolean} options.video - Whether to record video
 * @param {MediaTrackConstraints} options.audioConstraints - Constraints for audio recording
 * @param {MediaTrackConstraints} options.videoConstraints - Constraints for video recording
 * @param {string} options.mimeType - MIME type for the recording
 * @returns {Object} Recording controls and state
 */
const useMediaRecorder = ({
  audio = true,
  video = false,
  audioConstraints = {},
  videoConstraints = {},
  mimeType = 'video/webm',
  onRecordingComplete,
}: MediaRecorderOptions = {}) => {
  const [permission, setPermission] = useState<boolean>(false)
  const stream = useRef<MediaStream | null>(null)
  const [mediaRecorder, setMediaRecorder] = useState<MediaRecorder | null>(null)
  const [recordingStatus, setRecordingStatus] = useState<'inactive' | 'paused' | 'recording'>('inactive')
  const [recordedMedia, setRecordedMedia] = useState<{
    blob: Blob
    url: string
    type: string
    size: number
    video?: { height?: number; width?: number }
  } | null>(null)
  const [error, setError] = useState<MediaRecorderError | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user') // Default to front camera
  const [cameraConnected, setCameraConnected] = useState<boolean>(false) // Track camera connection state
  const [browserSupported, setBrowserSupported] = useState<boolean>(true) // Track browser support
  const mediaChunks = useRef<Blob[]>([])

  const videoRef = useRef<HTMLVideoElement | null>(null)

  // Check browser support on initialization
  useEffect(() => {
    const checkBrowserSupport = () => {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        setError({
          message:
            'Your browser does not support media recording. Please use a modern browser like Chrome, Firefox, Safari, or Edge.',
          type: 'browser_not_supported',
          originalError: null,
        })
        setBrowserSupported(false)
        return false
      }

      if (!window.MediaRecorder) {
        setError({
          message:
            'Your browser does not support MediaRecorder. Please update to a newer version.',
          type: 'media_recorder_not_supported',
          originalError: null,
        })
        setBrowserSupported(false)
        return false
      }

      setBrowserSupported(true)
      return true
    }

    checkBrowserSupport()
  }, [])

  const setStream = (newStream: MediaStream | null) => {
    if (stream.current) {
      stream.current.getTracks().forEach((track) => track.stop())
    }
    stream.current = newStream
  }
  const requestPermissions = async (customFacingMode = facingMode) => {
    setError(null)
    setPermission(false)
    setCameraConnected(false)

    try {
      const streamConstraints = {
        audio: audio ? { ...audioConstraints } : false,
        video: video
          ? {
              ...videoConstraints,
              facingMode: customFacingMode,
            }
          : false,
      }

      const mediaStream =
        await navigator.mediaDevices.getUserMedia(streamConstraints)
      setPermission(true)
      setStream(mediaStream)
      setCameraConnected(true)

      if (video && videoRef.current) {
        videoRef.current.srcObject = mediaStream
      }

      return mediaStream
    } catch (err: any) {
      let errorMessage = 'Permission denied'
      let errorType = 'permission'

      if (err.name === 'NotAllowedError') {
        errorMessage =
          'Camera and microphone access was denied. Please allow permissions to continue.'
        errorType = 'permission_denied'
      } else if (err.name === 'NotFoundError') {
        errorMessage =
          'No camera or microphone found. Please connect a recording device.'
        errorType = 'device_not_found'
      } else if (err.name === 'NotReadableError') {
        errorMessage =
          'Camera or microphone is already in use by another application.'
        errorType = 'device_in_use'
      } else if (err.name === 'OverconstrainedError') {
        errorMessage = 'Camera or microphone constraints cannot be satisfied.'
        errorType = 'constraints_error'
      } else if (err.name === 'SecurityError') {
        errorMessage = 'Security error: Please ensure you are using HTTPS.'
        errorType = 'security_error'
      } else if (err.name === 'TypeError') {
        errorMessage = 'Browser does not support media recording.'
        errorType = 'browser_support'
      } else {
        errorMessage = `Media access error: ${err.message}`
        errorType = 'unknown'
      }

      setError({ message: errorMessage, type: errorType, originalError: err })
      return null
    }
  }

  const flipCamera = async () => {
    // Stop current stream to release the camera
    if (stream.current) {
      stream.current.getTracks().forEach((track) => track.stop())
      stream.current = null

      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }

    // Toggle facing mode
    const newFacingMode = facingMode === 'user' ? 'environment' : 'user'
    setFacingMode(newFacingMode)

    // Request new stream with flipped camera
    await requestPermissions(newFacingMode)
  }

  const connectCamera = async () => {
    if (!stream.current) {
      await requestPermissions()
    } else {
      setCameraConnected(true)
    }
  }

  const startRecording = async () => {
    mediaChunks.current = []

    let mediaStream = stream.current
    if (!mediaStream) {
      mediaStream = await requestPermissions()
      if (!mediaStream) return
    }

    let recorderMimeType = mimeType
    if (!MediaRecorder.isTypeSupported(mimeType)) {
      const supportedTypes = [
        'video/webm',
        'video/webm;codecs=vp9',
        'video/webm;codecs=vp8',
        'audio/webm',
        'audio/mp4',
      ]

      for (const type of supportedTypes) {
        if (MediaRecorder.isTypeSupported(type)) {
          recorderMimeType = type
          break
        }
      }
    }

    const recorder = new MediaRecorder(mediaStream, {
      mimeType: recorderMimeType,
    })

    const currentVideoTrack = video
      ? mediaStream
          .getVideoTracks()
          .find(
            (track) =>
              track.kind === 'video' &&
              track.readyState === 'live' &&
              track.enabled,
          )
      : undefined

    console.info(mediaStream.getVideoTracks())
    console.info(currentVideoTrack)

    recorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        mediaChunks.current.push(event.data)
      }
    }

    recorder.onstop = () => {
      const blob = new Blob(mediaChunks.current, { type: 'video/mp4' })
      const url = URL.createObjectURL(blob)
      setRecordedMedia({
        blob,
        url,
        type: recorderMimeType,
        size: blob.size,
      })

      setRecordingStatus('inactive')
      if (onRecordingComplete) {
        onRecordingComplete({
          blob,
          url,
          type: recorderMimeType,
          size: blob.size,
          video: video
            ? {
                height: currentVideoTrack?.getSettings().height,
                width: currentVideoTrack?.getSettings().width,
              }
            : undefined,
        })
      }
    }

    // Start recording
    recorder.start()
    setMediaRecorder(recorder)
    setRecordingStatus('recording')
  }

  const pauseRecording = () => {
    if (mediaRecorder && recordingStatus === 'recording') {
      mediaRecorder.pause()
      setRecordingStatus('paused')
    }
  }

  const resumeRecording = () => {
    if (mediaRecorder && recordingStatus === 'paused') {
      mediaRecorder.resume()
      setRecordingStatus('recording')
    }
  }
  const stopRecording = () => {
    if (mediaRecorder && recordingStatus !== 'inactive') {
      mediaRecorder.stop()
    }
  }

  const clearRecording = () => {
    if (recordedMedia && recordedMedia.url) {
      URL.revokeObjectURL(recordedMedia.url)
    }
    setRecordedMedia(null)
  }
  const stopStream = () => {
    console.log(stream)
    if (stream.current) {
      stream.current.getTracks().forEach((track) => track.stop())
      setStream(null)
      setCameraConnected(false)

      if (videoRef.current) {
        videoRef.current.srcObject = null
      }
    }
  }

  // Release resources
  useEffect(() => {
    return () => {
      if (recordingStatus !== 'inactive') {
        stopRecording()
      }
      console.log('Stopping stream and releasing resources')
      stopStream()
      clearRecording()
    }
  }, [])

  const downloadRecording = (filename = 'recording') => {
    if (!recordedMedia) return

    const extension = recordedMedia.type.includes('audio/')
      ? recordedMedia.type.includes('mp4')
        ? 'mp4'
        : 'webm'
      : recordedMedia.type.includes('mp4')
        ? 'mp4'
        : 'webm'

    const a = document.createElement('a')
    a.href = recordedMedia.url
    a.download = `${filename}.${extension}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }
  const getAudioAnalysisData = () => {
    if (!stream.current) return null

    try {
      const audioContext = new (window.AudioContext ||
        // @ts-expect-error - AudioContext is not defined in some environments
        window.webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      analyser.fftSize = 256

      const audioSource = audioContext.createMediaStreamSource(stream.current)
      audioSource.connect(analyser)

      const bufferLength = analyser.frequencyBinCount
      const dataArray = new Uint8Array(bufferLength)

      return { audioContext, analyser, dataArray }
    } catch (err: any) {
      setError({
        message: `Audio analysis error: ${err.message}`,
        type: 'audio_analysis_error',
        originalError: err,
      })
      return null
    }
  }
  return {
    // State
    mediaRecorder,
    recordingStatus,
    recordedMedia,
    stream,
    permission,
    error,
    videoRef,
    facingMode,
    cameraConnected,
    browserSupported,

    // Methods
    requestPermissions,
    startRecording,
    pauseRecording,
    resumeRecording,
    stopRecording,
    clearRecording,
    stopStream,
    downloadRecording,
    getAudioAnalysisData,
    flipCamera,
    connectCamera,
  }
}

export default useMediaRecorder
