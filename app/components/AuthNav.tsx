import Link from "next/link";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";

export default async function AuthNav() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  const session = await decrypt(sessionCookie);

  if (session?.userId) {
    return (
      <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
        {session.role === 'admin' && (
          <Link href="/admin" style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>Admin</Link>
        )}
        <Link href="/profile" style={{ padding: '6px 16px', background: 'var(--surface-2)', borderRadius: 20, color: 'var(--text-1)', textDecoration: 'none', border: '1px solid var(--border)' }}>
          👤 {session.username as string}
        </Link>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', gap: 12 }}>
      <Link href="/login" style={{ padding: '6px 16px', color: 'var(--text-1)', textDecoration: 'none', fontWeight: 600 }}>Giriş</Link>
      <Link href="/register" style={{ padding: '6px 16px', background: 'var(--accent)', color: 'black', borderRadius: 20, textDecoration: 'none', fontWeight: 600 }}>Qeydiyyat</Link>
    </div>
  );
}
