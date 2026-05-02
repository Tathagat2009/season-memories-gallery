import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Lock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAuth } from "@/hooks/useAdminAuth";

const AdminLogin = () => {
  const navigate = useNavigate();
  const { session, isAdmin, loading } = useAdminAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!loading && session && isAdmin) navigate("/admin", { replace: true });
  }, [session, isAdmin, loading, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const SECRETARY_HANDLE = "secretary@dpsmun";
      const SECRETARY_PASSWORD = "secretary.dpsmun";
      // Real auth email used internally for the hardcoded secretary account
      const SECRETARY_AUTH_EMAIL = "secretary@dpsmun.local";

      const inputEmail = email.trim();
      const isSecretary =
        (inputEmail === SECRETARY_HANDLE || inputEmail === SECRETARY_AUTH_EMAIL) &&
        password === SECRETARY_PASSWORD;

      const loginEmail = isSecretary ? SECRETARY_AUTH_EMAIL : inputEmail;
      const loginPassword = isSecretary ? SECRETARY_PASSWORD : password;

      // Try sign in first
      let { error } = await supabase.auth.signInWithPassword({
        email: loginEmail,
        password: loginPassword,
      });

      // For the hardcoded secretary, auto-provision on first login
      if (error && isSecretary) {
        const { error: signUpError } = await supabase.auth.signUp({
          email: loginEmail,
          password: loginPassword,
          options: { emailRedirectTo: `${window.location.origin}/admin` },
        });
        if (signUpError && !/registered/i.test(signUpError.message)) throw signUpError;
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email: loginEmail,
          password: loginPassword,
        });
        if (signInError) throw signInError;
      } else if (error) {
        throw error;
      }

      // Verify (or grant) admin role
      const { data: userData } = await supabase.auth.getUser();
      if (!userData.user) throw new Error("Could not load user");

      let { data: role } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", userData.user.id)
        .eq("role", "admin")
        .maybeSingle();

      if (!role && isSecretary) {
        // Self-grant admin to the hardcoded secretary on first login
        await supabase
          .from("user_roles")
          .insert({ user_id: userData.user.id, role: "admin" as const });
        role = { role: "admin" } as any;
      }

      if (!role) {
        toast.error(
          "This account is not an admin yet. Ask the project owner to grant the admin role.",
          { duration: 6000 }
        );
        await supabase.auth.signOut();
        return;
      }

      toast.success("Welcome back, Secretary!");
      navigate("/admin", { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Sign in failed";
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md glass-strong rounded-3xl p-8 space-y-6">
        <div className="text-center space-y-2">
          <div className="mx-auto h-14 w-14 rounded-full glass flex items-center justify-center">
            <Lock className="h-6 w-6 text-white" />
          </div>
          <h1 className="text-white text-2xl font-bold">Admin Console</h1>
          <p className="text-white/60 text-sm">DPSAMUN Secretariat access only.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label className="text-white">Email</Label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="glass border-white/20 bg-white/5 text-white placeholder:text-white/40"
              placeholder="you@example.com"
            />
          </div>
          <div className="space-y-2">
            <Label className="text-white">Password</Label>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="glass border-white/20 bg-white/5 text-white placeholder:text-white/40"
              placeholder="••••••••"
            />
          </div>
          <Button
            type="submit"
            disabled={submitting}
            className="w-full glass-strong rounded-full py-6 text-white font-semibold border border-white/20 hover:bg-white/20"
          >
            {submitting ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <p className="text-white/40 text-xs text-center">
          First-time login auto-creates the account. Admin role must then be granted.
        </p>
      </div>
    </main>
  );
};

export default AdminLogin;
