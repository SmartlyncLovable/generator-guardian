import { useParams, useNavigate } from "react-router-dom";
import { useGenerator, useGeneratorAnalytics } from "@/hooks/useGenerators";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft, BarChart3, Gauge, Clock, Zap, Activity,
  AlertTriangle, MapPin, Cpu,
} from "lucide-react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

const statusMeta = {
  Running: {
    badge: "bg-emerald-500/10 border-emerald-500/30 text-emerald-400",
    dot:   "bg-emerald-400 shadow-[0_0_6px_2px_rgba(52,211,153,0.5)] animate-pulse",
  },
  Stopped: {
    badge: "bg-slate-500/10 border-slate-500/30 text-slate-400",
    dot:   "bg-slate-400",
  },
  Fault: {
    badge: "bg-red-500/10 border-red-500/30 text-red-400",
    dot:   "bg-red-400 shadow-[0_0_6px_2px_rgba(239,68,68,0.5)] animate-pulse",
  },
} as const;

const charts = [
  { title: "Voltage (V)", dataKey: "generator_voltage", color: "hsl(142, 70%, 45%)" },
  { title: "Frequency (Hz)", dataKey: "generator_frequency", color: "hsl(38, 92%, 50%)" },
  { title: "Oil Pressure (PSI)", dataKey: "oil_pressure", color: "hsl(210, 100%, 55%)" },
  { title: "Coolant Temperature (°C)", dataKey: "coolant_temperature", color: "hsl(0, 72%, 51%)" },
];

function formatDate(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getTodayRange() {
  const today = new Date();
  const date = formatDate(today);
  return { startDate: date, endDate: date };
}

export default function Analytics() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: generator, loading, error } = useGenerator(id!);
  const gen = generator;

  const { startDate, endDate } = getTodayRange();
  const { data: analytics, loading: analyticsLoading, error: analyticsError } = useGeneratorAnalytics(id!, "none", startDate, endDate);

  const chartData = analytics;

  /* ---------- Loading ---------- */
  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <p className="text-sm text-muted-foreground">Loading generator data...</p>
    </div>
  );

  /* ---------- Error ---------- */
  if (error || !gen) return (
    <div className="flex flex-col items-center justify-center h-64 gap-4">
      <div className="h-14 w-14 rounded-full bg-red-500/10 flex items-center justify-center">
        <AlertTriangle className="h-7 w-7 text-red-500" />
      </div>
      <div className="text-center">
        <p className="font-semibold">Generator not found</p>
        <p className="text-xs text-muted-foreground mt-1">The requested unit could not be located</p>
      </div>
      <Button variant="outline" size="sm" onClick={() => navigate("/")}>
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Dashboard
      </Button>
    </div>
  );

  const status = (gen.status ?? "Stopped") as keyof typeof statusMeta;
  const meta   = statusMeta[status] ?? statusMeta.Stopped;

  const kpis = [
    { label: "Engine Speed",  value: `${gen.engine_speed} RPM`,                                                icon: Gauge    },
    { label: "Engine Starts", value: `${gen.engine_starts?.toLocaleString() ?? "—"}`,                          icon: Activity },
    { label: "Engine Hours",  value: `${gen.engine_hours?.toLocaleString() ?? "—"} h`,                         icon: Clock    },
    { label: "Voltage",       value: `${gen.voltage} V`,                                                        icon: Zap      },
    { label: "Frequency",     value: `${gen.frequency} Hz`,                                                     icon: Zap      },
    { label: "Status",        value: gen.status?.charAt(0).toUpperCase() + gen.status?.slice(1).toLowerCase(),  icon: Activity },
  ];

  return (
    <div className="space-y-6">

      {/* ── Header Banner ── */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 text-white shadow-xl">
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute -top-8 -right-8 h-36 w-36 rounded-full bg-primary/20 blur-3xl" />

        <div className="relative z-10 flex items-center gap-4 flex-wrap">
          <Button variant="ghost" size="icon" className="text-white hover:bg-white/10 shrink-0" onClick={() => navigate("/")}>
            <ArrowLeft className="h-4 w-4" />
          </Button>

          <div className="h-12 w-12 rounded-xl bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
            <BarChart3 className="h-6 w-6 text-white" />
          </div>

          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold tracking-tight truncate">{gen.name}</h1>
            <span className="flex items-center gap-1 text-slate-400 text-xs mt-0.5">
              <MapPin className="h-3 w-3" />{gen.location}
            </span>
          </div>

          {/* Status badge */}
          <div className={`flex items-center gap-1.5 border text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 ${meta.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
            {status}
          </div>

          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs bg-white/10 border-white/20 text-white hover:bg-white/20 shrink-0"
            onClick={() => navigate(`/live_parameters/${id}`)}
          >
            <Activity className="h-3 w-3 mr-1.5" />
            Live Parameters
          </Button>
        </div>
      </div>

      {/* ── Power + Alarms ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

        {/* Generator Power */}
        <div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/40">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-violet-500" /> Generator Power
            </h3>
          </div>
          <div className="p-4 grid grid-cols-3 gap-3">
            {[
              { label: "kW",   value: gen.generator_kw  },
              { label: "kVA",  value: gen.gen_kva        },
              { label: "kVAR", value: gen.gen_kvar       },
            ].map(({ label, value }) => (
              <div key={label} className="text-center bg-muted/40 rounded-lg py-2 px-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-base font-black font-mono text-violet-600 dark:text-violet-400">
                  {value?.toLocaleString() ?? "—"}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Mains Power */}
        {/*<div className="rounded-xl border bg-card shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/40">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Cpu className="h-3.5 w-3.5 text-sky-500" /> Mains Power
            </h3>
          </div>
          <div className="p-4 grid grid-cols-2 gap-3">
            {[
              { label: "kVA",   value: gen.mains_kva  },
              { label: "kVAR", value: gen.mains_kvar },
            ].map(({ label, value }) => (
              <div key={label} className="text-center bg-muted/40 rounded-lg py-2 px-1">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-base font-black font-mono text-sky-600 dark:text-sky-400">
                  {value?.toLocaleString() ?? "—"}
                </p>
              </div>
            ))}
          </div>
        </div>*/}

        {/* Alarms */}
        <div className="rounded-xl border bg-card col-span-2 shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b bg-muted/40">
            <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <AlertTriangle className="h-3.5 w-3.5 text-red-500" /> Alarms
            </h3>
          </div>
          <div className="p-4 flex flex-wrap gap-2">
            {(gen.alarms ?? []).map((alarm: string, i: number) => (
              <Badge
                key={i}
                variant="outline"
                className={alarm === "None"
                  ? "text-muted-foreground border-border text-xs"
                  : "bg-red-500/10 text-red-600 border-red-200 dark:text-red-400 dark:border-red-800 text-xs"
                }
              >
                {alarm === "None" ? "No alarm" : `Alarm ${i + 1}: ${alarm}`}
              </Badge>
            ))}
            {(gen.alarms ?? []).filter((a: string) => a !== "None").length === 0 && (
              <p className="text-xs text-muted-foreground flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /> No active alarms
              </p>
            )}
          </div>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi, i) => (
          <div key={kpi.label} className="rounded-xl border bg-card p-4 shadow-sm">

            {/* Engine Speed */}
            {i === 0 && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <kpi.icon className="h-3.5 w-3.5" />
                    <span className="text-xs">{kpi.label}</span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-sky-500/10 text-sky-600 dark:text-sky-400">RPM</span>
                </div>
                <p className="text-lg font-bold font-mono text-sky-600 dark:text-sky-400">
                  {gen.engine_speed?.toLocaleString() ?? "—"}
                </p>
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-sky-400 to-blue-500 transition-all duration-700"
                    style={{ width: `${Math.min((gen.engine_speed / 3000) * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">of 3000 RPM max</p>
              </>
            )}

            {/* Engine Starts — shows a start count with a subtle fire/ignition tint */}
            {i === 1 && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <kpi.icon className="h-3.5 w-3.5" />
                    <span className="text-xs">{kpi.label}</span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-orange-500/10 text-orange-500">starts</span>
                </div>
                <p className="text-lg font-bold font-mono text-orange-500 dark:text-orange-400">
                  {gen.engine_starts?.toLocaleString() ?? "—"}
                </p>
                <p className="text-[10px] text-muted-foreground mt-2">total ignition cycles</p>
              </>
            )}

            {/* Engine Hours — progress bar toward a 500h service interval */}
            {i === 2 && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <kpi.icon className="h-3.5 w-3.5" />
                    <span className="text-xs">{kpi.label}</span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-600 dark:text-amber-400">hrs</span>
                </div>
                <p className="text-lg font-bold font-mono text-amber-600 dark:text-amber-400">
                  {gen.engine_hours?.toLocaleString() ?? "—"}
                </p>
                <div className="mt-2 h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-yellow-500 transition-all duration-700"
                    style={{ width: `${Math.min(((gen.engine_hours ?? 0) % 500) / 500 * 100, 100)}%` }}
                  />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">
                  {500 - ((gen.engine_hours ?? 0) % 500)} h to next service
                </p>
              </>
            )}

            {/* Voltage — colored value with stability indicator */}
            {i === 3 && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <kpi.icon className="h-3.5 w-3.5" />
                    <span className="text-xs">{kpi.label}</span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-600 dark:text-violet-400">V</span>
                </div>
                <p className="text-lg font-bold font-mono text-violet-600 dark:text-violet-400">{gen.voltage}</p>
                <p className="text-[10px] mt-2 flex items-center gap-1">
                  {gen.voltage >= 210 && gen.voltage <= 24000
                    ? <><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /><span className="text-emerald-600 dark:text-emerald-400">Within normal range</span></>
                    : <><span className="h-1.5 w-1.5 rounded-full bg-red-400" /><span className="text-red-500">Out of range</span></>
                  }
                </p>
              </>
            )}

            {/* Frequency — colored value with stability indicator */}
            {i === 4 && (
              <>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <kpi.icon className="h-3.5 w-3.5" />
                    <span className="text-xs">{kpi.label}</span>
                  </div>
                  <span className="text-[10px] font-mono font-semibold px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">Hz</span>
                </div>
                <p className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-400">{gen.frequency}</p>
                <p className="text-[10px] mt-2 flex items-center gap-1">
                  {gen.frequency >= 49 && gen.frequency <= 51
                    ? <><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" /><span className="text-emerald-600 dark:text-emerald-400">Stable at 50 Hz</span></>
                    : <><span className="h-1.5 w-1.5 rounded-full bg-red-400" /><span className="text-red-500">Frequency drift</span></>
                  }
                </p>
              </>
            )}

            {/* Status — colored badge matching the generator state */}
            {i === 5 && (
              <>
                <div className="flex items-center gap-2 text-muted-foreground mb-2">
                  <kpi.icon className="h-3.5 w-3.5" />
                  <span className="text-xs">{kpi.label}</span>
                </div>
                <div className={`inline-flex items-center gap-1.5 border text-xs font-semibold px-2 py-1 rounded-full ${meta.badge}`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${meta.dot}`} />
                  {status}
                </div>
                <p className="text-[10px] text-muted-foreground mt-2">current state</p>
              </>
            )}

          </div>
        ))}
      </div>

      {/* ── Charts ── */}
      <div className="rounded-xl border bg-card shadow-sm overflow-hidden mb-4">
        <div className="px-4 py-3 border-b bg-muted/40 flex items-center justify-between">
          <h3 className="text-sm font-semibold">Historical Trends — Today</h3>
          {analyticsLoading && (
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <div className="h-3 w-3 rounded-full border-2 border-primary border-t-transparent animate-spin" />
              Loading chart data...
            </div>
          )}
        </div>
      </div>

      {analyticsError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 dark:bg-red-950/20 dark:border-red-900/50 p-6 text-center">
          <AlertTriangle className="h-6 w-6 text-red-500 mx-auto mb-2" />
          <p className="text-sm font-medium text-red-600 dark:text-red-400">Failed to load analytics data</p>
          <p className="text-xs text-muted-foreground mt-1">{analyticsError}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {charts.map((chart) => (
            <div key={chart.title} className="rounded-xl border bg-card shadow-sm overflow-hidden">
              <div className="px-4 py-3 border-b bg-muted/40">
                <h3 className="text-sm font-semibold">{chart.title}</h3>
              </div>
              <div className="p-4 h-72">
                {analyticsLoading && chartData.length === 0 ? (
                  <div className="flex items-center justify-center h-full">
                    <div className="h-8 w-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                  </div>
                ) : chartData.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-xs text-muted-foreground">
                    No data available for today
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 4, right: 8, left: -16, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="hsl(220,15%,92%)" />
                      <XAxis dataKey="timestamp" tick={{ fontSize: 9 }} stroke="hsl(220,10%,60%)" />
                      <YAxis tick={{ fontSize: 9 }} stroke="hsl(220,10%,60%)" />
                      <Tooltip
                        contentStyle={{
                          background: "hsl(0,0%,100%)",
                          border: "1px solid hsl(220,15%,90%)",
                          borderRadius: 8,
                          fontSize: 11,
                          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
                        }}
                      />
                      <Line
                        type="monotone"
                        dataKey={chart.dataKey}
                        stroke={chart.color}
                        strokeWidth={2}
                        dot={false}
                        activeDot={{ r: 4, strokeWidth: 0 }}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

    </div>
  );
}