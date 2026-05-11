"use client";

import { login } from "../actions/auth";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await login(formData);
    if (res?.error) {
      setError(res.error);
    } else if (res?.success) {
      router.push("/admin");
    }
  };

  return (
    <div
      style={{
        maxWidth: 400,
        margin: "80px auto",
        backgroundColor: "var(--surface-2)",
        padding: 32,
        borderRadius: 16,
        border: "1px solid var(--border)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ fontSize: 40, marginBottom: 16 }}>🐳</div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-1)" }}>
          Admin Login
        </h1>
      </div>

      <form
        onSubmit={handleSubmit}
        style={{ display: "flex", flexDirection: "column", gap: 16 }}
      >
        {error && (
          <div
            style={{
              color: "var(--down)",
              backgroundColor: "rgba(239, 68, 68, 0.1)",
              padding: 12,
              borderRadius: 8,
              fontSize: 14,
            }}
          >
            {error}
          </div>
        )}

        <div>
          <label
            style={{
              display: "block",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text-2)",
              marginBottom: 8,
            }}
          >
            Username
          </label>
          <input
            name="username"
            type="text"
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 8,
              backgroundColor: "var(--bg)",
              border: "1px solid var(--border)",
              color: "var(--text-1)",
              fontSize: 14,
            }}
            placeholder="admin"
            required
          />
        </div>

        <div>
          <label
            style={{
              display: "block",
              fontSize: 14,
              fontWeight: 600,
              color: "var(--text-2)",
              marginBottom: 8,
            }}
          >
            Password
          </label>
          <input
            name="password"
            type="password"
            style={{
              width: "100%",
              padding: "12px 16px",
              borderRadius: 8,
              backgroundColor: "var(--bg)",
              border: "1px solid var(--border)",
              color: "var(--text-1)",
              fontSize: 14,
            }}
            placeholder="••••••••"
            required
          />
        </div>

        <button
          type="submit"
          style={{
            marginTop: 8,
            width: "100%",
            padding: "12px 16px",
            backgroundColor: "var(--accent)",
            color: "black",
            border: "none",
            borderRadius: 8,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Daxil ol
        </button>
      </form>
    </div>
  );
}
