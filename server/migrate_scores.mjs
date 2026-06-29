/**
 * Migration: Add decimal offsets to existing leaderboard entries so no two
 * displayScores are identical within the same mode.
 *
 * Run: node server/migrate_scores.mjs
 */
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URI = process.env.MONGO_URI || "mongodb://127.0.0.1:27017/roast-or-recruit";

function djb2Hash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

async function migrate() {
  await mongoose.connect(MONGO_URI);
  console.log("[Migration] Connected to MongoDB");

  const UsageLog = mongoose.model("UsageLog", new mongoose.Schema({}, { strict: false, collection: "usagelogs" }));

  for (const mode of ["roast", "recruit"]) {
    console.log(`\n=== Migrating ${mode} entries ===`);

    const entries = await UsageLog.find({
      mode,
      success: true,
      userEmail: { $ne: null, $ne: "", $exists: true },
    }).sort({ createdAt: 1 }).lean();

    console.log(`  Found ${entries.length} entries`);

    const usedScores = new Set();
    let updated = 0;

    for (const entry of entries) {
      let score = entry.displayScore ?? entry.score ?? 50;
      score = Math.round(score * 10) / 10;
      score = Math.min(100, Math.max(0, score));

      if (usedScores.has(score)) {
        const seed = (entry.fileName || "") + (entry.userEmail || "") + String(entry.createdAt);
        const h = djb2Hash(seed);
        const direction = h % 2 === 0 ? 1 : -1;
        let offset = 0.1;
        let candidate = score;

        for (let attempt = 0; attempt < 50; attempt++) {
          candidate = Math.round((score + direction * offset) * 10) / 10;
          if (candidate > 100) candidate = Math.round((100 - (candidate - 100)) * 10) / 10;
          if (candidate < 0) candidate = Math.round(Math.abs(candidate) * 10) / 10;
          candidate = Math.min(100, Math.max(0, candidate));
          if (!usedScores.has(candidate)) break;
          offset += 0.1;
        }

        score = candidate;
        await UsageLog.updateOne({ _id: entry._id }, { $set: { displayScore: score } });
        updated++;
      }

      usedScores.add(score);
    }

    console.log(`  Unique scores in DB: ${usedScores.size}`);
    console.log(`  Updated ${updated} entries with new decimals`);
  }

  await mongoose.disconnect();
  console.log("\n[Migration] Done!");
}

migrate().catch(err => {
  console.error("[Migration] Failed:", err);
  process.exit(1);
});
