"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";

export default function TrackPage({ params }) {
  const { waybill } = use(params);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchTracking() {
      try {
        const res = await fetch(`/api/track?waybill=${encodeURIComponent(waybill)}`);
        const json = await res.json();
        if (json.success) {
          setData(json);
        } else {
          setError(json.error || "Tracking data not available");
        }
      } catch (e) {
        setError("Failed to fetch tracking data");
      } finally {
        setLoading(false);
      }
    }
    fetchTracking();
  }, [waybill]);

  return (
    <main className="pt-[72px] bg-background min-h-screen">
      <section className="pt-8 md:pt-10 pb-6 md:pb-8 px-6 md:px-14 lg:px-20">
        <div className="max-w-[600px] mx-auto">
          <h1 className="font-headline text-3xl md:text-4xl text-navy italic text-center">
            Track Shipment
          </h1>
          <p className="font-body text-outline text-sm mt-2 text-center">
            Waybill: <span className="text-gold font-mono font-medium">{waybill}</span>
          </p>
        </div>
      </section>

      <section className="pb-16 md:pb-24 px-6 md:px-14 lg:px-20">
        <div className="max-w-[600px] mx-auto space-y-6">
          {loading && (
            <div className="text-center py-12">
              <div className="w-8 h-8 border-2 border-gold border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-outline text-sm mt-4">Fetching tracking details...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 p-4 text-error text-sm flex items-center gap-3">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <span>{error}</span>
            </div>
          )}

          {!loading && data?.order && (
            <div className="bg-white border border-surface-dim p-5 space-y-2">
              <p className="font-label text-[10px] tracking-[0.2em] uppercase text-outline font-semibold">
                Order Details
              </p>
              <div className="flex justify-between text-sm">
                <span className="text-outline">Order</span>
                <span className="text-navy font-medium">#{data.order.id.slice(-8).toUpperCase()}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-outline">Ship to</span>
                <span className="text-navy">{data.order.shippingName}, {data.order.shippingCity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-outline">Status</span>
                <span className="text-navy font-medium capitalize">{data.order.status}</span>
              </div>
            </div>
          )}

          {!loading && data?.shipment && (
            <div className="bg-white border border-surface-dim p-5 space-y-4">
              <p className="font-label text-[10px] tracking-[0.2em] uppercase text-outline font-semibold">
                Tracking History
              </p>

              {(() => {
                const scans = data.shipment.Scans || [];
                if (scans.length === 0) {
                  return <p className="text-outline text-sm">No scan history available yet.</p>;
                }
                return (
                  <div className="space-y-4">
                    {scans.map((scan, idx) => (
                      <div key={idx} className="flex items-start gap-3">
                        <div
                          className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                            idx === 0 ? "bg-gold" : "bg-surface-dim"
                          }`}
                        />
                        <div>
                          <p className="text-sm text-navy font-medium">{scan.Status}</p>
                          <p className="text-[11px] text-outline">
                            {scan.ScanLocation || scan.Location || ""}
                          </p>
                          <p className="text-[10px] text-outline-var">
                            {scan.ScanDateTime || scan.Date || ""}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
          )}

          {!loading && !data?.shipment && !error && (
            <div className="bg-white border border-surface-dim p-8 text-center">
              <p className="text-outline text-sm">Tracking information not available yet.</p>
              <p className="text-outline-var text-xs mt-1">
                It may take a few hours after shipment for tracking data to appear.
              </p>
            </div>
          )}

          <div className="text-center">
            <Link href="/" className="text-gold text-sm hover:underline">
              Back to Home
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
