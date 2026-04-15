import { useState } from "react";
import type { GeneratorStatus } from "@/types/generator";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useGenerators } from "@/hooks/useGenerators";
import { Badge } from "@/components/ui/badge";
import { Search, BarChart3, Download, Activity } from "lucide-react";
import { useNavigate } from "react-router-dom";


const statusStyles: Record<GeneratorStatus, string> = {
  Running: "status-running",
  Stopped: "status-stopped",
  Fault: "status-fault",
};

const dotStyles: Record<GeneratorStatus, string> = {
  Running: "status-dot-running",
  Stopped: "status-dot-stopped",
  Fault: "status-dot-fault",
};

const statusFilters: GeneratorStatus[] = ["Running", "Stopped", "Fault"];

export default function Dashboard() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<GeneratorStatus | "All">("All");
  const navigate = useNavigate();
    
  // After
  const { data: generators, loading, error } = useGenerators({ status: statusFilter !== 'All' ? statusFilter : undefined, search });
  //console.log("Generators:", generators, "Loading:", loading, "Error:", error);

  const counts = {
    Running: generators.filter((g) => g.status === "Running").length,
    Stopped: generators.filter((g) => g.status === "Stopped").length,
    Fault: generators.filter((g) => g.status === "Fault").length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Generator Fleet</h1>
        <p className="text-muted-foreground text-sm mt-1">Monitor and manage all diesel generators</p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="kpi-card flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[hsl(var(--status-running))]/10 flex items-center justify-center">
            <Activity className="h-5 w-5 text-[hsl(var(--status-running))]" />
          </div>
          <div>
            <p className="text-2xl font-semibold font-mono">{counts.Running}</p>
            <p className="text-xs text-muted-foreground">Running</p>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[hsl(var(--status-stopped))]/10 flex items-center justify-center">
            <Activity className="h-5 w-5 text-[hsl(var(--status-stopped))]" />
          </div>
          <div>
            <p className="text-2xl font-semibold font-mono">{counts.Stopped}</p>
            <p className="text-xs text-muted-foreground">Stopped</p>
          </div>
        </div>
        <div className="kpi-card flex items-center gap-3">
          <div className="h-10 w-10 rounded-lg bg-[hsl(var(--status-fault))]/10 flex items-center justify-center">
            <Activity className="h-5 w-5 text-[hsl(var(--status-fault))]" />
          </div>
          <div>
            <p className="text-2xl font-semibold font-mono">{counts.Fault}</p>
            <p className="text-xs text-muted-foreground">Fault</p>
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
        <div className="flex gap-1">
          <Button
            size="sm"
            variant={statusFilter === "All" ? "default" : "outline"}
            onClick={() => setStatusFilter("All")}
          >
            All
          </Button>
          {statusFilters.map((s) => (
            <Button
              key={s}
              size="sm"
              variant={statusFilter === s ? "default" : "outline"}
              onClick={() => setStatusFilter(s)}
            >
              {s}
            </Button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-card rounded-lg border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Generator</th>
                {/*<th className="text-center px-4 py-3 font-medium text-muted-foreground">Gen. Mode</th>*/}
                <th className="text-left px-4 py-3 font-medium text-muted-foreground">Status</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Engine Speed</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Gen. Voltage</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Gen. Frequency</th>
                {/*<th className="text-right px-4 py-3 font-medium text-muted-foreground">Engine Oil</th>
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Coolant (°C)</th>*/}
                <th className="text-right px-4 py-3 font-medium text-muted-foreground">Last Posted</th>
                <th className="text-center px-4 py-3 font-medium text-muted-foreground">Actions</th>
              </tr>
            </thead>
            <tbody>
              {generators.map((g) => (
                <tr key={g.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3">
                    <div>
                      <span className="font-medium">{g.name}</span>
                      <span className="text-muted-foreground font-mono text-xs ml-2">{g.id}</span>
                    </div>
                  </td>
                  {/*<td className="px-4 py-3 text-center">
                    <Badge variant="secondary" className="font-mono text-xs">{g.controlMode}</Badge>
                  </td>*/}
                  <td className="px-4 py-3">
                    <Badge variant="outline" className={`${statusStyles[g.status]} border font-mono text-xs`}>
                      <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 ${dotStyles[g.status]}`} />
                      {g.status}
                    </Badge>
                  </td>
                  <td className="px-4 py-3 text-right font-mono">{g.engine_speed} RPM</td>
                  <td className="px-4 py-3 text-right font-mono">{g.voltage} V</td>
                  <td className="px-4 py-3 text-right font-mono">{g.frequency} Hz</td>
                  {/*<td className="px-4 py-3 text-right font-mono">{g.oil_pressure} PSI</td>
                  <td className="px-4 py-3 text-right font-mono">{g.coolantTemp}°C</td>*/}
                  <td className="px-4 py-3 text-right font-mono">{g.created_at}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex gap-1 justify-end">
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => navigate(`/analytics/${g.id}`)}>
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Analytics
                      </Button>
                      <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => navigate(`/analytics/${g.id}`)}>
                        <BarChart3 className="h-3 w-3 mr-1" />
                        Live Param
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {generators.length === 0 && (
          <div className="p-8 text-center text-muted-foreground">No generators found</div>
        )}
      </div>
    </div>
  );
}
