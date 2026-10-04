"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon } from "lucide-react";

import { Bubble, BubbleContent } from "@/components/ui/bubble";
import { Marker, MarkerContent } from "@/components/ui/marker";
import {
  Message,
  MessageAvatar,
  MessageContent,
  MessageFooter,
  MessageGroup,
  MessageHeader,
} from "@/components/ui/message";
import {
  MessageScroller,
  MessageScrollerButton,
  MessageScrollerContent,
  MessageScrollerItem,
  MessageScrollerProvider,
  MessageScrollerViewport,
} from "@/components/ui/message-scroller";
import { dayKey, formatDay, formatTime } from "@/lib/chat/format";
import type {
  ConversationSummary,
  Message as ChatMessage,
} from "@/lib/chat/types";
import { Composer } from "./composer";
import { UserAvatar } from "./user-avatar";

type Row =
  | { kind: "day"; id: string; label: string }
  | { kind: "group"; id: string; senderId: string; messages: ChatMessage[] };

const GROUP_GAP_MS = 5 * 60 * 1000;

function buildRows(messages: ChatMessage[]): Row[] {
  const rows: Row[] = [];
  let lastDay = "";

  for (const m of messages) {
    const day = dayKey(m.created_at);
    if (day !== lastDay) {
      rows.push({
        kind: "day",
        id: `day-${day}`,
        label: formatDay(m.created_at),
      });
      lastDay = day;
    }

    const prev = rows[rows.length - 1];
    const prevMsg = prev?.kind === "group" ? prev.messages.at(-1) : undefined;

    if (
      prev?.kind === "group" &&
      prevMsg &&
      prev.senderId === m.sender_id &&
      +new Date(m.created_at) - +new Date(prevMsg.created_at) < GROUP_GAP_MS
    ) {
      prev.messages.push(m);
    } else {
      rows.push({
        kind: "group",
        id: m.id,
        senderId: m.sender_id,
        messages: [m],
      });
    }
  }

  return rows;
}

export function ChatThread({
  conversation,
  initialMessages,
  currentUserId,
}: {
  conversation: ConversationSummary;
  initialMessages: ChatMessage[];
  currentUserId: string;
}) {
  const [messages, setMessages] = useState(initialMessages);
  const rows = useMemo(() => buildRows(messages), [messages]);
  const names = useMemo(
    () => new Map(conversation.members.map((m) => [m.id, m.name])),
    [conversation.members],
  );

  function send(content: string) {
    // TODO: kirim ke chat-service (REST/WebSocket)
    setMessages((prev) => [
      ...prev,
      {
        id: crypto.randomUUID(),
        conversation_id: conversation.id,
        sender_id: currentUserId,
        content,
        created_at: new Date().toISOString(),
      },
    ]);
  }

  const isGroup = conversation.type === "group";

  return (
    <MessageScrollerProvider defaultScrollPosition="end" autoScroll>
      <div className="flex h-full min-h-0 flex-col">
        <header className="flex items-center gap-3 border-b px-4 py-3">
          <Link
            href="/chat"
            aria-label="Kembali ke daftar percakapan"
            className="-ml-1 rounded-md p-1 text-muted-foreground hover:text-foreground md:hidden"
          >
            <ArrowLeftIcon className="size-5" />
          </Link>

          <UserAvatar name={conversation.title} />

          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold">
              {conversation.title}
            </h1>
            <p className="truncate text-xs text-muted-foreground">
              {isGroup
                ? `${conversation.members.length} anggota`
                : "Percakapan pribadi"}
            </p>
          </div>
        </header>

        <MessageScroller className="min-h-0 flex-1">
          <MessageScrollerViewport>
            <MessageScrollerContent className="px-4 py-4">
              {rows.map((row) => {
                if (row.kind === "day") {
                  return (
                    <MessageScrollerItem key={row.id} messageId={row.id}>
                      <Marker variant="separator">
                        <MarkerContent>{row.label}</MarkerContent>
                      </Marker>
                    </MessageScrollerItem>
                  );
                }

                const mine = row.senderId === currentUserId;
                const senderName = names.get(row.senderId) ?? "Pengguna";

                return (
                  <MessageScrollerItem key={row.id} messageId={row.id}>
                    <MessageGroup>
                      {row.messages.map((m, i) => {
                        const first = i === 0;
                        const last = i === row.messages.length - 1;

                        return (
                          <Message key={m.id} align={mine ? "end" : "start"}>
                            {!mine && (
                              <MessageAvatar>
                                {last && <UserAvatar name={senderName} />}
                              </MessageAvatar>
                            )}

                            <MessageContent>
                              {isGroup && !mine && first && (
                                <MessageHeader>{senderName}</MessageHeader>
                              )}

                              <Bubble variant={mine ? "default" : "secondary"}>
                                <BubbleContent>{m.content}</BubbleContent>
                              </Bubble>

                              {last && (
                                <MessageFooter>
                                  <time
                                    dateTime={m.created_at}
                                    suppressHydrationWarning
                                  >
                                    {formatTime(m.created_at)}
                                  </time>
                                </MessageFooter>
                              )}
                            </MessageContent>
                          </Message>
                        );
                      })}
                    </MessageGroup>
                  </MessageScrollerItem>
                );
              })}
            </MessageScrollerContent>
          </MessageScrollerViewport>

          <MessageScrollerButton />
        </MessageScroller>

        <Composer onSend={send} />
      </div>
    </MessageScrollerProvider>
  );
}
