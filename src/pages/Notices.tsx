import { useEffect, useState } from "react";
import { Loader2, Megaphone } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";

interface Notice {
  id: string;
  title: string;
  body: string | null;
  starts_at: string | null;
  created_at: string;
}

const Notices = () => {
  const [rows, setRows] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const { data } = await supabase
        .from("notices")
        .select("id,title,body,starts_at,created_at,active,ends_at")
        .eq("active", true)
        .order("created_at", { ascending: false });
      const nowIso = new Date().toISOString();
      const filtered = (data ?? []).filter(
        (n: any) =>
          (!n.starts_at || n.starts_at <= nowIso) &&
          (!n.ends_at || n.ends_at >= nowIso),
      );
      setRows(filtered as Notice[]);
      setLoading(false);
    })();
  }, []);

  return (
    <main className="relative min-h-screen">
      <Navbar />
      <section className="px-4 sm:px-6 pt-28 pb-16 max-w-3xl mx-auto">
        <div className="flex items-center gap-3 mb-6 text-white">
          <Megaphone className="h-6 w-6 text-emerald-300" />
          <h1 className="text-3xl font-bold tracking-tight">Notices</h1>
        </div>
        <p className="text-white/60 text-sm mb-8">
          Official announcements from the DPS AMUN Secretariat.
        </p>

        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        ) : rows.length === 0 ? (
          <div className="glass rounded-2xl p-8 text-center text-white/70">
            No active notices at the moment.
          </div>
        ) : (
          <div className="space-y-4">
            {rows.map((n) => (
              <article key={n.id} className="glass-strong rounded-2xl p-5">
                <h2 className="text-white text-lg font-semibold">{n.title}</h2>
                <p className="text-white/40 text-xs mt-1">
                  {new Date(n.starts_at ?? n.created_at).toLocaleString()}
                </p>
                {n.body && (
                  <p className="text-white/80 text-sm mt-3 whitespace-pre-wrap leading-relaxed">
                    {n.body}
                  </p>
                )}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default Notices;
