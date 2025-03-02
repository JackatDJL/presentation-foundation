"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import type { Presentation } from "~/lib/data"
import KahootSection from "~/components/kahoot-section"
import PasswordModal from "~/components/password-modal"

export default function PresentationDetail({ presentation }: { presentation: Presentation }) {
  const [showPasswordModal, setShowPasswordModal] = useState(false)
  const [targetUrl, setTargetUrl] = useState("")

  const handlePresentationClick = () => {
    if (presentation.presentationFile?.isLocked) {
      setTargetUrl(`/redirect/${presentation.shortname}/presentation`)
      setShowPasswordModal(true)
    } else if (presentation.presentationFile?.url) {
      window.location.href = `/redirect/${presentation.shortname}/presentation`
    }
  }

  return (
    <div className="min-h-screen">
      {/* Hero section with cover image */}
      <div className="relative h-80 w-full">
        {presentation.cover ? (
          <Image
            src={presentation.cover || "/placeholder.svg"}
            alt={`Cover for ${presentation.title}`}
            fill
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600" />
        )}

        <div className="absolute inset-0 bg-black bg-opacity-40 flex flex-col items-center justify-center text-white p-4">
          <Link
            href="/"
            className="absolute top-4 left-4 bg-white bg-opacity-20 hover:bg-opacity-30 text-white px-4 py-2 rounded-md transition-colors"
          >
            Back to Home
          </Link>

          {presentation.logo && (
            <div className="relative w-24 h-24 mb-4">
              <Image
                src={presentation.logo || "/placeholder.svg"}
                alt={`Logo for ${presentation.title}`}
                fill
                className="object-contain"
              />
            </div>
          )}

          <h1 className="text-4xl md:text-5xl font-bold text-center">{presentation.title}</h1>
        </div>
      </div>

      <div className="container mx-auto px-4 py-12">
        {/* Description */}
        {presentation.description && (
          <div className="mb-12 max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold mb-4">Description</h2>
            <p className="text-muted-foreground">{presentation.description}</p>
          </div>
        )}

        {/* Resource buttons */}
        <div className="mb-12 max-w-3xl mx-auto">
          <h2 className="text-2xl font-semibold mb-6">Resources</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {presentation.presentationFile?.url && (
              <button
                onClick={handlePresentationClick}
                className="flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-md hover:bg-primary/90 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
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
                Presentation
                {presentation.presentationFile.isLocked && (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 ml-1"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                  </svg>
                )}
              </button>
            )}

            {presentation.handoutFile?.url && (
              <Link
                href={`/redirect/${presentation.shortname}/handout`}
                className="flex items-center justify-center gap-2 bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
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
                Handout
              </Link>
            )}

            {presentation.researchFile?.url && (
              <Link
                href={`/redirect/${presentation.shortname}/research`}
                className="flex items-center justify-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-md hover:bg-purple-700 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"></path>
                  <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"></path>
                </svg>
                Research Papers
              </Link>
            )}
          </div>
        </div>

        {/* Kahoot section */}
        {(presentation.kahootPin || presentation.kahootSelfHostUrl) && (
          <div className="mb-12 max-w-3xl mx-auto">
            <h2 className="text-2xl font-semibold mb-6">Interactive Quiz</h2>
            <KahootSection kahootPin={presentation.kahootPin} kahootSelfHostUrl={presentation.kahootSelfHostUrl} />
          </div>
        )}

        {/* Credits */}
        {presentation.credits && (
          <div className="mt-12 max-w-3xl mx-auto pt-6 border-t border-border">
            <p className="text-muted-foreground text-center">Credits: {presentation.credits}</p>
          </div>
        )}
      </div>

      {/* Password modal */}
      {showPasswordModal && (
        <PasswordModal
          correctPassword={presentation.presentationFile?.password || ""}
          onClose={() => setShowPasswordModal(false)}
          onSuccess={() => {
            window.location.href = targetUrl
          }}
        />
      )}
    </div>
  )
}

