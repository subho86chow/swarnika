"use client";

export default function OrdersPage() {
  // Placeholder — real orders would come from your database/Prisma
  const orders = [];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <span className="section-eyebrow">Purchase History</span>
        <h2 className="font-headline text-[28px] md:text-[34px] text-navy font-light italic leading-tight mt-1">
          Order History
        </h2>
        <p className="text-outline text-[13px] leading-relaxed mt-2">
          Track and review your past purchases.
        </p>
      </div>

      {/* Empty state */}
      {orders.length === 0 && (
        <div className="border border-surface-dim bg-white p-12 text-center space-y-4">
          <span className="material-symbols-outlined text-outline-var text-[48px]">shopping_bag</span>
          <h3 className="font-headline text-xl text-navy italic">No orders yet</h3>
          <p className="text-outline text-[13px] leading-relaxed max-w-sm mx-auto">
            When you place an order, it will appear here with its status and details.
          </p>
          <a href="/categories" className="btn-primary inline-flex py-3 px-6 text-[9px]">
            Explore Collections
          </a>
        </div>
      )}

      {/* Order cards — ready for data */}
      {orders.length > 0 && (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <div key={order.id} className="border border-surface-dim bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <p className="font-label text-[10px] tracking-[0.2em] uppercase text-navy font-bold">
                    Order #{order.id}
                  </p>
                  <p className="text-outline text-[11px] mt-0.5">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}
                  </p>
                </div>
                <span
                  className={`badge text-[7px] ${
                    order.status === "delivered"
                      ? "bg-green-800"
                      : order.status === "shipped"
                      ? "badge-gold"
                      : ""
                  }`}
                >
                  {order.status}
                </span>
              </div>

              {/* Items */}
              <div className="flex flex-col gap-3 border-t border-surface-dim pt-4">
                {order.items?.map((item, i) => (
                  <div key={i} className="flex items-center gap-4">
                    {item.image && (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-16 h-16 object-cover bg-surface-low"
                      />
                    )}
                    <div className="flex-1">
                      <p className="text-navy text-[13px] font-medium">{item.name}</p>
                      <p className="text-outline text-[11px]">Qty: {item.quantity}</p>
                    </div>
                    <p className="text-navy text-[13px] font-semibold">
                      ₹{item.price?.toLocaleString("en-IN")}
                    </p>
                  </div>
                ))}
              </div>

              {/* Total */}
              <div className="flex items-center justify-between border-t border-surface-dim pt-4 mt-4">
                <span className="font-label text-[9px] tracking-[0.2em] uppercase text-outline font-semibold">
                  Total
                </span>
                <span className="text-navy font-semibold text-[15px]">
                  ₹{order.total?.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
