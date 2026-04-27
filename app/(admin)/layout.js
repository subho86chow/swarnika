import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { isAdminUser } from "../lib/adminAuth";
import AdminLayoutClient from "./AdminLayoutClient";

export default async function AdminLayout({ children }) {
  const { userId } = await auth();

  if (!userId || !(await isAdminUser(userId))) {
    redirect("/");
  }

  return <AdminLayoutClient>{children}</AdminLayoutClient>;
}
