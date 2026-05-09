import { Nav } from "@/components/marketing/Nav";
import { Hero } from "@/components/marketing/Hero";
import { Capabilities } from "@/components/marketing/Capabilities";
import { HowItWorks } from "@/components/marketing/HowItWorks";
import { ModulesGrid } from "@/components/marketing/ModulesGrid";
import { Footer } from "@/components/marketing/Footer";

export const metadata = {
  title: "Sentry by Dark Rock Labs — Cyber Resilience Platform",
  description:
    "Sentry unifies cybersecurity assessment, incident command, playbooks, tabletop exercises, forensics, and stakeholder communication into a single workspace.",
};

export default function MarketingHome() {
  return (
    <main style={{ background: "#0A0E14", minHeight: "100vh", color: "#E2E8F0" }}>
      <Nav />
      <Hero />
      <Capabilities />
      <HowItWorks />
      <ModulesGrid />
      <Footer />
    </main>
  );
}
