"use client";

import { useState } from "react";
import { api } from "~/trpc/react";
import { motion } from "framer-motion";
import { FileText, Lock, Download, Eye } from "react-feather";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "~/components/ui/alert-dialog";
import { Input } from "~/components/ui/input";

interface FileViewProps {
  fileId: string;
  fileType: "presentation" | "handout" | "research" | "logo" | "cover";
  presentationId?: string;
}

export default function FileView({
  fileId,
  fileType,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  presentationId,
}: FileViewProps) {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [isValidating, setIsValidating] = useState(false);
  const [accessGranted, setAccessGranted] = useState(false);

  const { data: file, isPending } = api.files.getById.useQuery(fileId);

  // Password verification mutation
  const verifyPasswordMutation = api.files.verifyPassword.useMutation({
    onSuccess: (data) => {
      setIsValidating(false);

      if (data.success) {
        setAccessGranted(true);
        setIsPasswordDialogOpen(false);
        setPassword("");
      } else {
        setErrorMessage(data.message);
      }
    },
    onError: (error) => {
      setIsValidating(false);
      setErrorMessage(error.message || "An error occurred during verification");
    },
  });

  const handlePasswordSubmit = async () => {
    if (!password.trim()) {
      setErrorMessage("Password is required");
      return;
    }

    setIsValidating(true);
    setErrorMessage("");

    // Verify the password using the mutation
    verifyPasswordMutation.mutate({
      fileId,
      password,
    });
  };

  const handleFileAccess = () => {
    if (file?.isLocked && !accessGranted) {
      setIsPasswordDialogOpen(true);
    } else {
      // Open file directly
      if (file?.ufsUrl) {
        window.open(file.ufsUrl, "_blank");
      }
    }
  };

  if (isPending) {
    return (
      <Card className="h-full">
        <CardContent className="flex items-center justify-center h-40">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{
              duration: 2,
              repeat: Number.POSITIVE_INFINITY,
              ease: "linear",
            }}
          >
            <FileText className="h-8 w-8 text-muted-foreground" />
          </motion.div>
        </CardContent>
      </Card>
    );
  }

  if (!file) {
    return null;
  }

  const getTitle = (type: string): string => {
    switch (type) {
      case "presentation":
        return "Presentation";
      case "handout":
        return "Handout";
      case "research":
        return "Research Paper";
      default:
        return "File";
    }
  };

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return "Unknown size";
    const units = ["B", "KB", "MB", "GB"];
    let size = bytes;
    let unitIndex = 0;
    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }
    return `${size.toFixed(1)} ${units[unitIndex]}`;
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <Card className="h-full">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              {file.isLocked && (
                <Lock className="h-4 w-4 mr-2 text-amber-500" />
              )}
              {getTitle(fileType)}
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-2">
            <div className="flex items-center">
              <FileIcon fileExtension={file.name.split(".").pop()} />
              <div className="ml-3">
                <p className="font-medium">{file.name}</p>
                <p className="text-sm text-muted-foreground">
                  {formatFileSize(file.size)}
                </p>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFileAccess}
              className="flex items-center"
            >
              {file.isLocked && !accessGranted ? (
                <>
                  <Lock className="h-4 w-4 mr-1" />
                  Unlock
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </>
              )}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                if (file.ufsUrl) {
                  if (file.isLocked && !accessGranted) {
                    setIsPasswordDialogOpen(true);
                  } else {
                    window.open(file.ufsUrl, "_blank", "download");
                  }
                }
              }}
              disabled={!file.ufsUrl}
            >
              <Download className="h-4 w-4" />
            </Button>
          </CardFooter>
        </Card>
      </motion.div>

      <AlertDialog
        open={isPasswordDialogOpen}
        onOpenChange={(open) => {
          if (!isValidating) {
            setIsPasswordDialogOpen(open);
            if (!open) {
              setPassword("");
              setErrorMessage("");
            }
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Protected File</AlertDialogTitle>
            <AlertDialogDescription>
              This file is password protected. Please enter the password to
              access it.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Password
              </label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter password"
                disabled={isValidating}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && password && !isValidating) {
                    void handlePasswordSubmit();
                  }
                }}
              />
            </div>
            {errorMessage && (
              <p className="text-sm text-destructive">{errorMessage}</p>
            )}
          </div>
          <AlertDialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsPasswordDialogOpen(false);
                setPassword("");
                setErrorMessage("");
              }}
              disabled={isValidating}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={() => void handlePasswordSubmit()}
              disabled={!password || isValidating}
            >
              {isValidating ? (
                <>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{
                      duration: 1,
                      repeat: Number.POSITIVE_INFINITY,
                      ease: "linear",
                    }}
                    className="mr-2"
                  >
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                        fill="none"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                  </motion.div>
                  Verifying...
                </>
              ) : (
                "Access File"
              )}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// File icon component
function FileIcon({ fileExtension }: { fileExtension?: string }) {
  let className = "h-12 w-12 text-gray-500";

  switch (fileExtension) {
    case "pdf":
      className = "h-12 w-12 text-red-500";
      break;
    case "doc":
    case "docx":
      className = "h-12 w-12 text-blue-500";
      break;
    case "ppt":
    case "pptx":
    case "key":
      className = "h-12 w-12 text-orange-500";
      break;
  }

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      className={className}
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
}
