import { conversations, members, messages, users } from "./dummy";
import type { ChatUser, ConversationSummary, Message } from "./types";

const byId = new Map(users.map((u) => [u.id, u]));

function getUser(id: string): ChatUser {
  return byId.get(id) ?? { id, name: "Pengguna" };
}

export function getMessages(conversationId: string): Message[] {
  return messages
    .filter((m) => m.conversation_id === conversationId)
    .sort((a, b) => a.created_at.localeCompare(b.created_at));
}

function summarize(
  conversationId: string,
  me: string,
): ConversationSummary | undefined {
  const conv = conversations.find((c) => c.id === conversationId);
  if (!conv) return undefined;

  const convMembers = members.filter((m) => m.conversation_id === conv.id);
  const mine = convMembers.find((m) => m.user_id === me);
  if (!mine) return undefined;

  const thread = getMessages(conv.id);
  const lastRead = mine.last_read_at;

  const unreadCount = thread.filter(
    (m) => m.sender_id !== me && (!lastRead || m.created_at > lastRead),
  ).length;

  const memberUsers = convMembers.map((m) => getUser(m.user_id));
  const other = memberUsers.find((u) => u.id !== me);

  return {
    id: conv.id,
    type: conv.type,
    title:
      conv.type === "group"
        ? (conv.name ?? "Grup")
        : (other?.name ?? "Percakapan"),
    members: memberUsers,
    lastMessage: thread.at(-1) ?? null,
    unreadCount,
  };
}

export function getConversation(id: string, me: string) {
  return summarize(id, me);
}

export function getConversationSummaries(me: string): ConversationSummary[] {
  return conversations
    .map((c) => summarize(c.id, me))
    .filter((c): c is ConversationSummary => c !== undefined)
    .sort((a, b) =>
      (b.lastMessage?.created_at ?? "").localeCompare(
        a.lastMessage?.created_at ?? "",
      ),
    );
}
