import { useEffect, useMemo, useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Upload, QrCode, Loader2 } from "lucide-react";
import Navbar from "@/components/Navbar";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SearchableSelect } from "@/components/SearchableSelect";
import {
  INDIAN_ACTORS,
  INDIAN_POLITICAL_PARTIES,
  UN_COUNTRIES,
  LOK_SABHA_PARTIES,
  T20_CRICKET_BOARDS,
  CRICKET_TEAMS_AND_BOARDS,
  CRICKET_LEAGUE_TEAMS,
  CRICKET_LEAGUES,
} from "@/data/committeeOptions";

type Category =
  | "country"
  | "party"
  | "actor"
  | "none"
  | "lok_sabha_party"
  | "t20_board"
  | "cricket_team_or_board"
  | "cricket_league_team"
  | "cricket_league";

interface Committee {
  id: string;
  name: string;
  category: Category;
  registration_open: boolean;
}

const schema = z.object({
  name: z.string().trim().min(2, "Name is required").max(100),
  className: z.string().trim().min(1, "Class is required").max(50),
  email: z.string().trim().email("Invalid email").max(255),
  mobile: z.string().trim().regex(/^[0-9+\-\s]{7,15}$/, "Invalid mobile number"),
  address: z.string().trim().min(5, "Address is required").max(500),
  experience: z.string().trim().min(1, "Please share your experience").max(1000),
  committee1: z.string().min(1, "Select committee preference 1"),
  committee2: z.string().optional(),
});

const optionsForCategory = (cat: Category) => {
  if (cat === "country") return { options: UN_COUNTRIES, placeholder: "Search UN member country...", label: "Country" };
  if (cat === "party") return { options: INDIAN_POLITICAL_PARTIES, placeholder: "Search Indian political party...", label: "Political Party" };
  if (cat === "actor") return { options: INDIAN_ACTORS, placeholder: "Search Indian actor / actress...", label: "Personality" };
  if (cat === "lok_sabha_party") return { options: LOK_SABHA_PARTIES, placeholder: "Search a party currently seated in Lok Sabha...", label: "Lok Sabha Party" };
  if (cat === "t20_board") return { options: T20_CRICKET_BOARDS, placeholder: "Search an international T20 cricket board...", label: "T20 Cricket Board" };
  if (cat === "cricket_team_or_board") return { options: CRICKET_TEAMS_AND_BOARDS, placeholder: "Search a premier-league team or international board...", label: "Cricket Team / Board" };
  if (cat === "cricket_league_team") return { options: CRICKET_LEAGUE_TEAMS, placeholder: "Search a premier-league cricket team...", label: "Cricket Premier-League Team" };
  if (cat === "cricket_league") return { options: CRICKET_LEAGUES, placeholder: "Search a cricket league...", label: "Cricket League" };
  return null;
};

const Register = () => {
  const [committees, setCommittees] = useState<Committee[]>([]);
  const [registrationOpenSite, setRegistrationOpenSite] = useState(true);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const [form, setForm] = useState({
    name: "", className: "", email: "", mobile: "", address: "", experience: "",
    committee1: "", committee2: "",
    preference1: "", preference2: "",
  });
  const [receipt, setReceipt] = useState<File | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const load = async () => {
      setLoadingMeta(true);
      const [cRes, sRes] = await Promise.all([
        supabase.from("committees")
          .select("id, name, category, registration_open")
          .eq("registration_open", true)
          .order("sort_order").order("name"),
        supabase.from("site_settings").select("registration_open").eq("id", 1).maybeSingle(),
      ]);
      setCommittees((cRes.data ?? []) as Committee[]);
      setRegistrationOpenSite(sRes.data?.registration_open ?? true);
      setLoadingMeta(false);
    };
    load();
  }, []);

  const committee1Meta = useMemo(
    () => committees.find((c) => c.name === form.committee1) ?? null,
    [committees, form.committee1]
  );
  const committee2Meta = useMemo(
    () => committees.find((c) => c.name === form.committee2) ?? null,
    [committees, form.committee2]
  );

  const update = (key: keyof typeof form) =>
    (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setForm((f) => ({ ...f, [key]: e.target.value }));

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] ?? null;
    if (file && file.size > 5 * 1024 * 1024) {
      toast.error("Receipt must be under 5MB"); return;
    }
    setReceipt(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = schema.safeParse(form);
    if (!parsed.success) { toast.error(parsed.error.issues[0].message); return; }
    if (form.committee2 && form.committee2 === form.committee1) {
      toast.error("Committee preference 2 must differ from preference 1"); return;
    }
    if (committee1Meta && committee1Meta.category !== "none" && !form.preference1) {
      const opt = optionsForCategory(committee1Meta.category);
      toast.error(`Please select ${opt?.label ?? "a"} preference 1`); return;
    }
    if (committee2Meta && committee2Meta.category !== "none" && !form.preference2) {
      const opt = optionsForCategory(committee2Meta.category);
      toast.error(`Please select ${opt?.label ?? "a"} preference 2`); return;
    }
    if (!receipt) { toast.error("Payment receipt is required"); return; }

    setSubmitting(true);
    try {
      const safeName = receipt.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      const path = `${Date.now()}-${crypto.randomUUID()}-${safeName}`;
      const { error: upErr } = await supabase.storage
        .from("receipts")
        .upload(path, receipt, { contentType: receipt.type, upsert: false });
      if (upErr) throw upErr;

      const { error: insErr } = await supabase.from("registrations").insert({
        full_name: parsed.data.name,
        class_grade: parsed.data.className,
        email: parsed.data.email,
        mobile: parsed.data.mobile,
        address: parsed.data.address,
        mun_experience: parsed.data.experience,
        committee_pref1: parsed.data.committee1,
        committee_pref2: form.committee2 || null,
        preference1: form.preference1 || null,
        preference2: form.preference2 || null,
        receipt_path: path,
      });
      if (insErr) throw insErr;

      toast.success("Registration submitted! We'll be in touch.");
      setForm({
        name: "", className: "", email: "", mobile: "", address: "",
        experience: "", committee1: "", committee2: "",
        preference1: "", preference2: "",
      });
      setReceipt(null);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Submission failed");
    } finally {
      setSubmitting(false);
    }
  };

  const renderPrefField = (
    slot: 1 | 2,
    meta: Committee | null,
  ) => {
    if (!meta) return null;
    if (meta.category === "none") {
      return (
        <p className="text-white/70 text-sm italic glass rounded-xl p-4">
          {meta.name} allocations are handled separately by the Executive Board. No preference needed.
        </p>
      );
    }
    const cfg = optionsForCategory(meta.category);
    if (!cfg) return null;
    const key = slot === 1 ? "preference1" : "preference2";
    return (
      <div className="space-y-2">
        <Label className="text-white">{cfg.label} Preference {slot} *</Label>
        <SearchableSelect
          options={cfg.options}
          value={form[key]}
          onChange={(v) => setForm((f) => ({ ...f, [key]: v }))}
          placeholder={cfg.placeholder}
        />
      </div>
    );
  };

  const committeeOptionNames = useMemo(() => committees.map((c) => c.name), [committees]);
  const committee2Options = useMemo(
    () => committees.filter((c) => c.name !== form.committee1).map((c) => c.name),
    [committees, form.committee1]
  );

  if (loadingMeta) {
    return (
      <main className="relative min-h-screen">
        <Navbar />
        <div className="flex items-center justify-center pt-40">
          <Loader2 className="h-6 w-6 animate-spin text-white" />
        </div>
      </main>
    );
  }

  if (!registrationOpenSite) {
    return (
      <main className="relative min-h-screen">
        <Navbar />
        <section className="max-w-2xl mx-auto px-6 pt-40 text-center">
          <div className="glass-strong rounded-3xl p-10">
            <h1 className="text-white text-3xl font-bold mb-3">Registrations Closed</h1>
            <p className="text-white/70">Please check back soon. Follow our updates for the next opening window.</p>
          </div>
        </section>
      </main>
    );
  }

  return (
    <main className="relative min-h-screen pb-20">
      <Navbar />

      <section className="relative z-10 max-w-3xl mx-auto px-6 pt-32">
        <div className="text-center mb-10">
          <h1 className="text-white text-4xl md:text-5xl font-extrabold tracking-tight">
            Register for DPSAMUN
          </h1>
          <p className="text-white/70 mt-3">
            Complete your registration and reserve your seat at the table.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="glass-strong rounded-3xl p-7 md:p-10 space-y-6">
          <div className="grid md:grid-cols-2 gap-5">
            <Field label="Full Name *">
              <Input value={form.name} onChange={update("name")} className={inputCls} placeholder="Jane Doe" />
            </Field>
            <Field label="Class *">
              <Input value={form.className} onChange={update("className")} className={inputCls} placeholder="e.g. XI-A" />
            </Field>
            <Field label="Email *">
              <Input type="email" value={form.email} onChange={update("email")} className={inputCls} placeholder="you@email.com" />
            </Field>
            <Field label="Mobile *">
              <Input value={form.mobile} onChange={update("mobile")} className={inputCls} placeholder="+91 ..." />
            </Field>
          </div>

          <Field label="Address *">
            <Textarea value={form.address} onChange={update("address")} className={inputCls} rows={2} placeholder="Street, city, pincode" />
          </Field>

          <Field label="MUN Experience *">
            <Textarea
              value={form.experience}
              onChange={update("experience")}
              className={inputCls}
              rows={3}
              placeholder="Past conferences, committees, awards (or 'First MUN')"
            />
          </Field>

          {/* Committee preferences */}
          <div className="grid md:grid-cols-2 gap-5">
            <div className="space-y-2">
              <Label className="text-white">Committee Preference 1 *</Label>
              <SearchableSelect
                options={committeeOptionNames}
                value={form.committee1}
                onChange={(v) =>
                  setForm((f) => ({
                    ...f,
                    committee1: v,
                    preference1: "",
                    // if pref2 same as new pref1, clear it
                    committee2: f.committee2 === v ? "" : f.committee2,
                    preference2: f.committee2 === v ? "" : f.preference2,
                  }))
                }
                placeholder="Search committees..."
                emptyText="No committees open for registration."
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white">Committee Preference 2</Label>
              <SearchableSelect
                options={committee2Options}
                value={form.committee2}
                onChange={(v) => setForm((f) => ({ ...f, committee2: v, preference2: "" }))}
                placeholder={form.committee1 ? "Search committees..." : "Pick preference 1 first"}
                emptyText="No other committees available."
              />
            </div>
          </div>

          {/* Per-committee preference dropdowns */}
          <div className="grid md:grid-cols-2 gap-5">
            {renderPrefField(1, committee1Meta)}
            {renderPrefField(2, committee2Meta)}
          </div>

          {/* Payment */}
          <div className="pt-4 border-t border-white/10 space-y-5">
            <h2 className="text-white text-xl font-bold">Payment</h2>

            <div className="flex flex-col md:flex-row gap-6 items-center">
              <div className="glass rounded-2xl p-5 flex flex-col items-center gap-3">
                <div className="h-44 w-44 rounded-xl bg-white/95 flex items-center justify-center text-emerald-950">
                  <div className="text-center">
                    <QrCode className="h-20 w-20 mx-auto" strokeWidth={1.2} />
                    <p className="text-xs font-semibold mt-2">UPI QR PLACEHOLDER</p>
                  </div>
                </div>
                <p className="text-white/80 text-sm text-center">Scan to pay via any UPI app</p>
              </div>

              <div className="flex-1 space-y-3 text-white/80 text-sm">
                <p><span className="text-white font-semibold">Amount:</span> ₹ 1,500</p>
                <p>After payment, upload the receipt screenshot below.</p>
              </div>
            </div>

            <Field label="Payment Receipt * (image / PDF, max 5MB)">
              <label className="glass rounded-xl border-dashed border-2 border-white/20 px-4 py-5 flex items-center gap-3 cursor-pointer hover:bg-white/10 transition">
                <Upload className="h-5 w-5 text-white" />
                <span className="text-white/80 text-sm flex-1 truncate">
                  {receipt ? receipt.name : "Click to upload receipt"}
                </span>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  className="hidden"
                  onChange={onFile}
                />
              </label>
            </Field>
          </div>

          <Button
            type="submit"
            disabled={submitting}
            className="w-full glass-strong rounded-full py-6 text-white font-semibold text-base hover:bg-white/20 border border-white/20"
          >
            {submitting ? "Submitting..." : "Submit Registration"}
          </Button>
        </form>
      </section>
    </main>
  );
};

const inputCls =
  "glass border-white/20 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-white/40";

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <div className="space-y-2">
    <Label className="text-white">{label}</Label>
    {children}
  </div>
);

export default Register;
