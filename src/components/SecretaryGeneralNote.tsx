import secgenSignature from "@/assets/secgen-signature.jpeg";
import secgenPhoto from "@/assets/secgen-photo.jpeg";

const SecretaryGeneralNote = () => {
  return (
    <section className="relative z-10 max-w-6xl mx-auto px-6 py-16 md:py-20">
      <article className="relative rounded-3xl overflow-hidden bg-[linear-gradient(180deg,#fdfcf7_0%,#f7f3e7_100%)] text-emerald-950 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.5)] ring-1 ring-emerald-900/10">
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.06]"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 10%, #064e3b 0, transparent 40%), radial-gradient(circle at 80% 90%, #064e3b 0, transparent 40%)",
          }}
        />
        <div className="relative p-8 md:p-12 lg:p-16">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-px flex-1 bg-emerald-900/20" />
            <span className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-emerald-900/70 font-semibold">
              Secretariat Address
            </span>
            <div className="h-px flex-1 bg-emerald-900/20" />
          </div>
          <h2 className="text-center font-serif text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight">
            A Note from the Secretary‑General
          </h2>
          <p className="text-center text-emerald-900/60 italic mt-2 text-sm md:text-base">
            DPSAMUN Season 2
          </p>

          <div className="mt-10 grid lg:grid-cols-[260px_1fr] gap-10 lg:gap-14 items-start max-w-5xl mx-auto">
            {/* Photo */}
            <div className="mx-auto lg:mx-0 w-full max-w-[260px]">
              <div className="relative rounded-2xl overflow-hidden ring-1 ring-emerald-900/20 shadow-[0_20px_50px_-20px_rgba(0,0,0,0.4)]">
                <img
                  src={secgenPhoto}
                  alt="K. Tathagat Banerjee, Secretary-General"
                  className="w-full h-auto object-cover"
                  loading="lazy"
                  decoding="async"
                />
              </div>
              <p className="mt-4 text-center font-serif text-lg font-bold text-emerald-950">
                K. Tathagat Banerjee
              </p>
              <p className="text-center text-[10px] uppercase tracking-[0.3em] text-emerald-900/70 font-semibold mt-1">
                Secretary‑General
              </p>
            </div>

            {/* Letter */}
            <div className="font-serif text-[15px] md:text-[17px] leading-[1.9] text-emerald-950/90 space-y-5">
              <p className="text-lg md:text-xl font-semibold text-emerald-950">
                Delegates and Future Leaders,
              </p>
              <p>
                <span className="float-left font-serif text-6xl md:text-7xl leading-[0.8] mr-2 mt-1 text-emerald-900">
                  I
                </span>
                t is a distinct honor to welcome you to the second season of DPSAMUN.
                This conference represents a commitment to diplomatic excellence,
                hosted within the premier academic environment of Delhi Public School,
                Amaravati. We have meticulously curated every aspect of this experience
                to ensure it surpasses all expectations, offering an unparalleled platform
                for intellectual growth and high‑level negotiation.
              </p>
              <p>
                At DPSAMUN, we recognize that Model United Nations is a critical catalyst
                for developing leadership, public speaking, and global empathy. To facilitate
                this, we provide a sophisticated ecosystem featuring a distinguished Executive
                Board, seamless transportation logistics, and superior hospitality, all
                supported by the world‑class infrastructure of our campus. This synergy of
                academic rigor and professional facilities ensures that every delegate can
                focus entirely on the art of debate. We invite you to join us for an
                extraordinary session where your ideas take center stage and your potential
                is realized.
              </p>
              <p className="italic text-emerald-900">
                The floor is yours. We look forward to your presence at the podium.
              </p>

              <div className="pt-4">
                <p className="font-serif text-emerald-950/90">Warm regards,</p>
                <img
                  src={secgenSignature}
                  alt="Signature of K. Tathagat Banerjee"
                  className="h-20 md:h-24 object-contain -ml-2 mt-1"
                  style={{ mixBlendMode: "multiply" }}
                  loading="lazy"
                  decoding="async"
                />
                <div className="mt-1">
                  <p className="font-serif text-lg md:text-xl font-bold text-emerald-950">
                    K. Tathagat Banerjee
                  </p>
                  <p className="text-[11px] md:text-xs uppercase tracking-[0.3em] text-emerald-900/70 font-semibold mt-1">
                    Secretary‑General
                  </p>
                  <p className="text-sm text-emerald-900/70 italic mt-0.5">
                    DPSAMUN Season 2
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </article>
    </section>
  );
};

export default SecretaryGeneralNote;
