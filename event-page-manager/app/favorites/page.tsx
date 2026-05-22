"use client";

import { useEffect, useState } from "react";
import Link from "next/link";


interface Session {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  capacity: number;
  room: { id: number; name: string };
  speakers: { speaker: { id: number; fullName: string; photo: string | null } }[];
  event: { id: number; title: string };
}

const FAVORITES_KEY = "eventsync_favorites";

function getFavoriteIds(): number[] {
  try { return JSON.parse(localStorage.getItem(FAVORITES_KEY) ?? "[]"); }
  catch { return []; }
}
function removeFavorite(id: number) {
  localStorage.setItem(FAVORITES_KEY, JSON.stringify(getFavoriteIds().filter((f) => f !== id)));
}
function clearAllFavorites() {
  localStorage.setItem(FAVORITES_KEY, "[]");
}


function isLive(s: string, e: string) { const n = new Date(); return n >= new Date(s) && n <= new Date(e); }
function isUpcoming(s: string) { return new Date() < new Date(s); }
function formatDate(d: string) { return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }); }
function formatTime(d: string) { return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }); }
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

const ROOM_COLORS = [
  { text: "text-indigo-400", bg: "bg-indigo-500/8", border: "border-indigo-500/20", dot: "bg-indigo-400" },
  { text: "text-emerald-400", bg: "bg-emerald-500/8", border: "border-emerald-500/20", dot: "bg-emerald-400" },
  { text: "text-violet-400", bg: "bg-violet-500/8", border: "border-violet-500/20", dot: "bg-violet-400" },
  { text: "text-cyan-400", bg: "bg-cyan-500/8", border: "border-cyan-500/20", dot: "bg-cyan-400" },
  { text: "text-blue-400", bg: "bg-blue-500/8", border: "border-blue-500/20", dot: "bg-blue-400" },
  { text: "text-pink-400", bg: "bg-pink-500/8", border: "border-pink-500/20", dot: "bg-pink-400" },
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
        <linearGradient id="favLg1" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5b6ef5" /><stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="favLg2" x1="34" y1="0" x2="0" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3a0" /><stop offset="100%" stopColor="#5b6ef5" />
        </linearGradient>
      </defs>
      <rect width="34" height="34" rx="10" fill="#0c1120" />
      <path d="M6 17 Q6 8 17 8 Q23 8 27 14" stroke="url(#favLg1)" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M28 17 Q28 26 17 26 Q11 26 7 20" stroke="url(#favLg2)" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M23.5 11 L27 14 L23 16.5" stroke="url(#favLg1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M10.5 23 L7 20 L11 17.5" stroke="url(#favLg2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
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
              <Link href={href} className={`text-xs font-medium uppercase tracking-wider px-3 py-2 rounded-xl transition-all no-underline ${href === "/favorites" ? "text-white bg-white/8" : "text-[#6b7280] hover:text-white hover:bg-white/6"}`}>{label}</Link>
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


function FavoriteCard({ session, index, onRemove }: { session: Session; index: number; onRemove: (id: number) => void }) {
  const live = isLive(session.startDate, session.endDate);
  const upcoming = isUpcoming(session.startDate);
  const grad = COVER_GRADIENTS[index % COVER_GRADIENTS.length];
  const rc = ROOM_COLORS[index % ROOM_COLORS.length];

  return (
    <div className="group relative overflow-hidden rounded-2xl border border-white/7 bg-[#0c1120] hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-[0_24px_48px_rgba(0,0,0,0.5)] transition-all duration-300">
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${grad.accent}12 0%, transparent 60%)` }} />
      <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${grad.accent}, transparent)` }} />

      <div className="h-1 w-full" style={{ background: `linear-gradient(90deg, ${grad.from}, ${grad.via}, ${grad.to})` }} />

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
          <button onClick={() => onRemove(session.id)}
            className="flex-shrink-0 w-7 h-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 hover:bg-rose-500/10 hover:border-rose-500/20 hover:text-rose-400 flex items-center justify-center transition-all"
            title="Remove from favorites">
            <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="currentColor"><path d="M3 2h10v13l-5-3-5 3V2z" /></svg>
          </button>
        </div>

        <div className="text-[10px] font-bold uppercase tracking-widest text-[#4b5563] mb-1.5 flex items-center gap-1.5">
          <svg className="w-3 h-3 opacity-50" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="12" height="11" rx="1.5" /><path d="M5 1v4M11 1v4M2 7h12" /></svg>
          <Link href={`/events/${session.event.id}`} className="no-underline hover:text-indigo-400 transition-colors">
            {session.event.title}
          </Link>
        </div>

        <Link href={`/sessions/${session.id}`} className="no-underline">
          <h3 className="font-black text-white text-[14px] md:text-[15px] leading-snug mb-2 hover:text-transparent transition-all duration-300 cursor-pointer"
            style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-0.3px",
              backgroundImage: `linear-gradient(90deg, #f0f4ff, ${grad.accent})`,
              WebkitBackgroundClip: "text", backgroundClip: "text" }}>
            {session.title}
          </h3>
        </Link>

        {session.description && (
          <p className="text-[#6b7280] text-xs leading-relaxed mb-3 line-clamp-2">{session.description}</p>
        )}

        <div className="flex flex-wrap gap-2 mb-3">
          <div className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-lg border ${rc.bg} ${rc.border} ${rc.text}`}>
            <span className={`w-1.5 h-1.5 rounded-full ${rc.dot}`} />{session.room.name}
          </div>
          <div className="inline-flex items-center gap-1.5 text-[10px] text-[#4b5563]">
            <svg className="w-3 h-3 opacity-50" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="12" height="11" rx="1.5" /><path d="M5 1v4M11 1v4M2 7h12" /></svg>
            {formatDate(session.startDate)}
          </div>
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
          <Link href={`/sessions/${session.id}`}
            className="flex items-center gap-1 text-[11px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200 no-underline"
            style={{ color: grad.accent }}>
            View <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 6h8M6 2l4 4-4 4" /></svg>
          </Link>
        </div>
      </div>
    </div>
  );
}


export default function FavoritesPage() {
  const [favoriteIds, setFavoriteIds] = useState<number[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ids = getFavoriteIds();
    setFavoriteIds(ids);
    if (ids.length === 0) { setLoading(false); return; }
    Promise.all(ids.map((id) => fetch(`/api/sessions/${id}`).then((r) => r.ok ? r.json() : null)))
      .then((results) => setSessions(results.filter(Boolean).map((r: any) => r.data)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRemove = (id: number) => {
    removeFavorite(id);
    setSessions((p) => p.filter((s) => s.id !== id));
    setFavoriteIds((p) => p.filter((f) => f !== id));
  };

  const handleClearAll = () => {
    clearAllFavorites();
    setSessions([]);
    setFavoriteIds([]);
  };

  const liveCount = sessions.filter((s) => isLive(s.startDate, s.endDate)).length;
  const upcomingCount = sessions.filter((s) => isUpcoming(s.startDate)).length;

  const sorted = [...sessions].sort((a, b) => {
    const rank = (s: Session) => isLive(s.startDate, s.endDate) ? 0 : isUpcoming(s.startDate) ? 1 : 2;
    if (rank(a) !== rank(b)) return rank(a) - rank(b);
    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
  });

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
        <div className="fixed rounded-full pointer-events-none z-0" style={{ width: "min(500px,70vw)", height: "min(500px,70vw)", background: "radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)", bottom: "10%", right: "-100px", filter: "blur(120px)" }} />
        <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "80px 80px", maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)" }} />

        <Navbar />

        <main className="relative z-10 px-4 md:px-6 max-w-5xl mx-auto pb-24 pt-28 md:pt-36">

          <div className="mb-10 animate-[fadeUp_0.5s_ease_both]">
            <div className="absolute right-4 md:right-6 top-24 md:top-32 font-black select-none pointer-events-none"
              style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(100px,18vw,200px)", color: "rgba(255,255,255,0.02)", letterSpacing: "-8px", lineHeight: 1 }}>
              {favoriteIds.length}
            </div>

            <div className="inline-flex items-center gap-2 bg-indigo-500/8 border border-indigo-500/20 text-indigo-400 text-[11px] font-bold tracking-[1.5px] uppercase px-3.5 py-1.5 rounded-full mb-5">
              <svg className="w-3 h-3" viewBox="0 0 16 16" fill="currentColor"><path d="M3 2h10v13l-5-3-5 3V2z" /></svg>
              My Itinerary
            </div>

            <h1 className="font-black text-white mb-3"
              style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(40px,7vw,80px)", letterSpacing: "clamp(-2px,-0.03em,-4px)", lineHeight: 0.95 }}>
              Your saved<br />
              <span style={{ background: "linear-gradient(90deg, #5b6ef5, #a78bfa, #22d3a0)", backgroundSize: "200%", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", animation: "gradientShift 4s linear infinite" }}>
                sessions.
              </span>
            </h1>

            <p className="text-[#6b7280] text-base md:text-lg font-light max-w-lg leading-relaxed mt-4 mb-7">
              Your personal schedule — bookmarked sessions saved locally in your browser.
            </p>

            {favoriteIds.length > 0 && (
              <div className="flex flex-wrap items-center gap-3">
                {[
                  { value: favoriteIds.length, label: "Saved", color: "#5b6ef5" },
                  { value: liveCount, label: "Live now", color: "#22d3a0" },
                  { value: upcomingCount, label: "Upcoming", color: "#a78bfa" },
                ].map(({ value, label, color }) => (
                  <div key={label} className="flex items-center gap-2 bg-white/4 border border-white/7 rounded-xl px-3 py-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                    <span className="font-black text-white text-sm" style={{ fontFamily: "Inter, sans-serif" }}>{value}</span>
                    <span className="text-[#6b7280] text-xs uppercase tracking-wider">{label}</span>
                  </div>
                ))}
                <button onClick={handleClearAll}
                  className="ml-auto flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-[#4b5563] hover:text-white border border-white/7 hover:border-white/15 bg-white/4 hover:bg-white/8 px-3 py-2 rounded-xl transition-all">
                  <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 4h10M5 4V2h6v2M6 7v5M10 7v5M4 4l1 10h6l1-10" /></svg>
                  Clear all
                </button>
              </div>
            )}
          </div>
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="bg-[#0c1120] border border-white/7 rounded-2xl h-52 animate-pulse" style={{ animationDelay: `${i * 80}ms` }} />
              ))}
            </div>
          ) : sorted.length === 0 ? (
            <div className="text-center py-32 bg-[#0c1120] border border-white/7 rounded-2xl animate-[fadeUp_0.4s_ease_both]">
              <div className="w-16 h-16 rounded-2xl bg-white/4 border border-white/7 flex items-center justify-center mx-auto mb-5">
                <svg className="w-7 h-7 text-[#374151]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M3 2h10v13l-5-3-5 3V2z" /></svg>
              </div>
              <p className="font-black text-white text-lg mb-2" style={{ fontFamily: "Inter, sans-serif" }}>No saved sessions yet</p>
              <p className="text-[#6b7280] text-sm mb-6">Browse sessions and bookmark them to build your personal itinerary.</p>
              <Link href="/events" className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium px-5 py-2.5 rounded-xl no-underline hover:bg-indigo-500/20 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="12" height="11" rx="1.5" /><path d="M5 1v4M11 1v4M2 7h12" /></svg>
                Browse events
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-[fadeUp_0.5s_0.1s_ease_both]">
              {sorted.map((session, i) => (
                <FavoriteCard key={session.id} session={session} index={i} onRemove={handleRemove} />
              ))}
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