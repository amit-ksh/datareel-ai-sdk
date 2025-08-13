import type { Meta, StoryObj } from "@storybook/react-vite";
import { CreateAvatarForm } from "./index";
import { DatareelProvider } from "../../context";

function StoryWrapper(props: any) {
  return (
    <DatareelProvider brandColor="#3B82F6">
      <CreateAvatarForm {...props} />
    </DatareelProvider>
  );
}

const meta: Meta<typeof CreateAvatarForm> = {
  title: "Blocks/CreateAvatarForm",
  component: StoryWrapper,
  parameters: {
    layout: "fullscreen",
    docs: {
      description: {
        component:
          "A comprehensive form for creating avatars using the standard Tabs component from the UI library. Features 'Upload File' and 'Record Yourself' tabs with integrated video cropping capabilities.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    onAvatarCreated: {
      description: "Callback when avatar is successfully created",
    },
    onCancel: {
      description: "Callback when form is cancelled",
    },
  },
};

export default meta;
type Story = StoryObj<typeof CreateAvatarForm>;

const mockAvatarVideoFileValid = (file: File) => {
  const validTypes = ["video/mp4", "video/mov", "video/quicktime"];
  const maxSize = 100 * 1024 * 1024; // 100MB

  if (!validTypes.includes(file.type)) {
    console.error("Invalid file type. Please upload MP4 or MOV files.");
    return false;
  }

  if (file.size > maxSize) {
    console.error("File too large. Maximum size is 100MB.");
    return false;
  }

  return true;
};

export const Default: Story = {
  args: {
    onAvatarCreated: (data: any) => console.log("Avatar created:", data),
    onCancel: () => console.log("Form cancelled"),
    avatarVideoFileValid: mockAvatarVideoFileValid,
  },
};

export const WithCustomAspectRatio: Story = {
  args: {
    ...Default.args,
  },
};

export const Minimal: Story = {
  args: {
    onAvatarCreated: (data: any) => console.log("Avatar created:", data),
    onCancel: () => console.log("Form cancelled"),
  },
};
