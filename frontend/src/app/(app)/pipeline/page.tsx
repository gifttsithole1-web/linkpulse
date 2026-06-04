import { CrmPageShell } from "@/components/crm/CrmPageShell";
import { PipelineBoard } from "@/components/pipeline/PipelineBoard";
import { getNavItemByHref } from "@/config/crm-navigation";
import { getClients } from "@/lib/api";
import { pipelineSummary } from "@/lib/pipeline";

export default async function PipelinePage() {
  const nav = getNavItemByHref("/pipeline");
  const clients = await getClients({ per_page: 500 });
  const list = clients?.data ?? [];
  const summary = pipelineSummary(list);

  return (
    <CrmPageShell item={nav}>
      <div className="flex flex-wrap gap-2">
        {summary.byStage.map((s) => (
          <span key={s.id} className="dash-pill bg-white text-zinc-700 shadow-sm">
            {s.label}{" "}
            <strong className="ml-1 text-zinc-900">{s.count}</strong>
          </span>
        ))}
        <span className="dash-pill bg-[var(--dash-accent-soft)] text-[var(--dash-accent)]">
          {summary.total} total in pipeline
        </span>
      </div>
      <PipelineBoard clients={list} />
    </CrmPageShell>
  );
}
