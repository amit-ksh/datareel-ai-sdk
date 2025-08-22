import type { Meta, StoryObj } from "@storybook/react-vite";
import { AvatarUploadGuidelines } from "./index";

const meta: Meta<typeof AvatarUploadGuidelines> = {
  title: "Blocks/AvatarUploadGuidelines",
  component: AvatarUploadGuidelines,
  tags: ["autodocs"],
  parameters: {
    docs: {
      description: {
        component:
          "Guidelines component providing best practices for recording / uploading an avatar reference video.",
      },
    },
  },
  args: {},
  argTypes: {
    className: { control: "text", description: "Optional wrapper class names" },
    imageSrc: {
      control: "text",
      description: "Image source for guideline visual",
    },
    alt: { control: "text", description: "Alt text for the guideline image" },
  },
};

export default meta;

type Story = StoryObj<typeof AvatarUploadGuidelines>;

export const Default: Story = {
  args: {},
};

export const CustomImage: Story = {
  args: {
    imageSrc: "/avatar-upload-guidelines.png",
    className: "max-w-md",
  },
};
