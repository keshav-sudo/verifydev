// ============================================
// MULTI-DIMENSIONAL EVALUATION SYSTEM TYPES
// Phase 1-5: Dimensions, Verdicts, Matching, Trust
// ============================================

// ==================== DIMENSION TYPES ====================

export type DimensionType =
  | 'fundamentals'
  | 'engineeringDepth'
  | 'productionReadiness'
  | 'testingMaturity'
  | 'architecture'
  | 'infraDevOps'

export interface ConfidenceBand {
  lower: number   // Pessimistic estimate
  expected: number // Most likely value
  upper: number   // Optimistic estimate
}

export interface DimensionScore {
  score: number        // 0-100
  confidence: number   // 0-1 (how sure we are)
  signals: string[]    // Evidence found
  band: ConfidenceBand // Score range
  subScores?: Record<string, SubScore> // Detailed breakdown
}

export interface SubScore {
  score: number
  weight: number
  evidence: string[]
  confidence: number
}

export interface DimensionMatrix {
  // The 6 core dimensions
  fundamentals: DimensionScore        // Code quality, structure
  engineeringDepth: DimensionScore    // Patterns, architecture
  productionReadiness: DimensionScore // Deployment, ops
  testingMaturity: DimensionScore     // Test coverage, quality
  architecture: DimensionScore        // System design
  infraDevOps: DimensionScore         // CI/CD, containers

  // Metadata
  overallScore: number         // Weighted composite
  overallBand: ConfidenceBand  // Overall confidence range
  analyzedAt: string           // When analysis ran
  projectType: string          // Detected type
  contextWeights?: ContextWeights // Job/role context
}

export interface ContextWeights {
  jobTitle?: string
  role?: string               // frontend, backend, fullstack, devops
  level?: string              // junior, mid, senior, staff
  dimensionWeights?: Record<DimensionType, number>
  explanation?: string
}

// ==================== VERDICT TYPES ====================

// Dimensional experience level (different from job.ts ExperienceLevel)
export type DimensionalExperienceLevel = 
  | 'INTERN'      // Learning
  | 'JUNIOR'      // 1-2 years
  | 'MID_LEVEL'   // 2-4 years
  | 'SENIOR'      // 4-7 years
  | 'STAFF'       // 7-10 years
  | 'PRINCIPAL'   // 10+ years

export interface YearRange {
  min: number
  max: number
  estimate: number
}

export interface ExperienceClassification {
  level: DimensionalExperienceLevel
  confidence: number // 0-1
  supportingSignals: string[]
  contradictingSignals: string[]
  estimatedYears: YearRange
}

export interface VerdictStatement {
  statement: string   // Human-readable observation
  evidence: string[]  // Supporting signals
  confidence: string  // HIGH, MEDIUM, LOW
  isVerified: boolean // From verified sources?
}

// Full Verdict (for complex views)
export interface VerdictFull {
  summary: string                        // One sentence overview
  strengths: VerdictStatement[]          // What they're good at
  growthAreas: VerdictStatement[]        // Areas to improve
  notablePatterns: VerdictStatement[]    // Interesting observations
  experience: ExperienceClassification   // Level classification
  hiringRecommendation: string           // For recruiter view
  cautions: string[]                     // What to verify in interview
}

// Simple Verdict (for API responses)
export interface Verdict {
  summary: string                        // One sentence overview
  strengths: string[]                    // What they're good at (simple strings)
  growthAreas: string[]                  // Areas to improve
  experience: {
    level: string
    yearRange: string
    confidence: number
  }
  justification: string                  // Hiring recommendation
}

// ==================== TRUST SIGNAL TYPES ====================

export type TrustLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'SUSPICIOUS'
export type EffortClass = 'SIGNIFICANT' | 'MODERATE' | 'MINIMAL' | 'SUSPICIOUS'

export interface CommitPattern {
  totalCommits: number
  commitSizeAvg: number
  commitSizeVariance: number
  hasBulkImport: boolean
  isRegular: boolean
  firstCommit?: string
  lastCommit?: string
}

export interface EffortAnalysis {
  commitPattern: CommitPattern
  developmentSpan: string // Duration string
  activeDays: number
  codeChurn: number
  iterationCount: number
  effortScore: number // 0-100
  effortBand: ConfidenceBand
  classification: EffortClass
}

export interface AuthenticitySignal {
  type: 'POSITIVE' | 'NEGATIVE' | 'NEUTRAL'
  name: string
  evidence: string
  confidence: number
}

export interface AuthenticityAnalysis {
  authenticityScore: number // 0-100
  signals: AuthenticitySignal[]
}

export interface LearningIndicator {
  type: string
  evidence: string
  confidence: number
}

export interface LearningAnalysis {
  isLikelyLearning: boolean
  learningScore: number // 0-1
  indicators: LearningIndicator[]
}

export interface ConsistencyIssue {
  type: string
  severity: string
  evidence: string
}

export interface ConsistencyAnalysis {
  consistencyScore: number
  issues: ConsistencyIssue[]
}

export interface TrustFlag {
  type: 'CRITICAL' | 'WARNING' | 'INFO'
  category: string
  message: string
  confidence: number
}

// Full Trust Analysis (for complex views)
export interface TrustAnalysisFull {
  effort: EffortAnalysis
  authenticity: AuthenticityAnalysis
  learning: LearningAnalysis
  consistency: ConsistencyAnalysis
  overallTrust: {
    score: number
    classification: TrustLevel
    band: ConfidenceBand
  }
  flags: TrustFlag[]
}

// Simple Trust Analysis (for API responses)
export interface TrustAnalysis {
  level: string
  score: number
  effort: {
    class: string
    estimatedHours: number
    averageCommitSize: number
    commitFrequency: number
  }
  authenticity: {
    score: number
    flags: string[]
    hasOriginalWork: boolean
  }
}

// ==================== JOB MATCHING TYPES ====================

export type FitCategory = 
  | 'EXCELLENT'  // 85+, highly recommended
  | 'GOOD'       // 70-84, solid match
  | 'POTENTIAL'  // 55-69, with development
  | 'STRETCH'    // 40-54, significant gap
  | 'MISMATCH'   // <40, not recommended

export interface DimensionReq {
  minScore: number   // Minimum acceptable (0-100)
  idealScore: number // What we really want
  weight: number     // Importance for this role (0-1)
  required: boolean  // Is this dimension mandatory?
}

export interface DimensionRequirements {
  fundamentals: DimensionReq
  engineeringDepth: DimensionReq
  productionReadiness: DimensionReq
  testingMaturity: DimensionReq
  architecture: DimensionReq
  infraDevOps: DimensionReq
}

export interface SkillRequirement {
  skill: string
  minProficiency: 'BASIC' | 'INTERMEDIATE' | 'ADVANCED' | 'EXPERT'
  verifiedRequired: boolean
  weight: number
}

export interface JobRequirement {
  id: string
  title: string
  company?: string
  level: {
    minimum: string
    ideal: string
    flexible: boolean
  }
  type: string // frontend, backend, fullstack, etc.
  dimensions: DimensionRequirements
  mustHave: SkillRequirement[]
  niceToHave: SkillRequirement[]
  teamSize?: string
  workStyle?: string
  priorities?: string[]
}

export interface DimensionFit {
  candidateScore: number
  requiredMin: number
  idealScore: number
  fitScore: number // 0-100
  gap: number      // Negative = below requirement
  status: 'EXCEEDS' | 'MEETS' | 'BELOW' | 'MISSING'
}

export interface DimensionMatchResult {
  overallScore: number
  byDimension: Record<string, DimensionFit>
  missingRequired: string[]
}

export interface SkillMatchResult {
  mustHaveMatched: number
  mustHaveTotal: number
  mustHaveScore: number // Percentage matched
  niceToHaveMatched: number
  niceToHaveTotal: number
  missingMustHave: string[]
  bonusSkills: string[] // Extra skills they have
}

export interface LevelMatchResult {
  candidateLevel: string
  requiredMin: string
  idealLevel: string
  status: 'EXCEEDS' | 'MEETS' | 'BELOW' | 'UNDER_QUALIFIED'
  levelGap: number // Levels difference (negative = below)
}

export interface MatchResult {
  candidateId: string
  jobId: string

  // Overall assessment
  overallFit: FitCategory
  matchScore: number     // 0-100
  confidence: number     // 0-1

  // Detailed breakdown
  dimensionMatch: DimensionMatchResult
  skillMatch: SkillMatchResult
  levelMatch: LevelMatchResult

  // Recruiter guidance
  strengths: string[]
  concerns: string[]
  interviewFocus: string[]
  recommendation: string
}

// ==================== API RESPONSE TYPES ====================

export interface ResponseSummary {
  experienceLevel: string
  oneLineSummary: string
  topStrengths: string[]
  mainGaps: string[]
  trustLevel: string
}

export interface LegacyScores {
  overall: number
  deprecated: boolean
  message: string
}

export interface AnalysisResponse {
  version: string
  analysisId: string
  projectId: string
  timestamp: string
  dimensions: DimensionMatrix
  verdict: Verdict
  trust: TrustAnalysis
  summary: ResponseSummary
  legacyScores?: LegacyScores
}

// ==================== DASHBOARD TYPES ====================

export interface QuickStats {
  experienceLevel: string
  overallFit?: string
  matchScore?: number
  trustLevel: string
}

export interface DimensionChart {
  labels: string[]
  scores: number[]
  bands: number[][] // [lower, upper] for each
}

export interface SkillCell {
  skill: string
  status: 'matched' | 'missing' | 'bonus'
  confidence?: number
}

export interface SkillMatrix {
  required: SkillCell[]
  niceToHave: SkillCell[]
  bonus: SkillCell[]
}

export interface RecruiterActions {
  canShortlist: boolean
  canReject: boolean
  canSchedule: boolean
}

export interface DashboardView {
  candidateId: string
  displayName: string
  quickStats: QuickStats
  dimensionChart: DimensionChart
  skillMatrix: SkillMatrix
  actions: RecruiterActions
}

// ==================== EXTENDED PROJECT TYPES ====================

export interface ProjectWithDimensions {
  id: string
  name: string
  repoUrl: string
  analysisStatus: string
  
  // Dimension scores
  dimensions?: DimensionMatrix
  
  // Verdict
  verdict?: Verdict
  
  // Trust signals
  trust?: TrustAnalysis
  
  // Existing fields for backward compatibility
  overallScore?: number
  auraContribution?: number
}

export interface CandidateWithDimensions {
  userId: string
  displayName: string
  avatarUrl?: string
  
  // Aggregated from all projects
  aggregatedDimensions?: DimensionMatrix
  
  // Best project for this role
  bestMatchProject?: ProjectWithDimensions
  
  // Match result for job
  matchResult?: MatchResult
}
