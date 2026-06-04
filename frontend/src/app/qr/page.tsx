import { LinkPulseLogo } from "@/components/brand/LinkPulseLogo";
import { QrLeadForm } from "./qr-lead-form";

export default function QrLandingPage() {
  return (
    <div className="lp-layered-bg flex min-h-[100dvh] flex-col overflow-x-hidden px-4 py-8 text-zinc-900 sm:px-6 sm:py-10">
      <div className="mx-auto flex w-full min-w-0 max-w-xl flex-1 flex-col justify-center space-y-6">
        <header className="text-center">
          <div className="mx-auto flex justify-center">
            <LinkPulseLogo variant="full" className="h-auto w-full max-w-[200px] sm:max-w-[220px]" />
          </div>
          <h1 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
            Help us improve
          </h1>
          <p className="mt-2 text-sm text-zinc-600">
            Scan our QR, share your details, and we&apos;ll add you as a LinkPulse
            contact so we can follow up by email or WhatsApp.
          </p>
        </header>

        <div className="lp-card lp-card--elevated min-w-0 p-4 sm:p-6">
          <QrLeadForm />
        </div>

        <p className="text-center text-xs text-zinc-500">
          By submitting, you agree to receive product updates. You can unsubscribe
          anytime.
        </p>
      </div>
    </div>
  );
}
