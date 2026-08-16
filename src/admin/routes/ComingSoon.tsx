export function ComingSoon({ section, builtIn }: { section: string; builtIn: string }) {
  return (
    <div>
      <h1 className="font-display text-2xl font-semibold tracking-tight text-ink">{section}</h1>
      <p className="mt-2 max-w-lg font-body text-sm text-muted">
        This section ships in {builtIn}. The nav entry and route slot are already wired.
      </p>
    </div>
  );
}
