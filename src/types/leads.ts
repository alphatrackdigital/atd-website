export type LeadSource = "contact_form" | "tracking_audit_offer" | "newsletter";

export interface LeadAttribution {
  utmSource?: string;
  utmMedium?: string;
  utmCampaign?: string;
  utmContent?: string;
  utmTerm?: string;
  gclid?: string;
  fbclid?: string;
  fbp?: string;
  fbc?: string;
  landingPage?: string;
  referrer?: string;
}

export interface LeadCapturePayload {
  source: LeadSource;
  firstName: string;
  lastName: string;
  email: string;
  optIn?: boolean;
  company?: string;
  message?: string;
  websiteUrl?: string;
  monthlyAdSpend?: string;
  monthlyAdSpendBand?: string;
  adPlatforms?: string | string[];
  industry?: string;
  role?: string;
  decisionInfluence?: string;
  trackingMaturity?: string;
  primaryConversionType?: string;
  measurementProblem?: string;
  urgency?: string;
  serviceInterest?: string[];
  monthlyBudget?: string;
  attribution?: LeadAttribution;
  metaEventId?: string;
}

export interface LeadSubmissionResult {
  ok: boolean;
  message?: string;
  pendingConfirmation?: boolean;
  duplicate?: boolean;
  metaEventId?: string;
}
