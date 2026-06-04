import type { Client } from "@/lib/api";

export const PIPELINE_STAGES = [
  { id: "lead", label: "Lead", hint: "New contact, not yet quoted" },
  { id: "quote", label: "Quote", hint: "Proposal or pricing in progress" },
  { id: "won", label: "Won", hint: "Approved — ready to fulfil" },
  { id: "production", label: "Production", hint: "Active work orders / delivery" },
] as const;

export type PipelineStageId = (typeof PIPELINE_STAGES)[number]["id"];

export function isPipelineStage(value: string): value is PipelineStageId {
  return PIPELINE_STAGES.some((s) => s.id === value);
}

export function groupClientsByStage(clients: Client[]) {
  const buckets = Object.fromEntries(
    PIPELINE_STAGES.map((s) => [s.id, [] as Client[]]),
  ) as Record<PipelineStageId, Client[]>;

  for (const client of clients) {
    const stage = isPipelineStage(client.pipeline_stage ?? "")
      ? (client.pipeline_stage as PipelineStageId)
      : "lead";
    buckets[stage].push(client);
  }

  return PIPELINE_STAGES.map((stage) => ({
    ...stage,
    clients: buckets[stage.id],
  }));
}

export function pipelineSummary(clients: Client[]) {
  const grouped = groupClientsByStage(clients);
  return {
    total: clients.length,
    byStage: grouped.map((g) => ({ id: g.id, label: g.label, count: g.clients.length })),
  };
}
