import { useEffect, useState } from "react";
import { Loader2, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Field, inputCls } from "../Field";

interface SiteSettings {
  id: number;
  countdown_target: string | null;
  countdown_active: boolean;
  registration_open: boolean;
}

const toLocal = (iso: string | null) => (iso ? new Date(iso).toISOString().slice(0, 16) : "");

const SettingsTab = () => {
  const [s, setS] = useState<SiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("site_settings")
      .select("id, countdown_target, countdown_active, registration_open")
      .eq("id", 1)
      .maybeSingle();
    if (error) toast.error(error.message);
    setS((data as SiteSettings) ?? {
      id: 1,
      countdown_target: null,
      countdown_active: false,
      registration_open: true,
    });
    setLoading(false);
  };
  useEffect(() => { load(); }, []);

  const save = async () => {
    if (!s) return;
    setSaving(true);
    const { error } = await supabase
      .from("site_settings")
      .update({
        countdown_target: s.countdown_target,
        countdown_active: s.countdown_active,
        registration_open: s.registration_open,
      })
      .eq("id", 1);
    setSaving(false);
    if (error) return toast.error(error.message);
    toast.success("Settings saved");
  };

  if (loading || !s) {
    return <div className="flex items-center justify-center py-8"><Loader2 className="h-6 w-6 animate-spin text-white" /></div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-white text-xl font-bold">Site Settings</h2>

      <div className="glass rounded-2xl p-4 space-y-4">
        <h3 className="text-white font-semibold">Countdown</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <Field label="Target Date / Time">
            <Input
              type="datetime-local"
              value={toLocal(s.countdown_target)}
              onChange={(e) => setS({ ...s, countdown_target: e.target.value ? new Date(e.target.value).toISOString() : null })}
              className={inputCls}
            />
          </Field>
          <div className="flex items-center gap-3 pt-7">
            <Switch checked={s.countdown_active} onCheckedChange={(v) => setS({ ...s, countdown_active: v })} />
            <span className="text-white text-sm">Show countdown on site</span>
          </div>
        </div>
      </div>

      <div className="glass rounded-2xl p-4 space-y-4">
        <h3 className="text-white font-semibold">Registration</h3>
        <div className="flex items-center gap-3">
          <Switch checked={s.registration_open} onCheckedChange={(v) => setS({ ...s, registration_open: v })} />
          <span className="text-white text-sm">Registration open (Start/Stop)</span>
        </div>
      </div>

      <Button
        onClick={save}
        disabled={saving}
        className="glass-strong text-white border border-white/20 hover:bg-white/20 rounded-full px-6 py-5"
      >
        {saving ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
        Save Settings
      </Button>
    </div>
  );
};

export default SettingsTab;
