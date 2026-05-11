"use server";

import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { encrypt } from "@/lib/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function registerUser(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password || password.length < 6) {
    return { error: "İstifadəçi adı daxil edin və şifrə minimum 6 simvol olmalıdır." };
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return { error: "Bu istifadəçi adı artıq mövcuddur." };

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username, password: hashedPassword, role: "user" }
  });

  await createSession(user);
  redirect("/");
}

export async function loginUser(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) return { error: "Xanaları doldurun" };

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return { error: "Belə bir istifadəçi yoxdur" };

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return { error: "Şifrə və ya login səhvdir" };

  await createSession(user);
  redirect("/");
}

async function createSession(user: any) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({ userId: user.id, username: user.username, role: user.role });
  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    expires,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/");
}
