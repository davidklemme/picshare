"use client";

import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";

export default function LogoutButton() {
  const router = useRouter();

  async function handleLogout() {
    await authClient.signOut();
    router.push("/signin");
    router.refresh();
  }

  return (
    <button className="secondary-button" onClick={handleLogout} type="button">
      Abmelden
    </button>
  );
}
