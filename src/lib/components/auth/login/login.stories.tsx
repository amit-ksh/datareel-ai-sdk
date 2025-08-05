import type { Meta, StoryObj } from "@storybook/react-vite";
import { Auth0Provider, useAuth0 } from "@auth0/auth0-react";
import { Login } from "./index";

const meta = {
  title: "Components/Auth/Login",
  component: Login,
  parameters: {
    layout: "centered",
    docs: {
      description: {
        component:
          "A comprehensive login form component for authentication with configurable options for email/password credentials, Google SSO, Auth0 OAuth, and forgot password functionality. Supports customizable organisation branding and multiple authentication flows.",
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
        "Callback function triggered when an SSO provider is selected. Provider ID will be 'google' or 'auth0'",
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
      auth0: false,
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

// With Auth0 OAuth story
export const WithAuth0: Story = {
  args: {
    loginOptions: {
      credentials: true,
      google: false,
      auth0: true,
      showForgotPassword: true,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Login form with email/password and Auth0 OAuth integration. Clicking 'Continue with Auth0' would redirect to Auth0 Universal Login in a real implementation.",
      },
    },
    Auth0: {
      auth0Domain: {
        description: "Auth0 domain (e.g., your-tenant.auth0.com)",
        control: { type: "text" },
        defaultValue: "your-tenant.auth0.com",
      },
      auth0ClientId: {
        description: "Auth0 client ID",
        control: { type: "text" },
        defaultValue: "your-auth0-client-id",
      },
      auth0RedirectUri: {
        description: "Auth0 redirect URI after authentication",
        control: { type: "text" },
        defaultValue:
          typeof window !== "undefined"
            ? window.location.origin
            : "http://localhost:6006",
      },
    },
  },
  decorators: [
    (Story, context) => {
      function Auth0Login() {
        const {
          isLoading,
          isAuthenticated,
          error,
          user,
          loginWithRedirect,
          logout,
        } = useAuth0();

        const handleSSOLogin = (providerId: string) => {
          console.log("SSO Login with:", providerId);
          if (providerId === "auth0") {
            loginWithRedirect();
          } else if (providerId === "google") {
            // Handle Google SSO login
            console.log("Google SSO Login triggered");
          }
        };

        context.args.onSSOLogin = handleSSOLogin;

        return <Story {...context.args} />;
      }

      return (
        <Auth0Provider
          domain={"domain"}
          clientId={"clientId"}
          authorizationParams={{
            redirect_uri: "http://localhost:6006",
          }}
        >
          <Auth0Login />
        </Auth0Provider>
      );
    },
  ],
};

// All SSO Options story
export const AllSSOOptions: Story = {
  args: {
    loginOptions: {
      credentials: true,
      google: true,
      auth0: true,
      showForgotPassword: true,
    },
    onSSOLogin: (providerId: string) => {
      console.log("SSO Login with:", providerId);
      if (providerId === "auth0") {
        alert("Redirecting to Auth0 Universal Login...");
      } else if (providerId === "google") {
        alert("Redirecting to Google OAuth...");
      }
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Login form with all authentication options: email/password, Google SSO, and Auth0 OAuth.",
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
      auth0: false,
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

// Auth0 Only story
export const Auth0Only: Story = {
  args: {
    loginOptions: {
      credentials: false,
      google: false,
      auth0: true,
      showForgotPassword: false,
    },
    onSSOLogin: (providerId: string) => {
      console.log("Auth0 OAuth Login with:", providerId);
      alert("Redirecting to Auth0 Universal Login...");
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Login form with only Auth0 OAuth option. This would redirect users directly to Auth0 Universal Login.",
      },
    },
  },
};

// SSO Only (Both providers) story
export const SSOOnly: Story = {
  args: {
    loginOptions: {
      credentials: false,
      google: true,
      auth0: true,
      showForgotPassword: false,
    },
    onSSOLogin: (providerId: string) => {
      console.log("SSO Login with:", providerId);
      if (providerId === "auth0") {
        alert("Redirecting to Auth0 Universal Login...");
      } else if (providerId === "google") {
        alert("Redirecting to Google OAuth...");
      }
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Login form with only SSO options (Google and Auth0), no email/password form.",
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
      auth0: false,
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
      auth0: false,
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
      auth0: true,
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
      auth0: true,
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
      auth0: true,
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
    onSSOLogin: (providerId: string) => {
      console.log("SSO Login with:", providerId);
    },
    loginOptions: {
      credentials: true,
      google: true,
      auth0: true,
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

// Auth0 Configuration Demo story
export const Auth0ConfigurationDemo: Story = {
  render: (args) => {
    const handleAuth0Login = (providerId: string) => {
      if (providerId === "auth0") {
        // Simulate Auth0 configuration parameters
        const auth0Config = {
          domain: "your-tenant.auth0.com",
          clientId: "your-client-id",
          redirectUri: window.location.origin + "/callback",
          audience: "your-api-identifier",
          scope: "openid profile email",
        };

        console.log("Auth0 Configuration:", auth0Config);
        alert(
          `Auth0 OAuth Configuration:\n\n` +
            `Domain: ${auth0Config.domain}\n` +
            `Client ID: ${auth0Config.clientId}\n` +
            `Redirect URI: ${auth0Config.redirectUri}\n` +
            `Audience: ${auth0Config.audience}\n` +
            `Scope: ${auth0Config.scope}\n\n` +
            `In a real implementation, this would redirect to Auth0 Universal Login.`
        );
      }
    };

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
          <strong>Auth0 Configuration Required:</strong>
          <br />
          • Domain: your-tenant.auth0.com
          <br />
          • Client ID: your-client-id
          <br />• Redirect URI: {window.location.origin}/callback
          <br />
          • Audience: your-api-identifier
          <br />• Scope: openid profile email
        </div>
        <Login {...args} onSSOLogin={handleAuth0Login} />
      </div>
    );
  },
  args: {
    loginOptions: {
      credentials: true,
      google: false,
      auth0: true,
      showForgotPassword: true,
    },
    organisation: {
      name: "Your App",
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Demonstrates Auth0 OAuth configuration parameters. Click 'Continue with Auth0' to see the required configuration values.",
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

// Auth0 Enterprise SSO Demo
export const Auth0EnterpriseSSO: Story = {
  args: {
    organisation: {
      name: "Enterprise Corp",
      logo: (
        <div className="size-16 bg-purple-500 rounded-full flex items-center justify-center">
          <svg
            className="size-8 text-white"
            fill="currentColor"
            viewBox="0 0 24 24"
          >
            <path d="M12 2C13.1 2 14 2.9 14 4C14 5.1 13.1 6 12 6C10.9 6 10 5.1 10 4C10 2.9 10.9 2 12 2ZM21 9V7L15 4V6C15 7.1 14.1 8 13 8S11 7.1 11 6V4L5 7V9C5 10.1 5.9 11 7 11S9 10.1 9 9C9 7.9 8.1 7 7 7S5 7.9 5 9V7L11 4V6C11 7.1 11.9 8 13 8S15 7.1 15 6V4L21 7V9Z" />
          </svg>
        </div>
      ),
    },
    loginOptions: {
      credentials: false,
      google: false,
      auth0: true,
      showForgotPassword: false,
    },
    onSSOLogin: (providerId: string) => {
      if (providerId === "auth0") {
        alert(
          "Enterprise SSO Flow:\n\n" +
            "1. Redirect to Auth0 Universal Login\n" +
            "2. User enters company email\n" +
            "3. Auth0 identifies corporate domain\n" +
            "4. Redirect to company SAML/OIDC IdP\n" +
            "5. User authenticates with company credentials\n" +
            "6. Return to your application with tokens\n\n" +
            "Configure enterprise connections in Auth0 Dashboard."
        );
      }
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Enterprise SSO scenario where Auth0 handles corporate identity provider integration (SAML, OIDC, LDAP).",
      },
    },
  },
};

// Auth0 Social + Enterprise Combined
export const Auth0FullConfiguration: Story = {
  render: (args) => {
    const handleAuth0FullFlow = (providerId: string) => {
      if (providerId === "auth0") {
        const fullConfig = {
          // Auth0 Configuration
          domain: "your-tenant.auth0.com",
          clientId: "your-client-id",
          redirectUri: window.location.origin + "/callback",

          // Authentication Settings
          audience: "your-api-identifier",
          scope: "openid profile email",

          // Connection Options
          connections: [
            "Username-Password-Authentication", // Database connection
            "google-oauth2", // Google social connection
            "github", // GitHub social connection
            "enterprise-saml", // Enterprise SAML connection
            "azure-ad", // Azure AD enterprise connection
          ],

          // UI Customization
          theme: {
            logo: "https://your-app.com/logo.png",
            primaryColor: "#10B981",
          },

          // Advanced Options
          allowSignUp: true,
          allowForgotPassword: true,
          initialScreen: "login", // or "signUp"
        };

        console.log("Complete Auth0 Configuration:", fullConfig);
        alert(
          `Complete Auth0 Setup:\n\n` +
            `🔧 Configuration:\n` +
            `Domain: ${fullConfig.domain}\n` +
            `Client ID: ${fullConfig.clientId}\n\n` +
            `🌐 Available Connections:\n` +
            `• ${fullConfig.connections.join("\n• ")}\n\n` +
            `🎨 UI Customization:\n` +
            `• Custom logo and branding\n` +
            `• Primary color: ${fullConfig.theme.primaryColor}\n\n` +
            `⚙️ Features:\n` +
            `• Social logins (Google, GitHub, etc.)\n` +
            `• Enterprise SSO (SAML, Azure AD)\n` +
            `• Database authentication\n` +
            `• Forgot password flow\n` +
            `• User registration`
        );
      }
    };

    return (
      <div>
        <div
          style={{
            marginBottom: "16px",
            padding: "12px",
            backgroundColor: "#ecfdf5",
            borderRadius: "8px",
            fontSize: "14px",
            border: "1px solid #10b981",
          }}
        >
          <strong>🚀 Complete Auth0 Integration Demo</strong>
          <br />
          This demonstrates a full Auth0 setup with social, enterprise, and
          database authentication options.
          <br />
          <br />
          <strong>Features Included:</strong>
          <br />
          • Social logins (Google, GitHub, etc.)
          <br />
          • Enterprise SSO (SAML, Azure AD, LDAP)
          <br />
          • Database authentication
          <br />
          • Custom branding and themes
          <br />• Forgot password flows
        </div>
        <Login {...args} onSSOLogin={handleAuth0FullFlow} />
      </div>
    );
  },
  args: {
    organisation: {
      name: "DataReel AI",
      logo: (
        <div className="size-16 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center">
          <svg
            className="size-10 text-white"
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
      auth0: true,
      showForgotPassword: true,
    },
  },
  parameters: {
    docs: {
      description: {
        story:
          "Complete Auth0 integration demo showing all authentication options and configuration details for a production-ready setup.",
      },
    },
  },
};
