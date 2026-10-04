"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

import { Badge } from "../ui/badge";
import { Input } from "../ui/input";
import { formatTime } from "@/lib/chat/format";
import type { ConversationSummary } from "@/lib/chat/types";
import { cn } from "@/lib/utils";
import { UserAvatar } from "./user-avatar";

export function ConversationList({
  conversations,
  currentUserId,
}: {
  conversations: ConversationSummary[];
  currentUserId: string;
}) {
  const pathname = usePathname();
  const [query, setQuery] = useState("");

  const visible = conversations.filter((c) =>
    c.title.toLowerCase().includes(query.trim().toLowerCase()),
  );

  return (
    <>
      <div className="px-3 pb-2">
        <Input
          type="search"
          placeholder="Find Chat"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Find Chat"
        />
      </div>

      <nav
        className="min-h-0 flex-1 overflow-y-auto px-2 pb-2"
        aria-label="Percakapan"
      >
        {visible.length === 0 && (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            Lets do conversation!.
          </p>
        )}

        <ul className="space-y-0.5">
          {visible.map((c) => {
            const active = pathname === `/chat/${c.id}`;
            const last = c.lastMessage;
            const senderName =
              last && c.type === "group" && last.sender_id !== currentUserId
                ? c.members.find((m) => m.id === last.sender_id)?.name
                : last?.sender_id === currentUserId
                  ? "Lu"
                  : null;

            return (
              <li key={c.id}>
                <Link
                  href={`/chat/${c.id}`}
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-muted",
                    active &&
                      "bg-accent text-accent-foreground hover:bg-accent",
                  )}
                >
                  <UserAvatar name={c.title} />

                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="truncate text-sm font-medium">
                        {c.title}
                      </span>
                      {last && (
                        <time
                          dateTime={last.created_at}
                          suppressHydrationWarning
                          className="shrink-0 text-xs text-muted-foreground"
                        >
                          {formatTime(last.created_at)}
                        </time>
                      )}
                    </div>

                    <div className="flex items-center justify-between gap-2">
                      <p className="truncate text-sm text-muted-foreground">
                        {last
                          ? senderName
                            ? `${senderName}: ${last.content}`
                            : last.content
                          : "Lets start some chat!"}
                      </p>
                      {c.unreadCount > 0 && (
                        <Badge
                          className="shrink-0"
                          aria-label={`${c.unreadCount} belum dibaca`}
                        >
                          {c.unreadCount}
                        </Badge>
                      )}
                    </div>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </>
  );
}
