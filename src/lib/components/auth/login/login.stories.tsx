import type { Meta, StoryObj } from "@storybook/react-vite";
import { Login } from "./index";

const meta = {
  title: "Components/Auth/Login",
  component: Login,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A comprehensive login form component for Fynancial authentication with configurable options for email/password credentials, Google SSO, and forgot password functionality.",
      },
    },
  },
  tags: ["autodocs"],
  argTypes: {
    onSubmit: {
      description: "Callback function triggered when the form is submitted",
      action: "onSubmit",
    },
    onForgotPassword: {
      description:
        'Callback function triggered when "Forgot password?" link is clicked',
      action: "onForgotPassword",
    },
    onSSOLogin: {
      description:
        "Callback function triggered when an SSO provider is selected",
      action: "onSSOLogin",
    },
    isLoading: {
      description: "Shows loading state on interactive elements",
      control: { type: "boolean" },
    },
    loginOptions: {
      description:
        "Configuration object to control which login options are displayed",
      control: { type: "object" },
    },
    organisation: {
      description:
        "Organisation object with name and logo to customize the login form",
      control: { type: "object" },
    },
  },
} satisfies Meta<typeof Login>;

export default meta;
type Story = StoryObj<typeof meta>;

// Default story
export const Default: Story = {
  args: {},
  parameters: {
    docs: {
      description: {
        story: "The default login form with email/password authentication.",
      },
    },
  },
};

// Loading state story
export const Loading: Story = {
  args: {
    isLoading: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          "Login form in loading state with disabled interactive elements.",
      },
    },
  },
};

// With Google SSO story
export const WithGoogle: Story = {
  args: {
    loginOptions: {
      credentials: true,
      google: true,
      showForgotPassword: true,
    },
    onSSOLogin: (providerId: string) => {
      console.log("SSO Login with:", providerId);
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Login form with both email/password and Google SSO options available.",
      },
    },
  },
};

// Google Only story
export const GoogleOnly: Story = {
  args: {
    loginOptions: {
      credentials: false,
      google: true,
      showForgotPassword: false,
    },
    onSSOLogin: (providerId: string) => {
      console.log("SSO Login with:", providerId);
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Login form with only Google SSO option.",
      },
    },
  },
};

// Credentials Only story
export const CredentialsOnly: Story = {
  args: {
    loginOptions: {
      credentials: true,
      google: false,
      showForgotPassword: true,
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Login form with only email/password authentication.",
      },
    },
  },
};

// No Forgot Password story
export const NoForgotPassword: Story = {
  args: {
    loginOptions: {
      credentials: true,
      google: false,
      showForgotPassword: false,
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Login form without forgot password link.",
      },
    },
  },
};

// With Organisation Name story
export const WithOrganisation: Story = {
  args: {
    organisation: {
      name: "Fynancial",
    },
    loginOptions: {
      credentials: true,
      google: true,
      showForgotPassword: true,
    },
    onSSOLogin: (providerId: string) => {
      console.log("SSO Login with:", providerId);
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Login form customized with organisation name 'Fynancial'.",
      },
    },
  },
};

// Different Organisation story
export const DifferentOrganisation: Story = {
  args: {
    organisation: {
      name: "Acme Corp",
    },
    loginOptions: {
      credentials: true,
      google: true,
      showForgotPassword: true,
    },
    onSSOLogin: (providerId: string) => {
      console.log("SSO Login with:", providerId);
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Login form customized with organisation name 'Acme Corp'.",
      },
    },
  },
};

// With Organisation Logo story
export const WithOrganisationLogo: Story = {
  args: {
    organisation: {
      name: "TechCorp",
      logo: (
        <div className="size-16 bg-blue-500 rounded-full flex items-center justify-center">
          <svg
            className="size-8 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2L2 7V10C2 16 6 20.9 12 22C18 20.9 22 16 22 10V7L12 2Z" />
          </svg>
        </div>
      ),
    },
    loginOptions: {
      credentials: true,
      google: true,
      showForgotPassword: true,
    },
    onSSOLogin: (providerId: string) => {
      console.log("SSO Login with:", providerId);
    },
  },
  parameters: {
    docs: {
      description: {
        story: "Login form with custom organisation logo and name.",
      },
    },
  },
};

// Interactive demo story
export const Interactive: Story = {
  args: {
    onSubmit: (email: string, password: string, rememberMe: boolean) => {
      console.log("Login attempt:", { email, password, rememberMe });
    },
    onForgotPassword: () => {
      console.log("Forgot password clicked");
    },
    onRegularSignIn: () => {
      console.log("Regular sign-in clicked");
    },
    onSSOLogin: (providerId: string) => {
      console.log("SSO Login with:", providerId);
    },
    loginOptions: {
      credentials: true,
      google: true,
      showForgotPassword: true,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Fully interactive login form with console logging. Try filling out the form and submitting it.",
      },
    },
  },
};

// With pre-filled data story
export const WithTestData: Story = {
  render: (args) => {
    // Custom render to show form with test data
    return (
      <div>
        <div
          style={{
            marginBottom: "16px",
            padding: "12px",
            backgroundColor: "#f3f4f6",
            borderRadius: "8px",
            fontSize: "14px",
          }}
        >
          <strong>Test Credentials:</strong>
          <br />
          Email: test@fynancial.com
          <br />
          Password: password123
        </div>
        <Login {...args} />
      </div>
    );
  },
  args: {},
  parameters: {
    docs: {
      description: {
        story:
          "Login form with suggested test credentials displayed above for easy testing.",
      },
    },
  },
};

// Mobile responsive story
export const Mobile: Story = {
  args: {},
  parameters: {
    viewport: {
      defaultViewport: "mobile1",
    },
    docs: {
      description: {
        story:
          "Login form optimized for mobile devices with responsive design.",
      },
    },
  },
};

// Dark background story
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
          "Login form displayed on a dark background to test contrast and visibility.",
      },
    },
  },
};
