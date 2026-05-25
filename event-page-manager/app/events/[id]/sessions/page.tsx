"use client";

import { use, useEffect, useState, useCallback } from "react";
import Link from "next/link";

interface Speaker {
  id: number;
  fullName: string;
  photo: string | null;
}

interface Room {
  id: number;
  name: string;
}

interface Session {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  capacity: number;
  room: Room;
  speakers: { speaker: Speaker }[];
}

interface Event {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  place: string;
  sessions: Session[];
}


function isLive(s: string, e: string) {
  const n = new Date();
  return n >= new Date(s) && n <= new Date(e);
}

function isUpcoming(s: string) {
  return new Date() < new Date(s);
}

function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" });
}

function getDayKey(d: string) {
  const dt = new Date(d);
  return `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`;
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = [
  "from-indigo-500 to-violet-500",
  "from-emerald-400 to-cyan-500",
  "from-orange-400 to-red-500",
  "from-violet-500 to-pink-500",
];

const ROOM_COLORS = [
  { border: "border-indigo-500/30", bg: "bg-indigo-500/8", text: "text-indigo-400", dot: "bg-indigo-400" },
  { border: "border-emerald-400/30", bg: "bg-emerald-400/8", text: "text-emerald-400", dot: "bg-emerald-400" },
  { border: "border-violet-400/30", bg: "bg-violet-400/8", text: "text-violet-400", dot: "bg-violet-400" },
  { border: "border-orange-400/30", bg: "bg-orange-400/8", text: "text-orange-400", dot: "bg-orange-400" },
  { border: "border-cyan-400/30", bg: "bg-cyan-400/8", text: "text-cyan-400", dot: "bg-cyan-400" },
  { border: "border-rose-400/30", bg: "bg-rose-400/8", text: "text-rose-400", dot: "bg-rose-400" },
];


const FAVORITES_KEY = "eventsync_favorites";

function getFavorites(): number[] {
  try {
    return JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]");
  } catch {
    return [];
  }
}

function toggleFavorite(id: number): boolean {
  const favs = getFavorites();
  const idx = favs.indexOf(id);
  if (idx === -1) {
    favs.push(id);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
    return true;
  } else {
    favs.splice(idx, 1);
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favs));
    return false;
  }
}


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
        <linearGradient id="sessLg1" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5b6ef5" /><stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="sessLg2" x1="34" y1="0" x2="0" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3a0" /><stop offset="100%" stopColor="#5b6ef5" />
        </linearGradient>
      </defs>
      <rect width="34" height="34" rx="10" fill="#0c1120" />
      <path d="M6 17 Q6 8 17 8 Q23 8 27 14" stroke="url(#sessLg1)" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M28 17 Q28 26 17 26 Q11 26 7 20" stroke="url(#sessLg2)" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M23.5 11 L27 14 L23 16.5" stroke="url(#sessLg1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M10.5 23 L7 20 L11 17.5" stroke="url(#sessLg2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
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
              <Link href={href} className="text-[#6b7280] hover:text-white text-xs font-medium uppercase tracking-wider px-3 py-2 rounded-xl hover:bg-white/6 transition-all no-underline">{label}</Link>
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


function SessionCard({
  session,
  roomIndex,
  favorites,
  onToggleFavorite,
}: {
  session: Session;
  roomIndex: number;
  favorites: number[];
  onToggleFavorite: (id: number) => void;
}) {
  const live = isLive(session.startDate, session.endDate);
  const upcoming = isUpcoming(session.startDate);
  const isFav = favorites.includes(session.id);
  const roomColor = ROOM_COLORS[roomIndex % ROOM_COLORS.length];

  return (
    <div className={`group relative rounded-2xl border transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_16px_40px_rgba(0,0,0,0.4)] overflow-hidden ${live ? "border-emerald-400/25 bg-[#081510]" : "border-white/7 bg-[#0c1120]"}`}>
      {live && (
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />
      )}

      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: "radial-gradient(ellipse at 50% 0%, rgba(91,110,245,0.07) 0%, transparent 70%)" }} />

      <div className="relative p-4 md:p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-bold text-[#6b7280] font-mono">
              {formatTime(session.startDate)} – {formatTime(session.endDate)}
            </span>
            {live && (
              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />Live
              </span>
            )}
            {!live && upcoming && (
              <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">Soon</span>
            )}
            {!live && !upcoming && (
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#4b5563] bg-white/4 border border-white/7 px-2 py-0.5 rounded-full">Ended</span>
            )}
          </div>

          <button
            onClick={() => onToggleFavorite(session.id)}
            className={`flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all ${isFav ? "bg-amber-400/15 border border-amber-400/30 text-amber-400" : "bg-white/5 border border-white/7 text-[#4b5563] hover:text-amber-400 hover:border-amber-400/20"}`}
            title={isFav ? "Remove from favorites" : "Add to favorites"}
          >
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5">
              <path d="M3 2h10v13l-5-3-5 3V2z" />
            </svg>
          </button>
        </div>

        <Link href={`/sessions/${session.id}`} className="no-underline">
          <h3 className="font-bold text-white text-[14px] md:text-[15px] leading-snug mb-3 hover:text-indigo-300 transition-colors cursor-pointer" style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-0.3px" }}>
            {session.title}
          </h3>
        </Link>

        {session.description && (
          <p className="text-[#6b7280] text-xs leading-relaxed mb-3 line-clamp-2">{session.description}</p>
        )}

        <div className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-lg border mb-3 ${roomColor.bg} ${roomColor.border} ${roomColor.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${roomColor.dot}`} />
          {session.room.name}
        </div>

        <div className="flex items-center gap-1 text-[11px] text-[#4b5563] mb-3">
          <svg className="w-3 h-3 opacity-60" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="5" r="3" /><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" />
          </svg>
          Capacity: {session.capacity}
        </div>

        {session.speakers.length > 0 && (
          <div className="flex items-center gap-2 pt-3 border-t border-white/7">
            <div className="flex items-center">
              {session.speakers.slice(0, 4).map((ss, i) => (
                <Link key={ss.speaker.id} href={`/speakers/${ss.speaker.id}`} className="no-underline -ml-1.5 first:ml-0">
                  {ss.speaker.photo ? (
                    <img src={ss.speaker.photo} alt={ss.speaker.fullName}
                      className="w-6 h-6 rounded-full border-2 border-[#0c1120] object-cover hover:scale-110 transition-transform"
                      title={ss.speaker.fullName} />
                  ) : (
                    <div
                      className={`w-6 h-6 rounded-full border-2 border-[#0c1120] bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-[8px] font-bold text-white hover:scale-110 transition-transform`}
                      title={ss.speaker.fullName}>
                      {initials(ss.speaker.fullName)}
                    </div>
                  )}
                </Link>
              ))}
              {session.speakers.length > 4 && (
                <div className="w-6 h-6 rounded-full border-2 border-[#0c1120] bg-[#1f2937] flex items-center justify-center text-[8px] font-bold text-[#9ca3af] -ml-1.5">
                  +{session.speakers.length - 4}
                </div>
              )}
            </div>
            <div className="text-[11px] text-[#6b7280] truncate">
              {session.speakers.slice(0, 2).map((ss) => ss.speaker.fullName).join(", ")}
              {session.speakers.length > 2 && ` +${session.speakers.length - 2}`}
            </div>
          </div>
        )}
      </div>

      <Link href={`/sessions/${session.id}`}
        className="relative flex items-center justify-between px-4 md:px-5 py-2.5 border-t border-white/5 text-[11px] font-semibold text-[#4b5563] hover:text-indigo-400 hover:bg-indigo-500/5 transition-all no-underline group/link">
        <span>View details</span>
        <svg className="w-3 h-3 group-hover/link:translate-x-0.5 transition-transform" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 6h8M6 2l4 4-4 4" /></svg>
      </Link>
    </div>
  );
}


export default function EventSessionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<number | null>(null);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);
  const [showFavOnly, setShowFavOnly] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [view, setView] = useState<"grid" | "list">("grid");

  useEffect(() => {
    setFavorites(getFavorites());
  }, []);

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then((r) => { if (r.status === 404) { setNotFound(true); return null; } return r.json(); })
      .then((d) => { if (d) setEvent(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleToggleFavorite = useCallback((sessionId: number) => {
    toggleFavorite(sessionId);
    setFavorites(getFavorites());
  }, []);

  if (loading) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'); body{font-family:'Inter',sans-serif}`}</style>
      <div className="min-h-screen bg-[#030711]"><Navbar />
        <div className="pt-36 px-4 md:px-6 max-w-5xl mx-auto">
          <div className="animate-pulse space-y-6">
            <div className="h-10 bg-white/5 rounded-2xl w-1/2" />
            <div className="h-6 bg-white/5 rounded-xl w-1/3" />
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => <div key={i} className="h-52 bg-white/5 rounded-2xl" style={{ animationDelay: `${i * 60}ms` }} />)}
            </div>
          </div>
        </div>
      </div>
    </>
  );

  if (notFound || !event) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'); body{font-family:'Inter',sans-serif}`}</style>
      <div className="min-h-screen bg-[#030711] text-white"><Navbar />
        <div className="pt-36 px-4 text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#0c1120] border border-white/7 flex items-center justify-center mx-auto mb-6">
            <svg className="w-9 h-9 text-[#374151]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18M9 16l2 2 4-4" /></svg>
          </div>
          <h2 className="font-bold text-xl text-white mb-2">Event not found</h2>
          <p className="text-[#6b7280] text-sm mb-6">This event doesn't exist or has no sessions.</p>
          <Link href="/events" className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium px-5 py-2.5 rounded-xl no-underline hover:bg-indigo-500/20 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 8H3M7 4l-4 4 4 4" /></svg>
            Back to events
          </Link>
        </div>
      </div>
    </>
  );

  const rooms = Array.from(new Map(event.sessions.map((s) => [s.room.id, s.room])).values());
  const roomIndexMap = new Map(rooms.map((r, i) => [r.id, i]));

  const days = Array.from(new Set(event.sessions.map((s) => getDayKey(s.startDate))))
    .map((key) => {
      const session = event.sessions.find((s) => getDayKey(s.startDate) === key)!;
      return { key, label: formatDate(session.startDate) };
    });

  let filtered = event.sessions;
  if (selectedRoom !== null) filtered = filtered.filter((s) => s.room.id === selectedRoom);
  if (selectedDay !== null) filtered = filtered.filter((s) => getDayKey(s.startDate) === selectedDay);
  if (showFavOnly) filtered = filtered.filter((s) => favorites.includes(s.id));

  filtered = [...filtered].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const grouped = filtered.reduce<Record<string, Session[]>>((acc, s) => {
    const key = formatTime(s.startDate);
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const liveCount = event.sessions.filter((s) => isLive(s.startDate, s.endDate)).length;
  const favCount = favorites.filter((id) => event.sessions.some((s) => s.id === id)).length;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gradientShift { 0%{background-position:0%} 100%{background-position:200%} }
        body { font-family: 'Inter', sans-serif; }
      `}</style>

      <div className="min-h-screen bg-[#030711] text-white relative overflow-x-hidden">
        <div className="fixed rounded-full pointer-events-none z-0" style={{ width: "min(600px,80vw)", height: "min(600px,80vw)", background: "radial-gradient(circle, rgba(91,110,245,0.14) 0%, transparent 70%)", top: "-150px", left: "-100px", filter: "blur(120px)" }} />
        <div className="fixed rounded-full pointer-events-none z-0" style={{ width: "min(400px,60vw)", height: "min(400px,60vw)", background: "radial-gradient(circle, rgba(34,211,160,0.08) 0%, transparent 70%)", bottom: "10%", right: "-80px", filter: "blur(120px)" }} />
        <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "80px 80px", maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)" }} />

        <Navbar />

        <main className="relative z-10 px-4 md:px-6 max-w-5xl mx-auto pb-24 pt-28 md:pt-36">

          <Link href="/events" className="inline-flex items-center gap-2 text-[#6b7280] hover:text-white text-sm font-medium mb-8 no-underline transition-colors group">
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 8H3M7 4l-4 4 4 4" /></svg>
            Back to events
          </Link>

          <div className="mb-10 animate-[fadeUp_0.5s_ease_both]">
            <div className="inline-flex items-center gap-2 bg-indigo-500/8 border border-indigo-500/20 text-indigo-400 text-[11px] font-bold tracking-[1.5px] uppercase px-3.5 py-1.5 rounded-full mb-4">
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="12" height="11" rx="1.5" /><path d="M5 1v4M11 1v4M2 7h12" /></svg>
              Schedule
            </div>
            <h1 className="font-black text-white mb-2 leading-tight" style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(28px,5vw,52px)", letterSpacing: "-1.5px" }}>
              {event.title}
            </h1>
            <div className="flex flex-wrap items-center gap-4 text-[13px] text-[#6b7280] mb-5">
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 opacity-60" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8.5 4.5 8.5s4.5-5 4.5-8.5c0-2.5-2-4.5-4.5-4.5z" /><circle cx="8" cy="6" r="1.5" /></svg>
                {event.place}
              </span>
              <span className="flex items-center gap-1.5">
                <svg className="w-3.5 h-3.5 opacity-60" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="12" height="11" rx="1.5" /><path d="M5 1v4M11 1v4M2 7h12" /></svg>
                {event.sessions.length} session{event.sessions.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="flex flex-wrap gap-3">
              {[
                { value: event.sessions.length, label: "Total", color: "#5b6ef5" },
                { value: liveCount, label: "Live now", color: "#22d3a0" },
                { value: rooms.length, label: "Rooms", color: "#a78bfa" },
                { value: favCount, label: "Saved", color: "#f59e0b" },
              ].map(({ value, label, color }) => (
                <div key={label} className="flex items-center gap-2 bg-white/4 border border-white/7 rounded-xl px-3 py-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="font-black text-white text-sm" style={{ fontFamily: "Inter, sans-serif" }}>{value}</span>
                  <span className="text-[#6b7280] text-xs uppercase tracking-wider">{label}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap gap-2 mb-8 animate-[fadeUp_0.5s_0.1s_ease_both]">

            <div className="flex flex-wrap gap-1.5">
              <button onClick={() => setSelectedRoom(null)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${selectedRoom === null ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300" : "bg-white/4 border-white/7 text-[#6b7280] hover:text-white hover:border-white/15"}`}>
                All rooms
              </button>
              {rooms.map((room, i) => {
                const rc = ROOM_COLORS[i % ROOM_COLORS.length];
                return (
                  <button key={room.id} onClick={() => setSelectedRoom(selectedRoom === room.id ? null : room.id)}
                    className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${selectedRoom === room.id ? `${rc.bg} ${rc.border} ${rc.text}` : "bg-white/4 border-white/7 text-[#6b7280] hover:text-white hover:border-white/15"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${rc.dot}`} />
                    {room.name}
                  </button>
                );
              })}
            </div>

            {days.length > 1 && (
              <div className="flex flex-wrap gap-1.5">
                {days.map((day) => (
                  <button key={day.key} onClick={() => setSelectedDay(selectedDay === day.key ? null : day.key)}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ${selectedDay === day.key ? "bg-violet-500/15 border-violet-500/30 text-violet-300" : "bg-white/4 border-white/7 text-[#6b7280] hover:text-white hover:border-white/15"}`}>
                    {day.label}
                  </button>
                ))}
              </div>
            )}

            <button onClick={() => setShowFavOnly(!showFavOnly)}
              className={`flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl border transition-all ml-auto ${showFavOnly ? "bg-amber-400/15 border-amber-400/30 text-amber-400" : "bg-white/4 border-white/7 text-[#6b7280] hover:text-amber-400 hover:border-amber-400/20"}`}>
              <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill={showFavOnly ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5"><path d="M3 2h10v13l-5-3-5 3V2z" /></svg>
              Favorites {favCount > 0 && `(${favCount})`}
            </button>

            <div className="flex items-center bg-white/4 border border-white/7 rounded-xl overflow-hidden">
              <button onClick={() => setView("grid")}
                className={`px-3 py-1.5 transition-all ${view === "grid" ? "bg-white/10 text-white" : "text-[#6b7280] hover:text-white"}`}>
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" /><rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" /></svg>
              </button>
              <button onClick={() => setView("list")}
                className={`px-3 py-1.5 transition-all ${view === "list" ? "bg-white/10 text-white" : "text-[#6b7280] hover:text-white"}`}>
                <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 4h12M2 8h12M2 12h12" /></svg>
              </button>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-24 bg-[#0c1120] border border-white/7 rounded-2xl animate-[fadeUp_0.4s_ease_both]">
              <div className="w-16 h-16 rounded-2xl bg-white/4 border border-white/7 flex items-center justify-center mx-auto mb-4">
                <svg className="w-7 h-7 text-[#374151]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
              </div>
              <p className="text-white font-semibold mb-1">No sessions found</p>
              <p className="text-[#6b7280] text-sm">Try adjusting your filters.</p>
            </div>
          ) : view === "grid" ? (
            <div className="space-y-10 animate-[fadeUp_0.5s_0.15s_ease_both]">
              {Object.entries(grouped).map(([time, sessions]) => (
                <div key={time}>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="flex items-center gap-2.5 bg-[#0c1120] border border-white/7 rounded-xl px-3.5 py-2 flex-shrink-0">
                      <svg className="w-3.5 h-3.5 text-[#6b7280]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6" /><path d="M8 5v3l2 2" /></svg>
                      <span className="font-black text-white text-sm font-mono" style={{ fontFamily: "Inter, sans-serif" }}>{time}</span>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                    <span className="text-[11px] text-[#4b5563] flex-shrink-0">{sessions.length} session{sessions.length > 1 ? "s" : ""}</span>
                  </div>

                  <div className={`grid gap-4 ${sessions.length === 1 ? "grid-cols-1 max-w-lg" : sessions.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
                    {sessions.map((session) => (
                      <SessionCard
                        key={session.id}
                        session={session}
                        roomIndex={roomIndexMap.get(session.room.id) ?? 0}
                        favorites={favorites}
                        onToggleFavorite={handleToggleFavorite}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2 animate-[fadeUp_0.5s_0.15s_ease_both]">
              {filtered.map((session) => {
                const live = isLive(session.startDate, session.endDate);
                const upcoming = isUpcoming(session.startDate);
                const isFav = favorites.includes(session.id);
                const roomIdx = roomIndexMap.get(session.room.id) ?? 0;
                const rc = ROOM_COLORS[roomIdx % ROOM_COLORS.length];

                return (
                  <div key={session.id} className={`group flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border px-5 py-4 relative overflow-hidden transition-all hover:translate-x-0.5 ${live ? "border-emerald-400/20 bg-[#081510]" : "border-white/7 bg-[#0c1120]"}`}>
                    <span className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-r ${live ? "bg-emerald-400" : upcoming ? "bg-indigo-500" : "bg-white/10"}`} />

                    <div className="min-w-[90px] text-[11px] font-bold text-[#6b7280] font-mono flex-shrink-0">
                      {formatTime(session.startDate)}<br />
                      <span className="text-[10px] font-normal opacity-70">{formatTime(session.endDate)}</span>
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap items-center gap-2 mb-1">
                        <Link href={`/sessions/${session.id}`} className="no-underline">
                          <h3 className="font-semibold text-white text-[14px] hover:text-indigo-300 transition-colors" style={{ fontFamily: "Inter, sans-serif" }}>{session.title}</h3>
                        </Link>
                        {live && <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-1.5 py-0.5 rounded-full"><span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />Live</span>}
                      </div>
                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-[#6b7280]">
                        <span className={`inline-flex items-center gap-1 ${rc.text}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${rc.dot}`} />{session.room.name}
                        </span>
                        <span>{session.speakers.slice(0, 2).map((ss) => ss.speaker.fullName).join(", ")}{session.speakers.length > 2 && ` +${session.speakers.length - 2}`}</span>
                        <span className="flex items-center gap-1 opacity-60">
                          <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="5" r="3" /><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" /></svg>
                          {session.capacity}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button onClick={() => handleToggleFavorite(session.id)}
                        className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${isFav ? "bg-amber-400/15 border-amber-400/30 text-amber-400" : "bg-white/5 border-white/7 text-[#4b5563] hover:text-amber-400"}`}>
                        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5"><path d="M3 2h10v13l-5-3-5 3V2z" /></svg>
                      </button>
                      <Link href={`/sessions/${session.id}`} className="w-7 h-7 rounded-lg bg-white/5 border border-white/7 flex items-center justify-center text-[#4b5563] hover:text-indigo-400 hover:border-indigo-500/30 transition-all no-underline">
                        <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 6h8M6 2l4 4-4 4" /></svg>
                      </Link>
                    </div>
                  </div>
                );
              })}
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