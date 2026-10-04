import { Avatar, AvatarFallback } from "../ui/avatar";

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function UserAvatar({ name }: { name: string }) {
  return (
    <Avatar>
      <AvatarFallback>{initials(name)}</AvatarFallback>
    </Avatar>
  );
}
