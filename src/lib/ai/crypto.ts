// MVP-grade only — not production key storage. Keys are encrypted with AES-GCM using APP_SECRET.
// For production, use a proper KMS or vault solution.

const ALGORITHM = "AES-GCM";
const KEY_LENGTH = 256;

function getSecret(): Uint8Array {
  const secret = process.env.APP_SECRET;
  if (!secret) throw new Error("APP_SECRET env var is not set");
  return Buffer.from(secret, "base64");
}

async function getKey(): Promise<CryptoKey> {
  const raw = getSecret();
  return crypto.subtle.importKey("raw", raw.buffer.slice(raw.byteOffset, raw.byteOffset + raw.byteLength) as ArrayBuffer, { name: ALGORITHM, length: KEY_LENGTH }, false, [
    "encrypt",
    "decrypt",
  ]);
}

export async function encrypt(plaintext: string): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encoded = new TextEncoder().encode(plaintext);
  const ciphertext = await crypto.subtle.encrypt({ name: ALGORITHM, iv }, key, encoded);
  const combined = new Uint8Array(iv.byteLength + ciphertext.byteLength);
  combined.set(iv, 0);
  combined.set(new Uint8Array(ciphertext), iv.byteLength);
  return Buffer.from(combined).toString("base64");
}

export async function decrypt(blob: string): Promise<string> {
  const key = await getKey();
  const combined = Buffer.from(blob, "base64");
  const iv = combined.subarray(0, 12);
  const ciphertext = combined.subarray(12);
  const plaintext = await crypto.subtle.decrypt({ name: ALGORITHM, iv }, key, ciphertext);
  return new TextDecoder().decode(plaintext);
}
