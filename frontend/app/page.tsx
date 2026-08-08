export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-8 bg-slate-950 text-slate-100">
      <div className="max-w-2xl text-center space-y-6">
        <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-sm font-medium">
          Phase 1 Initialized
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight sm:text-5xl bg-gradient-to-r from-white via-slate-200 to-indigo-400 bg-clip-text text-transparent">
          AI Interview Agent
        </h1>
        <p className="text-lg text-slate-400">
          Personalized technical interviewer platform for the AI Cohort program.
        </p>
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-left text-sm font-mono space-y-2 text-slate-300">
          <div><span className="text-emerald-400">✓</span> Next.js (App Router) + TypeScript configured</div>
          <div><span className="text-emerald-400">✓</span> Tailwind CSS + shadcn/ui configured</div>
          <div><span className="text-emerald-400">✓</span> FastAPI backend structure initialized</div>
        </div>
      </div>
    </main>
  );
}
