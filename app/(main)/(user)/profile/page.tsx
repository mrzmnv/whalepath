import { LogOut, Plus, Trash2 } from "lucide-react";
import prisma from "@/lib/db";
import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import { redirect } from "next/navigation";
import { addPersonalWallet, removeWatchlistItem } from "@/app/actions/watchlist";
import { logoutUser } from "@/app/actions/userAuth";
import { formatUSD } from "@/lib/format";
import Link from "next/link";

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
  const favoriteWhales = watchlists.filter((w: any) => w.type === 'favorite');

  const favoriteAddresses = favoriteWhales.map((w: any) => w.address);
  const txAggregations = await prisma.transaction.groupBy({
    by: ['walletAddress'],
    where: { walletAddress: { in: favoriteAddresses } },
    _sum: { usdValue: true },
    _count: { id: true }
  });

  const txStats = txAggregations.reduce((acc: any, curr: any) => {
    acc[curr.walletAddress] = {
      volume: curr._sum.usdValue || 0,
      count: curr._count.id || 0
    };
    return acc;
  }, {});

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
          {favoriteWhales.map((w: any) => {
            const stats = txStats[w.address] || { volume: 0, count: 0 };
            return (
            <Link href={ `/wallet/${w.address}` } key={w.id} style={{ textDecoration: 'none' }}>
              <div className="whale-card-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: 20, background: 'var(--bg)', borderRadius: 8, border: '1px solid var(--border)', cursor: 'pointer' }}>
                <div>
                  <div style={{ fontWeight: 700, color: 'var(--text-1)', fontSize: 16, marginBottom: 4 }}>{w.label}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-3)' }} className="mono">{w.address}</div>
                </div>
                
                <div style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.05em' }}>VOLUME</span>
                    <span className="mono" style={{ fontSize: 16, fontWeight: 700, color: stats.volume > 500000 ? 'var(--amber)' : 'var(--text-1)' }}>
                      {formatUSD(stats.volume)}
                    </span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-3)', fontWeight: 600, letterSpacing: '0.05em' }}>TXS</span>
                    <span className="mono" style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-2)' }}>
                      {stats.count}
                    </span>
                  </div>

                  <form action={async () => { 'use server'; await removeWatchlistItem(w.id); }}>
                    <button type="submit" className="whale-delete-btn" style={{ background: 'var(--surface-3)', padding: 8, borderRadius: 6, border: '1px solid var(--border-strong)', color: 'var(--red)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
                      <Trash2 size={16} />
                    </button>
                  </form>
                </div>
              </div>
            </Link>
          )})}
          {favoriteWhales.length === 0 && <div style={{ color: 'var(--text-3)', fontSize: 14 }}>No favorite whales. Start tracking from the platform.</div>}
        </div>
      </div>
    </div>
  );
}
