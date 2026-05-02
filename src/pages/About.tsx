import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import CornerDoodles from "@/components/CornerDoodles";
import { supabase } from "@/integrations/supabase/client";

interface TeamMember {
  id: string;
  name: string;
  role_title: string | null;
  photo_url: string | null;
  bio: string | null;
}

// Static "Season 1 Memories" gallery.
// Replace the `src` values with Google Drive thumbnail URLs in the form:
//   https://drive.google.com/thumbnail?id=FILE_ID&sz=w1600
// The first item is rendered as the large "Main Memory" feature.
const SEASON_1_MEMORIES: { src: string; caption?: string; main?: boolean }[] = [
  { src: "https://drive.google.com/thumbnail?id=REPLACE_ME_MAIN&sz=w1600", caption: "Opening Ceremony", main: true },
  { src: "https://drive.google.com/thumbnail?id=REPLACE_ME_2&sz=w1200" },
  { src: "https://drive.google.com/thumbnail?id=REPLACE_ME_3&sz=w1200" },
  { src: "https://drive.google.com/thumbnail?id=REPLACE_ME_4&sz=w1200" },
  { src: "https://drive.google.com/thumbnail?id=REPLACE_ME_5&sz=w1200" },
  { src: "https://drive.google.com/thumbnail?id=REPLACE_ME_6&sz=w1200" },
  { src: "https://drive.google.com/thumbnail?id=REPLACE_ME_7&sz=w1200" },
];

const About = () => {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("team_members")
        .select("*")
        .order("sort_order")
        .order("name");
      setTeam((data ?? []) as TeamMember[]);
      setLoading(false);
    };
    load();
  }, []);

  const [main, ...rest] = SEASON_1_MEMORIES;

  return (
    <main className="relative min-h-screen pb-20">
      <Navbar />
      <CornerDoodles />
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-32">
        <div className="text-center mb-12">
          <h1 className="text-white text-4xl md:text-5xl font-extrabold tracking-tight">About DPSAMUN</h1>
          <p className="text-white/70 mt-3 max-w-2xl mx-auto">
            A celebration of diplomacy, debate, and a journey shaped by every delegate, chair, and member of our Secretariat.
          </p>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-white" />
          </div>
        ) : (
          <div className="space-y-16">
            {/* Secretariat */}
            {team.length > 0 && (
              <div>
                <h2 className="text-white text-3xl md:text-4xl font-bold text-center mb-10">
                  Meet the Secretariat
                </h2>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                  {team.map((m) => (
                    <div key={m.id} className="glass-strong rounded-2xl p-6 flex flex-col items-center text-center hover:bg-white/10 transition">
                      <div className="h-32 w-32 rounded-full overflow-hidden ring-2 ring-white/30 bg-white/5 mb-4">
                        {m.photo_url ? (
                          <img
                            src={m.photo_url}
                            alt={m.name}
                            className="h-full w-full object-cover"
                            referrerPolicy="no-referrer"
                            loading="lazy"
                          />
                        ) : (
                          <div className="h-full w-full bg-white/10" />
                        )}
                      </div>
                      <h3 className="text-white text-lg font-bold">{m.name}</h3>
                      {m.role_title && (
                        <p className="text-emerald-300 text-sm font-medium mt-0.5">{m.role_title}</p>
                      )}
                      {m.bio && (
                        <p className="text-white/70 text-sm mt-3 leading-relaxed">{m.bio}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Season 1 Memories — static gallery */}
            <div>
              <div className="text-center mb-10">
                <h2 className="text-white text-3xl md:text-4xl font-bold">Season 1 Memories</h2>
                <p className="text-emerald-300/90 text-sm md:text-base mt-2 tracking-wide uppercase">
                  Moments from where it all began
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
                {/* Main feature spans 2x2 */}
                <figure className="col-span-2 row-span-2 md:col-span-2 md:row-span-2 glass-strong rounded-2xl overflow-hidden group ring-1 ring-emerald-400/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
                  <div className="relative aspect-square md:aspect-auto md:h-full">
                    <img
                      src={main.src}
                      alt={main.caption ?? "Main memory"}
                      className="h-full w-full object-cover group-hover:scale-105 transition duration-700"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                      <span className="text-emerald-300 text-[10px] tracking-[0.2em] uppercase">Main Memory</span>
                      {main.caption && (
                        <p className="text-white text-sm md:text-base font-medium mt-1">{main.caption}</p>
                      )}
                    </div>
                  </div>
                </figure>

                {rest.map((img, i) => (
                  <figure key={i} className="glass rounded-xl overflow-hidden group ring-1 ring-white/10">
                    <img
                      src={img.src}
                      alt={img.caption ?? `Season 1 memory ${i + 2}`}
                      className="aspect-square w-full object-cover group-hover:scale-110 transition duration-500"
                      loading="lazy"
                      referrerPolicy="no-referrer"
                    />
                  </figure>
                ))}
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
};

export default About;
