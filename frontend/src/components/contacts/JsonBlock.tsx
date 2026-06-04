export function JsonBlock({
  data,
  emptyLabel,
}: {
  data: Record<string, unknown> | null | undefined;
  emptyLabel: string;
}) {
  if (!data || Object.keys(data).length === 0) {
    return <p className="text-sm text-zinc-500">{emptyLabel}</p>;
  }

  return (
    <dl className="space-y-2">
      {Object.entries(data).map(([key, value]) => (
        <div key={key} className="flex flex-col gap-0.5 sm:flex-row sm:gap-3">
          <dt className="shrink-0 text-xs font-medium uppercase tracking-wide text-zinc-400 sm:w-36">
            {key.replace(/_/g, " ")}
          </dt>
          <dd className="text-sm text-zinc-800">
            {typeof value === "object"
              ? JSON.stringify(value)
              : String(value)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
