import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import CornerDoodles from "@/components/CornerDoodles";
import { supabase } from "@/integrations/supabase/client";
import { classifyImageUrl } from "@/lib/imgbb";

interface TeamMember {
  id: string;
  name: string;
  role_title: string | null;
  photo_url: string | null;
  bio: string | null;
  sort_order: number;
}

const Secretariat = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    const { data } = await supabase
      .from("team_members")
      .select("*")
      .order("sort_order")
      .order("name");
    setTeam((data ?? []) as TeamMember[]);
    setLoading(false);
  };

  useEffect(() => {
    // Public page: fetch once on mount. Avoid one realtime websocket
    // per visitor — admin updates will appear on the next page load.
    load();
  }, []);

  return (
    <main className="relative min-h-screen pb-20">
      <Navbar />
      <CornerDoodles />
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-32">
        <div className="text-center mb-12">
          <h1 className="text-white text-4xl md:text-5xl font-extrabold tracking-tight">
            The Secretariat
          </h1>
          <p className="text-white/70 mt-3 max-w-2xl mx-auto">
            Meet the team leading DPSAMUN — chairs, directors, and members
            shaping every committee.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        ) : team.length === 0 ? (
          <div className="glass rounded-2xl p-10 text-center text-white/70">
            Secretariat members will be announced soon.
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {team.map((m) => {
              const c = classifyImageUrl(m.photo_url ?? "");
              const showImage = c.kind === "direct" || c.kind === "other";
              return (
                <div
                  key={m.id}
                  className="glass-strong rounded-2xl p-6 flex flex-col items-center text-center hover:bg-white/10 transition"
                >
                  <div className="h-32 w-32 rounded-full overflow-hidden ring-2 ring-white/30 bg-white/5 mb-4">
                    {showImage ? (
                      <img
                        src={c.url}
                        alt={m.name}
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                        loading="lazy"
                      />
                    ) : (
                      <div className="h-full w-full bg-white/10 flex items-center justify-center text-white/40 text-xs px-2">
                        No image
                      </div>
                    )}
                  </div>
                  <h3 className="text-white text-lg font-bold">{m.name}</h3>
                  {m.role_title && (
                    <p className="text-emerald-300 text-sm font-medium mt-0.5">
                      {m.role_title}
                    </p>
                  )}
                  {m.bio && (
                    <p className="text-white/70 text-sm mt-3 leading-relaxed">
                      {m.bio}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </section>
    </main>
  );
};

export default Secretariat;