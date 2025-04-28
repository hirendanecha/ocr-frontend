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
  text: Record<string, string>;
  gpt_data: {
    combined: Record<
      string,
      {
        English: string;
        Arabic: string;
        Translation_Status: string;
      }
    >;
  };
  side_detection: {
    front: boolean;
    back: boolean;
  };
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
  const [apiResponse, setApiResponse] = useState<ApiResponseData | null>(null);
  const [copiedField, setCopiedField] = useState<string>("");
  const [textData, setTextData] = useState<Record<string, string> | null>(null); // New state for storing data.text

  //console.log(title);

  const validateAndSetFiles = (selectedFiles: File[]) => {
    console.log(selectedFiles, "selectedFiles");
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
          console.log(data);

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
    setLoading(true);
    try {
      const response = await fetch(`${baseURL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "application/json",
        },
        body: JSON.stringify(textData), // send as JSON
      });
  
      const data = await response.json();
  
      if (response.ok) {
        setApiResponse(data);
        toast({
          title: "Scan Successful",
          description: `Files uploaded to ${endpoint.split("/").pop()} successfully`,
        });
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

  const renderResponseSection = (
    data: Record<string, { English: string; Arabic: string } | number>,
    language: "English" | "Arabic"
  ) => {
    //console.log(data, "dddd");
    if (!data) {
      return null; // Or any other placeholder content
    }

    return (
      <div className="grid gap-4 md:grid-cols-2">
        {Object?.entries(data)?.map(([key, value]) => {
          // Handle the "confidence" key separately
          if (key === "confidence" && typeof value === "number") {
            return (
              <div key={key} className="p-4 bg-muted rounded-lg">
                <h3 className="font-medium text-sm text-muted-foreground mb-1">
                  Confidence
                </h3>
                <p className="text-lg font-semibold">{value}</p>
              </div>
            );
          }

          // Handle translation fields
          if (typeof value === "object" && value !== null) {
            const text = value[language] || "--";
            return (
              <div
                key={key}
                className="p-4 bg-muted rounded-lg hover:bg-muted/80 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-sm text-muted-foreground mb-1">
                      {key.replace(/_/g, " ")}
                    </h3>
                    <p
                      className="text-lg font-semibold overflow-hidden text-ellipsis whitespace-nowrap"
                      dir={language === "Arabic" ? "rtl" : "ltr"}
                    >
                      {text}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => copyToClipboard(text, `${key}-${language}`)}
                    className="h-8 w-8"
                  >
                    {copiedField === `${key}-${language}` ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
            );
          }

          return null; // Return null for any unexpected data types
        })}
      </div>
    );
  };

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
        {apiResponse?.gpt_data && (
          <Card className="p-6">
            <h2 className="text-2xl font-bold mb-6">Document Data</h2>
            <Tabs defaultValue="english" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="english">English</TabsTrigger>
                <TabsTrigger value="arabic">Arabic</TabsTrigger>
              </TabsList>
              <TabsContent value="english" className="mt-6">
                {renderResponseSection(
                  apiResponse?.gpt_data?.combined,
                  "English"
                )}
              </TabsContent>
              <TabsContent value="arabic" className="mt-6">
                {renderResponseSection(
                  apiResponse?.gpt_data?.combined,
                  "Arabic"
                )}
              </TabsContent>
            </Tabs>
          </Card>
        )}
      </div>
    </div>
  );
}
