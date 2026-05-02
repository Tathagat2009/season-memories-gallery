import { useEffect, useState } from "react";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, inputCls } from "../Field";

interface ScheduleEvent {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  location: string | null;
  sort_order: number;
}

const toLocal = (iso: string | null) =>
  iso ? new Date(iso).toISOString().slice(0, 16) : "";

const empty = {
  title: "",
  description: "",
  starts_at: "",
  ends_at: "",
  location: "",
  sort_order: 0,
};

const ScheduleTab = () => {
  const [rows, setRows] = useState<ScheduleEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<ScheduleEvent | null>(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("schedule_events")
      .select("*")
      .order("starts_at");
    if (error) toast.error(error.message);
    else setRows((data ?? []) as ScheduleEvent[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const startNew = () => { setEditing(null); setForm(empty); };
  const startEdit = (e: ScheduleEvent) => {
    setEditing(e);
    setForm({
      title: e.title,
      description: e.description ?? "",
      starts_at: toLocal(e.starts_at),
      ends_at: toLocal(e.ends_at),
      location: e.location ?? "",
      sort_order: e.sort_order,
    });
  };

  const save = async () => {
    if (!form.title.trim() || !form.starts_at) return toast.error("Title and start time are required");
    const payload = {
      title: form.title.trim(),
      description: form.description.trim() || null,
      starts_at: new Date(form.starts_at).toISOString(),
      ends_at: form.ends_at ? new Date(form.ends_at).toISOString() : null,
      location: form.location.trim() || null,
      sort_order: form.sort_order || 0,
    };
    const { error } = editing
      ? await supabase.from("schedule_events").update(payload).eq("id", editing.id)
      : await supabase.from("schedule_events").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Event updated" : "Event created");
    startNew(); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Delete this event?")) return;
    const { error } = await supabase.from("schedule_events").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Deleted"); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-white text-xl font-bold">Manage Schedule</h2>
        <Button onClick={startNew} variant="ghost" className="text-white hover:bg-white/10">
          <Plus className="h-4 w-4 mr-1" /> New
        </Button>
      </div>

      <div className="glass rounded-2xl p-4 grid md:grid-cols-2 gap-4">
        <Field label="Title *">
          <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Location">
          <Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Starts at *">
          <Input type="datetime-local" value={form.starts_at} onChange={(e) => setForm({ ...form, starts_at: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Ends at">
          <Input type="datetime-local" value={form.ends_at} onChange={(e) => setForm({ ...form, ends_at: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Description" className="md:col-span-2">
          <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} className={inputCls} />
        </Field>
        <Field label="Sort Order">
          <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className={inputCls} />
        </Field>
        <div className="flex items-end gap-2 md:col-span-2">
          <Button onClick={save} className="glass-strong text-white border border-white/20 hover:bg-white/20">
            {editing ? "Update Event" : "Create Event"}
          </Button>
          {editing && (
            <Button onClick={startNew} variant="ghost" className="text-white/70 hover:bg-white/10">Cancel edit</Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-white" /></div>
      ) : (
        <div className="space-y-2">
          {rows.length === 0 ? (
            <p className="text-white/60 text-sm">No events yet.</p>
          ) : rows.map((e) => (
            <div key={e.id} className="glass rounded-xl p-3 flex items-center gap-3">
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{e.title}</p>
                <p className="text-white/60 text-xs">
                  {new Date(e.starts_at).toLocaleString()}
                  {e.location ? ` · ${e.location}` : ""}
                </p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => startEdit(e)} className="text-white hover:bg-white/10">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => remove(e.id)} className="text-red-300 hover:bg-red-500/10">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ScheduleTab;
