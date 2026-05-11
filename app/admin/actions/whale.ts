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
