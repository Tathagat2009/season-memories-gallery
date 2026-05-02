import * as React from "react";
import { toast } from "sonner";

interface State { error: Error | null }

export class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[App ErrorBoundary]", error, info);
    toast.error(error.message || "Something went wrong");
  }

  reset = () => this.setState({ error: null });

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="glass-strong rounded-3xl p-8 max-w-lg w-full text-white space-y-3">
          <h1 className="text-2xl font-bold">Something went wrong</h1>
          <p className="text-white/70 text-sm break-words">
            {this.state.error.message}
          </p>
          <div className="flex gap-2 pt-2">
            <button
              onClick={this.reset}
              className="glass rounded-full px-4 py-2 text-sm hover:bg-white/10"
            >
              Try again
            </button>
            <a
              href="/"
              className="glass rounded-full px-4 py-2 text-sm hover:bg-white/10"
            >
              Go home
            </a>
          </div>
        </div>
      </main>
    );
  }
}