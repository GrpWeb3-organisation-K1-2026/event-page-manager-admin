"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";

interface Event {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  place: string;
  _count?: { sessions: number };
}

interface Room {
  id: number;
  name: string;
  createdAt: string;
  _count?: { sessions: number };
}

interface Speaker {
  id: number;
  fullName: string;
  biography: string;
  photo?: string | null;
  links?: Record<string, string> | null;
  sessions?: { session: { id: number; title: string; startDate: string; endDate: string } }[];
}

interface Session {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  capacity: number;
  roomId?: number;
  eventId?: numb
  room?: { id: number; name: string };
  event?: { id: number; title: string };
  speakers?: { speaker: { id: number; fullName: string } }[];
  isLive?: boolean;
  isUpcoming?: boolean;
  isEnded?: boolean;
}

interface Question {
  id: number;
  content: string;
  name: string | null;
  upvotes: number;
  createdAt: string;
  sessionId: number;
}

interface Meta {
  total: number;
  page: number;
  limit: number;
  pageCount: number;
}

type TabId = "events" | "sessions" | "speakers" | "rooms" | "questions";
type FormData = Record<string, unknown>;

interface ConfirmState { tab: TabId; id: number; name: string; }

function fmt(d: string) {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit", year: "numeric" })
    + " " + new Date(d).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

function fmtDatetimeLocal(d?: string) {
  if (!d) return "";
  return new Date(d).toISOString().slice(0, 16);
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

async function apiFetch(path: string, opts: RequestInit = {}) {
  const res = await fetch(path, { headers: { "Content-Type": "application/json" }, ...opts });
  if (res.status === 204) return null;
  const json = await res.json();
  if (!res.ok) throw new Error(json.error ?? "Erreur serveur");
  return json;
}

const TABS: { id: TabId; label: string }[] = [
  { id: "events", label: "Événements" },
  { id: "sessions", label: "Sessions" },
  { id: "speakers", label: "Speakers" },
  { id: "rooms", label: "Salles" },
  { id: "questions", label: "Questions" },
];

const COVER_GRADIENTS = [
  { from: "#1a1040", via: "#2d1b69", to: "#4c1d95", accent: "#5b6ef5" },
  { from: "#0c2340", via: "#1e3a5f", to: "#164e63", accent: "#22d3a0" },
  { from: "#1a0a2e", via: "#3b1f5e", to: "#6d28d9", accent: "#a78bfa" },
  { from: "#0f1f0a", via: "#1a3a12", to: "#14532d", accent: "#22d3a0" },
  { from: "#1f0a0a", via: "#3b1212", to: "#7f1d1d", accent: "#f97316" },
  { from: "#0a1a2e", via: "#0c2a4a", to: "#1e3a5f", accent: "#06b6d4" },
];

const AVATAR_COLORS = [
  "from-indigo-500 to-violet-500",
  "from-emerald-400 to-cyan-500",
  "from-orange-400 to-red-500",
  "from-violet-500 to-pink-500",
];

function AdminShieldIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5L2.5 4v4c0 3 2.5 5.5 5.5 6.5C11 13.5 13.5 11 13.5 8V4L8 1.5z"
        stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none" />
      <path d="M9.2 5.5H7.1L6.3 9h2L7.8 12 10.5 8H8.4L9.2 5.5z" fill="currentColor" />
    </svg>
  );
}

function EventSyncLogo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none">
      <defs>
        <linearGradient id="adminLg1" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5b6ef5" /><stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="adminLg2" x1="34" y1="0" x2="0" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3a0" /><stop offset="100%" stopColor="#5b6ef5" />
        </linearGradient>
      </defs>
      <rect width="34" height="34" rx="10" fill="#0c1120" />
      <path d="M6 17 Q6 8 17 8 Q23 8 27 14" stroke="url(#adminLg1)" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M28 17 Q28 26 17 26 Q11 26 7 20" stroke="url(#adminLg2)" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M23.5 11 L27 14 L23 16.5" stroke="url(#adminLg1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M10.5 23 L7 20 L11 17.5" stroke="url(#adminLg2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="17" cy="17" r="2.8" fill="#22d3a0" />
      <circle cx="17" cy="17" r="2.8" fill="#22d3a0" opacity="0.35">
        <animate attributeName="r" values="2.8;5;2.8" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.35;0;0.35" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function Navbar({ activeTab, onTabChange }: { activeTab: TabId; onTabChange: (t: TabId) => void }) {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <nav className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-50 flex items-center bg-[#0c1120]/80 backdrop-blur-2xl border border-white/7 rounded-2xl px-4 py-2.5 w-[calc(100vw-32px)] md:w-[min(1100px,calc(100vw-48px))]">
        <Link href="/" className="flex items-center gap-2.5 mr-6 no-underline flex-shrink-0">
          <EventSyncLogo size={34} />
          <span className="font-extrabold text-lg text-white hidden sm:block" style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-0.4px" }}>EventSync</span>
        </Link>

        {/* Tab nav inside the navbar */}
        <ul className="hidden md:flex items-center gap-1 list-none flex-1">
          {TABS.map(({ id, label }) => (
            <li key={id}>
              <button
                onClick={() => onTabChange(id)}
                className={`text-xs font-medium uppercase tracking-wider px-3 py-2 rounded-xl transition-all ${
                  id === activeTab
                    ? "text-white bg-white/8"
                    : "text-[#6b7280] hover:text-white hover:bg-white/6"
                }`}
              >
                {label}
              </button>
            </li>
          ))}
        </ul>

        <div className="ml-auto flex items-center gap-2">
          <Link href="/events" className="hidden sm:flex items-center gap-1.5 text-[#6b7280] hover:text-white text-xs font-medium px-3 py-2 rounded-xl hover:bg-white/6 transition-all no-underline">
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 6H2M6 10l-4-4 4-4" /></svg>
            Site public
          </Link>
          <span className="bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 text-xs font-bold px-3.5 py-2 rounded-xl flex items-center gap-2">
            <AdminShieldIcon />Admin
          </span>
        </div>

        <button className="ml-2 md:hidden w-8 h-8 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-white/6 transition-all" onClick={() => setMenuOpen(!menuOpen)}>
          <span className={`w-4 h-0.5 bg-white/70 rounded transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`w-4 h-0.5 bg-white/70 rounded transition-all ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`w-4 h-0.5 bg-white/70 rounded transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </nav>

      {menuOpen && (
        <div className="fixed top-[72px] left-4 right-4 z-40 bg-[#0c1120]/95 backdrop-blur-2xl border border-white/7 rounded-2xl p-4 md:hidden">
          {TABS.map(({ id, label }) => (
            <button key={id} onClick={() => { onTabChange(id); setMenuOpen(false); }}
              className={`flex items-center w-full text-sm font-medium py-3 border-b border-white/5 last:border-0 transition-colors ${id === activeTab ? "text-white" : "text-[#6b7280]"}`}>
              {label}
            </button>
          ))}
        </div>
      )}
    </>
  );
}

function StatusBadge({ session }: { session: Session }) {
  if (session.isLive) return (
    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />En direct
    </span>
  );
  if (session.isUpcoming) return (
    <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">À venir</span>
  );
  return (
    <span className="text-[9px] font-bold uppercase tracking-widest text-[#4b5563] bg-white/4 border border-white/7 px-2 py-0.5 rounded-full">Terminé</span>
  );
}

function ConfirmDialog({ confirm, onCancel, onConfirm }: { confirm: ConfirmState; onCancel: () => void; onConfirm: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="relative overflow-hidden w-80 bg-[#0c1120] border border-white/10 rounded-3xl shadow-2xl">
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-red-500/50 to-transparent" />
        <div className="p-6">
          <p className="font-black text-white text-[15px] mb-2" style={{ fontFamily: "Inter, sans-serif" }}>Confirmer la suppression</p>
          <p className="text-[#6b7280] text-sm leading-relaxed">
            Supprimer <strong className="text-white">"{confirm.name}"</strong> ?{" "}
            Cette action est irréversible.
          </p>
        </div>
        <div className="flex gap-2 px-6 pb-6">
          <button onClick={onCancel}
            className="flex-1 py-2.5 text-sm font-semibold text-[#6b7280] bg-white/4 border border-white/7 rounded-xl hover:bg-white/8 hover:text-white transition-all">
            Annuler
          </button>
          <button onClick={onConfirm}
            className="flex-1 py-2.5 text-sm font-bold text-white bg-red-500/15 border border-red-500/25 rounded-xl hover:bg-red-500/25 transition-all">
            Supprimer
          </button>
        </div>
      </div>
    </div>
  );
}

function FormModal({ tab, form, formError, onClose, onSave, onChange }: {
  tab: TabId; form: FormData; formError: string | null;
  onClose: () => void; onSave: () => void;
  onChange: (key: string, value: unknown) => void;
}) {
  const isEdit = !!form.id;
  const inputCls = "w-full bg-white/4 border border-white/7 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-indigo-500/40 transition-colors resize-none";
  const labelCls = "block text-[11px] font-bold uppercase tracking-widest text-[#4b5563] mb-2";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="relative w-full max-w-md bg-[#0c1120] border border-white/10 rounded-3xl overflow-hidden shadow-2xl max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}>
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent" />

        <div className="flex items-center justify-between px-6 py-5 border-b border-white/7">
          <h3 className="font-black text-white text-[15px]" style={{ fontFamily: "Inter, sans-serif" }}>
            {isEdit ? "Modifier" : "Nouveau"} {tab.slice(0, -1)}
          </h3>
          <button onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg bg-white/5 border border-white/7 text-[#6b7280] hover:text-white transition-colors text-base leading-none">
            ×
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-4">
          {formError && (
            <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 flex items-center gap-2">
              <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6" /><path d="M8 5v3M8 11h.01" /></svg>
              {formError}
            </div>
          )}

          {tab === "events" && (<>
            <div><label className={labelCls}>Titre *</label><input className={inputCls} value={(form.title as string) ?? ""} onChange={(e) => onChange("title", e.target.value)} placeholder="Titre de l'événement" /></div>
            <div><label className={labelCls}>Description *</label><textarea className={inputCls + " min-h-[80px]"} value={(form.description as string) ?? ""} onChange={(e) => onChange("description", e.target.value)} placeholder="Description..." /></div>
            <div><label className={labelCls}>Lieu *</label><input className={inputCls} value={(form.place as string) ?? ""} onChange={(e) => onChange("place", e.target.value)} placeholder="Paris, France" /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Début *</label><input type="datetime-local" className={inputCls} value={(form.startDate as string) ?? ""} onChange={(e) => onChange("startDate", e.target.value)} /></div>
              <div><label className={labelCls}>Fin *</label><input type="datetime-local" className={inputCls} value={(form.endDate as string) ?? ""} onChange={(e) => onChange("endDate", e.target.value)} /></div>
            </div>
          </>)}

          {tab === "rooms" && (
            <div><label className={labelCls}>Nom de la salle *</label><input className={inputCls} value={(form.name as string) ?? ""} onChange={(e) => onChange("name", e.target.value)} placeholder="Grande Salle A" /></div>
          )}

          {tab === "speakers" && (<>
            <div><label className={labelCls}>Nom complet *</label><input className={inputCls} value={(form.fullName as string) ?? ""} onChange={(e) => onChange("fullName", e.target.value)} placeholder="Jean Dupont" /></div>
            <div><label className={labelCls}>Biographie *</label><textarea className={inputCls + " min-h-[80px]"} value={(form.biography as string) ?? ""} onChange={(e) => onChange("biography", e.target.value)} placeholder="Biographie..." /></div>
            <div><label className={labelCls}>Photo (URL)</label><input className={inputCls} value={(form.photo as string) ?? ""} onChange={(e) => onChange("photo", e.target.value)} placeholder="https://..." /></div>
            <div>
              <label className={labelCls}>Liens <span className="normal-case font-normal text-[#4b5563] tracking-normal">(JSON ex: {`{"twitter":"https://..."}`})</span></label>
              <textarea className={inputCls + " min-h-[60px] font-mono text-xs"}
                value={typeof form.links === "string" ? form.links : (form.links ? JSON.stringify(form.links, null, 2) : "")}
                onChange={(e) => onChange("links", e.target.value)}
                placeholder='{"twitter":"https://..."}' />
            </div>
            <div>
              <label className={labelCls}>IDs sessions <span className="normal-case font-normal text-[#4b5563] tracking-normal">(séparés par virgule)</span></label>
              <input className={inputCls}
                value={Array.isArray(form.sessionIds) ? (form.sessionIds as number[]).join(", ") : (form.sessions as { session: { id: number } }[] | undefined)?.map((ss) => ss.session.id).join(", ") ?? ""}
                onChange={(e) => onChange("sessionIds", e.target.value.split(",").map((s) => parseInt(s.trim())).filter(Boolean))}
                placeholder="1, 2, 3" />
            </div>
          </>)}

          {tab === "sessions" && (<>
            <div><label className={labelCls}>Titre *</label><input className={inputCls} value={(form.title as string) ?? ""} onChange={(e) => onChange("title", e.target.value)} placeholder="Titre de la session" /></div>
            <div><label className={labelCls}>Description *</label><textarea className={inputCls + " min-h-[80px]"} value={(form.description as string) ?? ""} onChange={(e) => onChange("description", e.target.value)} placeholder="Description..." /></div>
            <div className="grid grid-cols-2 gap-3">
              <div><label className={labelCls}>Début *</label><input type="datetime-local" className={inputCls} value={(form.startDate as string) ?? ""} onChange={(e) => onChange("startDate", e.target.value)} /></div>
              <div><label className={labelCls}>Fin *</label><input type="datetime-local" className={inputCls} value={(form.endDate as string) ?? ""} onChange={(e) => onChange("endDate", e.target.value)} /></div>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div><label className={labelCls}>Capacité *</label><input type="number" className={inputCls} value={(form.capacity as number) ?? ""} onChange={(e) => onChange("capacity", parseInt(e.target.value))} placeholder="100" /></div>
              <div><label className={labelCls}>ID Salle *</label><input type="number" className={inputCls} value={((form.roomId ?? (form.room as { id: number } | undefined)?.id) as number) ?? ""} onChange={(e) => onChange("roomId", parseInt(e.target.value))} placeholder="1" /></div>
              <div><label className={labelCls}>ID Événement *</label><input type="number" className={inputCls} value={((form.eventId ?? (form.event as { id: number } | undefined)?.id) as number) ?? ""} onChange={(e) => onChange("eventId", parseInt(e.target.value))} placeholder="1" /></div>
            </div>
            <div>
              <label className={labelCls}>IDs speakers <span className="normal-case font-normal text-[#4b5563] tracking-normal">(séparés par virgule)</span></label>
              <input className={inputCls}
                value={Array.isArray(form.speakerIds) ? (form.speakerIds as number[]).join(", ") : (form.speakers as { speaker: { id: number } }[] | undefined)?.map((ss) => ss.speaker.id).join(", ") ?? ""}
                onChange={(e) => onChange("speakerIds", e.target.value)}
                placeholder="1, 2" />
            </div>
          </>)}
        </div>

        <div className="flex justify-end gap-2 px-6 py-4 border-t border-white/7">
          <button onClick={onClose}
            className="px-5 py-2.5 text-sm font-semibold text-[#6b7280] bg-white/4 border border-white/7 rounded-xl hover:bg-white/8 hover:text-white transition-all">
            Annuler
          </button>
          <button onClick={onSave}
            className="px-5 py-2.5 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 border border-indigo-400/30 rounded-xl hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(91,110,245,0.3)] transition-all flex items-center gap-2">
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8l3.5 3.5L13 5" /></svg>
            {isEdit ? "Enregistrer" : "Créer"}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [tab, setTab] = useState<TabId>("events");
  const [data, setData] = useState<{ events: Event[]; sessions: Session[]; speakers: Speaker[]; rooms: Room[]; questions: Question[] }>(
    { events: [], sessions: [], speakers: [], rooms: [], questions: [] }
  );
  const [meta, setMeta] = useState<Partial<Record<TabId, Meta>>>({});
  const [pages, setPages] = useState<Record<TabId, number>>({ events: 1, sessions: 1, speakers: 1, rooms: 1, questions: 1 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modal, setModal] = useState(false);
  const [form, setForm] = useState<FormData>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState<ConfirmState | null>(null);

  const loadTab = useCallback(async (t: TabId, pg = 1) => {
    setLoading(true); setError(null);
    try {
      const json = await apiFetch(`/api/${t}?page=${pg}&limit=20`);
      setData((prev) => ({ ...prev, [t]: json.data }));
      setMeta((prev) => ({ ...prev, [t]: json.meta }));
      setPages((prev) => ({ ...prev, [t]: pg }));
    } catch (e) { setError((e as Error).message); }
    setLoading(false);
  }, []);

  useEffect(() => { loadTab(tab, 1); setSearch(""); }, [tab, loadTab]);

  const handleSave = async () => {
    setFormError(null);
    const isEdit = !!form.id;
    try {
      const body: FormData = { ...form };
      if (tab === "sessions") {
        if (typeof body.speakerIds === "string")
          body.speakerIds = (body.speakerIds as string).split(",").map((s) => parseInt(s.trim())).filter(Boolean);
        if (body.capacity) body.capacity = Number(body.capacity);
        if (body.roomId) body.roomId = Number(body.roomId);
        if (body.eventId) body.eventId = Number(body.eventId);
      }
      if (tab === "speakers" && typeof body.links === "string") {
        try { body.links = body.links ? JSON.parse(body.links as string) : null; } catch { body.links = null; }
      }
      const id = body.id; delete body.id;
      delete body.room; delete body.event; delete body.speakers; delete body.sessions;
      delete body.createdAt; delete body.updatedAt; delete body._count;
      delete body.isLive; delete body.isUpcoming; delete body.isEnded;
      await apiFetch(isEdit ? `/api/${tab}/${id}` : `/api/${tab}`, {
        method: isEdit ? "PATCH" : "POST", body: JSON.stringify(body),
      });
      setModal(false); setForm({});
      await loadTab(tab, pages[tab]);
    } catch (e) { setFormError((e as Error).message); }
  };

  const handleDelete = async () => {
    if (!confirm) return;
    try {
      const path = confirm.tab === "speakers" ? `/api/${confirm.tab}/${confirm.id}?force=true` : `/api/${confirm.tab}/${confirm.id}`;
      await apiFetch(path, { method: "DELETE" });
      setConfirm(null);
      await loadTab(confirm.tab, pages[confirm.tab]);
    } catch (e) { setError((e as Error).message); setConfirm(null); }
  };

  const handleUpvote = async (id: number) => {
    await apiFetch(`/api/questions/${id}/upvote`, { method: "POST" });
    await loadTab("questions", pages.questions);
  };

  const handleDeleteQuestion = async (id: number) => {
    const token = prompt("Token admin requis :");
    if (!token) return;
    await fetch(`/api/questions/${id}`, { method: "DELETE", headers: { Authorization: `Bearer ${token}` } });
    await loadTab("questions", pages.questions);
  };

  const openCreate = () => { setForm({}); setFormError(null); setModal(true); };
  const openEdit = (item: FormData) => {
    const c = { ...item };
    if ("startDate" in c) c.startDate = fmtDatetimeLocal(c.startDate as string);
    if ("endDate" in c) c.endDate = fmtDatetimeLocal(c.endDate as string);
    setForm(c); setFormError(null); setModal(true);
  };

  const filtered = (data[tab] as FormData[]).filter((item) => {
    if (!search) return true;
    const name = (item.title ?? item.fullName ?? item.name ?? item.content ?? "") as string;
    return name.toLowerCase().includes(search.toLowerCase());
  });
  const currentMeta = meta[tab];
  const canCreate = tab !== "questions";
  const liveCount = (data.sessions as Session[]).filter((s) => s.isLive).length;
  const statCards = tab === "events"
    ? [
        { val: data.events.length, label: "Événements", color: "#5b6ef5" },
        { val: liveCount, label: "Sessions live", color: "#22d3a0" },
        { val: data.events.reduce((a, e) => a + (e._count?.sessions ?? 0), 0), label: "Sessions totales", color: "#a78bfa" },
      ]
    : tab === "sessions"
    ? [
        { val: (data.sessions as Session[]).length, label: "Sessions", color: "#5b6ef5" },
        { val: liveCount, label: "En direct", color: "#22d3a0" },
        { val: (data.sessions as Session[]).filter((s) => s.isUpcoming).length, label: "À venir", color: "#a78bfa" },
      ]
    : tab === "speakers"
    ? [{ val: data.speakers.length, label: "Speakers", color: "#5b6ef5" }]
    : tab === "rooms"
    ? [{ val: data.rooms.length, label: "Salles", color: "#5b6ef5" }]
    : [{ val: data.questions.length, label: "Questions", color: "#22d3a0" }];

    function ActionButtons({ item, name }: { item: FormData; name: string }) {
    return (
      <div className="flex gap-2 justify-end">
        <button onClick={() => openEdit(item)}
          className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-indigo-400 bg-indigo-500/8 border border-indigo-500/20 rounded-lg hover:bg-indigo-500/15 transition-colors">
          <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 2l3 3-9 9H2v-3L11 2z" /></svg>
          Éditer
        </button>
        <button onClick={() => setConfirm({ tab, id: item.id as number, name })}
          className="w-7 h-7 flex items-center justify-center text-[#4b5563] bg-white/4 border border-white/7 rounded-lg hover:text-red-400 hover:border-red-500/20 hover:bg-red-500/8 transition-colors">
          <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 4h10M6 4V2h4v2M5 4v9a1 1 0 001 1h4a1 1 0 001-1V4" /></svg>
        </button>
      </div>
    );
  }
  const thCls = "px-4 py-3 text-left text-[10px] font-bold uppercase tracking-widest text-[#4b5563] border-b border-white/7 bg-white/2";
  const tdCls = "px-4 py-3.5 text-sm border-b border-white/5";

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        body { font-family: 'Inter', sans-serif; }
      `}</style>

      <div className="min-h-screen bg-[#030711] text-white relative overflow-x-hidden" style={{ fontFamily: "Inter, sans-serif" }}>

        {/* Background glows — same as public pages */}
        <div className="fixed rounded-full pointer-events-none z-0" style={{ width: "min(700px,90vw)", height: "min(700px,90vw)", background: "radial-gradient(circle, rgba(91,110,245,0.12) 0%, transparent 70%)", top: "-200px", left: "-150px", filter: "blur(130px)" }} />
        <div className="fixed rounded-full pointer-events-none z-0" style={{ width: "min(500px,70vw)", height: "min(500px,70vw)", background: "radial-gradient(circle, rgba(34,211,160,0.07) 0%, transparent 70%)", bottom: "10%", right: "-100px", filter: "blur(120px)" }} />
        <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "80px 80px", maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)" }} />

        <Navbar activeTab={tab} onTabChange={(t) => setTab(t)} />

        <main className="relative z-10 px-4 md:px-6 max-w-[1100px] mx-auto pb-24 pt-28 md:pt-36">

          {/* Header */}
          <div className="mb-8 animate-[fadeUp_0.5s_ease_both]">
            <div className="inline-flex items-center gap-2 bg-indigo-500/8 border border-indigo-500/20 text-indigo-400 text-[11px] font-bold tracking-[1.5px] uppercase px-3.5 py-1.5 rounded-full mb-4">
              <AdminShieldIcon />Administration
            </div>
            <div className="flex flex-wrap items-end justify-between gap-4 mb-6">
              <h1 className="font-black text-white leading-tight" style={{ fontSize: "clamp(28px,4vw,44px)", letterSpacing: "-1px" }}>
                {TABS.find((t) => t.id === tab)?.label}
              </h1>
              <div className="flex items-center gap-3">
                <input
                  className="w-44 md:w-56 px-3.5 py-2 text-sm bg-white/4 border border-white/7 rounded-xl text-white placeholder-[#4b5563] focus:outline-none focus:border-indigo-500/40 transition-colors"
                  placeholder="Rechercher…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
                <button onClick={() => loadTab(tab, pages[tab])}
                  className="w-9 h-9 flex items-center justify-center bg-white/4 border border-white/7 rounded-xl text-[#6b7280] hover:text-white hover:bg-white/8 transition-all" title="Actualiser">
                  <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 8a6 6 0 1010.8-3M2 8V4m0 4H6" /></svg>
                </button>
                {canCreate && (
                  <button onClick={openCreate}
                    className="flex items-center gap-2 px-4 py-2 text-sm font-bold text-white bg-gradient-to-r from-indigo-500 to-violet-600 border border-indigo-400/30 rounded-xl hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(91,110,245,0.3)] transition-all">
                    <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3v10M3 8h10" /></svg>
                    Nouveau
                  </button>
                )}
              </div>
            </div>

            {/* Stat pills */}
            <div className="flex flex-wrap gap-3">
              {statCards.map(({ val, label, color }) => (
                <div key={label} className="flex items-center gap-2 bg-white/4 border border-white/7 rounded-xl px-3 py-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="font-black text-white text-sm">{val}</span>
                  <span className="text-[#6b7280] text-xs uppercase tracking-wider">{label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="mb-5 px-4 py-3 text-sm text-red-400 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-2 animate-[fadeUp_0.3s_ease_both]">
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6" /><path d="M8 5v3M8 11h.01" /></svg>
              {error}
            </div>
          )}

          {/* Table */}
          {loading ? (
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-14 bg-white/4 rounded-2xl animate-pulse" style={{ animationDelay: `${i * 60}ms` }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-24 bg-[#0c1120] border border-white/7 rounded-2xl animate-[fadeUp_0.4s_ease_both]">
              <div className="w-14 h-14 rounded-2xl bg-white/4 border border-white/7 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#374151]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
              </div>
              <p className="font-black text-white mb-1">Aucun résultat</p>
              <p className="text-[#6b7280] text-sm">Essayez un autre terme de recherche.</p>
            </div>
          ) : (
            <div className="bg-[#0c1120] border border-white/7 rounded-2xl overflow-hidden animate-[fadeUp_0.5s_0.1s_ease_both]">
              <div className="overflow-x-auto">

                {/* ── Events table ── */}
                {tab === "events" && (
                  <table className="w-full border-collapse">
                    <thead><tr>
                      <th className={thCls}>Titre</th><th className={thCls}>Lieu</th>
                      <th className={thCls}>Début</th><th className={thCls}>Fin</th>
                      <th className={thCls}>Sessions</th><th className={thCls}></th>
                    </tr></thead>
                    <tbody>
                      {(filtered as unknown as Event[]).map((e, i) => {
                        const grad = COVER_GRADIENTS[i % COVER_GRADIENTS.length];
                        return (
                          <tr key={e.id} className="group hover:bg-white/2 transition-colors">
                            <td className={tdCls}>
                              <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-lg flex-shrink-0" style={{ background: `linear-gradient(135deg, ${grad.from}, ${grad.to})` }} />
                                <div>
                                  <div className="font-semibold text-white">{e.title}</div>
                                  <div className="text-[11px] text-[#4b5563] mt-0.5 line-clamp-1 max-w-[200px]">{e.description}</div>
                                </div>
                              </div>
                            </td>
                            <td className={`${tdCls} text-[#6b7280]`}>{e.place}</td>
                            <td className={`${tdCls} text-[#6b7280] whitespace-nowrap font-mono text-[12px]`}>{fmt(e.startDate)}</td>
                            <td className={`${tdCls} text-[#6b7280] whitespace-nowrap font-mono text-[12px]`}>{fmt(e.endDate)}</td>
                            <td className={tdCls}>
                              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                                {e._count?.sessions ?? 0}
                              </span>
                            </td>
                            <td className={tdCls}><ActionButtons item={e as unknown as FormData} name={e.title} /></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                )}

                {/* ── Sessions table ── */}
                {tab === "sessions" && (
                  <table className="w-full border-collapse">
                    <thead><tr>
                      <th className={thCls}>Titre</th><th className={thCls}>Statut</th>
                      <th className={thCls}>Salle</th><th className={thCls}>Speakers</th>
                      <th className={thCls}>Début</th><th className={thCls}></th>
                    </tr></thead>
                    <tbody>
                      {(filtered as unknown as Session[]).map((s) => (
                        <tr key={s.id} className="group hover:bg-white/2 transition-colors">
                          <td className={tdCls}><span className="font-semibold text-white">{s.title}</span></td>
                          <td className={tdCls}><StatusBadge session={s} /></td>
                          <td className={`${tdCls} text-[#6b7280]`}>{s.room?.name ?? "—"}</td>
                          <td className={`${tdCls} text-[11px] text-[#6b7280] max-w-[160px]`}>
                            <div className="flex items-center gap-2">
                              <div className="flex items-center">
                                {(s.speakers ?? []).slice(0, 3).map((ss, i) => (
                                  <div key={ss.speaker.id}
                                    className={`w-5 h-5 rounded-full border border-[#0c1120] bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-[7px] font-bold text-white -ml-1.5 first:ml-0`}>
                                    {initials(ss.speaker.fullName)}
                                  </div>
                                ))}
                              </div>
                              <span className="truncate">{(s.speakers ?? []).map((ss) => ss.speaker.fullName).join(", ") || "—"}</span>
                            </div>
                          </td>
                          <td className={`${tdCls} text-[#6b7280] whitespace-nowrap font-mono text-[12px]`}>{fmt(s.startDate)}</td>
                          <td className={tdCls}><ActionButtons item={s as unknown as FormData} name={s.title} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* ── Speakers table ── */}
                {tab === "speakers" && (
                  <table className="w-full border-collapse">
                    <thead><tr>
                      <th className={thCls}>Nom</th><th className={thCls}>Biographie</th>
                      <th className={thCls}>Sessions</th><th className={thCls}>Liens</th><th className={thCls}></th>
                    </tr></thead>
                    <tbody>
                      {(filtered as unknown as Speaker[]).map((s, i) => (
                        <tr key={s.id} className="group hover:bg-white/2 transition-colors">
                          <td className={tdCls}>
                            <div className="flex items-center gap-3">
                              {s.photo ? (
                                <img src={s.photo} alt={s.fullName} className="w-8 h-8 rounded-full object-cover border border-white/10 flex-shrink-0" />
                              ) : (
                                <div className={`w-8 h-8 rounded-full bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-[11px] font-bold text-white flex-shrink-0`}>
                                  {initials(s.fullName)}
                                </div>
                              )}
                              <span className="font-semibold text-white">{s.fullName}</span>
                            </div>
                          </td>
                          <td className={`${tdCls} text-[#6b7280] text-[12px] max-w-[200px]`}>
                            {s.biography.slice(0, 60)}{s.biography.length > 60 ? "…" : ""}
                          </td>
                          <td className={tdCls}>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              {(s.sessions ?? []).length}
                            </span>
                          </td>
                          <td className={`${tdCls} text-[11px] text-[#6b7280]`}>{s.links ? Object.keys(s.links).join(", ") : "—"}</td>
                          <td className={tdCls}><ActionButtons item={s as unknown as FormData} name={s.fullName} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* ── Rooms table ── */}
                {tab === "rooms" && (
                  <table className="w-full border-collapse">
                    <thead><tr>
                      <th className={thCls}>Nom</th><th className={thCls}>Sessions</th>
                      <th className={thCls}>Créée le</th><th className={thCls}></th>
                    </tr></thead>
                    <tbody>
                      {(filtered as unknown as Room[]).map((r) => (
                        <tr key={r.id} className="group hover:bg-white/2 transition-colors">
                          <td className={tdCls}><span className="font-semibold text-white">{r.name}</span></td>
                          <td className={tdCls}>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              {r._count?.sessions ?? 0}
                            </span>
                          </td>
                          <td className={`${tdCls} text-[#6b7280] whitespace-nowrap font-mono text-[12px]`}>{fmt(r.createdAt)}</td>
                          <td className={tdCls}><ActionButtons item={r as unknown as FormData} name={r.name} /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}

                {/* ── Questions table ── */}
                {tab === "questions" && (
                  <table className="w-full border-collapse">
                    <thead><tr>
                      <th className={thCls}>Contenu</th><th className={thCls}>Auteur</th>
                      <th className={thCls}>Session</th><th className={thCls}>Votes</th>
                      <th className={thCls}>Créée</th><th className={thCls}></th>
                    </tr></thead>
                    <tbody>
                      {(filtered as unknown as Question[]).map((q) => (
                        <tr key={q.id} className="group hover:bg-white/2 transition-colors">
                          <td className={`${tdCls} max-w-[260px] text-white`}>{q.content}</td>
                          <td className={`${tdCls} text-[#6b7280]`}>{q.name ?? "Anonyme"}</td>
                          <td className={tdCls}>
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                              #{q.sessionId}
                            </span>
                          </td>
                          <td className={tdCls}>
                            <div className="flex items-center gap-2">
                              <span className="font-black text-white">{q.upvotes}</span>
                              <button onClick={() => handleUpvote(q.id)}
                                className="flex items-center gap-1 px-2 py-1 text-[11px] font-semibold text-emerald-400 bg-emerald-400/8 border border-emerald-400/20 rounded-lg hover:bg-emerald-400/15 transition-colors">
                                <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 3l5 6H3l5-6z" /></svg>
                                Vote
                              </button>
                            </div>
                          </td>
                          <td className={`${tdCls} text-[#6b7280] whitespace-nowrap font-mono text-[12px]`}>{fmt(q.createdAt)}</td>
                          <td className={tdCls}>
                            <button onClick={() => handleDeleteQuestion(q.id)}
                              className="flex items-center gap-1 px-2.5 py-1.5 text-[11px] font-semibold text-red-400 bg-red-500/8 border border-red-500/20 rounded-lg hover:bg-red-500/15 transition-colors">
                              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 4h10M6 4V2h4v2M5 4v9a1 1 0 001 1h4a1 1 0 001-1V4" /></svg>
                              Supprimer
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>

              {/* Pagination */}
              {currentMeta && currentMeta.pageCount > 1 && (
                <div className="flex items-center justify-between px-4 py-3 border-t border-white/7">
                  <span className="text-[12px] text-[#4b5563]">{currentMeta.total} résultat{currentMeta.total > 1 ? "s" : ""}</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => loadTab(tab, currentMeta.page - 1)} disabled={currentMeta.page <= 1}
                      className="px-3 py-1.5 text-xs rounded-xl border border-white/7 bg-white/4 text-[#6b7280] hover:bg-white/8 hover:text-white disabled:opacity-30 transition-all">
                      ‹
                    </button>
                    <span className="text-[12px] text-[#6b7280]">Page {currentMeta.page} / {currentMeta.pageCount}</span>
                    <button onClick={() => loadTab(tab, currentMeta.page + 1)} disabled={currentMeta.page >= currentMeta.pageCount}
                      className="px-3 py-1.5 text-xs rounded-xl border border-white/7 bg-white/4 text-[#6b7280] hover:bg-white/8 hover:text-white disabled:opacity-30 transition-all">
                      ›
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        <footer className="border-t border-white/7 py-8 px-4 relative z-10">
          <div className="max-w-[1100px] mx-auto text-center">
            <p className="text-[#6b7280] text-[13px]">© 2026 EventSync. Built for live moments.</p>
          </div>
        </footer>
      </div>

      {modal && (
        <FormModal tab={tab} form={form} formError={formError}
          onClose={() => { setModal(false); setForm({}); }}
          onSave={handleSave}
          onChange={(key, value) => setForm((prev) => ({ ...prev, [key]: value }))} />
      )}
      {confirm && (
        <ConfirmDialog confirm={confirm} onCancel={() => setConfirm(null)} onConfirm={handleDelete} />
      )}
    </>
  );
}