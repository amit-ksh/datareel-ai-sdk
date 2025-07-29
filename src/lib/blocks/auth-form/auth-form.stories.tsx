import type { Meta, StoryObj } from "@storybook/react-vite";
import { AuthForm } from "./index";

const meta: Meta<typeof AuthForm> = {
  title: "Blocks/AuthForm",
  component: AuthForm,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    brandColor: {
      control: { type: "color" },
      description: "Brand color for the form theme",
    },
  },
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    brandColor: "#3b82f6",
    onAuthSuccess: () => {
      console.log("Authentication successful");
    },
    onAuthError: (error: string) => {
      console.error("Authentication error:", error);
    },
  },
};

export const CustomBrandColor: Story = {
  args: {
    brandColor: "#10b981",
    onAuthSuccess: () => {
      console.log("Authentication successful");
    },
    onAuthError: (error: string) => {
      console.error("Authentication error:", error);
    },
  },
};
