import { useParams, useNavigate } from "react-router-dom";
import { useGeneratorIP } from "@/hooks/useGenerators";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Activity, MapPin, Wifi, AlertTriangle, Loader2 } from "lucide-react";

export default function LiveParameters() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: generatorIP, loading, error } = useGeneratorIP(id!);
  const gen = generatorIP;

  /* ---------- Loading ---------- */
  if (loading) return (
    <div className="flex flex-col items-center justify-center h-64 gap-3">
      <div className="h-10 w-10 rounded-full border-2 border-primary border-t-transparent animate-spin" />
      <p className="text-sm text-muted-foreground">Connecting to generator...</p>
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

  return (
    <div className="space-y-6">

      {/* Header banner */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 text-white shadow-xl">
        {/* Decorative grid */}
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:24px_24px]" />
        {/* Glows */}
        <div className="absolute -top-8 -right-8 h-36 w-36 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute -bottom-8 -left-8 h-36 w-36 rounded-full bg-primary/10 blur-3xl" />

        <div className="relative z-10 flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/10 shrink-0"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>

          {/* Icon */}
          <div className="h-12 w-12 rounded-xl bg-sky-500/20 border border-sky-500/30 flex items-center justify-center shrink-0">
            <Activity className="h-6 w-6 text-sky-400" />
          </div>

          {/* Title */}
          <div className="flex-1 min-w-0">
            <h1 className="text-xl font-bold tracking-tight truncate">{gen.name}</h1>
            <div className="flex items-center gap-3 mt-1 flex-wrap">
              <span className="flex items-center gap-1 text-slate-400 text-xs">
                <MapPin className="h-3 w-3" />
                {gen.location}
              </span>
              <span className="flex items-center gap-1 text-slate-400 text-xs font-mono">
                <Wifi className="h-3 w-3" />
                {gen.ip_address}
              </span>
            </div>
          </div>

          {/* Live badge */}
          <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold px-3 py-1.5 rounded-full shrink-0">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse shadow-[0_0_6px_2px_rgba(52,211,153,0.5)]" />
            LIVE
          </div>
        </div>
      </div>

      {/* iFrame panel */}
      <div className="relative rounded-xl overflow-hidden border border-sky-100 dark:border-sky-900/40 shadow-sm bg-card">
        {/* Top accent strip */}
        <div className="h-1 w-full bg-gradient-to-r from-sky-400 via-primary to-violet-500" />

        {/* Panel header */}
        <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Live Parameters Feed</span>
          </div>
          <span className="text-xs font-mono text-muted-foreground bg-muted px-2 py-0.5 rounded">
            {gen.ip_address}
          </span>
        </div>

        <iframe
          src={`http://${gen.ip_address}/live-parameters`}
          title="Live Parameters"
          className="w-full h-[620px] border-0"
        />
      </div>

    </div>
  );
}