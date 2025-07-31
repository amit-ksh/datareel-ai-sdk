import { DatareelVideoPlayer } from "./index";
import { DatareelProvider } from "../../context/datareel-context";

function DatareelVideoPlayerStory(props) {
  return (
    <DatareelProvider
      secret="demo-secret"
      organisationId="demo-org"
      brandColor="#3B82F6"
    >
      <DatareelVideoPlayer {...props} />
    </DatareelProvider>
  );
}

const meta = {
  title: "Blocks/DatareelVideoPlayer",
  component: DatareelVideoPlayerStory,
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
