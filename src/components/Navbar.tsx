import { useState } from "react";
import { Link } from "react-router-dom";
import { Menu, X } from "lucide-react";
import munLogo from "@/assets/mun-logo.jpeg";

const links: { label: string; href: string }[] = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Secretariat", href: "/secretariat" },
  { label: "Committees", href: "/committees" },
  { label: "Allocations", href: "/allocations" },
  { label: "Register", href: "/register" },
  { label: "Notices", href: "/notices" },
  { label: "Admin", href: "/admin/login" },
];

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="fixed top-4 left-4 right-4 z-50 glass-strong rounded-2xl px-4 sm:px-6 py-3">
      <div className="flex items-center justify-between gap-3">
        <Link to="/" className="flex items-center gap-2 sm:gap-3 min-w-0" onClick={() => setOpen(false)}>
          <span className="h-9 w-9 sm:h-10 sm:w-10 rounded-full overflow-hidden ring-2 ring-white/30 shrink-0">
            <img src={munLogo} alt="DPS AMUN logo" className="h-full w-full object-cover scale-150" />
          </span>
          <span className="text-white font-bold tracking-wider text-base sm:text-lg truncate">DPS AMUN</span>
        </Link>

        <ul className="hidden md:flex items-center gap-7">
          {links.map((l) => (
            <li key={l.label}>
              <Link to={l.href} className="text-white/80 hover:text-white text-sm font-medium transition-colors">
                {l.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2 shrink-0">
          <Link
            to="/register"
            className="hidden sm:inline-flex glass rounded-full px-4 py-2 text-white text-sm font-semibold hover:bg-white/15 transition"
          >
            Register
          </Link>
          <button
            type="button"
            aria-label="Toggle menu"
            onClick={() => setOpen((v) => !v)}
            className="md:hidden h-10 w-10 inline-flex items-center justify-center rounded-full glass text-white hover:bg-white/15 transition"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden mt-3 pt-3 border-t border-white/10">
          <ul className="flex flex-col gap-1">
            {links.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.href}
                  onClick={() => setOpen(false)}
                  className="block px-3 py-2 rounded-lg text-white/90 hover:text-white hover:bg-white/10 text-sm font-medium transition"
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
