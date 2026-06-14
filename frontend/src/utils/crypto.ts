// Simple encryption utility using AES-GCM
const ENCRYPTION_KEY = 'restaurant-pos-secret-key-32byte'; // Exactly 32 bytes for AES-256

// Convert string to ArrayBuffer
function strToBuffer(str: string): ArrayBuffer {
  const encoder = new TextEncoder();
  return encoder.encode(str).buffer;
}

// Convert ArrayBuffer to string
function bufferToStr(buffer: ArrayBuffer): string {
  const decoder = new TextDecoder();
  return decoder.decode(buffer);
}

// Convert ArrayBuffer to base64
function bufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert base64 to ArrayBuffer
function base64ToBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// Generate crypto key from password
async function getKey(): Promise<CryptoKey> {
  const keyData = strToBuffer(ENCRYPTION_KEY);
  
  // Key must be exactly 32 bytes for AES-256
  if (keyData.byteLength !== 32) {
    throw new Error(`Key must be exactly 32 bytes, got ${keyData.byteLength} bytes`);
  }
  
  return await crypto.subtle.importKey(
    'raw',
    keyData,
    { name: 'AES-GCM' },
    false,
    ['encrypt', 'decrypt']
  );
}

// Encrypt data
export async function encrypt(data: string): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(12)); // 12 bytes for AES-GCM
  const encoded = strToBuffer(data);
  
  const encrypted = await crypto.subtle.encrypt(
    { name: 'AES-GCM', iv },
    key,
    encoded
  );
  
  // Web Crypto API includes auth tag in the ciphertext for AES-GCM
  // Extract the last 16 bytes as auth tag
  const encryptedArray = new Uint8Array(encrypted);
  const ciphertext = encryptedArray.slice(0, encryptedArray.length - 16);
  const authTag = encryptedArray.slice(encryptedArray.length - 16);
  
  // Combine IV + authTag + ciphertext to match backend format
  const combined = new Uint8Array(iv.length + authTag.length + ciphertext.length);
  combined.set(iv);
  combined.set(authTag, iv.length);
  combined.set(ciphertext, iv.length + authTag.length);
  
  return bufferToBase64(combined.buffer);
}

// Decrypt data
export async function decrypt(encryptedData: string): Promise<string> {
  const key = await getKey();
  const combined = base64ToBuffer(encryptedData);
  const combinedArray = new Uint8Array(combined);
  
  // Backend format: IV (12 bytes) + authTag (16 bytes) + ciphertext
  const iv = combinedArray.slice(0, 12);
  const authTag = combinedArray.slice(12, 28);
  const ciphertext = combinedArray.slice(28);
  
  // Web Crypto API expects auth tag to be appended to ciphertext
  const encryptedWithAuthTag = new Uint8Array(ciphertext.length + authTag.length);
  encryptedWithAuthTag.set(ciphertext);
  encryptedWithAuthTag.set(authTag, ciphertext.length);
  
  const decrypted = await crypto.subtle.decrypt(
    { name: 'AES-GCM', iv },
    key,
    encryptedWithAuthTag
  );
  
  return bufferToStr(decrypted);
}
