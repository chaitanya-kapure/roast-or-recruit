import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "lucide-react";

const policies = [
  "Resumes are analyzed only for generating feedback.",
  "User data is not sold.",
  "Uploaded resumes are not shared with third parties.",
  "Personal information remains private.",
  "AI-generated feedback is intended for educational and professional improvement purposes.",
];

export default function Privacy() {
  return (
    <div className="min-h-screen bg-[#0A0A0A]">
      <div className="max-w-4xl mx-auto px-4 py-16">
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl backdrop-blur-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all text-sm text-gray-300 hover:text-white mb-10"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>

        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 mb-6">
            <ShieldCheck className="w-8 h-8 text-purple-400" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black mb-4 bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-purple-400 to-blue-400">
            Privacy Policy
          </h1>
          <p className="text-gray-500 text-sm">
            Your privacy matters. Here is how we handle your data.
          </p>
        </div>

        <div className="glass-card rounded-2xl p-8 md:p-10">
          <div className="space-y-6">
            {policies.map((policy, i) => (
              <div
                key={i}
                className="flex items-start gap-4 p-4 rounded-xl backdrop-blur-xl bg-white/[0.02] border border-white/[0.06]"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center shrink-0 mt-0.5">
                  <span className="text-purple-400 text-sm font-bold">{i + 1}</span>
                </div>
                <p className="text-gray-300 text-sm leading-relaxed">{policy}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
