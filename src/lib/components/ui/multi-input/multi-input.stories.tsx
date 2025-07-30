import type { Meta, StoryObj } from "@storybook/react-vite";
import { MultiInput } from "./index";
import { useState } from "react";
import { Mail, Phone } from "lucide-react";

const meta = {
  title: "UI/MultiInput",
  component: MultiInput,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A multi-input component for adding multiple values like emails or phone numbers.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    placeholder: { control: "text" },
    maxItems: { control: "number" },
  },
} satisfies Meta<typeof MultiInput>;

export default meta;
type Story = StoryObj<typeof meta>;

const MultiInputWithState = (args: any) => {
  const [values, setValues] = useState<string[]>([]);

  return (
    <div className="w-96">
      <MultiInput {...args} value={values} onChange={setValues} />
    </div>
  );
};

export const Default: Story = {
  render: MultiInputWithState,
  args: {
    label: "Email Addresses",
    placeholder: "Enter email address",
    validator: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    helperText: "Press Enter or comma to add multiple emails",
    onChange: (values: string[]) => {
      console.log("Updated emails:", values);
    },
    value: ["example@example.com"],
  },
};

export const WithEmailIcon: Story = {
  render: MultiInputWithState,
  args: {
    label: "Email Addresses",
    placeholder: "Enter email address",
    validator: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    helperText: "Press Enter or comma to add emails",
    leftIcon: <Mail className="w-5 h-5" />,
    onChange: (values: string[]) => {
      console.log("Updated emails:", values);
    },
    value: ["example@example.com"],
  },
};

export const PhoneNumbers: Story = {
  render: MultiInputWithState,
  args: {
    label: "Phone Numbers",
    placeholder: "Enter phone number",
    validator: (phone: string) =>
      /^\+?\d{1,3}?[-. ]?\(?\d{1,4}?\)?[-. ]?\d{1,4}[-. ]?\d{1,9}$/.test(phone),
    helperText: "Include country code (e.g., +1234567890)",
    leftIcon: <Phone className="w-5 h-5" />,
    maxItems: 5,
    onChange: (values: string[]) => {
      console.log("Updated emails:", values);
    },
    value: ["example@example.com"],
  },
};

export const WithError: Story = {
  render: MultiInputWithState,
  args: {
    label: "Email Addresses",
    placeholder: "Enter email address",
    validator: (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    error: "Invalid email format",
    onChange: (values: string[]) => {
      console.log("Updated emails:", values);
    },
    value: ["example@example.com"],
  },
};
