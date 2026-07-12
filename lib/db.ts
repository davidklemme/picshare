import { Pool } from "pg";

export type PhotoSubmission = {
  id: number;
  user_id: string;
  family_name: string;
  child_name: string;
  image_numbers: string;
  encrypted_zip_password: string;
  created_at: string;
};

export type AdminUser = {
  id: string;
  name: string;
  role: string;
  created_at: string;
};

let pool: Pool | undefined;

function getPool() {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL environment variable is required.");
  }

  pool ??= new Pool({ connectionString });
  return pool;
}

export async function createPhotoSubmissionsTable() {
  await getPool().query(`
    CREATE TABLE IF NOT EXISTS photo_submissions (
      id SERIAL PRIMARY KEY,
      user_id TEXT NOT NULL UNIQUE REFERENCES "user"(id) ON DELETE CASCADE,
      family_name VARCHAR(255) NOT NULL,
      child_name VARCHAR(255) NOT NULL,
      image_numbers TEXT NOT NULL,
      encrypted_zip_password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

export async function insertPhotoSubmission(input: {
  userId: string;
  familyName: string;
  childName: string;
  imageNumbers: string;
  encryptedZipPassword: string;
}) {
  await createPhotoSubmissionsTable();
  await getPool().query(
    `
      INSERT INTO photo_submissions (user_id, family_name, child_name, image_numbers, encrypted_zip_password)
      VALUES ($1, $2, $3, $4, $5)
      ON CONFLICT (user_id) DO UPDATE SET
        family_name = EXCLUDED.family_name,
        child_name = EXCLUDED.child_name,
        image_numbers = EXCLUDED.image_numbers,
        encrypted_zip_password = EXCLUDED.encrypted_zip_password,
        created_at = NOW()
    `,
    [input.userId, input.familyName, input.childName, input.imageNumbers, input.encryptedZipPassword],
  );
}

export async function getSubmissionForUser(userId: string): Promise<PhotoSubmission | null> {
  await createPhotoSubmissionsTable();
  const result = await getPool().query<PhotoSubmission>(
    "SELECT * FROM photo_submissions WHERE user_id = $1",
    [userId],
  );
  return result.rows[0] ?? null;
}

export async function getPhotoSubmissions(): Promise<PhotoSubmission[]> {
  await createPhotoSubmissionsTable();
  const result = await getPool().query<PhotoSubmission>(
    "SELECT * FROM photo_submissions ORDER BY created_at DESC, id DESC",
  );
  return result.rows;
}

export async function getAdminUsers(): Promise<AdminUser[]> {
  const result = await getPool().query<AdminUser>(
    `SELECT id, name, role, "createdAt" AS created_at FROM "user" WHERE role = 'admin' ORDER BY "createdAt" ASC`,
  );
  return result.rows;
}

export async function setUserRole(userId: string, role: "admin" | "parent") {
  await getPool().query(`UPDATE "user" SET role = $1 WHERE id = $2`, [role, userId]);
}
