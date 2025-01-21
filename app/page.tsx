"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import {
  Camera,
  Upload,
  Car,
  CreditCard,
  FileText,
  Plus,
  X,
  File,
  ExternalLink,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type FileWithPreview = {
  file: File;
  preview?: string;
  type: "image" | "pdf";
};

type ApiResponse = {
  car?: any;
  eritesId?: any;
  drivingLicense?: any;
  error?: string;
};

export default function Home() {
  const [files, setFiles] = useState<FileWithPreview[]>([]);
  const [loading, setLoading] = useState(false);
  const [cameraOpen, setCameraOpen] = useState(false);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const { toast } = useToast();
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Check if the device has a camera
    if (navigator.mediaDevices && navigator.mediaDevices.enumerateDevices) {
      navigator.mediaDevices.enumerateDevices()
        .then(devices => {
          const videoInputDevices = devices.filter(device => device.kind === 'videoinput');
          setHasCamera(videoInputDevices.length > 0);
        })
        .catch(error => {
          console.error("Error checking for camera devices:", error);
        });
    } else {
      console.warn("MediaDevices API not supported.");
    }
  }, []);

  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    const droppedFiles = Array.from(e.dataTransfer.files);
    validateAndSetFiles(droppedFiles);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);
    validateAndSetFiles(selectedFiles);
    // Reset input value to allow selecting the same file again
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const validateAndSetFiles = (selectedFiles: File[]) => {
    const validTypes = ["application/pdf", "image/jpeg", "image/png"];
    const validFiles = selectedFiles.filter((file) =>
      validTypes.includes(file.type)
    );

    if (validFiles.length !== selectedFiles.length) {
      toast({
        title: "Invalid file type",
        description: "Please upload only PDF, JPG, or PNG files",
        variant: "destructive",
      });
    }

    const newFiles: FileWithPreview[] = validFiles.map((file) => ({
      file,
      type: file.type.startsWith("image/") ? "image" : "pdf",
      preview: file.type.startsWith("image/")
        ? URL.createObjectURL(file)
        : undefined,
    }));

    setFiles((prevFiles) => [...prevFiles, ...newFiles]);
  };

  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: true,
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
      setCameraOpen(true);
    } catch (error) {
      toast({
        title: "Camera Error",
        description: "Unable to access camera",
        variant: "destructive",
      });
    }
  };

  const capturePhoto = () => {
    if (videoRef.current) {
      const canvas = document.createElement("canvas");
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      canvas.getContext("2d")?.drawImage(videoRef.current, 0, 0);
      canvas.toBlob((blob) => {
        if (blob) {
          //@ts-ignore
          const file = new File([blob], "camera-photo.jpg", {
            type: "image/jpeg",
          });
          validateAndSetFiles([file]);
        }
      }, "image/jpeg");
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setCameraOpen(false);
  };

  const uploadToEndpoint = async (endpoint: string) => {
    setLoading(true);
    try {
      const formData = new FormData();
      files.forEach((fileObj, index) => {
        formData.append(`file${index}`, fileObj.file);
      });

      const response = await fetch(endpoint, {
        method: "POST",
        body: formData,
      });
      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Upload Successful",
          description: `Files uploaded to ${endpoint
            .split("/")
            .pop()} successfully`,
        });
        // Clear files after successful upload
        setFiles([]);
      } else {
        throw new Error(data.error || "Upload failed");
      }
    } catch (error) {
      toast({
        title: "Upload Failed",
        description: `Error uploading to ${endpoint}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const removeFile = (index: number) => {
    setFiles((prev) => {
      const newFiles = [...prev];
      // Revoke object URL if it exists
      if (newFiles[index].preview) {
        URL.revokeObjectURL(newFiles[index].preview);
      }
      newFiles.splice(index, 1);
      return newFiles;
    });
  };

  const clearAllFiles = () => {
    // Cleanup object URLs
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
  };

  const openPdfInNewTab = (file: File) => {
    const fileUrl = URL.createObjectURL(file);
    window.open(fileUrl, "_blank");
    // Clean up the URL after the window is opened
    URL.revokeObjectURL(fileUrl);
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Document Upload</h1>
            {files.length > 0 && (
              <Button variant="destructive" onClick={clearAllFiles} size="sm">
                Clear All
              </Button>
            )}
          </div>

          <div className="space-y-6">
            <div
              ref={dropZoneRef}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  Drag and drop your files here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to select files
                </p>
              </div>
              <div className="mt-4 flex gap-4 justify-center">
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Select Files
                </Button>
                <Input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  onChange={handleFileChange}
                  multiple
                  className="hidden"
                />
                {hasCamera && (
                  <Button onClick={() => startCamera()} variant="outline">
                    <Camera className="w-4 h-4 mr-2" />
                    Camera
                  </Button>
                )}
              </div>
            </div>

            {files.length > 0 && (
              <div className="space-y-6">
                {/* Images Section */}
                {files.some((f) => f.type === "image") && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">Images</h2>
                    <div className="grid grid-cols-2 gap-4">
                      {files.map(
                        (file, index) =>
                          file.type === "image" && (
                            <div key={index} className="relative group">
                              <img
                                src={file.preview}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-auto rounded-lg border border-border"
                              />
                              <Button
                                variant="destructive"
                                size="icon"
                                className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => removeFile(index)}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          )
                      )}
                    </div>
                  </div>
                )}

                {/* PDFs Section */}
                {files.some((f) => f.type === "pdf") && (
                  <div className="space-y-4">
                    <h2 className="text-lg font-semibold">PDF Documents</h2>
                    <div className="space-y-4">
                      {files.map(
                        (file, index) =>
                          file.type === "pdf" && (
                            <div
                              key={index}
                              className="flex items-center justify-between p-3 bg-muted rounded-lg group"
                            >
                              <div className="flex items-center gap-2">
                                <File className="w-4 h-4" />
                                <span className="text-sm">
                                  {file.file.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => openPdfInNewTab(file.file)}
                                >
                                  <ExternalLink className="w-4 h-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                                  onClick={() => removeFile(index)}
                                >
                                  <X className="w-4 h-4" />
                                </Button>
                              </div>
                            </div>
                          )
                      )}
                    </div>
                  </div>
                )}

                <div className="space-y-4">
                  <h2 className="text-lg font-semibold">Upload Options</h2>
                  <div className="flex flex-col gap-3">
                    <Button
                      onClick={() => uploadToEndpoint("/api/car")}
                      disabled={loading}
                      className="w-full"
                    >
                      <Car className="w-4 h-4 mr-2" />
                      Upload as Car Document
                    </Button>
                    <Button
                      onClick={() => uploadToEndpoint("/api/eritesId")}
                      disabled={loading}
                      className="w-full"
                    >
                      <CreditCard className="w-4 h-4 mr-2" />
                      Upload as Emirates ID
                    </Button>
                    <Button
                      onClick={() => uploadToEndpoint("/api/drivingLicess")}
                      disabled={loading}
                      className="w-full"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Upload as Driving License
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>

        <Dialog open={cameraOpen} onOpenChange={setCameraOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Take Photo</DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full rounded-lg"
              />
              <div className="mt-4 flex justify-end gap-4">
                <Button variant="outline" onClick={stopCamera}>
                  Cancel
                </Button>
                <Button onClick={capturePhoto}>Capture</Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
