import React from "react";
import { Header } from ".";
import { Button } from "../button";
import { Plus, Download } from "lucide-react";

export default {
  title: "UI/Header",
  component: Header,
  parameters: {
    layout: "fullscreen",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: { type: "select" },
      options: ["default", "dark", "primary"],
    },
    size: {
      control: { type: "select" },
      options: ["sm", "default", "lg"],
    },
    showSearch: {
      control: { type: "boolean" },
    },
    showNotifications: {
      control: { type: "boolean" },
    },
    notificationCount: {
      control: { type: "number" },
    },
  },
};

const Logo = () => (
  <div className="flex items-center space-x-2">
    <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
      <span className="text-white font-bold text-sm">D</span>
    </div>
    <span className="font-semibold text-lg">DataReel</span>
  </div>
);

const sampleUser = {
  name: "John Doe",
  email: "john.doe@example.com",
  avatar:
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face&auto=format",
};

const sampleNavigation = [
  { label: "Dashboard", active: true },
  { label: "Projects", active: false },
  { label: "Analytics", active: false },
  { label: "Settings", active: false },
];

export const Default = {
  args: {
    logo: <Logo />,
    user: sampleUser,
    onUserMenuAction: (action: string) => {
      console.log("User menu action:", action);
    },
  },
};

export const WithTitle = {
  args: {
    title: "My Application",
    user: sampleUser,
    onUserMenuAction: (action: string) => {
      console.log("User menu action:", action);
    },
  },
};

export const WithNavigation = {
  args: {
    logo: <Logo />,
    navigation: sampleNavigation,
    user: sampleUser,
    onUserMenuAction: (action: string) => {
      console.log("User menu action:", action);
    },
  },
};

export const WithSearch = {
  args: {
    logo: <Logo />,
    user: sampleUser,
    showSearch: true,
    onSearch: (query: string) => {
      console.log("Search query:", query);
    },
    onUserMenuAction: (action: string) => {
      console.log("User menu action:", action);
    },
  },
};

export const WithNotifications = {
  args: {
    logo: <Logo />,
    user: sampleUser,
    showNotifications: true,
    notificationCount: 5,
    onNotificationClick: () => {
      console.log("Notifications clicked");
    },
    onUserMenuAction: (action: string) => {
      console.log("User menu action:", action);
    },
  },
};

export const WithActions = {
  args: {
    logo: <Logo />,
    user: sampleUser,
    actions: (
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" />
          Export
        </Button>
        <Button size="sm">
          <Plus className="w-4 h-4 mr-2" />
          New Project
        </Button>
      </div>
    ),
    onUserMenuAction: (action: string) => {
      console.log("User menu action:", action);
    },
  },
};

export const FullFeatured = {
  args: {
    logo: <Logo />,
    navigation: sampleNavigation,
    user: sampleUser,
    showSearch: true,
    showNotifications: true,
    notificationCount: 12,
    actions: (
      <Button size="sm">
        <Plus className="w-4 h-4 mr-2" />
        New
      </Button>
    ),
    onSearch: (query: string) => {
      console.log("Search query:", query);
    },
    onNotificationClick: () => {
      console.log("Notifications clicked");
    },
    onUserMenuAction: (action: string) => {
      console.log("User menu action:", action);
    },
  },
};

export const DarkVariant = {
  args: {
    variant: "dark",
    logo: <Logo />,
    navigation: sampleNavigation,
    user: sampleUser,
    showSearch: true,
    showNotifications: true,
    notificationCount: 3,
    onUserMenuAction: (action: string) => {
      console.log("User menu action:", action);
    },
  },
};

export const PrimaryVariant = {
  args: {
    variant: "primary",
    logo: <Logo />,
    user: sampleUser,
    showSearch: true,
    onUserMenuAction: (action: string) => {
      console.log("User menu action:", action);
    },
  },
};

export const Sizes = {
  render: () => (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-medium mb-2">Small</h3>
        <Header
          size="sm"
          logo={<Logo />}
          user={sampleUser}
          onUserMenuAction={(action) => console.log(action)}
        />
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Default</h3>
        <Header
          size="default"
          logo={<Logo />}
          user={sampleUser}
          onUserMenuAction={(action) => console.log(action)}
        />
      </div>

      <div>
        <h3 className="text-sm font-medium mb-2">Large</h3>
        <Header
          size="lg"
          logo={<Logo />}
          user={sampleUser}
          onUserMenuAction={(action) => console.log(action)}
        />
      </div>
    </div>
  ),
};

export const WithoutUser = {
  args: {
    logo: <Logo />,
    navigation: sampleNavigation,
    showSearch: true,
    actions: (
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="sm">
          Login
        </Button>
        <Button size="sm">Sign Up</Button>
      </div>
    ),
  },
};

export const MinimalHeader = {
  args: {
    title: "Simple App",
  },
};

export const InteractiveExample = {
  render: () => {
    const [notifications, setNotifications] = React.useState(3);
    const [activeNav, setActiveNav] = React.useState("Dashboard");

    const navigation = [
      { label: "Dashboard", active: activeNav === "Dashboard" },
      { label: "Projects", active: activeNav === "Projects" },
      { label: "Analytics", active: activeNav === "Analytics" },
      { label: "Settings", active: activeNav === "Settings" },
    ];

    return (
      <div className="space-y-4">
        <Header
          logo={<Logo />}
          navigation={navigation.map((item) => ({
            ...item,
            onClick: () => setActiveNav(item.label),
          }))}
          user={sampleUser}
          showSearch={true}
          showNotifications={true}
          notificationCount={notifications}
          onSearch={(query) => console.log("Search:", query)}
          onNotificationClick={() => {
            setNotifications(0);
            console.log("Notifications cleared");
          }}
          onUserMenuAction={(action) => {
            console.log("User action:", action);
            if (action === "logout") {
              alert("Logout clicked!");
            }
          }}
          actions={
            <Button
              size="sm"
              onClick={() => setNotifications((prev) => prev + 1)}
            >
              Add Notification
            </Button>
          }
        />

        <div className="p-4 bg-gray-50 rounded-lg">
          <p className="text-sm text-gray-600">
            Active Navigation: <strong>{activeNav}</strong>
          </p>
          <p className="text-sm text-gray-600">
            Notifications: <strong>{notifications}</strong>
          </p>
        </div>
      </div>
    );
  },
};
