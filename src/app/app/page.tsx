import { TenantStateProvider } from "@/components/app/TenantStateProvider";
import { getTenantContext } from "./_actions";
import { AppShell } from "./AppShell";

export const dynamic = "force-dynamic";

export default async function App() {
  const ctx = await getTenantContext();
  return (
    <TenantStateProvider tenantContext={ctx}>
      <AppShell />
    </TenantStateProvider>
  );
}
