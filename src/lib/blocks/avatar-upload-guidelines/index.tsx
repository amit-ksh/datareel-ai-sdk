import React from "react";

export interface AvatarUploadGuidelinesProps {
  /** Optional custom wrapper class names */
  className?: string;
  /** Image source showing framing guidelines */
  imageSrc?: string;
  /** Alt text for the guidelines image */
  alt?: string;
}

/**
 * Environment-safe component (no next/image) that shows best-practice tips
 * for recording / uploading an avatar reference video.
 */
export const AvatarUploadGuidelines: React.FC<AvatarUploadGuidelinesProps> = ({
  className = "",
  imageSrc = "/avatar-upload-guidelines.png",
  alt = "Avatar crop guide showing proper framing",
}) => {
  return (
    <div
      className={`${className} rounded-lg border border-gray-100 bg-gray-50 p-4 shadow-sm`}
      role="region"
      aria-label="Avatar upload guidelines"
    >
      <h3 className="mb-2 mt-0 text-lg font-semibold text-gray-800">
        Guidelines
      </h3>

      <p className="mb-4 text-sm text-gray-600">
        Follow these tips to create a professional-looking avatar
      </p>

      <div className="mb-5 flex flex-col items-center justify-center rounded-md  bg-white p-3 text-center">
        {/* Standard <img> so the component works outside Next.js environments */}
        <img
          src={imageSrc}
          width={400}
          height={300}
          alt={alt}
          className="max-w-full rounded border border-dashed border-gray-300 p-2"
          loading="lazy"
        />
        <p className="mb-0 mt-2 text-xs text-gray-500">
          Ensure your face is centered in the frame
        </p>
      </div>

      <h4 className="mb-2 text-base font-medium text-gray-700">
        Setup Recommendations
      </h4>

      <ul className="m-0 mb-4 list-none space-y-3 p-0">
        <li className="flex items-start">
          <span className="mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-center text-blue-500">
            🎬
          </span>
          <span className="pt-1 text-sm leading-snug text-gray-600">
            Use a plain, neutral background (solid colors work best)
          </span>
        </li>
        <li className="flex items-start">
          <span className="mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-center text-blue-500">
            👤
          </span>
          <span className="pt-1 text-sm leading-snug text-gray-600">
            Position your face and shoulders in frame, leaving some space above
            your head
          </span>
        </li>
        <li className="flex items-start">
          <span className="mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-center text-blue-500">
            📏
          </span>
          <span className="pt-1 text-sm leading-snug text-gray-600">
            Keep camera at eye level, approximately 2-3 feet away
          </span>
        </li>
        <li className="flex items-start">
          <span className="mr-3 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-50 text-center text-blue-500">
            💡
          </span>
          <span className="pt-1 text-sm leading-snug text-gray-600">
            Ensure good, even lighting on your face (avoid harsh shadows)
          </span>
        </li>
      </ul>

      <div className="mt-3 border-t border-gray-100 pt-3 text-xs text-gray-500">
        For best results, use a good quality camera in a quiet environment.
      </div>
    </div>
  );
};
