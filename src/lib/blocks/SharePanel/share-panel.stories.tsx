import type { Meta, StoryObj } from "@storybook/react-vite";
import { SharePanel } from "./index";
import { DatareelProvider } from "../../context/datareel-context";
import { DataReel } from "../../sdk/datareel";

const meta: Meta<typeof SharePanel> = {
  title: "Blocks/SharePanel",
  component: SharePanel,
  parameters: {
    layout: "centered",
  },
  args: {
    videoId: "example-video-id",
  },
};
export default meta;

type Story = StoryObj<typeof SharePanel>;

export const Default: Story = {
  render: (args) => {
    // Lightweight mock of network method
    (DataReel as any).prototype.getVideo = async () => ({
      data: {
        status: "COMPLETED",
        progress: [],
        data: { s3_url: "https://example.com/video.mp4", name: "Demo Video" },
      },
    });
    return (
      <DatareelProvider
        brandColor="#6366f1"
        apiKey="demo-api-key"
        organisationId="demo-org"
      >
        <SharePanel {...args} />
      </DatareelProvider>
    );
  },
};
