"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { FiEdit2, FiMoreVertical, FiTrash2 } from "react-icons/fi";
import { deleteClientAction } from "@/lib/actions/clients";
import type { Client } from "@/lib/api";

export function ClientRowMenu({
  client,
  detailHref,
}: {
  client: Pick<Client, "id" | "name" | "account_type">;
  detailHref: string;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [pending, startTransition] = useTransition();
  const ref = useRef<HTMLDivElement>(null);

  function handleDelete() {
    const label =
      client.account_type === "corporate" ? "company" : "contact";
    if (
      !window.confirm(
        `Delete this ${label} permanently? Loyalty points and message history will be removed.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      const result = await deleteClientAction(client.id);
      if (!result.ok) {
        window.alert(result.error);
        return;
      }
      router.push(
        client.account_type === "corporate" ? "/companies" : "/contacts",
      );
      router.refresh();
    });
  }

  return (
    <div
      className="relative"
      ref={ref}
      onClick={(e) => e.stopPropagation()}
      onKeyDown={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        aria-label="Actions"
        aria-expanded={open}
        disabled={pending}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen((o) => !o);
        }}
        className="rounded-md px-1 py-0.5 text-zinc-300 hover:text-zinc-600"
      >
        <FiMoreVertical className="h-4 w-4" />
      </button>
      {open ? (
        <>
          <button
            type="button"
            aria-label="Close menu"
            className="fixed inset-0 z-40"
            onClick={() => setOpen(false)}
          />
          <div className="absolute right-0 z-50 mt-1 w-40 rounded-xl border border-zinc-100 bg-white py-1 shadow-lg">
            <Link
              href={detailHref}
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50"
            >
              <FiEdit2 className="h-4 w-4" />
              View & edit
            </Link>
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                handleDelete();
              }}
              className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <FiTrash2 className="h-4 w-4" />
              Delete
            </button>
          </div>
        </>
      ) : null}
    </div>
  );
}
