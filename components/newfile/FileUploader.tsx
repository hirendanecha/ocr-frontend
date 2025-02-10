"use client";

import { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, FileText, Image as ImageIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploaderProps {
  title: string;
  accept: {
    [key: string]: string[];
  };
  maxFiles: number;
  maxSize: number;
  onFilesSelected: (files: File[]) => void;
}

export function FileUploader({ title, accept, maxFiles, maxSize, onFilesSelected }: FileUploaderProps) {
  const [files, setFiles] = useState<File[]>([]);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (files.length + acceptedFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }
    
    const newFiles = [...files, ...acceptedFiles];
    setFiles(newFiles);
    onFilesSelected(newFiles);
  }, [files, maxFiles, onFilesSelected]);

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onFilesSelected(newFiles);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxSize: maxSize * 1024 * 1024, // Convert MB to bytes
    maxFiles,
  });

  return (
    <div className="w-full">
      <div
        {...getRootProps()}
        className={cn(
          "border-2 border-dashed rounded-lg p-6 cursor-pointer transition-colors",
          isDragActive ? "border-primary bg-primary/10" : "border-gray-300 hover:border-primary",
          "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
        )}
      >
        <input {...getInputProps()} />
        <div className="flex flex-col items-center justify-center space-y-2 text-center">
          <Upload className="h-8 w-8 text-gray-400" />
          <h3 className="text-lg font-semibold">{title}</h3>
          <p className="text-sm text-gray-500">
            Drag & drop files here, or click to select files
          </p>
          <p className="text-xs text-gray-400">
            Max {maxFiles} files. Max size: {maxSize}MB each
          </p>
        </div>
      </div>

      {files.length > 0 && (
        <div className="mt-4 space-y-2">
          {files.map((file, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
            >
              <div className="flex items-center space-x-2">
                {file.type.includes('image') ? (
                  <ImageIcon className="h-5 w-5 text-gray-400" />
                ) : (
                  <FileText className="h-5 w-5 text-gray-400" />
                )}
                <span className="text-sm truncate max-w-[200px]">{file.name}</span>
              </div>
              <button
                onClick={() => removeFile(index)}
                className="p-1 hover:bg-gray-200 rounded-full"
              >
                <X className="h-4 w-4 text-gray-500" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}