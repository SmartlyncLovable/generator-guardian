import { useState } from "react";
import { logEntries, generators, LogEntry } from "@/data/generators";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, ScrollText, Activity, AlertTriangle, Play, Square } from "lucide-react";

const eventTypes = ["Start", "Stop", "Alarm", "Fault"] as const;

const eventMeta: Record<string, { badge: string; dot: string; icon: typeof Activity }> = {
  Start: { badge: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800", dot: "bg-emerald-400", icon: Play },
  Stop:  { badge: "bg-slate-500/10 text-slate-600 border-slate-200 dark:text-slate-400 dark:border-slate-700",           dot: "bg-slate-400",   icon: Square },
  Alarm: { badge: "bg-amber-500/10 text-amber-600 border-amber-200 dark:text-amber-400 dark:border-amber-800",           dot: "bg-amber-400",   icon: AlertTriangle },
  Fault: { badge: "bg-red-500/10 text-red-600 border-red-200 dark:text-red-400 dark:border-red-900",                     dot: "bg-red-400 animate-pulse", icon: AlertTriangle },
};

const filterActive: Record<string, string> = {
  All:   "bg-primary text-primary-foreground border-primary",
  Start: "bg-emerald-500 text-white border-emerald-500",
  Stop:  "bg-slate-500 text-white border-slate-500",
  Alarm: "bg-amber-500 text-white border-amber-500",
  Fault: "bg-red-500 text-white border-red-500",
};

const filterIdle: Record<string, string> = {
  All:   "border-border text-muted-foreground hover:bg-muted",
  Start: "border-emerald-200 text-emerald-600 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400",
  Stop:  "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400",
  Alarm: "border-amber-200 text-amber-600 hover:bg-amber-50 dark:border-amber-800 dark:text-amber-400",
  Fault: "border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900 dark:text-red-400",
};

const rowAccent: Record<string, string> = {
  Start: "border-l-2 border-l-emerald-400",
  Stop:  "border-l-2 border-l-slate-300",
  Alarm: "border-l-2 border-l-amber-400",
  Fault: "border-l-2 border-l-red-400",
};

export default function Logs() {
  const [search, setSearch]           = useState("");
  const [eventFilter, setEventFilter] = useState<string>("All");
  const [genFilter, setGenFilter]     = useState<string>("All");

  const filtered = logEntries.filter((log) => {
    const matchSearch = log.description.toLowerCase().includes(search.toLowerCase()) || log.generatorId.toLowerCase().includes(search.toLowerCase());
    const matchEvent  = eventFilter === "All" || log.eventType === eventFilter;
    const matchGen    = genFilter === "All" || log.generatorId === genFilter;
    return matchSearch && matchEvent && matchGen;
  });

  const counts = {
    Start: logEntries.filter((l) => l.eventType === "Start").length,
    Stop:  logEntries.filter((l) => l.eventType === "Stop").length,
    Alarm: logEntries.filter((l) => l.eventType === "Alarm").length,
    Fault: logEntries.filter((l) => l.eventType === "Fault").length,
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 text-white shadow-xl">
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute -top-8 -right-8 h-36 w-36 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <ScrollText className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">System Logs</h1>
          </div>
          <p className="text-slate-400 text-sm">Audit trail of all generator events</p>
        </div>
      </div>

      {/* KPI summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {(["Start","Stop","Alarm","Fault"] as const).map((type) => {
          const m = eventMeta[type];
          return (
            <div
              key={type}
              className="rounded-xl border bg-card p-4 shadow-sm cursor-pointer hover:shadow-md transition-shadow"
              onClick={() => setEventFilter(eventFilter === type ? "All" : type)}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs text-muted-foreground font-medium">{type} Events</span>
                <m.icon className="h-3.5 w-3.5 text-muted-foreground" />
              </div>
              <p className={`text-2xl font-black font-mono ${
                type === "Start" ? "text-emerald-600 dark:text-emerald-400" :
                type === "Stop"  ? "text-slate-600 dark:text-slate-400" :
                type === "Alarm" ? "text-amber-600 dark:text-amber-400" :
                "text-red-600 dark:text-red-400"
              }`}>{counts[type]}</p>
              <div className={`mt-2 h-1 rounded-full ${
                type === "Start" ? "bg-emerald-100 dark:bg-emerald-900/30" :
                type === "Stop"  ? "bg-slate-100 dark:bg-slate-800" :
                type === "Alarm" ? "bg-amber-100 dark:bg-amber-900/30" :
                "bg-red-100 dark:bg-red-900/30"
              } overflow-hidden`}>
                <div className={`h-full rounded-full ${
                  type === "Start" ? "bg-emerald-400" :
                  type === "Stop"  ? "bg-slate-400" :
                  type === "Alarm" ? "bg-amber-400" :
                  "bg-red-400"
                }`} style={{ width: `${(counts[type] / logEntries.length) * 100}%` }} />
              </div>
            </div>
          );
        })}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search logs..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <select
          value={genFilter}
          onChange={(e) => setGenFilter(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
        >
          <option value="All">All Generators</option>
          {generators.map((g) => (
            <option key={g.id} value={g.id}>{g.id}</option>
          ))}
        </select>
        <div className="flex gap-1.5">
          {(["All", ...eventTypes] as const).map((t) => (
            <button
              key={t}
              onClick={() => setEventFilter(t)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                eventFilter === t ? filterActive[t] : filterIdle[t]
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/40">
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Timestamp</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Generator</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Event</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Description</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => {
                const m = eventMeta[log.eventType] ?? eventMeta.Stop;
                return (
                  <tr key={log.id} className={`border-b last:border-0 hover:bg-muted/30 transition-colors ${rowAccent[log.eventType]}`}>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{log.timestamp}</td>
                    <td className="px-4 py-3">
                      <span className="font-mono text-xs bg-muted px-1.5 py-0.5 rounded">{log.generatorId}</span>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`${m.badge} border text-xs font-mono`}>
                        <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 ${m.dot}`} />
                        {log.eventType}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{log.description}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Search className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No logs found</p>
            <p className="text-xs text-muted-foreground/60">Try adjusting your search or filters</p>
          </div>
        )}
      </div>

      {/* Footer count */}
      <p className="text-xs text-muted-foreground text-right">
        Showing <span className="font-semibold text-foreground">{filtered.length}</span> of <span className="font-semibold text-foreground">{logEntries.length}</span> entries
      </p>
    </div>
  );
}