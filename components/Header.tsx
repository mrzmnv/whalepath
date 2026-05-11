import { cookies } from "next/headers";
import { decrypt } from "@/lib/session";
import HeaderClient from "@/components/HeaderClient";

export default async function Header() {
  const cookieStore = await cookies();
  const session = await decrypt(cookieStore.get("session")?.value);

  return (
    <HeaderClient
      userId={session?.userId as string | undefined}
      username={session?.username as string | undefined}
      role={session?.role as string | undefined}
    />
  );
}
