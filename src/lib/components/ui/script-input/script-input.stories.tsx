import type { Meta, StoryObj } from "@storybook/react-vite";
import { ScriptInput } from "./index";

const meta = {
  title: "Atoms/ScriptInput",
  component: ScriptInput,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A reusable script input component for custom script entry with syntax highlighting-friendly monospace font.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    placeholder: { control: "text" },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    error: { control: "text" },
    helperText: { control: "text" },
    rows: { control: "number" },
  },
} satisfies Meta<typeof ScriptInput>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Custom Script",
    placeholder:
      "Enter your custom script here. This will be the content that your selected avatar will speak in the generated video.",
    rows: 6,
  },
};

export const WithError: Story = {
  args: {
    label: "Custom Script",
    placeholder: "Enter your custom script here...",
    error: "Script cannot be empty",
    value: "",
    rows: 6,
  },
};

export const WithHelperText: Story = {
  args: {
    label: "Custom Script",
    placeholder: "Enter your custom script here...",
    helperText:
      "Write a natural conversational script that your avatar will deliver.",
    rows: 6,
  },
};

export const WithContent: Story = {
  args: {
    label: "Custom Script",
    placeholder: "Enter your custom script here...",
    value: `Welcome to our platform! 

In this video, I'll walk you through the key features and benefits of our service. Let's start by exploring the dashboard where you can manage all your projects.

First, you'll notice the clean interface that makes navigation intuitive and efficient.`,
    rows: 8,
  },
};

export const Disabled: Story = {
  args: {
    label: "Custom Script",
    placeholder: "Enter your custom script here...",
    disabled: true,
    value: "This script input is disabled",
    rows: 6,
  },
};

export const Large: Story = {
  args: {
    label: "Extended Script",
    placeholder: "Enter your extended script here...",
    rows: 12,
    helperText: "For longer scripts, you can expand the input area",
  },
};
