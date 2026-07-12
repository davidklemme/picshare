import { createUserWithRole } from "../lib/auth";

async function main() {
  const email = process.argv[2];
  const password = process.argv[3];
  const name = process.argv[4] ?? email;

  if (!email || !password) {
    console.error("Usage: tsx scripts/seed-admin.ts <email> <password> [name]");
    process.exit(1);
  }

  await createUserWithRole({ email, password, name, role: "admin" });
  console.log(`Admin created: ${email}`);
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
