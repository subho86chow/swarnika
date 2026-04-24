import { auth, clerkClient } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import AdminLayoutClient from "./AdminLayoutClient";

async function isAuthorized(userId) {
  if (!userId) return false;

  const allowedEmails = process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(",").map((e) => e.trim()).filter(Boolean)
    : [];

  if (allowedEmails.length === 0) {
    // If ADMIN_EMAILS is not configured, any authenticated user can access admin.
    // For production, set ADMIN_EMAILS in your environment.
    return true;
  }

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress;
    return email && allowedEmails.includes(email);
  } catch {
    return false;
  }
}

export default async function AdminLayout({ children }) {
  const { userId } = await auth();

  if (!userId || !(await isAuthorized(userId))) {
    redirect("/");
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
