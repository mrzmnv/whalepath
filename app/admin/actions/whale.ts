'use server'

import prisma from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { decrypt } from '@/lib/session';

async function requireAdmin() {
  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get('session')?.value);
  if (!session?.userId || session?.role !== 'admin') throw new Error('Unauthorized');
}

export async function addWhale(formData: FormData) {
  await requireAdmin();

  const address = formData.get('address') as string;
  const label = formData.get('label') as string;
  const category = formData.get('category') as string;
  const tagsStr = formData.get('tags') as string;
  const tags = tagsStr.split(',').map(s => s.trim()).filter(Boolean);

  if (!address || !label) throw new Error('Missing address or label');

  await prisma.whale.create({
    data: { address, label, category, tags }
  });

  revalidatePath('/admin/whales');
  revalidatePath('/');
}

export async function deleteWhale(address: string) {
  await requireAdmin();

  await prisma.whale.delete({
    where: { address }
  });

  revalidatePath('/admin/whales');
  revalidatePath('/');
}

export async function bulkAddWhales(formData: FormData) {
  await requireAdmin();

  const raw = formData.get('bulk') as string;
  const category = (formData.get('category') as string) || '';
  const tagsStr = (formData.get('tags') as string) || '';
  const tags = tagsStr.split(',').map(s => s.trim()).filter(Boolean);

  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);

  const entries: { address: string; label: string }[] = [];
  for (const line of lines) {
    // Support: "address label" or "address,label" or just "address"
    const parts = line.includes(',') ? line.split(',') : line.split(/\s+/);
    const address = parts[0]?.trim();
    const label = parts.slice(1).join(' ').trim() || address.slice(0, 8) + '...';
    if (address) entries.push({ address, label });
  }

  if (entries.length === 0) throw new Error('No valid entries found');

  revalidatePath('/admin/whales');
  revalidatePath('/');
}

export async function updateWhale(formData: FormData) {
  await requireAdmin();

  const id = formData.get('id') as string;
  const label = formData.get('label') as string;
  const category = (formData.get('category') as string) || '';
  const tagsStr = (formData.get('tags') as string) || '';
  const tags = tagsStr.split(',').map(s => s.trim()).filter(Boolean);

  if (!id || !label) throw new Error('Missing id or label');

  await prisma.whale.update({
    where: { id },
    data: { label, category, tags },
  });

  revalidatePath('/admin/whales');
  revalidatePath('/');
}

export async function clearAllTags() {
  await requireAdmin();
  await prisma.whale.updateMany({ data: { tags: [] } });
  revalidatePath('/admin/whales');
  revalidatePath('/');
}
