import { DocsShell } from "@/components/docs/DocsShell";

export const metadata = {
  title: "Docs · Sentry by Dark Rock Labs",
  description: "Documentation for the Sentry cyber resilience platform.",
};

export default function DocsLayout({ children }: { children: React.ReactNode }) {
  return <DocsShell>{children}</DocsShell>;
}
