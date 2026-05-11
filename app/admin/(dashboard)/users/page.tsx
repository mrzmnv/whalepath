import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';
import bcrypt from 'bcryptjs';

export const revalidate = 0;

async function deleteUser(formData: FormData) {
  'use server';
  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get('session')?.value);
  if (!session?.userId || session?.role !== 'admin') throw new Error('Unauthorized');
  const id = formData.get('id') as string;
  if (session.userId === id) throw new Error('Cannot delete yourself');
  await prisma.user.delete({ where: { id } });
  revalidatePath('/admin/users');
}

async function changeRole(formData: FormData) {
  'use server';
  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get('session')?.value);
  if (!session?.userId || session?.role !== 'admin') throw new Error('Unauthorized');
  const id = formData.get('id') as string;
  const role = formData.get('role') as string;
  await prisma.user.update({ where: { id }, data: { role } });
  revalidatePath('/admin/users');
}

async function createUser(formData: FormData) {
  'use server';
  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get('session')?.value);
  if (!session?.userId || session?.role !== 'admin') throw new Error('Unauthorized');
  const username = formData.get('username') as string;
  const password = formData.get('password') as string;
  const role = (formData.get('role') as string) || 'user';
  if (!username || !password || password.length < 6) throw new Error('Invalid input');
  const hash = await bcrypt.hash(password, 10);
  await prisma.user.create({ data: { username, password: hash, role } });
  revalidatePath('/admin/users');
}

export default async function UsersAdminPage() {
  const users = await prisma.user.findMany({ orderBy: { createdAt: 'asc' } });

  const cell = { padding: '12px 16px', fontSize: 14 };
  const badge = (role: string) => ({
    display: 'inline-block',
    padding: '2px 10px',
    borderRadius: 12,
    fontSize: 12,
    fontWeight: 600,
    backgroundColor: role === 'admin' ? 'rgba(99,102,241,0.15)' : 'var(--surface-3)',
    color: role === 'admin' ? 'var(--accent)' : 'var(--text-2)',
  });

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-1)', marginBottom: 24 }}>User Management</h1>

      {/* Create user */}
      <div style={{ backgroundColor: 'var(--surface-2)', padding: 24, borderRadius: 'var(--radius)', border: '1px solid var(--border)', marginBottom: 32 }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-1)', marginBottom: 16 }}>Create New User</h3>
        <form action={createUser} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input name="username" placeholder="Username" required style={{ flex: '1 1 160px', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-strong)', fontSize: 14 }} />
          <input name="password" type="password" placeholder="Password (min 6 chars)" required style={{ flex: '1 1 160px', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-strong)', fontSize: 14 }} />
          <select name="role" style={{ flex: '1 1 120px', padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-strong)', fontSize: 14, backgroundColor: 'var(--bg)' }}>
            <option value="user">User</option>
            <option value="admin">Admin</option>
          </select>
          <button type="submit" style={{ backgroundColor: 'var(--accent)', color: 'white', padding: '10px 24px', borderRadius: 8, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Create</button>
        </form>
      </div>

      {/* Users table */}
      <div style={{ backgroundColor: 'var(--surface)', borderRadius: 'var(--radius)', border: '1px solid var(--border)', overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ backgroundColor: 'var(--surface-2)', borderBottom: '1px solid var(--border)' }}>
              <th style={{ ...cell, fontSize: 12, color: 'var(--text-2)' }}>Username</th>
              <th style={{ ...cell, fontSize: 12, color: 'var(--text-2)' }}>Role</th>
              <th style={{ ...cell, fontSize: 12, color: 'var(--text-2)' }}>Joined</th>
              <th style={{ ...cell, fontSize: 12, color: 'var(--text-2)', textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id} style={{ borderBottom: '1px solid var(--border-strong)' }}>
                <td style={cell}>{u.username}</td>
                <td style={cell}><span style={badge(u.role)}>{u.role}</span></td>
                <td style={{ ...cell, color: 'var(--text-3)', fontSize: 13 }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td style={{ ...cell, textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', flexWrap: 'wrap' }}>
                    <form action={changeRole} style={{ display: 'flex', gap: 6 }}>
                      <input type="hidden" name="id" value={u.id} />
                      <select name="role" defaultValue={u.role} style={{ padding: '5px 8px', borderRadius: 6, border: '1px solid var(--border-strong)', fontSize: 12, backgroundColor: 'var(--bg)' }}>
                        <option value="user">user</option>
                        <option value="admin">admin</option>
                      </select>
                      <button type="submit" style={{ backgroundColor: 'var(--surface-3)', color: 'var(--text-1)', border: '1px solid var(--border-strong)', padding: '5px 10px', borderRadius: 6, fontSize: 12, cursor: 'pointer' }}>Save</button>
                    </form>
                    <form action={deleteUser}>
                      <input type="hidden" name="id" value={u.id} />
                      <button type="submit" style={{ color: 'var(--red)', background: 'var(--red-bg)', border: 'none', padding: '5px 10px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>Delete</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

