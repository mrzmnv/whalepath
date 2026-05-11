"use server";

import prisma from "@/lib/db";
import bcrypt from "bcryptjs";
import { encrypt } from "@/lib/session";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function registerUser(formData: FormData) {
  const username = (formData.get("username") as string)?.trim();
  const password = formData.get("password") as string;

  if (!username || username.length < 3 || username.length > 20) {
    return { error: "Username must be 3–20 characters." };
  }
  if (!/^[a-zA-Z0-9_]+$/.test(username)) {
    return {
      error: "Username can only contain letters, numbers and underscores.",
    };
  }
  if (!password || password.length < 8) {
    return { error: "Password must be at least 8 characters." };
  }
  if (!/[A-Z]/.test(password)) {
    return { error: "Password must contain at least one uppercase letter." };
  }
  if (!/[a-z]/.test(password)) {
    return { error: "Password must contain at least one lowercase letter." };
  }
  if (!/[0-9]/.test(password)) {
    return { error: "Password must contain at least one number." };
  }

  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) return { error: "This username is already taken." };

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: { username, password: hashedPassword, role: "user" },
  });

  await createSession(user);
  return { success: true };
}

export async function loginUser(formData: FormData) {
  const username = formData.get("username") as string;
  const password = formData.get("password") as string;

  if (!username || !password) return { error: "Please fill in all fields." };

  const user = await prisma.user.findUnique({ where: { username } });
  if (!user) return { error: "No account found with that username." };

  const isValid = await bcrypt.compare(password, user.password);
  if (!isValid) return { error: "Incorrect username or password." };

  await createSession(user);
  return { success: true };
}

async function createSession(user: any) {
  const expires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  const session = await encrypt({
    userId: user.id,
    username: user.username,
    role: user.role,
  });
  const cookieStore = await cookies();
  cookieStore.set("session", session, {
    expires,
    httpOnly: true,
    path: "/",
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });
}

export async function logoutUser() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
  redirect("/");
}
