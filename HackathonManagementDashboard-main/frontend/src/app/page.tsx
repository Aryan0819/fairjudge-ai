"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "../hooks/useAuth";
import {
  Users,
  Trophy,
  ShieldCheck,
  Sparkles,
  ArrowRight,
  KeyRound,
  CheckCircle2,
  Lock,
} from "lucide-react";

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();

  const demoAccounts = [
    { role: "Super Admin", email: "admin@fairjudge.com", badge: "System Admin", color: "bg-purple-100 text-purple-800 border-purple-200" },
    { role: "Organizer", email: "organizer1@fairjudge.com", badge: "Event Mgr", color: "bg-blue-100 text-blue-800 border-blue-200" },
    { role: "Judge", email: "judge1@fairjudge.com", badge: "Evaluator", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    { role: "Participant", email: "participant1@fairjudge.com", badge: "Hacker", color: "bg-amber-100 text-amber-800 border-amber-200" },
  ];

  return (
    <div className="relative overflow-hidden min-h-screen bg-gradient-to-br from-slate-50 via-indigo-50/40 to-purple-50/60">
      {/* Background Glow Blobs */}
      <div className="absolute top-10 left-10 w-96 h-96 bg-indigo-400/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-10 right-10 w-96 h-96 bg-purple-400/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-7xl mx-auto px-6 py-10 relative z-10">
        {/* Navbar */}
        <div className="flex justify-between items-center mb-16 bg-white/80 backdrop-blur-md px-6 py-4 rounded-2xl border border-slate-200/60 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-600 flex items-center justify-center text-white font-black text-xl shadow-md shadow-indigo-200">
              F
            </div>
            <span className="text-2xl font-black bg-gradient-to-r from-indigo-900 via-indigo-700 to-purple-900 bg-clip-text text-transparent tracking-tight">
              FAIRJUDGE
            </span>
          </div>
          <div>
            {user ? (
              <button 
                onClick={() => router.push("/dashboard-redirect")}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              >
                Go to Dashboard →
              </button>
            ) : (
              <div className="space-x-3 flex items-center">
                <button 
                  onClick={() => router.push("/login")}
                  className="text-slate-700 font-bold hover:text-indigo-600 px-4 py-2 rounded-xl transition hover:bg-indigo-50/60"
                >
                  Sign In
                </button>
                <button 
                  onClick={() => router.push("/register")}
                  className="bg-gradient-to-r from-indigo-600 to-violet-600 text-white px-6 py-2.5 rounded-xl font-bold hover:opacity-95 transition-all shadow-md shadow-indigo-200 hover:shadow-lg hover:-translate-y-0.5"
                >
                  Get Started
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Hero Section */}
        <div className="grid lg:grid-cols-2 gap-12 items-center py-6">
          <div>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-100/80 border border-indigo-200/60 text-indigo-700 font-semibold text-sm mb-6 shadow-xs">
              <Sparkles size={16} className="text-indigo-600 animate-pulse" />
              <span>AI-Powered Fair Evaluation Platform</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block ml-1 animate-ping"></span>
            </div>
            <h1 className="text-5xl lg:text-6xl font-black text-slate-900 leading-[1.15] tracking-tight">
              Bias-Free Judging. <br />
              <span className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                Smarter Hackathons.
              </span>
            </h1>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed font-normal">
              Eliminate unconscious bias with AI-driven reviewer routing, real-time rubric copilot, automated squad matching, and full audit logs.
            </p>
            <div className="flex flex-wrap items-center gap-4 mt-8">
              {!user && (
                <>
                  <button 
                    onClick={() => router.push("/login")}
                    className="bg-slate-900 hover:bg-slate-800 text-white px-8 py-4 rounded-xl font-bold text-base transition-all shadow-lg shadow-slate-900/10 hover:-translate-y-0.5 flex items-center gap-2"
                  >
                    Launch Demo Login <ArrowRight size={18} />
                  </button>
                  <button 
                    onClick={() => router.push("/register")}
                    className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-300 px-6 py-4 rounded-xl font-bold text-base transition-all shadow-xs hover:-translate-y-0.5"
                  >
                    Register Participant
                  </button>
                </>
              )}
            </div>

            {/* Quick Demo Credentials Assistant */}
            <div className="mt-10 p-5 rounded-2xl bg-white/90 backdrop-blur-md border border-slate-200/80 shadow-md">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-500">
                  <KeyRound size={14} className="text-indigo-600" />
                  Pre-Seeded Demo Test Accounts
                </div>
                <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">Pass: Admin@123</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                {demoAccounts.map((acc) => (
                  <button
                    key={acc.role}
                    onClick={() => router.push(`/login?email=${encodeURIComponent(acc.email)}`)}
                    className="flex flex-col p-2.5 rounded-xl border border-slate-100 hover:border-indigo-300 hover:bg-indigo-50/50 transition text-left group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-900 group-hover:text-indigo-700 transition">{acc.role}</span>
                      <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${acc.color}`}>
                        {acc.badge}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-500 mt-1 truncate">{acc.email}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <div className="bg-white/90 backdrop-blur-md rounded-3xl shadow-2xl border border-slate-200/80 p-8 grid grid-cols-2 gap-4 relative">
               <div className="bg-gradient-to-br from-blue-50 to-indigo-50/80 border border-blue-100 rounded-2xl p-6 transition-all hover:scale-[1.02]">
                 <h3 className="text-4xl font-black text-blue-600">95%</h3>
                 <p className="text-xs font-bold uppercase tracking-wider text-blue-900/70 mt-2">Skill Match Accuracy</p>
               </div>
               <div className="bg-gradient-to-br from-emerald-50 to-teal-50/80 border border-emerald-100 rounded-2xl p-6 transition-all hover:scale-[1.02]">
                 <h3 className="text-4xl font-black text-emerald-600">96%</h3>
                 <p className="text-xs font-bold uppercase tracking-wider text-emerald-900/70 mt-2">Bias Detection Rate</p>
               </div>
               <div className="col-span-2 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border border-indigo-100 rounded-2xl p-6 transition-all hover:scale-[1.01]">
                 <div className="flex items-center justify-between mb-2">
                   <h3 className="text-4xl font-black text-indigo-600">100%</h3>
                   <CheckCircle2 className="text-indigo-500" size={28} />
                 </div>
                 <p className="text-xs font-bold uppercase tracking-wider text-indigo-900/70">Immutability & Audit Trail Transparency</p>
               </div>
            </div>
          </div>
        </div>

        {/* Core Pillars Features Section */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-slate-200/60 hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6">
              <Users size={30} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Smart Team Formation</h3>
            <p className="text-slate-600 text-sm mt-3 leading-relaxed">
              AI automatically parses participant skills, experience levels, and domain preferences to form complementary, balanced squads.
            </p>
          </div>
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-slate-200/60 hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
              <Trophy size={30} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">AI-Powered Fairness</h3>
            <p className="text-slate-600 text-sm mt-3 leading-relaxed">
              Blind reviewer allocation matrices eliminate bias, with automated score normalization and rubrics.
            </p>
          </div>
          <div className="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-lg border border-slate-200/60 hover:-translate-y-1 transition-all duration-300">
            <div className="w-14 h-14 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6">
              <ShieldCheck size={30} />
            </div>
            <h3 className="text-xl font-bold text-slate-900">Real-time Bias Audits</h3>
            <p className="text-slate-600 text-sm mt-3 leading-relaxed">
              Automated NLP flags biased feedback in real-time before submission, storing complete audit trails for organizers.
            </p>
          </div>
        </div>

        {/* Step-by-Step Workflow */}
        <div className="mt-20 bg-white/90 backdrop-blur-md rounded-[32px] shadow-xl border border-slate-200/60 p-10">
          <h2 className="text-3xl font-black text-center text-slate-900 mb-10 tracking-tight">
            How FairJudge Works
          </h2>
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="text-center max-w-xs flex-1">
              <div className="w-14 h-14 bg-indigo-100 text-indigo-700 rounded-2xl flex items-center justify-center text-xl font-black mx-auto mb-4 shadow-sm">
                1
              </div>
              <h4 className="font-bold text-lg text-slate-900">Setup & Register</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Organizers publish timelines; participants upload resumes for duplicate checking and AI skill parsing.
              </p>
            </div>
            <ArrowRight className="hidden md:block text-slate-300 flex-shrink-0" size={28} />
            <div className="text-center max-w-xs flex-1">
              <div className="w-14 h-14 bg-purple-100 text-purple-700 rounded-2xl flex items-center justify-center text-xl font-black mx-auto mb-4 shadow-sm">
                2
              </div>
              <h4 className="font-bold text-lg text-slate-900">AI Team Formation</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Auto-assign complementary squads or join manual teams. Upload project code directly to Drive storage.
              </p>
            </div>
            <ArrowRight className="hidden md:block text-slate-300 flex-shrink-0" size={28} />
            <div className="text-center max-w-xs flex-1">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-700 rounded-2xl flex items-center justify-center text-xl font-black mx-auto mb-4 shadow-sm">
                3
              </div>
              <h4 className="font-bold text-lg text-slate-900">Fair Judging & Audit</h4>
              <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                Judges score with AI copilot assistance and automated bias detection, feeding normalized leaderboards.
              </p>
            </div>
          </div>
        </div>

        <footer className="text-center mt-20 pb-8 border-t border-slate-200/60 pt-8">
          <div className="text-xl font-black text-indigo-900/40 mb-3 tracking-wider">FAIRJUDGE PLATFORM</div>
          <div className="flex justify-center gap-6 text-xs font-medium text-slate-500">
            <span>Built for Unbiased Hackathon Judging</span>
            <span>•</span>
            <span>AI Copilot Active</span>
            <span>•</span>
            <span>Google Drive Integrated</span>
          </div>
        </footer>
      </div>
    </div>
  );
}