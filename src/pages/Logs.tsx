import { useState } from "react";
import { logEntries, generators, LogEntry } from "@/data/generators";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search } from "lucide-react";

const eventTypes = ["Start", "Stop", "Alarm", "Fault"] as const;

const eventStyles: Record<string, string> = {
  Start: "status-running border",
  Stop: "status-stopped border",
  Alarm: "status-warning border",
  Fault: "status-fault border",
};

export default function Logs() {
  const [search, setSearch] = useState("");
  const [eventFilter, setEventFilter] = useState<string>("All");
  const [genFilter, setGenFilter] = useState<string>("All");

  const filtered = logEntries.filter((log) => {
    const matchSearch = log.description.toLowerCase().includes(search.toLowerCase()) || log.generatorId.toLowerCase().includes(search.toLowerCase());
    const matchEvent = eventFilter === "All" || log.eventType === eventFilter;
    const matchGen = genFilter === "All" || log.generatorId === genFilter;
    return matchSearch && matchEvent && matchGen;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">System Logs</h1>
        <p className="text-muted-foreground text-sm mt-1">Audit trail of generator events</p>
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
          className="border rounded-md px-3 py-2 text-sm bg-background"
        >
          <option value="All">All Generators</option>
          {generators.map((g) => (
            <option key={g.id} value={g.id}>{g.id}</option>
          ))}
        </select>
        <div className="flex gap-1">
          <Button size="sm" variant={eventFilter === "All" ? "default" : "outline"} onClick={() => setEventFilter("All")}>All</Button>
          {eventTypes.map((t) => (
            <Button key={t} size="sm" variant={eventFilter === t ? "default" : "outline"} onClick={() => setEventFilter(t)}>{t}</Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Timestamp</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Generator</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Event</th>
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Description</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((log) => (
                <tr key={log.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs whitespace-nowrap">{log.timestamp}</td>
                  <td className="px-4 py-3 font-mono text-xs">{log.generatorId}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={`${eventStyles[log.eventType]} text-xs font-mono`}>
                      {log.eventType}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{log.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">No logs found</div>
        )}
      </div>
    </div>
  );
}
