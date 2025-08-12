import React from "react";
import { DatareelProvider, useDatareel } from "./index";

// Demo component that uses the context
function DatareelDemo() {
  const { datareel } = useDatareel();

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Datareel Context Demo</h2>
      <div className="space-y-2">
        <p>
          <strong>Datareel Instance:</strong>{" "}
          {datareel ? "Available" : "Not Available"}
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
    brandColor: {
      control: "color",
      description: "The brand color to set as CSS variable",
    },
  },
};

export const Default = {
  args: {
    brandColor: "#3b82f6",
  },
  render: (args: any) => (
    <DatareelProvider {...args}>
      <DatareelDemo />
    </DatareelProvider>
  ),
};

export const CustomBrandColor = {
  args: {
    brandColor: "#ef4444",
  },
  render: (args: any) => (
    <DatareelProvider {...args}>
      <DatareelDemo />
    </DatareelProvider>
  ),
};

export const PurpleBrand = {
  args: {
    brandColor: "#8b5cf6",
  },
  render: (args: any) => (
    <DatareelProvider {...args}>
      <DatareelDemo />
    </DatareelProvider>
  ),
};
