"use client";

import {
  clearAllTags,
  resetWhalesToDefaults,
  deleteAllWhales,
} from "../../actions/whale";

export default function WhaleActionButtons() {
  return (
    <>
      <form
        action={clearAllTags}
        onSubmit={(e) => {
          if (
            !confirm("Clear ALL tags from ALL whales? This cannot be undone.")
          )
            e.preventDefault();
        }}
      >
        <button
          type="submit"
          style={{
            backgroundColor: "var(--surface-2)",
            color: "var(--amber)",
            border: "1px solid rgba(245,158,11,0.3)",
            padding: "8px 16px",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          🧹 Clear All Tags
        </button>
      </form>
      <form
        action={resetWhalesToDefaults}
        onSubmit={(e) => {
          if (
            !confirm(
              "Reset known whales to correct labels/categories/tags? Only updates addresses that are in the default list.",
            )
          )
            e.preventDefault();
        }}
      >
        <button
          type="submit"
          style={{
            backgroundColor: "var(--surface-2)",
            color: "var(--green)",
            border: "1px solid rgba(0,255,128,0.3)",
            padding: "8px 16px",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          🔄 Reset to Defaults
        </button>
      </form>
      <form
        action={deleteAllWhales}
        onSubmit={(e) => {
          if (
            !confirm(
              "⚠️ DELETE ALL WHALES from the database? This will permanently remove every tracked wallet. This cannot be undone!",
            )
          )
            e.preventDefault();
        }}
      >
        <button
          type="submit"
          style={{
            backgroundColor: "var(--red-bg)",
            color: "var(--red)",
            border: "1px solid rgba(239,68,68,0.4)",
            padding: "8px 16px",
            borderRadius: 8,
            fontWeight: 600,
            fontSize: 13,
            cursor: "pointer",
          }}
        >
          🗑️ Delete All Whales
        </button>
      </form>
    </>
  );
}
