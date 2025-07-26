import type { Meta, StoryObj } from "@storybook/react-vite";
import { Input } from "./index";

const meta = {
  title: "Atoms/Input",
  component: Input,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A reusable input component with label, icons, and error states.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    placeholder: { control: "text" },
    type: {
      control: "select",
      options: ["text", "email", "password", "number", "tel", "url"],
    },
    disabled: { control: "boolean" },
    required: { control: "boolean" },
    error: { control: "text" },
    helperText: { control: "text" },
  },
} satisfies Meta<typeof Input>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Email",
    placeholder: "Enter your email",
    type: "email",
  },
};

export const WithError: Story = {
  args: {
    label: "Email",
    placeholder: "Enter your email",
    type: "email",
    error: "Please enter a valid email address",
  },
};

export const WithHelperText: Story = {
  args: {
    label: "Password",
    placeholder: "Enter your password",
    type: "password",
    helperText: "Password must be at least 8 characters long",
  },
};

export const WithLeftIcon: Story = {
  args: {
    label: "Email",
    placeholder: "Enter your email",
    type: "email",
    leftIcon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
      </svg>
    ),
  },
};

export const WithRightIcon: Story = {
  args: {
    label: "Password",
    placeholder: "Enter your password",
    type: "password",
    rightIcon: (
      <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
      </svg>
    ),
    onRightIconClick: () => console.log("Right icon clicked"),
  },
};

export const Disabled: Story = {
  args: {
    label: "Email",
    placeholder: "Enter your email",
    type: "email",
    disabled: true,
    value: "disabled@example.com",
  },
};
