export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "../../../lib/prisma";

export default async function InquiriesPage() {
  const inquiries = await prisma.inquiry.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-headline text-3xl md:text-4xl text-navy font-light italic mb-2">Inquiries</h1>
          <p className="font-body text-outline text-sm">Customer contact submissions.</p>
        </div>
        <span className="font-headline text-3xl text-navy font-light">{inquiries.length}</span>
      </div>

      {inquiries.length === 0 ? (
        <div className="bg-white border border-surface-dim p-12 text-center">
          <span className="material-symbols-outlined text-outline-var text-4xl mb-4 block">mail</span>
          <h3 className="font-headline text-xl text-navy font-light italic">No inquiries yet</h3>
          <p className="font-body text-outline text-sm mt-2">Submissions from the contact page will appear here.</p>
        </div>
      ) : (
        <div className="bg-white border border-surface-dim overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-surface-dim bg-surface-low">
                  <th className="font-label text-[10px] tracking-widest uppercase text-outline font-semibold px-6 py-4">Name</th>
                  <th className="font-label text-[10px] tracking-widest uppercase text-outline font-semibold px-6 py-4">Email</th>
                  <th className="font-label text-[10px] tracking-widest uppercase text-outline font-semibold px-6 py-4">Phone</th>
                  <th className="font-label text-[10px] tracking-widest uppercase text-outline font-semibold px-6 py-4">Message</th>
                  <th className="font-label text-[10px] tracking-widest uppercase text-outline font-semibold px-6 py-4">Date</th>
                  <th className="font-label text-[10px] tracking-widest uppercase text-outline font-semibold px-6 py-4">Status</th>
                </tr>
              </thead>
              <tbody>
                {inquiries.map((inquiry) => (
                  <tr key={inquiry.id} className="border-b border-surface-dim last:border-b-0 hover:bg-surface-low/50 transition-colors">
                    <td className="px-6 py-4 font-body text-sm text-navy">{inquiry.name}</td>
                    <td className="px-6 py-4">
                      <a href={`mailto:${inquiry.email}`} className="font-body text-sm text-gold hover:underline">
                        {inquiry.email}
                      </a>
                    </td>
                    <td className="px-6 py-4 font-body text-sm text-outline">{inquiry.phone || "—"}</td>
                    <td className="px-6 py-4 font-body text-sm text-navy max-w-xs truncate">{inquiry.message}</td>
                    <td className="px-6 py-4 font-body text-xs text-outline whitespace-nowrap">
                      {new Date(inquiry.createdAt).toLocaleDateString("en-IN", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <InquiryStatusBadge status={inquiry.status} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function InquiryStatusBadge({ status }) {
  const styles = {
    new: "bg-gold/10 text-gold border-gold/20",
    read: "bg-blue-50 text-blue-600 border-blue-200",
    replied: "bg-green-50 text-green-600 border-green-200",
  };
  return (
    <span className={`inline-flex px-2.5 py-1 font-label text-[9px] tracking-wider uppercase font-semibold border ${styles[status] || styles.new}`}>
      {status}
    </span>
  );
}
