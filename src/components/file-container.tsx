"use client";

import React, { useState } from "react";
import { Button } from "~/components/ui/button";
import { z } from "zod";
import { UploadButton } from "./uploadthing";
import { api } from "~/trpc/react";

type FileType = "presentation" | "handout" | "research" | "logo" | "cover";

interface FileContainerProps {
  shortname?: string;
  fileType: FileType;
  disabled?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const uuidType = z.string().uuid();

export default function FileContainer(props: FileContainerProps) {
  return (
    <React.Suspense fallback={LoadingFile()}>
      <FileContainerInternal
        shortname={props.shortname}
        fileType={props.fileType}
        disabled={props.disabled}
      />
    </React.Suspense>
  );
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
function FileContainerInternal({
  shortname,
  fileType,
  disabled,
}: FileContainerProps) {
  if (!shortname || disabled) {
    return (
      <UploadComponent
        fileType="presentation"
        disabled
        presentationId="00000000-0000-0000-0000-000000000000"
      />
    );
  }

  const currentPresentation =
    api.presentations.getByShortname.useQuery(shortname).data;

  if (!currentPresentation) {
    throw new Error("Presentation not found!");
  }

  // TODO: Implement onDelete!
  function onDelete() {
    //
  }

  // TODO: Handle Locking Functionality
  // eslint-disable-next-line react-hooks/rules-of-hooks, @typescript-eslint/no-unused-vars
  const [isLocked, toggleLocked] = useState(false);

  let targetId;
  switch (fileType) {
    case "logo":
      targetId = currentPresentation.logo;
      break;
    case "cover":
      targetId = currentPresentation.cover;
      break;
    case "presentation":
      targetId = currentPresentation.presentation;
      break;
    case "handout":
      targetId = currentPresentation.handout;
      break;
    case "research":
      targetId = currentPresentation.research;
      break;
    default:
      targetId = undefined;
  }

  if (!targetId) {
    return (
      <UploadComponent
        presentationId={currentPresentation.id}
        fileType={fileType}
      />
    );
  }

  const targetFile = api.files.getById.useQuery(targetId).data;

  if (targetFile == undefined) {
    return (
      <UploadComponent
        presentationId={currentPresentation.id}
        fileType={fileType}
      />
    );
  }

  const isImage = fileType === "logo" || fileType === "cover";

  const fileExtention = targetFile.name.split(".").pop();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const getFileIcon = () => {
    if (isImage) return null;

    switch (fileExtention) {
      case "pdf":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-red-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        );
      case "doc":
      case "docx":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-blue-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        );
      case "ppt":
      case "pptx":
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-orange-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
            <polyline points="13 2 13 9 20 9"></polyline>
          </svg>
        );
      default:
        return (
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-12 w-12 text-gray-500"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M13 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V9z"></path>
            <polyline points="13 2 13 9 20 9"></polyline>
          </svg>
        );
    }
  };

  // Get title based on file type
  const getTitle = () => {
    switch (fileType) {
      case "presentation":
        return "Presentation";
      case "handout":
        return "Handout";
      case "research":
        return "Research Paper";
      case "logo":
        return "Logo";
      case "cover":
        return "Cover";
      default:
        return "File";
    }
  };

  return (
    <div className="border border-border rounded-lg overflow-hidden">
      <div className="p-4 bg-muted border-b border-border flex justify-between items-center">
        <h3 className="font-medium">{getTitle()}</h3>
        <div className="flex space-x-2">
          {fileType === "presentation" && (
            // <Button onClick={toggleLocked} size="sm" variant="outline">
            <Button
              onClick={() => {
                //
              }}
              size="sm"
              variant="outline"
            >
              {isLocked ? (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="3"
                      y="11"
                      width="18"
                      height="11"
                      rx="2"
                      ry="2"
                    ></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  Locked
                </>
              ) : (
                <>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect
                      x="3"
                      y="11"
                      width="18"
                      height="11"
                      rx="2"
                      ry="2"
                    ></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                  Unlocked
                </>
              )}
            </Button>
          )}
          <Button onClick={onDelete} size="sm" variant="destructive">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="3 6 5 6 21 6"></polyline>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
              <line x1="10" y1="11" x2="10" y2="17"></line>
              <line x1="14" y1="11" x2="14" y2="17"></line>
            </svg>
          </Button>
        </div>
      </div>
    </div>
  );
}

interface UploadComponentProps {
  presentationId: z.infer<typeof uuidType>;
  fileType: FileType;
  disabled?: boolean;
}

function UploadComponent({
  presentationId,
  fileType,
  disabled,
}: UploadComponentProps) {
  // TODO: Handle Upload Functionality

  return (
    <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-12 w-12 text-muted-foreground mb-4"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
        <polyline points="17 8 12 3 7 8"></polyline>
        <line x1="12" y1="3" x2="12" y2="15"></line>
      </svg>
      {disabled && (
        <p className="text-muted-foreground mb-4">
          Create the Presentation first!
        </p>
      )}
      {!disabled &&
        (fileType === "presentation" ? (
          <UploadPreConfigured
            endpoint="presentationUploader"
            input={{
              presentationId: presentationId,
            }}
          />
        ) : fileType === "handout" || fileType === "research" ? (
          <UploadPreConfigured
            endpoint="documentUploader"
            input={{
              presentationId: presentationId,
              fileType: fileType,
            }}
          />
        ) : fileType === "logo" || fileType === "cover" ? (
          <UploadPreConfigured
            endpoint="imageUploader"
            input={{
              presentationId: presentationId,
              fileType: fileType,
            }}
          />
        ) : null)}
    </div>
  );
}

function UploadPreConfigured(
  props: React.ComponentProps<typeof UploadButton>,
): JSX.Element {
  return (
    <UploadButton
      config={{
        mode: "auto",
      }}
      content={{
        allowedContent: "",
      }}
      {...props}
    />
  );
}

function LoadingFile() {
  return (
    <div className="border-2 border-dashed border-border rounded-lg p-6 flex flex-col items-center justify-center">
      <svg
        className="animate-spin h-8 w-8 text-muted-foreground"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M12 2a10 10 0 0 1 10 10h-4a6 6 0 0 0-6-6V2z"
        />
      </svg>
    </div>
  );
}
