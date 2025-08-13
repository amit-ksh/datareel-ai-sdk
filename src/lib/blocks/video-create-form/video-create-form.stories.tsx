import type { Meta, StoryObj } from "@storybook/react-vite";
import { VideoCreateForm } from "./index";
import { Avatar, Pipeline } from "../../types";
import { DatareelProvider } from "../../context";

interface VideoCreateFormProps {
  apiKey?: string;
  organisationId?: string;
  brandColor?: string;
  onVideoGenerate: (data: any) => Promise<void>;
  onCancel: () => void;
}

const VideoCreateFormWrapper = ({
  apiKey = "demo-api-key",
  organisationId = "org_" + Math.random().toString(36).substr(2, 9),
  brandColor = "#3B82F6",
  onVideoGenerate,
  onCancel,
}: VideoCreateFormProps) => {
  return (
    <DatareelProvider
      apiKey={apiKey}
      organisationId={organisationId}
      brandColor={brandColor}
    >
      <VideoCreateForm onVideoGenerate={onVideoGenerate} onError={() => {}} />
    </DatareelProvider>
  );
};

const meta: Meta<typeof VideoCreateFormWrapper> = {
  title: "Blocks/VideoCreateForm",
  component: VideoCreateFormWrapper,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    apiKey: {
      control: "text",
      description: "API key for authentication",
    },
    organisationId: {
      control: "text",
      description: "Organisation ID",
    },
    brandColor: {
      control: "color",
      description: "Brand color for the component",
    },
    onVideoGenerate: {
      action: "video-generated",
      description: "Callback when video is generated",
    },
  },
};

export default meta;
type Story = StoryObj<typeof VideoCreateFormWrapper>;

export const Default: Story = {
  args: {
    apiKey: "demo-api-key",
    organisationId: "org_demo123",
    brandColor: "#3B82F6",
  },
};

export const CustomBranding: Story = {
  args: {
    apiKey: "demo-api-key",
    organisationId: "org_demo123",
    brandColor: "#10B981", // Green brand color
  },
};

export const HealthcareBranding: Story = {
  args: {
    apiKey: "demo-api-key",
    organisationId: "org_healthcare",
    brandColor: "#0891B2", // Medical blue
  },
};
