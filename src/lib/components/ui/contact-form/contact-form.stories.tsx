import type { Meta, StoryObj } from "@storybook/react-vite";
import { ContactForm } from "./index";
import { useState } from "react";

const meta = {
  title: "UI/ContactForm",
  component: ContactForm,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A contact form component for collecting email and WhatsApp information.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    type: {
      control: "select",
      options: ["whatsapp", "email", "general"],
    },
    isOptional: { control: "boolean" },
    showCaption: { control: "boolean" },
  },
} satisfies Meta<typeof ContactForm>;

export default meta;
type Story = StoryObj<typeof meta>;

const ContactFormWithState = (args: any) => {
  const [contactData, setContactData] = useState({
    emails: [],
    phoneNumbers: [],
    emailSubject: "",
    whatsappCaption: "",
  });

  return (
    <div className="w-full max-w-4xl">
      <ContactForm
        {...args}
        contactData={contactData}
        onContactDataChange={setContactData}
      />
    </div>
  );
};

export const WhatsAppForm: Story = {
  render: ContactFormWithState,
  args: {
    type: "whatsapp",
    isOptional: true,
  } as any,
};

export const EmailForm: Story = {
  render: ContactFormWithState,
  args: {
    type: "email",
    isOptional: true,
  } as any,
};

export const GeneralForm: Story = {
  render: ContactFormWithState,
  args: {
    type: "general",
    isOptional: false,
    showCaption: true,
  } as any,
};

export const CustomTitles: Story = {
  render: ContactFormWithState,
  args: {
    type: "whatsapp",
    title: "Custom WhatsApp Sharing",
    description: "Share your video directly to WhatsApp contacts",
    isOptional: false,
  } as any,
};
