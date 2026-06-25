/**
 * Scoring Service for RoastOrRecruit
 * Calculates ranking scores with deterministic tie-breakers
 */

/**
 * Analyze resume text to extract tie-breaker metrics
 * @param {string} resumeText - The resume text content
 * @returns {Object} Extracted metrics for scoring
 */
export function analyzeResumeMetrics(resumeText) {
  const text = resumeText.toLowerCase();
  
  // Count quantified metrics (%, $, x, years, etc.)
  const metricsPatterns = [
    /\d+%/g,           // Percentages
    /\$\d+/g,          // Dollar amounts
    /\d+x/g,           // Multipliers
    /\d+\s*years?/g,   // Years
    /\d+\s*months?/g,  // Months
    /\d+\s*project/g,  // Projects
    /\d+\s*team/g,     // Teams
    /\d+\s*client/g,   // Clients
    /\d+\s*user/g,     // Users
    /\d+\s*customer/g, // Customers
  ];
  
  let metricsCount = 0;
  for (const pattern of metricsPatterns) {
    const matches = resumeText.match(pattern);
    if (matches) {
      metricsCount += matches.length;
    }
  }
  
  // Count achievements (action verbs + metrics)
  const achievementPatterns = [
    /increased|improved|reduced|achieved|delivered|launched|implemented|developed|created|built|managed|led|optimized|streamlined|enhanced/gi,
  ];
  
  let achievementsCount = 0;
  for (const pattern of achievementPatterns) {
    const matches = resumeText.match(pattern);
    if (matches) {
      achievementsCount += matches.length;
    }
  }
  
  // Count skills mentioned
  const skillKeywords = [
    'javascript', 'python', 'java', 'react', 'node', 'angular', 'vue', 'typescript',
    'html', 'css', 'sql', 'mongodb', 'postgresql', 'aws', 'azure', 'gcp', 'docker',
    'kubernetes', 'git', 'linux', 'agile', 'scrum', 'machine learning', 'ai',
    'data analysis', 'project management', 'communication', 'leadership', 'teamwork'
  ];
  
  let skillRelevanceCount = 0;
  for (const skill of skillKeywords) {
    if (text.includes(skill.toLowerCase())) {
      skillRelevanceCount++;
    }
  }
  
  // Calculate completeness score (0-100)
  const sections = ['experience', 'education', 'skills', 'projects', 'summary', 'objective', 'certifications', 'awards'];
  let sectionsFound = 0;
  for (const section of sections) {
    if (text.includes(section)) {
      sectionsFound++;
    }
  }
  const completenessScore = Math.min(100, Math.round((sectionsFound / sections.length) * 100));
  
  // Calculate resume quality score (0-100)
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
  
  // Additional differentiation metrics
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
 * Analyze roast text to extract tie-breaker metrics
 * @param {Object} roastResult - The roast analysis result from Gemini
 * @returns {Object} Extracted metrics for scoring
 */
export function analyzeRoastMetrics(roastResult) {
  const { roasts = [], brutalityScore = 0 } = roastResult;
  
  // Count total roast points
  const totalRoastPoints = roasts.length;
  
  // Analyze roast categories for weaknesses
  const weaknessKeywords = [
    'weak', 'missing', 'lack', 'poor', 'bad', 'terrible', 'awful', 'horrible',
    'vague', 'generic', 'basic', 'entry', 'junior', 'inexperienced'
  ];
  
  let weaknessesCount = 0;
  for (const roast of roasts) {
    const roastLower = roast.toLowerCase();
    for (const keyword of weaknessKeywords) {
      if (roastLower.includes(keyword)) {
        weaknessesCount++;
        break;
      }
    }
  }
  
  // Count missing sections mentioned
  const missingSectionKeywords = [
    'missing', 'no experience', 'no projects', 'no skills', 'no education',
    'no summary', 'no objective', 'no certifications', 'no awards'
  ];
  
  let missingSectionsCount = 0;
  for (const roast of roasts) {
    const roastLower = roast.toLowerCase();
    for (const keyword of missingSectionKeywords) {
      if (roastLower.includes(keyword)) {
        missingSectionsCount++;
        break;
      }
    }
  }
  
  // Count grammar issues mentioned
  const grammarKeywords = [
    'grammar', 'spelling', 'typo', 'punctuation', 'capitalization', 'tense'
  ];
  
  let grammarIssueCount = 0;
  for (const roast of roasts) {
    const roastLower = roast.toLowerCase();
    for (const keyword of grammarKeywords) {
      if (roastLower.includes(keyword)) {
        grammarIssueCount++;
        break;
      }
    }
  }
  
  // Count formatting issues mentioned
  const formattingKeywords = [
    'format', 'layout', 'design', 'structure', 'organization', 'length',
    'font', 'spacing', 'margin', 'alignment', 'bullet', 'heading'
  ];
  
  let formattingIssueCount = 0;
  for (const roast of roasts) {
    const roastLower = roast.toLowerCase();
    for (const keyword of formattingKeywords) {
      if (roastLower.includes(keyword)) {
        formattingIssueCount++;
        break;
      }
    }
  }
  
  return {
    totalRoastPoints,
    weaknessesCount,
    missingSectionsCount,
    grammarIssueCount,
    formattingIssueCount,
  };
}

/**
 * Calculate ranking score for recruit mode
 * @param {Object} params - Scoring parameters
 * @returns {number} Final ranking score
 */
export function calculateRecruitRankingScore({
  atsScore,
  completenessScore,
  achievementsCount,
  metricsCount,
  skillRelevanceCount,
  resumeQualityScore,
  uniqueWords,
  avgWordLength,
  sentenceCount,
  paragraphCount,
  wordCount,
}) {
  // Formula: ATS * 1000 + Completeness * 100 + Achievements * 10 + MetricsCount
  // This ensures ATS is primary, with tie-breakers in order of importance
  const baseScore = atsScore * 1000 + completenessScore * 100 + achievementsCount * 10 + metricsCount;
  
  // Add deterministic fraction based on resume characteristics for precision
  // This creates unique ranking scores even when base scores are equal
  const precisionFactor = 
    (skillRelevanceCount * 10.0) + 
    (resumeQualityScore * 1.0) +
    (uniqueWords * 0.1) +
    (avgWordLength * 0.01) +
    (sentenceCount * 0.001) +
    (paragraphCount * 0.0001) +
    (wordCount * 0.00001);
  
  return baseScore + precisionFactor;
}

/**
 * Calculate ranking score for roast mode
 * @param {Object} params - Scoring parameters
 * @returns {number} Final ranking score
 */
export function calculateRoastRankingScore({
  brutalityScore,
  totalRoastPoints,
  weaknessesCount,
  missingSectionsCount,
  grammarIssueCount,
  formattingIssueCount,
  resumeMetrics,
}) {
  // Formula: Brutality * 1000 + WeaknessCount * 100 + FormattingIssues * 10 + GrammarIssues
  // This ensures brutality is primary, with tie-breakers in order of importance
  const baseScore = brutalityScore * 1000 + weaknessesCount * 100 + formattingIssueCount * 10 + grammarIssueCount;
  
  // Add deterministic fraction based on resume characteristics for precision
  // This creates unique ranking scores even when base scores are equal
  const precisionFactor = 
    (totalRoastPoints * 1.0) + 
    (missingSectionsCount * 0.1) +
    (resumeMetrics.uniqueWords * 0.01) +
    (resumeMetrics.avgWordLength * 0.001) +
    (resumeMetrics.sentenceCount * 0.0001) +
    (resumeMetrics.paragraphCount * 0.00001) +
    (resumeMetrics.wordCount * 0.000001);
  
  return baseScore + precisionFactor;
}

/**
 * Generate a deterministic precision enhancement for scores
 * This ensures the same resume always produces the same ranking score
 * @param {number} baseScore - The base score from Gemini
 * @param {Object} metrics - Additional metrics for precision
 * @returns {number} Enhanced score with decimal precision
 */
export function enhanceScorePrecision(baseScore, metrics) {
  // Create a deterministic hash from metrics to add decimal precision
  const metricsString = JSON.stringify(metrics);
  let hash = 0;
  for (let i = 0; i < metricsString.length; i++) {
    const char = metricsString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  
  // Convert hash to a decimal between 0.001 and 0.999
  const precision = (Math.abs(hash) % 999) / 1000 + 0.001;
  
  // Add additional precision based on resume characteristics
  const additionalPrecision = 
    (metrics.uniqueWords * 0.0001) +
    (metrics.avgWordLength * 0.00001) +
    (metrics.wordCount * 0.000001);
  
  return baseScore + precision + additionalPrecision;
}