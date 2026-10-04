import { notFound } from "next/navigation";
import { ChatThread } from "@/components/chat/chat-thread";
import { CURRENT_USER_ID } from "@/lib/chat/dummy";
import { getConversation, getMessages } from "@/lib/chat/selectors";

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const conversation = getConversation(id, CURRENT_USER_ID);
  if (!conversation) notFound();

  return (
    <ChatThread
      key={id}
      conversation={conversation}
      initialMessages={getMessages(id)}
      currentUserId={CURRENT_USER_ID}
    />
  );
}
