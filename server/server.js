import "dotenv/config";
import express from "express";
import cors from "cors";
import compression from "compression";
import path from "path";
import { fileURLToPath } from "url";
import { connectDb } from "./services/db.js";
import analyzeRouter from "./routes/analyze.js";
import authRouter from "./routes/auth.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

if (!process.env.JWT_SECRET) {
  console.error("[FATAL] JWT_SECRET environment variable is required");
  process.exit(1);
}

process.on("unhandledRejection", (reason) => {
  console.error("[FATAL] Unhandled Rejection:", reason);
  process.exit(1);
});
process.on("uncaughtException", (err) => {
  console.error("[FATAL] Uncaught Exception:", err);
  process.exit(1);
});

const app = express();
const PORT = process.env.PORT || 5000;
app.set("trust proxy", 1);

const corsOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map(s => s.trim())
  : ["http://localhost:5173", "http://127.0.0.1:5173"];
app.use(cors({ origin: corsOrigins, credentials: true }));
app.use(compression());
app.use(express.json({ limit: "10mb" }));

app.use((req, res, next) => {
  const originalJson = res.json.bind(res);
  res.json = function (body) {
    try {
      const preview = body ? JSON.stringify(body).substring(0, 200) : "(empty)";
      console.log(`[Response] ${req.method} ${req.url} -> ${preview}`);
    } catch (_) {}
    return originalJson(body);
  };
  next();
});

app.use("/api", analyzeRouter);
app.use("/api/auth", authRouter);

const clientDist = path.join(__dirname, "..", "client", "dist");
app.use(express.static(clientDist));
// SPA fallback — only for non-API routes
app.get(/^\/(?!api\/).*/, (req, res) => {
  res.sendFile(path.join(clientDist, "index.html"));
});

app.use((err, req, res, next) => {
  console.error("[Express Error]", err.stack || err.message || err);
  if (res.headersSent) return;
  res.status(500).json({ error: err.message || "Internal server error" });
});

connectDb().then(() => {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
});
