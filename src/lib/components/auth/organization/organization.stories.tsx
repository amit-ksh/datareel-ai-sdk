import type { Meta, StoryObj } from "@storybook/react-vite";
import React from "react";
import {
  Building2Icon,
  CheckCircleIcon,
  XCircleIcon,
  LoaderCircleIcon,
} from "lucide-react";
import { Organization } from "./index";

const meta = {
  title: "Components/Auth/Organization",
  component: Organization,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A comprehensive organization management component with configurable states for not found, creating, error, and loading scenarios. Fully customizable with various options and callbacks.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    onCreateOrganization: {
      description:
        "Callback function triggered when 'Create Organization' button is clicked",
      action: "onCreateOrganization",
    },
    onContinueWithoutOrganization: {
      description:
        "Callback function triggered when 'Continue Without Organization' button is clicked",
      action: "onContinueWithoutOrganization",
    },
    onCancel: {
      description:
        "Callback function triggered when 'Cancel' button is clicked",
      action: "onCancel",
    },
    isLoading: {
      description: "Shows loading state on interactive elements",
      control: { type: "boolean" },
    },
    isCreating: {
      description: "Shows creating state with spinner on create button",
      control: { type: "boolean" },
    },
    hasError: {
      description: "Shows error state with error message",
      control: { type: "boolean" },
    },
    errorMessage: {
      description: "Custom error message to display",
      control: { type: "text" },
    },
    organizationName: {
      description: "Name of the organization that was not found",
      control: { type: "text" },
    },
    title: {
      description: "Custom title text",
      control: { type: "text" },
    },
    description: {
      description: "Custom description text",
      control: { type: "text" },
    },
    createButtonText: {
      description: "Custom text for create button",
      control: { type: "text" },
    },
    continueButtonText: {
      description: "Custom text for continue button",
      control: { type: "text" },
    },
    cancelButtonText: {
      description: "Custom text for cancel button",
      control: { type: "text" },
    },
    variant: {
      description: "Predefined component variants",
      control: { type: "select" },
      options: ["not-found", "creating", "error"],
    },
    customizable: {
      description:
        "Configuration object to control which elements are displayed",
      control: { type: "object" },
    },
  },
} satisfies Meta<typeof Organization>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          "The default organization not found dialog with all options visible.",
      },
    },
  },
};

// With Organization Name
export const WithOrganizationName: Story = {
  args: {
    organizationName: "Acme Corp",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Organization dialog with a specific organization name that was not found.",
      },
    },
  },
};

// Loading State
export const Loading: Story = {
  args: {
    isLoading: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Organization dialog in loading state with disabled interactive elements.",
      },
    },
  },
};

// Creating State
export const Creating: Story = {
  args: {
    isCreating: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Organization dialog showing creating state with spinner on create button.",
      },
    },
  },
};

// Creating Variant
export const CreatingVariant: Story = {
  args: {
    variant: "creating",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Organization dialog in full creating mode with appropriate messaging and loading state.",
      },
    },
  },
};

// Error State
export const WithError: Story = {
  args: {
    hasError: true,
    errorMessage:
      "Failed to create organization. Please check your permissions and try again.",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Organization dialog showing error state with custom error message.",
      },
    },
  },
};

// Error Variant
export const ErrorVariant: Story = {
  args: {
    variant: "error",
    errorMessage:
      "Network connection failed. Please check your internet connection and try again.",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Organization dialog in full error mode with error styling and messaging.",
      },
    },
  },
};

// Custom Text
export const CustomText: Story = {
  args: {
    title: "Welcome to DataReel AI",
    description:
      "To get started, you'll need to set up your workspace. Would you like to create one now?",
    createButtonText: "Create Workspace",
    continueButtonText: "Skip for now",
    cancelButtonText: "Go back",
  },
  parameters: {
    docs: {
      description: {
        story: "Organization dialog with completely customized text content.",
      },
    },
  },
};

// Custom Icon
export const CustomIcon: Story = {
  args: {
    icon: (
      <div className="size-12 bg-blue-100 rounded-full flex items-center justify-center">
        <CheckCircleIcon className="size-6 text-blue-600" />
      </div>
    ),
    title: "Setup Complete",
    description:
      "Your organization setup is ready. What would you like to do next?",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Organization dialog with custom icon and success-themed content.",
      },
    },
  },
};

// Minimal Configuration
export const Minimal: Story = {
  args: {
    customizable: {
      showIcon: false,
      showDescription: false,
      showContinueOption: false,
      showCancelOption: false,
    },
    title: "Create Organization?",
  },
  parameters: {
    docs: {
      description: {
        story: "Minimal organization dialog with only title and create button.",
      },
    },
  },
};

// No Continue Option
export const NoContinueOption: Story = {
  args: {
    customizable: {
      showIcon: true,
      showDescription: true,
      showContinueOption: false,
      showCancelOption: true,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Organization dialog without the continue option, forcing user to create or cancel.",
      },
    },
  },
};

// No Cancel Option
export const NoCancelOption: Story = {
  args: {
    customizable: {
      showIcon: true,
      showDescription: true,
      showContinueOption: true,
      showCancelOption: false,
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Organization dialog without cancel option.",
      },
    },
  },
};

// Company Specific
export const CompanySpecific: Story = {
  args: {
    organizationName: "TechStartup Inc",
    icon: (
      <div className="size-12 bg-purple-100 rounded-full flex items-center justify-center">
        <Building2Icon className="size-6 text-purple-600" />
      </div>
    ),
    createButtonText: "Set up TechStartup Inc",
    continueButtonText: "Browse without organization",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Organization dialog customized for a specific company with branded styling.",
      },
    },
  },
};

// Interactive Demo
export const Interactive: Story = {
  args: {
    onCreateOrganization: () => {
      console.log("Create organization clicked");
    },
    onContinueWithoutOrganization: () => {
      console.log("Continue without organization clicked");
    },
    onCancel: () => {
      console.log("Cancel clicked");
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Fully interactive organization dialog with console logging. Try clicking the buttons to see the actions.",
      },
    },
  },
};

// Long Organization Name
export const LongOrganizationName: Story = {
  args: {
    organizationName:
      "Very Long Organization Name That Might Wrap to Multiple Lines in Some Cases",
  },
  parameters: {
    docs: {
      description: {
        story:
          "Organization dialog with a very long organization name to test text wrapping.",
      },
    },
  },
};

// Mobile Responsive
export const Mobile: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story:
          "Organization dialog optimized for mobile devices with responsive design.",
      },
    },
  },
};

// Dark Background
export const OnDarkBackground: Story = {
  args: {},
  decorators: [
    (Story) => (
      <div
        style={{
          backgroundColor: "#1f2937",
          padding: "40px",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Story />
      </div>
    ),
  ],
  parameters: {
    docs: {
      description: {
        story:
          "Organization dialog displayed on a dark background to test contrast and visibility.",
      },
    },
  },
};

// Error with Retry Action
export const ErrorWithRetry: Story = {
  render: (args) => {
    const [hasError, setHasError] = React.useState(true);
    const [isRetrying, setIsRetrying] = React.useState(false);

    const handleRetry = () => {
      setIsRetrying(true);
      setTimeout(() => {
        setHasError(false);
        setIsRetrying(false);
      }, 2000);
    };

    if (!hasError) {
      return (
        <Organization
          {...args}
          variant="creating"
          title="Organization Created!"
          description="Your organization has been successfully created."
        />
      );
    }

    return (
      <Organization
        {...args}
        hasError={hasError}
        isCreating={isRetrying}
        onCreateOrganization={handleRetry}
        createButtonText={isRetrying ? "Retrying..." : "Retry"}
        errorMessage="Failed to create organization. Network timeout occurred."
      />
    );
  },
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          "Organization dialog with error state and working retry functionality. Click retry to see the success state.",
      },
    },
  },
};

// Step by Step Flow
export const StepByStepFlow: Story = {
  render: (args) => {
    const [step, setStep] = React.useState<
      "not-found" | "creating" | "success"
    >("not-found");

    const handleCreate = () => {
      setStep("creating");
      setTimeout(() => {
        setStep("success");
      }, 3000);
    };

    const handleReset = () => {
      setStep("not-found");
    };

    switch (step) {
      case "creating":
        return <Organization {...args} variant="creating" />;
      case "success":
        return (
          <Organization
            {...args}
            title="Organization Created!"
            description="Your organization 'DataReel AI' has been successfully created. You can now start inviting team members."
            createButtonText="Continue to Dashboard"
            continueButtonText="Invite Team Members"
            cancelButtonText="Start Over"
            onCancel={handleReset}
            icon={
              <div className="size-12 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircleIcon className="size-6 text-green-600" />
              </div>
            }
          />
        );
      default:
        return (
          <Organization
            {...args}
            organizationName="DataReel AI"
            onCreateOrganization={handleCreate}
          />
        );
    }
  },
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          "Complete organization creation flow showing not-found → creating → success states.",
      },
    },
  },
};
