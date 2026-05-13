"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Session {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  room: { name: string };
  speakers: { speaker: { fullName: string } }[];
  isLive: boolean;
}

interface Event {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  place: string;
  _count: { sessions: number };
}

function isLive(startDate: string, endDate: string) {
  const now = new Date();
  return now >= new Date(startDate) && now <= new Date(endDate);
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatTime(date: string) {
  return new Date(date).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function initials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
}

const AVATAR_COLORS = [
  "from-indigo-500 to-violet-500",
  "from-emerald-400 to-cyan-500",
  "from-orange-400 to-red-500",
];

function IconCalendar({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="12" height="11" rx="1.5" />
      <path d="M5 1v4M11 1v4M2 7h12" />
    </svg>
  );
}

function IconLocation({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8.5 4.5 8.5s4.5-5 4.5-8.5c0-2.5-2-4.5-4.5-4.5z" />
      <circle cx="8" cy="6" r="1.5" />
    </svg>
  );
}

function IconPlay({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
      <polygon points="5,3 13,8 5,13" />
    </svg>
  );
}

function IconClock({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="8" cy="8" r="6" />
      <path d="M8 5v3l2 2" />
    </svg>
  );
}

function IconArrowRight({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

function IconGrid({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="1" y="1" width="6" height="6" rx="1" />
      <rect x="9" y="1" width="6" height="6" rx="1" />
      <rect x="1" y="9" width="6" height="6" rx="1" />
      <rect x="9" y="9" width="6" height="6" rx="1" />
    </svg>
  );
}

function IconBolt({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9 1L4 9h5l-2 6 7-8H9l2-6z" />
    </svg>
  );
}

function IconChat({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M14 10a2 2 0 01-2 2H5l-3 3V4a2 2 0 012-2h8a2 2 0 012 2v6z" />
    </svg>
  );
}

function IconMic({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="5" y="1" width="6" height="9" rx="3" />
      <path d="M2 8a6 6 0 0012 0M8 14v2M5 16h6" />
    </svg>
  );
}

function IconBuilding({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="2" y="3" width="12" height="11" rx="1" />
      <path d="M5 14V9h6v5M5 6h2M9 6h2M5 3V1h6v2" />
    </svg>
  );
}

function IconBookmark({ className = "w-4 h-4" }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M3 2h10v13l-5-3-5 3V2z" />
    </svg>
  );
}

function EventSyncLogo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 34 34" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="esLg1" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5b6ef5" />
          <stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="esLg2" x1="34" y1="0" x2="0" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3a0" />
          <stop offset="100%" stopColor="#5b6ef5" />
        </linearGradient>
      </defs>
      <rect width="34" height="34" rx="10" fill="#0c1120" />
      <path
        d="M6 17 Q6 8 17 8 Q23 8 27 14"
        stroke="url(#esLg1)"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M28 17 Q28 26 17 26 Q11 26 7 20"
        stroke="url(#esLg2)"
        strokeWidth="2.6"
        strokeLinecap="round"
        fill="none"
      />
      <path d="M23.5 11 L27 14 L23 16.5" stroke="url(#esLg1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M10.5 23 L7 20 L11 17.5" stroke="url(#esLg2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <circle cx="17" cy="17" r="2.8" fill="#22d3a0" />
      <circle cx="17" cy="17" r="2.8" fill="#22d3a0" opacity="0.35">
        <animate attributeName="r" values="2.8;5;2.8" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.35;0;0.35" dur="2s" repeatCount="indefinite" />
      </circle>
    </svg>
  );
}

function AdminShieldIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M8 1.5L2.5 4v4c0 3 2.5 5.5 5.5 6.5C11 13.5 13.5 11 13.5 8V4L8 1.5z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        fill="none"
      />
      <path d="M9.2 5.5H7.1L6.3 9h2L7.8 12 10.5 8H8.4L9.2 5.5z" fill="currentColor" />
    </svg>
  );
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded-md whitespace-nowrap">
      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
      Live
    </span>
  );
}

function Avatar({ name, index }: { name: string; index: number }) {
  return (
    <div className={`w-7 h-7 rounded-full border-2 border-[#0c1120] bg-gradient-to-br ${AVATAR_COLORS[index % 3]} flex items-center justify-center text-[10px] font-bold text-white -ml-1.5 first:ml-0`}>
      {initials(name)}
    </div>
  );
}

function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <>
      <nav className="fixed top-4 md:top-6 left-1/2 -translate-x-1/2 z-50 flex items-center bg-[#0c1120]/80 backdrop-blur-2xl border border-white/7 rounded-2xl px-4 py-2.5 w-[calc(100vw-32px)] md:w-[min(900px,calc(100vw-48px))]">
        <Link href="/" className="flex items-center gap-2.5 mr-auto no-underline">
          <EventSyncLogo size={34} />
          <span className="font-extrabold text-lg tracking-tight text-white hidden sm:block" style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-0.4px" }}>
            EventSync
          </span>
        </Link>

        <ul className="hidden md:flex items-center gap-1 list-none">
          {[
            { label: "Events", href: "/events" },
            { label: "Speakers", href: "/speakers" },
            { label: "Schedule", href: "/schedule" },
            { label: "Favorites", href: "/favorites" },
          ].map(({ label, href }) => (
            <li key={label}>
              <Link href={href} className="text-[#6b7280] hover:text-white text-xs font-medium uppercase tracking-wider px-3 py-2 rounded-xl hover:bg-white/6 transition-all no-underline">
                {label}
              </Link>
            </li>
          ))}
        </ul>

        <Link href="/admin" className="ml-3 bg-white/6 border border-white/7 text-white text-xs font-semibold px-3.5 py-2 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-all no-underline">
          <AdminShieldIcon size={13} />
          <span className="hidden sm:inline">Admin</span>
        </Link>

        <button
          className="ml-2 md:hidden w-8 h-8 flex flex-col items-center justify-center gap-1.5 rounded-lg hover:bg-white/6 transition-all"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle menu"
        >
          <span className={`w-4 h-0.5 bg-white/70 rounded transition-all duration-200 ${menuOpen ? "rotate-45 translate-y-2" : ""}`} />
          <span className={`w-4 h-0.5 bg-white/70 rounded transition-all duration-200 ${menuOpen ? "opacity-0" : ""}`} />
          <span className={`w-4 h-0.5 bg-white/70 rounded transition-all duration-200 ${menuOpen ? "-rotate-45 -translate-y-2" : ""}`} />
        </button>
      </nav>

      {menuOpen && (
        <div className="fixed top-[72px] left-4 right-4 z-40 bg-[#0c1120]/95 backdrop-blur-2xl border border-white/7 rounded-2xl p-4 md:hidden">
          {[
            { label: "Events", href: "/events" },
            { label: "Speakers", href: "/speakers" },
            { label: "Schedule", href: "/schedule" },
            { label: "Favorites", href: "/favorites" },
            { label: "Admin", href: "/admin" },
          ].map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              onClick={() => setMenuOpen(false)}
              className="flex items-center text-[#6b7280] hover:text-white text-sm font-medium py-3 border-b border-white/5 last:border-0 no-underline transition-colors"
            >
              {label}
            </Link>
          ))}
        </div>
      )}
    </>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-4 md:px-6 pt-28 md:pt-32 pb-16 md:pb-20 z-10">
      <h1
        className="font-black leading-[0.95] mb-6 md:mb-7 animate-[fadeUp_0.6s_0.1s_ease_both]"
        style={{
          fontFamily: "Inter, sans-serif",
          fontSize: "clamp(44px, 8vw, 100px)",
          letterSpacing: "clamp(-2px, -0.03em, -4px)",
        }}
      >
        <span className="block text-white">Events,</span>
        <span className="block" style={{
          background: "linear-gradient(90deg, #5b6ef5, #a78bfa, #22d3a0)",
          backgroundSize: "200%",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
          animation: "gradientShift 4s linear infinite",
        }}>
          Live & Intelligent.
        </span>
      </h1>

      <p className="max-w-xl text-[#6b7280] text-base md:text-lg font-light leading-[1.7] mb-10 md:mb-12 animate-[fadeUp_0.6s_0.2s_ease_both]" style={{ fontFamily: "Inter, sans-serif" }}>
        Replace static PDFs with a{" "}
        <em className="not-italic text-white/60">dynamic, real-time interface</em>.
        Browse the schedule, interact with sessions.
      </p>

      <div className="flex flex-col sm:flex-row items-center gap-3 animate-[fadeUp_0.6s_0.3s_ease_both] w-full sm:w-auto">
        <Link href="/events" className="w-full sm:w-auto justify-center bg-gradient-to-br from-indigo-500 to-violet-700 text-white text-[15px] font-semibold px-7 py-3.5 rounded-2xl flex items-center gap-2.5 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(91,110,245,0.35)] transition-all no-underline">
          <IconPlay className="w-4 h-4" />
          Explore events
        </Link>
        <Link href="/schedule" className="w-full sm:w-auto justify-center text-[#6b7280] text-[15px] font-medium px-6 py-3.5 rounded-2xl border border-white/7 flex items-center gap-2 hover:text-white hover:border-white/15 hover:bg-white/4 transition-all no-underline">
          <IconClock className="w-4 h-4" />
          View schedule
        </Link>
      </div>

      <div className="absolute bottom-9 left-1/2 -translate-x-1/2 flex-col items-center gap-2 text-[#6b7280] text-[11px] tracking-[1.5px] uppercase hidden md:flex">
        <div className="w-px h-10 bg-gradient-to-b from-indigo-500 to-transparent animate-pulse" />
        scroll
      </div>
    </section>
  );
}

function StatsBar({ events, sessions, speakers }: { events: number; sessions: number; speakers: number }) {
  return (
    <div className="bg-[#0c1120] border-t border-b border-white/7 py-8 md:py-10 px-4 md:px-6 relative z-10">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10 text-center">
        {[
          { value: events, label: "Active events" },
          { value: sessions, label: "Scheduled sessions" },
          { value: speakers, label: "Speakers" },
          { value: 0, label: "Questions asked" },
        ].map(({ value, label }) => (
          <div key={label}>
            <div className="text-4xl md:text-5xl font-black tracking-[-2px] leading-none mb-1.5" style={{
              fontFamily: "Inter, sans-serif",
              background: "linear-gradient(135deg, #f0f4ff, rgba(240,244,255,0.6))",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}>
              {value}
            </div>
            <div className="text-[12px] md:text-[13px] text-[#6b7280]" style={{ fontFamily: "Inter, sans-serif" }}>{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveSection({ sessions }: { sessions: Session[] }) {
  if (sessions.length === 0) return null;
  return (
    <section className="py-16 md:py-20 px-4 md:px-6 max-w-5xl mx-auto">
      <div className="flex items-end justify-between mb-7 md:mb-9 flex-wrap gap-4">
        <h2 className="font-black tracking-[-1.5px] leading-[1.1] text-white" style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(28px, 4vw, 48px)" }}>
          Happening now
        </h2>
        <Link href="/sessions/live" className="text-[#6b7280] text-[13px] font-medium flex items-center gap-1.5 hover:text-white transition-colors no-underline">
          See all <IconArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
      <div className="flex flex-col gap-2.5">
        {sessions.slice(0, 4).map((session) => (
          <Link key={session.id} href={`/sessions/${session.id}`} className="flex flex-wrap md:flex-nowrap items-center gap-3 md:gap-4 bg-[#0c1120] border border-white/7 rounded-2xl px-4 md:px-5 py-4 hover:border-emerald-400/20 hover:bg-emerald-400/3 hover:translate-x-1 transition-all relative overflow-hidden no-underline">
            <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-400 rounded-r" />
            <span className="text-xs font-semibold text-emerald-400 min-w-[80px]" style={{ fontFamily: "Inter, sans-serif" }}>
              {formatTime(session.startDate)} – {formatTime(session.endDate)}
            </span>
            <span className="flex-1 text-[14px] md:text-[15px] font-medium text-white">{session.title}</span>
            <span className="text-xs text-[#6b7280] bg-[#111827] px-2.5 py-1 rounded-md hidden sm:inline">{session.room.name}</span>
            <div className="flex items-center">
              {session.speakers.slice(0, 3).map((ss, i) => (
                <Avatar key={i} name={ss.speaker.fullName} index={i} />
              ))}
            </div>
            <LiveBadge />
          </Link>
        ))}
      </div>
    </section>
  );
}

function EventMeta({ icon, children }: { icon: "calendar" | "location"; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[#6b7280] text-[13px]">
      {icon === "calendar"
        ? <IconCalendar className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
        : <IconLocation className="w-3.5 h-3.5 flex-shrink-0 opacity-60" />
      }
      {children}
    </div>
  );
}

const COVER_GRADIENTS = [
  "from-[#1a1040] via-[#2d1b69] to-[#4c1d95]",
  "from-[#0c2340] via-[#1e3a5f] to-[#164e63]",
  "from-[#1f2937] via-[#111827] to-[#030711]",
];

function EventsSection({ events }: { events: Event[] }) {
  return (
    <section className="py-16 md:py-24 px-4 md:px-6 max-w-5xl mx-auto">
      <div className="flex items-end justify-between mb-10 md:mb-12 flex-wrap gap-4">
        <h2 className="font-black tracking-[-1.5px] leading-[1.1] text-white" style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(28px, 4vw, 48px)" }}>
          Featured events
        </h2>
        <Link href="/events" className="text-[#6b7280] text-[13px] font-medium flex items-center gap-1.5 hover:text-white transition-colors no-underline">
          All events <IconArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center text-[#6b7280] py-20">No events available at the moment.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {events.slice(0, 3).map((event, i) => {
            const live = isLive(event.startDate, event.endDate);
            const isWide = i === 2;
            return (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className={`bg-[#0c1120] border border-white/7 rounded-3xl overflow-hidden hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-[0_30px_60px_rgba(0,0,0,0.4)] transition-all no-underline block ${isWide ? "md:col-span-2" : ""}`}
              >
                {isWide ? (
                  <div className="flex flex-col md:flex-row items-stretch">
                    <div className={`w-full md:w-72 flex-shrink-0 relative bg-gradient-to-br ${COVER_GRADIENTS[i % 3]} h-40 md:h-auto`}>
                      <span className="absolute top-3.5 right-3.5 bg-[#0c1120]/80 backdrop-blur-sm border border-white/7 text-[#6b7280] text-[10px] font-bold tracking-[1.5px] uppercase px-2.5 py-1 rounded-lg">
                        {event._count.sessions} sessions
                      </span>
                    </div>
                    <div className="flex-1 p-5 md:p-6">
                      <h3 className="font-bold text-lg md:text-xl tracking-tight text-white mb-3 leading-[1.2]" style={{ fontFamily: "Inter, sans-serif" }}>
                        {event.title}
                      </h3>
                      <p className="text-[#6b7280] text-sm leading-relaxed mb-4 line-clamp-2">{event.description}</p>
                      <div className="flex flex-col gap-1.5 mb-4">
                        <EventMeta icon="calendar">{formatDate(event.startDate)} → {formatDate(event.endDate)}</EventMeta>
                        <EventMeta icon="location">{event.place}</EventMeta>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-white/7">
                        {live ? <LiveBadge /> : <span />}
                        <span className="border border-white/7 text-[#6b7280] text-xs font-semibold px-3.5 py-1.5 rounded-lg">View →</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={`relative bg-gradient-to-br ${COVER_GRADIENTS[i % 3]} h-44 md:h-48`}>
                      {live && (
                        <span className="absolute top-3.5 left-3.5 bg-emerald-400 text-[#030711] text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-lg flex items-center gap-1.5">
                          ● Live
                        </span>
                      )}
                      <span className="absolute top-3.5 right-3.5 bg-[#0c1120]/80 backdrop-blur-sm border border-white/7 text-[#6b7280] text-[10px] font-bold tracking-[1.5px] uppercase px-2.5 py-1 rounded-lg">
                        {event._count.sessions} sessions
                      </span>
                    </div>
                    <div className="p-5 md:p-6">
                      <h3 className="font-bold text-lg md:text-xl tracking-tight text-white mb-3 leading-[1.2]" style={{ fontFamily: "Inter, sans-serif" }}>
                        {event.title}
                      </h3>
                      <div className="flex flex-col gap-1.5 mb-4">
                        <EventMeta icon="calendar">{formatDate(event.startDate)}</EventMeta>
                        <EventMeta icon="location">{event.place}</EventMeta>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-white/7">
                        <div />
                        <span className="border border-white/7 text-[#6b7280] text-xs font-semibold px-3.5 py-1.5 rounded-lg">View →</span>
                      </div>
                    </div>
                  </>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

function FeaturesSection() {
  const features = [
    { Icon: IconGrid, title: "Multi-track schedule", desc: "Grid view with parallel sessions by room, all at a glance.", color: "indigo" },
    { Icon: IconBolt, title: "Live detection", desc: "Sessions automatically marked as live based on the current time.", color: "green" },
    { Icon: IconChat, title: "Interactive Q&A", desc: "Ask questions, vote, and watch the best ones rise to the top in real time.", color: "purple" },
    { Icon: IconMic, title: "Speaker profiles", desc: "Public pages for each speaker with bio, social links, and sessions.", color: "orange" },
    { Icon: IconBuilding, title: "Room view", desc: "Filter the schedule by room. See what's happening where.", color: "cyan" },
    { Icon: IconBookmark, title: "Personal itinerary", desc: "Bookmark sessions. Your personal schedule saved locally.", color: "rose" },
  ];

  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-500/12 border-indigo-500/20 text-indigo-400",
    green: "bg-emerald-400/10 border-emerald-400/20 text-emerald-400",
    purple: "bg-violet-400/10 border-violet-400/20 text-violet-400",
    orange: "bg-orange-400/10 border-orange-400/20 text-orange-400",
    cyan: "bg-cyan-400/10 border-cyan-400/20 text-cyan-400",
    rose: "bg-rose-400/10 border-rose-400/20 text-rose-400",
  };

  return (
    <section className="py-16 md:py-24 px-4 md:px-6 max-w-5xl mx-auto">
      <h2 className="font-black leading-[1.1] text-white mb-10 md:mb-12" style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(28px, 4vw, 48px)", letterSpacing: "-1.5px" }}>
        Everything you need,<br />in real time.
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {features.map(({ Icon, title, desc, color }) => (
          <div key={title} className="bg-[#0c1120] border border-white/7 rounded-2xl p-6 md:p-7 relative overflow-hidden hover:border-indigo-500/25 hover:-translate-y-0.5 transition-all group">
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className={`w-11 h-11 rounded-xl border ${colorMap[color]} flex items-center justify-center mb-4`}>
              <Icon className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-[16px] md:text-[17px] text-white mb-2" style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-0.3px" }}>{title}</h3>
            <p className="text-[#6b7280] text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-16 md:py-24 px-4 md:px-6 max-w-2xl mx-auto text-center">
      <h2 className="font-black leading-[1.1] text-white mb-5" style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(28px, 5vw, 56px)", letterSpacing: "-2px" }}>
        Ready to transform your event?
      </h2>
      <p className="text-[#6b7280] text-base md:text-lg font-light leading-[1.7] mb-10">
        Replace static programs with a live, interactive experience.
      </p>
      <Link href="/admin" className="inline-flex items-center gap-2.5 bg-gradient-to-br from-indigo-500 to-violet-700 text-white text-base font-semibold px-8 py-4 rounded-2xl hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(91,110,245,0.35)] transition-all no-underline">
        <AdminShieldIcon size={16} />
        Admin
      </Link>
    </section>
  );
}
function Footer() {
  return (
    <footer className="border-t border-white/7 py-10 md:py-12 px-4 md:px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-2 md:grid-cols-[2fr_1fr_1fr_1fr] gap-8 md:gap-12 mb-8">
        <div className="col-span-2 md:col-span-1">
          <div className="flex items-center gap-2.5 mb-3">
            <EventSyncLogo size={28} />
            <h3 className="font-extrabold text-lg tracking-tight text-white" style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-0.4px" }}>
              EventSync
            </h3>
          </div>
          <p className="text-[#6b7280] text-sm leading-relaxed max-w-[220px]">
            The live event platform for organizers and attendees.
          </p>
        </div>
        {[
          {
            title: "Navigate",
            links: [
              { label: "Events", href: "/events" },
              { label: "Schedule", href: "/schedule" },
              { label: "Speakers", href: "/speakers" },
              { label: "Rooms", href: "/rooms" },
              { label: "Favorites", href: "/favorites" },
            ],
          },
          {
            title: "Admin",
            links: [
              { label: "Console", href: "/admin" },
              { label: "Manage events", href: "/admin/events" },
              { label: "Manage sessions", href: "/admin/sessions" },
            ],
          },
          {
            title: "Platform",
            links: [
              { label: "About", href: "#" },
              { label: "Security", href: "#" },
              { label: "Privacy", href: "#" },
            ],
          },
        ].map(({ title, links }) => (
          <div key={title}>
            <h4 className="text-[11px] font-bold tracking-[1.5px] uppercase text-[#6b7280] mb-4">{title}</h4>
            <ul className="list-none flex flex-col gap-2.5">
              {links.map(({ label, href }) => (
                <li key={label}>
                  <Link href={href} className="text-white/50 text-sm hover:text-white transition-colors no-underline">{label}</Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      <div className="max-w-5xl mx-auto pt-6 border-t border-white/7 text-center">
        <p className="text-[#6b7280] text-[13px]">© 2026 EventSync. Built for live moments.</p>
      </div>
    </footer>
  );
}

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [liveSessions, setLiveSessions] = useState<Session[]>([]);
  const [sessionsCount, setSessionsCount] = useState(0);
  const [speakersCount, setSpeakersCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [eventsRes, sessionsRes, speakersRes] = await Promise.all([
          fetch("/api/events"),
          fetch("/api/sessions"),
          fetch("/api/speakers"),
        ]);
        const eventsData = await eventsRes.json();
        const sessionsData = await sessionsRes.json();
        const speakersData = await speakersRes.json();

        const allEvents: Event[] = eventsData.data ?? [];
        const allSessions: Session[] = sessionsData.data ?? [];

        setEvents(allEvents);
        setSessionsCount(sessionsData.meta?.total ?? allSessions.length);
        setSpeakersCount(speakersData.meta?.total ?? 0);
        setLiveSessions(allSessions.filter((s) => isLive(s.startDate, s.endDate)));
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalSessions = sessionsCount || events.reduce((a, e) => a + (e._count?.sessions ?? 0), 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes fadeUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes gradientShift { 0% { background-position: 0%; } 100% { background-position: 200%; } }
        @keyframes livePulse { 0%,100%{box-shadow:0 0 0 0 rgba(34,211,160,0.4)} 50%{box-shadow:0 0 0 8px rgba(34,211,160,0)} }
        body { font-family: 'Inter', sans-serif; }
      `}</style>

      <div className="min-h-screen bg-[#030711] text-white relative overflow-x-hidden">
        <div className="fixed rounded-full pointer-events-none z-0" style={{ width: "min(600px, 80vw)", height: "min(600px, 80vw)", background: "radial-gradient(circle, rgba(91,110,245,0.18) 0%, transparent 70%)", top: "-200px", left: "-100px", filter: "blur(120px)" }} />
        <div className="fixed rounded-full pointer-events-none z-0" style={{ width: "min(500px, 70vw)", height: "min(500px, 70vw)", background: "radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)", top: "40%", right: "-150px", filter: "blur(120px)" }} />
        <div className="fixed rounded-full pointer-events-none z-0" style={{ width: "min(400px, 60vw)", height: "min(400px, 60vw)", background: "radial-gradient(circle, rgba(34,211,160,0.1) 0%, transparent 70%)", bottom: "10%", left: "30%", filter: "blur(120px)" }} />

        <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "80px 80px", maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)" }} />

        <Navbar />
        <Hero />
        <StatsBar events={events.length} sessions={totalSessions} speakers={speakersCount} />
        {!loading && <LiveSection sessions={liveSessions} />}
        {!loading && <EventsSection events={events} />}
        <FeaturesSection />
        <CTASection />
        <Footer />
      </div>
    </>
  );
}