"use client";

import { useState } from "react";
import { UserCircle, Shield, KeyRound, Mail, CheckCircle2 } from "lucide-react";

export default function AdminProfilePage() {
  const [saved, setSaved] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div style={{ maxWidth: 800 }}>
      <h1 style={{ fontSize: 24, fontWeight: 800, color: "var(--text-1)", marginBottom: 8 }}>Admin Profile</h1>
      <p style={{ color: "var(--text-3)", marginBottom: 32, fontSize: 14 }}>Manage your personal administrative settings and security credentials.</p>

      <div style={{ backgroundColor: "var(--surface)", border: "1px solid var(--border)", borderRadius: "var(--radius)", overflow: "hidden" }}>
        {/* Cover & Avatar Header */}
        <div style={{ height: 120, backgroundColor: "var(--surface-3)", borderBottom: "1px solid var(--border)" }} />
        <div style={{ padding: "0 32px 32px", position: "relative" }}>
          <div style={{ 
            width: 80, height: 80, borderRadius: "50%", 
            backgroundColor: "var(--surface)", border: "4px solid var(--surface)",
            marginTop: -40, marginBottom: 16, display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)"
          }}>
            <UserCircle size={64} color="var(--text-2)" />
          </div>

          <form onSubmit={handleSave} style={{ display: "flex", flexDirection: "column", gap: 24 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginBottom: 8 }}>
                  <UserCircle size={14} /> Full Name
                </label>
                <input 
                  type="text" 
                  defaultValue="System Administrator" 
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-strong)", backgroundColor: "var(--surface)", color: "var(--text-1)", fontSize: 14 }}
                />
              </div>
              <div>
                <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginBottom: 8 }}>
                  <Mail size={14} /> Email Address
                </label>
                <input 
                  type="email" 
                  defaultValue="admin@whalepath.com" 
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-strong)", backgroundColor: "var(--surface)", color: "var(--text-1)", fontSize: 14 }}
                />
              </div>
            </div>

            <div style={{ borderTop: "1px dashed var(--border)", margin: "8px 0" }} />

            <div>
              <label style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: "var(--text-2)", marginBottom: 8 }}>
                <Shield size={14} /> Role / Access Level
              </label>
              <input 
                type="text" 
                value="Super Admin" 
                disabled 
                style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-strong)", backgroundColor: "var(--surface-3)", color: "var(--text-3)", fontSize: 14, cursor: "not-allowed" }}
              />
              <p style={{ fontSize: 12, color: "var(--text-3)", marginTop: 6 }}>Super Admins have unrestricted access to all modules and configurations.</p>
            </div>

            <div style={{ borderTop: "1px dashed var(--border)", margin: "8px 0" }} />

            <div>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                <KeyRound size={16} /> Security
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 16, maxWidth: 400 }}>
                <input 
                  type="password" 
                  placeholder="Current Password" 
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-strong)", backgroundColor: "var(--surface)", color: "var(--text-1)", fontSize: 14 }}
                />
                <input 
                  type="password" 
                  placeholder="New Password" 
                  style={{ width: "100%", padding: "10px 14px", borderRadius: 8, border: "1px solid var(--border-strong)", backgroundColor: "var(--surface)", color: "var(--text-1)", fontSize: 14 }}
                />
              </div>
            </div>

            <div style={{ display: "flex", alignItems: "center", gap: 16, marginTop: 16 }}>
              <button 
                type="submit"
                style={{ 
                  backgroundColor: "var(--accent)", color: "var(--surface)", 
                  padding: "10px 24px", borderRadius: 8, fontWeight: 600, fontSize: 14,
                  cursor: "pointer", border: "none", transition: "opacity 0.2s"
                }}
              >
                Save Changes
              </button>
              {saved && (
                <span className="fade-up" style={{ display: "flex", alignItems: "center", gap: 6, color: "var(--green)", fontSize: 13, fontWeight: 600 }}>
                  <CheckCircle2 size={16} /> Profile updated
                </span>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
