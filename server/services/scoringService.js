/**
 * Scoring Service for RoastOrRecruit
 * - displayScore: decimal score shown to users (Gemini-generated, normalized for uniqueness)
 * - rankingScore: hidden score used for leaderboard sorting (tie-breakers built in)
 */

import UsageLog from "../models/UsageLog.js";

/**
 * Deterministic hash of a string → positive integer
 */
function djb2Hash(str) {
  let hash = 5381;
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i);
    hash = hash & hash;
  }
  return Math.abs(hash);
}

/**
 * Normalize a Gemini score to be unique across all entries for this mode.
 * If the score already exists in the DB, adjust the decimal slightly.
 * Purely deterministic — same score + same DB state = same result.
 *
 * @param {number} rawScore - Gemini's score (e.g. 64.0, 73.5)
 * @param {string} mode - "roast" or "recruit"
 * @param {string} seed - deterministic seed (resume hash or filename)
 * @returns {Promise<number>} Unique display score rounded to 1 decimal, 0-100
 */
export async function normalizeDisplayScore(rawScore, mode, seed) {
  let score = Math.round(rawScore * 10) / 10;
  score = Math.min(100, Math.max(0, score));

  try {
    const existingDocs = await UsageLog.distinct("displayScore", {
      mode,
      success: true,
      displayScore: { $ne: null },
    }).lean();

    const existing = new Set(existingDocs.map(s => Math.round(s * 10) / 10));

    if (!existing.has(score)) return score;

    const seedHash = djb2Hash(seed || String(Date.now()));
    const direction = seedHash % 2 === 0 ? 1 : -1;
    const startOffset = (seedHash % 90) / 100 + 0.01;

    let offset = startOffset;
    for (let attempt = 0; attempt < 50; attempt++) {
      let candidate = Math.round((score + direction * offset) * 10) / 10;
      if (candidate > 100) candidate = Math.round((100 - (candidate - 100)) * 10) / 10;
      if (candidate < 0) candidate = Math.round((0 + Math.abs(candidate)) * 10) / 10;
      candidate = Math.min(100, Math.max(0, candidate));

      if (!existing.has(candidate)) return candidate;
      offset += 0.1;
    }

    return score;
  } catch {
    return score;
  }
}

/**
 * Analyze resume text to extract tie-breaker metrics
 */
export function analyzeResumeMetrics(resumeText) {
  const text = resumeText.toLowerCase();

  const metricsPatterns = [
    /\d+%/g, /\$\d+/g, /\d+x/g, /\d+\s*years?/g, /\d+\s*months?/g,
    /\d+\s*project/g, /\d+\s*team/g, /\d+\s*client/g, /\d+\s*user/g, /\d+\s*customer/g,
  ];

  let metricsCount = 0;
  for (const pattern of metricsPatterns) {
    const matches = resumeText.match(pattern);
    if (matches) metricsCount += matches.length;
  }

  const achievementPatterns = [
    /increased|improved|reduced|achieved|delivered|launched|implemented|developed|created|built|managed|led|optimized|streamlined|enhanced/gi,
  ];
  let achievementsCount = 0;
  for (const pattern of achievementPatterns) {
    const matches = resumeText.match(pattern);
    if (matches) achievementsCount += matches.length;
  }

  const skillKeywords = [
    'javascript', 'python', 'java', 'react', 'node', 'angular', 'vue', 'typescript',
    'html', 'css', 'sql', 'mongodb', 'postgresql', 'aws', 'azure', 'gcp', 'docker',
    'kubernetes', 'git', 'linux', 'agile', 'scrum', 'machine learning', 'ai',
    'data analysis', 'project management', 'communication', 'leadership', 'teamwork'
  ];
  let skillRelevanceCount = 0;
  for (const skill of skillKeywords) {
    if (text.includes(skill.toLowerCase())) skillRelevanceCount++;
  }

  const sections = ['experience', 'education', 'skills', 'projects', 'summary', 'objective', 'certifications', 'awards'];
  let sectionsFound = 0;
  for (const section of sections) {
    if (text.includes(section)) sectionsFound++;
  }
  const completenessScore = Math.min(100, Math.round((sectionsFound / sections.length) * 100));

  const wordCount = resumeText.split(/\s+/).length;
  const hasContactInfo = /\b[\w.-]+@[\w.-]+\.\w+\b/.test(resumeText) || /\b\d{3}[-.]?\d{3}[-.]?\d{4}\b/.test(resumeText);
  const hasLinkedIn = text.includes('linkedin');
  const hasGitHub = text.includes('github');

  let qualityScore = 0;
  if (wordCount >= 300 && wordCount <= 800) qualityScore += 30;
  else if (wordCount >= 200) qualityScore += 20;
  if (hasContactInfo) qualityScore += 25;
  if (hasLinkedIn) qualityScore += 15;
  if (hasGitHub) qualityScore += 15;
  if (sectionsFound >= 4) qualityScore += 15;

  const uniqueWords = new Set(resumeText.toLowerCase().split(/\s+/)).size;
  const avgWordLength = resumeText.split(/\s+/).reduce((sum, word) => sum + word.length, 0) / resumeText.split(/\s+/).length;
  const sentenceCount = resumeText.split(/[.!?]+/).filter(s => s.trim().length > 0).length;
  const paragraphCount = resumeText.split(/\n\s*\n/).filter(p => p.trim().length > 0).length;

  return {
    metricsCount,
    achievementsCount,
    skillRelevanceCount,
    completenessScore,
    resumeQualityScore: Math.min(100, qualityScore),
    uniqueWords,
    avgWordLength: Math.round(avgWordLength * 100) / 100,
    sentenceCount,
    paragraphCount,
    wordCount,
  };
}

/**
 * Analyze roast result for tie-breaker metrics
 */
export function analyzeRoastMetrics(roastResult) {
  const { roasts = [] } = roastResult;

  const totalRoastPoints = roasts.length;

  const weaknessKeywords = ['weak', 'missing', 'lack', 'poor', 'bad', 'terrible', 'awful', 'horrible', 'vague', 'generic', 'basic', 'entry', 'junior', 'inexperienced'];
  let weaknessesCount = 0;
  for (const roast of roasts) {
    const r = roast.toLowerCase();
    for (const kw of weaknessKeywords) { if (r.includes(kw)) { weaknessesCount++; break; } }
  }

  const missingSectionKeywords = ['missing', 'no experience', 'no projects', 'no skills', 'no education', 'no summary', 'no objective', 'no certifications', 'no awards'];
  let missingSectionsCount = 0;
  for (const roast of roasts) {
    const r = roast.toLowerCase();
    for (const kw of missingSectionKeywords) { if (r.includes(kw)) { missingSectionsCount++; break; } }
  }

  const grammarKeywords = ['grammar', 'spelling', 'typo', 'punctuation', 'capitalization', 'tense'];
  let grammarIssueCount = 0;
  for (const roast of roasts) {
    const r = roast.toLowerCase();
    for (const kw of grammarKeywords) { if (r.includes(kw)) { grammarIssueCount++; break; } }
  }

  const formattingKeywords = ['format', 'layout', 'design', 'structure', 'organization', 'length', 'font', 'spacing', 'margin', 'alignment', 'bullet', 'heading'];
  let formattingIssueCount = 0;
  for (const roast of roasts) {
    const r = roast.toLowerCase();
    for (const kw of formattingKeywords) { if (r.includes(kw)) { formattingIssueCount++; break; } }
  }

  return { totalRoastPoints, weaknessesCount, missingSectionsCount, grammarIssueCount, formattingIssueCount };
}

/**
 * Hidden ranking score for recruit mode (used for sorting only)
 */
export function calculateRecruitRankingScore({ atsScore, completenessScore, achievementsCount, metricsCount, skillRelevanceCount, resumeQualityScore, uniqueWords, avgWordLength, sentenceCount, paragraphCount, wordCount }) {
  const baseScore = atsScore * 1000 + completenessScore * 100 + achievementsCount * 10 + metricsCount;
  const precisionFactor = (skillRelevanceCount * 10.0) + (resumeQualityScore * 1.0) + (uniqueWords * 0.1) + (avgWordLength * 0.01) + (sentenceCount * 0.001) + (paragraphCount * 0.0001) + (wordCount * 0.00001);
  return baseScore + precisionFactor;
}

/**
 * Hidden ranking score for roast mode (used for sorting only)
 */
export function calculateRoastRankingScore({ brutalityScore, totalRoastPoints, weaknessesCount, missingSectionsCount, grammarIssueCount, formattingIssueCount, resumeMetrics }) {
  const baseScore = brutalityScore * 1000 + weaknessesCount * 100 + formattingIssueCount * 10 + grammarIssueCount;
  const precisionFactor = (totalRoastPoints * 1.0) + (missingSectionsCount * 0.1) + (resumeMetrics.uniqueWords * 0.01) + (resumeMetrics.avgWordLength * 0.001) + (resumeMetrics.sentenceCount * 0.0001) + (resumeMetrics.paragraphCount * 0.00001) + (resumeMetrics.wordCount * 0.000001);
  return baseScore + precisionFactor;
}

/**
 * Enhance ranking score with deterministic precision
 */
export function enhanceScorePrecision(baseScore, metrics) {
  const metricsString = JSON.stringify(metrics);
  let hash = 0;
  for (let i = 0; i < metricsString.length; i++) {
    const char = metricsString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  const precision = (Math.abs(hash) % 999) / 1000 + 0.001;
  const additionalPrecision = (metrics.uniqueWords * 0.0001) + (metrics.avgWordLength * 0.00001) + (metrics.wordCount * 0.000001);
  return baseScore + precision + additionalPrecision;
}
