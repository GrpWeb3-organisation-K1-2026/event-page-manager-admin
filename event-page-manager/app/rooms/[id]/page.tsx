"use client";

import { use, useEffect, useState, useCallback } from "react";
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

interface Room {
  id: number;
  name: string;
  sessions: Session[];
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
function formatDate(d: string) { return new Date(d).toLocaleDateString("en-US", { weekday: "long", day: "numeric", month: "long" }); }
function getDayKey(d: string) { const dt = new Date(d); return `${dt.getFullYear()}-${dt.getMonth()}-${dt.getDate()}`; }
function initials(name: string) { return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2); }

const COVER_GRADIENTS = [
  { from: "#1a1040", via: "#2d1b69", to: "#4c1d95", accent: "#5b6ef5" },
  { from: "#0c2340", via: "#1e3a5f", to: "#164e63", accent: "#22d3a0" },
  { from: "#1a0a2e", via: "#3b1f5e", to: "#6d28d9", accent: "#a78bfa" },
  { from: "#0f1f0a", via: "#1a3a12", to: "#14532d", accent: "#22d3a0" },
  { from: "#0a1a2e", via: "#0c2a4a", to: "#1e3a5f", accent: "#06b6d4" },
  { from: "#1a1040", via: "#2d1b69", to: "#4c1d95", accent: "#5b6ef5" },
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
        <linearGradient id="rmLg1" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5b6ef5" /><stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="rmLg2" x1="34" y1="0" x2="0" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3a0" /><stop offset="100%" stopColor="#5b6ef5" />
        </linearGradient>
      </defs>
      <rect width="34" height="34" rx="10" fill="#0c1120" />
      <path d="M6 17 Q6 8 17 8 Q23 8 27 14" stroke="url(#rmLg1)" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M28 17 Q28 26 17 26 Q11 26 7 20" stroke="url(#rmLg2)" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M23.5 11 L27 14 L23 16.5" stroke="url(#rmLg1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M10.5 23 L7 20 L11 17.5" stroke="url(#rmLg2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
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


function SessionRow({ session, gradIndex, isFav, onToggleFav }: {
  session: Session;
  gradIndex: number;
  isFav: boolean;
  onToggleFav: (id: number) => void;
}) {
  const live = isLive(session.startDate, session.endDate);
  const upcoming = isUpcoming(session.startDate);
  const grad = COVER_GRADIENTS[gradIndex % COVER_GRADIENTS.length];

  return (
    <div className={`group relative flex flex-col sm:flex-row sm:items-center gap-3 rounded-2xl border px-5 py-4 transition-all overflow-hidden hover:translate-x-0.5 ${live ? "bg-emerald-400/3 border-emerald-400/20" : "bg-[#0c1120] border-white/7 hover:border-indigo-500/20"}`}>
      <span className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-r ${live ? "bg-emerald-400" : upcoming ? "bg-indigo-500" : "bg-white/10"}`} />

      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{ background: `radial-gradient(ellipse at 0% 50%, ${grad.accent}06 0%, transparent 60%)` }} />

      <div className="flex-shrink-0 min-w-[90px]">
        <div className={`text-[12px] font-black font-mono ${live ? "text-emerald-400" : "text-[#6b7280]"}`}
          style={{ fontFamily: "Inter, sans-serif" }}>
          {formatTime(session.startDate)}
        </div>
        <div className="text-[10px] text-[#374151]">{formatTime(session.endDate)}</div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex flex-wrap items-center gap-2 mb-1">
          <Link href={`/events/${session.event.id}/sessions/${session.id}`} className="no-underline">
            <h3 className="font-bold text-white text-[14px] hover:text-indigo-300 transition-colors"
              style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-0.3px" }}>
              {session.title}
            </h3>
          </Link>
          {live && (
            <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
              <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />Live
            </span>
          )}
          {!live && upcoming && (
            <span className="text-[9px] font-bold uppercase text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">Soon</span>
          )}
          {!live && !upcoming && (
            <span className="text-[9px] font-bold uppercase text-[#4b5563] bg-white/4 border border-white/7 px-2 py-0.5 rounded-full">Ended</span>
          )}
        </div>
        <div className="flex flex-wrap gap-3 text-[11px] text-[#4b5563]">
          <Link href={`/events/${session.event.id}`} className="flex items-center gap-1 no-underline hover:text-white transition-colors">
            <svg className="w-3 h-3 opacity-50" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="12" height="11" rx="1.5" /><path d="M5 1v4M11 1v4M2 7h12" /></svg>
            {session.event.title}
          </Link>
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3 opacity-50" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="5" r="3" /><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" /></svg>
            Capacity: {session.capacity}
          </span>
          {session.speakers.length > 0 && (
            <span>{session.speakers.slice(0, 2).map((ss) => ss.speaker.fullName).join(", ")}{session.speakers.length > 2 && ` +${session.speakers.length - 2}`}</span>
          )}
        </div>
      </div>

      {session.speakers.length > 0 && (
        <div className="hidden sm:flex items-center flex-shrink-0">
          {session.speakers.slice(0, 3).map((ss, i) => (
            ss.speaker.photo ? (
              <img key={ss.speaker.id} src={ss.speaker.photo} alt={ss.speaker.fullName}
                className="w-7 h-7 rounded-full object-cover border-2 border-[#0c1120] -ml-1.5 first:ml-0" />
            ) : (
              <div key={ss.speaker.id}
                className={`w-7 h-7 rounded-full border-2 border-[#0c1120] bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-[9px] font-black text-white -ml-1.5 first:ml-0`}>
                {initials(ss.speaker.fullName)}
              </div>
            )
          ))}
        </div>
      )}

      <div className="flex items-center gap-1.5 flex-shrink-0">
        <button onClick={() => onToggleFav(session.id)}
          className={`w-7 h-7 rounded-lg flex items-center justify-center border transition-all ${isFav ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-400" : "bg-white/4 border-white/7 text-[#4b5563] hover:text-indigo-400 hover:border-indigo-500/20"}`}>
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5"><path d="M3 2h10v13l-5-3-5 3V2z" /></svg>
        </button>
        <Link href={`/events/${session.event.id}/sessions/${session.id}`}
          className="w-7 h-7 rounded-lg bg-white/4 border border-white/7 flex items-center justify-center text-[#4b5563] hover:text-indigo-400 hover:border-indigo-500/20 transition-all no-underline">
          <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 6h8M6 2l4 4-4 4" /></svg>
        </Link>
      </div>
    </div>
  );
}


export default function RoomDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [room, setRoom] = useState<Room | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedDay, setSelectedDay] = useState<string | null>(null);

  useEffect(() => {
    setFavorites(getFavIds());
    fetch(`/api/rooms/${id}`)
      .then((r) => { if (r.status === 404) { setNotFound(true); return null; } return r.json(); })
      .then((d) => { if (d) setRoom(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleToggleFav = useCallback((sid: number) => {
    toggleFav(sid); setFavorites(getFavIds());
  }, []);

  if (loading) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'); body{font-family:'Inter',sans-serif}`}</style>
      <div className="min-h-screen bg-[#030711]"><Navbar />
        <div className="pt-36 px-4 md:px-6 max-w-5xl mx-auto animate-pulse space-y-5">
          <div className="h-12 bg-white/4 rounded-2xl w-1/2" />
          <div className="h-6 bg-white/4 rounded-xl w-1/3" />
          <div className="space-y-3">{[...Array(5)].map((_, i) => <div key={i} className="h-20 bg-white/4 rounded-2xl" />)}</div>
        </div>
      </div>
    </>
  );

  if (notFound || !room) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'); body{font-family:'Inter',sans-serif}`}</style>
      <div className="min-h-screen bg-[#030711] text-white"><Navbar />
        <div className="pt-36 px-4 text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#0c1120] border border-white/7 flex items-center justify-center mx-auto mb-6">
            <svg className="w-9 h-9 text-[#374151]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2">
              <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path d="M9 22V12h6v10" />
            </svg>
          </div>
          <h2 className="font-black text-xl text-white mb-2" style={{ fontFamily: "Inter, sans-serif" }}>Room not found</h2>
          <p className="text-[#6b7280] text-sm mb-6">This room doesn't exist or has been removed.</p>
          <Link href="/schedule" className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium px-5 py-2.5 rounded-xl no-underline hover:bg-indigo-500/20 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 8H3M7 4l-4 4 4 4" /></svg>
            Back to schedule
          </Link>
        </div>
      </div>
    </>
  );

  const sessions = room.sessions ?? [];
  const sorted = [...sessions].sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const days = Array.from(new Set(sorted.map((s) => getDayKey(s.startDate))))
    .map((key) => ({ key, label: formatDate(sorted.find((s) => getDayKey(s.startDate) === key)!.startDate) }));

  const filtered = selectedDay ? sorted.filter((s) => getDayKey(s.startDate) === selectedDay) : sorted;
  const liveNow = filtered.filter((s) => isLive(s.startDate, s.endDate));
  const liveCount = filtered.filter((s) => isLive(s.startDate, s.endDate)).length;

  const byDay = filtered.reduce<Record<string, Session[]>>((acc, s) => {
    const key = getDayKey(s.startDate);
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

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

        <main className="relative z-10 px-4 md:px-6 max-w-5xl mx-auto pb-24 pt-28 md:pt-36">

          <Link href="/schedule" className="inline-flex items-center gap-2 text-[#6b7280] hover:text-white text-sm font-medium mb-8 no-underline transition-colors group">
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 8H3M7 4l-4 4 4 4" /></svg>
            Schedule
          </Link>

          <div className="mb-10 animate-[fadeUp_0.5s_ease_both]">

            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500/20 to-indigo-500/5 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" /><path d="M9 22V12h6v10" />
                </svg>
              </div>
              <div>
                <div className="text-[11px] font-bold uppercase tracking-[2px] text-indigo-400 mb-1">Room</div>
                <h1 className="font-black text-white leading-none"
                  style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(28px,5vw,56px)", letterSpacing: "-1.5px" }}>
                  {room.name}
                </h1>
              </div>
            </div>

            <div className="flex flex-wrap gap-3 mb-7">
              {[
                { value: sessions.length, label: "Sessions", color: "#5b6ef5" },
                { value: liveCount, label: "Live now", color: "#22d3a0" },
                { value: days.length, label: "Days", color: "#a78bfa" },
                { value: favorites.filter((fid) => sessions.some((s) => s.id === fid)).length, label: "Saved", color: "#06b6d4" },
              ].map(({ value, label, color }) => (
                <div key={label} className="flex items-center gap-2 bg-white/4 border border-white/7 rounded-xl px-3 py-2">
                  <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                  <span className="font-black text-white text-sm" style={{ fontFamily: "Inter, sans-serif" }}>{value}</span>
                  <span className="text-[#6b7280] text-xs uppercase tracking-wider">{label}</span>
                </div>
              ))}
            </div>

            {liveCount > 0 && (
              <div className="flex items-center gap-3 bg-emerald-400/6 border border-emerald-400/20 rounded-2xl px-4 py-3 mb-6">
                <div className="relative flex-shrink-0">
                  <span className="w-3 h-3 bg-emerald-400 rounded-full block" />
                  <span className="absolute inset-0 w-3 h-3 bg-emerald-400 rounded-full animate-ping opacity-60" />
                </div>
                <div>
                  <span className="text-white font-bold text-sm block">{liveNow[0]?.title}</span>
                  <span className="text-emerald-400 text-[11px]">Happening right now in this room</span>
                </div>
                <Link href={`/events/${liveNow[0]?.event.id}/sessions/${liveNow[0]?.id}`}
                  className="ml-auto text-[11px] font-bold uppercase tracking-wider text-emerald-400 hover:text-emerald-300 no-underline transition-colors">
                  Join →
                </Link>
              </div>
            )}

            {days.length > 1 && (
              <div className="flex flex-wrap gap-2">
                <button onClick={() => setSelectedDay(null)}
                  className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl border transition-all ${selectedDay === null ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300" : "bg-white/4 border-white/7 text-[#6b7280] hover:text-white hover:border-white/15"}`}>
                  All days
                </button>
                {days.map((day) => (
                  <button key={day.key} onClick={() => setSelectedDay(selectedDay === day.key ? null : day.key)}
                    className={`text-xs font-semibold px-3.5 py-1.5 rounded-xl border transition-all ${selectedDay === day.key ? "bg-violet-500/15 border-violet-500/30 text-violet-300" : "bg-white/4 border-white/7 text-[#6b7280] hover:text-white hover:border-white/15"}`}>
                    {day.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          {sessions.length === 0 ? (
            <div className="text-center py-20 bg-[#0c1120] border border-white/7 rounded-2xl animate-[fadeUp_0.4s_ease_both]">
              <div className="w-14 h-14 rounded-2xl bg-white/4 border border-white/7 flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-[#374151]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
              </div>
              <p className="font-black text-white mb-1" style={{ fontFamily: "Inter, sans-serif" }}>No sessions in this room</p>
              <p className="text-[#6b7280] text-sm">Sessions will appear here once assigned to this room.</p>
            </div>
          ) : (
            <div className="space-y-10 animate-[fadeUp_0.5s_0.1s_ease_both]">
              {Object.entries(byDay).map(([dayKey, daySessions]) => {
                const dayLabel = formatDate(daySessions[0].startDate);
                return (
                  <div key={dayKey}>
                    {days.length > 1 && (
                      <div className="flex items-center gap-3 mb-5">
                        <div className="inline-flex items-center gap-2 bg-violet-500/8 border border-violet-500/20 text-violet-400 text-[11px] font-bold tracking-[1.5px] uppercase px-3 py-1.5 rounded-full">
                          <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="12" height="11" rx="1.5" /><path d="M5 1v4M11 1v4M2 7h12" /></svg>
                          {dayLabel}
                        </div>
                        <div className="flex-1 h-px bg-gradient-to-r from-white/8 to-transparent" />
                        <span className="text-[11px] text-[#374151]">{daySessions.length} session{daySessions.length > 1 ? "s" : ""}</span>
                      </div>
                    )}

                    <div className="space-y-2">
                      {daySessions.map((session, si) => (
                        <SessionRow
                          key={session.id}
                          session={session}
                          gradIndex={(session.event.id + si) % COVER_GRADIENTS.length}
                          isFav={favorites.includes(session.id)}
                          onToggleFav={handleToggleFav}
                        />
                      ))}
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