import { useEffect, useState } from "react";
import { X, Megaphone, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

interface Notice {
  id: string;
  title: string;
  body: string | null;
  attachment_url: string | null;
}

const NoticesPopup = () => {
  const [notices, setNotices] = useState<Notice[]>([]);
  const [open, setOpen] = useState(false);

  const load = async () => {
    const nowIso = new Date().toISOString();
    const { data, error } = await supabase
      .from("notices")
      .select("id,title,body,attachment_url,active,starts_at,ends_at")
      .eq("active", true)
      .order("created_at", { ascending: false });
    if (error || !data) return;
    const filtered = data.filter(
      (n: any) =>
        (!n.starts_at || n.starts_at <= nowIso) &&
        (!n.ends_at || n.ends_at >= nowIso),
    );
    if (filtered.length === 0) {
      setNotices([]);
      setOpen(false);
      return;
    }

    const dismissedKey = "dpsmun-notices-dismissed";
    const dismissed: string[] = JSON.parse(sessionStorage.getItem(dismissedKey) || "[]");
    const fresh = filtered.filter((n) => !dismissed.includes(n.id));
    if (fresh.length === 0) return;

    setNotices(fresh as Notice[]);
    setOpen(true);
  };

  const dismiss = () => {
    const dismissedKey = "dpsmun-notices-dismissed";
    const dismissed: string[] = JSON.parse(sessionStorage.getItem(dismissedKey) || "[]");
    const next = Array.from(new Set([...dismissed, ...notices.map((n) => n.id)]));
    sessionStorage.setItem(dismissedKey, JSON.stringify(next));
    setOpen(false);
  };

  useEffect(() => {
    // One-shot fetch on mount. We intentionally do NOT open a realtime
    // websocket here: with thousands of concurrent visitors that would
    // create thousands of idle subscriptions. Visitors will see new
    // notices on their next page load, which is the right tradeoff for
    // a high-traffic public site.
    load();
  }, []);

  if (!open || notices.length === 0) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center px-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="glass-strong rounded-2xl max-w-lg w-full p-6 relative">
        <button
          onClick={dismiss}
          aria-label="Close"
          className="absolute top-3 right-3 h-9 w-9 rounded-full glass text-white flex items-center justify-center hover:bg-white/15"
        >
          <X className="h-4 w-4" />
        </button>
        <div className="flex items-center gap-2 mb-4 text-white">
          <Megaphone className="h-5 w-5 text-emerald-300" />
          <h2 className="text-lg font-bold">
            {notices.length === 1 ? "Notice" : `${notices.length} Notices`}
          </h2>
        </div>
        <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-1">
          {notices.map((n) => (
            <div key={n.id} className="glass rounded-xl p-4">
              <p className="text-white font-semibold">{n.title}</p>
              {n.body && (
                <p className="text-white/70 text-sm mt-1 whitespace-pre-wrap">{n.body}</p>
              )}
              {n.attachment_url && (
                <a
                  href={n.attachment_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 inline-flex items-center gap-2 glass rounded-full px-3 py-1.5 text-emerald-300 text-xs font-semibold hover:bg-white/10"
                >
                  <FileText className="h-3.5 w-3.5" />
                  View attached document
                </a>
              )}
            </div>
          ))}
        </div>
        <div className="mt-5 flex items-center justify-between gap-3">
          <Link
            to="/notices"
            onClick={() => setOpen(false)}
            className="text-emerald-300 text-sm font-medium hover:underline"
          >
            View all notices →
          </Link>
          <button
            onClick={dismiss}
            className="glass rounded-full px-4 py-2 text-white text-sm font-semibold hover:bg-white/15"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};

export default NoticesPopup;
