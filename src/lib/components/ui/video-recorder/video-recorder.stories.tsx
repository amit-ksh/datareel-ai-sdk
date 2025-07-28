import type { Meta, StoryObj } from "@storybook/react-vite";
import { VideoRecorder } from "./index";

const meta = {
  title: "UI/VideoRecorder",
  component: VideoRecorder,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A comprehensive video recording component with camera access, recording controls, and video preview functionality. Supports both audio and video recording with customizable duration.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    recordDuration: {
      control: { type: "number", min: 10, max: 300, step: 5 },
      description: "Recording duration in seconds",
    },
    record: {
      control: "object",
      description: "Recording configuration for audio and video",
    },
    onRecordingComplete: {
      action: "recording completed",
      description: "Callback when recording is finished",
    },
    onReset: {
      action: "reset",
      description: "Optional callback when component is reset",
    },
  },
} satisfies Meta<typeof VideoRecorder>;

export default meta;
type Story = StoryObj<typeof meta>;

// Mock handlers for the stories
const handleRecordingComplete = async (media: any) => {
  console.log("Recording completed:", media);
  await new Promise((resolve) => setTimeout(resolve, 1000));
};

const handleReset = () => {
  console.log("Component reset");
};

export const Default: Story = {
  args: {
    recordDuration: 30,
    record: {
      audio: true,
      video: true,
    },
    onRecordingComplete: handleRecordingComplete,
    onReset: handleReset,
  },
};

export const VideoOnly: Story = {
  args: {
    recordDuration: 60,
    record: {
      audio: false,
      video: true,
    },
    onRecordingComplete: handleRecordingComplete,
    onReset: handleReset,
  },
  parameters: {
    docs: {
      description: {
        story: "Video recording only, without audio capture.",
      },
    },
  },
};

export const AudioOnly: Story = {
  args: {
    recordDuration: 120,
    record: {
      audio: true,
      video: false,
    },
    onRecordingComplete: handleRecordingComplete,
    onReset: handleReset,
  },
  parameters: {
    docs: {
      description: {
        story: "Audio recording only, without video capture.",
      },
    },
  },
};

export const ShortRecording: Story = {
  args: {
    recordDuration: 10,
    record: {
      audio: true,
      video: true,
    },
    onRecordingComplete: handleRecordingComplete,
    onReset: handleReset,
  },
  parameters: {
    docs: {
      description: {
        story: "Short 10-second recording for quick demos or tests.",
      },
    },
  },
};

export const LongRecording: Story = {
  args: {
    recordDuration: 180,
    record: {
      audio: true,
      video: true,
    },
    onRecordingComplete: handleRecordingComplete,
    onReset: handleReset,
  },
  parameters: {
    docs: {
      description: {
        story: "Extended 3-minute recording for longer content.",
      },
    },
  },
};

export const WithCustomHandlers: Story = {
  args: {
    recordDuration: 45,
    record: {
      audio: true,
      video: true,
    },
    onRecordingComplete: async (media: any) => {
      console.log("Custom handler - Recording completed:", media);
      alert("Recording completed successfully!");
      await new Promise((resolve) => setTimeout(resolve, 500));
    },
    onReset: () => {
      console.log("Custom handler - Component reset");
      alert("Component has been reset!");
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Example with custom callback handlers that show alerts.",
      },
    },
  },
};
