"use client";

import { useEffect, useState, useTransition, useCallback } from "react";
import { useColors } from "@/lib/theme";
import { Badge, Button, Card, SectionHeader, useModal } from "@/components/ui";
import { POLICY_TEMPLATES } from "@/data/policy-templates";
import { PolicyEditor } from "./PolicyEditor";
import {
  listPolicies, listPolicyApprovers,
  generatePolicyDraft, savePolicyDraft,
  submitPolicyForReview, signOffPolicy, publishPolicy,
  startNewPolicyVersion, discardPolicyDraft,
  type PolicyDTO, type PolicyVersionDTO, type ApproverCandidate,
} from "@/app/app/_actions";

type Tab = "templates" | "drafts" | "live";

export function PoliciesModule() {
  const colors = useColors();
  const modal = useModal();
  const [policies, setPolicies] = useState<PolicyDTO[]>([]);
  const [approvers, setApprovers] = useState<ApproverCandidate[]>([]);
  const [tab, setTab] = useState<Tab>("templates");
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState<string | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [, startAction] = useTransition();

  const refresh = useCallback(async () => {
    const [freshPolicies, freshApprovers] = await Promise.all([listPolicies(), listPolicyApprovers()]);
    setPolicies(freshPolicies);
    setApprovers(freshApprovers);
  }, []);

  useEffect(() => { refresh().catch(() => {}); }, [refresh]);

  /** Opens a modal that lists every other active platform user, asks the
   *  submitter to pick one, and submits the policy for review. */
  const submitForReview = useCallback(async (templateId: string) => {
    const candidates = approvers.filter((a) => !a.isSelf);
    if (candidates.length === 0) {
      await modal.showAlert(
        "No approvers available",
        "There are no other active platform users in this tenant who can approve. Invite a colleague from the Access Control module, then try again.",
      );
      return;
    }
    const labelForCandidate = (a: ApproverCandidate) => `${a.name} · ${a.email}`;
    const r = await modal.showPrompt(
      "Submit for Approval",
      [{
        key: "approver",
        label: "Named Approver (required)",
        type: "select",
        required: true,
        options: candidates.map(labelForCandidate),
      }],
      "Choose one platform user to approve this policy version. You cannot name yourself. The named approver is the only person who can sign off — and once they do, the version is publishable.",
    );
    if (!r) return;
    const picked = candidates.find((a) => labelForCandidate(a) === r.approver);
    if (!picked) {
      await modal.showAlert("Approver missing", "Pick an approver from the list to submit.");
      return;
    }
    handle(
      `review:${templateId}`,
      { title: "Submitted for approval", body: `Awaiting signoff from ${picked.name}. They will see the policy in their Drafts in Flight queue.` },
      () => submitPolicyForReview({ templateId, approverUserId: picked.userId }),
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [approvers]);

  // Helpers --------------------------------------------------------------
  const findByTemplate = (templateId: string) => policies.find((p) => p.templateId === templateId);
  const draftCount = policies.filter((p) => p.draftVersion || p.inReviewVersion).length;
  const liveCount = policies.filter((p) => p.publishedVersion).length;

  const handle = useCallback(<T,>(
    key: string,
    successToast: { title: string; body: string } | null,
    fn: () => Promise<{ ok: boolean; error?: string } & T>,
  ) => {
    setBusyId(key);
    startAction(async () => {
      const res = await fn();
      setBusyId(null);
      if (!res.ok) {
        await modal.showAlert("Action failed", res.error ?? "Unknown error");
        return;
      }
      await refresh();
      if (successToast) await modal.showAlert(successToast.title, successToast.body);
    });
  }, [modal, refresh]);

  // ────────────────────────────────────────────────────────────────────
  // DETAIL VIEW (editor) — shown when a policy is selected
  // ────────────────────────────────────────────────────────────────────
  if (selectedTemplateId) {
    const tpl = POLICY_TEMPLATES.find((t) => t.id === selectedTemplateId);
    const policy = findByTemplate(selectedTemplateId);
    if (!tpl) { setSelectedTemplateId(null); return null; }

    const draft = policy?.draftVersion ?? null;
    const inReview = policy?.inReviewVersion ?? null;
    const published = policy?.publishedVersion ?? null;
    const activeVersion: PolicyVersionDTO | null = inReview ?? draft ?? published;

    return (
      <div>
        <Button variant="ghost" onClick={() => setSelectedTemplateId(null)} style={{ marginBottom: 12 }}>← Back to Policies</Button>

        {/* Header */}
        <Card style={{ marginBottom: 14 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
            <div>
              <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 4 }}>
                <span style={{ fontSize: 26 }}>{tpl.i}</span>
                <h2 style={{ color: colors.white, margin: 0, fontSize: 18 }}>{tpl.n}</h2>
                {published && <Badge color={colors.green}>Live · v{published.versionNumber}</Badge>}
                {draft && <Badge color={colors.teal}>Draft · v{draft.versionNumber}</Badge>}
                {inReview && <Badge color={colors.orange}>In Review · v{inReview.versionNumber}</Badge>}
              </div>
              <p style={{ color: colors.textMuted, fontSize: 11, margin: 0, lineHeight: 1.5, maxWidth: 700 }}>{tpl.d}</p>
            </div>
          </div>
        </Card>

        {/* Workflow card */}
        {!activeVersion ? (
          <Card style={{ marginBottom: 14, textAlign: "center", padding: "30px 20px", borderColor: colors.teal + "55" }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
            <div style={{ color: colors.white, fontSize: 14, fontWeight: 700, marginBottom: 4 }}>No version yet</div>
            <p style={{ color: colors.textMuted, fontSize: 11, marginBottom: 16, maxWidth: 480, margin: "0 auto 16px" }}>
              Generate the first draft from the {tpl.n} template. Your organization name, industry, technology stack, and compliance frameworks are merged into the document automatically.
            </p>
            <Button onClick={() => handle(
              `gen:${tpl.id}`,
              { title: "Draft generated", body: "Edit and save as needed, then submit for review when ready." },
              () => generatePolicyDraft(tpl.id),
            )} disabled={busyId === `gen:${tpl.id}`}>
              {busyId === `gen:${tpl.id}` ? "Generating…" : "Generate Draft"}
            </Button>
          </Card>
        ) : (
          <PolicyEditor
            key={activeVersion.id}
            initialContent={activeVersion.content}
            changesSummary={activeVersion.changesSummary}
            readOnly={activeVersion.status !== "draft"}
            saving={busyId === `save:${tpl.id}`}
            headerLeft={
              <>
                <Badge color={statusColor(activeVersion.status, colors)}>{statusLabel(activeVersion.status)}</Badge>
                <span style={{ color: colors.textMuted, fontSize: 10 }}>Version {activeVersion.versionNumber}</span>
                {activeVersion.createdBy?.name && (
                  <span style={{ color: colors.textDim, fontSize: 10 }}>· by {activeVersion.createdBy.name}</span>
                )}
              </>
            }
            actions={
              <PolicyActions
                policy={policy!}
                version={activeVersion}
                busyId={busyId}
                approvers={approvers}
                onSubmit={() => submitForReview(tpl.id)}
                onSignOff={() => handle(`sign:${tpl.id}`, { title: "Approval recorded", body: "You may now publish, or another admin can." }, () => signOffPolicy(tpl.id))}
                onPublish={() => handle(`pub:${tpl.id}`, { title: "Policy published", body: "The version is now live across the tenant." }, () => publishPolicy(tpl.id))}
                onDiscard={async () => {
                  const ok = await modal.showConfirm("Discard this draft?", "This deletes the working draft. The published version (if any) remains live.", "danger");
                  if (ok) handle(`disc:${tpl.id}`, { title: "Draft discarded", body: "The draft has been removed." }, () => discardPolicyDraft(tpl.id));
                }}
                onStartNewVersion={() => handle(`new:${tpl.id}`, { title: "New version started", body: "A fresh draft has been forked from the published version." }, () => startNewPolicyVersion(tpl.id))}
              />
            }
            onSave={async (content, changesSummary) => {
              await new Promise<void>((resolve) => {
                setBusyId(`save:${tpl.id}`);
                startAction(async () => {
                  const res = await savePolicyDraft({ templateId: tpl.id, content, changesSummary });
                  setBusyId(null);
                  if (!res.ok) await modal.showAlert("Save failed", res.error ?? "Unknown error");
                  await refresh();
                  resolve();
                });
              });
            }}
          />
        )}

        {/* Approval record (when in review) */}
        {inReview && (
          <Card style={{ marginTop: 14, borderLeft: `3px solid ${colors.orange}` }}>
            <h3 style={{ color: colors.white, margin: 0, fontSize: 13 }}>Approval record</h3>
            <p style={{ color: colors.textMuted, fontSize: 11, margin: "4px 0 10px", lineHeight: 1.5 }}>
              Submission counts as the submitter's signoff. The named approver — chosen at submission — is the only person who can record the approval. Once they sign, the policy is publishable.
            </p>
            <SignoffRowKV
              label="Submitted by"
              value={inReview.submittedBy ? `${inReview.submittedBy.name} · ${new Date(inReview.submittedBy.at).toLocaleString()}` : "—"}
              colors={colors}
              good={!!inReview.submittedBy}
            />
            <SignoffRowKV
              label="Named approver"
              value={inReview.approver?.name ?? "—"}
              colors={colors}
              good={!!inReview.approver}
            />
            <SignoffRowKV
              label="Approver signoff"
              value={inReview.approverSignedAt
                ? `✓ ${inReview.approver?.name ?? "Approver"} · ${new Date(inReview.approverSignedAt).toLocaleString()}`
                : `Awaiting ${inReview.approver?.name ?? "approver"}`}
              colors={colors}
              good={!!inReview.approverSignedAt}
            />
          </Card>
        )}

        {/* Version history */}
        {policy && policy.versions.length > 0 && (
          <Card style={{ marginTop: 14 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
              <h3 style={{ color: colors.white, margin: 0, fontSize: 13 }}>Version history</h3>
              <span style={{ color: colors.textDim, fontSize: 10 }}>{policy.versions.length} version{policy.versions.length === 1 ? "" : "s"}</span>
            </div>
            {policy.versions.map((v) => (
              <div key={v.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "8px 0", borderTop: `1px solid ${colors.panelBorder}` }}>
                <div>
                  <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span style={{ color: colors.white, fontSize: 11, fontWeight: 700 }}>v{v.versionNumber}</span>
                    <Badge color={statusColor(v.status, colors)}>{statusLabel(v.status)}</Badge>
                    {v.publishedAt && <span style={{ color: colors.green, fontSize: 10 }}>· went live {new Date(v.publishedAt).toLocaleString()}</span>}
                  </div>
                  {v.changesSummary && <div style={{ color: colors.textMuted, fontSize: 10, marginTop: 2 }}>{v.changesSummary}</div>}
                  <div style={{ color: colors.textDim, fontSize: 9, marginTop: 2 }}>
                    by {v.createdBy?.name ?? "Unknown"} · {new Date(v.createdAt).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </Card>
        )}
      </div>
    );
  }

  // ────────────────────────────────────────────────────────────────────
  // LIST VIEW — three sections
  // ────────────────────────────────────────────────────────────────────
  return (
    <div>
      <SectionHeader sub="Generate, version, sign off, and publish enterprise security policies. Every policy is templated against your organization profile and tracked with full audit history.">
        Policies
      </SectionHeader>

      {/* Summary strip */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginBottom: 14 }}>
        <StatTile label="Templates available" value={POLICY_TEMPLATES.length} color={colors.textMuted} />
        <StatTile label="Drafts in flight" value={draftCount} color={colors.teal} sub={draftCount > 0 ? "Click 'Drafts' to continue" : "None — your library is current"} />
        <StatTile label="Live policies" value={liveCount} color={colors.green} sub={liveCount > 0 ? "Published, tenant-wide" : "Nothing published yet"} />
      </div>

      {/* Tab bar */}
      <div style={{ display: "flex", gap: 3, borderBottom: `1px solid ${colors.panelBorder}`, paddingBottom: 4, marginBottom: 14 }}>
        {([
          ["templates", `Templates (${POLICY_TEMPLATES.length})`],
          ["drafts", `Drafts in Flight${draftCount > 0 ? ` (${draftCount})` : ""}`],
          ["live", `Live Policies${liveCount > 0 ? ` (${liveCount})` : ""}`],
        ] as const).map(([id, label]) => {
          const active = tab === id;
          return (
            <button key={id} onClick={() => setTab(id)} style={{
              padding: "6px 14px", borderRadius: "6px 6px 0 0", border: "none", cursor: "pointer",
              background: active ? colors.teal + "22" : "transparent",
              color: active ? colors.teal : colors.textMuted,
              fontSize: 12, fontWeight: 700, fontFamily: "inherit",
              borderBottom: active ? `2px solid ${colors.teal}` : "2px solid transparent",
            }}>{label}</button>
          );
        })}
      </div>

      {/* Templates tab */}
      {tab === "templates" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(280px,1fr))", gap: 12 }}>
          {POLICY_TEMPLATES.map((t) => {
            const policy = findByTemplate(t.id);
            const live = policy?.publishedVersion;
            const draft = policy?.draftVersion;
            const review = policy?.inReviewVersion;
            return (
              <Card key={t.id} onClick={() => setSelectedTemplateId(t.id)} style={{ cursor: "pointer", borderColor: live ? colors.green + "33" : colors.panelBorder }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <span style={{ fontSize: 26 }}>{t.i}</span>
                  <div style={{ display: "flex", flexDirection: "column", gap: 3, alignItems: "flex-end" }}>
                    {live && <Badge color={colors.green}>Live · v{live.versionNumber}</Badge>}
                    {review && <Badge color={colors.orange}>In Review · v{review.versionNumber}</Badge>}
                    {draft && <Badge color={colors.teal}>Draft · v{draft.versionNumber}</Badge>}
                    {!live && !review && !draft && <Badge color={colors.textDim}>Not generated</Badge>}
                  </div>
                </div>
                <h4 style={{ color: colors.white, margin: "10px 0 4px", fontSize: 13 }}>{t.n}</h4>
                <p style={{ color: colors.textMuted, fontSize: 10, margin: "0 0 10px", lineHeight: 1.5 }}>{t.d}</p>
                {live && (
                  <div style={{ color: colors.green, fontSize: 9, fontWeight: 600 }}>
                    Went live {new Date(live.publishedAt!).toLocaleDateString()}
                  </div>
                )}
                {!policy && (
                  <Button size="sm" variant="outline" style={{ width: "100%", marginTop: 6 }} onClick={() => {
                    handle(
                      `gen:${t.id}`,
                      { title: "Draft generated", body: "Open the policy to edit, sign off, and publish." },
                      () => generatePolicyDraft(t.id),
                    );
                    setTimeout(() => setSelectedTemplateId(t.id), 100);
                  }} disabled={busyId === `gen:${t.id}`}>
                    {busyId === `gen:${t.id}` ? "Generating…" : "Generate"}
                  </Button>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Drafts tab */}
      {tab === "drafts" && (
        <>
          {draftCount === 0 ? (
            <Card style={{ textAlign: "center", padding: "30px 20px" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>✓</div>
              <div style={{ color: colors.white, fontSize: 13, fontWeight: 700 }}>No drafts in flight</div>
              <div style={{ color: colors.textMuted, fontSize: 11, marginTop: 4 }}>Generate a new policy or start a new version from the Live tab.</div>
            </Card>
          ) : (
            policies
              .filter((p) => p.draftVersion || p.inReviewVersion)
              .map((p) => {
                const tpl = POLICY_TEMPLATES.find((t) => t.id === p.templateId)!;
                const v = p.inReviewVersion ?? p.draftVersion!;
                return (
                  <Card key={p.id} onClick={() => setSelectedTemplateId(p.templateId)} style={{ cursor: "pointer", marginBottom: 10, borderLeft: `3px solid ${v.status === "in_review" ? colors.orange : colors.teal}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12 }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 18 }}>{tpl.i}</span>
                          <span style={{ color: colors.white, fontSize: 13, fontWeight: 700 }}>{tpl.n}</span>
                          <Badge color={statusColor(v.status, colors)}>{statusLabel(v.status)} · v{v.versionNumber}</Badge>
                        </div>
                        <div style={{ color: colors.textMuted, fontSize: 10, marginTop: 4 }}>
                          {v.changesSummary || "No change summary yet."}
                        </div>
                        {v.status === "in_review" && (
                          <div style={{ display: "flex", gap: 14, marginTop: 6, flexWrap: "wrap" }}>
                            <span style={{ color: v.submittedBy ? colors.green : colors.textDim, fontSize: 10 }}>
                              {v.submittedBy ? `✓ Submitted by ${v.submittedBy.name}` : "Awaiting submission"}
                            </span>
                            <span style={{ color: v.approverSignedAt ? colors.green : colors.textDim, fontSize: 10 }}>
                              {v.approverSignedAt
                                ? `✓ Approved by ${v.approver?.name ?? "approver"}`
                                : `Awaiting approval from ${v.approver?.name ?? "named approver"}`}
                            </span>
                          </div>
                        )}
                      </div>
                      <Button size="sm" variant="outline">Open →</Button>
                    </div>
                  </Card>
                );
              })
          )}
        </>
      )}

      {/* Live tab */}
      {tab === "live" && (
        <>
          {liveCount === 0 ? (
            <Card style={{ textAlign: "center", padding: "30px 20px" }}>
              <div style={{ fontSize: 32, marginBottom: 8 }}>📄</div>
              <div style={{ color: colors.white, fontSize: 13, fontWeight: 700 }}>No live policies yet</div>
              <div style={{ color: colors.textMuted, fontSize: 11, marginTop: 4 }}>Generate, sign off, and publish a draft to see it here.</div>
            </Card>
          ) : (
            policies
              .filter((p) => p.publishedVersion)
              .map((p) => {
                const tpl = POLICY_TEMPLATES.find((t) => t.id === p.templateId)!;
                const v = p.publishedVersion!;
                return (
                  <Card key={p.id} style={{ marginBottom: 10, borderLeft: `3px solid ${colors.green}` }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 4 }}>
                          <span style={{ fontSize: 20 }}>{tpl.i}</span>
                          <span style={{ color: colors.white, fontSize: 14, fontWeight: 700 }}>{tpl.n}</span>
                          <Badge color={colors.green}>Live · v{v.versionNumber}</Badge>
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "auto 1fr", columnGap: 14, rowGap: 3, fontSize: 10, color: colors.textMuted, maxWidth: 720 }}>
                          <span style={{ color: colors.textDim }}>Went live</span><span>{new Date(v.publishedAt!).toLocaleString()}</span>
                          <span style={{ color: colors.textDim }}>Published by</span><span>{v.publishedBy?.name ?? "—"}</span>
                          {v.submittedBy && <><span style={{ color: colors.textDim }}>Submitted by</span><span>{v.submittedBy.name} · {new Date(v.submittedBy.at).toLocaleString()}</span></>}
                          {v.approver && v.approverSignedAt && <><span style={{ color: colors.textDim }}>Approved by</span><span>{v.approver.name} · {new Date(v.approverSignedAt).toLocaleString()}</span></>}
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                        <Button size="sm" onClick={() => setSelectedTemplateId(p.templateId)}>View</Button>
                        <Button size="sm" variant="outline" onClick={() => handle(`new:${p.templateId}`, { title: "New version started", body: "A fresh draft has been forked." }, () => startNewPolicyVersion(p.templateId))} disabled={!!p.draftVersion || busyId === `new:${p.templateId}`}>
                          {p.draftVersion ? "Draft in flight" : "New Version"}
                        </Button>
                      </div>
                    </div>
                    {historyOpen === p.id && (
                      <div style={{ marginTop: 12, paddingTop: 8, borderTop: `1px solid ${colors.panelBorder}` }}>
                        {p.versions.filter((x) => x.publishedAt).map((pv) => (
                          <div key={pv.id} style={{ color: colors.textMuted, fontSize: 10, padding: "3px 0" }}>
                            v{pv.versionNumber} · went live {new Date(pv.publishedAt!).toLocaleString()} · published by {pv.publishedBy?.name ?? "—"}
                          </div>
                        ))}
                      </div>
                    )}
                    <Button size="sm" variant="ghost" onClick={() => setHistoryOpen(historyOpen === p.id ? null : p.id)} style={{ marginTop: 4 }}>
                      {historyOpen === p.id ? "Hide history" : `Publication history (${p.versions.filter((x) => x.publishedAt).length})`}
                    </Button>
                  </Card>
                );
              })
          )}
        </>
      )}
    </div>
  );
}

// ─── helpers ──────────────────────────────────────────────────────────

function statusColor(status: string, colors: ReturnType<typeof useColors>): string {
  if (status === "published") return colors.green;
  if (status === "in_review") return colors.orange;
  if (status === "draft") return colors.teal;
  return colors.textDim; // archived
}
function statusLabel(status: string): string {
  if (status === "published") return "Published";
  if (status === "in_review") return "In Review";
  if (status === "draft") return "Draft";
  if (status === "archived") return "Archived";
  return status;
}

function StatTile({ label, value, color, sub }: { label: string; value: number; color: string; sub?: string }) {
  const colors = useColors();
  return (
    <Card style={{ padding: "12px 14px" }}>
      <div style={{ color: colors.textDim, fontSize: 9, fontWeight: 700, letterSpacing: "0.08em", textTransform: "uppercase" }}>{label}</div>
      <div style={{ color, fontSize: 26, fontWeight: 800, lineHeight: 1.1, marginTop: 4 }}>{value}</div>
      {sub && <div style={{ color: colors.textMuted, fontSize: 10, marginTop: 4 }}>{sub}</div>}
    </Card>
  );
}

function SignoffRowKV({ label, value, colors, good }: { label: string; value: string; colors: ReturnType<typeof useColors>; good?: boolean }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 0", borderTop: `1px solid ${colors.panelBorder}` }}>
      <span style={{ color: colors.textMuted, fontSize: 11 }}>{label}</span>
      <span style={{ color: good ? colors.green : colors.textDim, fontSize: 11 }}>{value}</span>
    </div>
  );
}

function PolicyActions({
  policy, version, busyId, approvers, onSubmit, onSignOff, onPublish, onDiscard, onStartNewVersion,
}: {
  policy: PolicyDTO;
  version: PolicyVersionDTO;
  busyId: string | null;
  approvers: ApproverCandidate[];
  onSubmit: () => void;
  onSignOff: () => void;
  onPublish: () => void;
  onDiscard: () => void;
  onStartNewVersion: () => void;
}) {
  const tplId = policy.templateId;
  const me = approvers.find((a) => a.isSelf);
  const isNamedApprover = !!(version.approver && me && version.approver.userId === me.userId);
  const approved = !!version.approverSignedAt;

  if (version.status === "draft") {
    return (
      <>
        <Button size="sm" variant="ghost" onClick={onDiscard} disabled={busyId === `disc:${tplId}`}>Discard</Button>
        <Button size="sm" onClick={onSubmit} disabled={busyId === `review:${tplId}`}>
          {busyId === `review:${tplId}` ? "Submitting…" : "Submit for Approval"}
        </Button>
      </>
    );
  }
  if (version.status === "in_review") {
    return (
      <>
        <Button
          size="sm"
          variant="outline"
          onClick={onSignOff}
          disabled={!isNamedApprover || approved || busyId === `sign:${tplId}`}
        >
          {approved
            ? `✓ Approved`
            : !isNamedApprover
              ? `Approval pending (${version.approver?.name ?? "approver"})`
              : busyId === `sign:${tplId}` ? "Signing…" : "Sign Off as Approver"}
        </Button>
        <Button size="sm" onClick={onPublish} disabled={!approved || busyId === `pub:${tplId}`}>
          {busyId === `pub:${tplId}` ? "Publishing…" : "Publish"}
        </Button>
      </>
    );
  }
  if (version.status === "published") {
    return (
      <Button size="sm" variant="outline" onClick={onStartNewVersion} disabled={!!policy.draftVersion || busyId === `new:${tplId}`}>
        {policy.draftVersion ? "Draft in flight" : busyId === `new:${tplId}` ? "Forking…" : "Start New Version"}
      </Button>
    );
  }
  return null;
}
