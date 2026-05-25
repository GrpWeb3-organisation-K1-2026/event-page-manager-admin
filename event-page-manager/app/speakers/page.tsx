"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Speaker {
  id: number;
  fullName: string;
  biography: string;
  photo: string | null;
  links: Record<string, string> | null;
  sessions: {
    session: {
      id: number;
      title: string;
      startDate: string;
      endDate: string;
    };
  }[];
}

function isLive(startDate: string, endDate: string) {
  const now = new Date();
  return now >= new Date(startDate) && now <= new Date(endDate);
}

function hasLiveSession(speaker: Speaker) {
  return speaker.sessions.some((s) => isLive(s.session.startDate, s.session.endDate));
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const GRADIENTS = [
  { from: "#5b6ef5", to: "#a78bfa", angle: "135deg" },
  { from: "#22d3a0", to: "#0891b2", angle: "135deg" },
  { from: "#f97316", to: "#ef4444", angle: "135deg" },
  { from: "#a78bfa", to: "#ec4899", angle: "135deg" },
  { from: "#06b6d4", to: "#3b82f6", angle: "135deg" },
  { from: "#f43f5e", to: "#f97316", angle: "135deg" },
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
        <linearGradient id="spLg1" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5b6ef5" /><stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="spLg2" x1="34" y1="0" x2="0" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3a0" /><stop offset="100%" stopColor="#5b6ef5" />
        </linearGradient>
      </defs>
      <rect width="34" height="34" rx="10" fill="#0c1120" />
      <path d="M6 17 Q6 8 17 8 Q23 8 27 14" stroke="url(#spLg1)" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M28 17 Q28 26 17 26 Q11 26 7 20" stroke="url(#spLg2)" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M23.5 11 L27 14 L23 16.5" stroke="url(#spLg1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M10.5 23 L7 20 L11 17.5" stroke="url(#spLg2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
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

function SpeakerCard({ speaker, index, featured = false }: { speaker: Speaker; index: number; featured?: boolean }) {
  const live = hasLiveSession(speaker);
  const grad = GRADIENTS[index % GRADIENTS.length];
  const sessionCount = speaker.sessions.length;

  return (
    <Link
      href={`/speakers/${speaker.id}`}
      className={`group relative no-underline block overflow-hidden rounded-2xl border transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_32px_64px_rgba(0,0,0,0.5)] ${featured ? "md:col-span-2 md:row-span-1" : ""} ${live ? "border-emerald-400/25 bg-[#0a1a14]" : "border-white/7 bg-[#0c1120]"}`}
    >
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{ background: `radial-gradient(ellipse at 50% 0%, ${grad.from}18 0%, transparent 60%)` }} />

      <div className="absolute top-0 left-0 right-0 h-px opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{ background: `linear-gradient(90deg, transparent, ${grad.from}, ${grad.to}, transparent)` }} />

      <div className={`relative flex ${featured ? "flex-col md:flex-row gap-6 md:gap-8" : "flex-col"} p-6`}>

        <div className="relative flex-shrink-0">
          <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"
            style={{ background: `linear-gradient(${grad.angle}, ${grad.from}, ${grad.to})`, transform: "scale(1.3)" }} />
          {speaker.photo ? (
            <img src={speaker.photo} alt={speaker.fullName}
              className={`relative z-10 rounded-full object-cover border-2 border-white/10 ${featured ? "w-20 h-20 md:w-24 md:h-24" : "w-16 h-16"}`} />
          ) : (
            <div className={`relative z-10 rounded-full flex items-center justify-center font-black text-white border border-white/10 ${featured ? "w-20 h-20 md:w-24 md:h-24 text-2xl" : "w-16 h-16 text-lg"}`}
              style={{ background: `linear-gradient(${grad.angle}, ${grad.from}, ${grad.to})`, fontFamily: "Inter, sans-serif" }}>
              {initials(speaker.fullName)}
            </div>
          )}
          {live && (
            <span className="absolute -top-1 -right-1 w-4 h-4 bg-emerald-400 rounded-full border-2 border-[#030711] z-20">
              <span className="absolute inset-0 bg-emerald-400 rounded-full animate-ping opacity-75" />
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-black text-white leading-tight group-hover:text-transparent transition-all duration-300"
              style={{ fontFamily: "Inter, sans-serif", fontSize: featured ? "clamp(18px,2.5vw,22px)" : "16px", letterSpacing: "-0.4px",
                backgroundImage: `linear-gradient(90deg, ${grad.from}, ${grad.to})`,
                WebkitBackgroundClip: "text", backgroundClip: "text" }}>
              {speaker.fullName}
            </h3>
            {live && (
              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full whitespace-nowrap flex-shrink-0">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />Live
              </span>
            )}
          </div>

          <p className={`text-[#6b7280] text-sm leading-relaxed mb-4 ${featured ? "line-clamp-3" : "line-clamp-2"}`}>
            {speaker.biography}
          </p>

          {speaker.links && Object.keys(speaker.links).length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {Object.keys(speaker.links).slice(0, 3).map((key) => (
                <span key={key} className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md"
                  style={{ color: grad.from, background: `${grad.from}15`, border: `1px solid ${grad.from}25` }}>
                  {key}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 text-[12px] text-[#6b7280]">
              <svg className="w-3.5 h-3.5 opacity-50" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
                <rect x="2" y="3" width="12" height="11" rx="1.5" /><path d="M5 1v4M11 1v4M2 7h12" />
              </svg>
              {sessionCount} session{sessionCount !== 1 ? "s" : ""}
            </div>
            <span className="flex items-center gap-1.5 text-[12px] font-semibold opacity-0 group-hover:opacity-100 transition-opacity duration-200"
              style={{ color: grad.from }}>
              View profile
              <svg className="w-3 h-3" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="2"><path d="M2 6h8M6 2l4 4-4 4" /></svg>
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function SpeakersPage() {
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/speakers?limit=100")
      .then((r) => r.json())
      .then((d) => setSpeakers(d.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = speakers.filter((s) =>
    s.fullName.toLowerCase().includes(search.toLowerCase()) ||
    s.biography.toLowerCase().includes(search.toLowerCase())
  );

  const live = filtered.filter(hasLiveSession);
  const others = filtered.filter((s) => !hasLiveSession(s));
  const totalSessions = speakers.reduce((acc, s) => acc + s.sessions.length, 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gradientShift { 0%{background-position:0%} 100%{background-position:200%} }
        body { font-family: 'Inter', sans-serif; }
      `}</style>

      <div className="min-h-screen bg-[#030711] text-white relative overflow-x-hidden">
        <div className="fixed rounded-full pointer-events-none z-0" style={{ width:"min(700px,90vw)", height:"min(700px,90vw)", background:"radial-gradient(circle, rgba(91,110,245,0.14) 0%, transparent 70%)", top:"-200px", left:"-150px", filter:"blur(130px)" }} />
        <div className="fixed rounded-full pointer-events-none z-0" style={{ width:"min(500px,70vw)", height:"min(500px,70vw)", background:"radial-gradient(circle, rgba(34,211,160,0.09) 0%, transparent 70%)", bottom:"10%", right:"-100px", filter:"blur(120px)" }} />
        <div className="fixed rounded-full pointer-events-none z-0" style={{ width:"min(400px,60vw)", height:"min(400px,60vw)", background:"radial-gradient(circle, rgba(167,139,250,0.08) 0%, transparent 70%)", top:"50%", left:"50%", filter:"blur(120px)", transform:"translate(-50%,-50%)" }} />
        <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage:"linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize:"80px 80px", maskImage:"radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)" }} />

        <Navbar />

        <main className="relative z-10 px-4 md:px-6 max-w-5xl mx-auto pb-24">

          <div className="pt-28 md:pt-36 pb-12 md:pb-16">
            <div className="animate-[fadeUp_0.5s_ease_both]">
              <div className="absolute right-4 md:right-6 top-24 md:top-32 font-black text-[120px] md:text-[180px] leading-none select-none pointer-events-none"
                style={{ fontFamily:"Inter, sans-serif", color:"rgba(255,255,255,0.02)", letterSpacing:"-8px" }}>
                {speakers.length}
              </div>

              <div className="inline-flex items-center gap-2 bg-indigo-500/8 border border-indigo-500/20 text-indigo-400 text-[11px] font-bold tracking-[1.5px] uppercase px-3.5 py-1.5 rounded-full mb-6">
                <svg className="w-3 h-3" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="1" width="6" height="9" rx="3" /><path d="M2 8a6 6 0 0012 0M8 14v2M5 16h6" /></svg>
                Speakers
              </div>

              <h1 className="font-black text-white mb-3" style={{ fontFamily:"Inter, sans-serif", fontSize:"clamp(40px, 7vw, 80px)", letterSpacing:"clamp(-2px,-0.03em,-4px)", lineHeight:0.95 }}>
                The voices<br />
                <span style={{ background:"linear-gradient(90deg, #5b6ef5, #a78bfa, #22d3a0)", backgroundSize:"200%", WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent", backgroundClip:"text", animation:"gradientShift 4s linear infinite" }}>
                  behind the talks.
                </span>
              </h1>

              <p className="text-[#6b7280] text-base md:text-lg font-light max-w-lg leading-relaxed mb-8 mt-4">
                {speakers.length} experts and practitioners — {totalSessions} sessions across the event.
              </p>

              <div className="flex flex-wrap gap-3">
                {[
                  { value: speakers.length, label: "Speakers", color: "#5b6ef5" },
                  { value: live.length, label: "Live now", color: "#22d3a0" },
                  { value: totalSessions, label: "Sessions", color: "#a78bfa" },
                ].map(({ value, label, color }) => (
                  <div key={label} className="flex items-center gap-2 bg-white/4 border border-white/7 rounded-xl px-3 py-2">
                    <span className="w-2 h-2 rounded-full" style={{ background: color }} />
                    <span className="font-black text-white text-sm" style={{ fontFamily:"Inter, sans-serif" }}>{value}</span>
                    <span className="text-[#6b7280] text-xs uppercase tracking-wider">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="relative mb-10 max-w-sm animate-[fadeUp_0.5s_0.1s_ease_both]">
            <svg className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[#6b7280]" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="7" cy="7" r="4.5" /><path d="M10.5 10.5l3 3" />
            </svg>
            <input type="text" placeholder="Search by name or topic…" value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[#0c1120] border border-white/7 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-indigo-500/50 focus:shadow-[0_0_0_3px_rgba(91,110,245,0.1)] transition-all"
              style={{ fontFamily:"Inter, sans-serif" }} />
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-[#0c1120] border border-white/7 rounded-2xl h-52 animate-pulse"
                  style={{ animationDelay: `${i * 80}ms` }} />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-32">
              <div className="w-20 h-20 rounded-full bg-white/4 border border-white/7 flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-[#374151]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <circle cx="11" cy="11" r="8" /><path d="M21 21l-4.35-4.35" />
                </svg>
              </div>
              <p className="text-white font-semibold text-lg mb-1">No results</p>
              <p className="text-[#6b7280] text-sm">Try a different keyword</p>
            </div>
          ) : (
            <div className="space-y-12 animate-[fadeUp_0.5s_0.15s_ease_both]">

              {live.length > 0 && (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-emerald-400 rounded-full animate-pulse" />
                      <span className="text-emerald-400 text-xs font-black uppercase tracking-[2px]">Speaking now</span>
                    </div>
                    <div className="flex-1 h-px bg-gradient-to-r from-emerald-400/30 to-transparent" />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                    {live.map((speaker, i) => (
                      <SpeakerCard key={speaker.id} speaker={speaker} index={i} />
                    ))}
                  </div>
                </div>
              )}

              {others.length > 0 && (
                <div>
                  {live.length > 0 && (
                    <div className="flex items-center gap-3 mb-6">
                      <span className="text-[#6b7280] text-xs font-black uppercase tracking-[2px]">All speakers</span>
                      <div className="flex-1 h-px bg-gradient-to-r from-white/10 to-transparent" />
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 auto-rows-auto">
                    {others.map((speaker, i) => (
                      <SpeakerCard
                        key={speaker.id}
                        speaker={speaker}
                        index={i + live.length}
                        featured={i === 0 && others.length > 2}
                      />
                    ))}
                  </div>
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