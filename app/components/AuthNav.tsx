import Link from "next/link";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { User, LogIn, UserPlus, Shield } from "lucide-react";

export default async function AuthNav() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  const session = await decrypt(sessionCookie);

  if (session?.userId) {
    return (
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {session.role === 'admin' && (
          <Link href="/admin" style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>
            <Shield size={16} />
            Admin
          </Link>
        )}
        <Link href="/profile" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 16px', background: 'var(--surface-2)', borderRadius: 4, color: 'var(--text-1)', textDecoration: 'none', border: '1px solid var(--border)', fontWeight: 600 }}>
          <User size={16} />
          {session.username as string}
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <Link href="/login" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 16px', color: 'var(--text-1)', textDecoration: 'none', fontWeight: 600 }}>
        <LogIn size={16} />
        Login
      </Link>
      <Link href="/register" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 16px', background: 'var(--accent)', color: 'black', borderRadius: 4, textDecoration: 'none', fontWeight: 600 }}>
        <UserPlus size={16} />
        Register
      </Link>
    </div>
  );
}
