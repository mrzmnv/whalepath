"use client";

import { logout } from "../../actions/auth";

export default function LogoutButton() {
  return (
    <button 
      onClick={() => logout()} 
      style={{ 
        marginTop: '12px', background: 'transparent', border: '1px solid var(--border)', 
        color: 'var(--down)', fontWeight: 600, padding: '8px 12px', borderRadius: 8, cursor: 'pointer',
        textAlign: 'left'
      }}
    >
      🚪 Çıxış Et
    </button>
  );
}
