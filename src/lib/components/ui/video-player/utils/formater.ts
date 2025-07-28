export const createVideoComponentsFromQualityResponse = (videoData: any) => {
  if (!videoData || !Array.isArray(videoData)) return null

  return videoData
    .map((item) => {
      if (!item.output) return null

      return {
        type: item.component_type?.toLowerCase() || 'content',
        video: item.output.video?.signed_url,
        audio: item.output.audio?.signed_url,
        template: item.output.template?.signed_url,
        bullet_points: item.data?.content?.bullet_points,
        avatar: item.output.PiP_video
          ? {
              video: item.output.PiP_video.signed_url,
              position: item.output.picture_in_picture_config
                ? {
                    radius: item.output.picture_in_picture_config.radius * 100, // Convert to percentage
                    x: item.output.picture_in_picture_config.x_cordinate,
                    y: item.output.picture_in_picture_config.y_cordinate,
                  }
                : {
                    x: 0,
                    y: 660,
                    radius: 0.41 * 100,
                  },
            }
          : null,
        duration:
          item.output.audio?.duration ||
          item.output?.PiP_video?.duration ||
          item.output.video?.duration ||
          item.duration ||
          0,
        videoDuration: item.output.video?.duration || item.output.duration || 0,
      }
    })
    .filter(Boolean) // Remove any null entries
}

export const getQualityState = (videoData: any) => {
  if (!videoData || !Array.isArray(videoData)) return {}

  const qualityState = {
    1080: true,
    720: true,
    480: true,
    240: true,
  }

  // Audio quality mapping to video quality levels
  const audioQualityMap: Record<number, string> = {
    240: '64kbps',
    480: '96kbps',
    720: '128kbps',
    1080: '128kbps',
  } as const

  videoData.forEach((item) => {
    if (!item.status) {
      // If component has no status, mark all qualities as false
      Object.keys(qualityState).forEach((quality) => {
        qualityState[Number(quality) as keyof typeof qualityState] = false
      })
      return
    }

    const mediaTypes = Object.keys(item.status)
    // Check each quality level
    Object.keys(qualityState).forEach((quality: string, index) => {
      const qualityNum: keyof typeof audioQualityMap = parseInt(quality, 10)

      // Check if all media types have this quality completed
      const allMediaTypesReady = mediaTypes.every((mediaType, idx) => {
        if (Number(quality) == 1080) return true
        const mediaArray = item.status[mediaType]
        if (!Array.isArray(mediaArray)) return false

        // Find if this quality exists and is completed for this media type
        return mediaArray.some((mediaItem) => {
          if (mediaType === 'template') return true // Template is always ready

          if (mediaType === 'audio') {
            // For audio, check kbps quality
            const expectedAudioQuality = audioQualityMap[qualityNum]
            return (
              mediaItem.quality === expectedAudioQuality &&
              mediaItem.status === 'completed'
            )
          } else {
            // For video/PiP_video/template, check resolution quality
            const qualityMatch = mediaItem.quality?.match(/(\d+)p?/)
            if (!qualityMatch) return false

            const itemQuality = parseInt(qualityMatch[1], 10)
            return (
              itemQuality === qualityNum && mediaItem.status === 'completed'
            )
          }
        })
      })

      if (!allMediaTypesReady) {
        qualityState[Number(quality) as keyof typeof qualityState] = false
      }
    })
  })

  return qualityState
}
