"use client";

import * as React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Upload } from "lucide-react";

interface ResumeUploadProps {
  onFileUpload: (file: File) => Promise<void>;
}

export function ResumeUpload({ onFileUpload }: ResumeUploadProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = React.useState<string | null>(null);

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFileName(file.name);
      try {
        await onFileUpload(file);
      } catch (error) {
        console.error("Error uploading file:", error);
        // Handle error appropriately
      }
    } else {
      setFileName(null);
    }
  };

  return (
    <div className="flex flex-col w-full gap-2">
      <Button
        variant="outline"
        className="flex-1 border-[#393E46]/20 text-[#393E46] hover:border-[#00ADB5] hover:bg-[#00ADB5]/5 hover:text-[#00ADB5] transition-all"
        onClick={handleButtonClick}
      >
        <Upload className="mr-2 h-5 w-5 text-[#00ADB5]" />
        <span>Upload Resume</span>
      </Button>
      {fileName && (
        <div className="text-sm text-[#393E46]/70 truncate max-w-full px-2 bg-[#00ADB5]/5 py-1 rounded-md border border-[#00ADB5]/20 mt-1">
          <span className="font-medium text-[#00ADB5]">Selected file:</span>{" "}
          {fileName}
        </div>
      )}
      <Input
        ref={fileInputRef}
        id="resume-file"
        type="file"
        accept=".pdf,.doc,.docx"
        className="hidden"
        onChange={handleFileChange}
      />
    </div>
  );
}
