# Datareel.ai UI SDK

A comprehensive React component library for building AI-powered video generation applications with Datareel.ai services.

## Features

- 🤖 **AI-Powered Components**: Pre-built components for video generation, avatar creation, and authentication
- ⚛️ **React 19**: Built with the latest React features and hooks
- 🎨 **Tailwind CSS**: Beautiful, responsive designs with customizable theming
- 🔧 **TypeScript**: Full type safety and excellent developer experience
- 📱 **Responsive**: Mobile-first design approach
- 🚀 **Easy Integration**: Simple setup with DatareelProvider context

## Installation

Install the library using npm or pnpm:

```bash
npm install @datareel-ai/sdk
# or
pnpm add @datareel-ai/sdk
```

You'll also need to install the required peer dependencies if they're not already in your project:

```bash
npm install react react-dom @tanstack/react-query
```

## Quick Start

### 1. Setup DatareelProvider

Wrap your app with the `DatareelProvider` to enable all Datareel functionality:

```tsx
import { DatareelProvider } from "@datareel-ai/sdk";
// Import global styles once near your root
import "@datareel-ai/sdk/styles.css";

function App() {
  return (
    <DatareelProvider
      apiKey="your-api-key"
      organisationId="your-org-id"
      brandColor="#3b82f6" // optional, hex color code only
    >
      <YourAppComponents />
    </DatareelProvider>
  );
}
```

### 2. Authentication Flow

Use the `Login` and `Organization` components for user authentication instead of the generic `AuthForm`:

```tsx
import { Login, Organization } from "@datareel-ai/sdk";
import { useState } from "react";

function AuthFlow() {
  const [currentStep, setCurrentStep] = useState<"login" | "organization">(
    "login"
  );
  const [userEmail, setUserEmail] = useState("");

  const handleLoginSubmit = async (
    email: string,
    password: string,
    rememberMe: boolean
  ) => {
    // Handle login logic
    setUserEmail(email);
    // If organization creation is needed, move to organization step
    setCurrentStep("organization");
  };

  const handleCreateOrganization = async () => {
    // Handle organization creation
    console.log("Creating organization for:", userEmail);
  };

  if (currentStep === "organization") {
    return (
      <Organization
        onCreateOrganization={handleCreateOrganization}
        onContinueWithoutOrganization={() =>
          console.log("Continue without org")
        }
        onCancel={() => setCurrentStep("login")}
        organizationName="Your Company"
      />
    );
  }

  return (
    <Login
      onSubmit={handleLoginSubmit}
      onForgotPassword={() => console.log("Forgot password")}
      onSSOLogin={(provider) => console.log("SSO login:", provider)}
      loginOptions={{
        credentials: true,
        google: true,
        showForgotPassword: true,
      }}
      organisation={{
        name: "Your Company",
        logo: <YourLogo />,
      }}
    />
  );
}
```

### 3. Video Creation Form

Use the `VideoCreateForm` block to let users create videos:

```tsx
import { VideoCreateForm } from "@datareel-ai/sdk";

function CreateVideoPage() {
  const handleVideoGenerate = async (videoId: string) => {
    console.log("Video generated with ID:", videoId);
    // Navigate to video player or handle success
  };

  const handleError = async (error: any) => {
    console.error("Video generation error:", error);
  };

  const handleCancel = () => {
    // Handle form cancellation
    console.log("User cancelled video creation");
  };

  return (
    <VideoCreateForm
      onVideoGenerate={handleVideoGenerate}
      onError={handleError}
      onCancel={handleCancel}
    />
  );
}
```

### 4. Video Player

Display generated videos with the `DatareelVideoPlayer`:

```tsx
import { DatareelVideoPlayer } from "@datareel-ai/sdk";

function VideoPlayerPage() {
  return (
    <DatareelVideoPlayer
      videoId="your-video-id"
      apiKey="your-api-key"
      organisationId="your-org-id"
    />
  );
}
```

## Advanced Usage

### Using the Datareel Context

Access the Datareel SDK directly using the `useDatareel` hook:

```tsx
import { useDatareel } from "@datareel-ai/sdk";

function CustomComponent() {
  const { datareel } = useDatareel();

  const handleCreateVideo = async () => {
    try {
      const result = await datareel.createVideo({
        // ...payload matching createVideo request
      } as any);
      console.log("Video created:", result);
    } catch (error) {
      console.error("Error:", error);
    }
  };

  return (
    <div>
      <button onClick={handleCreateVideo}>Create Video</button>
    </div>
  );
}
```

### Custom Styling

The library uses CSS custom properties for theming. The `DatareelProvider` automatically sets these variables:

```css
/* These are automatically set by DatareelProvider */
:root {
  --datareel-brand-color: #3b82f6;
  --datareel-brand-color-hover: /* automatically calculated */ ;
  --datareel-brand-color-light: /* automatically calculated */ ;
  --datareel-brand-color-ring: #3b82f6;
}

/* Use in your custom components */
.my-button {
  background-color: var(--datareel-brand-color);
  border-color: var(--datareel-brand-color);
}
```

## Complete Example

Here's a complete example showing authentication, video creation, playback and sharing:

```tsx
import React, { useState } from "react";
import {
  DatareelProvider,
  Login,
  Organization,
  VideoCreateForm,
  DatareelVideoPlayer,
  SharePanel,
  useVideoData,
} from "@datareel-ai/sdk";
import "@datareel-ai/sdk/styles.css";

type AppState = "auth" | "create" | "player";

function App() {
  const [currentView, setCurrentView] = useState<AppState>("auth");
  const [generatedVideoId, setGeneratedVideoId] = useState<string | null>(null);

  return (
    <DatareelProvider
      apiKey="your-api-key"
      organisationId="your-org-id"
      brandColor="#3b82f6"
    >
      {currentView === "auth" && (
        <AuthFlow onAuthSuccess={() => setCurrentView("create")} />
      )}

      {currentView === "create" && (
        <VideoCreateForm
          onVideoGenerate={async (videoId) => {
            setGeneratedVideoId(videoId);
            setCurrentView("player");
          }}
          onError={async (error) => console.error(error)}
          onCancel={() => setCurrentView("auth")}
        />
      )}

      {currentView === "player" && generatedVideoId && (
        <>
          <DatareelVideoPlayer
            videoId={generatedVideoId}
            apiKey="your-api-key"
            organisationId="your-org-id"
          />
          <div style={{ marginTop: 24 }}>
            <SharePanel videoId={generatedVideoId} />
          </div>
        </>
      )}
    </DatareelProvider>
  );
}

// AuthFlow component would be implemented as shown in the examples above
```

## Development

For library development and contributions:

### Prerequisites

- ♥️ [Node 22](https://nodejs.org/en/download)
- 📦 [pnpm](https://pnpm.io/) (run `corepack enable` to enable pnpm)

### Getting Started

1. Clone the repository
2. Install dependencies with `pnpm i`
3. Start development with `pnpm dev`

## Main Scripts

Always prepending pnpm:

- `dev`: Bootstrap the Storybook preview with Hot Reload.
- `build`: Builds the static storybook project.
- `build:lib`: Builds the component library into the **dist** folder.
- `lint`: Applies linting based on the rules defined in **biome.json**.
- `format`: Formats files using the biome rules defined in **biome.json**.
- `test`: Runs testing using watch mode.
- `test:cov`: Runs testing displaying a coverage report.

## Component Documentation

For detailed component documentation and examples, run the Storybook development server:

```bash
pnpm dev
```

This will start Storybook at `http://localhost:3000` where you can browse all available components, their props, and see live examples.

## Available Components & Hooks

### Blocks (High-level Components)

- `VideoCreateForm` - Complete video creation workflow
- `DatareelVideoPlayer` - Video player with controls and sharing
- `SharePanel` - Drop-in sharing UI (link + embed code) for a given videoId
- `CreateAvatarForm` - Avatar creation with upload/record options

### Hooks

- `useVideoData(videoId, { realtime?: boolean })` - Fetches & (optionally) live-updates video processing state, and provides share metadata (share URL, embed code, progress, components, etc.).

Example:

```tsx
import { useVideoData } from "@datareel-ai/sdk";

function VideoStatus({ videoId }: { videoId: string }) {
  const { video, shareData } = useVideoData(videoId);
  if (video.loading) return <p>Loading...</p>;
  if (video.error) return <p>Error loading video</p>;
  return (
    <div>
      <h4>{video.name}</h4>
      <p>Status: {video.status}</p>
      <p>Progress: {video.loadingStateHelpers.totalProgress.toFixed(0)}%</p>
      <a href={shareData.shareUrl} target="_blank">
        Open
      </a>
    </div>
  );
}
```

### Authentication Components

- `Login` - Login form with SSO support
- `Organization` - Organization creation/management

### UI Components

- Various form inputs, buttons, cards, and utility components
- All components are fully typed and documented in Storybook

## TypeScript Support

The library is built with TypeScript and provides full type definitions. Import types as needed:

```tsx
import type { Avatar, Pipeline, Voice } from "@datareel-ai/sdk";
```

## CSS Import

Don't forget to import the CSS file in your application (include it once, near your root):

```tsx
import "@datareel-ai/sdk/styles.css";
```

## Browser Support

This library supports all modern browsers that support ES2020+ features.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run `pnpm format` and `pnpm lint`
6. Submit a pull request

## License

Apache-2.0 © Datareel.ai. See [LICENSE](LICENSE) for full text.
