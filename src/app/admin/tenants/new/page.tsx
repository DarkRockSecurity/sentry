import { OnboardingWizard } from "./Wizard";
import { INDUSTRIES, ORG_SIZES, PLANS } from "@/app/admin/_constants";

export const metadata = { title: "Onboard new client · Sentry Admin" };

export default function NewTenantPage() {
  return <OnboardingWizard industries={[...INDUSTRIES]} sizes={[...ORG_SIZES]} plans={[...PLANS]} />;
}
