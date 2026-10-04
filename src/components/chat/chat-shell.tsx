"use client";

import type { ReactNode } from "react";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export function ChatShell({
  sidebar,
  children,
}: {
  sidebar: ReactNode;
  children: ReactNode;
}) {
  const inThread = usePathname() !== "/chat";

  return (
    <div className="flex h-svh bg-background">
      <aside
        className={cn(
          "w-full shrink-0 flex-col border-r md:flex md:w-80 lg:w-96",
          inThread ? "hidden" : "flex",
        )}
      >
        {sidebar}
      </aside>

      <section
        className={cn(
          "min-w-0 flex-1 flex-col md:flex",
          inThread ? "flex" : "hidden",
        )}
      >
        {children}
      </section>
    </div>
  );
}
