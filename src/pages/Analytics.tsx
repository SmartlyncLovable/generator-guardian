import { useParams, useNavigate } from "react-router-dom";
import { generators, generateTimeSeries } from "@/data/generators";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Gauge, Clock, Zap, Activity, AlertTriangle } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useMemo } from "react";

export default function Analytics() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const gen = generators.find((g) => g.id === id);

  const oilData = useMemo(() => gen ? generateTimeSeries(gen.oilPressure, 8) : [], [gen]);
  const coolantData = useMemo(() => gen ? generateTimeSeries(gen.coolantTemp, 10) : [], [gen]);
  const batteryData = useMemo(() => gen ? generateTimeSeries(gen.engineBattery, 2) : [], [gen]);
  const pfData = useMemo(() => gen ? generateTimeSeries(gen.mainsPF || 0.9, 0.1) : [], [gen]);

  if (!gen) {
    return (
      <div className="p-8 text-center">
        <p className="text-muted-foreground">Generator not found</p>
        <Button variant="outline" className="mt-4" onClick={() => navigate("/")}>Back to Dashboard</Button>
      </div>
    );
  }

  const statusColor = gen.status === "Running" ? "text-[hsl(var(--status-running))]"
    : gen.status === "Fault" ? "text-[hsl(var(--status-fault))]"
    : "text-[hsl(var(--status-stopped))]";

  const charts = [
    { title: "Oil Pressure (PSI)", data: oilData, color: "hsl(210, 100%, 55%)" },
    { title: "Coolant Temperature (°C)", data: coolantData, color: "hsl(0, 72%, 51%)" },
    { title: "Engine Battery (V)", data: batteryData, color: "hsl(142, 70%, 45%)" },
    { title: "Mains Power Factor", data: pfData, color: "hsl(38, 92%, 50%)" },
  ];

  const kpis = [
    { label: "Engine Speed", value: `${gen.engineSpeed} RPM`, icon: Gauge },
    { label: "Engine Starts", value: gen.engineStarts.toLocaleString(), icon: Activity },
    { label: "Engine Hours", value: gen.engineHours.toLocaleString(), icon: Clock },
    { label: "Voltage", value: `${gen.voltage} V`, icon: Zap },
    { label: "Frequency", value: `${gen.frequency} Hz`, icon: Zap },
    { label: "Control Mode", value: gen.controlMode, icon: Activity },
  ];

  const activeAlarms = gen.alarms.filter((a) => a !== "None");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate("/")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{gen.name}</h1>
          <p className="text-muted-foreground text-sm font-mono">{gen.id} · <span className={statusColor}>{gen.status}</span></p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="kpi-card">
            <div className="flex items-center gap-2 text-muted-foreground mb-1">
              <kpi.icon className="h-3.5 w-3.5" />
              <span className="text-xs">{kpi.label}</span>
            </div>
            <p className="text-lg font-semibold font-mono">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {charts.map((chart) => (
          <div key={chart.title} className="bg-card rounded-lg border p-4 shadow-sm">
            <h3 className="text-sm font-medium mb-3">{chart.title}</h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chart.data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 90%)" />
                  <XAxis dataKey="time" tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 50%)" />
                  <YAxis tick={{ fontSize: 10 }} stroke="hsl(220, 10%, 50%)" />
                  <Tooltip
                    contentStyle={{ background: "hsl(0, 0%, 100%)", border: "1px solid hsl(220, 15%, 90%)", borderRadius: 8, fontSize: 12 }}
                  />
                  <Line type="monotone" dataKey="value" stroke={chart.color} strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        ))}
      </div>

      {/* Energy Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-card rounded-lg border p-4 shadow-sm">
          <h3 className="text-sm font-medium mb-3">Generator Power</h3>
          <div className="grid grid-cols-3 gap-3">
            <div><p className="text-xs text-muted-foreground">kWh</p><p className="text-lg font-mono font-semibold">{gen.genPower.kWh.toLocaleString()}</p></div>
            <div><p className="text-xs text-muted-foreground">kVAh</p><p className="text-lg font-mono font-semibold">{gen.genPower.kVAh.toLocaleString()}</p></div>
            <div><p className="text-xs text-muted-foreground">kVARh</p><p className="text-lg font-mono font-semibold">{gen.genPower.kVARh.toLocaleString()}</p></div>
          </div>
        </div>
        <div className="bg-card rounded-lg border p-4 shadow-sm">
          <h3 className="text-sm font-medium mb-3">Mains Power</h3>
          <div className="grid grid-cols-2 gap-3">
            <div><p className="text-xs text-muted-foreground">kWh</p><p className="text-lg font-mono font-semibold">{gen.mainsPower.kWh.toLocaleString()}</p></div>
            <div><p className="text-xs text-muted-foreground">kVARh</p><p className="text-lg font-mono font-semibold">{gen.mainsPower.kVARh.toLocaleString()}</p></div>
          </div>
        </div>
      </div>

      {/* Alarms */}
      <div className="bg-card rounded-lg border p-4 shadow-sm">
        <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4" />
          Alarms
        </h3>
        <div className="flex flex-wrap gap-2">
          {gen.alarms.map((alarm, i) => (
            <Badge
              key={i}
              variant="outline"
              className={alarm === "None" ? "status-stopped border" : "status-fault border"}
            >
              Alarm {i + 1}: {alarm}
            </Badge>
          ))}
        </div>
        {activeAlarms.length === 0 && (
          <p className="text-sm text-muted-foreground mt-2">No active alarms</p>
        )}
      </div>
    </div>
  );
}
