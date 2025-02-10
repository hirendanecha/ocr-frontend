"use client";

import { useState } from 'react';
// import { FileUploader } from '@/components/FileUploader';
import { Button } from '@/components/ui/button';

import { FileUploader } from '@/components/newfile/FileUploader';
import { useToast } from '@/hooks/use-toast';

export default function ScanPage() {
  const [files1, setFiles1] = useState<File[]>([]);
  const [files2, setFiles2] = useState<File[]>([]);
  const [files3, setFiles3] = useState<File[]>([]);
  const { toast } = useToast();

  const handleScanAll = async () => {
    // Create FormData instances for each uploader

    const baseURL = process.env.NEXT_PUBLIC_SERVER_URL;
    console.log(baseURL);
    const formData1 = new FormData();
    const formData2 = new FormData();
    const formData3 = new FormData();

    files1.forEach(file => formData1.append('files', file));
    files2.forEach(file => formData2.append('files', file));
    files3.forEach(file => formData3.append('files', file));

    try {
        const [res1, res2, res3] = await Promise.all([
            fetch(`${baseURL}/EmiratesIDCard`, { method: 'POST', body: formData1 }),
            fetch(`${baseURL}/car`, { method: 'POST', body: formData2 }),
            fetch(`${baseURL}/driving`, { method: 'POST', body: formData3 })
        ]);
    
        if (res1.ok && res2.ok && res3.ok) {
            toast({
                title: "Scan Successful",
                description: `Files uploaded successfully`,
            });
        } else {
            // toast({
            //     title: "Scan Failed",
            //     description: "Error scanning some files",
            //     variant: "destructive",
            // });
        }
    } catch (error) {
        toast({
            title: "Network Error",
            description: "Failed to connect to the server. Please try again later.",
            variant: "destructive",
        });
        console.error('Error:', error);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8 text-center">Document Scanner</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">EmiratesIDCard</h2>
          <FileUploader
            title="Upload Documents"
            accept={{
              'image/*': ['.png', '.jpg', '.jpeg'],
              'application/pdf': ['.pdf']
            }}
            maxFiles={2}
            maxSize={5}
            onFilesSelected={setFiles1}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">Car</h2>
          <FileUploader
            title="Upload Documents"
            accept={{
              'image/*': ['.png', '.jpg', '.jpeg'],
              'application/pdf': ['.pdf']
            }}
            maxFiles={2}
            maxSize={5}
            onFilesSelected={setFiles2}
          />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold mb-4">driving</h2>
          <FileUploader
            title="Upload Documents"
            accept={{
              'image/*': ['.png', '.jpg', '.jpeg'],
              'application/pdf': ['.pdf']
            }}
            maxFiles={2}
            maxSize={5}
            onFilesSelected={setFiles3}
          />
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <Button
          size="lg"
          onClick={handleScanAll}
          className="px-8"
        >
          Scan All Documents
        </Button>
      </div>
    </div>
  );
}