import { useEffect, useMemo, useState } from "react";
import { Loader2, Search } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";

interface Row {
  id: string;
  delegate_name: string | null;
  school: string | null;
  class_grade: string | null;
  portfolio: string | null;
  committee_id: string | null;
}

interface CommitteeLite {
  id: string;
  name: string;
  short_code: string | null;
}

const Allocations = () => {
  const [rows, setRows] = useState<Row[]>([]);
  const [committees, setCommittees] = useState<CommitteeLite[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [a, c] = await Promise.all([
        supabase
          .from("allocations")
          .select("id, delegate_name, school, class_grade, portfolio, committee_id")
          .eq("published", true)
          .order("delegate_name"),
        supabase.from("committees").select("id, name, short_code"),
      ]);
      setRows((a.data ?? []) as Row[]);
      setCommittees((c.data ?? []) as CommitteeLite[]);
      setLoading(false);
    };
    load();
  }, []);

  const cmap = useMemo(() => {
    const m = new Map<string, CommitteeLite>();
    committees.forEach((c) => m.set(c.id, c));
    return m;
  }, [committees]);

  // group by committee
  const grouped = useMemo(() => {
    const lower = q.trim().toLowerCase();
    const filtered = lower
      ? rows.filter((r) =>
          [r.delegate_name, r.school, r.portfolio, r.class_grade, r.committee_id ? cmap.get(r.committee_id)?.name : ""]
            .filter(Boolean)
            .some((s) => s!.toLowerCase().includes(lower))
        )
      : rows;
    const g = new Map<string, Row[]>();
    filtered.forEach((r) => {
      const key = r.committee_id ?? "_unassigned";
      const arr = g.get(key) ?? [];
      arr.push(r);
      g.set(key, arr);
    });
    return Array.from(g.entries());
  }, [rows, q, cmap]);

  return (
    <main className="relative min-h-screen pb-20">
      <Navbar />
      <section className="relative z-10 max-w-5xl mx-auto px-6 pt-32">
        <div className="text-center mb-8">
          <h1 className="text-white text-4xl md:text-5xl font-extrabold tracking-tight">
            Delegate Allocations
          </h1>
          <p className="text-white/70 mt-3">
            Official committee & country allocations for DPSAMUN Season 2.
          </p>
        </div>

        <div className="glass-strong rounded-2xl p-3 mb-8 flex items-center gap-2">
          <Search className="h-4 w-4 text-white/60 ml-2" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search delegate, committee, country, school..."
            className="border-0 bg-transparent text-white placeholder:text-white/40 focus-visible:ring-0"
          />
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        ) : grouped.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center text-white/70">
            No allocations published yet. Please check back soon.
          </div>
        ) : (
          <div className="space-y-6">
            {grouped.map(([cid, list]) => {
              const c = cid !== "_unassigned" ? cmap.get(cid) : undefined;
              return (
                <div key={cid} className="glass-strong rounded-2xl overflow-hidden">
                  <div className="px-5 py-3 border-b border-white/10 flex items-center justify-between">
                    <h2 className="text-white font-bold">
                      {c ? c.name : "Unassigned"}
                      {c?.short_code && (
                        <span className="ml-2 text-emerald-300/80 text-sm">({c.short_code})</span>
                      )}
                    </h2>
                    <span className="text-white/60 text-xs">{list.length} delegates</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-white">
                      <thead className="bg-white/5 text-white/70 text-xs uppercase">
                        <tr>
                          <th className="px-4 py-2 text-left">Delegate</th>
                          <th className="px-4 py-2 text-left">School / Class</th>
                          <th className="px-4 py-2 text-left">Country / Portfolio</th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.map((r) => (
                          <tr key={r.id} className="border-t border-white/10">
                            <td className="px-4 py-2 font-medium">{r.delegate_name ?? "—"}</td>
                            <td className="px-4 py-2 text-white/70">
                              {[r.school, r.class_grade].filter(Boolean).join(" · ") || "—"}
                            </td>
                            <td className="px-4 py-2">{r.portfolio ?? "—"}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default Allocations;
