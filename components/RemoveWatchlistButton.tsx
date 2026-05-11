"use client";

import { useState, useTransition } from "react";
import { Trash2 } from "lucide-react";
import ConfirmModal from "@/components/ConfirmModal";
import { removeWatchlistItem } from "@/app/actions/watchlist";

interface RemoveWatchlistButtonProps {
  id: string;
  label: string;
  type: "whale" | "personal";
}

export default function RemoveWatchlistButton({
  id,
  label,
  type,
}: RemoveWatchlistButtonProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const handleConfirm = () => {
    startTransition(async () => {
      await removeWatchlistItem(id);
      setOpen(false);
    });
  };

  return (
    <>
      <button
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        disabled={isPending}
        className="whale-delete-btn"
        style={{
          background: "var(--surface-3)",
          padding: 8,
          borderRadius: 6,
          border: "1px solid var(--border-strong)",
          color: "var(--red)",
          cursor: isPending ? "not-allowed" : "pointer",
          display: "flex",
          alignItems: "center",
          opacity: isPending ? 0.6 : 1,
        }}
      >
        <Trash2 size={16} />
      </button>

      <ConfirmModal
        open={open}
        title={type === "whale" ? "Remove from Watchlist" : "Remove Wallet"}
        message={
          type === "whale"
            ? `"${label}" izlənməsinə dayandırılsın? İstənilən vaxt yenidən əlavə edə bilərsiniz.`
            : `"${label}" wallet-i siyahıdan silinsin?`
        }
        confirmLabel="Remove"
        onConfirm={handleConfirm}
        onCancel={() => setOpen(false)}
      />
    </>
  );
}
