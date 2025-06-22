"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
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
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="flex flex-col items-center justify-center p-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg shadow-lg"
      >
        <div className="flex space-x-4 justify-center items-center">
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="h-5 w-5 bg-white rounded-full"
              animate={{
                y: [0, -15, 0],
                backgroundColor: [
                  "rgb(255, 255, 255)",
                  "rgb(236, 72, 153)",
                  "rgb(255, 255, 255)",
                ],
              }}
              transition={{
                duration: 1,
                repeat: Number.POSITIVE_INFINITY,
                delay: index * 0.2,
                ease: "easeInOut",
              }}
            />
          ))}
        </div>

        {/* Character-by-character gradient animation */}
        <div className="mt-6 flex justify-center">
          {"Loading Kahoot quiz...".split("").map((char, index) => (
            <motion.span
              key={index}
              className="text-white font-bold text-lg inline-block"
              animate={{
                color: [
                  "rgb(255, 255, 255)",
                  "rgb(236, 72, 153)",
                  "rgb(255, 255, 255)",
                ],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                delay: index * 0.05,
                ease: "easeInOut",
              }}
            >
              {char === " " ? "\u00A0" : char}
            </motion.span>
          ))}
        </div>
      </motion.div>
    );
  }

  // If only pin is available (and not "none")
  if (kahootPin && !kahootSelfHostUrl) {
    return (
      <KahootButton
        href={`https://kahoot.it/?pin=${kahootPin}`}
        label={`Join Kahoot Quiz (PIN: ${kahootPin})`}
      />
    );
  }

  // If only self-host URL is available
  if (!kahootPin && kahootSelfHostUrl) {
    return (
      <KahootButton href={kahootSelfHostUrl} label="Play Self-Hosted Kahoot" />
    );
  }

  // If both pin and self-host URL are available
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div>
            <KahootButton
              href={`https://kahoot.it/?pin=${kahootPin}`}
              label={`Join Kahoot Quiz (PIN: ${kahootPin})`}
            />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <Link
            prefetch
            href={kahootSelfHostUrl ?? "#"}
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

function KahootButton({ href, label }: { href: string; label: string }) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <Link
      prefetch
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <motion.div
        className="relative px-8 py-4 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg shadow-lg overflow-hidden"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
      >
        {/* Background animation */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-pink-600 to-purple-700"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            />
          )}
        </AnimatePresence>

        {/* Animated particles */}
        <AnimatePresence>
          {/* {isHovered && (
            <>
              {Array.from({ length: 20 }).map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute w-2 h-2 bg-white rounded-full opacity-70"
                  initial={{
                    x: `${Math.random() * 100}%`,
                    y: `${Math.random() * 100}%`,
                    opacity: 0,
                  }}
                  animate={{
                    y: `${Math.random() * 100 - 150}%`,
                    x: `${Math.random() * 100 - 50}%`,
                    opacity: [0, 0.8, 0],
                    scale: [0.8, 1.2, 0.5],
                  }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 1 + Math.random() * 2,
                    repeat: Number.POSITIVE_INFINITY,
                    delay: Math.random() * 2,
                  }}
                />
              ))}
            </>
          )} */}
        </AnimatePresence>

        <div className="relative flex items-center space-x-3">
          <motion.div
            animate={isHovered ? { rotate: 360 } : { rotate: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-white"
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
          </motion.div>
          <motion.span
            className="text-white font-bold"
            animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
            transition={{ duration: 0.2 }}
          >
            {label}
          </motion.span>
        </div>
      </motion.div>
    </Link>
  );
}
