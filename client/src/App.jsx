import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext.jsx";
import { Routes, Route, useLocation, useNavigate } from "react-router-dom";
import Header from "./components/Header.jsx";
import Footer from "./components/Footer.jsx";
import Hero from "./components/Hero.jsx";
import ModeCard from "./components/ModeCard.jsx";
import FileUpload from "./components/FileUpload.jsx";
import LoadingSpinner from "./components/LoadingSpinner.jsx";
import RoastResult from "./components/RoastResult.jsx";
import RecruitResult from "./components/RecruitResult.jsx";
import About from "./pages/About.jsx";
import Privacy from "./pages/Privacy.jsx";
import Contact from "./pages/Contact.jsx";
import Admin from "./pages/Admin.jsx";
import Leaderboard from "./pages/Leaderboard.jsx";
import Signup from "./pages/Signup.jsx";
import Login from "./pages/Login.jsx";
import VerifyOtp from "./pages/VerifyOtp.jsx";

function HomePage() {
  const { token } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState("landing");
  const [mode, setMode] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const location = useLocation();

  const selectMode = (selectedMode) => {
    if (!token) { navigate("/login"); return; }
    setMode(selectedMode);
    setStep("upload");
    setFile(null);
    setResult(null);
    setError(null);
  };

  const handleBack = () => {
    setStep("landing");
    setMode(null);
    setFile(null);
    setResult(null);
    setError(null);
  };

  const handleCancel = () => {
    setLoading(false);
    setStep("upload");
    setError("Analysis cancelled");
  };

  const handleAnalyze = async (uploadedFile) => {
    setFile(uploadedFile);
    setLoading(true);
    setStep("loading");
    setError(null);

    const formData = new FormData();
    formData.append("resume", uploadedFile);

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000);

      const endpoint = mode === "roast" ? "/api/roast" : "/api/recruit";
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      const res = await fetch(endpoint, { method: "POST", headers, body: formData, signal: controller.signal });
      clearTimeout(timeoutId);

      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        const text = await res.text().catch(() => "");
        throw new Error(
          `Server returned ${res.status} with empty/invalid body. ` +
          (text ? `Raw: "${text.substring(0, 100)}"` : "Backend may have crashed. Restart it with: node server.js")
        );
      }
      if (!res.ok) throw new Error(data.error || "Analysis failed");
      setResult(data);
      setStep("result");
    } catch (err) {
      if (err.name === "AbortError") {
        setError("Request timed out after 60s. The server or API may be overloaded.");
      } else if (err.message === "Failed to fetch" || err.message?.includes("NetworkError") || err.message?.includes("network")) {
        setError("Cannot reach the server. Make sure the backend is running (cd server && npm run dev) and restart both servers.");
      } else if (err instanceof TypeError && err.message === "Failed to fetch") {
        setError("Connection failed. The backend server may have crashed. Restart it with: node server.js");
      } else {
        setError(err.message || "An unexpected error occurred");
      }
      setStep("upload");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0A] relative overflow-hidden">
      <Header onBack={step !== "landing" ? handleBack : null} />
      <main className="relative z-10">
        {step === "landing" && (
          <>
            <Hero onSelectMode={selectMode} />
            <div className="relative z-10 max-w-6xl mx-auto px-4 pb-24 -mt-8">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold text-gray-200 mb-3">Choose Mode For You</h2>
                <p className="text-gray-500">One resume. Two completely different perspectives.</p>
              </div>
              <div className="grid md:grid-cols-2 gap-8">
                <ModeCard
                  type="roast"
                  title="Roaster Mode"
                  icon="🔥"
                  description="Get a brutally honest, humorous roast of your resume."
                  detail="Our AI analyzes your resume and delivers witty, playful roasts highlighting exaggerated claims, buzzword stuffing, and weak projects."
                  onClick={() => selectMode("roast")}
                />
                <ModeCard
                  type="recruit"
                  title="Recruiter Mode"
                  icon="👔"
                  description="Professional ATS analysis with actionable improvements."
                  detail="Get a detailed evaluation with ATS score, strengths, weaknesses, missing elements, and tailored suggestions for every section."
                  onClick={() => selectMode("recruit")}
                />
              </div>
            </div>
          </>
        )}

        {step === "upload" && (
          <div className="max-w-2xl mx-auto px-4 py-12">
            <FileUpload
              mode={mode}
              onAnalyze={handleAnalyze}
              loading={loading}
            />
            {error && (
              <div className="mt-4 p-4 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400">
                {error}
              </div>
            )}
          </div>
        )}

        {step === "loading" && <LoadingSpinner mode={mode} onCancel={handleCancel} />}

        {step === "result" && result && (
          <div className="max-w-4xl mx-auto px-4 py-12">
            {mode === "roast" ? (
              <RoastResult data={result} onBack={handleBack} />
            ) : (
              <RecruitResult data={result} onBack={handleBack} />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  const location = useLocation();

  useEffect(() => {
    fetch("/api/visit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ path: location.pathname }),
    }).catch(() => {});
  }, [location.pathname]);

  return (
    <Routes>
      <Route path="/about" element={<WithFooter><About /></WithFooter>} />
      <Route path="/privacy" element={<WithFooter><Privacy /></WithFooter>} />
      <Route path="/contact" element={<WithFooter><Contact /></WithFooter>} />
      <Route path="/admin" element={<Admin />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/login" element={<Login />} />
      <Route path="/verify-otp" element={<VerifyOtp />} />
      <Route path="*" element={<HomePage />} />
    </Routes>
  );
}

function WithFooter({ children }) {
  return (
    <>
      {children}
      <Footer />
    </>
  );
}
