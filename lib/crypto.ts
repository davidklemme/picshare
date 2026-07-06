import crypto from "crypto";

const ALGORITHM = "aes-256-cbc";
const IV_LENGTH = 16;

type KeyEncoding = "hex" | "base64";

function decodeMasterKey(value: string): Buffer {
  const trimmed = value.trim();
  const candidates: Array<[KeyEncoding, number]> = [
    ["hex", 64],
    ["base64", 44],
  ];

  for (const [encoding, expectedLength] of candidates) {
    if (trimmed.length === expectedLength) {
      const key = Buffer.from(trimmed, encoding);
      if (key.length === 32) {
        return key;
      }
    }
  }

  const utf8Key = Buffer.from(trimmed, "utf8");
  if (utf8Key.length === 32) {
    return utf8Key;
  }

  throw new Error("MASTER_KEY must be 32 bytes, 64 hex characters, or 44 base64 characters.");
}

function getMasterKey(): Buffer {
  const masterKey = process.env.MASTER_KEY;
  if (!masterKey) {
    throw new Error("MASTER_KEY environment variable is required.");
  }

  return decodeMasterKey(masterKey);
}

export function encryptZipPassword(plainPassword: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, getMasterKey(), iv);
  const encrypted = Buffer.concat([cipher.update(plainPassword, "utf8"), cipher.final()]);

  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptZipPassword(encryptedPassword: string): string {
  const [ivHex, encryptedHex] = encryptedPassword.split(":");
  if (!ivHex || !encryptedHex) {
    throw new Error("Encrypted password is not in the expected iv:ciphertext format.");
  }

  const decipher = crypto.createDecipheriv(ALGORITHM, getMasterKey(), Buffer.from(ivHex, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
