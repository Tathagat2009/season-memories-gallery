import Navbar from "@/components/Navbar";
import CornerDoodles from "@/components/CornerDoodles";

// Static "Season 1 Memories" gallery.
const SEASON_1_MEMORIES: { src: string; caption?: string; main?: boolean }[] = [
  { src: "https://i.ibb.co/5xvxKYrW/IMG-1305-1.jpg", caption: "Season 1 Highlight", main: true },
  { src: "https://i.ibb.co/SD9HGk3s/IMG-1087.jpg" },
  { src: "https://i.ibb.co/27p5hfJj/IMG-0618.jpg" },
  { src: "https://i.ibb.co/pvykhNCX/IMG-0594.jpg" },
  { src: "https://i.ibb.co/bjNRHVd7/IMG-0585.jpg" },
  { src: "https://i.ibb.co/T69Pjmh/IMG-0530.jpg" },
];

const About = () => {
  const [main, ...rest] = SEASON_1_MEMORIES;

  return (
    <main className="relative min-h-screen pb-20">
      <Navbar />
      <CornerDoodles />
      <section className="relative z-10 max-w-6xl mx-auto px-6 pt-32">
        <div className="text-center mb-12">
          <h1 className="text-white text-4xl md:text-5xl font-extrabold tracking-tight">About DPSAMUN</h1>
          <p className="text-white/70 mt-3 max-w-2xl mx-auto">
            A celebration of diplomacy, debate, and a journey shaped by every delegate, chair, and member of our community.
          </p>
        </div>

        {/* Season 1 Memories — static gallery */}
        <div>
          <div className="text-center mb-10">
            <h2 className="text-white text-3xl md:text-4xl font-bold">Season 1 Memories</h2>
            <p className="text-emerald-300/90 text-sm md:text-base mt-2 tracking-wide uppercase">
              Moments from where it all began
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 auto-rows-[180px] md:auto-rows-[220px]">
            {/* Main feature spans 2x2 */}
            <figure className="col-span-2 row-span-2 glass-strong rounded-2xl overflow-hidden group ring-1 ring-emerald-400/20 shadow-[0_0_40px_rgba(16,185,129,0.1)]">
              <div className="relative h-full w-full">
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
                  className="h-full w-full object-cover group-hover:scale-110 transition duration-500"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                />
              </figure>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
};

export default About;
