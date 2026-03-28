export default function Loading() {
  return (
    <div className="min-h-screen bg-[#f8fafc]">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col items-center justify-center px-6 py-20">
        <div className="h-14 w-14 animate-spin rounded-full border-4 border-blue-100 border-t-[#2563eb]" />
        <p className="mt-6 text-sm font-medium text-slate-500">Loading your workspace...</p>

        <div className="mt-12 w-full max-w-3xl space-y-4">
          <div className="h-8 w-48 animate-pulse rounded-xl bg-slate-200" />
          <div className="h-28 animate-pulse rounded-3xl bg-white shadow-sm" />
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="h-40 animate-pulse rounded-3xl bg-white shadow-sm" />
            <div className="h-40 animate-pulse rounded-3xl bg-white shadow-sm" />
          </div>
        </div>
      </div>
    </div>
  );
}