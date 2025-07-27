import React from "react";
import { Button } from ".";

export default {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "outline", "secondary", "ghost", "destructive"],
    },
    size: {
      control: { type: "select" },
      options: ["default", "sm", "lg", "icon"],
    },
    loading: {
      control: { type: "boolean" },
    },
    disabled: {
      control: { type: "boolean" },
    },
  },
};

export const Default = {
  args: {
    children: "Button",
    variant: "default",
  },
};

export const Variants = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button variant="default">Default</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="secondary">Secondary</Button>
      <Button variant="ghost">Ghost</Button>
      <Button variant="destructive">Destructive</Button>
    </div>
  ),
};

export const Sizes = {
  render: () => (
    <div className="flex flex-wrap items-center gap-4">
      <Button size="sm">Small</Button>
      <Button size="default">Default</Button>
      <Button size="lg">Large</Button>
      <Button size="icon">🔥</Button>
    </div>
  ),
};

export const WithIcons = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button leftIcon={<span>📁</span>}>With Left Icon</Button>
      <Button rightIcon={<span>→</span>}>With Right Icon</Button>
      <Button leftIcon={<span>📤</span>} rightIcon={<span>✓</span>}>
        Both Icons
      </Button>
    </div>
  ),
};

export const Loading = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button loading>Loading...</Button>
      <Button variant="outline" loading>
        Loading...
      </Button>
      <Button variant="secondary" loading>
        Loading...
      </Button>
    </div>
  ),
};

export const Disabled = {
  render: () => (
    <div className="flex flex-wrap gap-4">
      <Button disabled>Disabled</Button>
      <Button variant="outline" disabled>
        Disabled
      </Button>
      <Button variant="secondary" disabled>
        Disabled
      </Button>
    </div>
  ),
};
