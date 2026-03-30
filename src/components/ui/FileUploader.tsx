import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import JSZip from 'jszip';
import { useLanguage } from '../../context/LanguageContext';

interface FileUploaderProps {
  onFileLoad: (content: string, fileName: string, files?: File[]) => void;
}

export const FileUploader: React.FC<FileUploaderProps> = ({ onFileLoad }) => {
  const { t } = useLanguage();
  
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    for (const file of acceptedFiles) {
      if (file.name.endsWith('.zip')) {
        // Handle zip file
        try {
          console.log('Processing zip file:', file.name);
          const zip = new JSZip();
          const zipContent = await zip.loadAsync(file);
          
          // Find URDF files in the zip
          const urdfFiles: { name: string; content: string }[] = [];
          const allFiles: File[] = [];
          
          // Process all files in the zip
          for (const [, zipEntry] of Object.entries(zipContent.files)) {
            if (!zipEntry.dir) {
              // Read file content
              const content = await zipEntry.async('blob');
              const fileObject = new File([content], zipEntry.name, { type: content.type });
              allFiles.push(fileObject);
              
              // Check if it's a URDF file
              if (zipEntry.name.endsWith('.urdf') || zipEntry.name.endsWith('.xml')) {
                const textContent = await zipEntry.async('string');
                urdfFiles.push({ name: zipEntry.name, content: textContent });
              }
            }
          }
          
          // Use the first URDF file found
          if (urdfFiles.length > 0) {
            const urdfFile = urdfFiles[0];
            console.log('Found URDF file in zip:', urdfFile.name);
            onFileLoad(urdfFile.content, urdfFile.name, allFiles);
          } else {
            console.error('No URDF file found in zip');
            alert('No URDF file found in zip. Please include a .urdf or .xml file.');
          }
        } catch (error) {
          console.error('Error processing zip file:', error);
          alert('Error processing zip file. Please check the file and try again.');
        }
      } else if (file.name.endsWith('.urdf') || file.name.endsWith('.xml')) {
        // Handle individual URDF file
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          onFileLoad(content, file.name, acceptedFiles);
        };
        reader.readAsText(file);
      }
    }
  }, [onFileLoad]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'text/xml': ['.urdf', '.xml'],
      'application/zip': ['.zip'],
      'application/sla': ['.stl'],
    },
    multiple: true,
  });

  return (
    <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6">
      <div
        {...getRootProps()}
        className={`cursor-pointer transition-colors ${isDragActive ? 'bg-purple-50 dark:bg-purple-900/20 border-purple-400' : 'hover:bg-gray-50 dark:hover:bg-gray-700/50'}`}
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
              <span className="text-purple-600 dark:text-purple-400">{t.fileUploader.dropFile}</span>
            ) : (
              <>
                {t.fileUploader.dragDrop}{' '}
                <span className="text-purple-600 dark:text-purple-400">{t.fileUploader.browse}</span>
              </>
            )}
          </p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-500">
            {t.fileUploader.supports} <br />
            <span className="text-red-500">如urdf中有mesh文件，请打包成zip压缩包文件上传</span>
          </p>
        </div>
      </div>
    </div>
  );
};
