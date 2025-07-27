import React from "react";
import { Popover } from ".";
import { Button } from "../button";

export default {
  title: "UI/Popover",
  component: Popover,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    side: {
      control: { type: "select" },
      options: ["top", "bottom", "left", "right"],
    },
    align: {
      control: { type: "select" },
      options: ["start", "center", "end"],
    },
    trigger: {
      control: { type: "select" },
      options: ["click", "hover"],
    },
    disabled: {
      control: { type: "boolean" },
    },
    defaultOpen: {
      control: { type: "boolean" },
    },
  },
};

const SampleContent = () => (
  <div className="space-y-2">
    <h4 className="font-medium text-sm">Popover Content</h4>
    <p className="text-sm text-gray-600">
      This is the content inside the popover. You can put any React content
      here.
    </p>
    <div className="flex gap-2">
      <Button size="sm" variant="outline">
        Cancel
      </Button>
      <Button size="sm">Confirm</Button>
    </div>
  </div>
);

export const Default = {
  args: {
    children: <Button>Open Popover</Button>,
    content: <SampleContent />,
    side: "bottom",
    align: "center",
    trigger: "click",
  },
};

export const Sides = {
  render: () => (
    <div className="grid grid-cols-2 gap-8 p-8">
      <Popover side="top" content={<div className="text-sm">Top popover</div>}>
        <Button>Top</Button>
      </Popover>

      <Popover
        side="bottom"
        content={<div className="text-sm">Bottom popover</div>}
      >
        <Button>Bottom</Button>
      </Popover>

      <Popover
        side="left"
        content={<div className="text-sm">Left popover</div>}
      >
        <Button>Left</Button>
      </Popover>

      <Popover
        side="right"
        content={<div className="text-sm">Right popover</div>}
      >
        <Button>Right</Button>
      </Popover>
    </div>
  ),
};

export const Alignments = {
  render: () => (
    <div className="flex gap-4 p-8">
      <Popover
        side="bottom"
        align="start"
        content={<div className="text-sm">Start aligned</div>}
      >
        <Button>Start</Button>
      </Popover>

      <Popover
        side="bottom"
        align="center"
        content={<div className="text-sm">Center aligned</div>}
      >
        <Button>Center</Button>
      </Popover>

      <Popover
        side="bottom"
        align="end"
        content={<div className="text-sm">End aligned</div>}
      >
        <Button>End</Button>
      </Popover>
    </div>
  ),
};

export const HoverTrigger = {
  args: {
    children: <Button variant="outline">Hover me</Button>,
    content: <div className="text-sm">This popover opens on hover!</div>,
    trigger: "hover",
    side: "top",
  },
};

export const WithCustomContent = {
  render: () => (
    <Popover
      content={
        <div className="space-y-3">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <span className="text-white text-xs font-bold">✓</span>
            </div>
            <div>
              <h4 className="font-medium text-sm">Success!</h4>
              <p className="text-xs text-gray-600">
                Your action was completed.
              </p>
            </div>
          </div>
          <div className="border-t pt-2">
            <Button size="sm" className="w-full">
              Continue
            </Button>
          </div>
        </div>
      }
    >
      <Button variant="secondary">Show Success</Button>
    </Popover>
  ),
};

export const Disabled = {
  args: {
    children: <Button disabled>Disabled Trigger</Button>,
    content: <div className="text-sm">This won't show</div>,
    disabled: true,
  },
};

export const ControlledExample = {
  render: () => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setIsOpen(true)}>
            Open Popover
          </Button>
          <Button variant="outline" size="sm" onClick={() => setIsOpen(false)}>
            Close Popover
          </Button>
        </div>

        <Popover
          defaultOpen={isOpen}
          onOpenChange={setIsOpen}
          content={
            <div className="text-sm">
              <p>Controlled popover state: {isOpen ? "Open" : "Closed"}</p>
              <Button
                size="sm"
                className="mt-2"
                onClick={() => setIsOpen(false)}
              >
                Close from inside
              </Button>
            </div>
          }
        >
          <Button>Controlled Popover</Button>
        </Popover>
      </div>
    );
  },
};
