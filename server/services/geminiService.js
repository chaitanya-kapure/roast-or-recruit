import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";
import UsageLog from "../models/UsageLog.js";

const MODEL = "gemini-2.5-flash";
const TIMEOUT_MS = 30000;
const MAX_OUTPUT_TOKENS = 2048;

const cache = new Map();

const ROAST_SYSTEM_PROMPT = `You are a witty senior engineer roasting a resume. Be humorous but constructive. Return ONLY valid JSON:
{
  "summary": "short funny review",
  "roasts": ["roast 1", "roast 2"],
  "brutalityScore": 0-100,
  "verdict": "funny one-liner"
}
Rules: 5-8 roast points. No markdown. JSON only.`;

const RECRUIT_SYSTEM_PROMPT = `You are a technical recruiter evaluating a resume. Return ONLY valid JSON:
{
  "atsScore": 0-100,
  "summary": "brief evaluation",
  "strengths": ["s1"],
  "weaknesses": ["w1"],
  "missingElements": ["m1"],
  "improvements": {"skills":"","projects":"","experience":"","education":""},
  "projectFeedback": [{"name":"","feedback":"","rating":"Good|Average|Poor"}],
  "recommendation": "Strong Candidate|Consider for Interview|Needs Improvement"
}
Rules: 3-5 each. No markdown. JSON only.`;

function analyzeResumeContent(resumeText) {
  const text = resumeText.toLowerCase();
  const lines = resumeText.split(/\n/);
  const paragraphs = lines.filter(l => l.trim().length > 0);
  const sentences = resumeText.split(/[.!?]+/).filter(s => s.trim().length > 5);
  const words = resumeText.split(/\s+/).filter(w => w.length > 0);
  const wordCount = words.length;
  const uniqueWords = new Set(words.map(w => w.toLowerCase().replace(/[^a-z0-9]/g, ""))).size;
  const avgWordLength = words.length ? words.reduce((sum, w) => sum + w.length, 0) / words.length : 0;

  let achievementCount = 0;
  let metricCount = 0;
  let technicalSkillCount = 0;
  let softSkillCount = 0;
  let sectionCount = 0;
  let formattingIssues = 0;
  let grammarHints = 0;

  const techKeywords = ["javascript","python","java","react","node","angular","vue","typescript","rust","go","golang","c++","c#","ruby","php","swift","kotlin","sql","mongodb","postgres","mysql","redis","aws","azure","gcp","docker","kubernetes","kafka","graphql","rest","api","git","linux","ci/cd","terraform","ansible","html","css","sass","flutter","react native","next.js","express","django","flask","spring"];
  const softKeywords = ["leadership","communication","teamwork","collaboration","problem-solving","problem solving","mentoring","agile","scrum","jira","time management","presentation","negotiation","adaptability","critical thinking","passionate","dedicated","motivated"];
  const achievementPatterns = [/\d+%/g, /\$[\d,]+/g, /\d+x/g, /\d+\+?\s*(years?|months?|users?|clients?|projects?|team|members?|requests?)\b/gi, /increased?\s+\w+/gi, /reduced?\s+\w+/gi, /improved?\s+\w+/gi, /led\s+a\s+team/gi, /managed\s+\$?\d/gi, /built\s+\w+/gi, /deployed?\s+\w+/gi, /launched?\s+\w+/gi];

  achievementPatterns.forEach(p => { const m = resumeText.match(p); if (m) achievementCount += m.length; });
  metricCount = (resumeText.match(/\d+/g) || []).length;
  techKeywords.forEach(k => { if (text.includes(k)) technicalSkillCount++; });
  softKeywords.forEach(k => { if (text.includes(k)) softSkillCount++; });

  const sectionHeaders = ["experience","education","skills","projects","summary","objective","certifications","achievements","awards","publications","work","employment","contact"];
  sectionHeaders.forEach(h => { if (text.includes(h)) sectionCount++; });

  if (wordCount < 200) formattingIssues += 3;
  else if (wordCount < 400) formattingIssues += 1;
  if (paragraphs.length < 5) formattingIssues += 2;
  if (avgWordLength < 4) formattingIssues += 1;

  const pronouns = ["i ", "my ", "me "];
  pronouns.forEach(p => { if (text.includes(p)) grammarHints++; });
  if (text.includes("passionate")) grammarHints += 2;
  if (text.includes("team player")) grammarHints += 2;

  return {
    wordCount, uniqueWords, avgWordLength,
    sentenceCount: sentences.length,
    paragraphCount: paragraphs.length,
    achievementCount, metricCount,
    technicalSkillCount, softSkillCount,
    sectionCount, formattingIssues, grammarHints,
  };
}

function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) - hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

async function findExistingScores(mode) {
  try {
    const scores = await UsageLog.distinct("score", { mode, success: true, score: { $ne: null } }).lean();
    return new Set(scores);
  } catch {
    return new Set();
  }
}

function pickScoreNear(base, existingScores, min, max) {
  let score = base;
  let attempts = 0;
  while (existingScores.has(score) && attempts < 50) {
    score = score + (attempts % 2 === 0 ? 1 : -1) * Math.ceil((attempts + 1) / 2);
    if (score > max) score = min + (score - max);
    if (score < min) score = max - (min - score);
    attempts++;
  }
  return Math.min(max, Math.max(min, score));
}

async function fallbackRoast(resumeText) {
  const content = analyzeResumeContent(resumeText);
  const h = hashString(resumeText);

  let baseScore = 30;
  baseScore += Math.min(25, content.achievementCount * 2);
  baseScore += Math.min(15, content.technicalSkillCount * 2);
  baseScore += Math.min(10, content.sectionCount);
  baseScore -= Math.min(15, content.formattingIssues * 3);
  baseScore -= Math.min(10, content.grammarHints * 2);
  baseScore -= Math.min(10, Math.max(0, 300 - content.wordCount) * 0.02);
  baseScore += Math.min(5, content.paragraphCount * 0.5);

  baseScore = Math.min(100, Math.max(15, baseScore));
  baseScore = Math.round(baseScore);

  const existingScores = await findExistingScores("roast");
  const brutalityScore = pickScoreNear(baseScore, existingScores, 15, 100);

  const roasts = [];
  if (content.wordCount < 200) roasts.push("Your resume is shorter than a tweet. We expected at least a paragraph.");
  else if (content.wordCount < 400) roasts.push("Your resume is thin. Add more detail or we'll assume you did nothing.");
  else if (content.wordCount > 800) roasts.push("Your resume is longer than a novel. We needed a snack break halfway through.");
  if (content.uniqueWords < 60) roasts.push("Your vocabulary is narrower than a hallway.");
  if (content.technicalSkillCount < 3) roasts.push("Your tech skills section reads like a beginner's wish list.");
  if (content.achievementCount < 3) roasts.push("No measurable achievements. We can't tell if you worked or just showed up.");
  if (content.formattingIssues > 1) roasts.push("Your formatting is inconsistent — pick a style and commit.");
  if (content.grammarHints > 2) roasts.push("Overuse of 'passionate' and 'team player' detected. Try 'accomplished' and 'led'.");
  if (content.sectionCount < 4) roasts.push("Missing standard resume sections. Your resume looks like a note, not a CV.");

  const genericRoasts = [
    "Your experience section reads like a grocery list — items with no recipe.",
    "Buzzword density is critically high. We found 'synergy' adjacent energy.",
    "Your project descriptions are so vague they could describe a toaster.",
    "You claimed 'led a team' but 'was present for' seems more truthful.",
    "Your GPA is mentioned but so is 'proficient in Microsoft Word' — we see the pattern.",
    "Skills listed but no proof of using them. That's like saying you can fly.",
    "Your career objective is longer than your experience section.",
  ];
  while (roasts.length < 5) roasts.push(genericRoasts[roasts.length % genericRoasts.length]);

  const verdicts = [
    "Your resume isn't bad — it's just that 'entry-level' is written in invisible ink.",
    "This resume has potential. Unfortunately, potential doesn't show up on the leaderboard.",
    "You had us at the header. Then we kept reading.",
    "Your resume is the equivalent of a plot twist that never comes.",
    "It's not terrible. But 'not terrible' is a low bar.",
  ];

  return {
    summary: "Your resume has some structure but lacks the depth to stand out in a competitive market.",
    roasts: roasts.slice(0, 7),
    brutalityScore,
    verdict: verdicts[h % verdicts.length],
  };
}

async function fallbackRecruit(resumeText) {
  const content = analyzeResumeContent(resumeText);

  let baseScore = 25;
  baseScore += Math.min(20, content.achievementCount * 3);
  baseScore += Math.min(15, content.technicalSkillCount * 2);
  baseScore += Math.min(10, content.sectionCount);
  baseScore += Math.min(10, content.wordCount > 300 ? 8 : content.wordCount > 150 ? 4 : 0);
  baseScore += Math.min(5, content.metricCount * 0.3);
  baseScore -= Math.min(20, content.formattingIssues * 5);
  baseScore -= Math.min(10, content.grammarHints * 2);
  baseScore += Math.min(5, content.softSkillCount);

  baseScore = Math.min(100, Math.max(15, baseScore));
  baseScore = Math.round(baseScore);

  const existingScores = await findExistingScores("recruit");
  const atsScore = pickScoreNear(baseScore, existingScores, 15, 100);

  const strengths = [];
  const weaknesses = [];
  const missingElements = [];

  if (content.wordCount >= 300) strengths.push("Adequate resume length with sufficient detail");
  else { weaknesses.push("Resume is too short — lacks sufficient detail"); missingElements.push("More detailed experience descriptions"); }
  if (content.achievementCount >= 5) strengths.push(`Contains ${content.achievementCount} quantified achievements`);
  else if (content.achievementCount >= 2) strengths.push("Some quantified achievements present");
  else { weaknesses.push("Lacks quantified achievements"); missingElements.push("Quantified achievements (numbers, percentages)"); }
  if (content.technicalSkillCount >= 5) strengths.push(`${content.technicalSkillCount} technical skills listed`);
  else if (content.technicalSkillCount >= 2) strengths.push("Some technical skills listed");
  else { weaknesses.push("Limited technical skills listed"); missingElements.push("Technical skills section with relevant technologies"); }
  if (content.sectionCount >= 5) strengths.push("Well-organized with multiple sections");
  else if (content.sectionCount >= 3) strengths.push("Basic resume structure present");
  else { weaknesses.push("Missing standard resume sections"); missingElements.push("Standard sections: Experience, Education, Skills"); }

  const text = resumeText.toLowerCase();
  if (text.includes("linkedin")) strengths.push("LinkedIn profile included");
  else missingElements.push("LinkedIn profile URL");
  if (text.includes("github")) strengths.push("GitHub profile included");
  else weaknesses.push("No GitHub/portfolio linked");
  if (text.includes("certification") || text.includes("certified")) strengths.push("Certifications mentioned");
  else missingElements.push("Relevant certifications");
  if (content.softSkillCount >= 2) strengths.push("Soft skills demonstrated");
  else weaknesses.push("No evidence of soft skills or teamwork");
  if (content.formattingIssues > 2) weaknesses.push("Formatting inconsistencies detected");

  while (strengths.length < 3) {
    const extra = ["Professional formatting and layout", "Clear contact information", "Relevant educational background"];
    strengths.push(extra[strengths.length % extra.length]);
  }
  while (weaknesses.length < 3) {
    const extra = ["Could improve section organization", "Needs more specific technical details", "Experience section could be stronger"];
    weaknesses.push(extra[weaknesses.length % extra.length]);
  }

  let recommendation;
  if (atsScore >= 75) recommendation = "Strong Candidate";
  else if (atsScore >= 55) recommendation = "Consider for Interview";
  else recommendation = "Needs Improvement";

  return {
    atsScore,
    summary: `Resume evaluates to ${atsScore}/100. ${content.wordCount} words, ${content.achievementCount} achievements, ${content.technicalSkillCount} technical skills.`,
    strengths: strengths.slice(0, 5),
    weaknesses: weaknesses.slice(0, 5),
    missingElements: missingElements.slice(0, 5),
    improvements: {
      skills: content.technicalSkillCount < 5 ? "Add more relevant technical skills to your skills section." : "Group skills by proficiency level.",
      projects: "Add technical details: frameworks used, your specific role, and measurable outcomes.",
      experience: content.achievementCount < 5 ? "Add quantified achievements with numbers and percentages." : "Use STAR format for stronger impact.",
      education: "Add relevant coursework and GPA only if above 3.5.",
    },
    projectFeedback: [
      { name: "General", feedback: content.achievementCount < 5 ? "Projects need quantifiable results and technical depth." : "Good use of metrics. Consider adding more context.", rating: content.achievementCount >= 5 ? "Good" : "Average" },
    ],
    recommendation,
  };
}

export class GeminiService {
  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set in environment variables");
    }
    if (apiKey === "your_gemini_api_key_here") {
      throw new Error("GEMINI_API_KEY is still set to the placeholder value.");
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  getCacheKey(systemPrompt, resumeText) {
    return crypto.createHash("md5").update(systemPrompt + resumeText).digest("hex");
  }

  async generateContent(systemPrompt, resumeText, fallbackFn) {
    const cacheKey = this.getCacheKey(systemPrompt, resumeText);
    if (cache.has(cacheKey)) {
      console.log(`[GeminiService] Cache hit, returning cached result`);
      return { data: cache.get(cacheKey), cached: true };
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT_MS);

    try {
      console.log(`[GeminiService] Model: ${MODEL} | Resume: ${resumeText.length} chars | System prompt: ${systemPrompt.length} chars`);

      const response = await this.ai.models.generateContent({
        model: MODEL,
        contents: [{ role: "user", parts: [{ text: resumeText }] }],
        config: {
          systemInstruction: systemPrompt,
          temperature: 0.5,
          maxOutputTokens: MAX_OUTPUT_TOKENS,
        },
      });

      clearTimeout(timeoutId);

      if (!response || !response.text) {
        throw new Error("empty response");
      }

      const rawText = response.text.trim();
      console.log(`[GeminiService] Response: ${rawText.length} chars`);

      const cleaned = rawText
        .replace(/^```(?:json)?\s*/i, "")
        .replace(/\s*```$/i, "")
        .trim();

      const parsed = JSON.parse(cleaned);
      if (!parsed || typeof parsed !== "object") {
        throw new Error("parsed response is not an object");
      }
      cache.set(cacheKey, parsed);
      console.log(`[GeminiService] Success (cache size: ${cache.size})`);
      return { data: parsed, cached: false };

    } catch (err) {
      clearTimeout(timeoutId);

      const isQuota = err.message?.includes("429") || err.message?.includes("quota") || err.message?.includes("Quota");
      const isOverload = err.message?.includes("503") || err.message?.includes("UNAVAILABLE");
      const isKeyError = err.message?.includes("API_KEY") || err.message?.includes("API key");
      const isTimeout = err.name === "AbortError";

      if (isKeyError) {
        throw new Error(`Gemini API key error: ${err.message}`);
      }

      console.log(`[GeminiService] Using local fallback (${isQuota ? 'quota' : isOverload ? 'overload' : isTimeout ? 'timeout' : 'error'})`);
      const fallback = fallbackFn(resumeText);
      if (!fallback) {
        throw new Error("Fallback function returned null/undefined");
      }
      cache.set(cacheKey, fallback);
      return { data: fallback, cached: false };
    }
  }

  async analyzeRoast(resumeText) {
    return this.generateContent(ROAST_SYSTEM_PROMPT, resumeText, (text) => fallbackRoast(text));
  }

  async analyzeRecruit(resumeText) {
    return this.generateContent(RECRUIT_SYSTEM_PROMPT, resumeText, (text) => fallbackRecruit(text));
  }
}

export function createGeminiService() {
  return new GeminiService();
}
