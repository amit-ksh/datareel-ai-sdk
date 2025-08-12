// @ts-ignore

import { useState, useRef, useEffect, useCallback, useMemo } from 'react'
import {
  generatePresentationHTML,
  isSkipPresentation,
} from './utils/presentation-generator'
// import { useVideoAnalytics } from '@/Hooks/useVideoAnalytics'
import { useGetDeliveryVideoByQualityStatus, useGetVideoByQualityDelivery } from '../../../api/video-player'
import { NetworkSpeedMeter } from './networkspeed-meter'
import { createVideoComponentsFromQualityResponse } from './utils/formater'
import type { RenderSetting } from '../../../types';

// Helper function to clean S3 URLs by removing query parameters
const cleanUrl = (url: string) => {
  if (!url) return null
  try {
    const urlObj = new URL(url)
    return urlObj.origin + urlObj.pathname
  } catch (e) {
    console.error('Invalid URL:', url)
    return url
  }
}

const isMobile = () => {
  const userAgent = navigator.userAgent.toLowerCase()
  return /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/.test(
    userAgent,
  )
}

const isLowEndDevice = () => {
  // Detect low-end devices
  return (
    navigator.hardwareConcurrency <= 2 ||
    // @ts-ignore
    navigator?.deviceMemory! <= 2 ||
    isMobile()
  )
}

// Canvas function to capture last frame for smooth transitions
const drawVideoFrameToCanvas = (videoElement: HTMLVideoElement, canvasElement: HTMLCanvasElement) => {
  if (!videoElement || videoElement.readyState < 2 || !canvasElement) {
    return false
  }

  try {
    const ctx = canvasElement.getContext('2d')
    if (!ctx) return false

    // Reduce canvas size for mobile devices
    const scaleFactor = isLowEndDevice() ? 0.5 : 1
    const width = (videoElement.videoWidth || 1033) * scaleFactor
    const height = (videoElement.videoHeight || 780) * scaleFactor

    canvasElement.width = width
    canvasElement.height = height

    // Use lower quality for mobile
    if (isLowEndDevice()) {
      ctx.imageSmoothingEnabled = false
      ctx.imageSmoothingQuality = 'low'
    }

    // Set canvas dimensions to match video
    ctx.drawImage(videoElement, 0, 0, width, height)
    return true
  } catch (error) {
    console.warn('Error drawing video frame to canvas:', error)
    return false
  }
}

export const QUALITY_OPTIONS = ['1080', '720', '480', '240']

// Quality change cooldown period in milliseconds (30 seconds)
export const QUALITY_CHANGE_COOLDOWN = 30000

export function useVideoPlayer(
  videos: any = null,
  {
    apiKey,
    videoId,
    pipelineId,
    organisationId,
    sourceId,
    name,
    renderSettings,
    preview,
  }: {
    apiKey: string;
    videoId: string;
    pipelineId: string;
    organisationId: string;
    sourceId: string;
    name: string;
    renderSettings: RenderSetting;
    preview: boolean;
  },
) {
  const [isStartedPlaying, setIsStartedPlaying] = useState<boolean>(false)
  const [ended, setEnded] = useState<boolean>(false)
  const [totalDuration, setTotalDuration] = useState<number>(0)
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [loadingMessage, setLoadingMessage] = useState<string>('')
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [isPlaying, setIsPlaying] = useState<boolean>(false)
  const [isMuted, setIsMuted] = useState<boolean>(false)
  const [volume, setVolume] = useState<number>(1)
  const [currentTime, setCurrentTime] = useState<number>(0)
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false)
  const [templateUrl, setTemplateUrl] = useState<string | null>(null)
  const [videoDimensions, setVideoDimensions] = useState<{
    width: number
    height: number
  }>({
    width: 0,
    height: 0,
  })
  const avatarDataRef = useRef<{
    videoUrl: string
    position: {
      radius: number
      x: number
      y: number
    }
  } | null>(null)
  const [avatarDimensions, setAvatarDimensions] = useState<any>({
    width: 0,
    height: 0,
    x: 0,
    y: 0,
  })
  const preloadingStatusRef = useRef<any>({}) // Track preloading status
  const nextVideoReadyRef = useRef<boolean>(false) // Track if next video is ready
  const preloadedVideos = useRef<any>({})
  const preloadedAudios = useRef<any>({})
  const hiddenVideoRef = useRef<HTMLVideoElement | null>(null)
  const video1Ref = useRef<HTMLVideoElement | null>(null)
  const audioPlayerRef = useRef<HTMLAudioElement | null>(null)
  const videoContainerRef = useRef<HTMLDivElement | null>(null)
  const mediaQueueRef = useRef<any>([])
  const videoEndTimesRef = useRef<any>([])
  const currentMediaIndexRef = useRef<number>(-1)
  const templateContainerRef = useRef<HTMLDivElement | null>(null)
  const playerControlRef = useRef<HTMLDivElement | null>(null)
  const videoEndedRef = useRef<boolean>(false)
  const avatarVideoRef = useRef<HTMLVideoElement | null>(null)
  const avatarVideo1Ref = useRef<HTMLVideoElement | null>(null)
  const currentTimeRef = useRef<number>(0)
  const loadingMediaRef = useRef<boolean>(false)
  const avatarContainerRef = useRef<HTMLDivElement | null>(null)
  const firstFrameCanvasRef = useRef<HTMLCanvasElement | null>(null) // Canvas for smooth transitions
  const lastFrameCanvasRef = useRef<HTMLCanvasElement | null>(null) // Canvas for smooth transitions
  const avatarLastFrameCanvasRef = useRef<HTMLCanvasElement | null>(null) // Canvas for smooth transitions
  const avatarCanvasRef = useRef<HTMLCanvasElement | null>(null) // Canvas for smooth avatar transitions

  const actualVideoRef = useRef<HTMLVideoElement | null>(null)
  const actualAvatarVideoRef = useRef<HTMLVideoElement | null>(null)

  const switchVideo = (index: number) => {
    const isOdd = Boolean(index & 1)

    if (isOdd) {
      // Show video1, hide hiddenVideo - use only z-index for instant switch
      video1Ref.current.style.zIndex = '10'
      video1Ref.current.style.display = 'block'
      avatarVideo1Ref.current.style.zIndex = '10'
      avatarVideo1Ref.current.style.display = 'block'

      hiddenVideoRef.current.style.zIndex = '5'
      hiddenVideoRef.current.style.display = 'none'
      avatarVideoRef.current.style.zIndex = '5'
      avatarVideoRef.current.style.display = 'none'

      // Preload next video in background (hiddenVideo)
      if (index + 1 < mediaQueueRef.current.length) {
        const nextMedia = mediaQueueRef.current[index + 1]
        hiddenVideoRef.current.src = nextMedia.videoUrl
        avatarVideoRef.current.src = nextMedia?.avatar?.videoUrl || ''
        // Preload but don't play
        hiddenVideoRef.current.load()
        if (nextMedia?.avatar?.videoUrl) {
          avatarVideoRef.current.load()
        }
      }
      hiddenVideoRef.current.pause()
      avatarVideoRef.current.pause()
    } else {
      // Show hiddenVideo, hide video1 - use only z-index for instant switch
      hiddenVideoRef.current.style.zIndex = '10'
      hiddenVideoRef.current.style.display = 'block'
      avatarVideoRef.current.style.zIndex = '10'
      avatarVideoRef.current.style.display = 'block'

      video1Ref.current.style.zIndex = '5'
      video1Ref.current.style.display = 'none'
      avatarVideo1Ref.current.style.zIndex = '5'
      avatarVideo1Ref.current.style.display = 'none'

      const currentMedia = mediaQueueRef.current[index]
      if (index === 0) {
        hiddenVideoRef.current.src = currentMedia.videoUrl
        avatarVideoRef.current.src = currentMedia?.avatar?.videoUrl || ''
      }

      // Preload next video in background (video1)
      if (index + 1 < mediaQueueRef.current.length) {
        const nextMedia = mediaQueueRef.current[index + 1]
        video1Ref.current.src = nextMedia.videoUrl
        avatarVideo1Ref.current.src = nextMedia?.avatar?.videoUrl || ''
        // Preload but don't play
        video1Ref.current.load()
        if (nextMedia?.avatar?.videoUrl) {
          avatarVideo1Ref.current.load()
        }
      }
      video1Ref.current.pause()
      avatarVideo1Ref.current.pause()
    }
  }

  // Canvas helper functions for smooth transitions
  const showFirstFrameCanvas = useCallback(() => {
    if (firstFrameCanvasRef.current) {
      firstFrameCanvasRef.current.style.display = 'block'
      firstFrameCanvasRef.current.style.zIndex = '8' // Behind videos but above background
    }
  }, [])

  const hideFirstFrameCanvas = useCallback(() => {
    if (firstFrameCanvasRef.current) {
      firstFrameCanvasRef.current.style.display = 'none'
      firstFrameCanvasRef.current.style.zIndex = '1'
    }
  }, [])

  const captureFirstFrame = useCallback(
    (videoElement: HTMLVideoElement | null, avatarElement: HTMLVideoElement | null = null) => {
      let mainSuccess = false
      let avatarSuccess = false

      // Capture first frame of main video
      if (videoElement && firstFrameCanvasRef.current) {
        // Ensure video is at the beginning to capture first frame
        const originalTime = videoElement.currentTime
        videoElement.currentTime = 0

        // Wait for the video to seek to the beginning and then capture
        const captureFrame = () => {
          mainSuccess = drawVideoFrameToCanvas(
            videoElement,
            firstFrameCanvasRef.current,
          )
          if (mainSuccess) {
            showFirstFrameCanvas()
            console.log('Next video first frame captured successfully')
          }
          // Restore original time if it was different
          if (originalTime > 0) {
            videoElement.currentTime = originalTime
          }
        }

        if (videoElement.readyState >= 2) {
          captureFrame()
        } else {
          videoElement.addEventListener('loadeddata', captureFrame, {
            once: true,
          })
        }
      }

      // Capture first frame of avatar if exists
      if (avatarElement && avatarCanvasRef.current) {
        // Ensure avatar video is at the beginning
        const originalAvatarTime = avatarElement.currentTime
        avatarElement.currentTime = 0

        const captureAvatarFrame = () => {
          avatarSuccess = drawVideoFrameToCanvas(
            avatarElement,
            avatarCanvasRef.current,
          )
          if (avatarSuccess) {
            avatarCanvasRef.current.style.display = 'block'
            avatarCanvasRef.current.style.zIndex = '8'
            console.log('Next avatar first frame captured successfully')
          }
          // Restore original time if it was different
          if (originalAvatarTime > 0) {
            avatarElement.currentTime = originalAvatarTime
          }
        }

        if (avatarElement.readyState >= 2) {
          captureAvatarFrame()
        } else {
          avatarElement.addEventListener('loadeddata', captureAvatarFrame, {
            once: true,
          })
        }
      }

      return mainSuccess || avatarSuccess
    },
    [showFirstFrameCanvas],
  )

  // Canvas helper functions for smooth transitions
  const showLastFrameCanvas = useCallback(() => {
    if (lastFrameCanvasRef.current) {
      lastFrameCanvasRef.current.style.display = 'block'
      lastFrameCanvasRef.current.style.zIndex = '7' // Behind videos and first frame canvas but above background
    }
  }, [])

  const hideLastFrameCanvas = useCallback(() => {
    if (lastFrameCanvasRef.current) {
      lastFrameCanvasRef.current.style.display = 'none'
      lastFrameCanvasRef.current.style.zIndex = '1'
    }
  }, [])

  const captureLastFrame = useCallback(
    (videoElement: HTMLVideoElement | null, avatarElement: HTMLVideoElement | null = null) => {
      let mainSuccess = false
      let avatarSuccess = false

      // Capture last frame of main video
      if (videoElement && lastFrameCanvasRef.current) {
        // Ensure video is at the end to capture last frame
        const originalTime = videoElement.currentTime
        videoElement.currentTime = originalTime ?? videoElement?.duration ?? 0

        // Wait for the video to seek to the end and then capture
        const captureFrame = () => {
          mainSuccess = drawVideoFrameToCanvas(
            videoElement,
            lastFrameCanvasRef.current,
          )
          if (mainSuccess) {
            showLastFrameCanvas()
            console.log('Next video last frame captured successfully')
          }
          // Restore original time if it was different
          if (originalTime > 0) {
            videoElement.currentTime = originalTime
          }
        }

        if (videoElement.readyState >= 2) {
          captureFrame()
        } else {
          videoElement.addEventListener('loadeddata', captureFrame, {
            once: true,
          })
        }
      }

      // Capture first frame of avatar if exists
      if (avatarElement && avatarLastFrameCanvasRef.current) {
        // Ensure avatar video is at the beginning
        const originalAvatarTime = avatarElement.currentTime
        avatarElement.currentTime =
          originalAvatarTime ?? avatarElement?.duration ?? 0

        const captureAvatarFrame = () => {
          avatarSuccess = drawVideoFrameToCanvas(
            avatarElement,
            avatarLastFrameCanvasRef.current,
          )
          if (avatarSuccess) {
            avatarLastFrameCanvasRef.current.style.display = 'block'
            avatarLastFrameCanvasRef.current.style.zIndex = '7'
            console.log('Next avatar last frame captured successfully')
          }
          // Restore original time if it was different
          if (originalAvatarTime > 0) {
            avatarElement.currentTime = originalAvatarTime
          }
        }

        if (avatarElement.readyState >= 2) {
          captureAvatarFrame()
        } else {
          avatarElement.addEventListener('loadeddata', captureAvatarFrame, {
            once: true,
          })
        }
      }

      return mainSuccess || avatarSuccess
    },
    [showLastFrameCanvas],
  )

  // Helper functions to control video visibility - using display for instant switching
  const showVideo = useCallback(
    (delayCanvasHide = true) => {
      if (actualVideoRef.current) {
        actualVideoRef.current.style.display = 'block'
        actualVideoRef.current.style.zIndex = '10'
      }
      if (actualAvatarVideoRef.current) {
        actualAvatarVideoRef.current.style.display = 'block'
        actualAvatarVideoRef.current.style.zIndex = '10'
      }

      // Hide canvases after a brief delay to allow smooth transition
      const hideCanvases = () => {
        hideFirstFrameCanvas()
        hideLastFrameCanvas()
        if (avatarCanvasRef.current) {
          avatarCanvasRef.current.style.display = 'none'
          avatarCanvasRef.current.style.zIndex = '1'
        }
        if (avatarLastFrameCanvasRef.current) {
          avatarLastFrameCanvasRef.current.style.display = 'none'
          avatarLastFrameCanvasRef.current.style.zIndex = '1'
        }
      }

      if (delayCanvasHide) {
        // Small delay to show smooth transition
        //setTimeout(hideCanvases, 100)
      } else {
        hideCanvases()
      }
    },
    [hideFirstFrameCanvas, hideLastFrameCanvas],
  )

  const hideVideo = useCallback(() => {
    if (actualVideoRef.current) {
      actualVideoRef.current.style.display = 'none'
      actualVideoRef.current.style.zIndex = '5'
    }
    if (actualAvatarVideoRef.current) {
      actualAvatarVideoRef.current.style.display = 'none'
      actualAvatarVideoRef.current.style.zIndex = '5'
    }
  }, [])

  const combinedVideoAttributesRef = useRef({
    type: 'custom',
    duration: 0,
    currentTime: 0,
    playbackRate: 1,
    paused: true,
    ended: false,
    muted: false,
    volume: 1,
    seeking: false,
    readyState: 0,
    buffered: [],
    loading: false,
    progress: 0,
  })

  // const { videoAnalyticsEventsHandler } = useVideoAnalytics({
  //   videoRef: combinedVideoAttributesRef,
  //   videoId,
  //   pipelineId,
  //   organisationId,
  //   sourceId,
  //   name,
  // })

  const [presentationData, setPresentationData] = useState(null)
  const presentationRef = useRef(null)
  const [showControls, setShowControls] = useState(false)
  const [controlsTimeout, setControlsTimeout] = useState(null)
  const [showQualityMenu, setShowQualityMenu] = useState(false)
  const [userSelectedQuality, setUserSelectedQuality] = useState('1080')
  const [selectedQuality, setSelectedQuality] = useState(null) // Default to 1080p for Auto mode
  const [lastQualityChangeTime, setLastQualityChangeTime] = useState(0)
  const [qualityChangeCooldownActive, setQualityChangeCooldownActive] =
    useState(false)


  const qualityBasedVideoDeliveryResponse = useGetVideoByQualityDelivery({
    resultId: videoId,
    quality: selectedQuality,
  })

  const qualityBasedVideoResponse = useMemo(
    () =>qualityBasedVideoDeliveryResponse,
    [
      qualityBasedVideoDeliveryResponse,
    ],
  )

 
  const deliveryVideoQualityStats = useGetDeliveryVideoByQualityStatus({
    resultId: videoId,
  })
  const videoQualityStatsResponse = useMemo(
    () => (deliveryVideoQualityStats ),
    [ deliveryVideoQualityStats],
  )
  const videoQualityStatusRef = useRef({
    1080: true,
  })

  useEffect(() => {
    const updateVideoQuality = async () => {
      if (videoQualityStatsResponse.data) {
        videoQualityStatusRef.current = videoQualityStatsResponse.data

        if (selectedQuality) return
        const speedMeter = new NetworkSpeedMeter()
        const networkSpeed = await speedMeter.getNetworkSpeed()
        const newQuality = speedMeter.getSupportedQualities(
          networkSpeed.speed,
          videoQualityStatusRef.current,
        )
        console.log(`Switched to quality: ${newQuality}`)
        if (newQuality !== userSelectedQuality) {
          setUserSelectedQuality(newQuality)
          setSelectedQuality(newQuality as string)
        }
      }
    }
    updateVideoQuality()
  }, [videoQualityStatsResponse.data])

  useEffect(() => {
    if (videos && videos.length > 0) {
      loadMedia(videos)
    }
  }, [videos])

  const getPipStyles = ({ container, radius, x, y }: { container: HTMLDivElement | null; radius: number; x: number; y: number }) => {
    if (!container) return { width: 0, height: 0 }

    const isPortrait =
      renderSettings.canvas_dimensions.width <
      renderSettings.canvas_dimensions.height

    const ACTUAL_CONTAINER_SIZE = renderSettings.max_quality || 1080
    const VIDEO_CONTAINER_SIZE = isPortrait
      ? container.clientHeight
      : container.clientWidth

    const SCALE_RATIO = VIDEO_CONTAINER_SIZE / ACTUAL_CONTAINER_SIZE
    const PIP_WIDTH =
      SCALE_RATIO * (renderSettings.video_dimensions.width || 1038)
    const PIP_HEIGHT =
      SCALE_RATIO * (renderSettings.video_dimensions.height || 778)

    const width = (Number(radius) / 100) * PIP_WIDTH
    const height = (Number(radius) / 100) * PIP_HEIGHT
    const xPos = Number(x)
    const yPos = Number(y)

    const scaledX = SCALE_RATIO * xPos
    const scaledY = SCALE_RATIO * yPos
    // const padding = `0 ${(SCALE_RATIO * 130 * radius) / 100}px`
    const padding = `0 0`

    return {
      width: isPortrait ? width : undefined,
      height: !isPortrait ? height : undefined,
      aspectRatio: renderSettings ? `${renderSettings.canvas_dimensions.width / renderSettings.canvas_dimensions.height}` : '1 / 1',
      x: scaledX,
      y: scaledY,
      position: 'absolute',
      left: 0,
      top: 0,
      padding,
      transform: `translate(${scaledX}px, ${scaledY}px)`,
      zIndex: 10,
      borderRadius: `${renderSettings.pip_radius ?? 50}%`,
      overflow: 'hidden',
      touchAction: 'none',
    }
  }

  const preloadVideo = async (url: string, index: number, type = 'video') => {
    return new Promise((resolve, reject) => {
      const cleanVideoUrl = cleanUrl(url)
      if (preloadedVideos.current[cleanVideoUrl]?.duration) {
        resolve(preloadedVideos.current[cleanVideoUrl])
        return
      }
      const video = document.createElement('video')
      video.crossOrigin = 'anonymous'
      video.playsInline = true
      video.preload = 'auto'
      video.src = url

      const onLoadedMetadata = () => {
        video.removeEventListener('loadedmetadata', onLoadedMetadata)
        video.removeEventListener('error', onError)

        preloadedVideos.current[cleanVideoUrl] = video

        const media = mediaQueueRef.current?.[index]
        if (type === 'video' && media) {
          if (media.avatar) media.videoDuration = video.duration
          else media.duration = video.duration
        }

        resolve(video)
      }

      const onError = (error: any) => {
        video.removeEventListener('loadedmetadata', onLoadedMetadata)
        video.removeEventListener('error', onError)
        console.error('Error preloading video:', error)
        reject(error)
      }

      video.addEventListener('loadedmetadata', onLoadedMetadata)
      video.addEventListener('error', onError)
    })
  }

  const preloadAudio = async (url: string) => {
    if (!url) return null

    return new Promise((resolve, reject) => {
      const cleanAudioUrl = cleanUrl(url)
      if (preloadedAudios.current[cleanAudioUrl]) {
        resolve(preloadedAudios.current[cleanAudioUrl])
        return
      }

      const audio = new Audio()
      audio.crossOrigin = 'anonymous'
      audio.preload = 'auto'
      audio.src = url

      const onLoadedMetadata = () => {
        audio.removeEventListener('loadedmetadata', onLoadedMetadata)
        audio.removeEventListener('error', onError)

        preloadedAudios.current = {
          ...preloadedAudios.current,
          [cleanAudioUrl]: audio,
        }

        resolve(audio)
      }

      const onError = (error: any) => {
        audio.removeEventListener('loadedmetadata', onLoadedMetadata)
        audio.removeEventListener('error', onError)
        console.error('Error preloading audio:', error)
        reject(error)
      }

      audio.addEventListener('loadedmetadata', onLoadedMetadata)
      audio.addEventListener('error', onError)
    })
  }

  const preloadNextVideo = useCallback(async (currentIndex: number) => {
    const nextIndex = currentIndex + 1
    if (nextIndex >= mediaQueueRef.current.length) return

    // Don't preload if already preloading or preloaded
    if (preloadingStatusRef.current[nextIndex]) return

    preloadingStatusRef.current[nextIndex] = 'loading'
    nextVideoReadyRef.current = false

    const nextMedia = mediaQueueRef.current[nextIndex]
    const cleanVideoUrl = cleanUrl(nextMedia.videoUrl)

    try {
      // Preload video
      if (!preloadedVideos.current[cleanVideoUrl]) {
        await preloadVideo(nextMedia.videoUrl, nextIndex)
      }
      console.log(`Next video ${nextIndex} preloaded: ${nextMedia.videoUrl}`)
      // Preload audio if exists
      if (
        nextMedia.audioUrl &&
        !preloadedAudios.current[cleanUrl(nextMedia.audioUrl)]
      ) {
        await preloadAudio(nextMedia.audioUrl)
      }

      // Preload avatar if exists
      if (nextMedia.avatar?.videoUrl) {
        const cleanAvatarUrl = cleanUrl(nextMedia.avatar.videoUrl)
        if (!preloadedVideos.current[cleanAvatarUrl]) {
          await preloadVideo(nextMedia.avatar.videoUrl, nextIndex, 'avatar')
        }
        if (
          nextMedia.avatar.audioUrl &&
          !preloadedAudios.current[cleanUrl(nextMedia.avatar.audioUrl)]
        ) {
          await preloadAudio(nextMedia.avatar.audioUrl)
        }
      }

      preloadingStatusRef.current[nextIndex] = 'ready'
      nextVideoReadyRef.current = true
      console.log(`Next video ${nextIndex} preloaded successfully`)
    } catch (error) {
      console.warn('Failed to preload next video:', error)
      preloadingStatusRef.current[nextIndex] = 'failed'
      nextVideoReadyRef.current = false
    }
  }, [])

  const ensureNextVideoReady = useCallback(
    async (currentIndex: number) => {
      const nextIndex = currentIndex + 1
      if (nextIndex >= mediaQueueRef.current.length) return true

      const status = preloadingStatusRef.current[nextIndex]

      if (status === 'ready') return true
      if (status === 'loading') {
        // Wait up to 2 seconds for loading to complete
        for (let i = 0; i < 20; i++) {
          await new Promise((resolve) => setTimeout(resolve, 100))
          if (preloadingStatusRef.current[nextIndex] === 'ready') return true
        }
      }

      // Force preload if not ready
      console.warn('Emergency preload for next video')
      await preloadNextVideo(currentIndex)
      return preloadingStatusRef.current[nextIndex] === 'ready'
    },
    [preloadNextVideo],
  )

  const preloadAllMedia = async (formattedVideos: any[]) => {
    const preloadPromises = formattedVideos.map((media, index) => {
      let videoPromise
      videoPromise = media.videoUrl
        ? preloadVideo(media.videoUrl, index)
        : Promise.resolve(null)
      const audioPromise = media.audioUrl
        ? preloadAudio(media.audioUrl)
        : Promise.resolve(null)

      const avatarPromises = []
      if (media.avatar && media.avatar.videoUrl) {
        avatarPromises.push(
          preloadVideo(media.avatar.videoUrl, index, 'avatar'),
        )
        if (media.avatar.audioUrl) {
          avatarPromises.push(preloadAudio(media.avatar.audioUrl))
        }
      }

      return Promise.all([videoPromise, audioPromise, ...avatarPromises])
    })

    try {
      await Promise.all(preloadPromises)
      console.log('All media preloaded successfully')
    } catch (error) {
      console.error('Error during preloading:', error)
    }
  }
  const loadMedia = useCallback(
    async (videoObjects: any[], preservePosition = false) => {
      if (!videoObjects || videoObjects.length === 0) {
        console.warn('Please provide at least one video.')
        return
      }

      // Save current position if needed
      const previousIndex = preservePosition
        ? currentMediaIndexRef.current < 0
          ? 0
          : currentMediaIndexRef.current
        : -1
      const previousTime = preservePosition ? currentTimeRef.current : 0
      const timeWithinVideo =
        previousIndex > 0
          ? previousTime - videoEndTimesRef.current[previousIndex - 1]
          : previousTime

      try {
        combinedVideoAttributesRef.current.loading = true
        const formattedVideos = videoObjects
          .map((videoObj, index) => {
            let videoUrl = videoObj.video
            if (videoObj.type === 'presentation') {
              videoUrl = videoObj.audio
            }
            const oldMedia = mediaQueueRef.current?.[index]

            const previewAndLipSyncComponent =
              preview && videoObj.type === 'lipsync'

            return {
              videoUrl,
              audioUrl:
                previewAndLipSyncComponent ||
                (videoObj.type === 'content' && !videoObj.avatar)
                  ? videoObj.audio
                  : null,
              template: videoObj.template || null,
              avatar: videoObj.avatar
                ? {
                    videoUrl: videoObj.avatar.video,
                    audioUrl: videoObj.avatar.audio || null,
                    position: videoObj.avatar.position || null,
                  }
                : null,
              bullet_points: videoObj.bullet_points || null,
              type: previewAndLipSyncComponent
                ? 'content'
                : videoObj.type || 'content',
              duration:
                videoObj?.duration ||
                oldMedia?.duration ||
                videoObj?.videoDuration ||
                oldMedia?.videoDuration ||
                0,
              videoDuration:
                videoObj?.videoDuration ||
                oldMedia?.videoDuration ||
                videoObj?.duration ||
                null,
              playbackRate: preservePosition ? oldMedia.playbackRate || 1 : 1,
            }
          })
          .filter((videoObj) => {
            if (videoObj.type === 'presentation') {
              return !isSkipPresentation(videoObj.bullet_points)
            }
            return true
          })

        setIsLoading(true)

        preloadingStatusRef.current = {}
        mediaQueueRef.current = formattedVideos

        if (preservePosition && previousIndex >= 0) {
          loadingMediaRef.current = true
          setLoadingMessage('Changing video quality...')
          const playing = isPlaying
          actualVideoRef.current.pause()
          actualAvatarVideoRef.current?.pause()
          audioPlayerRef.current?.pause()

          // Preload the new quality video first
          await Promise.all([preloadNextVideo(previousIndex - 1)])

          // Capture first frame of new quality video for smooth transition
          const isCurrentOdd = Boolean(previousIndex & 1)
          const newQualityVideoElement = isCurrentOdd
            ? video1Ref.current
            : hiddenVideoRef.current
          const newQualityAvatarElement = isCurrentOdd
            ? avatarVideo1Ref.current
            : avatarVideoRef.current

          // Set the new quality video source and capture first frame
          const newMedia = formattedVideos[previousIndex]
          newQualityVideoElement.src = newMedia.videoUrl
          if (newMedia.avatar?.videoUrl) {
            newQualityAvatarElement.src = newMedia.avatar.videoUrl
          }

          captureLastFrame(newQualityVideoElement, newQualityAvatarElement)
          captureFirstFrame(newQualityVideoElement, newQualityAvatarElement)

          await loadMediaSet(
            previousIndex,
            formattedVideos,
            playing,
            timeWithinVideo,
            'Changing video quality...',
          )
          if (!combinedVideoAttributesRef.current.paused) {
            actualVideoRef.current.play()
            actualAvatarVideoRef.current?.play()
            audioPlayerRef.current?.play()
          }
          preloadNextVideo(previousIndex)
          return
        }

        setLoadingMessage('Loading media...')
        currentMediaIndexRef.current = -1 // Start with video invisible for smooth initial load
        hideVideo()
        // await preloadAllMedia(formattedVideos.slice(1, 2))
        await loadMediaSet(0, formattedVideos, false, 0)
        captureFirstFrame(actualVideoRef.current, actualAvatarVideoRef.current)
        await initializeTimeline(formattedVideos)
        // videoAnalyticsEventsHandler.loadedmetadata()
      } catch (error) {
        console.error('Error loading media:', error)
        console.warn('Error loading media. Please try again.')
      } finally {
        combinedVideoAttributesRef.current.loading = false
        setIsLoading(false)
        setLoadingMessage('')
        loadingMediaRef.current = false
      }
    },
    // [videoAnalyticsEventsHandler],
    []
  )

  const initializeTimeline = async (queue: any[]) => {
    let accumulatedDuration = 0
    const durationPromises = queue.map((media, idx) => {
      return new Promise((resolve) => {
        if (preloadedVideos.current[media.videoUrl] || media.duration) {
          resolve({
            duration:
              media.duration ||
              preloadedVideos.current?.[media.videoUrl]?.duration ||
              0,
            videoDuration:
              media.videoDuration ||
              preloadedVideos.current?.[media.videoUrl]?.duration ||
              media.duration,
          })
          return
        }

        const video = document.createElement('video')
        video.crossOrigin = 'anonymous'
        video.playsInline = true
        video.src = media.videoUrl

        video.addEventListener('loadedmetadata', () => {
          resolve({
            duration: media.duration || video.duration,
            videoDuration: video.duration,
          })
        })

        video.addEventListener('error', () => {
          console.error('Error loading video for duration calculation')
          resolve({ duration: media?.duration ?? 0.1, videoDuration: 0.1 })
        })
      })
    })

    const durations = await Promise.all(durationPromises)
    const videoEndTimes = durations.map((data: any, index: number) => {
      const targetDuration = data.duration ?? 0.001
      const videoDuration = data.videoDuration ?? 0.001

      accumulatedDuration += targetDuration
      mediaQueueRef.current[index].duration = targetDuration
      mediaQueueRef.current[index].videoDuration = videoDuration

      // FIXED: Correct playback rate calculation
      // If video is 10s but should play in 5s: rate = 10/5 = 2x speed
      // If video is 5s but should play in 10s: rate = 5/10 = 0.5x speed
      mediaQueueRef.current[index].playbackRate = videoDuration / targetDuration
      console.log(
        `Media ${index}: videoDuration=${videoDuration}s, targetDuration=${targetDuration}s, rate=${mediaQueueRef.current[index].playbackRate}`,
      )

      return accumulatedDuration
    })

    if (videoEndTimes.some((duration) => duration === 0)) {
      console.error(
        'Some videos have zero duration, this may cause playback issues',
      )
    }

    videoEndTimesRef.current = videoEndTimes
    setTotalDuration(accumulatedDuration)
    combinedVideoAttributesRef.current.duration = accumulatedDuration
  }

 const cleanupCurrentMedia = useCallback(() => {
    const videoEl = actualVideoRef.current
    if (!videoEl) return

    // Only remove event listeners if they exist
    const events = [
      {
        name: 'play',
        handler: handlePlay,
      },
      {
        name: 'pause',
        handler: handlePause,
      },
      {
        name: 'seeked',
        handler: handleSeeked,
      },
      {
        name: 'seeking',
        handler: handleSeeking,
      },
      {
        name: 'timeupdate',
        handler: handleTimeUpdate,
      },
      {
        name: 'ended',
        handler: handleMediaEnded,
      },
      {
        name: 'canplay',
        handler: handleCanPlayVideo,
      },
      {
        name: 'waiting',
        handler: handleVideoWaiting,
      },
    ]
    events.forEach((event) => {
      hiddenVideoRef.current?.removeEventListener(event.name, event.handler)
      video1Ref.current?.removeEventListener(event.name, event.handler)
      videoEl.removeEventListener(event.name, event.handler)
    })

    if (preview) {
      audioPlayerRef.current?.removeEventListener('ended', handleMediaEnded)
      audioPlayerRef.current?.removeEventListener(
        'timeupdate',
        handleTimeUpdate,
      )
    }

    // Pause and cleanup audio players
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause()
      audioPlayerRef.current.currentTime = 0
    }

    if (videoEl) {
      // videoEl.pause()
      videoEl.currentTime = 0
      videoEl.src = ''
    }
    if (hiddenVideoRef.current) hiddenVideoRef.current.currentTime = 0
    if (video1Ref.current) video1Ref.current.currentTime = 0

    if (actualAvatarVideoRef.current) {
      // actualAvatarVideoRef.current.pause()
      actualAvatarVideoRef.current.src = ''
      actualAvatarVideoRef.current.currentTime = 0
    }

    if (presentationRef.current) {
      // clear the iframe content
      presentationRef.current.srcdoc = ''
    }
    avatarDataRef.current = null
  }, [])

  const loadMediaSet = async (
    index: number,
    queueToUse: any[] | null = null,
    playing: boolean = true,
    currentTime: number = 0,
    loaderMessage: string = 'Buffering...',
  ) => {
    if (
      (currentMediaIndexRef.current === index && !currentTime) ||
      loadingMediaRef.current
    )
      return

    currentTime ||= 0
    const queue = queueToUse || mediaQueueRef.current
    const media = queue[index]
    const cleanVideoUrl = cleanUrl(media?.videoUrl)

    // Skip loading state if video is already preloaded
    const isPreloaded = preloadedVideos.current[cleanVideoUrl]

    currentMediaIndexRef.current = index
    try {
      // if (!isPreloaded) {
      setIsLoading(true)
      // }
      setLoadingMessage(loaderMessage)
      loadingMediaRef.current = true
      const queue = queueToUse || mediaQueueRef.current

      cleanupCurrentMedia()

      if (!queue?.length || index >= queue.length || videoEndedRef.current) {
        console.log('Queue is empty or index is out of bounds')

        loadingMediaRef.current = false
        setIsLoading(false)
        return
      }

      const media = queue[index]

      switchVideo(index)

      actualVideoRef.current = Boolean(index & 1)
        ? video1Ref.current
        : hiddenVideoRef.current
      actualAvatarVideoRef.current = Boolean(index & 1)
        ? avatarVideo1Ref.current
        : avatarVideoRef.current

      actualVideoRef.current.src = media.videoUrl

      if (currentTime) actualVideoRef.current.currentTime = currentTime
      actualVideoRef.current.volume = combinedVideoAttributesRef.current.volume
      actualVideoRef.current.muted = combinedVideoAttributesRef.current.muted
      actualVideoRef.current.playbackRate = media.playbackRate
        ? media.playbackRate
        : 1

      const hasAvatar = media.avatar && media.avatar.videoUrl
      // presentation -> audio is played from video itself
      const realVideoAudioCheck =
        media.audioUrl && media.type === 'content' && !hasAvatar
      const previewVideoAudioCheck =
        media.audioUrl && media.type !== 'presentation'
      if (realVideoAudioCheck || previewVideoAudioCheck) {
        const cleanAudioUrl = cleanUrl(media.audioUrl)
        if (!preloadedAudios.current[cleanAudioUrl]) {
          audioPlayerRef.current = document.createElement('audio')
          audioPlayerRef.current.src = media.audioUrl
          audioPlayerRef.current.preload = 'auto'
          audioPlayerRef.current.crossOrigin = 'anonymous'
        } else {
          audioPlayerRef.current = preloadedAudios.current[cleanAudioUrl]
        }

        if (currentTime)
          if (currentTime) audioPlayerRef.current.currentTime = currentTime
        audioPlayerRef.current.volume =
          combinedVideoAttributesRef.current.volume
        audioPlayerRef.current.muted = combinedVideoAttributesRef.current.muted
      } else {
        audioPlayerRef.current = null
      }

      if (media.template) {
        setTemplateUrl(media.template)
      } else {
        setTemplateUrl(null)
      }

      if (media?.avatar && media?.avatar.videoUrl) {
        actualAvatarVideoRef.current.src = media.avatar.videoUrl

        if (currentTime) actualAvatarVideoRef.current.currentTime = currentTime
        actualAvatarVideoRef.current.volume =
          combinedVideoAttributesRef.current.volume
        actualAvatarVideoRef.current.muted =
          combinedVideoAttributesRef.current.muted
        avatarDataRef.current = {
          ...media.avatar,
          position: media.avatar.position,
        }

        if (media?.avatar.position && templateContainerRef.current) {
          const { radius, x, y } = media.avatar.position
          const dimensions = getPipStyles({
            container: videoContainerRef.current,
            radius,
            x,
            y,
          })
          setAvatarDimensions(dimensions)
          avatarContainerRef.current.style.width = dimensions.width + 'px'
          avatarContainerRef.current.style.height = dimensions.height + 'px'
          Object.entries(dimensions ?? {}).forEach(([key, value]) => {
            if (
              typeof value === 'string' &&
              !['width', 'height', 'x', 'y'].includes(key)
            ) {
              avatarContainerRef.current.style[key as any] = value
            }
          })

          if (dimensions.transform) {
            avatarContainerRef.current.style.transform = dimensions.transform
          }
        }

        if (avatarContainerRef.current) {
          avatarContainerRef.current.style.position = 'absolute'
          avatarContainerRef.current.style.zIndex = '10'
          avatarContainerRef.current.style.pointerEvents = 'none'
          avatarContainerRef.current.style.opacity = '1'
          avatarContainerRef.current.style.display = 'block'
        }
      } else {
        if (avatarContainerRef.current) {
          avatarContainerRef.current.style.opacity = '0'
          avatarContainerRef.current.style.display = 'none'
        }
        avatarDataRef.current = null
        if (actualAvatarVideoRef.current) actualAvatarVideoRef.current.src = ''
      }

      if (preview && media.type !== 'presentation' && audioPlayerRef.current) {
        actualVideoRef.current.loop = true
        if (media.avatar) actualAvatarVideoRef.current.loop = true
      } else {
        actualVideoRef.current.loop = false
        if (media.avatar) actualAvatarVideoRef.current.loop = false
      }

      setupEventListeners(actualVideoRef.current)

      if (index > 0) {
        currentTimeRef.current = videoEndTimesRef?.current?.[index - 1]
      } else {
        currentTimeRef.current = 0
      }

      const shouldAutoPlay = playing
      const video = actualVideoRef.current
      const playWhenReady = async () => {
        if (shouldAutoPlay) {
          console.log('Attempting to play video...', index)

          try {
            const playPromise = async () =>
              new Promise(async (resolve, reject) => {
                console.log({
                  message: 'Starting play promise',
                  videoUrl: video,
                  audioUrl: audioPlayerRef.current,
                  avatarVideoUrl: actualAvatarVideoRef.current,
                })

                if (
                  media.type === 'content' &&
                  (audioPlayerRef.current?.src || media.avatar)
                ) {
                  video.muted = true
                } else {
                  video.muted = combinedVideoAttributesRef.current.muted
                }

                // Start playing all media but immediately pause them to prevent glitchy loop
                await Promise.allSettled(
                  [
                    video.play(),
                    media.avatar ? actualAvatarVideoRef?.current?.play() : null,
                    audioPlayerRef.current?.play() ?? null,
                  ].filter(Boolean),
                )

                // Immediately pause all media to prevent loop during sync
                video.pause()
                if (actualAvatarVideoRef?.current) {
                  actualAvatarVideoRef.current.pause()
                }
                if (audioPlayerRef?.current) {
                  audioPlayerRef.current.pause()
                }

                let eventListenersAdded = false
                let fallbackTimerStarted = false
                let resolved = false

                const cleanup = () => {
                  if (eventListenersAdded) {
                    video.removeEventListener('loadeddata', handleLoadedData)
                    if (audioPlayerRef?.current) {
                      audioPlayerRef.current.removeEventListener(
                        'loadeddata',
                        handleLoadedData,
                      )
                    }
                    if (media.avatar) {
                      actualAvatarVideoRef.current.removeEventListener(
                        'loadeddata',
                        handleLoadedData,
                      )
                    }
                  }
                }

                const resolveOnce = () => {
                  if (!resolved) {
                    resolved = true
                    cleanup()
                    // Resume playing all media after sync is complete
                    video.play().catch(console.warn)
                    if (actualAvatarVideoRef?.current) {
                      actualAvatarVideoRef.current.play().catch(console.warn)
                    }
                    if (audioPlayerRef?.current) {
                      audioPlayerRef.current.play().catch(console.warn)
                    }
                    // Show video after successful load
                    showVideo()
                    resolve(true)
                  }
                }

                const syncCurrentTime = () => {
                  video.currentTime = currentTime * (media.playbackRate || 1)
                  if (audioPlayerRef?.current) {
                    audioPlayerRef.current.currentTime = currentTime
                  }
                  if (media.avatar) {
                    actualAvatarVideoRef.current.currentTime = currentTime
                  }
                }

                const checkReadyState = () => {
                  return (
                    video.readyState >= 2 &&
                    (audioPlayerRef?.current?.readyState >= 2 ||
                      !audioPlayerRef?.current) &&
                    (actualAvatarVideoRef?.current?.readyState >= 2 ||
                      !media.avatar)
                  )
                }

                const handleLoadedData = () => {
                  console.log('loadeddata event fired')
                  syncCurrentTime()

                  if (checkReadyState()) {
                    console.log('All media ready via loadeddata event')
                    resolveOnce()
                  }
                }

                // Primary method: Use loadeddata event listeners
                try {
                  video.addEventListener('loadeddata', handleLoadedData)
                  if (audioPlayerRef?.current) {
                    audioPlayerRef.current.addEventListener(
                      'loadeddata',
                      handleLoadedData,
                    )
                  }
                  if (media.avatar) {
                    actualAvatarVideoRef.current.addEventListener(
                      'loadeddata',
                      handleLoadedData,
                    )
                  }
                  eventListenersAdded = true

                  // Check if already loaded
                  if (checkReadyState()) {
                    console.log('Media already ready, syncing time')
                    syncCurrentTime()
                    resolveOnce()
                    return
                  }
                } catch (eventError) {
                  console.warn(
                    'Error setting up loadeddata event listeners:',
                    eventError,
                  )
                }

                // Fallback method: Use interval-based checking with timeout
                const startFallbackTimer = () => {
                  if (fallbackTimerStarted || resolved) return
                  fallbackTimerStarted = true

                  console.log(
                    'Starting fallback timer for media readiness check',
                  )

                  let attempts = 0
                  let lastSyncTime = 0
                  const maxAttempts = 100 // 5 second timeout (50ms × 100)
                  const SYNC_INTERVAL = 200 // Only sync every 200ms to reduce loop

                  const bufferingCheck = setInterval(() => {
                    if (resolved) {
                      clearInterval(bufferingCheck)
                      return
                    }

                    attempts++
                    const now = Date.now()

                    // Only sync time periodically to prevent glitchy loop
                    if (now - lastSyncTime > SYNC_INTERVAL) {
                      syncCurrentTime()
                      lastSyncTime = now
                    }

                    console.log('Ready states:', {
                      video: video.readyState,
                      audio: audioPlayerRef?.current?.readyState || 'N/A',
                      avatar:
                        actualAvatarVideoRef?.current?.readyState || 'N/A',
                      videobuffer: video.buffered,
                      audiobuffer: audioPlayerRef?.current?.buffered || 'N/A',
                      avatarbuffer:
                        actualAvatarVideoRef?.current?.buffered || 'N/A',
                    })

                    if (checkReadyState()) {
                      clearInterval(bufferingCheck)
                      console.log('Media ready via fallback method')
                      resolveOnce()
                    } else if (attempts >= maxAttempts) {
                      clearInterval(bufferingCheck)
                      console.warn(
                        'Timeout waiting for media to be ready, proceeding anyway',
                      )
                      resolveOnce()
                    } else {
                      console.log(
                        `Waiting for media to be ready... (attempt ${attempts}/${maxAttempts})`,
                      )
                    }
                  }, 50)
                }

                // Start fallback timer after a short delay to give loadeddata events a chance
                setTimeout(() => {
                  if (!resolved) {
                    startFallbackTimer()
                  }
                }, 200) // 200ms delay before starting fallback
              })

            if (actualAvatarVideoRef.current) {
              actualAvatarVideoRef.current.muted = true
            }
            if (audioPlayerRef.current) {
              audioPlayerRef.current.muted = true
            }
            await playPromise()

            if (audioPlayerRef?.current || actualAvatarVideoRef?.current.src)
              syncMediaAfterLoad(currentTime)

            actualVideoRef.current.muted =
              media.type === 'content' &&
              (audioPlayerRef.current?.src || media.avatar)
                ? true
                : combinedVideoAttributesRef.current.muted
            if (actualAvatarVideoRef.current) {
              actualAvatarVideoRef.current.muted =
                combinedVideoAttributesRef.current.muted
            }
            if (audioPlayerRef.current) {
              audioPlayerRef.current.muted =
                combinedVideoAttributesRef.current.muted
            }
          } catch (error) {
            console.error('Error playing media:', error)
            setIsPlaying(false)
          } finally {
            loadingMediaRef.current = false
            // Only hide loading if we showed it
            if (!isPreloaded) {
              setIsLoading(false)
            }
          }
        } else {
          updateVideoDimensions(video)
          setIsPlaying(false)
          // Show video even when not auto-playing
          showVideo()
        }
      }

      const debugSyncStatus = () => {
        const media = mediaQueueRef.current[currentMediaIndexRef.current]
        if (!media) return

        const videoTime = actualVideoRef.current?.currentTime || 0
        const audioTime = audioPlayerRef.current?.currentTime || 0
        const avatarTime = actualAvatarVideoRef.current?.currentTime || 0
        const timelineTime = currentTimeRef.current

        console.log('Sync Status:', {
          timeline: +timelineTime?.toFixed(2),
          video: +videoTime?.toFixed(2),
          audio: +audioTime?.toFixed(2),
          avatar: +avatarTime?.toFixed(2),
          playbackRate: media.playbackRate,
          expectedVideoTime: (timelineTime * (media.playbackRate || 1)).toFixed(
            2,
          ),
        })
      }

      await playWhenReady()

      if (preview && media.type === 'content' && audioPlayerRef.current) {
        actualVideoRef.current.muted = true
        if (actualAvatarVideoRef.current) {
          actualAvatarVideoRef.current.muted = true
        }
      }

      if (media.type === 'presentation') {
        setPresentationData({
          content: media.bullet_points,
          template: media.template,
          duration: media.duration, // Use target duration, not video duration
        })
      } else {
        setPresentationData(null)
      }
      setIsPlaying(shouldAutoPlay)

      debugSyncStatus()

      // Setup initial dimensions
      if (video.readyState >= 2) {
        updateVideoDimensions(video)
      } else {
        video.addEventListener(
          'loadedmetadata',
          () => {
            updateVideoDimensions(video)
          },
          { once: true },
        )
      }
    } catch (error) {
      console.error('Error loading media set:', error)
      console.warn('Error loading media. Please try again.')
      setIsPlaying(false)
    } finally {
      loadingMediaRef.current = false
      setIsLoading(false)
      setLoadingMessage('')
    }
  }

  const updateVideoDimensions = (video: HTMLVideoElement) => {
    if (!video) return

    // Calculate dimensions for a 4:3 display
    const width = templateContainerRef.current
      ? templateContainerRef.current.offsetWidth
      : video.videoWidth
    const height = (width * 3) / 4 // 4:3 aspect ratio

    setVideoDimensions({ width, height })
  }

  const setupEventListeners = (videoPlayer: HTMLVideoElement) => {
    const currentMediaIndex =
      currentMediaIndexRef.current <= 0 ? 0 : currentMediaIndexRef.current
    const currentMedia = mediaQueueRef.current[currentMediaIndex]

    videoPlayer.addEventListener('play', handlePlay)
    videoPlayer.addEventListener('pause', handlePause)
    videoPlayer.addEventListener('seeked', handleSeeked)
    videoPlayer.addEventListener('seeking', handleSeeking)
    videoPlayer.addEventListener('waiting', handleVideoWaiting)
    videoPlayer.addEventListener('canplay', handleCanPlayVideo)
    if (preview && currentMedia.type !== 'presentation' && currentMedia.audioUrl) {
      audioPlayerRef.current?.addEventListener('timeupdate', handleTimeUpdate)
      audioPlayerRef.current?.addEventListener('ended', handleMediaEnded)
    } else {
      videoPlayer.addEventListener('timeupdate', handleTimeUpdate)
      videoPlayer.addEventListener('ended', handleMediaEnded)
    }
    // videoPlayer.addEventListener('progress', handleProgress())
  }

  const videoFrameWaitingRef = useRef(false)

  const handleVideoWaiting = () => {
    if (loadingMediaRef.current || videoFrameWaitingRef.current) return
    videoFrameWaitingRef.current = true
    console.log('Video is waiting for data...')
    setIsLoading(true)
    setLoadingMessage('Buffering...')

    if (actualAvatarVideoRef.current) {
      actualAvatarVideoRef.current.pause()
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause()
    }
  }

  const handleCanPlayVideo = async () => {
    if (loadingMediaRef.current || !videoFrameWaitingRef.current) return

    await new Promise((resolve) => {
      setTimeout(() => {
        resolve(true)
      }, 100)
    })

    console.log('Video can play now')
    setLoadingMessage('')
    setIsLoading(false)

    const currentMediaIndex =
      currentMediaIndexRef.current <= 0 ? 0 : currentMediaIndexRef.current
    const currentMedia = mediaQueueRef.current[currentMediaIndex]
    if (currentMedia.avatar) {
      actualAvatarVideoRef.current
        .play()
        .then(() => {})
        .catch((e) => {
          setTimeout(() => {
            actualAvatarVideoRef.current.play()
            setLoadingMessage('')
          }, 100)
        })
    }
    if (audioPlayerRef.current) {
      audioPlayerRef.current
        .play()
        .then(() => {})
        .catch((e) => {
          setTimeout(() => {
            audioPlayerRef.current.play()
          }, 100)
        })
    }
    videoFrameWaitingRef.current = false
  }

  const handlePlay = () => {
    const media = mediaQueueRef.current[currentMediaIndexRef.current]
    if (!isStartedPlaying) setIsStartedPlaying(true)
    if (audioPlayerRef.current) audioPlayerRef.current?.play()
    if (presentationRef.current) togglePresentationAnimation(true)
    if (media.avatar && actualAvatarVideoRef.current) {
      actualAvatarVideoRef.current
        .play()
        .catch((e) => console.warn('Avatar video play error:', e))
    }

    if (!isPlaying) setIsPlaying(true)
    combinedVideoAttributesRef.current.paused = false
    combinedVideoAttributesRef.current.playbackRate = 1
  }

  const handlePause = () => {
    if (!actualVideoRef.current) return
    if (
      actualVideoRef.current.ended &&
      currentMediaIndexRef.current !== mediaQueueRef.current.length - 1
    ) {
      // not pause the video if it is ended and last video
      return
    }

    if (audioPlayerRef.current) audioPlayerRef.current?.pause()
    if (presentationRef.current) togglePresentationAnimation(false)
    if (actualAvatarVideoRef.current) {
      actualAvatarVideoRef.current.pause()
    }
    combinedVideoAttributesRef.current.paused = true
    setIsPlaying(false)
  }

  const handleSeeked = (e: Event) => {
    e.preventDefault()
    const videoPlayer = actualVideoRef.current

    combinedVideoAttributesRef.current.seeking = false
  }

  const handleSeeking = () => {
    combinedVideoAttributesRef.current.seeking = true
  }

  const handleTimeUpdate = () => {
    if (loadingMediaRef.current) return
    updateCurrentTime()
    updateProgress()

    if (!actualVideoRef.current.paused) {
      setIsPlaying(true)
    }

    // Ensure video is visible during playback
    if (actualVideoRef.current.style.display === 'none') {
      showVideo(false) // No delay during normal playback
    }

    // Preload next video when current is 30% complete
    const currentMedia = mediaQueueRef.current[currentMediaIndexRef.current]
    if (currentMedia && actualVideoRef.current) {
      const progress =
        actualVideoRef.current.currentTime / actualVideoRef.current.duration
      if (progress > 0.3) {
        preloadNextVideo(currentMediaIndexRef.current)
      }
    }
  }

  // Instant video switch without canvas - just flip z-index and play
  const instantVideoSwitch = async (nextIndex: number, currentQueue: any[]) => {
    const nextMedia = currentQueue[nextIndex]
    const isNextOdd = Boolean(nextIndex & 1)

    // Update current media index
    currentMediaIndexRef.current = nextIndex

    // Switch which video is active by manipulating z-index
    switchVideo(nextIndex)

    // Update actual video references
    actualVideoRef.current = isNextOdd
      ? video1Ref.current
      : hiddenVideoRef.current
    actualAvatarVideoRef.current = isNextOdd
      ? avatarVideo1Ref.current
      : avatarVideoRef.current

    if (actualVideoRef.current.buffered.length <= 1) {
      setIsLoading(true)
      setLoadingMessage('Buffering...')
    }

    // Set up the new video properties
    actualVideoRef.current.volume = combinedVideoAttributesRef.current.volume
    actualVideoRef.current.muted = combinedVideoAttributesRef.current.muted
    actualVideoRef.current.playbackRate = nextMedia.playbackRate || 1

    // Handle avatar if exists
    if (nextMedia.avatar?.videoUrl && actualAvatarVideoRef.current) {
      actualAvatarVideoRef.current.volume =
        combinedVideoAttributesRef.current.volume
      actualAvatarVideoRef.current.muted =
        combinedVideoAttributesRef.current.muted
      actualAvatarVideoRef.current.currentTime = 0

      // Update avatar positioning and make container visible
      if (nextMedia.avatar.position && avatarContainerRef.current) {
        const { radius, x, y } = nextMedia.avatar.position
        const dimensions = getPipStyles({
          container: videoContainerRef.current,
          radius,
          x,
          y,
        })
        setAvatarDimensions(dimensions)
        avatarContainerRef.current.style.width = dimensions.width + 'px'
        avatarContainerRef.current.style.height = dimensions.height + 'px'
        avatarContainerRef.current.style.opacity = '1'
        avatarContainerRef.current.style.display = 'block'
        Object.entries(dimensions ?? {}).forEach(([key, value]) => {
          if (
            typeof value === 'string' &&
            !['width', 'height', 'x', 'y'].includes(key)
          ) {
            avatarContainerRef.current.style[key as any] = value
          }
        })
        if (dimensions.transform) {
          avatarContainerRef.current.style.transform = dimensions.transform
        }
      }
      avatarDataRef.current = {
        ...nextMedia.avatar,
        position: nextMedia.avatar.position,
      }
    } else {
      if (avatarContainerRef.current) {
        avatarContainerRef.current.style.opacity = '0'
        avatarContainerRef.current.style.display = 'none'
      }
      avatarDataRef.current = null
    }

    // Handle audio
    const realVideoAudioCheck =
      nextMedia.audioUrl && nextMedia.type === 'content' && !nextMedia.avatar
    const previewVideoAudioCheck =
      preview && nextMedia.type !== 'presentation' && nextMedia.audioUrl
    if (realVideoAudioCheck || previewVideoAudioCheck) {
      const cleanAudioUrl = cleanUrl(nextMedia.audioUrl)
      if (preloadedAudios.current[cleanAudioUrl]) {
        audioPlayerRef.current = preloadedAudios.current[cleanAudioUrl]
      } else {
        audioPlayerRef.current = document.createElement('audio')
        audioPlayerRef.current.src = nextMedia.audioUrl
        audioPlayerRef.current.preload = 'auto'
        audioPlayerRef.current.crossOrigin = 'anonymous'
      }
      audioPlayerRef.current.currentTime = 0
      audioPlayerRef.current.volume = combinedVideoAttributesRef.current.volume
      audioPlayerRef.current.muted = combinedVideoAttributesRef.current.muted
    } else {
      audioPlayerRef.current = null
    }
    // Handle template
    if (nextMedia.template) {
      setTemplateUrl(nextMedia.template)
    } else {
      setTemplateUrl(null)
    }

    // Handle presentation
    if (nextMedia.type === 'presentation') {
      setPresentationData({
        content: nextMedia.bullet_points,
        template: nextMedia.template,
        duration: nextMedia.duration,
      })
    } else {
      setPresentationData(null)
    }

    // HANDLE PREVIEW ASSET LOGIC
    if (previewVideoAudioCheck) {
      actualVideoRef.current.loop = true
      if (nextMedia.avatar) actualAvatarVideoRef.current.loop = true
    } else {
      actualVideoRef.current.loop = false
      if (nextMedia.avatar) actualAvatarVideoRef.current.loop = false
    }

    // Reset video time and play
    actualVideoRef.current.currentTime = 0

    // Set up event listeners for the new active video
    setupEventListeners(actualVideoRef.current)

    // Update timeline
    if (nextIndex > 0) {
      currentTimeRef.current = videoEndTimesRef?.current?.[nextIndex - 1] || 0
    } else {
      currentTimeRef.current = 0
    }

    if (nextMedia.type === 'content' && (nextMedia.avatar || preview)) {
      actualVideoRef.current.muted = true
    } else {
      actualVideoRef.current.muted = combinedVideoAttributesRef.current.muted
    }

    // Start playing the new video
    try {
      actualVideoRef.current.muted = true
      if (nextMedia.avatar) {
        actualAvatarVideoRef.current.muted = true
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.muted = true
      }

      await Promise.all(
        [
          actualVideoRef.current.play(),
          nextMedia.avatar && actualAvatarVideoRef.current
            ? actualAvatarVideoRef.current.play()
            : null,
          audioPlayerRef.current?.src ? audioPlayerRef.current.play() : null,
        ].filter(Boolean),
      )

      if (actualVideoRef.current.currentTime > 0.1)
        actualVideoRef.current.currentTime = 0

      setIsPlaying(true)

      // Ensure all media streams are synchronized after switching
      await syncAllMediaToTimeline(0, true) // Start from beginning of new video

      if (
        preview &&
        nextMedia.type !== 'presentation' &&
        audioPlayerRef.current.src
      ) {
        actualVideoRef.current.muted = true
        if (nextMedia.avatar) {
          actualAvatarVideoRef.current.muted = true
        }
      } else {
        actualVideoRef.current.muted =
          nextMedia.type === 'content' &&
          (audioPlayerRef.current?.src || nextMedia.avatar)
            ? true
            : combinedVideoAttributesRef.current.muted
        console.log(combinedVideoAttributesRef.current.muted, 'NON_PREVIEW')
        if (nextMedia.avatar) {
          actualAvatarVideoRef.current.muted =
            combinedVideoAttributesRef.current.muted
        }
      }
      if (audioPlayerRef.current) {
        audioPlayerRef.current.muted = combinedVideoAttributesRef.current.muted
      }

      // Start sync monitoring for the new video
      startSyncMonitoring()

      // Preload the next video in the background
      preloadNextVideo(nextIndex)
    } catch (error) {
      console.error('Error playing next video:', error)
      setIsPlaying(false)
      stopSyncMonitoring()
    } finally {
      setIsLoading(false)
      setLoadingMessage('')
    }
  }

  const handleMediaEnded = async () => {
    console.log('Media ended')

    if (
      loadingMediaRef.current ||
      (!preview &&
        actualVideoRef.current.currentTime <
          actualVideoRef.current.duration - 0.5)
    ) {
      return
    }

    const nextIndex = currentMediaIndexRef.current + 1
    const currentQueue = mediaQueueRef.current
    const hasNextComponent = currentQueue && nextIndex < currentQueue.length

    captureLastFrame(actualVideoRef.current, actualAvatarVideoRef.current)

    cleanupCurrentMedia()

    if (hasNextComponent) {
      console.log(
        `Smooth transition from video ${currentMediaIndexRef.current} to ${nextIndex}`,
      )

      loadingMediaRef.current = true
      await instantVideoSwitch(nextIndex, currentQueue)
      loadingMediaRef.current = false
    } else {
      console.log('No more videos in queue or queue is empty')
      videoEndedRef.current = true
      combinedVideoAttributesRef.current.ended = true
      setEnded(true)
      setIsPlaying(false)
      avatarLastFrameCanvasRef.current.style.display = 'none'
      avatarCanvasRef.current.style.display = 'none'
      avatarCanvasRef.current.style.display = 'none'
      avatarVideo1Ref.current.style.display = 'none'
      // videoAnalyticsEventsHandler.ended()
    }
  }

  const updateCurrentTime = () => {
    const media = mediaQueueRef.current[currentMediaIndexRef.current]
    actualVideoRef.current.playbackRate = media?.playbackRate || 1

    let currentTime =
      actualVideoRef.current.currentTime / (media?.playbackRate || 1)
    if (preview && media?.type !== 'presentation' && audioPlayerRef.current) {
      currentTime = audioPlayerRef.current?.currentTime || 0
    }

    // previous end time
    const previousEndTime =
      videoEndTimesRef.current?.[currentMediaIndexRef.current - 1] || 0

    currentTimeRef.current = previousEndTime + currentTime

    combinedVideoAttributesRef.current.currentTime = currentTimeRef.current
    // videoAnalyticsEventsHandler.timeupdate()
  }

  const updateProgress = () => {
    const currentOverallTime = currentTimeRef.current
    const progress = (currentOverallTime / (totalDuration || 1)) * 100

    // Update combined video attributes
    combinedVideoAttributesRef.current.progress = progress
    combinedVideoAttributesRef.current.currentTime = currentOverallTime

    setCurrentTime(currentOverallTime)
  }


  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = Math.floor(seconds % 60)
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Seek optimization: Add debounced seek and preview handling
  const seekTimeoutRef = useRef(null)
  const previewTimeRef = useRef(0)
  const lastSeekTimeRef = useRef(0)
  const isDraggingRef = useRef(false)
  const syncCheckIntervalRef = useRef(null)
  const lastSyncCheckRef = useRef(0)

  // Optimized seek with debouncing to prevent excessive calls
  const debouncedSeek = useCallback((position: number, userSeek = false) => {
    const now = Date.now()
    const timeSinceLastSeek = now - lastSeekTimeRef.current

    // Clear existing timeout
    if (seekTimeoutRef.current) {
      clearTimeout(seekTimeoutRef.current)
    }

    // If we're seeking too frequently, debounce it
    const debounceDelay = timeSinceLastSeek < 100 ? 150 : 50

    seekTimeoutRef.current = setTimeout(() => {
      seekToPosition(position, userSeek)
      lastSeekTimeRef.current = Date.now()
    }, debounceDelay)
  }, [])

  const startDragging = (e: any) => {
    if (isDragging) return

    // Prevent default to avoid unwanted behaviors
    e.preventDefault()

    setIsDragging(true)
    isDraggingRef.current = true

    const progressBar = e.currentTarget
    // @ts-ignore
    const rect = progressBar.getBoundingClientRect()

    // Handle both mouse and touch 
    // @ts-ignore
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX
    const position = Math.max(
      0,
      Math.min(1, (clientX - rect.left) / rect.width),
    )
    const timeToSeek = position * totalDuration

    // Immediately update UI for responsiveness
    setCurrentTime(timeToSeek)
    previewTimeRef.current = timeToSeek

    // Pause video during drag for better performance
    if (actualVideoRef.current && !actualVideoRef.current.paused) {
      actualVideoRef.current.pause()
    }
  }

  const handleDrag = useCallback(
    (e: any) => {
      if (!isDragging || !isDraggingRef.current) return

      // Throttle drag updates for performance
      const now = performance.now()
      // @ts-ignore
      if (now - (handleDrag.lastCall || 0) < 30) return // ~60fps max
      // @ts-ignore
      handleDrag.lastCall = now

      let clientX
      if (e.type === 'touchmove') {
        clientX = e.touches?.[0]?.clientX || e.changedTouches?.[0]?.clientX
      } else {
        clientX = e.clientX
      }

      if (clientX === undefined) return

      const progressBar = document.getElementById('progressBar')
      if (!progressBar) return

      const rect = progressBar.getBoundingClientRect()
      const position = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width),
      )
      const timeToSeek = position * totalDuration

      // Update UI immediately for smooth feedback
      setCurrentTime(timeToSeek)
      previewTimeRef.current = timeToSeek

      // Optional: Show preview frame during drag (can be enabled for premium experience)
      // This would require additional implementation for frame extraction
    },
    [isDragging, totalDuration],
  )

  const stopDragging = useCallback(
    (e: any) => {
      if (!isDragging || !isDraggingRef.current) return

      let clientX
      if (e.type === 'touchend') {
        clientX = e.changedTouches?.[0]?.clientX
      } else {
        clientX = e.clientX
      }

      const progressBar = document.getElementById('progressBar')
      if (!progressBar) return

      const rect = progressBar.getBoundingClientRect()
      const position = Math.max(
        0,
        Math.min(1, (clientX - rect.left) / rect.width),
      )

      setIsDragging(false)
      isDraggingRef.current = false

      // Clear any pending debounced seeks
      if (seekTimeoutRef.current) {
        clearTimeout(seekTimeoutRef.current)
      }

      // Perform immediate seek to final position
      seekToPosition(position, true)
    },
    [isDragging],
  )

  const seekToPosition = async (positionInPercentage: number, userSeek = false) => {
    const timeToSeek = positionInPercentage * totalDuration
    let targetIndex = 0
    let previousDuration = 0

    // Optimize index finding with binary search for large video collections
    if (videoEndTimesRef.current.length > 10) {
      let left = 0
      let right = videoEndTimesRef.current.length - 1

      while (left <= right) {
        const mid = Math.floor((left + right) / 2)
        if (timeToSeek <= videoEndTimesRef.current[mid]) {
          if (mid === 0 || timeToSeek > videoEndTimesRef.current[mid - 1]) {
            targetIndex = mid
            previousDuration = mid > 0 ? videoEndTimesRef.current[mid - 1] : 0
            break
          }
          right = mid - 1
        } else {
          left = mid + 1
        }
      }
    } else {
      // Linear search for smaller collections
      for (let i = 0; i < videoEndTimesRef.current.length; i++) {
        if (timeToSeek <= videoEndTimesRef.current[i]) {
          targetIndex = i
          break
        }
        previousDuration = videoEndTimesRef.current[i]
      }
    }

    console.log(
      `Optimized seek: targeting media ${targetIndex} at time ${timeToSeek}`,
    )

    const timeWithinVideo = timeToSeek - previousDuration
    const media = mediaQueueRef.current[targetIndex]

    // Optimize frame capture - only when switching videos
    if (targetIndex !== currentMediaIndexRef.current) {
      const isTargetOdd = Boolean(targetIndex & 1)
      const targetVideoElement = isTargetOdd
        ? video1Ref.current
        : hiddenVideoRef.current
      const targetAvatarElement = isTargetOdd
        ? avatarVideo1Ref.current
        : avatarVideoRef.current

      const currentVideo = actualVideoRef.current
      const currentAvatar = actualAvatarVideoRef.current

      // Non-blocking frame capture for smoother experience
      requestAnimationFrame(() => {
        captureLastFrame(currentVideo, currentAvatar)
        captureFirstFrame(targetVideoElement, targetAvatarElement)
      })

      // hide the presentation iframe if target media is not presentation
      if (media.type !== 'presentation') {
        setPresentationData(null)
      }
    }

    const executeSeek = async () => {
      if (media.type === 'presentation' && presentationRef.current) {
        presentationRef.current.contentWindow.postMessage(
          {
            type: 'seek', // Use specific seek event instead of play
            playing: !actualVideoRef?.current.paused,
            currentTime: timeWithinVideo,
          },
          '*',
        )
      }

      currentTimeRef.current = timeToSeek

      if (userSeek) {
        // videoAnalyticsEventsHandler.seeking()
      }

      // Enhanced synchronization - ensure all media streams are perfectly synced
      console.log(`Executing seek: syncing all media to ${timeWithinVideo}s`)
      const syncSuccess = await syncAllMediaToTimeline(timeWithinVideo, true)

      if (!syncSuccess) {
        console.warn('Media sync failed during seek, attempting fallback sync')
        // Fallback: try individual sync without promises
        try {
          if (
            actualVideoRef.current &&
            actualVideoRef.current.readyState >= 2
          ) {
            actualVideoRef.current.currentTime =
              timeWithinVideo * (media.playbackRate || 1)
          }
          if (
            audioPlayerRef.current &&
            audioPlayerRef.current.readyState >= 2
          ) {
            audioPlayerRef.current.currentTime = timeWithinVideo
          }
          if (
            actualAvatarVideoRef.current &&
            actualAvatarVideoRef.current.readyState >= 2
          ) {
            actualAvatarVideoRef.current.currentTime = timeWithinVideo
          }
        } catch (fallbackError) {
          console.error('Fallback sync also failed:', fallbackError)
        }
      }

      // Use requestAnimationFrame for smoother UI updates
      requestAnimationFrame(() => {
        showVideo()
      })
    }

    // Optimize media loading - batch operations when possible
    try {
      if (targetIndex !== currentMediaIndexRef.current) {
        cleanupCurrentMedia()
        await loadMediaSet(targetIndex, null, isPlaying, timeWithinVideo)
        await executeSeek()

        const isRequestIdleCallbackSupported = 'requestIdleCallback' in window
        // Preload adjacent videos for smoother experience
        if (isRequestIdleCallbackSupported) {
          requestIdleCallback(() => {
            preloadNextVideo(targetIndex - 1)
            if (targetIndex + 1 < mediaQueueRef.current.length) {
              preloadNextVideo(targetIndex)
            }
          })
        } else {
          requestAnimationFrame(() => {
            preloadNextVideo(targetIndex - 1)
            if (targetIndex + 1 < mediaQueueRef.current.length) {
              preloadNextVideo(targetIndex)
            }
          })
        }
      } else {
        await loadMediaSet(targetIndex, null, isPlaying, timeWithinVideo)
        await executeSeek()
      }
    } catch (error) {
      console.error('Seek optimization error:', error)
      // Fallback to basic seek
      currentTimeRef.current = timeToSeek
      await executeSeek()
    }
  }

  // Enhanced sync system for perfect media synchronization
  const syncAllMediaToTimeline = async (targetTime: number, forceSync = false) => {
    const media = mediaQueueRef.current[currentMediaIndexRef.current]
    if (!media) return false

    console.log(`Syncing all media to timeline: ${targetTime}s`)

    const syncPromises = []
    const SYNC_TOLERANCE = 0.1 // 100ms tolerance for sync

    // Sync main video
    if (actualVideoRef.current && actualVideoRef.current.readyState >= 2) {
      const videoTargetTime = targetTime * (media.playbackRate || 1)
      const currentVideoTime = actualVideoRef.current.currentTime

      if (
        forceSync ||
        Math.abs(currentVideoTime - videoTargetTime) > SYNC_TOLERANCE
      ) {
        const videoSyncPromise = new Promise<void>((resolve) => {
          const handleSeeked = () => {
            actualVideoRef.current.removeEventListener('seeked', handleSeeked)
            console.log(
              `Video synced to: ${actualVideoRef.current.currentTime}s`,
            )
            resolve()
          }

          actualVideoRef.current.addEventListener('seeked', handleSeeked)
          actualVideoRef.current.currentTime = videoTargetTime

          // Fallback timeout
          setTimeout(() => {
            actualVideoRef.current.removeEventListener('seeked', handleSeeked)
            resolve()
          }, 1000)
        })
        syncPromises.push(videoSyncPromise)
      }
    }

    // Sync audio
    if (audioPlayerRef.current && audioPlayerRef.current.readyState >= 2) {
      const currentAudioTime = audioPlayerRef.current.currentTime

      if (
        forceSync ||
        Math.abs(currentAudioTime - targetTime) > SYNC_TOLERANCE
      ) {
        const audioSyncPromise = new Promise<void>((resolve) => {
          const handleSeeked = () => {
            audioPlayerRef.current.removeEventListener('seeked', handleSeeked)
            console.log(
              `Audio synced to: ${audioPlayerRef.current.currentTime}s`,
            )
            resolve()
          }

          audioPlayerRef.current.addEventListener('seeked', handleSeeked)
          audioPlayerRef.current.currentTime = targetTime

          // Fallback timeout
          setTimeout(() => {
            audioPlayerRef.current.removeEventListener('seeked', handleSeeked)
            resolve()
          }, 1000)
        })
        syncPromises.push(audioSyncPromise)
      }
    }

    // Sync avatar
    if (
      actualAvatarVideoRef.current &&
      actualAvatarVideoRef.current.readyState >= 2
    ) {
      const currentAvatarTime = actualAvatarVideoRef.current.currentTime

      if (
        forceSync ||
        Math.abs(currentAvatarTime - targetTime) > SYNC_TOLERANCE
      ) {
        const avatarSyncPromise = new Promise<void>((resolve) => {
          const handleSeeked = () => {
            actualAvatarVideoRef.current.removeEventListener(
              'seeked',
              handleSeeked,
            )
            console.log(
              `Avatar synced to: ${actualAvatarVideoRef.current.currentTime}s`,
            )
            resolve()
          }

          actualAvatarVideoRef.current.addEventListener('seeked', handleSeeked)
          actualAvatarVideoRef.current.currentTime = targetTime

          // Fallback timeout
          setTimeout(() => {
            actualAvatarVideoRef.current.removeEventListener(
              'seeked',
              handleSeeked,
            )
            resolve()
          }, 1000)
        })
        syncPromises.push(avatarSyncPromise)
      }
    }

    // Wait for all sync operations to complete
    if (syncPromises.length > 0) {
      try {
        await Promise.allSettled(syncPromises)
        console.log('All media streams synchronized successfully')
        return true
      } catch (error) {
        console.warn('Some media streams failed to sync:', error)
        return false
      }
    }

    return true
  }

  // Legacy sync function for backward compatibility
  const syncMediaAfterLoad = async (currentTime: number) => {
    return await syncAllMediaToTimeline(currentTime, true)
  }

  // Periodic sync check to maintain synchronization during playback
  const startSyncMonitoring = useCallback(() => {
    if (syncCheckIntervalRef.current) {
      clearInterval(syncCheckIntervalRef.current)
    }

    syncCheckIntervalRef.current = setInterval(() => {
      if (!isPlaying || isDragging) return

      const now = performance.now()
      if (now - lastSyncCheckRef.current < 2000) return // Check every 2 seconds

      lastSyncCheckRef.current = now

      // Check if media streams are still in sync
      const media = mediaQueueRef.current[currentMediaIndexRef.current]
      if (!media) return

      let needsSync = false
      const SYNC_THRESHOLD = 0.2 // 200ms threshold

      if (
        actualVideoRef.current &&
        audioPlayerRef.current &&
        actualVideoRef.current.readyState >= 2 &&
        audioPlayerRef.current.readyState >= 2
      ) {
        const videoTime =
          actualVideoRef.current.currentTime / (media.playbackRate || 1)
        const audioTime = audioPlayerRef.current.currentTime

        if (Math.abs(videoTime - audioTime) > SYNC_THRESHOLD) {
          console.warn(
            `Media desync detected: video=${videoTime}s, audio=${audioTime}s`,
          )
          needsSync = true
        }

        if (
          actualAvatarVideoRef.current &&
          actualAvatarVideoRef.current.readyState >= 2
        ) {
          const avatarTime = actualAvatarVideoRef.current.currentTime
          if (Math.abs(audioTime - avatarTime) > SYNC_THRESHOLD) {
            console.warn(
              `Avatar desync detected: audio=${audioTime}s, avatar=${avatarTime}s`,
            )
            needsSync = true
          }
        }

        if (needsSync) {
          console.log('Correcting media synchronization...')
          syncAllMediaToTimeline(audioTime, false).catch(console.warn)
        }
      }
    }, 1000)
  }, [isPlaying, isDragging])

  const stopSyncMonitoring = useCallback(() => {
    if (syncCheckIntervalRef.current) {
      clearInterval(syncCheckIntervalRef.current)
      syncCheckIntervalRef.current = null
    }
  }, [])

  const togglePresentationAnimation = (playing: boolean) => {
    if (presentationRef.current && presentationRef.current.contentWindow) {
      const currentTime = actualVideoRef.current?.currentTime
      presentationRef.current.contentWindow.postMessage(
        { type: 'play', playing, currentTime },
        '*',
      )
    }
  }

  const togglePlay = async () => {
    const video = actualVideoRef.current || hiddenVideoRef.current

    const media = mediaQueueRef.current[currentMediaIndexRef.current]

    if (ended) {
      setEnded(false)
      // Reset to the beginning
      currentTimeRef.current = 0
      videoEndedRef.current = false
      hiddenVideoRef.current.currentTime = 0
      avatarVideoRef.current.currentTime = 0
      currentMediaIndexRef.current = 0
      loadingMediaRef.current = true
      await instantVideoSwitch(0, mediaQueueRef.current)
      loadingMediaRef.current = false
      console.log('AUDIO MUTED: ', audioPlayerRef.current.muted)
      return
    }

    if (video.paused) {
      if (video) video?.play()
      if (presentationRef.current) togglePresentationAnimation(true)
      if (audioPlayerRef.current) audioPlayerRef.current?.play()
      if (media?.avatar && actualAvatarVideoRef.current) {
        actualAvatarVideoRef.current
          .play()
          .catch((e) => console.warn('Avatar video play error:', e))
      }
      setIsPlaying(true)

      // Start sync monitoring when playing
      startSyncMonitoring()

      // videoAnalyticsEventsHandler.play()
    } else {
      if (video) video.pause()
      audioPlayerRef.current?.pause()
      if (actualAvatarVideoRef.current) actualAvatarVideoRef.current.pause()

      setIsPlaying(false)

      // Stop sync monitoring when paused
      stopSyncMonitoring()

      combinedVideoAttributesRef.current.paused = true
      // videoAnalyticsEventsHandler.pause()
    }
  }

  const toggleMute = () => {
    const newMutedState = !combinedVideoAttributesRef.current.muted
    setIsMuted(newMutedState)

    if (hiddenVideoRef.current) {
      hiddenVideoRef.current.muted = newMutedState
    }
    if (video1Ref.current) {
      video1Ref.current.muted = newMutedState
    }
    Object.entries(preloadedAudios.current).forEach(([key, audio]: [any, any]) => {
      if (audio) {
        audio.muted = newMutedState
      }
    })

    if (audioPlayerRef.current) {
      audioPlayerRef.current.muted = newMutedState
    }

    if (avatarVideoRef.current) {
      avatarVideoRef.current.muted = newMutedState
    }
    if (avatarVideo1Ref.current) {
      avatarVideo1Ref.current.muted = newMutedState
    }

    combinedVideoAttributesRef.current.muted = newMutedState
  }

  const updateVideoVolume = (video: HTMLVideoElement | null, newVolume: number, muted: boolean) => {
    if (!video) return
    video.volume = newVolume
    video.muted = muted

    // For iOS, ensure volume changes are applied by triggering a brief pause/play
    const isIOS =
    // @ts-ignore
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

    if (isIOS && !video.paused) {
      const currentTime = video.currentTime
      video.pause()
      setTimeout(() => {
        video.currentTime = currentTime
        video.play().catch(console.warn)
      }, 50)
    }
  }

  const updateVolume = (value: string) => {
    const numValue = parseFloat(value)
    setVolume(numValue)
    const shouldMute = numValue === 0
    setIsMuted(shouldMute)

    // iOS devices have restrictions on programmatic volume control
    const isIOS =
    // @ts-ignore
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream

    Object.entries(preloadedAudios.current).forEach(([key, audio]: [any, any]) => {
      if (audio) {
        audio.volume = numValue
        audio.muted = shouldMute
      }
    })

    if (audioPlayerRef.current) {
      audioPlayerRef.current.volume = numValue
      audioPlayerRef.current.muted = shouldMute

      // For iOS, ensure volume changes are applied by triggering a brief pause/play
      if (isIOS && !audioPlayerRef.current.paused) {
        const currentTime = audioPlayerRef.current.currentTime
        audioPlayerRef.current.pause()
        setTimeout(() => {
          audioPlayerRef.current.currentTime = currentTime
          audioPlayerRef.current.play().catch(console.warn)
        }, 50)
      }
    }

    updateVideoVolume(hiddenVideoRef.current, numValue, shouldMute)
    updateVideoVolume(video1Ref.current, numValue, shouldMute)
    updateVideoVolume(avatarVideoRef.current, numValue, shouldMute)
    updateVideoVolume(avatarVideo1Ref.current, numValue, shouldMute)

    combinedVideoAttributesRef.current.volume = numValue
    combinedVideoAttributesRef.current.muted = shouldMute
    // videoAnalyticsEventsHandler.volumechange()
  }

  const toggleFullscreen = () => {
    if (!videoContainerRef.current) return
    const fullscreenBgContainer = document.getElementById('fullscreen-bg')
    const dialogDiv: HTMLDivElement = document.querySelector("[role='dialog'] .overflow-y-auto")

    // Check if we're on iOS
    const isIOS =
    // @ts-ignore
      /iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream


    try {
      if (
        !isFullscreen &&
        !document.fullscreenElement &&
        // @ts-ignore
        !document.webkitFullscreenElement &&
        // @ts-ignore
        !document.mozFullScreenElement &&
        // @ts-ignore
        !document.msFullscreenElement
      ) {
        // For iOS, prioritize custom fullscreen over native video fullscreen
        // This ensures the entire player (with controls) goes fullscreen, not just the video
        if (isIOS) {
          // Manual fullscreen for iOS - always use custom implementation
          console.log('iOS detected: Using custom fullscreen implementation')
          setIsFullscreen(true)
        } else {
          // Standard fullscreen API for other browsers
          if (document.documentElement.requestFullscreen) {
            document.documentElement.requestFullscreen()
            // @ts-ignore
          } else if (document.documentElement.webkitRequestFullscreen) {
            // @ts-ignore
            document.documentElement.webkitRequestFullscreen()
            // @ts-ignore
          } else if (document.documentElement.mozRequestFullScreen) {
            // @ts-ignore
            document.documentElement.mozRequestFullScreen()
            // @ts-ignore
          } else if (document.documentElement.msRequestFullscreen) {
            // @ts-ignore
            document.documentElement.msRequestFullscreen()
          } else {
            console.warn('Fullscreen API not supported')
            return
          }
        }

        // Apply fullscreen styles
        videoContainerRef.current.style.aspectRatio = `${renderSettings.canvas_dimensions.width} / ${renderSettings.canvas_dimensions.height}`
        videoContainerRef.current.style.position = 'fixed'
        videoContainerRef.current.style.zIndex = '1000'
        videoContainerRef.current.style.top = '50%'
        videoContainerRef.current.style.left = '50%'
        videoContainerRef.current.style.transform = 'translate(-50%, -50%)'

        // iOS-specific improvements for better fullscreen rendering
        if (isIOS) {
          // @ts-ignore
          videoContainerRef.current.style.WebkitBackfaceVisibility = 'hidden'
          videoContainerRef.current.style.backfaceVisibility = 'hidden'
          // @ts-ignore
          videoContainerRef.current.style.WebkitPerspective = '1000px'
          videoContainerRef.current.style.perspective = '1000px'
          // @ts-ignore
          videoContainerRef.current.style.WebkitTransform =
            'translate3d(-50%, -50%, 0)'
          // Force hardware acceleration on iOS
          videoContainerRef.current.style.willChange = 'transform'
        }

        const aspectRatio =
          renderSettings.canvas_dimensions.width /
          renderSettings.canvas_dimensions.height

        if (
          renderSettings.canvas_dimensions.width <=
          renderSettings.canvas_dimensions.height
        ) {
          const actualVideoContainerWidth = aspectRatio * window.innerHeight
          if (actualVideoContainerWidth > window.innerWidth) {
            videoContainerRef.current.style.width = '100vw'
            videoContainerRef.current.style.height = 'auto'
            
          } else {
            videoContainerRef.current.style.width = 'auto'
            videoContainerRef.current.style.height = '100vh'
          }
        } else {
          videoContainerRef.current.style.width = '100vw'
          videoContainerRef.current.style.height = 'auto'
          
        }

        if (dialogDiv) {
          dialogDiv.style.overflow = 'hidden'
        }

        if (fullscreenBgContainer) {
          fullscreenBgContainer.style.backgroundColor = 'black'
          fullscreenBgContainer.style.overflow = 'hidden'
        }

        document.body.style.overflow = 'hidden'
        document.body.style.background = 'black'
        document.body.style.color = 'black'

        // Set fullscreen state for all platforms after applying styles
        if (!isIOS) {
          setIsFullscreen(true)
        }
      } else {
        // Exit fullscreen
        if (document.exitFullscreen) {
          document.exitFullscreen()
          // @ts-ignore
        } else if (document.webkitExitFullscreen) {
          // @ts-ignore
          document.webkitExitFullscreen()
          // @ts-ignore
        } else if (document.webkitCancelFullScreen) {
          // @ts-ignore
          document.webkitCancelFullScreen()
          // @ts-ignore
        } else if (document.mozCancelFullScreen) {
          // @ts-ignore
          document.mozCancelFullScreen()
          // @ts-ignore
        } else if (document.msExitFullscreen) {
          // @ts-ignore
          document.msExitFullscreen()
        }

        // Reset styles
        if (fullscreenBgContainer) {
          fullscreenBgContainer.style.backgroundColor = 'transparent'
          fullscreenBgContainer.style.overflow = null
        }

        if (videoContainerRef.current) {
          videoContainerRef.current.style = null
        }

        document.body.style.backgroundColor = 'white'
        document.body.style.overflow = 'auto'
        setIsFullscreen(false)
      }
    } catch (error) {
      console.error('Error toggling fullscreen:', error)
      // For iOS fallback, just toggle the manual fullscreen state
      if (isIOS) {
        setIsFullscreen(!isFullscreen)
      }
    }
  }

  useEffect(() => {
    const handleFullscreenChange = () => {
      const isInFullscreen = !!(
        document.fullscreenElement ||
        // @ts-ignore
        document.webkitFullscreenElement ||
        // @ts-ignore
        document.mozFullScreenElement ||
        // @ts-ignore
        document.msFullscreenElement
      )
      const fullscreenBgContainer = document.getElementById('fullscreen-bg')
      const dialogDiv: HTMLDivElement = document.querySelector(
        "[role='dialog'] .overflow-y-auto",
      )

      if (!isInFullscreen && isFullscreen) {
        if (dialogDiv) dialogDiv.style = null
        if (videoContainerRef.current) {
          videoContainerRef.current.style = null
        }
        document.body.style.backgroundColor = 'white'
        document.body.style.overflow = 'auto'
        if (fullscreenBgContainer) {
          fullscreenBgContainer.style.backgroundColor = 'transparent'
          fullscreenBgContainer.style.overflow = null
        }
        setIsFullscreen(false)
      }
    }

    const events = [
      'fullscreenchange',
      'webkitfullscreenchange',
      'mozfullscreenchange',
      'MSFullscreenChange',
    ]

    events.forEach((event) => {
      document.addEventListener(event, handleFullscreenChange)
    })

    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleFullscreenChange)
      })
    }
  }, [isFullscreen])

  useEffect(() => {
    window.document.addEventListener('mousemove', handleDrag)
    window.document.addEventListener('touchmove', handleDrag)
    window.document.addEventListener('mouseup', stopDragging)
    window.document.addEventListener('touchend', stopDragging)

    return () => {
      if (!templateContainerRef.current) return
      window.document.removeEventListener('mousemove', handleDrag)
      window.document.removeEventListener('touchmove', handleDrag)
      window.document.removeEventListener('mouseup', stopDragging)
      window.document.removeEventListener('touchend', stopDragging)
    }
  }, [handleDrag, stopDragging])

  // keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: any) => {
      if (e.key === ' ') {
        if (loadingMediaRef.current) return
        togglePlay()
      } else if (e.key === 'f') {
        // toggleFullscreen()
      } else if (e.key === 'm') {
        // toggleMute()
      } else if (
        e.key === 'F12' ||
        (e.ctrlKey && e.shiftKey && (e.key === 'I' || e.key === 'J')) ||
        (e.ctrlKey && e.key === 'U')
      ) {
        e.preventDefault()
      }
    }
    const handleContextMenu = (e: any) => e.preventDefault()

    document.addEventListener('contextmenu', handleContextMenu)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [])

  useEffect(() => {
    const handleResize = () => {
      if (actualVideoRef.current) {
        updateVideoDimensions(actualVideoRef.current)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    if (templateContainerRef.current && actualVideoRef.current) {
      updateVideoDimensions(actualVideoRef.current)
    }
  }, [templateUrl, templateContainerRef.current])

  useEffect(() => {
    if (videoContainerRef.current) {
      if (avatarDataRef.current && avatarDataRef.current.position) {
        const { radius, x, y } = avatarDataRef.current.position
        const dimensions = getPipStyles({
          container: videoContainerRef.current,
          radius,
          x,
          y,
        })
        setAvatarDimensions(dimensions)

        if (avatarContainerRef.current) {
          avatarContainerRef.current.style.width = dimensions.width + 'px'
          avatarContainerRef.current.style.height = dimensions.height + 'px'

          Object.entries(dimensions).forEach(([key, value]: [any, any]) => {
            if (
              typeof value === 'string' &&
              !['width', 'height', 'x', 'y'].includes(key)
            ) {
              avatarContainerRef.current.style[key] = value
            }
          })

          if (dimensions.transform) {
            avatarContainerRef.current.style.transform = dimensions.transform
          }
        }
      }
    }
  }, [templateUrl, videoDimensions])

  useEffect(() => {
    const handleResize = () => {
      if (
        avatarDataRef.current &&
        avatarDataRef.current.position &&
        templateContainerRef.current
      ) {
        const { radius, x, y } = avatarDataRef.current.position
        const dimensions = getPipStyles({
          container: videoContainerRef.current,
          radius,
          x,
          y,
        })
        setAvatarDimensions(dimensions)

        if (avatarContainerRef.current) {
          avatarContainerRef.current.style.width = dimensions.width + 'px'
          avatarContainerRef.current.style.height = dimensions.height + 'px'

          Object.entries(dimensions).forEach(([key, value]: [any, any]) => {
            if (
              typeof value === 'string' &&
              !['width', 'height', 'x', 'y'].includes(key)
            ) {
              avatarContainerRef.current.style[key] = value
            }
          })

          if (dimensions.transform) {
            avatarContainerRef.current.style.transform = dimensions.transform
          }
        }
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  // Update iframe dimensions to match video canvas
  useEffect(() => {
    if (presentationRef.current) {
      const { width, height } = videoDimensions
      // presentationRef.current.style.width = width + 'px'
      // presentationRef.current.style.height = height + 'px'
      presentationRef.current.width = width
      presentationRef.current.height = height
    }
  }, [videoDimensions])

  useEffect(() => {
    const currentMedia =
      mediaQueueRef.current[
        currentMediaIndexRef.current < 0 ? 0 : currentMediaIndexRef.current
      ]
    const presentationActive = currentMedia?.type === 'presentation'

    if (
      presentationActive &&
      presentationRef.current &&
      !presentationRef.current.srcdoc // Only update if not already set
    ) {
      presentationRef.current.srcdoc = generatePresentationHTML(
        presentationData?.content,
      )

      presentationRef.current.onload = () => {
        const currentTime = actualVideoRef?.current.currentTime
        presentationRef.current.contentWindow.postMessage(
          {
            type: 'play',
            playing: !actualVideoRef?.current.paused,
            currentTime,
          },
          '*',
        )
      }
    }
  }, [presentationData])
  // ---- VIDEO QUALITY & Controls hides/show

  // Effect to manage quality change cooldown
  useEffect(() => {
    if (lastQualityChangeTime > 0) {
      setQualityChangeCooldownActive(true)
      const cooldownTimer = setTimeout(() => {
        setQualityChangeCooldownActive(false)
      }, QUALITY_CHANGE_COOLDOWN)

      return () => clearTimeout(cooldownTimer)
    }
  }, [lastQualityChangeTime])
  const handleQualityChange = (quality: string) => {
    const currentTime = Date.now()

    // // Check if we're in cooldown period
    // if (
    //   qualityChangeCooldownActive &&
    //   currentTime - lastQualityChangeTime < QUALITY_CHANGE_COOLDOWN
    // ) {
    //   console.log('Quality change blocked due to cooldown period')
    //   return
    // }

    setUserSelectedQuality(quality)
    setShowQualityMenu(false)
    setLastQualityChangeTime(currentTime)

    if (quality === 'Auto') {
      // In Auto mode, we'll determine quality based on network conditions
      // This will be handled in a separate effect
    } else {
      // User selected a specific quality
      setSelectedQuality(quality)
    }
  }

  const getRemainingCooldownTime = () => {
    if (!qualityChangeCooldownActive) return 0
    const currentTime = Date.now()
    const elapsed = currentTime - lastQualityChangeTime
    return Math.max(0, Math.ceil((QUALITY_CHANGE_COOLDOWN - elapsed) / 1000))
  }
  const toggleQualityMenu = () => {
    setShowQualityMenu(!showQualityMenu)
  }

  const handleMouseEnter = () => {
    setShowControls(true)
    if (controlsTimeout) {
      clearTimeout(controlsTimeout)
      setControlsTimeout(null)
    }
  }

  const handleMouseLeave = () => {
    // Don't hide controls if video is paused
    if (!isPlaying) return

    const timeout = setTimeout(() => {
      setShowControls(false)
      setShowQualityMenu(false)
    }, 2000)
    setControlsTimeout(timeout)
  }

  useEffect(() => {
    // Always show controls initially
    handleMouseEnter()

    // If video is paused, keep controls visible
    if (!isPlaying) {
      setShowControls(true)
      return
    }

    // Only hide controls after timeout when playing
    const timeout = setTimeout(() => {
      setShowControls(false)
      setShowQualityMenu(false)
    }, 2000)

    return () => clearTimeout(timeout)
  }, [isPlaying, isMuted, isFullscreen])

  useEffect(() => {
    return () => {
      if (controlsTimeout) {
        clearTimeout(controlsTimeout)
      }
    }
  }, [controlsTimeout])

  useEffect(() => {
    const handleClickOutside = (event: any) => {
      if (showQualityMenu && !event.target.closest('.quality-menu-container')) {
        setShowQualityMenu(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [showQualityMenu])

  // Track network speed for auto quality adjustment
  const speedSamplesRef = useRef([])
  const [networkSpeed, setNetworkSpeed] = useState(0)

  const updateNetworkSpeed = useCallback((bytesLoaded: number, duration: number) => {
    // Calculate speed in Mbps (megabits per second)
    const speedMbps = (bytesLoaded * 8) / (1024 * 1024) / duration

    // Add the speed sample to buffer (keep last 10 samples)
    speedSamplesRef.current.push(speedMbps)
    if (speedSamplesRef.current.length > 10) {
      speedSamplesRef.current.shift() // Remove oldest sample
    }

    // If not enough samples yet, return a default fallback
    if (speedSamplesRef.current.length < 5) {
      return 10 // fallback Mbps
    }

    // Calculate average speed
    const avgSpeed =
      speedSamplesRef.current.reduce((a, b) => a + b, 0) /
      speedSamplesRef.current.length

    setNetworkSpeed(avgSpeed)
    return avgSpeed
  }, [])

  const getQualityFromSpeed = (speedMbps: number) => {
    const availableQualities = videoQualityStatusRef.current || {}

    console.log('NEW SPEED:', speedMbps, 'Mbps')

    // Define quality thresholds in descending order
    const qualityThresholds = [
      { speed: 8, quality: '1080' },
      { speed: 5, quality: '720' },
      { speed: 2.5, quality: '480' },
      { speed: 1.2, quality: '360' }, // optional if you support 360p
      { speed: 0, quality: '240' },
    ]

    // Choose highest quality supported by current speed and availability
    for (const { speed, quality } of qualityThresholds) {
      // @ts-ignore
      if (speedMbps > speed && availableQualities[quality]) {
        return quality
      }
    }

    // Absolute fallback: return highest available quality
    const qualityPreference = ['1080', '720', '480', '240']
    for (const quality of qualityPreference) {
      // @ts-ignore
      if (availableQualities[quality]) {
        return quality
      }
    }

    // If none found, default to 1080
    return '1080'
  }

  useEffect(() => {
    if (
      qualityBasedVideoResponse?.data &&
      videoId &&
      mediaQueueRef.current.length > 0
    ) {
      const qualityBasedVideos = createVideoComponentsFromQualityResponse(
        qualityBasedVideoResponse.data?.data?.data,
      )
      if (qualityBasedVideos && qualityBasedVideos.length > 0) {
        loadMedia(qualityBasedVideos, true)
      }
    }
  }, [qualityBasedVideoResponse.data?.data?.data, videoId, selectedQuality])

  const cleanup = useCallback(() => {
    // Clear seek timeouts for optimized seek
    if (seekTimeoutRef.current) {
      clearTimeout(seekTimeoutRef.current)
    }

    // Stop sync monitoring
    stopSyncMonitoring()

    // Stop all media
    if (actualVideoRef.current) {
      actualVideoRef.current.pause()
      actualVideoRef.current.src = ''
      actualVideoRef.current.load()
    }

    if (audioPlayerRef.current) {
      audioPlayerRef.current.pause()
      audioPlayerRef.current.src = ''
      audioPlayerRef.current.load()
    }

    if (actualAvatarVideoRef.current) {
      actualAvatarVideoRef.current.pause()
      actualAvatarVideoRef.current.src = ''
      actualAvatarVideoRef.current.load()
    }

    setIsPlaying(false)
    videoEndedRef.current = true
    combinedVideoAttributesRef.current.paused = true

    if (presentationRef.current) {
      presentationRef.current.srcdoc = ''
    }

    Object.values(preloadedVideos.current).forEach((video: any) => {
      video.src = ''
      video.load()
      video.remove()
    })
    preloadedVideos.current = {}

    mediaQueueRef.current = []
  }, [stopSyncMonitoring])

  useEffect(() => {
    return () => {
      cleanupCurrentMedia()
    }
  }, [cleanupCurrentMedia])

  return {
    // Readonly
    videoRef: combinedVideoAttributesRef,

    // Refs
    hiddenVideoRef,
    audioPlayerRef,
    videoContainerRef,
    templateContainerRef,
    playerControlRef,
    avatarVideoRef,
    presentationRef,
    avatarContainerRef,
    firstFrameCanvasRef,
    avatarCanvasRef,
    video1Ref,
    avatarVideo1Ref,
    lastFrameCanvasRef,
    avatarLastFrameCanvasRef,

    // State
    ended,
    setEnded,
    isLoading,
    loadingMessage,
    isStartedPlaying,
    isPlaying,
    isMuted,
    volume,
    currentTime,
    totalDuration,
    videoEndTimes: videoEndTimesRef.current,
    isFullscreen,
    currentMediaIndex: currentMediaIndexRef.current,
    templateUrl,
    videoDimensions,
    avatarData: avatarDataRef.current,
    avatarDimensions,
    presentationActive: !!presentationData,
    presentationData,
    showControls,
    setShowControls,
    showQualityMenu,
    selectedQuality,
    userSelectedQuality,
    qualityChangeCooldownActive,
    networkSpeed,
    isDragging,
    handleQualityChange,
    getRemainingCooldownTime,
    toggleQualityMenu,
    handleMouseEnter,
    handleMouseLeave,
    videoQualityStatsResponse,

    // Methods
    loadMedia,
    togglePlay,
    toggleMute,
    updateVolume,
    toggleFullscreen,
    formatTime,
    startDragging,
    stopDragging,
    debouncedSeek,
    syncAllMediaToTimeline,
    cleanup,
  }
}
