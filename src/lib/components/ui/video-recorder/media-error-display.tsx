import { Button } from "../button";
import { AlertTriangle, Settings, RefreshCw } from "lucide-react";

const Card = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`rounded-lg border bg-white shadow-sm ${className || ""}`}>
    {children}
  </div>
);

export interface MediaErrorDisplay {
  error?: {
    type: string;
    message: string;
  };
  stream: {
    current: MediaStream | null;
  };
  cameraConnected?: boolean;
  onRetry?: () => void;
  onRefresh?: () => void;
}

export const MediaErrorDisplay = ({
  error,
  stream,
  cameraConnected,
  onRetry,
  onRefresh,
}: MediaErrorDisplay) => {
  if (!error) return null;

  return (
    <div className="mb-6 space-y-4">
      {/* Section 1: Error Message */}
      <Card className="border-red-200 bg-red-50 p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
          <div>
            <h3 className="mb-1 text-red-700">
              {error.type === "permission_denied"
                ? "Permission Required"
                : error.type === "device_not_found"
                ? "Device Not Found"
                : error.type === "device_in_use"
                ? "Device Busy"
                : error.type === "security_error"
                ? "Security Error"
                : error.type === "browser_support"
                ? "Browser Not Supported"
                : "Recording Error"}
            </h3>
            <p className="text-red-600">
              {typeof error === "string" ? error : error.message}
            </p>
          </div>
        </div>
      </Card>

      {/* Section 3: How to Fix */}
      <Card className="border-blue-200 p-4">
        <div className="mb-4 flex items-center gap-2">
          <Settings className="h-4 w-4 text-tremor-brand-emphasis" />
          <p className="font-semibold text-tremor-brand-emphasis">
            How to Fix This
          </p>
        </div>

        {error.type === "permission_denied" && (
          <div className="mb-4">
            <div className="space-y-3 text-sm text-gray-700">
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                  1
                </span>
                <span>
                  Click the camera/microphone icon in your browser&apos;s
                  address bar
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                  2
                </span>
                <span>
                  Select &quot;Allow&quot; for camera and microphone permissions
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                  3
                </span>
                <span>
                  If blocked, click the settings/lock icon and change
                  permissions to &quot;Allow&quot;
                </span>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-100 text-xs font-semibold text-blue-600">
                  4
                </span>
                <span>Refresh the page after changing permissions</span>
              </div>
            </div>
          </div>
        )}

        {error.type === "device_not_found" && (
          <div className="mb-4">
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>
                  Ensure your camera and/or microphone is properly connected
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Check device drivers are installed and up to date</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Try disconnecting and reconnecting your devices</span>
              </div>
            </div>
          </div>
        )}

        {error.type === "device_in_use" && (
          <div className="mb-4">
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>
                  Close other video calling apps (Zoom, Teams, Skype, etc.)
                </span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Close other browser tabs using camera/microphone</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>Restart your browser if the issue persists</span>
              </div>
            </div>
          </div>
        )}

        {error.type === "security_error" && (
          <div className="mb-4">
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>This feature requires a secure connection (HTTPS)</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="text-blue-600">•</span>
                <span>
                  Please access the site using https:// instead of http://
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col items-center gap-2 sm:flex-row">
          <Button
            type="button"
            size="sm"
            onClick={onRetry}
            leftIcon={<RefreshCw className="h-4 w-4" />}
            className={error.type === "permission_denied" ? "flex-1" : ""}
          >
            Try Again
          </Button>

          {error.type === "permission_denied" && onRefresh && (
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={onRefresh}
              leftIcon={<RefreshCw className="h-4 w-4" />}
              className="flex-1"
            >
              Refresh Page
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};
