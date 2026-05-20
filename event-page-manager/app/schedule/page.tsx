"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";


interface Speaker {
  id: number;
  fullName: string;
  photo: string | null;
}

interface Session {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  capacity: number;
  room: { id: number; name: string };
  speakers: { speaker: Speaker }[];
  event: { id: number; title: string };
}


const FAV_KEY = "eventsync_favorites";
function getFavIds(): number[] { try { return JSON.parse(localStorage.getItem(FAV_KEY) ?? "[]"); } catch { return []; } }
function toggleFav(id: number) {
  const f = getFavIds(); const i = f.indexOf(id);
  if (i === -1) f.push(id); else f.splice(i, 1);
  localStorage.setItem(FAV_KEY, JSON.stringify(f));
}

function isLive(s: string, e: string) { const n = new Date(); return n >= new Date(s) && n <= new Date(e); }
function isUpcoming(s: string) { return new Date() < new Date(s); }
function formatTime(d: string) { return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }); }
function initials(name: string) { return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2); }

const ROOM_COLORS = [
  { text: "text-indigo-400", bg: "bg-indigo-500/8", border: "border-indigo-500/20", dot: "bg-indigo-400", header: "from-indigo-500/20 to-indigo-500/5", accent: "#5b6ef5" },
  { text: "text-emerald-400", bg: "bg-emerald-500/8", border: "border-emerald-500/20", dot: "bg-emerald-400", header: "from-emerald-500/20 to-emerald-500/5", accent: "#22d3a0" },
  { text: "text-violet-400", bg: "bg-violet-500/8", border: "border-violet-500/20", dot: "bg-violet-400", header: "from-violet-500/20 to-violet-500/5", accent: "#a78bfa" },
  { text: "text-cyan-400", bg: "bg-cyan-500/8", border: "border-cyan-500/20", dot: "bg-cyan-400", header: "from-cyan-500/20 to-cyan-500/5", accent: "#06b6d4" },
  { text: "text-blue-400", bg: "bg-blue-500/8", border: "border-blue-500/20", dot: "bg-blue-400", header: "from-blue-500/20 to-blue-500/5", accent: "#3b82f6" },
  { text: "text-pink-400", bg: "bg-pink-500/8", border: "border-pink-500/20", dot: "bg-pink-400", header: "from-pink-500/20 to-pink-500/5", accent: "#ec4899" },
];

const AVATAR_COLORS = [
  "from-indigo-500 to-violet-500",
  "from-emerald-400 to-cyan-500",
  "from-blue-400 to-indigo-600",
  "from-violet-500 to-pink-500",
];


function AdminShieldIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5L2.5 4v4c0 3 2.5 5.5 5.5 6.5C11 13.5 13.5 11 13.5 8V4L8 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none" />
      <path d="M9.2 5.5H7.1L6.3 9h2L7.8 12 10.5 8H8.4L9.2 5.5z" fill="currentColor" />
    </svg>
  );
}

function EventSyncLogo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none">
      <defs>
        <linearGradient id="schLg1" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5b6ef5" /><stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="schLg2" x1="34" y1="0" x2="0" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3a0" /><stop offset="100%" stopColor="#5b6ef5" />
        </linearGradient>
      </defs>
      <rect width="34" height="34" rx="10" fill="#0c1120" />
      <path d="M6 17 Q6 8 17 8 Q23 8 27 14" stroke="url(#schLg1)" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M28 17 Q28 26 17 26 Q11 26 7 20" stroke="url(#schLg2)" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M23.5 11 L27 14 L23 16.5" stroke="url(#schLg1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M10.5 23 L7 20 L11 17.5" stroke="url(#schLg2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="17" cy="17" r="2.8" fill="#22d3a0" />
      <circle cx="17" cy="17" r="2.8" fill="#22d3a0" opacity="0.35">
        <animate attributeName="r" values="2.8;5;2.8" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.35;0;0.35" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  return (
    <>
      <nav className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-50 flex items-center bg-[#0c1120]/80 backdrop-blur-2xl border border-white/7 rounded-2xl px-4 py-2.5 w-[calc(100vw-32px)] md:w-[min(900px,calc(100vw-48px))]">
        <Link href="/" className="flex items-center gap-2.5 mr-auto no-underline">
          <EventSyncLogo size={34} />
          <span className="font-extrabold text-lg text-white hidden sm:block" style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-0.4px" }}>EventSync</span>
        </Link>
        <ul className="hidden md:flex items-center gap-1 list-none">
          {[{ label: "Events", href: "/events" }, { label: "Speakers", href: "/speakers" }, { label: "Schedule", href: "/schedule" }, { label: "Favorites", href: "/favorites" }].map(({ label, href }) => (
            <li key={label}>
              <Link href={href} className={`text-xs font-medium uppercase tracking-wider px-3 py-2 rounded-xl transition-all no-underline ${href === "/schedule" ? "text-white bg-white/8" : "text-[#6b7280] hover:text-white hover:bg-white/6"}`}>{label}</Link>
            </li>
          ))}
        </ul>
        <Link href="/admin" className="ml-3 bg-white/6 border border-white/7 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-all no-underline">
          <AdminShieldIcon /><span className="hidden sm:inline">Admin</span>
        </Link>
        <button className="ml-2 md:hidden w-8 h-8 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-white/6 transition-all" onClick={() => setMenuOpen(!menuOpen)}>
          <span className={`w-4 h-0.5 bg-white/70 rounded transition-all ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`w-4 h-0.5 bg-white/70 rounded transition-all ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`w-4 h-0.5 bg-white/70 rounded transition-all ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </nav>
      {menuOpen && (
        <div className="fixed top-[72px] left-4 right-4 z-40 bg-[#0c1120]/95 backdrop-blur-2xl border border-white/7 rounded-2xl p-4 md:hidden">
          {[{ label: "Events", href: "/events" }, { label: "Speakers", href: "/speakers" }, { label: "Schedule", href: "/schedule" }, { label: "Favorites", href: "/favorites" }, { label: "Admin", href: "/admin" }].map(({ label, href }) => (
            <Link key={label} href={href} onClick={() => setMenuOpen(false)} className="flex items-center text-[#6b7280] hover:text-white text-sm font-medium py-3 border-b border-white/5 last:border-0 no-underline transition-colors">{label}</Link>
          ))}
        </div>
      )}
    </>
  );
}

function SessionCell({ session, rc, isFav, onToggleFav }: {
  session: Session;
  rc: typeof ROOM_COLORS[0];
  isFav: boolean;
  onToggleFav: (id: number) => void;
}) {
  const live = isLive(session.startDate, session.endDate);
  const upcoming = isUpcoming(session.startDate);

  return (
    <div className={`group relative rounded-2xl border p-4 h-full transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_rgba(0,0,0,0.4)] overflow-hidden ${live ? "bg-emerald-400/5 border-emerald-400/25" : "bg-[#0c1120] border-white/7 hover:border-white/15"}`}>
      {live && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />}

      {!live && (
        <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity"
          style={{ background: `linear-gradient(90deg, transparent, ${rc.accent}, transparent)` }} />
      )}

      <div className="flex items-start justify-between gap-1 mb-2">
        <div className="flex flex-wrap gap-1">
          {live && (
            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.5 rounded-full">
              <span className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" />Live
            </span>
          )}
          {!live && upcoming && (
            <span className="text-[9px] font-bold uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-1.5 py-0.5 rounded-full">Soon</span>
          )}
        </div>
        <button
          onClick={() => onToggleFav(session.id)}
          className={`flex-shrink-0 w-6 h-6 rounded-lg flex items-center justify-center border transition-all ${isFav ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-400" : "bg-white/4 border-white/7 text-[#374151] hover:text-indigo-400 hover:border-indigo-500/20"}`}>
          <svg className="w-3 h-3" viewBox="0 0 16 16" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5"><path d="M3 2h10v13l-5-3-5 3V2z" /></svg>
        </button>
      </div>

      <Link href={`/sessions/${session.id}`} className="no-underline">
        <h4 className="font-bold text-white text-[13px] leading-snug mb-1.5 hover:text-indigo-300 transition-colors line-clamp-2"
          style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-0.2px" }}>
          {session.title}
        </h4>
      </Link>

      <p className="text-[#4b5563] text-[11px] leading-relaxed line-clamp-2 mb-3">{session.description}</p>

      {session.speakers.length > 0 && (
        <div className="flex items-center gap-1.5 mb-3">
          <div className="flex items-center">
            {session.speakers.slice(0, 2).map((ss, i) => (
              ss.speaker.photo ? (
                <img key={ss.speaker.id} src={ss.speaker.photo} alt={ss.speaker.fullName}
                  className="w-5 h-5 rounded-full object-cover border border-[#0c1120] -ml-1 first:ml-0" />
              ) : (
                <div key={ss.speaker.id}
                  className={`w-5 h-5 rounded-full border border-[#0c1120] bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-[7px] font-black text-white -ml-1 first:ml-0`}>
                  {initials(ss.speaker.fullName)}
                </div>
              )
            ))}
          </div>
          <span className="text-[10px] text-[#4b5563] truncate">
            {session.speakers.slice(0, 1).map((ss) => ss.speaker.fullName).join("")}
            {session.speakers.length > 1 && ` +${session.speakers.length - 1}`}
          </span>
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className={`inline-flex items-center gap-1 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-md border ${rc.bg} ${rc.border} ${rc.text}`}>
          <span className={`w-1 h-1 rounded-full ${rc.dot}`} />
          {session.event.title.length > 12 ? session.event.title.slice(0, 12) + "…" : session.event.title}
        </div>
        <span className="flex items-center gap-1 text-[10px] text-[#374151]">
          <svg className="w-3 h-3 opacity-50" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="5" r="3" /><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" /></svg>
          {session.capacity}
        </span>
      </div>
    </div>
  );
}


export default function SchedulePage() {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [search, setSearch] = useState("");
  const [showLiveOnly, setShowLiveOnly] = useState(false);

  useEffect(() => {
    setFavorites(getFavIds());
    fetch("/api/sessions?limit=200")
      .then((r) => r.json())
      .then((d) => setSessions(d.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleToggleFav = useCallback((id: number) => {
    toggleFav(id); setFavorites(getFavIds());
  }, []);

  let filtered = sessions;
  if (showLiveOnly) filtered = filtered.filter((s) => isLive(s.startDate, s.endDate));
  if (search) filtered = filtered.filter((s) =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.speakers.some((ss) => ss.speaker.fullName.toLowerCase().includes(search.toLowerCase()))
  );

  const rooms = Array.from(
    new Map(filtered.map((s) => [s.room.id, s.room])).values()
  );

  const timeSlots = Array.from(
    new Set(filtered.map((s) => formatTime(s.startDate)))
  ).sort((a, b) => {
    const toMin = (t: string) => { const [h, m] = t.replace(/AM|PM/g, "").trim().split(":"); const hour = parseInt(h); const isPM = t.includes("PM") && hour !== 12; const isAM = t.includes("AM") && hour === 12; return (isPM ? hour + 12 : isAM ? 0 : hour) * 60 + parseInt(m); };
    return toMin(a) - toMin(b);
  });

  const lookup = new Map<string, Session>();
  filtered.forEach((s) => {
    lookup.set(`${s.room.id}-${formatTime(s.startDate)}`, s);
  });

  const liveCount = sessions.filter((s) => isLive(s.startDate, s.endDate)).length;
  const favCount = favorites.filter((id) => sessions.some((s) => s.id === id)).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gradientShift { 0%{background-position:0%} 100%{background-position:200%} }
        body { font-family: 'Inter', sans-serif; }
      `}</style>

      <div className="min-h-screen bg-[#030711] text-white relative overflow-x-hidden">
        <div className="fixed rounded-full pointer-events-none z-0" style={{ width: "min(700px,90vw)", height: "min(700px,90vw)", background: "radial-gradient(circle, rgba(91,110,245,0.14) 0%, transparent 70%)", top: "-200px", left: "-150px", filter: "blur(130px)" }} />
        <div className="fixed rounded-full pointer-events-none z-0" style={{ width: "min(500px,70vw)", height: "min(500px,70vw)", background: "radial-gradient(circle, rgba(34,211,160,0.08) 0%, transparent 70%)", bottom: "10%", right: "-100px", filter: "blur(120px)" }} />
        <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "80px 80px", maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)" }} />

        <Navbar />

        <main className="relative z-10 px-4 md:px-6 max-w-7xl mx-auto pb-24 pt-28 md:pt-36">

          <div className="mb-8 animate-[fadeUp_0.5s_ease_both]">
            <div className="absolute right-4 md:right-6 top-24 md:top-32 font-black select-none pointer-events-none"
              style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(80px,14vw,160px)", color: "rgba(255,255,255,0.02)", letterSpacing: "-6px", lineHeight: 1 }}>
              {sessions.length}
            </div>

            <div className="inline-flex items-center gap-2 bg-indigo-500/8 border border-indigo-500/20 text-indigo-400 text-[11px] font-bold tracking-[1.5px] uppercase px-3.5 py-1.5 rounded-full mb-5">
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" /><rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" /></svg>
              Schedule
            </div>

            <h1 className="font-black text-white mb-3"
              style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(36px,6vw,72px)", letterSpacing: "clamp(-2px,-0.03em,-4px)", lineHeight: 0.95 }}>
              Full schedule.<br />
              <span style={{ background: "linear-gradient(90deg, #5b6ef5, #a78bfa, #22d3a0)", backgroundSize: "200%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "gradientShift 4s linear infinite" }}>
                All sessions.
              </span>
            </h1>

            <p className="text-[#6b7280] text-base font-light max-w-lg leading-relaxed mt-3 mb-6">
              Multi-track view — all sessions across all rooms, side by side.
            </p>

            <div className="flex flex-wrap items-center gap-3">
              {[
                { value: sessions.length, label: "Sessions", color: "#5b6ef5" },
                { value: liveCount, label: "Live", color: "#22d3a0" },
                { value: rooms.length, label: "Rooms", color: "#a78bfa" },
                { value: favCount, label: "Saved", color: "#06b6d4" },
              ].map(({ value, label, color }) => (
                <div key={label} className="flex items-center gap-2 bg-white/4 border border-white/7 rounded-xl px-3 py-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="font-black text-white text-sm" style={{ fontFamily: "Inter, sans-serif" }}>{value}</span>
                  <span className="text-[#6b7280] text-xs uppercase tracking-wider">{label}</span>
                </div>
              ))}

              <div className="relative ml-auto">
                <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-[#4b5563]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5l3 3" /></svg>
                <input type="text" placeholder="Search…" value={search} onChange={(e) => setSearch(e.target.value)}
                  className="bg-[#0c1120] border border-white/7 rounded-xl pl-8 pr-3 py-2 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-indigo-500/40 transition-colors w-40 md:w-48"
                  style={{ fontFamily: "Inter, sans-serif" }} />
              </div>

              <button onClick={() => setShowLiveOnly(!showLiveOnly)}
                className={`flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border transition-all ${showLiveOnly ? "bg-emerald-400/15 border-emerald-400/30 text-emerald-400" : "bg-white/4 border-white/7 text-[#6b7280] hover:text-white hover:border-white/15"}`}>
                <span className={`w-1.5 h-1.5 rounded-full bg-emerald-400 ${showLiveOnly ? "animate-pulse" : "opacity-30"}`} />
                Live only
              </button>

              <Link href="/favorites" className="flex items-center gap-1.5 text-xs font-semibold px-3.5 py-2 rounded-xl border border-white/7 bg-white/4 text-[#6b7280] hover:text-white hover:border-white/15 transition-all no-underline">
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill={favCount > 0 ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5" style={{ color: favCount > 0 ? "#5b6ef5" : undefined }}><path d="M3 2h10v13l-5-3-5 3V2z" /></svg>
                My itinerary {favCount > 0 && `(${favCount})`}
              </Link>
            </div>
          </div>

          {loading ? (
            <div className="animate-pulse space-y-3">
              <div className="h-14 bg-white/4 rounded-2xl" />
              {[...Array(4)].map((_, i) => <div key={i} className="h-40 bg-white/4 rounded-2xl" />)}
            </div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-32 bg-[#0c1120] border border-white/7 rounded-2xl">
              <div className="w-16 h-16 rounded-2xl bg-white/4 border border-white/7 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-[#374151]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
              </div>
              <p className="font-black text-white mb-1" style={{ fontFamily: "Inter, sans-serif" }}>No sessions available</p>
              <p className="text-[#6b7280] text-sm">Sessions will appear here once added to events.</p>
            </div>
          ) : (
            <div className="animate-[fadeUp_0.5s_0.1s_ease_both] overflow-x-auto">
              <div style={{ minWidth: `${Math.max(700, 160 + rooms.length * 260)}px` }}>

                <div className="grid mb-2 rounded-2xl overflow-hidden border border-white/7"
                  style={{ gridTemplateColumns: `160px repeat(${rooms.length}, 1fr)` }}>

                  <div className="bg-[#0c1120] px-4 py-4 flex items-center gap-2 border-r border-white/7">
                    <svg className="w-3.5 h-3.5 text-[#4b5563]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6" /><path d="M8 5v3l2 2" /></svg>
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#4b5563]">Time</span>
                  </div>

                  {rooms.map((room, i) => {
                    const rc = ROOM_COLORS[i % ROOM_COLORS.length];
                    return (
                      <div key={room.id}
                        className={`bg-gradient-to-b ${rc.header} px-4 py-4 border-r last:border-r-0 border-white/7`}>
                        <div className="flex items-center gap-2">
                          <svg className="w-3.5 h-3.5 flex-shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" style={{ color: rc.accent }}>
                            <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8.5 4.5 8.5s4.5-5 4.5-8.5c0-2.5-2-4.5-4.5-4.5z" /><circle cx="8" cy="6" r="1.5" />
                          </svg>
                          <span className="font-black text-white text-sm truncate" style={{ fontFamily: "Inter, sans-serif" }}>{room.name}</span>
                        </div>
                        <Link href={`/rooms/${room.id}`}
                          className={`text-[9px] font-bold uppercase tracking-wider no-underline hover:opacity-80 transition-opacity mt-0.5 block ${rc.text}`}>
                          View room →
                        </Link>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  {timeSlots.map((time) => (
                    <div key={time} className="grid items-stretch"
                      style={{ gridTemplateColumns: `160px repeat(${rooms.length}, 1fr)` }}>

                      <div className="flex items-start gap-2 px-4 py-4 border-r border-white/5">
                        <svg className="w-3.5 h-3.5 text-indigo-500/60 mt-0.5 flex-shrink-0" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6" /><path d="M8 5v3l2 2" /></svg>
                        <span className="font-black text-white text-sm" style={{ fontFamily: "Inter, sans-serif" }}>{time}</span>
                      </div>

                      {rooms.map((room, ri) => {
                        const session = lookup.get(`${room.id}-${time}`);
                        const rc = ROOM_COLORS[ri % ROOM_COLORS.length];
                        return (
                          <div key={room.id} className="p-1.5 border-r last:border-r-0 border-white/4 min-h-[120px]">
                            {session ? (
                              <SessionCell
                                session={session}
                                rc={rc}
                                isFav={favorites.includes(session.id)}
                                onToggleFav={handleToggleFav}
                              />
                            ) : (
                              <div className="h-full rounded-2xl border border-dashed border-white/4 flex items-center justify-center min-h-[112px]">
                                <span className="text-[10px] text-[#1f2937]">—</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </main>

        <footer className="border-t border-white/7 py-8 px-4 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <p className="text-[#6b7280] text-[13px]">© 2026 EventSync. Built for live moments.</p>
          </div>
        </footer>
      </div>
    </>
  );
}