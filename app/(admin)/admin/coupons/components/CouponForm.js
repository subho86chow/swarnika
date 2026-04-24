"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createCoupon, updateCoupon } from "../../../../lib/couponActions";

export default function CouponForm({ coupon, categories = [], products = [] }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const isEditing = !!coupon;

  const [scope, setScope] = useState(coupon?.scope || "global");

  const handleSubmit = (e) => {
    e.preventDefault();
    const form = e.target;
    const data = {
      code: form.code.value.trim().toUpperCase(),
      name: form.name.value.trim(),
      description: form.description.value.trim() || null,
      discountType: form.discountType.value,
      discountValue: parseInt(form.discountValue.value),
      scope: form.scope.value,
      categoryId: form.categoryId?.value || null,
      productId: form.productId?.value || null,
      userId: form.userId.value.trim() || null,
      maxUses: form.maxUses.value ? parseInt(form.maxUses.value) : null,
      maxUsesPerUser: form.maxUsesPerUser.value
        ? parseInt(form.maxUsesPerUser.value)
        : null,
      isActive: form.isActive.checked,
      startDate: form.startDate.value
        ? new Date(form.startDate.value)
        : null,
      endDate: form.endDate.value ? new Date(form.endDate.value) : null,
      minOrderValue: form.minOrderValue.value
        ? parseInt(form.minOrderValue.value)
        : null,
    };

    startTransition(async () => {
      if (isEditing) {
        await updateCoupon(coupon.id, data);
      } else {
        await createCoupon(data);
      }
      router.push("/admin/coupons");
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="font-label text-[9px] tracking-[0.2em] uppercase text-outline font-semibold">
            Coupon Code *
          </label>
          <input
            name="code"
            defaultValue={coupon?.code || ""}
            required
            placeholder="e.g. SAVE20"
            className="field-input"
          />
        </div>

        <div className="space-y-2">
          <label className="font-label text-[9px] tracking-[0.2em] uppercase text-outline font-semibold">
            Name *
          </label>
          <input
            name="name"
            defaultValue={coupon?.name || ""}
            required
            placeholder="e.g. Summer Sale"
            className="field-input"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="font-label text-[9px] tracking-[0.2em] uppercase text-outline font-semibold">
          Description
        </label>
        <textarea
          name="description"
          defaultValue={coupon?.description || ""}
          rows={3}
          className="field-input resize-none"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="font-label text-[9px] tracking-[0.2em] uppercase text-outline font-semibold">
            Discount Type *
          </label>
          <select name="discountType" defaultValue={coupon?.discountType || "percentage"} className="field-input">
            <option value="percentage">Percentage (%)</option>
            <option value="fixed">Fixed Amount (₹)</option>
          </select>
        </div>

        <div className="space-y-2">
          <label className="font-label text-[9px] tracking-[0.2em] uppercase text-outline font-semibold">
            Discount Value *
          </label>
          <input
            name="discountValue"
            type="number"
            min={1}
            defaultValue={coupon?.discountValue || 10}
            required
            className="field-input"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="font-label text-[9px] tracking-[0.2em] uppercase text-outline font-semibold">
          Scope *
        </label>
        <select
          name="scope"
          value={scope}
          onChange={(e) => setScope(e.target.value)}
          className="field-input"
        >
          <option value="global">All Products</option>
          <option value="category">Specific Category</option>
          <option value="product">Specific Product</option>
          <option value="single_product_cart">Single Product Cart Only</option>
        </select>
      </div>

      {scope === "category" && (
        <div className="space-y-2">
          <label className="font-label text-[9px] tracking-[0.2em] uppercase text-outline font-semibold">
            Category *
          </label>
          <select name="categoryId" defaultValue={coupon?.categoryId || ""} required className="field-input">
            <option value="">Select a category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {scope === "product" && (
        <div className="space-y-2">
          <label className="font-label text-[9px] tracking-[0.2em] uppercase text-outline font-semibold">
            Product *
          </label>
          <select name="productId" defaultValue={coupon?.productId || ""} required className="field-input">
            <option value="">Select a product</option>
            {products.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="space-y-2">
        <label className="font-label text-[9px] tracking-[0.2em] uppercase text-outline font-semibold">
          Restrict to Customer (Clerk User ID)
        </label>
        <input
          name="userId"
          defaultValue={coupon?.userId || ""}
          placeholder="Leave empty for all customers"
          className="field-input"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="space-y-2">
          <label className="font-label text-[9px] tracking-[0.2em] uppercase text-outline font-semibold">
            Max Total Uses
          </label>
          <input
            name="maxUses"
            type="number"
            min={1}
            defaultValue={coupon?.maxUses || ""}
            placeholder="Unlimited"
            className="field-input"
          />
        </div>

        <div className="space-y-2">
          <label className="font-label text-[9px] tracking-[0.2em] uppercase text-outline font-semibold">
            Max Uses Per User
          </label>
          <input
            name="maxUsesPerUser"
            type="number"
            min={1}
            defaultValue={coupon?.maxUsesPerUser || ""}
            placeholder="Unlimited"
            className="field-input"
          />
        </div>

        <div className="space-y-2">
          <label className="font-label text-[9px] tracking-[0.2em] uppercase text-outline font-semibold">
            Min Order Value (₹)
          </label>
          <input
            name="minOrderValue"
            type="number"
            min={0}
            defaultValue={coupon?.minOrderValue || ""}
            placeholder="None"
            className="field-input"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-2">
          <label className="font-label text-[9px] tracking-[0.2em] uppercase text-outline font-semibold">
            Start Date
          </label>
          <input
            name="startDate"
            type="datetime-local"
            defaultValue={
              coupon?.startDate
                ? new Date(coupon.startDate).toISOString().slice(0, 16)
                : ""
            }
            className="field-input"
          />
        </div>

        <div className="space-y-2">
          <label className="font-label text-[9px] tracking-[0.2em] uppercase text-outline font-semibold">
            End Date
          </label>
          <input
            name="endDate"
            type="datetime-local"
            defaultValue={
              coupon?.endDate
                ? new Date(coupon.endDate).toISOString().slice(0, 16)
                : ""
            }
            className="field-input"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 py-2">
        <input
          name="isActive"
          type="checkbox"
          defaultChecked={coupon?.isActive ?? true}
          className="w-4 h-4 accent-primary"
        />
        <label className="font-label text-[9px] tracking-[0.2em] uppercase text-outline font-semibold">
          Active
        </label>
      </div>

      <div className="flex gap-4 pt-4">
        <button
          type="submit"
          disabled={isPending}
          className="btn-primary"
        >
          {isPending
            ? "Saving..."
            : isEditing
              ? "Update Coupon"
              : "Create Coupon"}
        </button>
        <button
          type="button"
          onClick={() => router.push("/admin/coupons")}
          className="btn-secondary"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
