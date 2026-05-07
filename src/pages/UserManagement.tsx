import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Search, Users, UserPlus, Pencil, Trash2, X,
  ShieldCheck, Shield, Eye, EyeOff, AlertTriangle, Check,
} from "lucide-react";

// ── Types ──────────────────────────────────────────────
type Role   = "Admin" | "Operator" | "Viewer";
type Status = "Active" | "Inactive";

interface User {
  id:        string;
  name:      string;
  email:     string;
  role:      Role;
  status:    Status;
  createdAt: string;
}

// ── Seed data ──────────────────────────────────────────
const seed: User[] = [
  { id: "u1", name: "Chisomo Banda",    email: "chisomo@egenco.mw",   role: "Admin",    status: "Active",   createdAt: "2025-01-10" },
  { id: "u2", name: "Takondwa Phiri",   email: "takondwa@egenco.mw",  role: "Operator", status: "Active",   createdAt: "2025-02-14" },
  { id: "u3", name: "Kondwani Mwale",   email: "kondwani@egenco.mw",  role: "Viewer",   status: "Active",   createdAt: "2025-03-05" },
  { id: "u4", name: "Thandiwe Chirwa",  email: "thandiwe@egenco.mw",  role: "Operator", status: "Inactive", createdAt: "2025-03-20" },
  { id: "u5", name: "Dalitso Tembo",    email: "dalitso@egenco.mw",   role: "Viewer",   status: "Active",   createdAt: "2025-04-01" },
];

// ── Styling maps ───────────────────────────────────────
const roleMeta: Record<Role, { badge: string; icon: typeof Shield }> = {
  Admin:    { badge: "bg-violet-500/10 text-violet-600 border-violet-200 dark:text-violet-400 dark:border-violet-800", icon: ShieldCheck },
  Operator: { badge: "bg-sky-500/10 text-sky-600 border-sky-200 dark:text-sky-400 dark:border-sky-800",               icon: Shield },
  Viewer:   { badge: "bg-slate-500/10 text-slate-600 border-slate-200 dark:text-slate-400 dark:border-slate-700",     icon: Eye },
};

const statusMeta: Record<Status, { badge: string; dot: string }> = {
  Active:   { badge: "bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:text-emerald-400 dark:border-emerald-800", dot: "bg-emerald-400 animate-pulse shadow-[0_0_6px_2px_rgba(52,211,153,0.4)]" },
  Inactive: { badge: "bg-slate-500/10 text-slate-600 border-slate-200 dark:text-slate-400 dark:border-slate-700",           dot: "bg-slate-400" },
};

const roles: Role[]     = ["Admin", "Operator", "Viewer"];
const statuses: Status[] = ["Active", "Inactive"];

const emptyForm = { name: "", email: "", role: "Operator" as Role, status: "Active" as Status, password: "" };

// ── Modal ──────────────────────────────────────────────
function UserModal({
  mode, user, onClose, onSave,
}: {
  mode:    "create" | "edit";
  user?:   User;
  onClose: () => void;
  onSave:  (data: Omit<User, "id" | "createdAt"> & { password?: string }) => void;
}) {
  const [form, setForm]       = useState({ name: user?.name ?? "", email: user?.email ?? "", role: user?.role ?? "Operator" as Role, status: user?.status ?? "Active" as Status, password: "" });
  const [showPw, setShowPw]   = useState(false);
  const [errors, setErrors]   = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim())  e.name  = "Name is required";
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email address";
    if (mode === "create" && !form.password) e.password = "Password is required";
    else if (form.password && form.password.length < 8) e.password = "Minimum 8 characters";
    return e;
  };

  const handleSubmit = () => {
    const e = validate();
    if (Object.keys(e).length) { setErrors(e); return; }
    onSave({ name: form.name, email: form.email, role: form.role, status: form.status, password: form.password });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative bg-card rounded-2xl border shadow-2xl w-full max-w-md overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b bg-muted/40">
          <div className="flex items-center gap-2">
            {mode === "create"
              ? <UserPlus className="h-4 w-4 text-primary" />
              : <Pencil className="h-4 w-4 text-primary" />
            }
            <h2 className="text-sm font-semibold">
              {mode === "create" ? "Add New User" : `Edit — ${user?.name}`}
            </h2>
          </div>
          <button onClick={onClose} className="h-7 w-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
            <X className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Name */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Full Name</label>
            <Input
              placeholder="e.g. Chisomo Banda"
              value={form.name}
              onChange={(e) => { setForm((f) => ({ ...f, name: e.target.value })); setErrors((er) => ({ ...er, name: "" })); }}
              className={errors.name ? "border-red-400 focus-visible:ring-red-300" : ""}
            />
            {errors.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Email Address</label>
            <Input
              type="email"
              placeholder="user@egenco.mw"
              value={form.email}
              onChange={(e) => { setForm((f) => ({ ...f, email: e.target.value })); setErrors((er) => ({ ...er, email: "" })); }}
              className={errors.email ? "border-red-400 focus-visible:ring-red-300" : ""}
            />
            {errors.email && <p className="text-xs text-red-500 mt-1">{errors.email}</p>}
          </div>

          {/* Password */}
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              {mode === "create" ? "Password" : "New Password (leave blank to keep)"}
            </label>
            <div className="relative">
              <Input
                type={showPw ? "text" : "password"}
                placeholder={mode === "create" ? "Min. 8 characters" : "Leave blank to keep current"}
                value={form.password}
                onChange={(e) => { setForm((f) => ({ ...f, password: e.target.value })); setErrors((er) => ({ ...er, password: "" })); }}
                className={`pr-10 ${errors.password ? "border-red-400 focus-visible:ring-red-300" : ""}`}
              />
              <button
                type="button"
                onClick={() => setShowPw((s) => !s)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && <p className="text-xs text-red-500 mt-1">{errors.password}</p>}
          </div>

          {/* Role + Status row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Role</label>
              <select
                value={form.role}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as Role }))}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {roles.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
              <select
                value={form.status}
                onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Status }))}
                className="w-full border rounded-lg px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                {statuses.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 px-5 py-4 border-t bg-muted/20">
          <Button variant="outline" size="sm" onClick={onClose}>Cancel</Button>
          <Button size="sm" onClick={handleSubmit}>
            <Check className="h-3.5 w-3.5 mr-1.5" />
            {mode === "create" ? "Create User" : "Save Changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Delete Confirm Modal ───────────────────────────────
function DeleteModal({ user, onClose, onConfirm }: { user: User; onClose: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-card rounded-2xl border shadow-2xl w-full max-w-sm overflow-hidden">
        <div className="p-6 text-center space-y-3">
          <div className="h-14 w-14 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-7 w-7 text-red-500" />
          </div>
          <h2 className="text-base font-semibold">Delete User?</h2>
          <p className="text-sm text-muted-foreground">
            This will permanently remove <span className="font-semibold text-foreground">{user.name}</span> and cannot be undone.
          </p>
        </div>
        <div className="flex gap-2 px-5 pb-5">
          <Button variant="outline" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" className="flex-1" onClick={onConfirm}>
            <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
          </Button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ──────────────────────────────────────────
export default function UserManagement() {
  const [users, setUsers]         = useState<User[]>(seed);
  const [search, setSearch]       = useState("");
  const [roleFilter, setRoleFilter] = useState<Role | "All">("All");
  const [modal, setModal]         = useState<"create" | "edit" | "delete" | null>(null);
  const [selected, setSelected]   = useState<User | null>(null);

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole   = roleFilter === "All" || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const counts = {
    Admin:    users.filter((u) => u.role === "Admin").length,
    Operator: users.filter((u) => u.role === "Operator").length,
    Viewer:   users.filter((u) => u.role === "Viewer").length,
    Active:   users.filter((u) => u.status === "Active").length,
  };

  const handleCreate = (data: Omit<User, "id" | "createdAt"> & { password?: string }) => {
    const newUser: User = {
      id:        `u${Date.now()}`,
      name:      data.name,
      email:     data.email,
      role:      data.role,
      status:    data.status,
      createdAt: new Date().toISOString().split("T")[0],
    };
    setUsers((prev) => [newUser, ...prev]);
    setModal(null);
  };

  const handleEdit = (data: Omit<User, "id" | "createdAt"> & { password?: string }) => {
    setUsers((prev) => prev.map((u) => u.id === selected?.id ? { ...u, name: data.name, email: data.email, role: data.role, status: data.status } : u));
    setModal(null);
    setSelected(null);
  };

  const handleDelete = () => {
    setUsers((prev) => prev.filter((u) => u.id !== selected?.id));
    setModal(null);
    setSelected(null);
  };

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="relative rounded-2xl overflow-hidden bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-5 text-white shadow-xl">
        <div className="absolute inset-0 opacity-5 bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:24px_24px]" />
        <div className="absolute -top-8 -right-8 h-36 w-36 rounded-full bg-violet-500/20 blur-3xl" />
        <div className="relative z-10 flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Users className="h-5 w-5 text-violet-400" />
              <h1 className="text-xl font-bold tracking-tight">User Management</h1>
            </div>
            <p className="text-slate-400 text-sm">Manage system access and permissions</p>
          </div>
          <Button
            onClick={() => { setSelected(null); setModal("create"); }}
            className="bg-white text-slate-900 hover:bg-slate-100 font-semibold"
          >
            <UserPlus className="h-4 w-4 mr-2" />
            Add User
          </Button>
        </div>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Admins",    value: counts.Admin,    color: "text-violet-600 dark:text-violet-400", bar: "bg-violet-400", track: "bg-violet-100 dark:bg-violet-900/30" },
          { label: "Operators", value: counts.Operator, color: "text-sky-600 dark:text-sky-400",       bar: "bg-sky-400",    track: "bg-sky-100 dark:bg-sky-900/30" },
          { label: "Viewers",   value: counts.Viewer,   color: "text-slate-600 dark:text-slate-400",   bar: "bg-slate-400",  track: "bg-slate-100 dark:bg-slate-800" },
          { label: "Active",    value: counts.Active,   color: "text-emerald-600 dark:text-emerald-400", bar: "bg-emerald-400", track: "bg-emerald-100 dark:bg-emerald-900/30" },
        ].map((k) => (
          <div key={k.label} className="rounded-xl border bg-card p-4 shadow-sm">
            <p className="text-xs text-muted-foreground mb-1">{k.label}</p>
            <p className={`text-2xl font-black font-mono ${k.color}`}>{k.value}</p>
            <div className={`mt-2 h-1 rounded-full ${k.track} overflow-hidden`}>
              <div className={`h-full rounded-full ${k.bar}`} style={{ width: `${(k.value / users.length) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 items-center">
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        <div className="flex gap-1.5">
          {(["All", ...roles] as const).map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                roleFilter === r
                  ? r === "All"      ? "bg-primary text-primary-foreground border-primary"
                  : r === "Admin"    ? "bg-violet-500 text-white border-violet-500"
                  : r === "Operator" ? "bg-sky-500 text-white border-sky-500"
                  :                    "bg-slate-500 text-white border-slate-500"
                  : r === "Admin"    ? "border-violet-200 text-violet-600 hover:bg-violet-50 dark:border-violet-800 dark:text-violet-400"
                  : r === "Operator" ? "border-sky-200 text-sky-600 hover:bg-sky-50 dark:border-sky-800 dark:text-sky-400"
                  : r === "Viewer"   ? "border-slate-200 text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-400"
                  :                    "border-border text-muted-foreground hover:bg-muted"
              }`}
            >
              {r}
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
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">User</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Created</th>
                <th className="text-center px-4 py-3 font-semibold text-muted-foreground text-xs uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => {
                const rm = roleMeta[user.role];
                const sm = statusMeta[user.status];
                return (
                  <tr key={user.id} className="border-b last:border-0 hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-primary/20 to-primary/40 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-primary">
                            {user.name.split(" ").map((n) => n[0]).join("").slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <p className="font-medium text-sm">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`${rm.badge} border text-xs font-mono`}>
                        <rm.icon className="h-2.5 w-2.5 mr-1" />
                        {user.role}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="outline" className={`${sm.badge} border text-xs font-mono`}>
                        <span className={`inline-block h-1.5 w-1.5 rounded-full mr-1.5 ${sm.dot}`} />
                        {user.status}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{user.createdAt}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-1.5 justify-center">
                        <Button
                          size="sm" variant="outline"
                          className="h-7 text-xs border-sky-200 text-sky-700 hover:bg-sky-500 hover:text-white hover:border-sky-500 dark:border-sky-800 dark:text-sky-400 transition-colors"
                          onClick={() => { setSelected(user); setModal("edit"); }}
                        >
                          <Pencil className="h-3 w-3 mr-1" /> Edit
                        </Button>
                        <Button
                          size="sm" variant="outline"
                          className="h-7 text-xs border-red-200 text-red-600 hover:bg-red-500 hover:text-white hover:border-red-500 dark:border-red-900 dark:text-red-400 transition-colors"
                          onClick={() => { setSelected(user); setModal("delete"); }}
                        >
                          <Trash2 className="h-3 w-3 mr-1" /> Delete
                        </Button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-12 gap-3">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center">
              <Users className="h-5 w-5 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">No users found</p>
          </div>
        )}
      </div>

      <p className="text-xs text-muted-foreground text-right">
        Showing <span className="font-semibold text-foreground">{filtered.length}</span> of <span className="font-semibold text-foreground">{users.length}</span> users
      </p>

      {/* Modals */}
      {modal === "create" && (
        <UserModal mode="create" onClose={() => setModal(null)} onSave={handleCreate} />
      )}
      {modal === "edit" && selected && (
        <UserModal mode="edit" user={selected} onClose={() => { setModal(null); setSelected(null); }} onSave={handleEdit} />
      )}
      {modal === "delete" && selected && (
        <DeleteModal user={selected} onClose={() => { setModal(null); setSelected(null); }} onConfirm={handleDelete} />
      )}
    </div>
  );
}