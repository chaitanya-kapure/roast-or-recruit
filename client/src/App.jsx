import { useState, useEffect } from "react";
import { useAuth } from "./context/AuthContext.jsx";
import { useTheme } from "./context/ThemeContext.jsx";
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
import ForgotPassword from "./pages/ForgotPassword.jsx";
import Profile from "./pages/Profile.jsx";

function HomePage() {
  const { token } = useAuth();
  const { setMode, isRoast } = useTheme();
  const navigate = useNavigate();
  const [step, setStep] = useState("landing");
  const [appMode, setAppMode] = useState(null);
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const location = useLocation();

  const selectMode = (selectedMode) => {
    if (!token) { navigate("/login"); return; }
    setMode(selectedMode);
    setAppMode(selectedMode);
    setStep("upload");
    setFile(null);
    setResult(null);
    setError(null);
  };

  const handleBack = () => {
    setStep("landing");
    setAppMode(null);
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

      const endpoint = appMode === "roast" ? "/api/roast" : "/api/recruit";
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
    <div style={{ backgroundColor: "var(--bg-primary)", minHeight: "100vh", position: "relative", overflow: "hidden" }}>
      <Header onBack={step !== "landing" ? handleBack : null} />
      <main className="relative z-10">
        {step === "landing" && (
          <>
            <Hero />
            <div className="relative z-10 max-w-6xl mx-auto px-4 pb-24 -mt-8">
              <div className="text-center mb-12">
                <h2 className="text-2xl md:text-3xl font-bold mb-3" style={{ color: "var(--text-primary)" }}>Choose Your Experience</h2>
                <p style={{ color: "var(--text-muted)" }}>One resume. Two completely different perspectives.</p>
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
              mode={appMode}
              onAnalyze={handleAnalyze}
              loading={loading}
            />
            {error && (
              <div className="mt-4 p-4 rounded-xl" style={{ backgroundColor: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.3)", color: "#EF4444" }}>
                {error}
              </div>
            )}
          </div>
        )}

        {step === "loading" && <LoadingSpinner mode={appMode} onCancel={handleCancel} />}

        {step === "result" && result && (
          <div className="max-w-4xl mx-auto px-4 py-12">
            {appMode === "roast" ? (
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
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/profile" element={<Profile />} />
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
