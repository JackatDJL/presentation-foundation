import Link from "next/link";
import Image from "next/image";
import { ThemeToggle } from "./theme-toggle";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { Button } from "./ui/button";
import { AsyncHomeLink } from "./asyncLink";

export default function Header() {
  const userButtonAppearance = {
    elements: {
      userButtonAvatarBox: "w-10 h-10",
    },
  };

  return (
    <header className="bg-background border-b print:border-none">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <AsyncHomeLink
            searchParams={{}}
            className="flex items-center space-x-2 print:no-underline print:text-foreground"
            spinIt={false}
          >
            <div className="relative w-10 h-10">
              <Image
                src="/logo.png"
                alt="Presentation Foundation Logo"
                fill
                className="object-contain"
              />
            </div>
            <span className="text-xl font-semibold">
              Presentation Foundation
            </span>
            <span className="hidden print:block print:text-xl font-semibold">
              by DJL
            </span>
          </AsyncHomeLink>
        </div>

        <div className="flex items-center space-x-4 print:hidden">
          <ThemeToggle />
          <SignedIn>
            <Button asChild>
              <Link prefetch href="/manage">
                Manage
              </Link>
            </Button>
          </SignedIn>

          <div className="relative h-10">
            <SignedIn>
              <UserButton showName appearance={userButtonAppearance} />
            </SignedIn>
            <SignedOut>
              <Button className="flex items-center h-10 space-x-4" asChild>
                <SignInButton />
              </Button>
            </SignedOut>
          </div>
        </div>
      </div>
    </header>
  );
}
