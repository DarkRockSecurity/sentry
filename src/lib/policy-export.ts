/**
 * Client-side policy export utilities.
 *
 * Generates and triggers a download for four formats:
 *   • pdf — opens a print-styled window; user uses browser save-as-PDF
 *   • docx — Word-compatible MHTML wrapped in a .doc filename; Word opens it natively
 *   • txt — markdown stripped of inline syntax, table pipes collapsed
 *   • md — raw markdown source
 *
 * No external dependencies. All work happens in the browser.
 */
import { markdownToHtml } from "./markdown";

export interface ExportContext {
  tenantName: string;
  policyTitle: string;
  versionLabel: string;          // "v3 · Published 2026-05-08"
  classification?: string;        // "Confidential" default
  effectiveDate?: string;
  publisher?: string | null;
  approver?: string | null;
  submitter?: string | null;
  templateId: string;
}

export type ExportFormat = "pdf" | "docx" | "txt" | "md";

export function exportPolicy(format: ExportFormat, markdown: string, ctx: ExportContext): void {
  const filenameBase = `${ctx.tenantName.replace(/\s+/g, "_")}_${ctx.policyTitle.replace(/\s+/g, "_")}_${ctx.versionLabel.replace(/\s+/g, "_")}`;
  switch (format) {
    case "pdf":  return exportPdf(markdown, ctx);
    case "docx": return downloadDocx(markdown, ctx, `${filenameBase}.doc`);
    case "txt":  return downloadBlob(stripMarkdown(markdown), `${filenameBase}.txt`, "text/plain");
    case "md":   return downloadBlob(markdown, `${filenameBase}.md`, "text/markdown");
  }
}

// ── PDF: open a styled print window, let the browser save as PDF ────

function exportPdf(markdown: string, ctx: ExportContext): void {
  const body = markdownToHtml(markdown);
  const w = window.open("", "_blank", "width=900,height=1100");
  if (!w) {
    alert("Pop-up blocker prevented opening the print window. Allow pop-ups and try again.");
    return;
  }
  w.document.open();
  w.document.write(buildPrintDocument(body, ctx));
  w.document.close();
  // Give the browser a tick to finish layout before triggering print.
  setTimeout(() => {
    try { w.focus(); w.print(); } catch { /* user may have closed it */ }
  }, 400);
}

// ── Word: wrap HTML with Word-specific MIME header ──────────────────
// Word + Google Docs + LibreOffice all accept this format and preserve
// formatting better than a plain .txt — bold, headings, tables, lists.

function downloadDocx(markdown: string, ctx: ExportContext, filename: string): void {
  const body = markdownToHtml(markdown);
  const html = `<!DOCTYPE html>
<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word" xmlns="http://www.w3.org/TR/REC-html40">
<head>
<meta charset="utf-8"/>
<title>${escapeHtml(ctx.policyTitle)}</title>
<!--[if gte mso 9]><xml><w:WordDocument><w:View>Print</w:View><w:Zoom>100</w:Zoom></w:WordDocument></xml><![endif]-->
<style>
  @page { size: Letter; margin: 1in; }
  body { font-family: Calibri, "Segoe UI", Arial, sans-serif; font-size: 11pt; color: #1A202C; line-height: 1.45; }
  .titleblock { border-bottom: 2pt solid #0D9488; padding-bottom: 12pt; margin-bottom: 18pt; }
  .titleblock .org { color: #4A5568; font-size: 12pt; font-weight: 700; letter-spacing: 1pt; text-transform: uppercase; }
  .titleblock h1 { font-size: 24pt; font-weight: 700; color: #0D9488; margin: 6pt 0; }
  .titleblock .classification { display: inline-block; background: #fee2e2; color: #991b1b; padding: 2pt 8pt; font-size: 9pt; font-weight: 700; letter-spacing: 1pt; }
  h1 { font-size: 18pt; font-weight: 700; color: #1A202C; margin: 18pt 0 8pt; page-break-after: avoid; }
  h2 { font-size: 14pt; font-weight: 700; color: #1A202C; margin: 16pt 0 6pt; page-break-after: avoid; }
  h3 { font-size: 12pt; font-weight: 700; color: #2D3748; margin: 12pt 0 4pt; page-break-after: avoid; }
  p, li { font-size: 11pt; line-height: 1.45; }
  table { border-collapse: collapse; width: 100%; margin: 8pt 0; }
  th, td { border: 1pt solid #CBD5E0; padding: 4pt 8pt; vertical-align: top; font-size: 10pt; }
  th { background: #EDF2F7; }
  blockquote { border-left: 3pt solid #0D9488; margin: 8pt 0; padding: 4pt 8pt; color: #4A5568; }
  hr { border: none; border-top: 1pt solid #CBD5E0; margin: 12pt 0; }
  code { background: #F7FAFC; padding: 1pt 4pt; font-family: Consolas, "Courier New", monospace; font-size: 10pt; }
  pre { background: #F7FAFC; padding: 8pt; font-family: Consolas, monospace; font-size: 10pt; }
</style>
</head>
<body>
<div class="titleblock">
  <div class="org">${escapeHtml(ctx.tenantName)}</div>
  <h1>${escapeHtml(ctx.policyTitle)}</h1>
  ${ctx.classification ? `<span class="classification">${escapeHtml(ctx.classification.toUpperCase())}</span>` : ""}
</div>
${body}
</body>
</html>`;
  // Save as .doc (Word opens HTML files saved with this extension as a document).
  // Some Word versions complain about .docx pretending to be HTML; using .doc avoids that.
  downloadBlob(html, filename, "application/msword");
}

// ── Plain text: strip markdown syntax and inline formatting ─────────

function stripMarkdown(md: string): string {
  return md
    .replace(/\r\n/g, "\n")
    // Remove fenced code blocks
    .replace(/```[\s\S]*?```/g, (block) => block.replace(/^```\w*\n?|```$/g, ""))
    // Headings: drop the leading #s
    .replace(/^#{1,6}\s+/gm, "")
    // Horizontal rules
    .replace(/^---+\s*$/gm, "─".repeat(60))
    // Bold + italic + inline code
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/(?<![*\w])\*([^*\s][^*]*?)\*(?!\w)/g, "$1")
    .replace(/`([^`]+)`/g, "$1")
    // Links [text](url) → text (url)
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1 ($2)")
    // Blockquote markers
    .replace(/^>\s+/gm, "  | ")
    // Bullets and numbers — keep as plain dashes / numerics
    .replace(/^\s*[-*]\s+/gm, "  • ")
    .replace(/^\s*(\d+)\.\s+/gm, "  $1. ")
    // Table pipes — collapse runs of " | " to a single tab-ish separator
    .replace(/^\s*\|/gm, "")
    .replace(/\|\s*$/gm, "")
    .replace(/\s*\|\s*/g, "    ")
    // Collapse 3+ blank lines
    .replace(/\n{3,}/g, "\n\n");
}

// ── Shared helpers ───────────────────────────────────────────────────

function downloadBlob(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 500);
}

function buildPrintDocument(bodyHtml: string, ctx: ExportContext): string {
  const cls = (ctx.classification ?? "Confidential").toUpperCase();
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<title>${escapeHtml(ctx.policyTitle)} — ${escapeHtml(ctx.tenantName)}</title>
<style>
  @page {
    size: Letter;
    margin: 0.85in 0.85in 0.95in 0.85in;
    @top-left   { content: "${escapeForCss(ctx.tenantName)}"; font: 9pt 'Source Sans 3', Arial, sans-serif; color: #4A5568; }
    @top-right  { content: "${escapeForCss(cls)}"; font: 9pt 'Source Sans 3', Arial, sans-serif; color: #991b1b; letter-spacing: 1px; }
    @bottom-left  { content: "${escapeForCss(ctx.policyTitle)} · ${escapeForCss(ctx.versionLabel)}"; font: 8pt 'Source Sans 3', Arial, sans-serif; color: #718096; }
    @bottom-right { content: "Page " counter(page) " of " counter(pages); font: 8pt 'Source Sans 3', Arial, sans-serif; color: #718096; }
  }
  body { font-family: 'Source Sans 3', 'Segoe UI', Arial, sans-serif; font-size: 11pt; color: #1A202C; line-height: 1.55; margin: 0; }

  .titlepage {
    display: flex; flex-direction: column; justify-content: center; min-height: 9in;
    page-break-after: always; text-align: center;
  }
  .titlepage .org { color: #4A5568; font-size: 14pt; font-weight: 700; letter-spacing: 3px; text-transform: uppercase; }
  .titlepage h1 { font-size: 38pt; font-weight: 800; color: #0D9488; margin: 18pt 0; line-height: 1.1; letter-spacing: -1px; }
  .titlepage .meta { color: #4A5568; font-size: 12pt; margin-top: 18pt; }
  .titlepage .meta div { margin: 4pt 0; }
  .titlepage .classification {
    display: inline-block; margin-top: 30pt;
    background: #FEE2E2; color: #991B1B; border: 1pt solid #FCA5A5;
    padding: 6pt 18pt; font-size: 11pt; font-weight: 800; letter-spacing: 2px;
  }
  .doc-body { padding-top: 12pt; }
  .doc-body h1 { font-size: 19pt; font-weight: 800; color: #0D9488; margin: 26pt 0 10pt; page-break-before: always; }
  .doc-body h1:first-of-type { page-break-before: avoid; }
  .doc-body h2 { font-size: 14pt; font-weight: 700; color: #1A202C; margin: 22pt 0 6pt; page-break-after: avoid; }
  .doc-body h3 { font-size: 12pt; font-weight: 700; color: #2D3748; margin: 16pt 0 4pt; page-break-after: avoid; }
  .doc-body p, .doc-body li { font-size: 11pt; line-height: 1.55; orphans: 3; widows: 3; }
  .doc-body ul, .doc-body ol { margin: 6pt 0 6pt 22pt; }
  .doc-body table { border-collapse: collapse; width: 100%; margin: 10pt 0; page-break-inside: avoid; }
  .doc-body th, .doc-body td { border: 0.5pt solid #CBD5E0; padding: 5pt 8pt; vertical-align: top; font-size: 10pt; }
  .doc-body th { background: #EDF2F7; font-weight: 700; }
  .doc-body blockquote { border-left: 3pt solid #0D9488; margin: 10pt 0; padding: 4pt 10pt; color: #4A5568; }
  .doc-body hr { border: none; border-top: 0.5pt solid #CBD5E0; margin: 14pt 0; }
  .doc-body code { background: #F7FAFC; padding: 1pt 4pt; font-family: Consolas, monospace; font-size: 10pt; }
  .doc-body pre { background: #F7FAFC; padding: 8pt; font-family: Consolas, monospace; font-size: 10pt; page-break-inside: avoid; }
  .doc-body a { color: #0D9488; }

  /* Print-only — hide the screen-mode print button */
  .print-bar { position: fixed; top: 12px; right: 12px; display: flex; gap: 8px; }
  .print-bar button {
    padding: 8px 14px; background: #0D9488; color: #fff; border: none; border-radius: 6px;
    font-weight: 700; cursor: pointer; font-family: inherit; font-size: 13px;
  }
  .print-bar .secondary { background: #E2E8F0; color: #2D3748; }
  @media print { .print-bar { display: none; } }
</style>
</head>
<body>
<div class="print-bar">
  <button onclick="window.print()">Save as PDF / Print</button>
  <button class="secondary" onclick="window.close()">Close</button>
</div>
<div class="titlepage">
  <div class="org">${escapeHtml(ctx.tenantName)}</div>
  <h1>${escapeHtml(ctx.policyTitle)}</h1>
  <div class="meta">
    <div>${escapeHtml(ctx.versionLabel)}</div>
    ${ctx.effectiveDate ? `<div>Effective ${escapeHtml(ctx.effectiveDate)}</div>` : ""}
    ${ctx.publisher ? `<div>Published by ${escapeHtml(ctx.publisher)}</div>` : ""}
    ${ctx.approver ? `<div>Approved by ${escapeHtml(ctx.approver)}</div>` : ""}
    ${ctx.submitter ? `<div>Submitted by ${escapeHtml(ctx.submitter)}</div>` : ""}
  </div>
  <div class="classification">${escapeHtml(cls)}</div>
</div>
<div class="doc-body">${bodyHtml}</div>
</body>
</html>`;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c] as string));
}
function escapeForCss(s: string): string {
  // CSS `content:` values are quoted strings — escape backslashes + quotes.
  return s.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}
