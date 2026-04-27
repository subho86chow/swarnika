import { auth, clerkClient } from "@clerk/nextjs/server";
import { prisma } from "./prisma";

export async function isAdminUser(userId) {
  if (!userId) return false;

  // Bootstrap: if no admins exist in DB yet, allow any authenticated user.
  const count = await prisma.adminEmail.count();
  if (count === 0) return true;

  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    const email = user.emailAddresses[0]?.emailAddress;
    if (!email) return false;
    const exists = await prisma.adminEmail.findUnique({ where: { email } });
    return !!exists;
  } catch {
    return false;
  }
}

export async function getAdminEmail(userId) {
  if (!userId) return null;
  try {
    const client = await clerkClient();
    const user = await client.users.getUser(userId);
    return user.emailAddresses[0]?.emailAddress || null;
  } catch {
    return null;
  }
}
