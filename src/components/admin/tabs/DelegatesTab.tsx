import { useEffect, useState } from "react";
import { Loader2, FileDown, Search } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { inputCls } from "../Field";

interface Registration {
  id: string;
  full_name: string;
  class_grade: string;
  school: string | null;
  email: string;
  mobile: string;
  address: string;
  mun_experience: string | null;
  committee_pref1: string;
  committee_pref2: string | null;
  preference1: string | null;
  preference2: string | null;
  receipt_path: string | null;
  created_at: string;
  transportation_required: boolean | null;
}

const DelegatesTab = () => {
  const [rows, setRows] = useState<Registration[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("registrations")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) toast.error(error.message);
    else setRows(data ?? []);
    setLoading(false);
  };

  const openReceipt = async (path: string | null) => {
    if (!path) return toast.error("No receipt uploaded");
    const { data, error } = await supabase.storage
      .from("receipts")
      .createSignedUrl(path, 60 * 5);
    if (error || !data) return toast.error(error?.message ?? "Could not load receipt");
    window.open(data.signedUrl, "_blank");
  };

  const filtered = rows.filter((r) => {
    const s = q.toLowerCase().trim();
    if (!s) return true;
    return (
      r.full_name.toLowerCase().includes(s) ||
      r.email.toLowerCase().includes(s) ||
      r.committee_pref1.toLowerCase().includes(s) ||
      (r.committee_pref2 ?? "").toLowerCase().includes(s) ||
      (r.preference1 ?? "").toLowerCase().includes(s) ||
      (r.preference2 ?? "").toLowerCase().includes(s) ||
      (r.school ?? "").toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div>
          <h2 className="text-white text-xl font-bold">Registered Delegates</h2>
          <p className="text-white/60 text-sm">{rows.length} total submissions</p>
        </div>
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search name / email / school / committee"
            className={`${inputCls} pl-9`}
          />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-white" />
        </div>
      ) : filtered.length === 0 ? (
        <p className="text-white/60 text-sm py-8 text-center">No delegates yet.</p>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm text-white">
            <thead className="bg-white/5 text-white/70 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-3 py-2 text-left">Name</th>
                <th className="px-3 py-2 text-left">School</th>
                <th className="px-3 py-2 text-left">Class</th>
                <th className="px-3 py-2 text-left">Email</th>
                <th className="px-3 py-2 text-left">Mobile</th>
                <th className="px-3 py-2 text-left">Transport</th>
                <th className="px-3 py-2 text-left">Committee 1</th>
                <th className="px-3 py-2 text-left">Pref 1</th>
                <th className="px-3 py-2 text-left">Committee 2</th>
                <th className="px-3 py-2 text-left">Pref 2</th>
                <th className="px-3 py-2 text-left">Submitted</th>
                <th className="px-3 py-2 text-left">Receipt</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id} className="border-t border-white/10 hover:bg-white/5">
                  <td className="px-3 py-2 font-medium">{r.full_name}</td>
                  <td className="px-3 py-2">{r.school ?? "—"}</td>
                  <td className="px-3 py-2">{r.class_grade}</td>
                  <td className="px-3 py-2">{r.email}</td>
                  <td className="px-3 py-2">{r.mobile}</td>
                  <td className="px-3 py-2">
                    <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${r.transportation_required ? "bg-emerald-500/20 text-emerald-300" : "bg-white/10 text-white/50"}`}>
                      {r.transportation_required ? "Yes" : "No"}
                    </span>
                  </td>
                  <td className="px-3 py-2">{r.committee_pref1}</td>
                  <td className="px-3 py-2">{r.preference1 ?? "—"}</td>
                  <td className="px-3 py-2">{r.committee_pref2 ?? "—"}</td>
                  <td className="px-3 py-2">{r.preference2 ?? "—"}</td>
                  <td className="px-3 py-2 text-white/60">{new Date(r.created_at).toLocaleDateString()}</td>
                  <td className="px-3 py-2">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      disabled={!r.receipt_path}
                      onClick={() => openReceipt(r.receipt_path)}
                      className="text-white hover:bg-white/10"
                    >
                      <FileDown className="h-4 w-4 mr-1" /> View
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default DelegatesTab;
