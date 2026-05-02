import { useEffect, useMemo, useState } from "react";
import { Loader2, Plus, Pencil, Trash2, Eye, EyeOff } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from "@/components/SearchableSelect";
import { Field, inputCls } from "../Field";

interface Allocation {
  id: string;
  registration_id: string | null;
  delegate_name: string | null;
  school: string | null;
  class_grade: string | null;
  committee_id: string | null;
  portfolio: string | null;
  status: string;
  published: boolean;
  notes: string | null;
}

interface RegRow {
  id: string;
  full_name: string;
  class_grade: string;
  email: string;
  address: string;
  committee_pref1: string;
}

const empty = {
  registration_id: "",
  delegate_name: "",
  school: "",
  class_grade: "",
  committee_id: "",
  portfolio: "",
  status: "draft",
  published: false,
  notes: "",
};

const AllocationsTab = () => {
  const [rows, setRows] = useState<Allocation[]>([]);
  const [registrations, setRegistrations] = useState<RegRow[]>([]);
  const [committees, setCommittees] = useState<{ id: string; name: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Allocation | null>(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    setLoading(true);
    const [a, r, c] = await Promise.all([
      supabase.from("allocations").select("*").order("created_at", { ascending: false }),
      supabase.from("registrations").select("id, full_name, class_grade, email, address, committee_pref1").order("full_name"),
      supabase.from("committees").select("id, name").order("name"),
    ]);
    if (a.error) toast.error(a.error.message);
    setRows((a.data ?? []) as Allocation[]);
    setRegistrations((r.data ?? []) as RegRow[]);
    setCommittees(c.data ?? []);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const startNew = () => { setEditing(null); setForm(empty); };
  const startEdit = (al: Allocation) => {
    setEditing(al);
    setForm({
      registration_id: al.registration_id ?? "",
      delegate_name: al.delegate_name ?? "",
      school: al.school ?? "",
      class_grade: al.class_grade ?? "",
      committee_id: al.committee_id ?? "",
      portfolio: al.portfolio ?? "",
      status: al.status,
      published: al.published,
      notes: al.notes ?? "",
    });
  };

  // Searchable dropdown of delegate names from registrations
  const delegateNames = useMemo(
    () => registrations.map((r) => r.full_name),
    [registrations]
  );

  // When delegate name is selected, auto-fill school/class from registrations
  const selectDelegate = (name: string) => {
    const reg = registrations.find((r) => r.full_name === name);
    if (reg) {
      setForm((f) => ({
        ...f,
        delegate_name: reg.full_name,
        registration_id: reg.id,
        class_grade: reg.class_grade ?? "",
        // 'school' not in registrations schema; default to address fragment if blank
        school: f.school || "DPS Amaravati",
      }));
    } else {
      setForm((f) => ({ ...f, delegate_name: name }));
    }
  };

  const save = async () => {
    const payload = {
      registration_id: form.registration_id || null,
      delegate_name: form.delegate_name.trim() || null,
      school: form.school.trim() || null,
      class_grade: form.class_grade.trim() || null,
      committee_id: form.committee_id || null,
      portfolio: form.portfolio.trim() || null,
      status: form.status,
      published: form.published,
      notes: form.notes.trim() || null,
    };
    if (!payload.delegate_name && !payload.registration_id) {
      return toast.error("Pick a delegate or enter a name");
    }
    const { error } = editing
      ? await supabase.from("allocations").update(payload).eq("id", editing.id)
      : await supabase.from("allocations").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Allocation updated" : "Allocation created");
    startNew(); load();
  };

  const togglePublish = async (a: Allocation) => {
    const { error } = await supabase
      .from("allocations")
      .update({ published: !a.published })
      .eq("id", a.id);
    if (error) return toast.error(error.message);
    toast.success(!a.published ? "Published" : "Unpublished");
    load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete allocation?")) return;
    const { error } = await supabase.from("allocations").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-white text-xl font-bold">Manage Allocations</h2>
          <p className="text-white/60 text-xs">
            Pick a delegate name to auto-fill their details, then assign a committee/country and toggle <span className="text-emerald-300">Publish</span> to show it on the public Allocations page.
          </p>
        </div>
        <Button onClick={startNew} variant="ghost" className="text-white hover:bg-white/10">
          <Plus className="h-4 w-4 mr-1" /> New
        </Button>
      </div>

      <div className="glass rounded-2xl p-4 grid md:grid-cols-2 gap-4">
        <div className="space-y-2 md:col-span-2">
          <label className="text-white text-sm font-medium">Delegate Name *</label>
          <SearchableSelect
            options={delegateNames}
            value={form.delegate_name}
            onChange={selectDelegate}
            placeholder="Search a registered delegate..."
            emptyText="No registrations found."
          />
          <p className="text-white/50 text-xs">Selecting a delegate auto-fills Class & School from their registration.</p>
        </div>

        <Field label="School">
          <Input value={form.school} onChange={(e) => setForm({ ...form, school: e.target.value })} className={inputCls} placeholder="DPS Amaravati" />
        </Field>
        <Field label="Class">
          <Input value={form.class_grade} onChange={(e) => setForm({ ...form, class_grade: e.target.value })} className={inputCls} placeholder="XI-A" />
        </Field>

        <Field label="Committee">
          <Select value={form.committee_id || "_none"} onValueChange={(v) => setForm({ ...form, committee_id: v === "_none" ? "" : v })}>
            <SelectTrigger className={inputCls}><SelectValue placeholder="Pick a committee" /></SelectTrigger>
            <SelectContent className="bg-emerald-950 text-white border-white/20 max-h-72">
              <SelectItem value="_none" className="focus:bg-white/10 focus:text-white">— None —</SelectItem>
              {committees.map((c) => (
                <SelectItem key={c.id} value={c.id} className="focus:bg-white/10 focus:text-white">{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </Field>
        <Field label="Country / Portfolio">
          <Input value={form.portfolio} onChange={(e) => setForm({ ...form, portfolio: e.target.value })} className={inputCls} placeholder="Brazil / BJP / ..." />
        </Field>

        <Field label="Status">
          <Select value={form.status} onValueChange={(v) => setForm({ ...form, status: v })}>
            <SelectTrigger className={inputCls}><SelectValue /></SelectTrigger>
            <SelectContent className="bg-emerald-950 text-white border-white/20">
              <SelectItem value="draft" className="focus:bg-white/10 focus:text-white">Draft</SelectItem>
              <SelectItem value="confirmed" className="focus:bg-white/10 focus:text-white">Confirmed</SelectItem>
              <SelectItem value="waitlist" className="focus:bg-white/10 focus:text-white">Waitlist</SelectItem>
            </SelectContent>
          </Select>
        </Field>

        <div className="flex items-center gap-3 pt-7">
          <Switch checked={form.published} onCheckedChange={(v) => setForm({ ...form, published: v })} />
          <span className="text-white text-sm">Publish to public /allocations page</span>
        </div>

        <Field label="Notes" className="md:col-span-2">
          <Input value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} className={inputCls} />
        </Field>

        <div className="md:col-span-2 flex gap-2">
          <Button onClick={save} className="glass-strong text-white border border-white/20 hover:bg-white/20">
            {editing ? "Update Allocation" : "Create Allocation"}
          </Button>
          {editing && (
            <Button onClick={startNew} variant="ghost" className="text-white/70 hover:bg-white/10">Cancel</Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-white" /></div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm text-white">
            <thead className="bg-white/5 text-white/70 text-xs uppercase">
              <tr>
                <th className="px-3 py-2 text-left">Delegate</th>
                <th className="px-3 py-2 text-left">School / Class</th>
                <th className="px-3 py-2 text-left">Committee</th>
                <th className="px-3 py-2 text-left">Country</th>
                <th className="px-3 py-2 text-left">Status</th>
                <th className="px-3 py-2 text-left">Public</th>
                <th className="px-3 py-2"></th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr><td colSpan={7} className="px-3 py-6 text-center text-white/50">No allocations yet.</td></tr>
              ) : rows.map((a) => {
                const com = committees.find((c) => c.id === a.committee_id);
                return (
                  <tr key={a.id} className="border-t border-white/10 hover:bg-white/5">
                    <td className="px-3 py-2">{a.delegate_name ?? "—"}</td>
                    <td className="px-3 py-2 text-white/70">{[a.school, a.class_grade].filter(Boolean).join(" · ") || "—"}</td>
                    <td className="px-3 py-2">{com?.name ?? "—"}</td>
                    <td className="px-3 py-2">{a.portfolio ?? "—"}</td>
                    <td className="px-3 py-2 capitalize">{a.status}</td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        onClick={() => togglePublish(a)}
                        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-semibold ${
                          a.published
                            ? "bg-emerald-500/20 text-emerald-200"
                            : "bg-white/10 text-white/60"
                        }`}
                      >
                        {a.published ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
                        {a.published ? "Published" : "Hidden"}
                      </button>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <Button size="icon" variant="ghost" onClick={() => startEdit(a)} className="text-white hover:bg-white/10">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button size="icon" variant="ghost" onClick={() => remove(a.id)} className="text-red-300 hover:bg-red-500/10">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AllocationsTab;
