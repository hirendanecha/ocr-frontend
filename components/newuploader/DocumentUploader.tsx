"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
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
  Copy,
  Check,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
import LoadingOverlay from "../Loader/LoadingOverlay";

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

type ApiResponseData = {
  verification: {
    isAuthentic: boolean;
    confidenceLevel: string;
    reasoning: string;
    identifiedElements: string[];
    fontConsistency: boolean;
    concerns: string[];
  };
  extractedData: Record<string, { english: string; arabic: string }>;
};

export default function DocumentUploader({ title }: { title: string }) {
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
  const [apiResponse, setApiResponse] = useState<any | null>(null);
  const [copiedField, setCopiedField] = useState<string>("");
  const [textData, setTextData] = useState<Record<string, string> | null>(null); // New state for storing data.text

  //console.log(title);

  const validateAndSetFiles = (selectedFiles: File[]) => {
   // console.log(selectedFiles, "selectedFiles");
    toast({
      title: "File Limit Exceeded",
      description: "You can only upload a maximum of two files",
      variant: "destructive",
    });

    const validTypes = ["application/pdf", "image/heic", "image/heif"];
    const validFiles = selectedFiles.filter((file) => {
      const fileType = file.type || getFileExtensionType(file.name);
      return validTypes.includes(fileType) || fileType.startsWith("image/");
    });

    if (validFiles.length !== selectedFiles.length) {
      toast({
        title: "Invalid file type",
        description: "Please upload only PDF or image files",
        variant: "destructive",
      });
    }

    // Check if adding these files would exceed the limit
    if (files.length + validFiles.length > 2) {
      toast({
        title: "File Limit Exceeded",
        description: "You can only upload a maximum of two files",
        variant: "destructive",
      });
      return;
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

  const getFileExtensionType = (fileName: string): string => {
    const extension = fileName.split(".").pop()?.toLowerCase();
    switch (extension) {
      case "heic":
      case "heif":
        return "image/heic";
      case "pdf":
        return "application/pdf";
      // Add more cases as needed
      default:
        return "";
    }
  };

  //console.log(apiResponse);

  // const { getRootProps, getInputProps, isDragActive } = useDropzone({
  //   onDrop: (acceptedFiles, fileRejections) => {
  //     // Validate and set files
  //     const validFiles = acceptedFiles.filter((file) => {
  //       const fileType = file.type || getFileExtensionType(file.name);
  //       return (
  //         ["application/pdf", "image/heic", "image/heif"].includes(fileType) ||
  //         fileType.startsWith("image/")
  //       );
  //     });

  //     if (files.length + validFiles.length > 2) {
  //       toast({
  //         title: "File Limit Exceeded",
  //         description: "You can only upload a maximum of two files.",
  //         variant: "destructive",
  //       });
  //       return;
  //     }

  //     // Add valid files
  //     const newFiles = validFiles.map((file) => ({
  //       file,
  //       type: file.type.startsWith("image/") ? "image" : "pdf",
  //       preview: file.type.startsWith("image/")
  //         ? URL.createObjectURL(file)
  //         : undefined,
  //     }));

  //     //@ts-ignore
  //     setFiles((prev) => [...prev, ...newFiles]);

  //     // Handle rejected files
  //     fileRejections.forEach((rejection) => {
  //       rejection.errors.forEach((error) => {
  //         toast({
  //           title: "File Rejected",
  //           description: `${rejection.file.name}: ${error.message}`,
  //           variant: "destructive",
  //         });
  //       });
  //     });
  //   },
  //   accept: {
  //     "image/*": [],
  //     "application/pdf": [],
  //   },
  //   multiple: true,
  //   maxSize: 10 * 1024 * 1024, // 10 MB limit
  //   onDragEnter: () => setIsDragging(true),
  //   onDragLeave: () => setIsDragging(false),
  //   onDragOver: () => setIsDragging(true),
  //   onDropAccepted: () => setIsDragging(false),
  //   onDropRejected: () => setIsDragging(false),
  // });

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: async (acceptedFiles, fileRejections) => {
      const validFiles = acceptedFiles.filter((file) => {
        const fileType = file.type || getFileExtensionType(file.name);
        return (
          ["application/pdf", "image/heic", "image/heif"].includes(fileType) ||
          fileType.startsWith("image/")
        );
      });

      if (files.length + validFiles.length > 2) {
        toast({
          title: "File Limit Exceeded",
          description: "You can only upload a maximum of two files.",
          variant: "destructive",
        });
        return;
      }

      const newFiles = validFiles.map((file) => ({
        file,
        type: file.type.startsWith("image/") ? "image" : "pdf",
        preview: file.type.startsWith("image/")
          ? URL.createObjectURL(file)
          : undefined,
      }));
      //@ts-ignore
      setFiles((prev) => [...prev, ...newFiles]);

      fileRejections.forEach((rejection) => {
        rejection.errors.forEach((error) => {
          toast({
            title: "File Rejected",
            description: `${rejection.file.name}: ${error.message}`,
            variant: "destructive",
          });
        });
      });

      let endpoint = "";
      if (title === "Vehicle Registration") {
        endpoint = "/car-detection";
      } else if (title === "Emirates Card") {
        endpoint = "/EmiratesIDCard-detection";
      } else if (title === "Driving Licence") {
        endpoint = "/driving-detection";
      }

      if (endpoint) {
        const formData = new FormData();
        [...files, ...newFiles].forEach((fileObj) => {
          formData.append("files", fileObj.file);
        });

        try {
          const baseURL = process.env.NEXT_PUBLIC_SERVER_URL;
          const response = await fetch(`${baseURL}${endpoint}`, {
            method: "POST",
            headers: {
              accept: "application/json",
            },
            body: formData,
          });

          const data = await response.json();
         // console.log(data);

          if (response.ok) {
            toast({
              title: "Upload Successful",
              description: "File uploaded successfully.",
            });
            setApiResponse(data);
            setTextData(data.text);
          } else {
            throw new Error(data.error || "Upload failed");
          }
        } catch (error) {
          toast({
            title: "Upload Failed",
            description: `${error}`,
            variant: "destructive",
          });
        }
      }
    },
    accept: {
      "image/*": [],
      "application/pdf": [],
    },
    multiple: true,
    maxSize: 10 * 1024 * 1024, // 10 MB limit
    onDragEnter: () => setIsDragging(true),
    onDragLeave: () => setIsDragging(false),
    onDragOver: () => setIsDragging(true),
    onDropAccepted: () => setIsDragging(false),
    onDropRejected: () => setIsDragging(false),
  });

  const uploadToEndpoint = async (endpoint: string, textData: any) => {
    const baseURL = process.env.NEXT_PUBLIC_SERVER_URL;
   // console.log(baseURL);

    setLoading(true);
    try {
      const formData = new FormData();
      console.log("i am file:-", files);

      files.forEach((fileObj, index) => {
        formData.append(`files`, fileObj.file); // Ensure the key matches the expected parameter in FastAPI
      });

      const response = await fetch(`${baseURL}${endpoint}`, {
        method: "POST",
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setApiResponse(data);
        toast({
          title: "Scan Successful",
          description: `Files uploaded to ${endpoint
            .split("/")
            .pop()} successfully`,
        });
        // Clear files after successful upload
        //setFiles([]);
      } else {
        throw new Error(data.error || "Scan failed");
      }
    } catch (error) {
      toast({
        title: "Scan Failed",
        description: `${error}`,
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
    setApiResponse(null);
  };

  const openPdfInNewTab = (file: File) => {
    const fileUrl = URL.createObjectURL(file);
    window.open(fileUrl, "_blank");
    // Clean up the URL after the window is opened
    URL.revokeObjectURL(fileUrl);
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(""), 2000);
    toast({
      title: "Copied!",
      description: "Text copied to clipboard",
    });
  };

  const renderResponseSection = (results: Record<string, any>) => {
    if (!results) {
      return <p>No data available</p>;
    }

    return (
      <div className="space-y-8">
        {Object.entries(results).map(([fileName, data]) => (
          <div key={fileName} className="p-4 bg-muted rounded-lg">
            <h3 className="font-medium text-lg mb-4">{fileName}</h3>

            {/* Verification Details */}
            {data.verification && (
              <div className="mb-4">
                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                  Verification
                </h4>
                <p className="text-lg font-semibold">
                  Authentic: {data.verification.isAuthentic ? "Yes" : "No"}
                </p>
                <p className="text-lg font-semibold">
                  Confidence Level: {data.verification.confidenceLevel}
                </p>
                <p className="text-lg font-semibold">
                  Reasoning: {data.verification.reasoning}
                </p>
                <p className="text-lg font-semibold">
                  Concerns: {data.verification.concerns.join(", ")}
                </p>
              </div>
            )}

            {/* Extracted Data */}
            {data.extractedData && (
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-1">
                  Extracted Data
                </h4>
                {Object.entries(data.extractedData).map(([key, value]) => {
                  const { english, arabic } = value as {
                    english: string;
                    arabic: string;
                  };
                  return (
                    <div key={key} className="mb-2">
                      <h5 className="font-medium text-sm text-muted-foreground">
                        {key.replace(/_/g, " ")}
                      </h5>
                      <p className="text-lg font-semibold">
                        English: {english || "--"}
                      </p>
                      <p className="text-lg font-semibold">
                        Arabic: {arabic || "--"}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  // console.log("aiResponse", apiResponse);

  return (
    <div className="bg-background p-8 relative">
      <LoadingOverlay isLoading={loading} />
      <div className="max-w-2xl mx-auto space-y-8">
        <Card className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Upload {title}</h1>
            {files.length > 0 && (
              <Button variant="destructive" onClick={clearAllFiles} size="sm">
                Clear All
              </Button>
            )}
          </div>

          <div className="space-y-6">
            <div
              {...getRootProps()}
              className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                isDragActive
                  ? "border-primary bg-primary/5"
                  : "border-border hover:border-primary/50"
              }`}
            >
              <input {...getInputProps()} />
              <Upload className="w-10 h-10 mx-auto mb-4 text-muted-foreground" />
              <div className="space-y-2">
                <p className="text-lg font-medium">
                  Drag and drop your files here
                </p>
                <p className="text-sm text-muted-foreground">
                  or click to select files
                </p>
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  variant="outline"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Select Files
                </Button>
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
                  <div className="flex flex-col gap-3">
                    {title === "Vehicle Registration" && (
                      <Button
                        onClick={() => uploadToEndpoint("/carllm", textData)}
                        disabled={loading}
                        className="w-full"
                      >
                        <Car className="w-4 h-4 mr-2" />
                        Scan
                      </Button>
                    )}
                    {title === "Emirates Card" && (
                      <Button
                        onClick={() =>
                          uploadToEndpoint("/EmiratesIDCardllm", textData)
                        }
                        disabled={loading}
                        className="w-full"
                      >
                        <CreditCard className="w-4 h-4 mr-2" />
                        Scan
                      </Button>
                    )}
                    {title === "Driving Licence" && (
                      <Button
                        onClick={() =>
                          uploadToEndpoint("/drivingllm", textData)
                        }
                        disabled={loading}
                        className="w-full"
                      >
                        <FileText className="w-4 h-4 mr-2" />
                        Scan
                      </Button>
                    )}
                    {title === "new-car 4.1" && (
                      <Button
                        onClick={() => uploadToEndpoint("/car-new22", textData)}
                        disabled={loading}
                        className="w-full"
                      >
                        <Car className="w-4 h-4 mr-2" />
                        Scan
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </Card>
        {apiResponse && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Document Data</h2>
            {renderResponseSection(apiResponse.results)}
          </Card>
        )}
      </div>
    </div>
  );
}
