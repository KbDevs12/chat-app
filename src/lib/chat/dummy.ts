import type {
  ChatUser,
  Conversation,
  ConversationMember,
  Message,
} from "./types";

export const CURRENT_USER_ID = "u-me";

export const users: ChatUser[] = [
  { id: "u-me", name: "Lu" },
  { id: "u-aisyah", name: "Aisyah" },
  { id: "u-rizky", name: "Rizky" },
  { id: "u-dewi", name: "Dewi" },
  { id: "u-bima", name: "Bima" },
];

export const conversations: Conversation[] = [
  { id: "c-1", type: "direct", name: null, created_at: "2026-09-20T03:00:00Z" },
  {
    id: "c-2",
    type: "group",
    name: "Tim Backend",
    created_at: "2026-09-25T03:00:00Z",
  },
  { id: "c-3", type: "direct", name: null, created_at: "2026-09-28T03:00:00Z" },
  {
    id: "c-4",
    type: "group",
    name: "Makan Siang",
    created_at: "2026-10-01T03:00:00Z",
  },
];

const member = (
  conversation_id: string,
  user_id: string,
  last_read_at: string | null = null,
): ConversationMember => ({
  conversation_id,
  user_id,
  last_read_at,
  joined_at: "2026-09-20T03:00:00Z",
});

export const members: ConversationMember[] = [
  member("c-1", "u-me", "2026-10-04T01:41:30Z"),
  member("c-1", "u-aisyah"),
  member("c-2", "u-me", "2026-10-03T06:20:30Z"),
  member("c-2", "u-rizky"),
  member("c-2", "u-dewi"),
  member("c-2", "u-bima"),
  member("c-3", "u-me", "2026-10-02T14:31:00Z"),
  member("c-3", "u-rizky"),
  member("c-4", "u-me"),
  member("c-4", "u-aisyah"),
  member("c-4", "u-dewi"),
];

const msg = (
  id: string,
  conversation_id: string,
  sender_id: string,
  created_at: string,
  content: string,
): Message => ({ id, conversation_id, sender_id, content, created_at });

export const messages: Message[] = [
  msg(
    "m-1",
    "c-1",
    "u-aisyah",
    "2026-10-03T02:10:00Z",
    "Udah lihat PR yang kemarin?",
  ),
  msg(
    "m-2",
    "c-1",
    "u-me",
    "2026-10-03T02:12:00Z",
    "Udah, tinggal satu komentar soal nama fungsi",
  ),
  msg("m-3", "c-1", "u-me", "2026-10-03T02:12:40Z", "Nanti gua rapihin"),
  msg(
    "m-4",
    "c-1",
    "u-aisyah",
    "2026-10-03T02:15:00Z",
    "Oke, kabarin kalau sudah",
  ),
  msg(
    "m-5",
    "c-1",
    "u-aisyah",
    "2026-10-04T01:30:00Z",
    "Pagi! Jadi review jam 10?",
  ),
  msg(
    "m-6",
    "c-1",
    "u-me",
    "2026-10-04T01:41:00Z",
    "Jadi, link meet-nya kirim aja ya",
  ),
  msg(
    "m-7",
    "c-1",
    "u-aisyah",
    "2026-10-04T01:42:00Z",
    "Siap, aku kirim sekarang",
  ),

  msg(
    "m-8",
    "c-2",
    "u-rizky",
    "2026-10-03T06:00:00Z",
    "Migration conversations sudah di-merge",
  ),
  msg(
    "m-9",
    "c-2",
    "u-rizky",
    "2026-10-03T06:01:00Z",
    "Tinggal index messages",
  ),
  msg(
    "m-10",
    "c-2",
    "u-dewi",
    "2026-10-03T06:05:00Z",
    "Index (conversation_id, created_at DESC) kan?",
  ),
  msg("m-11", "c-2", "u-rizky", "2026-10-03T06:06:00Z", "Yoi"),
  msg(
    "m-12",
    "c-2",
    "u-me",
    "2026-10-03T06:20:00Z",
    "Sip, gua tes di lokal dulu",
  ),
  msg(
    "m-13",
    "c-2",
    "u-bima",
    "2026-10-04T02:00:00Z",
    "Websocket service pakai axum juga?",
  ),
  msg(
    "m-14",
    "c-2",
    "u-dewi",
    "2026-10-04T02:03:00Z",
    "Setuju, biar satu stack",
  ),
  msg(
    "m-15",
    "c-2",
    "u-dewi",
    "2026-10-04T02:03:30Z",
    "Tapi token auth-nya gimana di handshake?",
  ),
  msg(
    "m-16",
    "c-2",
    "u-bima",
    "2026-10-04T02:10:00Z",
    "Lewat query param dulu, nanti dirapihin",
  ),

  msg(
    "m-17",
    "c-3",
    "u-me",
    "2026-10-02T14:00:00Z",
    "Zky, env staging masih pakai db lama?",
  ),
  msg(
    "m-18",
    "c-3",
    "u-rizky",
    "2026-10-02T14:30:00Z",
    "Sudah aku pindah kemarin",
  ),

  msg(
    "m-19",
    "c-4",
    "u-dewi",
    "2026-10-04T04:30:00Z",
    "Hari ini makan di mana?",
  ),
  msg("m-20", "c-4", "u-aisyah", "2026-10-04T04:32:00Z", "Soto depan kantor?"),
  msg("m-21", "c-4", "u-dewi", "2026-10-04T04:35:00Z", "Gas"),
];
