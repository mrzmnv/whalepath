import prisma from '@/lib/db';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

export default async function EditWhalePage({ params }: { params: { id: string } }) {
  const whale = await prisma.whale.findUnique({ where: { id: params.id } });
  if (!whale) return redirect('/admin/whales');

  async function updateWhale(formData: FormData) {
    'use server';
    const label = formData.get('label') as string;
    const category = formData.get('category') as string;
    const tags = (formData.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean);

    await prisma.whale.update({
      where: { id: params.id },
      data: { label, category, tags }
    });

    revalidatePath('/admin/whales');
    redirect('/admin/whales');
  }

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-1)', marginBottom: 24 }}>Edit Whale: {whale.address}</h1>
      <form action={updateWhale} style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 400 }}>
        <input name="label" defaultValue={whale.label} placeholder="Label" required style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-strong)' }} />
        <select name="category" defaultValue={whale.category || ""} style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-strong)', backgroundColor: 'var(--bg)' }}>
          <option value="">Kateqoriya seçin</option>
          <option value="DEX">DEX</option>
          <option value="CEX">CEX</option>
          <option value="Whale">Whale</option>
          <option value="Fund">Fund/VC</option>
          <option value="Bot">Bot/MEV</option>
        </select>
        <input name="tags" defaultValue={whale.tags.join(', ')} placeholder="Tags (comma separated)" style={{ padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-strong)' }} />
        <button type="submit" style={{ backgroundColor: 'var(--accent)', color: 'white', padding: '10px 24px', borderRadius: 8, fontWeight: 600, border: 'none', cursor: 'pointer' }}>Update Whale</button>
      </form>
    </div>
  );
}
