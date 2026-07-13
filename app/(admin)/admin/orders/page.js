export const dynamic = "force-dynamic";

import Link from "next/link";
import { prisma } from "../../../lib/prisma";
import { formatPrice } from "../../../lib/data";

function getFriendlyShipmentError(error) {
  if (!error) return null;
  const e = String(error).toLowerCase();

  if (e.includes("insufficient balance") || e.includes("wallet") || e.includes("recharge")) {
    return "Delhivery wallet insufficient. Add funds at one.delhivery.com → Billing → Wallet, then retry.";
  }
  if (e.includes("clientwarehouse") || e.includes("warehouse")) {
    return "Warehouse name mismatch. Verify 'SWARNIKA OFFICE' is registered in Delhivery One Panel.";
  }
  if (e.includes("pin") || e.includes("serviceable")) {
    return "Destination pincode is not serviceable by Delhivery.";
  }
  if (e.includes("phone") || e.includes("mobile")) {
    return "Invalid phone number format. Ensure it's a valid 10-digit Indian number.";
  }
  if (e.includes("duplicate")) {
    return "Duplicate order ID. This order may have already been manifested.";
  }
  if (e.includes("suspicious")) {
    return "Consignee flagged by Delhivery. Contact your Business POC for resolution.";
  }
  if (e.includes("volume exceeded") || e.includes("capacity")) {
    return "Daily pickup capacity exceeded. Schedule for next day.";
  }

  return error;
}

const statusColors = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  paid: "bg-green-100 text-green-800",
  shipped: "bg-blue-100 text-blue-800",
  delivered: "bg-green-800 text-white",
  cancelled: "bg-red-100 text-red-800",
};

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div className="space-y-8">
      <div>
        <h1 className="font-headline text-3xl md:text-4xl text-navy font-light italic mb-2">Orders</h1>
        <p className="font-body text-outline text-sm">View and manage customer orders.</p>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white border border-surface-dim p-12 text-center space-y-4">
          <span className="material-symbols-outlined text-outline-var text-[48px]">shopping_bag</span>
          <h3 className="font-headline text-xl text-navy italic">No orders yet</h3>
          <p className="text-outline text-sm">Orders will appear here once customers complete purchases.</p>
        </div>
      ) : (
        <div className="bg-white border border-surface-dim overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-ivory-dark border-b border-surface-dim uppercase text-[10px] tracking-wider text-outline font-label">
                <tr>
                  <th className="text-left px-6 py-4">Order</th>
                  <th className="text-left px-6 py-4">Customer</th>
                  <th className="text-left px-6 py-4">Items</th>
                  <th className="text-left px-6 py-4">Total</th>
                  <th className="text-left px-6 py-4">Shipping</th>
                  <th className="text-left px-6 py-4">Status</th>
                  <th className="text-left px-6 py-4">Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-surface-dim hover:bg-surface-low/50 transition-colors">
                    <td className="px-6 py-4">
                      <Link href={`/admin/orders/${order.id}`} className="block">
                        <p className="font-label text-xs font-bold text-navy hover:text-gold transition-colors">#{order.id.slice(-8).toUpperCase()}</p>
                      </Link>
                      {order.razorpayPaymentId && (
                        <p className="text-outline text-[10px] font-mono mt-0.5">{order.razorpayPaymentId}</p>
                      )}
                      {order.delhiveryWaybill && (
                        <p className="text-gold text-[10px] font-mono mt-0.5">AWB: {order.delhiveryWaybill}</p>
                      )}
                      {order.shipmentError && (
                        <p className="text-error text-[10px] mt-0.5" title={getFriendlyShipmentError(order.shipmentError)}>Shipment failed</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-navy text-sm font-medium">{order.shippingName}</p>
                      <p className="text-outline text-xs">{order.shippingCity}, {order.shippingState}</p>
                      <p className="text-gold text-xs">{order.shippingPhone}</p>
                    </td>
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {order.items.slice(0, 2).map((item) => (
                          <p key={item.id} className="text-sm text-navy">
                            {item.productName} <span className="text-outline">× {item.quantity}</span>
                          </p>
                        ))}
                        {order.items.length > 2 && (
                          <p className="text-outline text-xs">+{order.items.length - 2} more</p>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-headline text-navy">{formatPrice(order.totalAmount)}</p>
                      {order.discountAmount > 0 && (
                        <p className="text-gold text-xs">Saved {formatPrice(order.discountAmount)}</p>
                      )}
                      {order.paymentMethod === "COD" && (
                        <span className="inline-block mt-1 px-1.5 py-0.5 bg-surface-dim text-[9px] font-bold tracking-widest text-navy uppercase rounded">
                          COD
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {order.delhiveryWaybill ? (
                        <div className="space-y-1">
                          <p className="text-gold text-[10px] font-mono">{order.delhiveryWaybill}</p>
                          {order.delhiveryTrackingUrl && (
                            <a
                              href={order.delhiveryTrackingUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-gold text-[10px] font-medium hover:underline"
                            >
                              <span className="material-symbols-outlined text-[14px]">local_shipping</span>
                              Track
                            </a>
                          )}
                          {order.delhiveryLabelUrl && (
                            <a
                              href={order.delhiveryLabelUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="block text-navy text-[10px] font-medium hover:underline"
                            >
                              Print Label
                            </a>
                          )}
                        </div>
                      ) : (
                        <span className="text-outline text-[10px]">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-[10px] font-medium uppercase tracking-wider ${statusColors[order.status === "pending" && order.paymentMethod === "COD" ? "processing" : order.status] || "bg-gray-100 text-gray-800"}`}>
                        {order.status === "pending" && order.paymentMethod === "COD" ? "processing" : order.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <p className="text-outline text-xs">
                        {new Date(order.createdAt).toLocaleDateString("en-IN", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })}
                      </p>
                      <p className="text-outline-var text-[10px]">
                        {new Date(order.createdAt).toLocaleTimeString("en-IN", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
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
