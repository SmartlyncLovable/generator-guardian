import { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Download, FileSpreadsheet, FileText, File, Check, Loader2 } from "lucide-react";
import { generators } from "@/data/generators";

const allParams = [
  "Engine Speed", "Oil Pressure", "Coolant Temp", "Engine Battery",
  "Mains PF", "Engine Starts", "Engine Hours", "Generator Voltage",
  "Generator Frequency", "Gen Power (kWh)", "Gen Power (kVAh)", "Gen Power (kVARh)",
  "Mains Power (kWh)", "Mains Power (kVARh)", "Alarm 1", "Alarm 2", "Alarm 3",
  "Generator Control Mode",
];

type ExportFormat = "CSV" | "Excel" | "PDF";

export default function Export() {
  const [searchParams] = useSearchParams();
  const preselectedGen = searchParams.get("gen") || "";

  const [dateFrom, setDateFrom] = useState("2026-04-01");
  const [dateTo, setDateTo] = useState("2026-04-15");
  const [selectedParams, setSelectedParams] = useState<string[]>(allParams.slice(0, 6));
  const [format, setFormat] = useState<ExportFormat>("CSV");
  const [exporting, setExporting] = useState(false);
  const [exported, setExported] = useState(false);
  const [selectedGen, setSelectedGen] = useState(preselectedGen);

  const toggleParam = (p: string) => {
    setSelectedParams((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );
  };

  const handleExport = () => {
    setExporting(true);
    setExported(false);
    setTimeout(() => {
      setExporting(false);
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    }, 1500);
  };

  const formats: { label: ExportFormat; icon: typeof File }[] = [
    { label: "CSV", icon: FileText },
    { label: "Excel", icon: FileSpreadsheet },
    { label: "PDF", icon: File },
  ];

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Export Data</h1>
        <p className="text-muted-foreground text-sm mt-1">Download generator telemetry data</p>
      </div>

      {/* Generator select */}
      <div className="bg-card rounded-lg border p-4 shadow-sm space-y-3">
        <label className="text-sm font-medium">Generator</label>
        <select
          value={selectedGen}
          onChange={(e) => setSelectedGen(e.target.value)}
          className="w-full border rounded-md px-3 py-2 text-sm bg-background"
        >
          <option value="">All Generators</option>
          {generators.map((g) => (
            <option key={g.id} value={g.id}>{g.name} ({g.id})</option>
          ))}
        </select>
      </div>

      {/* Date range */}
      <div className="bg-card rounded-lg border p-4 shadow-sm space-y-3">
        <label className="text-sm font-medium">Date Range</label>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-xs text-muted-foreground">From</label>
            <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">To</label>
            <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Parameters */}
      <div className="bg-card rounded-lg border p-4 shadow-sm space-y-3">
        <div className="flex items-center justify-between">
          <label className="text-sm font-medium">Parameters</label>
          <Button
            size="sm"
            variant="ghost"
            className="text-xs h-7"
            onClick={() =>
              setSelectedParams(selectedParams.length === allParams.length ? [] : [...allParams])
            }
          >
            {selectedParams.length === allParams.length ? "Deselect All" : "Select All"}
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {allParams.map((p) => (
            <Badge
              key={p}
              variant={selectedParams.includes(p) ? "default" : "outline"}
              className="cursor-pointer transition-colors select-none"
              onClick={() => toggleParam(p)}
            >
              {p}
            </Badge>
          ))}
        </div>
      </div>

      {/* Format */}
      <div className="bg-card rounded-lg border p-4 shadow-sm space-y-3">
        <label className="text-sm font-medium">Export Format</label>
        <div className="flex gap-2">
          {formats.map((f) => (
            <Button
              key={f.label}
              variant={format === f.label ? "default" : "outline"}
              className="flex-1"
              onClick={() => setFormat(f.label)}
            >
              <f.icon className="h-4 w-4 mr-2" />
              {f.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Export button */}
      <Button
        className="w-full"
        size="lg"
        disabled={selectedParams.length === 0 || exporting}
        onClick={handleExport}
      >
        {exporting ? (
          <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Exporting...</>
        ) : exported ? (
          <><Check className="h-4 w-4 mr-2" />Export Complete!</>
        ) : (
          <><Download className="h-4 w-4 mr-2" />Export {format}</>
        )}
      </Button>
    </div>
  );
}
