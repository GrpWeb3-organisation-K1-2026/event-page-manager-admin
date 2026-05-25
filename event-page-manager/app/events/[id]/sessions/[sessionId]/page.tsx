"use client";

import { use, useEffect, useState, useCallback, useRef } from "react";
import Link from "next/link";


interface Speaker {
  id: number;
  fullName: string;
  photo: string | null;
  biography: string;
  links: Record<string, string> | null;
}

interface Question {
  id: number;
  content: string;
  name: string | null;
  upvotes: number;
  createdAt: string;
  sessionId: number;
}

interface Session {
  id: number;
  title: string;
  description: string;
  startDate: string;
  endDate: string;
  capacity: number;
  room: { id: number; name: string };
  event: { id: number; title: string };
  speakers: { speaker: Speaker }[];
  questions: Question[];
}


const FAV_KEY = "eventsync_favorites";
function getFavIds(): number[] { try { return JSON.parse(localStorage.getItem(FAV_KEY) ?? "[]"); } catch { return []; } }
function toggleFavLocal(id: number) {
  const f = getFavIds(); const i = f.indexOf(id);
  if (i === -1) f.push(id); else f.splice(i, 1);
  localStorage.setItem(FAV_KEY, JSON.stringify(f));
}

function isLive(s: string, e: string) { const n = new Date(); return n >= new Date(s) && n <= new Date(e); }
function isUpcoming(s: string) { return new Date() < new Date(s); }
function formatDate(d: string) { return new Date(d).toLocaleDateString("en-US", { weekday: "short", day: "numeric", month: "short", year: "numeric" }); }
function formatTime(d: string) { return new Date(d).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" }); }
function formatRelative(d: string) {
  const diff = Date.now() - new Date(d).getTime();
  if (diff < 60000) return "just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h ago`;
  return new Date(d).toLocaleDateString("en-US", { day: "numeric", month: "short" });
}
function initials(name: string) { return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2); }

const AVATAR_COLORS = [
  "from-indigo-500 to-violet-500",
  "from-emerald-400 to-cyan-500",
  "from-blue-400 to-indigo-600",
  "from-violet-500 to-pink-500",
];

const COVER_GRADIENTS = [
  { from: "#1a1040", via: "#2d1b69", to: "#4c1d95", accent: "#5b6ef5" },
  { from: "#0c2340", via: "#1e3a5f", to: "#164e63", accent: "#22d3a0" },
  { from: "#1a0a2e", via: "#3b1f5e", to: "#6d28d9", accent: "#a78bfa" },
  { from: "#0f1f0a", via: "#1a3a12", to: "#14532d", accent: "#22d3a0" },
  { from: "#0a1a2e", via: "#0c2a4a", to: "#1e3a5f", accent: "#06b6d4" },
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
        <linearGradient id="sessIdLg1" x1="0" y1="0" x2="34" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#5b6ef5" /><stop offset="100%" stopColor="#a78bfa" />
        </linearGradient>
        <linearGradient id="sessIdLg2" x1="34" y1="0" x2="0" y2="34" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#22d3a0" /><stop offset="100%" stopColor="#5b6ef5" />
        </linearGradient>
      </defs>
      <rect width="34" height="34" rx="10" fill="#0c1120" />
      <path d="M6 17 Q6 8 17 8 Q23 8 27 14" stroke="url(#sessIdLg1)" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M28 17 Q28 26 17 26 Q11 26 7 20" stroke="url(#sessIdLg2)" strokeWidth="2.6" strokeLinecap="round" fill="none" />
      <path d="M23.5 11 L27 14 L23 16.5" stroke="url(#sessIdLg1)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      <path d="M10.5 23 L7 20 L11 17.5" stroke="url(#sessIdLg2)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
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
    return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.73-8.835L1.254 2.25H8.08l4.259 5.631L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" /></svg>;
  if (p === "github")
    return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" /></svg>;
  if (p === "linkedin")
    return <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z" /></svg>;
  return <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6" /><path d="M8 2a10 10 0 010 12M2 8h12" /><path d="M3 5h10M3 11h10" /></svg>;
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

function QuestionCard({ question, onUpvote, hasVoted }: {
  question: Question;
  onUpvote: (id: number) => void;
  hasVoted: boolean;
}) {
  return (
    <div className="group flex items-start gap-3 bg-[#0c1120] border border-white/7 rounded-2xl p-4 hover:border-indigo-500/20 transition-all">
      <button
        onClick={() => onUpvote(question.id)}
        className={`flex-shrink-0 flex flex-col items-center gap-0.5 w-10 py-2 rounded-xl border transition-all ${hasVoted ? "bg-indigo-500/15 border-indigo-500/30 text-indigo-400" : "bg-white/4 border-white/7 text-[#4b5563] hover:text-indigo-400 hover:border-indigo-500/20"}`}>
        <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M8 3l5 6H3l5-6z" />
        </svg>
        <span className="text-[11px] font-black" style={{ fontFamily: "Inter, sans-serif" }}>{question.upvotes}</span>
      </button>

      <div className="flex-1 min-w-0">
        <p className="text-white text-sm leading-relaxed mb-2">{question.content}</p>
        <div className="flex items-center gap-3 text-[11px] text-[#4b5563]">
          <span className="flex items-center gap-1">
            <svg className="w-3 h-3 opacity-50" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="6" r="3" /><path d="M2 14c0-3-2.7-5 6-5s6 2 6 5" /></svg>
            {question.name || "Anonymous"}
          </span>
          <span>{formatRelative(question.createdAt)}</span>
        </div>
      </div>
    </div>
  );
}

export default function SessionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [session, setSession] = useState<Session | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [isFav, setIsFav] = useState(false);
  const [votedIds, setVotedIds] = useState<Set<number>>(new Set());

  const [questionText, setQuestionText] = useState("");
  const [authorName, setAuthorName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    fetch(`/api/sessions/${id}`)
      .then((r) => { if (r.status === 404) { setNotFound(true); return null; } return r.json(); })
      .then((d) => {
        if (d) {
          setSession(d.data);
          setQuestions((d.data.questions ?? []).sort((a: Question, b: Question) => b.upvotes - a.upvotes));
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));

    setIsFav(getFavIds().includes(Number(id)));

    const stored = localStorage.getItem(`voted_${id}`);
    if (stored) setVotedIds(new Set(JSON.parse(stored)));
  }, [id]);

  useEffect(() => {
    if (!session) return;
    if (!isLive(session.startDate, session.endDate)) return;

    pollRef.current = setInterval(() => {
      fetch(`/api/sessions/${id}`)
        .then((r) => r.json())
        .then((d) => {
          if (d?.data?.questions) {
            setQuestions([...d.data.questions].sort((a: Question, b: Question) => b.upvotes - a.upvotes));
          }
        })
        .catch(() => {});
    }, 10000);

    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [session, id]);

  const handleToggleFav = useCallback(() => {
    toggleFavLocal(Number(id));
    setIsFav(getFavIds().includes(Number(id)));
  }, [id]);

  const handleUpvote = useCallback(async (questionId: number) => {
    if (votedIds.has(questionId)) return;

    try {
      const res = await fetch(`/api/questions/${questionId}/upvote`, { method: "POST" });
      if (!res.ok) return;

      const newVoted = new Set(votedIds).add(questionId);
      setVotedIds(newVoted);
      localStorage.setItem(`voted_${id}`, JSON.stringify(Array.from(newVoted)));

      setQuestions((prev) =>
        prev.map((q) => q.id === questionId ? { ...q, upvotes: q.upvotes + 1 } : q)
          .sort((a, b) => b.upvotes - a.upvotes)
      );
    } catch {}
  }, [votedIds, id]);

  const handleSubmitQuestion = useCallback(async () => {
    if (!questionText.trim()) return;
    setSubmitting(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: questionText.trim(),
          name: authorName.trim() || null,
          sessionId: Number(id),
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        setSubmitError(err.error ?? "Failed to submit question.");
        return;
      }

      const newQ: Question = (await res.json()).data;
      setQuestions((prev) => [newQ, ...prev].sort((a, b) => b.upvotes - a.upvotes));
      setQuestionText("");
      setSubmitSuccess(true);
      setTimeout(() => setSubmitSuccess(false), 3000);
    } catch {
      setSubmitError("Network error. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }, [questionText, authorName, id]);

  if (loading) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'); body{font-family:'Inter',sans-serif}`}</style>
      <div className="min-h-screen bg-[#030711]"><Navbar />
        <div className="pt-36 px-4 md:px-6 max-w-5xl mx-auto animate-pulse space-y-5">
          <div className="h-12 bg-white/4 rounded-2xl w-2/3" />
          <div className="h-6 bg-white/4 rounded-xl w-1/3" />
          <div className="h-32 bg-white/4 rounded-2xl" />
          <div className="h-48 bg-white/4 rounded-2xl" />
        </div>
      </div>
    </>
  );

  if (notFound || !session) return (
    <>
      <style>{`@import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap'); body{font-family:'Inter',sans-serif}`}</style>
      <div className="min-h-screen bg-[#030711] text-white"><Navbar />
        <div className="pt-36 px-4 text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#0c1120] border border-white/7 flex items-center justify-center mx-auto mb-6">
            <svg className="w-9 h-9 text-[#374151]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><rect x="3" y="4" width="18" height="18" rx="2" /><path d="M16 2v4M8 2v4M3 10h18" /></svg>
          </div>
          <h2 className="font-black text-xl text-white mb-2" style={{ fontFamily: "Inter, sans-serif" }}>Session not found</h2>
          <p className="text-[#6b7280] text-sm mb-6">This session doesn't exist or has been removed.</p>
          <Link href="/schedule" className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium px-5 py-2.5 rounded-xl no-underline hover:bg-indigo-500/20 transition-colors">
            <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 8H3M7 4l-4 4 4 4" /></svg>
            Back to schedule
          </Link>
        </div>
      </div>
    </>
  );

  const live = isLive(session.startDate, session.endDate);
  const upcoming = isUpcoming(session.startDate);
  const ended = !live && !upcoming;
  const grad = COVER_GRADIENTS[session.id % COVER_GRADIENTS.length];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&display=swap');
        @keyframes fadeUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
        @keyframes gradientShift { 0%{background-position:0%} 100%{background-position:200%} }
        body { font-family: 'Inter', sans-serif; }
      `}</style>

      <div className="min-h-screen bg-[#030711] text-white relative overflow-x-hidden">
        <div className="fixed rounded-full pointer-events-none z-0" style={{ width: "min(700px,90vw)", height: "min(700px,90vw)", background: `radial-gradient(circle, ${grad.accent}18 0%, transparent 70%)`, top: "-200px", left: "-150px", filter: "blur(130px)" }} />
        <div className="fixed rounded-full pointer-events-none z-0" style={{ width: "min(400px,60vw)", height: "min(400px,60vw)", background: `radial-gradient(circle, ${grad.accent}10 0%, transparent 70%)`, bottom: "10%", right: "-80px", filter: "blur(120px)" }} />
        <div className="fixed inset-0 pointer-events-none z-0" style={{ backgroundImage: "linear-gradient(rgba(255,255,255,0.025) 1px, transparent 1px),linear-gradient(90deg, rgba(255,255,255,0.025) 1px, transparent 1px)", backgroundSize: "80px 80px", maskImage: "radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%)" }} />

        <Navbar />

        <main className="relative z-10 px-4 md:px-6 max-w-5xl mx-auto pb-24 pt-28 md:pt-36">

          <Link href={`/events/${session.event.id}`} className="inline-flex items-center gap-2 text-[#6b7280] hover:text-white text-sm font-medium mb-8 no-underline transition-colors group">
            <svg className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M13 8H3M7 4l-4 4 4 4" /></svg>
            {session.event.title}
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-[fadeUp_0.5s_ease_both]">

            <div className="lg:col-span-2 space-y-5">

              <div className="relative overflow-hidden rounded-3xl border border-white/7 bg-[#0c1120]">
                <div className="absolute inset-0 opacity-50" style={{ background: `radial-gradient(ellipse at 50% 0%, ${grad.accent}10 0%, transparent 60%)` }} />
                <div className="absolute top-0 left-0 right-0 h-px" style={{ background: `linear-gradient(90deg, transparent, ${grad.accent}60, transparent)` }} />

                <div className="h-28 md:h-36 relative overflow-hidden"
                  style={{ background: `linear-gradient(135deg, ${grad.from}, ${grad.via}, ${grad.to})` }}>
                  <div className="absolute -top-6 -right-6 w-36 h-36 rounded-full opacity-30" style={{ background: `radial-gradient(circle, ${grad.accent}60, transparent)` }} />
                  <div className="absolute bottom-3 right-4 w-2.5 h-2.5 rounded-full" style={{ background: grad.accent, boxShadow: `0 0 10px ${grad.accent}` }} />

                  <div className="absolute top-4 left-4 flex gap-2">
                    {live && (
                      <span className="inline-flex items-center gap-1.5 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/15 backdrop-blur-sm border border-emerald-400/30 px-2.5 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />Live now
                      </span>
                    )}
                    {upcoming && <span className="text-[10px] font-bold uppercase text-indigo-300 bg-indigo-500/15 backdrop-blur-sm border border-indigo-500/30 px-2.5 py-1 rounded-full">Upcoming</span>}
                    {ended && <span className="text-[10px] font-bold uppercase text-[#6b7280] bg-white/10 backdrop-blur-sm border border-white/10 px-2.5 py-1 rounded-full">Ended</span>}
                  </div>

                  <button onClick={handleToggleFav}
                    className={`absolute top-4 right-4 w-8 h-8 rounded-xl flex items-center justify-center border backdrop-blur-sm transition-all ${isFav ? "bg-indigo-500/20 border-indigo-500/40 text-indigo-400" : "bg-black/30 border-white/10 text-white/50 hover:text-indigo-400"}`}>
                    <svg className="w-4 h-4" viewBox="0 0 16 16" fill={isFav ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.5"><path d="M3 2h10v13l-5-3-5 3V2z" /></svg>
                  </button>
                </div>

                <div className="relative p-5 md:p-7">
                  <h1 className="font-black text-white leading-tight mb-3"
                    style={{ fontFamily: "Inter, sans-serif", fontSize: "clamp(20px,3.5vw,32px)", letterSpacing: "-0.8px" }}>
                    {session.title}
                  </h1>
                  <p className="text-[#6b7280] text-sm leading-relaxed mb-5">{session.description}</p>

                  <div className="flex flex-wrap gap-x-6 gap-y-2 text-[12px] text-[#4b5563] mb-5">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 opacity-50" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6" /><path d="M8 5v3l2 2" /></svg>
                      {formatTime(session.startDate)} – {formatTime(session.endDate)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 opacity-50" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="2" y="3" width="12" height="11" rx="1.5" /><path d="M5 1v4M11 1v4M2 7h12" /></svg>
                      {formatDate(session.startDate)}
                    </span>
                    <Link href={`/rooms/${session.room.id}`} className="flex items-center gap-1.5 no-underline hover:text-white transition-colors">
                      <svg className="w-3.5 h-3.5 opacity-50" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M8 1.5C5.5 1.5 3.5 3.5 3.5 6c0 3.5 4.5 8.5 4.5 8.5s4.5-5 4.5-8.5c0-2.5-2-4.5-4.5-4.5z" /><circle cx="8" cy="6" r="1.5" /></svg>
                      {session.room.name}
                    </Link>
                    <span className="flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5 opacity-50" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="5" r="3" /><path d="M2 14c0-3.3 2.7-6 6-6s6 2.7 6 6" /></svg>
                      Capacity: {session.capacity}
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {[
                      { value: session.speakers.length, label: "Speakers", color: "#5b6ef5" },
                      { value: questions.length, label: "Questions", color: "#22d3a0" },
                      { value: questions.reduce((acc, q) => acc + q.upvotes, 0), label: "Votes", color: "#a78bfa" },
                    ].map(({ value, label, color }) => (
                      <div key={label} className="flex items-center gap-2 bg-white/4 border border-white/7 rounded-xl px-3 py-1.5">
                        <span className="w-1.5 h-1.5 rounded-full" style={{ background: color }} />
                        <span className="font-black text-white text-sm" style={{ fontFamily: "Inter, sans-serif" }}>{value}</span>
                        <span className="text-[#6b7280] text-xs uppercase tracking-wider">{label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {session.speakers.length > 0 && (
                <div className="bg-[#0c1120] border border-white/7 rounded-2xl p-5 md:p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><rect x="5" y="1" width="6" height="9" rx="3" /><path d="M2 8a6 6 0 0012 0M8 14v2M5 16h6" /></svg>
                    <h2 className="font-black text-white text-sm uppercase tracking-widest" style={{ fontFamily: "Inter, sans-serif" }}>Speakers</h2>
                  </div>
                  <div className="space-y-4">
                    {session.speakers.map(({ speaker }, i) => (
                      <div key={speaker.id} className="flex items-start gap-4">
                        {speaker.photo ? (
                          <img src={speaker.photo} alt={speaker.fullName}
                            className="w-12 h-12 rounded-2xl object-cover border border-white/10 flex-shrink-0" />
                        ) : (
                          <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${AVATAR_COLORS[i % AVATAR_COLORS.length]} flex items-center justify-center font-black text-white text-base flex-shrink-0 border border-white/10`}
                            style={{ fontFamily: "Inter, sans-serif" }}>
                            {initials(speaker.fullName)}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <Link href={`/speakers/${speaker.id}`} className="no-underline">
                            <h3 className="font-bold text-white text-[15px] hover:text-indigo-300 transition-colors mb-1"
                              style={{ fontFamily: "Inter, sans-serif", letterSpacing: "-0.3px" }}>
                              {speaker.fullName}
                            </h3>
                          </Link>
                          {speaker.biography && (
                            <p className="text-[#4b5563] text-xs leading-relaxed line-clamp-2 mb-2">{speaker.biography}</p>
                          )}
                          {speaker.links && Object.keys(speaker.links).length > 0 && (
                            <div className="flex flex-wrap gap-1.5">
                              {Object.entries(speaker.links).slice(0, 3).map(([platform, url]) => (
                                <a key={platform} href={url} target="_blank" rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 bg-white/4 border border-white/7 text-[#6b7280] hover:text-white text-[10px] font-medium px-2 py-1 rounded-lg no-underline transition-all capitalize">
                                  <SocialIcon platform={platform} />
                                  {platform}
                                </a>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-4">

              <div className={`relative overflow-hidden rounded-2xl border p-5 ${live ? "bg-emerald-400/3 border-emerald-400/20" : "bg-[#0c1120] border-white/7"}`}>
                {live && <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-emerald-400 to-transparent" />}

                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-indigo-400" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 10a2 2 0 01-2 2H5l-3 3V4a2 2 0 012-2h8a2 2 0 012 2v6z" /></svg>
                    <h2 className="font-black text-white text-sm uppercase tracking-widest" style={{ fontFamily: "Inter, sans-serif" }}>Q&A</h2>
                  </div>
                  {live && (
                    <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-0.5 rounded-full">
                      <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />Live
                    </span>
                  )}
                </div>

                {live ? (
                  <p className="text-[#6b7280] text-xs">The session is live — ask your questions below.</p>
                ) : upcoming ? (
                  <p className="text-[#4b5563] text-xs">Q&A opens when the session starts.</p>
                ) : (
                  <p className="text-[#4b5563] text-xs">This session has ended. {questions.length} question{questions.length !== 1 ? "s" : ""} were asked.</p>
                )}
              </div>

              {live && (
                <div className="bg-[#0c1120] border border-white/7 rounded-2xl p-4 space-y-3">
                  <textarea
                    value={questionText}
                    onChange={(e) => setQuestionText(e.target.value)}
                    placeholder="Ask a question…"
                    rows={3}
                    className="w-full bg-white/4 border border-white/7 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-indigo-500/40 transition-colors resize-none"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  />
                  <input
                    type="text"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    placeholder="Your name (optional)"
                    className="w-full bg-white/4 border border-white/7 rounded-xl px-3.5 py-2 text-sm text-white placeholder-[#4b5563] focus:outline-none focus:border-indigo-500/40 transition-colors"
                    style={{ fontFamily: "Inter, sans-serif" }}
                  />

                  {submitError && (
                    <p className="text-[11px] text-rose-400 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="8" cy="8" r="6" /><path d="M8 5v3M8 11h.01" /></svg>
                      {submitError}
                    </p>
                  )}
                  {submitSuccess && (
                    <p className="text-[11px] text-emerald-400 flex items-center gap-1.5">
                      <svg className="w-3.5 h-3.5" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 8l3.5 3.5L13 5" /></svg>
                      Question submitted!
                    </p>
                  )}

                  <button
                    onClick={handleSubmitQuestion}
                    disabled={submitting || !questionText.trim()}
                    className="w-full bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 hover:-translate-y-0.5 hover:shadow-[0_8px_24px_rgba(91,110,245,0.3)] transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none">
                    {submitting ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 2a6 6 0 010 12" /></svg>
                        Sending…
                      </>
                    ) : (
                      <>
                        <svg className="w-4 h-4" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M14 2L9 14l-2-5-5-2 12-5z" /></svg>
                        Submit question
                      </>
                    )}
                  </button>
                </div>
              )}

              {questions.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center gap-2 px-1">
                    <span className="text-[11px] font-bold uppercase tracking-widest text-[#4b5563]">{questions.length} question{questions.length !== 1 ? "s" : ""}</span>
                    <div className="flex-1 h-px bg-gradient-to-r from-white/8 to-transparent" />
                    <span className="text-[10px] text-[#374151]">sorted by votes</span>
                  </div>
                  {questions.map((q) => (
                    <QuestionCard
                      key={q.id}
                      question={q}
                      onUpvote={handleUpvote}
                      hasVoted={votedIds.has(q.id)}
                    />
                  ))}
                </div>
              )}

              {questions.length === 0 && !live && !upcoming && (
                <div className="text-center py-8 bg-[#0c1120] border border-white/7 rounded-2xl">
                  <svg className="w-8 h-8 text-[#374151] mx-auto mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M14 10a2 2 0 01-2 2H5l-3 3V4a2 2 0 012-2h8a2 2 0 012 2v6z" /></svg>
                  <p className="text-[#4b5563] text-sm">No questions were asked.</p>
                </div>
              )}
            </div>
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