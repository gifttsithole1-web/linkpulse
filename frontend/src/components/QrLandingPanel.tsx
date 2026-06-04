"use client";

import { useState } from "react";
import { FiDownload } from "react-icons/fi";
import { downloadQrLandingPdf } from "@/lib/qr-pdf";

const appUrl =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, "") ?? "http://localhost:3000";
const qrLandingUrl = `${appUrl}/qr`;

export function QrLandingPanel() {
  const [copyDone, setCopyDone] = useState(false);
  const [pdfStatus, setPdfStatus] = useState<"idle" | "loading" | "error">("idle");

  const qrImageUrl = `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(
    qrLandingUrl,
  )}`;

  function copyLink() {
    void navigator.clipboard.writeText(qrLandingUrl);
    setCopyDone(true);
    setTimeout(() => setCopyDone(false), 2000);
  }

  async function downloadPdf() {
    setPdfStatus("loading");
    try {
      await downloadQrLandingPdf(qrLandingUrl);
      setPdfStatus("idle");
    } catch {
      setPdfStatus("error");
    }
  }

  return (
    <section className="dash-card min-w-0 p-4 sm:p-5">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-zinc-500">
        QR code
      </div>
      <p className="mt-2 text-sm text-zinc-600">
        Print or share this code. Scanners submit the form and are added as
        retail clients in your CRM (source: QR).
      </p>

      <div className="mt-4 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={qrImageUrl}
          alt="QR code for LinkPulse landing page"
          width={180}
          height={180}
          className="h-auto max-w-full rounded-lg border border-zinc-200 bg-white p-2"
        />
        <div className="min-w-0 flex-1 space-y-3">
          <div className="rounded-lg border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm text-zinc-800 break-all">
            {qrLandingUrl}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={copyLink}
              className="rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm font-medium text-zinc-800 hover:bg-zinc-50"
            >
              {copyDone ? "Copied" : "Copy link"}
            </button>
            <button
              type="button"
              onClick={downloadPdf}
              disabled={pdfStatus === "loading"}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-3 py-2 text-sm font-medium text-white hover:bg-zinc-800 disabled:opacity-60"
            >
              <FiDownload className="h-4 w-4" />
              {pdfStatus === "loading" ? "Preparing…" : "Download PDF"}
            </button>
          </div>
          {pdfStatus === "error" ? (
            <p className="text-xs text-red-600">
              PDF failed — check your connection and try again.
            </p>
          ) : null}
          <p className="text-xs text-zinc-500">
            PDF includes a print-ready QR and your landing URL. For phones to scan
            in production, set{" "}
            <code className="rounded bg-zinc-100 px-1">NEXT_PUBLIC_APP_URL</code> in{" "}
            <code className="rounded bg-zinc-100 px-1">.env.local</code>.
          </p>
        </div>
      </div>
    </section>
  );
}
