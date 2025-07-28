# Datareel Context

The `DatareelContext` provides a React context for managing Datareel SDK instances and organization-specific configuration.

## Features

- **Organization Management**: Set and access the current organization ID
- **Datareel SDK Instance**: Access a configured Datareel SDK instance
- **Brand Color CSS Variable**: Automatically sets a CSS custom property for consistent branding
- **React Hooks**: Easy-to-use hooks for accessing context values

## Usage

### Basic Setup

```tsx
import { DatareelProvider } from "datareel-ai-ui";

function App() {
  return (
    <DatareelProvider
      organisationId="your-org-id"
      brandColor="#3b82f6"
      secret="your-secret-key"
    >
      <YourAppComponents />
    </DatareelProvider>
  );
}
```

### Using the Context

```tsx
import { useDatareel } from "datareel-ai-ui";

function MyComponent() {
  const { organisation, datareel } = useDatareel();

  const handleGenerateVideo = async () => {
    try {
      const result = await datareel.generateVideo(
        "pipeline-id",
        {
          /* video config */
        },
        ["user@example.com"]
      );
      console.log("Video generated:", result);
    } catch (error) {
      console.error("Error generating video:", error);
    }
  };

  return (
    <div>
      <h2>Organization: {organisation}</h2>
      <button onClick={handleGenerateVideo}>Generate Video</button>
    </div>
  );
}
```

### Using the Brand Color CSS Variable

The context automatically sets a CSS custom property `--datareel-brand-color` that you can use in your styles:

```css
.my-button {
  background-color: var(--datareel-brand-color);
  border-color: var(--datareel-brand-color);
}
```

Or with inline styles:

```tsx
<div
  style={{
    backgroundColor: "var(--datareel-brand-color)",
    color: "white",
  }}
>
  Branded Element
</div>
```

## Props

### DatareelProvider Props

| Prop             | Type        | Required | Description                                           |
| ---------------- | ----------- | -------- | ----------------------------------------------------- |
| `organisationId` | `string`    | Yes      | The organization ID to use with the Datareel SDK      |
| `brandColor`     | `string`    | Yes      | The brand color (any valid CSS color value)           |
| `secret`         | `string`    | Yes      | The secret key for the Datareel SDK                   |
| `children`       | `ReactNode` | Yes      | Child components that will have access to the context |

## Return Values

### useDatareel Hook Returns

| Property       | Type       | Description                          |
| -------------- | ---------- | ------------------------------------ |
| `organisation` | `string`   | The current organization ID          |
| `datareel`     | `DataReel` | The configured Datareel SDK instance |

## Error Handling

The `useDatareel` hook will throw an error if used outside of a `DatareelProvider`:

```tsx
// ❌ This will throw an error
function ComponentOutsideProvider() {
  const { datareel } = useDatareel(); // Error: useDatareel must be used within a DatareelProvider
  return <div>...</div>;
}

// ✅ This is correct
function App() {
  return (
    <DatareelProvider
      organisationId="org-123"
      brandColor="#3b82f6"
      secret="secret"
    >
      <ComponentInsideProvider />
    </DatareelProvider>
  );
}
```

## Examples

### Dynamic Brand Color

```tsx
import { useState } from "react";
import { DatareelProvider } from "datareel-ai-ui";

function App() {
  const [brandColor, setBrandColor] = useState("#3b82f6");

  return (
    <DatareelProvider
      organisationId="org-123"
      brandColor={brandColor}
      secret="your-secret"
    >
      <input
        type="color"
        value={brandColor}
        onChange={(e) => setBrandColor(e.target.value)}
      />
      <YourComponents />
    </DatareelProvider>
  );
}
```

### Multiple Organizations

```tsx
function MultiOrgApp() {
  const [currentOrg, setCurrentOrg] = useState("org-1");

  return (
    <DatareelProvider
      organisationId={currentOrg}
      brandColor={getOrgBrandColor(currentOrg)}
      secret="your-secret"
    >
      <OrgSelector onOrgChange={setCurrentOrg} />
      <OrgSpecificContent />
    </DatareelProvider>
  );
}
```
