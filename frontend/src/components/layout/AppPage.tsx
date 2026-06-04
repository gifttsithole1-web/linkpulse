export function AppPage({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      {children}
    </div>
  );
}

export function AppPageBody({
  children,
  className = "",
  narrow = false,
}: {
  children: React.ReactNode;
  className?: string;
  narrow?: boolean;
}) {
  return (
    <main
      className={[
        "app-scroll flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain",
        "px-4 py-4 sm:px-6 sm:py-6",
        className,
      ].join(" ")}
    >
      <div
        className={[
          "mx-auto w-full space-y-5 sm:space-y-6",
          narrow ? "max-w-lg" : "max-w-[1600px]",
        ].join(" ")}
      >
        {children}
      </div>
    </main>
  );
}
