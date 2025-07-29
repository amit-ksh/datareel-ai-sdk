import type { Meta, StoryObj } from "@storybook/react-vite";
import { VideoCreateForm } from "./index";
import { Avatar, Pipeline } from "../../types";
import { DatareelProvider } from "../../context";

interface VideoCreateFormProps {
  secret?: string;
  organizationId?: string;
  brandColor?: string;
  onVideoGenerate: (data: {
    avatar: Avatar | null;
    language: string | null;
    videoType: Pipeline | null;
  }) => Promise<void>;
  onCancel: () => void;
}

const VideoCreateFormWrapper = ({
  secret = "zBsBEtLn4PgIrj0CNEbHSGNQjhJGoyaAmTvQikqQlZ+K1yhMU7i4htz9MoUlap48Dwwknw+9WB8oMxWl",
  organizationId = "org_" + Math.random().toString(36).substr(2, 9),
  brandColor = "#3B82F6",
  onVideoGenerate,
  onCancel,
}: VideoCreateFormProps) => {
  return (
    <DatareelProvider
      secret={secret}
      organisationId={organizationId}
      brandColor={brandColor}
    >
      <VideoCreateForm onVideoGenerate={onVideoGenerate} onCancel={onCancel} />
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
    secret: {
      control: "text",
      description: "Secret key for authentication",
    },
    organizationId: {
      control: "text",
      description: "Organization ID",
    },
    brandColor: {
      control: "color",
      description: "Brand color for the component",
    },
    onVideoGenerate: {
      action: "video-generated",
      description: "Callback when video is generated",
    },
    onCancel: {
      action: "cancelled",
      description: "Callback when user cancels the form",
    },
  },
};

export default meta;
type Story = StoryObj<typeof VideoCreateFormWrapper>;

export const Default: Story = {
  args: {
    secret:
      "zBsBEtLn4PgIrj0CNEbHSGNQjhJGoyaAmTvQikqQlZ+K1yhMU7i4htz9MoUlap48Dwwknw+9WB8oMxWl",
    organizationId: "org_demo123",
    brandColor: "#3B82F6",
  },
};

export const CustomBranding: Story = {
  args: {
    secret:
      "zBsBEtLn4PgIrj0CNEbHSGNQjhJGoyaAmTvQikqQlZ+K1yhMU7i4htz9MoUlap48Dwwknw+9WB8oMxWl",
    organizationId: "org_demo123",
    brandColor: "#10B981", // Green brand color
  },
};

export const HealthcareBranding: Story = {
  args: {
    secret:
      "zBsBEtLn4PgIrj0CNEbHSGNQjhJGoyaAmTvQikqQlZ+K1yhMU7i4htz9MoUlap48Dwwknw+9WB8oMxWl",
    organizationId: "org_healthcare",
    brandColor: "#0891B2", // Medical blue
  },
};
