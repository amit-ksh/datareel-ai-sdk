import React, { useState, useCallback } from "react";
import { DatareelProvider, useDatareel } from "../../context";
import { Login } from "../../components/auth/login";
import { Organization } from "../../components/auth/organization";

interface AuthFormProps {
  brandColor?: string;
  onAuthSuccess?: () => void;
  onAuthError?: (error: string) => void;
}

type AuthStep = "login" | "organization";

const AuthFormContent: React.FC<{
  onAuthSuccess?: () => void;
  onAuthError?: (error: string) => void;
}> = ({ onAuthSuccess, onAuthError }) => {
  const { datareel } = useDatareel();
  const [currentStep, setCurrentStep] = useState<AuthStep>("login");
  const [isLoading, setIsLoading] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  const handleLoginSubmit = useCallback(
    async (email: string, password: string, rememberMe: boolean) => {
      setIsLoading(true);
      setUserEmail(email);

      try {
        // Check if organization ID is present
        if (!datareel.organisationId) {
          // No organization ID, show organization creation step
          setCurrentStep("organization");
        } else {
          // Organization ID exists, proceed with login
          await datareel.login(email, password);
          onAuthSuccess?.();
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Login failed";
        onAuthError?.(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [datareel, onAuthSuccess, onAuthError]
  );

  const handleCreateOrganization = useCallback(async () => {
    if (!userEmail) return;

    setIsLoading(true);
    try {
      await datareel.initOrganisation(userEmail);
      onAuthSuccess?.();
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Organization creation failed";
      onAuthError?.(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, [datareel, userEmail, onAuthSuccess, onAuthError]);

  const handleCancelOrganization = useCallback(() => {
    setCurrentStep("login");
    setUserEmail("");
  }, []);

  const handleContinueWithoutOrganization = useCallback(() => {
    setCurrentStep("login");
    setUserEmail("");
  }, []);

  if (currentStep === "organization") {
    return (
      <Organization
        onCreateOrganization={handleCreateOrganization}
        onCancel={handleCancelOrganization}
        onContinueWithoutOrganization={handleContinueWithoutOrganization}
        isLoading={isLoading}
        organizationName="Your Organization"
        title="Create Organization"
        description="Would you like to create an organization for your account?"
      />
    );
  }

  return (
    <Login
      onSubmit={handleLoginSubmit}
      isLoading={isLoading}
      loginOptions={{
        credentials: true,
        google: false,
        showForgotPassword: true,
      }}
    />
  );
};

export const AuthForm: React.FC<AuthFormProps> = ({
  brandColor = "#3b82f6",
  onAuthSuccess,
  onAuthError,
}) => {
  return (
    <DatareelProvider
      secret="zBsBEtLn4PgIrj0CNEbHSGNQjhJGoyaAmTvQikqQlZ+K1yhMU7i4htz9MoUlap48Dwwknw+9WB8oMxWl"
      organisationId=""
      brandColor={brandColor}
    >
      <AuthFormContent
        onAuthSuccess={onAuthSuccess}
        onAuthError={onAuthError}
      />
    </DatareelProvider>
  );
};

export default AuthForm;
