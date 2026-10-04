"use client";

import { useState } from "react";
import { SendIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useMessageScroller } from "@/components/ui/message-scroller";

export function Composer({ onSend }: { onSend: (text: string) => void }) {
  const [value, setValue] = useState("");
  const { scrollToEnd } = useMessageScroller();

  function submit() {
    const text = value.trim();
    if (!text) return;

    onSend(text);
    setValue("");
    requestAnimationFrame(() => scrollToEnd());
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="flex items-end gap-2 border-t p-3"
    >
      <Textarea
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault();
            submit();
          }
        }}
        rows={1}
        placeholder="Tulis pesan..."
        aria-label="Tulis pesan"
        className="max-h-32 min-h-10 resize-none"
      />

      <Button
        type="submit"
        size="icon"
        aria-label="Kirim"
        disabled={!value.trim()}
      >
        <SendIcon />
      </Button>
    </form>
  );
}
