import { useState, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Download, FileSpreadsheet, FileText, File,
  Check, Loader2, SlidersHorizontal, Eye, Calendar, Cpu,
} from "lucide-react";
import { generators } from "@/data/generators";
import { useGeneratorAnalytics } from "@/hooks/useGenerators";

const allParams = [
  "Engine Speed", "Oil Pressure", "Coolant Temp", "Engine Battery",
  "Mains PF", "Engine Starts", "Engine Hours", "Generator Voltage",
  "Generator Frequency", "Gen Power (kWh)", "Gen Power (kVAh)", "Gen Power (kVARh)",
  "Mains Power (kWh)", "Mains Power (kVARh)", "Alarm 1", "Alarm 2", "Alarm 3",
  "Generator Control Mode",
];

// Map display param names → analytics data keys
const paramKeyMap: Record<string, string> = {
  "Engine Speed":           "engine_speed",
  "Oil Pressure":           "oil_pressure",
  "Coolant Temp":           "coolant_temperature",
  "Engine Starts":          "engine_starts",
  "Engine Hours":           "engine_hours",
  "Generator Voltage":      "generator_voltage",
  "Generator Frequency":    "generator_frequency",
  "Gen Power (kWh)":        "generator_kw",
  "Gen Power (kVAh)":       "gen_kva",
  "Gen Power (kVARh)":      "gen_kvar",
  "Mains Power (kWh)":      "mains_kva",
  "Mains Power (kVARh)":    "mains_kvar",
};

type ExportFormat = "CSV" | "Excel" | "PDF";

const formats: { label: ExportFormat; icon: typeof File; color: string }[] = [
  { label: "CSV",   icon: FileText,        color: "border-emerald-200 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-400 data-[active=true]:bg-emerald-500 data-[active=true]:text-white data-[active=true]:border-emerald-500" },
  { label: "Excel", icon: FileSpreadsheet, color: "border-sky-200 text-sky-700 hover:bg-sky-50 dark:border-sky-800 dark:text-sky-400 data-[active=true]:bg-sky-500 data-[active=true]:text-white data-[active=true]:border-sky-500" },
  { label: "PDF",   icon: File,            color: "border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 data-[active=true]:bg-red-500 data-[active=true]:text-white data-[active=true]:border-red-500" },
];

export default function Export() {
  const [searchParams] = useSearchParams();
  const preselectedGen = searchParams.get("gen") || "";

  const [dateFrom, setDateFrom]           = useState("2026-04-01");
  const [dateTo, setDateTo]               = useState("2026-04-15");
  const [selectedParams, setSelectedParams] = useState<string[]>(allParams.slice(0, 6));
  const [format, setFormat]               = useState<ExportFormat>("CSV");
  const [exporting, setExporting]         = useState(false);
  const [exported, setExported]           = useState(false);
  const [selectedGen, setSelectedGen]     = useState(preselectedGen);
  const [previewing, setPreviewing]       = useState(false);

  const { data: analytics, loading: analyticsLoading } = useGeneratorAnalytics(
  selectedGen || generators[0]?.id,
  "none",
  dateFrom,
  dateTo
  );

  const toggleParam = (p: string) =>
    setSelectedParams((prev) =>
      prev.includes(p) ? prev.filter((x) => x !== p) : [...prev, p]
    );

  const handleExport = () => {
    setExporting(true);
    setExported(false);
    setTimeout(() => {
      setExporting(false);
      setExported(true);
      setTimeout(() => setExported(false), 3000);
    }, 1500);
  };

  const handlePreview = () => setPreviewing(true);

  // Build preview columns from selected params that have a key mapping
  const previewColumns = selectedParams.filter((p) => paramKeyMap[p]);

  // Limit preview to 10 rows
  const previewRows = useMemo(() => (analytics ?? []).slice(0, 10), [analytics]);

  return (
    <div className="space-y-6">

      {/* ── Header ── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 text-white shadow-xl">
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute -top-8 -right-8 h-36 w-36 rounded-full bg-primary/20 blur-3xl" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <Download className="h-5 w-5 text-primary" />
            <h1 className="text-xl font-bold tracking-tight">Reports</h1>
          </div>
          <p className="text-slate-400 text-sm">Configure and download generator telemetry data</p>
        </div>
      </div>

      {/* ── Two-column layout ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">


          {/* Generator */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/40 flex items-center gap-2">
              <Cpu className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Generator</span>
            </div>
            <div className="p-4">
              <select
                value={selectedGen}
                onChange={(e) => { setSelectedGen(e.target.value); setPreviewing(false); }}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {generators.map((g) => (
                  <option key={g.id} value={g.id}>{g.name} — {g.location}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Date Range */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/40 flex items-center gap-2">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Date Range</span>
            </div>
            <div className="p-4 grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">From</label>
                <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="text-sm" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground mb-1 block">To</label>
                <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="text-sm" />
              </div>
            </div>
          </div>

          {/* Format */}
          {/*<div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/40 flex items-center gap-2">
              <FileText className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Export Format</span>
            </div>
            <div className="p-4 flex gap-2">
              {formats.map((f) => (
                <button
                  key={f.label}
                  data-active={format === f.label}
                  onClick={() => setFormat(f.label)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-xs font-semibold rounded-lg border transition-all ${f.color}`}
                >
                  <f.icon className="h-3.5 w-3.5" />
                  {f.label}
                </button>
              ))}
            </div>
          </div>*/}

          {/* Action buttons */}

          <div className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1"
              disabled={selectedParams.length === 0 || analyticsLoading}
              onClick={handlePreview}
            >
              <Eye className="h-4 w-4 mr-2" />
              Preview
            </Button>
            <Button
              className="flex-1"
              disabled={selectedParams.length === 0 || exporting}
              onClick={handleExport}
            >
              {exporting ? (
                <><Loader2 className="h-4 w-4 mr-2 animate-spin" />Exporting...</>
              ) : exported ? (
                <><Check className="h-4 w-4 mr-2" />Done!</>
              ) : (
                <><Download className="h-4 w-4 mr-2" />Export {format}</>
              )}
            </Button>
          </div>

        </div>
        <div className="grid grid-cols-1">
          {/* Parameters */}
          <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Parameters</span>
                <span className="text-[10px] font-mono bg-primary/10 text-primary px-1.5 py-0.5 rounded-full">
                  {selectedParams.length}/{allParams.length}
                </span>
              </div>
              <button
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setSelectedParams(selectedParams.length === allParams.length ? [] : [...allParams])}
              >
                {selectedParams.length === allParams.length ? "Deselect all" : "Select all"}
              </button>
            </div>
            <div className="p-4 flex flex-wrap gap-2">
              {allParams.map((p) => (
                <Badge
                  key={p}
                  variant={selectedParams.includes(p) ? "default" : "outline"}
                  className="cursor-pointer transition-all select-none hover:opacity-80 text-xs"
                  onClick={() => toggleParam(p)}
                >
                  {selectedParams.includes(p) && <Check className="h-2.5 w-2.5 mr-1" />}
                  {p}
                </Badge>
              ))}
            </div>
          </div>

        <div className="lg:col-span-5 space-y-4">
          
          {/* Preview Table */}
          <div className="rounded-xl border bg-card mt-6 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b bg-muted/40 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Data Preview</span>
                <div className=" flex gap-2">
                  {formats.map((f) => (
                    <button
                      key={f.label}
                      data-active={format === f.label}
                      onClick={() => setFormat(f.label)}
                      className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-xs font-semibold rounded-lg border transition-all ${f.color}`}
                    >
                      <f.icon className="h-3.5 w-3.5" />
                      {f.label}
                    </button>
                  ))}
                </div>
                {previewing && !analyticsLoading && (
                  <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-1.5 py-0.5 rounded-full">
                    Showing first {previewRows.length} rows
                  </span>
                )}
              </div>
              {exported && (
                <span className="flex items-center gap-1 text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold">
                  <Check className="h-3 w-3" /> Exported as {format}
                </span>
              )}
            </div>

            {/* Empty state */}
            {!previewing && (
              <div className="flex flex-col items-center justify-center py-14 gap-3">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
                  <Eye className="h-5 w-5 text-muted-foreground" />
                </div>
                <p className="text-sm text-muted-foreground">Click <span className="font-semibold">Preview</span> to see data before exporting</p>
              </div>
            )}

            {/* Loading */}
            {previewing && analyticsLoading && (
              <div className="flex items-center justify-center py-14 gap-2">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading preview...</p>
              </div>
            )}

            {/* Table */}
            {previewing && !analyticsLoading && previewRows.length > 0 && (
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b bg-muted/20">
                      <th className="text-left px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">Timestamp</th>
                      {previewColumns.map((p) => (
                        <th key={p} className="text-right px-3 py-2 font-semibold text-muted-foreground whitespace-nowrap">{p}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {previewRows.map((row: any, i: number) => (
                      <tr key={i} className="border-b last:border-0 hover:bg-muted/20 transition-colors">
                        <td className="px-3 py-2 font-mono text-muted-foreground whitespace-nowrap">{row.timestamp ?? "—"}</td>
                        {previewColumns.map((p) => (
                          <td key={p} className="px-3 py-2 text-right font-mono whitespace-nowrap">
                            {row[paramKeyMap[p]] ?? "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* No data */}
            {previewing && !analyticsLoading && previewRows.length === 0 && (
              <div className="flex flex-col items-center justify-center py-14 gap-2">
                <p className="text-sm text-muted-foreground">No data found for the selected range</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}