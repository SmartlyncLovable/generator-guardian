import { useState } from "react";
import type { GeneratorStatus } from "@/types/generator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGenerators } from "@/hooks/useGenerators";
import { Badge } from "@/components/ui/badge";
import { Search, BarChart3, Activity, Zap, AlertTriangle, Power } from "lucide-react";
import { useNavigate } from "react-router-dom";

const statusStyles: Record<GeneratorStatus, string> = {
  Running: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800 dark:text-emerald-400",
  Stopped: "bg-slate-500/10 text-slate-600 border-slate-200 dark:border-slate-700 dark:text-slate-400",
  Fault:   "bg-red-500/10 text-red-600 border-red-200 dark:border-red-900 dark:text-red-400",
};

const dotStyles: Record<GeneratorStatus, string> = {
  Running: "bg-emerald-500 shadow-[0_0_6px_2px_rgba(16,185,129,0.5)] animate-pulse",
  Stopped: "bg-slate-400",
  Fault:   "bg-red-500 shadow-[0_0_6px_2px_rgba(239,68,68,0.5)] animate-pulse",
};

const rowAccent: Record<GeneratorStatus, string> = {
  Running: "border-l-2 border-l-emerald-400",
  Stopped: "border-l-2 border-l-slate-300",
  Fault:   "border-l-2 border-l-red-400",
};

const statusFilters: GeneratorStatus[] = ["Running", "Stopped", "Fault"];

const filterStyles: Record<GeneratorStatus | "All", string> = {
  All:     "bg-primary text-primary-foreground border-primary",
  Running: "bg-emerald-500 text-white border-emerald-500 hover:bg-emerald-600",
  Stopped: "bg-slate-500 text-white border-slate-500 hover:bg-slate-600",
  Fault:   "bg-red-500 text-white border-red-500 hover:bg-red-600",
};

const filterOutlineStyles: Record<GeneratorStatus | "All", string> = {
  All:     "border-border text-muted-foreground hover:bg-muted",
  Running: "border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 dark:hover:bg-emerald-950",
  Stopped: "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-900",
  Fault:   "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950",
};

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<GeneratorStatus | "All">("All");
  const navigate = useNavigate();

  const { data: generators, loading, error } = useGenerators({
    status: statusFilter !== "All" ? statusFilter : undefined,
    search,
  });

  const counts = {
    Running: generators.filter((g) => g.status === "Running").length,
    Stopped: generators.filter((g) => g.status === "Stopped").length,
    Fault:   generators.filter((g) => g.status === "Fault").length,
  };

  return (
    <div className="space-y-6 p-1">

      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-6 text-white shadow-xl">
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:24px_24px]" />
        {/* Accent glow */}
        <div className="absolute -top-10 -right-10 h-40 w-40 rounded-full bg-primary/20 blur-3xl" />
        <div className="absolute -bottom-10 -left-10 h-40 w-40 rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center justify-center gap-2 mb-1">
            <Zap className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">Fuel Level & Power Monitoring</h1>
          </div>
          <p className="text-slate-400 text-sm text-center">Monitor and manage all diesel generators and fuel tanks</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Running */}
        <div className="relative rounded-xl overflow-hidden border border-emerald-100 dark:border-emerald-900 bg-gradient-to-br from-emerald-50 to-white dark:from-emerald-950/40 dark:to-slate-900 p-5 shadow-sm">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-bl-full bg-emerald-500/5" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-1">Running</p>
              <p className="text-4xl font-black font-mono text-emerald-600 dark:text-emerald-400">{counts.Running}</p>
              <p className="text-xs text-muted-foreground mt-1">Active Generators</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-emerald-500/15 flex items-center justify-center">
              <Activity className="h-6 w-6 text-emerald-500" />
            </div>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-emerald-100 dark:bg-emerald-900/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-emerald-500 transition-all duration-700"
              style={{ width: generators.length ? `${(counts.Running / generators.length) * 100}%` : "0%" }}
            />
          </div>
        </div>

        {/* Stopped */}
        <div className="relative rounded-xl overflow-hidden border border-slate-200 dark:border-slate-700 bg-gradient-to-br from-slate-50 to-white dark:from-slate-800/40 dark:to-slate-900 p-5 shadow-sm">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-bl-full bg-slate-500/5" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-slate-500 dark:text-slate-400 mb-1">Stopped</p>
              <p className="text-4xl font-black font-mono text-slate-600 dark:text-slate-300">{counts.Stopped}</p>
              <p className="text-xs text-muted-foreground mt-1">Generators </p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-slate-500/10 flex items-center justify-center">
              <Power className="h-6 w-6 text-slate-500" />
            </div>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-slate-100 dark:bg-slate-700/50 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-slate-400 to-slate-500 transition-all duration-700"
              style={{ width: generators.length ? `${(counts.Stopped / generators.length) * 100}%` : "0%" }}
            />
          </div>
        </div>

        {/* Fault */}
        <div className="relative rounded-xl overflow-hidden border border-red-100 dark:border-red-900/50 bg-gradient-to-br from-red-50 to-white dark:from-red-950/30 dark:to-slate-900 p-5 shadow-sm">
          <div className="absolute top-0 right-0 h-24 w-24 rounded-bl-full bg-red-500/5" />
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-red-500 dark:text-red-400 mb-1">Fault</p>
              <p className="text-4xl font-black font-mono text-red-500 dark:text-red-400">{counts.Fault}</p>
              <p className="text-xs text-muted-foreground mt-1">Faulty Generators</p>
            </div>
            <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-red-100 dark:bg-red-900/30 overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-red-400 to-red-500 transition-all duration-700"
              style={{ width: generators.length ? `${(counts.Fault / generators.length) * 100}%` : "0%" }}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search generators..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1.5">
          {(["All", ...statusFilters] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all duration-150 ${
                statusFilter === s
                  ? filterStyles[s]
                  : filterOutlineStyles[s]
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border shadow-sm overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Generator</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Engine Speed</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Voltage</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Frequency</th>
                <th className="text-right px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Last Posted</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground text-sm">
                    <div className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                      Loading generators...
                    </div>
                  </td>
                </tr>
              )}
              {!loading && generators.map((g) => (
                <tr
                  key={g.id}
                  className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${rowAccent[g.status]}`}
                >
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-semibold">{g.name}</span>
                      <span className="text-muted-foreground font-mono text-xs ml-2 bg-muted px-1.5 py-0.5 rounded">{g.location}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={`${statusStyles[g.status]} border font-mono text-xs`}>
                      <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 ${dotStyles[g.status]}`} />
                      {g.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono text-sky-600 dark:text-sky-400 font-medium">{g.engine_speed}</span>
                    <span className="text-muted-foreground text-xs ml-1">RPM</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono text-violet-600 dark:text-violet-400 font-medium">{g.voltage}</span>
                    <span className="text-muted-foreground text-xs ml-1">V</span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <span className="font-mono text-amber-600 dark:text-amber-400 font-medium">{g.frequency}</span>
                    <span className="text-muted-foreground text-xs ml-1">Hz</span>
                  </td>
                  <td className="px-4 py-3 text-right font-mono text-xs text-muted-foreground">{g.created_at}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1.5 justify-center">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-emerald-200 text-emerald-700 hover:bg-emerald-500 hover:text-white hover:border-emerald-500 dark:border-emerald-800 dark:text-emerald-400 transition-colors"
                        onClick={() => navigate(`/analytics/${g.id}`)}
                      >
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Analytics
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-7 text-xs border-sky-200 text-sky-700 hover:bg-sky-500 hover:text-white hover:border-sky-500 dark:border-sky-800 dark:text-sky-400 transition-colors"
                        onClick={() => navigate(`/live_parameters/${g.id}`)}
                      >
                        <Activity className="h-3 w-3 mr-1" />
                        Live
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {!loading && generators.length === 0 && (
          <div className="p-12 text-center">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto mb-3">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-muted-foreground font-medium">No generators found</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Try adjusting your search or filter</p>
          </div>
        )}
      </div>
    </div>
  );
}