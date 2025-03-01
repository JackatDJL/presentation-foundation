import Link from "next/link"
import Image from "next/image"
import { ThemeToggle } from "./theme-toggle"

export default function Header() {
  return (
    <header className="bg-background border-b">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link href="/" className="flex items-center space-x-3">
            <div className="relative w-10 h-10">
              <Image
                src="/placeholder.svg?height=40&width=40"
                alt="Presentation Foundation Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-semibold">Presentation Foundation</span>
          </Link>
        </div>

        <div className="flex items-center space-x-4">
          <ThemeToggle />
          <Link
            href="/manage"
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          >
            Manage
          </Link>

          {/* Placeholder for Clerk authentication */}
          <div className="relative w-8 h-8 bg-muted rounded-full">
            <div className="absolute inset-0 flex items-center justify-center text-muted-foreground">
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
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

