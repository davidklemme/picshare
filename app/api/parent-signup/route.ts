import crypto from "crypto";
import { NextResponse } from "next/server";
import { createUserWithRole } from "@/lib/auth";

function timingSafeEqual(a: string, b: string): boolean {
  const aBytes = Buffer.from(a);
  const bBytes = Buffer.from(b);
  if (aBytes.length !== bBytes.length) {
    return false;
  }
  return crypto.timingSafeEqual(aBytes, bBytes);
}

export async function POST(request: Request) {
  const accessCode = process.env.PARENT_SIGNUP_CODE;
  if (!accessCode) {
    return NextResponse.json({ message: "Server ist nicht konfiguriert." }, { status: 500 });
  }

  const body = await request.json().catch(() => null);
  const email = typeof body?.email === "string" ? body.email.trim() : "";
  const password = typeof body?.password === "string" ? body.password : "";
  const providedCode = typeof body?.accessCode === "string" ? body.accessCode : "";

  if (!email || !password || !providedCode) {
    return NextResponse.json({ message: "Bitte fülle alle Felder aus." }, { status: 400 });
  }

  if (!timingSafeEqual(providedCode, accessCode)) {
    return NextResponse.json({ message: "Zugangscode ist ungültig." }, { status: 403 });
  }

  if (password.length < 8) {
    return NextResponse.json(
      { message: "Das Passwort muss mindestens 8 Zeichen lang sein." },
      { status: 400 },
    );
  }

  try {
    await createUserWithRole({ email, password, name: email, role: "parent" });
  } catch {
    return NextResponse.json(
      { message: "Registrierung fehlgeschlagen. E-Mail eventuell bereits vergeben." },
      { status: 400 },
    );
  }

  return NextResponse.json({ ok: true });
}
