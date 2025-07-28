import type { Meta, StoryObj } from "@storybook/react-vite";
import { FileUpload } from "./index";

const meta = {
  title: "UI/FileUpload",
  component: FileUpload,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A reusable file upload component with drag & drop functionality, file validation, and preview.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    label: { control: "text" },
    accept: { control: "text" },
    maxSize: { control: "number" },
    multiple: { control: "boolean" },
    disabled: { control: "boolean" },
    error: { control: "text" },
    helperText: { control: "text" },
    onFileSelect: { action: "files selected" },
    onFileRemove: { action: "file removed" },
  },
} satisfies Meta<typeof FileUpload>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    label: "Upload Your Video",
    accept: "video/*",
    maxSize: 100,
    multiple: false,
    helperText: "MP4, WebM or MOV files up to 100MB",
  },
};

export const WithError: Story = {
  args: {
    label: "Upload Your Video",
    accept: "video/*",
    maxSize: 100,
    multiple: false,
    error: "Please upload a valid video file",
  },
};

export const MultipleFiles: Story = {
  args: {
    label: "Upload Multiple Videos",
    accept: "video/*",
    maxSize: 100,
    multiple: true,
    helperText: "You can upload multiple video files at once",
  },
};

export const ImageUpload: Story = {
  args: {
    label: "Upload Images",
    accept: "image/*",
    maxSize: 10,
    multiple: true,
    helperText: "JPEG, PNG, or WebP files up to 10MB each",
  },
};

export const DocumentUpload: Story = {
  args: {
    label: "Upload Documents",
    accept: ".pdf,.doc,.docx,.txt",
    maxSize: 50,
    multiple: true,
    helperText: "PDF, Word documents, or text files up to 50MB each",
  },
};

export const Disabled: Story = {
  args: {
    label: "Upload Your Video",
    accept: "video/*",
    maxSize: 100,
    multiple: false,
    disabled: true,
    helperText: "File upload is currently disabled",
  },
};

export const SmallSize: Story = {
  args: {
    label: "Upload Small File",
    accept: "*",
    maxSize: 1,
    multiple: false,
    helperText: "Files up to 1MB only",
  },
};

export const AllFileTypes: Story = {
  args: {
    label: "Upload Any File",
    accept: "*",
    maxSize: 100,
    multiple: true,
    helperText: "Any file type up to 100MB each",
  },
};
