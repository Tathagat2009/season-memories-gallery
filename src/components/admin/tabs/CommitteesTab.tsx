import { useEffect, useState } from "react";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Field, inputCls } from "../Field";

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
  short_code: string | null;
  agenda: string | null;
  image_url: string | null;
  category: Category;
  registration_open: boolean;
  sort_order: number;
  background_guide: string | null;
}

const empty: Omit<Committee, "id"> = {
  name: "",
  short_code: "",
  agenda: "",
  image_url: "",
  category: "country",
  registration_open: true,
  sort_order: 0,
  background_guide: "",
};

const categoryLabel: Record<Category, string> = {
  country: "Country (UN list)",
  party: "Political Party (Indian)",
  actor: "Personality (Indian Film)",
  none: "No preference (e.g. JCC)",
  lok_sabha_party: "Lok Sabha Party (currently seated)",
  t20_board: "International T20 Cricket Board",
  cricket_team_or_board: "Cricket Premier-League Team or International Board",
  cricket_league_team: "Cricket Premier-League Team (worldwide)",
  cricket_league: "Cricket League Name",
};

const CommitteesTab = () => {
  const [rows, setRows] = useState<Committee[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Committee | null>(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("committees")
      .select("*")
      .order("sort_order")
      .order("name");
    if (error) toast.error(error.message);
    else setRows((data ?? []) as Committee[]);
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const startNew = () => { setEditing(null); setForm(empty); };
  const startEdit = (c: Committee) => {
    setEditing(c);
    setForm({
      name: c.name,
      short_code: c.short_code ?? "",
      agenda: c.agenda ?? "",
      image_url: c.image_url ?? "",
      category: c.category ?? "country",
      registration_open: c.registration_open ?? true,
      sort_order: c.sort_order,
      background_guide: c.background_guide ?? "",
    });
  };

  const save = async () => {
    if (!form.name.trim()) return toast.error("Name is required");
    const payload = {
      name: form.name.trim(),
      short_code: form.short_code?.trim() || null,
      agenda: form.agenda?.trim() || null,
      image_url: form.image_url?.trim() || null,
      category: form.category,
      registration_open: form.registration_open,
      sort_order: form.sort_order || 0,
      background_guide: form.background_guide?.trim() || null,
    };
    if (editing) {
      const { error } = await supabase.from("committees").update(payload).eq("id", editing.id);
      if (error) return toast.error(error.message);
      toast.success("Committee updated");
    } else {
      const { error } = await supabase.from("committees").insert(payload);
      if (error) return toast.error(error.message);
      toast.success("Committee created");
    }
    startNew(); load();
  };

  const toggleRegistration = async (c: Committee, value: boolean) => {
    // optimistic
    setRows((prev) => prev.map((r) => r.id === c.id ? { ...r, registration_open: value } : r));
    const { error } = await supabase.from("committees").update({ registration_open: value }).eq("id", c.id);
    if (error) {
      toast.error(error.message);
      setRows((prev) => prev.map((r) => r.id === c.id ? { ...r, registration_open: !value } : r));
    } else {
      toast.success(value ? "Registration enabled" : "Registration disabled");
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this committee?")) return;
    const { error } = await supabase.from("committees").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <h2 className="text-white text-xl font-bold">Manage Committees</h2>
        <Button onClick={startNew} variant="ghost" className="text-white hover:bg-white/10">
          <Plus className="h-4 w-4 mr-1" /> New
        </Button>
      </div>

      <div className="glass rounded-2xl p-4 grid md:grid-cols-2 gap-4">
        <Field label="Name *">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} placeholder="e.g. UNHRC" />
        </Field>
        <Field label="Short Code">
          <Input value={form.short_code ?? ""} onChange={(e) => setForm({ ...form, short_code: e.target.value })} className={inputCls} placeholder="e.g. UNHRC" />
        </Field>
        <Field label="Preference Category *">
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v as Category })}>
            <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
            <SelectContent className="bg-emerald-950 text-white border-white/20">
              {(Object.keys(categoryLabel) as Category[]).map((k) => (
                <SelectItem key={k} value={k} className="focus:bg-white/10 focus:text-white">{categoryLabel[k]}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Sort Order">
          <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className={inputCls} />
        </Field>
        <Field label="Image URL (ImgBB)" className="md:col-span-2">
          <Input value={form.image_url ?? ""} onChange={(e) => setForm({ ...form, image_url: e.target.value })} className={inputCls} placeholder="https://i.ibb.co/..." />
        </Field>
        <Field label="Agenda" className="md:col-span-2">
          <Textarea value={form.agenda ?? ""} onChange={(e) => setForm({ ...form, agenda: e.target.value })} rows={3} className={inputCls} />
        </Field>
        <Field label="Background Guide (PDF/Doc URL or text e.g. 'Coming Soon')" className="md:col-span-2">
          <Input
            value={form.background_guide ?? ""}
            onChange={(e) => setForm({ ...form, background_guide: e.target.value })}
            className={inputCls}
            placeholder="https://drive.google.com/...  —  or  —  Coming Soon"
          />
        </Field>
        <div className="md:col-span-2 flex items-center gap-3 glass rounded-xl px-3 py-2">
          <Switch checked={form.registration_open} onCheckedChange={(v) => setForm({ ...form, registration_open: v })} />
          <span className="text-white text-sm">Open for registration (visible in form dropdown)</span>
        </div>
        <div className="flex items-end gap-2 md:col-span-2">
          <Button onClick={save} className="glass-strong text-white border border-white/20 hover:bg-white/20">
            {editing ? "Update Committee" : "Create Committee"}
          </Button>
          {editing && (
            <Button onClick={startNew} variant="ghost" className="text-white/70 hover:bg-white/10">
              Cancel edit
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="h-6 w-6 animate-spin text-white" />
        </div>
      ) : (
        <div className="space-y-2">
          {rows.length === 0 ? (
            <p className="text-white/60 text-sm">No committees yet.</p>
          ) : rows.map((c) => (
            <div key={c.id} className="glass rounded-xl p-3 flex items-center gap-3">
              {c.image_url ? (
                <img src={c.image_url} alt="" className="h-12 w-12 rounded-lg object-cover" />
              ) : (
                <div className="h-12 w-12 rounded-lg bg-white/10" />
              )}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-white font-semibold truncate">{c.name}</p>
                  <span className="text-[10px] uppercase tracking-wider text-white/50 border border-white/20 rounded px-1.5 py-0.5">
                    {c.category ?? "country"}
                  </span>
                  {!c.registration_open && (
                    <span className="text-[10px] uppercase tracking-wider text-red-300 border border-red-300/40 rounded px-1.5 py-0.5">
                      closed
                    </span>
                  )}
                </div>
                <p className="text-white/60 text-xs truncate">{c.agenda ?? "No agenda"}</p>
              </div>
              <div className="flex items-center gap-2 mr-1">
                <Switch
                  checked={c.registration_open}
                  onCheckedChange={(v) => toggleRegistration(c, v)}
                  aria-label="Toggle registration"
                />
              </div>
              <Button size="icon" variant="ghost" onClick={() => startEdit(c)} className="text-white hover:bg-white/10">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => remove(c.id)} className="text-red-300 hover:bg-red-500/10">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default CommitteesTab;
