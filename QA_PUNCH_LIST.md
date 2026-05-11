# Sentry — QA Punch List

**Reviewed:** May 11, 2026
**Scope:** In-app modules under `src/components/{dashboard,threat-intel,assessment,commander,playbooks,tasks,tickets,forensics,stakeholders,policies,access,onboarding,settings,communications,tabletop,pentesting,integrations}/*Module.tsx`
**Method:** Third-party code-level walkthrough — not a click-through smoke test. Findings are sorted by priority. Some P0/P1 items may turn out to be agent over-reporting; I've added a "verify" column where I'm not yet certain.

Items are written so each is independently actionable. Cite file:line for grep.

---

## P0 — Broken / lost work

| # | File:line | Issue | Verify? |
|---|---|---|---|
| P0-1 | `src/components/playbooks/PlaybooksModule.tsx` ~lines 35-50 | `listCustomPlaybooks()` mapping has no null guards on returned arrays. A malformed server response will throw inside the `useEffect`'s `.then`. Add a try/catch + fallback. | yes |
| P0-2 | `src/components/access/AccessModule.tsx` ~line 36-46 | `addTeamMemberAction()` happy-path shows alert with `res.email`, but error path uses `res.error` which can be `undefined` and renders "undefined" in the dialog. Coerce to a fallback string. | yes |
| P0-3 | `src/components/stakeholders/StakeholdersModule.tsx` ~line 88 | After invite the local Zustand state is optimistically updated; if `inviteStakeholder()` rejects with a non-HTTP error the optimistic state is now stale. Wrap in try/catch and roll back on failure. | yes |
| P0-4 | `src/components/playbooks/PlaybooksModule.tsx` line ~53 | Subtask id calculation `caseId + i + phase.k.charCodeAt(0)` can collide (e.g. `iocs[0]` and `contain[0]` if charCodes differ by 0 — they don't here but it's fragile). Switch to `Date.now() + i` or random suffix. | yes |
| P0-5 | `src/components/tasks/TasksModule.tsx` ~line 59 | "Create + Ticket" relies on `activeIncident` being set; if user clicks with no active incident, `ticketId` is undefined and the task is orphaned (parent ticket never created). Either disable the button when `!activeIncident` or auto-create a standalone parent. | yes |
| P0-6 | `src/components/forensics/ForensicsModule.tsx` ~line 155 | "Access Denied" guard renders **after** the detail body has briefly mounted — hydration flicker exposes evidence to an unauthorized user for one frame. Move the access check above the detail render. | yes |

---

## P1 — UX failures

| # | File:line | Issue |
|---|---|---|
| P1-1 | `src/components/threat-intel/ThreatIntelModule.tsx` ~line 208 (tab buttons) | Tabs are rendered as raw `<button>` styled inline. No `aria-selected`, no `role="tab"`, no arrow-key navigation. Keyboard users can't move between Global/Industry. |
| P1-2 | `src/components/assessment/AssessmentModule.tsx` ~line 336 | "Submit" enabled at any progress; only stops below 30%, but the button itself doesn't show the threshold. Either show "Submit (need 30%)" while disabled, or always allow submit with confirm dialog. |
| P1-3 | `src/components/tickets/TicketsModule.tsx` ~line 37 | Inline `<Select>` for status changes the ticket on every onChange — no confirm, no undo. Misclick can mark a Critical ticket "Closed". |
| P1-4 | `src/components/stakeholders/StakeholdersModule.tsx` invite button | The Invite button doesn't go disabled while `inviting` transition is in flight; user can double-click and trigger two `provisionAuth` calls (idempotent server-side but UX-confusing). Pass `disabled={inviting}` and update label to "Inviting…". |
| P1-5 | `src/components/tabletop/TabletopModule.tsx` ~line 481 | "Finish Walk-Through" saves the AAR even when zero objectives have been rated. Block the button or show a confirm dialog when `ltSteps` is empty / all unanswered. |
| P1-6 | `src/components/policies/PoliciesModule.tsx` ~line 22 | `generatePolicy()` is synchronous (no `await`, no loading state). On large policies the UI freezes for a beat. Wrap in `useTransition` and disable the row during generation. |
| P1-7 | `src/components/integrations/IntegrationsModule.tsx` | Every card says "Coming Soon" with no functional difference between them. Either gate the entire module behind a feature flag and hide it, or wire "Register Interest" to a Resend email so the click does something. |
| P1-8 | `src/components/communications/CommsModule.tsx` | "Configure" buttons on every channel are no-ops — same problem as Integrations. Either implement Slack/Teams/PagerDuty config flows or label them "Roadmap". |
| P1-9 | `src/components/access/AccessModule.tsx` ~line 51 (team table) | Long names overflow the `2fr 2fr 1fr 1fr` grid silently. Add `overflow: hidden; text-overflow: ellipsis; white-space: nowrap` to the row cells, and a tooltip on hover for the full value. |
| P1-10 | `src/components/pentesting/PenTestingModule.tsx` ~line 176 | Submission has no client-side validation; if `scope` or `target` fields are blank the server returns a generic error. Add required-field markers + pre-submit validation. |

---

## P2 — Polish (spacing, font, copy)

| # | File:line | Issue |
|---|---|---|
| P2-1 | `src/components/threat-intel/ThreatIntelModule.tsx` ~line 246 | Tech-details grid uses `gap: "4px 16px"` — 4 px horizontal gap is too tight; labels and values touch. Bump to `"8px 16px"`. |
| P2-2 | Same grid, same area | Every row gets `borderBottom: "1px solid"` including the last row, leaving a stray line. Use `:not(:last-child)` or omit on the final row. |
| P2-3 | `src/components/assessment/AssessmentModule.tsx` ~line 268 | Score gradient is computed inline (`fs >= 80 ? colors.green …`). Use the existing `ScoreGauge` component or a util to keep colors consistent with the rest of the dashboards. |
| P2-4 | `src/components/playbooks/PlaybooksModule.tsx` Export Checklist | Generated txt blob doesn't escape special chars (newlines, `─`). On non-mono displays the formatting wraps and looks broken. Strip to ASCII-only or use a markdown export. |
| P2-5 | `src/components/tasks/TasksModule.tsx` ~line 85 | Cards use `borderLeft: "3px solid" + priorityColor`. If priority is misspelled or missing, the color is `undefined` and the border vanishes. Add fallback to `colors.textDim`. |
| P2-6 | `src/components/forensics/ForensicsModule.tsx` ~line 280 | File-type icons hard-coded inline; add a `FILE_TYPE_ICONS` constant and include common types (.docx, .xlsx, .csv, .pcap, .evtx). |
| P2-7 | `src/components/stakeholders/StakeholdersModule.tsx` add-form | When the form opens the layout shifts vertically; reserve space by rendering the panel with `visibility: hidden` collapsed instead of conditional mount. Or animate the open. |
| P2-8 | `src/components/tabletop/TabletopModule.tsx` ~line 320-330 | Status pipeline circles fixed at 24×24 with font 9. Below ~1100 px wide they crop and overlap. Make the row `flex-wrap: wrap` or shrink at breakpoint. |
| P2-9 | `src/components/pentesting/PenTestingModule.tsx` ~line 357 | Pricing card uses `flex: 1, minWidth: 200`. On narrow viewports it pushes the action buttons off-screen. Add a `flex-wrap` on the parent. |
| P2-10 | `src/components/integrations/IntegrationsModule.tsx` | Every card uses the same teal pill; categorize visually (productivity / security / cloud / SIEM) using subtle border-left color. |
| P2-11 | `src/components/access/AccessModule.tsx` ~line 88 | Radio indicators are hand-styled inline. Extract a `RadioDot` UI primitive — these are used in 3+ places (rbac tiers, settings, etc.). |
| P2-12 | `src/components/threat-intel/ThreatIntelModule.tsx` long-title | Long CVE titles wrap to 3+ lines. Cap at `max-width: 70ch` or two lines via `line-clamp`. |
| P2-13 | `src/components/onboarding/Onboarding.tsx` step indicator | The connector line between steps is `height: 2; flex: 1; marginBottom: 16` — the vertical alignment to the circle's vertical centre is off by a couple of pixels. Snap the line to `align-self: center`. |
| P2-14 | Mixed font-size scale across modules | Module headings use `fontSize: 13` in some places, `14` in others, and `12` in cards. Settle on a 3-tier scale (H1=18, H2=14, body=12) in a token file. |
| P2-15 | `src/components/settings/SettingsModule.tsx` ~line 4 | Duplicate `useTheme` import alongside `useColors`. Probably unused; tree-shaking will catch it but it adds noise to PR diffs. |

---

## P3 — Suggestions

| # | File:line | Suggestion |
|---|---|---|
| P3-1 | `src/components/threat-intel/ThreatIntelModule.tsx` ~line 38 | Parent ticket id uses `Math.floor(Math.random() * 1e12)` — strong enough for demo but should move to a UUID helper for production. |
| P3-2 | Playbooks list | No pagination today — fine with 18 entries, will need it past ~40 custom playbooks. |
| P3-3 | `src/components/assessment/AssessmentModule.tsx` ~line 33 | Inline score math should be extracted to `calculateFnScore()` in `src/lib/assessment-scoring.ts`. |
| P3-4 | `src/components/stakeholders/StakeholdersModule.tsx` | Sub-components `InternalTab` / `ExternalTab` / `VendorsTab` are declared **inside** the parent function — they're recreated each render. Extract them as top-level components and pass props. Cheap win. |
| P3-5 | `src/components/forensics/ForensicsModule.tsx` ~line 289 | SHA-256 is truncated to 16 chars in the display; the full value is in the DOM `title=` but a copy-to-clipboard button would help during chain-of-custody review. |
| P3-6 | `src/components/policies/PoliciesModule.tsx` ~line 52 | Policy preview is a `<pre>` with mouse-only scroll. Make it focusable + arrow-key scrollable. |
| P3-7 | `src/components/settings/SettingsModule.tsx` theme previews | Preview swatches use hardcoded `#00D4C8`/`#0D9488`. Read these from `darkColors`/`lightColors` in `@/lib/theme` so brand updates cascade. |
| P3-8 | All modules | The `SectionHeader` sub-strings are inconsistent in length (some 50 chars, some 120). Cap at ~80 for visual rhythm. |
| P3-9 | Module-wide | `module-data.ts` has a comprehensive screenshot taxonomy but no per-module **help text** linked from the live module. A "What is this?" link in each `SectionHeader` would close that loop. |

---

## Module-by-module observation

| Module | Verdict | Notes |
|---|---|---|
| Dashboard | Production | 3-category metric layout solid; status banner gradients work in both themes. |
| Threat Intel | Production | Full pipeline (refresh, score, applicability) works; minor a11y on tab buttons. |
| Assessment | Production | NIST CSF flow + hitlist; submit threshold UX unclear. |
| IR Planner | Production | Read-only catalog of phases — by design. |
| Commander | Production | Real-time timer + SLA tickers; verify auto-ticket creation re-tested after PR. |
| Incident Log | Production | Auto-discovery & phase tracking solid. |
| Playbooks | Production | Now editable + 4 new presets; ID generation could be tightened. |
| Tasks | Production | Kanban functional; orphan-task risk if `activeIncident` is null. |
| Tickets | Production | Master/child hierarchy good; status-change has no confirm. |
| Forensics | Production | SHA-256 + chain-of-custody; brief flicker on access-denied. |
| Stakeholders | Production | Internal/external/vendor + new invite flow. Strong. |
| Policies | Mostly production | Generation is synchronous; rest of module is solid. |
| Access | Production | RBAC matrix + working invite; table alignment polish needed. |
| Onboarding | Production | Now triggers threat-intel refresh on industry change. |
| Settings | Production | Theme + role selector; minor duplicate import. |
| Comms | **Stub** | Configure buttons are no-ops. Either implement or rename "Roadmap". |
| Tabletop | Production-shaped | Full AAR flow; finish-button lacks validation. |
| Pen Testing | Production-shaped | Submission flow exists; form validation thin. |
| Integrations | **Stub** | All "Coming Soon"; Register-Interest should email Dark Rock. |

---

## Recommended fix order

1. **Knock out P0-1 through P0-6** in a single PR — these are 30-line, low-risk fixes that close real foot-guns.
2. **Bundle P1-1 through P1-10** as a UX polish PR — add disabled states, confirm dialogs, validation. Tractable in a day.
3. **Comms + Integrations** decision: implement-or-rename. Stubs in production marketing surfaces erode trust.
4. **P2 batch** — keep for a focused "polish day". None affect functionality, but they all show.
5. **P3 batch** — schedule as a refactor sprint once feature work slows.
