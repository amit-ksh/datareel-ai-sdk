import { LoaderCircleIcon } from "lucide-react";
import type React from "react";
import { useState } from "react";
import { Input } from "../../ui/input";

export interface Organisation {
  name?: string;
  logo?: React.ReactNode;
}

export interface LoginOptions {
  credentials?: boolean;
  google?: boolean;
  auth0?: boolean;
  showForgotPassword?: boolean;
}

export interface LoginProps {
  onSubmit?: (email: string, password: string, rememberMe: boolean) => void;
  onForgotPassword?: () => void;
  onSSOLogin?: (providerId: string) => void;
  isLoading?: boolean;
  loginOptions?: LoginOptions;
  organisation?: Organisation;
}

export const Login = ({
  onSubmit,
  onForgotPassword,
  onSSOLogin,
  isLoading = false,
  loginOptions = {
    credentials: true,
    google: false,
    auth0: false,
    showForgotPassword: true,
  },
  organisation,
}: LoginProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSubmit) {
      onSubmit(email, password, rememberMe);
    }
  };

  return (
    <div className="max-w-md w-[448px] mx-auto bg-white rounded-lg shadow-lg p-8">
      {/* Logo and Title */}
      <div className="text-center mb-8">
        {organisation?.logo && (
          <div className="size-16 flex items-center justify-center mx-auto mb-4">
            {organisation.logo}
          </div>
        )}

        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {organisation?.name ? `${organisation.name} Sign In` : "Sign In"}
        </h1>
        <p className="text-gray-600">
          {organisation?.name
            ? `Sign in with your ${organisation.name} account`
            : "Sign in to your account"}
        </p>
      </div>

      {/* Form */}
      {loginOptions.credentials && (
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Field */}
          <Input
            id="email"
            type="email"
            label={organisation?.name ? `${organisation.name} Email` : "Email"}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={
              organisation?.name
                ? `Enter your ${organisation.name} email`
                : "Enter your email"
            }
            leftIcon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 4H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
              </svg>
            }
            required
          />

          {/* Password Field */}
          <Input
            id="password"
            type={showPassword ? "text" : "password"}
            label={
              organisation?.name ? `${organisation.name} Password` : "Password"
            }
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={
              organisation?.name
                ? `Enter your ${organisation.name} password`
                : "Enter your password"
            }
            leftIcon={
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
              </svg>
            }
            rightIcon={
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z" />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z" />
                  </svg>
                )}
              </button>
            }
            required
          />

          {/* Remember Me and Forgot Password */}
          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              />
              <span className="ml-2 text-sm text-gray-700">Remember me</span>
            </label>
            {loginOptions.showForgotPassword && (
              <button
                type="button"
                onClick={onForgotPassword}
                className="text-sm text-green-600 hover:text-green-500 font-medium"
              >
                Forgot password?
              </button>
            )}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-4 bg-green-500 text-white py-3 px-4 rounded-md hover:bg-green-600 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading && <LoaderCircleIcon className="animate-spin size-5" />}
            {isLoading
              ? "Signing in..."
              : organisation?.name
              ? `Sign in with ${organisation.name}`
              : "Sign in"}
          </button>
        </form>
      )}

      {/* SSO Options */}
      {(loginOptions.google || loginOptions.auth0) && (
        <div className={loginOptions.credentials ? "mt-6" : ""}>
          {loginOptions.credentials && (
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">
                  Or continue with
                </span>
              </div>
            </div>
          )}

          <div
            className={`space-y-3 ${loginOptions.credentials ? "mt-6" : ""}`}
          >
            {/* Google SSO */}
            {loginOptions.google && (
              <button
                type="button"
                onClick={() => onSSOLogin?.("google")}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>
            )}

            {/* Auth0 SSO */}
            {loginOptions.auth0 && (
              <button
                type="button"
                onClick={() => onSSOLogin?.("auth0")}
                disabled={isLoading}
                className="w-full flex items-center justify-center px-4 py-3 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg
                  fill="currentColor"
                  viewBox="0 0 53 64"
                  className="size-5 mr-4"
                >
                  <path d="M3.372 27.782c10.475-1.728 18.686-10.4 20.407-20.892l.577-5.043c.143-.802-.4-1.918-1.412-1.838C15.03.628 7.56 3.243 3.406 4.943A5.488 5.488 0 000 10.027v16.451c0 .973.874 1.717 1.834 1.563l1.538-.252v-.006zM28.831 6.89c1.726 10.492 9.938 19.164 20.407 20.893l1.537.252c.96.16 1.835-.584 1.835-1.563v-16.45a5.488 5.488 0 00-3.406-5.084C45.044 3.232 37.58.622 29.666.004c-1.018-.08-1.538 1.048-1.418 1.837l.577 5.043.006.006zM49.23 32.39C34.915 35.219 28.27 44.75 28.27 62.79c0 .905.897 1.535 1.651 1.031 6.584-4.447 21.07-16.056 22.562-30.577.057-1.826-2.223-.968-3.252-.853zM3.377 32.39c14.315 2.828 20.961 12.359 20.961 30.4 0 .905-.897 1.535-1.651 1.031C16.103 59.374 1.617 47.765.125 33.244c-.057-1.826 2.223-.968 3.252-.853z"></path>
                </svg>
                Continue with Auth0
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
