const crypto = require('crypto');

const ENCRYPTION_KEY = 'restaurant-pos-secret-key-32byte'; // Exactly 32 bytes for AES-256
const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12; // 12 bytes for AES-GCM

// Encrypt data
function encrypt(text) {
  try {
    const iv = crypto.randomBytes(IV_LENGTH);
    const keyBuffer = Buffer.from(ENCRYPTION_KEY);
    
    // Key must be exactly 32 bytes for AES-256
    if (keyBuffer.length !== 32) {
      throw new Error(`Key must be exactly 32 bytes, got ${keyBuffer.length} bytes`);
    }
    
    const cipher = crypto.createCipheriv(ALGORITHM, keyBuffer, iv);
    
    let encrypted = cipher.update(text, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    const authTag = cipher.getAuthTag();
    
    // Combine IV, authTag, and encrypted data
    const combined = Buffer.concat([iv, authTag, Buffer.from(encrypted, 'hex')]);
    return combined.toString('base64');
  } catch (error) {
    console.error('Encryption error:', error);
    throw new Error('Encryption failed');
  }
}

// Decrypt data
function decrypt(encryptedData) {
  try {
    const combined = Buffer.from(encryptedData, 'base64');
    
    const iv = combined.slice(0, IV_LENGTH);
    const authTag = combined.slice(IV_LENGTH, IV_LENGTH + 16);
    const encrypted = combined.slice(IV_LENGTH + 16);
    
    const keyBuffer = Buffer.from(ENCRYPTION_KEY);
    
    // Key must be exactly 32 bytes for AES-256
    if (keyBuffer.length !== 32) {
      throw new Error(`Key must be exactly 32 bytes, got ${keyBuffer.length} bytes`);
    }
    
    const decipher = crypto.createDecipheriv(ALGORITHM, keyBuffer, iv);
    decipher.setAuthTag(authTag);
    
    let decrypted = decipher.update(encrypted);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted.toString('utf8');
  } catch (error) {
    console.error('Decryption error:', error);
    throw new Error('Decryption failed');
  }
}

module.exports = {
  encrypt,
  decrypt
};
