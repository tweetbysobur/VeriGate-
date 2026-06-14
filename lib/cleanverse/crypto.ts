/**
 * AES helper for Cleanverse encrypted endpoints (live mode only).
 *
 * Spec (docs/cleanverse-api-v5.md → Encryption):
 *   - AES/CBC/PKCS5Padding
 *   - IV: fixed 16 zero bytes
 *   - Key: Base64-decode the api-key, use the decoded bytes as the AES key
 *   - Wire format: { "data": "<Base64 ciphertext>" }
 *
 * Server-only. The api-key never reaches the browser.
 */
import crypto from "node:crypto";

const ZERO_IV = Buffer.alloc(16, 0);

function keyFromApiKey(apiKeyBase64: string): Buffer {
  const key = Buffer.from(apiKeyBase64, "base64");
  if (![16, 24, 32].includes(key.length)) {
    throw new Error(
      `Cleanverse api-key decodes to ${key.length} bytes; expected 16/24/32 for AES.`,
    );
  }
  return key;
}

function cipherName(keyLen: number): string {
  return `aes-${keyLen * 8}-cbc`;
}

/** Encrypt a plaintext JSON object → Base64 ciphertext for the `data` field. */
export function encryptBody(
  plaintext: unknown,
  apiKeyBase64: string,
): string {
  const key = keyFromApiKey(apiKeyBase64);
  const cipher = crypto.createCipheriv(cipherName(key.length), key, ZERO_IV);
  const json = JSON.stringify(plaintext);
  return Buffer.concat([cipher.update(json, "utf8"), cipher.final()]).toString(
    "base64",
  );
}

/** Decrypt a Base64 ciphertext response → parsed JSON. */
export function decryptBody<T = unknown>(
  ciphertextBase64: string,
  apiKeyBase64: string,
): T {
  const key = keyFromApiKey(apiKeyBase64);
  const decipher = crypto.createDecipheriv(
    cipherName(key.length),
    key,
    ZERO_IV,
  );
  const buf = Buffer.concat([
    decipher.update(Buffer.from(ciphertextBase64, "base64")),
    decipher.final(),
  ]);
  return JSON.parse(buf.toString("utf8")) as T;
}
