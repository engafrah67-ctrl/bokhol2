export default function HomeLoading() {
  return (
    <div className="animate-pulse">
      {/* Clean Hero skeleton matching actual page */}
      <div className="relative w-full flex items-center justify-center min-h-[60vh] md:min-h-[500px] overflow-hidden pt-16 pb-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 w-full flex flex-col items-center text-center">
          <div className="h-16 w-16 bg-slate-200/80 rounded-2xl mb-8" />
          <div className="h-12 w-3/4 max-w-xl bg-slate-200/80 rounded-2xl mb-3" />
          <div className="h-10 w-1/2 max-w-md bg-slate-200/60 rounded-2xl mb-6" />
          <div className="h-5 w-2/3 max-w-lg bg-slate-100 rounded mb-10" />
          <div className="w-full max-w-2xl h-14 bg-white/80 rounded-2xl border border-slate-200 shadow-sm" />
        </div>
      </div>

      {/* Partners bar */}
      <div className="bg-slate-50 border-b border-slate-200 py-6 px-8">
        <div className="max-w-7xl mx-auto flex items-center gap-8 overflow-hidden">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-8 w-24 bg-slate-200 rounded-lg flex-shrink-0" />
          ))}
        </div>
      </div>

      {/* Content area */}
      <div className="space-y-16 py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Seafood index skeleton */}
        <div className="border border-slate-200 rounded-2xl p-8 space-y-6 bg-white">
          <div className="flex justify-between items-start">
            <div className="space-y-2">
              <div className="h-8 w-64 bg-slate-200 rounded-xl" />
              <div className="h-4 w-80 bg-slate-100 rounded" />
            </div>
            <div className="h-8 w-40 bg-slate-100 rounded-xl" />
          </div>
          <div className="flex gap-2">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-7 w-28 bg-slate-100 rounded-full" />
            ))}
          </div>
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            <div className="lg:col-span-4 space-y-4">
              <div className="h-12 w-36 bg-slate-200 rounded-xl" />
              <div className="h-6 w-24 bg-emerald-100 rounded-full" />
              <div className="grid grid-cols-2 gap-4 pt-4">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="space-y-1">
                    <div className="h-3 w-20 bg-slate-100 rounded" />
                    <div className="h-5 w-16 bg-slate-200 rounded" />
                  </div>
                ))}
              </div>
            </div>
            <div className="lg:col-span-8 h-64 bg-slate-100 rounded-xl" />
          </div>
        </div>

        {/* Top products skeleton */}
        <div className="space-y-4">
          <div className="h-8 w-48 bg-slate-200 rounded-xl" />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                <div className="h-48 bg-slate-200" />
                <div className="p-4 space-y-2">
                  <div className="h-5 w-3/4 bg-slate-200 rounded" />
                  <div className="h-4 w-1/2 bg-slate-100 rounded" />
                  <div className="h-6 w-24 bg-slate-200 rounded-full" />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Expert profile skeleton */}
        <div className="rounded-2xl border border-slate-200 bg-white p-8">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="w-32 h-32 rounded-full bg-slate-200 flex-shrink-0" />
            <div className="space-y-3 flex-1">
              <div className="h-6 w-48 bg-slate-200 rounded-xl" />
              <div className="h-4 w-32 bg-slate-100 rounded" />
              <div className="h-4 w-full bg-slate-100 rounded" />
              <div className="h-4 w-5/6 bg-slate-100 rounded" />
            </div>
          </div>
        </div>

        {/* News skeleton */}
        <div className="space-y-4">
          <div className="h-8 w-48 bg-slate-200 rounded-xl" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="rounded-2xl border border-slate-200 overflow-hidden bg-white">
                <div className="h-40 bg-slate-200" />
                <div className="p-4 space-y-2">
                  <div className="h-4 w-20 bg-slate-100 rounded-full" />
                  <div className="h-5 w-full bg-slate-200 rounded" />
                  <div className="h-4 w-4/5 bg-slate-100 rounded" />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  )
}
