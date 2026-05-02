import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import munLogo from "@/assets/mun-logo.jpeg";
import heroFlags from "@/assets/hero-flags.jpeg";
import { supabase } from "@/integrations/supabase/client";

interface SiteSettings {
  countdown_target: string | null;
  countdown_active: boolean;
  registration_open: boolean;
  hero_bg_url: string | null;
}

const calcRemaining = (target: string) => {
  const diff = new Date(target).getTime() - Date.now();
  if (diff <= 0) return null;
  const days = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const minutes = Math.floor((diff % 3600000) / 60000);
  const seconds = Math.floor((diff % 60000) / 1000);
  return { days, hours, minutes, seconds };
};

const Hero = () => {
  const [settings, setSettings] = useState<SiteSettings | null>(null);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const { data } = await supabase
        .from("site_settings")
        .select("countdown_target, countdown_active, registration_open, hero_bg_url")
        .eq("id", 1)
        .maybeSingle();
      if (!cancelled) setSettings(data as SiteSettings | null);
    };
    load();

    // Refresh settings when the tab regains focus instead of holding a
    // realtime websocket open for every visitor. This keeps countdown /
    // registration-open status reasonably fresh without 1 socket per user.
    const onFocus = () => load();
    window.addEventListener("focus", onFocus);

    return () => {
      cancelled = true;
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  // Only run the per-second ticker while there's an active countdown.
  // Otherwise we'd re-render the hero 60 times/min for every visitor.
  const countdownLive =
    !!settings?.countdown_active && !!settings?.countdown_target;
  useEffect(() => {
    if (!countdownLive) return;
    const i = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(i);
  }, [countdownLive]);

  const remaining =
    settings?.countdown_active && settings?.countdown_target
      ? calcRemaining(settings.countdown_target)
      : null;
  // include tick in calc
  void tick;

  const regOpen = settings?.registration_open ?? true;

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center px-6 pt-32 pb-20 text-center overflow-hidden">
      {/* Hero watermark: faded flags image with multiply blend */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: `url(${heroFlags})`,
          opacity: 0.35,
          mixBlendMode: "multiply",
        }}
      />
      {/* Soft dark overlay to keep white text legible */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
        style={{ background: "linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.35))" }}
      />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 h-[600px] w-[600px] rounded-full bg-emerald-400/10 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-10">
          <div className="absolute -inset-4 rounded-full bg-white/5 blur-2xl" />
          <div className="relative h-56 w-56 md:h-72 md:w-72 rounded-full glass-strong p-3 ring-4 ring-white/20 shadow-[0_0_60px_rgba(255,255,255,0.15)]">
            <div className="h-full w-full rounded-full overflow-hidden bg-white">
              <img src={munLogo} alt="DPS AMUN MUN logo" className="h-full w-full object-cover" loading="eager" decoding="async" fetchPriority="high" />
            </div>
          </div>
        </div>

        <h1 className="text-white font-extrabold tracking-tight text-5xl md:text-7xl drop-shadow-lg">
          DPSAMUN SEASON 2
        </h1>
        <p className="mt-6 max-w-2xl text-white text-lg md:text-2xl italic font-light">
          "From delegates to diplomats, the journey begins here."
        </p>

        {/* Date & Venue announcer */}
        <div className="mt-8 w-full max-w-2xl">
          <div className="glass-strong rounded-2xl px-5 py-4 md:px-7 md:py-5 flex flex-col md:flex-row items-stretch md:items-center gap-4 md:gap-6 text-left ring-1 ring-white/15">
            <div className="flex items-center gap-3 md:pr-6 md:border-r md:border-white/15">
              <div className="h-11 w-11 rounded-xl glass flex items-center justify-center shrink-0">
                <svg className="h-5 w-5 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/></svg>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-200/80 font-semibold">Save the Date</p>
                <p className="text-white text-base md:text-lg font-bold leading-tight">21<sup>st</sup>, 22<sup>nd</sup> & 23<sup>rd</sup> June 2026</p>
              </div>
            </div>
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="h-11 w-11 rounded-xl glass flex items-center justify-center shrink-0">
                <svg className="h-5 w-5 text-emerald-300" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 1 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] uppercase tracking-[0.18em] text-emerald-200/80 font-semibold">Venue</p>
                <p className="text-white text-sm md:text-base font-semibold leading-tight">Delhi Public School, Amaravati, Guntur</p>
              </div>
            </div>
          </div>
        </div>

        {remaining && (
          <div className="mt-10 grid grid-cols-4 gap-3 md:gap-5">
            {[
              { label: "Days", value: remaining.days },
              { label: "Hours", value: remaining.hours },
              { label: "Minutes", value: remaining.minutes },
              { label: "Seconds", value: remaining.seconds },
            ].map((u) => (
              <div key={u.label} className="glass-strong rounded-2xl px-4 py-3 md:px-6 md:py-4 min-w-[72px] md:min-w-[96px]">
                <div className="text-white text-2xl md:text-4xl font-bold tabular-nums">
                  {String(u.value).padStart(2, "0")}
                </div>
                <div className="text-white/70 text-[10px] md:text-xs uppercase tracking-wider mt-1">{u.label}</div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {regOpen ? (
            <Link to="/register" className="glass-strong rounded-full px-8 py-3 text-white font-semibold hover:bg-white/20 transition">
              Register Now
            </Link>
          ) : (
            <span className="glass-strong rounded-full px-8 py-3 text-white/70 font-semibold cursor-not-allowed">
              Registration Closed
            </span>
          )}
          <a href="#about" className="rounded-full px-8 py-3 text-white font-semibold border border-white/30 hover:bg-white/10 transition">
            Learn More
          </a>
        </div>
      </div>
    </section>
  );
};

export default Hero;
