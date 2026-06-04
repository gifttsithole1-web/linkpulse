import type { jsPDF } from "jspdf";

const QR_FETCH_SIZE = 512;

export async function loadQrImageDataUrl(landingUrl: string): Promise<string> {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${QR_FETCH_SIZE}x${QR_FETCH_SIZE}&data=${encodeURIComponent(
    landingUrl,
  )}`;

  const res = await fetch(qrUrl);
  if (!res.ok) {
    throw new Error("Could not load QR image");
  }

  const blob = await res.blob();
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => reject(new Error("Could not read QR image"));
    reader.readAsDataURL(blob);
  });
}

export async function buildQrLandingPdf(landingUrl: string): Promise<jsPDF> {
  const { jsPDF: JsPDF } = await import("jspdf");
  const qrDataUrl = await loadQrImageDataUrl(landingUrl);

  const pdf = new JsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const pageW = pdf.internal.pageSize.getWidth();

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(20);
  pdf.setTextColor(11, 22, 54);
  pdf.text("LinkPulse", pageW / 2, 28, { align: "center" });

  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(12);
  pdf.setTextColor(60, 60, 60);
  pdf.text("Scan to share feedback & join our CRM", pageW / 2, 38, {
    align: "center",
  });

  const qrSize = 90;
  const qrX = (pageW - qrSize) / 2;
  pdf.addImage(qrDataUrl, "PNG", qrX, 48, qrSize, qrSize);

  pdf.setFontSize(10);
  pdf.setTextColor(80, 80, 80);
  pdf.text("Landing page", pageW / 2, 148, { align: "center" });

  pdf.setFontSize(9);
  pdf.setTextColor(10, 86, 255);
  const urlLines = pdf.splitTextToSize(landingUrl, pageW - 40);
  pdf.text(urlLines, pageW / 2, 156, { align: "center" });

  pdf.setFontSize(8);
  pdf.setTextColor(120, 120, 120);
  pdf.text(
    "Retail clients are created automatically (source: qr) · BeamLink Tech",
    pageW / 2,
    275,
    { align: "center" },
  );

  return pdf;
}

export async function downloadQrLandingPdf(landingUrl: string) {
  const pdf = await buildQrLandingPdf(landingUrl);
  pdf.save("linkpulse-qr-landing.pdf");
}
