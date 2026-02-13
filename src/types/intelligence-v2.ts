// ============================================
// CODE INTELLIGENCE ENGINE v2 TYPES
// Evidence System, Calibration, Skill Taxonomy
// ============================================

// Evidence Types
export type EvidenceStrength = 'WEAK' | 'MEDIUM' | 'STRONG'
export type EvidenceType = 'FILE' | 'PATTERN' | 'ARCHITECTURE' | 'CONFIG' | 'IMPORT' | 'TESTING' | 'INFRA'

export interface EvidenceItem {
  type: EvidenceType
  location?: string
  description: string
  strength: EvidenceStrength
  isAnti: boolean
}

export interface EvidenceChain {
  skillName: string
  skillCategory?: string
  items: EvidenceItem[]
  antiItems: EvidenceItem[]
  totalStrength: number
  antiStrength: number
  netConfidence: number
}

export interface RecruiterEvidenceSummary {
  skill: string
  confidence: number
  proofs: string[]
  concerns: string[]
}

// Confidence Calibration Types
export type ConfidenceLevel = 'VERY_HIGH' | 'HIGH' | 'MODERATE' | 'LOW' | 'VERY_LOW'

export interface CalibrationFactors {
  sizeFactor: number
  diversityFactor: number
  intentFactor: number
}

export interface CalibratedConfidence {
  rawScore: number
  calibratedScore: number
  confidenceRange: [number, number]
  interpretation: ConfidenceLevel
  calibrationFactors: CalibrationFactors
  reasoning?: string
}

// Skill Taxonomy Types
export type SkillTier = 1 | 2 | 3 | 4 // Core, Sub, Infra, Adjacent
export type SkillVerificationStatus = 'VERIFIED' | 'INFERRED' | 'CLAIMED'

export interface SkillRelation {
  targetSkillId: string
  type: 'PARENT' | 'CHILD' | 'SUPPORTS' | 'ADJACENT'
  weight: number
}

// Rich Evidence Types (Phase 6: Deep Evidence Enrichment)
export interface SkillDepth {
  level: string           // "surface", "moderate", "deep", "expert"
  diversityCount: number  // Number of distinct patterns/APIs used
  patternsUsed: number    // Number of distinct code patterns
  fileSpread: number      // How many files the tech spans
}

export interface RichEvidence {
  summary: string[]                          // Human-readable summaries
  patterns?: Record<string, any>             // Detailed pattern data (hooks, routes, queries)
  depth?: SkillDepth                         // Depth assessment
}

export interface SkillNode {
  id: string
  name: string
  category: string
  tier: SkillTier
  isClaimed: boolean
  isInferred: boolean
  inferredFrom?: string
  rawConfidence: number
  netConfidence: number
  usageVerified?: boolean
  usageStrength?: number
  relations?: SkillRelation[]
  evidence?: EvidenceChain
  richEvidence?: RichEvidence | null  // Phase 6: Granular pattern-based evidence
}

export interface SkillTaxonomy {
  coreSkills: SkillNode[]
  subSkills: SkillNode[]
  infraSkills: SkillNode[]
  inferredSkills: SkillNode[]
}

// Architecture Types v2
export type ArchitectureStyle = 
  | 'MONOLITH' 
  | 'MODULAR' 
  | 'MICROSERVICES' 
  | 'SERVERLESS' 
  | 'EVENT_DRIVEN' 
  | 'LAYERED' 
  | 'HEXAGONAL'
  | 'UNKNOWN'

export type JustificationLevel = 
  | 'FULLY_JUSTIFIED' 
  | 'PARTIALLY_JUSTIFIED' 
  | 'WEAKLY_JUSTIFIED' 
  | 'NOT_JUSTIFIED'

export interface CargoCultWarning {
  pattern: string
  expected: string
  found: string
  severity: 'HIGH' | 'MEDIUM' | 'LOW'
  penalty: number
  explanation: string
}

export interface ArchitectureTradeoff {
  decision: string
  benefit: string
  cost: string
  isAppropriate: boolean
}

export interface ArchitectureVerdict {
  style: ArchitectureStyle
  maturity: number
  isJustified: boolean
  justificationScore: number
  justificationLevel: JustificationLevel
  explanation: string
  strengths?: string[]
  cargoCultWarnings?: CargoCultWarning[]
  tradeoffAnalysis?: ArchitectureTradeoff[]
}

// Risk & Uncertainty Types
export type UncertaintyType = 'MISSING' | 'AMBIGUOUS' | 'ASSUMPTION' | 'LIMITED'
export type UncertaintyImpact = 'HIGH' | 'MEDIUM' | 'LOW'
export type RiskLevel = 'HIGH' | 'MODERATE' | 'LOW'

export interface Uncertainty {
  type: UncertaintyType
  description: string
  impact: UncertaintyImpact
  affects: string[]
  mitigation?: string
}

export interface RiskProfile {
  unknowns: Uncertainty[]
  riskLevel: RiskLevel
  highRiskCount: number
  mediumRiskCount: number
  hiringImpact: string
  recommendations: string[]
  confidenceAdjust: number
}

// Full v2 Analysis Output
export interface IndustryAnalysisV2 {
  skills: SkillTaxonomy
  architecture: ArchitectureVerdict
  riskProfile: RiskProfile
  confidenceCalibration: CalibratedConfidence
  verdict: {
    projectIntentSummary: string
    techStackSnapshot: string[]
    architectureMaturity: number
    overallScore: number
    developerLevel: string
    hireSignal: 'STRONG_HIRE' | 'HIRE' | 'BORDERLINE' | 'NO_HIRE'
    seniorEngineerVerdict: string
    analysisTimeMs: number
  }
}
