import type { Meta, StoryObj } from "@storybook/react-vite";
import { VideoCreateForm } from "./index";

const meta: Meta<typeof VideoCreateForm> = {
  title: "Blocks/VideoCreateForm",
  component: VideoCreateForm,
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
    onVideoGenerated: {
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
type Story = StoryObj<typeof VideoCreateForm>;

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
