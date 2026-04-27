import { getAdminEmails } from "../../../lib/adminEmailActions";
import AdminEmailForm from "./components/AdminEmailForm";

export default async function AdminEmailsPage() {
  const emails = await getAdminEmails();

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-headline text-3xl text-navy font-light italic">Admin Access</h1>
          <p className="font-body text-outline text-xs mt-1">
            Manage who can access the admin panel
          </p>
        </div>
      </div>

      <AdminEmailForm emails={emails} />
    </div>
  );
}
