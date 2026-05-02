import { useEffect, useState } from "react";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Field, inputCls } from "../Field";

interface Notice {
  id: string;
  title: string;
  body: string | null;
  active: boolean;
  starts_at: string | null;
  ends_at: string | null;
  attachment_url: string | null;
}

const toLocal = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(0, 16) : "");

const empty = { title: "", body: "", active: true, starts_at: "", ends_at: "", attachment_url: "" };

const NoticesTab = () => {
  const [rows, setRows] = useState<Notice[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Notice | null>(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("notices").select("*").order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setRows((data ?? []) as Notice[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const startNew = () => { setEditing(null); setForm(empty); };
  const startEdit = (n: Notice) => {
    setEditing(n);
    setForm({
      title: n.title, body: n.body ?? "", active: n.active,
      starts_at: toLocal(n.starts_at), ends_at: toLocal(n.ends_at),
      attachment_url: n.attachment_url ?? "",
    });
  };

  const save = async () => {
    if (!form.title.trim()) return toast.error("Title is required");
    const payload = {
      title: form.title.trim(),
      body: form.body.trim() || null,
      active: form.active,
      starts_at: form.starts_at ? new Date(form.starts_at).toISOString() : null,
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
      attachment_url: form.attachment_url.trim() || null,
    };
    const { error } = editing
      ? await supabase.from("notices").update(payload).eq("id", editing.id)
      : await supabase.from("notices").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Notice updated" : "Notice created");
    startNew(); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this notice?")) return;
    const { error } = await supabase.from("notices").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h2 className="text-white text-xl font-bold">Manage Notices</h2>
          <p className="text-white/60 text-xs">Active notices appear as a pop-up on the public site.</p>
        </div>
        <Button onClick={startNew} variant="ghost" className="text-white hover:bg-white/10">
          <Plus className="h-4 w-4 mr-1" /> New
        </Button>
      </div>

      <div className="glass rounded-2xl p-4 grid md:grid-cols-2 gap-4">
        <Field label="Title *" className="md:col-span-2">
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Attachment URL (PDF/Doc link, optional)" className="md:col-span-2">
          <Input
            value={form.attachment_url}
            onChange={(e) => setForm({ ...form, attachment_url: e.target.value })}
            className={inputCls}
            placeholder="https://drive.google.com/..."
          />
        </Field>
        <Field label="Body" className="md:col-span-2">
          <Textarea value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} rows={3} className={inputCls} />
        </Field>
        <Field label="Starts at (optional)">
          <Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Ends at (optional)">
          <Input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} className={inputCls} />
        </Field>
        <div className="flex items-center gap-3 md:col-span-2">
          <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
          <span className="text-white text-sm">Active (visible publicly)</span>
        </div>
        <div className="md:col-span-2 flex gap-2">
          <Button onClick={save} className="glass-strong text-white border border-white/20 hover:bg-white/20">
            {editing ? "Update Notice" : "Create Notice"}
          </Button>
          {editing && <Button onClick={startNew} variant="ghost" className="text-white/70 hover:bg-white/10">Cancel</Button>}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-white" /></div>
      ) : (
        <div className="space-y-2">
          {rows.length === 0 ? (
            <p className="text-white/60 text-sm">No notices yet.</p>
          ) : rows.map((n) => (
            <div key={n.id} className="glass rounded-xl p-3 flex items-center gap-3">
              <div className={`h-2.5 w-2.5 rounded-full ${n.active ? "bg-emerald-300" : "bg-white/30"}`} />
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{n.title}</p>
                <p className="text-white/60 text-xs truncate">{n.body ?? ""}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => startEdit(n)} className="text-white hover:bg-white/10">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => remove(n.id)} className="text-red-300 hover:bg-red-500/10">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default NoticesTab;
