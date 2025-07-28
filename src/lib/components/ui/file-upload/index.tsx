import type React from "react";
import { useCallback, useState } from "react";
import { Upload, X, FileIcon, AlertCircle } from "lucide-react";

export interface FileUploadProps {
  label: string;
  accept?: string;
  maxSize?: number; // in MB
  multiple?: boolean;
  onFileSelect?: (files: File[]) => void;
  onFileRemove?: (index: number) => void;
  error?: string;
  helperText?: string;
  disabled?: boolean;
  className?: string;
}

export const FileUpload: React.FC<FileUploadProps> = ({
  label,
  accept = "*",
  maxSize = 100,
  multiple = false,
  onFileSelect,
  onFileRemove,
  error,
  helperText,
  disabled = false,
  className = "",
}) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  const [localError, setLocalError] = useState<string>("");

  const validateFile = useCallback(
    (file: File): boolean => {
      // Check file size
      if (file.size > maxSize * 1024 * 1024) {
        setLocalError(`File size must be less than ${maxSize}MB`);
        return false;
      }

      // Check file type if accept is specified and not wildcard
      if (accept !== "*" && !accept.includes(file.type)) {
        setLocalError(`File type ${file.type} is not allowed`);
        return false;
      }

      setLocalError("");
      return true;
    },
    [maxSize, accept]
  );

  const handleFileSelect = useCallback(
    (files: FileList | null) => {
      if (!files) return;

      const fileArray = Array.from(files);
      const validFiles: File[] = [];

      for (const file of fileArray) {
        if (validateFile(file)) {
          validFiles.push(file);
        } else {
          return; // Stop if any file is invalid
        }
      }

      const newFiles = multiple
        ? [...selectedFiles, ...validFiles]
        : validFiles;
      setSelectedFiles(newFiles);
      onFileSelect?.(newFiles);
    },
    [selectedFiles, multiple, validateFile, onFileSelect]
  );

  const handleRemoveFile = useCallback(
    (index: number) => {
      const newFiles = selectedFiles.filter((_, i) => i !== index);
      setSelectedFiles(newFiles);
      onFileRemove?.(index);
      onFileSelect?.(newFiles);
    },
    [selectedFiles, onFileRemove, onFileSelect]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      if (!disabled) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragOver(false);
      if (!disabled) {
        handleFileSelect(e.dataTransfer.files);
      }
    },
    [disabled, handleFileSelect]
  );

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      handleFileSelect(e.target.files);
    },
    [handleFileSelect]
  );

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / k ** i).toFixed(2)) + " " + sizes[i];
  };

  const currentError = error || localError;

  return (
    <div className={`w-full ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {label}
      </label>

      <div
        className={`
          relative border-2 border-dashed rounded-lg p-6 text-center transition-colors
          ${isDragOver ? "border-brand bg-brand-light" : ""}
          ${currentError ? "border-red-300" : "border-gray-300"}
          ${
            disabled
              ? "opacity-50 cursor-not-allowed"
              : "cursor-pointer hover:border-brand hover:bg-brand-light"
          }
        `.trim()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept={accept}
          multiple={multiple}
          onChange={handleInputChange}
          disabled={disabled}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />

        <Upload className="mx-auto h-12 w-12 text-gray-400 mb-4" />

        <h3 className="text-lg font-medium text-gray-900 mb-2">
          Upload Your Video
        </h3>

        <p className="text-sm text-gray-500 mb-2">
          Upload a video file to create your custom avatar
        </p>

        <p className="text-xs text-gray-400">
          {accept === "*" ? "All files" : accept.split(",").join(", ")} up to{" "}
          {maxSize}MB
        </p>

        <button
          type="button"
          className="mt-4 inline-flex items-center px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 transition-colors"
          disabled={disabled}
        >
          <Upload className="w-4 h-4 mr-2" />
          Click to upload video
        </button>
      </div>

      {/* Selected Files */}
      {selectedFiles.length > 0 && (
        <div className="mt-4 space-y-2">
          {selectedFiles.map((file, index) => (
            <div
              key={`${file.name}-${index}`}
              className="flex items-center justify-between p-3 bg-gray-50 rounded-md"
            >
              <div className="flex items-center space-x-3">
                <FileIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              </div>

              {!disabled && (
                <button
                  type="button"
                  onClick={() => handleRemoveFile(index)}
                  className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Error Message */}
      {currentError && (
        <div className="mt-2 flex items-center space-x-1 text-sm text-red-600">
          <AlertCircle className="w-4 h-4" />
          <span>{currentError}</span>
        </div>
      )}

      {/* Helper Text */}
      {helperText && !currentError && (
        <p className="mt-2 text-sm text-gray-500">{helperText}</p>
      )}
    </div>
  );
};

FileUpload.displayName = "FileUpload";
