import { useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Layers,
  Calendar,
  ClipboardList,
  UserCog,
  Megaphone,
  Download,
  Settings,
  LogOut,
  Menu,
  X,
  Shield,
} from "lucide-react";
import munLogo from "@/assets/mun-logo.jpeg";
import { Button } from "@/components/ui/button";
import { useAdminAuth } from "@/hooks/useAdminAuth";

import DelegatesTab from "@/components/admin/tabs/DelegatesTab";
import CommitteesTab from "@/components/admin/tabs/CommitteesTab";
import ScheduleTab from "@/components/admin/tabs/ScheduleTab";
import AllocationsTab from "@/components/admin/tabs/AllocationsTab";
import TeamTab from "@/components/admin/tabs/TeamTab";
import EBTab from "@/components/admin/tabs/EBTab";
import NoticesTab from "@/components/admin/tabs/NoticesTab";
import ExportTab from "@/components/admin/tabs/ExportTab";
import SettingsTab from "@/components/admin/tabs/SettingsTab";

type TabKey =
  | "delegates"
  | "committees"
  | "schedule"
  | "allocations"
  | "team"
  | "eb"
  | "notices"
  | "export"
  | "settings";

const TABS: { key: TabKey; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { key: "delegates", label: "Registered Delegates", icon: Users },
  { key: "committees", label: "Manage Committees", icon: Layers },
  { key: "schedule", label: "Manage Schedule", icon: Calendar },
  { key: "allocations", label: "Manage Allocations", icon: ClipboardList },
  { key: "team", label: "Manage Team", icon: UserCog },
  { key: "eb", label: "Executive Board", icon: Shield },
  { key: "notices", label: "Manage Notices", icon: Megaphone },
  { key: "export", label: "Export Data", icon: Download },
  { key: "settings", label: "Site Settings", icon: Settings },
];

const Admin = () => {
  const [tab, setTab] = useState<TabKey>("delegates");
  const [navOpen, setNavOpen] = useState(false);
  const { signOut } = useAdminAuth();

  const renderTab = () => {
    switch (tab) {
      case "delegates": return <DelegatesTab />;
      case "committees": return <CommitteesTab />;
      case "schedule": return <ScheduleTab />;
      case "allocations": return <AllocationsTab />;
      case "team": return <TeamTab />;
      case "eb": return <EBTab />;
      case "notices": return <NoticesTab />;
      case "export": return <ExportTab />;
      case "settings": return <SettingsTab />;
    }
  };

  return (
    <main className="min-h-screen px-3 sm:px-6 py-6">
      <div className="max-w-[1400px] mx-auto">
        <div className="glass-strong rounded-2xl px-4 py-3 mb-4 flex items-center justify-between gap-3">
          <Link to="/" className="flex items-center gap-3 min-w-0">
            <span className="h-9 w-9 rounded-full overflow-hidden ring-2 ring-white/30 shrink-0">
              <img src={munLogo} alt="" className="h-full w-full object-cover scale-150" />
            </span>
            <div className="min-w-0">
              <p className="text-white font-bold text-sm truncate">DPS AMUN — Admin</p>
              <p className="text-white/50 text-xs">Secretariat Console</p>
            </div>
          </Link>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              onClick={signOut}
              className="text-white hover:bg-white/10 hidden sm:inline-flex"
            >
              <LogOut className="h-4 w-4 mr-2" /> Logout
            </Button>
            <button
              type="button"
              onClick={() => setNavOpen((v) => !v)}
              className="lg:hidden h-10 w-10 rounded-full glass text-white flex items-center justify-center"
              aria-label="Toggle tabs"
            >
              {navOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>

        <div className="grid lg:grid-cols-[260px_1fr] gap-4">
          <aside className={`${navOpen ? "block" : "hidden"} lg:block`}>
            <nav className="glass-strong rounded-2xl p-3 space-y-1 sticky top-4">
              {TABS.map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => {
                    setTab(key);
                    setNavOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                    tab === key
                      ? "bg-white/15 text-white"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate text-left">{label}</span>
                </button>
              ))}
              <button
                onClick={signOut}
                className="sm:hidden w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-white/70 hover:text-white hover:bg-white/5 mt-2 border-t border-white/10 pt-3"
              >
                <LogOut className="h-4 w-4" /> Logout
              </button>
            </nav>
          </aside>

          <section className="min-w-0">
            <div className="glass-strong rounded-2xl p-4 sm:p-6">{renderTab()}</div>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Admin;
