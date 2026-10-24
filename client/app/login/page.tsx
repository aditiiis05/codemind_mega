'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
<<<<<<< HEAD
import { Github, Code2, ArrowRight, Sparkles, Key, CheckCircle2, AlertCircle } from 'lucide-react';
=======
import { Github, Brain, Code, Zap, Loader, ArrowRight, UserPlus } from 'lucide-react';
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
import Link from 'next/link';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:4000';

export default function LoginPage() {
  const router = useRouter();
  const [isSigningIn, setIsSigningIn] = useState(false);
<<<<<<< HEAD
  const [patToken, setPatToken] = useState('');
  const [isVerifyingPat, setIsVerifyingPat] = useState(false);
  const [error, setError] = useState('');
  const [showPatInput, setShowPatInput] = useState(false);
=======
  const [error, setError] = useState('');
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2

  // Check if already authenticated
  useEffect(() => {
    const token = localStorage.getItem('github_token');
    if (token) {
      router.push('/');
    }
  }, [router]);

  const handleGitHubLogin = async () => {
    setIsSigningIn(true);
    setError('');
    try {
      console.log('[Login] Requesting GitHub OAuth URL from backend...');
      const response = await fetch(`${API_BASE_URL}/api/github/auth/github-url`, {
        method: 'GET',
        headers: { 'Content-Type': 'application/json' },
      });

<<<<<<< HEAD
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        throw new Error(data.error || `Backend returned status ${response.status}`);
      }

=======
      if (!response.ok) {
        throw new Error(`Backend returned status ${response.status}`);
      }

      const data = await response.json();
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
      if (!data.url) {
        throw new Error('No OAuth URL returned from backend');
      }

      console.log('[Login] Redirecting to GitHub OAuth...');
      window.location.href = data.url;
    } catch (error: unknown) {
      console.error('[Login Error]', error);
<<<<<<< HEAD
      setError(
        error instanceof Error
          ? error.message
          : 'Failed to initiate GitHub login. Please verify server/.env configuration or use a Personal Access Token / Demo Mode below.'
      );
=======
      setError(error instanceof Error ? error.message : 'Failed to initiate GitHub login. Please try again.');
>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
      setIsSigningIn(false);
    }
  };

<<<<<<< HEAD
  const handlePatLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!patToken.trim()) return;

    setIsVerifyingPat(true);
    setError('');

    try {
      const res = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `token ${patToken.trim()}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (!res.ok) {
        throw new Error('Invalid GitHub token or insufficient permissions.');
      }

      localStorage.setItem('github_token', patToken.trim());
      router.push('/');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to verify token');
    } finally {
      setIsVerifyingPat(false);
    }
  };

  const handleDemoLaunch = () => {
    // Set a lightweight mock token for demo exploration
    localStorage.setItem('github_token', 'demo_offline_mode');
    router.push('/repo/codemind/core');
  };

  return (
    <div className="min-h-screen bg-[#1e1e1e] text-[#cccccc] flex flex-col justify-between font-sans selection:bg-[#264f78]">
      {/* Top VS Code Style Window Header */}
      <header className="h-[35px] bg-[#323233] border-b border-[#2b2b2b] px-4 flex items-center justify-between text-xs text-[#cccccc] select-none shrink-0">
        <div className="flex items-center gap-2 font-medium">
          <Code2 size={15} className="text-[#007acc]" />
          <span className="text-[#e0e0e0] font-semibold">Visual Studio CodeMind</span>
          <span className="text-[#858585] text-[11px]">— Sign In</span>
        </div>
        <div className="text-[11px] text-[#858585]">
          Ready
        </div>
      </header>

      {/* Main Centered Content */}
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-[440px] w-full">
          {/* Main Card */}
          <div className="bg-[#252526] border border-[#3c3c3c] rounded p-6 shadow-xl">
            {/* Visual Studio Header */}
            <div className="flex items-center gap-3 mb-6 pb-4 border-b border-[#3c3c3c]">
              <div className="w-10 h-10 rounded bg-[#007acc] flex items-center justify-center text-white shrink-0 shadow-sm">
                <Code2 size={22} />
              </div>
              <div>
                <h1 className="text-base font-semibold text-[#ffffff] leading-tight">
                  Sign in to CodeMind
                </h1>
                <p className="text-xs text-[#858585] mt-0.5">
                  Select an authentication method to access workspaces
                </p>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-[#5a1d1d]/30 border border-[#f14c4c]/40 rounded text-xs text-[#f14c4c] flex items-start gap-2">
                <AlertCircle size={15} className="shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <div className="font-semibold mb-0.5">Authentication Notice</div>
                  <div>{error}</div>
                </div>
              </div>
            )}

            {/* Primary Action: GitHub OAuth */}
            <div className="space-y-3">
              <button
                onClick={handleGitHubLogin}
                disabled={isSigningIn}
                className="w-full h-[36px] bg-[#0e639c] hover:bg-[#1177bb] active:bg-[#0d598a] disabled:opacity-50 text-white text-xs font-medium rounded flex items-center justify-center gap-2 transition-colors cursor-pointer disabled:cursor-not-allowed"
              >
                <Github size={16} />
                <span>{isSigningIn ? 'Connecting to GitHub...' : 'Continue with GitHub OAuth'}</span>
                <ArrowRight size={14} className="ml-auto" />
              </button>

              {/* Direct Demo / Workspace Launch */}
              <button
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

            {/* Personal Access Token Option */}
            {!showPatInput ? (
              <button
                onClick={() => setShowPatInput(true)}
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
                <label className="block text-xs font-medium text-[#cccccc]">
                  GitHub Personal Access Token:
                </label>
                <div className="relative">
                  <input
                    type="password"
                    value={patToken}
                    onChange={(e) => setPatToken(e.target.value)}
                    placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                    className="w-full h-[32px] bg-[#1e1e1e] border border-[#3c3c3c] focus:border-[#007acc] rounded px-3 text-xs text-white placeholder-[#6e7681] outline-none font-mono"
                  />
                </div>
                <div className="flex gap-2 justify-end pt-1">
                  <button
                    type="button"
                    onClick={() => setShowPatInput(false)}
                    className="px-3 h-[28px] bg-[#2d2d2d] hover:bg-[#383838] border border-[#3c3c3c] text-[#cccccc] rounded text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isVerifyingPat || !patToken.trim()}
                    className="px-4 h-[28px] bg-[#0e639c] hover:bg-[#1177bb] disabled:opacity-50 text-white rounded text-xs font-medium transition-colors"
                  >
                    {isVerifyingPat ? 'Verifying...' : 'Sign In with Token'}
                  </button>
                </div>
              </form>
            )}

            {/* Footer Notes */}
            <div className="mt-5 pt-4 border-t border-[#3c3c3c] text-[11px] text-[#858585] flex items-center justify-between">
              <span>VS Code Dark+ Environment</span>
              <Link href="/signup" className="text-[#3794ff] hover:underline">
                New user? Register
              </Link>
            </div>
          </div>

          {/* Quick Info Box */}
          <div className="mt-3 p-3 bg-[#252526]/70 border border-[#3c3c3c]/60 rounded text-[11px] text-[#858585] space-y-1">
            <div className="flex items-center gap-1.5 text-[#cccccc]">
              <CheckCircle2 size={13} className="text-[#73c991]" />
              <span className="font-medium">Direct workspace support</span>
            </div>
            <div>
              Click <strong className="text-[#cccccc]">Launch Demo Workspace</strong> to jump straight into the full Monaco IDE, Flowchart visualizer, and Copilot tools without needing credentials.
            </div>
          </div>
        </div>
      </main>

      {/* VS Code Blue Status Bar */}
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
=======
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0d1117] via-[#1a1a2e] to-[#16213e] flex flex-col items-center justify-center p-4 relative overflow-hidden">
      {/* Animated background orbs */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse" style={{ animation: 'pulse 8s ease-in-out infinite' }} />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ animation: 'pulse 8s ease-in-out 2s infinite' }} />

      <div className="relative z-10 max-w-md w-full">
        {/* Logo Section */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-[#f0f6fc]">CodeMind.AI</h1>
          </div>
          <p className="text-[#7d8590] text-sm leading-relaxed">
            Welcome back! Sign in to continue your coding journey.
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-[#161b22]/80 backdrop-blur-sm border border-[#30363d] rounded-xl p-8 shadow-2xl">
          <h2 className="text-2xl font-bold text-[#f0f6fc] mb-2">Sign In</h2>
          <p className="text-[#7d8590] text-sm mb-6">
            Use your GitHub account to access your repositories
          </p>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-500/10 border border-red-500/50 rounded-lg text-red-300 text-sm">
              {error}
            </div>
          )}

          {/* Sign In Button */}
          <button
            onClick={handleGitHubLogin}
            disabled={isSigningIn}
            className="w-full bg-gradient-to-r from-[#2f81f7] to-[#1f6feb] hover:from-[#1f6feb] hover:to-[#0d47a1] disabled:from-gray-600 disabled:to-gray-500 text-white font-semibold py-3.5 px-6 rounded-lg flex items-center justify-center gap-3 transition-all duration-300 transform hover:scale-105 active:scale-95 shadow-lg disabled:transform-none disabled:cursor-not-allowed"
          >
            {isSigningIn ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                Signing in...
              </>
            ) : (
              <>
                <Github size={20} />
                Sign in with GitHub
                <ArrowRight size={18} className="ml-auto" />
              </>
            )}
          </button>

          {/* Divider */}
          <div className="flex items-center gap-4 my-6">
            <div className="flex-1 h-px bg-[#30363d]"></div>
            <span className="text-[#7d8590] text-xs">OR</span>
            <div className="flex-1 h-px bg-[#30363d]"></div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-[#7d8590] text-sm">
              Don&apos;t have an account?{' '}
              <Link 
                href="/signup" 
                className="text-[#2f81f7] hover:text-[#1f6feb] font-medium transition-colors inline-flex items-center gap-1"
              >
                Sign up
                <UserPlus size={14} />
              </Link>
            </p>
          </div>
        </div>

        {/* Features Preview */}
        <div className="mt-8 space-y-3">
          <div className="flex items-start gap-4 p-4 rounded-lg bg-[#161b22]/50 backdrop-blur-sm border border-[#30363d]/50 hover:border-[#2f81f7]/50 transition-all">
            <div className="p-2 bg-blue-500/20 rounded-lg flex-shrink-0">
              <Code className="w-5 h-5 text-[#2f81f7]" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#f0f6fc]">Access Your Repos</h3>
              <p className="text-xs text-[#7d8590] mt-1">Browse and edit your GitHub repositories seamlessly</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg bg-[#161b22]/50 backdrop-blur-sm border border-[#30363d]/50 hover:border-purple-500/50 transition-all">
            <div className="p-2 bg-purple-500/20 rounded-lg flex-shrink-0">
              <Brain className="w-5 h-5 text-purple-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#f0f6fc]">AI-Powered Analysis</h3>
              <p className="text-xs text-[#7d8590] mt-1">Get intelligent insights and code suggestions</p>
            </div>
          </div>

          <div className="flex items-start gap-4 p-4 rounded-lg bg-[#161b22]/50 backdrop-blur-sm border border-[#30363d]/50 hover:border-green-500/50 transition-all">
            <div className="p-2 bg-green-500/20 rounded-lg flex-shrink-0">
              <Zap className="w-5 h-5 text-green-400" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-[#f0f6fc]">Professional IDE</h3>
              <p className="text-xs text-[#7d8590] mt-1">Monaco editor with full syntax highlighting</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

>>>>>>> 1fedef5cdf2fa8631c20411f700509b8bbdcb0e2
