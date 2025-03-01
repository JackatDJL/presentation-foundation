import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

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
            <span className="text-xl font-semibold">
              Presentation Foundation
            </span>
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
          <div className="relative h-8">
            <SignedIn>
              <UserButton />
            </SignedIn>
            <SignedOut>
              <SignInButton />
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
}
