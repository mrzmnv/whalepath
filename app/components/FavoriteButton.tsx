"use client";

import { addFavoriteWhale } from "../actions/watchlist";
import { useState } from "react";

export default function FavoriteButton({ userId, address }: { userId?: string, address: string }) {
  const [loading, setLoading] = useState(false);

  if (!userId) return null;

  return (
    <button 
      onClick={async () => {
        setLoading(true);
        await addFavoriteWhale(userId, address);
        setLoading(false);
      }}
      disabled={loading}
      style={{
        background: 'transparent',
        border: '1px solid var(--accent)',
        color: 'var(--accent)',
        padding: '4px 12px',
        borderRadius: 20,
        fontSize: 12,
        fontWeight: 600,
        cursor: loading ? 'not-allowed' : 'pointer',
        marginLeft: 12,
        opacity: loading ? 0.5 : 1
      }}
    >
      {loading ? '...' : '+ İzləyə Al'}
    </button>
  );
}
