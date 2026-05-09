import type { Metadata } from "next";
import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://sentry.darkrocklabs.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "Sign in · Sentry by Dark Rock Labs",
  description: "Sign in to Sentry — the cyber resilience platform by Dark Rock Labs.",
  alternates: { canonical: SITE_URL + "/login" },
  openGraph: {
    type: "website",
    siteName: "Sentry by Dark Rock Labs",
    title: "Sign in · Sentry",
    description: "Sign in to Sentry — the cyber resilience platform by Dark Rock Labs.",
    url: SITE_URL + "/login",
    images: [{ url: "/marketing/screenshots/homepage.png", width: 1440, height: 900, alt: "Sentry sign-in" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Sign in · Sentry",
    description: "Sign in to Sentry — the cyber resilience platform by Dark Rock Labs.",
    images: ["/marketing/screenshots/homepage.png"],
  },
  robots: { index: false, follow: false }, // login pages shouldn't be indexed
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0A0E14" }} />}>
      <LoginForm />
    </Suspense>
  );
}
