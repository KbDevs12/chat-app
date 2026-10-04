export type ConversationType = "direct" | "group";

export type Conversation = {
  id: string;
  type: ConversationType;
  name: string | null;
  created_at: string;
};

export type ConversationMember = {
  conversation_id: string;
  user_id: string;
  last_read_at: string | null;
  joined_at: string;
};

export type Message = {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  created_at: string;
};

export type ChatUser = { id: string; name: string };

export type ConversationSummary = {
  id: string;
  type: ConversationType;
  title: string;
  members: ChatUser[];
  lastMessage: Message | null;
  unreadCount: number;
};
