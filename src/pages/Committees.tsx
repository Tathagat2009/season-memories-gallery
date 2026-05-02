import { useEffect, useState } from "react";
import { Loader2, FileText, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";

interface Committee {
  id: string;
  name: string;
  short_code: string | null;
  agenda: string | null;
  image_url: string | null;
  background_guide: string | null;
  registration_open: boolean;
  sort_order: number;
}

const isUrl = (s: string) => /^https?:\/\//i.test(s.trim());

const Committees = () => {
  const [rows, setRows] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from("committees")
      .select("id,name,short_code,agenda,image_url,background_guide,registration_open,sort_order")
      .order("sort_order")
      .order("name");
    setRows((data ?? []) as Committee[]);
    setLoading(false);
  };

  useEffect(() => {
    // Public page: just fetch on mount. Avoid opening a realtime
    // websocket per visitor — at scale that's thousands of idle subs.
    load();
  }, []);

  return (
    <main className="relative min-h-screen">
      <Navbar />
      <section className="px-4 sm:px-6 pt-28 pb-16 max-w-6xl mx-auto">
        <div className="flex items-center gap-3 mb-3 text-white">
          <Users className="h-6 w-6 text-emerald-300" />
          <h1 className="text-3xl md:text-4xl font-bold tracking-tight">Committees</h1>
        </div>
        <p className="text-white/60 text-sm mb-10 max-w-2xl">
          Explore the committees offered at DPSAMUN Season 2. Background guides will be released here.
        </p>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        ) : rows.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-white/70">
            Committees will be announced shortly.
          </div>
        ) : (
          <div className="grid gap-5 md:grid-cols-2">
            {rows.map((c) => {
              const guide = c.background_guide?.trim() ?? "";
              const guideIsLink = guide && isUrl(guide);
              return (
                <article
                  key={c.id}
                  className="glass-strong rounded-2xl p-5 flex gap-4 ring-1 ring-white/10 hover:ring-white/20 transition"
                >
                  {c.image_url ? (
                    <img src={c.image_url} alt={c.name} className="h-20 w-20 rounded-xl object-cover shrink-0" />
                  ) : (
                    <div className="h-20 w-20 rounded-xl bg-white/10 shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-white text-lg font-bold truncate">{c.name}</h2>
                      {c.short_code && (
                        <span className="text-[10px] uppercase tracking-wider text-white/60 border border-white/20 rounded px-1.5 py-0.5">
                          {c.short_code}
                        </span>
                      )}
                      {!c.registration_open && (
                        <span className="text-[10px] uppercase tracking-wider text-red-300 border border-red-300/40 rounded px-1.5 py-0.5">
                          Registration Closed
                        </span>
                      )}
                    </div>
                    {c.agenda && (
                      <p className="text-white/70 text-sm mt-2 leading-relaxed">{c.agenda}</p>
                    )}
                    <div className="mt-3">
                      {guide ? (
                        guideIsLink ? (
                          <a
                            href={guide}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 text-emerald-300 text-xs font-semibold hover:bg-white/10"
                          >
                            <FileText className="h-3.5 w-3.5" />
                            Background Guide
                          </a>
                        ) : (
                          <span className="inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 text-white/70 text-xs font-semibold">
                            <FileText className="h-3.5 w-3.5" />
                            Background Guide: {guide}
                          </span>
                        )
                      ) : (
                        <span className="inline-flex items-center gap-2 text-white/40 text-xs">
                          <FileText className="h-3.5 w-3.5" />
                          Background Guide — Coming Soon
                        </span>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default Committees;
