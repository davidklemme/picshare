import { Pool } from "pg";

export type PhotoSubmission = {
  id: number;
  family_name: string;
  child_name: string;
  image_numbers: string;
  encrypted_zip_password: string;
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
      family_name VARCHAR(255) NOT NULL,
      child_name VARCHAR(255) NOT NULL,
      image_numbers TEXT NOT NULL,
      encrypted_zip_password TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT NOW()
    )
  `);
}

export async function insertPhotoSubmission(input: {
  familyName: string;
  childName: string;
  imageNumbers: string;
  encryptedZipPassword: string;
}) {
  await createPhotoSubmissionsTable();
  await getPool().query(
    `
      INSERT INTO photo_submissions (family_name, child_name, image_numbers, encrypted_zip_password)
      VALUES ($1, $2, $3, $4)
    `,
    [input.familyName, input.childName, input.imageNumbers, input.encryptedZipPassword],
  );
}

export async function getPhotoSubmissions(): Promise<PhotoSubmission[]> {
  await createPhotoSubmissionsTable();
  const result = await getPool().query<PhotoSubmission>(
    "SELECT * FROM photo_submissions ORDER BY created_at DESC, id DESC",
  );
  return result.rows;
}
