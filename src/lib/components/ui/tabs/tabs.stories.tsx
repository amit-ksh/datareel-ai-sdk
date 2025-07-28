import React from "react";
import { Tabs } from ".";

export default {
  title: "UI/Tabs",
  component: Tabs,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "pills", "underline"],
    },
  },
};

const sampleItems = [
  {
    id: "tab1",
    label: "Choose Your Avatar",
    content: (
      <div className="p-4 bg-gray-50 rounded-lg min-h-[200px]">
        <h3 className="text-lg font-semibold mb-4">Choose Your Avatar</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
            <p className="text-sm font-medium">Alex</p>
            <p className="text-xs text-gray-500">Professional British accent</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
            <p className="text-sm font-medium">Emily</p>
            <p className="text-xs text-gray-500">Clear Asian accent</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border">
            <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-2"></div>
            <p className="text-sm font-medium">Sophia</p>
            <p className="text-xs text-gray-500">Warm American voice</p>
          </div>
          <div className="text-center p-4 bg-white rounded-lg border-brand border">
            <div className="w-16 h-16 bg-brand-light rounded-lg mx-auto mb-2 flex items-center justify-center text-brand text-2xl">
              +
            </div>
            <p className="text-sm font-medium">Custom Avatar</p>
            <p className="text-xs text-gray-500">Create your own</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "tab2",
    label: "Select Video Type",
    content: (
      <div className="p-4 bg-gray-50 rounded-lg min-h-[200px]">
        <h3 className="text-lg font-semibold mb-4">Select Video Type</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-white rounded-lg border border-red-200">
            <div className="w-8 h-8 bg-red-100 rounded mb-3 flex items-center justify-center">
              <span className="text-red-600">🎓</span>
            </div>
            <h4 className="font-medium mb-2">Educational Videos</h4>
            <p className="text-sm text-gray-600">
              Teach financial procedures and strategies
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg border">
            <div className="w-8 h-8 bg-gray-100 rounded mb-3 flex items-center justify-center">
              <span className="text-gray-600">📊</span>
            </div>
            <h4 className="font-medium mb-2">Reports</h4>
            <p className="text-sm text-gray-600">
              Create dynamic yearly reports
            </p>
          </div>
          <div className="p-4 bg-white rounded-lg border border-dashed border-gray-300">
            <div className="w-8 h-8 bg-gray-100 rounded mb-3 flex items-center justify-center">
              <span className="text-gray-600">+</span>
            </div>
            <h4 className="font-medium mb-2">
              Create video with custom script
            </h4>
          </div>
        </div>
      </div>
    ),
  },
  {
    id: "tab3",
    label: "Select Language",
    content: (
      <div className="p-4 bg-gray-50 rounded-lg min-h-[200px]">
        <h3 className="text-lg font-semibold mb-4">Select Language</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border-brand border bg-brand-light">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🇺🇸</span>
              <div>
                <h4 className="font-medium">English</h4>
                <p className="text-sm text-gray-600">Most popular</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white rounded-lg border">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🇫🇷</span>
              <div>
                <h4 className="font-medium">French</h4>
                <p className="text-sm text-gray-600">Professional</p>
              </div>
            </div>
          </div>
          <div className="p-4 bg-white rounded-lg border">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🇪🇸</span>
              <div>
                <h4 className="font-medium">Spanish</h4>
                <p className="text-sm text-gray-600">Widely used</p>
              </div>
            </div>
          </div>
        </div>
        <div className="mt-4 text-center">
          <button className="text-brand hover:text-brand text-sm">
            ⚙️ Need a custom language?
          </button>
        </div>
      </div>
    ),
  },
];

export const Default = {
  args: {
    items: sampleItems,
    variant: "default",
  },
};

export const Pills = {
  args: {
    items: sampleItems,
    variant: "pills",
  },
};

export const Underline = {
  args: {
    items: sampleItems,
    variant: "underline",
  },
};

export const WithDisabledTab = {
  args: {
    items: [
      ...sampleItems,
      {
        id: "tab4",
        label: "Disabled Tab",
        content: <div>This content should not be visible</div>,
        disabled: true,
      },
    ],
    variant: "default",
  },
};

export const ControlledTabs = {
  render: () => {
    const [activeTab, setActiveTab] = React.useState("tab2");

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab("tab1")}
            className="px-3 py-1 bg-brand text-white rounded text-sm"
          >
            Go to Tab 1
          </button>
          <button
            onClick={() => setActiveTab("tab2")}
            className="px-3 py-1 bg-brand text-white rounded text-sm"
          >
            Go to Tab 2
          </button>
          <button
            onClick={() => setActiveTab("tab3")}
            className="px-3 py-1 bg-brand text-white rounded text-sm"
          >
            Go to Tab 3
          </button>
        </div>
        <Tabs
          items={sampleItems}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          variant="pills"
        />
      </div>
    );
  },
};
