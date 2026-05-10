import { LogOut, Plus, Trash2 } from "lucide-react";
import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { redirect } from "next/navigation";
import { addPersonalWallet, removeWatchlistItem } from "@/app/actions/watchlist";
import { logoutUser } from "@/app/actions/userAuth";

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get('session')?.value;
  const session = await decrypt(sessionCookie);

  if (!session?.userId) return redirect('/login');

  const watchlists = await prisma.watchlist.findMany({
    where: { userId: session.userId as string },
    orderBy: { createdAt: 'desc' }
  });

  const personalWallets = watchlists.filter(w => w.type === 'personal');
  const favoriteWhales = watchlists.filter(w => w.type === 'favorite');

  async function handleAddWallet(formData: FormData) {
    'use server';
    const address = formData.get('address') as string;
    const label = formData.get('label') as string;
    await addPersonalWallet(session!.userId as string, address, label);
  }

  return (
    <div style={{ maxWidth: 800, margin: '40px auto', padding: '0 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-1)' }}>Welcome,  <span style={{ color: 'var(--accent)' }}>{session.username as string}</span></h1>
        <form action={async () => { 'use server'; await logoutUser(); }}>
          <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', borderRadius: 4, background: 'var(--red-bg)', color: 'var(--red)', border: 'none', fontWeight: 600, cursor: 'pointer' }}><LogOut size={16} /> Logout</button>
        </form>
      </div>

      <div style={{ background: 'var(--surface-2)', padding: 24, borderRadius: 12, border: '1px solid var(--border)', marginBottom: 32 }}>
        <h2 style={{ fontSize: 18, color: 'var(--text-1)', marginBottom: 16 }}>Track Your Own Wallets</h2>
        <form action={handleAddWallet} style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <input name="address" placeholder="Solana Address" required style={{ flex: '1 1 250px', padding: '10px 14px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)' }} className="mono" />
          <input name="label" placeholder="Wallet Label (e.g. Main)" required style={{ flex: '1 1 150px', padding: '10px 14px', borderRadius: 4, border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text-1)' }} />
          <button type="submit" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px', borderRadius: 4, background: 'var(--accent)', color: 'black', border: 'none', fontWeight: 600, cursor: 'pointer' }}><Plus size={16} /> Add</button>
        </form>

        <div style={{ marginTop: 24, display: 'flex', flexDirection: 'column', gap: 12 }}>
          {personalWallets.map(w => (
            <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 16, background: 'var(--bg)', borderRadius: 4, border: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-1)' }}>{w.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }} className="mono">{w.address}</div>
              </div>
              <form action={async () => { 'use server'; await removeWatchlistItem(w.id)}}>
                <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--down)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Trash2 size={16} /></button>
              </form>
            </div>
          ))}
          {personalWallets.length === 0 && <div style={{ color: 'var(--text-3)', fontSize: 14 }}>No personal wallets added.</div>}
        </div>
      </div>

      <div style={{ background: 'var(--surface-2)', padding: 24, borderRadius: 12, border: '1px solid var(--border)' }}>
        <h2 style={{ fontSize: 18, color: 'var(--text-1)', marginBottom: 16 }}>Favorite Whales</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {favoriteWhales.map(w => (
            <div key={w.id} style={{ display: 'flex', justifyContent: 'space-between', padding: 16, background: 'var(--bg)', borderRadius: 4, border: '1px solid var(--border)' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--accent)' }}>{w.label}</div>
                <div style={{ fontSize: 12, color: 'var(--text-2)' }} className="mono">{w.address}</div>
              </div>
              <form action={async () => { 'use server'; await removeWatchlistItem(w.id)}}>
                <button type="submit" style={{ background: 'none', border: 'none', color: 'var(--down)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}><Trash2 size={16} /></button>
              </form>
            </div>
          ))}
          {favoriteWhales.length === 0 && <div style={{ color: 'var(--text-3)', fontSize: 14 }}>No favorite whales. Start tracking from the platform.</div>}
        </div>
      </div>
    </div>
  );
}
