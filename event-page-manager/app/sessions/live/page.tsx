"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

interface Session {
  id: number;
  title: string;
  startDate: string;
  endDate: string;
  room: { id: number; name: string };
  event: { id: number; title: string };
  speakers: { speaker: { id: number; fullName: string } }[];
}

function isLive(s: string, e: string) {
  const now = new Date();
  return now >= new Date(s) && now <= new Date(e);
}

export default function LiveSessionsPage() {
  const [allSessions, setAllSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/sessions?limit=200")
      .then((r) => r.json())
      .then((d) => setAllSessions(d.data ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const liveSessions = allSessions.filter((s) => isLive(s.startDate, s.endDate));

  return (
    <div className="min-h-screen bg-[#030711] text-white pt-28 md:pt-36 px-4 max-w-5xl mx-auto pb-24">
      <h1 className="font-black text-white mb-8" style={{ fontSize: "clamp(32px,5vw,56px)", letterSpacing: "-1.5px" }}>
        Sessions en cours
        <span className="ml-3 inline-flex items-center gap-1.5 text-[14px] font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-3 py-1 rounded-full align-middle">
          <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
          {liveSessions.length} live
        </span>
      </h1>

      {loading ? (
        <div className="space-y-3">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-24 bg-white/4 rounded-2xl animate-pulse" />
          ))}
        </div>
      ) : liveSessions.length === 0 ? (
        <div className="text-center py-24 bg-[#0c1120] border border-white/7 rounded-2xl">
          <p className="text-white font-semibold mb-2">Aucune session en cours</p>
          <p className="text-[#6b7280] text-sm mb-6">Consultez le planning pour voir les prochaines sessions.</p>
          <Link href="/schedule" className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-sm font-medium px-5 py-2.5 rounded-xl no-underline hover:bg-indigo-500/20 transition-colors">
            Voir le planning
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {liveSessions.map((session) => (
            <Link
              key={session.id}
              href={`/events/${session.event.id}/sessions/${session.id}`}
              className="flex items-center gap-4 bg-[#0c1120] border border-emerald-400/20 rounded-2xl px-5 py-4 hover:bg-emerald-400/4 transition-all no-underline relative overflow-hidden"
            >
              <span className="absolute left-0 top-0 bottom-0 w-0.5 bg-emerald-400 rounded-r" />
              <span className="inline-flex items-center gap-1 text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded-full flex-shrink-0">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />Live
              </span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-white text-[15px] truncate">{session.title}</p>
                <p className="text-[#6b7280] text-xs mt-0.5">{session.event.title} · {session.room.name}</p>
              </div>
              <span className="text-[#4b5563] text-xs flex-shrink-0">
                {new Date(session.startDate).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })} →{" "}
                {new Date(session.endDate).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
