import Image from "next/image";

type LinkPulseLogoProps = {
  /** Icon-only crop for the narrow rail */
  variant?: "mark" | "full";
  className?: string;
};

export function LinkPulseLogo({
  variant = "full",
  className = "",
}: LinkPulseLogoProps) {
  if (variant === "mark") {
    return (
      <Image
        src="/brand/linkpulse-mark.webp"
        alt="LinkPulse"
        width={36}
        height={36}
        sizes="36px"
        className={`h-9 w-9 rounded-2xl object-cover object-top ${className}`}
        priority
      />
    );
  }

  return (
    <Image
      src="/brand/linkpulse-logo.webp"
      alt="LinkPulse — Connect • Engage • Grow"
      width={200}
      height={120}
      sizes="(max-width: 768px) 180px, 200px"
      className={`h-auto w-full max-w-[200px] object-contain ${className}`}
      loading="lazy"
    />
  );
}
