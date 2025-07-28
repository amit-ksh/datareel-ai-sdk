import React from "react";
import { DatareelProvider, useDatareel } from "./index";

// Demo component that uses the context
function DatareelDemo() {
  const { organisation, datareel } = useDatareel();

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Datareel Context Demo</h2>
      <div className="space-y-2">
        <p>
          <strong>Organisation ID:</strong> {organisation}
        </p>
        <p>
          <strong>Datareel Instance:</strong>{" "}
          {datareel ? "Available" : "Not Available"}
        </p>
        <p>
          <strong>Secret:</strong> {datareel?.secret ? "Set" : "Not Set"}
        </p>
      </div>

      <div
        className="w-32 h-32 rounded-lg border-2 border-gray-300"
        style={{ backgroundColor: "var(--datareel-brand-color)" }}
      >
        <div className="flex items-center justify-center h-full text-white font-semibold">
          Brand Color
        </div>
      </div>

      <p className="text-sm text-gray-600">
        The square above uses the CSS variable --datareel-brand-color
      </p>
    </div>
  );
}

export default {
  title: "Context/DatareelProvider",
  component: DatareelProvider,
  parameters: {
    layout: "fullscreen",
  },
  argTypes: {
    organisationId: {
      control: "text",
      description: "The organisation ID to set in the context",
    },
    brandColor: {
      control: "color",
      description: "The brand color to set as CSS variable",
    },
    secret: {
      control: "text",
      description: "The secret for the Datareel instance",
    },
  },
};

export const Default = {
  args: {
    organisationId: "org-123",
    brandColor: "#3b82f6",
    secret: "your-secret-key",
  },
  render: (args: any) => (
    <DatareelProvider {...args}>
      <DatareelDemo />
    </DatareelProvider>
  ),
};

export const CustomBrandColor = {
  args: {
    organisationId: "org-456",
    brandColor: "#ef4444",
    secret: "your-secret-key",
  },
  render: (args: any) => (
    <DatareelProvider {...args}>
      <DatareelDemo />
    </DatareelProvider>
  ),
};

export const PurpleBrand = {
  args: {
    organisationId: "org-789",
    brandColor: "#8b5cf6",
    secret: "your-secret-key",
  },
  render: (args: any) => (
    <DatareelProvider {...args}>
      <DatareelDemo />
    </DatareelProvider>
  ),
};
