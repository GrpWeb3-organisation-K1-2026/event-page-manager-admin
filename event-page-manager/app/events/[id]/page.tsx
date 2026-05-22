"use client";

import { use, useEffect, useState } from "react";
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
function isUpcoming(s: string) { return new Date() < new Date(s); }
function formatDate(d: string) {
  return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" });
}
function formatTime(d: string) {
  return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" });
}
function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}
function getAllSpeakers(sessions: Session[]) {
  return Array.from(
    new Map(sessions.flatMap((s) => s.speakers.map((ss) => [ss.speaker.id, ss.speaker]))).values()
  );
}


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

const ROOM_COLORS = [
  { text: "text-indigo-400", bg: "bg-indigo-500/8", border: "border-indigo-500/20", dot: "bg-indigo-400", bar: "bg-indigo-500" },
  { text: "text-emerald-400", bg: "bg-emerald-500/8", border: "border-emerald-500/20", dot: "bg-emerald-400", bar: "bg-emerald-500" },
  { text: "text-violet-400", bg: "bg-violet-500/8", border: "border-violet-500/20", dot: "bg-violet-400", bar: "bg-violet-500" },
  { text: "text-orange-400", bg: "bg-orange-500/8", border: "border-orange-500/20", dot: "bg-orange-400", bar: "bg-orange-500" },
  { text: "text-cyan-400", bg: "bg-cyan-500/8", border: "border-cyan-500/20", dot: "bg-cyan-400", bar: "bg-cyan-500" },
  { text: "text-rose-400", bg: "bg-rose-500/8", border: "border-rose-500/20", dot: "bg-rose-400", bar: "bg-rose-500" },
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
        <linearGradient id="eidLg1" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5b6ef5" /><stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="eidLg2" x1="34" y1="0" x2="0" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3a0" /><stop offset="100%" stopColor="#5b6ef5" />
        </linearGradient>
      </defs>
      <rect width="34" height="34" rx="10" fill="#0c1120" />
      <path d="M6 17 Q6 8 17 8 Q23 8 27 14" stroke="url(#eidLg1)" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M28 17 Q28 26 17 26 Q11 26 7 20" stroke="url(#eidLg2)" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M23.5 11 L27 14 L23 16.5" stroke="url(#eidLg1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M10.5 23 L7 20 L11 17.5" stroke="url(#eidLg2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
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
              <Link href={href} className={`text-xs font-medium uppercase tracking-wider px-3 py-2 rounded-xl transition-all no-underline ${href === "/events" ? "text-white bg-white/8" : "text-[#6b7280] hover:text-white hover:bg-white/6"}`}>{label}</Link>
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


function SessionCard({ session, roomIndex, gradIndex }: { session: Session; roomIndex: number; gradIndex: number }) {
  const live = isLive(session.startDate, session.endDate);
  const upcoming = isUpcoming(session.startDate);
  const ended = !live && !upcoming;
  const grad = COVER_GRADIENTS[gradIndex % COVER_GRADIENTS.length];
  const rc = ROOM_COLORS[roomIndex % ROOM_COLORS.length];

  return (
    <Link
      href={`/events/${params.id}/sessions/${session.id}`}
      className="group relative no-underline block overflow-hidden rounded-2xl border border-white/7 bg-[#0c1120] hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-[0_24px_48px_rgba(0,0,0,0.5)] transition-all duration-300"
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${grad.accent}12 0%, transparent 60%)` }} />
      <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${grad.accent}, transparent)` }} />

      <div className="h-1.5 w-full" style={{ background: `linear-gradient(90deg, ${grad.from}, ${grad.via}, ${grad.to})` }} />

      <div className="relative p-4 md:p-5">
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className="text-[11px] font-bold text-[#6b7280] font-mono">
            {formatTime(session.startDate)} – {formatTime(session.endDate)}
          </span>
          <div className="flex items-center gap-1.5">
            {live && (
              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />Live
              </span>
            )}
            {!live && upcoming && (
              <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-0.5 rounded-full">Soon</span>
            )}
            {ended && (
              <span className="text-[9px] font-bold uppercase tracking-widest text-[#4b5563] bg-white/4 border border-white/7 px-2 py-0.5 rounded-full">Ended</span>
            )}
          </div>
        </div>

        <h3 className="font-black text-white text-[14px] md:text-[15px] leading-snug mb-2 group-hover:text-transparent transition-all duration-300"
          style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-0.3px",
            backgroundImage: `linear-gradient(90deg, #f0f4ff, ${grad.accent})`,
            WebkitBackgroundClip: "text", backgroundClip: "text" }}>
          {session.title}
        </h3>

        {session.description && (
          <p className="text-[#6b7280] text-xs leading-relaxed mb-3 line-clamp-2">{session.description}</p>
        )}

        <div className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-lg border mb-3 ${rc.bg} ${rc.border} ${rc.text}`}>
          <span className={`w-1.5 h-1.5 rounded-full ${rc.dot}`} />
          {session.room.name}
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-white/7">
          {session.speakers.length > 0 ? (
            <div className="flex items-center gap-2">
              <div className="flex items-center">
                {session.speakers.slice(0, 3).map((ss, i) => (
                  ss.speaker.photo ? (
                    <img key={ss.speaker.id} src={ss.speaker.photo} alt={ss.speaker.fullName}
                      className="w-6 h-6 rounded-full object-cover border-2 border-[#0c1120] -ml-1.5 first:ml-0" />
                  ) : (
                    <div key={ss.speaker.id}
                      className={`w-6 h-6 rounded-full border-2 border-[#0c1120] bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-[8px] font-black text-white -ml-1.5 first:ml-0`}>
                      {initials(ss.speaker.fullName)}
                    </div>
                  )
                ))}
              </div>
              <span className="text-[10px] text-[#4b5563]">
                {session.speakers.slice(0, 2).map((ss) => ss.speaker.fullName).join(", ")}
                {session.speakers.length > 2 && ` +${session.speakers.length - 2}`}
              </span>
            </div>
          ) : <div />}
          <span className="flex items-center gap-1 text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200" style={{ color: grad.accent }}>
            View
            <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 6h8M6 2l4 4-4 4" /></svg>
          </span>
        </div>
      </div>
    </Link>
  );
}


export default function EventDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [activeRoom, setActiveRoom] = useState<number | null>(null);

  useEffect(() => {
    fetch(`/api/events/${id}`)
      .then((r) => { if (r.status === 404) { setNotFound(true); return null; } return r.json(); })
      .then((d) => { if (d) setEvent(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'); body{font-family:'Inter',sans-serif}`}</style>
      <div className="min-h-screen bg-[#030711]"><Navbar />
        <div className="pt-36 px-4 md:px-6 max-w-5xl mx-auto animate-pulse space-y-5">
          <div className="h-10 bg-white/4 rounded-2xl w-2/3" />
          <div className="h-5 bg-white/4 rounded-xl w-1/3" />
          <div className="h-40 bg-white/4 rounded-3xl" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => <div key={i} className="h-48 bg-white/4 rounded-2xl" />)}
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
            <svg className="w-9 h-9 text-[#374151]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
          </div>
          <h2 className="font-black text-xl text-white mb-2" style={{ fontFamily: "Inter, sans-serif" }}>Event not found</h2>
          <p className="text-[#6b7280] text-sm mb-6">This event doesn't exist or has been removed.</p>
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
  const allSpeakers = getAllSpeakers(event.sessions);
  const liveCount = event.sessions.filter((s) => isLive(s.startDate, s.endDate)).length;

  const filteredSessions = (activeRoom !== null
    ? event.sessions.filter((s) => s.room.id === activeRoom)
    : event.sessions
  ).sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

  const grouped = filteredSessions.reduce<Record<string, Session[]>>((acc, s) => {
    const key = formatTime(s.startDate);
    if (!acc[key]) acc[key] = [];
    acc[key].push(s);
    return acc;
  }, {});

  const grad = COVER_GRADIENTS[event.id % COVER_GRADIENTS.length];

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

          <Link href="/events" className="inline-flex items-center gap-2 text-[#6b7280] hover:text-white text-sm font-medium mb-8 no-underline transition-colors group">
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 8H3M7 4l-4 4 4 4" /></svg>
            All events
          </Link>

          <div className="relative overflow-hidden rounded-3xl border border-white/7 bg-[#0c1120] mb-10 animate-[fadeUp_0.5s_ease_both]">
            <div className="absolute inset-0 opacity-60" style={{ background: `radial-gradient(ellipse at 50% 0%, ${grad.accent}10 0%, transparent 60%)` }} />
            <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${grad.accent}80, transparent)` }} />

            <div className="relative h-40 md:h-52 overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${grad.from}, ${grad.via}, ${grad.to})` }}>
              <div className="absolute -top-8 -right-8 w-48 h-48 rounded-full opacity-30" style={{ background: `radial-gradient(circle, ${grad.accent}60, transparent)` }} />
              <div className="absolute -bottom-6 -left-6 w-32 h-32 rounded-full opacity-20" style={{ background: `radial-gradient(circle, ${grad.accent}40, transparent)` }} />

              <div className="absolute bottom-3 right-5 font-black opacity-10 select-none leading-none"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "100px", color: grad.accent, letterSpacing: "-4px" }}>
                {String(event.id).padStart(2, "0")}
              </div>

              <div className="absolute top-4 left-4 flex gap-2">
                {liveCount > 0 && (
                  <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/15 backdrop-blur-sm border border-emerald-400/30 px-2.5 py-1 rounded-full">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />{liveCount} live
                  </span>
                )}
                {liveCount === 0 && isUpcoming(event.startDate) && (
                  <span className="text-[10px] font-bold uppercase tracking-widest text-indigo-300 bg-indigo-500/15 backdrop-blur-sm border border-indigo-500/30 px-2.5 py-1 rounded-full">Upcoming</span>
                )}
              </div>

              <div className="absolute top-4 right-4 bg-black/30 backdrop-blur-sm border border-white/10 text-white/70 text-[10px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-lg">
                {event.sessions.length} sessions
              </div>
              <div className="absolute bottom-4 right-4 w-3 h-3 rounded-full" style={{ background: grad.accent, boxShadow: `0 0 12px ${grad.accent}` }} />
            </div>

            <div className="relative p-5 md:p-8">
              <h1 className="font-black text-white leading-tight mb-2"
                style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(24px,4vw,44px)", letterSpacing: "-1px" }}>
                {event.title}
              </h1>
              <p className="text-[#6b7280] text-sm md:text-base leading-relaxed mb-5 max-w-2xl">{event.description}</p>

              <div className="flex flex-wrap gap-4 text-[12px] text-[#6b7280] mb-6">
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 opacity-50" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="12" height="11" rx="1.5" /><path d="M5 1v4M11 1v4M2 7h12" /></svg>
                  {formatDate(event.startDate)}{event.startDate.slice(0, 10) !== event.endDate.slice(0, 10) && ` → ${formatDate(event.endDate)}`}
                </span>
                <span className="flex items-center gap-1.5">
                  <svg className="w-3.5 h-3.5 opacity-50" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8.5 4.5 8.5s4.5-5 4.5-8.5c0-2.5-2-4.5-4.5-4.5z" /><circle cx="8" cy="6" r="1.5" /></svg>
                  {event.place}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 mb-6">
                {[
                  { value: event.sessions.length, label: "Sessions", color: "#5b6ef5" },
                  { value: liveCount, label: "Live now", color: "#22d3a0" },
                  { value: rooms.length, label: "Rooms", color: "#a78bfa" },
                  { value: allSpeakers.length, label: "Speakers", color: "#f97316" },
                ].map(({ value, label, color }) => (
                  <div key={label} className="flex items-center gap-2 bg-white/4 border border-white/7 rounded-xl px-3 py-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                    <span className="font-black text-white text-sm" style={{ fontFamily: "Inter, sans-serif" }}>{value}</span>
                    <span className="text-[#6b7280] text-xs uppercase tracking-wider">{label}</span>
                  </div>
                ))}
              </div>

              {allSpeakers.length > 0 && (
                <div className="flex flex-wrap items-center gap-3 pt-5 border-t border-white/7">
                  <span className="text-[11px] font-bold uppercase tracking-widest text-[#4b5563]">Speakers</span>
                  <div className="flex items-center">
                    {allSpeakers.slice(0, 8).map((sp, i) => (
                      <Link key={sp.id} href={`/speakers/${sp.id}`} className="no-underline" title={sp.fullName}>
                        {sp.photo ? (
                          <img src={sp.photo} alt={sp.fullName} className="w-8 h-8 rounded-full object-cover border-2 border-[#0c1120] -ml-2 first:ml-0 hover:scale-110 transition-transform" />
                        ) : (
                          <div className={`w-8 h-8 rounded-full border-2 border-[#0c1120] bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center text-[10px] font-black text-white -ml-2 first:ml-0 hover:scale-110 transition-transform`}>
                            {initials(sp.fullName)}
                          </div>
                        )}
                      </Link>
                    ))}
                    {allSpeakers.length > 8 && (
                      <div className="w-8 h-8 rounded-full border-2 border-[#0c1120] bg-[#1f2937] flex items-center justify-center text-[10px] font-bold text-[#9ca3af] -ml-2">
                        +{allSpeakers.length - 8}
                      </div>
                    )}
                  </div>
                  <Link href={`/events/${id}/sessions`}
                    className="ml-auto text-[11px] font-bold uppercase tracking-wider text-indigo-400 hover:text-indigo-300 no-underline transition-colors flex items-center gap-1">
                    Full schedule
                    <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 6h8M6 2l4 4-4 4" /></svg>
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="animate-[fadeUp_0.5s_0.1s_ease_both]">

            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="inline-flex items-center gap-2 bg-indigo-500/8 border border-indigo-500/20 text-indigo-400 text-[11px] font-bold tracking-[1.5px] uppercase px-3.5 py-1.5 rounded-full">
                <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" /><rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" /></svg>
                Schedule
              </div>
              {rooms.length > 1 && rooms.map((room) => {
                const rc = ROOM_COLORS[roomIndexMap.get(room.id)! % ROOM_COLORS.length];
                return (
                  <button key={room.id} onClick={() => setActiveRoom(activeRoom === room.id ? null : room.id)}
                    className={`flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-xl border transition-all ${activeRoom === room.id ? `${rc.bg} ${rc.border} ${rc.text}` : "bg-white/4 border-white/7 text-[#6b7280] hover:text-white hover:border-white/15"}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${rc.dot}`} />
                    {room.name}
                  </button>
                );
              })}
              <button onClick={() => setActiveRoom(null)}
                className={`text-[11px] font-bold uppercase tracking-wider px-3.5 py-1.5 rounded-xl border transition-all ${activeRoom === null ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-300" : "bg-white/4 border-white/7 text-[#6b7280] hover:text-white hover:border-white/15"}`}>
                All rooms
              </button>
              <Link href={`/events/${id}/sessions`}
                className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-[#6b7280] hover:text-white no-underline transition-colors">
                Full view
                <svg className="w-3.5 h-3.5" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 6h8M6 2l4 4-4 4" /></svg>
              </Link>
            </div>

            {event.sessions.length === 0 ? (
              <div className="text-center py-20 bg-[#0c1120] border border-white/7 rounded-2xl">
                <div className="w-14 h-14 rounded-2xl bg-white/4 border border-white/7 flex items-center justify-center mx-auto mb-4">
                  <svg className="w-6 h-6 text-[#374151]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                </div>
                <p className="font-black text-white mb-1" style={{ fontFamily: "Inter, sans-serif" }}>No sessions yet</p>
                <p className="text-[#6b7280] text-sm">Sessions will appear here once added.</p>
              </div>
            ) : (
              <div className="space-y-8">
                {Object.entries(grouped).map(([time, sessions]) => (
                  <div key={time}>
                    <div className="flex items-center gap-3 mb-4">
                      <div className="flex items-center gap-2 bg-[#0c1120] border border-white/7 rounded-xl px-3 py-1.5 flex-shrink-0">
                        <svg className="w-3 h-3 text-[#4b5563]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6" /><path d="M8 5v3l2 2" /></svg>
                        <span className="font-black text-white text-[12px]" style={{ fontFamily: "Inter, sans-serif" }}>{time}</span>
                      </div>
                      <div className="flex-1 h-px bg-gradient-to-r from-white/8 to-transparent" />
                      {sessions.some((s) => isLive(s.startDate, s.endDate)) && (
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase text-emerald-400 flex-shrink-0">
                          <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />Live
                        </span>
                      )}
                      <span className="text-[10px] text-[#374151] flex-shrink-0">{sessions.length} parallel</span>
                    </div>

                    <div className={`grid gap-4 ${sessions.length === 1 ? "grid-cols-1 max-w-md" : sessions.length === 2 ? "grid-cols-1 md:grid-cols-2" : "grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}`}>
                      {sessions.map((session, si) => (
                        <SessionCard
                          key={session.id}
                          session={session}
                          roomIndex={roomIndexMap.get(session.room.id) ?? 0}
                          gradIndex={(event.id + si) % COVER_GRADIENTS.length}
                        />
                      ))}
                    </div>
                  </div>
                ))}

                <div className="text-center pt-4">
                  <Link href={`/events/${id}/sessions`}
                    className="inline-flex items-center gap-2 bg-white/4 border border-white/7 hover:border-indigo-500/30 hover:bg-indigo-500/8 text-[#6b7280] hover:text-indigo-300 text-xs font-bold uppercase tracking-wider px-6 py-3 rounded-2xl no-underline transition-all">
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="1" y="1" width="6" height="6" rx="1" /><rect x="9" y="1" width="6" height="6" rx="1" /><rect x="1" y="9" width="6" height="6" rx="1" /><rect x="9" y="9" width="6" height="6" rx="1" /></svg>
                    Open full multi-track view
                  </Link>
                </div>
              </div>
            )}
          </div>
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