"use server";

import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { encrypt } from "@/lib/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) return { error: "Bütün xanaları doldurun" };

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return { error: "Belə bir istifadəçi yoxdur" };

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return { error: "Şifrə və ya login səhvdir" };

  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId: user.id, username: user.username, role: user.role });
  
  const cookieStore = await cookies();
  cookieStore.set("session", session, { expires, httpOnly: true });

  redirect("/admin");
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/admin/login");
}
