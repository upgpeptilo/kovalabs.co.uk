import { requireAdmin } from "@/lib/admin";
import { AccountForms } from "./AccountForms";

export default async function AdminAccount() {
  const user = await requireAdmin();
  return (
    <div className="max-w-md">
      <h1 className="text-2xl font-bold">Account</h1>
      <p className="mt-1 text-sm text-muted">Signed in as {user.email}</p>
      <AccountForms email={user.email} />
    </div>
  );
}
