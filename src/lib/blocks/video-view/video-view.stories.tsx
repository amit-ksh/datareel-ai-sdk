import { VideoView } from "./index";
import { DatareelProvider } from "../../context/datareel-context";

function VideoViewStory(props) {
  return (
    <DatareelProvider
      secret="demo-secret"
      organisationId="demo-org"
      brandColor="#3B82F6"
    >
      <VideoView {...props} />
    </DatareelProvider>
  );
}

const meta = {
  title: "Blocks/VideoView",
  component: VideoViewStory,
  parameters: {
    layout: "fullscreen",
  },
};

export default meta;

export const Default = {
  args: {
    videoId: "demo-video-id",
    apiKey: "demo-api-key",
    organisationId: "demo-org",
  },
};

export const WithCustomSettings = {
  args: {
    videoId: "demo-video-id-2",
    apiKey: "demo-api-key",
    organisationId: "demo-org",
  },
};
