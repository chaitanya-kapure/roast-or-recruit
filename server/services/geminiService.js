import crypto from "crypto";
import { GoogleGenAI } from "@google/genai";

const MODEL = "gemini-2.5-flash-lite";
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

function fallbackRoast() {
  return {
    summary: "Your resume is like a movie trailer that spoils the only good scene in the first 10 seconds.",
    roasts: [
      "You listed 'expert' in 8 technologies but your projects suggest 'acquainted' is more accurate.",
      "Your experience section reads like a grocery list — items with no recipe.",
      "Buzzword density is critically high. We found 'synergy' adjacent energy.",
      "Your project descriptions are so vague they could describe a toaster.",
      "You claimed 'led a team' but 'was present for' seems more truthful.",
      "The word 'passionate' appears more times than actual accomplishments.",
      "Your GPA is mentioned but so is 'proficient in Microsoft Word' — we see the pattern.",
    ],
    brutalityScore: 72,
    verdict: "Your resume isn't bad — it's just that 'entry-level' is written in invisible ink.",
  };
}

function fallbackRecruit() {
  return {
    atsScore: 58,
    summary: "The resume shows foundational knowledge but lacks quantifiable impact and structured presentation. ATS optimization is needed.",
    strengths: [
      "Good breadth of modern technologies listed",
      "Clear educational background",
      "Relevant internship experience",
    ],
    weaknesses: [
      "Experience descriptions lack metrics and outcomes",
      "Project descriptions are too brief",
      "No links to portfolio or GitHub",
    ],
    missingElements: [
      "Quantified achievements (numbers, percentages)",
      "LinkedIn profile URL",
      "Certifications or relevant coursework",
      "Tailored keywords for target role",
    ],
    improvements: {
      skills: "Group skills by proficiency and remove generic buzzwords like 'team player'.",
      projects: "Add technical details: which frameworks, your specific role, measurable outcomes.",
      experience: "Use STAR format: Situation, Task, Action, Result with concrete numbers.",
      education: "Add relevant coursework, projects, GPA only if above 3.5.",
    },
    projectFeedback: [
      { name: "General", feedback: "Projects need more technical depth and quantifiable results.", rating: "Average" },
    ],
    recommendation: "Needs Improvement",
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
      const fallback = fallbackFn();
      if (!fallback) {
        throw new Error("Fallback function returned null/undefined");
      }
      cache.set(cacheKey, fallback);
      return { data: fallback, cached: false };
    }
  }

  async analyzeRoast(resumeText) {
    return this.generateContent(ROAST_SYSTEM_PROMPT, resumeText, fallbackRoast);
  }

  async analyzeRecruit(resumeText) {
    return this.generateContent(RECRUIT_SYSTEM_PROMPT, resumeText, fallbackRecruit);
  }
}

export function createGeminiService() {
  return new GeminiService();
}
