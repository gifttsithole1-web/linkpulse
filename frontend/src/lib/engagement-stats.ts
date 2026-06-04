import type { CommunicationLog } from "@/lib/api";

export function groupCampaigns(logs: CommunicationLog[]) {
  const map = new Map<
    string,
    { id: string; name: string; channel: string; count: number; latest: string }
  >();

  for (const log of logs) {
    const cid = log.provider_message_id;
    if (!cid?.startsWith("campaign-")) continue;
    const nameMatch = log.message_body?.match(/^\[([^\]]+)\]/);
    const name = nameMatch?.[1] ?? "Campaign";
    const existing = map.get(cid);
    if (existing) {
      existing.count += 1;
      if (log.created_at > existing.latest) existing.latest = log.created_at;
    } else {
      map.set(cid, {
        id: cid,
        name,
        channel: log.channel,
        count: 1,
        latest: log.created_at,
      });
    }
  }

  return [...map.values()].sort((a, b) => b.latest.localeCompare(a.latest));
}

export function channelStats(logs: CommunicationLog[]) {
  const channels = ["email", "sms", "whatsapp"] as const;
  return channels.map((ch) => {
    const subset = logs.filter((l) => l.channel === ch);
    const delivered = subset.filter((l) =>
      ["sent", "delivered"].includes(l.status),
    ).length;
    return {
      channel: ch,
      total: subset.length,
      delivered,
      rate: subset.length ? Math.round((delivered / subset.length) * 100) : 0,
    };
  });
}
