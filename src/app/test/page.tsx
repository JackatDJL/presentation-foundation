"use client";
import React from "react";
import { UploadDropzone } from "~/components/uploadthing";

const UploadPage: React.FC = () => {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
      }}
    >
      <UploadDropzone
        endpoint={"presentationUploader"}
        input={{
          presentationId: "815c986a-cf54-4a82-929e-4f450dfa46c5",
        }}
        onUploadError={(error) => {
          console.error("Upload error", error);
        }}
      />
    </div>
  );
};

export default UploadPage;
