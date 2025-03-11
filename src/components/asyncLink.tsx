"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { getViewHref, getHomeHref } from "~/components/shortname-routing";
import type { SearchParams } from "~/components/shortname-routing";
import { Loader } from "react-feather";

interface AsyncViewLinkProps {
  searchParams: SearchParams;
  shortname: string;
  className?: string;
  children: React.ReactNode;
  spinIt?: boolean;
}

export function AsyncViewLink({
  searchParams,
  shortname,
  className,
  children,
  spinIt = true,
}: AsyncViewLinkProps) {
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    getViewHref(searchParams, shortname)
      .then((resolvedHref) => {
        setHref(resolvedHref);
      })
      .catch((error) => {
        console.error("Error loading view href:", error);
      });
  }, [searchParams, shortname]);

  if (!href) {
    if (spinIt) {
      return <LoadingSpinner />;
    } else {
      return children;
    }
  }

  return (
    <Link prefetch href={href} className={className}>
      {children}
    </Link>
  );
}

interface AsyncHomeLinkProps {
  searchParams: SearchParams;
  className?: string;
  children: React.ReactNode;
  spinIt?: boolean;
}

export function AsyncHomeLink({
  searchParams,
  className,
  children,
  spinIt = true,
}: AsyncHomeLinkProps) {
  const [href, setHref] = useState<string | null>(null);

  useEffect(() => {
    getHomeHref(searchParams)
      .then((resolvedHref) => {
        setHref(resolvedHref);
      })
      .catch((error) => {
        console.error("Error loading view href:", error);
      });
  }, [searchParams]);

  if (!href) {
    if (spinIt) {
      return <LoadingSpinner />;
    } else {
      return children;
    }
  }

  return (
    <Link prefetch href={href} className={className}>
      {children}
    </Link>
  );
}

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center ">
      <Loader className="h-8 w-8 animate-spin" />
    </div>
  );
}
