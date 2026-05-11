"use client";

import { loginUser } from "@/app/actions/userAuth";
import { useState, useEffect } from "react";
import Link from "next/link";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/user/plan")
      .then((r) => r.json())
      .then((d) => { if (d?.authenticated) window.location.href = "/"; })
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const res = await loginUser(formData);
    if (res?.error) setError(res.error);
    else if (res?.success) {
      window.location.href = "/";
    }
  };

  return (
    <div
      className="auth-container"
      style={{
        maxWidth: 400,
        margin: "80px auto",
        backgroundColor: "var(--surface-2)",
        padding: 32,
        borderRadius: 12,
        border: "1px solid var(--border)",
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "var(--text-1)" }}>
          User Login
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
              borderRadius: 4,
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
              borderRadius: 4,
              backgroundColor: "var(--bg)",
              border: "1px solid var(--border)",
              color: "var(--text-1)",
              fontSize: 14,
            }}
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
              borderRadius: 4,
              backgroundColor: "var(--bg)",
              border: "1px solid var(--border)",
              color: "var(--text-1)",
              fontSize: 14,
            }}
            required
          />
        </div>

        <button
          type="submit"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginTop: 8,
            width: "100%",
            padding: "12px 16px",
            backgroundColor: "var(--accent)",
            color: "black",
            border: "none",
            borderRadius: 4,
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          <LogIn size={18} /> Sign In
        </button>
      </form>
      <p
        style={{
          marginTop: 24,
          textAlign: "center",
          fontSize: 14,
          color: "var(--text-2)",
        }}
      >
        Don't have an account?{" "}
        <Link href="/register" style={{ color: "var(--accent)" }}>
          Register
        </Link>
      </p>
    </div>
  );
}
