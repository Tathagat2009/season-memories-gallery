// Artistic UN-themed line-art doodles scattered across the Home page.
// Faint UN-blue strokes; pointer-events-none so they never block UI.
const UN_BLUE = "#5B92E5";

type DoodleProps = { className?: string; opacity?: number };

const stroke = {
  fill: "none",
  stroke: UN_BLUE,
  strokeWidth: 1.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const Globe = ({ className = "", opacity = 0.12 }: DoodleProps) => (
  <svg viewBox="0 0 100 100" className={className} style={{ opacity }} aria-hidden="true">
    <g {...stroke}>
      <circle cx="50" cy="50" r="40" />
      <ellipse cx="50" cy="50" rx="40" ry="16" />
      <ellipse cx="50" cy="50" rx="16" ry="40" />
      <ellipse cx="50" cy="50" rx="40" ry="30" />
      <line x1="10" y1="50" x2="90" y2="50" />
      <line x1="50" y1="10" x2="50" y2="90" />
    </g>
  </svg>
);

const Gavel = ({ className = "", opacity = 0.12 }: DoodleProps) => (
  <svg viewBox="0 0 100 100" className={className} style={{ opacity }} aria-hidden="true">
    <g {...stroke}>
      <rect x="20" y="22" width="40" height="18" rx="2" transform="rotate(-30 40 31)" />
      <line x1="48" y1="44" x2="80" y2="76" />
      <rect x="68" y="70" width="20" height="12" rx="2" transform="rotate(45 78 76)" />
      <line x1="14" y1="84" x2="62" y2="84" />
    </g>
  </svg>
);

const OliveBranch = ({ className = "", opacity = 0.12 }: DoodleProps) => (
  <svg viewBox="0 0 100 100" className={className} style={{ opacity }} aria-hidden="true">
    <g {...stroke}>
      <path d="M10 80 C 30 60, 55 45, 90 25" />
      {[20, 35, 50, 65, 78].map((x, i) => (
        <ellipse
          key={`l-${i}`}
          cx={x}
          cy={75 - i * 9}
          rx="6"
          ry="2.5"
          transform={`rotate(${-35 - i * 4} ${x} ${75 - i * 9})`}
        />
      ))}
      {[28, 43, 58, 72].map((x, i) => (
        <ellipse
          key={`r-${i}`}
          cx={x + 4}
          cy={71 - i * 9}
          rx="6"
          ry="2.5"
          transform={`rotate(${35 + i * 4} ${x + 4} ${71 - i * 9})`}
        />
      ))}
    </g>
  </svg>
);

const Scales = ({ className = "", opacity = 0.12 }: DoodleProps) => (
  <svg viewBox="0 0 100 100" className={className} style={{ opacity }} aria-hidden="true">
    <g {...stroke}>
      <line x1="50" y1="12" x2="50" y2="78" />
      <circle cx="50" cy="80" r="3" />
      <line x1="40" y1="84" x2="60" y2="84" />
      <line x1="20" y1="30" x2="80" y2="30" />
      <line x1="50" y1="14" x2="50" y2="30" />
      <path d="M22 30 L12 52 a14 8 0 0 0 28 0 Z" />
      <path d="M78 30 L68 52 a14 8 0 0 0 28 0 Z" />
    </g>
  </svg>
);

const Laurel = ({ className = "", opacity = 0.12 }: DoodleProps) => (
  <svg viewBox="0 0 100 100" className={className} style={{ opacity }} aria-hidden="true">
    <g {...stroke}>
      <path d="M22 80 C 14 55, 24 25, 50 14" />
      <path d="M78 80 C 86 55, 76 25, 50 14" />
      {[0, 1, 2, 3, 4].map((i) => (
        <g key={`L-${i}`}>
          <ellipse cx={20 - i} cy={70 - i * 12} rx="5" ry="2.2" transform={`rotate(${-50 + i * 6} ${20 - i} ${70 - i * 12})`} />
          <ellipse cx={80 + i} cy={70 - i * 12} rx="5" ry="2.2" transform={`rotate(${50 - i * 6} ${80 + i} ${70 - i * 12})`} />
        </g>
      ))}
      <path d="M40 88 Q 50 96 60 88" />
    </g>
  </svg>
);

const Handshake = ({ className = "", opacity = 0.12 }: DoodleProps) => (
  <svg viewBox="0 0 100 100" className={className} style={{ opacity }} aria-hidden="true">
    <g {...stroke}>
      <path d="M8 55 L30 45 L46 53 L60 47 L78 55" />
      <path d="M30 45 L42 38 L56 42 L66 38" />
      <path d="M8 55 L18 70" />
      <path d="M78 55 L88 70" />
      <path d="M40 60 L52 60" />
    </g>
  </svg>
);

const Dove = ({ className = "", opacity = 0.12 }: DoodleProps) => (
  <svg viewBox="0 0 100 100" className={className} style={{ opacity }} aria-hidden="true">
    <g {...stroke}>
      <path d="M14 60 C 30 40, 55 38, 78 50 L 88 44 L 82 56 C 70 70, 40 74, 22 70 Z" />
      <path d="M40 50 C 48 30, 60 28, 72 36" />
      <circle cx="80" cy="48" r="1.5" fill={UN_BLUE} />
      <path d="M22 70 L 18 82" />
      <path d="M30 72 L 28 84" />
    </g>
  </svg>
);

const HomeDoodles = () => (
  <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
    {/* Top band */}
    <Globe className="absolute -top-4 -left-6 h-40 w-40" opacity={0.1} />
    <Dove className="absolute top-24 right-8 h-28 w-28" opacity={0.13} />
    <Laurel className="absolute top-10 right-1/3 h-24 w-24" opacity={0.09} />

    {/* Mid band */}
    <Scales className="absolute top-1/2 -left-4 h-36 w-36 -translate-y-1/2" opacity={0.1} />
    <Handshake className="absolute top-1/2 right-6 h-32 w-32 -translate-y-1/3" opacity={0.11} />

    {/* Bottom band */}
    <Gavel className="absolute bottom-6 left-10 h-32 w-32" opacity={0.11} />
    <OliveBranch className="absolute bottom-2 right-10 h-36 w-36" opacity={0.12} />
    <Globe className="absolute -bottom-6 left-1/2 -translate-x-1/2 h-44 w-44" opacity={0.07} />
  </div>
);

export default HomeDoodles;
