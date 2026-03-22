import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

interface FileUploaderProps {
  onFileLoad: (content: string, fileName: string, files?: File[]) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileLoad }) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const content = e.target?.result as string;
        onFileLoad(content, file.name, acceptedFiles);
      };
      reader.readAsText(file);
    }
  }, [onFileLoad]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/xml': ['.urdf', '.xml'],
      'application/zip': ['.zip'],
    },
    multiple: false,
  });

  return (
    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
      <div
        {...getRootProps()}
        className={`cursor-pointer transition-colors ${
          isDragActive
            ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-400'
            : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'
        }`}
      >
        <input {...getInputProps()} />
        <div className="text-center">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            {isDragActive ? (
              <span className="text-purple-600 dark:text-purple-400">Drop the URDF file here</span>
            ) : (
              <>
                Drag and drop a URDF file here, or{' '}
                <span className="text-purple-600 dark:text-purple-400">browse</span>
              </>
            )}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            Supports .urdf, .xml, and .zip files
          </p>
        </div>
      </div>
    </div>
  );
};
