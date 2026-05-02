import { useEffect, useState } from "react";
import { Loader2, Plus, Pencil, Trash2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, inputCls } from "../Field";
import { classifyImageUrl } from "@/lib/imgbb";

interface TeamMember {
  id: string;
  name: string;
  role_title: string | null;
  photo_url: string | null;
  bio: string | null;
  sort_order: number;
}

const empty = { name: "", role_title: "", photo_url: "", bio: "", sort_order: 0 };

const TeamTab = () => {
  const [rows, setRows] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<TeamMember | null>(null);
  const [form, setForm] = useState(empty);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase.from("team_members").select("*").order("sort_order").order("name");
    if (error) toast.error(error.message);
    else setRows((data ?? []) as TeamMember[]);
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const startNew = () => { setEditing(null); setForm(empty); };
  const startEdit = (m: TeamMember) => {
    setEditing(m);
    setForm({
      name: m.name, role_title: m.role_title ?? "", photo_url: m.photo_url ?? "",
      bio: m.bio ?? "", sort_order: m.sort_order,
    });
  };

  const save = async () => {
    if (!form.name.trim()) return toast.error("Name is required");
    const payload = {
      name: form.name.trim(),
      role_title: form.role_title.trim() || null,
      photo_url: form.photo_url.trim() || null,
      bio: form.bio.trim() || null,
      sort_order: form.sort_order || 0,
    };
    const { error } = editing
      ? await supabase.from("team_members").update(payload).eq("id", editing.id)
      : await supabase.from("team_members").insert(payload);
    if (error) return toast.error(error.message);
    toast.success(editing ? "Member updated" : "Member added");
    startNew(); load();
  };

  const remove = async (id: string) => {
    if (!confirm("Remove this member?")) return;
    const { error } = await supabase.from("team_members").delete().eq("id", id);
    if (error) return toast.error(error.message);
    toast.success("Removed"); load();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <h2 className="text-white text-xl font-bold">Manage Team</h2>
        <Button onClick={startNew} variant="ghost" className="text-white hover:bg-white/10">
          <Plus className="h-4 w-4 mr-1" /> New
        </Button>
      </div>

      <div className="glass rounded-2xl p-4 grid md:grid-cols-2 gap-4">
        <Field label="Name *">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
        </Field>
        <Field label="Role / Title">
          <Input value={form.role_title} onChange={(e) => setForm({ ...form, role_title: e.target.value })} className={inputCls} placeholder="Secretary General" />
        </Field>
        <Field label="Photo URL (ImgBB direct link)" className="md:col-span-2">
          {(() => {
            const c = classifyImageUrl(form.photo_url);
            if (c.kind === "empty") return null;
            if (c.kind === "share") {
              return (
                <div className="mb-2 glass rounded-xl p-3 border border-yellow-300/30">
                  <p className="text-yellow-200 text-sm font-semibold mb-1">⚠ This isn't a direct image URL</p>
                  <p className="text-white/70 text-xs">{c.hint}</p>
                </div>
              );
            }
            return (
              <div className="mb-2 flex items-center gap-3 glass rounded-xl p-3">
                <img
                  src={c.url}
                  alt="Live preview"
                  className="h-20 w-20 rounded-full object-cover ring-2 ring-white/30 bg-white/5"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).style.opacity = "0.2"; }}
                />
                <span className="text-white/70 text-xs">Live preview</span>
              </div>
            );
          })()}
          <Input value={form.photo_url} onChange={(e) => setForm({ ...form, photo_url: e.target.value })} className={inputCls} placeholder="https://i.ibb.co/abc123/photo.jpg" />
          <p className="text-white/50 text-xs mt-1">
            Tip: on imgbb.com open your image, right-click → <strong>Copy image address</strong>. The URL must start with <code className="text-white/80">https://i.ibb.co/</code>.
          </p>
        </Field>
        <Field label="Bio" className="md:col-span-2">
          <Textarea value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={2} className={inputCls} />
        </Field>
        <Field label="Sort Order">
          <Input type="number" value={form.sort_order} onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })} className={inputCls} />
        </Field>
        <div className="md:col-span-2 flex gap-2">
          <Button onClick={save} className="glass-strong text-white border border-white/20 hover:bg-white/20">
            {editing ? "Update Member" : "Add Member"}
          </Button>
          {editing && <Button onClick={startNew} variant="ghost" className="text-white/70 hover:bg-white/10">Cancel</Button>}
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-white" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {rows.length === 0 ? (
            <p className="text-white/60 text-sm col-span-full">No members yet.</p>
          ) : rows.map((m) => (
            <div key={m.id} className="glass rounded-xl p-3 flex items-center gap-3">
              {m.photo_url ? (
                <img src={m.photo_url} alt="" className="h-14 w-14 rounded-full object-cover ring-2 ring-white/20" />
              ) : (
                <div className="h-14 w-14 rounded-full bg-white/10" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold truncate">{m.name}</p>
                <p className="text-white/60 text-xs truncate">{m.role_title ?? ""}</p>
              </div>
              <Button size="icon" variant="ghost" onClick={() => startEdit(m)} className="text-white hover:bg-white/10">
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="icon" variant="ghost" onClick={() => remove(m.id)} className="text-red-300 hover:bg-red-500/10">
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TeamTab;
