import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import useWebSocket, { ReadyState } from 'react-use-websocket';
import { useDatareel } from '../../context/datareel-context';
import { fetchPipelineDataById } from '../../api/pipeline';
import { DEFAULT_LAYOUT } from '../../constants';
import { Pipeline } from '../../types';



export interface UseVideoDataOptions {
  realtime?: boolean; // enable websocket realtime updates
}

export interface UseVideoDataResult {
  video: {
    loading: boolean;
    error: any;
    status: string | undefined;
    isVideoCreated: boolean;
    progressList: any[];
    totalProgress: number;
    videoUrl?: string;
    videoComponents: any[];
    preview: boolean;
    renderSettings: any;
    isPortrait: boolean;
    apiKey?: string | null;
    organisationId?: string | null;
    name?: string;
    pipelineData: Pipeline;
    pipelineId: string;
    pipelineName: string;
    refetch: () => void;
    loadingStateHelpers: {
      totalProgress: number;
      completedSteps: number;
    };
  };
  shareData: {
    shareUrl: string;
    embedCode: string;
    copied: { url: boolean; embed: boolean };
    copyToClipboard: (text: string, type: 'url' | 'embed') => Promise<void>;
  };
}

export function useVideoData(videoId: string, options: UseVideoDataOptions = {}): UseVideoDataResult {
  const { realtime = true } = options;
  const { datareel } = useDatareel();
  const apiKey = datareel?.getApiKey();
  const organisationId = (datareel as any)?.organisationId;
  const [pipelineData, setPipelineData] = useState<any>(null);
  const [copied, setCopied] = useState({ url: false, embed: false });

  const shareUrl = `https://www.dev.datareel.ai/delivery/${videoId}`;
  const embedCode = `<iframe src="https://www.dev.datareel.ai/embed/${videoId}" width="560" height="315" frameborder="0" allowfullscreen></iframe>`;

  const {
    data: resultData,
    isPending: isResultPending,
    isError: isResultError,
    error: resultErrorMessage,
    refetch: refetchResult,
  } = useQuery({
    queryKey: ['video-result', videoId],
    queryFn: () => datareel.getVideo(videoId),
    enabled: !!videoId && !!datareel,
  });

  const { data: resultPipelineData } = useQuery({
    queryKey: ['video-pipeline', resultData?.data?.pipeline_id],
    queryFn: () => fetchPipelineDataById({
      apiKey,
      pipelineId: resultData?.data?.pipeline_id
    }),
    enabled: !!resultData?.data?.pipeline_id
  })

  const effectiveData = useMemo(() => {
    if (resultData?.data.status !== 'PROCESSING') return resultData?.data;
    return { ...resultData?.data, ...pipelineData };
  }, [resultData?.data, pipelineData]);

  const preview =
    effectiveData?.progress?.some((progress: any) => {
      const output = progress?.output || progress?.response;
      return output?.preview || false;
    }) ?? false;

  const videoComponents = useMemo(
    () =>
      effectiveData?.progress
        ?.map((progress: any) => {
          const videoComponent: any = { type: progress?.component_type };
          const output = progress?.output || progress?.response;
          if (!output) return null;

          const audio = output?.audio || output?.voice;
          const audioUrl = audio?.signed_url;
          const video = output?.video;
          const videoUrl = video?.signed_url;
          const templateUrl = output?.template?.signed_url;
          const avatar = output?.PiP_video;
          const avatarUrl = output?.PiP_video?.signed_url;
          const bulletPoints = output?.bullet_points;

          if (videoUrl) videoComponent.video = videoUrl;
          else videoComponent.video = audioUrl;
          if (audioUrl) videoComponent.audio = audioUrl;
          if (templateUrl) videoComponent.template = templateUrl;
          if (avatarUrl)
            videoComponent.avatar = {
              video: avatarUrl,
              position: {
                x: output.picture_in_picture_config?.x_cordinate || 0,
                y: output.picture_in_picture_config?.y_cordinate,
                radius: (output.picture_in_picture_config?.radius || 0) * 100,
              },
            };
          if (bulletPoints) videoComponent.bullet_points = bulletPoints;

            videoComponent.duration =
              audio?.duration ||
              avatar?.duration ||
              output.duration ||
              video?.duration;
            videoComponent.videoDuration =
              video?.duration || audio?.duration || output.duration;

          return videoComponent;
        })
        .filter(Boolean) || [],
    [effectiveData?.progress]
  );

  const progressList = resultData?.data?.progress ?? [];
  const completed = progressList?.filter((d: any) =>
    d?.status ? d.status === 'COMPLETED' : d.completed
  ).length;
  const totalProgress =
    progressList.length === 0 ? 0 : (100 * completed) / progressList.length;
  const isVideoCreated =
    effectiveData?.status === 'COMPLETED' || totalProgress >= 100;

  const renderSettings = effectiveData?.render_settings || DEFAULT_LAYOUT;
  const isPortrait =
    renderSettings?.canvas_dimensions?.height >
    renderSettings?.canvas_dimensions?.width;

  const wsUrl = useMemo(() => {
    if (!realtime) return null;
    if (!videoId || !apiKey || isVideoCreated || isResultPending) return null;
    return `wss://video.dev.datareel.ai/api/v1/ws/${videoId}/${apiKey}`;
  }, [videoId, apiKey, isVideoCreated, isResultPending, realtime]);

  const { lastMessage, readyState } = useWebSocket(wsUrl, {
    onError: (error) => {
      if (process.env.NODE_ENV !== 'production') {
        console.error('WebSocket error:', error);
      }
    },
    shouldReconnect: () => true,
    reconnectAttempts: 3
  });

  // WebSocket handling for real-time updates
  useEffect(() => {
    if (!realtime) return;
    if (!lastMessage?.data || readyState !== ReadyState.OPEN) return;

    try {
      let data: any = {};
      try {
        data = JSON.parse(lastMessage.data);
      } catch (error) {
        return;
      }

      if (!Array.isArray(data?.current_progress)) {
        data.current_progress = [data?.data];
      }

      setPipelineData((prev: any) => {
        const baseData = prev || resultData?.data;
        if (!baseData) return prev;
        if (data.message === 'PROCESSING') {
          const updatedProgress = [
            ...baseData?.progress?.map((progress: any) => {
              const currentProgress = data.current_progress.find(
                (d: any) => d.index === progress.index
              );
              if (!currentProgress) return progress;
              currentProgress.output =
                currentProgress?.output || currentProgress?.response;
              currentProgress.status =
                currentProgress.status || progress.status || 'PROCESSING';
              return { ...progress, ...currentProgress };
            }),
          ];

          if (
            Number.isInteger(data?.data?.index) &&
            data?.data.index < updatedProgress.length
          ) {
            updatedProgress[data?.data.index].status =
              data?.data?.status || 'PROCESSING';
          }

            const isCompleted = updatedProgress?.every(
              (p: any) => p.status === 'COMPLETED'
            );
          if (isCompleted) {
            refetchResult();
          }

          return { ...baseData, progress: updatedProgress };
        } else if (['COMPLETED', 'FAILED'].includes(data.message)) {
          refetchResult();
          return { ...prev, status: data.message };
        }
        return prev;
      });
    } catch (error) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Error parsing WebSocket message:', error);
      }
    }
  }, [lastMessage, resultData?.data, realtime, readyState, refetchResult]);

  useEffect(() => {
    if (!realtime) return;
    if (
      readyState === ReadyState.CLOSED &&
      resultData?.data?.status === 'PROCESSING'
    ) {
      refetchResult();
    }
  }, [readyState, resultData?.data?.status, realtime, refetchResult]);

  const copyToClipboard = async (text: string, type: 'url' | 'embed') => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied((prev) => ({ ...prev, [type]: true }));
      setTimeout(() => setCopied((prev) => ({ ...prev, [type]: false })), 2000);
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.error('Failed to copy:', err);
      }
    }
  };

  return {
    video: {
      loading: isResultPending,
      error: isResultError ? resultErrorMessage : null,
      status: effectiveData?.status,
      isVideoCreated,
      progressList,
      totalProgress,
      videoUrl: resultData?.data?.data?.s3_url,
      videoComponents,
      preview,
      renderSettings,
      isPortrait,
      apiKey,
      organisationId,
      name: resultData?.data?.data?.name || 'Video',
      pipelineData: resultPipelineData?.data,
      pipelineId: resultPipelineData?.data?.pipeline_id || resultData?.data?.data?.pipeline_id || '',
      pipelineName: resultPipelineData?.data?.pipeline_name || 'Unnamed Pipeline',
      refetch: refetchResult,
      loadingStateHelpers: {
        totalProgress,
        completedSteps: completed,
      },
    },
    shareData: {
      shareUrl,
      embedCode,
      copied,
      copyToClipboard,
    },
  };
}
