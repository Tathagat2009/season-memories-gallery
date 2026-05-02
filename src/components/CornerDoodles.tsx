// Subtle UN-blue line-art doodles placed in the four corners.
// Kept very faint (low opacity) so they don't overpower the green theme.
const UN_BLUE = "#5B92E5";

const Globe = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    stroke={UN_BLUE}
    strokeWidth="1.2"
    className={className}
    aria-hidden="true"
  >
    <circle cx="50" cy="50" r="40" />
    <ellipse cx="50" cy="50" rx="40" ry="16" />
    <ellipse cx="50" cy="50" rx="16" ry="40" />
    <ellipse cx="50" cy="50" rx="40" ry="30" />
    <line x1="10" y1="50" x2="90" y2="50" />
    <line x1="50" y1="10" x2="50" y2="90" />
  </svg>
);

const Gavel = ({ className = "" }: { className?: string }) => (
  <svg
    viewBox="0 0 100 100"
    fill="none"
    stroke={UN_BLUE}
    strokeWidth="1.2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <rect x="20" y="22" width="40" height="18" rx="2" transform="rotate(-30 40 31)" />
    <line x1="48" y1="44" x2="80" y2="76" />
    <rect x="68" y="70" width="20" height="12" rx="2" transform="rotate(45 78 76)" />
    <line x1="14" y1="84" x2="62" y2="84" />
  </svg>
);

const CornerDoodles = () => (
  <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
    <Globe className="absolute -top-6 -left-6 h-40 w-40 opacity-[0.07]" />
    <Gavel className="absolute -top-6 -right-6 h-40 w-40 opacity-[0.07]" />
    <Gavel className="absolute -bottom-6 -left-6 h-40 w-40 opacity-[0.07] -scale-x-100" />
    <Globe className="absolute -bottom-6 -right-6 h-44 w-44 opacity-[0.07]" />
  </div>
);

export default CornerDoodles;
