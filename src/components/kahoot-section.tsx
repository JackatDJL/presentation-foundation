"use client";

import Link from "next/link";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";

interface KahootSectionProps {
  kahootPin?: string;
  kahootSelfHostUrl?: string;
}

export default function KahootSection({
  kahootPin,
  kahootSelfHostUrl,
}: KahootSectionProps) {
  // If neither pin nor self-host URL is available, don't render anything
  if (!kahootPin && !kahootSelfHostUrl) {
    return null;
  }

  // If pin is "none", show loading animation
  if (kahootPin === "none") {
    return (
      <div className="flex flex-col items-center justify-center p-6 bg-gray-900 rounded-lg">
        <div className="flex space-x-2 justify-center items-center">
          <div className="h-3 w-3 bg-pink-400 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
          <div className="h-3 w-3 bg-pink-400 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
          <div className="h-3 w-3 bg-pink-400 rounded-full animate-bounce"></div>
        </div>
        <p className="mt-4 text-pink-400">Loading Kahoot quiz...</p>
      </div>
    );
  }

  // If only pin is available (and not "none")
  if (kahootPin && !kahootSelfHostUrl) {
    return (
      <Link
        prefetch
        href={`https://kahoot.it/?pin=${kahootPin}`}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block"
      >
        <div className="relative px-8 py-4 bg-gray-900 rounded-lg border-2 border-pink-400 hover:border-pink-300 transition-colors">
          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-pink-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-pink-400 font-bold">
              Join Kahoot Quiz (PIN: {kahootPin})
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // If only self-host URL is available
  if (!kahootPin && kahootSelfHostUrl) {
    return (
      <Link
        prefetch
        href={kahootSelfHostUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-block"
      >
        <div className="relative px-8 py-4 bg-gray-900 rounded-lg border-2 border-pink-400 hover:border-pink-300 transition-colors">
          <div className="flex items-center space-x-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-pink-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
              />
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span className="text-pink-400 font-bold">
              Play Self-Hosted Kahoot
            </span>
          </div>
        </div>
      </Link>
    );
  }

  // If both pin and self-host URL are available
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Link
            prefetch
            href={`https://kahoot.it/?pin=${kahootPin}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block"
          >
            <div className="relative px-8 py-4 bg-gray-900 rounded-lg border-2 border-pink-400 hover:border-pink-300 transition-colors">
              <div className="flex items-center space-x-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 text-pink-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z"
                  />
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-pink-400 font-bold">
                  Join Kahoot Quiz (PIN: {kahootPin})
                </span>
              </div>
            </div>
          </Link>
        </TooltipTrigger>
        <TooltipContent>
          <Link
            prefetch
            href={kahootSelfHostUrl || "#"}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-pink-400 hover:underline"
          >
            Or play self-hosted version
          </Link>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
