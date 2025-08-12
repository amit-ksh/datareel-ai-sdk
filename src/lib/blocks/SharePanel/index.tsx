import React from "react";
import {
  Share2,
  Copy,
  CheckCircle,
  Mail,
  MessageCircle,
  LinkIcon,
} from "lucide-react";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { useVideoData } from "../../hooks/use-video-data";

interface SharePanelProps {
  videoId: string;
  className?: string;
}

export const SharePanel: React.FC<SharePanelProps> = ({
  videoId,
  className = "",
}) => {
  const { shareData } = useVideoData(videoId, { realtime: false });
  const { shareUrl, embedCode, copied, copyToClipboard } = shareData;

  return (
    <div className={`h-fit relative bg-white ${className}`}>
      <div className="flex bg-gray-50 items-center space-x-3  p-4">
        <div className="w-10 h-10 bg-brand/10 rounded-lg flex items-center justify-center">
          <Share2 className="w-5 h-5 text-gray-900" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Share Your Video
          </h3>
          <p className="text-sm text-gray-500">
            Share via link or embed on your website
          </p>
        </div>
      </div>

      {/* Share Icons */}
      <div className="flex justify-center space-x-3 p-4">
        <button
          className="w-12 h-12 cursor-pointer bg-blue-500 hover:bg-blue-600 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
          onClick={() =>
            window.open(
              `mailto:?subject=Check out this video&body=${shareUrl}`,
              "_blank"
            )
          }
        >
          <Mail className="w-5 h-5 text-white" />
        </button>
        <button
          className="w-12 h-12 cursor-pointer bg-green-500 hover:bg-green-600 rounded-xl flex items-center justify-center transition-all duration-200 hover:scale-105"
          onClick={() =>
            window.open(
              `https://wa.me/?text=${encodeURIComponent(shareUrl)}`,
              "_blank"
            )
          }
        >
          <MessageCircle className="w-5 h-5 text-white" />
        </button>
      </div>

      {/* Share URL */}
      <div className="space-y-4 p-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Share Link
          </label>
          <div className="flex space-x-2 items-center">
            <Input
              value={shareUrl}
              readOnly
              className="flex-1 bg-gray-50 border-gray-200"
              label=""
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            onClick={() => copyToClipboard(shareUrl, "url")}
            leftIcon={
              copied.url ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )
            }
          >
            {copied.url ? "Copied!" : "Copy Link"}
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={() => copyToClipboard(embedCode, "embed")}
            leftIcon={
              copied.embed ? (
                <CheckCircle className="w-4 h-4" />
              ) : (
                <Copy className="w-4 h-4" />
              )
            }
          >
            {copied.embed ? "Copied!" : "Copy Embed Code"}
          </Button>
        </div>

        {/* Embed Code Section */}
        <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 space-y-3">
          <div className="flex items-center gap-2">
            <LinkIcon className="w-4 h-4 text-gray-500" />
            <label className="block text-sm font-medium text-gray-700">
              Embed Code Preview
            </label>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap break-all">
              {embedCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
