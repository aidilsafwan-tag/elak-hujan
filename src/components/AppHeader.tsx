export function AppHeader() {
  return (
    <header className="fixed top-0 left-0 right-0 max-w-md mx-auto h-14 bg-background/95 backdrop-blur-sm border-b border-border z-20 flex items-center px-4">
      <div className="flex items-center gap-2.5">
        {/* Rain cloud mark */}
        <svg viewBox="0 0 32 32" fill="none" className="size-8 shrink-0">
          <path
            d="M8 22C5.24 22 3 19.76 3 17c0-2.42 1.72-4.44 4.03-4.9A7 7 0 0 1 14 6a6.97 6.97 0 0 1 6.8 5.4A5 5 0 0 1 26 16.5c0 3.04-2.46 5.5-5.5 5.5H8Z"
            className="fill-primary"
          />
          <line
            x1="10"
            y1="25"
            x2="8"
            y2="29"
            className="stroke-primary"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="16"
            y1="25"
            x2="14"
            y2="29"
            className="stroke-primary"
            strokeWidth="2"
            strokeLinecap="round"
          />
          <line
            x1="22"
            y1="25"
            x2="20"
            y2="29"
            className="stroke-primary"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>

        {/* Wordmark */}
        <div className="leading-none">
          <p className="text-base font-bold tracking-tight">
            <span className="text-foreground">Elak</span>
            <span className="text-primary">Hujan</span>
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">Perancang hujan untuk rider</p>
        </div>
      </div>
    </header>
  );
}
