/**
 * Line-based diff for the policy version-comparison view.
 *
 * Classic O(n·m) Longest Common Subsequence — small policies (a few thousand
 * lines max) make this fast enough; spending a dep on Myers wasn't worth it.
 */

export type DiffOp = "equal" | "add" | "remove";
export interface DiffLine {
  op: DiffOp;
  text: string;
  /** Line number in the "from" (older) text, when applicable. */
  oldLine?: number;
  /** Line number in the "to" (newer) text, when applicable. */
  newLine?: number;
}

export function diffLines(from: string, to: string): DiffLine[] {
  const a = from.replace(/\r\n/g, "\n").split("\n");
  const b = to.replace(/\r\n/g, "\n").split("\n");

  // LCS table
  const m = a.length, n = b.length;
  const dp: number[][] = Array.from({ length: m + 1 }, () => new Array(n + 1).fill(0));
  for (let i = m - 1; i >= 0; i--) {
    for (let j = n - 1; j >= 0; j--) {
      dp[i][j] = a[i] === b[j] ? dp[i + 1][j + 1] + 1 : Math.max(dp[i + 1][j], dp[i][j + 1]);
    }
  }

  const out: DiffLine[] = [];
  let i = 0, j = 0;
  while (i < m && j < n) {
    if (a[i] === b[j]) {
      out.push({ op: "equal", text: a[i], oldLine: i + 1, newLine: j + 1 });
      i++; j++;
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      out.push({ op: "remove", text: a[i], oldLine: i + 1 });
      i++;
    } else {
      out.push({ op: "add", text: b[j], newLine: j + 1 });
      j++;
    }
  }
  while (i < m) { out.push({ op: "remove", text: a[i], oldLine: i + 1 }); i++; }
  while (j < n) { out.push({ op: "add", text: b[j], newLine: j + 1 }); j++; }
  return out;
}

/**
 * Summarize a diff into "+N -M" counts (excludes equal lines).
 */
export function diffStats(lines: DiffLine[]): { added: number; removed: number } {
  let added = 0, removed = 0;
  for (const l of lines) {
    if (l.op === "add") added++;
    else if (l.op === "remove") removed++;
  }
  return { added, removed };
}
