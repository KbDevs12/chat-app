const TZ = "Asia/Jakarta";

const time = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: TZ,
});
const day = new Intl.DateTimeFormat("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  timeZone: TZ,
});
const dayKeyFmt = new Intl.DateTimeFormat("en-CA", { timeZone: TZ });

export const formatTime = (iso: string) => time.format(new Date(iso));
export const formatDay = (iso: string) => day.format(new Date(iso));
export const dayKey = (iso: string) => dayKeyFmt.format(new Date(iso));
