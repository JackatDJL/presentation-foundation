"use client";

import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion } from "motion/react";

interface GradientImageProps {
  src: string;
  alt: string;
  width?: number;
  height?: number;
  gradientColors?: string[];
  blurAmount?: number;
  className?: string;
  rounded?: boolean;
}

export default function GradientImage({
  src,
  alt,
  width = 400,
  height = 400,
  gradientColors = ["#f97316", "#d946ef", "#6366f1"],
  blurAmount = 40,
  className = "",
  rounded = true,
}: GradientImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (containerRef.current) {
      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            setTimeout(() => setIsLoaded(true), 100);
          }
        },
        { threshold: 0.1 },
      );

      observer.observe(containerRef.current);
      return () => observer.disconnect();
    }
  }, []);

  const gradientStyle = {
    background: `radial-gradient(circle, ${gradientColors.join(", ")})`,
    filter: `blur(${blurAmount}px)`,
    opacity: 0.7,
  };

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${rounded ? "rounded-2xl" : ""} ${className}`}
      style={{
        width: width,
        height: height,
        maxWidth: "100%",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        margin: "0 auto",
      }}
    >
      {/* Background gradient blur effect */}
      <motion.div
        className="absolute inset-0 w-full h-full transform scale-110 z-0"
        style={gradientStyle}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 0.7 : 0 }}
        transition={{ duration: 0.8 }}
      />

      {/* Actual image */}
      <motion.div
        className="relative z-10 w-full h-full flex items-center justify-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.5, delay: 0.3 }}
      >
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          width={width}
          height={height}
          className={`object-contain max-w-full max-h-full ${rounded ? "rounded-xl" : ""}`}
          style={{
            objectFit: "contain",
            width: "auto",
            height: "auto",
            maxHeight: "100%",
          }}
          onLoad={() => setIsLoaded(true)}
        />
      </motion.div>
    </div>
  );
}
