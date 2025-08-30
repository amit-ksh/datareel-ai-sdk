import { useQuery } from "@tanstack/react-query"
import { VideoAxios } from ".."
import { getQualityState } from "../../components/ui/video-player/utils/formater"

const getDeliveryVideoByQualityStatus = async ({ resultId }: { resultId: string }): Promise<any> => {
  const params = new URLSearchParams()
  params.append('results_id', resultId)
  const resp = await VideoAxios.get(
    `pipeline/results/quality/status/public`,
    {
      headers: {
        secret: 'zBsBEtLn4PgIrj0CNEbHSGNQjhJGoyaAmTvQikqQlZ+K1yhMU7i4htz9MoUlap48Dwwknw+9WB8oMxWl',
      },
      params: params,
    },
  )

  const qualityState = getQualityState(resp?.data?.data || [])

  return qualityState
}

export const useGetDeliveryVideoByQualityStatus = ({ resultId }: { resultId: string }) => {
  return useQuery({
    queryKey: [
      'VIDEO_PLAYER',
      'VIDEO_QUALITY_STATUS_DELIVERY',
      resultId,
    ],
    queryFn: () => getDeliveryVideoByQualityStatus({ resultId }),
    enabled: !!resultId,
  })
}




const getVideoByQualityDelivery = async ({ resultId, quality }: { resultId: string; quality: string }) => {
  const params = new URLSearchParams()
  params.append('results_id', resultId)
  params.append('quality', quality || '720')
  return VideoAxios.get(`pipeline/results/quality/public`, {
    headers: {
      secret: 'zBsBEtLn4PgIrj0CNEbHSGNQjhJGoyaAmTvQikqQlZ+K1yhMU7i4htz9MoUlap48Dwwknw+9WB8oMxWl',
    },
    params: params,
  })
}

export const useGetVideoByQualityDelivery = ({ resultId, quality }: { resultId: string; quality: string }) => {
  return useQuery({
    queryKey: [
      'VIDEO_PLAYER',
      'VIDEO_QUALITY_DELIVERY',
      resultId,
      quality,
    ],
    queryFn: () => getVideoByQualityDelivery({ resultId, quality }),
    enabled: !!resultId && !!quality,
  })
}
