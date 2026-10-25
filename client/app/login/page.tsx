"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  Github,
  Code2,
  ArrowRight,
  Sparkles,
  Key,
  CheckCircle2,
  AlertCircle,
  Copy,
  ExternalLink,
  Loader2,
} from "lucide-react";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:4000";

export default function LoginPage() {
  const router = useRouter();

  const [patToken, setPatToken] = useState("");
  const [isVerifyingPat, setIsVerifyingPat] = useState(false);
  const [error, setError] = useState("");
  const [showPatInput, setShowPatInput] = useState(false);

  // Device flow state
  const [deviceStep, setDeviceStep] = useState<"idle" | "waiting" | "polling">("idle");
  const [deviceCode, setDeviceCode] = useState("");
  const [userCode, setUserCode] = useState("");
  const [verificationUri, setVerificationUri] = useState("");
  const [copied, setCopied] = useState(false);
  const pollRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("github_token");
    if (token) router.replace("/");
  }, [router]);

  // Cleanup polling on unmount
  useEffect(() => {
    return () => {
      if (pollRef.current) clearTimeout(pollRef.current);
    };
  }, []);

  // ── GitHub Device Flow ─────────────────────────────────────────────────
  const handleGitHubLogin = async () => {
    setError("");
    setDeviceStep("waiting");

    try {
      // Step 1: Request a device code via our backend proxy (GitHub blocks direct browser calls)
      const res = await fetch(`${API_BASE_URL}/api/github/auth/device/code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error(err.error || `Server error ${res.status}`);
      }

      const data = await res.json();

      if (!data.device_code) {
        throw new Error("GitHub did not return a device code. Try again.");
      }

      setDeviceCode(data.device_code);
      setUserCode(data.user_code);
      setVerificationUri(data.verification_uri || "https://github.com/login/device");
      setDeviceStep("polling");

      // Step 2: Poll until the user authorises
      const interval = (data.interval || 5) * 1000;
      pollForToken(data.device_code, interval);
    } catch (err: unknown) {
      console.error("[Device Flow Error]", err);
      setError(
        err instanceof Error
          ? err.message
          : "Failed to start GitHub login. Check your internet connection."
      );
      setDeviceStep("idle");
    }
  };

  const pollForToken = (dCode: string, interval: number) => {
    pollRef.current = setTimeout(async () => {
      try {
        // Poll via backend proxy (GitHub blocks direct browser calls)
        const res = await fetch(`${API_BASE_URL}/api/github/auth/device/token`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ device_code: dCode }),
        });

        const data = await res.json();

        if (data.access_token) {
          // Success — store and redirect
          localStorage.setItem("github_token", data.access_token);
          setDeviceStep("idle");
          router.push("/");
          return;
        }

        if (data.error === "authorization_pending" || data.error === "slow_down") {
          // Keep polling
          const nextInterval = data.error === "slow_down" ? interval + 5000 : interval;
          pollForToken(dCode, nextInterval);
          return;
        }

        if (data.error === "expired_token") {
          setError("The code expired. Please try again.");
          setDeviceStep("idle");
          return;
        }

        if (data.error === "access_denied") {
          setError("Access was denied. Please try again and approve the request.");
          setDeviceStep("idle");
          return;
        }

        // Unknown error
        setError(data.error_description || "Authentication failed. Please try again.");
        setDeviceStep("idle");
      } catch {
        // Network error — keep polling
        pollForToken(dCode, interval);
      }
    }, interval);
  };

  const cancelDeviceFlow = () => {
    if (pollRef.current) clearTimeout(pollRef.current);
    setDeviceStep("idle");
    setUserCode("");
    setDeviceCode("");
    setError("");
  };

  const copyCode = () => {
    navigator.clipboard.writeText(userCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── PAT login ──────────────────────────────────────────────────────────
  const handlePatLogin = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const token = patToken.trim();
    if (!token) {
      setError("Please enter your GitHub Personal Access Token.");
      return;
    }
    setIsVerifyingPat(true);
    setError("");
    try {
      const response = await fetch("https://api.github.com/user", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/vnd.github+json",
        },
      });
      if (!response.ok) {
        throw new Error("Invalid GitHub token or insufficient permissions.");
      }
      localStorage.setItem("github_token", token);
      router.push("/");
    } catch (err: unknown) {
      setError(
        err instanceof Error ? err.message : "Failed to verify the GitHub token."
      );
    } finally {
      setIsVerifyingPat(false);
    }
  };

  const handleDemoLaunch = () => {
    localStorage.setItem("github_token", "demo_offline_mode");
    router.push("/repo/codemind/core");
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#cccccc] flex flex-col justify-between font-sans selection:bg-[#264f78]">
      {/* VS Code-style window header */}
      <header className="h-[35px] bg-[#323233] border-b border-[#2b2b2b] px-4 flex items-center justify-between text-xs text-[#cccccc] select-none shrink-0">
        <div className="flex items-center gap-2 font-medium">
          <Code2 size={15} className="text-[#007acc]" />
          <span className="text-[#e0e0e0] font-semibold">Visual Studio CodeMind</span>
          <span className="text-[#858585] text-[11px]">— Sign In</span>
        </div>
        <div className="text-[11px] text-[#858585]">Ready</div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-[440px] w-full">
          <div className="bg-[#252526] border border-[#3c3c3c] rounded p-6 shadow-xl">
            {/* Page title */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#3c3c3c]">
              <div className="w-10 h-10 rounded bg-[#007acc] flex items-center justify-center text-white shrink-0 shadow-sm">
                <Code2 size={22} />
              </div>
              <div>
                <h1 className="text-base font-semibold text-white leading-tight">
                  Sign in to CodeMind
                </h1>
                <p className="text-xs text-[#858585] mt-0.5">
                  Select an authentication method to access workspaces
                </p>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div
                role="alert"
                className="mb-4 p-3 bg-[#5a1d1d]/30 border border-[#f14c4c]/40 rounded text-xs text-[#f14c4c] flex items-start gap-2"
              >
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <div className="font-semibold mb-0.5">Error</div>
                  <div>{error}</div>
                </div>
              </div>
            )}

            {/* ── Device flow: waiting for user to enter code ── */}
            {deviceStep === "polling" ? (
              <div className="space-y-4">
                <div className="p-4 bg-[#1e1e1e] border border-[#3c3c3c] rounded space-y-3">
                  <div className="flex items-center gap-2 text-xs text-[#cccccc] font-medium">
                    <Loader2 size={13} className="animate-spin text-[#007acc]" />
                    Waiting for you to authorise on GitHub…
                  </div>

                  <p className="text-[11px] text-[#858585]">
                    1. Open the link below (or go to{" "}
                    <strong className="text-[#cccccc]">github.com/login/device</strong>)
                  </p>
                  <p className="text-[11px] text-[#858585]">
                    2. Enter this code:
                  </p>

                  {/* Big code display */}
                  <div className="flex items-center gap-2">
                    <span className="flex-1 text-center text-xl font-mono font-bold tracking-[0.3em] text-white bg-[#0d1117] border border-[#30363d] rounded px-4 py-2">
                      {userCode}
                    </span>
                    <button
                      type="button"
                      onClick={copyCode}
                      title="Copy code"
                      className="p-2 rounded bg-[#2d2d2d] hover:bg-[#383838] border border-[#3c3c3c] text-[#858585] hover:text-white transition-colors"
                    >
                      {copied ? <CheckCircle2 size={14} className="text-[#73c991]" /> : <Copy size={14} />}
                    </button>
                  </div>

                  <a
                    href={verificationUri}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center justify-center gap-1.5 w-full h-[32px] bg-[#238636] hover:bg-[#2ea043] text-white text-xs font-medium rounded transition-colors"
                  >
                    <ExternalLink size={12} />
                    Open github.com/login/device
                  </a>
                </div>

                <button
                  type="button"
                  onClick={cancelDeviceFlow}
                  className="w-full h-[30px] text-xs text-[#858585] hover:text-[#cccccc] transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                {/* ── Normal login options ── */}
                <div className="space-y-3">
                  <button
                    type="button"
                    onClick={handleGitHubLogin}
                    disabled={deviceStep === "waiting"}
                    className="w-full h-[36px] bg-[#0e639c] hover:bg-[#1177bb] active:bg-[#0d598a] disabled:opacity-50 text-white text-xs font-medium rounded flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed"
                  >
                    {deviceStep === "waiting" ? (
                      <Loader2 size={14} className="animate-spin" />
                    ) : (
                      <Github size={16} />
                    )}
                    <span>
                      {deviceStep === "waiting"
                        ? "Connecting to GitHub…"
                        : "Continue with GitHub"}
                    </span>
                    {deviceStep === "idle" && <ArrowRight size={14} className="ml-auto" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleDemoLaunch}
                    className="w-full h-[36px] bg-[#2d2d2d] hover:bg-[#383838] border border-[#3c3c3c] text-[#cccccc] hover:text-white text-xs font-medium rounded flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Sparkles size={15} className="text-[#75beff]" />
                    <span>Launch Demo Workspace (Instant Access)</span>
                  </button>
                </div>

                {/* Divider */}
                <div className="flex items-center gap-3 my-5">
                  <div className="flex-1 h-px bg-[#3c3c3c]" />
                  <span className="text-[11px] uppercase tracking-wider text-[#858585]">Or</span>
                  <div className="flex-1 h-px bg-[#3c3c3c]" />
                </div>

                {/* Personal Access Token login */}
                {!showPatInput ? (
                  <button
                    type="button"
                    onClick={() => { setShowPatInput(true); setError(""); }}
                    className="w-full text-left p-2.5 rounded bg-[#1e1e1e] hover:bg-[#2a2d2e] border border-[#3c3c3c] flex items-center justify-between text-xs text-[#cccccc] transition-colors cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <Key size={14} className="text-[#007acc]" />
                      <span>Use Personal Access Token (PAT)</span>
                    </div>
                    <span className="text-[11px] text-[#858585]">Configure →</span>
                  </button>
                ) : (
                  <form onSubmit={handlePatLogin} className="space-y-2.5">
                    <label htmlFor="pat-token" className="block text-xs font-medium text-[#cccccc]">
                      GitHub Personal Access Token:
                    </label>
                    <input
                      id="pat-token"
                      type="password"
                      autoComplete="off"
                      value={patToken}
                      onChange={(e) => setPatToken(e.target.value)}
                      placeholder="Enter your GitHub token"
                      className="w-full h-[32px] bg-[#1e1e1e] border border-[#3c3c3c] focus:border-[#007acc] rounded px-3 text-xs text-white placeholder-[#6e7681] outline-none font-mono"
                    />
                    <p className="text-[11px] text-[#858585]">
                      Use a token with only the permissions your project needs.
                    </p>
                    <div className="flex gap-2 justify-end pt-1">
                      <button
                        type="button"
                        onClick={() => { setShowPatInput(false); setPatToken(""); setError(""); }}
                        className="px-3 h-[28px] bg-[#2d2d2d] hover:bg-[#383838] border border-[#3c3c3c] text-[#cccccc] rounded text-xs transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isVerifyingPat || !patToken.trim()}
                        className="px-4 h-[28px] bg-[#0e639c] hover:bg-[#1177bb] disabled:opacity-50 text-white rounded text-xs font-medium transition-colors"
                      >
                        {isVerifyingPat ? "Verifying…" : "Sign In with Token"}
                      </button>
                    </div>
                  </form>
                )}

                {/* Footer */}
                <div className="mt-5 pt-4 border-t border-[#3c3c3c] text-[11px] text-[#858585] flex items-center justify-between">
                  <span>VS Code Dark+ Environment</span>
                  <Link href="/signup" className="text-[#3794ff] hover:underline">
                    New user? Register
                  </Link>
                </div>
              </>
            )}
          </div>

          {/* Quick info */}
          {deviceStep === "idle" && (
            <div className="mt-3 p-3 bg-[#252526]/70 border border-[#3c3c3c]/60 rounded text-[11px] text-[#858585] space-y-1">
              <div className="flex items-center gap-1.5 text-[#cccccc]">
                <CheckCircle2 size={13} className="text-[#73c991]" />
                <span className="font-medium">No setup required</span>
              </div>
              <div>
                <strong className="text-[#cccccc]">Continue with GitHub</strong> works for any
                GitHub account — no OAuth app needed.
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Status bar */}
      <footer className="h-[22px] bg-[#007acc] text-white px-3 flex items-center justify-between text-[11px] font-mono shrink-0 select-none">
        <div className="flex items-center gap-3">
          <span>CodeMind v1.0.0</span>
          <span>● Online</span>
        </div>
        <div className="flex items-center gap-3">
          <span>UTF-8</span>
          <span>TypeScript</span>
        </div>
      </footer>
    </div>
  );
}
