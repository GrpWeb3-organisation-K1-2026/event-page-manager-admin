"use client";

import { useEffect, useRef, useState } from "react";
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
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

const AVATAR_COLORS = [
  "from-indigo-500 to-violet-500",
  "from-emerald-400 to-cyan-500",
  "from-orange-400 to-red-500",
];

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded-md">
      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
      Live
    </span>
  );
}

function Avatar({ name, index }: { name: string; index: number }) {
  return (
    <div
      className={`w-7 h-7 rounded-full border-2 border-[#0c1120] bg-gradient-to-br ${AVATAR_COLORS[index % 3]} flex items-center justify-center text-[10px] font-bold text-white -ml-1.5 first:ml-0`}
    >
      {initials(name)}
    </div>
  );
}

function Navbar() {
  return (
    <nav className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-0 bg-[#0c1120]/70 backdrop-blur-2xl border border-white/7 rounded-2xl px-4 py-2.5 w-[min(900px,calc(100vw-48px))]">
      <Link href="/" className="flex items-center gap-2.5 mr-auto no-underline">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-violet-500 rounded-xl flex items-center justify-center text-base">
          ⚡
        </div>
        <span className="font-black text-lg tracking-tight text-white" style={{ fontFamily: "Syne, sans-serif" }}>
          EventSync
        </span>
      </Link>
      <ul className="flex items-center gap-1 list-none">
        {[
          { label: "Events", href: "/events" },
          { label: "Speakers", href: "/speakers" },
          { label: "Schedule", href: "/schedule" },
          { label: "Favorites", href: "/favorites" },
        ].map(({ label, href }) => (
          <li key={label}>
            <Link
              href={href}
              className="text-[#6b7280] hover:text-white text-xs font-medium uppercase tracking-wider px-3.5 py-2 rounded-xl hover:bg-white/6 transition-all no-underline"
            >
              {label}
            </Link>
          </li>
        ))}
      </ul>
      <Link
        href="/admin"
        className="ml-3 bg-white/6 border border-white/7 text-white text-xs font-medium px-4 py-2 rounded-xl flex items-center gap-2 hover:bg-white/10 transition-all no-underline"
      >
        <svg className="w-3.5 h-3.5 opacity-70" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="2" width="12" height="12" rx="2" />
          <path d="M8 5v6M5 8h6" />
        </svg>
        Admin Console
      </Link>
    </nav>
  );
}

function Hero() {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center text-center px-6 pt-32 pb-20 z-10 overflow-hidden">
      <div className="inline-flex items-center gap-2 bg-emerald-400/8 border border-emerald-400/20 text-emerald-400 text-[11px] font-bold tracking-[1.5px] uppercase px-3.5 py-1.5 rounded-full mb-10 animate-[fadeUp_0.6s_ease_both]">
        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
        Real-time event platform
      </div>

      <h1
        className="font-black leading-[0.95] tracking-[-3px] mb-7 animate-[fadeUp_0.6s_0.1s_ease_both]"
        style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(52px, 8vw, 100px)" }}
      >
        <span className="block text-white">Events,</span>
        <span
          className="block"
          style={{
            background: "linear-gradient(90deg, #5b6ef5, #a78bfa, #22d3a0)",
            backgroundSize: "200%",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            animation: "gradientShift 4s linear infinite",
          }}
        >
          Live & Intelligent.
        </span>
      </h1>

      <p className="max-w-xl text-[#6b7280] text-lg font-light leading-[1.7] mb-12 animate-[fadeUp_0.6s_0.2s_ease_both]">
        Replace static PDFs with a{" "}
        <em className="not-italic text-white/60">dynamic, real-time interface</em>.
        Browse the schedule, interact with sessions.
      </p>

      <div className="flex items-center gap-3.5 animate-[fadeUp_0.6s_0.3s_ease_both]">
        <Link
          href="/events"
          className="relative overflow-hidden bg-gradient-to-br from-indigo-500 to-violet-700 text-white text-[15px] font-semibold px-7 py-3.5 rounded-2xl flex items-center gap-2.5 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(91,110,245,0.35)] transition-all no-underline"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <polygon points="5,3 13,8 5,13" />
          </svg>
          Explore events
        </Link>
        <Link
          href="/schedule"
          className="bg-transparent text-[#6b7280] text-[15px] font-medium px-6 py-3.5 rounded-2xl border border-white/7 flex items-center gap-2 hover:text-white hover:border-white/15 hover:bg-white/4 transition-all no-underline"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <circle cx="8" cy="8" r="6" />
            <path d="M8 5v3l2 2" />
          </svg>
          View schedule
        </Link>
      </div>

      <div className="absolute bottom-9 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-[#6b7280] text-[11px] tracking-[1.5px] uppercase animate-[fadeUp_1s_0.8s_ease_both]">
        <div className="w-px h-10 bg-gradient-to-b from-indigo-500 to-transparent animate-pulse" />
        scroll
      </div>
    </section>
  );
}

function Ticker({ liveSessions }: { liveSessions: Session[] }) {
  const items =
    liveSessions.length > 0
      ? liveSessions.map((s) => `${s.title} · ${s.room.name}`)
      : [
          "Web3 Innovation Summit · Stage A",
          "DeFi Architecture Deep-Dive · Room B",
          "Smart Contract Security · 14:30 · Main Stage",
          "Global Dev Symposium · Opening Keynote",
          "Zero-Knowledge Proofs Workshop · 15:00",
        ];

  const doubled = [...items, ...items];

  return (
    <div className="w-full overflow-hidden border-t border-b border-white/7 bg-emerald-400/4 py-3">
      <div className="flex gap-16 w-max animate-[ticker_30s_linear_infinite]">
        {doubled.map((item, i) => (
          <div key={i} className="flex items-center gap-2.5 whitespace-nowrap text-xs text-[#6b7280] font-medium">
            <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full flex-shrink-0" />
            <span className="text-emerald-400 font-bold uppercase text-[11px] tracking-widest">
              {liveSessions.length > 0 ? "Live" : i % 2 === 0 ? "Live" : "Upcoming"}
            </span>
            {item}
          </div>
        ))}
      </div>
    </div>
  );
}

function StatsBar({ events, sessions, speakers }: { events: number; sessions: number; speakers: number }) {
  return (
    <div className="bg-[#0c1120] border-t border-b border-white/7 py-10 px-6 relative z-10">
      <div className="max-w-5xl mx-auto grid grid-cols-4 gap-10 text-center">
        {[
          { value: events, suffix: "+", label: "Active events" },
          { value: sessions, suffix: "", label: "Scheduled sessions" },
          { value: speakers, suffix: "", label: "Speakers" },
          { value: 0, suffix: "", label: "Questions asked" },
        ].map(({ value, suffix, label }) => (
          <div key={label}>
            <div
              className="text-5xl font-black tracking-[-2px] leading-none mb-1.5"
              style={{
                fontFamily: "Syne, sans-serif",
                background: "linear-gradient(135deg, #f0f4ff, rgba(240,244,255,0.6))",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {value}{suffix}
            </div>
            <div className="text-[13px] text-[#6b7280]">{label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function LiveSection({ sessions }: { sessions: Session[] }) {
  if (sessions.length === 0) return null;

  return (
    <section className="py-20 px-6 max-w-5xl mx-auto">
      <div className="text-violet-400 text-[11px] font-bold tracking-[2px] uppercase flex items-center gap-2 mb-4">
        <span className="w-6 h-px bg-violet-400" />
        Ongoing sessions
      </div>
      <div className="flex items-end justify-between mb-9 flex-wrap gap-5">
        <h2
          className="font-black tracking-[-1.5px] leading-[1.1] text-white"
          style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(32px, 4vw, 48px)" }}
        >
          Happening now
        </h2>
        <Link href="/sessions/live" className="text-[#6b7280] text-[13px] font-medium flex items-center gap-1.5 hover:text-white transition-colors no-underline">
          See all
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </Link>
      </div>

      <div className="flex flex-col gap-2.5">
        {sessions.slice(0, 4).map((session) => (
          <Link
            key={session.id}
            href={`/sessions/${session.id}`}
            className="flex items-center gap-4 bg-[#0c1120] border border-white/7 rounded-2xl px-5 py-4 cursor-pointer hover:border-emerald-400/20 hover:bg-emerald-400/3 hover:translate-x-1 transition-all relative overflow-hidden no-underline group"
          >
            <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-400 rounded-r" />
            <span className="text-xs font-semibold text-emerald-400 min-w-[90px]" style={{ fontFamily: "Syne, sans-serif" }}>
              {formatTime(session.startDate)} – {formatTime(session.endDate)}
            </span>
            <span className="flex-1 text-[15px] font-medium text-white">{session.title}</span>
            <span className="text-xs text-[#6b7280] bg-[#111827] px-2.5 py-1 rounded-md">{session.room.name}</span>
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

const COVER_GRADIENTS = [
  "from-[#1a1040] via-[#2d1b69] to-[#4c1d95]",
  "from-[#0c2340] via-[#1e3a5f] to-[#164e63]",
  "from-[#1f2937] via-[#111827] to-[#030711]",
];

function EventsSection({ events }: { events: Event[] }) {
  return (
    <section className="py-24 px-6 max-w-5xl mx-auto">
      <div className="text-violet-400 text-[11px] font-bold tracking-[2px] uppercase flex items-center gap-2 mb-4">
        <span className="w-6 h-px bg-violet-400" />
        Upcoming & ongoing
      </div>
      <div className="flex items-end justify-between mb-12 flex-wrap gap-5">
        <h2
          className="font-black tracking-[-1.5px] leading-[1.1] text-white"
          style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(32px, 4vw, 48px)" }}
        >
          Featured events
        </h2>
        <Link href="/events" className="text-[#6b7280] text-[13px] font-medium flex items-center gap-1.5 hover:text-white transition-colors no-underline">
          All events
          <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </Link>
      </div>

      {events.length === 0 ? (
        <div className="text-center text-[#6b7280] py-20">No events available at the moment.</div>
      ) : (
        <div className="grid grid-cols-2 gap-5">
          {events.slice(0, 3).map((event, i) => {
            const live = isLive(event.startDate, event.endDate);
            const isWide = i === 2;
            return (
              <Link
                key={event.id}
                href={`/events/${event.id}`}
                className={`bg-[#0c1120] border border-white/7 rounded-3xl overflow-hidden cursor-pointer hover:-translate-y-1 hover:border-indigo-500/30 hover:shadow-[0_30px_60px_rgba(0,0,0,0.4)] transition-all no-underline block ${isWide ? "col-span-2" : ""}`}
              >
                {isWide ? (
                  <div className="flex items-stretch">
                    <div className={`w-72 flex-shrink-0 relative bg-gradient-to-br ${COVER_GRADIENTS[i % 3]} h-auto min-h-[160px]`}>
                      <div className="absolute top-3.5 right-3.5 bg-[#0c1120]/80 backdrop-blur-sm border border-white/7 text-[#6b7280] text-[10px] font-bold tracking-[1.5px] uppercase px-2.5 py-1 rounded-lg">
                        {event._count.sessions} sessions
                      </div>
                    </div>
                    <div className="flex-1 p-6">
                      <h3 className="font-bold text-xl tracking-tight text-white mb-3 leading-[1.2]" style={{ fontFamily: "Syne, sans-serif" }}>
                        {event.title}
                      </h3>
                      <p className="text-[#6b7280] text-sm leading-relaxed mb-5 line-clamp-2">{event.description}</p>
                      <div className="flex flex-col gap-1.5 mb-5">
                        <EventMeta icon="calendar">{formatDate(event.startDate)} → {formatDate(event.endDate)}</EventMeta>
                        <EventMeta icon="location">{event.place}</EventMeta>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-white/7">
                        {live ? <LiveBadge /> : <span />}
                        <span className="bg-transparent border border-white/7 text-[#6b7280] text-xs font-semibold px-3.5 py-1.5 rounded-lg">
                          View →
                        </span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className={`relative bg-gradient-to-br ${COVER_GRADIENTS[i % 3]} h-48`}>
                      {live && (
                        <span className="absolute top-3.5 left-3.5 bg-emerald-400 text-[#030711] text-[10px] font-black tracking-widest uppercase px-2.5 py-1 rounded-lg flex items-center gap-1.5 animate-[livePulse_2s_ease-in-out_infinite]">
                          ● Live
                        </span>
                      )}
                      <span className="absolute top-3.5 right-3.5 bg-[#0c1120]/80 backdrop-blur-sm border border-white/7 text-[#6b7280] text-[10px] font-bold tracking-[1.5px] uppercase px-2.5 py-1 rounded-lg">
                        {event._count.sessions} sessions
                      </span>
                    </div>
                    <div className="p-6">
                      <h3 className="font-bold text-xl tracking-tight text-white mb-3 leading-[1.2]" style={{ fontFamily: "Syne, sans-serif" }}>
                        {event.title}
                      </h3>
                      <div className="flex flex-col gap-1.5 mb-5">
                        <EventMeta icon="calendar">{formatDate(event.startDate)}</EventMeta>
                        <EventMeta icon="location">{event.place}</EventMeta>
                      </div>
                      <div className="flex items-center justify-between pt-4 border-t border-white/7">
                        <div />
                        <span className="bg-transparent border border-white/7 text-[#6b7280] text-xs font-semibold px-3.5 py-1.5 rounded-lg">
                          View →
                        </span>
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

function EventMeta({ icon, children }: { icon: "calendar" | "location"; children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[#6b7280] text-[13px]">
      {icon === "calendar" ? (
        <svg className="w-3.5 h-3.5 flex-shrink-0 opacity-60" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="2" y="3" width="12" height="11" rx="1.5" />
          <path d="M5 1v4M11 1v4M2 7h12" />
        </svg>
      ) : (
        <svg className="w-3.5 h-3.5 flex-shrink-0 opacity-60" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8.5 4.5 8.5s4.5-5 4.5-8.5c0-2.5-2-4.5-4.5-4.5z" />
          <circle cx="8" cy="6" r="1.5" />
        </svg>
      )}
      {children}
    </div>
  );
}

function FeaturesSection() {
  const features = [
    { icon: "🗓️", title: "Multi-track schedule", desc: "Grid view with parallel sessions by room, all at a glance.", color: "indigo" },
    { icon: "⚡", title: "Live detection", desc: "Sessions automatically marked as live based on the current time.", color: "green" },
    { icon: "💬", title: "Interactive Q&A", desc: "Ask questions, vote, and watch the best ones rise to the top in real time.", color: "purple" },
    { icon: "🎤", title: "Speaker profiles", desc: "Public pages for each speaker with bio, social links, and sessions.", color: "orange" },
    { icon: "🏛️", title: "Room view", desc: "Filter the schedule by room. See what's happening where.", color: "cyan" },
    { icon: "⭐", title: "Personal itinerary", desc: "Bookmark sessions. Your schedule saved locally.", color: "rose" },
  ];

  const colorMap: Record<string, string> = {
    indigo: "bg-indigo-500/12 border-indigo-500/20",
    green: "bg-emerald-400/10 border-emerald-400/20",
    purple: "bg-violet-400/10 border-violet-400/20",
    orange: "bg-orange-400/10 border-orange-400/20",
    cyan: "bg-cyan-400/10 border-cyan-400/20",
    rose: "bg-rose-400/10 border-rose-400/20",
  };

  return (
    <section className="py-24 px-6 max-w-5xl mx-auto">
      <div className="text-violet-400 text-[11px] font-bold tracking-[2px] uppercase flex items-center gap-2 mb-4">
        <span className="w-6 h-px bg-violet-400" />
        Features
      </div>
      <h2
        className="font-black tracking-[-1.5px] leading-[1.1] text-white mb-12"
        style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(32px, 4vw, 48px)" }}
      >
        Everything you need,<br />in real time.
      </h2>

      <div className="grid grid-cols-3 gap-4">
        {features.map(({ icon, title, desc, color }) => (
          <div
            key={title}
            className="bg-[#0c1120] border border-white/7 rounded-2xl p-7 relative overflow-hidden hover:border-indigo-500/25 hover:-translate-y-0.5 transition-all group"
          >
            <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-indigo-500 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <div className={`w-11 h-11 rounded-xl border ${colorMap[color]} flex items-center justify-center text-xl mb-4`}>
              {icon}
            </div>
            <h3 className="font-bold text-[17px] text-white mb-2 tracking-tight" style={{ fontFamily: "Syne, sans-serif" }}>{title}</h3>
            <p className="text-[#6b7280] text-sm leading-relaxed">{desc}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function CTASection() {
  return (
    <section className="py-24 px-6 max-w-2xl mx-auto text-center">
      <div className="text-violet-400 text-[11px] font-bold tracking-[2px] uppercase flex items-center justify-center gap-2 mb-4">
        <span className="w-6 h-px bg-violet-400" />
        Get started
      </div>
      <h2
        className="font-black tracking-[-2px] leading-[1.1] text-white mb-5"
        style={{ fontFamily: "Syne, sans-serif", fontSize: "clamp(36px, 5vw, 56px)" }}
      >
        Ready to transform your event?
      </h2>
      <p className="text-[#6b7280] text-lg font-light leading-[1.7] mb-10">
        Replace static programs with a live, interactive experience.
      </p>
      <div className="flex items-center justify-center gap-3.5 flex-wrap">
        <Link
          href="/events"
          className="bg-gradient-to-br from-indigo-500 to-violet-700 text-white text-base font-semibold px-8 py-4 rounded-2xl flex items-center gap-2.5 hover:-translate-y-0.5 hover:shadow-[0_20px_40px_rgba(91,110,245,0.35)] transition-all no-underline"
        >
          Explore events
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </Link>
        <Link
          href="/admin"
          className="bg-transparent text-[#6b7280] text-base font-medium px-6 py-4 rounded-2xl border border-white/7 hover:text-white hover:border-white/15 hover:bg-white/4 transition-all no-underline"
        >
          Admin Console
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/7 py-12 px-6">
      <div className="max-w-5xl mx-auto grid grid-cols-[2fr_1fr_1fr_1fr] gap-12">
        <div>
          <h3 className="font-black text-xl tracking-tight text-white mb-2.5" style={{ fontFamily: "Syne, sans-serif" }}>
            ⚡ EventSync
          </h3>
          <p className="text-[#6b7280] text-sm leading-relaxed max-w-[220px]">
            The live event platform for organizers and attendees.
          </p>
        </div>
        {[
          {
            title: "Navigation",
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
                  <Link href={href} className="text-white/50 text-sm hover:text-white transition-colors no-underline">
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
      <div className="max-w-5xl mx-auto mt-9 pt-6 border-t border-white/7 flex items-center justify-between">
        <p className="text-[#6b7280] text-[13px]">© 2026 EventSync. Built for live moments.</p>
        <p className="text-[#6b7280]/50 text-xs">WEB3 Final Project</p>
      </div>
    </footer>
  );
}

export default function HomePage() {
  const [events, setEvents] = useState<Event[]>([]);
  const [liveSessions, setLiveSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      try {
        const [eventsRes, sessionsRes] = await Promise.all([
          fetch("/api/events"),
          fetch("/api/sessions"),
        ]);
        const eventsData = await eventsRes.json();
        const sessionsData = await sessionsRes.json();

        const allEvents: Event[] = eventsData.data ?? [];
        const allSessions: Session[] = sessionsData.data ?? [];

        setEvents(allEvents);
        setLiveSessions(
          allSessions.filter((s) => isLive(s.startDate, s.endDate))
        );
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const totalSpeakers = events.reduce((acc, e) => acc + (e._count?.sessions ?? 0), 0);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;1,9..40,300&display=swap');
        
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes gradientShift {
          0% { background-position: 0%; }
          100% { background-position: 200%; }
        }
        @keyframes ticker {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        @keyframes livePulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(34,211,160,0.4); }
          50% { box-shadow: 0 0 0 8px rgba(34,211,160,0); }
        }

        body { font-family: 'DM Sans', sans-serif; }
      `}</style>

      <div className="min-h-screen bg-[#030711] text-white relative overflow-x-hidden">
        <div className="fixed w-[600px] h-[600px] rounded-full pointer-events-none z-0"
          style={{ background: "radial-gradient(circle, rgba(91,110,245,0.18) 0%, transparent 70%)", top: "-200px", left: "-100px", filter: "blur(120px)", animation: "drift1 18s ease-in-out infinite" }} />
        <div className="fixed w-[500px] h-[500px] rounded-full pointer-events-none z-0"
          style={{ background: "radial-gradient(circle, rgba(167,139,250,0.12) 0%, transparent 70%)", top: "40%", right: "-150px", filter: "blur(120px)", animation: "drift2 22s ease-in-out infinite" }} />
        <div className="fixed w-[400px] h-[400px] rounded-full pointer-events-none z-0"
          style={{ background: "radial-gradient(circle, rgba(34,211,160,0.1) 0%, transparent 70%)", bottom: "10%", left: "30%", filter: "blur(120px)", animation: "drift3 16s ease-in-out infinite" }} />
        <div
          className="fixed inset-0 pointer-events-none z-0"
          style={{
            backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)",
            backgroundSize: "80px 80px",
            maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)",
          }}
        />

        <Navbar />
        <Hero />
        <Ticker liveSessions={liveSessions} />
        <StatsBar events={events.length} sessions={events.reduce((a, e) => a + (e._count?.sessions ?? 0), 0)} speakers={totalSpeakers} />
        {!loading && <LiveSection sessions={liveSessions} />}
        {!loading && <EventsSection events={events} />}
        <FeaturesSection />
        <CTASection />
        <Footer />
      </div>
    </>
  );
}