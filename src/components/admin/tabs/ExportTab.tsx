import { useState } from "react";
import { Download, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const csvEscape = (v: unknown) => {
  if (v === null || v === undefined) return "";
  const s = String(v);
  if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
};

const ExportTab = () => {
  const [busy, setBusy] = useState(false);

  const download = async () => {
    setBusy(true);
    try {
      const { data, error } = await supabase
        .from("registrations")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      const rows = data ?? [];
      if (rows.length === 0) {
        toast.info("No delegate data yet.");
        return;
      }
      const headers = [
        "id", "full_name", "class_grade", "email", "mobile", "address",
        "mun_experience", "committee_pref1", "preference1", "committee_pref2", "preference2",
        "receipt_path", "created_at",
      ];
      const csv = [
        headers.join(","),
        ...rows.map((r: Record<string, unknown>) => headers.map((h) => csvEscape(r[h])).join(",")),
      ].join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `dpsamun-delegates-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success(`Exported ${rows.length} delegates`);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Export failed");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-white text-xl font-bold">Export Data</h2>
      <p className="text-white/60 text-sm">
        Download all delegate registrations as a CSV file (one row per delegate, all common fields plus committee &amp; preference).
      </p>
      <Button
        onClick={download}
        disabled={busy}
        className="glass-strong text-white border border-white/20 hover:bg-white/20 rounded-full px-6 py-5"
      >
        {busy ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Download className="h-4 w-4 mr-2" />}
        Download Delegates CSV
      </Button>
    </div>
  );
};

export default ExportTab;
