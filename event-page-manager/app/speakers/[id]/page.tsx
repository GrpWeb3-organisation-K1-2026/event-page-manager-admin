"use client";

import { use, useEffect, useState } from "react";
import Link from "next/link";

interface Session {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  room: { id: number; name: string };
  event: { id: number; title: string };
}

interface Speaker {
  id: number;
  fullName: string;
  biography: string;
  photo: string | null;
  links: Record<string, string> | null;
  sessions: { session: Session }[];
}

function isLive(s: string, e: string) { const n = new Date(); return n >= new Date(s) && n <= new Date(e); }
function isUpcoming(s: string) { return new Date() < new Date(s); }
function formatDate(d: string) { return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" }); }
function formatTime(d: string) { return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }); }
function initials(name: string) { return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2); }

const GRADIENTS = [
  { from: "#5b6ef5", to: "#a78bfa" },
  { from: "#22d3a0", to: "#0891b2" },
  { from: "#f97316", to: "#ef4444" },
  { from: "#a78bfa", to: "#ec4899" },
  { from: "#06b6d4", to: "#3b82f6" },
  { from: "#f43f5e", to: "#f97316" },
];

function AdminShieldIcon() {
  return (
    <svg width={13} height={13} viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5L2.5 4v4c0 3 2.5 5.5 5.5 6.5C11 13.5 13.5 11 13.5 8V4L8 1.5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" fill="none" />
      <path d="M9.2 5.5H7.1L6.3 9h2L7.8 12 10.5 8H8.4L9.2 5.5z" fill="currentColor" />
    </svg>
  );
}

function IconUserX() {
  return (
    <svg className="w-10 h-10 text-[#374151]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="10" cy="8" r="4" />
      <path d="M2 20c0-4 3.6-7 8-7" />
      <line x1="17" y1="14" x2="22" y2="19" />
      <line x1="22" y1="14" x2="17" y2="19" />
    </svg>
  );
}

function EventSyncLogo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none">
      <defs>
        <linearGradient id="sdLg1" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5b6ef5" /><stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="sdLg2" x1="34" y1="0" x2="0" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3a0" /><stop offset="100%" stopColor="#5b6ef5" />
        </linearGradient>
      </defs>
      <rect width="34" height="34" rx="10" fill="#0c1120" />
      <path d="M6 17 Q6 8 17 8 Q23 8 27 14" stroke="url(#sdLg1)" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M28 17 Q28 26 17 26 Q11 26 7 20" stroke="url(#sdLg2)" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M23.5 11 L27 14 L23 16.5" stroke="url(#sdLg1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M10.5 23 L7 20 L11 17.5" stroke="url(#sdLg2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="17" cy="17" r="2.8" fill="#22d3a0" />
      <circle cx="17" cy="17" r="2.8" fill="#22d3a0" opacity="0.35">
        <animate attributeName="r" values="2.8;5;2.8" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.35;0;0.35" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function SocialIcon({ platform }: { platform: string }) {
  const p = platform.toLowerCase();
  if (p === "twitter" || p === "x")
    return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.631L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" /></svg>;
  if (p === "github")
    return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>;
  if (p === "linkedin")
    return <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>;
  return (
    <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6" /><path d="M8 2a10 10 0 010 12M2 8h12" /><path d="M3 5h10M3 11h10" />
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
              <Link href={href} className={`text-xs font-medium uppercase tracking-wider px-3 py-2 rounded-xl transition-all no-underline ${href === "/speakers" ? "text-white bg-white/8" : "text-[#6b7280] hover:text-white hover:bg-white/6"}`}>{label}</Link>
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

function SessionRow({ session }: { session: Session }) {
  const live = isLive(session.startDate, session.endDate);
  const upcoming = isUpcoming(session.startDate);

  return (
    <Link href={`/sessions/${session.id}`} className="group flex flex-col sm:flex-row sm:items-center gap-3 bg-[#0c1120] border border-white/7 rounded-2xl px-5 py-4 hover:border-indigo-500/30 hover:bg-indigo-500/3 hover:translate-x-1 transition-all no-underline relative overflow-hidden">
      <span className={`absolute left-0 top-0 bottom-0 w-0.5 rounded-r ${live ? "bg-emerald-400" : upcoming ? "bg-indigo-500" : "bg-white/10"}`} />
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-white text-[14px] md:text-[15px] leading-snug mb-1.5 group-hover:text-indigo-300 transition-colors" style={{ fontFamily: "Inter, sans-serif" }}>
          {session.title}
        </h4>
        <div className="flex flex-wrap gap-3 text-[11px] text-[#6b7280]">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3 opacity-50" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6" /><path d="M8 5v3l2 2" /></svg>
            {formatTime(session.startDate)} – {formatTime(session.endDate)}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3 opacity-50" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="12" height="11" rx="1.5" /><path d="M5 1v4M11 1v4M2 7h12" /></svg>
            {formatDate(session.startDate)}
          </span>
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3 opacity-50" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="12" height="11" rx="1" /><path d="M5 14V9h6v5" /></svg>
            {session.room.name}
          </span>
          <span className="flex items-center gap-1 opacity-70">{session.event.title}</span>
        </div>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        {live ? (
          <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded-full">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />Live
          </span>
        ) : upcoming ? (
          <span className="text-[9px] font-bold uppercase tracking-widest text-indigo-400 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-full">Soon</span>
        ) : (
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#6b7280] bg-white/5 border border-white/7 px-2 py-1 rounded-full">Ended</span>
        )}
        <svg className="w-3.5 h-3.5 text-[#374151] group-hover:text-indigo-400 transition-colors" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M2 6h8M6 2l4 4-4 4" /></svg>
      </div>
    </Link>
  );
}

export default function SpeakerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [speaker, setSpeaker] = useState<Speaker | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    fetch(`/api/speakers/${id}`)
      .then((r) => { if (r.status === 404) { setNotFound(true); return null; } return r.json(); })
      .then((d) => { if (d) setSpeaker(d.data); })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const sessions = speaker?.sessions.map((s) => s.session) ?? [];
  const liveSessions = sessions.filter((s) => isLive(s.startDate, s.endDate));
  const upcomingSessions = sessions.filter((s) => isUpcoming(s.startDate));
  const pastSessions = sessions.filter((s) => !isLive(s.startDate, s.endDate) && !isUpcoming(s.startDate));
  const grad = speaker ? GRADIENTS[speaker.id % GRADIENTS.length] : GRADIENTS[0];
  const speakerIsLive = liveSessions.length > 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gradientShift { 0%{background-position:0%} 100%{background-position:200%} }
        @keyframes rotateSlow { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        body { font-family: 'Inter', sans-serif; }
      `}</style>

      <div className="min-h-screen bg-[#030711] text-white relative overflow-x-hidden">
        {speaker && (
          <>
            <div className="fixed rounded-full pointer-events-none z-0" style={{ width: "min(700px,90vw)", height: "min(700px,90vw)", background: `radial-gradient(circle, ${grad.from}20 0%, transparent 70%)`, top: "-200px", left: "-150px", filter: "blur(130px)" }} />
            <div className="fixed rounded-full pointer-events-none z-0" style={{ width: "min(500px,70vw)", height: "min(500px,70vw)", background: `radial-gradient(circle, ${grad.to}14 0%, transparent 70%)`, bottom: "10%", right: "-100px", filter: "blur(120px)" }} />
          </>
        )}
        {!speaker && (
          <div className="fixed rounded-full pointer-events-none z-0" style={{ width: "min(600px,80vw)", height: "min(600px,80vw)", background: "radial-gradient(circle, rgba(91,110,245,0.14) 0%, transparent 70%)", top: "-150px", left: "-100px", filter: "blur(120px)" }} />
        )}
        <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "80px 80px", maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)" }} />

        <Navbar />

        <main className="relative z-10 px-4 md:px-6 max-w-5xl mx-auto pb-24 pt-28 md:pt-36">

          <Link href="/speakers" className="inline-flex items-center gap-2 text-[#6b7280] hover:text-white text-sm font-medium mb-10 no-underline transition-colors group">
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 8H3M7 4l-4 4 4 4" /></svg>
            All speakers
          </Link>

          {loading && (
            <div className="animate-pulse space-y-8">
              <div className="h-64 bg-white/5 rounded-3xl" />
              <div className="space-y-3">
                <div className="h-6 bg-white/5 rounded-xl w-1/3" />
                <div className="h-4 bg-white/5 rounded-lg w-2/3" />
                <div className="h-4 bg-white/5 rounded-lg w-1/2" />
              </div>
            </div>
          )}

          {!loading && notFound && (
            <div className="text-center py-32">
              <div className="w-24 h-24 rounded-2xl bg-[#0c1120] border border-white/7 flex items-center justify-center mx-auto mb-6">
                <IconUserX />
              </div>
              <h2 className="font-bold text-xl text-white mb-2" style={{ fontFamily: "Inter, sans-serif" }}>Speaker not found</h2>
              <p className="text-[#6b7280] text-sm mb-6">This speaker doesn't exist or has been removed.</p>
              <Link href="/speakers" className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium px-5 py-2.5 rounded-xl no-underline hover:bg-indigo-500/20 transition-colors">
                <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 8H3M7 4l-4 4 4 4" /></svg>
                Back to speakers
              </Link>
            </div>
          )}

          {!loading && speaker && (
            <div className="animate-[fadeUp_0.5s_ease_both]">

              <div className="relative rounded-3xl overflow-hidden mb-10 md:mb-12 border border-white/7">
                <div className="absolute inset-0" style={{ background: `linear-gradient(135deg, ${grad.from}22 0%, ${grad.to}10 50%, transparent 100%)` }} />
                <div className="absolute -right-20 -top-20 w-72 h-72 rounded-full border border-white/5 hidden md:block" style={{ animation: "rotateSlow 20s linear infinite" }} />
                <div className="absolute -right-10 -top-10 w-48 h-48 rounded-full border border-white/3 hidden md:block" style={{ animation: "rotateSlow 14s linear infinite reverse" }} />

                <div className="relative flex flex-col md:flex-row gap-6 md:gap-10 p-6 md:p-10">
                  <div className="flex-shrink-0 relative self-start">
                    <div className="absolute inset-0 rounded-2xl blur-2xl opacity-60 scale-110" style={{ background: `linear-gradient(135deg, ${grad.from}, ${grad.to})` }} />
                    {speaker.photo ? (
                      <img src={speaker.photo} alt={speaker.fullName} className="relative z-10 w-28 h-28 md:w-36 md:h-36 rounded-2xl object-cover border border-white/15" />
                    ) : (
                      <div className="relative z-10 w-28 h-28 md:w-36 md:h-36 rounded-2xl flex items-center justify-center font-black text-white text-4xl md:text-5xl border border-white/15"
                        style={{ background: `linear-gradient(135deg, ${grad.from}, ${grad.to})`, fontFamily: "Inter, sans-serif" }}>
                        {initials(speaker.fullName)}
                      </div>
                    )}
                    {speakerIsLive && (
                      <div className="absolute -top-2 -right-2 z-20">
                        <span className="w-5 h-5 bg-emerald-400 rounded-full border-2 border-[#030711] flex items-center justify-center">
                          <span className="absolute w-5 h-5 bg-emerald-400 rounded-full animate-ping opacity-60" />
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    {speakerIsLive && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2.5 py-1 rounded-full mb-3">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />Speaking now
                      </span>
                    )}
                    <h1 className="font-black text-white mb-3 leading-none" style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(26px,5vw,52px)", letterSpacing: "-1.5px" }}>
                      {speaker.fullName}
                    </h1>
                    <p className="text-[#9ca3af] text-sm md:text-base leading-relaxed mb-6 max-w-xl">
                      {speaker.biography}
                    </p>
                    {speaker.links && Object.keys(speaker.links).length > 0 && (
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(speaker.links).map(([platform, url]) => (
                          <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-white/20 text-[#9ca3af] hover:text-white text-xs font-medium px-3 py-2 rounded-xl transition-all no-underline capitalize"
                            onClick={(e) => e.stopPropagation()}>
                            <SocialIcon platform={platform} />
                            {platform}
                          </a>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Stats strip */}
                <div className="relative border-t border-white/7 grid grid-cols-3 divide-x divide-white/7">
                  {[
                    { value: sessions.length, label: "Total", accent: false },
                    { value: liveSessions.length, label: "Live now", accent: speakerIsLive },
                    { value: upcomingSessions.length, label: "Upcoming", accent: false },
                  ].map(({ value, label, accent }) => (
                    <div key={label} className={`px-4 md:px-8 py-4 text-center ${accent ? "bg-emerald-400/5" : ""}`}>
                      <div className="font-black text-2xl md:text-3xl mb-0.5" style={{ fontFamily: "Inter, sans-serif", color: accent ? "#22d3a0" : "white" }}>{value}</div>
                      <div className="text-[11px] text-[#6b7280] uppercase tracking-wider">{label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Sessions */}
              {sessions.length === 0 ? (
                <div className="text-center py-16 bg-[#0c1120] border border-white/7 rounded-2xl">
                  <div className="w-16 h-16 rounded-2xl bg-white/4 border border-white/7 flex items-center justify-center mx-auto mb-4">
                    <svg className="w-7 h-7 text-[#374151]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
                  </div>
                  <p className="text-white font-semibold mb-1">No sessions yet</p>
                  <p className="text-[#6b7280] text-sm">Sessions will appear here once assigned.</p>
                </div>
              ) : (
                <div className="space-y-10">
                  {liveSessions.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-5">
                        <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="text-emerald-400 text-xs font-black uppercase tracking-[2px]">Live now</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-emerald-400/30 to-transparent" />
                      </div>
                      <div className="space-y-3">{liveSessions.map((s) => <SessionRow key={s.id} session={s} />)}</div>
                    </div>
                  )}
                  {upcomingSessions.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-5">
                        <span className="text-[#6b7280] text-xs font-black uppercase tracking-[2px]">Upcoming</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                      </div>
                      <div className="space-y-3">{upcomingSessions.map((s) => <SessionRow key={s.id} session={s} />)}</div>
                    </div>
                  )}
                  {pastSessions.length > 0 && (
                    <div>
                      <div className="flex items-center gap-3 mb-5">
                        <span className="text-[#6b7280] text-xs font-black uppercase tracking-[2px]">Past sessions</span>
                        <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                      </div>
                      <div className="space-y-3 opacity-50">{pastSessions.map((s) => <SessionRow key={s.id} session={s} />)}</div>
                    </div>
                  )}
                </div>
              )}
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