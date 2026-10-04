import { ChatShell } from "@/components/chat/chat-shell";
import { ConversationList } from "@/components/chat/conversation-list";
import { LogoutButton } from "@/components/logout-button";
import { CURRENT_USER_ID } from "@/lib/chat/dummy";
import { getConversationSummaries } from "@/lib/chat/selectors";

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const conversations = getConversationSummaries(CURRENT_USER_ID);

  return (
    <ChatShell
      sidebar={
        <>
          <div className="flex items-center justify-between px-4 py-3">
            <h2 className="text-base font-semibold tracking-tight">Pesan</h2>
            <LogoutButton />
          </div>
          <ConversationList
            conversations={conversations}
            currentUserId={CURRENT_USER_ID}
          />
        </>
      }
    >
      {children}
    </ChatShell>
  );
}
