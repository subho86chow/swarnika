"use client";

import { useState, useTransition } from "react";

export function RetryShipmentButton({ orderId, disabled }) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleClick() {
    setError("");
    const { retryShipment } = await import("../../../actions");
    startTransition(async () => {
      try {
        const result = await retryShipment(orderId);
        if (result.success) {
          window.location.reload();
        }
      } catch (err) {
        setError(err.message || "Retry failed");
      }
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={disabled || isPending}
        className="w-full btn-primary py-3 text-[11px] tracking-[0.2em] disabled:opacity-50"
      >
        {isPending ? "Retrying..." : "Retry Shipment"}
      </button>
      {error && (
        <div className="bg-red-50 border border-red-200 p-3 text-error text-[11px]">
          <span className="font-medium">Shipment failed:</span> {error}
        </div>
      )}
    </div>
  );
}

export function RefreshTrackingButton({ orderId }) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleClick() {
    setError("");
    const { refreshTracking } = await import("../../../actions");
    startTransition(async () => {
      try {
        const result = await refreshTracking(orderId);
        if (result.success) {
          window.location.reload();
        }
      } catch (err) {
        setError(err.message || "Refresh failed");
      }
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="w-full btn-secondary py-3 text-[11px] tracking-[0.2em] disabled:opacity-50"
      >
        {isPending ? "Refreshing..." : "Refresh Tracking"}
      </button>
      {error && (
        <div className="bg-red-50 border border-red-200 p-3 text-error text-[11px]">
          {error}
        </div>
      )}
    </div>
  );
}

export function CancelShipmentButton({ orderId }) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleClick() {
    setError("");
    const { cancelOrderShipment } = await import("../../../actions");
    startTransition(async () => {
      try {
        const result = await cancelOrderShipment(orderId);
        if (result.success) {
          window.location.reload();
        }
      } catch (err) {
        setError(err.message || "Cancel failed");
      }
    });
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleClick}
        disabled={isPending}
        className="w-full border border-error text-error hover:bg-red-50 py-3 text-[11px] tracking-[0.2em] transition-colors disabled:opacity-50"
      >
        {isPending ? "Cancelling..." : "Cancel Shipment"}
      </button>
      {error && (
        <div className="bg-red-50 border border-red-200 p-3 text-error text-[11px]">
          {error}
        </div>
      )}
    </div>
  );
}

export function UpdateStatusButton({ orderId, status, label, variant = "navy" }) {
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  async function handleClick() {
    setError("");
    const { updateOrderStatus } = await import("../../../actions");
    startTransition(async () => {
      try {
        const result = await updateOrderStatus(orderId, status);
        if (result.success) {
          window.location.reload();
        }
      } catch (err) {
        setError(err.message || "Update failed");
      }
    });
  }

  const className =
    variant === "navy"
      ? "w-full border border-navy text-navy hover:bg-navy hover:text-white py-3 text-[11px] tracking-[0.2em] transition-colors disabled:opacity-50"
      : "w-full btn-primary py-3 text-[11px] tracking-[0.2em] disabled:opacity-50";

  return (
    <div className="space-y-2">
      <button type="button" onClick={handleClick} disabled={isPending} className={className}>
        {isPending ? "Updating..." : label}
      </button>
      {error && (
        <div className="bg-red-50 border border-red-200 p-3 text-error text-[11px]">
          {error}
        </div>
      )}
    </div>
  );
}
