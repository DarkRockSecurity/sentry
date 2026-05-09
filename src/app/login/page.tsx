import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Sign in · Sentry",
  description: "Sign in to Sentry by Dark Rock Labs.",
};

export default function LoginPage() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#0A0E14" }} />}>
      <LoginForm />
    </Suspense>
  );
}
