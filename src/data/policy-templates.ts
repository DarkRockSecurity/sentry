export type ComplianceFramework = "SOC 2" | "ISO 27001" | "NIST CSF 2.0" | "HIPAA" | "GDPR" | "PCI-DSS" | "CMMC";

export const FRAMEWORK_OPTIONS: ComplianceFramework[] = ["SOC 2", "ISO 27001", "NIST CSF 2.0", "HIPAA", "GDPR", "PCI-DSS", "CMMC"];

export interface PolicyTemplateInfo {
  id: string;
  n: string;
  i: string;
  d: string;
  /** Which compliance frameworks this policy provides material evidence for. */
  frameworks: ComplianceFramework[];
}

export const POLICY_TEMPLATES: PolicyTemplateInfo[] = [
  { id: "irp", n: "Incident Response Policy",                 i: "🚨",  d: "NIST 800-61 aligned IRP with full lifecycle, severity matrix, roles, EOC procedures, and reporting requirements", frameworks: ["SOC 2", "ISO 27001", "NIST CSF 2.0", "HIPAA", "GDPR", "PCI-DSS", "CMMC"] },
  { id: "isp", n: "Information Security Policy",              i: "🔐",  d: "Comprehensive ISP: governance structure, risk management, access control, data protection, and compliance",         frameworks: ["SOC 2", "ISO 27001", "NIST CSF 2.0", "HIPAA", "PCI-DSS", "CMMC"] },
  { id: "bcp", n: "Business Continuity & Disaster Recovery",  i: "🏗️", d: "BIA methodology, RTO/RPO targets, continuity strategies, recovery procedures, and testing requirements",            frameworks: ["SOC 2", "ISO 27001", "NIST CSF 2.0", "HIPAA", "CMMC"] },
  { id: "acl", n: "Access Control & Termination Policy",      i: "🔓",  d: "Least privilege, RBAC, MFA, account lifecycle, privileged access, and offboarding procedures",                       frameworks: ["SOC 2", "ISO 27001", "NIST CSF 2.0", "HIPAA", "PCI-DSS", "CMMC"] },
  { id: "dcl", n: "Data Classification & Governance",         i: "📊",  d: "Four-tier classification schema with handling, retention, and secure disposal procedures",                          frameworks: ["SOC 2", "ISO 27001", "HIPAA", "GDPR", "PCI-DSS"] },
  { id: "brn", n: "Breach Notification Policy",               i: "📣",  d: "Breach definitions, risk assessment, notification timelines (HIPAA/GDPR/state), and templates",                     frameworks: ["SOC 2", "HIPAA", "GDPR"] },
  { id: "rsk", n: "Risk Assessment & Treatment Policy",       i: "⚖️", d: "Enterprise risk framework, assessment methodology, risk register, and treatment plans",                              frameworks: ["SOC 2", "ISO 27001", "NIST CSF 2.0", "CMMC"] },
  { id: "pat", n: "Patch Management Policy",                  i: "🩹",  d: "Vulnerability classification, remediation SLAs, testing, deployment, and exception handling",                       frameworks: ["SOC 2", "ISO 27001", "NIST CSF 2.0", "PCI-DSS", "CMMC"] },
];
