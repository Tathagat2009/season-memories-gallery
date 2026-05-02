import { Label } from "@/components/ui/label";

export const inputCls =
  "glass border-white/20 bg-white/5 text-white placeholder:text-white/40 focus-visible:ring-white/40";

export const Field = ({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div className={`space-y-2 ${className}`}>
    <Label className="text-white">{label}</Label>
    {children}
  </div>
);
