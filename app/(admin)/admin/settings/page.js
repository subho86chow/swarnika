export const dynamic = "force-dynamic";

import { prisma } from "../../../lib/prisma";
import SettingsForm from "../components/SettingsForm";

export default async function SettingsPage() {
  const settings = await prisma.siteContent.findMany();
  const settingsMap = settings.reduce((acc, curr) => {
    acc[curr.key] = curr.value;
    return acc;
  }, {});

  return (
    <div className="space-y-8 animate-fade-in-up">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl text-navy font-light italic mb-2">Site Settings</h1>
        <p className="font-body text-outline text-sm">Update hero content, announcement bars, and other global configurations.</p>
      </div>

      <SettingsForm settings={settingsMap} />
    </div>
  );
}
