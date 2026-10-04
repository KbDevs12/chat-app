"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Fetch } from "@/lib/server";

export function LogoutButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  async function onClick() {
    setPending(true);
    await Fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    router.replace("/login");
    router.refresh();
  }

  return (
    <Button variant="ghost" size="sm" onClick={onClick} disabled={pending}>
      {pending ? "Keluar..." : "Keluar"}
    </Button>
  );
}
